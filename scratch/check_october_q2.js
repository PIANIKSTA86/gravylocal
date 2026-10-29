const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');
const periodId = 'oyaus6j1tjhgyr3'; // Octubre Q2
const lines = db.prepare(`
  SELECT l.*, t.name as emp_name 
  FROM payroll_lines l 
  JOIN third_parties t ON t.id = l.employee_id 
  WHERE l.period_id = ?
`).all(periodId);

console.log('=== LINES FOR Nómina Octubre 2026 — Q2 ===');
for (const l of lines) {
  let notes = {};
  try { notes = JSON.parse(l.notes); } catch (_) {}
  const ca = notes.payroll_meta?.concept_amounts || {};
  const ot = notes.payroll_meta?.overtime_breakdown || {};
  console.log(`\nEmployee: ${l.emp_name} (${l.employee_id})`);
  console.log(`  Salary Base: ${l.salary_base} | Days: ${l.days_worked} | Transp: ${l.transport_allowance} | OT: ${l.overtime} | Net: ${l.net_pay}`);
  console.log(`  Concept Amounts in notes:`, ca);
  console.log(`  Overtime in notes:`, ot);
}

// Compare with novelties for this period
const novs = db.prepare(`
  SELECT n.*, t.name as emp_name 
  FROM payroll_novelties n 
  JOIN third_parties t ON t.id = n.employee_id 
  WHERE n.period_id = ?
`).all(periodId);
console.log('\n=== NOVELTIES FOR Nómina Octubre 2026 — Q2 ===');
console.table(novs.map(n => ({
  emp: n.emp_name,
  type: n.type,
  amount: n.amount,
  qty: n.qty,
  status: n.status,
  updated: n.updated
})));
