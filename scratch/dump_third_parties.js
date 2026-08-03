const sqlite3 = require('sqlite3');
const fs = require('fs');

const companyDb = 'empresas/empresa_8092/pb_data/data.db';
if (fs.existsSync(companyDb)) {
  const db = new sqlite3.Database(companyDb, sqlite3.OPEN_READONLY);
  db.all("SELECT id, name, doc_number, person_type, first_name, last_name FROM third_parties", [], (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`=== ROWS IN ${companyDb} ===`);
      console.log(rows);
    }
    db.close();
  });
} else {
  console.log("Database not found.");
}
