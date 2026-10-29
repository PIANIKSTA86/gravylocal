const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

const startDate = '2026-09-01';
const endDate = '2026-09-30 23:59:59';

const sql = `
  SELECT 
    t.id,
    t.number,
    SUBSTR(t.date, 1, 10) as date,
    CASE 
      WHEN (tt.code LIKE 'RC%' OR t.number LIKE 'RC%') THEN 'RC' 
      ELSE 'CE' 
    END as type,
    COALESCE(tp.name, 'Tercero') as third_name,
    COALESCE(t.description, '') as description,
    ROUND(SUM(CASE WHEN a.code LIKE '11%' THEN (CASE WHEN tt.code LIKE 'RC%' OR t.number LIKE 'RC%' THEN l.debit ELSE l.credit END) ELSE 0 END), 2) as amount
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  LEFT JOIN third_parties tp ON tp.id = t.third_party_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active'
    AND t.date >= ? AND t.date <= ?
    AND (
      tt.code LIKE 'RC%' OR tt.code LIKE 'CE%' OR 
      t.number LIKE 'RC%' OR t.number LIKE 'CE%' OR
      t.number LIKE 'CG%' OR t.number LIKE 'EF%'
    )
  GROUP BY t.id
  HAVING amount > 0
  ORDER BY t.date ASC
`;

db.all(sql, [startDate, endDate], (err, rows) => {
  if (err) console.error(err);
  else {
    let rcTotal = 0;
    let ceTotal = 0;
    rows.forEach(r => {
      if (r.type === 'RC') rcTotal += r.amount;
      else ceTotal += r.amount;
    });
    console.log(`October 2026: ${rows.length} transactions`);
    console.log(`Total RC (Recaudos): $ ${rcTotal.toLocaleString('es-CO')}`);
    console.log(`Total CE (Egresos): $ ${ceTotal.toLocaleString('es-CO')}`);
    console.log('Sample rows:', rows.slice(0, 5));
  }
  db.close();
});
