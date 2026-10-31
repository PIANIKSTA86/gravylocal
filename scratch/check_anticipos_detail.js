const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

// 1. Obtener todas las propiedades
const props = db.prepare(`SELECT id, code, name, owner_id FROM ph_properties ORDER BY code ASC`).all();
const propById = Object.fromEntries(props.map(p => [p.id, p]));

// 2. Facturas por propiedad
const invs = db.prepare(`SELECT id, number, period, total, status, property_id FROM ph_invoices WHERE status != 'voided'`).all();
const invsByProp = {};
for (const inv of invs) {
  if (!invsByProp[inv.property_id]) invsByProp[inv.property_id] = [];
  invsByProp[inv.property_id].push(inv);
}

// 3. Movimientos contables 13459501
const c13 = db.prepare(`
  SELECT l.id, l.tx_id, t.number as tx_num, t.date, l.debit, l.credit, l.description, l.cross_doc_ref, l.third_party_id
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

const invByNum = Object.fromEntries(invs.map(i => [String(i.number).trim().toUpperCase(), i]));

const unitStats = {};
for (const p of props) {
  unitStats[p.id] = {
    code: p.code,
    name: p.name,
    facturado: 0,
    recaudadoNormal: 0,
    anticipos: 0,
    totalCreditos: 0,
    totalDebitos: 0,
    netBal: 0,
    anticipoLines: []
  };
}

for (const inv of invs) {
  if (unitStats[inv.property_id]) {
    unitStats[inv.property_id].facturado += Number(inv.total || 0);
  }
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

  if (matchedPropId && unitStats[matchedPropId]) {
    unitStats[matchedPropId].totalDebitos += Number(l.debit || 0);
    unitStats[matchedPropId].totalCreditos += Number(l.credit || 0);
    if (isAnt) {
      unitStats[matchedPropId].anticipos += Number(l.credit || 0);
      unitStats[matchedPropId].anticipoLines.push({
        tx: l.tx_num,
        date: l.date,
        credit: l.credit,
        ref: l.cross_doc_ref,
        desc: l.description
      });
    } else {
      unitStats[matchedPropId].recaudadoNormal += Number(l.credit || 0);
    }
  }
}

// Calcular saldos netos
const unitsWithAnticipos = [];
const unitsWithSaldoAFavor = [];

for (const p of props) {
  const st = unitStats[p.id];
  st.netBal = Math.round((st.totalDebitos - st.totalCreditos) * 100) / 100;
  if (st.anticipos > 0) unitsWithAnticipos.push(st);
  if (st.netBal < 0) unitsWithSaldoAFavor.push(st);
}

console.log(`=== UNIDADES CON LÍNEAS DE ANTICIPO (ANT- / ANTICIPO-) ===`);
console.log(`Total unidades con anticipos registrados: ${unitsWithAnticipos.length}`);
console.log(`Total unidades con Saldo a Favor neto (netBal < 0): ${unitsWithSaldoAFavor.length}`);

console.log('\n--- TOP 10 UNIDADES CON MAYOR ANTICIPO REGISTRADO ---');
unitsWithAnticipos.sort((a, b) => b.anticipos - a.anticipos);
for (const u of unitsWithAnticipos.slice(0, 10)) {
  console.log(`Unidad ${u.code} (${u.name}): Facturado=$${u.facturado.toLocaleString('es-CO')} | RecaudoNormal=$${u.recaudadoNormal.toLocaleString('es-CO')} | Anticipos=$${u.anticipos.toLocaleString('es-CO')} | SaldoNetoLibro=$${u.netBal.toLocaleString('es-CO')}`);
}

console.log('\n--- UNIDADES CON SALDO A FAVOR NETO (SaldoNetoLibro < 0) ---');
for (const u of unitsWithSaldoAFavor) {
  console.log(`Unidad ${u.code} (${u.name}): SaldoNetoLibro=$${u.netBal.toLocaleString('es-CO')} (Anticipos: $${u.anticipos.toLocaleString('es-CO')})`);
}

