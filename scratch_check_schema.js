const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
console.log('purchase_invoices columns:');
console.log(db.prepare("PRAGMA table_info(purchase_invoices)").all().map(c => c.name));

console.log('support_documents columns:');
console.log(db.prepare("PRAGMA table_info(support_documents)").all().map(c => c.name));

console.log('transactions columns:');
console.log(db.prepare("PRAGMA table_info(transactions)").all().map(c => c.name));
