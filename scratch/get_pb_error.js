const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve('pb_data', 'data.db'), sqlite3.OPEN_READONLY);

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%log%' OR name LIKE '%req%'", [], (err, rows) => {
  console.log('Tables:', rows);
  db.close();
});
