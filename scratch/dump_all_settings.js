const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("ALL SETTINGS KEYS:");
  rows.forEach(r => console.log(`${r.key}: ${r.value}`));
});
