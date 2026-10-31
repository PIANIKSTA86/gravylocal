const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const propertyId = '';
const toPeriod = '2026-09-30';

let filter = "status!='voided' AND tx_id!=''";

let invoices = db.prepare(`SELECT * FROM ph_invoices WHERE ${filter} ORDER BY date DESC`).all();

let cutoffDate = toPeriod;
if (cutoffDate) {
  invoices = invoices.filter(inv => {
    const invDate = (inv.date || '').slice(0, 10);
    return invDate <= cutoffDate;
  });
}

const allInvLines = [];
for (const inv of invoices) {
  const lns = db.prepare(`SELECT l.*, c.code as concept_code, c.name as concept_name FROM ph_invoice_lines l LEFT JOIN ph_billing_concepts c ON l.concept_id = c.id WHERE l.invoice_id = ?`).all(inv.id);
  allInvLines.push(...lns);
}

const invNumbers = invoices.map(i => String(i.number || "").toUpperCase()).filter(Boolean);
const abonosMap = new Map();
const advancesByPropMap = new Map();

const properties = db.prepare(`SELECT * FROM ph_properties`).all();
const propById = new Map(properties.map(p => [String(p.id).toLowerCase(), p]));

const txLines = db.prepare(`SELECT l.*, a.code as account_code, t.date as tx_date, t.status as tx_status FROM tx_lines l JOIN accounts a ON l.account_id = a.id JOIN transactions t ON l.tx_id = t.id WHERE a.code LIKE '13%' AND t.date <= '${cutoffDate}' AND (t.status = 'posted' OR t.status = 'active')`).all();

// Cargar todas las facturas del sistema para mapeo exacto de número de factura -> property_id
const allSystemInvs = db.prepare("SELECT number, property_id FROM ph_invoices WHERE status != 'voided'").all();
const systemInvToPropMap = new Map();
allSystemInvs.forEach(i => {
  if (i.number) systemInvToPropMap.set(String(i.number).toUpperCase().trim(), String(i.property_id).toLowerCase());
});

for (const tl of txLines) {
  const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (valAbono <= 0) continue; // Un abono o anticipo en cuenta 13 siempre es un crédito

  const ref = String(tl.cross_doc_ref || "").trim().toUpperCase();
  const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + "-"));

  if (matchedInv) {
    abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
  } else if (ref.startsWith("CF-")) {
    const baseInvNum = ref.replace(/-[A-Z0-9]+$/, '');
    const targetPropId = systemInvToPropMap.get(baseInvNum) || systemInvToPropMap.get(ref);
    if (targetPropId) {
      if (!propertyId || targetPropId === propertyId.toLowerCase()) {
        abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
      }
    } else {
      let pidKey = "";
      if (tl.description) {
        for (const p of properties) {
          if (tl.description.includes(`Unidad ${p.code}`) || (p.name && tl.description.includes(p.name)) || (p.code && tl.description.includes(`- ${p.code}`))) {
            pidKey = String(p.id).toLowerCase();
            break;
          }
        }
      }
      if (pidKey) {
        advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
      }
    }
  } else if (ref.startsWith("ANTICIPO-")) {
    const parts = ref.split("-");
    if (parts.length >= 3) {
      const pCode = parts[1];
      const pId = parts.slice(2).join("-");
      const targetInv = invoices.find(inv => {
        const invPCode = String(inv.period || "").replace("-", "");
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
  } else if (ref.startsWith("ANT-")) {
    const pidKey = ref.substring(4).toLowerCase();
    advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
  }
}

invoices.sort((a, b) => {
  const dA = String(a.date || "");
  const dB = String(b.date || "");
  return dA.localeCompare(dB) || String(a.number || "").localeCompare(String(b.number || ""));
});

const rows = [];
for (const inv of invoices) {
  const prop = propById.get(String(inv.property_id));
  const invLines = allInvLines.filter(l => l.invoice_id === inv.id);
  const invNumber = String(inv.number || "").trim().toUpperCase();
  let generalAbono = abonosMap.get(invNumber) || 0;
  const pIdKey = String(inv.property_id || "").toLowerCase();
  let propAdvancePool = advancesByPropMap.get(pIdKey) || 0;

  for (const line of invLines) {
    const originalAmount = Number(line.amount || 0);
    const cCode = String(line.concept_code || "").trim().toUpperCase();
    const normDesc = String(line.description || "").toLowerCase();
    const isMora = cCode === "MORA" || normDesc.includes("interes") || normDesc.includes("mora");
    const conceptCode = (cCode || (isMora ? "MORA" : (normDesc.includes("admin") ? "ADM" : "GEN"))).toUpperCase();
    const specificRef = `${invNumber}-${conceptCode}`;
    let abonoAplicado = abonosMap.get(specificRef) || 0;

    if (generalAbono > 0) {
      const porAplicar = Math.min(generalAbono, Math.max(0, originalAmount - abonoAplicado));
      abonoAplicado += porAplicar;
      generalAbono -= porAplicar;
    }

    if (abonoAplicado > originalAmount) {
      const surplus = abonoAplicado - originalAmount;
      abonoAplicado = originalAmount;
      propAdvancePool += surplus;
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
      amount: currentBalance,
      originalAmount,
      abono: abonoAplicado,
      estado
    });
  }

  if (generalAbono > 0) {
    propAdvancePool += generalAbono;
    advancesByPropMap.set(pIdKey, propAdvancePool);
  }
}

for (const [pIdKey, remAdvance] of advancesByPropMap.entries()) {
  if (remAdvance > 0.01) {
    rows.push({
      invNumber: 'ANTICIPO',
      concept: 'Cuota de administración',
      amount: -remAdvance,
      originalAmount: 0,
      abono: remAdvance,
      estado: 'saldo_a_favor'
    });
  }
}

console.log('Total rows for all properties:', rows.length);
let netBalance = 0;
for (const r of rows) {
  netBalance += r.amount;
}
console.log('Total Net Balance Cartera (to 2026-09-30):', netBalance);

const auxLines = db.prepare("SELECT SUM(debit) as d, SUM(credit) as c FROM tx_lines l JOIN accounts a ON l.account_id = a.id JOIN transactions t ON l.tx_id = t.id WHERE a.code LIKE '134595%' AND t.date <= '2026-09-30' AND (t.status = 'posted' OR t.status = 'active')").get();
console.log('Libro Auxiliar 134595 balance (to 2026-09-30):', (auxLines.d - auxLines.c));
console.log('Difference:', netBalance - (auxLines.d - auxLines.c));

