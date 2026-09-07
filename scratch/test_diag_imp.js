const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all('SELECT * FROM import_lines WHERE import_id = "2rjtnb911vkb5a0"', (err, rows) => {
  if (err) console.error('Error lines:', err);
  else console.log('Lines count:', rows.length, 'First line:', rows[0]);
  
  db.all('SELECT * FROM import_invoices', (err2, invs) => {
    if (err2) console.error('Error invoices:', err2);
    else console.log('Invoices count:', invs.length, invs);

    db.all('SELECT * FROM import_pallet_configs', (err3, pcs) => {
      if (err3) console.error('Error pallet configs:', err3);
      else console.log('Pallet configs count:', pcs.length, pcs);
      db.close();
    });
  });
});
