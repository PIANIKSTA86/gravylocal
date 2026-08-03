const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const txId = 'cymzvzu7se9yaw6';

db.get("SELECT xml_content FROM einvoice_docs WHERE tx_id = ?", [txId], (err, row) => {
  if (err || !row) {
    console.error(err || "Not found");
    return;
  }
  console.log("XML CONTENT HEAD:");
  console.log(row.xml_content.substring(0, 1000));
});
