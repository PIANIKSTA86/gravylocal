const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const rows = db.prepare(`
  SELECT 
    tl.id,
    tl.tx_id,
    t.number AS tx_number,
    t.date AS tx_date,
    t.teso_params,
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

const mappingPlan = [];

for (const r of rows) {
  let period = null;
  let propId = null;

  if (r.cross_doc_ref.startsWith('ANTICIPO-')) {
    const parts = r.cross_doc_ref.split('-');
    if (parts.length >= 3) {
      const ym = parts[1];
      period = `${ym.slice(0, 4)}-${ym.slice(4, 6)}`;
      propId = parts.slice(2).join('-');
    }
  } else if (r.cross_doc_ref.startsWith('ANT-')) {
    propId = r.cross_doc_ref.slice(4);
    const m = r.description.match(/\((\d{4}-\d{2})\)/);
    if (m) period = m[1];
    else period = '2026-06';
  }

  // Also check teso_params if propId is missing
  if (!propId && r.teso_params) {
    try {
      const p = JSON.parse(r.teso_params);
      if (p.ph_property_id) propId = p.ph_property_id;
    } catch (_) {}
  }

  const prop = propId ? db.prepare("SELECT id, code, name FROM ph_properties WHERE id = ?").get(propId) : null;

  // Find invoice for this period if exists
  let inv = null;
  if (propId && period) {
    inv = db.prepare("SELECT id, number, period FROM ph_invoices WHERE property_id = ? AND period = ? AND status != 'voided'").get(propId, period);
  }

  let newRef = '';
  if (inv && inv.number) {
    newRef = `${inv.number}-ADM`;
  } else if (propId && period) {
    // Look up sequence number from any previous CF- invoice for this property
    const prevInv = db.prepare("SELECT number FROM ph_invoices WHERE property_id = ? AND number LIKE 'CF-%' ORDER BY period DESC LIMIT 1").get(propId);
    const pCode = period.replace('-', '');
    if (prevInv && prevInv.number) {
      const seq = prevInv.number.split('-')[2]; // e.g. '000090'
      newRef = `CF-${pCode}-${seq}-ADM`;
    } else {
      newRef = `CF-${pCode}-${prop ? prop.code : '000001'}-ADM`;
    }
  }

  let newDesc = r.description;
  if (newDesc.includes('Abono anticipado cuota')) {
    newDesc = newDesc.replace('Abono anticipado cuota', `Abono a ${newRef.replace(/-ADM$/, '')} [ADM]`);
  }

  mappingPlan.push({
    lineId: r.id,
    txNumber: r.tx_number,
    txDate: r.tx_date,
    oldRef: r.cross_doc_ref,
    newRef,
    oldDesc: r.description,
    newDesc,
    propCode: prop ? prop.code : 'UNKNOWN',
    credit: r.credit
  });
}

console.log(`Prepared mapping plan for ${mappingPlan.length} lines:`);
mappingPlan.slice(0, 15).forEach(p => {
  console.log(`${p.txNumber} (Line ${p.lineId}): "${p.oldRef}" -> "${p.newRef}" ($${p.credit})`);
});
console.log('...\nLast 5:');
mappingPlan.slice(-5).forEach(p => {
  console.log(`${p.txNumber} (Line ${p.lineId}): "${p.oldRef}" -> "${p.newRef}" ($${p.credit})`);
});

