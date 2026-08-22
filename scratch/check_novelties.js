const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');
db.all(`SELECT pn.*, tp.name as emp_name FROM payroll_novelties pn LEFT JOIN third_parties tp ON pn.employee_id = tp.id`, (err, novs) => {
  if (err) console.error(err);
  else {
    console.log('=== PAYROLL NOVELTIES ===');
    console.log(JSON.stringify(novs, null, 2));
  }
  db.close();
});
