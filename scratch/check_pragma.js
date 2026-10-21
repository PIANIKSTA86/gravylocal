const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("PRAGMA table_info(purchase_invoices)", (err, rows) => {
  if (err) console.error(err);
  else console.log("Physical columns in purchase_invoices:", rows.map(r => r.name));
});
