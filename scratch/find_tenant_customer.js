const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const companyDb = 'empresas/empresa_8092/pb_data/data.db';
if (fs.existsSync(companyDb)) {
  const db = new sqlite3.Database(companyDb, sqlite3.OPEN_READONLY);
  db.all("SELECT doc_number, name, person_type, first_name, last_name FROM third_parties WHERE name LIKE '%CAROLINA%' OR name LIKE '%CARDONA%' OR name LIKE '%LOPEZ%'", [], (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(rows);
    }
    db.close();
  });
} else {
  console.log("Database not found at " + companyDb);
}
