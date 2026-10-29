const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

console.log('--- ALL PAYROLL SETTLEMENTS ---');
const settlements = db.prepare('SELECT * FROM payroll_settlements').all();
console.log('Settlements count:', settlements.length, settlements);

console.log('\n--- ALL PAYROLL NOVELTIES OF TYPE RETIRO ---');
const retNovs = db.prepare("SELECT * FROM payroll_novelties WHERE type = 'RETIRO'").all();
console.log('Retiro novs:', retNovs);

console.log('\n--- ALL NOVELTIES ---');
const allNovs = db.prepare('SELECT id, period_id, employee_id, type, amount, status FROM payroll_novelties').all();
for (const n of allNovs) {
  const p = db.prepare('SELECT name, status FROM payroll_periods WHERE id = ?').get(n.period_id);
  const emp = db.prepare('SELECT name, active FROM third_parties WHERE id = ?').get(n.employee_id);
  console.log(`Nov ${n.id} (${n.type}) | Emp: ${emp?.name} (active: ${emp?.active}) | Period: ${p?.name} (status: ${p?.status}) | Nov status: ${n.status}`);
}
