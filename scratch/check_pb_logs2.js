const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbs = [
  path.resolve('pb_data', 'logs.db'),
  path.resolve('empresas', 'empresa_8093', 'pb_data', 'logs.db')
];

for (const dbPath of dbs) {
  if (!fs.existsSync(dbPath)) continue;
  console.log('\n=== LOGS DB:', dbPath, '===');
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) console.error(err);
    else console.log('Tables:', rows.map(r => r.name));
    if (rows && rows.some(r => r.name === 'logs')) {
      db.all("SELECT * FROM logs ORDER BY id DESC LIMIT 5", [], (e, logRows) => {
        if (e) console.error(e);
        else console.log('Recent logs:', logRows);
        db.close();
      });
    } else {
      db.close();
    }
  });
}
