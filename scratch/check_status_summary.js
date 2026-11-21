const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

console.log('=== STATUS OF ALL INVOICES OF A-302 (1302) ===');
const invs1302 = db.prepare(`SELECT number, period, total, status FROM ph_invoices WHERE property_id = 'fg8xppgqc75rb8k' ORDER BY period`).all();
console.table(invs1302);

console.log('=== STATUS OF ALL INVOICES OF C-403 (3403) ===');
const invs3403 = db.prepare(`SELECT number, period, total, status FROM ph_invoices WHERE property_id = '8o4wbhutgct7n4w' ORDER BY period`).all();
console.table(invs3403);
