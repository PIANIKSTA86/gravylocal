const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

const props = db.prepare(`SELECT * FROM ph_properties ORDER BY code ASC`).all();
const propById = new Map(props.map(p => [p.id, p]));

const invoices = db.prepare(`SELECT * FROM ph_invoices WHERE status != 'voided' ORDER BY period ASC, date ASC`).all();

const allLines = db.prepare(`
  SELECT l.*, c.code as concept_code, c.name as concept_name
  FROM ph_invoice_lines l
  LEFT JOIN ph_billing_concepts c ON c.id = l.concept_id
`).all();

const c13 = db.prepare(`
  SELECT l.id, t.number as tx_num, t.date, l.debit, l.credit, l.cross_doc_ref, l.description
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

const abonosMap = new Map();
const advancesByPropMap = new Map();

for (const l of c13) {
  const net = (l.credit || 0) - (l.debit || 0);
  if (net <= 0) continue;
  const ref = String(l.cross_doc_ref || '').trim().toUpperCase();
  if (ref.startsWith('ANTICIPO-')) {
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
        abonosMap.set(invNum, (abonosMap.get(invNum) || 0) + net);
      } else {
        const pidKey = pId.toLowerCase();
        advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + net);
      }
    }
  } else if (ref.startsWith('ANT-')) {
    const pidKey = ref.substring(4).toLowerCase();
    advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + net);
  } else if (ref) {
    abonosMap.set(ref, (abonosMap.get(ref) || 0) + net);
  }
}

const rows = [];
for (const inv of invoices) {
  const prop = propById.get(inv.property_id);
  const invLines = allLines.filter(l => l.invoice_id === inv.id);
  const invNumber = String(inv.number || '').trim().toUpperCase();
  let generalAbono = abonosMap.get(invNumber) || 0;
  const pIdKey = String(inv.property_id).toLowerCase();
  let propAdvancePool = advancesByPropMap.get(pIdKey) || 0;

  for (const line of invLines) {
    const originalAmount = Number(line.amount || 0);
    const cCode = String(line.concept_code || '').trim().toUpperCase();
    const specificRef = `${invNumber}-${cCode}`;
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

    const normalizedConcepto = 'Cuota de administración';
    const normalizedConceptId = 'CUOTA DE ADMINISTRACION';

    rows.push({
      invoice: inv,
      propertyId: inv.property_id,
      propertyCode: prop?.code || '',
      propertyName: prop?.name || '',
      amount: currentBalance,
      estado,
      conceptoId: cCode === 'MORA' ? 'INTERES DE MORA' : 'CUOTA DE ADMINISTRACION',
      concepto: cCode === 'MORA' ? 'Interés de mora' : 'Cuota de administración',
    });
  }
}

// Incorporar saldos a favor no absorbidos
for (const [pIdKey, remAdvance] of advancesByPropMap.entries()) {
  if (remAdvance > 0.01) {
    const prop = propById.get(pIdKey);
    rows.push({
      invoice: { id: `ADV-${pIdKey}`, number: 'ANTICIPO', period: 'Anticipo' },
      propertyId: pIdKey,
      propertyCode: prop?.code || '',
      propertyName: prop?.name || '',
      amount: -remAdvance,
      estado: 'saldo_a_favor',
      conceptoId: 'CUOTA DE ADMINISTRACION',
      concepto: 'Cuota de administración',
    });
  }
}

// Ahora evaluamos el consolidado por unidad habitacional
const byUnit = new Map();
for (const r of rows) {
  if (r.estado === 'cancelado') continue;
  const key = r.propertyId;
  if (!byUnit.has(key)) {
    byUnit.set(key, {
      code: r.propertyCode,
      name: r.propertyName,
      adm: 0,
      mora: 0,
      total: 0
    });
  }
  const u = byUnit.get(key);
  if (r.conceptoId === 'CUOTA DE ADMINISTRACION') u.adm += r.amount;
  else if (r.conceptoId === 'INTERES DE MORA') u.mora += r.amount;
  u.total += r.amount;
}

console.log(`Total unidades con saldo activo (deuda o saldo a favor): ${byUnit.size}`);

let sumAdm = 0;
let sumMora = 0;
let sumTotal = 0;
let creditUnitsCount = 0;
let totalCredits = 0;

for (const u of byUnit.values()) {
  sumAdm += u.adm;
  sumMora += u.mora;
  sumTotal += u.total;
  if (u.total < 0) {
    creditUnitsCount++;
    totalCredits += Math.abs(u.total);
    console.log(`  Unidad ${u.code} (${u.name}): Cuota Adm=$${u.adm.toLocaleString('es-CO')} | Mora=$${u.mora.toLocaleString('es-CO')} | TOTAL=$${u.total.toLocaleString('es-CO')}`);
  }
}

console.log('\n=== RESULTADO CONSOLIDADO ===');
console.log(`Total Cuota Administración: $${sumAdm.toLocaleString('es-CO')}`);
console.log(`Total Intereses de Mora: $${sumMora.toLocaleString('es-CO')}`);
console.log(`TOTAL GENERAL CARTERA PH NETA: $${sumTotal.toLocaleString('es-CO')}`);
console.log(`Unidades con saldo a favor: ${creditUnitsCount} (Total: $${totalCredits.toLocaleString('es-CO')})`);
console.log(`Libro Auxiliar 13459501: $121.600.388`);
console.log(`Diferencia con Libro Auxiliar: $${(sumTotal - 121600388).toLocaleString('es-CO')}`);

