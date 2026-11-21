const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

for (const emp of ['empresa_8092', 'empresa_8093']) {
  const dbPath = path.resolve(`empresas/${emp}/pb_data/data.db`);
  if (!fs.existsSync(dbPath)) continue;
  const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

  const txsWithParams = db.prepare(`
    SELECT t.id, t.number, t.date, t.teso_params
    FROM transactions t
    WHERE t.teso_params LIKE '%"ph_property_id"%' AND t.status != 'voided'
  `).all();

  let count = 0;
  for (const tx of txsWithParams) {
    let params = {};
    try { params = JSON.parse(tx.teso_params); } catch(_) { continue; }
    const txPropId = params.ph_property_id;
    if (!txPropId) continue;

    const lines = db.prepare(`
      SELECT tl.id, tl.cross_doc_ref
      FROM tx_lines tl
      JOIN accounts a ON a.id = tl.account_id
      WHERE tl.tx_id = ? AND a.code LIKE '13%' AND tl.cross_doc_ref != ''
    `).all(tx.id);

    for (const l of lines) {
      const ref = (l.cross_doc_ref || '').trim();
      const baseInv = ref.lastIndexOf('-') > 0 ? ref.substring(0, ref.lastIndexOf('-')) : ref;
      const inv = db.prepare(`SELECT property_id FROM ph_invoices WHERE number = ? OR number = ?`).get(ref, baseInv);
      if (inv && inv.property_id && inv.property_id !== txPropId) {
        count++;
        console.log(`[${emp}] Mismatch in ${tx.number}: txProp=${txPropId} vs invProp=${inv.property_id} (ref=${ref})`);
      }
    }
  }
  console.log(`[${emp}] Total mismatches: ${count}`);
  db.close();
}
