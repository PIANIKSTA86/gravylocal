const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// Let's inspect all invoices in period and find ALL overpayments!
const invoices = db.prepare(`
  SELECT phi.id, phi.number, phi.total, phi.property_id, p.code as prop_code, p.name as prop_name
  FROM ph_invoices phi
  JOIN ph_properties p ON phi.property_id = p.id
  WHERE phi.status != 'voided' AND phi.tx_id != '' AND phi.date <= ?
`).all(cutoffDate);

const invNumbers = invoices.map(i => String(i.number || '').toUpperCase()).filter(Boolean);
const causalityTxIds = new Set(invoices.map(i => i.tx_id).filter(Boolean));

const txLines = db.prepare(`
  SELECT tl.id, tl.tx_id, tl.debit, tl.credit, tl.cross_doc_ref, tl.description, t.number as tx_num
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code LIKE '13%' AND t.date <= ? AND (t.status = 'posted' OR t.status = 'active')
`).all(cutoffDate);

const abonosMap = new Map();
for (const tl of txLines) {
  const isDebit = Number(tl.debit || 0) > 0;
  const txNum = String(tl.tx_num || '').toUpperCase();
  if (isDebit && causalityTxIds.has(tl.tx_id) && !txNum.startsWith('RC-')) continue;

  const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (Math.abs(valAbono) < 0.0001) continue;

  const ref = String(tl.cross_doc_ref || '').trim().toUpperCase();
  const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));
  if (matchedInv) {
    abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
  }
}

// Find invoices where payments > total
const discardedSurpluses = [];
let totalDiscarded = 0;

for (const inv of invoices) {
  const invNum = String(inv.number).toUpperCase();
  let totPay = Number(abonosMap.get(invNum) || 0);
  for (const [k, v] of abonosMap.entries()) {
    if (k.startsWith(invNum + '-')) totPay += Number(v || 0);
  }

  if (totPay > inv.total) {
    const surplus = totPay - inv.total;
    discardedSurpluses.push({
      unit: `${inv.prop_code} - ${inv.prop_name}`,
      invNumber: inv.number,
      invTotal: inv.total,
      totalPayments: totPay,
      surplusDiscarded: surplus
    });
    totalDiscarded += surplus;
  }
}

console.log('--- Discarded Surpluses on Invoices ---');
console.table(discardedSurpluses);
console.log('Total Surplus Discarded in Cartera PH:', totalDiscarded);
