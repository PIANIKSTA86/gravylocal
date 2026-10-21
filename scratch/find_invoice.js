const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');
db.all("SELECT id, tx_id, status, cufe, dian_response FROM einvoice_docs WHERE tx_id = 'e7at7ig46055tsl'", (err, rows) => {
  console.log(rows);
  db.close();
});
