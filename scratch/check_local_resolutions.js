const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT * FROM dian_resolutions", (err, rows) => {
  if (err) console.error(err);
  else console.log("Resolutions in local DB:", rows);
});
