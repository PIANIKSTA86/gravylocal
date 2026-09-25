const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT id, email, role FROM users LIMIT 5", (err, rows) => {
  if (err) return console.error(err);
  console.log("Users:", rows);
});
