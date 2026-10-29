const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '_%'", (e, r) => {
  console.log("System tables:", r.map(t => t.name));
  const userTable = r.find(t => t.name === '_superusers' || t.name === '_admins' || t.name === 'users');
  if (userTable) {
    db.all(`SELECT id, email FROM ${userTable.name}`, (e2, u) => {
      console.log(`Users from ${userTable.name}:`, u);
    });
  }
  db.all("SELECT id, email FROM users LIMIT 3", (e3, regUsers) => {
    console.log("Regular users:", regUsers);
  });
});
