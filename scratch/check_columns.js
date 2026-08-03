const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("PRAGMA table_info(einvoice_docs)", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("COLUMNS IN einvoice_docs:");
  rows.forEach(r => {
    console.log(`${r.name} (${r.type})`);
  });
});
