import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

// Check 1605 (SI-202605-0005)
console.log('=== CASE 1605 (SI-202605-0005) ===');
const p1605 = db.prepare("SELECT id, code, name FROM ph_properties WHERE code LIKE '%1605%' OR name LIKE '%1605%'").all();
console.log(p1605);
if (p1605[0]) {
  const invs1605 = db.prepare("SELECT id, number, period, total, tx_id, status FROM ph_invoices WHERE property_id = ? ORDER BY date").all(p1605[0].id);
  console.table(invs1605);
  const tx1605 = db.prepare("SELECT t.number, tl.debit, tl.credit, tl.cross_doc_ref, tl.description FROM tx_lines tl JOIN transactions t ON t.id = tl.tx_id WHERE tl.cross_doc_ref LIKE '%SI-202605-0005%'").all();
  console.table(tx1605);
}

// Check 2801 (SI-202605-0030)
console.log('=== CASE 2801 (SI-202605-0030) ===');
const p2801 = db.prepare("SELECT id, code, name FROM ph_properties WHERE code LIKE '%2801%' OR name LIKE '%2801%'").all();
console.log(p2801);
if (p2801[0]) {
  const invs2801 = db.prepare("SELECT id, number, period, total, tx_id, status FROM ph_invoices WHERE property_id = ? ORDER BY date").all(p2801[0].id);
  console.table(invs2801);
  const tx2801 = db.prepare("SELECT t.number, tl.debit, tl.credit, tl.cross_doc_ref, tl.description FROM tx_lines tl JOIN transactions t ON t.id = tl.tx_id WHERE tl.cross_doc_ref LIKE '%SI-202605-0030%'").all();
  console.table(tx2801);
}

// Check 4504 (SI-202605-0064)
console.log('=== CASE 4504 (SI-202605-0064) ===');
const p4504 = db.prepare("SELECT id, code, name FROM ph_properties WHERE code LIKE '%4504%' OR name LIKE '%4504%'").all();
console.log(p4504);
if (p4504[0]) {
  const invs4504 = db.prepare("SELECT id, number, period, total, tx_id, status FROM ph_invoices WHERE property_id = ? ORDER BY date").all(p4504[0].id);
  console.table(invs4504);
  const tx4504 = db.prepare("SELECT t.number, tl.debit, tl.credit, tl.cross_doc_ref, tl.description FROM tx_lines tl JOIN transactions t ON t.id = tl.tx_id WHERE tl.cross_doc_ref LIKE '%SI-202605-0064%'").all();
  console.table(tx4504);
}
