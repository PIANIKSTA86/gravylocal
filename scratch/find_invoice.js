const { DatabaseSync } = require('node:sqlite');

const dbs = [
  'pb_data/data.db',
  'empresas/empresa_8091/pb_data/data.db',
  'empresas/empresa_8092/pb_data/data.db',
  'empresas/empresa_8093/pb_data/data.db',
  'empresas/empresa_8094/pb_data/data.db',
];

for (const p of dbs) {
  try {
    const db = new DatabaseSync(p);
    const row = db.prepare("SELECT number, date, id FROM transactions WHERE number = 'FV-00003773'").get();
    if (row) {
      console.log(`FOUND IN ${p}:`, row);
    }
  } catch(e) {
    // ignore
  }
}
