const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

console.log('=== CUENTAS DE ANTICIPOS / SALDOS A FAVOR (2805%, 13%) ===');
const accs = db.prepare(`
  SELECT id, code, name, nature 
  FROM accounts 
  WHERE code LIKE '28%' OR code LIKE '1305%' OR code LIKE '1345%'
  ORDER BY code ASC
`).all();
console.table(accs);

console.log('\n=== MOVIMIENTOS EN CUENTA 28% (Anticipos de Clientes/Copropietarios) ===');
const m28 = db.prepare(`
  SELECT l.id, t.number as tx_num, t.date, a.code, l.debit, l.credit, l.cross_doc_ref, l.description, l.third_party_id
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code LIKE '28%' AND t.status = 'active'
`).all();
console.log(`Total movimientos en cuentas 28%: ${m28.length}`);
if (m28.length > 0) {
  console.table(m28.slice(0, 20));
}

console.log('\n=== MOVIMIENTOS EN 13459501 CON REF ANTICIPO O ANT ===');
const mAnt = db.prepare(`
  SELECT l.id, t.number as tx_num, t.date, a.code, l.debit, l.credit, l.cross_doc_ref, l.description, l.third_party_id
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND (l.cross_doc_ref LIKE 'ANT-%' OR l.cross_doc_ref LIKE 'ANTICIPO-%') AND t.status = 'active'
`).all();
console.log(`Total movimientos ANT-/ANTICIPO- en 13459501: ${mAnt.length}`);
let sumAntCredit = 0;
for (const m of mAnt) sumAntCredit += m.credit;
console.log(`Suma de créditos ANT-/ANTICIPO- en 13459501: $${sumAntCredit.toLocaleString('es-CO')}`);

console.log('\n=== COMPROBANTES RC (Recibos de Caja) EN 8094 ===');
const rcs = db.prepare(`
  SELECT t.id, t.number, t.date, t.notes, t.cross_number, t.status
  FROM transactions t
  INNER JOIN transaction_types tt ON tt.id = t.tx_type_id
  WHERE tt.code = 'RC' OR t.number LIKE 'RC%'
  ORDER BY t.date DESC
  LIMIT 20
`).all();
console.log(`Total RC encontrados: ${rcs.length}`);
console.table(rcs);

