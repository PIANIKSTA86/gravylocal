const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const lines = db.prepare(`
  SELECT t.number, t.date, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501' AND t.date <= '2026-06-30'
    AND (tl.description LIKE '%1104%' OR tl.cross_doc_ref LIKE '%CF-202606-000007%')
  ORDER BY t.date ASC
`).all();
console.table(lines);
