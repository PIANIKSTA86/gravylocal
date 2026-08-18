const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../pb_data/data.db'));

const cols = ['third_parties', 'invoices', 'purchase_invoices', 'sales_orders', 'transactions', 'tx_lines'];
db.all(`SELECT name, fields FROM _collections WHERE name IN (${cols.map(c => `'${c}'`).join(',')})`, (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    rows.forEach(r => {
      const f = JSON.parse(r.fields || '[]');
      console.log(`\n=== ${r.name} ===`);
      console.log(f.map(x => `${x.name} (${x.type})`).join(', '));
    });
  }
  db.close();
});
