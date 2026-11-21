const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

console.log('=== FREDDY JAVIER GARCIA GALVIS INVOICES ===');
const invsFreddy = db.prepare(`
  SELECT phi.number, phi.period, phi.total, phi.status, p.code as prop_code, p.name as prop_name
  FROM ph_invoices phi
  JOIN ph_properties p ON p.id = phi.property_id
  WHERE p.code IN ('3904', '4801')
  ORDER BY phi.period ASC, p.code ASC
`).all();
console.table(invsFreddy);

console.log('=== FREDDY JAVIER GARCIA GALVIS RECAUDOS ===');
const rcsFreddy = db.prepare(`
  SELECT t.number, t.date, t.description, t.teso_params
  FROM transactions t
  WHERE t.description LIKE '%FREDDY%' OR t.teso_params LIKE '%16213116%' OR t.teso_params LIKE '%4sbg0gsvn0vvjbe%'
  ORDER BY t.date ASC
`).all();
console.table(rcsFreddy);

db.close();
