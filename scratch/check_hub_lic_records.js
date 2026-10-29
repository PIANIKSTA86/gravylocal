const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('hub/pb_data/data.db');

db.all("SELECT * FROM licenses WHERE module_key='importaciones'", (err, rows) => {
  if (err) console.error(err);
  else console.log("Importaciones licenses in HUB:", rows);
});
