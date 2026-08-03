const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'pb_data', 'data.db'));

console.log('=== DIAN RESOLUTIONS ===');
db.all('SELECT id, document_type, prefix, current_number, number_from, number_to, active FROM dian_resolutions', (err, rows) => {
  if (err) console.error(err);
  else console.log(rows);

  console.log('\n=== TRANSACTION TYPES (FV, FE, NC, ND, POS, DS) ===');
  db.all("SELECT id, code, prefix, consecutive, name FROM transaction_types WHERE active = 1 AND (code IN ('FV','FE','NC','ND','POS','DS') OR prefix IN ('FV','FE','NC','ND','POS','DS'))", (err2, rows2) => {
    if (err2) console.error(err2);
    else console.log(rows2);

    console.log('\n=== LAST 10 INVOICES ===');
    db.all('SELECT id, number, status, created, updated, tx_type_id FROM invoices ORDER BY created DESC LIMIT 10', (err3, rows3) => {
      if (err3) console.error(err3);
      else console.log(rows3);
      db.close();
    });
  });
});
