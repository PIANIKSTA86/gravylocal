const { DatabaseSync } = require('node:sqlite');
const path = require('path');

try {
  const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);

  const sql = `
    SELECT
      l.account_id AS accountId,
      SUM(l.debit - l.credit) AS balance
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    WHERE t.status = 'active'
      AND t.date <= ?
      AND t.date >= ?
    GROUP BY l.account_id
  `;

  const rows = db.prepare(sql).all('2026-07-31', '2026-01-01');
  console.log("SQL executed successfully. Result row count:", rows.length);
} catch (e) {
  console.error("SQL Error:", e);
}
