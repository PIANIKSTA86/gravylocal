const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const dbs = [
  'pb_data/auxiliary.db',
  'empresas/empresa_8091/pb_data/auxiliary.db',
  'empresas/empresa_8092/pb_data/auxiliary.db',
  'empresas/empresa_8093/pb_data/auxiliary.db',
  'empresas/empresa_8094/pb_data/auxiliary.db',
];

for (const p of dbs) {
  try {
    const stat = fs.statSync(p);
    console.log(`${p} -> mtime: ${stat.mtime.toISOString()}`);
    const db = new DatabaseSync(p);
    const rows = db.prepare("SELECT id, created, message, data FROM _logs ORDER BY id DESC LIMIT 2").all();
    for (const r of rows) {
      console.log(`  [${r.created}] ${r.message} | ${r.data ? r.data.slice(0, 150) : ''}`);
    }
  } catch(e) {
    console.log(`Err ${p}: ${e.message}`);
  }
}
