const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.get("SELECT id, tx_id, status, cufe, zip_filename, substr(xml_content, 1, 600) as snippet, length(xml_content) as xml_len FROM einvoice_docs WHERE tx_id = 'l4dpgvdy6skbfp9'", [], (err, row) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Row:', row);
  db.close();
});
