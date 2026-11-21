const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Let's inspect all transactions on 13459501 between 2026-05-31 and 2026-06-30
// Since we found earlier:
// from 2026-05-31 to 2026-06-30: deb=87945248, cred=33678707, net=54266541
console.log('--- Account 13459501 from 2026-05-31 to 2026-06-30 ---');
const q1 = db.prepare(`
  SELECT 
    COUNT(*) as line_count,
    ROUND(SUM(tl.debit), 2) as deb,
    ROUND(SUM(tl.credit), 2) as cred,
    ROUND(SUM(tl.debit) - SUM(tl.credit), 2) as saldo
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501'
    AND t.date >= '2026-05-31'
    AND t.date <= '2026-06-30'
`).get();
console.log('Result for 2026-05-31 to 2026-06-30:', q1);

// Now let's see what is the date of the transactions in the DB!
const dates = db.prepare(`
  SELECT DISTINCT t.date
  FROM transactions t
  ORDER BY t.date
`).all();
console.log('Dates present in DB:', dates.map(d => d.date));
