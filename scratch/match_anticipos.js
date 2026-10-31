const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const rows = db.prepare(`
  SELECT 
    tl.id,
    tl.tx_id,
    t.number AS tx_number,
    t.date AS tx_date,
    tl.cross_doc_ref,
    tl.debit,
    tl.credit,
    tl.description
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  WHERE t.status = 'active'
    AND (tl.cross_doc_ref LIKE 'ANTICIPO-%' OR tl.cross_doc_ref LIKE 'ANT-%')
  ORDER BY t.date ASC, t.number ASC
`).all();

console.log(`Analyzing ${rows.length} lines:`);
let matchedInvs = 0;
let unmatchedInvs = 0;

for (const r of rows) {
  let period = null;
  let propId = null;

  if (r.cross_doc_ref.startsWith('ANTICIPO-')) {
    // ANTICIPO-YYYYMM-{propId}
    const parts = r.cross_doc_ref.split('-');
    if (parts.length >= 3) {
      const ym = parts[1];
      period = `${ym.slice(0, 4)}-${ym.slice(4, 6)}`;
      propId = parts[2];
    }
  } else if (r.cross_doc_ref.startsWith('ANT-')) {
    propId = r.cross_doc_ref.slice(4);
    // period might be extracted from description: e.g. "Apertura Saldo a Favor PH — Apartamento. A-602 (2026-06) CUOTA ADMINISTRACION"
    const m = r.description.match(/\((\d{4}-\d{2})\)/);
    if (m) period = m[1];
  }

  let inv = null;
  if (propId && period) {
    inv = db.prepare("SELECT id, number, period, total FROM ph_invoices WHERE property_id = ? AND period = ? AND status != 'voided'").get(propId, period);
  }

  let prop = propId ? db.prepare("SELECT id, code, name FROM ph_properties WHERE id = ?").get(propId) : null;

  if (inv) {
    matchedInvs++;
    console.log(`[MATCH] ${r.tx_number} Line ${r.id}: Ref "${r.cross_doc_ref}" -> Period ${period}, Prop ${prop ? prop.code : propId} -> Matched Invoice: ${inv.number} -> New Ref: ${inv.number}-ADM`);
  } else {
    unmatchedInvs++;
    console.log(`[FUTURE/NO-INV] ${r.tx_number} Line ${r.id}: Ref "${r.cross_doc_ref}" -> Period ${period}, Prop ${prop ? prop.code : propId} -> (No invoice yet in ${period})`);
  }
}

console.log(`\nSummary: ${matchedInvs} matched with existing invoice, ${unmatchedInvs} for future periods without invoice.`);

