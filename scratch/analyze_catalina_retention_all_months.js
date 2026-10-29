const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const lines = db.prepare(`
  SELECT pl.id, pl.period_id, pp.name as period_name, pp.date_from, pp.date_to,
         pl.salary_base, pl.days_worked, pl.transport_allowance, pl.overtime,
         pl.deduction_health, pl.deduction_pension, pl.solidarity_fund, pl.withholding_tax,
         pl.net_pay, pl.notes
  FROM payroll_lines pl
  JOIN payroll_periods pp ON pp.id = pl.period_id
  JOIN third_parties tp ON tp.id = pl.employee_id
  WHERE tp.name LIKE '%CATALINA%' AND pp.date_from >= '2026-06-01'
  ORDER BY pp.date_from ASC
`).all();

console.log('=== CATALINA MARTINEZ LINES FROM JUNE 2026 ONWARDS ===');
lines.forEach(l => {
  let notes = {};
  try { notes = JSON.parse(l.notes); } catch (_) {}
  const pm = notes.payroll_meta || {};
  const ca = pm.concept_amounts || {};
  console.log(`\nPeriod: ${l.period_name} (${l.date_from} to ${l.date_to})`);
  console.log(`  Sal Base: ${l.salary_base} | Days: ${l.days_worked} | Transp: ${l.transport_allowance}`);
  console.log(`  Gastos Repr: ${ca.gastos_representacion || 0} | Prima: ${ca.prima_servicios || ca.prima || 0}`);
  console.log(`  Health: ${l.deduction_health} | Pension: ${l.deduction_pension} | FSP: ${l.solidarity_fund}`);
  console.log(`  Retencion en la fuente: ${l.withholding_tax} (Rate used: ${pm.withholding_rate_used})`);
  console.log(`  Net Pay: ${l.net_pay}`);
});

const novs = db.prepare(`
  SELECT pn.*, pp.name as period_name
  FROM payroll_novelties pn
  JOIN third_parties tp ON tp.id = pn.employee_id
  LEFT JOIN payroll_periods pp ON pp.id = pn.period_id
  WHERE tp.name LIKE '%CATALINA%' AND (pn.date_from >= '2026-06-01' OR pn.created >= '2026-06-01')
  ORDER BY pn.date_from ASC
`).all();

console.log('\n=== NOVELTIES FOR CATALINA FROM JUNE ONWARDS ===');
console.table(novs.map(n => ({
  period: n.period_name,
  type: n.type,
  amount: n.amount,
  qty: n.qty,
  status: n.status,
  date_from: n.date_from,
  updated: n.updated
})));

