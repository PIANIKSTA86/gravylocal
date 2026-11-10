const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const emps = db.prepare("SELECT id, name, doc_number FROM third_parties WHERE type = 'EMPLEADO'").all();

console.log('--- EARLIEST PAYROLL PERIOD FOR EACH EMPLOYEE ---');
emps.forEach(e => {
  const earliest = db.prepare(`
    SELECT pp.date_from, pp.date_to, pp.name
    FROM payroll_lines pl
    JOIN payroll_periods pp ON pl.period_id = pp.id
    WHERE pl.employee_id = ?
    ORDER BY pp.date_from ASC
    LIMIT 1
  `).get(e.id);
  console.log(`- ${e.name} (${e.doc_number}): Earliest period = ${earliest ? earliest.name + ' (' + earliest.date_from + ')' : 'NONE'}`);
});

