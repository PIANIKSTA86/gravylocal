const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

const y = 2026;
const m = '07';
const startOfMonthStr = `${y}-${m}-01`;
const endOfMonthStr = `${y}-${m}-31 23:59:59`;

console.log(`Checking July 2026 transactions...`);

// Test RC metric: totalRecaudadoMes
const sqlRC = `
  SELECT 
    t.id,
    t.number,
    t.date,
    COALESCE(
      (SELECT SUM(l11.debit) FROM tx_lines l11 JOIN accounts a11 ON a11.id = l11.account_id WHERE l11.tx_id = t.id AND a11.code LIKE '11%'),
      (SELECT SUM(lall.debit) FROM tx_lines lall WHERE lall.tx_id = t.id AND lall.debit > 0)
    ) as monto_recaudado
  FROM transactions t
  JOIN transaction_types tt ON tt.id = t.tx_type_id
  WHERE t.status = 'active'
    AND t.date >= ? AND t.date <= ?
    AND (tt.code = 'RC' OR tt.code LIKE 'RC%')
`;

// Test CE metric: totalPagadoMes
const sqlCE = `
  SELECT 
    t.id,
    t.number,
    t.date,
    COALESCE(
      (SELECT SUM(l11.credit) FROM tx_lines l11 JOIN accounts a11 ON a11.id = l11.account_id WHERE l11.tx_id = t.id AND a11.code LIKE '11%'),
      (SELECT SUM(lall.credit) FROM tx_lines lall WHERE lall.tx_id = t.id AND lall.credit > 0)
    ) as monto_pagado
  FROM transactions t
  JOIN transaction_types tt ON tt.id = t.tx_type_id
  WHERE t.status = 'active'
    AND t.date >= ? AND t.date <= ?
    AND (tt.code = 'CE' OR tt.code LIKE 'CE%')
`;

db.all(sqlRC, [startOfMonthStr, endOfMonthStr], (err, rowsRC) => {
  console.log("Recaudos July 2026:", rowsRC);
  db.all(sqlCE, [startOfMonthStr, endOfMonthStr], (err, rowsCE) => {
    console.log("Egresos July 2026:", rowsCE);
  });
});
