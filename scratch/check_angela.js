const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const emps = db.prepare("SELECT id, name, active FROM third_parties WHERE name LIKE '%GARCIA%' OR name LIKE '%VIVAS%'").all();
console.log('Employees found:', emps);

for (const emp of emps) {
  console.log('=== Employee:', emp.name, emp.id, 'Active:', emp.active);
  const lines = db.prepare('SELECT id, period_id, salary_base, days_worked, transport_allowance, overtime, deduction_health, deduction_pension, net_pay, prima, cesantias, intereses_ces, notes FROM payroll_lines WHERE employee_id = ?').all(emp.id);
  console.log('Lines count:', lines.length);
  for (const l of lines) {
    const period = db.prepare('SELECT name, date_from, date_to, status FROM payroll_periods WHERE id = ?').get(l.period_id);
    console.log('Line in period:', period ? period.name : l.period_id, 'Status:', period?.status, 'Base:', l.salary_base, 'Days:', l.days_worked, 'Transp:', l.transport_allowance, 'Prima:', l.prima, 'Ces:', l.cesantias, 'Net:', l.net_pay);
    try {
      const parsed = JSON.parse(l.notes);
      console.log('  concept_amounts:', parsed?.payroll_meta?.concept_amounts);
    } catch(e) {
      console.log('  raw notes:', l.notes);
    }
  }
  const novs = db.prepare('SELECT id, period_id, type, date_from, date_to, qty, amount, status, description FROM payroll_novelties WHERE employee_id = ?').all(emp.id);
  console.log('Novelties:', novs);
  for (const n of novs) {
    const period = db.prepare('SELECT name, date_from, date_to, status FROM payroll_periods WHERE id = ?').get(n.period_id);
    console.log('  Nov period:', period ? period.name : n.period_id, 'Period status:', period?.status);
  }
  const sets = db.prepare('SELECT id, settlement_date, reason, status, tx_id, net_pay FROM payroll_settlements WHERE employee_id = ?').all(emp.id);
  console.log('Settlements:', sets);
  for (const s of sets) {
    if (s.tx_id) {
      const tx = db.prepare('SELECT id, number, date, status FROM transactions WHERE id = ?').get(s.tx_id);
      console.log('  Settlement tx:', tx);
    }
  }
}
