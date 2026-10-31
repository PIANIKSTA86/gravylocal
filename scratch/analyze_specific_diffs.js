const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// Check 2026-05 invoices and their tx
const mayInvoices = db.prepare(`
  SELECT phi.id, phi.number, phi.total, phi.tx_id, t.number as tx_number
  FROM ph_invoices phi
  LEFT JOIN transactions t ON t.id = phi.tx_id
  WHERE phi.period = '2026-05' AND phi.status != 'voided'
  LIMIT 5
`).all();
console.log('Sample May Invoices:', mayInvoices);

// Check lines of the transaction linked to May invoices
if (mayInvoices[0] && mayInvoices[0].tx_id) {
  const mayTxLines = db.prepare(`
    SELECT l.id, l.debit, l.credit, l.description, l.cross_doc_ref, l.third_party_id, a.code as acc_code
    FROM tx_lines l
    LEFT JOIN accounts a ON a.id = l.account_id
    WHERE l.tx_id = ?
    LIMIT 10
  `).all(mayInvoices[0].tx_id);
  console.log(`\nLines of May Transaction ${mayInvoices[0].tx_number} (total lines: ${
    db.prepare('SELECT count(*) as c FROM tx_lines WHERE tx_id = ?').get(mayInvoices[0].tx_id).c
  }):`, mayTxLines);
}

// Check 2026-06, 07, 08, 09 differences
const otherDiffs = db.prepare(`
  SELECT 
    phi.id, phi.number, phi.period, phi.total as inv_total,
    t.id as tx_id, t.number as tx_number,
    COALESCE(SUM(l.debit), 0) as tx_debit,
    (phi.total - COALESCE(SUM(l.debit), 0)) as diff
  FROM ph_invoices phi
  LEFT JOIN transactions t ON t.id = phi.tx_id
  LEFT JOIN tx_lines l ON l.tx_id = t.id AND l.account_id = (SELECT id FROM accounts WHERE code = '13459501')
  WHERE phi.status != 'voided' AND phi.period != '2026-05'
  GROUP BY phi.id
  HAVING ABS(phi.total - tx_debit) > 0.01
`).all();

console.log(`\nNon-May diff invoices (${otherDiffs.length}):`);
for (const d of otherDiffs) {
  const invLines = db.prepare("SELECT * FROM ph_invoice_lines WHERE invoice_id = ?").all(d.id);
  console.log(`Inv ${d.number} (${d.period}): Total=${d.inv_total} TxDeb=${d.tx_debit} Diff=${d.diff}`);
  for (const il of invLines) {
    console.log(`   Line: Amt=${il.amount} Desc='${il.description}' ConceptId='${il.concept_id}'`);
  }
}

db.close();

