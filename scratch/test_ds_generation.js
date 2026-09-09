const url = 'http://127.0.0.1:8090/api/collections';

async function run() {
  try {
    const login = await fetch('http://127.0.0.1:8090/api/collections/_superusers/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    }).then(r => r.json());
    
    if (!login.token) {
      console.log("No token login:", login);
      return;
    }
    const token = login.token;

    // 1. Obtener estado previo de resolución DS
    const resPre = await fetch(`${url}/dian_resolutions/records?filter=(document_type='DS')`, { headers: { 'Authorization': token } }).then(r => r.json());
    const dsPre = resPre.items[0];
    console.log(`Estado PREVIO resolución DS: current_number = ${dsPre.current_number}`);

    // 2. Obtener tipo Documento Soporte (DSE)
    const ttResp = await fetch(`${url}/transaction_types/records?filter=(prefix='DSE')`, { headers: { 'Authorization': token } }).then(r => r.json());
    const dsType = ttResp.items[0];
    console.log(`Tipo DSE encontrado: id = ${dsType.id}, prefix = ${dsType.prefix}`);

    const tpResp = await fetch(`${url}/third_parties/records?perPage=1`, { headers: { 'Authorization': token } }).then(r => r.json());
    const supplierId = tpResp.items[0]?.id;

    // 3. Crear documento soporte nuevo con 'AUTO'
    console.log("Creando Documento Soporte con 'AUTO'...");
    const createResp = await fetch(`${url}/purchase_invoices/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({
        number: 'AUTO',
        date: '2026-09-09',
        supplier_id: supplierId,
        tx_type_id: dsType.id,
        tx_number: 'AUTO',
        status: 'draft',
        subtotal: 75000,
        total: 75000
      })
    });

    const createdDs = await createResp.json();
    console.log(`Respuesta create DS (${createResp.status}):`, JSON.stringify(createdDs, null, 2));

    // 4. Verificar resolución DIAN post-creación
    const resPost = await fetch(`${url}/dian_resolutions/records?filter=(document_type='DS')`, { headers: { 'Authorization': token } }).then(r => r.json());
    const dsPost = resPost.items[0];
    console.log(`Estado POSTERIOR resolución DS: current_number = ${dsPost.current_number}`);

    if (createResp.status === 200 && dsPost.current_number === 311) {
      console.log("\x1b[32m✔ ÉXITO: El Documento Soporte se creó correctamente con consecutivo 311 y la resolución DIAN avanzó de forma segura.\x1b[0m");
    } else {
      console.log("\x1b[31m✖ ERROR en creación de Documento Soporte.\x1b[0m");
    }

    // 5. Limpieza de prueba
    if (createdDs.id) {
      await fetch(`${url}/purchase_invoices/records/${createdDs.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      // Revertir a 310 para no consumir folios de prueba innecesarios
      await fetch(`${url}/dian_resolutions/records/${dsPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ current_number: 310 })
      });
      console.log("Prueba limpiada y resolución restaurada a 310.");
    }

  } catch (e) {
    console.error("Error en test_ds_generation:", e);
  }
}

run();
