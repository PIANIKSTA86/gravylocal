const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("PRAGMA table_info(transactions)", (err, rows) => {
  if (err) console.error(err);
  else console.log(rows.map(r => r.name));
  db.close();
});

