const { DatabaseSync } = require('node:sqlite');
const paths = [
  'pb_data/auxiliary.db',
  'empresas/empresa_8091/pb_data/auxiliary.db',
  'empresas/empresa_8092/pb_data/auxiliary.db',
  'empresas/empresa_8093/pb_data/auxiliary.db',
  'empresas/empresa_8094/pb_data/auxiliary.db',
  'empresas/pb_data/auxiliary.db',
  'hub/pb_data/auxiliary.db'
];

for (const p of paths) {
  try {
    const db = new DatabaseSync(p);
    const rows = db.prepare("SELECT id, created, message, data FROM _logs ORDER BY id DESC LIMIT 5").all();
    console.log(`=== ${p} ===`);
    for (const r of rows) {
      console.log(r.created, r.message, r.data ? r.data.slice(0, 200) : '');
    }
  } catch (e) {
    console.log(`Err on ${p}: ${e.message}`);
  }
}
