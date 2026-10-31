const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// Check CF-202608-000025
const inv = db.prepare("SELECT * FROM ph_invoices WHERE number = 'CF-202608-000025'").get();
console.log('Invoice CF-202608-000025:', inv);

const lines = db.prepare("SELECT * FROM ph_invoice_lines WHERE invoice_id = ?").all(inv.id);
console.log('Invoice Lines:', lines);

const txLines = db.prepare(`
  SELECT l.*, a.code as acc_code, a.name as acc_name 
  FROM tx_lines l 
  LEFT JOIN accounts a ON a.id = l.account_id 
  WHERE l.tx_id = ?
`).all(inv.tx_id);
console.log('Transaction Lines:', txLines);

db.close();

