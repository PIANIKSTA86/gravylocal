/**
 * GRAVY v2.0 — router.js
 * Navegación SPA entre módulos.
 */

'use strict';

const PAGE_TITLES = {
  dashboard:         'Dashboard',
  'plan-cuentas':    'Plan de Cuentas',
  terceros:          'Terceros',
  'tipos-tx':        'Tipos de Transacción',
  'nueva-tx':        'Nueva Transacción',
  'consulta-tx':     'Consulta de Transacciones',
  reportes:          'Reportes',
  auditoria:         'Auditoría',
  usuarios:          'Usuarios',
  configuracion:     'Configuración',  utilidades:        'Utilidades',  conciliacion:      'Conciliación Bancaria',
  nomina:            'Nómina',
  'facturacion-dian':'Facturación Electrónica DIAN',
  'cierre':          'Cierre Contable',
};

const PAGE_RENDERERS = {
  dashboard:          () => typeof renderDashboard      === 'function' && renderDashboard($('#page-content')),
  'plan-cuentas':     () => typeof renderPlanCuentas    === 'function' && renderPlanCuentas($('#page-content')),
  terceros:           () => typeof renderTerceros        === 'function' && renderTerceros($('#page-content')),
  'tipos-tx':         () => typeof renderTiposTx         === 'function' && renderTiposTx($('#page-content')),
  'nueva-tx':         () => typeof renderNuevaTx         === 'function' && renderNuevaTx($('#page-content')),
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
};

let currentPage = 'dashboard';

function navigate(page) {
  if (!PAGE_RENDERERS[page]) { page = 'dashboard'; }

  // Verificar permisos de acceso
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
