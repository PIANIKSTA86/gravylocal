const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const lineCols = db.prepare("PRAGMA table_info(payroll_lines)").all();
console.log('payroll_lines columns:', lineCols.map(c => c.name));

const lines = db.prepare("SELECT * FROM payroll_lines WHERE period_id = 'gppva4wnpposmj2' AND employee_id = '0zbb63nz7p6tzwc'").all();
console.log('Alison line in Q2:', JSON.stringify(lines, null, 2));

const emp = db.prepare("SELECT * FROM payroll_employees WHERE id = '0zbb63nz7p6tzwc'").all();
console.log('Employee:', JSON.stringify(emp, null, 2));
