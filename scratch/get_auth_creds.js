const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) return console.error(err);
  console.log('Tables:', tables.map(t => t.name).join(', '));
  db.all("SELECT id, email FROM _admins", (e, admins) => {
    console.log('Admins:', admins);
    db.all("SELECT id, email, username FROM users", (e2, users) => {
      console.log('Users:', users);
      db.close();
    });
  });
});
