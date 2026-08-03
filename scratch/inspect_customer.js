const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const mainDb = 'pb_data/data.db';
if (fs.existsSync(mainDb)) {
  const db = new sqlite3.Database(mainDb, sqlite3.OPEN_READONLY);
  db.all("SELECT id, doc_number, name, person_type, first_name, last_name FROM third_parties WHERE name LIKE '%CAROLINA%' OR name LIKE '%CARDONA%' OR doc_number = '1143871709'", [], (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Root DB results:', rows);
    }
    db.close();
  });
} else {
  console.log("Root Database not found at " + mainDb);
}
