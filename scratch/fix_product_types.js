const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const empresasDir = path.resolve('empresas');
const files = fs.readdirSync(empresasDir);

for (const file of files) {
  const dirPath = path.join(empresasDir, file);
  if (!fs.statSync(dirPath).isDirectory()) continue;
  const dbPath = path.join(dirPath, 'pb_data', 'data.db');
  if (!fs.existsSync(dbPath)) continue;

  console.log('Chequeando:', dbPath);
  const db = new sqlite3.Database(dbPath);

  db.all("SELECT DISTINCT type FROM products", (err, rows) => {
    if (err) {
      console.error('Error en:', dbPath, err.message);
    } else {
      console.log('Valores de type en ' + file + ':', rows);
    }
  });

  // Normalizar los tipos legados 'Producto' -> 'BIEN', 'Servicio' -> 'SERVICIO'
  db.run("UPDATE products SET type = 'BIEN' WHERE type = 'Producto' OR type = 'producto' OR type = 'bien' OR type IS NULL OR type = ''", function(err) {
    if (!err && this.changes > 0) {
      console.log(`[${file}] Normalizados ${this.changes} productos a type='BIEN'`);
    }
  });

  db.run("UPDATE products SET type = 'SERVICIO' WHERE type = 'Servicio' OR type = 'servicio'", function(err) {
    if (!err && this.changes > 0) {
      console.log(`[${file}] Normalizados ${this.changes} productos a type='SERVICIO'`);
    }
    db.close();
  });
}

// Chequear también la DB raíz si existe
const rootDb = path.resolve('pb_data', 'data.db');
if (fs.existsSync(rootDb)) {
  const db = new sqlite3.Database(rootDb);
  db.run("UPDATE products SET type = 'BIEN' WHERE type = 'Producto' OR type = 'producto' OR type = 'bien' OR type IS NULL OR type = ''", function(err) {
    if (!err && this.changes > 0) console.log(`[root] Normalizados ${this.changes} productos a type='BIEN'`);
  });
  db.run("UPDATE products SET type = 'SERVICIO' WHERE type = 'Servicio' OR type = 'servicio'", function(err) {
    if (!err && this.changes > 0) console.log(`[root] Normalizados ${this.changes} productos a type='SERVICIO'`);
    db.close();
  });
}
