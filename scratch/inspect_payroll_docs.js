const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db');

db.all("SELECT id, email, role, active FROM users", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
