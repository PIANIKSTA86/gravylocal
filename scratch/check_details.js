const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');
db.all(`
  SELECT pl.*, tp.name as emp_name, pp.name as period_name
  FROM payroll_lines pl
  JOIN third_parties tp ON pl.employee_id = tp.id
  JOIN payroll_periods pp ON pl.period_id = pp.id
  WHERE pl.id = '3ackpp390guyy7m' OR (tp.name LIKE '%AMPARO%' AND pp.name LIKE '%Enero%')
`, (err, rows) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(rows, null, 2));
  db.close();
});
