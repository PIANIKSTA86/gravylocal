const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

const invoices = db.prepare(`
  SELECT phi.id, phi.number, phi.total, phi.property_id
  FROM ph_invoices phi
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

// Check which invoices have payments > total
const overpaidInvoices = [];
let totalOverpayment = 0;

for (const inv of invoices) {
  const invNum = String(inv.number).toUpperCase();
  let totPay = abonosMap.get(invNum) || 0;
  for (const [k, v] of abonosMap.entries()) {
    if (k.startsWith(invNum + '-')) totPay += v;
  }

  if (totPay > inv.total) {
    const diff = totPay - inv.total;
    overpaidInvoices.push({
      number: inv.number,
      total: inv.total,
      totalPayment: totPay,
      overpayment: diff
    });
    totalOverpayment += diff;
  }
}

console.log('Overpaid invoices count:', overpaidInvoices.length);
console.table(overpaidInvoices);
console.log('Total overpayment across invoices:', totalOverpayment);
