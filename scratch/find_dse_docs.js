const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all(`
  SELECT id, tx_id, status, ftech_transaction_id, cufe, xml_content LIKE '%DSE%' as has_dse, sent_at
  FROM einvoice_docs
  WHERE xml_content LIKE '%DSE%' OR xml_content LIKE '%DocumentoSoporte%' OR xml_content LIKE '%DOCUMENTO_SOPORTE%'
`, (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('DSE in einvoice_docs:', rows);
    const txIds = rows.map(r => `'${r.tx_id}'`).join(',');
    db.all(`SELECT id, number, date FROM transactions WHERE id IN (${txIds})`, (err2, txRows) => {
      console.log('Matching transactions:', txRows);
    });
  }
});
