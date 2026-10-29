import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

// Check how many phantom SI invoices exist without tx_id
const phantomSI = db.prepare(`
  SELECT count(*) as count, sum(total) as total
  FROM ph_invoices
  WHERE period = '2026-05' AND (tx_id = '' OR tx_id IS NULL)
`).get();

console.log('Phantom SI Invoices (no tx_id):', phantomSI);

// Let's check how many payments have been applied to phantom SI invoices
const phantomPayments = db.prepare(`
  SELECT tl.cross_doc_ref, count(*) as count, sum(tl.credit) as total_credit
  FROM tx_lines tl
  JOIN accounts a ON a.id = tl.account_id
  WHERE a.code LIKE '13%' AND tl.cross_doc_ref LIKE 'SI-202605-00%'
  GROUP BY tl.cross_doc_ref
`).all();

console.log('Payments referencing phantom SI (0001-0096):', phantomPayments);
