const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const empresas = fs.readdirSync('empresas').filter(d => {
  try { return fs.statSync('empresas/' + d).isDirectory(); } catch(e) { return false; }
});

for (const emp of empresas) {
  const dbPath = path.resolve('empresas', emp, 'pb_data', 'data.db');
  if (!fs.existsSync(dbPath)) continue;
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
  db.all("SELECT id, consecutivo, prefijo, ano, mes FROM electronic_payrolls LIMIT 5", [], (err, rows) => {
    if (rows && rows.length) {
      console.log(`\n=== ${emp} has ${rows.length} electronic_payrolls ===`);
      console.log(rows);
    }
    db.close();
  });
}
