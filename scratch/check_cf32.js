const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// Check CF-202609-000032
const inv = db.prepare("SELECT * FROM ph_invoices WHERE number = 'CF-202609-000032'").get();
console.log('Invoice CF-202609-000032:', inv);

const lines = db.prepare("SELECT * FROM ph_invoice_lines WHERE invoice_id = ?").all(inv.id);
console.log('Lines:', lines);

const tx = db.prepare("SELECT * FROM transactions WHERE id = ?").get(inv.tx_id);
console.log('Transaction:', tx);

const txLines = db.prepare(`
  SELECT l.*, a.code as acc_code 
  FROM tx_lines l 
  LEFT JOIN accounts a ON a.id = l.account_id 
  WHERE l.tx_id = ?
`).all(inv.tx_id);
console.log('Transaction Lines:', txLines);

db.close();

