const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');
db.all(`
  SELECT pl.*, tp.name as emp_name
  FROM payroll_lines pl
  JOIN third_parties tp ON pl.employee_id = tp.id
`, (err, lines) => {
  if (err) console.error(err);
  else {
    console.log('--- ALL PAYROLL LINES ---');
    lines.forEach(l => {
      console.log(`Line ID: ${l.id} | Emp: ${l.emp_name} | Period: ${l.period_id} | Days: ${l.days_worked} | Salary: ${l.salary_base} | Net: ${l.net_pay} | DevTot: ${l.salary_base/30*l.days_worked + l.transport_allowance + l.overtime} | DedHealth: ${l.deduction_health} | DedPension: ${l.deduction_pension} | DedOther: ${l.deduction_other} | Notes: ${l.notes}`);
    });
  }
  db.all(`SELECT * FROM novedades`, (err, novs) => {
    console.log('\n--- NOVEDADES ---');
    console.log(JSON.stringify(novs, null, 2));
    db.close();
  });
});
