const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const empresas = fs.readdirSync('empresas').filter(d => {
  try { return fs.statSync('empresas/' + d).isDirectory(); } catch(e) { return false; }
});

async function run() {
  for (const emp of empresas) {
    const dbPath = path.resolve('empresas', emp, 'pb_data', 'data.db');
    if (!fs.existsSync(dbPath)) continue;
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
    const q = (sql) => new Promise((res, rej) => db.all(sql, [], (e, r) => e ? rej(e) : res(r)));
    try {
      const rows = await q("SELECT * FROM dian_resolutions WHERE document_type='NE'");
      if (rows.length) {
        console.log('\n=== ' + emp + ' DIAN NE Resolutions ===');
        console.log(rows);
      } else {
        console.log(emp + ': no NE resolutions');
      }
      const eps = await q("SELECT id, consecutivo, prefijo, ano, mes, estado_dian FROM electronic_payrolls LIMIT 5");
      if (eps.length) {
        console.log('=== ' + emp + ' electronic_payrolls sample ===');
        console.log(eps);
      }
    } catch(e) { console.log(emp + ' err:', e.message); }
    db.close();
  }
}
run();
