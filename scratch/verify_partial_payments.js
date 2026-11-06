const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Let's compute the partial payments across non-canceled invoices/lines
const invoices = db.prepare(`SELECT * FROM ph_invoices WHERE status != 'voided' AND tx_id != ''`).all();
const invNumbers = invoices.map(i => String(i.number || '').toUpperCase().trim());

const txLines = db.prepare(`
  SELECT l.id, l.tx_id, t.number as tx_num, t.date, l.debit, l.credit, l.cross_doc_ref, l.description
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

const abonosMap = new Map();
for (const tl of txLines) {
  const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (valAbono === 0) continue;
  const ref = String(tl.cross_doc_ref || '').trim().toUpperCase();
  const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));
  if (matchedInv) {
    abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
  }
}

const allLines = db.prepare(`SELECT * FROM ph_invoice_lines`).all();

let abonosParciales = 0;
let abonosCanceladas = 0;
let pendientesTotal = 0;

for (const inv of invoices) {
  const invNumber = String(inv.number || '').trim().toUpperCase();
  let generalAbono = abonosMap.get(invNumber) || 0;
  const invLines = allLines.filter(l => l.invoice_id === inv.id);

  for (const line of invLines) {
    const orig = Number(line.amount || 0);
    let abono = 0;
    if (generalAbono > 0) {
      const take = Math.min(generalAbono, orig);
      abono += take;
      generalAbono -= take;
    }
    const bal = orig - abono;
    if (bal < 0.01) {
      abonosCanceladas += orig;
    } else {
      pendientesTotal += bal;
      if (abono > 0) {
        abonosParciales += abono;
      }
    }
  }
}

console.log('Abonos en facturas 100% canceladas:', abonosCanceladas);
console.log('Abonos parciales en facturas aún pendientes:', abonosParciales);
console.log('Pendiente restante:', pendientesTotal);
console.log('Suma de Abonos 100% + Abonos Parciales + Pendiente:', abonosCanceladas + abonosParciales + pendientesTotal);
console.log('Total Facturación Bruta:', invoices.reduce((s, i) => s + (i.total || 0), 0));
console.log('Diferencia esperada ($10.947.282) vs Abonos Parciales + Anticipos:', 274167825 - (141620155 + 121600388));

