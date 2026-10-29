const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const empId = 'cm6g6vpckf15ct8'; // Catalina Martinez

console.log('=== CATALINA MARTINEZ REYES ===');
const lines = db.prepare(`
  SELECT pl.id, pp.name as period, pp.date_from, pl.salary_base, pl.days_worked, pl.transport_allowance, pl.overtime, pl.net_pay, pl.notes
  FROM payroll_lines pl
  JOIN payroll_periods pp ON pp.id = pl.period_id
  WHERE pl.employee_id = ? AND pp.date_from >= '2026-07-01' AND pp.date_from <= '2026-09-30'
  ORDER BY pp.date_from
`).all(empId);

for (const l of lines) {
  console.log(`\nPeriod: ${l.period} (${l.date_from})`);
  console.log(`Base: ${l.salary_base} | Dias: ${l.days_worked} | Transp: ${l.transport_allowance} | Overtime: ${l.overtime} | Net: ${l.net_pay}`);
  const parsed = JSON.parse(l.notes);
  console.log('payroll_meta:', parsed.payroll_meta);
}

const neList = db.prepare(`
  SELECT mes, consecutivo, total_devengos, total_deducciones, total_neto, xml_generado
  FROM electronic_payrolls
  WHERE employee_id = ? AND ano = 2026 AND mes IN (7, 8, 9)
  ORDER BY mes
`).all(empId);

for (const ne of neList) {
  console.log(`\nNE Mes ${ne.mes} (NOM-${ne.consecutivo}):`);
  console.log(`Total Devengos: ${ne.total_devengos} | Total Deducciones: ${ne.total_deducciones} | Total Neto: ${ne.total_neto}`);
  console.log('XML:\n', ne.xml_generado);
}
