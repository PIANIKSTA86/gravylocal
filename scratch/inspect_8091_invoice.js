const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.get("SELECT * FROM invoices WHERE id = 'wh6k9yrppx2la88'", (err, row) => {
  if (err) console.error(err);
  else console.log("Invoice row:\n", JSON.stringify(row, null, 2));
});
