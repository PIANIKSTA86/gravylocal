const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

// Compare unit by unit between test_unit_perfect_match and the simulation
const props = db.prepare(`SELECT * FROM ph_properties ORDER BY code ASC`).all();
const invs = db.prepare(`SELECT * FROM ph_invoices WHERE status != 'voided' AND tx_id != ''`).all();

const invByNum = new Map(invs.map(i => [String(i.number).trim().toUpperCase(), i]));
const invsByProp = new Map();
for (const inv of invs) {
  if (!invsByProp.has(inv.property_id)) invsByProp.set(inv.property_id, []);
  invsByProp.get(inv.property_id).push(inv);
}

const all13 = db.prepare(`
  SELECT l.id, l.tx_id, l.debit, l.credit, l.cross_doc_ref, l.description, l.third_party_id
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

const unitLedger = new Map();
for (const p of props) {
  unitLedger.set(p.id, { debits: 0, credits: 0, balance: 0 });
}

for (const l of all13) {
  let matchedPropId = null;
  const ref = String(l.cross_doc_ref || '').trim().toUpperCase();

  if (ref.startsWith('ANT-')) {
    matchedPropId = ref.substring(4).toLowerCase();
  } else if (ref.startsWith('ANTICIPO-')) {
    const parts = ref.split('-');
    if (parts.length >= 3) matchedPropId = parts.slice(2).join('-').toLowerCase();
  } else if (ref) {
    const baseInvNum = ref.split('-').slice(0, 3).join('-');
    const inv = invByNum.get(baseInvNum) || invByNum.get(ref);
    if (inv) matchedPropId = inv.property_id;
  }

  if (!matchedPropId && l.description) {
    for (const p of props) {
      if (l.description.includes(`Unidad ${p.code}`) || l.description.includes(p.name)) {
        matchedPropId = p.id;
        break;
      }
    }
  }

  if (!matchedPropId && l.third_party_id) {
    const ownerProps = props.filter(p => p.owner_id === l.third_party_id);
    if (ownerProps.length === 1) matchedPropId = ownerProps[0].id;
  }

  if (matchedPropId && unitLedger.has(matchedPropId)) {
    const entry = unitLedger.get(matchedPropId);
    entry.debits += Number(l.debit || 0);
    entry.credits += Number(l.credit || 0);
    entry.balance += (Number(l.debit || 0) - Number(l.credit || 0));
  }
}

// Ahora veamos qué calcula _getPhCarteraDataset para cada unidad
// ¿Por qué en la simulación anterior sumaba $124.237.145 en lugar de $121.600.388?
// Total facturado según invoices = sum(inv.total)
let totalInvoicedAll = 0;
for (const inv of invs) totalInvoicedAll += Number(inv.total || 0);

let totalCreditsAll = 0;
for (const p of props) totalCreditsAll += unitLedger.get(p.id).credits;

console.log('Total Facturado (ph_invoices):', totalInvoicedAll);
console.log('Total Créditos (recaudo 13459501):', totalCreditsAll);
console.log('Saldo Teórico = Facturado - Créditos:', totalInvoicedAll - totalCreditsAll);
console.log('Saldo Contable = Débitos - Créditos:', Array.from(unitLedger.values()).reduce((s, x) => s + x.balance, 0));

