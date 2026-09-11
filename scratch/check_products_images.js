const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

function checkDb(dbPath, name) {
  console.log(`\n================== DB: ${name} (${dbPath}) ==================`);
  if (!fs.existsSync(dbPath)) {
    console.log('Database does not exist at path');
    return;
  }

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening db:', err.message);
      return;
    }

    db.all("SELECT count(*) as total, SUM(CASE WHEN image IS NOT NULL AND image != '' THEN 1 ELSE 0 END) as with_image, SUM(CASE WHEN image IS NULL OR image = '' THEN 1 ELSE 0 END) as no_image FROM products", [], (err, rows) => {
      if (err) {
        console.error('Query error on products:', err.message);
        return;
      }
      console.log('Products counts:', rows[0]);

      db.all("SELECT id, code, name, image FROM products WHERE image IS NOT NULL AND image != '' LIMIT 10", [], (err, prods) => {
        if (err) console.error(err);
        else {
          console.log('\nSample products WITH image:');
          prods.forEach(p => console.log(`[${p.code}] ${p.name} -> image: "${p.image}" (id: ${p.id})`));
        }

        // Also check collection ID of products
        db.all("SELECT id, name FROM _collections WHERE name = 'products'", [], (err, cols) => {
          if (err) console.error(err);
          else if (cols && cols.length > 0) {
            const colId = cols[0].id;
            console.log(`\nCollection 'products' id: ${colId}`);
            const storageDir = path.join(path.dirname(dbPath), 'storage', colId);
            console.log(`Storage directory: ${storageDir}`);
            if (fs.existsSync(storageDir)) {
              const files = fs.readdirSync(storageDir);
              console.log(`Number of records in storage directory: ${files.length}`);
              // Check first 3
              files.slice(0, 3).forEach(f => {
                const subDir = path.join(storageDir, f);
                if (fs.statSync(subDir).isDirectory()) {
                  const subFiles = fs.readdirSync(subDir);
                  console.log(`  - Record ${f}: files -> ${subFiles.join(', ')}`);
                }
              });
            } else {
              console.log('Storage directory does NOT exist!');
            }
          }
        });
      });
    });
  });
}

checkDb('c:/Users/JULIAN/Desktop/GravyLocalTABS/pb_data/data.db', 'Root (Port 8090)');
checkDb('c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8091/pb_data/data.db', 'Empresa 8091');
