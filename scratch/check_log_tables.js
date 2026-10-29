const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%log%' OR name LIKE '%dian%' OR name LIKE '%audit%')", (err, tables) => {
  if (err) return console.error(err);
  console.log("Matching tables:", tables.map(t => t.name));
});

db.all("PRAGMA table_info(einvoice_docs)", (err, cols) => {
  console.log("einvoice_docs columns:", cols.map(c => c.name));
});
