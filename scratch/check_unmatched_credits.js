const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// Check all credits in 13459501
const credits13 = db.prepare(`
  SELECT l.id, l.cross_doc_ref, l.credit, l.debit, l.third_party_id, l.description,
         t.number as tx_number, t.date, tt.code as tx_type
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active' AND l.credit > 0
`).all();

console.log(`Total líneas crédito en 13459501: ${credits13.length}, Suma: ${credits13.reduce((s, l) => s + l.credit, 0)}`);

// How many have cross_doc_ref empty?
const emptyRef = credits13.filter(l => !l.cross_doc_ref || l.cross_doc_ref.trim() === '');
console.log(`Créditos con cross_doc_ref vacío: ${emptyRef.length}`);
for (const e of emptyRef) {
  console.log(`  Tx ${e.tx_type} #${e.tx_number} (${e.date}): Cred=${e.credit} Desc='${e.description}' Third=${e.third_party_id}`);
}

// How many have cross_doc_ref that does NOT match any invoice?
const invNumbers = new Set(db.prepare("SELECT number FROM ph_invoices WHERE status != 'voided'").all().map(i => i.number.toUpperCase().trim()));

const uncrossable = [];
for (const l of credits13) {
  if (!l.cross_doc_ref) continue;
  const ref = l.cross_doc_ref.toUpperCase().trim();
  if (ref.startsWith('ANTICIPO-') || ref.startsWith('ANT-')) continue;
  
  // Check if matches any invoice number
  const matched = Array.from(invNumbers).some(num => ref === num || ref.startsWith(num + '-'));
  if (!matched) {
    uncrossable.push(l);
  }
}

console.log(`Créditos con cross_doc_ref que NO coincide con ninguna factura activa: ${uncrossable.length}`);
for (const u of uncrossable) {
  console.log(`  Tx ${u.tx_type} #${u.tx_number} (${u.date}): Cred=${u.credit} Ref='${u.cross_doc_ref}' Desc='${u.description}'`);
}

db.close();

