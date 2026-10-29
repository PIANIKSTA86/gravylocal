const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');
db.all("SELECT name, fields FROM _collections WHERE name IN ('purchase_invoices', 'purchase_invoice_lines')", (err, rows) => {
  if (err) console.error(err);
  else {
    rows.forEach(r => {
      console.log('Collection:', r.name);
      console.log(JSON.parse(r.fields).map(f => f.name).join(', '));
    });
  }
  db.close();
});
