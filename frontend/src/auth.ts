/**
 * GRAVY v2.0 — auth.ts
 * Autenticacion, sesion, control de acceso por rol y licencias de módulos.
 */

'use strict';

/* -- Permisos por rol --------------------------------------- */
const PERMISSIONS = {
  superadmin:    { canWrite: true,  canDelete: true,  canManageUsers: true,  canViewAudit: true,  canExport: true,  canApprove: true,  canEditDocs: true  },
  administrador: { canWrite: true,  canDelete: true,  canManageUsers: true,  canViewAudit: true,  canExport: true,  canApprove: true,  canEditDocs: true  },
  admin:         { canWrite: true,  canDelete: true,  canManageUsers: true,  canViewAudit: true,  canExport: true,  canApprove: true,  canEditDocs: true  },
  contador:      { canWrite: true,  canDelete: true,  canManageUsers: false, canViewAudit: false, canExport: true,  canApprove: true,  canEditDocs: true  },
  auxiliar:      { canWrite: true,  canDelete: false, canManageUsers: false, canViewAudit: false, canExport: false, canApprove: false, canEditDocs: false },
  cajero:        { canWrite: true,  canDelete: false, canManageUsers: false, canViewAudit: false, canExport: false, canApprove: false, canEditDocs: false },
  vendedor:      { canWrite: true,  canDelete: false, canManageUsers: false, canViewAudit: false, canExport: false, canApprove: false, canEditDocs: false },
  auditor:       { canWrite: false, canDelete: false, canManageUsers: false, canViewAudit: true,  canExport: true,  canApprove: false, canEditDocs: false },
  viewer:        { canWrite: false, canDelete: false, canManageUsers: false, canViewAudit: false, canExport: false, canApprove: false, canEditDocs: false },
  propietario:   { canWrite: false, canDelete: false, canManageUsers: false, canViewAudit: false, canExport: false, canApprove: false, canEditDocs: false },
};

/* -- Licencias de módulos ----------------------------------- */
// Set con los module_keys activos para esta instalación.
// Se carga en showApp() consultando /api/gravy/my-licenses o desde la empresa activa en el HUB.
let ENABLED_MODULES: Set<string> = new Set(['core']);

