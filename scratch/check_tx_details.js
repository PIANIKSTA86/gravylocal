const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.get("SELECT id, number, cross_number, cross_type, cross_amount, cross_enabled, description, status, user_id FROM transactions WHERE id = 'fmyzflvzcg3jqso'", (err, row) => {
  if (err) console.error(err);
  else console.log("Transaction details:\n", JSON.stringify(row, null, 2));
});
