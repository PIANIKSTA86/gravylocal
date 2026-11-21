const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

function simulateCartera(cutoffDate) {
  // Read code from api.ts lines 6450-6815
  // We can replicate exact allocation:
  const invoices = db.prepare(`
    SELECT phi.id, phi.number, phi.period, phi.date, phi.due_date, phi.total, phi.property_id, phi.tx_id,
           prop.code as property_code, prop.name as property_name,
           tp.id as owner_id, tp.name as owner_name, tp.doc_number as owner_doc
    FROM ph_invoices phi
    LEFT JOIN ph_properties prop ON prop.id = phi.property_id
    LEFT JOIN third_parties tp ON tp.id = prop.owner_id
    WHERE phi.status != 'voided' AND phi.tx_id != ''
      AND phi.date <= ?
    ORDER BY phi.date ASC, phi.number ASC
  `).all(cutoffDate);

  const invIds = new Set(invoices.map(i => i.id));
  const rawLines = db.prepare(`
    SELECT phl.id, phl.invoice_id, phl.concept_id, phl.amount,
           COALESCE(bc.name, 'Concepto') as concept_name
    FROM ph_invoice_lines phl
    LEFT JOIN ph_billing_concepts bc ON phl.concept_id = bc.id
  `).all();
  const allInvLines = rawLines.filter(l => invIds.has(l.invoice_id));

  const linesByInvoiceId = new Map();
  for (const ln of allInvLines) {
    if (!linesByInvoiceId.has(ln.invoice_id)) linesByInvoiceId.set(ln.invoice_id, []);
    linesByInvoiceId.get(ln.invoice_id).push(ln);
  }

  const invNumbers = invoices.map(i => String(i.number || '').toUpperCase()).filter(Boolean);
  const causalityTxIds = new Set(invoices.map(i => i.tx_id).filter(Boolean));
  const abonosMap = new Map();
  const advancesByPropMap = new Map();

  const properties = db.prepare("SELECT id, code, name FROM ph_properties").all();
  const allInvoices = db.prepare("SELECT id, number, property_id, period FROM ph_invoices WHERE status != 'voided'").all();

  const txLines = db.prepare(`
    SELECT tl.id, tl.tx_id, tl.account_id, tl.debit, tl.credit, tl.cross_doc_ref, tl.description,
           t.number as tx_num, t.date as tx_date, a.code as account_code
    FROM tx_lines tl
    JOIN transactions t ON tl.tx_id = t.id
    JOIN accounts a ON tl.account_id = a.id
    WHERE a.code LIKE '13%'
      AND t.date <= ?
      AND (t.status = 'posted' OR t.status = 'active')
  `).all(cutoffDate);

  for (const tl of txLines) {
    const txIdStr = String(tl.tx_id || '');
    const isDebit = Number(tl.debit || 0) > 0;
    const txNum = String(tl.tx_num || '').toUpperCase();
    const isCausationDebit = isDebit && causalityTxIds.has(txIdStr) && !txNum.startsWith('RC-');
    if (isCausationDebit) continue;

    const valAbono = Number(tl.credit || 0) - Number(tl.debit || 0);
    if (Math.abs(valAbono) < 0.0001) continue;

    const ref = String(tl.cross_doc_ref || '').trim().toUpperCase();
    const matchedInv = invNumbers.find(num => ref === num || ref.startsWith(num + '-'));

    if (matchedInv) {
      abonosMap.set(ref, (abonosMap.get(ref) || 0) + valAbono);
    } else if (ref.startsWith('ANTICIPO-')) {
      const parts = ref.split('-');
      if (parts.length >= 3) {
        const pCode = parts[1];
        const pId = parts.slice(2).join('-');
        const targetInv = invoices.find(inv => {
          const invPCode = String(inv.period || '').replace('-', '');
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
    } else if (ref.startsWith('ANT-')) {
      const pidKey = ref.substring(4).toLowerCase();
      advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
    } else if (ref.startsWith('CF-')) {
      const baseInvNum = ref.split('-').slice(0, 3).join('-');
      const rawInv = allInvoices.find(i => String(i.number || '').trim().toUpperCase() === baseInvNum);
      if (rawInv && rawInv.property_id) {
        const pidKey = String(rawInv.property_id).toLowerCase();
        advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
      }
    }
  }

  // FIFO distribution per property
  const invsByProp = new Map();
  for (const inv of invoices) {
    const pid = String(inv.property_id).toLowerCase();
    if (!invsByProp.has(pid)) invsByProp.set(pid, []);
    invsByProp.get(pid).push(inv);
  }

  const rows = [];
  let grandCapital = 0;
  let grandMora = 0;
  let grandAnticipos = 0;

  for (const [pid, pInvs] of invsByProp.entries()) {
    let unallocatedAdvance = advancesByPropMap.get(pid) || 0;

    for (const inv of pInvs) {
      const invNum = String(inv.number || '').toUpperCase();
      let lines = linesByInvoiceId.get(inv.id) || [];
      const totalInv = Number(inv.total || 0);

      // Total payments directly for this invoice
      let directPayment = abonosMap.get(invNum) || 0;
      for (const [k, v] of abonosMap.entries()) {
        if (k.startsWith(invNum + '-')) directPayment += v;
      }

      // Check concept payments vs unassigned payments
      let pendingToCover = directPayment;
      // also if advance can cover:
      let advanceUsed = 0;
      let neededForInv = Math.max(0, totalInv - directPayment);
      if (unallocatedAdvance > 0 && neededForInv > 0) {
        advanceUsed = Math.min(unallocatedAdvance, neededForInv);
        unallocatedAdvance -= advanceUsed;
      }
      let totalPaidForInv = directPayment + advanceUsed;

      // Now allocate across lines (Interes de mora vs Cuota Adm)
      // Usually mora first or capital first depending on rules, let's see how api.ts does it:
      // Let's sort lines: capital then mora, or as in invoice
      let remainingPayment = totalPaidForInv;
      for (const ln of lines) {
        const amt = Number(ln.amount || 0);
        let paidLine = 0;
        // Check if there is specific payment by concept:
        const conceptRef = `${invNum}-${ln.concept_name.includes('MORA') ? 'MORA' : 'ADM'}`;
        // If api.ts uses generic allocation:
        const lineRemaining = Math.max(0, amt - remainingPayment);
        const allocated = Math.min(amt, remainingPayment);
        remainingPayment -= allocated;

        if (lineRemaining > 0) {
          if (ln.concept_name.includes('MORA')) {
            grandMora += lineRemaining;
          } else {
            grandCapital += lineRemaining;
          }
        }
      }
    }
    if (unallocatedAdvance > 0) {
      grandAnticipos += unallocatedAdvance;
    }
  }

  return {
    cutoffDate,
    grandCapital: Math.round(grandCapital),
    grandMora: Math.round(grandMora),
    grandSubtotal: Math.round(grandCapital + grandMora),
    grandAnticipos: Math.round(grandAnticipos),
    grandNeto: Math.round(grandCapital + grandMora - grandAnticipos),
  };
}

console.log('Result for 2026-06-30:', simulateCartera('2026-06-30'));
console.log('Result for 2026-07-31:', simulateCartera('2026-07-31'));
console.log('Result for 2026-11-20:', simulateCartera('2026-11-20'));
