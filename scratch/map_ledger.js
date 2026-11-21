const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// 1. Get properties
const props = db.prepare(`
  SELECT p.id, p.code, p.name, tp.name as owner_name, tp.doc_number as owner_doc
  FROM ph_properties p
  LEFT JOIN third_parties tp ON p.owner_id = tp.id
  ORDER BY p.code ASC
`).all();

// 2. Get accounting balance on 13459501 per unit
// How are lines linked to properties in transactions?
// In tx_lines: either third_party_id = prop.owner_id, or description has [code], or cross_doc_ref
const lines1345 = db.prepare(`
  SELECT 
    tl.debit, tl.credit, tl.cross_doc_ref, tl.description,
    tl.third_party_id, t.number as tx_num, t.date
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code = '13459501' AND t.date <= ?
`).all(cutoffDate);

// Map invoices
const allInvs = db.prepare(`
  SELECT id, number, property_id, period, date, total, tx_id
  FROM ph_invoices
  WHERE status != 'voided' AND tx_id != ''
`).all();
const invByNum = new Map();
allInvs.forEach(i => invByNum.set(String(i.number).toUpperCase(), i));

// Group ledger by property
const propByCode = new Map(props.map(p => [String(p.code).trim().toUpperCase(), p]));
const propById = new Map(props.map(p => [String(p.id).trim(), p]));

const ledgerByProp = new Map();
for (const p of props) {
  ledgerByProp.set(p.id, { debits: 0, credits: 0, balance: 0, lines: [] });
}

let unmappedLines = [];

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
    entry.lines.push(l);
  } else {
    unmappedLines.push(l);
  }
}

console.log('Unmapped lines count:', unmappedLines.length);
if (unmappedLines.length > 0) {
  console.log('Sample unmapped:', unmappedLines.slice(0, 5));
}

// Total mapped
let totalMappedDeb = 0, totalMappedCred = 0, totalMappedBal = 0;
for (const e of ledgerByProp.values()) {
  totalMappedDeb += e.debits;
  totalMappedCred += e.credits;
  totalMappedBal += e.balance;
}
console.log('Mapped ledger totals: deb=', totalMappedDeb, 'cred=', totalMappedCred, 'bal=', totalMappedBal);
