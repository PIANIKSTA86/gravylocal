const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT * FROM dian_resolutions", (err, rows) => {
  console.log("dian_resolutions in pb_data/data.db:", rows);
});
