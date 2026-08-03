const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

console.log("=== INSPECTING RC-00000571 AND RC-00000570 ===");
db.all(`
  SELECT t.*, tt.code as type_code, tt.prefix as type_prefix, tt.name as type_name
  FROM transactions t
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  WHERE t.number LIKE 'RC%' OR tt.code = 'RC'
  ORDER BY t.date DESC
  LIMIT 10
`, (err, rows) => {
  console.log(rows);
});
