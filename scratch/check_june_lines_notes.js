const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const lines = db.prepare(`
  SELECT pl.*, tp.name as emp_name, pp.name as period_name 
  FROM payroll_lines pl
  JOIN payroll_periods pp ON pp.id = pl.period_id
  LEFT JOIN third_parties tp ON tp.id = pl.employee_id
  WHERE pp.date_from LIKE '2026-06%'
  ORDER BY tp.name, pp.date_from
`).all();

console.log('Sample lines notes:');
lines.forEach(l => {
  let notes = {};
  try { notes = JSON.parse(l.notes); } catch (_) {}
  const ca = notes.payroll_meta?.concept_amounts || {};
  console.log(`${l.emp_name.padEnd(30)} | ${l.period_name.padEnd(25)} | SalBase: ${l.salary_base} | Net: ${l.net_pay} | Prima: ${ca.prima_servicios || ca.prima || 0} | ca:`, JSON.stringify(ca));
});
