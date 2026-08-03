const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

const fromVal = '2026-07-01';
const toVal = '2026-07-31 23:59:59';

console.log(`Checking July 2026 transactions for RC...`);

const sqlRC = `
  SELECT t.id, t.number, t.date, tt.code, tt.prefix
  FROM transactions t
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  WHERE (tt.code = 'RC' OR tt.code LIKE 'RC%' OR tt.prefix LIKE 'RC%' OR t.number LIKE 'RC%')
    AND t.status = 'active'
    AND t.date >= ? AND t.date <= ?
  ORDER BY t.date DESC
`;

db.all(sqlRC, [fromVal, toVal], (err, rows) => {
  console.log("July 2026 RC transactions:", rows);
});

console.log(`Checking June 2026 transactions for RC...`);
db.all(sqlRC, ['2026-06-01', '2026-06-30 23:59:59'], (err, rows) => {
  console.log("June 2026 RC count:", rows ? rows.length : 0);
  if (rows && rows.length) {
    console.log("June RC sample:", rows.slice(0, 5));
  }
});
