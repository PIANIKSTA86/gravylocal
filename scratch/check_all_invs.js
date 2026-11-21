const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

console.log('=== ALL INVOICES FOR A-302 AND C-403 ===');
const invs = db.prepare(`
  SELECT phi.id, phi.number, phi.date, phi.period, phi.total, phi.status, phi.property_id, p.code as prop_code, p.name as prop_name, phi.tx_id
  FROM ph_invoices phi
  JOIN ph_properties p ON p.id = phi.property_id
  WHERE p.code IN ('1302', '3403')
  ORDER BY phi.period ASC, p.code ASC
`).all();
console.table(invs);
