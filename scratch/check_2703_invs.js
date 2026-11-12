const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT number, period, total, status, tx_id FROM ph_invoices WHERE property_id = (SELECT id FROM ph_properties WHERE code = '2703')
`, (err, rows) => console.log(rows));

