const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const propertyId = 'irn3n29wsptj0n6';
const toPeriod = '2026-09-30';

let filter = "status!='voided' AND tx_id!=''";
if (propertyId) filter += ` AND property_id='${propertyId}'`;

let invoices = db.prepare(`SELECT * FROM ph_invoices WHERE ${filter} ORDER BY date DESC`).all();
console.log('Invoices retrieved:', invoices.length);

let cutoffDate = toPeriod;
if (cutoffDate) {
  invoices = invoices.filter(inv => {
    const invDate = (inv.date || '').slice(0, 10);
    return invDate <= cutoffDate;
  });
}
console.log('Invoices after cutoff filter:', invoices.length);

const allInvLines = [];
for (const inv of invoices) {
  const lns = db.prepare(`SELECT l.*, c.code as concept_code, c.name as concept_name FROM ph_invoice_lines l LEFT JOIN ph_billing_concepts c ON l.concept_id = c.id WHERE l.invoice_id = ?`).all(inv.id);
  allInvLines.push(...lns);
}
console.log('Total invoice lines:', allInvLines.length);

const invNumbers = invoices.map(i => String(i.number || "").toUpperCase()).filter(Boolean);
const causalityTxIds = new Set(invoices.map(i => i.tx_id).filter(Boolean));
const abonosMap = new Map();
const advancesByPropMap = new Map();

const properties = db.prepare(`SELECT * FROM ph_properties`).all();
const propById = new Map(properties.map(p => [String(p.id).toLowerCase(), p]));

const txLines = db.prepare(`SELECT l.*, a.code as account_code, t.date as tx_date, t.status as tx_status FROM tx_lines l JOIN accounts a ON l.account_id = a.id JOIN transactions t ON l.tx_id = t.id WHERE a.code LIKE '13%' AND t.date <= '${cutoffDate}' AND (t.status = 'posted' OR t.status = 'active')`).all();

console.log('txLines total:', txLines.length);

for (const tl of txLines) {
  const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (valAbono <= 0) continue; // Un abono o anticipo contable en cuenta 13 siempre es un CRÉDITO neto

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
    if (!pidKey && tl.description) {
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
  } else if (tl.description) {
    for (const p of properties) {
      if (tl.description.includes(`Unidad ${p.code}`) || (p.name && tl.description.includes(p.name))) {
        const pidKey = String(p.id).toLowerCase();
        advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
        break;
      }
    }
  }
}

console.log('abonosMap:');
for (const [k, v] of abonosMap.entries()) console.log(' ', k, '=>', v);
console.log('--- Checking where negative numbers come from for irn3n29wsptj0n6 ---');
for (const tl of txLines) {
  const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
  if (valAbono <= 0) continue; // Un abono o anticipo contable en cuenta 13 siempre es un CRÉDITO neto

  const ref = String(tl.cross_doc_ref || "").trim().toUpperCase();
  const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + "-"));

  if (!matchedInv) {
    let pidKey = "";
    if (ref.startsWith("CF-")) {
      const parts = ref.split("-");
      if (parts.length >= 3) {
        const seq = parts[2];
        const matchPrior = invoices.find(inv => String(inv.number || "").includes(`-${seq}`));
        if (matchPrior && matchPrior.property_id) {
          pidKey = String(matchPrior.property_id).toLowerCase();
        }
      }
      if (!pidKey && tl.description) {
        for (const p of properties) {
          if (tl.description.includes(`Unidad ${p.code}`) || (p.name && tl.description.includes(p.name)) || (p.code && tl.description.includes(`- ${p.code}`))) {
            pidKey = String(p.id).toLowerCase();
            break;
          }
        }
      }
    } else if (tl.description) {
      for (const p of properties) {
        if (tl.description.includes(`Unidad ${p.code}`) || (p.name && tl.description.includes(p.name))) {
          pidKey = String(p.id).toLowerCase();
          break;
        }
      }
    }
    if (pidKey === propertyId) {
      console.log('Line matched to unit 2603! tl.id:', tl.id, 'tx_id:', tl.tx_id, 'ref:', ref, 'debit:', tl.debit, 'credit:', tl.credit, 'valAbono:', valAbono, 'desc:', tl.description);
    }
  }
}


for (const [k, v] of advancesByPropMap.entries()) console.log(' ', k, '=>', v);

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

console.log('advancesByPropMap after invoice loop:');
for (const [k, v] of advancesByPropMap.entries()) console.log(' ', k, '=>', v);

for (const [pIdKey, remAdvance] of advancesByPropMap.entries()) {
  console.log(`Checking advance for ${pIdKey}: remAdvance=${remAdvance}, propertyId=${propertyId}`);
  if (remAdvance > 0.01) {
    if (propertyId && String(propertyId).toLowerCase() !== pIdKey) {
      console.log('Skipping due to propertyId mismatch!');
      continue;
    }
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

console.log('Total rows generated:', rows.length);
console.table(rows);
