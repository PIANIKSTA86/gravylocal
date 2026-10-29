import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const unitId = 'tnixd06fvr8xwln'; // 2604

console.log('=== INVOICES FOR 2604 ===');
const invs = db.prepare('SELECT id, number, period, date, due_date, total, status, tx_id FROM ph_invoices WHERE property_id = ? ORDER BY date, number').all(unitId);
console.table(invs);

console.log('\n=== TRANSACTIONS FOR INVOICES (CAUSACIONES) ===');
const txIds = invs.map(i => i.tx_id).filter(Boolean);
if (txIds.length > 0) {
  const txs = db.prepare(`SELECT id, number, date, status, description FROM transactions WHERE id IN (${txIds.map(id => `'${id}'`).join(',')})`).all();
  console.table(txs);
}

console.log('\n=== ALL TX_LINES FOR 2604 / GLORIA ELENA ===');
const txs2604 = db.prepare(`
  SELECT t.id as tx_id, t.number as tx_num, t.date, t.status, a.code as acc_code, tl.debit, tl.credit, tl.description, tl.cross_doc_ref
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  LEFT JOIN accounts a ON a.id = tl.account_id
  WHERE tl.description LIKE '%2604%' OR tl.cross_doc_ref LIKE '%2604%' OR t.description LIKE '%2604%' OR tl.description LIKE '%GLORIA ELENA%'
  ORDER BY t.date, t.number
`).all();
console.table(txs2604);

console.log('\n=== ALL TX_LINES WITH cross_doc_ref LIKE SI-202605% or CF-% ===');
const crossLines = db.prepare(`
  SELECT t.number as tx_num, t.date, a.code as acc_code, tl.debit, tl.credit, tl.description, tl.cross_doc_ref
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  LEFT JOIN accounts a ON a.id = tl.account_id
  WHERE (tl.cross_doc_ref LIKE 'SI-202605-0026%' OR tl.cross_doc_ref LIKE 'SI-202605-0122%' OR tl.cross_doc_ref LIKE 'CF-2026%-000076%' OR tl.cross_doc_ref LIKE 'CF-2026%-000079%')
  ORDER BY t.date, t.number
`).all();
console.table(crossLines);
