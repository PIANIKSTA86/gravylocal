/**
 * GRAVY v2.0 — utilidades.js
 * Módulo de Utilidades: herramientas de administración y mantenimiento.
 */
'use strict';

/* ── Colecciones que forman parte del backup ─────────────── */
const BACKUP_COLLECTIONS = [
  // Configuración y Parametrización Básica
  { name: 'settings',                  label: 'Configuración general' },
  { name: 'treasury_settings',          label: 'Configuración de tesorería' },
  { name: 'licenses',                  label: 'Licencias' },
  { name: 'geo_countries',             label: 'Países' },
  { name: 'geo_departments',           label: 'Departamentos' },
  { name: 'geo_municipalities',        label: 'Municipios' },
  { name: 'branches',                  label: 'Sucursales' },
  { name: 'dian_resolutions',          label: 'Resoluciones DIAN' },
  { name: 'exogena_concepts',          label: 'Conceptos de exógena' },
  { name: 'financial_notes',           label: 'Notas financieras' },
  { name: 'warehouses',                label: 'Bodegas / Almacenes' },
  { name: 'cash_concepts',             label: 'Conceptos de caja / tesorería' },
  { name: 'homologation_rules',        label: 'Reglas de homologación contable' },
  { name: 'agenda_vencimientos',       label: 'Agenda de vencimientos tributarios' },
  
  // Contabilidad, NIIF y Centros de Costo
  { name: 'account_types',             label: 'Tipos de cuenta contable' },
  { name: 'accounts',                  label: 'Plan único de cuentas (PUC)' },
  { name: 'cost_centers',              label: 'Centros de costo' },
  { name: 'third_parties',             label: 'Terceros (Clientes/Proveedores/Empleados)' },
  { name: 'transaction_types',         label: 'Tipos de transacción' },
  { name: 'users',                     label: 'Usuarios y roles' },
  { name: 'commission_rules',          label: 'Reglas de comisión' },
  { name: 'niif_settings',             label: 'Configuración NIIF' },
  { name: 'niif_policies',             label: 'Políticas contables NIIF' },
  { name: 'niif_asset_categories',     label: 'Categorías de activos fijos NIIF' },
  { name: 'niif_assets',               label: 'Activos fijos NIIF' },
  { name: 'niif_asset_events',         label: 'Novedades y depreciaciones NIIF' },
  { name: 'niif_asset_inventories',    label: 'Tomas físicas de activos NIIF' },
  { name: 'niif_leases',               label: 'Arrendamientos NIIF 16' },

  // Productos, Precios y Stock
  { name: 'products',                  label: 'Productos y servicios' },
  { name: 'product_components',        label: 'Componentes y listas de materiales' },
  { name: 'inventory_stock',           label: 'Stock actual' },
  { name: 'listas_precios',            label: 'Listas de precios' },
  { name: 'precios_producto',          label: 'Precios de producto por lista' },
  
  // Operaciones Contables, Financieras y Pagos
  { name: 'transactions',              label: 'Transacciones y comprobantes' },
  { name: 'tx_lines',                  label: 'Líneas de movimiento contable' },
  { name: 'payments',                  label: 'Comprobantes de pago / Recibos de caja' },
  { name: 'bank_accounts',             label: 'Cuentas bancarias' },
  { name: 'bank_movements',            label: 'Movimientos bancarios' },

  // Nómina y Nómina Electrónica
  { name: 'payroll_periods',           label: 'Períodos de nómina' },
  { name: 'payroll_lines',             label: 'Liquidación de nómina' },
  { name: 'payroll_documents',         label: 'Documentos acumulados de nómina' },
  { name: 'payroll_novelties',         label: 'Novedades de nómina' },
  { name: 'electronic_payrolls',       label: 'Nómina electrónica DIAN' },

  // Facturación Electrónica y Documentos DIAN
  { name: 'einvoice_docs',             label: 'Documentos facturación electrónica' },
  { name: 'electronic_documents',      label: 'Registro de documentos electrónicos' },
  { name: 'electronic_document_items', label: 'Ítems de documentos electrónicos' },
  { name: 'electronic_document_taxes', label: 'Impuestos de documentos electrónicos' },
  
  // Compras, Inventarios y Consignación
  { name: 'inventory_movements',       label: 'Movimientos de inventario' },
  { name: 'inventory_movement_lines',  label: 'Detalle de movimientos de inventario' },
  { name: 'purchase_invoices',         label: 'Facturas de compra' },
  { name: 'purchase_invoice_lines',    label: 'Detalle de facturas de compra' },
  { name: 'consignment_settlements',   label: 'Liquidaciones de consignación' },
  { name: 'consignment_settlement_lines', label: 'Detalle de consignaciones' },
  
  // Ventas, POS y Clientes Directos
  { name: 'pos_registers',             label: 'Cajas registradoras POS' },
  { name: 'pos_shifts',                label: 'Turnos POS' },
  { name: 'invoices',                  label: 'Facturas de venta / POS' },
  { name: 'invoice_lines',             label: 'Detalle de facturas de venta' },
  { name: 'sales_orders',              label: 'Pedidos de venta' },
  { name: 'sales_order_lines',         label: 'Detalle de pedidos' },
  { name: 'sales_reservations',        label: 'Reservas y cotizaciones' },
  { name: 'sales_reservation_lines',   label: 'Detalle de reservas' },
  { name: 'clientes',                  label: 'Directorio de clientes de ventas' },
  { name: 'spa_clients',               label: 'Clientes de estética / SPA' },
  
  // Clientes y Mascotas / Agenda
  { name: 'pets',                      label: 'Mascotas' },
  { name: 'appointments',              label: 'Citas médicas / Agenda' },
  
  // Módulo: Copropiedades (PH)
  { name: 'ph_properties',             label: 'Propiedades / Unidades PH' },
  { name: 'ph_common_areas',           label: 'Zonas comunes PH' },
  { name: 'ph_billing_concepts',       label: 'Conceptos de cobro PH' },
  { name: 'ph_budgets',                label: 'Presupuestos PH' },
  { name: 'ph_budget_lines',           label: 'Líneas de presupuesto PH' },
  { name: 'ph_invoices',               label: 'Facturas PH' },
  { name: 'ph_invoice_lines',          label: 'Detalle de facturas PH' },
  { name: 'ph_reservations',           label: 'Reservas de zonas comunes PH' },
  { name: 'ph_pqrs',                   label: 'PQRS PH' },
  { name: 'ph_individual_charges',     label: 'Cobros individuales PH' },
  
  // Módulo: Inmobiliarias
  { name: 'inmo_properties',           label: 'Inmuebles' },
  { name: 'inmo_contracts',            label: 'Contratos de arrendamiento' },
  { name: 'inmo_invoices',             label: 'Facturas inmobiliarias' },
  { name: 'inmo_invoice_lines',        label: 'Detalle de facturas inmobiliarias' },
  { name: 'inmo_property_history',     label: 'Historial de inmuebles' },
  
  // Módulo: CRM
  { name: 'crm_deals',                 label: 'Oportunidades CRM' },
  { name: 'crm_interactions',          label: 'Interacciones CRM' },
  
  // Módulo: Logística y Entregas
  { name: 'logistica_vehicles',        label: 'Vehículos de logística' },
  { name: 'logistica_deliveries',      label: 'Despachos / Entregas' },
  { name: 'logistica_delivery_lines',  label: 'Detalle de despachos' },
  
  // Módulo: Importaciones
  { name: 'imports',                   label: 'Importaciones' },
  { name: 'import_lines',              label: 'Detalle de importaciones' },
  
  // Auditoría
  { name: 'audit_log',                 label: 'Registro de auditoría' },
];

const BACKUP_VERSION = '2.0';

/* ── Estado del módulo ───────────────────────────────────── */
let _backupInProgress = false;
let _restoreInProgress = false;
let _massTxImportInProgress = false;
let _massTpImportInProgress = false;
let _massAccImportInProgress = false;
let _massPhUnitsImportInProgress = false;

/* ── Helper para Generación de Plantillas Excel Multi-hoja (con 'Indicaciones') ── */
function _generateTemplateXlsx(config: {
  filename: string;
  sheetName?: string;
  headers: Array<{ key: string; label: string } | string>;
  rows: any[];
  indications: Array<[string, string, string, string, string]>;
}) {
  if (typeof (window as any).XLSX === 'undefined') {
    showToast('La librería de Excel (XLSX) no se encuentra disponible', 'error');
    return;
  }
  const XLSX = (window as any).XLSX;
  const wb = XLSX.utils.book_new();

  // 1. Hoja principal de datos / plantilla
  const headerKeys = config.headers.map(h => (typeof h === 'object' ? h.key : h));
  const wsData = XLSX.utils.json_to_sheet(config.rows, { header: headerKeys });
  wsData['!cols'] = headerKeys.map(() => ({ wch: 24 }));
  XLSX.utils.book_append_sheet(wb, wsData, config.sheetName || 'Plantilla de Carga');

  // 2. Hoja de Indicaciones y Guía de Uso
  const indicationsData = [
    ['CAMPO / COLUMNA', 'REQUERIDO', 'TIPO / FORMATO', 'DESCRIPCIÓN Y VALORES PERMITIDOS', 'EJEMPLO'],
    ...config.indications
  ];
  const wsIndications = XLSX.utils.aoa_to_sheet(indicationsData);
  wsIndications['!cols'] = [
    { wch: 25 },
    { wch: 14 },
    { wch: 22 },
    { wch: 70 },
    { wch: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, wsIndications, 'Indicaciones');

  XLSX.writeFile(wb, `${config.filename}.xlsx`);
}

/* ══════════════════════════════════════════════════════════
   CARGA MASIVA DE PRODUCTOS
══════════════════════════════════════════════════════════ */
function _downloadMassProductsTemplate() {
  const headers = [
    'codigo', 'nombre', 'tipo', 'unidad', 'presentacion', 'categoria', 'linea',
    'iva', 'precio_base', 'precio_venta_2', 'precio_venta_3', 'costo', 'activo',
    'unspsc', 'ean', 'peso', 'cajas_en_pallet', 'und_empaque', 'peso_x_und_empaque',
    'descripcion', 'posicion_arancelaria', 'arancel_rate_default', 'pais_origen',
    'marca', 'modelo', 'visto_bueno_required', 'visto_bueno_entidad',
    'registro_sanitario', 'peso_neto', 'peso_bruto', 'largo_cm', 'ancho_cm',
    'alto_cm', 'stock_min', 'stock_max', 'cuenta_ingresos', 'cuenta_costos',
    'cuenta_inventarios', 'is_combo'
  ];

  const rows = [
    {
      codigo: 'P-001', nombre: 'Detergente Multiuso 1L', tipo: 'BIEN', unidad: '94',
      presentacion: 'Caja x 12', categoria: 'Aseo', linea: 'Hogar', iva: 19,
      precio_base: 12000, precio_venta_2: 11500, precio_venta_3: 11000, costo: 8000,
      activo: 'Si', unspsc: '44121618', ean: '7702010123456', peso: 1.2, cajas_en_pallet: 10,
      und_empaque: 12, peso_x_und_empaque: 0.1, descripcion: 'Detergente líquido concentrado',
      posicion_arancelaria: '3402200000', arancel_rate_default: 10, pais_origen: 'Colombia',
      marca: 'LimpiaMax', modelo: 'PRO-1L', visto_bueno_required: 'No', visto_bueno_entidad: '',
      registro_sanitario: 'NSO-12345', peso_neto: 1.0, peso_bruto: 1.2, largo_cm: 20,
      ancho_cm: 15, alto_cm: 10, stock_min: 5, stock_max: 100, cuenta_ingresos: '41350201',
      cuenta_costos: '61359501', cuenta_inventarios: '14350501', is_combo: 'No'
    },
    {
      codigo: 'S-002', nombre: 'Servicio de Mantenimiento Preventivo', tipo: 'SERVICIO', unidad: 'WSD',
      presentacion: '', categoria: 'Servicios', linea: 'Soporte', iva: 0,
      precio_base: 150000, precio_venta_2: 0, precio_venta_3: 0, costo: 0,
      activo: 'Si', unspsc: '72101500', ean: '', peso: '', cajas_en_pallet: '',
      und_empaque: '', peso_x_und_empaque: '', descripcion: 'Inspección técnica anual',
      posicion_arancelaria: '', arancel_rate_default: '', pais_origen: '', marca: '',
      modelo: '', visto_bueno_required: 'No', visto_bueno_entidad: '', registro_sanitario: '',
      peso_neto: '', peso_bruto: '', largo_cm: '', ancho_cm: '', alto_cm: '',
      stock_min: '', stock_max: '', cuenta_ingresos: '41350201', cuenta_costos: '',
      cuenta_inventarios: '', is_combo: 'No'
    },
    {
      codigo: 'P-003', nombre: 'Materia Prima Granel (Kg)', tipo: 'BIEN', unidad: 'KGM',
      presentacion: 'Saco x 25 Kg', categoria: 'Insumos', linea: 'Industrial', iva: 5,
      precio_base: 4500, precio_venta_2: 4200, precio_venta_3: 4000, costo: 3100,
      activo: 'Si', unspsc: '12352100', ean: '', peso: 25.0, cajas_en_pallet: 40,
      und_empaque: 1, peso_x_und_empaque: 25.0, descripcion: 'Insumo químico en polvo',
      posicion_arancelaria: '', arancel_rate_default: '', pais_origen: 'Colombia',
      marca: 'Quimic', modelo: '', visto_bueno_required: 'No', visto_bueno_entidad: '',
      registro_sanitario: '', peso_neto: 25.0, peso_bruto: 25.2, largo_cm: 50,
      ancho_cm: 40, alto_cm: 25, stock_min: 10, stock_max: 500, cuenta_ingresos: '41350201',
      cuenta_costos: '61359501', cuenta_inventarios: '14350501', is_combo: 'No'
    }
  ];

  const indications: Array<[string, string, string, string, string]> = [
    ['codigo', 'SÍ', 'Texto Alfanumérico', 'Código único de identificación del producto o servicio. Si el código ya existe, la información del producto será actualizada.', 'P-001'],
    ['nombre', 'SÍ', 'Texto Libre', 'Nombre o descripción comercial completa del ítem.', 'Detergente Multiuso 1L'],
    ['tipo', 'SÍ', 'Texto (BIEN / SERVICIO)', 'Indica la naturaleza del ítem. Valores válidos: BIEN (para bienes tangibles con control de inventario) o SERVICIO (servicios/honorarios).', 'BIEN'],
    ['unidad', 'SÍ', 'Código DIAN UBL 2.1', 'Código oficial de Unidad de Medida DIAN / UBL 2.1 (REQUERIDO). Catálogo oficial:\n• 94: Unidad\n• WSD: Servicio\n• KGM: Kilogramo\n• BX: Caja\n• LTR: Litro\n• MTR: Metro\n• GRM: Gramo\n• BO: Botella\n• PK: Paquete\n• DZN: Docena\n• LBR: Libra\n• MTK: Metro cuadrado\n• MTQ: Metro cúbico\n• GN: Galón bruto\n• CZ: Combo\n• TNE: Tonelada métrica', '94'],
    ['presentacion', 'NO', 'Texto Libre', 'Forma de presentación comercial del ítem.', 'Caja x 12 unidades'],
    ['categoria', 'NO', 'Texto Libre', 'Categoría general de clasificación del catálogo.', 'Aseo'],
    ['linea', 'NO', 'Texto Libre', 'Subgrupo o línea de producto.', 'Hogar'],
    ['iva', 'NO', 'Número (0, 5, 19)', 'Tarifa del Impuesto a las Ventas aplicable. Si se omite, toma 0 por defecto.', '19'],
    ['precio_base', 'NO', 'Número Positivo', 'Precio de venta público principal (Tarifa 1 / General).', '12000'],
    ['precio_venta_2', 'NO', 'Número Positivo', 'Precio alternativo / Mayorista.', '11500'],
    ['precio_venta_3', 'NO', 'Número Positivo', 'Precio alternativo / Especial.', '11000'],
    ['costo', 'NO', 'Número Positivo', 'Costo unitario de adquisición o producción inicial.', '8000'],
    ['activo', 'NO', 'Texto (Si / No)', 'Estado del producto. Valores: Si o No (Si omitido, asume Si).', 'Si'],
    ['unspsc', 'NO', 'Texto Numérico', 'Código de clasificación de bienes y servicios de Naciones Unidas (DIAN / Factura Electrónica).', '44121618'],
    ['ean', 'NO', 'Texto Numérico', 'Código de barras de producto (EAN-13 / UPC).', '7702010123456'],
    ['cuenta_ingresos', 'NO', 'Código PUC Auxiliar', 'Código de cuenta contable de ventas (clase 4). Debe existir como auxiliar activa.', '41350201'],
    ['cuenta_costos', 'NO', 'Código PUC Auxiliar', 'Código de cuenta contable de costos (clase 6). Debe existir como auxiliar activa.', '61359501'],
    ['cuenta_inventarios', 'NO', 'Código PUC Auxiliar', 'Código de cuenta contable de inventario (clase 14). Debe existir como auxiliar activa.', '14350501'],
    ['is_combo', 'NO', 'Texto (Si / No)', 'Indica si es un kit o producto compuesto.', 'No']
  ];

  _generateTemplateXlsx({
    filename: 'plantilla_carga_productos',
    sheetName: 'Plantilla de Productos',
    headers,
    rows,
    indications
  });
}

async function _openMassProductsImportModal() {
  if (!can('canWrite')) return showToast('No tienes permisos para importar productos', 'error');
  if ((window as any)._massProductsImportInProgress) return showToast('Importación en curso, espera...', 'warning');

  const reqCols = ['codigo', 'nombre', 'tipo', 'unidad'];
  const optColsBase = ['presentacion', 'categoria', 'linea', 'iva', 'precio_base', 'precio_venta_2', 'precio_venta_3', 'costo', 'activo', 'unspsc', 'ean', 'descripcion', 'is_combo'];
  const optColsImport = ['peso', 'cajas_en_pallet', 'und_empaque', 'peso_x_und_empaque', 'peso_neto', 'peso_bruto', 'largo_cm', 'ancho_cm', 'alto_cm', 'stock_min', 'stock_max', 'cuenta_ingresos', 'cuenta_costos', 'cuenta_inventarios', 'posicion_arancelaria', 'arancel_rate_default', 'pais_origen', 'marca', 'modelo', 'visto_bueno_required', 'visto_bueno_entidad', 'registro_sanitario', 'factor_margen', 'tipo_margen', 'regla_redondeo', 'auto_calc_precio'];


  openModal(
    '<i class="fas fa-boxes-stacked mr-2" style="color:#CA8A04"></i>Carga masiva de productos',
    `<div class="mb-2">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>Excel (.xlsx/.xls)</strong> o <strong>CSV</strong> con los productos a registrar o actualizar.<br>
        Si el <strong>código</strong> ya existe, el producto será <strong>actualizado</strong>; si no existe, será <strong>creado</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3 text-xs" style="background:#FEF9C3;border:1px solid #FDE68A">
        <p class="font-semibold mb-1" style="color:#CA8A04;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-1.5 mb-2">
          ${reqCols.map(c => `<code class="px-2 py-0.5 rounded" style="background:#FEF3C7;color:#CA8A04">${c}</code>`).join('')}
        </div>
        <p class="font-semibold mb-1" style="color:#4B5563;text-transform:uppercase;letter-spacing:.05em">Columnas opcionales (básicas y precios)</p>
        <div class="flex flex-wrap gap-1.5 mb-2">
          ${optColsBase.map(c => `<code class="px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${c}</code>`).join('')}
        </div>
        <p class="font-semibold mb-1" style="color:#1E3A8A;text-transform:uppercase;letter-spacing:.05em">Columnas opcionales (logística e importaciones)</p>
        <div class="flex flex-wrap gap-1.5 mb-2">
          ${optColsImport.map(c => `<code class="px-2 py-0.5 rounded" style="background:#E0F2FE;color:#0369A1">${c}</code>`).join('')}
        </div>
        <p class="text-[10.5px] mt-2" style="color:#CA8A04">
          <strong>tipo</strong>: BIEN o SERVICIO. <strong>unidad</strong>: 94 (Unidad), WSD (Servicio), KGM (Kg), BX (Caja), etc. <strong>iva</strong>: 0, 5, 19.
        </p>
      </div>
      <div id="mass-products-drop-zone" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#FDE68A;background:#FFFBEB">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#CA8A04;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 8 MB</p>
        <input type="file" id="mass-products-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>
      <div id="mass-products-progress-wrap" class="hidden mt-4">
        <div class="w-full rounded-full h-2" style="background:#E5E7EB">
          <div id="mass-products-progress-bar" class="h-2 rounded-full transition-all" style="background:linear-gradient(90deg,#CA8A04,#1A4B8C);width:0%"></div>
        </div>
        <p id="mass-products-progress-text" class="text-xs mt-2" style="color:#6B7280">Preparando...</p>
      </div>
      <div id="mass-products-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa</p>
          <button class="btn btn-outline btn-sm" id="btn-mass-products-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:320px;overflow-y:auto">
          <table class="data-table text-xs" id="mass-products-preview-table">
            <thead><tr>
              <th>#</th><th>Código</th><th>Nombre</th><th>Tipo</th><th>Unidad</th><th>IVA</th><th>Precio</th><th>Estado</th><th>Detalle</th>
            </tr></thead>
            <tbody id="mass-products-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-products-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-products-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,
    true
  );

  let parsedRows = [];
  const dropZone = $('#mass-products-drop-zone');
  const fileInput = $('#mass-products-file-input');
  const runBtn = $('#btn-mass-products-run');
  const clearBtn = $('#btn-mass-products-clear');

  const resetPreview = () => {
    parsedRows = [];
    $('#mass-products-preview')?.classList.add('hidden');
    runBtn?.classList.add('hidden');
    const body = $('#mass-products-preview-body');
    if (body) body.innerHTML = '';
    const summary = $('#mass-products-summary');
    if (summary) summary.innerHTML = '';
    if (fileInput) fileInput.value = '';
  };
  const setDropDefault = () => {
    if (!dropZone) return;
    dropZone.style.borderColor = '#FDE68A';
    dropZone.style.background = '#FFFBEB';
  };
  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#CA8A04';
    dropZone.style.background = '#FEF9C3';
  });
  dropZone?.addEventListener('dragleave', () => setDropDefault());
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    setDropDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  });
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) processFile(file);
  });
  clearBtn?.addEventListener('click', resetPreview);
  runBtn?.addEventListener('click', () => _executeMassProductsImport(parsedRows));

  async function processFile(file) {
    if (file.size > 8 * 1024 * 1024) return showToast('El archivo supera el límite de 8 MB', 'error');
    const ext = String(file.name.split('.').pop() || '').toLowerCase();
    let rawRows = [];
    try {
      if (ext === 'csv') {
        rawRows = _massTxParseCsv(await file.text());
      } else if (ext === 'xlsx' || ext === 'xls') {
        rawRows = _massTxParseExcel(await file.arrayBuffer());
      } else {
        return showToast('Formato no soportado. Usa CSV, XLSX o XLS.', 'error');
      }
    } catch (err) {
      return showToast(`Error al leer el archivo: ${err.message}`, 'error');
    }
    if (!rawRows.length) return showToast('El archivo no contiene datos', 'warning');
    parsedRows = await _massProductsBuildDraft(rawRows);
    _massProductsRenderPreview(parsedRows);
  }
}

