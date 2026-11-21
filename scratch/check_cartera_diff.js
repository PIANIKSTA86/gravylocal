const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

console.log('=== 1. ALL ACCOUNTS LIKE 13% ===');
const accs13 = db.prepare("SELECT id, code, name, nature FROM accounts WHERE code LIKE '13%' ORDER BY code").all();
console.table(accs13);

console.log('\n=== 2. BALANCES FOR ALL 13% ACCOUNTS ===');
const balances13 = db.prepare(`
  SELECT a.code, a.name, 
         COALESCE(SUM(tl.debit), 0) as total_debit, 
         COALESCE(SUM(tl.credit), 0) as total_credit,
         COALESCE(SUM(tl.debit - tl.credit), 0) as balance
  FROM accounts a
  LEFT JOIN tx_lines tl ON tl.account_id = a.id
  LEFT JOIN transactions t ON t.id = tl.tx_id AND t.status = 'active'
  WHERE a.code LIKE '13%'
  GROUP BY a.id
  HAVING total_debit > 0 OR total_credit > 0
  ORDER BY a.code
`).all();
console.table(balances13);

console.log('\n=== 3. BALANCES FOR 28% (ANTICIPOS) ACCOUNTS ===');
const balances28 = db.prepare(`
  SELECT a.code, a.name, 
         COALESCE(SUM(tl.debit), 0) as total_debit, 
         COALESCE(SUM(tl.credit), 0) as total_credit,
         COALESCE(SUM(tl.credit - tl.debit), 0) as balance
  FROM accounts a
  LEFT JOIN tx_lines tl ON tl.account_id = a.id
  LEFT JOIN transactions t ON t.id = tl.tx_id AND t.status = 'active'
  WHERE a.code LIKE '28%'
  GROUP BY a.id
  HAVING total_debit > 0 OR total_credit > 0
  ORDER BY a.code
`).all();
console.table(balances28);

db.close();
