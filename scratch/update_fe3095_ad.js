const sqlite3 = require('sqlite3').verbose();

async function updateDoc() {
  const url = 'https://api-v2.matias-api.com/attachments/1264/ad/27678a82-cc34-11f1-a6db-d843ae899220/ad10450217450002600000001.xml';
  const res = await fetch(url);
  const xml = await res.text();
  console.log('Downloaded AttachedDocument, bytes:', xml.length);

  const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');
  db.run(`
    UPDATE einvoice_docs
    SET status = 'aceptada',
        dian_response = 'Documento validado y aceptado por la DIAN.',
        xml_content = ?
    WHERE id = 'l2u7td19o9njyai'
  `, [xml], function(err) {
    if (err) console.error('Error updating:', err);
    else console.log('Updated rows:', this.changes);
    db.close();
  });
}

updateDoc();