async function _massProductsBuildDraft(rawRows) {
  // Cargar productos existentes para update/insert
  const existing = await pb.listAll('products', {});
  const byCode = new Map(existing.map(p => [String(p.code || '').toUpperCase(), p]));
  const validTypes = new Set(['BIEN','SERVICIO']);
  const validUnits = (typeof PRODUCT_UNITS !== 'undefined' ? PRODUCT_UNITS : []);
  
  // Extraer solo los códigos DIAN para validación
  const validUnitCodes = new Set(
    Array.isArray(validUnits) && validUnits.length > 0 && typeof validUnits[0] === 'object'
      ? (validUnits as any[]).map((u: any) => u.code)
      : (validUnits as string[])
  );
  const validIva = new Set([0,5,19]);

  // Cargar cuentas para mapear por código contable o ID
  const accounts = await pb.listAll('accounts', {});
  const accountByCode = new Map(accounts.map(a => [String(a.code || '').trim(), a.id]));
  const accountIds = new Set(accounts.map(a => a.id));
  const resolveAccount = (val) => {
    if (!val) return '';
    if (accountIds.has(val)) return val;
    return accountByCode.get(val) || '';
  };

  return rawRows.map((raw, i) => {
    const rowNo = i + 2;
    const get = (...keys) => {
      for (const k of keys) {
        const v = raw[_massTxNormHeader(k)];
        if (v !== undefined && String(v).trim() !== '') return String(v).trim();
      }
      return '';
    };
    const code = get('codigo','code','código').toUpperCase();
    const name = get('nombre','name');
    const type = get('tipo','type').toUpperCase();
    const unit = get('unidad','unit').toUpperCase();
    const iva = Number(get('iva','iva_rate'));
    const activeRaw = get('activo','active','estado').toLowerCase();
    const active = !/^(no|0|false|inactivo|inactiva)$/i.test(activeRaw);
    
    const vbReqRaw = get('visto_bueno_required','visto_bueno_req','visto_bueno').toLowerCase();
    const visto_bueno_required = /^(si|sí|yes|1|true)$/i.test(vbReqRaw);

    const comboRaw = get('is_combo','combo','es_combo').toLowerCase();
    const is_combo = /^(si|sí|yes|1|true)$/i.test(comboRaw);

    // Validaciones mínimas
    if (!code) return { ok: false, rowNo, error: `Fila ${rowNo}: falta código` };
    if (!name) return { ok: false, rowNo, error: `Fila ${rowNo}: falta nombre` };
    if (!validTypes.has(type)) return { ok: false, rowNo, error: `Fila ${rowNo}: tipo inválido (${type})` };
    if (!validUnitCodes.has(unit)) return { ok: false, rowNo, error: `Fila ${rowNo}: unidad inválida (${unit}). Use códigos DIAN: 94, KGM, WSD, BX, etc.` };
    if (!validIva.has(iva)) return { ok: false, rowNo, error: `Fila ${rowNo}: IVA inválido (${iva})` };
    // Validar consistencia de cubicaje
    const largo_cm = toNullableNumber(get('largo_cm'));
    const ancho_cm = toNullableNumber(get('ancho_cm'));
    const alto_cm = toNullableNumber(get('alto_cm'));
    const dimsRaw = [largo_cm, ancho_cm, alto_cm];
    const dimsFilledCount = dimsRaw.filter(v => v !== null && v !== undefined && Number(v) > 0).length;
    const hasNegative = dimsRaw.some(v => v !== null && v !== undefined && Number(v) < 0);

    if (hasNegative) {
      return { ok: false, rowNo, error: `Fila ${rowNo}: Largo, Ancho y Alto no pueden ser negativos.` };
    }
    if (dimsFilledCount > 0 && dimsFilledCount < 3) {
      return { ok: false, rowNo, error: `Fila ${rowNo}: Para cubicaje debes diligenciar Largo, Ancho y Alto completos; o dejar los tres vacíos.` };
    }

    // Payload
    const payload = {
      code,
      name,
      type,
      unit,
      presentacion: get('presentacion'),
      categoria: get('categoria'),
      linea: get('linea'),
      iva_rate: iva,
      base_price: parseFloat(get('precio_base')) || 0,
      precio_venta_2: toNullableNumber(get('precio_venta_2')),
      precio_venta_3: toNullableNumber(get('precio_venta_3')),
      cost_price: parseFloat(get('costo')) || 0,
      active,
      unspsc_code: get('unspsc'),
      ean_code: get('ean'),
      peso: toNullableNumber(get('peso')),
      cajas_en_pallet: toNullableNumber(get('cajas_en_pallet')),
      und_empaque: toNullableNumber(get('und_empaque')),
      peso_x_und_empaque: toNullableNumber(get('peso_x_und_empaque')),
      description: get('descripcion'),
      posicion_arancelaria: get('posicion_arancelaria','posicion_arancelaria_default'),
      arancel_rate_default: toNullableNumber(get('arancel_rate_default','arancel_rate')),
      pais_origen: get('pais_origen'),
      marca: get('marca'),
      modelo: get('modelo'),
      visto_bueno_required,
      visto_bueno_entidad: get('visto_bueno_entidad'),
      registro_sanitario: get('registro_sanitario'),
      peso_neto: toNullableNumber(get('peso_neto')),
      peso_bruto: toNullableNumber(get('peso_bruto')),
      largo_cm,
      ancho_cm,
      alto_cm,
      stock_min: toNullableNumber(get('stock_min')),
      stock_max: toNullableNumber(get('stock_max')),
      income_account_id: resolveAccount(get('cuenta_ingresos','cuenta_ingreso','income_account')),
      cost_account_id: resolveAccount(get('cuenta_costos','cuenta_costo','cost_account')),
      inventory_account_id: resolveAccount(get('cuenta_inventarios','cuenta_inventario','inventory_account')),
      is_combo,
      margin_factor: toNullableNumber(get('factor_margen', 'margin_factor')),
      margin_type: get('tipo_margen', 'margin_type') || 'MARKUP_COST',
      rounding_type: get('regla_redondeo', 'rounding_type') || 'NEAREST_100',
      auto_calc_price: String(get('auto_calc_precio', 'auto_calc_price')).trim().toLowerCase() === 'si' || String(get('auto_calc_precio', 'auto_calc_price')).trim().toLowerCase() === 'true',
    };

    const exists = byCode.has(code);
    return {
      ok: true,
      rowNo,
      code,
      name,
      type,
      unit,
      iva,
      price: payload.base_price,
      active,
      mode: exists ? 'update' : 'create',
      existingId: exists ? byCode.get(code).id : null,
      payload,
    };
  });
}

function _massProductsRenderPreview(rows) {
  const preview = $('#mass-products-preview');
  const tbody   = $('#mass-products-preview-body');
  const summary = $('#mass-products-summary');
  const runBtn  = $('#btn-mass-products-run');
  if (!preview || !tbody || !summary || !runBtn) return;
  const okRows  = rows.filter(r => r.ok);
  const badRows = rows.filter(r => !r.ok);
  tbody.innerHTML = rows.map(r => {
    if (r.ok) {
      return `<tr>
        <td>${r.rowNo}</td>
        <td><span class="font-semibold" style="color:#CA8A04">${esc(r.code)}</span></td>
        <td>${esc(r.name)}</td>
        <td>${esc(r.type)}</td>
        <td>${esc(r.unit)}</td>
        <td>${r.iva}</td>
        <td>${fmt(r.price)}</td>
        <td><span class="badge ${r.active ? 'badge-green' : 'badge-gray'}">${r.active ? 'Activo' : 'Inactivo'}</span></td>
        <td><span class="badge ${r.mode === 'update' ? 'badge-orange' : 'badge-blue'}">${r.mode === 'update' ? 'Actualizar' : 'Crear'}</span></td>
      </tr>`;
    }
    return `<tr style="background:#FFF7F7">
      <td>${r.rowNo}</td>
      <td colspan="7" class="text-xs" style="color:#EF4444">${esc(r.error || 'Error')}</td>
      <td><span class="badge badge-red">Error</span></td>
    </tr>`;
  }).join('');
  summary.innerHTML = `<span style="color:${badRows.length ? '#B91C1C' : '#166534'}">
    ${rows.length} fila(s): ${okRows.length} válida(s), ${badRows.length} con error.
    ${badRows.length ? 'Las filas con error serán omitidas.' : 'Listo para ejecutar.'}
  </span>`;
  preview.classList.remove('hidden');
  if (okRows.length) runBtn.classList.remove('hidden');
  else runBtn.classList.add('hidden');
}

