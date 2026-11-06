const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db', sqlite3.OPEN_READONLY);
db.all("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%user%' OR name LIKE '%admin%')", (err, tables) => {
  console.log('User/admin tables:', tables);
  if (tables && tables.length) {
    db.all(`SELECT id, email FROM ${tables[0].name}`, (err2, rows) => {
      console.log('Rows in', tables[0].name, rows);
      db.close();
    });
  } else {
    db.close();
  }
});
