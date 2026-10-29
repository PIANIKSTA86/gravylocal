const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const lines = db.prepare(`
  SELECT pl.*, pp.name as period_name, pp.date_from 
  FROM payroll_lines pl
  JOIN payroll_periods pp ON pp.id = pl.period_id
  WHERE pl.employee_id = 'cm6g6vpckf15ct8' AND pp.date_from LIKE '2026-09%'
`).all();

console.log('Catalina Lines in Septiembre 2026:');
for (const l of lines) {
  console.log(`Period: ${l.period_name}`);
  console.log(`  deduction_health: ${l.deduction_health}`);
  console.log(`  deduction_pension: ${l.deduction_pension}`);
  console.log(`  solidarity_fund: ${l.solidarity_fund}`);
  console.log(`  withholding_tax: ${l.withholding_tax}`);
  console.log(`  deduction_other: ${l.deduction_other}`);
  console.log(`  notes:`, l.notes);
}
