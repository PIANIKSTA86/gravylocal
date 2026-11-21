const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const thirdPartyId = 's2al2xdlkno843k';
const propId = 'fg8xppgqc75rb8k'; // A-302

console.log('=== TEST ALLOWED REFS FOR A-302 ===');
const invoicesA302 = db.prepare("SELECT number FROM ph_invoices WHERE property_id = ? AND status != 'voided'").all(propId);
console.log('Invoices of A-302:', invoicesA302.map(i => i.number));

const allowedRefs = {};
for (const inv of invoicesA302) allowedRefs[inv.number] = true;

console.log('=== TEST ALL TX_LINES FOR THIS THIRD ===');
const lines = db.prepare(`
  SELECT tl.id, tl.account_id, a.code, tl.debit, tl.credit, tl.cross_doc_ref, t.date, t.number as tx_num
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  JOIN accounts a ON a.id = tl.account_id
  WHERE tl.third_party_id = ? AND t.status != 'voided'
  ORDER BY t.date ASC
`).all(thirdPartyId);

console.log('Total tx_lines for third:', lines.length);

for (const l of lines) {
  const ref = (l.cross_doc_ref || '').trim();
  const possibleBase = ref.lastIndexOf('-') > 0 ? ref.substring(0, ref.lastIndexOf('-')) : ref;
  const inAllowed = allowedRefs[ref] || allowedRefs[possibleBase];
  console.log(`Line ${l.tx_num} | code ${l.code} | ref "${ref}" | base "${possibleBase}" | inAllowed? ${!!inAllowed} | debit: ${l.debit} | credit: ${l.credit}`);
}
