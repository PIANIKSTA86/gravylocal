const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

console.log("=== ALL TRANSACTIONS MATCHING RC OR CE IN 2026 ===");
const sql = `
  SELECT 
    t.id, t.number, t.date, t.description, t.status, 
    tt.code as type_code, tt.prefix as type_prefix, tt.name as type_name
  FROM transactions t
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  WHERE (
    tt.code = 'RC' OR tt.code LIKE 'RC%' OR t.number LIKE 'RC%' OR
    tt.code = 'CE' OR tt.code LIKE 'CE%' OR t.number LIKE 'CE%' OR t.number LIKE 'CG%' OR t.number LIKE 'EF%'
  ) AND t.status = 'active'
  ORDER BY t.date DESC
  LIMIT 50
`;

db.all(sql, (err, rows) => {
  console.log(`Found ${rows.length} transactions:`);
  console.log(rows);
});
