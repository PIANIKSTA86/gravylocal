const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT * FROM tx_lines WHERE LOWER(description) LIKE '%deprec%'", (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('tx_lines with deprec:', rows.length);
    console.table(rows);
  }
  db.close();
});

