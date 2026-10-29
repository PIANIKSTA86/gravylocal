const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.resolve(__dirname, '..', 'pb_data', 'data.db'));

const startDate12 = '2025-11-01';
const endDate = '2026-10-31 23:59:59';
const bookCond = " AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '') ";

const sql = `
  SELECT
    strftime('%Y-%m', t.date) AS month,
    SUM(CASE WHEN a.code LIKE '4%' THEN (l.credit - l.debit) ELSE 0 END) AS revenue,
    SUM(CASE WHEN a.code LIKE '6%' OR a.code LIKE '7%' THEN (l.debit - l.credit) ELSE 0 END) AS costs,
    SUM(CASE WHEN a.code LIKE '5%' THEN (l.debit - l.credit) ELSE 0 END) AS expenses,
    SUM(CASE WHEN a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%' THEN (l.debit - l.credit) ELSE 0 END) AS expense
  FROM tx_lines l
  INNER JOIN accounts a ON a.id = l.account_id
  INNER JOIN transactions t ON t.id = l.tx_id
  WHERE t.status = 'active' AND t.date >= ? AND t.date <= ? ${bookCond}
  GROUP BY strftime('%Y-%m', t.date)
  ORDER BY month ASC
`;

const rows = db.prepare(sql).all(startDate12, endDate);
console.log('Result for last 12 months:');
console.table(rows);
