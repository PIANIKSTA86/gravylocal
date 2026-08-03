/**
 * GRAVY v2.0 — router.ts
 * Navegación SPA Multi-Tab entre módulos con preservación de estado DOM,
 * control de acceso por rol, licenciamiento y límite estricto de 8 pestañas.
 */

'use strict';

declare var $: any;
declare var $$: any;
declare var pb: any;
declare var can: any;
declare var hasModule: any;
declare var esc: any;
declare var showToast: any;
declare var renderDashboard: any;
declare var renderPlanCuentas: any;
declare var renderTerceros: any;
declare var renderTiposTx: any;
declare var renderConsultaTx: any;
declare var renderReportes: any;
declare var renderAuditoria: any;
declare var renderUsuarios: any;
declare var renderConfiguracion: any;
declare var renderUtilidades: any;
declare var renderConciliacion: any;
declare var renderNomina: any;
declare var renderFacturacionDIAN: any;
declare var renderDocumentosElectronicos: any;
declare var renderCierre: any;
declare var renderProductos: any;
declare var renderInventario: any;
declare var renderCompras: any;
declare var renderVentas: any;
declare var renderPedidos: any;
declare var renderPOS: any;
declare var renderPhFacturacionPage: any;
declare var renderPhCarteraPage: any;
declare var renderPhPresupuestoPage: any;
declare var renderPhUnidadesPage: any;
declare var renderPhReservasPage: any;
declare var renderPhPqrsPage: any;
declare var renderExogena: any;
declare var renderLicencias: any;
declare var renderSuperadmin: any;
declare var renderResoluciones: any;
declare var renderImportaciones: any;
declare var renderComisiones: any;
declare var renderInmobiliarias: any;
declare var renderCRM: any;
declare var renderDespachos: any;

const MAX_TABS = 8;

const PAGE_TITLES: Record<string, string> = {
  dashboard:         'Dashboard',
  'plan-cuentas':    'Plan de Cuentas',
  'cost-centers':    'Centros de Costo',
  'documentos-electronicos': 'Documentos Electrónicos',
  'doc-soporte':     'Documento Soporte Electrónico',
  terceros:          'Terceros',
  'tipos-tx':        'Tipos de Transacción',
  'nueva-tx':        'Transacciones',
  'consulta-tx':     'Consulta de Transacciones',
  reportes:          'Reportes',
  auditoria:         'Auditoría',
  usuarios:          'Usuarios',
  configuracion:     'Configuración',
  utilidades:        'Utilidades',
  conciliacion:      'Conciliación Bancaria',
  'agenda-pagos':    'Agenda de Pagos',
  'copro-facturacion':'Facturación PH',
  'copro-cartera':    'Cartera PH',
  'copro-presupuesto':'Presupuesto PH',
  'copro-unidades':   'Unidades PH',
  'copro-reservas':   'Reservas PH',
  'copro-pqrs':       'PQRs PH',
  nomina:            'Nómina',
  'nomina-empleados': 'Empleados',
  'nomina-contratos': 'Contratos',
  'nomina-periodos':  'Periodos',
  'nomina-novedades': 'Novedades',
  'nomina-distribucion-dotacion': 'Distribución Dotación',
  'nomina-liquidacion':'Liquidación',
  'nomina-electronica-p':'Nómina Electrónica',
  'facturacion-dian':'Validación de documentos DIAN',
  'cierre':          'Cierre Contable',
  productos:         'Productos y Servicios',
  inventario:        'Inventarios',
  compras:           'Compras de Bienes y Servicios',
  'compra-sugerida':  'Compra Sugerida',
  ventas:            'Ventas y Facturación Comercial',
  pedidos:           'Pedidos y Cotizaciones',
  'reservas-logistica':'Reservas de Importación',
  'tienda-virtual':  'Tienda Virtual',
  pos:               'Punto de Venta POS',
  spa:               'Spa de Mascotas',
  'spa-belleza':     'Spa de Belleza Humana',
  recaudos:          'Recaudos (RC)',
  egresos:           'Egresos (CE)',
  'cuentas-bancarias': 'Cuentas Bancarias',
  exogena:           'Información Exógena DIAN',
  licencias:         'Licencias y Módulos',
  superadmin:        'Panel SuperAdministrador',
  resoluciones:      'Resoluciones y Consecutivos DIAN',
  importaciones:     'Gestión de Importaciones',
  comisiones:        'Comisiones a Vendedores',
  inmobiliarias:     'Gestión Inmobiliaria',
  'inmo-contratos':   'Contratos de Arrendamiento',
  'inmo-liquidacion': 'Liquidación de Arrendamiento',
  crm:               'Seguimiento de Ventas (CRM)',
  despachos:         'Gestión de Despachos y Entregas',
  niif:              'Gestión NIIF (IFRS)',
  'niif-diagnostico': 'Diagnóstico NIIF',
  'niif-politicas':   'Políticas Contables NIIF',
  'niif-mapeo':       'Mapeo y Catálogo NIIF',
  'niif-arrendamientos': 'Arrendamientos NIIF 16',
  'fixed-assets-catalogo': 'Catálogo de Activos',
  'fixed-assets-categorias': 'Categorías y Mapeo',
  'fixed-assets-depreciacion': 'Depreciación Mensual',
  'fixed-assets-inventario': 'Inventario QR',
  'niif-impuesto':    'Impuesto Diferido NIIF',
  'niif-revelaciones':'Notas y Revelaciones NIIF',
  'niif-estados':     'Estados Financieros NIIF',
};

