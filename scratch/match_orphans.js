const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
let fullStr = '';
rows.forEach(r => { fullStr += r.value; });
const employeeRules = JSON.parse(fullStr);

console.log('--- RULES WITH START_DATE ---');
employeeRules.filter(r => r.start_date).forEach(r => {
  console.log(`emp_id: '${r.employee_id}' | Salary: ${r.basic_salary} | Position: '${r.position}' | Start: '${r.start_date}' | Contract: '${r.contract_type}'`);
});

console.log('\n--- ACTIVE EMPLOYEES IN THIRD_PARTIES ---');
const emps = db.prepare("SELECT id, name, doc_number FROM third_parties WHERE type = 'EMPLEADO'").all();
emps.forEach(e => {
  const r = employeeRules.find(x => x.employee_id === e.id);
  console.log(`emp_id: '${e.id}' | Name: ${e.name} (${e.doc_number}) | In Rules? ${!!r} | Start: '${r?.start_date}' | Salary: ${r?.basic_salary}`);
});

