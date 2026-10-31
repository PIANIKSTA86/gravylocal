const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

const invs = db.prepare(`SELECT id, number, total, property_id FROM ph_invoices WHERE status != 'voided' AND tx_id != ''`).all();
const invNumbers = new Set(invs.map(i => String(i.number).trim().toUpperCase()));

const c13 = db.prepare(`
  SELECT l.id, t.number as tx_num, t.date, l.debit, l.credit, l.cross_doc_ref, l.description, l.third_party_id
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

let matchedToInv = 0;
let matchedToAnt = 0;
let missedCredits = [];
let missedCreditsSum = 0;

for (const l of c13) {
  const val = Number(l.credit || 0) - Number(l.debit || 0);
  if (val <= 0) continue;

  const ref = String(l.cross_doc_ref || '').trim().toUpperCase();
  const baseInvNum = ref.split('-').slice(0, 3).join('-');

  if (invNumbers.has(ref) || invNumbers.has(baseInvNum)) {
    matchedToInv += val;
  } else if (ref.startsWith('ANTICIPO-') || ref.startsWith('ANT-')) {
    matchedToAnt += val;
  } else {
    missedCredits.push(l);
    missedCreditsSum += val;
  }
}

console.log('Créditos directos a Factura:', matchedToInv);
console.log('Créditos ANT- / ANTICIPO-:', matchedToAnt);
console.log('Créditos que no tienen ref de factura ni ANT-:', missedCreditsSum);
console.log('Total Créditos:', matchedToInv + matchedToAnt + missedCreditsSum);
console.log('Suma de missedCredits:', missedCreditsSum);
console.table(missedCredits.slice(0, 15).map(m => ({
  tx: m.tx_num,
  ref: m.cross_doc_ref,
  cred: m.credit,
  desc: m.description
})));

