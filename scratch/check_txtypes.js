const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT * FROM transaction_types", [], (err, rows) => {
  if (err) console.error(err);
  else console.log("transaction_types:\n", JSON.stringify(rows, null, 2));
});
