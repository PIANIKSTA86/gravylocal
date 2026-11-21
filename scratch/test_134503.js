const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');
const rows = db.prepare(`
  SELECT tl.id, a.code, tl.debit, tl.credit, t.status, t.number 
  FROM tx_lines tl 
  JOIN transactions t ON t.id = tl.tx_id 
  JOIN accounts a ON a.id = tl.account_id
  WHERE tl.account_id = 'fhkd7lzzol9i0vt'
`).all();
console.table(rows);
