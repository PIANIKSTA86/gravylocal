const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.get("SELECT * FROM dian_resolutions WHERE id = 'j4gouc1z09930h8'", [], (err, row) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("RESOLUTION DETAILS:");
  console.log(JSON.stringify(row, null, 2));
});
