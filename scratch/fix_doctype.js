const sqlite3 = require('sqlite3');
const fs = require('fs');

const companyDb = 'pb_data/data.db';
if (fs.existsSync(companyDb)) {
  const db = new sqlite3.Database(companyDb, sqlite3.OPEN_READWRITE);
  db.run("UPDATE third_parties SET doc_type = 'CC' WHERE doc_number = '1143871709'", [], function(err) {
    if (err) {
      console.error(err);
    } else {
      console.log(`Successfully updated doc_type to 'CC' for CAROLINA CARDONA GONZALEZ. Rows affected: ${this.changes}`);
    }
    db.close();
  });
} else {
  console.log("Database not found.");
}
