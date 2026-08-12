const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('empresas', 'empresa_8093', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
function q(sql) {
  return new Promise((res,rej) => db.all(sql, [], (e,r) => e ? rej(e) : res(r)));
}
async function run() {
  const tables = await q("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('Tables:', tables.map(t=>t.name).join(', '));
  // The table might be _pb_data_ prefixed or different
  for (const t of tables) {
    if (t.name.includes('payroll') || t.name.includes('third') || t.name.includes('employee')) {
      const cnt = await q('SELECT COUNT(*) as c FROM "' + t.name + '"');
      console.log(t.name + ': ' + cnt[0].c + ' rows');
    }
  }
  db.close();
}
run().catch(e => { console.error(e.message); db.close(); });
