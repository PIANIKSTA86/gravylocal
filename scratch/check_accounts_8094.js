const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// Check settings tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
const settingTables = tables.filter(t => t.includes('setting') || t.includes('config') || t.includes('param') || t.includes('ph_'));
console.log('Related tables:', settingTables);

if (tables.includes('settings')) {
  const s = db.prepare("SELECT id, key, value FROM settings WHERE key LIKE '%ph%' OR key LIKE '%cartera%' OR key LIKE '%account%'").all();
  console.log('Settings matching ph/cartera/account:', s);
}

// Check account l91zqp87xpkw1vy
const accConcept = db.prepare('SELECT id, code, name FROM accounts WHERE id = "l91zqp87xpkw1vy"').get();
console.log('Concept account:', accConcept);

// Check all 13 accounts
const c13 = db.prepare('SELECT id, code, name FROM accounts WHERE code LIKE "13%" ORDER BY code').all();
console.log('13 accounts:', c13);

// Check 28 accounts
const c28 = db.prepare('SELECT id, code, name FROM accounts WHERE code LIKE "28%" ORDER BY code').all();
console.log('28 accounts:', c28);

// Check invoices with missing or invalid tx_id
const invNoTx = db.prepare('SELECT count(*) as c FROM ph_invoices WHERE status != "voided" AND (tx_id IS NULL OR tx_id = "")').get();
console.log('Invoices without tx_id:', invNoTx);

// Check invoices with tx_id that does not exist in transactions
const invOrphanTx = db.prepare(`
  SELECT count(*) as c 
  FROM ph_invoices phi 
  LEFT JOIN transactions t ON t.id = phi.tx_id 
  WHERE phi.status != "voided" AND phi.tx_id != "" AND t.id IS NULL
`).get();
console.log('Invoices with non-existent tx_id:', invOrphanTx);

// Check transaction types present in db
const txTypes = db.prepare('SELECT type, count(*) as c FROM transactions GROUP BY type').all();
console.log('Transaction types:', txTypes);

db.close();
