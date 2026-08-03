const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const txId = 'cymzvzu7se9yaw6';

db.all("SELECT * FROM transaction_details WHERE tx_id = ?", [txId], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log("TRANSACTION DETAILS ROWS:");
  console.log(JSON.stringify(rows, null, 2));
});
