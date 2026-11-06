const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');

db.all("SELECT id, name, commercial_name, doc_type, doc_number, dv, person_type, tax_regime, resp FROM third_parties WHERE doc_number LIKE '%901428834%' OR name LIKE '%DOMESTIKO%'", (err, thirds) => {
  console.log("DOMESTIKO in third_parties:", thirds);
  db.close();
});
