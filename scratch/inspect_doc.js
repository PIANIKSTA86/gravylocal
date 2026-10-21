const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');
db.get("SELECT * FROM einvoice_docs WHERE tx_id = 'e7at7ig46055tsl'", (err, row) => {
  if (err) console.error(err);
  else {
    console.log({
      id: row.id,
      status: row.status,
      cufe: row.cufe,
      dian_response: row.dian_response,
      xml_len: row.xml_content ? row.xml_content.length : 0,
      xml_start: row.xml_content ? row.xml_content.slice(0, 150) : ''
    });
  }
  db.close();
});
