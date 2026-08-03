const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const mainDb = 'pb_data/data.db';
if (fs.existsSync(mainDb)) {
  const db = new sqlite3.Database(mainDb, sqlite3.OPEN_READONLY);
  db.all("SELECT * FROM third_parties WHERE doc_number = '1143871709'", [], (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Customer details:', rows);
    }
    db.close();
  });
}
