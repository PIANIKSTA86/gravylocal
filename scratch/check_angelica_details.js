const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const empId = 'vsu8bz83547sxrn';
const emp = db.prepare('SELECT id, name, active FROM third_parties WHERE id = ?').get(empId);
console.log('Employee:', emp);

const novs = db.prepare('SELECT * FROM payroll_novelties WHERE employee_id = ?').all(empId);
console.log('Novelties:');
for (const n of novs) {
  const p = db.prepare('SELECT name, status, date_from, date_to FROM payroll_periods WHERE id = ?').get(n.period_id);
  console.log(' ', n.id, n.type, n.date_from, 'Status:', n.status, '| Period:', p?.name, 'PeriodStatus:', p?.status);
}

const lines = db.prepare('SELECT l.id, l.period_id, p.name, p.status, l.salary_base, l.days_worked, l.net_pay FROM payroll_lines l JOIN payroll_periods p ON l.period_id = p.id WHERE l.employee_id = ?').all(empId);
console.log('Payroll lines:', lines);

// Check transactions associated with Angelica
const txs = db.prepare('SELECT id, number, date, description, status FROM transactions WHERE third_party_id = ? OR description LIKE ?').all(empId, `%${emp?.name}%`);
console.log('Transactions:', txs);
