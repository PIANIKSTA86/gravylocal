const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

const sql = `
  SELECT 
    t.id,
    t.number,
    SUBSTR(t.date, 1, 10) as date,
    tt.code as type_code,
    COALESCE(tp.name, 'Tercero') as third_name,
    t.description,
    SUM(CASE WHEN a.code LIKE '11%' THEN (CASE WHEN tt.code LIKE 'RC%' OR t.number LIKE 'RC%' THEN l.debit ELSE l.credit END) ELSE 0 END) as amount
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  LEFT JOIN third_parties tp ON tp.id = t.third_party_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active'
    AND (
      tt.code LIKE 'RC%' OR tt.code LIKE 'CE%' OR 
      t.number LIKE 'RC%' OR t.number LIKE 'CE%' OR
      t.number LIKE 'CG%' OR t.number LIKE 'EF%'
    )
  GROUP BY t.id
  HAVING amount > 0
  ORDER BY t.date DESC
  LIMIT 15
`;

db.all(sql, (err, rows) => {
  if (err) console.error(err);
  else console.log('Found transactions:', rows.length, rows);
  db.close();
});
