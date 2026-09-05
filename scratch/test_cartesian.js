const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`SELECT count(*) as cnt FROM ph_invoices WHERE tx_id = 'yo6bq2oiwv4pmdv'`, (err, r) => {
  console.log('Invoices pointing to tx yo6bq2oiwv4pmdv:', r);

  db.all(`
    SELECT l.id, l.cross_doc_ref, l.debit, l.credit, phi.number, phi.property_id
    FROM tx_lines l
    JOIN ph_invoices phi ON phi.tx_id = l.tx_id
    WHERE l.tx_id = 'yo6bq2oiwv4pmdv'
    LIMIT 10
  `, (err2, r2) => {
    console.log('Cartesian product rows count:', r2.length);
    console.log('Sample rows:', r2.slice(0, 3));
    db.close();
  });
});