const PAGE_ICONS: Record<string, string> = {
  dashboard: 'fa-gauge-high',
  'plan-cuentas': 'fa-sitemap',
  'cost-centers': 'fa-folder-tree',
  terceros: 'fa-users',
  'tipos-tx': 'fa-list-check',
  'consulta-tx': 'fa-magnifying-glass',
  'facturacion-dian': 'fa-file-invoice',
  'documentos-electronicos': 'fa-folder-open',
  'doc-soporte': 'fa-file-signature',
  cierre: 'fa-calendar-check',
  exogena: 'fa-file-invoice-dollar',
  productos: 'fa-box-open',
  inventario: 'fa-warehouse',
  compras: 'fa-cart-flatbed',
  'compra-sugerida': 'fa-wand-magic-sparkles',
  crm: 'fa-funnel-dollar',
  pedidos: 'fa-file-signature',
  ventas: 'fa-receipt',
  pos: 'fa-cash-register',
  spa: 'fa-dog',
  'spa-belleza': 'fa-spa',
  comisiones: 'fa-percent',
  recaudos: 'fa-hand-holding-dollar',
  egresos: 'fa-money-bill-transfer',
  'cuentas-bancarias': 'fa-building-columns',
  conciliacion: 'fa-scale-balanced',
  'agenda-pagos': 'fa-calendar-day',
  'copro-facturacion': 'fa-file-invoice-dollar',
  'copro-cartera': 'fa-wallet',
  'copro-presupuesto': 'fa-sack-dollar',
  'copro-unidades': 'fa-building',
  'copro-reservas': 'fa-calendar-days',
  'copro-pqrs': 'fa-comments',
  inmobiliarias: 'fa-house-chimney-window',
  'inmo-contratos': 'fa-file-signature',
  'inmo-liquidacion': 'fa-file-invoice-dollar',
  importaciones: 'fa-ship',
  'reservas-logistica': 'fa-clipboard-check',
  despachos: 'fa-truck',
  'nomina-empleados': 'fa-users-gear',
  'nomina-contratos': 'fa-file-contract',
  'nomina-periodos': 'fa-calendar-days',
  'nomina-novedades': 'fa-notes-medical',
  'nomina-distribucion-dotacion': 'fa-shirt',
  'nomina-liquidacion': 'fa-calculator',
  'nomina-electronica-p': 'fa-file-invoice-dollar',
  'niif-diagnostico': 'fa-stethoscope',
  'niif-politicas': 'fa-book',
  'niif-mapeo': 'fa-sitemap',
  'niif-impuesto': 'fa-percent',
  'niif-revelaciones': 'fa-pen-to-square',
  'niif-estados': 'fa-file-invoice-dollar',
  'fixed-assets-catalogo': 'fa-list-check',
  'fixed-assets-categorias': 'fa-folder-tree',
  'fixed-assets-depreciacion': 'fa-calculator',
  'fixed-assets-inventario': 'fa-qrcode',
  reportes: 'fa-chart-pie',
  resoluciones: 'fa-file-signature',
  utilidades: 'fa-toolbox',
  superadmin: 'fa-crown',
  usuarios: 'fa-user-gear',
  auditoria: 'fa-clipboard-list',
  configuracion: 'fa-sliders',
  licencias: 'fa-key'
};

