const db = new (require('sqlite3').verbose()).Database('./pb_data/data.db');
db.all("SELECT id, name, commercial_name, doc_number FROM third_parties WHERE name LIKE '%domestiko%' OR doc_number LIKE '%901428834%'", (err, rows) => {
  console.log('Third party matches:', rows);
  db.all("SELECT key, value FROM settings WHERE key IN ('company', 'company_name', 'company_nit')", (e2, r2) => {
    console.log('Settings matches:', r2);
    db.close();
  });
});
