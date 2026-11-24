const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dirs = [
  'pb_data',
  'empresas/empresa_8091/pb_data',
  'empresas/empresa_8092/pb_data',
  'empresas/empresa_8093/pb_data',
  'empresas/empresa_8094/pb_data',
  'empresas/empresa_8095/pb_data'
];

for (const d of dirs) {
  const dbPath = path.join(d, 'data.db');
  if (fs.existsSync(dbPath)) {
    try {
      const db = new DatabaseSync(dbPath);
      const setting = db.prepare("SELECT value FROM settings WHERE key LIKE '%company%' OR key LIKE '%name%'").all();
      const accountsCount = db.prepare("SELECT COUNT(*) as cnt FROM accounts").get();
      const txCount = db.prepare("SELECT COUNT(*) as cnt FROM transactions").get();
      console.log(`\nDir: ${d}`);
      console.log(`Company:`, setting);
      console.log(`Accounts: ${accountsCount.cnt}, Tx: ${txCount.cnt}`);
    } catch (e) {
      console.log(`Dir: ${d} -> Error: ${e.message}`);
    }
  }
}
