const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all(`
  SELECT tl.id, tl.tx_id, a.code as acc_code, a.name as acc_name, tl.debit, tl.credit, tl.description, t.number, t.date, tt.code as tx_type_code
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN transaction_types tt ON t.tx_type_id = tt.id
  LEFT JOIN accounts a ON tl.account_id = a.id
  WHERE (tl.debit = 0 AND tl.credit = 0)
     OR (tl.debit > 0 AND tl.debit < 1)
     OR (tl.credit > 0 AND tl.credit < 1)
  LIMIT 25
`, [], (err, r) => {
  if (err) console.error(err);
  else console.log('Zero or < 1 lines:', r ? r.length : 0, JSON.stringify(r, null, 2));
  db.close();
});
