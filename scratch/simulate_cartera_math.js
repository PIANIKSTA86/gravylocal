const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Load properties, accounts, invoices, tx_lines
const properties = db.prepare("SELECT * FROM ph_properties").all();
const propById = new Map(properties.map(p => [p.id, p]));
const propBySeq = new Map();

// Map sequence number to property
const allInvs = db.prepare("SELECT * FROM ph_invoices WHERE status != 'voided'").all();
for (const inv of allInvs) {
  if (inv.number && inv.number.startsWith('CF-')) {
    const seq = inv.number.split('-')[2];
    if (seq && !propBySeq.has(seq)) {
      propBySeq.set(seq, inv.property_id);
    }
  }
}

// Invoices up to cutoff 2026-09-30
const cutoffInvs = allInvs.filter(i => (i.date || i.created) <= '2026-09-30');
const invNumbers = cutoffInvs.map(i => i.number.toUpperCase().trim());

// Get all 13% credit lines up to 2026-09-30
const creditLines = db.prepare(`
  SELECT tl.*, t.number AS tx_number, t.date AS tx_date, t.teso_params
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  JOIN accounts a ON a.id = tl.account_id
  WHERE t.status = 'active'
    AND a.code LIKE '13%'
    AND t.date <= '2026-09-30'
    AND tl.credit > 0
`).all();

// Simulate new cross_doc_ref for all lines
const abonosMap = new Map();
const advancesByPropMap = new Map();

for (const tl of creditLines) {
  const val = Number(tl.credit || 0);
  let ref = String(tl.cross_doc_ref || '').toUpperCase().trim();

  // If this line was an ANTICIPO- or ANT-, what is its new ref?
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

    const matchedInvoice = allInvs.find(i => i.property_id === propId && i.period === period);
    if (matchedInvoice) {
      ref = `${matchedInvoice.number}-ADM`;
    } else {
      const prev = allInvs.filter(i => i.property_id === propId && i.number.startsWith('CF-')).pop();
      const pCode = period.replace('-', '');
      const seq = prev ? prev.number.split('-')[2] : '000001';
      ref = `CF-${pCode}-${seq}-ADM`;
    }
  }

  // Now process ref
  const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));
  if (matchedInv) {
    abonosMap.set(ref, (abonosMap.get(ref) || 0) + val);
  } else {
    // It's a credit for a future period (e.g. CF-202611-000090-ADM)
    let pId = null;
    if (ref.startsWith('CF-')) {
      const seq = ref.split('-')[2];
      pId = propBySeq.get(seq);
    }
    if (!pId && tl.teso_params) {
      try {
        const tp = JSON.parse(tl.teso_params);
        if (tp.ph_property_id) pId = tp.ph_property_id;
      } catch (_) {}
    }
    if (pId) {
      const pidKey = pId.toLowerCase();
      advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + val);
    }
  }
}

// Compute Cartera PH
let grandTotal = 0;
let totalAbonadoGlobal = 0;
let totalFacturadoGlobal = 0;

for (const inv of cutoffInvs) {
  const pIdKey = String(inv.property_id).toLowerCase();
  let propAdvancePool = advancesByPropMap.get(pIdKey) || 0;
  const invNumber = inv.number.toUpperCase().trim();

  // Find lines for this invoice
  const lines = db.prepare("SELECT * FROM ph_invoice_lines WHERE invoice_id = ?").all(inv.id);
  for (const l of lines) {
    const orig = Number(l.amount || 0);
    totalFacturadoGlobal += orig;
    const specRef = `${invNumber}-ADM`;
    let abono = abonosMap.get(specRef) || 0;
    // general invoice abono
    const gen = abonosMap.get(invNumber) || 0;
    abono += gen;

    let bal = orig - abono;
    if (propAdvancePool > 0 && bal > 0) {
      const apply = Math.min(propAdvancePool, bal);
      bal -= apply;
      abono += apply;
      propAdvancePool -= apply;
      advancesByPropMap.set(pIdKey, propAdvancePool);
    }
    totalAbonadoGlobal += abono;
    grandTotal += bal;
  }
}

// Subtract remaining unabsorbed advances
let leftoverAdvTotal = 0;
for (const [pid, rem] of advancesByPropMap.entries()) {
  if (rem > 0.01) {
    leftoverAdvTotal += rem;
    grandTotal -= rem;
  }
}

console.log(`Total Facturado: $${totalFacturadoGlobal}`);
console.log(`Total Saldos a favor restantes: -$${leftoverAdvTotal}`);
console.log(`Total Cartera Neta Calculada: $${grandTotal}`);
console.log(`Objetivo Libro Auxiliar:       $121600388`);
console.log(`Diferencia:                   $${grandTotal - 121600388}`);