const MODULE_LICENSE: Record<string, string> = {
  'consulta-tx':      'contabilidad',
  'nueva-tx':         'contabilidad',
  'reportes':         'contabilidad',
  'cierre':           'contabilidad',
  'facturacion-dian': 'contabilidad',
  'exogena':          'contabilidad',
  'documentos-electronicos': 'contabilidad',
  'doc-soporte':      'contabilidad',
  'utilidades':       'contabilidad',
  'ventas':           'comercial',
  'pedidos':          'comercial',
  'reservas-logistica':'logistica',
  'tienda-virtual':   'tienda-virtual',
  'compras':          'inventarios',
  'productos':        'inventarios',
  'inventario':       'inventarios',
  'compra-sugerida':  'inventarios',
  'pos':              'comercial',
  'spa':              'spa',
  'spa-belleza':      'spa',
  'recaudos':         'tesoreria',
  'egresos':          'tesoreria',
  'cuentas-bancarias': 'tesoreria',
  'agenda-pagos':     'tesoreria',
  'conciliacion':     'conciliacion',
  'nomina':           'nomina',
  'nomina-empleados':  'nomina',
  'nomina-contratos':  'nomina',
  'nomina-periodos':   'nomina',
  'nomina-novedades':  'nomina',
  'nomina-distribucion-dotacion': 'nomina',
  'nomina-liquidacion':'nomina',
  'nomina-electronica-p':'nomina',
  'copro-facturacion': 'copropiedades',
  'copro-cartera':     'copropiedades',
  'copro-presupuesto': 'copropiedades',
  'copro-unidades':    'copropiedades',
  'copro-reservas':    'copropiedades',
  'copro-pqrs':        'copropiedades',
  'importaciones':     'logistica',
  'comisiones':        'comercial',
  'inmobiliarias':     'inmobiliarias',
  'inmo-contratos':    'inmobiliarias',
  'inmo-liquidacion':  'inmobiliarias',
  'crm':               'crm',
  'despachos':         'logistica',
  'niif':              'niif',
  'niif-diagnostico':  'niif',
  'niif-politicas':    'niif',
  'niif-mapeo':        'niif',
  'niif-arrendamientos':'niif',
  'fixed-assets-catalogo': 'activos_fijos',
  'fixed-assets-categorias': 'activos_fijos',
  'fixed-assets-depreciacion': 'activos_fijos',
  'fixed-assets-inventario': 'activos_fijos',
  'niif-impuesto':     'niif',
  'niif-revelaciones': 'niif',
  'niif-estados':      'niif',
};

const MODULE_LABELS: Record<string, string> = {
  contabilidad:  'Contabilidad',
  comercial:     'Comercial (Ventas, Compras, POS, Inventario)',
  nomina:        'Nómina',
  copropiedades: 'Copropiedades',
  inmobiliarias: 'Gestión Inmobiliaria',
  logistica:     'Logística e Importaciones',
  inventarios:   'Inventarios y Catálogo',
  tesoreria:     'Tesorería y Bancos',
  'tienda-virtual': 'Tienda Virtual',
  spa:           'Módulo SPA (Belleza & Mascotas)',
  conciliacion:  'Conciliación Bancaria',
  niif:          'NIIF (Normas Internacionales)',
  activos_fijos: 'Activos Fijos',
  full:          'Full',
};

