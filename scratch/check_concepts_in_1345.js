const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const refs = db.prepare(`
  SELECT 
    CASE 
      WHEN tl.cross_doc_ref LIKE '%-MORA%' THEN 'MORA'
      WHEN tl.cross_doc_ref LIKE '%-ADM%' THEN 'ADM'
      WHEN tl.cross_doc_ref LIKE '%-EXT%' THEN 'EXT'
      ELSE 'OTRO'
    END as concept_type,
    count(*) as count,
    sum(tl.debit) as debits,
    sum(tl.credit) as credits
  FROM tx_lines tl
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code LIKE '134595%'
  GROUP BY concept_type
`).all();
console.table(refs);
