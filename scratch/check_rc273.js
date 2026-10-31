const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');
const lines = db.prepare(`
  SELECT tl.id, tl.cross_doc_ref, tl.debit, tl.credit, t.number, t.date, a.code
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  JOIN accounts a ON a.id = tl.account_id
  WHERE tl.cross_doc_ref LIKE '%000078%' OR tl.cross_doc_ref LIKE '%000075%' OR tl.cross_doc_ref LIKE '%0121%'
  ORDER BY t.date ASC, t.number ASC
`).all();
console.table(lines);
