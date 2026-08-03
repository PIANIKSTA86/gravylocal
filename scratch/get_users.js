const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'pb_data', 'data.db'));

db.all('SELECT id, email, role FROM users', (err, rows) => {
  if (err) console.error(err);
  else console.log(rows);
  db.close();
});
