import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const unitId = 'tnixd06fvr8xwln'; // 2604

console.log('=== VERIFYING UNIT 2604 WITH EXACT API LOGIC ===');

// 1. Invoices not voided
const invs = db.prepare("SELECT id, number, period, date, total, status, tx_id FROM ph_invoices WHERE property_id = ? AND status != 'voided' ORDER BY date, number").all(unitId);
console.log('Active invoices in Cartera:');
console.table(invs);
const totalFacturas = invs.reduce((sum, i) => sum + i.total, 0);
console.log(`Total Facturado: $${totalFacturas.toLocaleString('es-CO')}`);

// 2. Abonos from tx_lines
const invNumbers = invs.map(i => i.number.toUpperCase());
const causalityTxIds = new Set(invs.map(i => i.tx_id).filter(Boolean));

const txLines = db.prepare(`
  SELECT tl.debit, tl.credit, tl.cross_doc_ref, tl.description, t.number as tx_number, tl.tx_id
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  JOIN accounts a ON a.id = tl.account_id
  WHERE a.code LIKE '13%' AND (t.status = 'posted' OR t.status = 'active')
`).all();

let totalCancelado = 0;
const abonosApplied = [];

for (const tl of txLines) {
  // IGNORAR la causación original de la factura
  if (causalityTxIds.has(tl.tx_id)) continue;

  const ref = (tl.cross_doc_ref || '').trim().toUpperCase();
  const val = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (val === 0) continue;
  const matched = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));
  if (matched) {
    totalCancelado += val;
    abonosApplied.push({ tx_number: tl.tx_number, ref, val, desc: tl.description });
  }
}

console.log('\nAbonos aplicados a las facturas activas:');
console.table(abonosApplied);
console.log(`Total Cancelado: $${totalCancelado.toLocaleString('es-CO')}`);

const saldoPendiente = totalFacturas - totalCancelado;
console.log(`\n========================================`);
console.log(`>>> SALDO PENDIENTE CARTERA PH: $${saldoPendiente.toLocaleString('es-CO')},00 <<<`);
console.log(`========================================`);

// 3. Verificamos saldo Libro Auxiliar en Contabilidad para cuenta 13459501
const auxLines = db.prepare(`
  SELECT sum(tl.debit) as debits, sum(tl.credit) as credits
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  JOIN accounts a ON a.id = tl.account_id
  WHERE a.code = '13459501' AND (tl.description LIKE '%2604%' OR tl.cross_doc_ref LIKE '%2604%' OR tl.description LIKE '%GLORIA ELENA%')
`).get();

const auxSaldo = Number(auxLines.debits || 0) - Number(auxLines.credits || 0);
console.log(`\n>>> SALDO LIBRO AUXILIAR CONTABILIDAD (13459501): $${auxSaldo.toLocaleString('es-CO')},00 <<<`);

console.log(`\n>>> DIFERENCIA: $${(saldoPendiente - auxSaldo).toLocaleString('es-CO')},00 <<<`);
