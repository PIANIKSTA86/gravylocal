const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const asOfDate = '2026-08-05';
const isRecaudo = true;
const accountPrefixes = isRecaudo ? ['13'] : ['22', '23', '25'];
const filterClause = accountPrefixes.map(p => `a.code LIKE '${p}%'`).join(' OR ');

const sqlAging = `
  SELECT
    l.account_id,
    a.code AS account_code,
    a.maneja_cruce AS account_maneja_cruce,
    COALESCE(l.third_party_id, t.third_party_id, 'NO_TERCERO') AS third_party_id,
    l.cross_doc_ref,
    l.debit,
    l.credit
  FROM tx_lines l
  INNER JOIN accounts a ON a.id = l.account_id
  INNER JOIN transactions t ON t.id = l.tx_id
  WHERE t.status = 'active'
    AND t.date <= ?
    AND (${filterClause})
`;

db.all(sqlAging, [asOfDate + " 23:59:59"], (err, rows) => {
  if (err) {
    console.error('Aging Query Error:', err.message);
  } else {
    console.log('Aging Query Succeeded. Row count:', rows.length);
  }

  // Test SQL Month
  const startDate = '2026-08-01';
  const endDate = '2026-08-31';
  const sqlMonth = `
    SELECT 
      SUM(l.debit) as total_11
    FROM tx_lines l
    INNER JOIN transactions t ON t.id = l.tx_id
    LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
    INNER JOIN accounts a ON a.id = l.account_id
    WHERE t.status = 'active'
      AND t.date >= ? AND t.date <= ?
      AND (tt.code = 'RC' OR tt.code LIKE 'RC%' OR t.number LIKE 'RC%')
      AND a.code LIKE '11%'
  `;

  db.get(sqlMonth, [startDate, endDate + " 23:59:59"], (err2, row) => {
    if (err2) {
      console.error('Month Query Error:', err2.message);
    } else {
      console.log('Month Query Succeeded:', row);
    }
    db.close();
  });
});
