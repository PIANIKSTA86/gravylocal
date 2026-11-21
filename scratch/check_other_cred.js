const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

const otherCredits = db.prepare(`
  SELECT 
    t.number, t.date, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501' AND t.date <= ? AND tl.credit > 0 AND t.number NOT LIKE 'RC-%'
`).all(cutoffDate);
console.log('Other credits on 13459501 (not RC):', otherCredits);
