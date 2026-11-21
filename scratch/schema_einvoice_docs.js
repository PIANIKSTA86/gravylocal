const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT sql FROM sqlite_master WHERE name='einvoice_docs'", [], (err, rows) => {
  if (err) console.error(err);
  else console.log("schema einvoice_docs:\n", rows[0]?.sql);
});
