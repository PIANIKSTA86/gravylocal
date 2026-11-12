const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbs = [
  'pb_data/data.db',
  'empresas/empresa_8091/pb_data/data.db',
  'empresas/empresa_8092/pb_data/data.db'
];

dbs.forEach(dbPath => {
  if (!fs.existsSync(dbPath)) return;
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
  db.get("SELECT * FROM einvoice_docs WHERE cufe LIKE '%019ba22c83276c9f%' OR cufe LIKE '%f591d196d43db0%'", (err, row) => {
    if (row) {
      console.log(`Found in ${dbPath}:`, { id: row.id, tx_id: row.tx_id, cufe: row.cufe, status: row.status, sent_at: row.sent_at });
    }
  });
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='dian_logs'", (err, row) => {
    if (row) console.log(`dian_logs table exists in ${dbPath}`);
  });
});

