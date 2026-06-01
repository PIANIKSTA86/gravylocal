/**
 * GRAVY v2.0 — router.ts
 * Navegación SPA entre módulos con control de acceso por rol y licencia.
 */

'use strict';

const PAGE_TITLES = {
  dashboard:         'Dashboard',
  'plan-cuentas':    'Plan de Cuentas',
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
  copropiedades:     'Copropiedades',
  nomina:            'Nómina',
  'facturacion-dian':'Facturación Electrónica DIAN',
  'cierre':          'Cierre Contable',
  productos:         'Productos y Servicios',
  inventario:        'Inventarios',
  compras:           'Compras de Bienes y Servicios',
  ventas:            'Ventas y Facturación Comercial',
  pedidos:           'Pedidos y Cotizaciones',
  pos:               'Punto de Venta POS',
  tesoreria:         'Tesorería',
  exogena:           'Información Exógena DIAN',
  licencias:         'Licencias y Módulos',
  superadmin:        'Panel SuperAdministrador',
  resoluciones:      'Resoluciones y Consecutivos DIAN',
  importaciones:     'Gestión de Importaciones',
};

// Módulo de licencia requerido por cada página.
// Las páginas sin entrada aqui son siempre accesibles (core).
const MODULE_LICENSE: Record<string, string> = {
  'consulta-tx':      'contabilidad',
  'nueva-tx':         'contabilidad',
  'reportes':         'contabilidad',
  'cierre':           'contabilidad',
  'facturacion-dian': 'contabilidad',
  'exogena':          'contabilidad',
  'utilidades':       'contabilidad',
  'ventas':           'comercial',
  'pedidos':          'comercial',
  'compras':          'comercial',
  'productos':        'comercial',
  'inventario':       'comercial',
  'pos':              'comercial',
  'tesoreria':        'comercial',
  'conciliacion':     'comercial',
  'nomina':           'nomina',
  'copropiedades':    'copropiedades',
  'importaciones':     'comercial',
};

// Etiquetas visibles de los módulos para mensajes al usuario
const MODULE_LABELS: Record<string, string> = {
  contabilidad:  'Contabilidad',
  comercial:     'Comercial (Ventas, Compras, POS, Inventario)',
  nomina:        'Nómina',
  copropiedades: 'Copropiedades',
  full:          'Full',
};

const PAGE_RENDERERS = {
  dashboard:          () => typeof renderDashboard      === 'function' && renderDashboard($('#page-content')),
  'plan-cuentas':     () => typeof renderPlanCuentas    === 'function' && renderPlanCuentas($('#page-content')),
  terceros:           () => typeof renderTerceros        === 'function' && renderTerceros($('#page-content')),
  'tipos-tx':         () => typeof renderTiposTx         === 'function' && renderTiposTx($('#page-content')),
  'nueva-tx':         () => navigate('consulta-tx'),
  'consulta-tx':      () => typeof renderConsultaTx      === 'function' && renderConsultaTx($('#page-content')),
  reportes:           () => typeof renderReportes        === 'function' && renderReportes($('#page-content')),
  auditoria:          () => typeof renderAuditoria       === 'function' && renderAuditoria($('#page-content')),
  usuarios:           () => typeof renderUsuarios        === 'function' && renderUsuarios($('#page-content')),
  configuracion:      () => typeof renderConfiguracion   === 'function' && renderConfiguracion($('#page-content')),
  utilidades:         () => typeof renderUtilidades      === 'function' && renderUtilidades($('#page-content')),
  conciliacion:       () => typeof renderConciliacion    === 'function' && renderConciliacion($('#page-content')),
  nomina:             () => typeof renderNomina           === 'function' && renderNomina($('#page-content')),
  'facturacion-dian': () => typeof renderFacturacionDIAN === 'function' && renderFacturacionDIAN($('#page-content')),
  'cierre':           () => typeof renderCierre           === 'function' && renderCierre($('#page-content')),
  productos:          () => typeof renderProductos         === 'function' && renderProductos($('#page-content')),
  inventario:         () => typeof renderInventario        === 'function' && renderInventario($('#page-content')),
  compras:            () => typeof renderCompras           === 'function' && renderCompras($('#page-content')),
  ventas:             () => typeof renderVentas            === 'function' && renderVentas($('#page-content')),
  pedidos:            () => typeof renderPedidos           === 'function' && renderPedidos($('#page-content')),
  pos:                () => typeof renderPOS               === 'function' && renderPOS($('#page-content')),
  copropiedades:      () => typeof renderCopropiedades     === 'function' && renderCopropiedades($('#page-content')),
  tesoreria:          () => typeof showTesoreriaScreen     === 'function' && showTesoreriaScreen($('#page-content')),
  exogena:            () => typeof renderExogena           === 'function' && renderExogena($('#page-content')),
  licencias:          () => typeof renderLicencias         === 'function' && renderLicencias($('#page-content')),
  superadmin:         () => typeof renderSuperadmin        === 'function' && renderSuperadmin($('#page-content')),
  resoluciones:       () => typeof renderResoluciones      === 'function' && renderResoluciones($('#page-content')),
  importaciones:      () => typeof renderImportaciones     === 'function' && renderImportaciones($('#page-content')),
};

