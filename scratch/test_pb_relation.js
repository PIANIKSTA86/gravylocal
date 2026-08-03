const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db');

async function run() {
  // Query the admin credentials or just update SQLite directly to see if pocketbase client reads JSON array
  db.get("SELECT id, tx_id FROM payroll_periods WHERE id='cbl3bx0qwi6fxio'", (err, row) => {
    console.log('Before update in SQLite:', row);
  });

  // Let's set the tx_id column directly to a JSON array string and see if that's what SQLite stores
  db.run("UPDATE payroll_periods SET tx_id='[\"tx_1\", \"tx_2\"]' WHERE id='cbl3bx0qwi6fxio'", (err) => {
    if (err) console.error(err);
    
    db.get("SELECT id, tx_id FROM payroll_periods WHERE id='cbl3bx0qwi6fxio'", (err, row) => {
      console.log('After update in SQLite:', row);
      
      // Let's restore it back to empty
      db.run("UPDATE payroll_periods SET tx_id='' WHERE id='cbl3bx0qwi6fxio'", () => {
        db.close();
      });
    });
  });
}

run();
