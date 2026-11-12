const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT id, number, property_id, total, status, tx_id FROM ph_invoices WHERE number LIKE 'SI%' LIMIT 5
`, (err, rows) => {
  if (err) console.error(err);
  else console.log('SI invoices in ph_invoices:', rows);
});

