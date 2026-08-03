const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.get("SELECT fields FROM _collections WHERE name = 'invoices'", [], (err, row) => {
  if (err || !row) {
    console.error(err || "Not found");
    return;
  }
  const fields = JSON.parse(row.fields);
  const payMethod = fields.find(f => f.name === 'payment_method');
  console.log("PAYMENT METHOD CONFIG:", JSON.stringify(payMethod, null, 2));
});
