const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Condición ER: t.date >= '2026-05-01' AND t.date <= '2026-05-31'
// Condición Cierre: t.date >= '2026-05-01 00:00:00' AND t.date < '2026-06-01 00:00:00'

const txER = db.prepare(`
  SELECT t.id, t.date, t.number, t.description,
         SUM(CASE WHEN a.code LIKE '4%' THEN l.credit - l.debit ELSE 0 END) as ing,
         SUM(CASE WHEN a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%' THEN l.debit - l.credit ELSE 0 END) as gas
  FROM transactions t
  JOIN tx_lines l ON l.tx_id = t.id
  JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active'
    AND t.date >= '2026-05-01' AND t.date <= '2026-05-31'
    AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '')
  GROUP BY t.id
`).all();

const txCierre = db.prepare(`
  SELECT t.id, t.date, t.number, t.description,
         SUM(CASE WHEN a.code LIKE '4%' THEN l.credit - l.debit ELSE 0 END) as ing,
         SUM(CASE WHEN a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%' THEN l.debit - l.credit ELSE 0 END) as gas
  FROM transactions t
  JOIN tx_lines l ON l.tx_id = t.id
  JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active'
    AND t.date >= '2026-05-01 00:00:00' AND t.date < '2026-06-01 00:00:00'
    AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '')
  GROUP BY t.id
`).all();

const erIds = new Set(txER.map(t => t.id));
const cierreIds = new Set(txCierre.map(t => t.id));

const onlyInER = txER.filter(t => !cierreIds.has(t.id));
const onlyInCierre = txCierre.filter(t => !erIds.has(t.id));

console.log('--- EN ER PERO NO EN CIERRE ---');
console.log(`Count: ${onlyInER.length}`);
onlyInER.forEach(t => console.log(`${t.date} | ${t.number} | Ing: ${t.ing} | Gas: ${t.gas} | Desc: ${t.description}`));

console.log('\n--- EN CIERRE PERO NO EN ER ---');
console.log(`Count: ${onlyInCierre.length}`);
onlyInCierre.forEach(t => console.log(`${t.date} | ${t.number} | Ing: ${t.ing} | Gas: ${t.gas} | Desc: ${t.description}`));
