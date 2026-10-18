const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const imp = db.prepare("SELECT id, number FROM imports WHERE number LIKE '%93%'").get();
console.log('Imp:', imp);

const lines = db.prepare(`
  SELECT tl.id, tl.tx_id, tl.account_id, a.code as acc_code, tl.debit, tl.credit, 
         tl.import_concept, tl.import_invoice_ref, t.number as tx_num, t.status as tx_status, t.description as tx_desc
  FROM tx_lines tl
  LEFT JOIN transactions t ON tl.tx_id = t.id
  LEFT JOIN accounts a ON tl.account_id = a.id
  WHERE tl.import_id = ?
`).all(imp.id);

console.log('Lines count:', lines.length);
lines.forEach(l => {
  console.log(`${l.tx_num} [${l.tx_status}] concept=${l.import_concept} acc=${l.acc_code} deb=${l.debit} cred=${l.credit} ref=${l.import_invoice_ref}`);
});
