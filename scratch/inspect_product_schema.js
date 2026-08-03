const sqlite3 = require('sqlite3');
const fs = require('fs');

const mainDb = 'pb_data/data.db';
if (fs.existsSync(mainDb)) {
  const db = new sqlite3.Database(mainDb, sqlite3.OPEN_READONLY);
  db.all("PRAGMA table_info(invoice_lines)", [], (err, ilCols) => {
    if (err) { console.error(err); db.close(); return; }
    console.log('invoice_lines columns:');
    ilCols.forEach(c => console.log(`  ${c.name} (${c.type})`));
    
    db.all("PRAGMA table_info(products)", [], (err, pCols) => {
      if (err) { console.error(err); }
      else {
        console.log('\nproducts columns:');
        pCols.forEach(c => console.log(`  ${c.name} (${c.type})`));
      }
      
      // Let's also check a sample product or line
      db.all("SELECT * FROM products LIMIT 2", [], (err, prodSamples) => {
        if (!err) {
          console.log('\nSample products:', prodSamples);
        }
        db.all("SELECT * FROM invoice_lines LIMIT 2", [], (err, lineSamples) => {
          if (!err) {
            console.log('\nSample invoice lines:', lineSamples);
          }
          db.close();
        });
      });
    });
  });
}
