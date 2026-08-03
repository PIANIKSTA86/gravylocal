const sqlite3 = require('sqlite3');
const fs = require('fs');

const companyDb = 'pb_data/data.db';
if (fs.existsSync(companyDb)) {
  const db = new sqlite3.Database(companyDb, sqlite3.OPEN_READONLY);
  db.all("SELECT id, number, third_party_id FROM transactions WHERE number LIKE '%3749%'", [], (err, txs) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Transactions:", txs);
      if (txs.length > 0) {
        const tpId = txs[0].third_party_id;
        db.all("SELECT id, name, doc_number, person_type, first_name, last_name FROM third_parties WHERE id = ?", [tpId], (err2, tps) => {
          if (err2) {
            console.error(err2);
          } else {
            console.log("Third Party for transaction:", tps);
          }
          db.close();
        });
      } else {
        db.close();
      }
    }
  });
}
