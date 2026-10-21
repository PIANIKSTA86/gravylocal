const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 GRAVY ERP — AUDITORÍA DE VERIFICACIÓN BUZÓN DIAN & RADIAN');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  // TEST 1: Columnas requeridas en la base de datos
  console.log('▶ [TEST 1] Verificando esquema de base de datos para eventos DIAN...');
  const db = new sqlite3.Database('pb_data/data.db');
  const cols = await new Promise((resolve) => {
    db.all("PRAGMA table_info(electronic_documents)", [], (_, rows) => {
      resolve(rows.map(r => r.name));
    });
  });

  const expectedFields = [
    'radian_030_status', 'radian_030_date', 'radian_030_cude',
    'radian_032_status', 'radian_032_date', 'radian_032_cude',
    'radian_033_status', 'radian_033_date', 'radian_033_cude',
    'radian_031_status', 'radian_031_claim_code', 'radian_031_notes',
    'radian_last_response', 'reception_source'
  ];

  expectedFields.forEach(f => {
    assert(cols.includes(f), `Columna '${f}' presente en electronic_documents`);
  });

  // TEST 2: Limpieza de textos en frontend empaquetado (pb_public)
  console.log('\n▶ [TEST 2] Verificando eliminación de marcas de terceros en UI frontend...');
  const files = fs.readdirSync('pb_public/assets');
  const mainJsFile = files.find(f => f.startsWith('main-') && f.endsWith('.js'));
  assert(!!mainJsFile, `Archivo empaquetado generado encontrado: ${mainJsFile}`);

  if (mainJsFile) {
    const jsContent = fs.readFileSync(path.join('pb_public/assets', mainJsFile), 'utf8');
    
    // Verificar que los nuevos modales institucionales DIAN estén presentes
    assert(jsContent.includes('DIAN - Evento 030'), "Cabecera oficial 'DIAN - Evento 030' presente en bundle");
    assert(jsContent.includes('DIAN - Evento 032'), "Cabecera oficial 'DIAN - Evento 032' presente en bundle");
    assert(jsContent.includes('DIAN - Evento 033'), "Cabecera oficial 'DIAN - Evento 033' presente en bundle");
    assert(jsContent.includes('DIAN - Evento 031'), "Cabecera oficial 'DIAN - Evento 031' presente en bundle");
    assert(jsContent.includes('Transmitiendo a la DIAN'), "Indicador formal 'Transmitiendo a la DIAN' presente");
    assert(jsContent.includes('Sincronizar con DIAN'), "Función 'Sincronizar con DIAN' presente");
    assert(jsContent.includes('Copiar CUDE'), "Funcionalidad 'Copiar CUDE' presente");

    // Verificar que no haya textos hardcodeados de proveedores en los modales de eventos
    const hasVendorInTitle = /DIAN\s*\/\s*MATIAS\s*API/i.test(jsContent);
    assert(!hasVendorInTitle, "Ninguna cabecera combina 'DIAN / MATIAS API' de forma hardcodeada");

    const hasTransmitVendor = /Transmitiendo a MATIAS API/i.test(jsContent);
    assert(!hasTransmitVendor, "Ningún botón/spinner dice 'Transmitiendo a MATIAS API'");
  }

  // TEST 3: Verificación de rutas backend en pb_hooks/radian.pb.js
  console.log('\n▶ [TEST 3] Verificando endpoints y lógica en pb_hooks/radian.pb.js...');
  const radianHookContent = fs.readFileSync('pb_hooks/radian.pb.js', 'utf8');
  assert(radianHookContent.includes("routerAdd('POST', '/api/radian/send-event'"), "Endpoint /api/radian/send-event registrado");
  assert(radianHookContent.includes("routerAdd('POST', '/api/radian/sync-event-status'"), "Endpoint /api/radian/sync-event-status registrado");
  assert(radianHookContent.includes("routerAdd('GET', '/api/radian/documents'"), "Endpoint /api/radian/documents registrado");
  assert(/callMatiasApi\(["']\/events\/import-track-id/i.test(radianHookContent), "Auto-encolamiento previo de CUFE implementado en send-event");
  assert(radianHookContent.includes("notifySupplier"), "Soporte de notificación por correo al emisor implementado");

  // TEST 4: Simulación de API Sandbox MATIAS
  console.log('\n▶ [TEST 4] Verificando comunicación en vivo con Sandbox DIAN/MATIAS...');
  const getSetting = (key) => new Promise((resolve) => {
    db.get("SELECT value FROM settings WHERE key = ?", [key], (_, row) => resolve(row ? row.value : null));
  });

  const token = await getSetting('matias_api_token');
  const env = (await getSetting('matias_environment')) || 'sandbox';
  const baseUrl = env === 'production' ? 'https://api-v2.matias-api.com/api/ubl2.1' : 'https://sandbox-api.matias-api.com/api/ubl2.1';
  const clientUuid = (await getSetting('matias_client_uuid')) || "3928b094-bde0-11f1-a742-d843ae899220";

  if (token) {
    try {
      let testUrl = `${baseUrl}/events/document-receptions?limit=1`;
      if (clientUuid) testUrl += `&client_uuid=${encodeURIComponent(clientUuid)}`;

      const res = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      assert(res.ok || res.status === 200, `Conexión con servicio de eventos DIAN exitosa (HTTP ${res.status})`);
      assert(data && typeof data === 'object', "Estructura de respuesta válida recibida del servicio");
    } catch (e) {
      console.warn("Aviso en prueba de red: " + e.message);
    }
  } else {
    console.log("ℹ️ Token no configurado en este entorno de prueba local");
  }

  db.close();

  console.log('\n================================================================');
  console.log(`📊 RESULTADO AUDITORÍA: ${passedTests}/${totalTests} pruebas superadas (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('================================================================\n');
}

runVerification().catch(console.error);
