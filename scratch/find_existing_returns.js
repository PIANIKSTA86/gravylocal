const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, '..', 'empresas', 'empresa_8091', 'pb_data', 'data.db'));

try {
  const ncInvoices = db.prepare(`
    SELECT id, number, date, total, status, parent_invoice_id, cross_doc_ref, notes 
    FROM invoices 
    WHERE number LIKE '%NC%' 
       OR parent_invoice_id IS NOT NULL 
       OR notes LIKE '%[Ajuste DIAN%' 
       OR notes LIKE '%Nota Cr%'
  `).all();
  console.log('NC Invoices found:', ncInvoices.length, ncInvoices);
} catch (e) {
  console.error('Error querying invoices:', e.message);
}

try {
  const ncPurchases = db.prepare(`
    SELECT id, number, date, total, status, notes 
    FROM purchase_invoices 
    WHERE number LIKE '%NC%' 
       OR number LIKE '%NDS%' 
       OR notes LIKE '%Ajuste%' 
       OR notes LIKE '%Devolu%'
  `).all();
  console.log('NC Purchases found:', ncPurchases.length, ncPurchases);
} catch (e) {
  console.error('Error querying purchase invoices:', e.message);
}

try {
  const txTypes = db.prepare(`SELECT id, code, prefix, name FROM transaction_types WHERE code IN ('NC', 'NDS', 'CM', 'DEV')`).all();
  console.log('Transaction Types for Credit Notes:', txTypes);
} catch (e) {
  console.error('Error querying tx types:', e.message);
}
