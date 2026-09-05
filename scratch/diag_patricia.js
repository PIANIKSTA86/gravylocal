const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT l.id as line_id, l.cross_doc_ref, l.debit, l.credit, t.id as tx_id, t.cross_type, t.cross_number, t.description
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  WHERE l.third_party_id = '02fxo9q5w0l70g5'
`, (err, rows) => {
  console.log('Patricia Moreno lines:', rows);

  db.all(`
    SELECT number, property_id FROM ph_invoices LIMIT 5
  `, (err2, invs) => {
    console.log('Sample ph_invoices:', invs);
    db.close();
  });
});
