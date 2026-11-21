const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// Total Invoices in DB up to 2026-06-30
const invTotal = db.prepare(`
  SELECT 
    COUNT(*) as count,
    ROUND(SUM(total), 2) as total_inv
  FROM ph_invoices
  WHERE status != 'voided' AND tx_id != '' AND date <= ?
`).get(cutoffDate);
console.log('Total ph_invoices up to 2026-06-30:', invTotal);

// Total debits and credits on 13459501
const tx1345Total = db.prepare(`
  SELECT 
    ROUND(SUM(tl.debit), 2) as deb,
    ROUND(SUM(tl.credit), 2) as cred,
    ROUND(SUM(tl.debit) - SUM(tl.credit), 2) as net
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501' AND t.date <= ?
`).get(cutoffDate);
console.log('Total tx_lines 13459501:', tx1345Total);

// Total credits on ALL accounts (where did payments go?)
const paymentsByAccount = db.prepare(`
  SELECT 
    a.code, a.name,
    ROUND(SUM(tl.debit), 2) as deb,
    ROUND(SUM(tl.credit), 2) as cred,
    ROUND(SUM(tl.credit) - SUM(tl.debit), 2) as net_payment
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE t.number LIKE 'RC-%' AND t.date <= ?
  GROUP BY a.id
  ORDER BY a.code
`).all(cutoffDate);
console.log('All lines in RC- receipts up to 2026-06-30:', paymentsByAccount);
