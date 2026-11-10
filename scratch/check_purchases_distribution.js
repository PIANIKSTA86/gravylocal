const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all(`
  SELECT tx_id, SUM(credit) as total_credit, SUM(debit) as total_debit
  FROM tx_lines
  WHERE third_party_id = '42pux2xbslm97wf'
  GROUP BY tx_id
`, (e, r) => {
  console.log('tx_lines grouped for supplier 42pux2xbslm97wf:', r);
  db.close();
});
