const { DatabaseSync } = require('node:sqlite');

console.log('=== NOVELTY 2odbcxop8rlofvt in pb_data/data.db ===');
const db8090 = new DatabaseSync('pb_data/data.db');
const nov = db8090.prepare(`
  SELECT n.*, t.name as emp_name, p.name as period_name
  FROM payroll_novelties n
  LEFT JOIN third_parties t ON t.id = n.employee_id
  LEFT JOIN payroll_periods p ON p.id = n.period_id
  WHERE n.id = '2odbcxop8rlofvt'
`).get();
console.log(nov);

console.log('\n=== RECENT NOVELTIES (top 10 by updated) in pb_data/data.db ===');
const top10 = db8090.prepare(`
  SELECT n.id, n.type, n.employee_id, t.name as emp_name, n.period_id, p.name as period_name, n.amount, n.qty, n.status, n.date_from, n.date_to, n.updated
  FROM payroll_novelties n
  LEFT JOIN third_parties t ON t.id = n.employee_id
  LEFT JOIN payroll_periods p ON p.id = n.period_id
  ORDER BY n.updated DESC
  LIMIT 10
`).all();
console.table(top10);
