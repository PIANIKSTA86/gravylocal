const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT fields FROM _collections WHERE name='purchase_invoices'", (err, row) => {
  if (err) {
    console.error(err);
    return;
  }
  if (!row) {
    console.log("No collection found");
    return;
  }
  if (row.fields) {
    const fields = JSON.parse(row.fields);
    console.log("Sample field:", JSON.stringify(fields.find(f => f.name === 'notes' || f.name === 'status'), null, 2));
    console.log("Total fields:", fields.length);
  }
});
