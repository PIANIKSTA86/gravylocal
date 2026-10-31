const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// Check account l91zqp87xpkw1vy
const accConcept = db.prepare("SELECT id, code, name FROM accounts WHERE id = 'l91zqp87xpkw1vy'").get();
console.log('Concept account:', accConcept);

// Check all 13 accounts
const c13 = db.prepare("SELECT id, code, name FROM accounts WHERE code LIKE '13%' ORDER BY code").all();
console.log('13 accounts:');
for (const a of c13) console.log(`  ${a.code} - ${a.name} (${a.id})`);

// Check PH settings
const phSettings = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'ph_%'").all();
console.log('\nPH Settings:');
for (const s of phSettings) {
  console.log(`  ${s.key} = ${s.value}`);
}

// Check invoices with missing or empty tx_id
const invNoTx = db.prepare("SELECT count(*) as c FROM ph_invoices WHERE status != 'voided' AND (tx_id IS NULL OR tx_id = '')").get();
console.log('\nInvoices without tx_id:', invNoTx);

// Check invoices with tx_id that does not exist in transactions
const invOrphanTx = db.prepare(`
  SELECT count(*) as c 
  FROM ph_invoices phi 
  LEFT JOIN transactions t ON t.id = phi.tx_id 
  WHERE phi.status != 'voided' AND phi.tx_id != '' AND t.id IS NULL
`).get();
console.log('Invoices with non-existent tx_id:', invOrphanTx);

// Check how many transactions are posted vs active vs voided
const txStatuses = db.prepare("SELECT status, count(*) as c FROM transactions GROUP BY status").all();
console.log('\nTransaction statuses:', txStatuses);

db.close();

