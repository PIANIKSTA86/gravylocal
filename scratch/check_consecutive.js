const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);

db.serialize(() => {
  db.get("SELECT consecutive FROM transaction_types WHERE id = 'hvxhp0kctv6oc5z'", [], (err, ttRow) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Current TT consecutive:", ttRow.consecutive);
    
    db.get("SELECT current_number FROM dian_resolutions WHERE id = 'j4gouc1z09930h8'", [], (err, resRow) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Current Res current_number:", resRow.current_number);
      
      if (ttRow.consecutive !== resRow.current_number) {
        db.run("UPDATE transaction_types SET consecutive = ? WHERE id = 'hvxhp0kctv6oc5z'", [resRow.current_number], function(err) {
          if (err) {
            console.error("Error updating consecutive:", err.message);
          } else {
            console.log("Updated TT consecutive to match resolution. Rows affected:", this.changes);
          }
        });
      }
    });
  });
});
