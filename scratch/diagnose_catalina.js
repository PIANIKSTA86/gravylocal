const PocketBase = require('pocketbase/cjs');

async function run() {
  const pb = new PocketBase('http://localhost:8090');
  
  // Autenticar como administrador
  await pb.admins.authWithPassword('admin@admin.com', 'admin123456');
  
  // Buscar empleado
  const emp = await pb.collection('third_parties').getFirstListItem('name LIKE "%CATALINA%"');
  console.log("Empleado encontrado:", emp.id, emp.name);
  
  // Buscar colillas del periodo de Julio 2026
  const lines = await pb.collection('payroll_lines').getList(1, 20, {
    filter: `employee_id = "${emp.id}"`,
    expand: 'period_id'
  });
  
  console.log("Colillas de pago de Catalina:");
  for (const line of lines.items) {
    console.log(JSON.stringify(line, null, 2));
  }
}

run().catch(console.error);
