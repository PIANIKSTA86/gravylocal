const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Let's implement the Cartera PH calculation from frontend/src/api.ts for a given cutoffDate
function calculateCartera(cutoffDate) {
  // Invoices up to cutoffDate
  const invoices = db.prepare(`
    SELECT phi.id, phi.number, phi.period, phi.date, phi.total, phi.property_id, phi.tx_id,
           prop.code as property_code, prop.name as property_name,
           tp.id as owner_id, tp.name as owner_name, tp.doc_number as owner_doc
    FROM ph_invoices phi
    LEFT JOIN ph_properties prop ON prop.id = phi.property_id
    LEFT JOIN third_parties tp ON tp.id = prop.owner_id
    WHERE phi.status != 'voided' AND phi.tx_id != ''
      AND phi.date <= ?
    ORDER BY phi.date ASC, phi.number ASC
  `).all(cutoffDate);

  const invIds = invoices.map(i => i.id);
  const invNumbers = invoices.map(i => String(i.number || '').toUpperCase());

  // Invoice lines
  const lines = db.prepare(`
    SELECT phl.id, phl.invoice_id, phl.concept_id, phl.amount,
           COALESCE(bc.name, 'Concepto') as concept_name
    FROM ph_invoice_lines phl
    LEFT JOIN ph_billing_concepts bc ON phl.concept_id = bc.id
    WHERE phl.invoice_id IN (${invIds.map(() => '?').join(',')})
  `).all(...invIds);

  const linesByInv = new Map();
  for (const l of lines) {
    if (!linesByInv.has(l.invoice_id)) linesByInv.set(l.invoice_id, []);
    linesByInv.get(l.invoice_id).push(l);
  }

  // All invoices (for CF references matching)
  const allInvs = db.prepare("SELECT id, number, property_id, period FROM ph_invoices WHERE status != 'voided'").all();

  // Properties
  const props = db.prepare("SELECT id, code, name FROM ph_properties").all();

  // Abonos
  // Account code 13% lines
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

  const causalityTxIds = new Set(invoices.map(i => i.tx_id));
  const abonosMap = new Map();
  const advancesByPropMap = new Map();

  for (const tl of txLines) {
    const isDebit = Number(tl.debit || 0) > 0;
    const txNum = String(tl.tx_num || '').toUpperCase();
    const isCausationDebit = isDebit && causalityTxIds.has(tl.tx_id) && !txNum.startsWith('RC-');
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
      const rawInv = allInvs.find(i => String(i.number || '').trim().toUpperCase() === baseInvNum);
      if (rawInv && rawInv.property_id) {
        const pidKey = String(rawInv.property_id).toLowerCase();
        advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + valAbono);
      }
    }
  }

  // Also check 28%
  const ant28 = db.prepare(`
    SELECT tl.credit, tl.debit, tl.cross_doc_ref
    FROM tx_lines tl
    JOIN transactions t ON tl.tx_id = t.id
    JOIN accounts a ON tl.account_id = a.id
    WHERE a.code LIKE '28%'
      AND t.date <= ?
      AND (t.status = 'posted' OR t.status = 'active')
  `).all(cutoffDate);
  for (const al of ant28) {
    const rawRef = String(al.cross_doc_ref || '').trim();
    let pId = '';
    if (rawRef.startsWith('ANT-')) pId = rawRef.substring(4);
    else if (rawRef.startsWith('ANTICIPO-')) pId = rawRef.split('-').slice(2).join('-');
    const net = (Number(al.credit) || 0) - (Number(al.debit) || 0);
    if (pId && net > 0) {
      const pidKey = pId.toLowerCase();
      advancesByPropMap.set(pidKey, (advancesByPropMap.get(pidKey) || 0) + net);
    }
  }

  // Now calculate rows per invoice and line
  // We can see how much each concept has
  return {
    invoicesCount: invoices.length,
    abonosCount: abonosMap.size,
    advancesCount: advancesByPropMap.size,
    totalAdvances: [...advancesByPropMap.values()].reduce((a, b) => a + b, 0)
  };
}

console.log('Testing cutoff 2026-06-30:', calculateCartera('2026-06-30'));
console.log('Testing cutoff 2026-11-20:', calculateCartera('2026-11-20'));
