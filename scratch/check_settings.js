const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('empresas', 'empresa_8093', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
db.all("SELECT key, value FROM settings", [], (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('--- ALL SETTINGS ---');
    rows.forEach(r => {
      console.log(r.key, ':', (r.value || '').slice(0, 100));
    });
  }
  db.close();
});
