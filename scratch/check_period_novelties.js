const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');
const periods = db.prepare(`
  SELECT id, name, date_from, date_to, status 
  FROM payroll_periods 
  WHERE date_from >= '2026-07-01' 
  ORDER BY date_from ASC
`).all();

console.log('=== PERIODS & THEIR NOVELTIES IN pb_data/data.db ===');
for (const p of periods) {
  const novs = db.prepare(`
    SELECT n.id, n.type, t.name as emp_name, n.amount, n.qty, n.status, n.date_from, n.date_to, n.created, n.updated
    FROM payroll_novelties n
    LEFT JOIN third_parties t ON t.id = n.employee_id
    WHERE n.period_id = ?
    ORDER BY n.updated DESC
  `).all(p.id);
  console.log(`\nPeriod: ${p.name} (${p.id}) [${p.status}] - Novelties count: ${novs.length}`);
  if (novs.length > 0) {
    console.table(novs);
  }
}
