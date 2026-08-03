const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.get("SELECT * FROM third_parties WHERE id = '6rrkkgueqzgorkj'", [], (err, row) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("COMPANY THIRD PARTY DETAILS:");
  console.log(JSON.stringify(row, null, 2));
});
