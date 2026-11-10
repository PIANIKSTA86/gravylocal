const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'payroll_accounting_config_v1_employee_rules_part_%' ORDER BY key ASC").all();
const raw = rows[0].value + rows[1].value;
console.log('Total characters in raw:', raw.length);
// Let's find where the JSON cut off at the end
console.log('Tail of raw:', raw.slice(-200));

