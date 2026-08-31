const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbsToCheck = [
  path.resolve('pb_data', 'data.db'),
  path.resolve('empresas', 'empresa_8091', 'pb_data', 'data.db'),
  path.resolve('empresas', 'empresa_8092', 'pb_data', 'data.db'),
  path.resolve('empresas', 'empresa_8093', 'pb_data', 'data.db'),
  path.resolve('empresas', 'empresa_8094', 'pb_data', 'data.db'),
];

async function checkAndRepair(dbPath) {
  if (!fs.existsSync(dbPath)) return;
  console.log('\n========================================');
  console.log('Verificando:', dbPath);

  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('Error abriendo DB:', err.message);
        return resolve();
      }

      db.all("PRAGMA integrity_check;", (err, rows) => {
        if (err) {
          console.error('Error en integrity_check:', err.message);
        } else {
          console.log('integrity_check:', rows);
        }

        // Chequear sqlite_master
        db.all("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE name LIKE '%inventory_concepts%' OR tbl_name LIKE '%inventory_concepts%'", (err, schemaRows) => {
          if (err) {
            console.error('Error consultando schema:', err.message);
          } else {
            console.log('Schema inventory_concepts:', schemaRows);
          }

          // Ejecutar REINDEX
          db.run("REINDEX;", (err) => {
            if (err) {
              console.error('Error en REINDEX:', err.message);
            } else {
              console.log('REINDEX ejecutado exitosamente.');
            }
            db.close(() => resolve());
          });
        });
      });
    });
  });
}

async function run() {
  for (const p of dbsToCheck) {
    await checkAndRepair(p);
  }
}

run();
