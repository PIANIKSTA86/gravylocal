const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT * FROM einvoice_docs WHERE document_number LIKE '%NC%' ORDER BY rowid DESC LIMIT 5", [], (err, rows) => {
  if (err) console.error(err);
  else console.log("einvoice_docs NC previas:\n", JSON.stringify(rows, null, 2));
});
