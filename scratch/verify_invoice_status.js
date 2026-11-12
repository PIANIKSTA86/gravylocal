const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.get("SELECT id, number, status, is_electronic, dian_concept, notes FROM invoices WHERE id = 'yrytkbcv8aadv8r'", (err, row) => {
  console.log("invoices record:", row);
  db.close();
});

