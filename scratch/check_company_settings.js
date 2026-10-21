const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.all("SELECT key, value FROM settings WHERE key LIKE '%city%' OR key LIKE '%company%' OR key LIKE '%muni%'", (err, rows) => {
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});
