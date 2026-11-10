const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT key, length(value) as len FROM settings WHERE key LIKE 'payroll_accounting_config%'").all();
console.table(rows);

