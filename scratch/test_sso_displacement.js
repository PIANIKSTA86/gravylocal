// Test Real: Desplazamiento de Sesión a través del flujo SSO oficial (HUB + Tenant)
async function runRealSsoTest() {
  console.log("=== INICIANDO PRUEBA REAL DE SESIÓN ÚNICA CON FLUJO SSO ===");

  // 1. Obtener token del HUB para admin@contaco.com
  console.log("\n1. Login en el HUB (puerto 8089)...");
  const hubRes = await fetch('http://127.0.0.1:8089/api/collections/hub_users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
  });
  if (!hubRes.ok) {
    console.error("Fallo login en HUB:", await hubRes.text());
    return;
  }
  const hubData = await hubRes.json();
  const hubToken = hubData.token;
  console.log("✓ Token del HUB obtenido exitosamente.");

  // 2. Simular Login de Equipo A en el Tenant vía /api/tenant/auth-via-hub
  console.log("\n2. Simulando autenticación en Tenant para Equipo A...");
  const ssoResA = await fetch('http://127.0.0.1:8090/api/tenant/auth-via-hub', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hub_token: hubToken })
  });
  if (!ssoResA.ok) {
    console.error("Fallo SSO Equipo A:", await ssoResA.text());
    return;
  }
  const ssoDataA = await ssoResA.json();
  const tokenA = ssoDataA.token;
  console.log("✓ Token A emitido por Tenant:", tokenA.slice(0, 25) + "...");
  console.log("  active_session_id Equipo A:", ssoDataA.record?.active_session_id);

  // 3. Probar Heartbeat de Equipo A con Token A
  console.log("\n3. Verificando Heartbeat de Equipo A...");
  const hbResA1 = await fetch('http://127.0.0.1:8090/api/session/heartbeat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  });
  console.log("  Status Heartbeat Equipo A:", hbResA1.status);
  const hbDataA1 = await hbResA1.json();
  console.log("  Datos Heartbeat A:", hbDataA1);

  // 4. Simular Login de Equipo B en el Tenant con la misma cuenta
  console.log("\n4. Simulando autenticación concurrente para Equipo B...");
  const ssoResB = await fetch('http://127.0.0.1:8090/api/tenant/auth-via-hub', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hub_token: hubToken })
  });
  if (!ssoResB.ok) {
    console.error("Fallo SSO Equipo B:", await ssoResB.text());
    return;
  }
  const ssoDataB = await ssoResB.json();
  const tokenB = ssoDataB.token;
  console.log("✓ Token B emitido por Tenant:", tokenB.slice(0, 25) + "...");
  console.log("  active_session_id Equipo B:", ssoDataB.record?.active_session_id);

  // 5. Probar Heartbeat de Equipo B con Token B (debe ser 200 OK)
  console.log("\n5. Verificando Heartbeat de Equipo B (activo)...");
  const hbResB = await fetch('http://127.0.0.1:8090/api/session/heartbeat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenB}`
    }
  });
  console.log("  Status Heartbeat Equipo B:", hbResB.status);
  const hbDataB = await hbResB.json();
  console.log("  Datos Heartbeat B:", hbDataB);

  // 6. Verificar que Equipo A ahora es rechazado (debe ser 401)
  console.log("\n6. Verificando rechazo de Token A (Equipo A desplazado)...");
  const hbResA2 = await fetch('http://127.0.0.1:8090/api/session/heartbeat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    }
  });
  console.log("  Status Heartbeat Token A post-desplazamiento:", hbResA2.status);
  const hbDataA2 = await hbResA2.json();
  console.log("  Respuesta servidor a Token A:", hbDataA2);

  // 7. Verificar petición contable de Token A
  console.log("\n7. Verificando petición a transactions con Token A...");
  const txResA = await fetch('http://127.0.0.1:8090/api/collections/transactions/records?perPage=1', {
    headers: {
      'Authorization': `Bearer ${tokenA}`
    }
  });
  console.log("  Status petición transactions con Token A desplazado:", txResA.status);
  const txDataA = await txResA.json();
  console.log("  Respuesta transactions:", txDataA);

  if (hbResA2.status === 401 && txResA.status === 401) {
    console.log("\n=======================================================");
    console.log("✅ RESULTADO: CONTROL DE SESIÓN ÚNICA OPERANDO AL 100%");
    console.log("  • Token B activo y aceptado con nueva sesión.");
    console.log("  • Token A revocado inmediatamente con HTTP 401.");
    console.log("=======================================================");
  } else {
    console.log("\nRevisar resultados: Heartbeat A2:", hbResA2.status, "Tx A:", txResA.status);
  }
}

runRealSsoTest().catch(console.error);
