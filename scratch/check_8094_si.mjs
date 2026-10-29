import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

console.log('=== COUNT OF PH_INVOICES BY PERIOD ===');
const counts = db.prepare('SELECT period, count(*) as count, sum(total) as total FROM ph_invoices GROUP BY period').all();
console.table(counts);

console.log('\n=== SI INVOICES (2026-05) ===');
const siInvs = db.prepare("SELECT id, number, period, total, property_id, tx_id, status FROM ph_invoices WHERE period = '2026-05' ORDER BY number").all();
console.log(`Total 2026-05 invoices: ${siInvs.length}`);
console.table(siInvs.slice(0, 10));

// Check if there are duplicates by property_id in 2026-05
const dupes = db.prepare(`
  SELECT property_id, count(*) as c, group_concat(number) as numbers, group_concat(tx_id) as txs
  FROM ph_invoices
  WHERE period = '2026-05'
  GROUP BY property_id
  HAVING count(*) > 1
`).all();
console.log(`Properties with duplicate 2026-05 invoices: ${dupes.length}`);
console.table(dupes);

// Let's also check for all properties how many total properties exist
const totalProps = db.prepare('SELECT count(*) as count FROM ph_properties').all();
console.log('Total properties:', totalProps);
