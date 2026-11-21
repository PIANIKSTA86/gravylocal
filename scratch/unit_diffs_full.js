const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// 1. Invoices
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

const allInvoices = db.prepare("SELECT id, number, property_id, period FROM ph_invoices WHERE status != 'voided'").all();
const properties = db.prepare("SELECT id, code, name FROM ph_properties").all();
const propById = new Map(properties.map(p => [String(p.id).toLowerCase(), p]));
const propByCode = new Map(properties.map(p => [String(p.code).toUpperCase(), p]));

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
    const rawInv = allInvoices.find(i => String(i.number || '').trim().toUpperCase() === baseInvNum);
    if (rawInv && rawInv.property_id) {
      const pidKey = String(rawInv.property_id).toLowerCase();
      advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
    }
  }
}

// Exactly api.ts lines 6649-6800
invoices.sort((a, b) => {
  const dA = String(a.date || '');
  const dB = String(b.date || '');
  return dA.localeCompare(dB) || String(a.number).localeCompare(String(b.number));
});

const rows = [];
const refDate = cutoffDate;

for (const inv of invoices) {
  const invLines = linesByInvoiceId.get(inv.id) || [];
  const invNum = String(inv.number || '').toUpperCase();
  const pidKey = String(inv.property_id || '').toLowerCase();

  let directPayment = Number(abonosMap.get(invNum) || 0);
  for (const [k, v] of abonosMap.entries()) {
    if (k.startsWith(invNum + '-')) directPayment += Number(v || 0);
  }

  const invoiceTotal = Number(inv.total || 0);
  let unallocatedAdvance = advancesByPropMap.get(pidKey) || 0;
  let advanceUsed = 0;
  const neededForInv = Math.max(0, invoiceTotal - directPayment);

  if (unallocatedAdvance > 0 && neededForInv > 0) {
    advanceUsed = Math.min(unallocatedAdvance, neededForInv);
    advancesByPropMap.set(pidKey, unallocatedAdvance - advanceUsed);
  }

  let totalPaymentForInv = directPayment + advanceUsed;

  const dRef = new Date(refDate + 'T00:00:00Z');
  const dDue = inv.due_date ? new Date(inv.due_date + 'T00:00:00Z') : dRef;
  const diasMora = Math.max(0, Math.floor((dRef.getTime() - dDue.getTime()) / (1000 * 3600 * 24)));

  let remainingPayment = totalPaymentForInv;

  for (const ln of invLines) {
    const origAmt = Number(ln.amount || 0);
    const lineConceptRef = `${invNum}-${ln.concept_name.includes('MORA') ? 'MORA' : 'ADM'}`;
    const specificPayment = Number(abonosMap.get(lineConceptRef) || 0);

    let effectiveLinePayment = 0;
    if (specificPayment > 0) {
      effectiveLinePayment = Math.min(origAmt, specificPayment);
    } else {
      effectiveLinePayment = Math.min(origAmt, remainingPayment);
      remainingPayment = Math.max(0, remainingPayment - effectiveLinePayment);
    }

    const pendingAmt = Math.max(0, origAmt - effectiveLinePayment);
    let estado = 'al_dia';
    if (pendingAmt > 0) {
      estado = diasMora > 0 ? 'vencido' : 'por_vencer';
    } else {
      estado = 'cancelado';
    }

    rows.push({
      propertyId: inv.property_id,
      propertyCode: inv.property_code,
      propertyName: inv.property_name,
      concepto: ln.concept_name,
      amount: pendingAmt,
      estado,
      saldoAnticipo: 0,
    });
  }
}

for (const [pidKey, remAdv] of advancesByPropMap.entries()) {
  if (remAdv > 0.01) {
    const prop = propById.get(pidKey);
    rows.push({
      propertyId: pidKey,
      propertyCode: prop?.code || '',
      propertyName: prop?.name || '',
      concepto: 'Saldo a favor (Anticipo)',
      amount: -remAdv,
      estado: 'saldo_a_favor',
      saldoAnticipo: remAdv,
    });
  }
}

