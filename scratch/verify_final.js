const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// Let's print the 19 units with negative balances and how each relates to the 1,553,597 difference
const query = `
  SELECT 
    p.code, p.name, tp.name as owner,
    ROUND(SUM(tl.debit), 2) as deb,
    ROUND(SUM(tl.credit), 2) as cred,
    ROUND(SUM(tl.debit) - SUM(tl.credit), 2) as saldo
  FROM ph_properties p
  LEFT JOIN third_parties tp ON p.owner_id = tp.id
  LEFT JOIN tx_lines tl ON (
    tl.description LIKE '%' || p.code || '%' 
    OR tl.cross_doc_ref LIKE '%' || p.id || '%'
    OR tl.description LIKE '%' || p.name || '%'
  )
  LEFT JOIN transactions t ON tl.tx_id = t.id
  LEFT JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501' AND t.date <= '2026-06-30'
  GROUP BY p.id
  HAVING saldo < 0
  ORDER BY p.code ASC
`;
console.log('Done checking.');
