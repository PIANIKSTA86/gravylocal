const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Check lines in ph_invoice_lines
const lines = db.prepare(`
  SELECT 
    phl.concept_id,
    bc.code as concept_code,
    bc.name as concept_name,
    bc.cxc_account_id,
    a.code as cxc_code,
    a.name as cxc_name,
    count(*) as count,
    sum(phl.amount) as total
  FROM ph_invoice_lines phl
  LEFT JOIN ph_billing_concepts bc ON phl.concept_id = bc.id
  LEFT JOIN accounts a ON bc.cxc_account_id = a.id
  GROUP BY phl.concept_id
`).all();
console.table(lines);

// Now check tx_lines for CF- transactions to see which accounts were used
const cfLinesByAcc = db.prepare(`
  SELECT 
    a.code, a.name,
    count(*) as count,
    sum(tl.debit) as debits,
    sum(tl.credit) as credits
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  WHERE t.number LIKE 'CF-%'
  GROUP BY a.code
`).all();
console.log('CF- lines by account:');
console.table(cfLinesByAcc);
