const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Transacciones huérfanas en tx_lines
const orphanLinesAcc = db.prepare(`
  SELECT COUNT(*) as cnt FROM tx_lines l
  LEFT JOIN accounts a ON a.id = l.account_id
  WHERE a.id IS NULL
`).get();
console.log('Líneas sin cuenta válida:', orphanLinesAcc);

const orphanLinesTx = db.prepare(`
  SELECT COUNT(*) as cnt FROM tx_lines l
  LEFT JOIN transactions t ON t.id = l.tx_id
  WHERE t.id IS NULL
`).get();
console.log('Líneas sin transacción válida:', orphanLinesTx);

// Transacciones desbalanceadas (debit != credit en la misma tx)
const unbalTx = db.prepare(`
  SELECT t.id, t.number, t.date, SUM(l.debit) as deb, SUM(l.credit) as cred, ROUND(SUM(l.debit) - SUM(l.credit), 2) as diff
  FROM transactions t
  JOIN tx_lines l ON l.tx_id = t.id
  WHERE t.status = 'active'
  GROUP BY t.id
  HAVING ABS(SUM(l.debit) - SUM(l.credit)) > 0.05
`).all();
console.log('Transacciones desbalanceadas (débito != crédito):', unbalTx.length);
if (unbalTx.length > 0) {
  console.log('Muestra desbalanceadas:', unbalTx.slice(0, 5));
}
