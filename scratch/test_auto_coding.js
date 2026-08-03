async function test() {
  const pbUrl = 'http://localhost:8090';
  
  try {
    console.log("Logging in as admin...");
    const loginRes = await fetch(`${pbUrl}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.error("Login failed:", loginData);
      return;
    }
    const token = loginData.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log("Login successful!");

    // 1. Guardar una configuración de codificación de prueba
    const testConfig = {
      auto_code: true,
      prefix: 'TCOD-',
      consecutive: 100,
      digits: 5
    };
    
    console.log("Saving test codification settings...");
    let settingsRecordId = '';
    const getSettingRes = await fetch(`${pbUrl}/api/collections/settings/records?filter=key="product_config_v1"`, { headers });
    const getSettingData = await getSettingRes.json();
    
    if (getSettingData.items && getSettingData.items.length > 0) {
      settingsRecordId = getSettingData.items[0].id;
      await fetch(`${pbUrl}/api/collections/settings/records/${settingsRecordId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ value: JSON.stringify(testConfig) })
      });
    } else {
      const createRes = await fetch(`${pbUrl}/api/collections/settings/records`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ key: 'product_config_v1', value: JSON.stringify(testConfig) })
      });
      const createData = await createRes.json();
      settingsRecordId = createData.id;
    }
    console.log("Settings saved!");

    // 2. Simular flujo de creación de producto (como en productos.ts o compras.ts)
    console.log("Simulating product creation with auto-coding...");
    
    // a. Obtener configuración
    const rawCfgRes = await fetch(`${pbUrl}/api/collections/settings/records/${settingsRecordId}`, { headers });
    const rawCfgData = await rawCfgRes.json();
    const productCfg = JSON.parse(rawCfgData.value);
    
    // b. Generar código
    let code = '';
    let dupFound = true;
    let nextConsecutive = Number(productCfg.consecutive || 1);
    const prefix = String(productCfg.prefix || '');
    const digits = Number(productCfg.digits || 4);

    while (dupFound) {
      code = prefix + String(nextConsecutive).padStart(digits, '0');
      
      const filterStr = `code="${code}"`;
      const dupRes = await fetch(`${pbUrl}/api/collections/products/records?filter=${encodeURIComponent(filterStr)}`, { headers });
      const dupData = await dupRes.json();
      if (!dupData.items || dupData.items.length === 0) {
        dupFound = false;
      } else {
        nextConsecutive++;
      }
    }
    
    console.log("Generated code:", code);
    if (code !== 'TCOD-00100') {
      throw new Error(`Código incorrecto generado. Se esperaba 'TCOD-00100' pero se obtuvo '${code}'`);
    }

    // c. Actualizar consecutivo en configuración
    productCfg.consecutive = nextConsecutive + 1;
    await fetch(`${pbUrl}/api/collections/settings/records/${settingsRecordId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ value: JSON.stringify(productCfg) })
    });
    console.log("Consecutive updated to:", productCfg.consecutive);

    // d. Crear producto con el código autogenerado
    const prodRes = await fetch(`${pbUrl}/api/collections/products/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        code: code,
        name: 'Producto Test Autocodificacion',
        type: 'BIEN',
        unit: 'UND',
        iva_rate: 19,
        active: true
      })
    });
    const product = await prodRes.json();
    console.log("Product created successfully with ID:", product.id);

    // 3. Simular una segunda creación para probar autoincremento y anti-duplicados
    console.log("Simulating second product creation to verify auto-increment...");
    const rawCfgRes2 = await fetch(`${pbUrl}/api/collections/settings/records/${settingsRecordId}`, { headers });
    const rawCfgData2 = await rawCfgRes2.json();
    const productCfg2 = JSON.parse(rawCfgData2.value);
    
    let code2 = '';
    let dupFound2 = true;
    let nextConsecutive2 = Number(productCfg2.consecutive || 1);

    while (dupFound2) {
      code2 = prefix + String(nextConsecutive2).padStart(digits, '0');
      const filterStr2 = `code="${code2}"`;
      const dupRes2 = await fetch(`${pbUrl}/api/collections/products/records?filter=${encodeURIComponent(filterStr2)}`, { headers });
      const dupData2 = await dupRes2.json();
      if (!dupData2.items || dupData2.items.length === 0) {
        dupFound2 = false;
      } else {
        nextConsecutive2++;
      }
    }
    
    console.log("Generated code 2:", code2);
    if (code2 !== 'TCOD-00101') {
      throw new Error(`Código 2 incorrecto generado. Se esperaba 'TCOD-00101' pero se obtuvo '${code2}'`);
    }

    productCfg2.consecutive = nextConsecutive2 + 1;
    await fetch(`${pbUrl}/api/collections/settings/records/${settingsRecordId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ value: JSON.stringify(productCfg2) })
    });
    console.log("Consecutive updated to:", productCfg2.consecutive);

    const prodRes2 = await fetch(`${pbUrl}/api/collections/products/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        code: code2,
        name: 'Producto Test Autocodificacion 2',
        type: 'BIEN',
        unit: 'UND',
        iva_rate: 19,
        active: true
      })
    });
    const product2 = await prodRes2.json();
    console.log("Second product created successfully with ID:", product2.id);

    console.log("=== AUTO-CODING VERIFICATION COMPLETED SUCCESSFULLY ===");

  } catch (err) {
    console.error("Verification failed:", err.message);
  }
}

test();
