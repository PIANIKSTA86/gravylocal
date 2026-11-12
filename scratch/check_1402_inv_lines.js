const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all("SELECT id, number FROM ph_invoices WHERE property_id = (SELECT id FROM ph_properties WHERE code = '1402')", (err, invs) => {
  const invNums = invs.map(i => i.number);
  console.log('Invoices of 1402:', invNums);

  db.all(`
    SELECT l.id, l.debit, l.credit, l.cross_doc_ref, t.number
    FROM tx_lines l
    JOIN transactions t ON t.id = l.tx_id
    WHERE l.account_id = (SELECT id FROM accounts WHERE code = '13459501')
      AND t.number IN ('${invNums.join("','")}')
  `, (err, rows) => {
    console.log('Tx lines for these invoices:');
    rows.forEach(r => console.log(r));
  });
});

