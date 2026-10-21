const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT id, name, code, prefix FROM transaction_types WHERE code IN ('DS', 'NDS') OR prefix IN ('DS', 'DSE', 'NDS', 'NDSE', 'NADS')", (err, rows) => {
  if (err) console.error(err);
  else console.log("Transaction types:", rows);
});
