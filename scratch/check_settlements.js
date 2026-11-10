const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT * FROM payroll_settlements").all();
console.log('payroll_settlements rows:', rows);