const PAGE_RENDERERS: Record<string, (container: HTMLElement) => void> = {
  dashboard:          (c) => typeof renderDashboard      === 'function' && renderDashboard(c),
  'plan-cuentas':     (c) => typeof renderPlanCuentas    === 'function' && renderPlanCuentas(c),
  'cost-centers':     (c) => typeof (window as any).renderCostCenters === 'function' && (window as any).renderCostCenters(c),
  terceros:           (c) => typeof renderTerceros        === 'function' && renderTerceros(c),
  'tipos-tx':         (c) => typeof renderTiposTx         === 'function' && renderTiposTx(c),
  'nueva-tx':         (c) => typeof (window as any).openNuevaTxModal === 'function' && (window as any).openNuevaTxModal(c),
  'consulta-tx':      (c) => typeof renderConsultaTx      === 'function' && renderConsultaTx(c),
  reportes:           (c) => typeof renderReportes        === 'function' && renderReportes(c),
  auditoria:          (c) => typeof renderAuditoria       === 'function' && renderAuditoria(c),
  usuarios:           (c) => typeof renderUsuarios        === 'function' && renderUsuarios(c),
  configuracion:      (c) => typeof renderConfiguracion   === 'function' && renderConfiguracion(c),
  utilidades:         (c) => typeof renderUtilidades      === 'function' && renderUtilidades(c),
  conciliacion:       (c) => typeof renderConciliacion    === 'function' && renderConciliacion(c),
  nomina:             (c) => typeof renderNomina           === 'function' && renderNomina(c),
  'nomina-empleados':   (c) => typeof (window as any).renderNominaEmpleados === 'function' && (window as any).renderNominaEmpleados(c),
  'nomina-contratos':   (c) => typeof (window as any).renderNominaContratos === 'function' && (window as any).renderNominaContratos(c),
  'nomina-periodos':    (c) => typeof (window as any).renderNominaPeriodosPage === 'function' && (window as any).renderNominaPeriodosPage(c),
  'nomina-novedades':   (c) => typeof (window as any).renderNominaNovedadesPage === 'function' && (window as any).renderNominaNovedadesPage(c),
  'nomina-distribucion-dotacion': (c) => typeof (window as any).renderNominaDistribucionDotacionPage === 'function' && (window as any).renderNominaDistribucionDotacionPage(c),
  'nomina-liquidacion': (c) => typeof (window as any).renderNominaLiquidacionPage === 'function' && (window as any).renderNominaLiquidacionPage(c),
  'nomina-electronica-p':(c) => typeof (window as any).renderNominaElectronicaPage === 'function' && (window as any).renderNominaElectronicaPage(c),
  'facturacion-dian': (c) => typeof renderFacturacionDIAN === 'function' && renderFacturacionDIAN(c),
  'documentos-electronicos': (c) => typeof renderDocumentosElectronicos === 'function' && renderDocumentosElectronicos(c),
  'doc-soporte':      (c) => typeof (window as any).renderDocSoporte === 'function' && (window as any).renderDocSoporte(c),
  'cierre':           (c) => typeof renderCierre           === 'function' && renderCierre(c),
  productos:          (c) => typeof renderProductos         === 'function' && renderProductos(c),
  inventario:         (c) => typeof renderInventario        === 'function' && renderInventario(c),
  compras:            (c) => typeof renderCompras           === 'function' && renderCompras(c),
  'compra-sugerida':  (c) => typeof (window as any).renderCompraSugerida === 'function' && (window as any).renderCompraSugerida(c),
  ventas:             (c) => typeof renderVentas            === 'function' && renderVentas(c),
  pedidos:            (c) => typeof renderPedidos           === 'function' && renderPedidos(c),
  'reservas-logistica': (c) => typeof (window as any).renderReservasImportacion === 'function' && (window as any).renderReservasImportacion(c),
  'tienda-virtual':   () => {},
  pos:                (c) => typeof renderPOS               === 'function' && renderPOS(c),
  spa:                (c) => typeof (window as any).renderSpa === 'function' && (window as any).renderSpa(c),
  'spa-belleza':      (c) => typeof (window as any).renderSpaBelleza === 'function' && (window as any).renderSpaBelleza(c),
  copropiedades:      () => navigate('copro-facturacion'),
  'copro-facturacion': (c) => typeof renderPhFacturacionPage === 'function' && renderPhFacturacionPage(c),
  'copro-cartera':     (c) => typeof renderPhCarteraPage     === 'function' && renderPhCarteraPage(c),
  'copro-presupuesto': (c) => typeof renderPhPresupuestoPage === 'function' && renderPhPresupuestoPage(c),
  'copro-unidades':    (c) => typeof renderPhUnidadesPage    === 'function' && renderPhUnidadesPage(c),
  'copro-reservas':    (c) => typeof renderPhReservasPage    === 'function' && renderPhReservasPage(c),
  'copro-pqrs':        (c) => typeof renderPhPqrsPage        === 'function' && renderPhPqrsPage(c),
  recaudos:           (c) => typeof (window as any).showRecaudosScreen === 'function' && (window as any).showRecaudosScreen(c),
  egresos:            (c) => typeof (window as any).showEgresosScreen === 'function' && (window as any).showEgresosScreen(c),
  'cuentas-bancarias': (c) => typeof (window as any).showBankAccountsScreen === 'function' && (window as any).showBankAccountsScreen(c),
  'agenda-pagos':     (c) => typeof (window as any).renderAgendaPagos === 'function' && (window as any).renderAgendaPagos(c),
  exogena:            (c) => typeof renderExogena           === 'function' && renderExogena(c),
  licencias:          (c) => typeof renderLicencias         === 'function' && renderLicencias(c),
  superadmin:         (c) => typeof renderSuperadmin        === 'function' && renderSuperadmin(c),
  resoluciones:       (c) => typeof renderResoluciones      === 'function' && renderResoluciones(c),
  importaciones:      (c) => typeof renderImportaciones     === 'function' && renderImportaciones(c),
  comisiones:         (c) => typeof renderComisiones        === 'function' && renderComisiones(c),
  inmobiliarias:      (c) => typeof renderInmobiliarias     === 'function' && renderInmobiliarias(c),
  'inmo-contratos':   (c) => typeof (window as any).renderInmoContratosPage === 'function' && (window as any).renderInmoContratosPage(c),
  'inmo-liquidacion': (c) => typeof (window as any).renderInmoLiquidacionPage === 'function' && (window as any).renderInmoLiquidacionPage(c),
  crm:                (c) => typeof renderCRM              === 'function' && renderCRM(c),
  despachos:          (c) => typeof renderDespachos        === 'function' && renderDespachos(c),
  niif:               () => navigate('niif-diagnostico'),
  'niif-diagnostico': (c) => typeof (window as any).renderNIIF === 'function' && (window as any).renderNIIF(c, 'diagnostico'),
  'niif-politicas':   (c) => typeof (window as any).renderNIIF === 'function' && (window as any).renderNIIF(c, 'politicas'),
  'niif-mapeo':       (c) => typeof (window as any).renderNIIF === 'function' && (window as any).renderNIIF(c, 'mapeo'),
  'niif-arrendamientos': (c) => typeof (window as any).renderNIIF === 'function' && (window as any).renderNIIF(c, 'arrendamientos'),
  'fixed-assets-catalogo': (c) => typeof (window as any).renderTabActivosSidebar === 'function' && (window as any).renderTabActivosSidebar(c, 'catalogo'),
  'fixed-assets-categorias': (c) => typeof (window as any).renderTabActivosSidebar === 'function' && (window as any).renderTabActivosSidebar(c, 'categorias'),
  'fixed-assets-depreciacion': (c) => typeof (window as any).renderTabActivosSidebar === 'function' && (window as any).renderTabActivosSidebar(c, 'depreciacion'),
  'fixed-assets-inventario': (c) => typeof (window as any).renderTabActivosSidebar === 'function' && (window as any).renderTabActivosSidebar(c, 'inventario'),
  'niif-impuesto':    (c) => typeof (window as any).renderNIIF === 'function' && (window as any).renderNIIF(c, 'impuesto'),
  'niif-revelaciones':(c) => typeof (window as any).renderNIIF === 'function' && (window as any).renderNIIF(c, 'revelaciones'),
  'niif-estados':     (c) => typeof (window as any).renderNIIF === 'function' && (window as any).renderNIIF(c, 'estados'),
};

