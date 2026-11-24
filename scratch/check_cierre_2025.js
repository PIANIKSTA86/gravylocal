const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Buscar transacciones de cierre en 2025 o 2026
const cierreTx = db.prepare(`
  SELECT t.id, t.date, t.number, t.description, tt.name as type_name, tt.prefix
  FROM transactions t
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  WHERE t.description LIKE '%cierre%' 
     OR t.description LIKE '%cancelacion%' 
     OR tt.prefix = 'CM'
     OR tt.name LIKE '%cierre%'
`).all();
console.log('Transacciones de cierre encontradas:', cierreTx);

// Revisar saldos de cuentas de resultado (4, 5, 6, 7) al 2025-12-31:
const saldos2025 = db.prepare(`
  SELECT SUBSTR(a.code, 1, 1) as clase,
         SUM(l.debit) as total_deb,
         SUM(l.credit) as total_cred,
         SUM(l.debit - l.credit) as saldo_neto
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active'
    AND t.date <= '2025-12-31'
  GROUP BY SUBSTR(a.code, 1, 1)
`).all();
console.log('\nSaldos al 2025-12-31 por clase:', saldos2025);

// Revisar saldo en cuenta 36 (Resultado del Ejercicio):
const cuenta36 = db.prepare(`
  SELECT a.code, a.name,
         SUM(l.debit) as deb,
         SUM(l.credit) as cred,
         SUM(l.credit - l.debit) as saldo
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active'
    AND a.code LIKE '36%'
  GROUP BY a.code
`).all();
console.log('\nCuenta 36 (Resultado del ejercicio/anteriores):', cuenta36);
