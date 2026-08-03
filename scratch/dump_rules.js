const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT name, listRule, viewRule, createRule, updateRule, deleteRule FROM _collections WHERE name = 'third_parties'", (err, row) => {
  if (err) {
    console.error(err);
  } else {
    console.log(row);
  }
  db.close();
});
