const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const line = db.prepare(`
  SELECT l.*, t.name 
  FROM payroll_lines l 
  JOIN third_parties t ON t.id = l.employee_id 
  WHERE l.period_id = 'l5o8prmv2h0prhr' 
  LIMIT 1
`).get();
console.log('Sample payroll line for July Q1:');
console.log(line);
