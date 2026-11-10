const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const lines = db.prepare(`
  SELECT tl.id, tl.account_id, tl.debit, tl.credit, tl.description, tl.cross_doc_ref, a.code as acct_code, a.name as acct_name 
  FROM tx_lines tl 
  LEFT JOIN accounts a ON tl.account_id = a.id 
  WHERE tl.tx_id = 'ory5sv2andpyl3d'
`).all();

console.log('Lines for ory5sv2andpyl3d:');
lines.forEach(l => console.log(`${l.acct_code} | ${l.acct_name} | D:${l.debit} | C:${l.credit} | Desc: ${l.description}`));
