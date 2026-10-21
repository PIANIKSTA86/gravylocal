const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 SUITE DE PRUEBAS: DOCUMENTO SOPORTE Y MATIAS API');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const BASE_URL = 'http://127.0.0.1:8099';

  async function request(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const req = http.request(url, {
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(data); } catch (_) { json = { raw: data }; }
          resolve({ status: res.statusCode, headers: res.headers, data: json, raw: data });
        });
      });
      req.on('error', reject);
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  }

  console.log('▶ [TEST 1/5] Verificación de Seguridad y Autenticación en /api/dian/emit...');
  const resNoAuth = await request('/api/dian/emit', { method: 'POST', body: {} });
  assert(resNoAuth.status === 401, `Petición no autenticada rechazada con 401 (Obtenido: ${resNoAuth.status})`);

  const authRes = await request('/api/collections/_superusers/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { identity: 'test@admin.com', password: '1234567890' }
  });

  const adminToken = authRes.data?.token;
  assert(!!adminToken, 'Token de superuser obtenido exitosamente');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  console.log('\n▶ [TEST 2/5] Validación de Parámetros Faltantes y Control de Errores...');
  const resNoTx = await request('/api/dian/emit', { method: 'POST', headers: authHeaders, body: {} });
  assert(resNoTx.status === 400 && resNoTx.data?.message?.includes('txId'), `Validación de txId requerido rechazada con 400 (Msg: "${resNoTx.data?.message}")`);

  const resInvalidTx = await request('/api/dian/emit', { method: 'POST', headers: authHeaders, body: { txId: 'tx_inexistente_999' } });
  assert(resInvalidTx.status === 400 && resInvalidTx.data?.message?.includes('No se encontró'), `Transacción inexistente rechazada con 400 (Msg: "${resInvalidTx.data?.message}")`);

  console.log('\n▶ [TEST 3/5] Verificación de Resoluciones Oficiales en Base de Datos...');
  const db = new sqlite3.Database('pb_data/data.db');
  const queryDb = (q) => new Promise(res => db.all(q, (e, r) => res(r || [])));

  const dsResolutions = await queryDb("SELECT document_type, prefix, resolution_number, active FROM dian_resolutions WHERE document_type IN ('DS', 'NDS')");
  assert(dsResolutions.some(r => r.document_type === 'DS' && r.active === 1), 'Resolución activa de Documento Soporte encontrada en BD');
  assert(dsResolutions.some(r => r.document_type === 'NDS' && r.active === 1), 'Resolución activa de Nota de Ajuste encontrada en BD');

  console.log('\n▶ [TEST 4/5] Mapeo de Catálogo DANE a Códigos MATIAS API...');
  const pbJs = fs.readFileSync('pb_hooks/dian.pb.js', 'utf8');
  assert(pbJs.includes('"76001":1006'), 'Cali mapeado correctamente a ID 1006');
  assert(pbJs.includes('"11001":149'), 'Bogotá mapeado correctamente a ID 149');
  assert(pbJs.includes('"05001":1'), 'Medellín mapeado correctamente a ID 1');
  assert(pbJs.includes('resolveMatiasCityId'), 'Función fallback inteligente de ciudades implementada');

  console.log('\n▶ [TEST 5/5] Emisión Completa de Documento Soporte Vía API REST PocketBase...');
  const thirds = await queryDb("SELECT id, name, doc_number FROM third_parties WHERE doc_type IN ('CC', '13') LIMIT 1");
  const thirdId = thirds[0]?.id;
  const txTypes = await queryDb("SELECT id FROM transaction_types WHERE code = 'DS' LIMIT 1");
  const txTypeId = txTypes[0]?.id;

  assert(!!thirdId, `Tercero válido encontrado para la prueba (ID: ${thirdId})`);
  assert(!!txTypeId, `Tipo de transacción DS encontrado (ID: ${txTypeId})`);

  // Crear transacción vía API PocketBase
  const createdTx = await request('/api/collections/transactions/records', {
    method: 'POST',
    headers: authHeaders,
    body: {
      date: new Date().toISOString().slice(0, 10),
      third_party_id: thirdId,
      tx_type_id: txTypeId,
      net_amount: 150000,
      cross_amount: 150000,
      status: 'active',
      description: 'Prueba de Documento Soporte Electrónico'
    }
  });

  const txRecord = createdTx.data;
  assert(createdTx.status === 200 && !!txRecord?.id, `Transacción contable creada con éxito (ID: ${txRecord?.id})`);

  // Crear compra vinculada
  const createdPur = await request('/api/collections/purchase_invoices/records', {
    method: 'POST',
    headers: authHeaders,
    body: {
      tx_id: txRecord.id,
      number: txRecord.number || 'DS-0099',
      date: new Date().toISOString().slice(0, 10),
      supplier_id: thirdId,
      tx_type_id: txTypeId,
      subtotal: 150000,
      iva_total: 0,
      total: 150000,
      status: 'posted',
      status_dian: 'pendiente'
    }
  });

  const purRecord = createdPur.data;
  assert(createdPur.status === 200 && !!purRecord?.id, `Factura de compra creada con éxito (ID: ${purRecord?.id})`);

  // Crear línea de compra
  const createdLine = await request('/api/collections/purchase_invoice_lines/records', {
    method: 'POST',
    headers: authHeaders,
    body: {
      invoice_id: purRecord.id,
      description: 'Servicio Técnico de Plomería y Reparaciones',
      qty: 1,
      unit_price: 150000,
      subtotal: 150000,
      total: 150000,
      iva_rate: 0,
      iva_amount: 0
    }
  });
  assert(createdLine.status === 200, 'Línea de compra registrada con éxito');

  // Ahora invocamos /api/dian/emit
  console.log(`\n   Disparando emisión de Documento Soporte a MATIAS API para TX: ${txRecord.id}...`);
  const emitRes = await request('/api/dian/emit', {
    method: 'POST',
    headers: authHeaders,
    body: { txId: txRecord.id, isDocSoporte: true }
  });

  console.log(`   Código de respuesta emit: ${emitRes.status}`);
  assert(emitRes.status !== 500, 'El endpoint manejó el ciclo sin crasheos ni errores 500');
  assert(typeof emitRes.data === 'object', 'La respuesta es un objeto JSON estructurado');

  // Verificar estado registrado en einvoice_docs
  const einvDocs = await queryDb(`SELECT tx_id, status, dian_response, cufe FROM einvoice_docs WHERE tx_id = '${txRecord.id}'`);
  assert(einvDocs.length > 0, 'Se creó y persistió el registro en einvoice_docs');
  console.log('   einvoice_docs status:', einvDocs[0]?.status, '| dian_response:', einvDocs[0]?.dian_response);

  // Verificar sincronización en purchase_invoices consultando a través de la API REST
  const checkPurApi = await request(`/api/collections/purchase_invoices/records/${purRecord.id}`, { headers: authHeaders });
  assert(checkPurApi.status === 200, 'purchase_invoices consultado con éxito vía API');
  console.log('   purchase_invoices status_dian:', checkPurApi.data?.status_dian, '| dian_response:', checkPurApi.data?.dian_response);
  assert(checkPurApi.data?.status_dian === 'aceptada', `purchase_invoices sincronizó el estado DIAN: "${checkPurApi.data?.status_dian}"`);

  // Probar endpoint /api/dian/check-status
  console.log('\n   Probando /api/dian/check-status para el documento recién emitido...');
  const checkRes = await request('/api/dian/check-status', {
    method: 'POST',
    headers: authHeaders,
    body: { txId: txRecord.id }
  });
  console.log('   Respuesta de check-status:', checkRes.status, checkRes.data);
  assert(checkRes.status === 200, `check-status responde con código 200 (Obtenido: ${checkRes.status})`);
  assert(checkRes.data?.success === true, 'check-status retorna success: true');

  // Limpieza de datos temporales
  await request(`/api/collections/purchase_invoice_lines/records/${createdLine.data.id}`, { method: 'DELETE', headers: authHeaders });
  await request(`/api/collections/purchase_invoices/records/${purRecord.id}`, { method: 'DELETE', headers: authHeaders });
  await request(`/api/collections/transactions/records/${txRecord.id}`, { method: 'DELETE', headers: authHeaders });
  if (einvDocs[0]) {
    await new Promise(r => db.run(`DELETE FROM einvoice_docs WHERE tx_id = '${txRecord.id}'`, r));
  }

  db.close();

  console.log('\n================================================================');
  console.log(`🏁 RESULTADOS FINALES: ${passed} PASADAS, ${failed} FALLIDAS`);
  console.log('================================================================');
}

runTestSuite().catch(console.error);
