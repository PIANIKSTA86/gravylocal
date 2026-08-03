const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const mainDb = 'pb_data/data.db';
if (fs.existsSync(mainDb)) {
  const db = new sqlite3.Database(mainDb, sqlite3.OPEN_READONLY);
  db.all("SELECT id, number, tx_type_id FROM transactions WHERE number = 'FV-00003749'", [], (err, txRows) => {
    if (err) {
      console.error(err);
      db.close();
      return;
    }
    console.log('Transactions matching FV-00003749:', txRows);
    if (txRows.length > 0) {
      const txId = txRows[0].id;
      db.all("SELECT * FROM einvoice_docs WHERE tx_id = ?", [txId], (err, docRows) => {
        if (err) {
          console.error(err);
        } else {
          console.log('einvoice_docs details:', docRows);
        }
        db.close();
      });
    } else {
      db.close();
    }
  });
}
