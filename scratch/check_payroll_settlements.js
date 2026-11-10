const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const cols = db.prepare("PRAGMA table_info(payroll_settlements)").all().map(c => c.name);
console.log('Columns of payroll_settlements:', cols);

const rows = db.prepare("SELECT * FROM payroll_settlements WHERE employee_id = 'vsu8bz83547sxrn'").all();
console.log(`Found ${rows.length} records in payroll_settlements for Angelica:`);
rows.forEach(r => console.log(r));

// Also check all rows in payroll_settlements
const all = db.prepare("SELECT id, employee_id, created FROM payroll_settlements").all();
console.log(`Total records in payroll_settlements: ${all.length}`);

