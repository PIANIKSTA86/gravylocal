const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

const props = db.prepare(`SELECT p.*, tp.name as owner_name, tp.doc_number as owner_doc FROM ph_properties p LEFT JOIN third_parties tp ON tp.id = p.owner_id ORDER BY p.code ASC`).all();
const propById = new Map(props.map(p => [p.id.toLowerCase(), p]));

const invoices = db.prepare(`SELECT * FROM ph_invoices WHERE status != 'voided' AND tx_id != '' ORDER BY period ASC, date ASC`).all();

const allLines = db.prepare(`
  SELECT l.*, c.code as concept_code, c.name as concept_name
  FROM ph_invoice_lines l
  LEFT JOIN ph_billing_concepts c ON c.id = l.concept_id
`).all();

const txLines = db.prepare(`
  SELECT l.id, l.tx_id, t.number as tx_num, t.date, l.debit, l.credit, l.cross_doc_ref, l.description
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

const invNumbers = invoices.map(i => String(i.number || '').toUpperCase()).filter(Boolean);
const causalityTxIds = new Set(invoices.map(i => i.tx_id).filter(Boolean));

// Map sequences
const propBySeq = new Map();
for (const inv of invoices) {
  if (inv.number && inv.number.startsWith('CF-')) {
    const seq = inv.number.split('-')[2];
    if (seq && !propBySeq.has(seq)) propBySeq.set(seq, inv.property_id);
  }
}

// SIMULATE TRANSFORMED REFERENCES
for (const tl of txLines) {
  let ref = String(tl.cross_doc_ref || '').trim().toUpperCase();
  if (ref.startsWith('ANTICIPO-') || ref.startsWith('ANT-')) {
    let period = null;
    let propId = null;
    if (ref.startsWith('ANTICIPO-')) {
      const parts = ref.split('-');
      const ym = parts[1];
      period = `${ym.slice(0, 4)}-${ym.slice(4, 6)}`;
      propId = parts.slice(2).join('-');
    } else {
      propId = ref.slice(4);
      const m = tl.description.match(/\((\d{4}-\d{2})\)/);
      period = m ? m[1] : '2026-06';
    }

    const matchedInvoice = invoices.find(i => String(i.property_id).toUpperCase() === String(propId).toUpperCase() && i.period === period);
    if (matchedInvoice) {
      tl.cross_doc_ref = `${matchedInvoice.number}-ADM`;
    } else {
      const prev = invoices.filter(i => String(i.property_id).toUpperCase() === String(propId).toUpperCase() && String(i.number).startsWith('CF-')).pop();
      const pCode = period.replace('-', '');
      const seq = prev ? prev.number.split('-')[2] : '000001';
      tl.cross_doc_ref = `CF-${pCode}-${seq}-ADM`;
    }
  }
}

const abonosMap = new Map();
const advancesByPropMap = new Map();

for (const tl of txLines) {
  const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (valAbono === 0) continue;
  if (causalityTxIds.has(tl.tx_id) && valAbono < 0) continue;

  const ref = String(tl.cross_doc_ref || '').trim().toUpperCase();
  const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));

  if (matchedInv) {
    abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
  } else if (ref.startsWith('CF-')) {
    const seq = ref.split('-')[2];
    const pid = propBySeq.get(seq);
    if (pid) {
      const pidKey = String(pid).toLowerCase();
      advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
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
  } else if (tl.description) {
    for (const p of props) {
      if (tl.description.includes(`Unidad ${p.code}`) || (p.name && tl.description.includes(p.name)) || (p.code && tl.description.includes(`- ${p.code}`))) {
        const pidKey = String(p.id).toLowerCase();
        advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
        break;
      }
    }
  }
}

// Ahora procesar facturas
const rows = [];
for (const inv of invoices) {
  const prop = propById.get(String(inv.property_id).toLowerCase());
  const invLines = allLines.filter(l => l.invoice_id === inv.id);
  const invNumber = String(inv.number || '').trim().toUpperCase();
  let generalAbono = abonosMap.get(invNumber) || 0;
  const pIdKey = String(inv.property_id).toLowerCase();
  let propAdvancePool = advancesByPropMap.get(pIdKey) || 0;

  for (const line of invLines) {
    const originalAmount = Number(line.amount || 0);
    const cCode = String(line.concept_code || '').trim().toUpperCase();
    const normDesc = String(line.description || '').toLowerCase();
    const isMora = cCode === 'MORA' || normDesc.includes('interes') || normDesc.includes('mora');
    const conceptCode = (cCode || (isMora ? 'MORA' : (normDesc.includes('admin') ? 'ADM' : 'GEN'))).toUpperCase();
    const specificRef = `${invNumber}-${conceptCode}`;
    let abonoAplicado = abonosMap.get(specificRef) || 0;

    if (generalAbono > 0) {
      const porAplicar = Math.min(generalAbono, Math.max(0, originalAmount - abonoAplicado));
      abonoAplicado += porAplicar;
      generalAbono -= porAplicar;
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
    } else if (inv.status === 'draft') {
      estado = 'borrador';
    } else {
      estado = 'vencido';
    }

    rows.push({
      amount: currentBalance,
      estado,
      propertyId: String(inv.property_id || '').toLowerCase()
    });
  }

  // Devolver el remanente de abono general de esta factura al pool de anticipos
  if (generalAbono > 0.01) {
    propAdvancePool += generalAbono;
    advancesByPropMap.set(pIdKey, propAdvancePool);
  }
}

// Agregar saldos a favor restantes
for (const [pIdKey, remAdvance] of advancesByPropMap.entries()) {
  if (remAdvance > 0.01) {
    rows.push({
      amount: -remAdvance,
      estado: 'saldo_a_favor',
      propertyId: pIdKey
    });
  }
}

let totalNetoCartera = 0;
for (const r of rows) {
  totalNetoCartera += r.amount;
}
totalNetoCartera = Math.round(totalNetoCartera);

const auxBalRow = db.prepare(`
  SELECT SUM(tl.debit - tl.credit) as bal
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  JOIN accounts a ON a.id = tl.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).get();

const auxBalance = Math.round(auxBalRow.bal);

console.log("=== RESULTADOS CON NUEVA NOMENCLATURA CF-YYYYMM-XXXXXX-ADM ===");
console.log(`Total Neto Cartera Calculado: ${totalNetoCartera}`);
console.log(`Total Libro Auxiliar (13459501): ${auxBalance}`);
console.log(`Diferencia: ${totalNetoCartera - auxBalance}`);

