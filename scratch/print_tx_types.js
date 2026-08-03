const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT id, name, code, prefix FROM transaction_types", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("TRANSACTION TYPES:");
  console.log(JSON.stringify(rows, null, 2));
});
