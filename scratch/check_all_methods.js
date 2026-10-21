const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbs = [
  'pb_data/data.db',
  'empresas/empresa_8091/pb_data/data.db',
  'empresas/empresa_8092/pb_data/data.db',
  'empresas/empresa_8093/pb_data/data.db',
  'empresas/empresa_8094/pb_data/data.db'
];

dbs.forEach(dbPath => {
  if (!fs.existsSync(dbPath)) return;
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT key, value FROM settings WHERE key IN ('einvoice_method', 'company_name', 'company_nit')", (err, rows) => {
    if (!err && rows) {
      const obj = {};
      rows.forEach(r => obj[r.key] = r.value);
      console.log(dbPath, obj);
    }
    db.close();
  });
});
