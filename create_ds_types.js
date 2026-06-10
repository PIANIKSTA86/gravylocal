async function run() {
  try {
    let token = null;
    let authUrl = 'http://127.0.0.1:8090/api/admins/auth-with-password'; // Older PB
    
    let res = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
    });
    
    if (res.status === 404 || res.status === 400) {
      authUrl = 'http://127.0.0.1:8090/api/collections/_superusers/auth-with-password';
      res = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: 'test2@admin.com', password: 'test123456' })
      });
    }

    const authData = await res.json();
    if (!authData.token) {
      console.error("Auth failed: ", authData);
      return;
    }
    token = authData.token;
    console.log("Authed successfully!");

    // 1. Añadir DS y NDS a dian_resolutions.document_type
    const colRes = await fetch('http://127.0.0.1:8090/api/collections/dian_resolutions', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const collection = await colRes.json();
    
    const isV23 = Array.isArray(collection.fields);
    const schemaArray = isV23 ? collection.fields : collection.schema;
    const fieldIndex = schemaArray.findIndex(f => f.name === 'document_type');
    if (fieldIndex !== -1) {
      const field = schemaArray[fieldIndex];
      if (field.type === 'select') {
        const props = isV23 ? field : field.options;
        const oldVals = props.values || [];
        const newVals = Array.from(new Set([...oldVals, "DS", "NDS"]));
        props.values = newVals;
        
        await fetch('http://127.0.0.1:8090/api/collections/dian_resolutions', {
          method: 'PATCH',
          headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(isV23 ? { fields: schemaArray } : { schema: schemaArray })
        });
        console.log("Updated dian_resolutions values");
      }
    }

    // 2. Crear Tipos de Transacción (DS y NDS)
    const types = [
      { code: 'DS', prefix: 'DS', name: 'Documento Soporte', description: 'Documento soporte en compras', consecutive: 0, active: true },
      { code: 'NDS', prefix: 'NDS', name: 'Nota Ajuste Doc. Soporte', description: 'Ajuste a documento soporte', consecutive: 0, active: true }
    ];

    for (const t of types) {
      const existing = await fetch(`http://127.0.0.1:8090/api/collections/transaction_types/records?filter=(code='${t.code}')`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await existing.json();
      if (data.items && data.items.length === 0) {
        await fetch('http://127.0.0.1:8090/api/collections/transaction_types/records', {
          method: 'POST',
          headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(t)
        });
        console.log("Created type: " + t.code);
      } else {
        console.log("Type already exists: " + t.code);
      }
    }
    
    console.log("DONE!");
  } catch(e) {
    console.error(e);
  }
}
run();