async function _executeMassProductsImport(rows) {
  if ((window as any)._massProductsImportInProgress) return;
  const valids = (rows || []).filter(r => r.ok && r.payload);
  if (!valids.length) return showToast('No hay filas válidas para importar', 'warning');
  (window as any)._massProductsImportInProgress = true;
  const runBtn      = $('#btn-mass-products-run');
  const progressWrap = $('#mass-products-progress-wrap');
  const progressBar  = $('#mass-products-progress-bar');
  const progressText = $('#mass-products-progress-text');
  if (runBtn) { runBtn.disabled = true; runBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'; }
  progressWrap?.classList.remove('hidden');
  let created = 0, updated = 0, failed = 0;
  const failedRows = [];
  try {
    for (let i = 0; i < valids.length; i++) {
      const row = valids[i];
      const pct = (i / valids.length) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `Procesando ${i + 1} de ${valids.length}: ${row.code}`;
      try {
        if (row.mode === 'update' && row.existingId) {
          await pb.update('products', row.existingId, row.payload);
          updated++;
        } else {
          await pb.create('products', row.payload);
          created++;
        }
      } catch (err) {
        failed++;
        failedRows.push(`Fila ${row.rowNo} (${row.code}): ${err.message}`);
      }
    }
    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.textContent = 'Proceso finalizado';
    await API.logAudit('IMPORT', 'products', 'bulk', `${created} creados, ${updated} actualizados, ${failed} con error`);
    if (failedRows.length) console.warn('[CargaMasivaProductos] Errores:', failedRows);
    showToast(
      `Carga completada: ${created} creados, ${updated} actualizados${failed ? `, ${failed} con error` : ''}`,
      failed ? 'warning' : 'success',
      5500
    );
    _loadSysInfo();
    closeModal();
  } finally {
    (window as any)._massProductsImportInProgress = false;
    if (runBtn) { runBtn.disabled = false; runBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar carga'; }
  }
}

/* ══════════════════════════════════════════════════════════
   RENDER PRINCIPAL
══════════════════════════════════════════════════════════ */
async function renderUtilidades(container) {
  const isSuperAdmin = requireRole('superadmin');
  const isAdmin = requireRole('admin') || isSuperAdmin;
  const userRole = String(pb.currentUser?.role || '').toLowerCase().trim();
  const isContador = userRole === 'contador' || requireRole('contador');
  const canRenumber = isSuperAdmin || isAdmin || isContador;

  container.innerHTML = `
    <div class="anim-slide-up">
      <!-- Cabecera -->
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center"
             style="background:linear-gradient(135deg,#E87D1E,#C46516)">
          <i class="fas fa-toolbox text-white text-xl"></i>
        </div>
        <div>
          <h2 class="text-xl font-extrabold" style="color:#0D2137">Utilidades</h2>
          <p class="text-sm" style="color:#6B7280">Herramientas de administración y mantenimiento del sistema</p>
        </div>
      </div>

      <!-- Grid de tarjetas de utilidades -->
      <div class="grid gap-6" style="grid-template-columns:repeat(auto-fill,minmax(340px,1fr))">

        <!-- ── Tarjeta: Backup ──────────────────────────── -->
        <div class="stat-card blue" id="util-card-backup">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(46,107,166,.12)">
                <i class="fas fa-database" style="color:#1A4B8C;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Respaldo de datos</h3>
                <p class="text-xs" style="color:#6B7280">Exportar e importar toda la información</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Genera un archivo de respaldo completo con todos los datos del sistema en formato JSON.
            El archivo puede usarse para restaurar la información en caso de pérdida o migración.
          </p>

          <!-- Info última copia -->
          <div id="backup-last-info" class="hidden mb-4 p-3 rounded-lg text-xs"
               style="background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF">
            <i class="fas fa-clock-rotate-left mr-1"></i>
            <span id="backup-last-text"></span>
          </div>

          <!-- Barra de progreso -->
          <div id="backup-progress-wrap" class="hidden mb-4">
            <div class="flex justify-between text-xs mb-1" style="color:#6B7280">
              <span id="backup-progress-label">Preparando...</span>
              <span id="backup-progress-pct">0%</span>
            </div>
            <div class="w-full rounded-full h-2" style="background:#E5E7EB">
              <div id="backup-progress-bar" class="h-2 rounded-full transition-all"
                   style="background:linear-gradient(90deg,#2E6BA6,#E87D1E);width:0%"></div>
            </div>
          </div>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-backup-create" class="btn btn-secondary btn-sm">
              <i class="fas fa-download"></i> Crear respaldo completo
            </button>
            ${isSuperAdmin ? `
              <button id="btn-backup-config-only" class="btn btn-primary btn-sm" style="background:#1A4B8C;border-color:#1A4B8C">
                <i class="fas fa-screwdriver-wrench"></i> Respaldo de parametrización (Plantilla)
              </button>
            ` : ''}
            <button id="btn-backup-restore" class="btn btn-outline btn-sm">
              <i class="fas fa-upload"></i> Restaurar respaldo
            </button>
          </div>
          <!-- Input oculto para selección de archivo -->
          <input type="file" id="backup-file-input" accept=".json" class="hidden">
        </div>

        ${isSuperAdmin ? `
        <!-- ── Tarjeta: Limpieza de Base de Datos ─────────── -->
        <div class="stat-card red" id="util-card-clear-db" style="border-left-color: #EF4444;">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(239,68,68,.12)">
                <i class="fas fa-trash-can" style="color:#EF4444;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Limpieza de base de datos</h3>
                <p class="text-xs" style="color:#EF4444;font-weight:600">SOLO SUPERADMIN</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Elimina por completo todas las transacciones, movimientos de inventario, productos y terceros.
            <strong>Conserva intactos</strong> el plan de cuentas, usuarios, sucursales, bodegas y la configuración general.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-clear-db-execute" class="btn btn-danger btn-sm" style="background:#DC2626;border-color:#DC2626">
              <i class="fas fa-triangle-exclamation mr-1"></i> Vaciar base de datos
            </button>
          </div>
        </div>
        ` : ''}

        ${isAdmin ? `
        <!-- ── Tarjeta: Limpieza por Período ──────────────── -->
        <div class="stat-card orange" id="util-card-clear-period" style="border-left-color: #F59E0B;">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(245,158,11,.12)">
                <i class="fas fa-calendar-minus" style="color:#F59E0B;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Limpieza por período</h3>
                <p class="text-xs" style="color:#F59E0B;font-weight:600">ADMIN / SUPERADMIN</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Elimina definitivamente comprobantes y documentos operativos dentro de un período seleccionado
            para reiniciar la digitación de datos, reversando y recalculando los consecutivos automáticamente.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-clear-period-open" class="btn btn-warning btn-sm" style="background:#F59E0B;border-color:#F59E0B;color:#fff">
              <i class="fas fa-calendar-xmark mr-1"></i> Borrar por período
            </button>
          </div>
        </div>
        ` : ''}

        ${canRenumber ? `
        <!-- ── Tarjeta: Renumeración Masiva de Consecutivos ── -->
        <div class="stat-card orange" id="util-card-renumber-tx" style="border-left-color: #D97706;">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(217,119,6,.12)">
                <i class="fas fa-list-ol" style="color:#D97706;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Renumeración de documentos</h3>
                <p class="text-xs" style="color:#D97706;font-weight:600">SUPERADMIN / ADMIN / CONTADOR</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Renumera secuencialmente la numeración de los comprobantes de un tipo de transacción específico en un rango de fechas y/o consecutivo.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-renumber-tx-open" class="btn btn-warning btn-sm" style="background:#D97706;border-color:#D97706;color:#fff">
              <i class="fas fa-arrow-down-1-9 mr-1"></i> Renumerar documentos
            </button>
          </div>
        </div>
        ` : ''}

        <!-- ── Tarjeta: Información del sistema ─────────── -->
        <div class="stat-card orange" id="util-card-sysinfo">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                 style="background:rgba(232,125,30,.12)">
              <i class="fas fa-circle-info" style="color:#C46516;font-size:18px"></i>
            </div>
            <div>
              <h3 class="font-bold text-base" style="color:#0D2137">Información del sistema</h3>
              <p class="text-xs" style="color:#6B7280">Estado y estadísticas generales</p>
            </div>
          </div>
          <div id="sysinfo-content">
            <div class="flex items-center gap-2 text-sm" style="color:#9CA3AF">
              <i class="fas fa-spinner fa-spin"></i> Cargando...
            </div>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de transacciones ───── -->
        <div class="stat-card green" id="util-card-mass-tx">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(16,185,129,.12)">
                <i class="fas fa-file-import" style="color:#059669;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de transacciones</h3>
                <p class="text-xs" style="color:#6B7280">Importa comprobantes contables desde CSV o Excel</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Registra comprobantes en lote usando una plantilla estandar. El sistema valida período,
            cuentas de movimiento, tercero obligatorio y balance débito/crédito antes de grabar.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-tx-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-tx-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de cuentas ─────────── -->
        <div class="stat-card purple" id="util-card-mass-acc">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(124,58,237,.12)">
                <i class="fas fa-list-tree" style="color:#6D28D9;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de cuentas</h3>
                <p class="text-xs" style="color:#6B7280">Importa el plan de cuentas desde CSV o Excel</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Crea o actualiza cuentas en lote usando una plantilla estándar. Si el código ya existe
            la cuenta se actualiza; si no existe, se crea automáticamente.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-acc-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-acc-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de terceros ────────── -->
        <div class="stat-card red" id="util-card-mass-tp">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(59,130,246,.12)">
                <i class="fas fa-users" style="color:#1D4ED8;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de terceros</h3>
                <p class="text-xs" style="color:#6B7280">Importa clientes, proveedores y más desde CSV o Excel</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Registra terceros en lote usando una plantilla estándar. El sistema valida documento,
            nombre y tipo antes de grabar. Los duplicados (mismo NIT/documento) se actualizan.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-tp-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-tp-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de unidades PH ─────── -->
        <div class="stat-card blue" id="util-card-mass-ph-units">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(14,116,144,.12)">
                <i class="fas fa-building-user" style="color:#0E7490;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de unidades PH</h3>
                <p class="text-xs" style="color:#6B7280">Importa unidades habitacionales de copropiedades</p>
              </div>
            </div>
          </div>
          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Crea o actualiza unidades en lote para el módulo de Copropiedades. Si el código ya existe,
            la unidad se actualiza; si no existe, se crea automáticamente.
          </p>
          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-ph-units-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-ph-units-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

        <!-- ── Tarjeta: Carga masiva de productos ───────────── -->
        <div class="stat-card yellow" id="util-card-mass-products">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(234,179,8,.12)">
                <i class="fas fa-boxes-stacked" style="color:#CA8A04;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Carga masiva de productos</h3>
                <p class="text-xs" style="color:#6B7280">Importa productos y servicios desde CSV o Excel</p>
              </div>
            </div>
          </div>
          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Crea o actualiza productos en lote usando una plantilla estándar. Si el código ya existe el producto se actualiza; si no existe, se crea automáticamente.
          </p>
          <div class="flex gap-3 flex-wrap">
            <button id="btn-mass-products-template" class="btn btn-outline btn-sm">
              <i class="fas fa-download"></i> Descargar plantilla
            </button>
            <button id="btn-mass-products-open" class="btn btn-secondary btn-sm">
              <i class="fas fa-upload"></i> Cargar archivo
            </button>
          </div>
        </div>

        ${isAdmin ? `
        <!-- ── Tarjeta: Reemplazo masivo de cuentas ──────── -->
        <div class="stat-card blue" id="util-card-bulk-replace-acc" style="border-left-color: #2563EB;">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                   style="background:rgba(37,99,235,.12)">
                <i class="fas fa-shuffle" style="color:#2563EB;font-size:18px"></i>
              </div>
              <div>
                <h3 class="font-bold text-base" style="color:#0D2137">Reemplazo masivo de cuentas</h3>
                <p class="text-xs" style="color:#2563EB;font-weight:600">ADMIN / SUPERADMIN</p>
              </div>
            </div>
          </div>

          <p class="text-sm mb-4" style="color:#4B5563;line-height:1.6">
            Reemplaza una cuenta contable por otra en todas las líneas de transacciones en un lapso de tiempo.
          </p>

          <div class="flex gap-3 flex-wrap">
            <button id="btn-bulk-replace-open" class="btn btn-primary btn-sm" style="background:#2563EB;border-color:#2563EB;color:#fff">
              <i class="fas fa-shuffle mr-1"></i> Reemplazar cuenta en lote
            </button>
          </div>
        </div>
        ` : ''}

      </div>
    </div>`;

    _backupInProgress = false;
    _restoreInProgress = false;
    _massTxImportInProgress = false;
    _massTpImportInProgress = false;
    _massAccImportInProgress = false;
    _massPhUnitsImportInProgress = false;

    // Cargar última info de respaldo guardada localmente
    _loadLastBackupInfo();

    // Cargar estadísticas del sistema
    _loadSysInfo();

    // Listeners
    $('#btn-backup-create')?.addEventListener('click', () => _handleCreateBackup({ configOnly: false }));
    $('#btn-backup-config-only')?.addEventListener('click', () => _handleCreateBackup({ configOnly: true }));
    $('#btn-backup-restore')?.addEventListener('click', () => $('#backup-file-input')?.click());
    $('#backup-file-input')?.addEventListener('change', _handleRestoreFileSelected);

    $('#btn-mass-tx-template')?.addEventListener('click', _downloadMassTxTemplate);
    $('#btn-mass-tx-open')?.addEventListener('click', _openMassTxImportModal);
    $('#btn-mass-tp-template')?.addEventListener('click', _downloadMassTpTemplate);
    $('#btn-mass-tp-open')?.addEventListener('click', _openMassTpImportModal);
    $('#btn-mass-acc-template')?.addEventListener('click', _downloadMassAccTemplate);
    $('#btn-mass-acc-open')?.addEventListener('click', _openMassAccImportModal);
    $('#btn-mass-ph-units-template')?.addEventListener('click', _downloadMassPhUnitsTemplate);
    $('#btn-mass-ph-units-open')?.addEventListener('click', _openMassPhUnitsImportModal);
    $('#btn-mass-products-template')?.addEventListener('click', _downloadMassProductsTemplate);
    $('#btn-mass-products-open')?.addEventListener('click', _openMassProductsImportModal);

    if (canRenumber) {
      $('#btn-renumber-tx-open')?.addEventListener('click', _openRenumberTxModal);
    }
    if (isSuperAdmin) {
      $('#btn-clear-db-execute')?.addEventListener('click', _handleClearDatabase);
    }
    if (isAdmin) {
      $('#btn-clear-period-open')?.addEventListener('click', _handleClearPeriod);
      $('#btn-bulk-replace-open')?.addEventListener('click', _openBulkReplaceModal);
    }
}

/* ── Información del último backup (localStorage) ──────── */
function _loadLastBackupInfo() {
  const last = localStorage.getItem('gravy_last_backup') || localStorage.getItem('contaco_last_backup');
  if (!last) return;
  try {
    const info = JSON.parse(last);
    const el = $('#backup-last-info');
    const txt = $('#backup-last-text');
    if (el && txt) {
      txt.textContent = `Último respaldo: ${info.label} — ${info.records} registros`;
      el.classList.remove('hidden');
    }
  } catch { /* ignore */ }
}

/* ── Estadísticas del sistema ───────────────────────────── */
async function _loadSysInfo() {
  const el = $('#sysinfo-content');
  if (!el) return;

  const stats = await Promise.all(
    ['accounts', 'third_parties', 'transactions', 'tx_lines'].map(async col => {
      try {
        const r = await pb.list(col, { perPage: 1, page: 1 });
        return { col, total: r.totalItems };
      } catch { return { col, total: '—' }; }
    })
  );

  const labels = {
    accounts:      'Cuentas contables',
    third_parties: 'Terceros',
    transactions:  'Transacciones',
    tx_lines:      'Líneas contables',
  };

  el.innerHTML = stats.map(s => `
    <div class="flex items-center justify-between py-2 border-b last:border-0" style="border-color:#F3F4F6">
      <span class="text-sm" style="color:#374151">${labels[s.col]}</span>
      <span class="font-bold text-sm" style="color:#E87D1E">${typeof s.total === 'number' ? s.total.toLocaleString('es-CO') : s.total}</span>
    </div>
  `).join('') + `
    <div class="flex items-center justify-between pt-3 mt-1">
      <span class="text-xs" style="color:#9CA3AF">Versión GRAVY</span>
      <span class="badge badge-orange">v${BACKUP_VERSION}</span>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   CREAR BACKUP
══════════════════════════════════════════════════════════ */
async function _handleCreateBackup(options?: { configOnly?: boolean }) {
  if (_backupInProgress) return;
  _backupInProgress = true;

  const configOnly = options?.configOnly === true;
  const btn = configOnly ? $('#btn-backup-config-only') : $('#btn-backup-create');
  const btnOriginalHTML = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...'; }

  const progressWrap  = $('#backup-progress-wrap');
  const progressBar   = $('#backup-progress-bar');
  const progressLabel = $('#backup-progress-label');
  const progressPct   = $('#backup-progress-pct');

  if (progressWrap) progressWrap.classList.remove('hidden');

  const setProgress = (label, pct) => {
    if (progressLabel) progressLabel.textContent = label;
    if (progressBar)   progressBar.style.width = `${pct}%`;
    if (progressPct)   progressPct.textContent  = `${Math.round(pct)}%`;
  };

  // Colecciones a excluir en el respaldo especial de parametrización (Plantilla)
  const excludedInConfigOnly = new Set([
    'third_parties', 'users', 'pets', 'commission_rules',
    'transactions', 'tx_lines', 'payments', 'bank_movements', 'payroll_lines',
    'payroll_documents', 'payroll_novelties', 'electronic_payrolls',
    'einvoice_docs', 'electronic_documents', 'electronic_document_items',
    'electronic_document_taxes', 'inventory_movements', 'inventory_movement_lines',
    'inventory_stock', 'consignment_settlements', 'consignment_settlement_lines',
    'purchase_invoices', 'purchase_invoice_lines', 'pos_shifts', 'invoices',
    'invoice_lines', 'sales_orders', 'sales_order_lines', 'sales_reservations',
    'sales_reservation_lines', 'appointments', 'ph_invoices', 'ph_invoice_lines',
    'ph_reservations', 'ph_pqrs', 'ph_individual_charges', 'inmo_contracts',
    'inmo_invoices', 'inmo_invoice_lines', 'inmo_property_history', 'crm_deals',
    'crm_interactions', 'logistica_deliveries', 'logistica_delivery_lines',
    'imports', 'import_lines', 'audit_log', 'agenda_vencimientos',
    'niif_asset_events', 'niif_asset_inventories', 'niif_assets', 'niif_leases',
    'clientes', 'spa_clients'
  ]);

  // Lista base de colecciones
  let collectionsToExport = [...BACKUP_COLLECTIONS];

  // Auto-descubrimiento dinámico: consultar la API de colecciones para detectar tablas nuevas
  try {
    const allCols = await pb.collections.getFullList({ sort: 'name' });
    const knownNames = new Set(collectionsToExport.map(c => c.name));
    for (const colDef of allCols) {
      if (colDef.name && !colDef.name.startsWith('_') && !knownNames.has(colDef.name)) {
        collectionsToExport.push({
          name: colDef.name,
          label: `Colección: ${colDef.name}`
        });
      }
    }
  } catch (discErr) {
    // Si no hay acceso a la API de colecciones (rol no admin), usar la lista estática
  }

  // Colecciones accesibles al usuario
  const accessible = collectionsToExport.filter(c => {
    if (configOnly && excludedInConfigOnly.has(c.name)) return false;
    if (c.name === 'audit_log' && !can('canViewAudit')) return false;
    return true;
  });

  // Obtener el nombre de la empresa activa desde localStorage
  let dbName = 'GRAVY';
  try {
    const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
    if (activeCompany && activeCompany.company_name) {
      dbName = activeCompany.company_name;
    }
  } catch (e) {
    console.warn('[Backup] Error al leer la empresa activa de localStorage:', e);
  }

  const backup = {
    _meta: {
      version:    BACKUP_VERSION,
      created_at: (window as any).nowStr(),
      app:        'GRAVY',
      company:    configOnly ? `${dbName} (Plantilla de Parametrización)` : dbName,
      type:       configOnly ? 'config_template' : 'full',
      user:       pb.currentUser?.email ?? 'desconocido',
    },
    collections: {},
  };

  let totalRecords = 0;

  try {
    for (let i = 0; i < accessible.length; i++) {
      const col = accessible[i];
      const pct = ((i / accessible.length) * 95);
      setProgress(`Exportando: ${col.label}...`, pct);

      try {
        const rows = await pb.listAll(col.name);
        backup.collections[col.name] = rows;
        totalRecords += rows.length;
      } catch (err) {
        // Colección no existe o sin permiso: omitir silenciosamente
        backup.collections[col.name] = [];
        console.warn(`[Backup] Colección omitida (${col.name}):`, err.message);
      }
    }

    setProgress('Generando archivo...', 97);

    // Sanitizar el nombre para el archivo
    const sanitizedDbName = dbName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');

    // Serializar y descargar
    const json    = JSON.stringify(backup, null, 2);
    const blob    = new Blob([json], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);
    const anchor  = document.createElement('a');
    const dateStr = (window as any).nowStr().slice(0, 16).replace(' ', '_').replace(':', '-');
    anchor.href     = url;
    if (configOnly) {
      anchor.download = `${sanitizedDbName}_plantilla_config_${dateStr}.json`;
    } else {
      anchor.download = `${sanitizedDbName}_backup_${dateStr}.json`;
    }
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setProgress('Completado', 100);

    // Guardar metadata del último backup
    const backupInfo = JSON.stringify({
      label:   new Date().toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }),
      records: totalRecords,
    });
    localStorage.setItem('gravy_last_backup', backupInfo);
    _loadLastBackupInfo();

    await API.logAudit('BACKUP_CREATED', 'sistema', null,
      configOnly ? `Respaldo de parametrización manual: ${totalRecords} registros exportados` : `Respaldo manual completo: ${totalRecords} registros exportados`);

    showToast(`Respaldo creado exitosamente — ${totalRecords.toLocaleString('es-CO')} registros`, 'success');

  } catch (err) {
    showToast(`Error al generar respaldo: ${err.message}`, 'error');
    console.error('[Backup]', err);
  } finally {
    _backupInProgress = false;
    if (btn) { btn.disabled = false; btn.innerHTML = btnOriginalHTML; }
    if (progressWrap) {
      setTimeout(() => progressWrap?.classList.add('hidden'), 2000);
    }
  }
}

/* ══════════════════════════════════════════════════════════
   RESTAURAR BACKUP
══════════════════════════════════════════════════════════ */
async function _handleRestoreFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  // Limpiar el input para permitir reselección
  e.target.value = '';

  if (!can('canWrite') || !can('canDelete')) {
    showToast('No tienes permiso para restaurar un respaldo', 'error');
    return;
  }

  // Leer y validar el archivo primero
  let backup;
  try {
    const text = await file.text();
    backup = JSON.parse(text);
  } catch {
    showToast('El archivo no es un respaldo válido (JSON malformado)', 'error');
    return;
  }

  if (!backup._meta?.version || !backup.collections) {
    showToast('El archivo no corresponde a un respaldo de GRAVY', 'error');
    return;
  }

  // Confirmar con el usuario
  const meta      = backup._meta;
  const colCount  = Object.keys(backup.collections).length;
  const recCount  = Object.values(backup.collections).reduce((s, r) => s + (r?.length ?? 0), 0);

  // Crear desglose de colecciones con datos
  const collectionsSummary = Object.entries(backup.collections)
    .map(([colName, rows]) => {
      const arr = Array.isArray(rows) ? rows : [];
      const known = BACKUP_COLLECTIONS.find(c => c.name === colName);
      return {
        name: colName,
        label: known ? known.label : colName,
        count: arr.length
      };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const breakdownHTML = collectionsSummary.length > 0
    ? `<div class="mt-3 pt-3" style="border-top:1px solid #E5E7EB">
         <p class="text-xs font-bold uppercase mb-2" style="color:#4B5563">Desglose de colecciones a restaurar (${collectionsSummary.length})</p>
         <div class="max-h-40 overflow-y-auto rounded-lg p-2" style="background:#FFFFFF;border:1px solid #E5E7EB">
           <table class="w-full text-xs">
             <thead>
               <tr style="border-bottom:1px solid #F3F4F6;color:#6B7280;text-align:left">
                 <th class="pb-1">Módulo / Colección</th>
                 <th class="pb-1 text-right">Registros</th>
               </tr>
             </thead>
             <tbody>
               ${collectionsSummary.map(c => `
                 <tr style="border-bottom:1px solid #F9FAFB">
                   <td class="py-1" style="color:#1F2937">${esc(c.label)} <span style="color:#9CA3AF;font-size:10px">(${esc(c.name)})</span></td>
                   <td class="py-1 text-right font-bold" style="color:#1A4B8C">${c.count.toLocaleString('es-CO')}</td>
                 </tr>
               `).join('')}
             </tbody>
           </table>
         </div>
       </div>`
    : '';

  openModal('Confirmar restauración de datos', `
    <div class="flex flex-col gap-4">
      <div class="p-4 rounded-xl" style="background:#FEF3C7;border:1px solid #FCD34D">
        <div class="flex items-start gap-3">
          <i class="fas fa-triangle-exclamation mt-0.5" style="color:#D97706;font-size:18px"></i>
          <div>
            <p class="font-bold text-sm mb-1" style="color:#92400E">Advertencia: esta acción afectará la base de datos</p>
            <p class="text-sm" style="color:#78350F;line-height:1.6">
              La restauración <strong>reemplazará</strong> los registros existentes de las colecciones incluidas en el respaldo.
              Asegúrate de haber generado un respaldo reciente antes de continuar.
            </p>
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4" style="background:#F8F9FB;border:1px solid #E5E7EB">
        <p class="text-xs font-bold uppercase mb-3" style="color:#6B7280;letter-spacing:.5px">Detalles del archivo de respaldo</p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <span style="color:#6B7280">Versión:</span><strong style="color:#0D2137">${esc(meta.version)}</strong>
          ${meta.company ? `<span style="color:#6B7280">Empresa / Base:</span><strong style="color:#0D2137">${esc(meta.company)}</strong>` : ''}
          <span style="color:#6B7280">Fecha:</span><strong style="color:#0D2137">${esc(new Date(meta.created_at).toLocaleString('es-CO'))}</strong>
          <span style="color:#6B7280">Generado por:</span><strong style="color:#0D2137">${esc(meta.user)}</strong>
          <span style="color:#6B7280">Colecciones:</span><strong style="color:#0D2137">${colCount}</strong>
          <span style="color:#6B7280">Registros totales:</span><strong style="color:#E87D1E">${recCount.toLocaleString('es-CO')}</strong>
        </div>
        ${breakdownHTML}
      </div>
      <p class="text-sm text-center" style="color:#374151">¿Deseas continuar con el proceso de restauración masiva?</p>
    </div>`,
  [
    { label: 'Cancelar',   class: 'btn-outline',  action: () => closeModal() },
    { label: 'Restaurar',  class: 'btn-danger',   action: () => _doRestore(backup) },
  ]);
}

async function _doRestore(backup) {
  if (_restoreInProgress) return;
  _restoreInProgress = true;
  closeModal();

  showToast('Iniciando restauración en el servidor...', 'info');

  try {
    const res = await fetch(`${pb.baseUrl}/api/gravy/restore`, {
      method: 'POST',
      headers: pb.headers(),
      body: JSON.stringify(backup)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error desconocido durante la restauración');
    }

    const msg = `Restauración completada con éxito — ${data.restored || 0} registros restaurados, ${data.skipped || 0} omitidos`;
    showToast(msg, (data.skipped || 0) > 0 ? 'warning' : 'success', 5000);
  } catch (err) {
    showToast(`Error al restaurar: ${err.message}`, 'error', 6000);
    console.error('[Restore Error]', err);
  } finally {
    _restoreInProgress = false;
    _loadSysInfo();
  }
}

/* ══════════════════════════════════════════════════════════
   LIMPIEZA DE BASE DE DATOS (SOLO SUPERADMIN)
══════════════════════════════════════════════════════════ */
function _handleClearDatabase() {
  if (!requireRole('superadmin')) {
    showToast('Solo los usuarios SUPERADMIN pueden realizar esta acción', 'error');
    return;
  }

  openModal('Limpieza de base de datos', `
    <div class="flex flex-col gap-4">
      <div class="p-4 rounded-xl" style="background:#FEE2E2;border:1px solid #FCA5A5">
        <div class="flex items-start gap-3">
          <i class="fas fa-triangle-exclamation mt-0.5" style="color:#DC2626;font-size:18px"></i>
          <div>
            <p class="font-bold text-sm mb-1" style="color:#991B1B">¡ADVERTENCIA CRÍTICA!</p>
            <p class="text-sm" style="color:#7F1D1D;line-height:1.6">
              Esta operación es **irreversible** y eliminará permanentemente:
              <br>• Todas las transacciones y líneas contables.
              <br>• Todos los movimientos de inventario y stock.
              <br>• Todos los productos, servicios y sus componentes.
              <br>• Todos los terceros (clientes, proveedores, etc.).
              <br><br>
              Se conservarán la parametrización de cuentas, sucursales, bodegas y usuarios.
            </p>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-700">Para confirmar, escribe la palabra <strong class="text-red-600">ELIMINAR</strong> a continuación:</label>
        <input type="text" id="clear-db-confirm-input" class="input w-full" placeholder="Escribe ELIMINAR" autocomplete="off" style="border: 1px solid #D1D5DB; border-radius: 8px; padding: 8px 12px;">
      </div>
    </div>`,
  [
    { label: 'Cancelar', class: 'btn-outline', action: () => closeModal() },
    { 
      label: 'Sí, vaciar base de datos', 
      class: 'btn-danger', 
      action: () => {
        const val = ($('#clear-db-confirm-input') as HTMLInputElement)?.value;
        if (String(val).trim().toUpperCase() !== 'ELIMINAR') {
          showToast('Confirmación incorrecta', 'error');
          return;
        }
        _doClearDatabase();
      } 
    },
  ]);
}

async function _doClearDatabase() {
  closeModal();
  showToast('Iniciando limpieza de la base de datos...', 'info');

  try {
    const res = await fetch(`${pb.baseUrl}/api/gravy/clear-data`, {
      method: 'POST',
      headers: pb.headers()
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error desconocido durante la limpieza');
    }

    showToast(`Base de datos limpiada con éxito: ${data.cleared || 0} registros eliminados`, 'success', 6000);
  } catch (err: any) {
    showToast(`Error al limpiar la base de datos: ${err.message}`, 'error', 6000);
    console.error('[Clear Database Error]', err);
  } finally {
    _loadSysInfo();
  }
}

/* ── Limpieza por período (ADMIN/SUPERADMIN) ──────────────── */
async function _handleClearPeriod() {
  const isSuperAdmin = requireRole('superadmin');
  const isAdmin = requireRole('admin') || isSuperAdmin;
  if (!isAdmin) {
    showToast('Solo los usuarios administradores pueden realizar esta acción', 'error');
    return;
  }

  let txTypes: any[] = [];
  try {
    txTypes = await pb.listAll('transaction_types', { sort: 'code,name' });
  } catch(e) {
    console.warn('[Clear Period] Error fetching txTypes:', e);
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  const defaultStart = `${y}-${m}-01`;
  const defaultEnd = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

  const txTypesOptionsHtml = txTypes.map(t => 
    `<option value="${t.id}" ${t.code === 'NM' ? 'selected' : ''}>[${t.code}] ${t.name || t.code}</option>`
  ).join('');

  openModal('<i class="fas fa-calendar-xmark mr-2" style="color:#F59E0B"></i>Limpieza y eliminación por período', `
    <div class="flex flex-col gap-4">
      <div class="p-4 rounded-xl" style="background:#FFFBEB;border:1px solid #FDE68A">
        <div class="flex items-start gap-3">
          <i class="fas fa-triangle-exclamation mt-0.5" style="color:#D97706;font-size:18px"></i>
          <div>
            <p class="font-bold text-sm mb-1" style="color:#92400E">¡ADVERTENCIA ADMINISTRATIVA!</p>
            <p class="text-xs" style="color:#78350F;line-height:1.6">
              Esta herramienta permite eliminar comprobantes y documentos causados contablemente (como Nómina <strong>NM</strong>, comprobantes de egreso, etc.) dentro del período de fechas seleccionado.
              Los consecutivos de comprobantes y resoluciones se recalcularán automáticamente.
            </p>
          </div>
        </div>
      </div>

      <!-- Selector de Fechas y Botones Rápidos -->
      <div class="flex flex-col gap-2">
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label font-bold text-xs" style="color:#374151">Fecha Inicial</label>
            <input type="date" id="clear-period-start" class="form-input" value="${defaultStart}" style="border: 1px solid #D1D5DB; border-radius: 8px; padding: 8px; width: 100%;">
          </div>
          <div class="form-group">
            <label class="form-label font-bold text-xs" style="color:#374151">Fecha Final</label>
            <input type="date" id="clear-period-end" class="form-input" value="${defaultEnd}" style="border: 1px solid #D1D5DB; border-radius: 8px; padding: 8px; width: 100%;">
          </div>
        </div>
        <div class="flex gap-2 justify-end text-xs">
          <button type="button" class="btn btn-xs btn-outline" id="btn-cp-preset-this-month">Mes Actual</button>
          <button type="button" class="btn btn-xs btn-outline" id="btn-cp-preset-last-month">Mes Anterior</button>
          <button type="button" class="btn btn-xs btn-outline" id="btn-cp-preset-this-year">Año Actual</button>
        </div>
      </div>

      <!-- Componentes a Limpiar -->
      <div class="flex flex-col gap-2">
        <label class="font-bold text-xs" style="color:#374151">Componentes a Limpiar:</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 rounded-lg" style="background:#F9FAFB;border:1px solid #E5E7EB">
          <label class="flex items-center gap-2 text-xs cursor-pointer py-1">
            <input type="checkbox" id="chk-clear-tx" checked class="rounded border-gray-300 text-amber-600 focus:ring-amber-500">
            <span class="font-semibold">Comprobantes contables</span>
          </label>
          <label class="flex items-center gap-2 text-xs cursor-pointer py-1">
            <input type="checkbox" id="chk-clear-invoices" class="rounded border-gray-300 text-amber-600 focus:ring-amber-500">
            <span>Facturas de venta y POS</span>
          </label>
          <label class="flex items-center gap-2 text-xs cursor-pointer py-1">
            <input type="checkbox" id="chk-clear-pinvoices" class="rounded border-gray-300 text-amber-600 focus:ring-amber-500">
            <span>Facturas de compra</span>
          </label>
          <label class="flex items-center gap-2 text-xs cursor-pointer py-1">
            <input type="checkbox" id="chk-clear-invmovements" class="rounded border-gray-300 text-amber-600 focus:ring-amber-500">
            <span>Movimientos de inventario</span>
          </label>
          <label class="flex items-center gap-2 text-xs cursor-pointer py-1">
            <input type="checkbox" id="chk-clear-bank" class="rounded border-gray-300 text-amber-600 focus:ring-amber-500">
            <span>Movimientos bancarios</span>
          </label>
          <label class="flex items-center gap-2 text-xs cursor-pointer py-1">
            <input type="checkbox" id="chk-clear-payroll" class="rounded border-gray-300 text-amber-600 focus:ring-amber-500">
            <span>Borrar período de nómina completo</span>
          </label>
        </div>
      </div>

      <!-- Filtro Específico por Tipo de Transacción (ej. NM Nómina) -->
      <div id="box-tx-type-filter" class="p-3 rounded-lg flex flex-col gap-2" style="background:#EFF6FF;border:1px solid #BFDBFE">
        <label class="font-bold text-xs flex items-center justify-between" style="color:#1E40AF">
          <span><i class="fas fa-filter mr-1"></i>Filtrar comprobantes por Tipo de Transacción (Opcional):</span>
        </label>
        <div class="flex items-center gap-4 text-xs">
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="cp-txtype-mode" value="all" checked> Todos los tipos
          </label>
          <label class="flex items-center gap-1 cursor-pointer">
            <input type="radio" name="cp-txtype-mode" value="specific"> Seleccionar tipos específicos (ej. NM)
          </label>
        </div>
        <div id="cp-txtype-select-wrap" class="hidden mt-1">
          <select id="cp-txtype-select" multiple class="form-input text-xs w-full" style="height:100px;border:1px solid #93C5FD;border-radius:6px;padding:4px">
            ${txTypesOptionsHtml}
          </select>
          <p class="text-xs text-blue-600 mt-1">Mantén presionado Ctrl (o Cmd) para seleccionar múltiples tipos.</p>
        </div>
      </div>

      <!-- Opciones Especiales de Restablecimiento de Nómina -->
      <div class="p-3 rounded-lg flex flex-col gap-2" style="background:#F0FDF4;border:1px solid #BBF7D0">
        <p class="font-bold text-xs" style="color:#166534"><i class="fas fa-rotate-left mr-1"></i>Opciones de Re-liquidación de Nómina:</p>
        <label class="flex items-center gap-2 text-xs cursor-pointer" style="color:#15803D">
          <input type="checkbox" id="chk-cp-reset-payroll" checked class="rounded text-green-600">
          <span>Restablecer períodos de nómina afectados a <strong>Borrador (draft)</strong> y desvincular <code>tx_id</code></span>
        </label>
        <label class="flex items-center gap-2 text-xs cursor-pointer" style="color:#15803D">
          <input type="checkbox" id="chk-cp-clear-payroll-lines" class="rounded text-green-600">
          <span>Eliminar colillas de pago calculadas (payroll_lines) para liquidar totalmente desde cero</span>
        </label>
      </div>

      <!-- Confirmación por Texto -->
      <div class="flex flex-col gap-2">
        <label class="text-xs font-medium text-gray-700">Para confirmar, escribe la palabra <strong class="text-amber-600">REINICIAR</strong> a continuación:</label>
        <input type="text" id="clear-period-confirm-input" class="input w-full" placeholder="Escribe REINICIAR" autocomplete="off" style="border: 1px solid #D1D5DB; border-radius: 8px; padding: 8px 12px; font-size: 14px;">
      </div>
    </div>`,
  [
    { label: 'Cancelar', class: 'btn-outline', action: () => closeModal() },
    { 
      label: 'Borrar por período', 
      class: 'btn-warning', 
      action: () => {
        const val = ($('#clear-period-confirm-input') as HTMLInputElement)?.value;
        if (String(val).trim().toUpperCase() !== 'REINICIAR') {
          showToast('Confirmación incorrecta', 'error');
          return;
        }
        
        const startDate = ($('#clear-period-start') as HTMLInputElement)?.value;
        const endDate = ($('#clear-period-end') as HTMLInputElement)?.value;
        
        if (!startDate || !endDate) {
          showToast('Fechas requeridas', 'error');
          return;
        }

        const isTxChecked = ($('#chk-clear-tx') as HTMLInputElement)?.checked;
        const txTypeMode = ($('input[name="cp-txtype-mode"]:checked') as HTMLInputElement)?.value;
        let selectedTxTypeIds: string[] = [];

        if (isTxChecked && txTypeMode === 'specific') {
          const selectEl = $('#cp-txtype-select') as HTMLSelectElement;
          if (selectEl) {
            selectedTxTypeIds = Array.from(selectEl.selectedOptions).map(opt => opt.value);
          }
          if (selectedTxTypeIds.length === 0) {
            showToast('Selecciona al menos un tipo de transacción o elige "Todos los tipos"', 'warning');
            return;
          }
        }
        
        const selections = {
          transactions: isTxChecked,
          tx_type_ids: selectedTxTypeIds,
          reset_payroll: ($('#chk-cp-reset-payroll') as HTMLInputElement)?.checked,
          clear_payroll_lines: ($('#chk-cp-clear-payroll-lines') as HTMLInputElement)?.checked,
          invoices: ($('#chk-clear-invoices') as HTMLInputElement)?.checked,
          purchase_invoices: ($('#chk-clear-pinvoices') as HTMLInputElement)?.checked,
          inventory_movements: ($('#chk-clear-invmovements') as HTMLInputElement)?.checked,
          bank_movements: ($('#chk-clear-bank') as HTMLInputElement)?.checked,
          payroll: ($('#chk-clear-payroll') as HTMLInputElement)?.checked
        };
        
        const hasSelection = selections.transactions || selections.invoices || selections.purchase_invoices || 
                             selections.inventory_movements || selections.bank_movements || selections.payroll || selections.reset_payroll;
        if (!hasSelection) {
          showToast('Debes seleccionar al menos un componente a limpiar', 'error');
          return;
        }
        
        _doClearPeriod(startDate, endDate, selections);
      } 
    },
  ]);

  // Event listeners en el modal
  const radioAll = $('input[name="cp-txtype-mode"][value="all"]');
  const radioSpecific = $('input[name="cp-txtype-mode"][value="specific"]');
  const wrapSelect = $('#cp-txtype-select-wrap');

  radioAll?.addEventListener('change', () => wrapSelect?.classList.add('hidden'));
  radioSpecific?.addEventListener('change', () => wrapSelect?.classList.remove('hidden'));

  // Handlers para Presets de fechas
  $('#btn-cp-preset-this-month')?.addEventListener('click', () => {
    const n = new Date();
    const Y = n.getFullYear();
    const M = String(n.getMonth() + 1).padStart(2, '0');
    const L = new Date(Y, n.getMonth() + 1, 0).getDate();
    ($('#clear-period-start') as HTMLInputElement).value = `${Y}-${M}-01`;
    ($('#clear-period-end') as HTMLInputElement).value = `${Y}-${M}-${String(L).padStart(2, '0')}`;
  });

  $('#btn-cp-preset-last-month')?.addEventListener('click', () => {
    const n = new Date();
    n.setMonth(n.getMonth() - 1);
    const Y = n.getFullYear();
    const M = String(n.getMonth() + 1).padStart(2, '0');
    const L = new Date(Y, n.getMonth() + 1, 0).getDate();
    ($('#clear-period-start') as HTMLInputElement).value = `${Y}-${M}-01`;
    ($('#clear-period-end') as HTMLInputElement).value = `${Y}-${M}-${String(L).padStart(2, '0')}`;
  });

  $('#btn-cp-preset-this-year')?.addEventListener('click', () => {
    const Y = new Date().getFullYear();
    ($('#clear-period-start') as HTMLInputElement).value = `${Y}-01-01`;
    ($('#clear-period-end') as HTMLInputElement).value = `${Y}-12-31`;
  });
}

async function _doClearPeriod(startDate: string, endDate: string, selections: any) {
  closeModal();
  showToast(`Iniciando limpieza desde ${startDate} hasta ${endDate}...`, 'info');

  try {
    const res = await fetch(`${pb.baseUrl}/api/gravy/clear-period`, {
      method: 'POST',
      headers: pb.headers(),
      body: JSON.stringify({ startDate, endDate, selections })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error desconocido durante la limpieza');
    }

    showToast(`Limpieza completada: ${data.cleared || 0} registros eliminados.`, 'success', 6000);
  } catch (err: any) {
    showToast(`Error al limpiar el período: ${err.message}`, 'error', 6000);
    console.error('[Clear Period Error]', err);
  } finally {
    _loadSysInfo();
  }
}


/* ══════════════════════════════════════════════════════════
   CARGA MASIVA DE TRANSACCIONES
══════════════════════════════════════════════════════════ */
function _addDaysStr(dateStr: string, days: number): string {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + Number(days || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const r = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${r}`;
}

function _downloadMassTxTemplate() {
  const headers = [
    'grupo', 'fecha', 'descripcion', 'tercero', 'plazo_dias',
    'cuenta', 'debito', 'credito', 'tercero_linea', 'descripcion_linea',
    'doc_cruce', 'fecha_doc_cruce', 'fecha_vencimiento', 'sucursal'
  ];

  const rows = [
    { grupo: 'RC-00000001', fecha: '2026-05-01', descripcion: 'Registro recaudo factura FV-1001', tercero: '900123456', plazo_dias: 0, cuenta: '11100501', debito: 1500000, credito: 0, tercero_linea: '900123456', descripcion_linea: 'Ingreso a banco recaudo', doc_cruce: 'FV-1001', fecha_doc_cruce: '2026-01-15', fecha_vencimiento: '2026-02-14', sucursal: 'SUC01' },
    { grupo: 'RC-00000001', fecha: '2026-05-01', descripcion: 'Registro recaudo factura FV-1001', tercero: '900123456', plazo_dias: 0, cuenta: '13050501', debito: 0, credito: 1500000, tercero_linea: '900123456', descripcion_linea: 'Cruce cartera cliente', doc_cruce: 'FV-1001', fecha_doc_cruce: '2026-01-15', fecha_vencimiento: '2026-02-14', sucursal: 'SUC01' },
    { grupo: 'CE-00000002', fecha: '2026-05-02', descripcion: 'Pago proveedor factura FC-888', tercero: '901234567', plazo_dias: 30, cuenta: '22050101', debito: 450000, credito: 0, tercero_linea: '901234567', descripcion_linea: 'Cruce CxP proveedor', doc_cruce: 'FC-888', fecha_doc_cruce: '2026-03-01', fecha_vencimiento: '2026-03-31', sucursal: '' },
    { grupo: 'CE-00000002', fecha: '2026-05-02', descripcion: 'Pago proveedor factura FC-888', tercero: '901234567', plazo_dias: 30, cuenta: '11100501', debito: 0, credito: 450000, tercero_linea: '901234567', descripcion_linea: 'Salida de banco por pago', doc_cruce: 'FC-888', fecha_doc_cruce: '2026-03-01', fecha_vencimiento: '2026-03-31', sucursal: '' }
  ];

  const indications: Array<[string, string, string, string, string]> = [
    ['grupo', 'SÍ', 'Texto Alfanumérico', 'Identificador único del comprobante. Permite agrupar múltiples líneas en una sola transacción contable. Debe iniciar con el prefijo o código del Tipo de Transacción configurado (ej: RC-001 para Recaudo, CE-001 para Egreso, CC-001 para Comprobante Contable, DS-001 para Documento Soporte, NM-001 para Nómina).', 'RC-00000001'],
    ['fecha', 'SÍ', 'Fecha (YYYY-MM-DD)', 'Fecha del comprobante contable. El período debe estar abierto en el sistema.', '2026-05-01'],
    ['descripcion', 'SÍ', 'Texto Libre', 'Concepto general o encabezado del comprobante contable.', 'Registro de recaudo cliente'],
    ['cuenta', 'SÍ', 'Código PUC Auxiliar', 'Código numérico de la cuenta contable auxiliar (debe ser cuenta de movimiento, no de mayor).', '11100501'],
    ['debito', 'SÍ (Débito o Crédito)', 'Número Positivo', 'Valor del movimiento en el débito. Una misma línea no puede tener valor en Débito y Crédito simultáneamente.', '1500000'],
    ['credito', 'SÍ (Débito o Crédito)', 'Número Positivo', 'Valor del movimiento en el crédito. Una misma línea no puede tener valor en Débito y Crédito simultáneamente.', '0'],
    ['tercero', 'NO / CONDICIONAL', 'NIT / Documento', 'Documento del tercero del encabezado. Si la cuenta requiere tercero, debe especificarse en el encabezado o en tercero_linea.', '900123456'],
    ['tercero_linea', 'NO', 'NIT / Documento', 'Documento del tercero específico de la línea contable. Sobrescribe al tercero del encabezado.', '900123456'],
    ['descripcion_linea', 'NO', 'Texto Libre', 'Detalle o leyenda específica de la línea contable. Si se omite, toma la descripción general.', 'Ingreso por recaudo de cartera'],
    ['doc_cruce', 'NO', 'Texto Alfanumérico', 'Número de factura o documento de referencia para cruce de cartera (CxC / CxP).', 'FV-1001'],
    ['fecha_doc_cruce', 'NO', 'Fecha (YYYY-MM-DD)', 'Fecha original de emisión de la factura o documento de cruce. Permite que los reportes y envejecimiento de cartera calculen la antigüedad exacta desde la fecha de origen del saldo.', '2026-01-15'],
    ['fecha_vencimiento', 'NO', 'Fecha (YYYY-MM-DD)', 'Fecha exacta de vencimiento de la cartera o documento de cruce. Si se omite pero se diligencia fecha_doc_cruce y plazo_dias, se calcula automáticamente.', '2026-02-14'],
    ['sucursal', 'NO', 'Código Sucursal', 'Código de la sucursal asignada al comprobante. Si se deja en blanco, utiliza la sucursal seleccionada en el modal.', 'SUC01']
  ];

  _generateTemplateXlsx({
    filename: 'plantilla_carga_transacciones',
    sheetName: 'Plantilla de Transacciones',
    headers,
    rows,
    indications
  });
}

async function _openMassTxImportModal() {
  if (!can('canWrite')) return showToast('No tienes permisos para importar transacciones', 'error');

  // ── Cargar sucursales antes de abrir el modal ──────────────
  let allBranches = [];
  try {
    allBranches = await pb.listAll('branches', { filter: 'active=true', ignoreBranch: true });
  } catch (_) { /* sin sucursales */ }
  const user = pb.currentUser;
  let allowedBranches = allBranches;
  if (user?.allowed_branches?.length) {
    allowedBranches = allBranches.filter((b: any) => user.allowed_branches.includes(b.id));
  }
  const activeBranchId = localStorage.getItem('active_branch_id') || 'TODAS';
  const defaultBranchId = activeBranchId !== 'TODAS'
    ? activeBranchId
    : (user?.default_branch_id || allowedBranches[0]?.id || '');

  const branchOptions = allowedBranches.map((b: any) =>
    `<option value="${esc(b.id)}" ${b.id === defaultBranchId ? 'selected' : ''}>${esc(b.code)} - ${esc(b.name)}</option>`
  ).join('');

  const branchSelector = allowedBranches.length
    ? `<div class="rounded-xl p-3 mb-3 flex items-center gap-3" style="background:#EFF6FF;border:1px solid #BFDBFE">
        <i class="fas fa-building-user" style="color:#1A4B8C;font-size:1.1rem"></i>
        <div style="flex:1">
          <label class="text-xs font-semibold block mb-1" style="color:#1E40AF;text-transform:uppercase;letter-spacing:.05em">Sucursal destino</label>
          <select id="mass-tx-branch" class="form-input" style="font-size:13px;padding:5px 10px">
            ${branchOptions}
          </select>
        </div>
        <p class="text-xs" style="color:#3B82F6;max-width:200px">Aplica a todos los comprobantes sin sucursal propia en el archivo.</p>
      </div>`
    : `<div class="rounded-xl p-3 mb-3" style="background:#FEF9C3;border:1px solid #FDE68A">
        <p class="text-xs" style="color:#92400E"><i class="fas fa-triangle-exclamation mr-1"></i>No hay sucursales activas configuradas. Los comprobantes se crearán sin sucursal.</p>
      </div>`;

  openModal(
    '<i class="fas fa-file-import mr-2" style="color:#059669"></i>Carga masiva de transacciones',
    `
    <div class="mb-2">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx/.xls)</strong> con líneas contables agrupadas por comprobante.
        Cada <strong>grupo</strong> representa un comprobante y debe quedar cuadrado (débito = crédito).
      </p>

      ${branchSelector}

      <div class="rounded-xl p-3 mb-3" style="background:#ECFDF5;border:1px solid #A7F3D0">
        <p class="text-xs font-semibold mb-1" style="color:#047857;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-2 mb-2">
          ${['grupo','fecha','descripcion','cuenta'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#D1FAE5;color:#065F46">${c}</code>`).join('')}
          ${['debito','credito','tercero','plazo_dias','tercero_linea','descripcion_linea','doc_cruce','fecha_doc_cruce','fecha_vencimiento','sucursal'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${c} <span style="font-size:.65rem">(opcional)</span></code>`).join('')}
        </div>
        <p class="text-xs" style="color:#065F46">
          <strong>grupo</strong>: Número de comprobante o serie-consecutivo (ej: <code>RC-001</code> o <code>CE-15</code>). El prefijo define la serie y el tipo de transacción.<br>
          <strong>doc_cruce / fecha_doc_cruce / fecha_vencimiento</strong>: Permite informar documento y fecha de origen/vencimiento de cartera para que los reportes calculen moras exactas.<br>
          <strong>cuenta</strong>: Código contable auxiliar.<br>
          <strong>sucursal</strong>: Código de sucursal (si se omite se usa el selector).
        </p>
      </div>

      <div id="mass-tx-drop-zone" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#1A4B8C;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 8 MB</p>
        <input type="file" id="mass-tx-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>

      <div id="mass-tx-progress-wrap" class="hidden mt-4">
        <div class="w-full rounded-full h-2" style="background:#E5E7EB">
          <div id="mass-tx-progress-bar" class="h-2 rounded-full transition-all" style="background:linear-gradient(90deg,#059669,#1A4B8C);width:0%"></div>
        </div>
        <p id="mass-tx-progress-text" class="text-xs mt-2" style="color:#6B7280">Preparando...</p>
      </div>

      <div id="mass-tx-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa de comprobantes</p>
          <button class="btn btn-outline btn-sm" id="btn-mass-tx-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:320px;overflow-y:auto">
          <table class="data-table text-xs" id="mass-tx-preview-table">
            <thead><tr>
              <th>Comprobante / Grupo</th><th>Fecha</th><th>Tipo</th><th>Sucursal</th><th>Líneas</th><th>Débito</th><th>Crédito</th><th>Estado</th><th>Detalle</th>
            </tr></thead>
            <tbody id="mass-tx-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-tx-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-tx-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,
    true
  );

  let parsedGroups = [];

  const dropZone = $('#mass-tx-drop-zone');
  const fileInput = $('#mass-tx-file-input');
  const runBtn = $('#btn-mass-tx-run');
  const clearBtn = $('#btn-mass-tx-clear');

  const getSelectedBranchId = () =>
    ($('#mass-tx-branch') as HTMLSelectElement)?.value || defaultBranchId || null;

  const resetPreview = () => {
    parsedGroups = [];
    $('#mass-tx-preview')?.classList.add('hidden');
    runBtn?.classList.add('hidden');
    const body = $('#mass-tx-preview-body');
    if (body) body.innerHTML = '';
    const summary = $('#mass-tx-summary');
    if (summary) summary.innerHTML = '';
    if (fileInput) fileInput.value = '';
  };

  const setDropDefault = () => {
    if (!dropZone) return;
    dropZone.style.borderColor = '#D1D5DB';
    dropZone.style.background = '#FAFAFA';
  };

  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dropZone) return;
    dropZone.style.borderColor = '#1A4B8C';
    dropZone.style.background = '#EFF6FF';
  });
  dropZone?.addEventListener('dragleave', () => setDropDefault());
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    setDropDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  });

  // Re-parse when branch changes so preview reflects the new branch label
  $('#mass-tx-branch')?.addEventListener('change', () => {
    if (parsedGroups.length) {
      _massTxRenderPreview(parsedGroups);
    }
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) processFile(file);
  });

  clearBtn?.addEventListener('click', resetPreview);
  runBtn?.addEventListener('click', () => _executeMassTxImport(parsedGroups));

  async function processFile(file) {
    if (file.size > 8 * 1024 * 1024) return showToast('El archivo supera el límite de 8 MB', 'error');

    const ext = String(file.name.split('.').pop() || '').toLowerCase();
    let rawRows = [];

    try {
      if (ext === 'csv') {
        rawRows = _massTxParseCsv(await file.text());
      } else if (ext === 'xlsx' || ext === 'xls') {
        rawRows = _massTxParseExcel(await file.arrayBuffer());
      } else {
        return showToast('Formato no soportado. Usa CSV, XLSX o XLS.', 'error');
      }
    } catch (err) {
      return showToast(`Error al leer el archivo: ${err.message}`, 'error');
    }

    if (!rawRows.length) return showToast('El archivo no contiene datos', 'warning');

    // Feedback de progreso para archivos grandes
    if (rawRows.length > 100) {
      showToast(`Procesando ${rawRows.length} filas, por favor espera...`, 'info', 3000);
    }

    parsedGroups = await _massTxBuildDraft(rawRows, getSelectedBranchId(), allowedBranches);
    _massTxRenderPreview(parsedGroups);
  }
}

function _massTxNormHeader(key) {
  return String(key || '')
    .replace(/\s*\(.*?\)/g, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

function _massTxParseCsv(text) {
  const lines = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter(l => l.trim());
  if (!lines.length) return [];

  const split = (line) => {
    const fields = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (ch === ',' && !inQuotes) {
        fields.push(cur.trim());
        cur = '';
        continue;
      }
      cur += ch;
    }
    fields.push(cur.trim());
    return fields;
  };

  const headers = split(lines[0]).map(_massTxNormHeader);
  return lines.slice(1).map(line => {
    const vals = split(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = String(vals[i] ?? '').trim(); });
    return row;
  });
}

function _massTxParseExcel(arrayBuffer) {
  // cellDates:true → XLSX convierte celdas de fecha a objetos Date en vez de número serial
  const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

  // Convierte un valor de celda a string legible.
  // Las fechas (objetos Date) se formatean como YYYY-MM-DD para ser compatibles
  // con el validador de fecha de _massTxBuildDraft.
  const cellToStr = (v) => {
    if (v instanceof Date) {
      if (isNaN(v.getTime())) return '';
      const y = v.getFullYear();
      const m = String(v.getMonth() + 1).padStart(2, '0');
      const d = String(v.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(v ?? '').trim();
  };

  return rows.map(r => {
    const row = {};
    Object.entries(r).forEach(([k, v]) => {
      row[_massTxNormHeader(k)] = cellToStr(v);
    });
    return row;
  });
}

function _massTxPick(raw, keys) {
  for (const k of keys) {
    const v = raw[k];
    if (v !== undefined && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

function _massTxDocKey(v) {
  return String(v || '').replace(/[^0-9a-z]/gi, '').toUpperCase();
}

function _massTxNum(v) {
  if (v === null || v === undefined || v === '') return 0;
  let s = String(v).trim();
  if (!s) return 0;
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/,/g, '');
  } else if (s.includes(',') && !s.includes('.')) {
    s = s.replace(/,/g, '.');
  }
  s = s.replace(/[^0-9.\-]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

async function _massTxBuildDraft(rawRows, fallbackBranchId = null, knownBranches = []) {
  const [accounts, txTypes, terceros] = await Promise.all([
    API.getAccounts(true),
    API.getTxTypes(),
    API.getTerceros({}),
  ]);

  // Índice de sucursales por código (para resolver columna 'sucursal' del archivo)
  const branchByCode = new Map();
  (knownBranches as any[]).forEach(b => {
    if (b.code) branchByCode.set(String(b.code).trim().toUpperCase(), b.id);
    branchByCode.set(String(b.id).trim(), b.id); // también por ID directo
  });

  const parentCodes = new Set(accounts.map(a => a.parent_code).filter(Boolean));
  const postableIds = new Set(accounts.filter(a => !parentCodes.has(a.code)).map(a => a.id));
  const accByCode = new Map(accounts.map(a => [String(a.code || '').trim(), a]));

  const txTypeByKey = new Map();
  txTypes.forEach(t => {
    txTypeByKey.set(String(t.prefix || '').toUpperCase(), t);
    txTypeByKey.set(String(t.code || '').toUpperCase(), t);
    txTypeByKey.set(String(t.id || '').toUpperCase(), t);
  });

  const thirdByDoc = new Map();
  terceros.forEach(t => {
    const key = _massTxDocKey(t.doc_number);
    if (key) thirdByDoc.set(key, t);
  });

  const groups = new Map();
  const upsertHdr = (g, field, val, label, rowNo) => {
    if (!val) return;
    if (!g[field]) {
      g[field] = val;
      return;
    }
    if (g[field] !== val) {
      g.errors.push(`Fila ${rowNo}: valor inconsistente en ${label} ("${g[field]}" vs "${val}")`);
    }
  };

  for (let i = 0; i < rawRows.length; i++) {
    const raw = rawRows[i] || {};
    const rowNo = i + 2;
    const group = _massTxPick(raw, ['grupo', 'tx_group', 'comprobante', 'grupo_tx']);
    if (!group) continue;

    if (!groups.has(group)) {
      groups.set(group, {
        group,
        txDate: '',
        txDesc: '',
        thirdDoc: '',
        paymentDays: '0',
        branchCode: '',   // código/id de sucursal leído del archivo
        lines: [],
        errors: [],
      });
    }

    const g = groups.get(group);
    upsertHdr(g, 'txDate',      _massTxPick(raw, ['fecha', 'date', 'tx_date']),                                   'fecha',       rowNo);
    upsertHdr(g, 'txDesc',      _massTxPick(raw, ['descripcion', 'description', 'detalle']),                      'descripcion', rowNo);
    upsertHdr(g, 'paymentDays', _massTxPick(raw, ['plazo_dias', 'payment_days', 'dias_pago']),                    'plazo_dias',  rowNo);
    upsertHdr(g, 'branchCode',  _massTxPick(raw, ['sucursal', 'branch', 'branch_code', 'sucursal_codigo']),       'sucursal',    rowNo);

    // Tercero de cabecera: se toma el PRIMER valor no vacío del grupo.
    // Si filas posteriores tienen un tercero diferente NO se trata como error:
    // en saldos iniciales y comprobantes multi-tercero es normal que cada línea
    // tenga su propio tercero. El valor diferente se usará como tercero_linea.
    const rowTerceroHdr = _massTxPick(raw, ['tercero', 'tercero_doc', 'nit_tercero', 'doc_tercero']);
    if (rowTerceroHdr && !g.thirdDoc) {
      g.thirdDoc = rowTerceroHdr; // Primer valor define el tercero de cabecera
    }

    const accountCode    = _massTxPick(raw, ['cuenta', 'account', 'codigo_cuenta', 'account_code']);
    const debit          = _massTxNum(_massTxPick(raw, ['debito', 'debit']));
    const credit         = _massTxNum(_massTxPick(raw, ['credito', 'credit']));
    // Si hay tercero_linea explícito, usarlo; si no, usar el tercero de la fila
    // (cuando difiere del de cabecera, cada línea tiene su propio tercero)
    const explicitLineThird = _massTxPick(raw, ['tercero_linea', 'line_third', 'tercero_line']);
    const lineThirdDoc   = explicitLineThird
      || (rowTerceroHdr && rowTerceroHdr !== g.thirdDoc ? rowTerceroHdr : '');
    const lineDesc       = _massTxPick(raw, ['descripcion_linea', 'line_description', 'detalle_linea']);
    const crossDoc       = _massTxPick(raw, ['doc_cruce', 'cross_doc_ref', 'documento_cruce']);
    const crossDocDate   = _massTxPick(raw, ['fecha_doc_cruce', 'fecha_cruce', 'fecha_origen', 'fecha_factura_cruce', 'cross_doc_date']);
    const lineDueDate    = _massTxPick(raw, ['fecha_vencimiento', 'due_date', 'vencimiento', 'fecha_vencimiento_cruce']);

    g.lines.push({
      rowNo,
      accountCode,
      debit,
      credit,
      lineThirdDoc,
      lineDesc,
      crossDoc,
      crossDocDate,
      lineDueDate
    });
  }

  const periodCache = new Map();
  const result = [];
  const seenNumbers = new Set();

  for (const g of groups.values()) {
    const groupErrors = [...g.errors];

    // ── Resolución de Tipo de Transacción y Consecutivo por la Serie del Grupo ──
    const groupStr = String(g.group || '').trim();

    // Intentamos separar prefijo y número del grupo (ej: "RC-001" -> "RC" y "001")
    const parts = groupStr.split(/[-_\s]+/);
    let groupPrefix = '';
    let groupNumberStr = '';

    if (parts.length > 1) {
      groupPrefix = parts[0].toUpperCase();
      groupNumberStr = parts.slice(1).join('-');
    } else {
      // Intentar separar letras seguidas de dígitos (ej: "CD100" -> "CD" y "100")
      const matchLettersDigits = groupStr.match(/^([A-Za-z]+)(\d+)$/);
      if (matchLettersDigits) {
        groupPrefix = matchLettersDigits[1].toUpperCase();
        groupNumberStr = matchLettersDigits[2];
      } else {
        groupNumberStr = groupStr;
      }
    }

    // Buscar el tipo de transacción correspondiente a la serie (prefijo del grupo)
    let txType = null;
    if (groupPrefix) {
      txType = txTypeByKey.get(groupPrefix);
    }
    
    // Si no se resolvió por prefijo, probar con el grupo completo
    if (!txType && groupStr) {
      txType = txTypeByKey.get(groupStr.toUpperCase());
    }

    if (!g.txDate) groupErrors.push('Falta fecha del comprobante');
    if (!txType) {
      groupErrors.push(`Serie / Tipo de transacción no encontrado para: "${groupPrefix || groupStr}". Asegúrate de que el nombre del grupo inicie con la serie correspondiente (ej: RC-001, CE-102).`);
    }
    if (!g.txDesc) groupErrors.push('Falta descripción del comprobante');

    // Construir el número final formateado si tenemos el tipo de transacción
    let resolvedNumber = '';
    if (txType) {
      const prefix = String(txType.prefix || txType.code || 'TX').toUpperCase();
      
      // Buscar dígitos numéricos en la parte del número o en todo el grupo
      let numMatch = groupNumberStr.match(/\d+/);
      if (!numMatch && parts.length > 1) {
        numMatch = groupStr.match(/\d+/);
      }

      if (numMatch) {
        const numVal = parseInt(numMatch[0], 10);
        const paddedNum = String(numVal).padStart(8, '0');
        resolvedNumber = `${prefix}-${paddedNum}`;
      } else {
        // Sin parte numérica, usar el grupo tal cual o prefijarlo
        if (groupStr.toUpperCase().startsWith(prefix)) {
          resolvedNumber = groupStr;
        } else {
          resolvedNumber = `${prefix}-${groupStr}`;
        }
      }
    } else {
      resolvedNumber = groupStr;
    }

    // Validar duplicados de número en el mismo archivo
    if (resolvedNumber && txType) {
      if (seenNumbers.has(resolvedNumber)) {
        groupErrors.push(`Número de comprobante duplicado en el archivo: ${resolvedNumber}`);
      } else {
        seenNumbers.add(resolvedNumber);
      }
    }

    let txThird = null;
    if (g.thirdDoc) {
      txThird = thirdByDoc.get(_massTxDocKey(g.thirdDoc));
      if (!txThird) groupErrors.push(`Tercero no encontrado (encabezado): ${g.thirdDoc}`);
    }

    if (g.txDate) {
      const periodKey = g.txDate.slice(0, 7);
      if (!periodCache.has(periodKey)) {
        let isClosed = false;
        if (typeof isPeriodClosed === 'function') {
          isClosed = await isPeriodClosed(g.txDate);
        }
        periodCache.set(periodKey, isClosed);
      }
      if (periodCache.get(periodKey)) {
        groupErrors.push(`El período ${periodKey} no está habilitado o está cerrado`);
      }
    }

    const validLines = [];
    for (const line of g.lines) {
      const acc = accByCode.get(String(line.accountCode || '').trim());
      if (!line.accountCode) {
        groupErrors.push(`Fila ${line.rowNo}: falta cuenta`);
        continue;
      }
      if (!acc) {
        groupErrors.push(`Fila ${line.rowNo}: cuenta no encontrada (${line.accountCode})`);
        continue;
      }
      if (!postableIds.has(acc.id)) {
        groupErrors.push(`Fila ${line.rowNo}: la cuenta ${acc.code} es de mayor; usa una cuenta auxiliar`);
      }

      const hasDebit = Number(line.debit || 0) > 0;
      const hasCredit = Number(line.credit || 0) > 0;
      if (hasDebit && hasCredit) {
        groupErrors.push(`Fila ${line.rowNo}: no puede tener débito y crédito al mismo tiempo`);
      }
      if (!hasDebit && !hasCredit) {
        groupErrors.push(`Fila ${line.rowNo}: debes registrar débito o crédito`);
      }

      let lineThird = null;
      if (line.lineThirdDoc) {
        lineThird = thirdByDoc.get(_massTxDocKey(line.lineThirdDoc));
        if (!lineThird) {
          groupErrors.push(`Fila ${line.rowNo}: tercero de línea no encontrado (${line.lineThirdDoc})`);
        }
      }

      if (acc.requires_third_party && !(lineThird?.id || txThird?.id)) {
        groupErrors.push(`Fila ${line.rowNo}: la cuenta ${acc.code} requiere tercero`);
      }

      if (line.crossDocDate && !/^\d{4}-\d{2}-\d{2}$/.test(line.crossDocDate)) {
        groupErrors.push(`Fila ${line.rowNo}: fecha_doc_cruce inválida ("${line.crossDocDate}"). Formato esperado: YYYY-MM-DD`);
      }
      if (line.lineDueDate && !/^\d{4}-\d{2}-\d{2}$/.test(line.lineDueDate)) {
        groupErrors.push(`Fila ${line.rowNo}: fecha_vencimiento inválida ("${line.lineDueDate}"). Formato esperado: YYYY-MM-DD`);
      }

      let computedDueDate = line.lineDueDate || '';
      if (!computedDueDate && line.crossDocDate && g.paymentDays) {
        computedDueDate = _addDaysStr(line.crossDocDate, Number(g.paymentDays || 0));
      }

      validLines.push({
        rowNo: line.rowNo,
        account_id: acc.id,
        debit: Number(line.debit || 0),
        credit: Number(line.credit || 0),
        third_party_id: lineThird?.id || txThird?.id || null,
        description: line.lineDesc || g.txDesc,
        cross_doc_ref: line.crossDoc || '',
        cross_doc_date: line.crossDocDate || '',
        due_date: computedDueDate || '',
      });
    }

    const totals = validLines.reduce((acc, l) => {
      acc.debit += Number(l.debit || 0);
      acc.credit += Number(l.credit || 0);
      return acc;
    }, { debit: 0, credit: 0 });

    if (validLines.length < 2) groupErrors.push('Se requieren al menos 2 líneas contables válidas');
    if (Math.abs(totals.debit - totals.credit) > 0.0001 || totals.debit <= 0) {
      groupErrors.push('Comprobante descuadrado: débito y crédito no coinciden');
    }

    // ── Resolver sucursal del grupo ──────────────────────────
    let resolvedBranchId: string | null = null;
    if (g.branchCode) {
      resolvedBranchId = branchByCode.get(String(g.branchCode).trim().toUpperCase())
        || branchByCode.get(String(g.branchCode).trim())
        || null;
      if (!resolvedBranchId) {
        groupErrors.push(`Sucursal no encontrada en el sistema: "${g.branchCode}". Se usará la sucursal del selector.`);
        resolvedBranchId = fallbackBranchId;
      }
    } else {
      resolvedBranchId = fallbackBranchId;
    }

    // Etiqueta visible de sucursal para la vista previa
    const branchLabel = resolvedBranchId
      ? ((knownBranches as any[]).find(b => b.id === resolvedBranchId)?.name || resolvedBranchId)
      : '—';

    result.push({
      group: g.group,
      resolvedNumber,
      txDate: g.txDate,
      txTypeLabel: txType ? `${txType.prefix} - ${txType.name}` : '—',
      branchLabel,
      linesCount: validLines.length,
      debit: totals.debit,
      credit: totals.credit,
      ok: groupErrors.length === 0,
      errors: groupErrors,
      payload: groupErrors.length ? null : {
        txData: {
          tx_type_id: txType.id,
          number: resolvedNumber,
          date: g.txDate,
          description: g.txDesc,
          third_party_id: txThird?.id || null,
          user_id: pb.currentUser?.id,
          payment_days: parseInt(g.paymentDays, 10) || 0,
          cross_enabled: validLines.some(l => !!l.cross_doc_ref),
          status: 'active',
          branch_id: resolvedBranchId || null,
        },
        lines: validLines.map((l, i) => ({
          account_id: l.account_id,
          third_party_id: l.third_party_id,
          debit: l.debit,
          credit: l.credit,
          description: l.description,
          line_order: i + 1,
          cross_doc_ref: l.cross_doc_ref,
          cross_doc_date: l.cross_doc_date || null,
          due_date: l.due_date || null,
          branch_id: resolvedBranchId || null,
        })),
      },
    });
  }

  // Orden estable para facilitar revisión visual
  return result.sort((a, b) => String(a.group).localeCompare(String(b.group)));
}

function _massTxRenderPreview(groups) {
  const preview = $('#mass-tx-preview');
  const tbody = $('#mass-tx-preview-body');
  const summary = $('#mass-tx-summary');
  const runBtn = $('#btn-mass-tx-run');
  if (!preview || !tbody || !summary || !runBtn) return;

  // Etiqueta de sucursal actualmente seleccionada en el selector del modal
  const branchSel = $('#mass-tx-branch') as HTMLSelectElement;
  const selectedBranchLabel = branchSel
    ? (branchSel.options[branchSel.selectedIndex]?.text || '—')
    : '—';

  const okGroups  = groups.filter(g => g.ok);
  const badGroups = groups.filter(g => !g.ok);
  const totalLines = groups.reduce((s, g) => s + (g.linesCount || 0), 0);
  const bigVoucher = okGroups.some(g => (g.linesCount || 0) > 50);

  tbody.innerHTML = groups.map(g => {
    const detail = g.ok ? 'Validado' : (g.errors[0] || 'Error de validación');
    const branchDisplay = g.branchLabel || selectedBranchLabel;
    // Badge extra para comprobantes con muchas líneas
    const linesBadge = g.ok && g.linesCount > 50
      ? `<span title="Comprobante con muchas líneas — se procesará con modo atómico" style="margin-left:4px;background:#FEF3C7;color:#92400E;border-radius:4px;padding:1px 5px;font-size:.65rem;font-weight:600">⚡ ${g.linesCount} lín.</span>`
      : '';
    return `
      <tr ${g.ok ? '' : 'style="background:#FFF7F7"'}>
        <td><strong class="font-mono" style="color:#0D2137">${esc(g.resolvedNumber)}</strong><br><span class="text-gray-400" style="font-size:10px">${esc(g.group)}</span></td>
        <td>${esc(g.txDate || '—')}</td>
        <td>${esc(g.txTypeLabel || '—')}</td>
        <td>${esc(branchDisplay)}</td>
        <td>${g.linesCount}${linesBadge}</td>
        <td>${fmt(g.debit)}</td>
        <td>${fmt(g.credit)}</td>
        <td>${g.ok
          ? '<span class="badge badge-green">OK</span>'
          : '<span class="badge badge-red">Error</span>'}</td>
        <td class="text-xs" style="max-width:360px;white-space:normal">${esc(detail)}</td>
      </tr>`;
  }).join('');

  // Aviso de comprobante grande (saldos iniciales)
  const bigWarning = bigVoucher
    ? `<div class="rounded-lg px-3 py-2 mt-2 text-xs flex items-center gap-2" style="background:#FFFBEB;border:1px solid #FDE68A;color:#92400E">
        <i class="fas fa-bolt" style="color:#D97706"></i>
        <span>Uno o más comprobantes tienen <strong>más de 50 líneas</strong>. Se usará el modo de importación atómico (1 sola petición al servidor) para garantizar la integridad.</span>
       </div>`
    : '';

  summary.innerHTML = `
    <div style="color:${badGroups.length ? '#B91C1C' : '#166534'}">
      ${groups.length} comprobante(s) · ${totalLines} líneas contables totales:<br>
      <strong>${okGroups.length}</strong> válido(s)${badGroups.length ? `, <strong>${badGroups.length}</strong> con error (serán omitidos)` : ''}.
      ${!badGroups.length ? '<strong>Listo para ejecutar.</strong>' : ''}
    </div>
    ${bigWarning}`;

  preview.classList.remove('hidden');
  if (okGroups.length) runBtn.classList.remove('hidden');
  else runBtn.classList.add('hidden');
}

async function _executeMassTxImport(groups) {
  if (_massTxImportInProgress) return;
  if (!Array.isArray(groups) || !groups.length) return;

  const valids = groups.filter(g => g.ok && g.payload);
  if (!valids.length) return showToast('No hay comprobantes válidos para importar', 'warning');

  _massTxImportInProgress = true;

  const runBtn = $('#btn-mass-tx-run');
  const progressWrap = $('#mass-tx-progress-wrap');
  const progressBar = $('#mass-tx-progress-bar');
  const progressText = $('#mass-tx-progress-text');
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Importando...';
  }
  progressWrap?.classList.remove('hidden');

  let created = 0;
  let failed = 0;
  const failedGroups = [];

  try {
    for (let i = 0; i < valids.length; i++) {
      const draft = valids[i];
      const pct = ((i / valids.length) * 100);
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `Procesando ${i + 1} de ${valids.length}: ${draft.group}`;

      try {
        await API.createTransaction(draft.payload.txData, draft.payload.lines);
        created++;
      } catch (err) {
        failed++;
        failedGroups.push(`${draft.group}: ${err.message}`);
      }
    }

    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.textContent = 'Proceso finalizado';

    await API.logAudit(
      'IMPORT',
      'transactions',
      'bulk',
      `Carga masiva: ${created} creadas, ${failed} con error de ${valids.length} comprobantes válidos`
    );

    if (failedGroups.length) {
      console.warn('[CargaMasivaTx] Errores:', failedGroups);
    }

    showToast(
      `Carga masiva finalizada: ${created} comprobante(s) creados${failed ? `, ${failed} con error` : ''}`,
      failed ? 'warning' : 'success',
      5500
    );

    _loadSysInfo();
  } finally {
    _massTxImportInProgress = false;
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar carga';
    }
  }
}

/* ══════════════════════════════════════════════════════════
   CARGA MASIVA DE TERCEROS
══════════════════════════════════════════════════════════ */
function _downloadMassTpTemplate() {
  const headers = [
    'doc_type', 'doc_number', 'person_type', 'type', 'razon_social',
    'nombres', 'apellidos', 'commercial_name', 'email', 'email2',
    'phone', 'phone2', 'contact_name', 'contact_phone', 'advisor',
    'address', 'country', 'dept_code', 'city_code', 'tax_regime',
    'credit_limit', 'max_invoices', 'payment_days', 'active', 'ciiu',
    'gc', 'gcm', 'ar', 'ei', 'rf', 'prf',
    'pi', 'piv', 'responsabilidades', 'is_retention_agent', 'bank_name',
    'bank_account', 'notes'
  ];

  const rows = [
    {
      doc_type: 'NIT', doc_number: '900123456', person_type: 'JURIDICA', type: 'CLIENTE',
      razon_social: 'CERAMICAS CONSTRUHOGAR SAS', nombres: '', apellidos: '',
      commercial_name: 'CONSTRUHOGAR', email: 'construhogar@correo.com', email2: 'facturas@construhogar.com',
      phone: '6076330000', phone2: '3001234567', contact_name: 'CARLOS ORTIZ', contact_phone: '3001234567',
      advisor: 'JULIAN PEREZ', address: 'CR 8 73-25', country: 'CO', dept_code: '68',
      city_code: '68001', tax_regime: 'RESP_IVA', credit_limit: 5000000, max_invoices: 3,
      payment_days: 30, active: 'Si', ciiu: '4752', gc: 'No', gcm: 'No', ar: 'No',
      ei: 'No', rf: 'NO', prf: 0, pi: 0, piv: 0, responsabilidades: '05;13;15;48;52',
      is_retention_agent: 'Si', bank_name: 'BANCO BOGOTA', bank_account: '123456789', notes: 'Cliente corporativo'
    },
    {
      doc_type: 'CC', doc_number: '1234567890', person_type: 'NATURAL', type: 'PROVEEDOR',
      razon_social: '', nombres: 'JUAN CARLOS', apellidos: 'PEREZ GOMEZ',
      commercial_name: '', email: 'juan.perez@correo.com', email2: '',
      phone: '3109876543', phone2: '', contact_name: '', contact_phone: '',
      advisor: '', address: 'CL 45 12-30', country: 'CO', dept_code: '05',
      city_code: '05001', tax_regime: 'NO_RESP', credit_limit: 0, max_invoices: 1,
      payment_days: 0, active: 'Si', ciiu: '4711', gc: 'No', gcm: 'No', ar: 'No',
      ei: 'No', rf: 'NO', prf: 0, pi: 0, piv: 0, responsabilidades: '49',
      is_retention_agent: 'No', bank_name: '', bank_account: '', notes: 'Proveedor insumos locales'
    }
  ];

  const indications: Array<[string, string, string, string, string]> = [
    ['doc_type', 'SÍ', 'Código Tipo Doc', 'Tipo de documento fiscal de identificación. Valores permitidos:\n- NIT: Número de Identificación Tributaria (Persona Jurídica o Natural con NIT)\n- CC: Cédula de Ciudadanía\n- CE: Cédula de Extranjería\n- TI: Tarjeta de Identidad\n- PAS: Pasaporte\n- RC: Registro Civil\n- NITPE: NIT Persona Extranjera (DIAN)', 'NIT'],
    ['doc_number', 'SÍ', 'Texto / Numérico', 'Número de identificación sin puntos, espacios, guiones ni dígito de verificación. El sistema calcula automáticamente el DV para los NITs.', '900123456'],
    ['person_type', 'SÍ', 'Texto (NATURAL / JURIDICA)', 'Tipo de persona legal ante la DIAN. Valores permitidos: NATURAL o JURIDICA.', 'JURIDICA'],
    ['type', 'SÍ', 'Texto (Rol)', 'Rol funcional principal del tercero. Valores permitidos: CLIENTE, PROVEEDOR, EMPLEADO, PROPIETARIO, OTRO.', 'CLIENTE'],
    ['razon_social', 'SÍ (si JURIDICA)', 'Texto Libre', 'Razón social completa para personas jurídicas (empresa/organización).', 'CERAMICAS CONSTRUHOGAR SAS'],
    ['nombres', 'SÍ (si NATURAL)', 'Texto Libre', 'Nombres de la persona natural.', 'JUAN CARLOS'],
    ['apellidos', 'SÍ (si NATURAL)', 'Texto Libre', 'Apellidos de la persona natural.', 'PEREZ GOMEZ'],
    ['tax_regime', 'NO', 'Código Régimen', 'Condición tributaria / Régimen del IVA DIAN. Valores permitidos:\n- RESP_IVA: Responsable de IVA (Régimen Común)\n- NO_RESP: No Responsable de IVA (Simplificado)\n- SIMPLE: Régimen Simple de Tributación (RST)\n- GRAN_CONTR: Gran Contribuyente', 'RESP_IVA'],
    ['responsabilidades', 'NO', 'Códigos separados por ; o ,', 'Códigos de responsabilidades fiscales DIAN asignadas en el RUT. Códigos habituales:\n05: Renta Ordinario | 07: Retefuente Renta | 09: ReteIVA | 13: Gran Contribuyente | 14: Informante Exógena | 15: Autorretenedor | 23: Agente Retención IVA | 47: Régimen Simple (RST) | 48: Responsable de IVA | 49: No Responsable de IVA | 52: Facturador Electrónico', '05;13;15;48;52'],
    ['dept_code', 'NO', 'Código DANE Dpto (2 dígitos)', 'Código DANE del Departamento colombiano. Ejemplos:\n11: Bogotá D.C. | 05: Antioquia | 08: Atlántico | 13: Bolívar | 15: Boyacá | 17: Caldas | 25: Cundinamarca | 54: Norte de Santander | 66: Risaralda | 68: Santander | 73: Tolima | 76: Valle del Cauca', '68'],
    ['city_code', 'NO', 'Código DANE Municipio (5 dígitos)', 'Código DANE del Municipio colombiano. Ejemplos:\n11001: Bogotá D.C. | 05001: Medellín | 08001: Barranquilla | 13001: Cartagena | 15001: Tunja | 17001: Manizales | 25175: Chía | 54001: Cúcuta | 66001: Pereira | 68001: Bucaramanga | 73001: Ibagué | 76001: Cali', '68001'],
    ['email', 'NO', 'Correo Electrónico', 'Correo electrónico principal para envío de facturas electrónicas y notificaciones.', 'contacto@empresa.com'],
    ['ciiu', 'NO', 'Código Numérico (4 dígitos)', 'Código de actividad económica principal CIIU v4 A.C. según RUT.', '4752'],
    ['credit_limit', 'NO', 'Número Positivo', 'Límite de crédito comercial autorizado en pesos COP.', '5000000'],
    ['payment_days', 'NO', 'Número de Días', 'Días de plazo por defecto para condiciones de pago.', '30'],
    ['active', 'NO', 'Texto (Si / No)', 'Estado del tercero. Valores: Si o No (Si omitido, asume Si).', 'Si']
  ];

  _generateTemplateXlsx({
    filename: 'plantilla_carga_terceros',
    sheetName: 'Plantilla de Terceros',
    headers,
    rows,
    indications
  });
}

async function _openMassTpImportModal() {
  if (!can('canWrite')) return showToast('No tienes permisos para importar terceros', 'error');

  openModal(
    '<i class="fas fa-users mr-2" style="color:#1D4ED8"></i>Carga masiva de terceros',
    `
    <div class="mb-2">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx/.xls)</strong> con los terceros a registrar.
        Si el documento ya existe, el tercero será <strong>actualizado</strong>; si no existe, será <strong>creado</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#EFF6FF;border:1px solid #BFDBFE;max-height:220px;overflow-y:auto">
        <p class="text-xs font-semibold mb-1" style="color:#1D4ED8;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-2 mb-2">
          ${['doc_type','doc_number','person_type','type'].map(c => `<code class="text-xs px-2 py-0.5 rounded font-mono" style="background:#DBEAFE;color:#1E40AF">${c}</code>`).join('')}
        </div>
        <p class="text-xs font-semibold mb-1" style="color:#4B5563;text-transform:uppercase;letter-spacing:.05em">Columnas opcionales</p>
        <div class="flex flex-wrap gap-1.5 mb-2">
          ${['razon_social','nombres','apellidos','commercial_name','email','email2','phone','phone2','contact_name','contact_phone','advisor','address','country','dept_code','city_code','tax_regime','credit_limit','max_invoices','payment_days','active','ciiu','gc','gcm','ar','ei','rf','prf','pi','piv','responsabilidades','is_retention_agent','bank_name','bank_account','notes'].map(c => `<code class="text-[10px] px-1.5 py-0.5 rounded font-mono" style="background:#F3F4F6;color:#4B5563">${c}</code>`).join('')}
        </div>
        <p class="text-xs" style="color:#1E40AF">
          <strong>doc_type</strong>: NIT, CC, CE, TI, PAS, RC.&nbsp;
          <strong>person_type</strong>: NATURAL, JURIDICA.&nbsp;
          <strong>type</strong>: CLIENTE, PROVEEDOR, EMPLEADO, PROPIETARIO, OTRO.&nbsp;
          <strong>tax_regime</strong>: COMUN, SIMPLIFICADO, NO_RESP, GRAN_CONTR.
        </p>
      </div>

      <div id="mass-tp-drop-zone" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#1A4B8C;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 8 MB</p>
        <input type="file" id="mass-tp-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>

      <div id="mass-tp-progress-wrap" class="hidden mt-4">
        <div class="w-full rounded-full h-2" style="background:#E5E7EB">
          <div id="mass-tp-progress-bar" class="h-2 rounded-full transition-all" style="background:linear-gradient(90deg,#1D4ED8,#7C3AED);width:0%"></div>
        </div>
        <p id="mass-tp-progress-text" class="text-xs mt-2" style="color:#6B7280">Preparando...</p>
      </div>

      <div id="mass-tp-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa</p>
          <button class="btn btn-outline btn-sm" id="btn-mass-tp-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:320px;overflow-y:auto">
          <table class="data-table text-xs" id="mass-tp-preview-table">
            <thead><tr>
              <th>#</th><th>Doc</th><th>Nombre / Razón Social</th><th>Tipo Persona</th><th>Rol</th><th>Email</th><th>Estado</th><th>Detalle</th>
            </tr></thead>
            <tbody id="mass-tp-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-tp-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-tp-run"><i class="fas fa-bolt mr-1"></i>Ejecutar carga</button>`,
    true
  );

  let parsedRows = [];

  const dropZone = $('#mass-tp-drop-zone');
  const fileInput = $('#mass-tp-file-input');
  const runBtn = $('#btn-mass-tp-run');
  const clearBtn = $('#btn-mass-tp-clear');

  const resetPreview = () => {
    parsedRows = [];
    $('#mass-tp-preview')?.classList.add('hidden');
    runBtn?.classList.add('hidden');
    const body = $('#mass-tp-preview-body');
    if (body) body.innerHTML = '';
    const summary = $('#mass-tp-summary');
    if (summary) summary.innerHTML = '';
    if (fileInput) fileInput.value = '';
  };

  const dropDefault = () => {
    if (!dropZone) return;
    dropZone.style.borderColor = '#D1D5DB';
    dropZone.style.background = '#FAFAFA';
  };

  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dropZone) return;
    dropZone.style.borderColor = '#1D4ED8';
    dropZone.style.background = '#EFF6FF';
  });
  dropZone?.addEventListener('dragleave', () => dropDefault());
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    dropDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  });
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) processFile(file);
  });
  clearBtn?.addEventListener('click', resetPreview);
  runBtn?.addEventListener('click', () => _executeMassTpImport(parsedRows));

  async function processFile(file) {
    if (file.size > 8 * 1024 * 1024) return showToast('El archivo supera el límite de 8 MB', 'error');
    const ext = String(file.name.split('.').pop() || '').toLowerCase();
    let rawRows = [];
    try {
      if (ext === 'csv') {
        rawRows = _massTxParseCsv(await file.text());
      } else if (ext === 'xlsx' || ext === 'xls') {
        rawRows = _massTxParseExcel(await file.arrayBuffer());
      } else {
        return showToast('Formato no soportado. Usa CSV, XLSX o XLS.', 'error');
      }
    } catch (err) {
      return showToast(`Error al leer el archivo: ${err.message}`, 'error');
    }
    if (!rawRows.length) return showToast('El archivo no contiene datos', 'warning');
    parsedRows = _massTpBuildDraft(rawRows);
    _massTpRenderPreview(parsedRows);
  }
}

/* Normaliza una fila a un draft de tercero { ok, payload, error, rowNo } */
function _massTpBuildDraft(rawRows) {
  const VALID_DOC_TYPES    = new Set(['NIT','NITPE','CC','CE','TI','PAS','RC']);
  const VALID_PERSON_TYPES = new Set(['NATURAL','JURIDICA']);
  const VALID_TP_TYPES     = new Set(['CLIENTE','PROVEEDOR','EMPLEADO','PROPIETARIO','OTRO']);

  return rawRows.map((raw, i) => {
    const rowNo = i + 2; // +2 porque fila 1 es cabecera
    const get = (...keys) => {
      for (const k of keys) {
        const v = raw[_massTxNormHeader(k)];
        if (v !== undefined && String(v).trim() !== '') return String(v).trim();
      }
      return '';
    };

    const parseBool = (val, defaultVal = false) => {
      if (!val) return defaultVal;
      return !/^(no|0|false|inactivo|inactiva)$/i.test(val);
    };

    const docType    = get('doc_type','tipo_doc','tipo_documento').toUpperCase();
    const docNumber  = get('doc_number','numero_doc','nit','documento','doc').replace(/[^0-9a-zA-Z]/g, '');
    const personType = get('person_type','tipo_persona','persona').toUpperCase() || 'NATURAL';
    let tpType       = get('type','tipo','rol').toUpperCase() || 'CLIENTE';
    if (tpType === 'ACREEDOR' || tpType === 'TRANSPORTISTA') tpType = 'PROVEEDOR';
    if (tpType === 'VENDEDOR') tpType = 'EMPLEADO';

    // Nombre
    const bizName   = get('razon_social','business_name','razon').toUpperCase();
    const firstName = get('nombres','first_name','nombre').toUpperCase();
    const lastName  = get('apellidos','last_name','apellido').toUpperCase();
    const isNatural = personType === 'NATURAL';
    const name = isNatural
      ? [firstName, lastName].filter(Boolean).join(' ')
      : bizName;

    // Opcionales
    const comName      = get('commercial_name', 'nombre_comercial', 'marca').toUpperCase();
    const email        = get('email','correo');
    const email2       = get('email2', 'correo2');
    const phone        = get('phone','telefono','tel');
    const phone2       = get('phone2', 'telefono2', 'celular2');
    const contactName  = get('contact_name', 'contacto', 'nombre_contacto');
    const contactPhone = get('contact_phone', 'telefono_contacto', 'tel_contacto');
    const advisorRaw   = get('advisor', 'asesor', 'vendedor');
    const address      = get('address','direccion').toUpperCase();
    const deptCode     = get('dept_code','cod_dept','departamento_cod');
    const cityCode     = get('city_code','cod_mun','municipio_cod','ciudad_cod');
    const country      = get('country', 'pais') || (deptCode ? 'CO' : '');
    const taxRegimeRaw = get('tax_regime','regimen','tax').toUpperCase();
    let taxRegime      = '';
    if (taxRegimeRaw === 'RESP_IVA' || taxRegimeRaw === 'COMUN' || taxRegimeRaw === 'RESPONSABLE' || taxRegimeRaw === 'RESPONSABLE_IVA') {
      taxRegime = 'COMUN';
    } else if (taxRegimeRaw === 'SIMPLE' || taxRegimeRaw === 'SIMPLIFICADO' || taxRegimeRaw === 'REGIMEN_SIMPLE') {
      taxRegime = 'SIMPLIFICADO';
    } else if (taxRegimeRaw === 'NO_RESP' || taxRegimeRaw === 'NO_RESPONSABLE' || taxRegimeRaw === 'NO_RESPONSABLE_IVA') {
      taxRegime = 'NO_RESP';
    } else if (taxRegimeRaw === 'GRAN_CONTR' || taxRegimeRaw === 'GRAN_CONTRIBUYENTE') {
      taxRegime = 'GRAN_CONTR';
    }
    const creditLimit  = parseFloat(get('credit_limit','cupo_credito','cupo').replace(/[^0-9.]/g, '')) || 0;
    const maxInvoices  = parseInt(get('max_invoices', 'max_facturas', 'facturas_maximas'), 10) || 1;
    const payDays      = parseInt(get('payment_days','plazo_dias','plazo'), 10) || 0;
    const active       = parseBool(get('active','activo','estado'), true);
    const ciiu         = get('ciiu', 'actividad_economica', 'actividad');
    const gc           = parseBool(get('gc', 'gran_contribuyente'), false);
    const gcm          = parseBool(get('gcm', 'gran_contribuyente_municipal', 'gc_muni'), false);
    const ar           = parseBool(get('ar', 'autorretenedor'), false);
    const ei           = parseBool(get('ei', 'exento_iva', 'exento'), false);
    const rf           = get('rf', 'agente_retencion', 'retencion').toUpperCase() || 'NO';
    const prf          = parseFloat(get('prf', 'tarifa_retefuente', 'retefuente')) || 0;
    const pi           = parseFloat(get('pi', 'tarifa_reteica', 'reteica')) || 0;
    const piv          = parseFloat(get('piv', 'tarifa_reteiva', 'reteiva')) || 0;
    const respStr      = get('responsabilidades', 'resp', 'responsabilidades_fiscales');
    const resp         = respStr ? respStr.split(/[;,]/).map(x => x.trim().toUpperCase()).filter(Boolean) : [];
    const isRetentionAgent = parseBool(get('is_retention_agent', 'agente_retencion_fuente'), false);
    const bankName     = get('bank_name', 'banco');
    const bankAccount  = get('bank_account', 'cuenta_bancaria', 'cuenta');
    const notes        = get('notes', 'notas', 'observaciones');

    // Sincronizar gc y tax_regime con responsabilidades
    const isGc = resp.includes('13') || resp.includes('O-13') || gc;
    let finalTaxRegime = taxRegime;
    if (resp.length > 0) {
      if (resp.includes('13') || resp.includes('O-13')) {
        finalTaxRegime = 'GRAN_CONTR';
      } else if (resp.includes('47') || resp.includes('O-47')) {
        finalTaxRegime = 'SIMPLIFICADO';
      } else if (resp.includes('48')) {
        finalTaxRegime = 'COMUN';
      } else if (resp.includes('49') || resp.includes('53')) {
        finalTaxRegime = 'NO_RESP';
      }
    } else {
      // Por defecto, si es jurídica asumimos responsable (COMUN)
      if (!finalTaxRegime) {
        finalTaxRegime = personType === 'JURIDICA' ? 'COMUN' : 'NO_RESP';
      }
    }

    // Dígito de verificación
    const dv = docType === 'NIT' ? calcDV(docNumber) : '';

    // Validaciones
    if (!docType)   return { ok: false, rowNo, error: `Fila ${rowNo}: falta doc_type` };
    if (!VALID_DOC_TYPES.has(docType))
      return { ok: false, rowNo, error: `Fila ${rowNo}: doc_type inválido (${docType})` };
    if (!docNumber) return { ok: false, rowNo, error: `Fila ${rowNo}: falta doc_number` };
    if (!VALID_PERSON_TYPES.has(personType))
      return { ok: false, rowNo, error: `Fila ${rowNo}: person_type inválido (${personType})` };
    if (!VALID_TP_TYPES.has(tpType))
      return { ok: false, rowNo, error: `Fila ${rowNo}: type inválido (${tpType})` };
    if (isNatural && !firstName && !lastName)
      return { ok: false, rowNo, error: `Fila ${rowNo}: persona natural requiere nombres o apellidos` };
    if (!isNatural && !bizName)
      return { ok: false, rowNo, error: `Fila ${rowNo}: persona jurídica requiere razon_social` };
    if (!name)
      return { ok: false, rowNo, error: `Fila ${rowNo}: no se pudo determinar el nombre` };

    // Validar dept_code si se suministra (solo para Colombia)
    let dept = '';
    let city = '';
    if (deptCode) {
      const deptRec = (typeof GEO_DEPTS !== 'undefined' ? GEO_DEPTS : []).find(d => d.code === deptCode);
      if (!deptRec)
        return { ok: false, rowNo, error: `Fila ${rowNo}: dept_code "${deptCode}" no encontrado` };
      dept = deptRec.name;
      if (cityCode) {
        const munis = typeof geoMunisByDept === 'function' ? geoMunisByDept(deptCode) : [];
        const muni = munis.find(m => m.code === cityCode);
        if (!muni)
          return { ok: false, rowNo, error: `Fila ${rowNo}: city_code "${cityCode}" no encontrado en dept ${deptCode}` };
        city = muni.name;
      }
    }

    const payload = {
      doc_type:           docType,
      doc_number:         docNumber,
      dv,
      person_type:        personType,
      type:               tpType,
      first_name:         firstName,
      last_name:          lastName,
      business_name:      bizName,
      commercial_name:    comName,
      name,
      email,
      email2,
      phone,
      phone2,
      contact_name:       contactName,
      contact_phone:      contactPhone,
      advisor:            advisorRaw, // resolved dynamically in loop
      address,
      country,
      department:         dept,
      dept_code:          deptCode,
      city,
      city_code:          cityCode,
      tax_regime:         finalTaxRegime,
      credit_limit:       creditLimit,
      max_invoices:       maxInvoices,
      payment_days:       payDays,
      active,
      ciiu,
      gc:                 isGc,
      gcm,
      ar,
      ei,
      rf,
      prf,
      pi,
      piv,
      resp,
      is_retention_agent: isRetentionAgent,
      bank_name:          bankName,
      bank_account:       bankAccount,
      notes,
    };

    return {
      ok: true,
      rowNo,
      docNumber,
      docType,
      name,
      personType,
      tpType,
      email,
      active,
      payload,
    };
  });
}

function _massTpRenderPreview(rows) {
  const preview = $('#mass-tp-preview');
  const tbody   = $('#mass-tp-preview-body');
  const summary = $('#mass-tp-summary');
  const runBtn  = $('#btn-mass-tp-run');
  if (!preview || !tbody || !summary || !runBtn) return;

  const okRows  = rows.filter(r => r.ok);
  const badRows = rows.filter(r => !r.ok);

  tbody.innerHTML = rows.map(r => {
    if (r.ok) {
      return `<tr>
        <td>${r.rowNo}</td>
        <td><span class="font-semibold" style="color:#1D4ED8">${esc(r.docType)} ${esc(r.docNumber)}</span></td>
        <td>${esc(r.name)}</td>
        <td>${esc(r.personType)}</td>
        <td>${esc(r.tpType)}</td>
        <td>${esc(r.email || '—')}</td>
        <td><span class="badge ${r.active ? 'badge-green' : 'badge-gray'}">${r.active ? 'Activo' : 'Inactivo'}</span></td>
        <td><span class="badge badge-green">OK</span></td>
      </tr>`;
    }
    return `<tr style="background:#FFF7F7">
      <td>${r.rowNo}</td>
      <td colspan="6" class="text-xs" style="color:#EF4444">${esc(r.error || 'Error')}</td>
      <td><span class="badge badge-red">Error</span></td>
    </tr>`;
  }).join('');

  summary.innerHTML = `<span style="color:${badRows.length ? '#B91C1C' : '#166534'}">
    ${rows.length} fila(s): ${okRows.length} válida(s), ${badRows.length} con error.
    ${badRows.length ? 'Las filas con error serán omitidas.' : 'Listo para ejecutar.'}
  </span>`;

  preview.classList.remove('hidden');
  if (okRows.length) runBtn.classList.remove('hidden');
  else runBtn.classList.add('hidden');
}

async function _executeMassTpImport(rows) {
  if (_massTpImportInProgress) return;
  const valids = (rows || []).filter(r => r.ok && r.payload);
  if (!valids.length) return showToast('No hay filas válidas para importar', 'warning');

  _massTpImportInProgress = true;

  const runBtn      = $('#btn-mass-tp-run');
  const progressWrap = $('#mass-tp-progress-wrap');
  const progressBar  = $('#mass-tp-progress-bar');
  const progressText = $('#mass-tp-progress-text');

  if (runBtn) { runBtn.disabled = true; runBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'; }
  progressWrap?.classList.remove('hidden');

  // Cargar terceros existentes para decidir create vs update y resolver advisor
  let existingByDoc = new Map();
  let employeesByName = new Map();
  let employeesByDoc = new Map();
  try {
    const all = await pb.listAll('third_parties', {});
    all.forEach(t => {
      const docClean = String(t.doc_number || '').replace(/[^0-9a-zA-Z]/g, '');
      const key = `${t.doc_type}|${docClean}`;
      existingByDoc.set(key, t.id);
      if (t.type === 'EMPLEADO') {
        employeesByName.set(String(t.name || '').trim().toUpperCase(), t.id);
        if (docClean) employeesByDoc.set(docClean, t.id);
      }
    });
  } catch (err) {
    showToast(`Error al cargar terceros existentes: ${err.message}`, 'error');
    _massTpImportInProgress = false;
    if (runBtn) { runBtn.disabled = false; runBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar carga'; }
    return;
  }

  let created = 0, updated = 0, failed = 0;
  const failedRows = [];

  try {
    for (let i = 0; i < valids.length; i++) {
      const draft = valids[i];
      const pct = (i / valids.length) * 100;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `Procesando ${i + 1} de ${valids.length}: ${draft.name}`;

      // Resolve advisor relation dynamically if name or doc number provided
      if (draft.payload.advisor) {
        const advStr = String(draft.payload.advisor).trim().toUpperCase();
        const advDoc = advStr.replace(/[^0-9a-zA-Z]/g, '');
        const resolvedId = employeesByDoc.get(advDoc) || employeesByName.get(advStr) || draft.payload.advisor;
        draft.payload.advisor = /^[a-z0-9]{15}$/.test(resolvedId) ? resolvedId : '';
      }

      const key = `${draft.payload.doc_type}|${draft.payload.doc_number}`;
      const existingId = existingByDoc.get(key);
      try {
        if (existingId) {
          await pb.update('third_parties', existingId, draft.payload);
          updated++;
        } else {
          const rec = await pb.create('third_parties', draft.payload);
          existingByDoc.set(key, rec.id);
          created++;
        }
      } catch (err) {
        failed++;
        failedRows.push(`Fila ${draft.rowNo} (${draft.docNumber}): ${err.message}`);
      }
    }

    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.textContent = 'Proceso finalizado';

    await API.logAudit(
      'IMPORT', 'third_parties', 'bulk',
      `Carga masiva: ${created} creados, ${updated} actualizados, ${failed} con error`
    );

    if (failedRows.length) console.warn('[CargaMasivaTp] Errores:', failedRows);

    showToast(
      `Carga completada: ${created} creados, ${updated} actualizados${failed ? `, ${failed} con error` : ''}`,
      failed ? 'warning' : 'success',
      5500
    );

    _loadSysInfo();
  } finally {
    _massTpImportInProgress = false;
    if (runBtn) { runBtn.disabled = false; runBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar carga'; }
  }
}

/* ══════════════════════════════════════════════════════════
   CARGA MASIVA DE CUENTAS (Plan de Cuentas)
══════════════════════════════════════════════════════════ */

/** Descarga plantilla Excel de ejemplo con la pestaña 'Indicaciones' y campos de la BDD de cuentas contables. */
function _downloadMassAccTemplate() {
  const headers = [
    'codigo', 'nombre', 'tipo', 'naturaleza', 'requiere_tercero',
    'activa', 'maneja_cruce', 'maneja_retenciones', 'tipos_retencion',
    'ret_rate_reterenta', 'ret_rate_reteiva', 'ret_rate_reteica'
  ];

  const rows = [
    { codigo: '1', nombre: 'ACTIVO', tipo: 'act', naturaleza: 'debit', requiere_tercero: 'No', activa: 'Si', maneja_cruce: 'No', maneja_retenciones: 'No', tipos_retencion: '', ret_rate_reterenta: '', ret_rate_reteiva: '', ret_rate_reteica: '' },
    { codigo: '11', nombre: 'DISPONIBLE', tipo: 'act', naturaleza: 'debit', requiere_tercero: 'No', activa: 'Si', maneja_cruce: 'No', maneja_retenciones: 'No', tipos_retencion: '', ret_rate_reterenta: '', ret_rate_reteiva: '', ret_rate_reteica: '' },
    { codigo: '1105', nombre: 'CAJA', tipo: 'act', naturaleza: 'debit', requiere_tercero: 'No', activa: 'Si', maneja_cruce: 'No', maneja_retenciones: 'No', tipos_retencion: '', ret_rate_reterenta: '', ret_rate_reteiva: '', ret_rate_reteica: '' },
    { codigo: '110505', nombre: 'Caja General', tipo: 'act', naturaleza: 'debit', requiere_tercero: 'No', activa: 'Si', maneja_cruce: 'Si', maneja_retenciones: 'No', tipos_retencion: '', ret_rate_reterenta: '', ret_rate_reteiva: '', ret_rate_reteica: '' },
    { codigo: '236505', nombre: 'Retención en la fuente por pagar', tipo: 'pas', naturaleza: 'credit', requiere_tercero: 'Si', activa: 'Si', maneja_cruce: 'No', maneja_retenciones: 'Si', tipos_retencion: 'reterenta', ret_rate_reterenta: 3.5, ret_rate_reteiva: '', ret_rate_reteica: '' },
    { codigo: '24080501', nombre: 'Retención IVA por pagar', tipo: 'pas', naturaleza: 'credit', requiere_tercero: 'Si', activa: 'Si', maneja_cruce: 'No', maneja_retenciones: 'Si', tipos_retencion: 'reteiva', ret_rate_reterenta: '', ret_rate_reteiva: 15, ret_rate_reteica: '' }
  ];

  const indications: Array<[string, string, string, string, string]> = [
    ['codigo', 'SÍ', 'Texto Numérico', 'Código PUC oficial de la cuenta contable sin puntos ni espacios.', '11050501'],
    ['nombre', 'SÍ', 'Texto Libre', 'Nombre o denominación contable de la cuenta.', 'Caja General Sucursal Principal'],
    ['tipo', 'SÍ', 'Código Tipo Cuenta', 'Tipo de cuenta según catálogo base. Valores válidos:\n- act: Activo\n- pas: Pasivo\n- pat: Patrimonio\n- ing: Ingresos\n- gas: Gastos\n- cos: Costos\n- odd: Cuentas de Orden Deudoras\n- odc: Cuentas de Orden Acreedoras', 'act'],
    ['naturaleza', 'NO', 'Texto (debit / credit)', 'Naturaleza contable. Valores: debit (Débito) o credit (Crédito). Si se omite, se deduce automáticamente según el primer dígito de la clase PUC.', 'debit'],
    ['requiere_tercero', 'NO', 'Texto (Si / No)', 'Indica si la cuenta exige registrar documento de tercero en cada línea contable. Valores: Si o No.', 'Si'],
    ['activa', 'NO', 'Texto (Si / No)', 'Estado de la cuenta. Valores: Si o No (Si omitido, asume Si).', 'Si'],
    ['maneja_cruce', 'NO', 'Texto (Si / No)', 'Indica si la cuenta requiere registrar documento de cruce de cartera/factura. Valores: Si o No.', 'Si'],
    ['maneja_retenciones', 'NO', 'Texto (Si / No)', 'Indica si la cuenta aplica cálculo automático de retenciones. Valores: Si o No.', 'No'],
    ['tipos_retencion', 'NO', 'Texto (reterenta, reteiva, reteica)', 'Tipos de retención asociados separados por coma. Valores válidos: reterenta, reteiva, reteica.', 'reterenta'],
    ['ret_rate_reterenta', 'NO', 'Número Porcentaje', 'Porcentaje de tarifa de Retención en la Fuente a título de Renta.', '3.5'],
    ['ret_rate_reteiva', 'NO', 'Número Porcentaje', 'Porcentaje de tarifa de Retención de IVA.', '15'],
    ['ret_rate_reteica', 'NO', 'Número Porcentaje', 'Porcentaje de tarifa de Retención de ICA.', '0.7']
  ];

  _generateTemplateXlsx({
    filename: 'plantilla_plan_cuentas',
    sheetName: 'Plan de Cuentas',
    headers,
    rows,
    indications
  });
}

/**
 * Normaliza una fila cruda a payload completo de cuenta contable.
 * Soporta TODOS los campos de la BDD: incluyendo retenciones y cruce.
 * Los campos de retención son opcionales y tienen valores por defecto seguros.
 * Retorna { ok, payload, error, warnings? }.
 */
function _massAccNormalizeRow(raw, accTypes) {
  const get = (...keys) => {
    for (const k of keys) { const v = raw[k]; if (v !== undefined && v !== '') return String(v).trim(); }
    return '';
  };
  const parseBool = (val: string) => /^(s[ií]|yes|1|true)$/i.test(val);
  const parseFloat0 = (val: string) => { const n = parseFloat(val); return Number.isFinite(n) ? n : 0; };

  // ── Campos obligatorios
  const code    = get('codigo', 'code', 'cod', 'cuenta');
  const name    = get('nombre', 'name', 'descripcion', 'description');
  const tipoRaw = get('tipo', 'type', 'tipo_cuenta', 'account_type');

  if (!code)               return { ok: false, error: 'Falta el código' };
  if (!/^\d+$/.test(code)) return { ok: false, error: `Código "${code}" no es numérico` };
  if (!name)               return { ok: false, error: 'Falta el nombre' };
  if (!tipoRaw)            return { ok: false, error: 'Falta el tipo de cuenta' };

  const tipoNorm = tipoRaw.toLowerCase().trim();
  const accType  = accTypes.find(t =>
    String(t.code).toLowerCase() === tipoNorm ||
    t.name.toLowerCase().includes(tipoNorm)
  );
  if (!accType) return { ok: false, error: `Tipo "${tipoRaw}" no encontrado en account_types` };

  // ── Campos opcionales básicos
  const natRaw     = get('naturaleza', 'nature', 'nat');
  const levelRaw   = get('nivel', 'level');
  const parentCode = get('codigo_padre', 'parent_code', 'padre', 'parent');
  const thirdRaw   = get('requiere_tercero', 'requires_third_party', 'tercero', 'req_tercero');
  const activeRaw  = get('activa', 'active', 'estado');

  const nature        = /^(c|cr|credit|credito|crédito)$/i.test(natRaw) ? 'credit' : 'debit';
  const LEVEL_MAP: Record<number, number> = { 1: 1, 2: 2, 4: 3, 6: 4, 8: 5, 10: 6 };
  const level         = levelRaw ? Math.max(1, parseInt(levelRaw, 10) || 1) : (LEVEL_MAP[code.length] ?? code.length);
  // Calcular parent_code automáticamente si no se provee (según estructura PUC colombiano)
  let resolvedParent  = parentCode;
  if (!resolvedParent && code.length > 1) {
    resolvedParent = code.length === 2 ? code.slice(0, 1) : code.slice(0, code.length - 2);
  }
  const requiresThird = parseBool(thirdRaw);
  const active        = !/^(no|0|false|inactiva|inactivo)$/i.test(activeRaw);

  // ── Campos de comportamiento contable (NUEVOS)
  const manejaRaw     = get('maneja_retenciones', 'retenciones', 'maneja_ret');
  const crucRaw       = get('maneja_cruce', 'cruce', 'doc_cruce');
  const tiposRetRaw   = get('tipos_retencion', 'tipos_ret', 'retencion_tipos');
  const rateRentaRaw  = get('ret_rate_reterenta', 'tasa_reterenta', 'rate_renta');
  const rateIvaRaw    = get('ret_rate_reteiva', 'tasa_reteiva', 'rate_iva');
  const rateIcaRaw    = get('ret_rate_reteica', 'tasa_reteica', 'rate_ica');

  const manejaRetenciones = parseBool(manejaRaw);
  const manejaCruce       = parseBool(crucRaw);

  // Normalizar tipos_retencion: admite 'reterenta,reteiva,reteica' o 'reterenta reteiva reteica'
  const VALID_TIPOS = ['reterenta', 'reteiva', 'reteica'];
  const tiposArr = tiposRetRaw
    ? tiposRetRaw.split(/[,;\s]+/).map(t => t.toLowerCase().trim()).filter(t => VALID_TIPOS.includes(t))
    : [];
  const tiposRetencion = manejaRetenciones ? tiposArr.join(',') : '';

  const retRateReterenta = manejaRetenciones && tiposArr.includes('reterenta') ? parseFloat0(rateRentaRaw) : 0;
  const retRateReteiva   = manejaRetenciones && tiposArr.includes('reteiva')   ? parseFloat0(rateIvaRaw)   : 0;
  const retRateReteica   = manejaRetenciones && tiposArr.includes('reteica')   ? parseFloat0(rateIcaRaw)   : 0;

  // Advertencias no bloqueantes
  const warnings: string[] = [];
  if (manejaRetenciones && !tiposArr.length) {
    warnings.push('maneja_retenciones=Si pero no se definieron tipos_retencion');
  }

  return {
    ok: true,
    warnings: warnings.length ? warnings : undefined,
    payload: {
      code,
      name,
      account_type_id: accType.id,
      nature,
      level,
      parent_code: resolvedParent,
      requires_third_party: requiresThird,
      active,
      // Campos de comportamiento contable
      maneja_cruce: manejaCruce,
      maneja_retenciones: manejaRetenciones,
      tipos_retencion: tiposRetencion,
      ret_rate_reterenta: retRateReterenta,
      ret_rate_reteiva:   retRateReteiva,
      ret_rate_reteica:   retRateReteica,
    },
  };
}

/** Abre el modal de importación masiva de cuentas — soporta TODOS los campos de la BDD. */
async function _openMassAccImportModal() {
  if (!can('canWrite')) return showToast('No tienes permisos para importar cuentas', 'error');
  if (_massAccImportInProgress) return showToast('Importación en curso, espera...', 'warning');

  const accTypes = await pb.listAll('account_types', { sort: 'code' });

  const reqCols = ['codigo', 'nombre', 'tipo'];
  const optColsBase = ['naturaleza', 'requiere_tercero', 'activa', 'maneja_cruce'];
  const optColsRet  = ['maneja_retenciones', 'tipos_retencion', 'ret_rate_reterenta', 'ret_rate_reteiva', 'ret_rate_reteica'];

  openModal(
    '<i class="fas fa-list-tree mr-2" style="color:#6D28D9"></i>Importar Plan de Cuentas',
    `
    <div class="mb-4">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>Excel (.xlsx)</strong> o <strong>CSV</strong> con las cuentas contables.
        Si el código ya existe, la cuenta se <strong>actualiza</strong>; si no, se <strong>crea</strong>.
        Los campos de <strong>nivel</strong> y <strong>código padre</strong> se calculan automáticamente desde el código PUC.
      </p>

      <!-- Panel de columnas -->
      <div class="rounded-xl p-3 mb-3" style="background:#F5F3FF;border:1px solid #DDD6FE">
        <p class="text-xs font-semibold mb-1" style="color:#6D28D9;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-1.5 mb-2">
          ${reqCols.map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#EDE9FE;color:#6D28D9;font-weight:700">${c}</code>`).join('')}
        </div>
        <p class="text-xs font-semibold mb-1" style="color:#4B5563;text-transform:uppercase;letter-spacing:.05em">Opcionales — Generales</p>
        <div class="flex flex-wrap gap-1.5 mb-2">
          ${optColsBase.map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${c}</code>`).join('')}
        </div>
        <p class="text-xs font-semibold mb-1" style="color:#D97706;text-transform:uppercase;letter-spacing:.05em">Opcionales — Retenciones</p>
        <div class="flex flex-wrap gap-1.5 mb-2">
          ${optColsRet.map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#FFFBEB;color:#D97706">${c}</code>`).join('')}
        </div>
        <p class="text-xs mt-1" style="color:#6B7280">
          <strong>tipo</strong>: código de letras del tipo de cuenta (ej: <em>act</em>, <em>pas</em>, <em>pat</em>, <em>ing</em>, <em>gas</em>, <em>cos</em>, <em>odd</em>, <em>odc</em>).
          <strong>tipos_retencion</strong>: <em>reterenta</em>, <em>reteiva</em>, <em>reteica</em> separados por coma.
          Las tasas (<em>ret_rate_*</em>) van en porcentaje (ej: <em>3.5</em>).
        </p>
      </div>

      <button class="btn btn-outline btn-sm mb-4" id="btn-mass-acc-dl-tmpl">
        <i class="fas fa-file-csv mr-1" style="color:#059669"></i>Descargar plantilla CSV
      </button>

      <!-- Drop zone -->
      <div id="mass-acc-drop" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#6D28D9;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">XLSX · XLS · CSV — máx. 5 MB</p>
        <input type="file" id="mass-acc-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>

      <!-- Vista previa -->
      <div id="mass-acc-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa — <span id="mass-acc-count"></span></p>
          <button class="btn btn-outline btn-sm" id="btn-mass-acc-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:320px;overflow-y:auto">
          <table class="data-table text-xs">
            <thead>
              <tr>
                <th>#</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Nat.</th>
                <th>Req.3ro</th>
                <th>Cruce</th>
                <th>Retenciones</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody id="mass-acc-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-acc-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-acc-run"><i class="fas fa-bolt mr-1"></i>Ejecutar importación</button>`,
    true
  );

  let parsedRows = [];

  const dropZone  = document.getElementById('mass-acc-drop');
  const fileInput = document.getElementById('mass-acc-file-input') as HTMLInputElement;

  document.getElementById('btn-mass-acc-dl-tmpl')?.addEventListener('click', _downloadMassAccTemplate);

  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    (dropZone as HTMLElement).style.borderColor = '#6D28D9';
    (dropZone as HTMLElement).style.background  = '#F5F3FF';
  });
  dropZone?.addEventListener('dragleave', () => {
    (dropZone as HTMLElement).style.borderColor = '#D1D5DB';
    (dropZone as HTMLElement).style.background  = '#FAFAFA';
  });
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    (dropZone as HTMLElement).style.borderColor = '#D1D5DB';
    (dropZone as HTMLElement).style.background  = '#FAFAFA';
    const file = (e as DragEvent).dataTransfer?.files?.[0];
    if (file) processFile(file);
  });
  fileInput?.addEventListener('change', () => { if (fileInput.files?.[0]) processFile(fileInput.files[0]); });

  document.getElementById('btn-mass-acc-clear')?.addEventListener('click', () => {
    parsedRows = [];
    document.getElementById('mass-acc-preview')?.classList.add('hidden');
    document.getElementById('btn-mass-acc-run')?.classList.add('hidden');
    if (fileInput) fileInput.value = '';
  });

  async function processFile(file: File) {
    if (file.size > 5 * 1024 * 1024) return showToast('El archivo supera 5 MB', 'error');
    const ext = file.name.split('.').pop()?.toLowerCase();
    let rawRows: any[] = [];
    try {
      if (ext === 'csv') {
        rawRows = _massTxParseCsv(await file.text());
      } else if (ext === 'xlsx' || ext === 'xls') {
        rawRows = _massTxParseExcel(await file.arrayBuffer());
      } else {
        return showToast('Formato no soportado. Usa XLSX, XLS o CSV.', 'error');
      }
    } catch (e: any) {
      return showToast('Error al leer el archivo: ' + e.message, 'error');
    }
    if (!rawRows.length) return showToast('El archivo no contiene filas de datos', 'warning');
    parsedRows = rawRows.map((r, i) => ({ idx: i + 1, ..._massAccNormalizeRow(r, accTypes) }));
    renderPreview(parsedRows);
  }

  function renderPreview(rows: any[]) {
    const tbody   = document.getElementById('mass-acc-preview-body');
    const count   = document.getElementById('mass-acc-count');
    const summary = document.getElementById('mass-acc-summary');
    const runBtn  = document.getElementById('btn-mass-acc-run');
    const preview = document.getElementById('mass-acc-preview');
    if (!tbody || !count || !summary || !preview) return;

    const okRows  = rows.filter(r => r.ok);
    const errRows = rows.filter(r => !r.ok);
    const warnRows = rows.filter(r => r.ok && r.warnings?.length);
    count.textContent = `${rows.length} fila(s) — ${okRows.length} válidas, ${errRows.length} con error${warnRows.length ? `, ${warnRows.length} con advertencias` : ''}`;

    tbody.innerHTML = rows.map((r, i) => {
      if (!r.ok) {
        return `<tr style="background:#FFF7F7">
          <td style="color:#EF4444">${i + 1}</td>
          <td colspan="7" style="color:#EF4444">
            <i class="fas fa-circle-xmark mr-1"></i>${esc(r.error)}
          </td>
          <td><span class="badge badge-red">Error</span></td>
        </tr>`;
      }

      const p = r.payload;
      const typeName = accTypes.find((t: any) => t.id === p.account_type_id)?.name ?? '?';

      // Badge naturaleza
      const natBadge = p.nature === 'credit'
        ? `<span class="badge" style="background:#DCFCE7;color:#166534">Cr</span>`
        : `<span class="badge" style="background:#EFF6FF;color:#1e40af">Db</span>`;

      // Badge req. tercero
      const tercBadge = p.requires_third_party
        ? `<span class="badge badge-orange" style="font-size:10px">Sí</span>`
        : `<span style="color:#9CA3AF;font-size:11px">No</span>`;

      // Badge cruce
      const cruceBadge = p.maneja_cruce
        ? `<span class="badge badge-blue" style="font-size:10px">Sí</span>`
        : `<span style="color:#9CA3AF;font-size:11px">No</span>`;

      // Retenciones compactas
      let retCell = `<span style="color:#9CA3AF;font-size:11px">No</span>`;
      if (p.maneja_retenciones) {
        const LABELS: Record<string,string> = { reterenta:'Renta', reteiva:'IVA', reteica:'ICA' };
        const RATES: Record<string,number>  = {
          reterenta: p.ret_rate_reterenta,
          reteiva:   p.ret_rate_reteiva,
          reteica:   p.ret_rate_reteica,
        };
        const tipos = p.tipos_retencion ? p.tipos_retencion.split(',').filter(Boolean) : [];
        retCell = tipos.length
          ? tipos.map((t: string) => {
              const rate = RATES[t];
              return `<span class="badge badge-orange" style="font-size:10px;margin-right:2px">${LABELS[t] ?? t}${rate ? ` ${rate}%` : ''}</span>`;
            }).join('')
          : `<span class="badge badge-orange" style="font-size:10px">Sí<i class="fas fa-triangle-exclamation ml-1" title="Sin tipos definidos"></i></span>`;
      }

      // Fila con posible advertencia
      const hasWarn = r.warnings?.length;
      const rowStyle = hasWarn ? 'background:#FFFBEB' : '';
      const warnTitle = hasWarn ? esc(r.warnings.join(' | ')) : '';

      return `<tr style="${rowStyle}">
        <td>${i + 1}${hasWarn ? ` <i class="fas fa-triangle-exclamation" style="color:#D97706;font-size:10px" title="${warnTitle}"></i>` : ''}</td>
        <td><span class="font-semibold" style="color:#6D28D9">${esc(p.code)}</span></td>
        <td>${esc(p.name)}</td>
        <td class="text-xs" style="max-width:100px;overflow:hidden;text-overflow:ellipsis">${esc(typeName)}</td>
        <td>${natBadge}</td>
        <td>${tercBadge}</td>
        <td>${cruceBadge}</td>
        <td>${retCell}</td>
        <td><span class="badge badge-green">OK</span></td>
      </tr>`;
    }).join('');

    // Summary bar
    const parts: string[] = [];
    if (errRows.length)  parts.push(`<span style="color:#EF4444"><i class="fas fa-circle-xmark mr-1"></i>${errRows.length} fila(s) con error serán omitidas.</span>`);
    if (warnRows.length) parts.push(`<span style="color:#D97706"><i class="fas fa-triangle-exclamation mr-1"></i>${warnRows.length} fila(s) con advertencias (se importarán igual).</span>`);
    if (!errRows.length && !warnRows.length) parts.push(`<span style="color:#22C55E"><i class="fas fa-circle-check mr-1"></i>Todas las filas son válidas.</span>`);
    summary.innerHTML = parts.join('  ');

    preview.classList.remove('hidden');
    if (okRows.length) runBtn?.classList.remove('hidden');
    else runBtn?.classList.add('hidden');
  }

  document.getElementById('btn-mass-acc-run')?.addEventListener('click', async () => {
    const okRows = parsedRows.filter(r => r.ok);
    if (!okRows.length || _massAccImportInProgress) return;
    _massAccImportInProgress = true;
    const runBtn = document.getElementById('btn-mass-acc-run') as HTMLButtonElement | null;
    if (runBtn) { runBtn.disabled = true; runBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'; }

    // Precarga el mapa código→id para decidir crear vs actualizar
    let existingMap: Record<string, string> = {};
    try {
      const all = await pb.listAll('accounts', {});
      all.forEach((a: any) => { existingMap[a.code] = a.id; });
    } catch (e: any) {
      showToast('Error al cargar cuentas existentes: ' + e.message, 'error');
      _massAccImportInProgress = false;
      if (runBtn) { runBtn.disabled = false; runBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar importación'; }
      return;
    }

    let created = 0, updated = 0, errors = 0;
    for (const row of okRows) {
      try {
        const payload = row.payload;
        if (existingMap[payload.code]) {
          await pb.update('accounts', existingMap[payload.code], payload);
          updated++;
        } else {
          const rec = await pb.create('accounts', payload);
          existingMap[payload.code] = rec.id;
          created++;
        }
      } catch { errors++; }
    }

    await API.logAudit('IMPORT', 'Cuenta', 'bulk',
      `${created} creadas, ${updated} actualizadas, ${errors} errores — campos completos`);
    _loadSysInfo();
    closeModal();
    let msg = `Importación completada: ${created} creadas, ${updated} actualizadas.`;
    if (errors) msg += ` ${errors} con error.`;
    showToast(msg, errors ? 'warning' : 'success', 5000);
    _massAccImportInProgress = false;
  });
}

/* ══════════════════════════════════════════════════════════
   CARGA MASIVA DE UNIDADES HABITACIONALES (COPROPIEDADES)
══════════════════════════════════════════════════════════ */

function _downloadMassPhUnitsTemplate() {
  const headers = [
    'codigo', 'nombre', 'tipo', 'torre', 'apartamento',
    'coef_participacion', 'cuota_admin', 'area_m2',
    'doc_propietario', 'tipo_doc_propietario', 'activo', 'notas'
  ];

  const rows = [
    { codigo: '101', nombre: 'Apartamento 101', tipo: 'APARTAMENTO', torre: 'Torre 1', apartamento: '101', coef_participacion: 2.1500, cuota_admin: 350000, area_m2: 68.50, doc_propietario: '900123456', tipo_doc_propietario: 'NIT', activo: 'Si', notas: 'Unidad residencial principal' },
    { codigo: 'P-12', nombre: 'Parqueadero 12', tipo: 'PARQUEADERO', torre: 'Torre 1', apartamento: 'P-12', coef_participacion: 0.3200, cuota_admin: 50000, area_m2: 12.00, doc_propietario: '900123456', tipo_doc_propietario: 'NIT', activo: 'Si', notas: 'Parqueadero cubierto' },
    { codigo: 'D-03', nombre: 'Deposito 03', tipo: 'DEPOSITO', torre: 'Torre 1', apartamento: 'D-03', coef_participacion: 0.1500, cuota_admin: 20000, area_m2: 5.20, doc_propietario: '900123456', tipo_doc_propietario: 'NIT', activo: 'Si', notas: 'Depósito subterráneo' }
  ];

  const indications: Array<[string, string, string, string, string]> = [
    ['codigo', 'SÍ', 'Texto Alfanumérico', 'Código único de identificación de la unidad habitacional o inmueble dentro de la copropiedad.', '101'],
    ['nombre', 'SÍ', 'Texto Libre', 'Nombre o descripción de la unidad habitacional.', 'Apartamento 101'],
    ['tipo', 'NO', 'Texto (Tipo Unidad)', 'Tipo de inmueble PH. Valores permitidos: APARTAMENTO, LOCAL, OFICINA, PARQUEADERO, DEPOSITO, BODEGA, LOTE.', 'APARTAMENTO'],
    ['torre', 'NO', 'Texto Libre', 'Identificador de Torre, Bloque o Edificio.', 'Torre 1'],
    ['apartamento', 'NO', 'Texto Libre', 'Número interno de apartamento, local o espacio.', '101'],
    ['coef_participacion', 'NO', 'Número Decimal', 'Coeficiente de copropiedad de la unidad (porcentaje de participación en expensas comunes).', '2.1500'],
    ['cuota_admin', 'NO', 'Número Positivo', 'Valor mensual COP de la cuota ordinaria de administración.', '350000'],
    ['area_m2', 'NO', 'Número Decimal', 'Área privada construida del inmueble en metros cuadrados.', '68.50'],
    ['doc_propietario', 'NO', 'NIT / Documento', 'Documento de identidad del tercero propietario (debe existir previamente en Terceros o registrarse con su tipo de doc).', '900123456'],
    ['tipo_doc_propietario', 'NO', 'Tipo Documento', 'Tipo de documento del propietario. Valores: CC, NIT, CE, PAS, TI.', 'NIT'],
    ['activo', 'NO', 'Texto (Si / No)', 'Estado de la unidad habitacional. Valores: Si o No (Si omitido, asume Si).', 'Si']
  ];

  _generateTemplateXlsx({
    filename: 'plantilla_unidades_copropiedades',
    sheetName: 'Unidades Copropiedad',
    headers,
    rows,
    indications
  });
}

function _massPhUnitsNormalizeRow(raw, ownersByDoc, ownersByDocTypeDoc) {
  const code = _massTxPick(raw, ['codigo', 'code', 'unidad', 'unit_code']);
  const name = _massTxPick(raw, ['nombre', 'name', 'descripcion']);
  const unitTypeRaw = _massTxPick(raw, ['tipo', 'unit_type', 'tipo_unidad']) || 'APARTAMENTO';
  const tower = _massTxPick(raw, ['torre', 'tower']);
  const apartment = _massTxPick(raw, ['apartamento', 'apto', 'apartment']);
  const coef = _massTxNum(_massTxPick(raw, ['coef_participacion', 'coef', 'coeficiente']));
  const adminFee = _massTxNum(_massTxPick(raw, ['cuota_admin', 'admin_fee', 'cuota_administracion']));
  const area = _massTxNum(_massTxPick(raw, ['area_m2', 'area']));
  const ownerDoc = _massTxPick(raw, ['doc_propietario', 'owner_doc', 'documento_propietario']);
  const ownerDocType = _massTxPick(raw, ['tipo_doc_propietario', 'owner_doc_type', 'doc_type_propietario']).toUpperCase();
  const activeRaw = _massTxPick(raw, ['activo', 'active', 'estado']);
  const notes = _massTxPick(raw, ['notas', 'nota', 'notes']);

  if (!code) return { ok: false, error: 'Falta el código de la unidad' };
  if (!name) return { ok: false, error: `Falta el nombre para la unidad ${code}` };

  const validTypes = new Set(['APARTAMENTO', 'PARQUEADERO', 'DEPOSITO', 'LOCAL', 'CASA', 'OFICINA', 'OTRO']);
  const unitType = String(unitTypeRaw || '').toUpperCase();
  if (!validTypes.has(unitType)) {
    return { ok: false, error: `Tipo inválido en ${code}: ${unitTypeRaw}` };
  }

  if (coef < 0 || coef > 100) {
    return { ok: false, error: `Coeficiente fuera de rango (0-100) en ${code}` };
  }
  if (adminFee < 0) return { ok: false, error: `Cuota administración negativa en ${code}` };
  if (area < 0) return { ok: false, error: `Área negativa en ${code}` };

  let ownerId = null;
  if (ownerDoc) {
    const ownerDocKey = _massTxDocKey(ownerDoc);
    if (ownerDocType) {
      ownerId = ownersByDocTypeDoc.get(`${ownerDocType}|${ownerDocKey}`)?.id || null;
    }
    if (!ownerId) ownerId = ownersByDoc.get(ownerDocKey)?.id || null;
    if (!ownerId) return { ok: false, error: `No existe tercero propietario con documento ${ownerDoc}` };
  }

  const active = !/^(no|0|false|inactiva|inactivo)$/i.test(activeRaw);

  return {
    ok: true,
    payload: {
      code,
      name,
      unit_type: unitType,
      tower,
      apartment,
      coef_participacion: coef,
      admin_fee: adminFee,
      area_m2: area,
      owner_id: ownerId,
      notes,
      active,
    },
  };
}

async function _openMassPhUnitsImportModal() {
  if (!can('canWrite')) return showToast('No tienes permisos para importar unidades', 'error');
  if (_massPhUnitsImportInProgress) return showToast('Importación en curso, espera...', 'warning');

  openModal(
    '<i class="fas fa-building-user mr-2" style="color:#0E7490"></i>Importar Unidades Copropiedades',
    `
    <div class="mb-4">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx)</strong> con unidades habitacionales.
        Si el código ya existe se <strong>actualiza</strong>; si no existe se <strong>crea</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#F0FDFA;border:1px solid #99F6E4">
        <p class="text-xs font-semibold mb-1" style="color:#0F766E;text-transform:uppercase;letter-spacing:.05em">Columnas</p>
        <div class="flex flex-wrap gap-2">
          ${['codigo','nombre','tipo'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#CCFBF1;color:#0F766E">${c}</code>`).join('')}
          ${['torre','apartamento','coef_participacion','cuota_admin','area_m2','doc_propietario','tipo_doc_propietario','activo','notas'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${c} <span style="font-size:.65rem">(opcional)</span></code>`).join('')}
        </div>
      </div>
      <button class="btn btn-outline btn-sm mb-4" id="btn-mass-ph-units-dl-tmpl"><i class="fas fa-download mr-1"></i>Descargar plantilla CSV</button>
      <div id="mass-ph-units-drop" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#0E7490;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 5 MB</p>
        <input type="file" id="mass-ph-units-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>

      <div id="mass-ph-units-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa — <span id="mass-ph-units-count"></span></p>
          <button class="btn btn-outline btn-sm" id="btn-mass-ph-units-clear"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:300px;overflow-y:auto">
          <table class="data-table text-xs">
            <thead><tr><th>#</th><th>Código</th><th>Nombre</th><th>Tipo</th><th>Apto</th><th>Propietario</th><th>Operación</th><th>Estado</th></tr></thead>
            <tbody id="mass-ph-units-preview-body"></tbody>
          </table>
        </div>
        <div id="mass-ph-units-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-mass-ph-units-run"><i class="fas fa-bolt mr-1"></i>Ejecutar importación</button>`,
    true
  );

  let parsedRows = [];

  const [terceros, existingUnits] = await Promise.all([
    API.getTerceros({}),
    pb.listAll('ph_properties', { sort: 'code' }),
  ]);

  const ownersByDoc = new Map();
  const ownersByDocTypeDoc = new Map();
  terceros.forEach(t => {
    const key = _massTxDocKey(t.doc_number);
    if (!key) return;
    if (!ownersByDoc.has(key)) ownersByDoc.set(key, t);
    const typed = `${String(t.doc_type || '').toUpperCase()}|${key}`;
    if (!ownersByDocTypeDoc.has(typed)) ownersByDocTypeDoc.set(typed, t);
  });

  const unitByCode = new Map(existingUnits.map(u => [String(u.code || '').trim().toUpperCase(), u]));

  const dropZone = document.getElementById('mass-ph-units-drop');
  const fileInput = document.getElementById('mass-ph-units-file-input');

  document.getElementById('btn-mass-ph-units-dl-tmpl')?.addEventListener('click', _downloadMassPhUnitsTemplate);

  dropZone?.addEventListener('click', () => fileInput?.click());
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#0E7490';
    dropZone.style.background = '#ECFEFF';
  });
  dropZone?.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#D1D5DB';
    dropZone.style.background = '#FAFAFA';
  });
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#D1D5DB';
    dropZone.style.background = '#FAFAFA';
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  });
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) processFile(file);
  });

  document.getElementById('btn-mass-ph-units-clear')?.addEventListener('click', () => {
    parsedRows = [];
    document.getElementById('mass-ph-units-preview')?.classList.add('hidden');
    document.getElementById('btn-mass-ph-units-run')?.classList.add('hidden');
    if (fileInput) fileInput.value = '';
  });

  async function processFile(file) {
    if (file.size > 5 * 1024 * 1024) return showToast('El archivo supera 5 MB', 'error');
    const ext = file.name.split('.').pop().toLowerCase();
    let rawRows = [];
    try {
      if (ext === 'csv') rawRows = _massTxParseCsv(await file.text());
      else if (ext === 'xlsx' || ext === 'xls') rawRows = _massTxParseExcel(await file.arrayBuffer());
      else return showToast('Formato no soportado. Usa CSV, XLSX o XLS.', 'error');
    } catch (e) {
      return showToast('Error al leer el archivo: ' + e.message, 'error');
    }
    if (!rawRows.length) return showToast('El archivo no contiene filas de datos', 'warning');

    parsedRows = rawRows.map((r, i) => {
      const norm = _massPhUnitsNormalizeRow(r, ownersByDoc, ownersByDocTypeDoc);
      if (!norm.ok) return { idx: i + 1, ...norm };
      const codeKey = String(norm.payload.code || '').trim().toUpperCase();
      const existing = unitByCode.get(codeKey);
      return {
        idx: i + 1,
        ok: true,
        mode: existing ? 'update' : 'create',
        existingId: existing?.id || null,
        ownerName: norm.payload.owner_id ? (terceros.find(t => t.id === norm.payload.owner_id)?.name || '—') : '—',
        payload: norm.payload,
      };
    });

    renderPreview(parsedRows);
  }

  function renderPreview(rows) {
    const tbody = document.getElementById('mass-ph-units-preview-body');
    const count = document.getElementById('mass-ph-units-count');
    const summary = document.getElementById('mass-ph-units-summary');
    const runBtn = document.getElementById('btn-mass-ph-units-run');
    const preview = document.getElementById('mass-ph-units-preview');

    const okRows = rows.filter(r => r.ok);
    const errRows = rows.filter(r => !r.ok);
    count.textContent = `${rows.length} fila(s) — ${okRows.length} válidas, ${errRows.length} con error`;

    tbody.innerHTML = rows.map(r => {
      if (!r.ok) {
        return `<tr style="background:#FFF7F7">
          <td>${r.idx}</td>
          <td colspan="6" class="text-xs" style="color:#EF4444">${esc(r.error || 'Fila inválida')}</td>
          <td><span class="badge badge-red">Error</span></td>
        </tr>`;
      }
      const p = r.payload;
      const opBadge = r.mode === 'update'
        ? '<span class="badge badge-orange">Actualizar</span>'
        : '<span class="badge badge-blue">Crear</span>';
      return `<tr>
        <td>${r.idx}</td>
        <td><span class="font-semibold" style="color:#0E7490">${esc(p.code)}</span></td>
        <td>${esc(p.name)}</td>
        <td>${esc(p.unit_type || '—')}</td>
        <td>${esc(p.apartment || '—')}</td>
        <td>${esc(r.ownerName || '—')}</td>
        <td>${opBadge}</td>
        <td><span class="badge badge-green">OK</span></td>
      </tr>`;
    }).join('');

    summary.innerHTML = errRows.length
      ? `<span style="color:#EF4444"><i class="fas fa-triangle-exclamation mr-1"></i>${errRows.length} fila(s) con error serán omitidas.</span>`
      : `<span style="color:#22C55E"><i class="fas fa-circle-check mr-1"></i>Todas las filas son válidas.</span>`;

    preview.classList.remove('hidden');
    if (okRows.length) runBtn?.classList.remove('hidden');
    else runBtn?.classList.add('hidden');
  }

  document.getElementById('btn-mass-ph-units-run')?.addEventListener('click', async () => {
    const okRows = parsedRows.filter(r => r.ok);
    if (!okRows.length || _massPhUnitsImportInProgress) return;

    _massPhUnitsImportInProgress = true;
    const runBtn = document.getElementById('btn-mass-ph-units-run');
    if (runBtn) {
      runBtn.disabled = true;
      runBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Importando...';
    }

    let created = 0;
    let updated = 0;
    let failed = 0;
    const failedRows = [];

    try {
      for (const row of okRows) {
        try {
          if (row.mode === 'update' && row.existingId) {
            await pb.update('ph_properties', row.existingId, row.payload);
            updated++;
          } else {
            const rec = await pb.create('ph_properties', row.payload);
            row.existingId = rec.id;
            created++;
          }
        } catch (e) {
          failed++;
          failedRows.push({ code: row.payload.code, error: e.message || 'Error desconocido' });
        }
      }

      await API.logAudit(
        'IMPORT', 'PhProperty', 'bulk',
        `Carga masiva unidades PH: ${created} creadas, ${updated} actualizadas, ${failed} con error`
      );

      if (failedRows.length) console.warn('[CargaMasivaPhUnits] Errores:', failedRows);

      closeModal();
      showToast(
        `Carga completada: ${created} creadas, ${updated} actualizadas${failed ? `, ${failed} con error` : ''}`,
        failed ? 'warning' : 'success',
        5500
      );
    } finally {
      _massPhUnitsImportInProgress = false;
      if (runBtn) {
        runBtn.disabled = false;
        runBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar importación';
      }
    }
  });
}

  function _openBulkReplaceModal() {
    openModal(
      'Reemplazo Masivo de Cuenta Contable',
      `
      <div class="space-y-4">
        <p class="text-sm" style="color:#4B5563;line-height:1.5">
          Esta herramienta buscará todas las líneas de asientos contables que utilicen la <strong>cuenta origen</strong> dentro del período seleccionado y las asociará a la <strong>cuenta destino</strong>.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label font-semibold">Cuenta Origen (Código)</label>
            <input id="bulk-old-account" class="form-input" placeholder="Ej: 11050501">
          </div>
          <div class="form-group">
            <label class="form-label font-semibold">Cuenta Destino (Código)</label>
            <input id="bulk-new-account" class="form-input" placeholder="Ej: 11100502">
          </div>
          <div class="form-group">
            <label class="form-label font-semibold">Fecha Desde</label>
            <input id="bulk-date-from" type="date" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label font-semibold">Fecha Hasta</label>
            <input id="bulk-date-to" type="date" class="form-input">
          </div>
        </div>
        
        <div class="p-3 rounded-lg text-xs flex gap-2 items-start" style="background:#FFFBEB; border:1px solid #FDE68A; color:#B45309">
          <i class="fas fa-triangle-exclamation mt-0.5 text-sm"></i>
          <div>
            <strong>Atención:</strong> Esta acción modificará permanentemente los registros contables históricos en el rango indicado. Se recomienda descargar una copia de respaldo antes de continuar.
          </div>
        </div>
      </div>
      `,
      `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-bulk-replace-execute" style="background:#2563EB; border-color:#2563EB">
        <i class="fas fa-shuffle mr-1"></i> Ejecutar Reemplazo
      </button>
      `,
      false
    );

    $('#btn-bulk-replace-execute')?.addEventListener('click', async () => {
      const oldAccountCode = getInputVal('bulk-old-account').trim();
      const newAccountCode = getInputVal('bulk-new-account').trim();
      const startDate = getInputVal('bulk-date-from');
      const endDate = getInputVal('bulk-date-to');

      if (!oldAccountCode || !newAccountCode || !startDate || !endDate) {
        return showToast('Por favor completa todos los campos', 'warning');
      }

      confirmDialog(
        'Confirmar Reemplazo Masivo',
        `¿Estás seguro de que deseas reemplazar la cuenta <strong>${esc(oldAccountCode)}</strong> por la cuenta <strong>${esc(newAccountCode)}</strong> en el lapso del <strong>${startDate}</strong> al <strong>${endDate}</strong>?<br><br>Esta acción modificará los asientos existentes de manera directa y no se puede deshacer de forma automática.`,
        async () => {
          try {
            showToast('Procesando reemplazo en lote...', 'info');
            const res = await pb.send('/api/gravy/bulk-replace-account', {
              method: 'POST',
              body: JSON.stringify({ oldAccountCode, newAccountCode, startDate, endDate }),
              headers: { 'Content-Type': 'application/json' }
            });

            if (res && res.success) {
              closeModal();
              showToast(res.message, 'success');
            } else {
              showToast(res.message || 'Ocurrió un error inesperado', 'error');
            }
          } catch (err: any) {
            showToast(err.message || 'Error al ejecutar el reemplazo', 'error');
          }
        }
      );
    });
  }

