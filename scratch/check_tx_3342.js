const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT * FROM transactions WHERE number = 3342", (err, tx) => {
  console.log("TX 3342:", tx);
  db.get("SELECT * FROM invoices WHERE number LIKE '%3342%'", (err2, inv) => {
    console.log("INV 3342:", inv);
    db.close();
  });
});

