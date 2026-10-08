const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.resolve('hub', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, () => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
    console.log('TABLES IN HUB:', rows ? rows.map(r => r.name) : err);
    db.close();
  });
});
