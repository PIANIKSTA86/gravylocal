const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT l.id, l.debit, l.credit, l.cross_doc_ref, l.description, a.code as acc_code, a.name as acc_name
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  WHERE l.tx_id = 'asomshl38rr0fx3' AND (l.debit = 25655 OR l.credit = 25655 OR l.cross_doc_ref LIKE '%170%')
`, (err, rows) => console.log('Rows in AP for 25655 or 170:', rows));

