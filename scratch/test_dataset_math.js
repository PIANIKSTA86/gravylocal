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
      if (tl.description.includes(`Unidad ${p.code}`) || (p.name && tl.description.includes(p.name))) {
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
    if (currentBalance < 1) estado = 'cancelado';

    rows.push({
      propertyId: inv.property_id,
      propertyCode: prop?.code || '',
      propertyName: prop?.name || '',
      amount: currentBalance,
      estado,
      conceptoId: isMora ? 'INTERES DE MORA' : 'CUOTA DE ADMINISTRACION',
    });
  }

  // Si sobró abono general que no se agotó en las líneas de esta factura:
  if (generalAbono > 0) {
    // Se agrega al advance pool de la unidad para las siguientes facturas
    propAdvancePool += generalAbono;
    advancesByPropMap.set(pIdKey, propAdvancePool);
  }
}

// Incorporar saldos a favor (anticipos no absorbidos) bajo Cuota de Administración
for (const [pIdKey, remAdvance] of advancesByPropMap.entries()) {
  if (remAdvance > 0.01) {
    const prop = propById.get(pIdKey);
    rows.push({
      propertyId: prop?.id || pIdKey,
      propertyCode: prop?.code || '',
      propertyName: prop?.name || '',
      amount: -remAdvance,
      estado: 'saldo_a_favor',
      conceptoId: 'CUOTA DE ADMINISTRACION',
    });
  }
}

let totalNetCartera = 0;
for (const r of rows) {
  totalNetCartera += r.amount;
}

console.log('Total Neto Cartera Calculado:', Math.round(totalNetCartera));
console.log('Total Libro Auxiliar (13459501):', 121600388);
console.log('Diferencia:', Math.round(totalNetCartera) - 121600388);

