const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all(`
  SELECT tl.id, tl.tx_id, a.code as acc_code, a.name as acc_name, tl.debit, tl.credit, tl.description, t.number, t.date, tt.code as tx_type_code
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  LEFT JOIN accounts a ON tl.account_id = a.id
  LEFT JOIN transaction_types tt ON t.tx_type_id = tt.id
  WHERE (tl.debit = 0 AND tl.credit = 0)
     OR tl.description LIKE '%ajuste%'
     OR tl.description LIKE '%redondeo%'
     OR (tl.debit > 0 AND tl.debit < 1)
     OR (tl.credit > 0 AND tl.credit < 1)
     OR (tl.debit != ROUND(tl.debit, 0) AND tl.debit > 0)
     OR (tl.credit != ROUND(tl.credit, 0) AND tl.credit > 0)
  LIMIT 25
`, [], (err3, r3) => {
  if (err3) console.error(err3);
  else console.log('Matching sample lines count:', r3.length, JSON.stringify(r3, null, 2));
  db.close();
});
