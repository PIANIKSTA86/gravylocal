const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');
db.all("SELECT code, name, active, maneja_cruce, requires_third_party FROM accounts WHERE code LIKE '5135%' OR code LIKE '2205%' OR code LIKE '1105%' OR code LIKE '1110%' ORDER BY code LIMIT 20", (err, rows) => {
  if (err) console.error(err);
  else console.table(rows);
  db.close();
});
