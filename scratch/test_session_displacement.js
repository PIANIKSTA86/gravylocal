// Test de Desplazamiento y Revocación Criptográfica de Sesión Única
async function runTest() {
  console.log("=== INICIANDO PRUEBA DE CONTROL DE SESIÓN ÚNICA ===");
  
  // 1. Iniciar sesión en el Tenant como admin (simulando Equipo A)
  console.log("\n1. Simulando login en Equipo A...");
  const loginResA = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
  });

  if (!loginResA.ok) {
    console.error("Error login Equipo A:", await loginResA.text());
    return;
  }
  const authA = await loginResA.json();
  const tokenA = authA.token;
  const userA = authA.record;
  console.log("✓ Login Equipo A exitoso. Token A:", tokenA.slice(0, 25) + "...");
  console.log("  Usuario:", userA.email, "| ID:", userA.id);

  // 2. Heartbeat en Equipo A
  console.log("\n2. Probando Heartbeat con Token A...");
  const hbResA1 = await fetch('http://127.0.0.1:8090/api/session/heartbeat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  });
  const hbA1 = await hbResA1.json();
  console.log("✓ Heartbeat Equipo A (Status " + hbResA1.status + "):", hbA1);

  // 3. Simular login en Equipo B con la misma cuenta
  console.log("\n3. Simulando login concurrente en Equipo B con la misma cuenta...");
  const loginResB = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
  });

  if (!loginResB.ok) {
    console.error("Error login Equipo B:", await loginResB.text());
    return;
  }
  const authB = await loginResB.json();
  const tokenB = authB.token;
  console.log("✓ Login Equipo B exitoso. Token B:", tokenB.slice(0, 25) + "...");

  // 4. Heartbeat en Equipo B (debe ser 200 OK)
  console.log("\n4. Probando Heartbeat con Token B (Equipo B activo)...");
  const hbResB = await fetch('http://127.0.0.1:8090/api/session/heartbeat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenB}`
    }
  });
  const hbB = await hbResB.json();
  console.log("✓ Heartbeat Equipo B (Status " + hbResB.status + "):", hbB);

  // 5. Verificar que Equipo A ahora es rechazado (debe ser 401 Unauthorized)
  console.log("\n5. Verificando rechazo inmediato de Token A (Equipo A desplazado)...");
  const hbResA2 = await fetch('http://127.0.0.1:8090/api/session/heartbeat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  });
  console.log("  Status respuesta Token A:", hbResA2.status);
  const hbA2 = await hbResA2.json();
  console.log("  Cuerpo respuesta Token A:", hbA2);

  if (hbResA2.status === 401) {
    console.log("\n✅ PRUEBA EXITOSA: El Token del Equipo A fue revocado y rechazado con 401.");
  } else {
    console.log("\n❌ FALLO: El Token del Equipo A no fue rechazado.");
  }

  // 6. Verificar también con una consulta de datos estándar (ej. coleccion transactions)
  console.log("\n6. Verificando que Token A no puede leer/escribir datos contables...");
  const txRes = await fetch('http://127.0.0.1:8090/api/collections/transactions/records?perPage=1', {
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  console.log("  Status consulta transactions con Token A desplazado:", txRes.status);
  if (txRes.status === 401) {
    console.log("✅ PRUEBA EXITOSA: Cualquier operación contable con el token previo queda totalmente bloqueada.");
  }
}

runTest().catch(console.error);
