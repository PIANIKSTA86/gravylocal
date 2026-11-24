const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const accounts = db.prepare("SELECT id, code, name, level, parent_code FROM accounts ORDER BY code").all();
const accountById = new Map(accounts.map(a => [a.id, a]));
const accountByCode = new Map(accounts.map(a => [a.code, a]));

// Tomemos el año completo 2026 o el mes de enero 2026
const fDate = '2026-01-01';
const tDateLimit = '2026-10-31 23:59:59';

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
const rows = db.prepare(sql).all(fDate, fDate, tDateLimit, fDate, tDateLimit, tDateLimit);

// Suma directa de todas las cuentas cuyo código empiece por '6':
let directDebit6 = 0;
let directCredit6 = 0;
for (const r of rows) {
  const acc = accountById.get(r.accountId);
  if (acc && acc.code.startsWith('6')) {
    directDebit6 += Number(r.debitSum || 0);
    directCredit6 += Number(r.creditSum || 0);
  }
}
console.log('Suma directa de cuentas que empiezan por 6:');
console.log(`Débito: ${directDebit6.toLocaleString('es-CO')} | Crédito: ${directCredit6.toLocaleString('es-CO')} | Neto: ${(directDebit6 - directCredit6).toLocaleString('es-CO')}`);

// Ahora construyamos el árbol del Balance de Prueba tal como lo hace reportes.ts:
const nodeById = new Map(accounts.map(a => [a.id, {
  id: a.id, code: a.code, name: a.name, parent_code: a.parent_code, level: a.level,
  ownPrev: 0, ownDebit: 0, ownCredit: 0,
  prev: 0, debit: 0, credit: 0, current: 0, children: []
}]));

for (const r of rows) {
  const n = nodeById.get(r.accountId);
  if (!n) continue;
  n.ownPrev += Number(r.prevBalance || 0);
  n.ownDebit += Number(r.debitSum || 0);
  n.ownCredit += Number(r.creditSum || 0);
}

const nodeByCode = new Map();
nodeById.forEach(n => nodeByCode.set(n.code, n));

const roots = [];
nodeById.forEach(node => {
  const p = node.parent_code ? nodeByCode.get(node.parent_code) : null;
  if (p) p.children.push(node);
  else roots.push(node);
});

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

const root6 = nodeByCode.get('6');
console.log('\nValores en el nodo raíz 6 del Balance de Prueba:');
console.log(`Débito: ${root6.debit.toLocaleString('es-CO')} | Crédito: ${root6.credit.toLocaleString('es-CO')} | Neto: ${(root6.debit - root6.credit).toLocaleString('es-CO')}`);

console.log(`\n¡DIFERENCIA entre el nodo 6 y la suma real de clase 6!`);
console.log(`Diferencia Débito: ${(directDebit6 - root6.debit).toLocaleString('es-CO')}`);
console.log(`Diferencia Crédito: ${(directCredit6 - root6.credit).toLocaleString('es-CO')}`);

// Y en las raíces, ¿quiénes más están con 6?
const rootsStartingWith6 = roots.filter(r => r.code.startsWith('6'));
console.log('\nNodos raíces que empiezan por 6 (huérfanos que aparecen fuera de la cuenta 6):');
rootsStartingWith6.forEach(r => {
  console.log(`Código: ${r.code} | Nombre: ${r.name} | Débito: ${r.debit.toLocaleString('es-CO')} | Crédito: ${r.credit.toLocaleString('es-CO')}`);
});
