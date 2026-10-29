const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("PRAGMA table_info(transactions)", (err, cols) => {
  if (err) console.error(err);
  else console.log(cols.map(c => c.name));
  db.close();
});