interface TabItem {
  page: string;
  title: string;
  icon: string;
  pane: HTMLElement;
}

let openTabs: TabItem[] = [];
let currentPage: string = 'dashboard';

/** Guarda la lista de pestañas abiertas y la pestaña activa en sessionStorage */
function saveTabsState(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    const serialized = openTabs.map(t => ({
      page: t.page,
      title: t.title,
      icon: t.icon,
    }));
    sessionStorage.setItem('gravy_open_tabs', JSON.stringify(serialized));
    sessionStorage.setItem('gravy_current_page', currentPage);
  } catch (e) {
    console.warn('[Router] Error guardando estado de pestañas:', e);
  }
}

/** Restaura el estado de las pestañas previas al recargar la página */
function restoreTabsState(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    const rawTabs = sessionStorage.getItem('gravy_open_tabs');
    const savedPage = sessionStorage.getItem('gravy_current_page');
    if (!rawTabs) return false;

    const list: Array<{ page: string; title?: string; icon?: string }> = JSON.parse(rawTabs);
    if (!Array.isArray(list) || list.length === 0) return false;

    openTabs = [];
    const pageContent = $('#page-content');
    if (pageContent) pageContent.innerHTML = '';

    list.forEach(item => {
      if (!item.page) return;
      if (item.page.startsWith('doc-')) {
        const docRaw = sessionStorage.getItem(`gravy_doc_tab_${item.page}`);
        if (docRaw) {
          try {
            const docData = JSON.parse(docRaw);
            openDocumentTab(docData.pageKey, docData.title, docData.icon, docData.formHtml, docData.footerHtml);
            return;
          } catch (_) {}
        }
      }
      if (PAGE_RENDERERS[item.page]) {
        navigate(item.page);
      }
    });

    const targetPage = savedPage && openTabs.some(t => t.page === savedPage) ? savedPage : (openTabs[0]?.page || 'dashboard');
    navigate(targetPage);
    return openTabs.length > 0;
  } catch (e) {
    console.warn('[Router] Error restaurando estado de pestañas:', e);
    return false;
  }
}

/** Limpia la memoria de pestañas en sessionStorage al cerrar sesión */
function clearTabsState(): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem('gravy_open_tabs');
    sessionStorage.removeItem('gravy_current_page');
    Object.keys(sessionStorage).forEach(k => {
      if (k.startsWith('gravy_doc_tab_')) sessionStorage.removeItem(k);
    });
  } catch (_) {}
}

/** Renderiza la pantalla de módulo bloqueado por licencia */
function showLockedModulePage(page: string, requiredModule: string, container?: HTMLElement): void {
  const content = container || $('#page-content');
  if (!content) return;

  const moduleLabel = (MODULE_LABELS as any)[requiredModule] || requiredModule;
  const pageTitle   = (PAGE_TITLES as any)[page] || page;
  const isAdmin     = pb?.currentUser?.role === 'admin';

  content.innerHTML = `
    <div class="flex flex-col items-center justify-center anim-fade" style="min-height:60vh;gap:20px;text-align:center;padding:40px 20px">
      <div style="
        width:88px;height:88px;border-radius:28px;
        background:linear-gradient(135deg,rgba(127,124,255,.15),rgba(100,225,255,.10));
        border:1.5px solid rgba(127,124,255,.25);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 40px rgba(127,124,255,.15);
        animation:fadeIn .5s ease">
        <i class="fas fa-lock" style="font-size:34px;color:#7F7CFF"></i>
      </div>
      <div style="max-width:440px">
        <h2 style="font-size:22px;font-weight:800;color:#0B1635;margin-bottom:10px">
          Módulo no disponible
        </h2>
        <p style="font-size:14px;color:#61708F;line-height:1.7;margin-bottom:6px">
          <strong style="color:#374151">${esc(pageTitle)}</strong> requiere el módulo
          <span style="
            display:inline-block;padding:2px 12px;border-radius:20px;
            background:#EEF4FF;color:#2446B8;font-weight:700;font-size:12px;
            margin:0 4px">${esc(moduleLabel)}</span>
          que no está habilitado en tu licencia actual.
        </p>
        <p style="font-size:13px;color:#9CA3AF;line-height:1.6">
          Contacta a tu proveedor GRAVY para activar este módulo.
        </p>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:8px">
        <button class="btn btn-outline" onclick="navigate('dashboard')">
          <i class="fas fa-house"></i> Ir al Dashboard
        </button>
        ${isAdmin ? `
        <button class="btn btn-secondary" onclick="navigate('licencias')">
          <i class="fas fa-key"></i> Ver Licencias
        </button>` : ''}
      </div>
    </div>`;
}

