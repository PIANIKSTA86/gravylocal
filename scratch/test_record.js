const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT * FROM niif_assets WHERE id='t0be3bzx6l1wzvg'", (err, row) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log("Record t0be3bzx6l1wzvg:", JSON.stringify(row, null, 2));
});
