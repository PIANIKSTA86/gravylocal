const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT key, value FROM settings WHERE key LIKE '%header%' OR key LIKE '%footer%' OR key LIKE '%text%' OR key LIKE '%invoice%' OR key LIKE '%resol%'", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("MATCHING SETTINGS:");
  rows.forEach(r => console.log(`${r.key}: ${r.value}`));
});
