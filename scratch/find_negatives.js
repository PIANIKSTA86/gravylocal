const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// Let's inspect the credit balances in 13459501 per unit at 2026-06-30
const props = db.prepare(`
  SELECT p.id, p.code, p.name, tp.name as owner_name
  FROM ph_properties p
  LEFT JOIN third_parties tp ON p.owner_id = tp.id
  ORDER BY p.code ASC
`).all();
const propByCode = new Map(props.map(p => [String(p.code).trim().toUpperCase(), p]));
const propById = new Map(props.map(p => [String(p.id).trim(), p]));

const allInvs = db.prepare("SELECT id, number, property_id, period, date, total, tx_id FROM ph_invoices WHERE status != 'voided' AND tx_id != ''").all();
const invByNum = new Map();
allInvs.forEach(i => invByNum.set(String(i.number).toUpperCase(), i));

// Map 13459501
const lines1345 = db.prepare(`
  SELECT 
    tl.debit, tl.credit, tl.cross_doc_ref, tl.description,
    tl.third_party_id, t.number as tx_num, t.date
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501' AND t.date <= ?
`).all(cutoffDate);

const ledgerByProp = new Map();
for (const p of props) {
  ledgerByProp.set(p.id, { debits: 0, credits: 0, balance: 0, creditLines: [] });
}

for (const l of lines1345) {
  let matchedProp = null;
  const ref = String(l.cross_doc_ref || '').trim().toUpperCase();

  if (ref.startsWith('ANT-')) {
    const pid = ref.substring(4).toLowerCase();
    matchedProp = propById.get(pid);
  } else if (ref.startsWith('ANTICIPO-')) {
    const parts = ref.split('-');
    if (parts.length >= 3) {
      const pid = parts.slice(2).join('-').toLowerCase();
      matchedProp = propById.get(pid);
    }
  } else if (ref) {
    const baseInv = ref.split('-').slice(0, 3).join('-');
    const inv = invByNum.get(baseInv) || invByNum.get(ref);
    if (inv) matchedProp = propById.get(inv.property_id);
  }

  if (!matchedProp && l.description) {
    const bracketMatch = String(l.description).match(/\[([0-9a-zA-Z_-]+)\]/);
    if (bracketMatch && propByCode.has(bracketMatch[1].toUpperCase())) {
      matchedProp = propByCode.get(bracketMatch[1].toUpperCase());
    } else {
      for (const p of props) {
        if (l.description.includes(`Unidad ${p.code}`) || (p.name && l.description.includes(p.name))) {
          matchedProp = p;
          break;
        }
      }
    }
  }

  if (matchedProp) {
    const entry = ledgerByProp.get(matchedProp.id);
    entry.debits += l.debit;
    entry.credits += l.credit;
    entry.balance += (l.debit - l.credit);
    if (l.credit > 0) entry.creditLines.push(l);
  }
}

// Find units where ledger balance < 0 (credit balance in 13459501)
const negativeUnits = [];
let totalNegative = 0;
for (const p of props) {
  const l = ledgerByProp.get(p.id);
  if (l.balance < -0.01) {
    negativeUnits.push({
      code: p.code,
      name: p.name,
      owner: p.owner_name,
      debits: l.debits,
      credits: l.credits,
      saldoContable: l.balance
    });
    totalNegative += Math.abs(l.balance);
  }
}

console.log('Units with credit balance (saldo a favor) in account 13459501:');
console.table(negativeUnits);
console.log('Total credit balance in 13459501:', totalNegative);
