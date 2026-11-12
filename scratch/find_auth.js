const sqlite3 = require('sqlite3').verbose();
const http = require('http');

const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.get("SELECT email FROM users LIMIT 1", (err, user) => {
  console.log("User in users:", user);

  // Or let's check zz_seed_user or find password
  db.all("SELECT id, email, username FROM users", (err2, users) => {
    console.log("All users:", users);
    db.close();
  });
});

