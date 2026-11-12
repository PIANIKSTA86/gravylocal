const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT i.number, i.total, i.tx_id
  FROM ph_invoices i
  WHERE i.property_id = (SELECT id FROM ph_properties WHERE code = '1402')
`, (err, rows) => {
  console.log('1402 invoices in ph_invoices:');
  rows.forEach(r => {
    db.all("SELECT id, debit, credit, account_id FROM tx_lines WHERE tx_id = ?", [r.tx_id], (err, lines) => {
      console.log(r.number, 'tx_id:', r.tx_id, 'inv_total:', r.total, 'lines in tx:', lines);
    });
  });
});

