const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT key, value FROM settings WHERE key LIKE '%company%' OR key LIKE '%nit%' OR key LIKE '%name%' OR key LIKE '%resolution%'", [], (err, rows) => {
  if (err) console.error(err);
  else {
    console.log('--- Company/Resolution settings ---');
    rows.forEach(r => console.log(`${r.key}: ${r.value}`));
  }
});

db.all("SELECT id, name, prefix, resolution_number, technical_key, `from`, `to`, is_active, document_type FROM dian_resolutions", [], (err, rows) => {
  if (err) console.log('dian_resolutions error/empty:', err?.message);
  else {
    console.log('--- dian_resolutions records ---');
    console.log(rows);
  }
  db.close();
});
