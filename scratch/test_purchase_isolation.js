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

    // 1. Obtener estado previo de la resolución DIAN de DS
    const resPre = await fetch(`${url}/dian_resolutions/records?filter=(document_type='DS')`, { headers: { 'Authorization': token } }).then(r => r.json());
    const dsPre = resPre.items[0];
    console.log(`Estado PREVIO resolución DS: current_number = ${dsPre.current_number}`);

    // 2. Obtener tipo de compra ordinaria FC
    const ttResp = await fetch(`${url}/transaction_types/records?filter=(code='FC')`, { headers: { 'Authorization': token } }).then(r => r.json());
    const fcType = ttResp.items[0];
    console.log(`Tipo FC encontrado: id = ${fcType.id}, prefix = ${fcType.prefix}`);

    const tpResp = await fetch(`${url}/third_parties/records?perPage=1`, { headers: { 'Authorization': token } }).then(r => r.json());
    const supplierId = tpResp.items[0]?.id;

    // 3. Crear una compra ordinaria con número explícito FC-00009999
    console.log("Creando compra ordinaria con FC...");
    const createResp = await fetch(`${url}/purchase_invoices/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token },
      body: JSON.stringify({
        number: 'FC-TEST-' + Date.now(),
        date: '2026-09-09',
        supplier_id: supplierId,
        tx_type_id: fcType.id,
        tx_number: 'AUTO',
        status: 'draft',
        subtotal: 50000,
        total: 50000
      })
    });

    const createdPur = await createResp.json();
    console.log(`Compra creada con status ${createResp.status}, number asignado: ${createdPur.number}`);

    // 4. Verificar que la resolución DIAN de DS PERMANEZCA INTACTA en 310
    const resPost = await fetch(`${url}/dian_resolutions/records?filter=(document_type='DS')`, { headers: { 'Authorization': token } }).then(r => r.json());
    const dsPost = resPost.items[0];
    console.log(`Estado POSTERIOR resolución DS: current_number = ${dsPost.current_number}`);

    if (dsPost.current_number === dsPre.current_number && dsPost.current_number === 310) {
      console.log("\x1b[32m✔ ÉXITO TOTAL: La resolución DIAN de Documento Soporte quedó 100% aislada e inalterada.\x1b[0m");
    } else {
      console.log(`\x1b[31m✖ FALLO: La resolución DIAN cambió de ${dsPre.current_number} a ${dsPost.current_number}\x1b[0m`);
    }

    // 5. Limpieza del registro de prueba
    if (createdPur.id) {
      await fetch(`${url}/purchase_invoices/records/${createdPur.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
      });
      console.log("Registro de prueba eliminado limpiamente.");
    }

  } catch(e) {
    console.error("Error en test:", e);
  }
}

run();
