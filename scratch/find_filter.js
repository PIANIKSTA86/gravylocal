const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Let's see what date filter produces Debito = 87945248 and Credito = 33678707 in 13459501
// Let's test combinations of start date and end date
const rows = db.prepare(`
  SELECT t.date, SUM(tl.debit) as deb, SUM(tl.credit) as cred
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501'
  GROUP BY t.date
  ORDER BY t.date
`).all();

let runningDeb = 0;
let runningCred = 0;
for (const r of rows) {
  runningDeb += r.deb;
  runningCred += r.cred;
}
console.log('Total deb:', runningDeb, 'cred:', runningCred);

// Let's find subsets of dates:
// Maybe only transactions from 2026-06-01 to 2026-11-20?
// Let's check 2026-06-01 to 2026-11-20:
const range1 = db.prepare(`
  SELECT 
    SUM(CASE WHEN t.date < '2026-06-01' THEN tl.debit - tl.credit ELSE 0 END) as saldo_ant,
    SUM(CASE WHEN t.date >= '2026-06-01' AND t.date <= '2026-11-20' THEN tl.debit ELSE 0 END) as mov_deb,
    SUM(CASE WHEN t.date >= '2026-06-01' AND t.date <= '2026-11-20' THEN tl.credit ELSE 0 END) as mov_cred
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501'
`).get();
console.log('Range 2026-06-01 to 2026-11-20:', range1);

// Let's search for exact deb = 87945248 and cred = 33678707 across all date ranges
for (let i = 0; i < rows.length; i++) {
  let d = 0;
  let c = 0;
  for (let j = i; j < rows.length; j++) {
    d += rows[j].deb;
    c += rows[j].cred;
    if (Math.round(d) === 87945248 || Math.round(c) === 33678707 || Math.round(d - c) === 54266541) {
      console.log(`Found candidate: from ${rows[i].date} to ${rows[j].date}: deb=${d}, cred=${c}, net=${d - c}`);
    }
  }
}
