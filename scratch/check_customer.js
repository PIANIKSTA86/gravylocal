const sqlite3 = require('sqlite3');
const fs = require('fs');

const companyDb = 'pb_data/data.db';
if (fs.existsSync(companyDb)) {
  const db = new sqlite3.Database(companyDb, sqlite3.OPEN_READONLY);
  db.all("SELECT doc_number, name, doc_type, person_type FROM third_parties WHERE doc_number = '1143853914'", [], (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log(rows);
    }
    db.close();
  });
}
