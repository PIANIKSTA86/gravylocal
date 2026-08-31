const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('empresas', 'empresa_8093', 'pb_data', 'data.db');
console.log('Inspeccionando:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error abriendo DB:', err);
    return;
  }

  db.get("SELECT * FROM products WHERE id = 'prod_harina' OR code = 'prod_harina' LIMIT 1", (err, row) => {
    if (err) {
      console.error('Error query:', err);
    } else {
      console.log('Registro prod_harina:', row);
    }
  });

  db.all("SELECT id, code, name, unit, type FROM products LIMIT 5", (err, rows) => {
    if (err) {
      console.error('Error query products:', err);
    } else {
      console.log('Primeros 5 productos:', rows);
    }
    db.close();
  });
});
