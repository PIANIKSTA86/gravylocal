const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);

  // Buscar empleado Catalina
  const emp = db.prepare("SELECT id, name FROM third_parties WHERE name LIKE '%CATALINA%' LIMIT 1").get();
  if (!emp) {
    console.log("No se encontró el empleado");
    return;
  }

  // Buscar novedades asociadas a Catalina
  const novelties = db.prepare("SELECT id, period_id, employee_id, type, amount, description FROM payroll_novelties WHERE employee_id = ?").all(emp.id);
  console.log("Novedades de Catalina:");
  console.log(JSON.stringify(novelties, null, 2));
}

run();
