const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');
db.get("SELECT t.id, t.third_party_id FROM transactions t WHERE t.id = 'e7at7ig46055tsl'", (err, t) => {
  if (err || !t) return console.log(err || 'No tx');
  db.get("SELECT * FROM third_parties WHERE id = ?", [t.third_party_id], (err2, tp) => {
    console.log(tp);
    db.close();
  });
});
