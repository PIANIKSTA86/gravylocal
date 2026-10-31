const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

// Simular exactamente la lógica de _getPhCarteraDataset en frontend/src/api.ts
const prop = db.prepare(`SELECT * FROM ph_properties WHERE code = '2903'`).get();
console.log('Propiedad 2903:', prop);

const invoices = db.prepare(`
  SELECT * FROM ph_invoices 
  WHERE property_id = ? AND status != 'voided'
  ORDER BY period ASC, date ASC
`).all(prop.id);

console.log(`Facturas encontradas para 2903: ${invoices.length}`);
for (const inv of invoices) {
  console.log(`  Inv ${inv.number} (${inv.period}): Total=$${inv.total} Status=${inv.status}`);
}

const c13 = db.prepare(`
  SELECT l.id, t.number as tx_num, t.date, l.debit, l.credit, l.cross_doc_ref, l.description
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
    AND (l.cross_doc_ref LIKE '%2903%' OR l.description LIKE '%2903%' OR l.cross_doc_ref = 'ANT-' || ? OR l.cross_doc_ref LIKE 'ANTICIPO-%-' || ?)
`).all(prop.id, prop.id);

console.log('\nMovimientos contables para 2903:');
let totalDeb = 0;
let totalCred = 0;
for (const m of c13) {
  totalDeb += m.debit;
  totalCred += m.credit;
  console.log(`  ${m.tx_num} | Deb=$${m.debit} | Cred=$${m.credit} | Ref='${m.cross_doc_ref}' | Desc='${m.description}'`);
}
console.log(`Total Débitos: $${totalDeb} | Total Créditos: $${totalCred} | Saldo: $${totalDeb - totalCred}`);

// Ahora veamos qué hace _getPhCarteraDataset:
// 1. Carga facturas
// 2. Para cada factura, carga sus líneas
// 3. Aplica abonos y anticipos
// Y QUÉ PASA CON EL EXCESO DE ANTICIPO ($500.109) ???
console.log('\n--- SIMULANDO LÓGICA DE CARTERA PH ---');
// ¿Aparece la Unidad 2903 en la tabla de Cartera PH?
// Si todas las facturas se pagaron (currentBalance = 0), todas las líneas quedan en 'cancelado'.
// Y en loadCartera():
// const activeParties = openParties.filter(p => p.estado !== 'cancelado');
// Si activeParties está vacío para 2903, 2903 NO TIENE PARTIDAS ABIERTAS!
// Y por lo tanto byUnit.get(unitKey) NO SE AGREGA O SI SE AGREGA CON QUÉ VALOR???

