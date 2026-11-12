const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT l.debit, l.credit, l.cross_doc_ref, l.description, t.number
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND (l.cross_doc_ref LIKE '%000025%' OR l.description LIKE '%1402%')
`, (err, rows) => console.log('1402 lines in 13459501:', rows));

