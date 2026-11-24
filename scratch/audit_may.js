const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Analicemos Mayo 2026 (mes con 11 millones de discrepancia)
// ER (solo el mes):
// startDate: '2026-05-01 00:00:00' -> pero en report-balances hace:
// startDate = startDate.slice(0, 10) = '2026-05-01'
// endDate = '2026-05-31 23:59:59' -> pero en report-balances hace:
// endDate = endDate.slice(0, 10) = '2026-05-31'
// SQL en report-balances: t.date <= '2026-05-31' AND t.date >= '2026-05-01'

// Cierre de mes:
// period = '2026-05'
// startDate = '2026-05-01 00:00:00'
// endDate = '2026-06-01 00:00:00'
// SQL en API.getAccountSaldos: t.date >= '2026-05-01 00:00:00' AND t.date < '2026-06-01 00:00:00'

console.log('--- REVISIÓN DE MAYO 2026 ---');
const txMay = db.prepare(`
  SELECT t.id, t.date, t.number, t.description, t.status, t.book_type,
         SUM(CASE WHEN a.code LIKE '4%' THEN l.credit - l.debit ELSE 0 END) as ing,
         SUM(CASE WHEN a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%' THEN l.debit - l.credit ELSE 0 END) as gas
  FROM transactions t
  JOIN tx_lines l ON l.tx_id = t.id
  JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active'
    AND (t.date LIKE '2026-05%' OR t.date LIKE '2026-06-01%')
  GROUP BY t.id
  ORDER BY t.date
`).all();

console.log(`Total transacciones en Mayo 2026: ${txMay.length}`);

// Veamos transacciones con t.date = '2026-05-01'
const day01 = txMay.filter(t => t.date === '2026-05-01');
console.log('Transacciones del 2026-05-01:', day01);

// Veamos si hay transacciones en fechas distintas o con book_type
const bookTypes = db.prepare(`
  SELECT DISTINCT book_type, COUNT(*) as cnt
  FROM transactions
  WHERE date LIKE '2026-05%'
  GROUP BY book_type
`).all();
console.log('Book types en mayo:', bookTypes);

// Ahora comparemos exactamente qué líneas toma ER vs Cierre en Mayo
const sqlER = `
  SELECT 
    SUM(CASE WHEN a.code LIKE '4%' THEN l.credit - l.debit ELSE 0 END) as ing,
    SUM(CASE WHEN a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%' THEN l.debit - l.credit ELSE 0 END) as gas
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active'
    AND t.date >= '2026-05-01' AND t.date <= '2026-05-31'
    AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '')
`;
console.log('Resultado SQL ER mayo:', db.prepare(sqlER).get());

const sqlCierre = `
  SELECT 
    SUM(CASE WHEN a.code LIKE '4%' THEN l.credit - l.debit ELSE 0 END) as ing,
    SUM(CASE WHEN a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%' THEN l.debit - l.credit ELSE 0 END) as gas
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active'
    AND t.date >= '2026-05-01 00:00:00' AND t.date < '2026-06-01 00:00:00'
    AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '')
`;
console.log('Resultado SQL Cierre mayo:', db.prepare(sqlCierre).get());

// ¿Por qué en detailed_accounting_simulation.js dio:
// Cierre Ingresos: 570.734.171,37
// ER Ingresos:     503.458.377,75 ?
// ¡Una diferencia de 67 millones en ingresos!
// Veamos por qué en el script anterior dio diferente:
