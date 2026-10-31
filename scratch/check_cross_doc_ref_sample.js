const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

const sample = db.prepare(`
  SELECT l.cross_doc_ref, count(l.id) as c, sum(l.credit) as total_credit
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active' AND l.credit > 0 AND l.cross_doc_ref NOT LIKE 'ANT%'
  GROUP BY l.cross_doc_ref
  LIMIT 25
`).all();
console.table(sample);
