const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.get("PRAGMA integrity_check", (err, row) => {
  console.log("data.db integrity:", row);
  db.close();
});

