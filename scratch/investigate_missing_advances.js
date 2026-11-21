const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// Properties
const props = db.prepare(`
  SELECT p.id, p.code, p.name, tp.name as owner_name, tp.doc_number as owner_doc
  FROM ph_properties p
  LEFT JOIN third_parties tp ON p.owner_id = tp.id
  ORDER BY p.code ASC
`).all();
const propByCode = new Map(props.map(p => [String(p.code).trim().toUpperCase(), p]));
const propById = new Map(props.map(p => [String(p.id).trim().toLowerCase(), p]));

// Ledger 13459501
const allInvs = db.prepare("SELECT id, number, property_id, period, date, total, tx_id FROM ph_invoices WHERE status != 'voided' AND tx_id != ''").all();
const invByNum = new Map();
allInvs.forEach(i => invByNum.set(String(i.number).toUpperCase(), i));

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
  ledgerByProp.set(p.id.toLowerCase(), { debits: 0, credits: 0, balance: 0, lines: [] });
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
    if (inv) matchedProp = propById.get(inv.property_id.toLowerCase());
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
    const entry = ledgerByProp.get(matchedProp.id.toLowerCase());
    entry.debits += l.debit;
    entry.credits += l.credit;
    entry.balance += (l.debit - l.credit);
    entry.lines.push(l);
  }
}

// Invoices for Cartera
const invoices = db.prepare(`
  SELECT phi.id, phi.number, phi.period, phi.date, phi.due_date, phi.total, phi.property_id, phi.tx_id,
         prop.code as property_code, prop.name as property_name,
         tp.id as owner_id, tp.name as owner_name, tp.doc_number as owner_doc
  FROM ph_invoices phi
  LEFT JOIN ph_properties prop ON prop.id = phi.property_id
  LEFT JOIN third_parties tp ON tp.id = prop.owner_id
  WHERE phi.status != 'voided' AND phi.tx_id != ''
    AND phi.date <= ?
  ORDER BY phi.date ASC, phi.number ASC
`).all(cutoffDate);

const invIds = new Set(invoices.map(i => i.id));
const rawLines = db.prepare(`
  SELECT phl.id, phl.invoice_id, phl.concept_id, phl.amount,
         COALESCE(bc.name, 'Concepto') as concept_name
  FROM ph_invoice_lines phl
  LEFT JOIN ph_billing_concepts bc ON phl.concept_id = bc.id
  ORDER BY phl.line_order ASC
`).all().filter(l => invIds.has(l.invoice_id));

const linesByInvoiceId = new Map();
for (const ln of rawLines) {
  if (!linesByInvoiceId.has(ln.invoice_id)) linesByInvoiceId.set(ln.invoice_id, []);
  linesByInvoiceId.get(ln.invoice_id).push(ln);
}

const invNumbers = invoices.map(i => String(i.number || '').toUpperCase()).filter(Boolean);
const causalityTxIds = new Set(invoices.map(i => i.tx_id).filter(Boolean));
const abonosMap = new Map();
const advancesByPropMap = new Map();

const txLines = db.prepare(`
  SELECT tl.id, tl.tx_id, tl.account_id, tl.debit, tl.credit, tl.cross_doc_ref, tl.description,
         t.number as tx_num, t.date as tx_date, a.code as account_code
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE a.code LIKE '13%'
    AND t.date <= ?
    AND (t.status = 'posted' OR t.status = 'active')
`).all(cutoffDate);

for (const tl of txLines) {
  const txIdStr = String(tl.tx_id || '');
  const isDebit = Number(tl.debit || 0) > 0;
  const txNum = String(tl.tx_num || '').toUpperCase();
  const isCausationDebit = isDebit && causalityTxIds.has(txIdStr) && !txNum.startsWith('RC-');
  if (isCausationDebit) continue;

  const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (Math.abs(valAbono) < 0.0001) continue;

  const ref = String(tl.cross_doc_ref || '').trim().toUpperCase();
  const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));

  if (matchedInv) {
    abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
  } else if (ref.startsWith('ANTICIPO-')) {
    const parts = ref.split('-');
    if (parts.length >= 3) {
      const pCode = parts[1];
      const pId = parts.slice(2).join('-');
      const targetInv = invoices.find(inv => {
        const invPCode = String(inv.period || '').replace('-', '');
        return invPCode === pCode && String(inv.property_id).toUpperCase() === pId.toUpperCase();
      });
      if (targetInv && targetInv.number) {
        const invNum = String(targetInv.number).trim().toUpperCase();
        abonosMap.set(invNum, (abonosMap.get(invNum) || 0) + valAbono);
      } else {
        const pidKey = pId.toLowerCase();
        advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
      }
    }
  } else if (ref.startsWith('ANT-')) {
    const pidKey = ref.substring(4).toLowerCase();
    advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
  } else if (ref.startsWith('CF-')) {
    const baseInvNum = ref.split('-').slice(0, 3).join('-');
    const rawInv = allInvs.find(i => String(i.number || '').trim().toUpperCase() === baseInvNum);
    if (rawInv && rawInv.property_id) {
      const pidKey = String(rawInv.property_id).toLowerCase();
      advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
    }
  }
}

// Compare each of the 19 units
const targetCodes = [
  '1104', '1201', '1501', '1602', '1702', '1801',
  '21202', '21204', '2401', '2903', '31001', '3401', '3601',
  '4104', '4202', '4204', '4302', '4401', '4603'
];

console.log('Comparing the 19 units:');
const results = [];
for (const code of targetCodes) {
  const p = propByCode.get(code);
  const pid = p.id.toLowerCase();
  const led = ledgerByProp.get(pid);
  const adv = advancesByPropMap.get(pid) || 0;
  
  // Find invoices for this unit
  const pInvs = invoices.filter(i => i.property_id.toLowerCase() === pid);
  let totInv = 0;
  let totAbono = 0;
  for (const inv of pInvs) {
    totInv += inv.total;
    const invNum = String(inv.number).toUpperCase();
    totAbono += (abonosMap.get(invNum) || 0);
    for (const [k, v] of abonosMap.entries()) {
      if (k.startsWith(invNum + '-')) totAbono += v;
    }
  }

  results.push({
    code: p.code,
    name: p.name,
    saldo1345: led.balance,
    advanceInCartera: adv,
    totInv,
    totAbono,
    diff: Math.abs(led.balance) - adv
  });
}
console.table(results);
const totalDiff = results.reduce((s, r) => s + r.diff, 0);
console.log('Sum of differences on these 19 units:', totalDiff);
