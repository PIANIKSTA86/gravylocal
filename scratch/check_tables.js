const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./empresas/empresa_8091/pb_data/data.db');

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%invoice%' OR name LIKE '%dian%'", [], (err, tables) => {
  console.log('Tables:', tables);
  db.close();
});
