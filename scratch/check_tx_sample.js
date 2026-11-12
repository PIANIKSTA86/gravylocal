const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT l.id, l.debit, l.credit, l.cross_doc_ref, l.description, a.code as acc_code, a.name as acc_name
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  WHERE l.tx_id = 'zsjz6u7ri4o4ukp'
`, (err, rows) => {
  if (err) return console.error(err);
  console.log('Lines in CF-202608-000082 (tx_id zsjz6u7ri4o4ukp):');
  rows.forEach(r => console.log(r));
});

