const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

['empresas/empresa_8091', 'empresas/empresa_8092', 'empresas/empresa_8093', 'empresas/empresa_8094'].forEach(dir => {
  const p = dir + '/pb_data/data.db';
  if (fs.existsSync(p)) {
    const db = new sqlite3.Database(p);
    db.get("SELECT number, description, notes FROM transactions WHERE number = 3342", (err, row) => {
      if (row) console.log(`Found in ${dir}:`, row);
      db.close();
    });
  }
});

