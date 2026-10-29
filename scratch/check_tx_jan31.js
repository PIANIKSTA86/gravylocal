const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT id, number, date, description, cross_type, cross_number, status, book_type FROM transactions WHERE date LIKE '2026-01-31%'", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('Transactions on 2026-01-31:', rows.length);
    console.table(rows);
  }
  db.close();
});

