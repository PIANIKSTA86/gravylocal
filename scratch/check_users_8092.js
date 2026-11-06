const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("PRAGMA table_info(users)", (err, cols) => {
  if (err) console.error("Error:", err.message);
  else console.log('cols:', cols.map(c => c.name));
  db.all("SELECT id, email FROM users", (err2, rows) => {
    console.log('users rows:', rows);
    db.close();
  });
});
