const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../pb_data/data.db'));

db.all(`
  SELECT pl.*, tp.name as emp_name, pp.name as period_name, pp.date_from, pp.date_to
  FROM payroll_lines pl
  LEFT JOIN third_parties tp ON pl.employee_id = tp.id
  LEFT JOIN payroll_periods pp ON pl.period_id = pp.id
  WHERE tp.name LIKE '%AMPARO%' OR tp.name LIKE '%REYES%'
`, (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
