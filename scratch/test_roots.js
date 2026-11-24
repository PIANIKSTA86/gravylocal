const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const accounts = db.prepare("SELECT id, code, name, level, parent_code FROM accounts ORDER BY code").all();
const accountById = new Map(accounts.map(a => [a.id, a]));
const accountByCode = new Map(accounts.map(a => [a.code, a]));

const fDate = '2026-01-01';
const toDateLimit = '2026-01-31 23:59:59';
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

const nodeById = new Map(accounts.map(a => [a.id, {
  id: a.id, code: a.code, name: a.name, parent_code: a.parent_code,
  ownPrev: 0, ownDebit: 0, ownCredit: 0,
  prev: 0, debit: 0, credit: 0, current: 0, children: []
}]));

for (const r of rows) {
  const node = nodeById.get(r.accountId);
  if (!node) continue;
  node.ownPrev += Number(r.prevBalance || 0);
  node.ownDebit += Number(r.debitSum || 0);
  node.ownCredit += Number(r.creditSum || 0);
}

// Conectar padres e hijos usando code
const nodeByCode = new Map();
nodeById.forEach(n => nodeByCode.set(n.code, n));

const roots = [];
nodeById.forEach(node => {
  const p = node.parent_code ? nodeByCode.get(node.parent_code) : null;
  if (p) p.children.push(node);
  else roots.push(node);
});

console.log('Roots encontradas:', roots.map(r => r.code));

function rollup(n) {
  let prev = n.ownPrev;
  let debit = n.ownDebit;
  let credit = n.ownCredit;
  for (const c of n.children) {
    const sc = rollup(c);
    prev += sc.prev;
    debit += sc.debit;
    credit += sc.credit;
  }
  n.prev = prev;
  n.debit = debit;
  n.credit = credit;
  n.current = prev + debit - credit;
  return { prev, debit, credit, current: n.current };
}

roots.forEach(r => rollup(r));

for (const r of roots) {
  console.log(`Clase ${r.code} (${r.name}): Prev=${r.prev}, Debit=${r.debit}, Credit=${r.credit}, Current=${r.current}`);
}
