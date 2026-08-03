const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
  console.log("Abriendo base de datos SQLite en:", dbPath);
  const db = new DatabaseSync(dbPath);

  // Buscar empleado Catalina
  const empQuery = db.prepare('SELECT id, name FROM third_parties WHERE name LIKE ? LIMIT 1');
  const emp = empQuery.get('%CATALINA%');
  
  if (!emp) {
    console.log("No se encontró el empleado");
    return;
  }
  console.log("Empleado encontrado:", emp);

  // Buscar colillas de Catalina
  const linesQuery = db.prepare('SELECT id, period_id, salary_base, days_worked, net_pay, deduction_health, deduction_pension, employer_health, employer_pension, overtime, transport_allowance, notes FROM payroll_lines WHERE employee_id = ?');
  const lines = linesQuery.all(emp.id);

  console.log("Líneas de nómina encontradas:");
  lines.forEach(l => {
    console.log(JSON.stringify(l, null, 2));
  });
}

run();
