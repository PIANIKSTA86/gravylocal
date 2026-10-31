const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

const props = db.prepare(`SELECT id, code, name, owner_id FROM ph_properties ORDER BY code ASC`).all();
const invs = db.prepare(`SELECT id, number, period, total, status, property_id FROM ph_invoices WHERE status != 'voided' ORDER BY period ASC, date ASC`).all();

const invsByProp = {};
for (const inv of invs) {
  if (!invsByProp[inv.property_id]) invsByProp[inv.property_id] = [];
  invsByProp[inv.property_id].push(inv);
}

const c13 = db.prepare(`
  SELECT l.id, t.number as tx_num, t.date, l.debit, l.credit, l.cross_doc_ref, l.description
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

const invByNum = Object.fromEntries(invs.map(i => [String(i.number).trim().toUpperCase(), i]));

const unitsData = {};
for (const p of props) {
  unitsData[p.id] = {
    id: p.id,
    code: p.code,
    name: p.name,
    invoices: invsByProp[p.id] || [],
    advancesPool: 0,
    abonosPorFactura: {},
    totalDebits: 0,
    totalCredits: 0,
    anticipoDetails: []
  };
}

for (const l of c13) {
  let matchedPropId = null;
  const ref = String(l.cross_doc_ref || '').trim().toUpperCase();
  let isAnt = false;

  if (ref.startsWith('ANT-')) {
    matchedPropId = ref.substring(4).toLowerCase();
    isAnt = true;
  } else if (ref.startsWith('ANTICIPO-')) {
    const parts = ref.split('-');
    if (parts.length >= 3) matchedPropId = parts.slice(2).join('-').toLowerCase();
    isAnt = true;
  } else if (ref) {
    const baseInvNum = ref.split('-').slice(0, 3).join('-');
    const inv = invByNum[baseInvNum] || invByNum[ref];
    if (inv) matchedPropId = inv.property_id;
  }

  if (!matchedPropId && l.description) {
    for (const p of props) {
      if (l.description.indexOf('Unidad ' + p.code) !== -1 || l.description.indexOf(p.name) !== -1) {
        matchedPropId = p.id;
        break;
      }
    }
  }

  if (matchedPropId && unitsData[matchedPropId]) {
    const u = unitsData[matchedPropId];
    u.totalDebits += Number(l.debit || 0);
    u.totalCredits += Number(l.credit || 0);
    if (isAnt) {
      u.advancesPool += Number(l.credit || 0);
      u.anticipoDetails.push({ tx: l.tx_num, ref: l.cross_doc_ref, cred: l.credit });
    } else if (ref) {
      const baseInvNum = ref.split('-').slice(0, 3).join('-');
      u.abonosPorFactura[baseInvNum] = (u.abonosPorFactura[baseInvNum] || 0) + Number(l.credit || 0);
    }
  }
}

// Ahora simulamos la amortización FIFO de anticipos sobre facturas
const unitsWithUnusedAdvance = [];

for (const p of props) {
  const u = unitsData[p.id];
  let remAdvance = u.advancesPool;
  let totalFacturado = 0;
  let totalPendiente = 0;

  for (const inv of u.invoices) {
    const invTotal = Number(inv.total || 0);
    totalFacturado += invTotal;
    const invNum = String(inv.number).trim().toUpperCase();
    const abonoDirecto = u.abonosPorFactura[invNum] || 0;
    let invBal = Math.max(0, invTotal - abonoDirecto);

    if (remAdvance > 0 && invBal > 0) {
      const amort = Math.min(remAdvance, invBal);
      invBal -= amort;
      remAdvance -= amort;
    }
    totalPendiente += invBal;
  }

  const saldoNetoContable = u.totalDebits - u.totalCredits;

  if (remAdvance > 0 || saldoNetoContable < 0) {
    unitsWithUnusedAdvance.push({
      code: u.code,
      name: u.name,
      totalFacturado,
      advancesPool: u.advancesPool,
      remAdvance,
      totalPendiente,
      saldoNetoContable,
      anticipos: u.anticipoDetails
    });
  }
}

console.log(`=== UNIDADES CON SALDO A FAVOR / ANTICIPOS NO APLICADOS (Excedentes de Recaudo) ===`);
console.log(`Total unidades con excedente no absorbido por facturas: ${unitsWithUnusedAdvance.length}`);
console.table(unitsWithUnusedAdvance.map(x => ({
  Unidad: x.code,
  Nombre: x.name,
  Facturado: x.totalFacturado,
  AnticiposTotal: x.advancesPool,
  AnticipoRemanente: x.remAdvance,
  SaldoCarteraFacturas: x.totalPendiente,
  SaldoNetoLibro: x.saldoNetoContable
})));

