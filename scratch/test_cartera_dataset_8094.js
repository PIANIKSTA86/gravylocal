const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const props = db.prepare(`SELECT p.*, tp.name as owner_name, tp.doc_number as owner_doc FROM ph_properties p LEFT JOIN third_parties tp ON tp.id = p.owner_id ORDER BY p.code ASC`).all();
const propById = new Map(props.map(p => [p.id.toLowerCase(), p]));

const invoices = db.prepare(`SELECT * FROM ph_invoices WHERE status != 'voided' AND tx_id != '' ORDER BY period ASC, date ASC`).all();
const allLines = db.prepare(`
  SELECT l.*, c.code as concept_code, c.name as concept_name
  FROM ph_invoice_lines l
  LEFT JOIN ph_billing_concepts c ON c.id = l.concept_id
`).all();

const txLines = db.prepare(`
  SELECT l.id, l.tx_id, t.number as tx_num, t.date, l.debit, l.credit, l.cross_doc_ref, l.description
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
`).all();

console.log('Invoices count:', invoices.length, 'Total facturas:', invoices.reduce((s, i) => s + (i.total || 0), 0));

// Check abonos in 13459501
let totalCredits = txLines.reduce((s, l) => s + (l.credit || 0), 0);
let totalDebits = txLines.reduce((s, l) => s + (l.debit || 0), 0);
console.log('13459501 Debits:', totalDebits, 'Credits:', totalCredits, 'Net Ledger:', totalDebits - totalCredits);

