const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Check accounts starting with 1345
const accts = db.prepare("SELECT id, code, name FROM accounts WHERE code LIKE '1345%' ORDER BY code").all();
console.log('1345 accounts in DB:', accts);

// Check ph_billing_concepts
const concepts = db.prepare(`
  SELECT bc.id, bc.code, bc.name, bc.type, bc.account_id, a.code as acc_code, a.name as acc_name
  FROM ph_billing_concepts bc
  LEFT JOIN accounts a ON bc.account_id = a.id
`).all();
console.log('ph_billing_concepts in DB:', concepts);

// Check columns of ph_billing_concepts
const bcCols = db.prepare("PRAGMA table_info(ph_billing_concepts)").all();
console.log('ph_billing_concepts columns:', bcCols.map(c => c.name));
