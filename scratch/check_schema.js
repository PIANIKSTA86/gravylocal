const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT * FROM _collections WHERE name='niif_assets'", (err, row) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  if (!row) {
    console.log("No collection found with name niif_assets");
    return;
  }
  console.log("Collection:", row.name);
  if (row.schema) {
    console.log("Schema (v0.22-):", JSON.stringify(JSON.parse(row.schema), null, 2));
  }
  if (row.fields) {
    console.log("Fields (v0.23+):", JSON.stringify(JSON.parse(row.fields), null, 2));
  }
});
