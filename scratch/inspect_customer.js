const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8092/pb_data/data.db');
db.all("SELECT id, name, doc_type, doc_number, dv, email, phone, address, city, city_code, department, dept_code, tax_regime, person_type FROM third_parties WHERE doc_number = '222222222222' OR city LIKE '%CALI%' LIMIT 5", (err, rows) => {
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});
