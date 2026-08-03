const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening DB:", err);
    process.exit(1);
  }
});

db.all(`
  SELECT t.id, t.number, tt.code
  FROM transactions t
  JOIN transaction_types tt ON t.tx_type_id = tt.id
  WHERE tt.code = 'POS'
  LIMIT 5
`, [], (err, rows) => {
  if (err) {
    console.error("Query error:", err);
    return;
  }
  console.log("=== POS TRANSACTIONS ===");
  console.log(JSON.stringify(rows, null, 2));
});