// Group by unit
const byUnit = new Map();
for (const p of rows.filter(r => r.estado !== 'cancelado')) {
  const uLabel = [p.propertyCode, p.propertyName].filter(Boolean).join(' - ') || 'Unidad';
  const unitKey = `${p.propertyId}|${uLabel}`;
  if (!byUnit.has(unitKey)) {
    byUnit.set(unitKey, {
      propertyId: p.propertyId,
      propertyCode: p.propertyCode,
      propertyName: p.propertyName,
      carteraExigible: 0,
      saldoAnticipo: 0,
      totalNeto: 0,
    });
  }
  const row = byUnit.get(unitKey);
  const amt = Number(p.amount || 0);

  if (p.estado === 'saldo_a_favor' || amt < -0.01) {
    row.saldoAnticipo += Math.abs(amt);
  } else {
    row.carteraExigible += amt;
  }
  if (p.saldoAnticipo && Number(p.saldoAnticipo) > 0) {
    row.saldoAnticipo = Math.max(row.saldoAnticipo, Number(p.saldoAnticipo));
  }
}

for (const r of byUnit.values()) {
  r.carteraExigible = Math.round(r.carteraExigible * 100) / 100;
  r.saldoAnticipo = Math.round(r.saldoAnticipo * 100) / 100;
  r.totalNeto = Math.round((r.carteraExigible - r.saldoAnticipo) * 100) / 100;
}

// Map ledger 13459501
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
for (const p of properties) {
  ledgerByProp.set(p.id.toLowerCase(), { debits: 0, credits: 0, balance: 0 });
}

for (const l of lines1345) {
  let matchedProp = null;
  const ref = String(l.cross_doc_ref || '').trim().toUpperCase();

  if (ref.startsWith('ANT-')) {
    matchedProp = propById.get(ref.substring(4).toLowerCase());
  } else if (ref.startsWith('ANTICIPO-')) {
    const parts = ref.split('-');
    if (parts.length >= 3) matchedProp = propById.get(parts.slice(2).join('-').toLowerCase());
  } else if (ref) {
    const baseInv = ref.split('-').slice(0, 3).join('-');
    const inv = allInvoices.find(i => String(i.number).toUpperCase() === baseInv);
    if (inv) matchedProp = propById.get(inv.property_id.toLowerCase());
  }

  if (!matchedProp && l.description) {
    const bracketMatch = String(l.description).match(/\[([0-9a-zA-Z_-]+)\]/);
    if (bracketMatch && propByCode.has(bracketMatch[1].toUpperCase())) {
      matchedProp = propByCode.get(bracketMatch[1].toUpperCase());
    } else {
      for (const p of properties) {
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
  }
}

// COMPARE by property across ALL properties!
const diffList = [];
let grandDiff = 0;

for (const p of properties) {
  const pid = p.id.toLowerCase();
  const led = ledgerByProp.get(pid) || { balance: 0 };
  const uLabel = [p.code, p.name].filter(Boolean).join(' - ');
  const unitKey = `${p.id}|${uLabel}`;
  const c = byUnit.get(unitKey) || { carteraExigible: 0, saldoAnticipo: 0, totalNeto: 0 };

  const diff = Math.round((c.totalNeto - led.balance) * 100) / 100;
  if (Math.abs(diff) > 0.01) {
    diffList.push({
      code: p.code,
      name: p.name,
      carteraNeto: c.totalNeto,
      carteraExigible: c.carteraExigible,
      carteraAnticipo: c.saldoAnticipo,
      libroContable1345: led.balance,
      diferencia: diff
    });
    grandDiff += diff;
  }
}

console.log('Units with mismatch between Cartera Neto and Libro Contable:');
console.table(diffList);
console.log('Grand Total Difference (Cartera Neto - Libro Contable):', Math.round(grandDiff));
