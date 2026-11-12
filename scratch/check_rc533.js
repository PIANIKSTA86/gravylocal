const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT l.debit, l.credit, l.cross_doc_ref, l.description, a.code
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  JOIN transactions t ON t.id = l.tx_id
  WHERE t.number = 'RC-00000533'
`, (err, rows) => console.log('RC-00000533:', rows));