/* ══════════════════════════════════════════════════════════
   RENUMERACIÓN MASIVA DE DOCUMENTOS POR TIPO Y FECHA
══════════════════════════════════════════════════════════ */
async function _openRenumberTxModal() {
  const isSuperAdmin = requireRole('superadmin');
  const isAdmin = requireRole('admin') || isSuperAdmin;
  const userRole = String(pb.currentUser?.role || '').toLowerCase().trim();
  const isContador = userRole === 'contador' || requireRole('contador');
  if (!isSuperAdmin && !isAdmin && !isContador) {
    showToast('Solo Superadministradores, Administradores o Contadores pueden acceder a esta herramienta', 'error');
    return;
  }

  showToast('Cargando tipos de transacción...', 'info');
  let txTypes: any[] = [];
  try {
    txTypes = await pb.listAll('transaction_types', { sort: 'code' });
  } catch (err: any) {
    showToast('Error al cargar tipos de transacción: ' + err.message, 'error');
    return;
  }

  if (!txTypes || txTypes.length === 0) {
    showToast('No se encontraron tipos de transacción configurados', 'warning');
    return;
  }

  const optionsHtml = txTypes.map(t => {
    const pfx = t.prefix ? ` [${esc(t.prefix)}]` : '';
    const consec = t.consecutive !== undefined ? ` (Último consecutivo: ${t.consecutive})` : '';
    return `<option value="${esc(t.id)}">${esc(t.code)} — ${esc(t.name)}${pfx}${consec}</option>`;
  }).join('');

  // Fechas por defecto: primer y último día del mes actual (Hora Colombia)
  const firstDay = (window as any).getColombiaFirstDayOfMonth();
  const lastDay = (window as any).getColombiaLastDayOfMonth();

  openModal(
    'Renumeración Masiva de Consecutivos',
    `
    <div class="flex flex-col gap-4">
      <p class="text-sm" style="color:#4B5563">
        Esta utilidad permite renumerar secuencialmente la numeración de los documentos pertenecientes a un 
        <strong>tipo de transacción específico</strong> en orden cronológico (por fecha de emisión).
      </p>

      <div class="rounded-xl p-4 flex flex-col gap-3" style="background:#F8F9FB;border:1px solid #E5E7EB">
        <div>
          <label class="block text-xs font-bold uppercase mb-1" style="color:#374151">Tipo de transacción / documento <span class="text-red-500">*</span></label>
          <select id="renum-tx-type" class="form-select w-full">
            <option value="">-- Selecciona un tipo de transacción --</option>
            ${optionsHtml}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase mb-1" style="color:#374151">Fecha inicial (Opcional)</label>
            <input type="date" id="renum-date-from" class="form-input w-full" value="${firstDay}">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1" style="color:#374151">Fecha final (Opcional)</label>
            <input type="date" id="renum-date-to" class="form-input w-full" value="${lastDay}">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2" style="border-top:1px dashed #D1D5DB">
          <div>
            <label class="block text-xs font-bold uppercase mb-1" style="color:#374151">Desde Consecutivo Actual (Opcional)</label>
            <input type="number" id="renum-num-from" class="form-input w-full" placeholder="Ej: 1">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1" style="color:#374151">Hasta Consecutivo Actual (Opcional)</label>
            <input type="number" id="renum-num-to" class="form-input w-full" placeholder="Ej: 500">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-2" style="border-top:1px dashed #D1D5DB">
          <div>
            <label class="block text-xs font-bold uppercase mb-1" style="color:#374151">Nuevo Consecutivo Inicial <span class="text-red-500">*</span></label>
            <input type="number" id="renum-new-start" class="form-input w-full font-mono font-bold" min="1" step="1" value="1" placeholder="Ej: 1001">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase mb-1" style="color:#374151">Relleno de Dígitos (Padding)</label>
            <input type="number" id="renum-pad-digits" class="form-input w-full font-mono" min="1" max="12" value="8">
          </div>
        </div>

        <div class="p-3 rounded-lg text-xs flex gap-2 items-start" style="background:#FFFBEB;border:1px solid #FDE68A;color:#B45309">
          <i class="fas fa-triangle-exclamation mt-0.5 text-sm"></i>
          <div>
            <strong>Advertencia:</strong> La renumeración modificará permanentemente el número de los comprobantes seleccionados 
            en las tablas de transacciones y facturas asociadas. Descarga un respaldo antes de proceder.
          </div>
        </div>
      </div>
    </div>
    `,
    `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-renumber-tx-execute" style="background:#D97706;border-color:#D97706">
      <i class="fas fa-arrow-down-1-9 mr-1"></i> Ejecutar Renumeración
    </button>
    `,
    false
  );

  $('#btn-renumber-tx-execute')?.addEventListener('click', async () => {
    const txTypeId = getInputVal('renum-tx-type').trim();
    const startDate = getInputVal('renum-date-from').trim();
    const endDate = getInputVal('renum-date-to').trim();
    const fromNum = getInputVal('renum-num-from').trim();
    const toNum = getInputVal('renum-num-to').trim();
    const newStartConsecutive = parseInt(getInputVal('renum-new-start').trim() || '0', 10);
    const padDigits = parseInt(getInputVal('renum-pad-digits').trim() || '8', 10);

    if (!txTypeId) {
      return showToast('Debes seleccionar un tipo de transacción', 'warning');
    }
    if (isNaN(newStartConsecutive) || newStartConsecutive < 1) {
      return showToast('Debes ingresar un nuevo consecutivo inicial válido (mayor o igual a 1)', 'warning');
    }

    const selectedType = txTypes.find(t => t.id === txTypeId);
    const typeLabel = selectedType ? `${selectedType.code} - ${selectedType.name}` : txTypeId;
    const prefix = selectedType?.prefix || selectedType?.code || '';
    const exampleFormat = prefix ? `${prefix}-${String(newStartConsecutive).padStart(padDigits, '0')}` : `${newStartConsecutive}`;

    confirmDialog(
      'Confirmar Renumeración Masiva',
      `¿Estás seguro de que deseas renumerar los documentos de tipo <strong>${esc(typeLabel)}</strong>?<br><br>
       - <strong>Período:</strong> ${startDate && endDate ? `${startDate} al ${endDate}` : 'Todos los períodos'}<br>
       - <strong>Nuevo Consecutivo Inicial:</strong> ${newStartConsecutive} (Ejemplo: <code>${esc(exampleFormat)}</code>)<br><br>
       Esta acción cambiará de forma definitiva la numeración de los documentos coincidentes.`,
      async () => {
        try {
          showToast('Procesando renumeración de documentos en el servidor...', 'info');
          const res = await fetch(`${pb.baseUrl}/api/gravy/renumber-transactions`, {
            method: 'POST',
            body: JSON.stringify({
              txTypeId,
              startDate,
              endDate,
              fromNum: fromNum !== '' ? Number(fromNum) : null,
              toNum: toNum !== '' ? Number(toNum) : null,
              newStartConsecutive,
              padDigits
            }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': pb.authToken || ''
            }
          });

          const data = await res.json();
          if (res.ok && data && data.success) {
            closeModal();
            showToast(data.message, 'success', 6000);
            _loadSysInfo();
          } else {
            showToast((data && data.message) || 'Ocurrió un error inesperado al renumerar', 'error');
          }
        } catch (err: any) {
          showToast(err.message || 'Error al ejecutar la renumeración', 'error');
        }
      }
    );
  });
}

