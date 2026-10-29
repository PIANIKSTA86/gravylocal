const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("PRAGMA table_info(audit_log)", (err, rows) => {
  if (err) console.error(err);
  else console.log(rows);
  db.close();
});

