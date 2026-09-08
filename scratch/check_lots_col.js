const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.get("SELECT * FROM _collections WHERE name = 'inventory_lots'", (err, row) => {
  if (err) console.error(err);
  else {
    console.log("Collection Name:", row.name);
    console.log("Fields:\n", JSON.stringify(JSON.parse(row.fields), null, 2));
  }
  db.close();
});
