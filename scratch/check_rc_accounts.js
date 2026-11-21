const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const rcMora = db.prepare(`
  SELECT 
    tl.account_id, a.code, a.name, count(*) as count, sum(tl.credit) as credit
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE tl.cross_doc_ref LIKE '%-MORA%'
  GROUP BY a.code
`).all();
console.log('RC- and other payments referencing MORA:');
console.table(rcMora);

const rcAdm = db.prepare(`
  SELECT 
    tl.account_id, a.code, a.name, count(*) as count, sum(tl.credit) as credit
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE tl.cross_doc_ref LIKE '%-ADM%'
  GROUP BY a.code
`).all();
console.log('RC- and other payments referencing ADM:');
console.table(rcAdm);
