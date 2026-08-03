const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT id, email, role, active FROM users", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("=== USERS IN LOCAL DB ===");
  console.log(JSON.stringify(rows, null, 2));
});
