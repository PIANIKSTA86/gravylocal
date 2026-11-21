const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// Let's inspect every credit line on 13459501 up to 2026-06-30
const creditLines = db.prepare(`
  SELECT 
    tl.id, tl.tx_id, tl.credit, tl.cross_doc_ref, tl.description,
    t.number as tx_num, t.date as tx_date
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501' AND t.date <= ? AND tl.credit > 0
`).all(cutoffDate);

console.log('Total credit lines count:', creditLines.length);
const totalCredit = creditLines.reduce((s, l) => s + l.credit, 0);
console.log('Total credit amount on 13459501:', totalCredit);

// Let's check how each credit is matched in Cartera PH:
const invoices = db.prepare(`
  SELECT phi.id, phi.number, phi.total, phi.property_id
  FROM ph_invoices phi
  WHERE phi.status != 'voided' AND phi.tx_id != '' AND phi.date <= ?
`).all(cutoffDate);
const invNums = new Set(invoices.map(i => String(i.number).toUpperCase()));

let matchedToInvoicesInPeriod = 0;
let matchedToInvoicesOutOfPeriod = 0;
let matchedToAnticipoRef = 0;
let matchedToAntRef = 0;
let unmatchedRef = [];

for (const l of creditLines) {
  const ref = String(l.cross_doc_ref || '').trim().toUpperCase();
  const baseInv = ref.split('-').slice(0, 3).join('-');

  if (invNums.has(ref) || invNums.has(baseInv)) {
    matchedToInvoicesInPeriod += l.credit;
  } else if (ref.startsWith('ANTICIPO-')) {
    matchedToAnticipoRef += l.credit;
  } else if (ref.startsWith('ANT-')) {
    matchedToAntRef += l.credit;
  } else if (ref.startsWith('CF-')) {
    matchedToInvoicesOutOfPeriod += l.credit;
  } else {
    unmatchedRef.push(l);
  }
}

console.log('Matched to invoices in period (May/June):', matchedToInvoicesInPeriod);
console.log('Matched to invoices out of period (July+):', matchedToInvoicesOutOfPeriod);
console.log('Matched to ANTICIPO-:', matchedToAnticipoRef);
console.log('Matched to ANT-:', matchedToAntRef);
console.log('Unmatched refs count:', unmatchedRef.length, 'total amt:', unmatchedRef.reduce((s, l) => s + l.credit, 0));
if (unmatchedRef.length > 0) {
  console.log('Sample unmatched:', unmatchedRef.slice(0, 10));
}
