const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT * FROM transactions WHERE id = 'sey4afhvm0trvah'", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('Transaction sey4afhvm0trvah:');
    console.table(rows);
  }
  db.close();
});

