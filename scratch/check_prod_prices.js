const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("PRAGMA table_info(products)", [], (err, cols) => {
  if (err) { console.error(err); return; }
  console.log("COLUMNS IN PRODUCTS:", cols.map(c => c.name).join(', '));

  db.all("SELECT id, code, name, base_price, precio_venta_2, precio_venta_3, iva_rate, type FROM products WHERE base_price > 0 LIMIT 5", [], (err, rows) => {
    if (err) { console.error(err); return; }
    console.log("PRODUCTS SAMPLE:", JSON.stringify(rows, null, 2));
  });
});
