const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const rows = db.prepare(`
  SELECT tl.id, tl.cross_doc_ref, tl.debit, tl.credit, tl.description, t.number, t.date
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  WHERE t.number = 'RC-00000283'
`).all();
console.log(rows);

