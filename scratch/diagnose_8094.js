const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

console.log('=== DIAGNOSTICO EMPRESA 8094 ===');

// 1. Settings / Company
try {
  const company = db.prepare('SELECT id, name, nit FROM _app_settings_public LIMIT 1').get();
  console.log('Company:', company);
} catch (e) {
  try {
    const s = db.prepare('SELECT value FROM _params WHERE key="settings" LIMIT 1').get();
    console.log('Params settings length:', s ? s.value.length : 0);
  } catch (e2) {
    console.log('Settings error:', e.message);
  }
}

// 2. Count of properties, invoices, txs
const propCount = db.prepare('SELECT count(*) as c FROM ph_properties').get();
const invCount = db.prepare('SELECT count(*) as c FROM ph_invoices').get();
const invStatusCount = db.prepare('SELECT status, count(*) as c FROM ph_invoices GROUP BY status').all();
const txCount = db.prepare('SELECT count(*) as c FROM transactions').get();
const txLinesCount = db.prepare('SELECT count(*) as c FROM tx_lines').get();

console.log('Properties:', propCount);
console.log('Invoices total:', invCount, 'by status:', invStatusCount);
console.log('Transactions:', txCount, 'Tx Lines:', txLinesCount);

// 3. Check PH config
try {
  const phConfig = db.prepare('SELECT * FROM ph_configs LIMIT 1').get();
  console.log('PH Config:', phConfig);
} catch (e) {
  console.log('No ph_configs table or error:', e.message);
}

// 4. Accounts used for PH (accounts starting with 13 or 4 or in concepts)
const phConcepts = db.prepare('SELECT id, name, code, account_id, cxc_account_id FROM ph_billing_concepts').all();
console.log('PH Billing Concepts:', phConcepts);

db.close();

