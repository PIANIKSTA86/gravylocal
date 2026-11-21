const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT id, tx_id, document_number, cufe, status, dian_response, sent_at, email_sent, email_sent_to, email_status, email_last_error FROM einvoice_docs WHERE tx_id = 'fmyzflvzcg3jqso' OR document_number LIKE '%3176%'", [], (err, rows) => {
  if (err) console.error(err);
  else console.log("einvoice_docs:\n", JSON.stringify(rows, null, 2));
});
