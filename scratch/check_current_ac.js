const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT * FROM transactions WHERE number IN ('AC-00000126', 'AC-00000127')", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('Current AC-00000126/127:');
    console.table(rows);
  }
  db.close();
});

