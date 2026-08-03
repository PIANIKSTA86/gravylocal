const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT * FROM settings WHERE key IN ('company_name', 'company_nit', 'company_address', 'company_phone', 'company_third_party_id')", (err, rows) => {
  console.log("Settings keys:", rows);
});

db.get("SELECT value FROM settings WHERE key = 'company_third_party_id'", (err, row) => {
  if (row && row.value) {
    db.get("SELECT * FROM third_parties WHERE id = ?", [row.value], (err, tp) => {
      console.log("Company third party record:", tp);
    });
  }
});
