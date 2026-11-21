const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

console.log('=== PROPERTY C-403 ===');
const c403 = db.prepare(`SELECT * FROM ph_properties WHERE code = '3403' OR apartment = '403'`).all();
console.table(c403);

console.log('=== INVOICES 112 AND 116 ===');
const invs = db.prepare(`
  SELECT phi.*, tp.name as third_name, tp.doc_number
  FROM ph_invoices phi
  LEFT JOIN third_parties tp ON tp.id = phi.third_party_id
  WHERE phi.number IN ('CF-202606-000112', 'CF-202607-000116', 'CF-202608-000116', 'CF-202609-000116', 'CF-202610-000116')
`).all();
console.table(invs);

console.log('=== CAUSATION TRANSACTIONS FOR 112 AND 116 ===');
const txIds = invs.map(i => i.tx_id).filter(Boolean);
if (txIds.length > 0) {
  const txLines = db.prepare(`
    SELECT t.number as tx_num, tl.account_id, a.code, tl.debit, tl.credit, tl.cross_doc_ref, tl.third_party_id, tp.name as tp_name
    FROM tx_lines tl
    JOIN transactions t ON t.id = tl.tx_id
    LEFT JOIN accounts a ON a.id = tl.account_id
    LEFT JOIN third_parties tp ON tp.id = tl.third_party_id
    WHERE tl.tx_id IN (${txIds.map(() => '?').join(',')})
  `).all();
  console.table(txLines);
}
