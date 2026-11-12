const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT l.id, l.debit, l.credit, l.cross_doc_ref, l.description, t.number as tx_num
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
    AND l.description LIKE 'Cruce / Aplicación Nota Crédito%'
`, (err, rows) => {
  let tot = 0;
  console.log(`Cruces de Nota Crédito / Saldo a Favor en 13459501 (${rows.length}):`);
  rows.forEach(r => {
    tot += Number(r.debit || 0);
    console.log(`  ${r.tx_num} | D: ${r.debit} | ref: ${r.cross_doc_ref} | desc: ${r.description}`);
  });
  console.log(`TOTAL DEBITS EN CRUCES: $${tot}`);
});

