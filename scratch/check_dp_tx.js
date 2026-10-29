const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT * FROM transactions WHERE tx_type_id = 'uzond0e9984g6f1'", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('Transactions with DP type:', rows.length);
    console.table(rows);
  }
  db.close();
});

