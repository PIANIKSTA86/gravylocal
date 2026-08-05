const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.serialize(() => {
  db.all('PRAGMA table_info(tx_lines)', [], (err, rows) => {
    console.log('\n--- TX_LINES SCHEMA ---');
    console.log(err || rows);
    db.close();
  });
});
