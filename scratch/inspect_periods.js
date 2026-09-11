const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./empresas/empresa_8094/pb_data/data.db');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  console.log('Tables:', tables.map(t => t.name).filter(n => n.includes('ph') || n.includes('tx') || n.includes('trans')));
});

db.all("SELECT * FROM transactions LIMIT 1", (err, t) => {
  if (err) console.log('tx err:', err);
  else console.log('tx sample:', t);
});
