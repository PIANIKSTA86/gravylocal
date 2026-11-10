const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const txs = db.prepare("SELECT id, number, date, description, cross_type, cross_number, third_party_id FROM transactions WHERE cross_type = 'payroll_settlement' OR description LIKE '%Liquidaci%'").all();
console.log('Settlement transactions:', txs);