let currentPage = 'dashboard';

/** Renderiza una pantalla premium de módulo bloqueado */
function showLockedModulePage(page: string, requiredModule: string): void {
  const content = $('#page-content');
  if (!content) return;

  const moduleLabel = (MODULE_LABELS as any)[requiredModule] || requiredModule;
  const pageTitle   = (PAGE_TITLES as any)[page] || page;
  const isAdmin     = pb?.currentUser?.role === 'admin';

  content.innerHTML = `
    <div class="flex flex-col items-center justify-center anim-fade" style="min-height:60vh;gap:20px;text-align:center;padding:40px 20px">
      <!-- Ícono de candado animado -->
      <div style="
        width:88px;height:88px;border-radius:28px;
        background:linear-gradient(135deg,rgba(127,124,255,.15),rgba(100,225,255,.10));
        border:1.5px solid rgba(127,124,255,.25);
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 0 40px rgba(127,124,255,.15);
        animation:fadeIn .5s ease">
        <i class="fas fa-lock" style="font-size:34px;color:#7F7CFF"></i>
      </div>

      <!-- Texto principal -->
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

      <!-- Acciones -->
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:8px">
        <button class="btn btn-outline" onclick="navigate('dashboard')">
          <i class="fas fa-house"></i> Ir al Dashboard
        </button>
        ${isAdmin ? `
        <button class="btn btn-secondary" onclick="navigate('licencias')">
          <i class="fas fa-key"></i> Ver Licencias
        </button>` : ''}
      </div>

      <!-- Nota informativa -->
      <div style="
        margin-top:16px;padding:14px 20px;border-radius:12px;
        background:#FFFBEB;border:1px solid #FDE68A;
        max-width:420px;text-align:left">
        <p style="font-size:12px;color:#92400E;font-weight:600;margin-bottom:4px">
          <i class="fas fa-circle-info mr-1"></i>¿Eres administrador?
        </p>
        <p style="font-size:12px;color:#92400E;line-height:1.6">
          Puedes habilitar módulos desde <strong>Licencias y Módulos</strong> en el panel de
          administración o contactando a soporte GRAVY.
        </p>
      </div>
    </div>`;
}
function navigate(page) {
  // Quitar la clase del POS por defecto
  document.body.classList.remove('pos-active-page');

  if (!PAGE_RENDERERS[page]) { page = 'dashboard'; }

  // ── Verificar licencia de módulo ──────────────────────────
  const requiredModule = (MODULE_LICENSE as any)[page];
  if (requiredModule && typeof hasModule === 'function' && !hasModule(requiredModule)) {
    currentPage = page;
    $$('#nav-menu .nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    $('#page-title').textContent = (PAGE_TITLES as any)[page] ?? page;
    $('#sidebar')?.classList.remove('open');
    showLockedModulePage(page, requiredModule);
    return;
  }

  // Verificar permisos de acceso por rol
  if (page === 'usuarios' && !can('canManageUsers')) {
    showToast('No tienes permiso para acceder a esta sección', 'error');
    return;
  }
  if (page === 'auditoria' && !can('canViewAudit')) {
    showToast('No tienes permiso para acceder a esta sección', 'error');
    return;
  }

  currentPage = page;

  // Actualizar sidebar
  $$('#nav-menu .nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  $('#page-title').textContent = PAGE_TITLES[page] ?? page;
  $('#sidebar')?.classList.remove('open');

  // Scroll al inicio
  const content = $('#page-content');
  if (content) content.scrollTop = 0;

  // Activar la clase del POS si corresponde
  if (page === 'pos') {
    document.body.classList.add('pos-active-page');
  }

  // Renderizar módulo
  try {
    PAGE_RENDERERS[page]();
  } catch (err) {
    console.error(`[Router] Error renderizando ${page}:`, err);
    if (content) {
      content.innerHTML = `
        <div class="flex flex-col items-center justify-center" style="height:60vh;gap:16px">
          <i class="fas fa-circle-exclamation text-4xl" style="color:#EF4444"></i>
          <p class="font-semibold" style="color:#374151">Error al cargar el módulo</p>
          <p class="text-sm" style="color:#9CA3AF">${esc(err.message)}</p>
          <button class="btn btn-outline" onclick="navigate('${page}')"><i class="fas fa-rotate-right"></i> Reintentar</button>
        </div>`;
    }
  }
}

// --- VITE MIGRATION GLOBALS ---
(window as any).PAGE_RENDERERS = PAGE_RENDERERS;
(window as any).currentPage = currentPage;
(window as any).PAGE_TITLES = PAGE_TITLES;
(window as any).MODULE_LICENSE = MODULE_LICENSE;
(window as any).MODULE_LABELS = MODULE_LABELS;
(window as any).showLockedModulePage = showLockedModulePage;
(window as any).navigate = navigate;
