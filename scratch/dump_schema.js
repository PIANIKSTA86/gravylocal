const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT name, schema FROM _collections", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    for (const row of rows) {
      console.log(`Collection: ${row.name}`);
      try {
        const schema = JSON.parse(row.schema);
        console.log("Fields:", schema.map(f => `${f.name} (${f.type})`));
      } catch (e) {
        console.log("Schema JSON parsing failed or new format:", row.schema);
      }
      console.log("-----------------------------------------");
    }
  }
  db.close();
});
