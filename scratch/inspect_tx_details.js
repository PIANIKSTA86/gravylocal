const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.get("SELECT t.id, t.number, t.third_party_id, c.name, c.address, c.city, c.department FROM transactions t LEFT JOIN third_parties c ON t.third_party_id = c.id WHERE t.id = 'l4dpgvdy6skbfp9'", [], (err, tx) => {
  console.log('TX & Customer:', tx);
  db.all("SELECT key, value FROM settings WHERE key LIKE '%cit%' OR key LIKE '%dep%' OR key LIKE '%addr%' OR key LIKE '%company%'", [], (err, sets) => {
    console.log('Settings:', sets);
    db.all("SELECT * FROM invoice_lines WHERE invoice_id = '3ikirte1qovmjd9'", [], (err, lines) => {
      console.log('Lines count:', lines ? lines.length : 0);
      console.log('Lines:', lines);
      db.close();
    });
  });
});
