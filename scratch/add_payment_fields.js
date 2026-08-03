const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);

db.get("SELECT fields FROM _collections WHERE name = 'invoices'", [], (err, row) => {
  if (err || !row) {
    console.error("Collection invoices not found:", err);
    db.close();
    return;
  }
  
  const fields = JSON.parse(row.fields);
  
  // Check if they are already added
  const hasForm = fields.some(f => f.name === 'payment_form');
  const hasDian = fields.some(f => f.name === 'payment_dian_code');
  
  if (!hasForm) {
    fields.push({
      id: "paymentform1",
      name: "payment_form",
      type: "text",
      system: false,
      required: false,
      presentable: false,
      help: "",
      hidden: false
    });
  }
  
  if (!hasDian) {
    fields.push({
      id: "paymentdiancode1",
      name: "payment_dian_code",
      type: "text",
      system: false,
      required: false,
      presentable: false,
      help: "",
      hidden: false
    });
  }
  
  if (!hasForm || !hasDian) {
    db.serialize(() => {
      // 1. Update the collections metadata
      db.run("UPDATE _collections SET fields = ? WHERE name = 'invoices'", [JSON.stringify(fields)], (updErr) => {
        if (updErr) {
          console.error("Error updating _collections table:", updErr);
          db.close();
          return;
        }
        console.log("SUCCESS: _collections schema metadata updated.");
        
        // 2. Physically add the SQLite columns (ignore error if they already exist in table)
        db.run("ALTER TABLE invoices ADD COLUMN payment_form TEXT", (alter1Err) => {
          if (alter1Err) {
            console.log("Column payment_form might already exist in table:", alter1Err.message);
          } else {
            console.log("SUCCESS: payment_form column physically added to table.");
          }
          
          db.run("ALTER TABLE invoices ADD COLUMN payment_dian_code TEXT", (alter2Err) => {
            if (alter2Err) {
              console.log("Column payment_dian_code might already exist in table:", alter2Err.message);
            } else {
              console.log("SUCCESS: payment_dian_code column physically added to table.");
            }
            db.close();
          });
        });
      });
    });
  } else {
    console.log("Fields payment_form and payment_dian_code already exist in the database!");
    db.close();
  }
});
