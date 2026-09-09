const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("PRAGMA table_info(sales_orders)", [], (err, cols) => {
  console.log("COLUMNS sales_orders:", cols.map(c => c.name).join(', '));
  db.all("SELECT * FROM sales_orders ORDER BY created DESC LIMIT 2", [], (err2, rows) => {
    console.log("SALES ORDERS:", JSON.stringify(rows, null, 2));
  });
});

db.all("PRAGMA table_info(sales_order_lines)", [], (err, cols) => {
  console.log("COLUMNS sales_order_lines:", cols.map(c => c.name).join(', '));
  db.all("SELECT * FROM sales_order_lines ORDER BY created DESC LIMIT 2", [], (err2, rows) => {
    console.log("SALES ORDER LINES:", JSON.stringify(rows, null, 2));
  });
});
