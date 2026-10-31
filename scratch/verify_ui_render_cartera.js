const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

const props = db.prepare(`SELECT p.*, tp.name as owner_name, tp.doc_number as owner_doc FROM ph_properties p LEFT JOIN third_parties tp ON tp.id = p.owner_id ORDER BY p.code ASC`).all();
const propById = new Map(props.map(p => [p.id.toLowerCase(), p]));

const invoices = db.prepare(`SELECT * FROM ph_invoices WHERE status != 'voided' ORDER BY period ASC, date ASC`).all();

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
  WHERE a.code LIKE '13%' AND t.status = 'active'
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
    const isMora = cCode === 'MORA' || (line.description && line.description.toLowerCase().includes('mora'));
    const conceptCode = (cCode || (isMora ? 'MORA' : 'GEN')).toUpperCase();
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
      ownerName: prop?.owner_name || '',
      ownerDoc: prop?.owner_doc || '',
      amount: currentBalance,
      estado,
      conceptoId: isMora ? 'INTERES DE MORA' : 'CUOTA DE ADMINISTRACION',
      concepto: isMora ? 'Interés de mora' : 'Cuota de administración',
    });
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
      ownerName: prop?.owner_name || '',
      ownerDoc: prop?.owner_doc || '',
      amount: -remAdvance,
      estado: 'saldo_a_favor',
      conceptoId: 'CUOTA DE ADMINISTRACION',
      concepto: 'Cuota de administración',
    });
  }
}

// Consolidar por Unidad en la Grilla de Cartera
const byUnit = new Map();
const activeRows = rows.filter(r => r.estado !== 'cancelado');

for (const r of activeRows) {
  const uLabel = [r.propertyCode, r.propertyName].filter(Boolean).join(' - ') || 'Unidad';
  const unitKey = `${r.propertyId}|${uLabel}`;
  if (!byUnit.has(unitKey)) {
    byUnit.set(unitKey, {
      code: r.propertyCode,
      name: r.propertyName,
      unidad: uLabel,
      owner: r.ownerName,
      doc: r.ownerDoc,
      byConcept: {},
      total: 0
    });
  }
  const row = byUnit.get(unitKey);
  row.byConcept[r.conceptoId] = (row.byConcept[r.conceptoId] || 0) + r.amount;
  row.total += r.amount;
}

const finalRows = [...byUnit.values()].sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true }));

let grandDebits = 0;
let grandCredits = 0;
let creditUnitsCount = 0;
const creditList = [];

for (const r of finalRows) {
  if (r.total > 0) grandDebits += r.total;
  else if (r.total < -0.01) {
    grandCredits += Math.abs(r.total);
    creditUnitsCount++;
    creditList.push(r);
  }
}

const grandNet = grandDebits - grandCredits;

console.log('=== VERIFICACIÓN DE CARTERA PH CON ANTICIPOS EN CUOTA DE ADMINISTRACIÓN ===');
console.log(`Total Unidades con saldo (Deuda o Saldo a Favor): ${finalRows.length}`);
console.log(`Cartera Bruta CxC (Deuda): $${grandDebits.toLocaleString('es-CO')}`);
console.log(`Saldos a Favor (Anticipos 134595): -$${grandCredits.toLocaleString('es-CO')} (${creditUnitsCount} unidades)`);
console.log(`CARTERA NETA CONCILIADA: $${grandNet.toLocaleString('es-CO')}`);
console.log(`Libro Auxiliar 13459501: $121.600.388`);
console.log(`Diferencia: $${(grandNet - 121600388).toLocaleString('es-CO')}`);

console.log('\n--- DETALLE DE UNIDADES CON SALDO A FAVOR VISIBLES EN CARTERA PH ---');
console.table(creditList.map(u => ({
  Unidad: u.code,
  Inmueble: u.name,
  Propietario: u.owner,
  'Cuota de Administración': u.byConcept['CUOTA DE ADMINISTRACION'] ? `$${u.byConcept['CUOTA DE ADMINISTRACION'].toLocaleString('es-CO')}` : '$0',
  'Intereses de Mora': u.byConcept['INTERES DE MORA'] ? `$${u.byConcept['INTERES DE MORA'].toLocaleString('es-CO')}` : '$0',
  'Total General': `$${u.total.toLocaleString('es-CO')}`
})));

