const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// Check which invoices out of period were matched in advancesByPropMap
const allInvoices = db.prepare("SELECT id, number, property_id, period FROM ph_invoices WHERE status != 'voided'").all();
const allInvByNum = new Map();
allInvoices.forEach(i => allInvByNum.set(String(i.number).toUpperCase(), i));

const creditLines = db.prepare(`
  SELECT 
    tl.id, tl.tx_id, tl.credit, tl.cross_doc_ref, tl.description,
    t.number as tx_num, t.date as tx_date
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501' AND t.date <= ? AND tl.credit > 0
`).all(cutoffDate);

const invoicesInPeriod = db.prepare(`
  SELECT phi.id, phi.number, phi.total, phi.property_id
  FROM ph_invoices phi
  WHERE phi.status != 'voided' AND phi.tx_id != '' AND phi.date <= ?
`).all(cutoffDate);
const invNumsInPeriod = new Set(invoicesInPeriod.map(i => String(i.number).toUpperCase()));

const outOfPeriodLines = creditLines.filter(l => {
  const ref = String(l.cross_doc_ref || '').trim().toUpperCase();
  const baseInv = ref.split('-').slice(0, 3).join('-');
  return !invNumsInPeriod.has(ref) && !invNumsInPeriod.has(baseInv);
});

console.log('Out of period credit lines:');
let sumOut = 0;
for (const l of outOfPeriodLines) {
  const ref = String(l.cross_doc_ref || '').trim().toUpperCase();
  const baseInv = ref.split('-').slice(0, 3).join('-');
  const rawInv = allInvByNum.get(baseInv);
  console.log(`tx=${l.tx_num} date=${l.tx_date} cred=${l.credit} ref=${ref} foundInv=${!!rawInv} propId=${rawInv ? rawInv.property_id : 'NONE'}`);
  sumOut += l.credit;
}
console.log('Total out of period credits:', sumOut);
