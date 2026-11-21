const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// 1. Get ledger by unit on account 13459501 up to 2026-06-30
const ledgerLines = db.prepare(`
  SELECT 
    tl.debit, tl.credit, tl.cross_doc_ref, tl.description,
    t.number as tx_num, t.date, tp.doc_number as nit, tp.name as third_name
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  LEFT JOIN third_parties tp ON tl.third_party_id = tp.id
  WHERE a.code = '13459501' AND t.date <= ?
`).all(cutoffDate);

// Total ledger 13459501
let deb134501 = 0, cred134501 = 0;
for (const l of ledgerLines) {
  deb134501 += l.debit;
  cred134501 += l.credit;
}
console.log('13459501 totals: deb=', deb134501, 'cred=', cred134501, 'net=', deb134501 - cred134501);

// 2. Check 13459502 (Intereses de mora) up to 2026-06-30
const moraLedger = db.prepare(`
  SELECT 
    ROUND(SUM(tl.debit), 2) as deb,
    ROUND(SUM(tl.credit), 2) as cred,
    ROUND(SUM(tl.debit) - SUM(tl.credit), 2) as net
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459502' AND t.date <= ?
`).get(cutoffDate);
console.log('13459502 (Mora) totals up to 2026-06-30:', moraLedger);

// Check if any other 1345 or 2805 accounts have balances at 2026-06-30
const allAccountsAtCutoff = db.prepare(`
  SELECT 
    a.code, a.name,
    ROUND(SUM(tl.debit), 2) as deb,
    ROUND(SUM(tl.credit), 2) as cred,
    ROUND(SUM(tl.debit) - SUM(tl.credit), 2) as net
  FROM accounts a
  JOIN tx_lines tl ON tl.account_id = a.id
  JOIN transactions t ON tl.tx_id = t.id
  WHERE (a.code LIKE '13%' OR a.code LIKE '28%')
    AND t.date <= ?
  GROUP BY a.id
  HAVING deb > 0 OR cred > 0
  ORDER BY a.code
`).all(cutoffDate);
console.log('All 13% and 28% accounts at 2026-06-30:', allAccountsAtCutoff);