/** Renderiza y actualiza la barra visual de pestañas superior */
function renderTabBar(): void {
  const listContainer = $('#gravy-tabs-list');
  const counterEl = $('#gravy-tabs-counter');
  
  if (!listContainer) return;

  if (counterEl) {
    counterEl.textContent = `${openTabs.length} / ${MAX_TABS} Tabs`;
    counterEl.classList.toggle('limit-reached', openTabs.length >= MAX_TABS);
  }

  listContainer.innerHTML = openTabs.map(tab => {
    const isActive = tab.page === currentPage;
    const isDashboard = tab.page === 'dashboard';
    return `
      <div class="gravy-tab-pill ${isActive ? 'active' : ''}" onclick="navigate('${tab.page}')" title="${esc(tab.title)}">
        <i class="fas ${tab.icon} text-xs"></i>
        <span>${esc(tab.title)}</span>
        ${!isDashboard ? `
          <span class="gravy-tab-close" onclick="closeTab('${tab.page}', event)" title="Cerrar pestaña">
            <i class="fas fa-times"></i>
          </span>` : ''}
      </div>
    `;
  }).join('');
}

/** Cierra una pestaña abierta liberando su contenedor DOM */
function closeTab(page: string, event?: Event): void {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  if (page === 'dashboard') return; // El dashboard no se cierra

  const tabIndex = openTabs.findIndex(t => t.page === page);
  if (tabIndex === -1) return;

  const tabToClose = openTabs[tabIndex];
  if (tabToClose.pane && tabToClose.pane.parentNode) {
    tabToClose.pane.parentNode.removeChild(tabToClose.pane);
  }

  openTabs.splice(tabIndex, 1);

  if (page.startsWith('doc-')) {
    delete PAGE_RENDERERS[page];
    delete PAGE_TITLES[page];
    delete PAGE_ICONS[page];
    if (typeof sessionStorage !== 'undefined') {
      try { sessionStorage.removeItem(`gravy_doc_tab_${page}`); } catch (_) {}
    }
  }

  saveTabsState();

  if (currentPage === page) {
    const nextTab = openTabs[Math.max(0, tabIndex - 1)] || openTabs[0];
    if (nextTab) {
      navigate(nextTab.page);
    } else {
      navigate('dashboard');
    }
  } else {
    renderTabBar();
  }
}

/** Alterna la visibilidad del menú desplegable de opciones de pestañas */
function toggleTabsOptionsMenu(event?: Event): void {
  if (event) event.stopPropagation();
  const menu = document.getElementById('gravy-tabs-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

/** Oculta el menú desplegable de opciones de pestañas */
function hideTabsOptionsMenu(): void {
  const menu = document.getElementById('gravy-tabs-menu');
  if (menu) {
    menu.classList.add('hidden');
  }
}

// Escuchador global para cerrar el menú desplegable si se hace clic fuera
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const menuBtn = document.getElementById('gravy-tabs-menu-btn');
    const menu = document.getElementById('gravy-tabs-menu');
    if (menu && !menu.classList.contains('hidden')) {
      const target = e.target as Node;
      if (menuBtn && !menuBtn.contains(target) && !menu.contains(target)) {
        menu.classList.add('hidden');
      }
    }
  });
}

/** Cierra todas las pestañas excepto la especificada (por defecto la activa) */
function closeOtherTabs(page?: string): void {
  const targetPage = typeof page === 'string' && page ? page : (currentPage || (window as any).currentPage || 'dashboard');
  const tabsToKeep = openTabs.filter(t => t.page === targetPage || t.page === 'dashboard');
  const tabsToRemove = openTabs.filter(t => t.page !== targetPage && t.page !== 'dashboard');

  tabsToRemove.forEach(tab => {
    if (tab.pane && tab.pane.parentNode) {
      tab.pane.parentNode.removeChild(tab.pane);
    }
    if (tab.page.startsWith('doc-')) {
      delete PAGE_RENDERERS[tab.page];
      delete PAGE_TITLES[tab.page];
      delete PAGE_ICONS[tab.page];
    }
  });

  openTabs = tabsToKeep;
  navigate(targetPage);
  hideTabsOptionsMenu();
}

