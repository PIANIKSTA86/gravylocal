const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.resolve('hub', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, () => {
  db.all("PRAGMA table_info(companies)", (err, rows) => {
    console.log('COLUMNS:', rows);
    db.all("SELECT * FROM companies", (err2, rows2) => {
      console.log('ROWS:', rows2);
      db.close();
    });
  });
});
