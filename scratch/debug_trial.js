const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const fDate = '2026-01-01';
const toDateLimit = '2026-01-31 23:59:59';
const r = db.prepare(`
  SELECT a.code, a.name, SUM(l.debit) as db, SUM(l.credit) as cr
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active' AND a.code LIKE '4%' AND t.date >= ? AND t.date <= ?
  GROUP BY a.code
`).all(fDate, toDateLimit);
console.log('Clase 4 enero directo:', r);

// Veamos qué devolvió el endpoint de trial balance simulado:
const accounts = db.prepare("SELECT id, code, name, level, parent_code FROM accounts ORDER BY code").all();
const accountById = new Map(accounts.map(a => [a.id, a]));
const accountByCode = new Map(accounts.map(a => [a.code, a]));

let sql = `
  SELECT
    l.account_id AS accountId,
    SUM(CASE WHEN t.date < ? THEN l.debit - l.credit ELSE 0 END) AS prevBalance,
    SUM(CASE WHEN t.date >= ? AND t.date <= ? THEN l.debit ELSE 0 END) AS debitSum,
    SUM(CASE WHEN t.date >= ? AND t.date <= ? THEN l.credit ELSE 0 END) AS creditSum
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  WHERE t.status = 'active'
    AND t.date <= ?
    AND (t.book_type != 'local' OR t.book_type IS NULL OR t.book_type = '')
  GROUP BY l.account_id
`;
const rows = db.prepare(sql).all(fDate, fDate, toDateLimit, fDate, toDateLimit, toDateLimit);
console.log('Filas obtenidas en trial balance enero:', rows.length);
const cl4Rows = rows.filter(r => accountById.get(r.accountId)?.code.startsWith('4'));
console.log('Filas clase 4 obtenidas en trial balance enero:', cl4Rows.map(r => ({
  code: accountById.get(r.accountId)?.code,
  prev: r.prevBalance,
  debit: r.debitSum,
  credit: r.creditSum
})));
