const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('hub/pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT id, name, nit, port FROM companies", (err, comps) => {
  console.log('Companies in HUB:', comps);
  db.close();
});
