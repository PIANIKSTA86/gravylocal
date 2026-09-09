const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT * FROM sales_order_lines WHERE sales_order_id = 'kjpqdsb6zg1db32'", [], (err, rows) => {
  console.log("LINES FOR PED-00000013:", rows);
});
