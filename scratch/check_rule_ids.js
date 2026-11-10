const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
let fullStr = '';
rows.forEach(r => { fullStr += r.value; });
const employeeRules = JSON.parse(fullStr);

console.log('Total rules:', employeeRules.length);
employeeRules.forEach((r, idx) => {
  const tp = db.prepare("SELECT id, name, doc_number FROM third_parties WHERE id = ?").get(r.employee_id);
  const user = db.prepare("SELECT id, email FROM users WHERE id = ?").get(r.employee_id);
  console.log(`[${idx}] rule emp_id: '${r.employee_id}' | TP: ${tp ? tp.name + ' (' + tp.doc_number + ')' : 'NO TP'} | User: ${user ? user.email : 'NO USER'} | start_date: ${r.start_date}`);
});

