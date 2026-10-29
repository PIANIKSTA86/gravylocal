const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules%' ORDER BY key").all();
const fullStr = rows.map(r => r.value).join('');
const list = JSON.parse(fullStr);
const withEnd = list.filter(e => e.end_date);
for (const e of withEnd) {
  const tp = db.prepare("SELECT name FROM third_parties WHERE id = ?").get(e.employee_id);
  console.log(`Emp: ${tp?.name} (${e.employee_id}), type: ${e.contract_type}, start: ${e.start_date}, end: ${e.end_date}`);
}
