const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT a.code, sum(l.debit) as tot_debit, sum(l.credit) as tot_credit, count(*) as count
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  WHERE l.tx_id = 'asomshl38rr0fx3'
  GROUP BY a.code
`, (e, r) => console.log('Accounts in AP-202605-000001:', r));

