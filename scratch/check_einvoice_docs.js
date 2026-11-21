const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT id, tx_id, prefix, folio, cufe, status, document_type, created FROM einvoice_docs WHERE folio LIKE '%3176%' OR prefix LIKE '%3176%'", [], (err, rows) => {
  if (err) console.error(err);
  else console.log("einvoice_docs:\n", JSON.stringify(rows, null, 2));
});
