const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT i.number, i.total, l.debit, l.credit, l.description, l.cross_doc_ref
  FROM ph_invoices i
  LEFT JOIN tx_lines l ON l.tx_id = i.tx_id AND l.cross_doc_ref LIKE (i.number || '%')
  WHERE i.property_id = (SELECT id FROM ph_properties WHERE code = '11102')
`, (err, rows) => console.log(rows));

