const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  console.log("Tables in 8092:", tables?.map(t => t.name));
  db.close();
});
