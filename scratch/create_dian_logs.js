const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbs = [
  'empresas/empresa_8092/pb_data/data.db',
  'empresas/empresa_8091/pb_data/data.db',
  'empresas/empresa_8093/pb_data/data.db',
  'empresas/empresa_8094/pb_data/data.db',
  'pb_data/data.db'
];

const createTableSql = `
CREATE TABLE IF NOT EXISTS dian_logs (
  id TEXT PRIMARY KEY,
  created TEXT,
  updated TEXT,
  tx_id TEXT,
  document_number TEXT,
  document_type TEXT,
  provider TEXT DEFAULT 'MATIAS',
  endpoint TEXT,
  status_code INTEGER DEFAULT 0,
  success INTEGER DEFAULT 0,
  request_payload TEXT,
  response_payload TEXT,
  error_message TEXT,
  cufe TEXT,
  duration_ms INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_dian_logs_tx ON dian_logs(tx_id);
CREATE INDEX IF NOT EXISTS idx_dian_logs_doc ON dian_logs(document_number);
`;

dbs.forEach(relPath => {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping non-existent db: ${relPath}`);
    return;
  }
  const db = new sqlite3.Database(fullPath, (err) => {
    if (err) {
      console.error(`Error opening ${relPath}:`, err.message);
      return;
    }
    db.exec(createTableSql, (execErr) => {
      if (execErr) {
        console.error(`Error executing DDL on ${relPath}:`, execErr.message);
      } else {
        console.log(`Successfully verified/created dian_logs table in ${relPath}`);
      }
      db.close();
    });
  });
});

