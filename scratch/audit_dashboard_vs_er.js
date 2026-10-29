const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.resolve(__dirname, '..', 'pb_data', 'data.db'));

console.log('=== 1. DESGLOSE MENSUAL POR CLASE (4, 5, 6, 7) ===');
const q1 = db.prepare(`
  SELECT 
    strftime('%Y-%m', t.date) AS month,
    SUM(CASE WHEN a.code LIKE '4%' THEN (l.credit - l.debit) ELSE 0 END) AS ventas_ingresos_4,
    SUM(CASE WHEN a.code LIKE '6%' THEN (l.debit - l.credit) ELSE 0 END) AS costos_venta_6,
    SUM(CASE WHEN a.code LIKE '7%' THEN (l.debit - l.credit) ELSE 0 END) AS costos_prod_7,
    SUM(CASE WHEN a.code LIKE '5%' THEN (l.debit - l.credit) ELSE 0 END) AS gastos_oper_5,
    SUM(CASE WHEN a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%' THEN (l.debit - l.credit) ELSE 0 END) AS total_gastos_y_costos_5_6_7
  FROM tx_lines l
  INNER JOIN accounts a ON a.id = l.account_id
  INNER JOIN transactions t ON t.id = l.tx_id
  WHERE t.status = 'active'
  GROUP BY strftime('%Y-%m', t.date)
  ORDER BY month DESC
  LIMIT 12
`).all();
console.table(q1);

console.log('=== 2. IMPACTO DEL FILTRO BOOK_TYPE (NIIF vs LOCAL vs ALL) ===');
const q2 = db.prepare(`
  SELECT 
    strftime('%Y-%m', t.date) AS month,
    COALESCE(t.book_type, 'NULL/EMPTY') as book,
    COUNT(DISTINCT t.id) as tx_count,
    SUM(CASE WHEN a.code LIKE '4%' THEN (l.credit - l.debit) ELSE 0 END) AS rev_4,
    SUM(CASE WHEN a.code LIKE '6%' THEN (l.debit - l.credit) ELSE 0 END) AS cost_6,
    SUM(CASE WHEN a.code LIKE '5%' THEN (l.debit - l.credit) ELSE 0 END) AS exp_5
  FROM tx_lines l
  INNER JOIN accounts a ON a.id = l.account_id
  INNER JOIN transactions t ON t.id = l.tx_id
  WHERE t.status = 'active'
  GROUP BY strftime('%Y-%m', t.date), t.book_type
  ORDER BY month DESC
  LIMIT 20
`).all();
console.table(q2);

console.log('=== 3. IMPACTO DE FECHAS / MESES EN DASHBOARD SUMMARY ===');
const now = new Date();
const months12 = [];
for (let i = 11; i >= 0; i--) {
  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
  months12.push(d.toISOString().slice(0, 7));
}
console.log('=== 4. COMPARATIVA YTD (AÑO A LA FECHA) VS MENSUAL ESTRICTO ===');
const ytdSep = db.prepare(`
  SELECT 
    '2026-01-01 a 2026-09-30 (YTD)' AS periodo,
    SUM(CASE WHEN a.code LIKE '4%' THEN (l.credit - l.debit) ELSE 0 END) AS ventas,
    SUM(CASE WHEN a.code LIKE '6%' THEN (l.debit - l.credit) ELSE 0 END) AS costos_venta_6,
    SUM(CASE WHEN a.code LIKE '5%' THEN (l.debit - l.credit) ELSE 0 END) AS gastos_oper_5,
    SUM(CASE WHEN a.code LIKE '5%' OR a.code LIKE '6%' OR a.code LIKE '7%' THEN (l.debit - l.credit) ELSE 0 END) AS total_gastos_y_costos
  FROM tx_lines l
  INNER JOIN accounts a ON a.id = l.account_id
  INNER JOIN transactions t ON t.id = l.tx_id
  WHERE t.status = 'active' AND t.date >= '2026-01-01 00:00:00' AND t.date <= '2026-09-30 23:59:59'
`).all();
console.table(ytdSep);

console.log('=== 5. INVESTIGAR DISCREPANCIA DE 7.1M EN SEPTIEMBRE ===');
const diff = db.prepare(`
  SELECT t.id, t.number, t.date, a.code, l.debit, l.credit, (l.debit - l.credit) as bal
  FROM tx_lines l
  INNER JOIN accounts a ON a.id = l.account_id
  INNER JOIN transactions t ON t.id = l.tx_id
  WHERE t.status = 'active'
    AND a.code LIKE '5%'
    AND strftime('%Y-%m', t.date) = '2026-09'
    AND NOT (t.date >= '2026-09-01 00:00:00' AND t.date <= '2026-09-30 23:59:59')
`).all();
console.log('Diff rows count:', diff.length, diff);

const datesSample = db.prepare(`
  SELECT DISTINCT date FROM transactions WHERE date LIKE '2026-09%' ORDER BY date DESC LIMIT 10
`).all();
console.log('Sample dates:', datesSample);


