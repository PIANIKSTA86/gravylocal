const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

console.log('=== Account 13459501 Total Movements ===');
const total1345 = db.prepare(`
  SELECT 
    MIN(t.date) as min_date,
    MAX(t.date) as max_date,
    COUNT(*) as count,
    ROUND(SUM(tl.debit), 2) as total_debit,
    ROUND(SUM(tl.credit), 2) as total_credit,
    ROUND(SUM(tl.debit) - SUM(tl.credit), 2) as net
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501'
`).get();
console.log('All txs 13459501:', total1345);

// Check grouped by year or date range
const byYear = db.prepare(`
  SELECT 
    substr(t.date, 1, 4) as yr,
    COUNT(*) as count,
    ROUND(SUM(tl.debit), 2) as debit,
    ROUND(SUM(tl.credit), 2) as credit,
    ROUND(SUM(tl.debit) - SUM(tl.credit), 2) as net
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501'
  GROUP BY yr
`).all();
console.log('By Year 13459501:', byYear);

// Check if any specific date range matches 87,945,248 and 33,678,707
// Image 1 shows:
// Mov. Debito: 87.945.248,00 | Mov. Credito: 33.678.707,00 | Saldo Actual: 54.266.541,00
// Saldo Anterior: 0.00
const matchCheck = db.prepare(`
  SELECT 
    t.date,
    SUM(tl.debit) as deb,
    SUM(tl.credit) as cred
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501'
  GROUP BY t.date
  ORDER BY t.date
`).all();
console.log('Daily count:', matchCheck.length);

// Let's check all accounts with balances
const acctBalances = db.prepare(`
  SELECT 
    a.code,
    a.name,
    ROUND(SUM(tl.debit), 2) as debit,
    ROUND(SUM(tl.credit), 2) as credit,
    ROUND(SUM(tl.debit) - SUM(tl.credit), 2) as balance
  FROM accounts a
  JOIN tx_lines tl ON tl.account_id = a.id
  GROUP BY a.id
  HAVING a.code LIKE '13%' OR a.code LIKE '28%' OR a.code LIKE '41%'
  ORDER BY a.code
`).all();
console.log('Relevant accounts:', acctBalances);
