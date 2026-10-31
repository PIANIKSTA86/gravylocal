const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const dbs = ['pb_data/data.db'];
if (fs.existsSync('empresas/empresa_8094/pb_data/data.db')) {
  dbs.push('empresas/empresa_8094/pb_data/data.db');
}

for (const p of dbs) {
  console.log('=== DB:', p);
  const db = new DatabaseSync(p, { open: true, readOnly: true });
  const rows = db.prepare("SELECT code, name, requires_third_party, maneja_cruce FROM accounts WHERE code LIKE '13%' ORDER BY code").all();
  console.log(`Found ${rows.length} accounts in 13%`);
  rows.forEach(r => console.log(`${r.code.padEnd(12)} | 3rd: ${r.requires_third_party} | Cruce: ${r.maneja_cruce} | ${r.name}`));
  db.close();
}
