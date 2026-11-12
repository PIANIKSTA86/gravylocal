const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.get("SELECT id, tx_id, status, cufe, sent_at, dian_response FROM einvoice_docs WHERE tx_id = 'mub35nz2gysbzuf'", (err, row) => {
  console.log("einvoice_docs record:", row);
  db.close();
});
