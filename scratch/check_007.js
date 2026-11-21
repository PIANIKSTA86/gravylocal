const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const lines = db.prepare(`
  SELECT tl.debit, tl.credit, tl.cross_doc_ref, tl.description, t.number, t.date
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  WHERE tl.cross_doc_ref LIKE '%CF-202606-000007%'
`).all();
console.table(lines);
