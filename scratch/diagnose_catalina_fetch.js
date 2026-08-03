async function run() {
  // Autenticar como usuario en la colección 'users'
  const authRes = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@admin.com', password: 'admin123456' })
  });
  
  if (!authRes.ok) {
    const errText = await authRes.text();
    throw new Error("Fallo de autenticación: " + errText);
  }
  
  const authData = await authRes.json();
  const token = authData.token;

  // Buscar empleado Catalina
  const empRes = await fetch('http://127.0.0.1:8090/api/collections/third_parties/records?filter=name%20~%20%22CATALINA%22', {
    headers: { 'Authorization': token }
  });
  const empData = await empRes.json();
  if (!empData.items.length) {
    console.log("No se encontró el empleado");
    return;
  }
  const emp = empData.items[0];
  console.log("Empleado:", emp.id, emp.name);

  // Buscar colillas de Catalina
  const linesRes = await fetch(`http://127.0.0.1:8090/api/collections/payroll_lines/records?filter=employee_id%3D%22${emp.id}%22&expand=period_id`, {
    headers: { 'Authorization': token }
  });
  const linesData = await linesRes.json();
  console.log("Líneas de nómina encontradas:");
  console.log(JSON.stringify(linesData.items, null, 2));
}

run().catch(console.error);
