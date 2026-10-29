const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const empId = 'vsu8bz83547sxrn'; // Angelica Moncada

console.log('=== ANGELICA MONCADA ARMILLA ===');
const lines = db.prepare(`
  SELECT pl.id, pp.name as period, pp.date_from, pl.salary_base, pl.days_worked, pl.transport_allowance, pl.overtime, pl.net_pay, pl.notes
  FROM payroll_lines pl
  JOIN payroll_periods pp ON pp.id = pl.period_id
  WHERE pl.employee_id = ? AND pp.date_from >= '2026-07-01' AND pp.date_from <= '2026-09-30'
  ORDER BY pp.date_from
`).all(empId);

console.log('Lines in Jul-Sep:');
for (const l of lines) {
  console.log(`  ${l.period}: dias=${l.days_worked}, base=${l.salary_base}, trans=${l.transport_allowance}, net=${l.net_pay}`);
}

const settlements = db.prepare(`
  SELECT * FROM payroll_settlements WHERE employee_id = ?
`).all(empId);
console.log('\nSettlements for Angelica:', settlements);

const neList = db.prepare(`
  SELECT mes, consecutivo, total_devengos, total_deducciones, total_neto, xml_generado
  FROM electronic_payrolls
  WHERE employee_id = ? AND ano = 2026 AND mes IN (7, 8, 9)
  ORDER BY mes
`).all(empId);

for (const ne of neList) {
  console.log(`\nNE Mes ${ne.mes} (NOM-${ne.consecutivo}): Dev: ${ne.total_devengos} | Ded: ${ne.total_deducciones} | Net: ${ne.total_neto}`);
}
