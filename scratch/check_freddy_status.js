const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

console.log('=== STATUS OF 3904 (C-904) ===');
console.table(db.prepare("SELECT number, period, total, status FROM ph_invoices WHERE property_id = 'n0c5lcjy3fr62bo' ORDER BY period").all());

console.log('=== STATUS OF 4801 (D-801) ===');
console.table(db.prepare("SELECT number, period, total, status FROM ph_invoices WHERE property_id = '8my09bd7xa8ccaz' ORDER BY period").all());