/* ══════════════════════════════════════════════════════════
   HELPER: modal con botones de acción (utiliza el router unificado de utils.ts)
══════════════════════════════════════════════════════════ */


function initKeyboardAutocomplete({
  input,
  results,
  itemSelector,
  onSelect
}) {
  if (!input || !results) return;

  let highlightedIndex = -1;

  const getItems = () => Array.from(results.querySelectorAll(itemSelector));

  const highlightItem = (index) => {
    const items = getItems();
    items.forEach((el) => {
      el.style.background = '';
      el.classList.remove('highlighted');
    });
    if (index >= 0 && index < items.length) {
      const el = items[index];
      el.style.background = '#EEF4FF';
      el.classList.add('highlighted');
      el.scrollIntoView({ block: 'nearest' });
    }
  };

  const handleKeyDown = (ev) => {
    if (results.style.display === 'none') return;
    const items = getItems();
    if (!items.length) return;

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
      highlightItem(highlightedIndex);
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
      highlightItem(highlightedIndex);
    } else if (ev.key === 'Enter') {
      const activeItems = getItems();
      const targetIndex = highlightedIndex >= 0 ? highlightedIndex : 0;
      const target = activeItems[targetIndex];
      if (target) {
        ev.preventDefault();
        if (typeof onSelect === 'function') {
          onSelect(target);
        } else {
          target.click();
        }
        results.style.display = 'none';
        highlightedIndex = -1;
      }
    } else if (ev.key === 'Escape') {
      results.style.display = 'none';
      highlightedIndex = -1;
    }
  };

  input.addEventListener('keydown', handleKeyDown);
  input.addEventListener('input', () => { highlightedIndex = -1; });
  input.addEventListener('focus', () => { highlightedIndex = -1; });
}

