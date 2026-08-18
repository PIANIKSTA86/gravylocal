const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../pb_data/data.db'));

db.get("SELECT id, name, listRule, viewRule, createRule, updateRule, deleteRule FROM _collections WHERE name = 'third_parties'", (err, row) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(row, null, 2));
  db.close();
});
