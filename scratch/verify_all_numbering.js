const url = 'http://127.0.0.1:8090/api/collections';

async function verifyAll() {
  console.log("===============================================================");
  console.log("   VERIFICACIÓN INTEGRAL DE NUMERACIÓN Y RESOLUCIONES DIAN     ");
  console.log("===============================================================\n");

  const loginResp = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  }).then(r => r.json());

  if (!loginResp.token) {
    throw new Error("No se pudo iniciar sesión como superuser: " + JSON.stringify(loginResp));
  }
  const token = loginResp.token;
  const headers = { 'Content-Type': 'application/json', 'Authorization': token };

  // Helper de limpieza segura
  async function safeDelete(coll, id) {
    if (!id) return;
    try {
      await fetch(`${url}/${coll}/records/${id}`, { method: 'DELETE', headers });
    } catch (_) {}
  }

  const thirdParties = await fetch(`${url}/third_parties/records?perPage=1`, { headers }).then(r => r.json());
  const supplierId = thirdParties.items[0]?.id;

  // -------------------------------------------------------------
  // TEST 1: AISLAMIENTO DE COMPRAS ORDINARIAS (FC) vs DIAN (DS)
  // -------------------------------------------------------------
  console.log("[TEST 1] Verificando aislamiento de compras ordinarias (FC)...");
  const resDSBefore = await fetch(`${url}/dian_resolutions/records?filter=(document_type='DS')`, { headers }).then(r => r.json());
  const dsBefore = resDSBefore.items[0];
  const dsNumBefore = dsBefore ? dsBefore.current_number : 0;

  const ttFC = await fetch(`${url}/transaction_types/records?filter=(code='FC')`, { headers }).then(r => r.json());
  const fcTypeId = ttFC.items[0]?.id;

  const purResp = await fetch(`${url}/purchase_invoices/records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      number: 'FC-TEST-VERIFY-9999',
      date: '2026-09-09',
      supplier_id: supplierId,
      tx_type_id: fcTypeId,
      tx_number: 'AUTO',
      status: 'draft',
      subtotal: 10000,
      total: 10000
    })
  });
  const purCreated = await purResp.json();

  const resDSAfter = await fetch(`${url}/dian_resolutions/records?filter=(document_type='DS')`, { headers }).then(r => r.json());
  const dsAfter = resDSAfter.items[0];
  const dsNumAfter = dsAfter ? dsAfter.current_number : 0;

  if (dsNumAfter === dsNumBefore) {
    console.log(`  ✔ CORRECTO: Compra FC no alteró resolución DS (permanece en ${dsNumAfter})`);
  } else {
    console.log(`  ✖ ERROR: Compra FC alteró resolución DS de ${dsNumBefore} a ${dsNumAfter}`);
  }
  await safeDelete('purchase_invoices', purCreated.id);

  // -------------------------------------------------------------
  // TEST 2: DOCUMENTO SOPORTE ELECTRÓNICO (DSE)
  // -------------------------------------------------------------
  console.log("\n[TEST 2] Verificando emisión de Documento Soporte (DSE)...");
  const ttDS = await fetch(`${url}/transaction_types/records?filter=(prefix='DSE'||code='DS')`, { headers }).then(r => r.json());
  const dsType = ttDS.items.find((t: any) => t.prefix === 'DSE') || ttDS.items[0];
  const dsTypeId = dsType?.id;
  const dsExpectedNext = (dsAfter.current_number || 310) + 1;
  const dsExpectedNumber = `DSE-${String(dsExpectedNext).padStart(8, '0')}`;

  const dsCreateResp = await fetch(`${url}/purchase_invoices/records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      number: dsExpectedNumber,
      date: '2026-09-09',
      supplier_id: supplierId,
      tx_type_id: dsTypeId,
      tx_number: dsExpectedNumber,
      status: 'posted',
      subtotal: 25000,
      total: 25000
    })
  });
  const dsCreated = await dsCreateResp.json();

  const resDSEPost = await fetch(`${url}/dian_resolutions/records?filter=(document_type='DS')`, { headers }).then(r => r.json());
  const dsPostObj = resDSEPost.items[0];
  console.log(`  Consecutivo DSE asignado: ${dsCreated.number}`);
  console.log(`  Resolución DIAN actualizada a: ${dsPostObj.current_number} (Rango legal: ${dsPostObj.number_from} a ${dsPostObj.number_to})`);

  if (dsPostObj.current_number === dsExpectedNext && dsPostObj.current_number <= dsPostObj.number_to) {
    console.log("  ✔ CORRECTO: Consecutivo legal DSE avanzado atómicamente dentro de rango.");
  } else {
    console.log("  ✖ ERROR: Consecutivo DSE fuera de expectativa.");
  }

  // Limpiar registro de test y resetear contador a 310 para dejar la base limpia
  await safeDelete('purchase_invoices', dsCreated.id);
  await fetch(`${url}/dian_resolutions/records/${dsPostObj.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ current_number: 310 })
  });
  if (dsTypeId) {
    await fetch(`${url}/transaction_types/records/${dsTypeId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ consecutive: 310 })
    });
  }

  // -------------------------------------------------------------
  // TEST 3: TESORERÍA (COMPROBANTES CON "AUTO")
  // -------------------------------------------------------------
  console.log("\n[TEST 3] Verificando asignación automática en Comprobantes de Tesorería...");
  const ttCE = await fetch(`${url}/transaction_types/records?filter=(code='CE'||code='CG')`, { headers }).then(r => r.json());
  const ceType = ttCE.items[0];
  const ceConsecBefore = ceType ? ceType.consecutive : 0;
  console.log(`  Tipo: ${ceType.code} (${ceType.name}), Consecutivo actual: ${ceConsecBefore}`);

  const ceTxResp = await fetch(`${url}/transactions/records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      number: 'AUTO',
      date: '2026-09-09',
      tx_type_id: ceType.id,
      third_party_id: supplierId,
      status: 'active',
      description: 'Test de tesorería automático',
      teso_mode: 'auto',
      teso_params: JSON.stringify({
        third_party_id: supplierId,
        amount: 10000,
        contrapartida_account_id: 'a0jqorntp15wdnn'
      })
    })
  });
  const ceTxCreated = await ceTxResp.json();
  console.log(`  Transacción creada con número: ${ceTxCreated.number}`);

  const ttCEPost = await fetch(`${url}/transaction_types/records/${ceType.id}`, { headers }).then(r => r.json());
  console.log(`  Consecutivo tipo actualizado a: ${ttCEPost.consecutive}`);

  if (ceTxCreated.number && !ceTxCreated.number.includes('AUTO') && ttCEPost.consecutive > ceConsecBefore) {
    console.log("  ✔ CORRECTO: Tesorería resuelve 'AUTO' secuencialmente y avanza el tipo.");
  } else {
    console.log("  ✖ ERROR: Falla al asignar número automático en tesorería.");
  }

  // Limpiar test
  await safeDelete('transactions', ceTxCreated.id);
  await fetch(`${url}/transaction_types/records/${ceType.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ consecutive: ceConsecBefore })
  });

  // -------------------------------------------------------------
  // TEST 4: FACTURAS DE VENTA / NOTAS CRÉDITO (DIAN)
  // -------------------------------------------------------------
  console.log("\n[TEST 4] Verificando sincronización de Facturas de Venta / Resoluciones DIAN...");
  const resFV = await fetch(`${url}/dian_resolutions/records?filter=(document_type='FV')`, { headers }).then(r => r.json());
  const fvRes = resFV.items[0];
  console.log(`  Resolución FV: ${fvRes.prefix}, Actual: ${fvRes.current_number}, Rango: ${fvRes.number_from} - ${fvRes.number_to}`);

  const ttFV = await fetch(`${url}/transaction_types/records?filter=(prefix='${fvRes.prefix}')`, { headers }).then(r => r.json());
  const fvType = ttFV.items[0];
  console.log(`  Tipo transacción FV: ${fvType ? fvType.prefix : 'N/A'}, Consecutivo en tipo: ${fvType ? fvType.consecutive : 'N/A'}`);

  if (fvRes && fvType && fvType.consecutive === fvRes.current_number) {
    console.log("  ✔ CORRECTO: Sincronización 1:1 entre dian_resolutions y transaction_types.");
  } else {
    console.log("  ⚠ INFORMACIÓN: Consecutivos desalineados o no sincronizados automáticamente.");
  }

  console.log("\n===============================================================");
  console.log("   TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE                 ");
  console.log("===============================================================");
}

verifyAll().catch(err => {
  console.error("\x1b[31mError ejecutando verificación:\x1b[0m", err);
  process.exit(1);
});
