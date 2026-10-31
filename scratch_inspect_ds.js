const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

console.log('=== support_documents ===');
const supp = db.prepare('SELECT id, number, date, status, status_dian, cuds, tx_id, total FROM support_documents').all();
console.log('Count:', supp.length, supp);

console.log('=== purchase_invoices with DS/DSE ===');
const pur = db.prepare("SELECT id, number, date, status, status_dian, cuds, tx_id, total FROM purchase_invoices WHERE number LIKE '%DS%' OR number LIKE '%DSE%'").all();
console.log('Count:', pur.length, pur);

console.log('=== transactions with DS/DSE ===');
const txs = db.prepare("SELECT id, number, date, status FROM transactions WHERE number LIKE '%DS%' OR number LIKE '%DSE%'").all();
console.log('Count:', txs.length, txs);

