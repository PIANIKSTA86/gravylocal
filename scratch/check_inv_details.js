const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

console.log('=== CHECK INVOICES CF-202606-000112 AND CF-202607-000116 ===');
const invs = db.prepare(`SELECT * FROM ph_invoices WHERE number IN ('CF-202606-000112', 'CF-202607-000116', 'CF-202608-000116', 'CF-202609-000116', 'CF-202610-000116')`).all();
console.table(invs);
