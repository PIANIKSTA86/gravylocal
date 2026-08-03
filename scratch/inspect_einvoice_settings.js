const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening DB:", err);
    process.exit(1);
  }
});

db.all("SELECT * FROM settings WHERE key LIKE '%einvoice%' OR key LIKE '%dian%' OR key LIKE '%ftech%'", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("=== DIAN / EINVOICE / FTECH SETTINGS ===");
  console.log(JSON.stringify(rows, null, 2));
});
