const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db');

db.get("SELECT * FROM _collections WHERE name = 'dian_resolutions'", (err, row) => {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(row, null, 2));
  }
});
