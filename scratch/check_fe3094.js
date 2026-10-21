const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');
db.get("SELECT id, tx_id, ftech_transaction_id, substr(xml_content, 1, 300) as xml_head FROM einvoice_docs WHERE id = 'yod3oen6ychc7ao'", (err, r) => {
  console.log(r);
  db.close();
});
