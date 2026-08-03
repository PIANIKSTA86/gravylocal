const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening DB:", err);
    process.exit(1);
  }
});

db.get("SELECT * FROM third_parties WHERE name LIKE '%SANDRA ROJAS%'", [], (err, row) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("=== SANDRA ROJAS RECORD ===");
  console.log(JSON.stringify(row, null, 2));
});
