const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const SCREEN_DIR = path.resolve(__dirname, '../DatosReferencia/Screen');
if (!fs.existsSync(SCREEN_DIR)) {
  fs.mkdirSync(SCREEN_DIR, { recursive: true });
}

async function getAuthToken() {
  const res = await fetch('http://127.0.0.1:8090/api/collections/users/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'admin@contaco.com', password: 'Admin1234!' })
  });
  if (!res.ok) throw new Error('Error al autenticar en PocketBase');
  return await res.json();
}

async function run() {
  console.log('[1/4] Obteniendo autenticación oficial de Super Admin...');
  const auth = await getAuthToken();
  console.log('Autenticado como:', auth.record.name, 'Rol:', auth.record.role);

  console.log('[2/4] Lanzando Chrome en alta resolución (1920x1080 @2x Retina)...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  console.log('[3/4] Navegando a http://127.0.0.1:8090/ para capturar login...');
  await page.goto('http://127.0.0.1:8090/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Captura 1: Login actual
  const loginPath = path.join(SCREEN_DIR, '01_login_actual.png');
  await page.screenshot({ path: loginPath });
  console.log('✓ Captura guardada:', loginPath);

  // Inyectar pb_token y pb_user en localStorage
  console.log('Inyectando pb_token, pb_user y módulos enterprise...');
  await page.evaluate((authToken, userRecord) => {
    localStorage.setItem('pb_token', authToken);
    localStorage.setItem('pb_user', JSON.stringify(userRecord));
    localStorage.setItem('user_name', userRecord.name || 'Super Admin');
    localStorage.setItem('gravy_active_company', JSON.stringify({
      company_id: "kojdt7illwylll1",
      company_name: "DOMESTIKO SAS",
      company_url: "http://localhost:8090",
      role: "admin",
      modules: ["full", "core", "comercial", "inventarios", "contabilidad", "nomina", "copropiedades", "logistica", "inmobiliarias", "tesoreria", "conciliacion", "crm", "spa"]
    }));
    localStorage.setItem('gravy_last_activity', String(Date.now()));
  }, auth.token, auth.record);

  // Recargar para que showApp() inicialice toda la interfaz
  console.log('Recargando página con sesión autenticada...');
  await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));

  const screens = [
    { id: 'dashboard', file: '02_dashboard_principal.png', label: 'Dashboard Principal Financiero' },
    { id: 'pos', file: '03_punto_de_venta_pos.png', label: 'Punto de Venta POS' },
    { id: 'ventas', file: '04_gestion_ventas_facturas.png', label: 'Gestión de Ventas y Facturación' },
    { id: 'facturacion-dian', file: '05_facturacion_electronica_dian.png', label: 'Facturación Electrónica DIAN' },
    { id: 'consulta-tx', file: '06_contabilidad_asientos_niif.png', label: 'Contabilidad y Asientos NIIF' },
    { id: 'inventario-stock', file: '07_inventario_stock_kardex.png', label: 'Inventario PEPS y Stock' },
    { id: 'compra-sugerida', file: '08_algoritmo_compra_sugerida.png', label: 'Compra Sugerida Inteligente' },
    { id: 'nomina', file: '09_nomina_electronica_talento.png', label: 'Nómina Electrónica' },
    { id: 'copro-facturacion', file: '10_copropiedades_ph.png', label: 'Copropiedades y Residencias PH' },
    { id: 'importaciones', file: '11_logistica_importaciones_cif.png', label: 'Importaciones y Costeo CIF' },
    { id: 'tesoreria', file: '12_tesoreria_bancos.png', label: 'Tesorería y Flujo de Caja' }
  ];

  for (const item of screens) {
    console.log(`Navegando a ${item.label} (${item.id})...`);
    await page.evaluate((pageId) => {
      if (typeof window.navigate === 'function') {
        window.navigate(pageId);
      }
    }, item.id);

    // Esperar render de datos y transiciones
    await new Promise(r => setTimeout(r, 3000));

    const outPath = path.join(SCREEN_DIR, item.file);
    await page.screenshot({ path: outPath });
    console.log('✓ Captura guardada:', item.file);
  }

  // Capturar Tienda Virtual (store.html)
  console.log('Navegando a Tienda Virtual (/store.html)...');
  await page.goto('http://127.0.0.1:8090/store.html', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  const storePath = path.join(SCREEN_DIR, '13_tienda_virtual_ecommerce.png');
  await page.screenshot({ path: storePath });
  console.log('✓ Captura guardada:', '13_tienda_virtual_ecommerce.png');

  await browser.close();
  console.log('[4/4] ¡Todas las capturas reales de la interfaz actual fueron tomadas exitosamente!');
}

run().catch(err => {
  console.error('Error durante la ejecución:', err);
  process.exit(1);
});
