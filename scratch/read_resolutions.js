const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT id, name, prefix, resolution_number, `from`, `to`, is_active, document_type FROM dian_resolutions", [], (err, rows) => {
  if (err) console.log('dian_resolutions error/empty:', err?.message);
  else {
    console.log('--- dian_resolutions records count:', rows.length);
    rows.forEach(r => console.log(JSON.stringify(r)));
  }
  db.close();
});
