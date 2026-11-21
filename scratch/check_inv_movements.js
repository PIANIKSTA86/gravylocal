const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT id, number, mov_type, date, status, tx_id, notes FROM inventory_movements WHERE tx_id = 'fmyzflvzcg3jqso' OR notes LIKE '%3176%'", [], (err, rows) => {
  if (err) console.error(err);
  else console.log("inventory_movements:\n", JSON.stringify(rows, null, 2));
});
