const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
let fullStr = '';
rows.forEach(r => { fullStr += r.value; });
const employeeRules = JSON.parse(fullStr);

console.log('TOTAL RULES:', employeeRules.length);
employeeRules.forEach((r, i) => {
  console.log(`[${i}]`, JSON.stringify(r));
});

