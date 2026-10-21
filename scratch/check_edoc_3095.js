const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');

db.get("SELECT * FROM einvoice_docs WHERE tx_id = 'e7at7ig46055tsl'", (err, row) => {
  console.log('einvoice_doc for FE-00003095:', row ? {
    id: row.id,
    status: row.status,
    dian_response: row.dian_response,
    cufe: row.cufe
  } : 'None');
  db.close();
});
