const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT fields FROM _collections WHERE name = 'tx_lines'", (err, row) => {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(JSON.parse(row.fields), null, 2));
  }
  db.close();
});
