const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT name, fields FROM _collections WHERE name IN ('invoices', 'invoice_lines')", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    rows.forEach(row => {
      console.log(`=== Collection: ${row.name} ===`);
      const fields = JSON.parse(row.fields);
      console.log(fields.map(f => `${f.name} (${f.type})`).join(', '));
    });
  }
  db.close();
});
