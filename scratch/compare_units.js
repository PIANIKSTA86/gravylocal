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
const propById = new Map(props.map(p => [String(p.id).trim(), p]));

// Invoices
const invoices = db.prepare(`
  SELECT phi.id, phi.number, phi.period, phi.date, phi.total, phi.property_id, phi.tx_id
  FROM ph_invoices phi
  WHERE phi.status != 'voided' AND phi.tx_id != ''
    AND phi.date <= ?
  ORDER BY phi.date ASC, phi.number ASC
`).all(cutoffDate);
const invByNum = new Map();
invoices.forEach(i => invByNum.set(String(i.number).toUpperCase(), i));
const allInvs = db.prepare("SELECT id, number, property_id, period FROM ph_invoices WHERE status != 'voided'").all();

// Lines
const invIds = invoices.map(i => i.id);
const lines = db.prepare(`
  SELECT phl.id, phl.invoice_id, phl.concept_id, phl.amount,
         COALESCE(bc.name, 'Concepto') as concept_name
  FROM ph_invoice_lines phl
  LEFT JOIN ph_billing_concepts bc ON phl.concept_id = bc.id
  WHERE phl.invoice_id IN (${invIds.map(() => '?').join(',')})
`).all(...invIds);
const linesByInv = new Map();
for (const l of lines) {
  if (!linesByInv.has(l.invoice_id)) linesByInv.set(l.invoice_id, []);
  linesByInv.get(l.invoice_id).push(l);
}

// Abonos
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

// 2. Ledger on 13459501
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
  ledgerByProp.set(p.id, { debits: 0, credits: 0, balance: 0 });
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
  }
}

// Now calculate Cartera per property
const carteraByProp = new Map();
for (const p of props) {
  carteraByProp.set(p.id, {
    prop: p,
    capital: 0,
    mora: 0,
    anticipos: 0,
    exigible: 0,
    neto: 0,
  });
}

const invsByProp = new Map();
for (const inv of invoices) {
  const pid = String(inv.property_id).toLowerCase();
  if (!invsByProp.has(pid)) invsByProp.set(pid, []);
  invsByProp.get(pid).push(inv);
}

for (const p of props) {
  const pid = p.id.toLowerCase();
  const pInvs = invsByProp.get(pid) || [];
  let unallocatedAdvance = advancesByPropMap.get(pid) || 0;
  const cData = carteraByProp.get(p.id);

  for (const inv of pInvs) {
    const invNum = String(inv.number || '').toUpperCase();
    let lns = linesByInv.get(inv.id) || [];
    const totalInv = Number(inv.total || 0);

    let directPayment = abonosMap.get(invNum) || 0;
    for (const [k, v] of abonosMap.entries()) {
      if (k.startsWith(invNum + '-')) directPayment += v;
    }

    let neededForInv = Math.max(0, totalInv - directPayment);
    let advanceUsed = 0;
    if (unallocatedAdvance > 0 && neededForInv > 0) {
      advanceUsed = Math.min(unallocatedAdvance, neededForInv);
      unallocatedAdvance -= advanceUsed;
    }
    let totalPaidForInv = directPayment + advanceUsed;

    let remainingPayment = totalPaidForInv;
    for (const ln of lns) {
      const amt = Number(ln.amount || 0);
      const lineRemaining = Math.max(0, amt - remainingPayment);
      const allocated = Math.min(amt, remainingPayment);
      remainingPayment -= allocated;

      if (lineRemaining > 0) {
        if (ln.concept_name.includes('MORA')) {
          cData.mora += lineRemaining;
        } else {
          cData.capital += lineRemaining;
        }
      }
    }
  }

  if (unallocatedAdvance > 0) {
    cData.anticipos += unallocatedAdvance;
  }

  cData.exigible = Math.round((cData.capital + cData.mora) * 100) / 100;
  cData.neto = Math.round((cData.exigible - cData.anticipos) * 100) / 100;
}

// Compare Cartera vs Ledger for each property
const diffs = [];
for (const p of props) {
  const c = carteraByProp.get(p.id);
  const l = ledgerByProp.get(p.id);

  // Compare c.neto vs l.balance, OR c.capital vs l.balance
  const diffNeto = Math.round((c.neto - l.balance) * 100) / 100;
  const diffCapital = Math.round((c.capital - l.balance) * 100) / 100;
  const diffExigible = Math.round((c.exigible - l.balance) * 100) / 100;

  if (Math.abs(diffNeto) > 0.01 || Math.abs(diffCapital) > 0.01) {
    diffs.push({
      code: p.code,
      name: p.name,
      owner: p.owner_name,
      capital: c.capital,
      mora: c.mora,
      anticipos: c.anticipos,
      exigible: c.exigible,
      carteraNeto: c.neto,
      libro134501: l.balance,
      diffNeto,
      diffCapital,
      diffExigible
    });
  }
}

console.log('Total units with diff between Cartera and Libro 13459501:', diffs.length);
console.log('Sample units with diff:', diffs.slice(0, 10));

// Let's summarize the differences!
let sumDiffNeto = 0;
let sumDiffCapital = 0;
let sumMora = 0;
let sumAnticipos = 0;
for (const d of diffs) {
  sumDiffNeto += d.diffNeto;
  sumDiffCapital += d.diffCapital;
  sumMora += d.mora;
  sumAnticipos += d.anticipos;
}
console.log('Summary of diffs: sumDiffNeto=', Math.round(sumDiffNeto), 'sumDiffCapital=', Math.round(sumDiffCapital), 'sumMora=', Math.round(sumMora), 'sumAnticipos=', Math.round(sumAnticipos));
