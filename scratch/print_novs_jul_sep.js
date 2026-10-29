const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');
const periods = db.prepare(`
  SELECT id, name, date_from, date_to, status 
  FROM payroll_periods 
  WHERE date_from >= '2026-07-01' AND date_from <= '2026-09-30'
  ORDER BY date_from ASC
`).all();

for (const p of periods) {
  const novs = db.prepare(`
    SELECT n.id, n.type, t.name as emp_name, n.amount, n.qty, n.status, n.date_from, n.date_to, n.updated
    FROM payroll_novelties n
    LEFT JOIN third_parties t ON t.id = n.employee_id
    WHERE n.period_id = ?
    ORDER BY n.updated DESC
  `).all(p.id);
  console.log(`\n======================================================`);
  console.log(`Period: ${p.name} (${p.id}) [${p.status}] - Count: ${novs.length}`);
  novs.forEach(n => {
    console.log(`  [${n.status}] ${n.emp_name.padEnd(30)} | ${n.type.padEnd(25)} | Amount: ${String(n.amount).padStart(9)} | Qty: ${n.qty} | Date: ${n.date_from} | Updated: ${n.updated}`);
  });
}
