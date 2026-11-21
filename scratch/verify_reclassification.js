const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Check unbalanced transactions
const unbalanced = db.prepare(`
  SELECT t.number, round(sum(tl.debit), 2) as d, round(sum(tl.credit), 2) as c 
  FROM tx_lines tl 
  JOIN transactions t ON t.id = tl.tx_id 
  GROUP BY tl.tx_id 
  HAVING round(sum(tl.debit), 2) != round(sum(tl.credit), 2)
`).all();
console.log('Comprobantes descuadrados tras reclasificación:', unbalanced.length);

// Check 134595 accounts
const accs = db.prepare(`
  SELECT a.code, a.name, count(tl.id) as lineas, sum(tl.debit) as deb, sum(tl.credit) as cred, sum(tl.debit - tl.credit) as saldo 
  FROM accounts a 
  LEFT JOIN tx_lines tl ON tl.account_id = a.id 
  WHERE a.code LIKE '134595%' 
  GROUP BY a.code
`).all();
console.log('Estado de cuentas 134595:');
console.table(accs);

// Check balances at 2026-06-30
const rowsCutoff = db.prepare(`
  SELECT a.code, a.name, 
         sum(tl.debit) as deb, 
         sum(tl.credit) as cred, 
         sum(tl.debit - tl.credit) as saldo
  FROM accounts a
  JOIN tx_lines tl ON tl.account_id = a.id
  JOIN transactions t ON t.id = tl.tx_id
  WHERE a.code LIKE '134595%' AND t.status = 'active' AND t.date <= '2026-06-30'
  GROUP BY a.code
`).all();
console.log('\nSaldos al 2026-06-30 por subcuenta:');
console.table(rowsCutoff);
const totalCutoff = rowsCutoff.reduce((s, r) => s + r.saldo, 0);
console.log('Total Grupo 134595 al 2026-06-30:', totalCutoff);
