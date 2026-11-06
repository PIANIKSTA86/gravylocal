const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const c13 = db.prepare(`
  SELECT SUM(l.debit) as deb, SUM(l.credit) as crd, SUM(l.debit - l.credit) as bal
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).get();
console.log('Account 13459501 (Libro Auxiliar):', c13);

const invs = db.prepare(`
  SELECT count(*) as count, SUM(total) as tot FROM ph_invoices WHERE status != 'voided' AND tx_id != ''
`).get();
console.log('ph_invoices total:', invs);

const lines = db.prepare(`
  SELECT count(*) as count, SUM(amount) as tot FROM ph_invoice_lines
`).get();
console.log('ph_invoice_lines total:', lines);

