const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db');
const bakPath = path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db.bak_anticipos');

// Backup database first
console.log('Creating database backup...');
fs.copyFileSync(dbPath, bakPath);
console.log('Backup created at:', bakPath);

const db = new DatabaseSync(dbPath);

const allInvs = db.prepare("SELECT * FROM ph_invoices WHERE status != 'voided'").all();
const propBySeq = new Map();
for (const inv of allInvs) {
  if (inv.number && inv.number.startsWith('CF-')) {
    const seq = inv.number.split('-')[2];
    if (seq && !propBySeq.has(seq)) {
      propBySeq.set(seq, inv.property_id);
    }
  }
}

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

console.log(`Found ${rows.length} lines to migrate.`);

db.exec("BEGIN TRANSACTION");

let updatedCount = 0;

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

  if (!propId && r.teso_params) {
    try {
      const tp = JSON.parse(r.teso_params);
      if (tp.ph_property_id) propId = tp.ph_property_id;
    } catch (_) {}
  }

  const prop = propId ? db.prepare("SELECT id, code, name FROM ph_properties WHERE id = ?").get(propId) : null;

  // Find invoice for this period
  let inv = null;
  if (propId && period) {
    inv = db.prepare("SELECT id, number, period FROM ph_invoices WHERE property_id = ? AND period = ? AND status != 'voided'").get(propId, period);
  }

  let newRef = '';
  if (inv && inv.number) {
    newRef = `${inv.number}-ADM`;
  } else if (propId && period) {
    const prev = db.prepare("SELECT number FROM ph_invoices WHERE property_id = ? AND number LIKE 'CF-%' ORDER BY period DESC LIMIT 1").get(propId);
    const pCode = period.replace('-', '');
    if (prev && prev.number) {
      const seq = prev.number.split('-')[2];
      newRef = `CF-${pCode}-${seq}-ADM`;
    } else {
      newRef = `CF-${pCode}-${prop ? prop.code : '000001'}-ADM`;
    }
  }

  let newDesc = r.description;
  if (newDesc.includes('Abono anticipado cuota')) {
    newDesc = newDesc.replace(/Abono anticipado cuota \d{4}-\d{2}/, `Abono a ${newRef}`);
  } else if (newDesc.includes('Apertura Saldo a Favor PH')) {
    newDesc = newDesc.replace('Apertura Saldo a Favor PH', `Saldo Inicial a favor [ADM] cruce ${newRef}`);
  }

  if (newRef) {
    db.prepare("UPDATE tx_lines SET cross_doc_ref = ?, description = ? WHERE id = ?").run(newRef, newDesc, r.id);
    updatedCount++;
    console.log(`Updated Line ${r.id} (${r.tx_number}): "${r.cross_doc_ref}" -> "${newRef}"`);
  }
}

db.exec("COMMIT");
console.log(`Successfully migrated ${updatedCount} lines.`);

// Integrity check
const check = db.prepare("PRAGMA integrity_check").get();
console.log("PRAGMA integrity_check:", check);