/** Cierra todas las pestañas volviendo al Dashboard */
function closeAllTabs(): void {
  const tabsToKeep = openTabs.filter(t => t.page === 'dashboard');
  const tabsToRemove = openTabs.filter(t => t.page !== 'dashboard');

  tabsToRemove.forEach(tab => {
    if (tab.pane && tab.pane.parentNode) {
      tab.pane.parentNode.removeChild(tab.pane);
    }
    if (tab.page.startsWith('doc-')) {
      delete PAGE_RENDERERS[tab.page];
      delete PAGE_TITLES[tab.page];
      delete PAGE_ICONS[tab.page];
    }
  });

  openTabs = tabsToKeep;
  navigate('dashboard');
  hideTabsOptionsMenu();
}

/**
 * Función Principal de Navegación SPA por Pestañas
 */
function navigate(page: string): void {
  // Manejo especial de redirección a tienda virtual externa
  if (page === 'tienda-virtual') {
    window.open('/store.html', '_blank');
    return;
  }

  // Alias y redirecciones
  if (page === 'nueva-tx') page = 'consulta-tx';
  if (page === 'copropiedades') page = 'copro-facturacion';
  if (page === 'niif') page = 'niif-diagnostico';

  if (!PAGE_RENDERERS[page]) { page = 'dashboard'; }

  // Control global de clase POS y sucursales
  document.body.classList.remove('pos-active-page');
  const selector = document.getElementById('global-branch-selector') as HTMLSelectElement;
  if (selector && page !== 'pos') {
    selector.disabled = false;
  }

  // Verificar licencias de módulo
  const requiredModule = (MODULE_LICENSE as any)[page];
  if (requiredModule && typeof hasModule === 'function' && !hasModule(requiredModule)) {
    currentPage = page;
    (window as any).currentPage = page;
    $('#page-title').textContent = (PAGE_TITLES as any)[page] ?? page;
    showLockedModulePage(page, requiredModule);
    return;
  }

  // Verificar permisos por rol
  if (page === 'usuarios' && typeof can === 'function' && !can('canManageUsers')) {
    if (typeof showToast === 'function') showToast('No tienes permiso para acceder a esta sección', 'error');
    return;
  }
  if (page === 'auditoria' && typeof can === 'function' && !can('canViewAudit')) {
    if (typeof showToast === 'function') showToast('No tienes permiso para acceder a esta sección', 'error');
    return;
  }

  // Verificar si la pestaña ya existe y si su contenedor pane sigue adjunto al DOM
  let tab = openTabs.find(t => t.page === page);

  if (!tab || !tab.pane || !tab.pane.parentNode) {
    // Verificar límite de 8 pestañas abiertas (solo si es una pestaña totalmente nueva)
    if (!tab && openTabs.length >= MAX_TABS) {
      if (typeof showToast === 'function') {
        showToast(`Límite máximo de ${MAX_TABS} pestañas alcanzado. Cierra una pestaña antes de abrir otra.`, 'warning');
      }
      return;
    }

    // Crear o renovar el contenedor pane DOM para la pestaña
    const pageContent = $('#page-content');
    if (!pageContent) return;

    const pane = document.createElement('div');
    pane.id = `tab-pane-${page}`;
    pane.className = `tab-pane tab-pane-${page}`;
    pageContent.appendChild(pane);

    if (tab) {
      tab.pane = pane;
    } else {
      tab = {
        page,
        title: PAGE_TITLES[page] || page,
        icon: PAGE_ICONS[page] || 'fa-folder',
        pane
      };
      openTabs.push(tab);
    }

    // Renderizar la vista dentro del nuevo pane
    try {
      if (typeof PAGE_RENDERERS[page] === 'function') {
        PAGE_RENDERERS[page](pane);
      }
    } catch (err: any) {
      console.error(`[Router] Error renderizando ${page}:`, err);
      pane.innerHTML = `
        <div class="flex flex-col items-center justify-center" style="height:60vh;gap:16px">
          <i class="fas fa-circle-exclamation text-4xl" style="color:#EF4444"></i>
          <p class="font-semibold" style="color:#374151">Error al cargar el módulo</p>
          <p class="text-sm" style="color:#9CA3AF">${esc(err.message)}</p>
          <button class="btn btn-outline" onclick="navigate('${page}')"><i class="fas fa-rotate-right"></i> Reintentar</button>
        </div>`;
    }
  }

  // Activar la pestaña solicitada y ocultar las demás
  currentPage = page;
  (window as any).currentPage = page;

  openTabs.forEach(t => {
    if (t.pane) {
      t.pane.classList.toggle('active', t.page === page);
    }
  });

  // Activar modo POS si aplica
  if (page === 'pos') {
    document.body.classList.add('pos-active-page');
  }

  // Actualizar Sidebar activo
  $$('#nav-menu .nav-item').forEach((n: any) => n.classList.toggle('active', n.dataset.page === page));

  // Auto-expandir menú lateral
  const activeItem = document.querySelector(`#nav-menu .nav-item[data-page="${page}"]`);
  if (activeItem && !document.getElementById('sidebar')?.classList.contains('collapsed')) {
    let prev = activeItem.previousElementSibling;
    while (prev && !prev.classList.contains('nav-section')) {
      prev = prev.previousElementSibling;
    }
    if (prev) {
      const activeSectionId = (prev as HTMLElement).dataset.section;
      if (activeSectionId) {
        document.querySelectorAll('#nav-menu .nav-section').forEach((sec: any) => {
          const secId = sec.dataset.section;
          if (secId) {
            localStorage.setItem(`section-collapsed-${secId}`, secId === activeSectionId ? '0' : '1');
          }
        });
      }
    }
  }

  if (typeof (window as any).applyModuleVisibility === 'function') {
    (window as any).applyModuleVisibility();
  }

  $('#page-title').textContent = PAGE_TITLES[page] ?? page;
  $('#sidebar')?.classList.remove('open');

  // Renderizar la barra de pestañas visual
  renderTabBar();
  saveTabsState();
}

