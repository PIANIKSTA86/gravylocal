const http = require('http');
const sqlite3 = require('sqlite3').verbose();

// 1. Get an active user/admin token or test the endpoint
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db', sqlite3.OPEN_READONLY);

db.all("SELECT id, email FROM _admins LIMIT 1", (err, admins) => {
  if (err || !admins || admins.length === 0) {
    db.all("SELECT id, email FROM users LIMIT 1", (err2, users) => {
      console.log('Admins or users:', { admins, users });
      db.close();
    });
  } else {
    console.log('Admins:', admins);
    db.close();
  }
});

