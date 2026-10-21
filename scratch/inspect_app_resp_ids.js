const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.get("SELECT xml_content FROM einvoice_docs WHERE tx_id = 'l4dpgvdy6skbfp9'", [], (err, row) => {
  db.close();
  const xml = row.xml_content;
  console.log('cbc:ID matches:', xml.match(/<cbc:ID[^>]*>([\s\S]*?)<\/cbc:ID>/gi));
  console.log('DocumentReference:', xml.match(/<cac:DocumentReference>[\s\S]*?<\/cac:DocumentReference>/gi));
});
