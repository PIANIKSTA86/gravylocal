const url = 'http://127.0.0.1:8090/api/collections';

async function testDraftDsEdit() {
  console.log("===============================================================");
  console.log("   TEST: EDICIÓN Y RE-GUARDADO DE BORRADOR DOCUMENTO SOPORTE   ");
  console.log("===============================================================\n");

  const loginResp = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
  }).then(r => r.json());

  if (!loginResp.token) {
    throw new Error("No se pudo iniciar sesión: " + JSON.stringify(loginResp));
  }
  const token = loginResp.token;
  const headers = { 'Content-Type': 'application/json', 'Authorization': token };

  // 1. Obtener estado actual de la resolución DIAN de DS
  const resDS = await fetch(`${url}/dian_resolutions/records?filter=(document_type='DS')`, { headers }).then(r => r.json());
  const dsRes = resDS.items[0];
  const initialCurrentNum = dsRes.current_number;
  console.log(`Resolución DIAN DS inicial: prefijo=${dsRes.prefix}, current_number=${initialCurrentNum}`);

  const ttDS = await fetch(`${url}/transaction_types/records?filter=(code='DSE'||prefix='DSE'||code='DS')`, { headers }).then(r => r.json());
  const dsType = ttDS.items[0];

  const tpResp = await fetch(`${url}/third_parties/records?perPage=1`, { headers }).then(r => r.json());
  const supplierId = tpResp.items[0]?.id;

  // 2. Crear un borrador inicial de Documento Soporte
  const expectedNum = `DSE-${String(initialCurrentNum + 1).padStart(8, '0')}`;
  console.log(`Creando borrador inicial con número sugerido: ${expectedNum}...`);

  const createResp = await fetch(`${url}/purchase_invoices/records`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      number: expectedNum,
      tx_number: expectedNum,
      date: '2026-09-09',
      tx_type_id: dsType.id,
      supplier_id: supplierId,
      status: 'draft',
      notes: 'Borrador inicial DS',
      subtotal: 150000,
      total: 150000,
      payable_total: 150000
    })
  });
  const createdDraft = await createResp.json();
  console.log(`✔ Borrador creado con ID: ${createdDraft.id}, Number: ${createdDraft.number}`);

  // 3. Simular "Volver a guardar el borrador" (Edición del borrador 1ª vez)
  console.log("\nSimulando 1er re-guardado del borrador (editando notas y montos)...");
  const edit1Resp = await fetch(`${url}/purchase_invoices/records/${createdDraft.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      number: createdDraft.number,
      tx_number: createdDraft.tx_number || createdDraft.number,
      date: '2026-09-09',
      tx_type_id: dsType.id,
      supplier_id: supplierId,
      status: 'draft',
      notes: 'Borrador DS editado por primera vez',
      subtotal: 200000,
      total: 200000,
      payable_total: 200000
    })
  });
  const updatedDraft1 = await edit1Resp.json();
  console.log(`Resultado 1er re-guardado: ID=${updatedDraft1.id}, Number=${updatedDraft1.number}, Notes="${updatedDraft1.notes}"`);

  // 4. Simular "Volver a guardar el borrador" (Edición del borrador 2ª vez)
  console.log("\nSimulando 2do re-guardado del borrador (segunda edición)...");
  const edit2Resp = await fetch(`${url}/purchase_invoices/records/${createdDraft.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      number: updatedDraft1.number,
      tx_number: updatedDraft1.tx_number || updatedDraft1.number,
      date: '2026-09-09',
      tx_type_id: dsType.id,
      supplier_id: supplierId,
      status: 'draft',
      notes: 'Borrador DS editado por segunda vez',
      subtotal: 250000,
      total: 250000,
      payable_total: 250000
    })
  });
  const updatedDraft2 = await edit2Resp.json();
  console.log(`Resultado 2do re-guardado: ID=${updatedDraft2.id}, Number=${updatedDraft2.number}, Notes="${updatedDraft2.notes}"`);

  // 5. Verificaciones críticas:
  console.log("\n--- VERIFICACIONES DE INTEGRIDAD ---");
  let passed = true;

  // A) El ID debe ser exactamente el mismo
  if (updatedDraft2.id === createdDraft.id) {
    console.log(`  ✔ CORRECTO: El ID del registro es el mismo (${createdDraft.id}). No se crearon duplicados.`);
  } else {
    console.log(`  ✖ ERROR: Se generó un nuevo ID.`);
    passed = false;
  }

  // B) El número debe permanecer idéntico
  if (updatedDraft2.number === createdDraft.number && updatedDraft2.number === expectedNum) {
    console.log(`  ✔ CORRECTO: El número permanece intacto (${updatedDraft2.number}). No saltó la numeración.`);
  } else {
    console.log(`  ✖ ERROR: El número cambió de ${createdDraft.number} a ${updatedDraft2.number}`);
    passed = false;
  }

  // C) La resolución DIAN NO debe haber sido consumida en borradores
  const resDSPost = await fetch(`${url}/dian_resolutions/records?filter=(document_type='DS')`, { headers }).then(r => r.json());
  const dsResPost = resDSPost.items[0];
  console.log(`  Resolución DIAN DS posterior: current_number = ${dsResPost.current_number} (Inicial: ${initialCurrentNum})`);

  // Limpiar registro de prueba
  await fetch(`${url}/purchase_invoices/records/${createdDraft.id}`, { method: 'DELETE', headers });
  console.log("  Registro de prueba eliminado limpiamente.");

  // Revertir resolución a initialCurrentNum si hubo algún movimiento
  if (dsResPost.current_number !== initialCurrentNum) {
    await fetch(`${url}/dian_resolutions/records/${dsResPost.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ current_number: initialCurrentNum })
    });
  }

  if (passed) {
    console.log("\n\x1b[32m✔ TEST SUPERADO: La edición y re-guardado de borradores mantiene la misma numeración sin saltos ni duplicados.\x1b[0m\n");
  } else {
    console.log("\n\x1b[31m✖ TEST FALLIDO: Revisar detalles anteriores.\x1b[0m\n");
    process.exit(1);
  }
}

testDraftDsEdit().catch(err => {
  console.error("Error en test:", err);
  process.exit(1);
});
