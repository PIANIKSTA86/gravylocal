const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Revisar cómo están estructuradas las cuentas de clase 4 y 5
const cl4Accounts = db.prepare("SELECT id, code, name, level, parent_code FROM accounts WHERE code LIKE '4%' ORDER BY code LIMIT 15").all();
console.log('Cuentas clase 4 muestra:', cl4Accounts);

// ¿Existe la cuenta "4"?
const root4 = db.prepare("SELECT * FROM accounts WHERE code = '4'").all();
console.log('Cuenta raíz 4:', root4);

// ¿Quiénes son los padres de las cuentas 41, 4105, 410505, etc.?
const cl4Parents = db.prepare("SELECT DISTINCT parent_code FROM accounts WHERE code LIKE '4%'").all();
console.log('parent_code distintos en clase 4:', cl4Parents);

// Verifiquemos si las cuentas que tienen movimientos en tx_lines para clase 4 se conectan a un árbol o no:
const txCl4 = db.prepare(`
  SELECT a.code, a.name, a.parent_code, SUM(l.credit) as cr, SUM(l.debit) as db
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  WHERE a.code LIKE '4%'
  GROUP BY a.code
  LIMIT 5
`).all();
console.log('tx_lines clase 4 muestra:', txCl4);
