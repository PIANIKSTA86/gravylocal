const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbs = [
  'pb_data/data.db',
  'empresas/pb_data/data.db',
  'empresas/empresa_8091/pb_data/data.db',
  'empresas/empresa_8092/pb_data/data.db',
  'empresas/empresa_8093/pb_data/data.db',
  'empresas/empresa_8094/pb_data/data.db',
];

for (const dbPath of dbs) {
  if (!fs.existsSync(dbPath)) continue;
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT id, name, doc_number FROM third_parties WHERE name LIKE '%VELASCO ROSERO%'", (err, rows) => {
    if (!err && rows && rows.length) {
      console.log(`FOUND in ${dbPath}:`, rows);
    }
    db.close();
  });
}
