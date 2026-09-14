const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all(`SELECT id, date, description, debit, credit, reconciled, tx_line_id FROM bank_movements WHERE date IN ('2026-07-29', '2026-07-31') AND (debit = 2310000 OR credit = 1811500 OR debit = 27127)`, (err, r) => {
  console.log('Target movs in db:', r);
});
