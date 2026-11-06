const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Check the 5 units with credit balance
const props = db.prepare(`SELECT p.*, tp.name as owner_name, tp.doc_number as owner_doc FROM ph_properties p LEFT JOIN third_parties tp ON tp.id = p.owner_id`).all();
const propById = new Map(props.map(p => [p.id.toLowerCase(), p]));

const txLines = db.prepare(`
  SELECT l.*, t.number as tx_num, t.date, a.code as acc_code
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

const invoices = db.prepare(`SELECT * FROM ph_invoices WHERE status != 'voided' AND tx_id != ''`).all();
const invNumbers = invoices.map(i => String(i.number || '').toUpperCase().trim());

const abonosMap = new Map();
const advancesByPropMap = new Map();

for (const tl of txLines) {
  const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (valAbono === 0) continue;
  const ref = String(tl.cross_doc_ref || '').trim().toUpperCase();
  const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));
  if (matchedInv) {
    abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
  } else if (ref.startsWith('ANTICIPO-') || ref.startsWith('ANT-')) {
    let pId = ref.startsWith('ANTICIPO-') ? ref.split('-').slice(2).join('-') : ref.slice(4);
    advancesByPropMap.set(pId.toLowerCase(), (advancesByPropMap.get(pId.toLowerCase()) || 0) + valAbono);
  }
}

// Invoices balances
const unitBalances = new Map();
for (const p of props) {
  unitBalances.set(p.id.toLowerCase(), {
    code: p.code,
    name: p.name,
    owner: p.owner_name,
    deuda: 0,
    anticipo: 0,
    neto: 0,
  });
}

for (const inv of invoices) {
  const pId = String(inv.property_id).toLowerCase();
  const u = unitBalances.get(pId);
  if (!u) continue;
  const invNum = String(inv.number).toUpperCase().trim();
  const abono = abonosMap.get(invNum) || 0;
  const pend = Math.max(0, Number(inv.total || 0) - abono);
  u.deuda += pend;
}

for (const [pId, adv] of advancesByPropMap.entries()) {
  const u = unitBalances.get(pId);
  if (u) {
    u.anticipo += adv;
  }
}

const creditUnits = [];
let totalDeuda = 0;
let totalAnticipos = 0;

for (const u of unitBalances.values()) {
  u.neto = u.deuda - u.anticipo;
  totalDeuda += u.deuda;
  totalAnticipos += u.anticipo;
  if (u.anticipo > 0 || u.neto < 0) {
    creditUnits.push(u);
  }
}

console.log('Total Deuda Calculada:', totalDeuda);
console.log('Total Anticipos Calculados:', totalAnticipos);
console.log('Unidades con anticipos:', creditUnits.length);
console.table(creditUnits);

