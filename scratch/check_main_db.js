const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT id, consecutivo, prefijo, ano, mes, estado_dian FROM electronic_payrolls ORDER BY id DESC LIMIT 5", [], (err, rows) => {
  if (err) {
    console.error("Error querying pb_data/data.db:", err);
  } else {
    console.log("=== MAIN DB electronic_payrolls ===");
    console.log(rows);
  }
  db.close();
});
