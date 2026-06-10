const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db');

db.all("SELECT id, username, email, role FROM users", (err, rows) => {
  if (err) {
    console.error("Error reading users:", err);
  } else {
    console.log("Users in DB:");
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
