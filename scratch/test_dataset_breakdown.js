const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Let's inspect the active and canceled rows in _getPhCarteraDataset logic
const invoices = db.prepare(`SELECT * FROM ph_invoices WHERE status != 'voided' AND tx_id != '' ORDER BY period ASC, date ASC`).all();
const invNumbers = invoices.map(i => String(i.number || '').toUpperCase().trim());

const txLines = db.prepare(`
  SELECT l.id, l.tx_id, t.number as tx_num, t.date, l.debit, l.credit, l.cross_doc_ref, l.description
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

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

const allLines = db.prepare(`
  SELECT l.*, c.code as concept_code, c.name as concept_name
  FROM ph_invoice_lines l
  LEFT JOIN ph_billing_concepts c ON c.id = l.concept_id
`).all();

let totalCancelado = 0;
let totalPendiente = 0;
let totalAbonado = 0;
let totalOriginal = 0;

for (const inv of invoices) {
  const invNumber = String(inv.number || '').trim().toUpperCase();
  let generalAbono = abonosMap.get(invNumber) || 0;
  const invLines = allLines.filter(l => l.invoice_id === inv.id);

  for (const line of invLines) {
    const orig = Number(line.amount || 0);
    totalOriginal += orig;
    let abonoAplicado = 0;
    if (generalAbono > 0) {
      const porAplicar = Math.min(generalAbono, orig);
      abonoAplicado += porAplicar;
      generalAbono -= porAplicar;
    }
    const bal = orig - abonoAplicado;
    totalAbonado += abonoAplicado;
    if (bal < 0.01) {
      totalCancelado += abonoAplicado;
    } else {
      totalPendiente += bal;
    }
  }
}

console.log('Total Original:', totalOriginal);
console.log('Total Cancelado (Líneas 100% pagadas):', totalCancelado);
console.log('Total Pendiente:', totalPendiente);
console.log('Cancelado + Pendiente:', totalCancelado + totalPendiente);

