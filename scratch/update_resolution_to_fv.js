const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);

db.serialize(() => {
  // 1. Update the resolution prefix to FV
  db.run(
    "UPDATE dian_resolutions SET prefix = 'FV' WHERE id = 'j4gouc1z09930h8'",
    [],
    function(err) {
      if (err) {
        console.error("Error updating resolution prefix:", err.message);
      } else {
        console.log("Resolution prefix updated to FV. Rows affected:", this.changes);
      }
    }
  );

  // 2. Update the transaction type of our invoice to hvxhp0kctv6oc5z (FV)
  db.run(
    "UPDATE invoices SET tx_type_id = 'hvxhp0kctv6oc5z' WHERE id = 'qu84z7rjptwdq4g'",
    [],
    function(err) {
      if (err) {
        console.error("Error updating invoice tx_type_id:", err.message);
      } else {
        console.log("Invoice tx_type_id updated to hvxhp0kctv6oc5z. Rows affected:", this.changes);
      }
    }
  );

  // 3. Update the transaction type of the transaction to hvxhp0kctv6oc5z (FV)
  db.run(
    "UPDATE transactions SET tx_type_id = 'hvxhp0kctv6oc5z' WHERE id = 'cymzvzu7se9yaw6' OR number = 'FV-00003734'",
    [],
    function(err) {
      if (err) {
        console.error("Error updating transaction tx_type_id:", err.message);
      } else {
        console.log("Transaction tx_type_id updated to hvxhp0kctv6oc5z. Rows affected:", this.changes);
      }
    }
  );
});
