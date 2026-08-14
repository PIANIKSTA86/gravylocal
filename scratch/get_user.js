const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve('pb_data', 'data.db'), sqlite3.OPEN_READONLY);

db.all("SELECT * FROM users LIMIT 1", [], (err, rows) => {
  console.log('USER ROW:', err || rows);
  db.close();
});
