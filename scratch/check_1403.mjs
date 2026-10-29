import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

console.log('=== CASE 1403 (SI-202605-0005) ===');
const invs1403 = db.prepare("SELECT id, number, period, total, tx_id, status FROM ph_invoices WHERE property_id = 'ow7jstv1xfnxf9p' ORDER BY date").all();
console.table(invs1403);
const tx1403 = db.prepare("SELECT t.number, tl.debit, tl.credit, tl.cross_doc_ref, tl.description FROM tx_lines tl JOIN transactions t ON t.id = tl.tx_id WHERE tl.cross_doc_ref LIKE '%SI-202605-0005%' OR tl.cross_doc_ref LIKE '%SI-202605-0101%'").all();
console.table(tx1403);
