const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');

db.all("SELECT key, value FROM settings WHERE key LIKE '%method%' OR key LIKE '%dian%' OR key LIKE '%matias%'", (err, rows) => {
  rows.forEach(r => console.log(r.key, '=', r.value));
  db.close();
});
