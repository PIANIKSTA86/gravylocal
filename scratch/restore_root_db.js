const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const rootDb = path.resolve('pb_data', 'data.db');
const cleanEmpresaDb = path.resolve('empresas', 'empresa_8091', 'pb_data', 'data.db');

console.log('Restaurando estructura limpia para pb_data/data.db...');

if (fs.existsSync(cleanEmpresaDb)) {
  const backup = path.resolve('pb_data', `corrupt_${Date.now()}.db`);
  if (fs.existsSync(rootDb)) {
    fs.renameSync(rootDb, backup);
    console.log('Archivo corrupto movido a:', backup);
  }

  // Copiar la DB limpia de empresa_8091 como base para demo
  fs.copyFileSync(cleanEmpresaDb, rootDb);
  console.log('Copiada base de datos limpia a pb_data/data.db');

  // Limpiar transacciones demo para que quede lista
  const db = new sqlite3.Database(rootDb);
  db.all("PRAGMA integrity_check;", (err, rows) => {
    console.log('Integrity check pb_data/data.db:', err ? err.message : rows);
    db.close();
  });
}
