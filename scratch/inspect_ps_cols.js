const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const cols = db.prepare("PRAGMA table_info(payroll_settlements)").all();
console.log('payroll_settlements columns:', cols.map(c => c.name));

