import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SCREEN_DIR = resolve('DatosReferencia/Screen');
mkdirSync(SCREEN_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. Obtener token de autenticación para admin@contaco.com
async function getAuthToken() {
  const res = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
  });
  if (!res.ok) throw new Error('Failed to auth with admin@contaco.com');
  const data = await res.json();
  return { token: data.token, record: data.record };
}

// 2. Iniciar Chrome con depuración remota
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--window-size=1920,1080',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  'http://127.0.0.1:8090/'
], { stdio: 'ignore' });

async function run() {
  try {
    console.log('[1/4] Autenticando usuario Super Admin...');
    const auth = await getAuthToken();
    console.log('Autenticado con éxito:', auth.record.name, auth.record.role);

    console.log('[2/4] Conectando con Chrome CDP en puerto 9222...');
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        const res = await fetch('http://127.0.0.1:9222/json/list');
        if (res.ok) {
          targets = await res.json();
          if (targets.length > 0 && targets[0].webSocketDebuggerUrl) break;
        }
      } catch (_) {}
    }

    if (!targets || !targets[0] || !targets[0].webSocketDebuggerUrl) {
      throw new Error('No se pudo conectar al endpoint de Chrome CDP');
    }

    const wsUrl = targets[0].webSocketDebuggerUrl;
    console.log('Conectando WebSocket a:', wsUrl);
    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    function sendCmd(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCmd('Page.enable');
    await sendCmd('Runtime.enable');

    console.log('[3/4] Capturando pantalla inicial de Login (actual)...');
    await sleep(2000);
    let snap = await sendCmd('Page.captureScreenshot', { format: 'png' });
    writeFileSync(resolve(SCREEN_DIR, '01_login_actual.png'), Buffer.from(snap.data, 'base64'));
    console.log('Guardado: 01_login_actual.png');

    // Inyectar credenciales y sesión en localStorage
    console.log('Inyectando sesión activa en localStorage...');
    const initScript = `
      localStorage.setItem('pocketbase_auth', JSON.stringify({
        token: ${JSON.stringify(auth.token)},
        model: ${JSON.stringify(auth.record)}
      }));
      localStorage.setItem('gravy_active_company', JSON.stringify({
        company_id: "kojdt7illwylll1",
        company_name: "DOMESTIKO SAS",
        company_url: "http://localhost:8090",
        role: "admin",
        modules: ["full", "core", "comercial", "inventarios", "contabilidad", "nomina", "copropiedades", "logistica", "inmobiliarias", "tesoreria", "conciliacion", "crm", "spa"]
      }));
      localStorage.setItem('gravy_last_activity', String(Date.now()));
      localStorage.setItem('user_name', ${JSON.stringify(auth.record.name || 'Super Admin')});
      location.reload();
    `;
    await sendCmd('Runtime.evaluate', { expression: initScript });

    // Esperar a que la página recargue con la sesión iniciada
    console.log('Esperando recarga y renderizado del Dashboard principal...');
    await sleep(4000);

    const pagesToCapture = [
      { id: 'dashboard', name: '02_dashboard_principal.png', label: 'Dashboard Principal' },
      { id: 'pos', name: '03_pos_terminal.png', label: 'Punto de Venta POS' },
      { id: 'ventas', name: '04_facturacion_ventas.png', label: 'Gestión de Facturación y Ventas' },
      { id: 'facturacion-dian', name: '05_documentos_dian.png', label: 'Ecosistema DIAN UBL 2.1' },
      { id: 'inventario-stock', name: '06_inventario_stock.png', label: 'Inventario PEPS y Multibodega' },
      { id: 'compra-sugerida', name: '07_compra_sugerida.png', label: 'Algoritmo de Compra Sugerida' },
      { id: 'nomina', name: '08_nomina_electronica.png', label: 'Nómina Electrónica y Talento' },
      { id: 'copro-facturacion', name: '09_copropiedades_ph.png', label: 'Copropiedades y Residencias PH' },
      { id: 'importaciones', name: '10_importaciones_cif.png', label: 'Importaciones y Costeo CIF' }
    ];

    for (const page of pagesToCapture) {
      console.log(`Navegando a módulo: ${page.label} (${page.id})...`);
      await sendCmd('Runtime.evaluate', {
        expression: `if (typeof window.navigate === 'function') { window.navigate('${page.id}'); }`
      });
      // Esperar render de componentes, gráficos y tablas
      await sleep(2500);

      const res = await sendCmd('Page.captureScreenshot', { format: 'png' });
      writeFileSync(resolve(SCREEN_DIR, page.name), Buffer.from(res.data, 'base64'));
      console.log(`Guardado con éxito: ${page.name}`);
    }

    // Capturar también la Tienda Virtual (store.html)
    console.log('Navegando a Tienda Virtual (/store.html)...');
    await sendCmd('Page.navigate', { url: 'http://127.0.0.1:8090/store.html' });
    await sleep(3000);
    const storeSnap = await sendCmd('Page.captureScreenshot', { format: 'png' });
    writeFileSync(resolve(SCREEN_DIR, '11_tienda_virtual.png'), Buffer.from(storeSnap.data, 'base64'));
    console.log('Guardado con éxito: 11_tienda_virtual.png');

    console.log('[4/4] ¡Todas las capturas reales de la interfaz actual han sido generadas!');
    ws.close();
  } catch (err) {
    console.error('Error durante la captura:', err);
  } finally {
    try { chromeProc.kill(); } catch (_) {}
  }
}

run();
