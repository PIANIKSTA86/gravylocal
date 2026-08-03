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
      // Try PB v0.23+ superusers endpoint
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

    // Obtener la colección
    const colRes = await fetch('http://127.0.0.1:8090/api/collections/dian_resolutions', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const collection = await colRes.json();
    
    // El formato del schema cambia en v0.23 (fields array) vs v0.22 (schema array)
    const isV23 = Array.isArray(collection.fields);
    const schemaArray = isV23 ? collection.fields : collection.schema;
    
    const fieldIndex = schemaArray.findIndex(f => f.name === 'document_type');
    if (fieldIndex === -1) throw new Error("Field not found");
    
    const field = schemaArray[fieldIndex];
    
    if (field.type === 'select') {
      // Check properties vs options
      const props = isV23 ? field : field.options;
      const oldVals = props.values || [];
      const newVals = Array.from(new Set([...oldVals, "NC", "ND"]));
      props.values = newVals;
      
      const updateRes = await fetch('http://127.0.0.1:8090/api/collections/dian_resolutions', {
        method: 'PATCH',
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(isV23 ? { fields: schemaArray } : { schema: schemaArray })
      });
      console.log("Update response:", await updateRes.json());
    } else {
      console.log("Field is not select:", field.type);
    }
    
  } catch(e) {
    console.error(e);
  }
}
run();
