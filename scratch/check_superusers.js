const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT id, email FROM _superusers", (err, rows) => {
  console.log("_superusers:", rows);
  db.all("SELECT id, email, tokenKey FROM users", (err2, users) => {
    console.log("users:", users);
    db.close();
  });
});

