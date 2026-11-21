const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

console.log('=== 1. OWNERS WITH MULTIPLE PROPERTIES ===');
const multiOwners = db.prepare(`
  SELECT p.owner_id, tp.name as owner_name, tp.doc_number, count(*) as count_props, 
         group_concat(p.code) as unit_codes, group_concat(p.name) as unit_names
  FROM ph_properties p
  LEFT JOIN third_parties tp ON tp.id = p.owner_id
  WHERE p.owner_id != '' AND p.active = 1
  GROUP BY p.owner_id
  HAVING count(*) > 1
`).all();
console.table(multiOwners);

console.log('\n=== 2. SCANNING ALL TRANSACTIONS FOR MISMATCHES BETWEEN teso_params.ph_property_id AND invoice property_id ===');
const txsWithParams = db.prepare(`
  SELECT t.id, t.number, t.date, t.teso_params, t.description
  FROM transactions t
  WHERE t.teso_params LIKE '%"ph_property_id"%' AND t.status != 'voided'
`).all();

const mismatches = [];

for (const tx of txsWithParams) {
  let params = {};
  try { params = JSON.parse(tx.teso_params); } catch(_) { continue; }
  const txPropId = params.ph_property_id;
  if (!txPropId) continue;

  const lines = db.prepare(`
    SELECT tl.id, tl.account_id, a.code as acc_code, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
    FROM tx_lines tl
    JOIN accounts a ON a.id = tl.account_id
    WHERE tl.tx_id = ? AND a.code LIKE '13%' AND tl.cross_doc_ref != ''
  `).all(tx.id);

  for (const l of lines) {
    const ref = (l.cross_doc_ref || '').trim();
    if (ref.startsWith('ANT-') || ref.startsWith('ANTICIPO-')) {
      // Check if anticipo is for a different property
      const targetPid = ref.startsWith('ANTICIPO-') ? ref.slice(-15) : ref.slice(4);
      if (targetPid && targetPid !== txPropId) {
        mismatches.push({
          tx_number: tx.number,
          tx_date: tx.date,
          tx_prop_id: txPropId,
          line_id: l.id,
          acc_code: l.acc_code,
          ref: l.cross_doc_ref,
          debit: l.debit,
          credit: l.credit,
          reason: 'Anticipo property mismatch'
        });
      }
      continue;
    }

    const baseInv = ref.lastIndexOf('-') > 0 ? ref.substring(0, ref.lastIndexOf('-')) : ref;
    const inv = db.prepare(`SELECT number, property_id FROM ph_invoices WHERE number = ? OR number = ?`).get(ref, baseInv);

    if (inv && inv.property_id && inv.property_id !== txPropId) {
      const txProp = db.prepare("SELECT code, name FROM ph_properties WHERE id = ?").get(txPropId);
      const invProp = db.prepare("SELECT code, name FROM ph_properties WHERE id = ?").get(inv.property_id);
      mismatches.push({
        tx_number: tx.number,
        tx_date: tx.date,
        tx_unit: txProp ? `${txProp.code} - ${txProp.name}` : txPropId,
        inv_unit: invProp ? `${invProp.code} - ${invProp.name}` : inv.property_id,
        line_id: l.id,
        acc_code: l.acc_code,
        ref: l.cross_doc_ref,
        debit: l.debit,
        credit: l.credit,
        line_desc: l.description
      });
    }
  }
}

console.log(`Total mismatching lines found: ${mismatches.length}`);
console.table(mismatches);

console.log('\n=== 3. CHECK ALL RECAUDO TRANSACTIONS (RC) WHERE LINES HAVE INVOICES FROM DIFFERENT PROPERTIES WITHIN THE SAME TX ===');
const rcsWithMultiplePropInvoices = db.prepare(`
  SELECT t.number as rc_number, t.date, count(DISTINCT phi.property_id) as prop_count,
         group_concat(DISTINCT p.code) as affected_units
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  JOIN accounts a ON a.id = tl.account_id
  JOIN ph_invoices phi ON (
    tl.cross_doc_ref != '' AND (
      tl.cross_doc_ref = phi.number OR tl.cross_doc_ref LIKE phi.number || '-%'
    )
  )
  JOIN ph_properties p ON p.id = phi.property_id
  WHERE a.code LIKE '13%' AND t.status != 'voided'
  GROUP BY t.id
  HAVING count(DISTINCT phi.property_id) > 1
`).all();
console.table(rcsWithMultiplePropInvoices);

db.close();
