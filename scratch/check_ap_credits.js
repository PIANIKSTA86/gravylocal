const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const ap = db.prepare(`
  SELECT 
    tl.debit, tl.credit, tl.cross_doc_ref, tl.description, t.number, t.date
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501' AND t.number LIKE 'AP-%' AND tl.credit > 0
`).all();
console.log('AP credits on 13459501:');
console.table(ap);
const sumAp = ap.reduce((s, l) => s + l.credit, 0);
console.log('Total AP credits:', sumAp);
