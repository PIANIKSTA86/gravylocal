const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all("SELECT id, code, name FROM ph_properties WHERE code = '2703'", (err, p) => {
  const prop = p[0];
  db.all("SELECT id, number, total, tx_id FROM ph_invoices WHERE property_id = ?", [prop.id], (err, invs) => {
    let totInv = 0;
    invs.forEach(i => totInv += Number(i.total || 0));
    console.log('Unidad 2703 Invoices total:', totInv);

    db.all(`
      SELECT l.id, l.debit, l.credit, l.cross_doc_ref, l.description, t.number, a.code
      FROM tx_lines l
      JOIN transactions t ON t.id = l.tx_id
      JOIN accounts a ON a.id = l.account_id
      WHERE a.code = '13459501' AND (l.cross_doc_ref LIKE '%2703%' OR l.description LIKE '%2703%')
    `, (err, lines) => {
      let d = 0, c = 0;
      lines.forEach(l => {
        d += Number(l.debit || 0);
        c += Number(l.credit || 0);
        console.log(`  ${l.number} | D: ${l.debit} | C: ${l.credit} | ref: ${l.cross_doc_ref} | desc: ${l.description}`);
      });
      console.log(`Unidad 2703: Facturado=${totInv}, Debits=${d}, Credits=${c}, DifDeb=${totInv - d}`);
    });
  });
});

