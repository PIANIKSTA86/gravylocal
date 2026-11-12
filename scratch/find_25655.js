const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT l.debit, l.credit, a.code, l.cross_doc_ref, l.description
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  WHERE l.tx_id = 'asomshl38rr0fx3' AND (l.debit = 25655 OR l.credit = 25655)
`, (e, r) => console.log('Debits/Credits of 25655 in AP:', r));

