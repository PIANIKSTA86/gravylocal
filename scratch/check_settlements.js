const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');
const settlements = db.prepare(`
  SELECT s.*, t.name as emp_name 
  FROM payroll_settlements s
  LEFT JOIN third_parties t ON t.id = s.employee_id
`).all();
console.log('=== PAYROLL SETTLEMENTS COUNT:', settlements.length);
console.log(settlements);
