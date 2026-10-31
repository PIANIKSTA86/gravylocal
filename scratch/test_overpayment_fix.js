const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const db = new DatabaseSync(dbPath);

const propId = 'irn3n29wsptj0n6';
const cutoffDate = '2026-09-30';

const prop = db.prepare("SELECT * FROM ph_properties WHERE id = ?").get(propId);
const invoices = db.prepare("SELECT * FROM ph_invoices WHERE property_id = ? AND date <= ? AND status != 'voided' ORDER BY date ASC, number ASC").all(propId, cutoffDate);
const invIds = invoices.map(i => i.id);
const invNumbers = invoices.map(i => i.number.toUpperCase().trim());

const lines = db.prepare("SELECT * FROM ph_invoice_lines WHERE invoice_id IN (" + invIds.map(id => `'${id}'`).join(',') + ")").all();

const txLines = db.prepare(`
  SELECT tl.*, t.number as tx_num, t.date, t.teso_params
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  JOIN accounts a ON a.id = tl.account_id
  WHERE a.code LIKE '13%' AND t.status = 'active' AND t.date <= ?
`).all(cutoffDate);

const abonosMap = new Map();
const advancesByPropMap = new Map();

for (const tl of txLines) {
  const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (valAbono === 0) continue;

  const ref = String(tl.cross_doc_ref || "").trim().toUpperCase();
  const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + "-"));

  if (matchedInv) {
    abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
  } else if (ref.startsWith("CF-")) {
    const parts = ref.split("-");
    let pidKey = "";
    if (parts.length >= 3) {
      const seq = parts[2];
      const matchPrior = invoices.find(inv => String(inv.number || "").includes(`-${seq}`));
      if (matchPrior && matchPrior.property_id) {
        pidKey = String(matchPrior.property_id).toLowerCase();
      }
    }
    if (pidKey) {
      advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
    }
  }
}

console.log('abonosMap on CF-202609-000078-ADM:', abonosMap.get('CF-202609-000078-ADM'));

// Process invoices with overpayment capture
const rows = [];
const pIdKey = propId.toLowerCase();
let propAdvancePool = advancesByPropMap.get(pIdKey) || 0;

for (const inv of invoices) {
  const invNumber = String(inv.number || "").trim().toUpperCase();
  const invLines = lines.filter(l => l.invoice_id === inv.id);
  let generalAbono = abonosMap.get(invNumber) || 0;

  for (const line of invLines) {
    const originalAmount = Number(line.amount || 0);
    const conceptCode = "ADM";
    const specificRef = `${invNumber}-${conceptCode}`;
    let abonoAplicado = abonosMap.get(specificRef) || 0;

    if (generalAbono > 0) {
      const porAplicar = Math.min(generalAbono, Math.max(0, originalAmount - abonoAplicado));
      abonoAplicado += porAplicar;
      generalAbono -= porAplicar;
    }

    // Capture overpayment!
    if (abonoAplicado > originalAmount) {
      const overpayment = abonoAplicado - originalAmount;
      abonoAplicado = originalAmount;
      propAdvancePool += overpayment;
      advancesByPropMap.set(pIdKey, propAdvancePool);
    }

    let currentBalance = originalAmount - abonoAplicado;
    if (propAdvancePool > 0 && currentBalance > 0) {
      const porAmortizar = Math.min(propAdvancePool, currentBalance);
      currentBalance -= porAmortizar;
      abonoAplicado += porAmortizar;
      propAdvancePool -= porAmortizar;
      advancesByPropMap.set(pIdKey, propAdvancePool);
    }

    let estado = "por_vencer";
    if (currentBalance < 1) {
      estado = "cancelado";
    }

    rows.push({
      invNumber,
      concept: line.description,
      originalAmount,
      abono: abonoAplicado,
      amount: currentBalance,
      estado
    });
  }
}

// Add unabsorbed advance for unit 2603
for (const [pid, remAdvance] of advancesByPropMap.entries()) {
  if (remAdvance > 0.01) {
    rows.push({
      invNumber: 'ANTICIPO',
      concept: 'Cuota de administración',
      originalAmount: 0,
      abono: remAdvance,
      amount: -remAdvance,
      estado: 'saldo_a_favor'
    });
  }
}

console.log('Resulting Rows for 2603:');
console.table(rows);
const activeRows = rows.filter(r => r.estado !== 'cancelado');
console.log('Active (non-cancelled) rows for 2603:');
console.table(activeRows);

