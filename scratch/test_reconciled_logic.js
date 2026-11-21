const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// 1. All invoices light (all periods)
const allInvoicesLight = db.prepare("SELECT id, number, property_id FROM ph_invoices WHERE status != 'voided'").all();
const invPropMap = new Map();
allInvoicesLight.forEach(i => invPropMap.set(String(i.number).toUpperCase().trim(), String(i.property_id).toLowerCase()));

// 2. Invoices in period
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

const properties = db.prepare("SELECT id, code, name FROM ph_properties").all();
const propById = new Map(properties.map(p => [String(p.id).toLowerCase(), p]));
const propByCode = new Map(properties.map(p => [String(p.code).toUpperCase(), p]));

const invNumbers = invoices.map(i => String(i.number || '').toUpperCase()).filter(Boolean);
const causalityTxIds = new Set(invoices.map(i => i.tx_id).filter(Boolean));
const abonosMap = new Map();
const advancesByPropMap = new Map();

const txLines = db.prepare(`
  SELECT tl.id, tl.tx_id, tl.account_id, tl.debit, tl.credit, tl.cross_doc_ref, tl.description,
         t.number as tx_num, t.date as tx_date, a.code as account_code, tl.third_party_id
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
    const pid = invPropMap.get(baseInvNum);
    if (pid) {
      advancesByPropMap.set(pid, (advancesByPropMap.get(pid) || 0) + valAbono);
    } else if (tl.description) {
      for (const p of properties) {
        if (tl.description.includes(`Unidad ${p.code}`) || (p.name && tl.description.includes(p.name)) || (p.code && tl.description.includes(`- ${p.code}`))) {
          const pidKey = String(p.id).toLowerCase();
          advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
          break;
        }
      }
    }
  } else if (tl.description) {
    for (const p of properties) {
      if (tl.description.includes(`Unidad ${p.code}`) || (p.name && tl.description.includes(p.name)) || (p.code && tl.description.includes(`- ${p.code}`))) {
        const pidKey = String(p.id).toLowerCase();
        advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
        break;
      }
    }
  }
}

// Check lines & distribute
invoices.sort((a, b) => {
  const dA = String(a.date || '');
  const dB = String(b.date || '');
  return dA.localeCompare(dB) || String(a.number).localeCompare(String(b.number));
});

const rows = [];
const refDate = cutoffDate;

for (const inv of invoices) {
  const invLines = linesByInvoiceId.get(inv.id) || [];
  const invNumber = String(inv.number || '').trim().toUpperCase();
  const pIdKey = String(inv.property_id || '').toLowerCase();

  let generalAbono = abonosMap.get(invNumber) || 0;
  let propAdvancePool = advancesByPropMap.get(pIdKey) || 0;

  for (const line of invLines) {
    const originalAmount = Number(line.amount || 0);
    const isMora = line.concept_name.includes('MORA');
    const specificRef = `${invNumber}-${isMora ? 'MORA' : 'ADM'}`;
    let abonoAplicado = abonosMap.get(specificRef) || 0;

    if (generalAbono > 0) {
      const porAplicar = Math.min(generalAbono, Math.max(0, originalAmount - abonoAplicado));
      abonoAplicado += porAplicar;
      generalAbono -= porAplicar;
    }

    if (abonoAplicado > originalAmount) {
      const surplus = abonoAplicado - originalAmount;
      abonoAplicado = originalAmount;
      propAdvancePool += surplus;
      advancesByPropMap.set(pIdKey, propAdvancePool);
    }

    let currentBalance = originalAmount - abonoAplicado;

    if (propAdvancePool > 0 && currentBalance > 0) {
      const porAmortizar = Math.min(propAdvancePool, currentBalance);
      currentBalance -= porAmortizar;
      abonoAplicado += porAmortizar;
      propAdvancePool -= porAmortizar;
      advancesByPropMap.set(pIdKey, propAdvancePool);
    }

    let estado = 'por_vencer';
    if (currentBalance < 0.01) {
      estado = 'cancelado';
    } else {
      estado = 'vencido';
    }

    rows.push({
      propertyId: inv.property_id,
      propertyCode: inv.property_code,
      propertyName: inv.property_name,
      concepto: line.concept_name,
      amount: currentBalance,
      originalAmount,
      abono: abonoAplicado,
      estado,
      saldoAnticipo: 0,
    });
  }

  if (generalAbono > 0) {
    propAdvancePool += generalAbono;
  }
  advancesByPropMap.set(pIdKey, propAdvancePool);
}

// Add remaining advances
for (const [pIdKey, remAdvance] of advancesByPropMap.entries()) {
  if (remAdvance > 0.01) {
    const prop = propById.get(pIdKey);
    rows.push({
      propertyId: pIdKey,
      propertyCode: prop?.code || '',
      propertyName: prop?.name || '',
      concepto: 'Cuota de administración',
      amount: -remAdvance,
      originalAmount: 0,
      abono: remAdvance,
      estado: 'saldo_a_favor',
      saldoAnticipo: remAdvance,
    });
  }
}

// Aggregate by unit
const byUnit = new Map();
for (const p of rows.filter(r => r.estado !== 'cancelado')) {
  const uLabel = [p.propertyCode, p.propertyName].filter(Boolean).join(' - ') || 'Unidad';
  const unitKey = `${p.propertyId}|${uLabel}`;
  if (!byUnit.has(unitKey)) {
    byUnit.set(unitKey, {
      unidad: uLabel,
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
}

let grandExigible = 0;
let grandAnticipos = 0;
let grandNeto = 0;

for (const r of byUnit.values()) {
  r.carteraExigible = Math.round(r.carteraExigible * 100) / 100;
  r.saldoAnticipo = Math.round(r.saldoAnticipo * 100) / 100;
  r.totalNeto = Math.round((r.carteraExigible - r.saldoAnticipo) * 100) / 100;

  grandExigible += r.carteraExigible;
  grandAnticipos += r.saldoAnticipo;
  grandNeto += r.totalNeto;
}

console.log('--- RECONCILED CARTERA PH RESULTS ---');
console.log('grandExigible:', grandExigible);
console.log('grandAnticipos:', grandAnticipos);
console.log('grandNeto:', grandNeto);
console.log('Contabilidad 13459501:', 54266541);
console.log('Difference:', grandNeto - 54266541);
