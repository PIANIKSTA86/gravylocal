const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/pb_data/data.db');

db.get("SELECT * FROM _collections WHERE name='licenses'", (err, colRow) => {
  if (err) {
    console.error("Error query _collections:", err);
  } else {
    if (colRow) {
      // In PocketBase v0.23+ schemas might be stored differently, let's print all properties
      console.log("Collection Info for licenses:\n", JSON.stringify(colRow, null, 2));
      try {
        const schema = JSON.parse(colRow.schema || '[]');
        console.log("\nSchema Detail:\n", JSON.stringify(schema, null, 2));
      } catch (e) {
        console.log("Could not parse schema field directly, trying fields:");
        console.log("fields:", colRow.fields);
      }
    } else {
      console.log("Collection 'licenses' not found in _collections.");
    }
  }
  db.close();
});
