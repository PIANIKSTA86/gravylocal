const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT * FROM licenses", (err, rows) => {
  if (err) console.error(err);
  else console.log("All licenses in Tenant:", rows.map(r => ({ id: r.id, module_key: r.module_key, enabled: r.enabled })));
});
