const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const emps = ['cm6g6vpckf15ct8', 'v21xfu4abpcba2f', 'waykc023e9kpeen'];

for (const empId of emps) {
  const tp = db.prepare("SELECT name FROM third_parties WHERE id = ?").get(empId);
  console.log(`\n================================================================`);
  console.log(`EMPLEADO: ${tp?.name} (${empId})`);
  
  // Payroll lines in Jul, Aug, Sep
  const lines = db.prepare(`
    SELECT pl.id, pp.name as period, pp.date_from, pl.salary_base, pl.days_worked, pl.transport_allowance, pl.overtime, pl.net_pay, pl.notes
    FROM payroll_lines pl
    JOIN payroll_periods pp ON pp.id = pl.period_id
    WHERE pl.employee_id = ? AND pp.date_from >= '2026-07-01' AND pp.date_from <= '2026-09-30'
    ORDER BY pp.date_from
  `).all(empId);

  for (const l of lines) {
    console.log(`\n  Periodo: ${l.period} (${l.date_from})`);
    console.log(`  Base: ${l.salary_base} | Dias: ${l.days_worked} | Transp: ${l.transport_allowance} | Overtime: ${l.overtime} | Net: ${l.net_pay}`);
    try {
      const parsed = JSON.parse(l.notes);
      console.log(`  payroll_meta concept_amounts:`, parsed.payroll_meta?.concept_amounts);
      console.log(`  overtime_breakdown:`, parsed.payroll_meta?.overtime_breakdown);
    } catch (_) {}
  }

  // Electronic payrolls in Mes 7, 8, 9
  const neList = db.prepare(`
    SELECT mes, consecutivo, total_devengos, total_deducciones, total_neto, xml_generado
    FROM electronic_payrolls
    WHERE employee_id = ? AND ano = 2026 AND mes IN (7, 8, 9)
    ORDER BY mes
  `).all(empId);

  for (const ne of neList) {
    console.log(`\n  >>> NE Mes ${ne.mes} (NOM-${ne.consecutivo}): Dev: ${ne.total_devengos} | Ded: ${ne.total_deducciones} | Net: ${ne.total_neto}`);
    console.log(`  XML Devengados section:`);
    const devMatch = ne.xml_generado.match(/<Devengados>([\s\S]*?)<\/Devengados>/);
    console.log(devMatch ? devMatch[1] : 'No Devengados found');
    console.log(`  XML Deducciones section:`);
    const dedMatch = ne.xml_generado.match(/<Deducciones>([\s\S]*?)<\/Deducciones>/);
    console.log(dedMatch ? dedMatch[1] : 'No Deducciones found');
  }
}
