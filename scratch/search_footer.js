const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbs = ['empresas/empresa_8091/pb_data/data.db', 'empresas/empresa_8092/pb_data/data.db', 'empresas/empresa_8093/pb_data/data.db', 'empresas/empresa_8094/pb_data/data.db', 'pb_data/data.db'];

dbs.forEach(p => {
  if (fs.existsSync(p)) {
    const db = new sqlite3.Database(p);
    db.all("SELECT key, value FROM settings WHERE value LIKE '%porcelanato%' OR value LIKE '%CADENA%' OR key LIKE '%footer%' OR key LIKE '%invoice%' OR key LIKE '%pie%' OR key LIKE '%header%' OR key LIKE '%encabezado%'", (err, rows) => {
      if (rows && rows.length) {
        console.log(`\n=== Found in ${p} ===`);
        rows.forEach(r => console.log(`${r.key}: ${r.value?.slice(0, 150)}`));
      }
      db.close();
    });
  }
});

