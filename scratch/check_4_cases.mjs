import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const refs = ['SI-202605-0005-ADM', 'SI-202605-0026-ADM', 'SI-202605-0030-ADM', 'SI-202605-0064-ADM'];

for (const ref of refs) {
  console.log(`\n=== PAYMENTS FOR ${ref} ===`);
  const lines = db.prepare(`
    SELECT t.number, t.date, tl.debit, tl.credit, tl.description, tl.cross_doc_ref, tl.third_party_id
    FROM tx_lines tl
    JOIN transactions t ON t.id = tl.tx_id
    WHERE tl.cross_doc_ref = ?
  `).all(ref);
  console.table(lines);

  // Find corresponding invoice and real invoice for same property
  const invPhantom = db.prepare('SELECT id, number, property_id, total, tx_id FROM ph_invoices WHERE number = ?').get(ref.replace('-ADM', ''));
  if (invPhantom) {
    const prop = db.prepare('SELECT id, code, name FROM ph_properties WHERE id = ?').get(invPhantom.property_id);
    const realInvs = db.prepare('SELECT id, number, period, total, tx_id, status FROM ph_invoices WHERE property_id = ? ORDER BY date').all(invPhantom.property_id);
    console.log(`Property: ${prop.code} - ${prop.name}`);
    console.log('Real invoices:');
    console.table(realInvs);
  }
}