// --- VITE MIGRATION GLOBALS ---
(window as any).initKeyboardAutocomplete = initKeyboardAutocomplete;
(window as any)._loadLastBackupInfo = _loadLastBackupInfo;
(window as any).renderUtilidades = renderUtilidades;
(window as any)._executeMassTxImport = _executeMassTxImport;
(window as any)._handleCreateBackup = _handleCreateBackup;
(window as any)._massTxNormHeader = _massTxNormHeader;
(window as any)._massTxParseCsv = _massTxParseCsv;
(window as any)._massTxParseExcel = _massTxParseExcel;
(window as any)._openMassTxImportModal = _openMassTxImportModal;
(window as any).BACKUP_VERSION = BACKUP_VERSION;
(window as any)._massTxImportInProgress = _massTxImportInProgress;
(window as any)._massTxDocKey = _massTxDocKey;
(window as any)._openMassAccImportModal = _openMassAccImportModal;
(window as any)._massTpBuildDraft = _massTpBuildDraft;
(window as any)._massPhUnitsImportInProgress = _massPhUnitsImportInProgress;
(window as any)._downloadMassTpTemplate = _downloadMassTpTemplate;
(window as any)._downloadMassTxTemplate = _downloadMassTxTemplate;
(window as any)._massTpImportInProgress = _massTpImportInProgress;
(window as any).BACKUP_COLLECTIONS = BACKUP_COLLECTIONS;
(window as any)._massTxNum = _massTxNum;
(window as any)._downloadMassPhUnitsTemplate = _downloadMassPhUnitsTemplate;
(window as any)._massTxPick = _massTxPick;
(window as any)._openMassTpImportModal = _openMassTpImportModal;
(window as any)._massPhUnitsNormalizeRow = _massPhUnitsNormalizeRow;
(window as any)._massAccImportInProgress = _massAccImportInProgress;
(window as any)._handleRestoreFileSelected = _handleRestoreFileSelected;
(window as any)._restoreInProgress = _restoreInProgress;
(window as any)._massAccNormalizeRow = _massAccNormalizeRow;
(window as any)._openMassPhUnitsImportModal = _openMassPhUnitsImportModal;
(window as any)._downloadMassAccTemplate = _downloadMassAccTemplate;
(window as any)._downloadMassProductsTemplate = _downloadMassProductsTemplate;
(window as any)._openMassProductsImportModal = _openMassProductsImportModal;
(window as any)._generateTemplateXlsx = _generateTemplateXlsx;
(window as any)._doRestore = _doRestore;
(window as any)._backupInProgress = _backupInProgress;
(window as any)._massTpRenderPreview = _massTpRenderPreview;
(window as any)._massTxRenderPreview = _massTxRenderPreview;
(window as any)._massTxBuildDraft = _massTxBuildDraft;
(window as any)._loadSysInfo = _loadSysInfo;
(window as any)._executeMassTpImport = _executeMassTpImport;
(window as any)._openRenumberTxModal = _openRenumberTxModal;

