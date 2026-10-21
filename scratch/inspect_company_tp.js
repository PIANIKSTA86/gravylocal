const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.get("SELECT * FROM third_parties WHERE id = 'ybnelepv0ln0c9s'", [], (err, row) => {
  console.log('Company Third Party:', row ? { name: row.name, city: row.city, department: row.department, address: row.address } : null);
  db.close();
});
