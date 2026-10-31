const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const unit2603 = db.prepare("SELECT id, code, name FROM ph_properties WHERE code = '2603'").get();
console.log('Unit 2603:', unit2603);

let invoices = db.prepare("SELECT id, number, period, total, due_date, date, status, property_id, tx_id FROM ph_invoices WHERE property_id = ? AND status != 'voided' AND tx_id != '' ORDER BY date ASC, number ASC").all(unit2603.id);
invoices = invoices.filter(i => (i.date || '').slice(0, 10) <= '2026-09-30');
console.log('Valid invoices count (<= 2026-09-30):', invoices.length);

const invIds = invoices.map(i => i.id);
const placeholders = invIds.map(() => '?').join(',');
const lines = db.prepare("SELECT l.id, l.invoice_id, l.concept_id, l.description, l.amount, c.code as concept_code, c.name as concept_name FROM ph_invoice_lines l LEFT JOIN ph_billing_concepts c ON l.concept_id = c.id WHERE l.invoice_id IN (" + placeholders + ")").all(...invIds);

const txLines = db.prepare("SELECT l.id, l.tx_id, l.cross_doc_ref, l.debit, l.credit, l.description, a.code as account_code, t.date as tx_date FROM tx_lines l JOIN accounts a ON l.account_id = a.id JOIN transactions t ON l.tx_id = t.id WHERE a.code LIKE '13%' AND t.date <= '2026-09-30' AND (t.status = 'posted' OR t.status = 'active')").all();

const causalityTxIds = new Set(invoices.map(i => i.tx_id).filter(Boolean));
const abonosMap = new Map();
const advancesByPropMap = new Map();

for (const tl of txLines) {
  const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (valAbono === 0) continue;
  if (causalityTxIds.has(tl.tx_id) && valAbono < 0) continue;
  const ref = String(tl.cross_doc_ref || '').trim().toUpperCase();
  if (!ref) {
    if (tl.description) {
      if (tl.description.includes('Unidad 2603') || tl.description.includes('2603')) {
        advancesByPropMap.set(unit2603.id.toLowerCase(), (advancesByPropMap.get(unit2603.id.toLowerCase()) || 0) + valAbono);
      }
    }
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
  } else {
    abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
  }
}

console.log('AbonosMap for unit 2603 refs:');
for (const [k, v] of abonosMap.entries()) {
  if (k.includes('000078') || k.includes('2603')) console.log(' ', k, '=>', v);
}

// Now simulate rows calculation WITH the fix:
const rows = [];
const pIdKey = unit2603.id.toLowerCase();
let propAdvancePool = advancesByPropMap.get(pIdKey) || 0;

for (const inv of invoices) {
  const invNumber = String(inv.number || '').trim().toUpperCase();
  const invLines = lines.filter(l => l.invoice_id === inv.id);
  let generalAbono = abonosMap.get(invNumber) || 0;

  for (const line of invLines) {
    const originalAmount = Number(line.amount || 0);
    const cCode = String(line.concept_code || '').trim().toUpperCase();
    const conceptCode = (cCode || 'ADM').toUpperCase();
    const specificRef = invNumber + '-' + conceptCode;
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
    if (currentBalance < 1) {
      estado = 'cancelado';
    }

    rows.push({
      invNumber,
      concept: line.description,
      originalAmount,
      abono: abonoAplicado,
      balance: currentBalance,
      estado
    });
  }

  if (generalAbono > 0) {
    propAdvancePool += generalAbono;
    advancesByPropMap.set(pIdKey, propAdvancePool);
  }
}

console.log('Final propAdvancePool for unit 2603:', advancesByPropMap.get(pIdKey));

for (const [pId, remAdvance] of advancesByPropMap.entries()) {
  if (remAdvance > 0.01 && pId === pIdKey) {
    rows.push({
      invNumber: 'ANTICIPO',
      concept: 'Cuota de administración',
      originalAmount: 0,
      abono: remAdvance,
      balance: -remAdvance,
      estado: 'saldo_a_favor'
    });
  }
}

console.log('All rows (including advance row):');
console.table(rows);

const activeParties = rows.filter(r => r.estado !== 'cancelado');
console.log('Active parties for UI:');
console.table(activeParties);
