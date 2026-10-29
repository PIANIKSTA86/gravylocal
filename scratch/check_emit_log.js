const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const p1 = './pb_data/auxiliary.db';
const p2 = './pb_data/data.db';

const dbPath = fs.existsSync(p1) ? p1 : p2;
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) return console.error(err);
  console.log("Tables:", tables.map(t => t.name));
  const logTable = tables.find(t => t.name.includes('request') || t.name.includes('log'));
  if (logTable) {
    db.all(`SELECT * FROM ${logTable.name} WHERE url LIKE '%dian/emit%' ORDER BY id DESC LIMIT 3`, (e, rows) => {
      if (e) console.error(e);
      else console.log("Recent emit requests:", JSON.stringify(rows, null, 2));
    });
  }
});