async function loadLicenses(): Promise<void> {
  try {
    const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
    let keys: string[] = activeCompany.modules || [];

    // Consultar licencias locales del Tenant para sincronizar el estado real
    try {
      const res = await fetch(`${(window as any).PB_URL || window.location.origin}/api/gravy/my-licenses`, {
        headers: pb?.authToken ? { 'Authorization': `Bearer ${pb.authToken}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.modules)) {
          const localKeys = data.modules.map((m: any) => m.module_key);
          if (localKeys.length > 0) {
            keys = localKeys;
          }
        }
      }
    } catch (_) {}

    ENABLED_MODULES = new Set(['core', ...keys]);
    (window as any).ENABLED_MODULES = ENABLED_MODULES;
    if (localStorage.getItem('gravy_debug') === '1') {
      console.log('[GRAVY HUB] Módulos activos (sincronizados):', [...ENABLED_MODULES].join(', '));
    }
  } catch (err) {
    console.warn('[GRAVY HUB] Error al cargar licencias locales:', err);
    ENABLED_MODULES = new Set(['core']);
    (window as any).ENABLED_MODULES = ENABLED_MODULES;
  }
}

function enableModule(moduleKey: string): void {
  ENABLED_MODULES.add(moduleKey);
  (window as any).ENABLED_MODULES = ENABLED_MODULES;
}

function disableModule(moduleKey: string): void {
  ENABLED_MODULES.delete(moduleKey);
  (window as any).ENABLED_MODULES = ENABLED_MODULES;
}

/** Verifica si un módulo está activo en la licencia actual */
function hasModule(moduleKey: string): boolean {
  return ENABLED_MODULES.has(moduleKey) || ENABLED_MODULES.has('full');
}

/** Aplica visibilidad del sidebar según módulos habilitados y rol del usuario */
function applyModuleVisibility(): void {
  // Mapa de page → módulo requerido (undefined = siempre visible)
  const MODULE_OF_PAGE: Record<string, string> = {
    'consulta-tx':      'contabilidad',
    'nueva-tx':         'contabilidad',
    'cierre':           'contabilidad',
    'facturacion-dian': 'contabilidad',
    'documentos-electronicos': 'contabilidad',
    'doc-soporte':      'contabilidad',
    'exogena':          'contabilidad',
    'ventas':           'comercial',
    'pedidos':          'comercial',
    'compras':          'inventarios',
    'productos':        'inventarios',
    'inventario':       'inventarios',
    'compra-sugerida':  'inventarios',
    'pos':              'comercial',
    'comisiones':       'comercial',
    'spa':              'spa',
    'spa-belleza':      'spa-belleza',
    'recaudos':         'tesoreria',
    'egresos':          'tesoreria',
    'cuentas-bancarias': 'tesoreria',
    'agenda-pagos':     'tesoreria',
    'conciliacion':     'conciliacion',
    'nomina':           'nomina',
    'nomina-empleados': 'nomina',
    'nomina-contratos': 'nomina',
    'nomina-periodos':  'nomina',
    'nomina-novedades': 'nomina',
    'nomina-distribucion-dotacion': 'nomina',
    'nomina-liquidacion':'nomina',
    'nomina-electronica-p':'nomina',
    'copro-facturacion':'copropiedades',
    'copro-cartera':    'copropiedades',
    'copro-presupuesto':'copropiedades',
    'copro-unidades':   'copropiedades',
    'copro-reservas':   'copropiedades',
    'copro-pqrs':       'copropiedades',
    'importaciones':    'logistica',
    'reservas-logistica':'logistica',
    'inmobiliarias':    'inmobiliarias',
    'inmo-contratos':   'inmobiliarias',
    'inmo-liquidacion':  'inmobiliarias',
    'tienda-virtual':   'tienda-virtual',
    'crm':              'crm',
    'despachos':        'logistica',
    'mis-rutas':        'logistica',
    'rutas-gestion':    'logistica',
    'rutas-vendedores': 'logistica',
    'niif':             'niif',
    'niif-diagnostico': 'niif',
    'niif-politicas':   'niif',
    'niif-mapeo':       'niif',
    'niif-arrendamientos':'niif',
    'fixed-assets-catalogo': 'activos_fijos',
    'fixed-assets-categorias': 'activos_fijos',
    'fixed-assets-depreciacion': 'activos_fijos',
    'fixed-assets-inventario': 'activos_fijos',
    'niif-impuesto':    'niif',
    'niif-revelaciones':'niif',
    'niif-estados':     'niif',
  };

  const isSidebarCollapsed = $('#sidebar')?.classList.contains('collapsed');

  // 1. Determinar visibilidad básica por licencia y rol para cada ítem
  const role = pb.currentUser?.role ?? 'viewer';
  const isCajero = role === 'cajero';
  const isVendedor = role === 'vendedor';
  const isPropietario = role === 'propietario';

  // Páginas permitidas por rol restringido
  const CAJERO_PAGES = new Set(['pos', 'dashboard']);
  const VENDEDOR_PAGES = new Set(['pos', 'ventas', 'pedidos', 'productos', 'mis-rutas', 'rutas-vendedores', 'dashboard']);
  const PROPIETARIO_PAGES = new Set(['copro-reservas', 'copro-pqrs', 'dashboard']);

  $$('#nav-menu .nav-item').forEach((item: any) => {
    const page     = item.dataset.page as string;
    const required = MODULE_OF_PAGE[page];

    // Cajero: acceso restringido solo a su conjunto de páginas
    if (isCajero) {
      const allowed = CAJERO_PAGES.has(page);
      if (allowed) {
        item.classList.remove('locked');
        item.removeAttribute('data-locked');
        item.style.display = '';
      } else {
        item.classList.add('locked');
        item.setAttribute('data-locked', 'role');
        item.style.display = 'none';
      }
      return;
    }

    // Vendedor: acceso restringido a su conjunto de páginas
    if (isVendedor) {
      const allowed = VENDEDOR_PAGES.has(page);
      if (allowed) {
        item.classList.remove('locked');
        item.removeAttribute('data-locked');
        item.style.display = '';
      } else {
        item.classList.add('locked');
        item.setAttribute('data-locked', 'role');
        item.style.display = 'none';
      }
      return;
    }

    // Propietario: acceso restringido a su conjunto de páginas
    if (isPropietario) {
      const allowed = PROPIETARIO_PAGES.has(page);
      if (allowed) {
        item.classList.remove('locked');
        item.removeAttribute('data-locked');
        item.style.display = '';
      } else {
        item.classList.add('locked');
        item.setAttribute('data-locked', 'role');
        item.style.display = 'none';
      }
      return;
    }

    let hasLic = true;
    if (required) {
      hasLic = hasModule(required);
    }

    let allowed = hasLic;
    if (page === 'usuarios') allowed = true;
    if (page === 'auditoria') allowed = can('canViewAudit');
    
    if (page === 'superadmin') allowed = (role === 'superadmin');
    if (page === 'licencias') allowed = ['admin', 'superadmin'].includes(role);

    if (allowed) {
      item.classList.remove('locked');
      item.removeAttribute('data-locked');
      item.style.display = '';
    } else {
      item.classList.add('locked');
      item.setAttribute('data-locked', required || 'role');
      item.style.display = 'none';
    }
  });

  // 2. Controlar visibilidad de las secciones (headers) y colapsarlas si corresponde
  let currentSectionCollapsed = false;
  $$('#nav-menu > *').forEach((el: any) => {
    if (el.classList.contains('nav-section')) {
      // Determinar si la sección tiene al menos un item visible (licenciado y por rol)
      let next = el.nextElementSibling;
      let hasVisibleItems = false;
      while (next && !next.classList.contains('nav-section')) {
        if (next.classList.contains('nav-item')) {
          const page = next.dataset.page;
          // Para roles restringidos: solo sus páginas permitidas
          if (isCajero) {
            if (CAJERO_PAGES.has(page)) { hasVisibleItems = true; break; }
            next = next.nextElementSibling;
            continue;
          }
          if (isVendedor) {
            if (VENDEDOR_PAGES.has(page)) { hasVisibleItems = true; break; }
            next = next.nextElementSibling;
            continue;
          }
          if (isPropietario) {
            if (PROPIETARIO_PAGES.has(page)) { hasVisibleItems = true; break; }
            next = next.nextElementSibling;
            continue;
          }
          const required = MODULE_OF_PAGE[page];
          const hasLic = required ? hasModule(required) : true;
          let allowed = hasLic;
          if (page === 'usuarios') allowed = can('canManageUsers');
          if (page === 'auditoria') allowed = can('canViewAudit');
          if (page === 'superadmin') allowed = (role === 'superadmin');
          if (page === 'licencias') allowed = (role === 'admin');
          
          if (allowed) {
            hasVisibleItems = true;
            break;
          }
        }
        next = next.nextElementSibling;
      }

      if (hasVisibleItems) {
        el.style.display = '';
        // Si la sección es visible, verificar si está colapsada por el usuario
        const sectionId = el.dataset.section || el.textContent.trim().toLowerCase().replace(/\s+/g, '-');
        el.dataset.section = sectionId; // Asegurar dataset.section
        
        // Por defecto, colapsada si no hay preferencia en localStorage
        if (localStorage.getItem(`section-collapsed-${sectionId}`) === null) {
          localStorage.setItem(`section-collapsed-${sectionId}`, '1');
        }
        
        const collapsed = localStorage.getItem(`section-collapsed-${sectionId}`) === '1';
        currentSectionCollapsed = collapsed;
        
        // Rotar el chevron
        const chevron = el.querySelector('.fa-chevron-down');
        if (chevron) {
          chevron.style.transform = (collapsed && !isSidebarCollapsed) ? 'rotate(-90deg)' : '';
        }

        // Estilizar sección activa si contiene el ítem activo y el sidebar no está colapsado
        let isSectionActive = false;
        let sib = el.nextElementSibling;
        while (sib && !sib.classList.contains('nav-section')) {
          if (sib.classList.contains('nav-item') && sib.classList.contains('active')) {
            isSectionActive = true;
            break;
          }
          sib = sib.nextElementSibling;
        }

        if (isSectionActive && !isSidebarCollapsed) {
          el.classList.add('active-section');
        } else {
          el.classList.remove('active-section');
        }
      } else {
        el.style.display = 'none';
        currentSectionCollapsed = false;
        el.classList.remove('active-section');
      }
    } else if (el.classList.contains('nav-item')) {
      // Si el item ya está oculto por licencia/rol, dejarlo oculto
      if (el.style.display === 'none') return;

      // Si pertenece a una sección colapsada y el sidebar no está colapsado en desktop, ocultarlo
      if (currentSectionCollapsed && !isSidebarCollapsed) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    }
  });

  // 3. Aplicar visibilidad a los elementos del dropdown del navbar
  if ($('#dropdown-nav-auditoria')) {
    $('#dropdown-nav-auditoria').style.display = can('canViewAudit') ? '' : 'none';
  }
  const dropdownNavUsuarios = $('#dropdown-nav-usuarios');
  if (dropdownNavUsuarios) {
    dropdownNavUsuarios.style.display = '';
    const span = dropdownNavUsuarios.querySelector('span');
    if (span) {
      span.textContent = ['admin', 'superadmin'].includes(role) ? 'Usuarios' : 'Mi Perfil';
    }
  }
}

function can(permission) {
  const role = pb.currentUser?.role ?? 'viewer';
  // Para canEditDocs, el campo individual `can_edit_docs` del usuario
  // puede sobreescribir el valor por defecto del rol (override granular).
  if (permission === 'canEditDocs' && pb.currentUser && typeof pb.currentUser.can_edit_docs === 'boolean') {
    return pb.currentUser.can_edit_docs;
  }
  return !!(PERMISSIONS[role]?.[permission]);
}

function requireRole(...roles) {
  const role = pb.currentUser?.role ?? 'viewer';
  return roles.includes(role);
}

/* -- Flujo Multi-Empresa (HUB) ------------------------------- */
const getHubUrl = (): string => {
  const { protocol, hostname, port } = window.location;
  if (port) {
    return `${protocol}//${hostname}:8089`;
  }
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return `${protocol}//hub.${parts.slice(1).join('.')}`;
  }
  return `${protocol}//hub.${hostname}`;
};

const HUB_URL = getHubUrl();

function resolveCompanyUrl(url: string): string {
  if (!url) return window.location.origin;
  const currentHost = window.location.hostname;
  const currentProto = window.location.protocol;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1") {
      if (currentHost !== "localhost" && currentHost !== "127.0.0.1") {
        if (window.location.port) {
          return `${currentProto}//${currentHost}:${urlObj.port}`;
        } else {
          return `${currentProto}//${currentHost}`;
        }
      }
    }
  } catch (_) {}
  return url;
}

interface CompanyAccess {
  access_id:     string;
  company_id:    string;
  company_name:  string;
  company_url:   string;
  company_color: string;
  role:          string;
  company_email: string;
  company_pass:  string;
  modules:       string[];
}

async function doLogin() {
  const email = getInputVal('login-email');
  const rawPass = $('#login-pass')?.value ?? '';
  const errEl = $('#login-error');
  errEl.classList.add('hidden');

  if (!email || !rawPass) {
    errEl.textContent = 'Ingresa correo y contraseña';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = $('#btn-login');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando al HUB...';

  try {
    // 1. Login contra el HUB
    const res = await fetch(`${HUB_URL}/api/collections/hub_users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password: rawPass }),
    });

    if (!res.ok) throw new Error('Credenciales de HUB incorrectas');
    const data = await res.json();
    const hubToken = data.token;
    localStorage.setItem('gravy_hub_token', hubToken);

    // 2. Obtener empresas asignadas
    const resComp = await fetch(`${HUB_URL}/api/hub/my-companies`, {
      headers: { 'Authorization': `Bearer ${hubToken}` }
    });
    
    if (!resComp.ok) throw new Error('Error al obtener empresas');
    const dataComp = await resComp.json();
    const companies: CompanyAccess[] = dataComp.companies || [];

    if (companies.length === 0) {
      throw new Error('No tienes empresas asignadas');
    }

    // 3. Mostrar selector
    renderCompanySelector(companies);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-arrow-right-to-bracket"></i> Ingresar';
  }
}

function renderCompanySelector(companies: CompanyAccess[]) {
  $$('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  
  let selectorScreen = $('#screen-company-select');
  if (!selectorScreen) {
    selectorScreen = document.createElement('div');
    selectorScreen.id = 'screen-company-select';
    selectorScreen.className = 'screen w-full min-h-screen flex items-center justify-center p-4';
    document.body.appendChild(selectorScreen);
  }

  selectorScreen.style.background = 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.06), transparent 60%), linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 100%)';
  selectorScreen.style.overflowY = 'auto';

  selectorScreen.innerHTML = `
    <div style="max-width: 960px; width: 100%; padding: 40px 20px; text-align: center;">
      
      <!-- Header -->
      <div style="margin-bottom: 48px; animation: fadeIn 0.5s ease">
        <div style="width:64px;height:64px;border-radius:20px;background:var(--bg-elev);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(99,102,241,0.08);border:1px solid var(--border-soft)">
          <img src="/assets/gravy-logo.png" style="width:38px;height:38px;object-fit:contain;" onerror="this.src='https://raw.githubusercontent.com/PIANIKSTA86/gravylocal/main/gravy-Icono.ico'">
        </div>
        <h1 style="font-size:32px;font-weight:800;color:var(--text-strong);letter-spacing:-1px;margin:0 0 8px">GRAVY <span style="background:linear-gradient(135deg,var(--accent-cyan-strong),var(--accent-violet-strong));-webkit-background-clip:text;-webkit-text-fill-color:transparent">HUB</span></h1>
        <p style="font-size:14px;color:var(--text-muted);margin:0">Selecciona la empresa con la que trabajarás</p>
      </div>

      <!-- Grid de Empresas -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px;margin-bottom:40px;justify-content:center">
        ${companies.map(co => {
          // Extraemos color en formato hex limpio
          const cardColor = co.company_color || "#2446B8";
          return `
            <div class="company-card" 
                 style="background:var(--bg-elev);border:1px solid var(--border-soft);border-radius:20px;overflow:hidden;cursor:pointer;transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);display:flex;flex-direction:column;text-align:left;position:relative;box-shadow:0 4px 12px rgba(15,23,42,0.03)"
                 onmouseenter="this.style.transform='translateY(-6px)'; this.style.borderColor='${cardColor}'; this.style.boxShadow='0 12px 30px -4px ${cardColor}20';"
                 onmouseleave="this.style.transform='none'; this.style.borderColor='var(--border-soft)'; this.style.boxShadow='0 4px 12px rgba(15,23,42,0.03)';"
                 onclick="selectCompany(${JSON.stringify(co).replace(/"/g, '&quot;')})">
              
              <!-- Línea superior con color distintivo -->
              <div style="height:6px;width:100%;background-color:${cardColor}"></div>
              
              <div style="padding:24px;display:flex;flex-direction:column;flex:1">
                <!-- Nombre y Rol -->
                <h3 style="font-size:17px;font-weight:800;color:var(--text-strong);margin:0 0 6px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${co.company_name}</h3>
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:20px">
                  <span style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);background:var(--bg-panel);padding:2px 8px;border-radius:20px">${co.role}</span>
                </div>
                
                <!-- Módulos como micro-badges -->
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:auto">
                  ${co.modules.map(m => `
                    <span style="font-size:9px;font-weight:700;color:var(--accent-violet-strong);background:rgba(99,102,241,0.06);padding:2px 6px;border-radius:6px;border:1px solid rgba(99,102,241,0.04);text-transform:uppercase">${m}</span>
                  `).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Footer / Desconexión -->
      <div style="animation:fadeIn 0.5s ease;margin-top:20px">
        <button onclick="doHubLogout()" style="background:none;border:none;color:#EF4444;font-size:13px;font-weight:700;cursor:pointer;padding:8px 16px;border-radius:10px;transition:all 0.2s" onmouseenter="this.style.background='rgba(239,68,68,0.05)'" onmouseleave="this.style.background='none'">
          <i class="fas fa-right-from-bracket mr-1"></i> Cerrar sesión global
        </button>
      </div>
    </div>
  `;
  
  selectorScreen.style.display = 'flex';
  selectorScreen.classList.add('active');
}

/* -- Control de Inactividad de Sesión ---------------------- */
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos de inactividad
let _inactivityCheckInterval: any = null;
let _lastActivityTime = Date.now();
let _lastActivitySaveTime = 0;
let _isActivityTrackerBound = false;

function handleUserActivity() {
  const now = Date.now();
  _lastActivityTime = now;
  // Guardar en localStorage máximo 1 vez cada 5 segundos para sincronizar entre pestañas
  if (now - _lastActivitySaveTime > 5000) {
    _lastActivitySaveTime = now;
    localStorage.setItem('gravy_last_activity', String(now));
  }
}

function startInactivityTracker() {
  const now = Date.now();
  _lastActivityTime = now;
  _lastActivitySaveTime = now;
  localStorage.setItem('gravy_last_activity', String(now));

  if (!_isActivityTrackerBound) {
    _isActivityTrackerBound = true;
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });
  }

  if (_inactivityCheckInterval) clearInterval(_inactivityCheckInterval);

  _inactivityCheckInterval = setInterval(async () => {
    if (!pb.currentUser || !pb.authToken) return;

    const storedLast = parseInt(localStorage.getItem('gravy_last_activity') || '0', 10);
    const lastActivity = Math.max(_lastActivityTime, storedLast || 0);
    const idleMs = Date.now() - lastActivity;

    if (idleMs >= INACTIVITY_TIMEOUT_MS) {
      console.warn('[GRAVY Auth] Sesión expirada por inactividad:', Math.round(idleMs / 1000), 'segundos.');
      stopInactivityTracker();
      const minutes = Math.max(1, Math.round(idleMs / 60000));
      await doLogout(`Cierre de sesión automático por inactividad (${minutes} min sin movimientos)`);
      setTimeout(() => {
        if (typeof (window as any).showToast === 'function') {
          (window as any).showToast('Tu sesión ha finalizado automáticamente por inactividad.', 'warning');
        }
      }, 200);
    }
  }, 10000); // Evalúa cada 10 segundos
}

function stopInactivityTracker() {
  if (_inactivityCheckInterval) {
    clearInterval(_inactivityCheckInterval);
    _inactivityCheckInterval = null;
  }
}

async function selectCompany(co: CompanyAccess) {
  // Crear overlay de conexión premium
  const loader = document.createElement('div');
  loader.id = 'company-connect-loader';
  loader.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.88);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;color:var(--text-strong);animation:fadeIn 0.3s ease';
  loader.innerHTML = `
    <div style="width: 50px; height: 50px; border: 4px solid var(--border-soft); border-top-color: ${co.company_color || '#2446B8'}; border-radius: 50%; animation: spin 1s linear infinite; box-shadow: 0 0 24px ${(co.company_color || '#2446B8')}30;"></div>
    <div style="text-align:center">
      <p style="font-size:15px;font-weight:800;margin:0 0 4px;letter-spacing:-0.2px">Estableciendo conexión segura</p>
      <p style="font-size:12px;color:var(--text-muted);margin:0">Conectando con ${co.company_name}...</p>
    </div>
  `;
  document.body.appendChild(loader);

  try {
    // Configurar la URL de PocketBase para la empresa seleccionada
    const resolvedUrl = resolveCompanyUrl(co.company_url);
    (window as any).PB_URL = resolvedUrl;
    pb.baseUrl = resolvedUrl;

    // Iniciar sesión en el Tenant usando Token Exchange (SSO)
    const hubToken = localStorage.getItem('gravy_hub_token') || '';
    const resSso = await fetch(`${resolvedUrl}/api/tenant/auth-via-hub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hub_token: hubToken })
    });

    if (!resSso.ok) {
      const errData = await resSso.json();
      throw new Error(errData.message || 'Error en la autenticación por token en el tenant');
    }

    const dataSso = await resSso.json();
    
    // Guardar la sesión local en el cliente personalizado pb
    pb.authToken = dataSso.token;
    pb.currentUser = dataSso.record;
    
    // Configurar el contexto local
    ENABLED_MODULES = new Set(['core', ...(co.modules || [])]);
    (window as any).ENABLED_MODULES = ENABLED_MODULES;
    localStorage.setItem('gravy_active_company', JSON.stringify(co));
    
    // Registrar evento de LOGIN en la auditoría
    try {
      const userLabel = pb.currentUser?.name || pb.currentUser?.email || 'Usuario';
      await pb.logAudit(
        'LOGIN',
        'sistema',
        pb.currentUser?.id || '',
        `Inicio de sesión exitoso en ${co.company_name} (${userLabel})`
      );
    } catch (_) {}

    // Iniciar monitoreo de inactividad
    startInactivityTracker();

    // Remover cargador
    document.getElementById('company-connect-loader')?.remove();

    // Mostrar App
    $('#screen-company-select').style.display = 'none';
    showApp();
  } catch (err: any) {
    document.getElementById('company-connect-loader')?.remove();
    showToast('Error conectando a la base de datos de la empresa: ' + err.message, 'error');
  }
}

async function doHubLogout() {
  stopInactivityTracker();
  if (pb.currentUser && pb.authToken) {
    try {
      await pb.logAudit('LOGOUT', 'sistema', pb.currentUser.id || '', 'Cierre de sesión global');
    } catch (_) {}
  }
  pb.logout();
  localStorage.removeItem('gravy_hub_token');
  localStorage.removeItem('gravy_active_company');
  localStorage.removeItem('gravy_last_activity');
  localStorage.removeItem('active_branch_id');
  const compSel = document.getElementById('screen-company-select');
  if (compSel) compSel.style.display = 'none';
  const appSel = document.getElementById('screen-app');
  if (appSel) appSel.style.display = 'none';
  if (typeof (window as any).clearTabsState === 'function') {
    (window as any).clearTabsState();
  }
  showLogin();
}

/* -- Validar que el Hub Token sigue siendo válido ---------- */
async function validateHubToken(hubToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${HUB_URL}/api/hub/my-companies`, {
      headers: { 'Authorization': `Bearer ${hubToken}` }
    });
    return res.ok;
  } catch (_) {
    return false;
  }
}

/* -- Logout de la Empresa (Vuelve al selector o Login) ---- */
async function doLogout(reason: string | Event = 'Cierre de sesión manual') {
  stopInactivityTracker();

  // Normalizar: si se llama como handler de DOM recibe un MouseEvent, no un string
  const reasonStr = typeof reason === 'string' ? reason : 'Cierre de sesión manual';

  // Determinar si es un cierre automático (inactividad) para forzar salida total
  const isAutoLogout = reasonStr.toLowerCase().includes('inactividad');

  if (pb.currentUser && pb.authToken) {
    try {
      await pb.logAudit('LOGOUT', 'sistema', pb.currentUser.id || '', reasonStr);
    } catch (_) {}
  }
  pb.logout();
  localStorage.removeItem('active_branch_id');
  localStorage.removeItem('gravy_last_activity');
  if (typeof (window as any).clearTabsState === 'function') {
    (window as any).clearTabsState();
  }
  const branchSel = document.getElementById('global-branch-selector');
  if (branchSel) branchSel.style.display = 'none';

  // Si el cierre es por inactividad, siempre cerrar la sesión del HUB también
  if (isAutoLogout) {
    console.warn('[GRAVY Auth] Cierre por inactividad — invalidando sesión del HUB.');
    localStorage.removeItem('gravy_hub_token');
    localStorage.removeItem('gravy_active_company');
    const compSel = document.getElementById('screen-company-select');
    if (compSel) compSel.style.display = 'none';
    const appSel = document.getElementById('screen-app');
    if (appSel) appSel.style.display = 'none';
    showLogin();
    return;
  }

  // Cierre manual desde dentro de la empresa: volver al selector si el hub token sigue activo
  const hubToken = localStorage.getItem('gravy_hub_token');
  if (hubToken) {
    const hubValid = await validateHubToken(hubToken);
    if (hubValid) {
      try {
        const resComp = await fetch(`${HUB_URL}/api/hub/my-companies`, {
          headers: { 'Authorization': `Bearer ${hubToken}` }
        });
        if (resComp.ok) {
          const dataComp = await resComp.json();
          renderCompanySelector(dataComp.companies || []);
          const appSel = document.getElementById('screen-app');
          if (appSel) appSel.style.display = 'none';
          return;
        }
      } catch (_) {}
    }
    // Hub token inválido o expirado — limpiar y pedir login
    localStorage.removeItem('gravy_hub_token');
    localStorage.removeItem('gravy_active_company');
  }
  showLogin();
}

/* -- Mostrar pantalla de login ----------------------------- */
function showLogin() {
  $$('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  const branchSel = document.getElementById('global-branch-selector');
  if (branchSel) branchSel.style.display = 'none';

  const ls = $('#screen-login');
  ls.style.display = 'flex';
  ls.classList.add('active');
  setInputVal('login-email', '');
  setInputVal('login-pass', '');
  if ($('#login-pass')) $('#login-pass').value = '';
  $('#login-error')?.classList.add('hidden');
  $('#login-server-url').textContent = window.location.host;
}

/* -- Inicializar selector global de sucursal ----------------- */
async function initGlobalBranchSelector() {
  const selector = document.getElementById('global-branch-selector') as HTMLSelectElement;
  if (!selector) return;

  const user = pb.currentUser;
  if (!user) {
    selector.style.display = 'none';
    return;
  }

  try {
    // 1. Obtener todas las sucursales activas (ignoramos el filtro dinámico de sucursal en la query)
    const allBranches = await pb.listAll('branches', { filter: 'active=true', ignoreBranch: true });
    
    // 2. Filtrar por allowed_branches si existe restricción
    let allowedBranches = allBranches;
    if (user.allowed_branches && user.allowed_branches.length > 0) {
      allowedBranches = allBranches.filter((b: any) => user.allowed_branches.includes(b.id));
    }

    // 3. Limpiar y rellenar selector
    selector.innerHTML = '';

    // Si no hay restricción de usuario (o es admin/superadmin/contador), se añade "TODAS"
    const hasRestriction = user.allowed_branches && user.allowed_branches.length > 0;
    const isAdmin = ['superadmin', 'admin', 'contador'].includes(user.role);
    
    if (!hasRestriction || isAdmin) {
      const optAll = document.createElement('option');
      optAll.value = 'TODAS';
      optAll.textContent = 'TODAS LAS SUCURSALES';
      selector.appendChild(optAll);
    }

    allowedBranches.forEach((b: any) => {
      const opt = document.createElement('option');
      opt.value = b.id;
      opt.textContent = `${b.code} - ${b.name}`;
      selector.appendChild(opt);
    });

    // 4. Determinar selección activa
    let activeBranchId = localStorage.getItem('active_branch_id');
    
    // Validar que la opción guardada sea válida
    const options = Array.from(selector.options).map(o => o.value);
    if (!activeBranchId || !options.includes(activeBranchId)) {
      if (options.length > 0) {
        activeBranchId = options[0];
      } else {
        activeBranchId = 'TODAS';
      }
      localStorage.setItem('active_branch_id', activeBranchId);
    }

    selector.value = activeBranchId;
    selector.style.display = 'inline-block';

    // 5. Enlazar evento de cambio
    selector.onchange = (e: any) => {
      const newVal = e.target.value;
      localStorage.setItem('active_branch_id', newVal);
      
      // Recargar la pantalla actual para refrescar los datos bajo el nuevo filtro
      const curPage = (window as any).currentPage || 'dashboard';
      if (typeof (window as any).navigate === 'function') {
        (window as any).navigate(curPage);
      }
    };

  } catch (err) {
    console.error('[GRAVY] Error inicializando selector de sucursales:', err);
    selector.style.display = 'none';
  }
}

/* -- Inicializar selector global de centros de costo ----------------- */
async function initGlobalCostCenterSelector() {
  const selector = document.getElementById('global-cost-center-selector') as HTMLSelectElement;
  if (!selector) return;

  const user = pb.currentUser;
  if (!user) {
    selector.style.display = 'none';
    return;
  }

  try {
    const allCC = await pb.listAll('cost_centers', { filter: 'active=true', sort: 'code', ignoreCostCenter: true });
    selector.innerHTML = '';

    const optAll = document.createElement('option');
    optAll.value = 'TODOS';
    optAll.textContent = 'TODOS LOS CENTROS DE COSTO';
    selector.appendChild(optAll);

    allCC.forEach((cc: any) => {
      const opt = document.createElement('option');
      opt.value = cc.id;
      opt.textContent = `${cc.code} - ${cc.name}`;
      selector.appendChild(opt);
    });

    let activeCostCenterId = localStorage.getItem('active_cost_center_id');
    const options = Array.from(selector.options).map(o => o.value);
    if (!activeCostCenterId || !options.includes(activeCostCenterId)) {
      activeCostCenterId = 'TODOS';
      localStorage.setItem('active_cost_center_id', activeCostCenterId);
    }

    selector.value = activeCostCenterId;
    selector.style.display = 'inline-block';

    selector.onchange = (e: any) => {
      const newVal = e.target.value;
      localStorage.setItem('active_cost_center_id', newVal);
      const curPage = (window as any).currentPage || 'dashboard';
      if (typeof (window as any).navigate === 'function') {
        (window as any).navigate(curPage);
      }
    };
  } catch (err) {
    console.error('[GRAVY] Error inicializando selector de centros de costo:', err);
    selector.style.display = 'none';
  }
}

/* -- Mostrar app principal --------------------------------- */
async function showApp() {
  const user = pb.currentUser;
  if (!user) { showLogin(); return; }

  // Verificar si la sesión previa ya superó el tiempo límite de inactividad
  const storedLast = parseInt(localStorage.getItem('gravy_last_activity') || '0', 10);
  if (storedLast > 0 && (Date.now() - storedLast) >= INACTIVITY_TIMEOUT_MS) {
    const minutes = Math.max(1, Math.round((Date.now() - storedLast) / 60000));
    console.warn('[GRAVY Auth] Sesión expirada por inactividad al iniciar la app.');
    await doLogout(`Cierre de sesión automático por inactividad al reabrir (${minutes} min sin movimientos)`);
    setTimeout(() => {
      if (typeof (window as any).showToast === 'function') {
        (window as any).showToast('Tu sesión anterior caducó por inactividad.', 'warning');
      }
    }, 200);
    return;
  }

  // Iniciar monitoreo de inactividad
  startInactivityTracker();

  // Recuperar licencias locales y configurar URL del servidor
  await loadLicenses();
  const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
  if (activeCompany && activeCompany.company_url) {
    const resolvedUrl = resolveCompanyUrl(activeCompany.company_url);
    (window as any).PB_URL = resolvedUrl;
    pb.baseUrl = resolvedUrl;
  }

  try {
    const decVal = await (window as any).API?.getSetting('decimal_places');
    if (decVal !== undefined && decVal !== '' && typeof (window as any).setDecimalPlaces === 'function') {
      (window as any).setDecimalPlaces(decVal);
    }
  } catch (_) {}

  // Actualizar navbar dropdown
  if ($('#navbar-username')) $('#navbar-username').textContent = user.full_name || user.email;
  if ($('#dropdown-username')) $('#dropdown-username').textContent = user.full_name || user.email;
  if ($('#dropdown-role')) $('#dropdown-role').textContent     = roleLabel(user.role ?? 'viewer');
  if ($('#navbar-avatar')) $('#navbar-avatar').textContent   = (user.full_name || user.email).charAt(0).toUpperCase();

  // El superadmin del tenant es superadmin del HUB
  if (activeCompany.role === 'admin' && user.email === 'admin@gravy.local') {
    // Override temporal de rol visual si es el superadmin global
    // (el backend valida permisos de todos modos, esto es visual)
  }

  // Aplicar visibilidad de módulos según licencia + rol
  applyModuleVisibility();

  // Inicializar selectores globales de sucursal y centros de costo
  await initGlobalBranchSelector();
  await initGlobalCostCenterSelector();

  // Topbar
  $('#topbar-company').textContent = activeCompany.company_name || 'GRAVY';
  $('#topbar-date').textContent    = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Apply user topbar color
  const topbarEl = document.querySelector('.topbar') as HTMLElement;
  if (topbarEl) {
    if (user.topbar_color) {
      topbarEl.style.background = user.topbar_color;
    } else {
      topbarEl.style.background = '';
    }
  }

  // Ocultar login, mostrar app
  $$('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  const appEl = $('#screen-app');
  if (appEl) {
    appEl.style.display = 'flex';
    appEl.classList.add('active');
    const userRole = user.role || 'viewer';
    appEl.setAttribute('data-role', userRole);
    document.body.setAttribute('data-role', userRole);
    if (typeof (window as any).initRoleBottomNav === 'function') {
      (window as any).initRoleBottomNav(userRole);
    }
  }

  // Cargar alertas de vencimientos de forma global al iniciar
  if (typeof (window as any).checkUpcomingVencimientos === 'function') {
    (window as any).checkUpcomingVencimientos();
  }

  if (typeof (window as any).restoreTabsState === 'function') {
    const restored = (window as any).restoreTabsState();
    if (!restored) {
      navigate('dashboard');
    }
  } else {
    navigate('dashboard');
  }
}

/* -- Toggle contraseña visible ----------------------------- */
function togglePassVisibility() {
  const inp  = $('#login-pass');
  const icon = $('#btn-toggle-pass')?.querySelector('i');
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    if (icon) { icon.className = 'fas fa-eye-slash'; }
  } else {
    inp.type = 'password';
    if (icon) { icon.className = 'fas fa-eye'; }
  }
}

/* -- Verificar estado de conexion -------------------------- */
let _connCheckInterval = null;

function startConnCheck() {
  if (_connCheckInterval) clearInterval(_connCheckInterval);
  _connCheckInterval = setInterval(async () => {
    const online = await pb.ping();
    const ind = $('#conn-indicator');
    if (!ind) return;
    const dot   = ind.querySelector('div');
    const label = ind.querySelector('span');
    if (online) {
      dot.className   = 'w-2 h-2 rounded-full bg-green-400';
      label.textContent = 'En linea';
    } else {
      dot.className   = 'w-2 h-2 rounded-full bg-red-400';
      label.textContent = 'Sin conexion';
    }
  }, 15000);
}

// --- VITE MIGRATION GLOBALS ---
(window as any).can = can;
(window as any).PERMISSIONS = PERMISSIONS;
(window as any).showLogin = showLogin;
(window as any).requireRole = requireRole;
(window as any).doLogout = doLogout;
(window as any).startConnCheck = startConnCheck;
(window as any).doLogin = doLogin;
(window as any).showApp = showApp;
(window as any).togglePassVisibility = togglePassVisibility;
(window as any).selectCompany = selectCompany;
(window as any).doHubLogout = doHubLogout;
(window as any)._connCheckInterval = _connCheckInterval;
(window as any).ENABLED_MODULES = ENABLED_MODULES;
(window as any).hasModule = hasModule;
(window as any).loadLicenses = loadLicenses;
(window as any).enableModule = enableModule;
(window as any).disableModule = disableModule;
(window as any).applyModuleVisibility = applyModuleVisibility;
(window as any).HUB_URL = HUB_URL;
(window as any).initGlobalBranchSelector = initGlobalBranchSelector;
(window as any).resolveCompanyUrl = resolveCompanyUrl;
(window as any).startInactivityTracker = startInactivityTracker;
(window as any).stopInactivityTracker = stopInactivityTracker;
(window as any).INACTIVITY_TIMEOUT_MS = INACTIVITY_TIMEOUT_MS;

