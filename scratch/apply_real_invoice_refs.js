const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve('./empresas/empresa_8094/pb_data/data.db');
const backupPath = path.resolve(`./empresas/empresa_8094/pb_data/data_backup_before_cruce_fix_${Date.now()}.db`);

console.log('--- SCRIPT DE CORRECCIÓN DE DOCUMENTOS DE CRUCE REALES ---');
console.log('1. Creando copia de seguridad...');
fs.copyFileSync(dbPath, backupPath);
console.log(`Copia de seguridad creada en: ${backupPath} (${fs.statSync(backupPath).size} bytes)`);

const db = new DatabaseSync(dbPath);

// 1. Obtener todas las facturas reales (débitos en CF-)
const invoices = db.prepare(`
  SELECT t.number as tx_number, t.date, tl.third_party_id, tl.cross_doc_ref, tl.debit, tl.credit
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  WHERE tl.cross_doc_ref LIKE 'CF-%' AND tl.debit > 0
`).all();

console.log(`Total facturas causadas (CF-): ${invoices.length}`);

// Mapa: third_party_id + '_' + YYYYMM + '_' + CONCEPTO -> cross_doc_ref real
const actualInvoiceMap = new Map();
for (const inv of invoices) {
  const parts = inv.cross_doc_ref.split('-');
  if (parts.length >= 4) {
    const ym = parts[1]; // ej: 202611
    const concept = parts.slice(3).join('-'); // ej: ADM o MORA
    const key = `${inv.third_party_id}_${ym}_${concept}`;
    actualInvoiceMap.set(key, inv.cross_doc_ref);
  }
}

// 2. Buscar líneas de pagos / recaudos (RC- u otros) que cruzan a CF-
const paymentLines = db.prepare(`
  SELECT tl.id as line_id, tl.tx_id, t.number as tx_number, t.date, tl.third_party_id, 
         tl.cross_doc_ref, tl.description, tl.debit, tl.credit, tp.name as third_name
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  LEFT JOIN third_parties tp ON tl.third_party_id = tp.id
  WHERE tl.cross_doc_ref LIKE 'CF-%' AND t.number NOT LIKE 'CF-%'
`).all();

console.log(`Total líneas de recaudo/cruce con ref CF-: ${paymentLines.length}`);

const toUpdate = [];
for (const p of paymentLines) {
  const parts = p.cross_doc_ref.split('-');
  if (parts.length >= 4) {
    const ym = parts[1];
    const concept = parts.slice(3).join('-');
    const key = `${p.third_party_id}_${ym}_${concept}`;
    const realRef = actualInvoiceMap.get(key);
    
    if (realRef && realRef !== p.cross_doc_ref) {
      toUpdate.push({
        line_id: p.line_id,
        tx_id: p.tx_id,
        tx_number: p.tx_number,
        date: p.date,
        third_name: p.third_name,
        old_ref: p.cross_doc_ref,
        new_ref: realRef,
        old_desc: p.description,
        debit: p.debit,
        credit: p.credit
      });
    }
  }
}

console.log(`\nLíneas a actualizar: ${toUpdate.length}`);

// 3. Ejecutar actualización en transacción SQLite
const updateStmt = db.prepare(`
  UPDATE tx_lines 
  SET cross_doc_ref = ?, description = ?
  WHERE id = ?
`);

db.exec('BEGIN TRANSACTION;');

try {
  let updatedCount = 0;
  for (const item of toUpdate) {
    let newDesc = item.old_desc;
    if (newDesc && newDesc.includes(item.old_ref)) {
      newDesc = newDesc.replaceAll(item.old_ref, item.new_ref);
    }
    updateStmt.run(item.new_ref, newDesc, item.line_id);
    updatedCount++;
    console.log(`[${item.tx_number}] ${item.third_name}: '${item.old_ref}' -> '${item.new_ref}' (D:${item.debit} C:${item.credit})`);
  }

  db.exec('COMMIT;');
  console.log(`\n¡Éxito! Se actualizaron correctamente ${updatedCount} líneas.`);
} catch (err) {
  db.exec('ROLLBACK;');
  console.error('Error al actualizar, se revirtió la transacción:', err);
  process.exit(1);
}

// 4. Verificación de balance global de todas las transacciones
console.log('\n--- VERIFICACIÓN DE CUADRE CONTABLE GLOBAL ---');
const unbalanced = db.prepare(`
  SELECT t.number, t.date, SUM(tl.debit) as total_debit, SUM(tl.credit) as total_credit,
         ROUND(SUM(tl.debit) - SUM(tl.credit), 2) as diff
  FROM transactions t
  JOIN tx_lines tl ON tl.tx_id = t.id
  GROUP BY t.id
  HAVING diff != 0
`).all();

if (unbalanced.length === 0) {
  console.log('✓ Balance 100% perfecto: CERO transacciones descuadradas.');
} else {
  console.error(`ALERTA: Se encontraron ${unbalanced.length} transacciones descuadradas:`, unbalanced);
}

// 5. Verificación de D-104 (Jhenny Lorena Umaña Castro)
console.log('\n--- VERIFICACIÓN ESPECÍFICA APARTAMENTO D-104 ---');
const d104Lines = db.prepare(`
  SELECT t.number, t.date, a.code as account_code, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  LEFT JOIN accounts a ON tl.account_id = a.id
  LEFT JOIN third_parties tp ON tl.third_party_id = tp.id
  WHERE tp.name LIKE '%JHENNY LORENA UMAÑA%' AND a.code LIKE '134595%'
  ORDER BY tl.cross_doc_ref, t.date
`).all();

const byDocCruce = {};
for (const l of d104Lines) {
  if (!byDocCruce[l.cross_doc_ref]) {
    byDocCruce[l.cross_doc_ref] = { debit: 0, credit: 0, count: 0 };
  }
  byDocCruce[l.cross_doc_ref].debit += l.debit;
  byDocCruce[l.cross_doc_ref].credit += l.credit;
  byDocCruce[l.cross_doc_ref].count++;
}

console.log('Estado de cruce por factura en D-104:');
for (const [ref, data] of Object.entries(byDocCruce)) {
  const balance = data.debit - data.credit;
  const status = balance === 0 ? '✓ CANCELADO ($0,00)' : balance > 0 ? `DEUDA: $${balance}` : `SALDO A FAVOR: $${-balance}`;
  console.log(`- ${ref}: Débito=$${data.debit} | Crédito=$${data.credit} -> Saldo: ${status}`);
}

