const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
let fullStr = '';
rows.forEach(r => { fullStr += r.value; });
const employeeRules = JSON.parse(fullStr);

console.log(`Found ${employeeRules.length} employee rules in settings:`);
employeeRules.forEach(r => {
  const tp = db.prepare("SELECT name, doc_number FROM third_parties WHERE id = ?").get(r.employee_id);
  console.log(`- ID: ${r.employee_id} | ${tp ? tp.name : 'Unknown'} | Start: '${r.start_date}' | End: '${r.end_date}' | Contract: '${r.contract_type}'`);
});

