const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const testId = '5996dibwttdpjg2';

// Check all db files
const dbs = [
  'pb_data/data.db',
  'empresas/empresa_8091/pb_data/data.db',
  'empresas/empresa_8092/pb_data/data.db',
  'empresas/empresa_8093/pb_data/data.db',
  'empresas/empresa_8094/pb_data/data.db',
  'hub/pb_data/data.db'
];

dbs.forEach(dbPath => {
  if (!fs.existsSync(dbPath)) return;
  try {
    const db = new DatabaseSync(dbPath);
    const tbls = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name).filter(t => !t.startsWith('_'));
    tbls.forEach(t => {
      try {
        const found = db.prepare(`SELECT * FROM ${t} WHERE id = ?`).all(testId);
        if (found.length > 0) {
          console.log(`FOUND in ${dbPath} -> table ${t}:`, found);
        }
      } catch(e) {}
    });
  } catch(e) {}
});

