const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

const sqlMonthRC = `
  SELECT SUM(l.debit) as total_11
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN transaction_types tt ON tt.id = t.tx_type_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active'
    AND t.date >= '2026-07-01' AND t.date <= '2026-07-31 23:59:59'
    AND (tt.code = 'RC' OR tt.code LIKE 'RC%')
    AND a.code LIKE '11%'
`;

db.get(sqlMonthRC, (err, row) => {
  console.log("Fixed July 2026 Recaudos total:", row);
});
