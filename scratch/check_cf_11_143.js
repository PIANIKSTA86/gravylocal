const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

db.all(`
  SELECT phi.number, phi.property_id, p.code as prop_code, p.name as prop_name
  FROM ph_invoices phi
  JOIN ph_properties p ON p.id = phi.property_id
  WHERE phi.number = 'CF-202611-000143'
`, (err, rows) => {
  console.log('Invoice CF-202611-000143 belongs to:', rows);
});

