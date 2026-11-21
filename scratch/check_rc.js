const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

console.log('=== FIND INVOICES 000116, 000112, 000021, 000018 ===');
const invs = db.prepare(`
  SELECT phi.id, phi.number, phi.date, phi.period, phi.total, phi.status, phi.property_id, p.code as prop_code, p.name as prop_name
  FROM ph_invoices phi
  LEFT JOIN ph_properties p ON p.id = phi.property_id
  WHERE phi.number LIKE '%000116%' OR phi.number LIKE '%000112%' OR phi.number LIKE '%000021%' OR phi.number LIKE '%000018%'
  ORDER BY phi.number
`).all();
console.table(invs);

console.log('\n=== ALL LINES IN RC-00000347 ===');
const lines347 = db.prepare(`
  SELECT t.number, tl.id, a.code, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  LEFT JOIN accounts a ON a.id = tl.account_id
  WHERE t.number = 'RC-00000347'
`).all();
console.table(lines347);

console.log('\n=== ALL LINES IN RC-00000196 ===');
const lines196 = db.prepare(`
  SELECT t.number, tl.id, a.code, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  LEFT JOIN accounts a ON a.id = tl.account_id
  WHERE t.number = 'RC-00000196'
`).all();
console.table(lines196);
