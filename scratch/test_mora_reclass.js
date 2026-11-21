const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Check accounts
const acc134501 = db.prepare("SELECT id, code, name FROM accounts WHERE code = '13459501'").get();
const acc134502 = db.prepare("SELECT id, code, name FROM accounts WHERE code = '13459502'").get();
const acc134503 = db.prepare("SELECT id, code, name FROM accounts WHERE code = '13459503'").get();

console.log('Target accounts in 8094:', { acc134501, acc134502, acc134503 });

// 1. Debits in CF- transactions that correspond to MORA
const debitsMora = db.prepare(`
  SELECT count(*) as count, sum(tl.debit) as total
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  WHERE tl.account_id = ? AND (tl.cross_doc_ref LIKE '%-MORA%' OR tl.description LIKE '%[MORA]%')
`).get(acc134501.id);
console.log('MORA Debits currently in 13459501 to move to 13459502:', debitsMora);

// 2. Credits in RC- / AC- / AP- that correspond to MORA
const creditsMora = db.prepare(`
  SELECT count(*) as count, sum(tl.credit) as total
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  WHERE tl.account_id = ? AND (tl.cross_doc_ref LIKE '%-MORA%' OR tl.description LIKE '%Interés de mora%')
`).get(acc134501.id);
console.log('MORA Credits currently in 13459501 to move to 13459502:', creditsMora);

// 3. Debits & credits for EXT
const extLines = db.prepare(`
  SELECT count(*) as count, sum(tl.debit) as debits, sum(tl.credit) as credits
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  WHERE tl.account_id = ? AND (tl.cross_doc_ref LIKE '%-EXT%' OR tl.description LIKE '%[EXT]%')
`).get(acc134501.id);
console.log('EXT Lines currently in 13459501 to move to 13459503:', extLines);
