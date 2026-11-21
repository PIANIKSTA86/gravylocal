const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Check the transactions for CF-202605 and CF-202606
const cfLines = db.prepare(`
  SELECT 
    t.number,
    t.date,
    a.code,
    a.name,
    tl.debit,
    tl.credit,
    tl.description
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE t.number LIKE 'CF-%' AND (t.number LIKE '%202605%' OR t.number LIKE '%202606%')
  LIMIT 20
`).all();
console.log('Sample CF lines 2026-05/06:', cfLines);

// Check debits on 13459501 by transaction type or description
const debitBreakdown = db.prepare(`
  SELECT 
    substr(t.number, 1, 9) as prefix,
    COUNT(*) as count,
    ROUND(SUM(tl.debit), 2) as debit
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501' AND t.date <= '2026-06-30'
  GROUP BY substr(t.number, 1, 9)
`).all();
console.log('Debit breakdown up to 2026-06-30:', debitBreakdown);
