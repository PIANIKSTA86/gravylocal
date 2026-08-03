const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT name, fields FROM _collections WHERE system = 0", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    for (const row of rows) {
      console.log(`=== Collection: ${row.name} ===`);
      try {
        const fields = JSON.parse(row.fields);
        const fieldNames = fields.map(f => `${f.name} (${f.type})`).join(', ');
        console.log(fieldNames);
      } catch (e) {
        console.log("Raw fields:", row.fields);
      }
      console.log();
    }
  }
  db.close();
});
