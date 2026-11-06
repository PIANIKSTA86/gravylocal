const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%'", (err, rows) => {
  console.log("Matias settings in 8092:");
  rows.forEach(r => {
    if (r.key === 'matias_api_token') {
      console.log(r.key, ':', r.value.slice(0, 10) + '...' + r.value.slice(-5));
    } else {
      console.log(r.key, ':', r.value);
    }
  });
  db.close();
});

