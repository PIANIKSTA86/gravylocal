const { DatabaseSync } = require('node:sqlite');

console.log('=== NOVELTY 2odbcxop8rlofvt in pb_data/data.db:');
const db8090 = new DatabaseSync('pb_data/data.db');
const nov = db8090.prepare("SELECT * FROM payroll_novelties WHERE id = '2odbcxop8rlofvt'").get();
console.log(nov);

console.log('\n=== ALL NOVELTIES IN pb_data/data.db:');
const allNov8090 = db8090.prepare(`
  SELECT n.*, t.name as emp_name 
  FROM payroll_novelties n
  LEFT JOIN third_parties t ON t.id = n.employee_id
  ORDER BY n.updated DESC
`).all();
console.table(allNov8090);

console.log('\n=== ALL NOVELTIES IN empresa_8091:');
const db8091 = new DatabaseSync('empresas/empresa_8091/pb_data/data.db');
const allNov8091 = db8091.prepare(`
  SELECT n.*, t.name as emp_name 
  FROM payroll_novelties n
  LEFT JOIN third_parties t ON t.id = n.employee_id
  ORDER BY n.updated DESC
`).all();
console.table(allNov8091);
