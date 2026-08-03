const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

console.log("=== 1. CHECK TRANSACTION TYPES ===");
db.all("SELECT id, name, code, prefix FROM transaction_types", (err, rows) => {
  console.log("Transaction types:", rows);
});

console.log("=== 2. CHECK ALL TRANSACTIONS (Sample) ===");
db.all(`
  SELECT t.id, t.number, t.date, t.description, t.status, t.tx_type_id, tt.code as type_code, tt.name as type_name, tt.prefix
  FROM transactions t
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  ORDER BY t.date DESC
  LIMIT 30
`, (err, rows) => {
  console.log("Recent transactions:", rows);
});

console.log("=== 3. CHECK TRANSACTIONS WITH 'RC' or 'CE' IN NUMBER OR TYPE ===");
db.all(`
  SELECT t.id, t.number, t.date, t.description, t.status, t.tx_type_id, tt.code as type_code, tt.name as type_name
  FROM transactions t
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  WHERE t.number LIKE 'RC%' OR t.number LIKE 'CE%' OR t.number LIKE 'CG%' OR tt.code IN ('RC', 'CE') OR tt.code LIKE 'RC%' OR tt.code LIKE 'CE%'
  ORDER BY t.date DESC
  LIMIT 30
`, (err, rows) => {
  console.log("RC/CE transactions:", rows);
});
