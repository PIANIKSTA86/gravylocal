async function runTest() {
  console.log("=== INICIANDO PRUEBA DE ESQUEMA Y CUMPLIMIENTO ADUANERO ===");

  const baseUrl = 'http://127.0.0.1:8090';

  try {
    // 1. Autenticar en el tenant como usuario
    console.log("1. Autenticando usuario tenant...");
    const authRes = await fetch(`${baseUrl}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'sm2.solutions.co@gmail.com', password: 'Admin1234!' })
    });

    if (!authRes.ok) {
      throw new Error(`Fallo en autenticación: ${authRes.status} ${await authRes.text()}`);
    }

    const authData = await authRes.json();
    const token = authData.token;
    const userId = authData.record.id;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    console.log(`¡Autenticación exitosa! User ID: ${userId}`);

    // 2. Obtener un tercero para usar como proveedor
    console.log("2. Buscando un tercero (proveedor)...");
    const thirdPartiesRes = await fetch(`${baseUrl}/api/collections/third_parties/records?perPage=1`, { headers });
    const thirdPartiesData = await thirdPartiesRes.json();
    if (!thirdPartiesData.items.length) {
      throw new Error("No hay terceros registrados en la base de datos.");
    }
    const supplierId = thirdPartiesData.items[0].id;
    console.log(`Proveedor encontrado: ${thirdPartiesData.items[0].name} (ID: ${supplierId})`);

    // 3. Crear un producto de prueba con campos aduaneros extendidos
    console.log("3. Creando producto de prueba con campos aduaneros...");
    const randCode = 'PRD-' + Math.floor(Math.random() * 100000);
    const testProduct = {
      code: randCode,
      name: 'Equipo de Control Industrial ' + randCode,
      type: 'BIEN',
      unit: 'UND',
      active: true,
      posicion_arancelaria: '8479899000',
      arancel_rate_default: 15,
      pais_origen: 'China',
      marca: 'ACME',
      modelo: 'TECH-2000',
      visto_bueno_required: true,
      visto_bueno_entidad: 'ICA',
      registro_sanitario: 'ICA-REG-2026-X88',
      peso_neto: 2.5,
      peso_bruto: 3.2
    };

    const prodRes = await fetch(`${baseUrl}/api/collections/products/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testProduct)
    });

    if (!prodRes.ok) {
      throw new Error(`Error al crear producto: ${prodRes.status} ${await prodRes.text()}`);
    }

    const product = await prodRes.json();
    console.log(`Producto creado exitosamente con ID: ${product.id}`);
    console.log(`- Clasificación: ${product.posicion_arancelaria}`);
    console.log(`- Pesos: Neto ${product.peso_neto} Kg, Bruto ${product.peso_bruto} Kg`);
    console.log(`- Visto Bueno Requerido: ${product.visto_bueno_required} (${product.visto_bueno_entidad})`);

    // 4. Crear una importación de prueba con campos de aduana y prorrateo por peso bruto
    console.log("4. Creando importación con prorrateo por peso bruto...");
    const impNumber = 'IMP-' + Date.now();
    const todayStr = new Date().toISOString().slice(0, 10);
    const testImport = {
      number: impNumber,
      supplier_id: supplierId,
      status: 'planeacion',
      incoterm: 'FOB',
      currency: 'USD',
      exchange_rate: 4150.50,
      transport_type: 'maritimo',
      vuce_registro_num: '2026-VUCE-9981234',
      modalidad_importacion: 'ORDINARIA',
      canal_inspeccion: 'AUTOMATICO',
      proration_method: 'GROSS_WEIGHT',
      dian_declaracion_num: '5002609918273',
      dian_declaracion_date: '2026-06-10',
      dian_levante_date: '2026-06-11',
      dian_trm: 4148.20,
      fob_total: 1000,
      freight_cost: 150,
      insurance_cost: 50,
      total_gastos_cif: 830100, // (150 + 50) * 4150.50
      total: 4980600, // Simplificado
      date_created: todayStr,
      user_id: userId
    };

    const impRes = await fetch(`${baseUrl}/api/collections/imports/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testImport)
    });

    if (!impRes.ok) {
      throw new Error(`Error al crear importación: ${impRes.status} ${await impRes.text()}`);
    }

    const importRecord = await impRes.json();
    console.log(`Importación creada con consecutivo: ${importRecord.number} (ID: ${importRecord.id})`);
    console.log(`- Registro VUCE: ${importRecord.vuce_registro_num}`);
    console.log(`- Método de Prorrateo: ${importRecord.proration_method}`);
    console.log(`- Formulario 500 DIAN: ${importRecord.dian_declaracion_num}`);

    // 5. Crear una línea de importación
    console.log("5. Creando línea de importación...");
    const testLine = {
      import_id: importRecord.id,
      product_id: product.id,
      qty: 10,
      fob_price: 100,
      arancel_rate: 15,
      arancel_amount: 622575, // 10 * 100 * 4150.50 * 0.15
      iva_rate: 19,
      iva_amount: 788595, // 10 * 100 * 4150.50 * 0.19
      prorated_cost: 830100, // Todo el flete prorrateado a esta única línea
      unit_cost_cop: 560317.5,
      total_cop: 5603175,
      pais_origen: 'China',
      certificado_origen_num: 'CO-CN-2026-88912',
      posicion_arancelaria: product.posicion_arancelaria,
      peso_neto_total: 25.0, // 2.5 * 10
      peso_bruto_total: 32.0 // 3.2 * 10
    };

    const lineRes = await fetch(`${baseUrl}/api/collections/import_lines/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testLine)
    });

    if (!lineRes.ok) {
      throw new Error(`Error al crear línea de importación: ${lineRes.status} ${await lineRes.text()}`);
    }

    const lineRecord = await lineRes.json();
    console.log(`Línea de importación creada con ID: ${lineRecord.id}`);
    console.log(`- Origen de línea: ${lineRecord.pais_origen}`);
    console.log(`- Certificado de Origen: ${lineRecord.certificado_origen_num}`);
    console.log(`- Pesos totales: Neto ${lineRecord.peso_neto_total} Kg, Bruto ${lineRecord.peso_bruto_total} Kg`);

    // 6. Limpieza: eliminar registros de prueba
    console.log("6. Limpieza de datos de prueba...");
    await fetch(`${baseUrl}/api/collections/import_lines/records/${lineRecord.id}`, { method: 'DELETE', headers });
    await fetch(`${baseUrl}/api/collections/imports/records/${importRecord.id}`, { method: 'DELETE', headers });
    await fetch(`${baseUrl}/api/collections/products/records/${product.id}`, { method: 'DELETE', headers });
    console.log("¡Limpieza de prueba completada!");

    console.log("=== PRUEBA DE INTEGRACIÓN Y ESQUEMA COMPLETADA CON ÉXITO ===");
  } catch (e) {
    console.error("❌ ERROR EN LA PRUEBA:", e.message);
    process.exit(1);
  }
}

runTest();
