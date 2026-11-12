const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const tp = db.prepare("SELECT * FROM third_parties WHERE name LIKE '%CARRILLO%'").get();

const lines = db.prepare(`
  SELECT t.id, t.number, t.date, a.code as account_code, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  LEFT JOIN accounts a ON tl.account_id = a.id
  WHERE tl.third_party_id = ? AND a.code LIKE '134595%'
  ORDER BY t.date, t.number
`).all(tp.id);

console.log('Lines in 134595 for Carrillo:');
let sumD = 0, sumC = 0;
for (const l of lines) {
  sumD += l.debit;
  sumC += l.credit;
  console.log(`[${l.number}] Date: ${l.date} | D:$${l.debit} | C:$${l.credit} | Ref: ${l.cross_doc_ref}`);
}
console.log(`TOTAL DB: Débitos=$${sumD} | Créditos=$${sumC} | Saldo=$${sumD - sumC}`);
