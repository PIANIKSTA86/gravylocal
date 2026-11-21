const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

// Let's check ph_invoices
const invs = db.prepare(`
  SELECT 
    period,
    COUNT(*) as count,
    ROUND(SUM(total), 2) as total
  FROM ph_invoices
  WHERE status != 'voided' AND tx_id != ''
  GROUP BY period
  ORDER BY period
`).all();
console.log('Invoices by period:', invs);

// Let's check ph_invoice_lines grouped by concept for 2026-06 or all
const linesByConcept = db.prepare(`
  SELECT 
    phi.period,
    bc.name as concept_name,
    COUNT(*) as count,
    ROUND(SUM(phl.amount), 2) as total_amount
  FROM ph_invoice_lines phl
  JOIN ph_invoices phi ON phl.invoice_id = phi.id
  LEFT JOIN ph_billing_concepts bc ON phl.concept_id = bc.id
  WHERE phi.status != 'voided' AND phi.tx_id != ''
  GROUP BY phi.period, bc.name
  ORDER BY phi.period, bc.name
`).all();
console.log('Invoice lines by period and concept:', linesByConcept);
