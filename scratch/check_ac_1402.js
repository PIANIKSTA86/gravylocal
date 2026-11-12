const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT l.id, l.debit, l.credit, l.cross_doc_ref, l.description, t.number, a.code
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE t.number = 'AC-202607-000002'
`, (err, rows) => console.log('AC-202607-000002:', rows));

