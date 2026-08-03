const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/JULIAN/Desktop/GravyLocal2.0/empresas/empresa_8091/pb_data/data.db');
db.all("PRAGMA table_info(invoices)", (err, rows) => {
  if (err) { console.error(err); return db.close(); }
  console.log(rows.map(r => r.name).join('\n'));
  db.close();
});