/**
 * Abre o registra una pestaña de documento independiente a pantalla completa
 */
function openDocumentTab(pageKey: string, title: string, icon: string, formHtml: string, footerHtml: string, onMounted?: () => void) {
  PAGE_TITLES[pageKey] = title;
  PAGE_ICONS[pageKey] = icon || 'fa-file-signature';

  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem(`gravy_doc_tab_${pageKey}`, JSON.stringify({ pageKey, title, icon, formHtml, footerHtml }));
    } catch (_) {}
  }

  // Si la pestaña ya existía en openTabs, renovar su contenedor
  const existingIndex = openTabs.findIndex(t => t.page === pageKey);
  if (existingIndex !== -1) {
    const oldTab = openTabs[existingIndex];
    if (oldTab.pane && oldTab.pane.parentNode) {
      oldTab.pane.parentNode.removeChild(oldTab.pane);
    }
    openTabs.splice(existingIndex, 1);
  }

  PAGE_RENDERERS[pageKey] = (pane: HTMLElement) => {
    if (!pane) {
      console.warn(`[openDocumentTab] Pane is null for ${pageKey}`);
      return;
    }
    pane.innerHTML = `
      <div class="bg-white rounded-2xl border p-6 shadow-sm mb-6 anim-fade" style="border-color:#E2E8F0">
        <div class="flex items-center justify-between pb-4 mb-5 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-lg">
              <i class="fas ${icon || 'fa-file-signature'}"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">${esc(title)}</h3>
              <p class="text-xs text-gray-500">Formulario a pantalla completa — Puedes alternar entre pestañas sin perder tus cambios</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="btn btn-outline btn-sm" onclick="closeTab('${pageKey}')">
              <i class="fas fa-times mr-1"></i> Cerrar Pestaña
            </button>
          </div>
        </div>

        <div class="form-body-area py-2">
          ${formHtml}
        </div>

        <div class="form-footer-area pt-4 mt-6 border-t border-gray-200 flex items-center justify-between">
          ${footerHtml}
        </div>
      </div>
    `;

    if (typeof onMounted === 'function') {
      try { onMounted(); } catch (e) { console.error("onMounted error:", e); }
    }
  };

  navigate(pageKey);
}

// --- GLOBALS EXPORTS ---
(window as any).PAGE_RENDERERS = PAGE_RENDERERS;
(window as any).currentPage = currentPage;
(window as any).PAGE_TITLES = PAGE_TITLES;
(window as any).MODULE_LICENSE = MODULE_LICENSE;
(window as any).MODULE_LABELS = MODULE_LABELS;
(window as any).showLockedModulePage = showLockedModulePage;
(window as any).navigate = navigate;
(window as any).closeTab = closeTab;
(window as any).closeOtherTabs = closeOtherTabs;
(window as any).closeAllTabs = closeAllTabs;
(window as any).openDocumentTab = openDocumentTab;
(window as any).toggleTabsOptionsMenu = toggleTabsOptionsMenu;
(window as any).hideTabsOptionsMenu = hideTabsOptionsMenu;
(window as any).saveTabsState = saveTabsState;
(window as any).restoreTabsState = restoreTabsState;
(window as any).clearTabsState = clearTabsState;
