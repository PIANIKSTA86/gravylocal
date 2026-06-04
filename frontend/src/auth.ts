/**
 * GRAVY v2.0 — auth.ts
 * Autenticacion, sesion, control de acceso por rol y licencias de módulos.
 */

'use strict';

/* -- Permisos por rol --------------------------------------- */
const PERMISSIONS = {
  superadmin: { canWrite: true,  canDelete: true,  canManageUsers: true,  canViewAudit: true,  canExport: true,  canApprove: true  },
  admin:    { canWrite: true,  canDelete: true,  canManageUsers: true,  canViewAudit: true,  canExport: true,  canApprove: true  },
  contador: { canWrite: true,  canDelete: false, canManageUsers: false, canViewAudit: false, canExport: true,  canApprove: true  },
  auxiliar: { canWrite: true,  canDelete: false, canManageUsers: false, canViewAudit: false, canExport: false, canApprove: false },
  auditor:  { canWrite: false, canDelete: false, canManageUsers: false, canViewAudit: true,  canExport: true,  canApprove: false },
  viewer:   { canWrite: false, canDelete: false, canManageUsers: false, canViewAudit: false, canExport: false, canApprove: false },
};

/* -- Licencias de módulos ----------------------------------- */
// Set con los module_keys activos para esta instalación.
// Se carga en showApp() consultando /api/gravy/my-licenses.
let ENABLED_MODULES: Set<string> = new Set(['core']);

async function loadLicenses(): Promise<void> {
  try {
    const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
    const keys = activeCompany.modules || [];
    ENABLED_MODULES = new Set(['core', ...keys]);
    console.log('[GRAVY HUB] Módulos activos (sincronizados):', [...ENABLED_MODULES].join(', '));
  } catch (err) {
    console.warn('[GRAVY HUB] Error al cargar licencias locales:', err);
    ENABLED_MODULES = new Set(['core']);
  }
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
    'reportes':         'contabilidad',
    'cierre':           'contabilidad',
    'facturacion-dian': 'contabilidad',
    'exogena':          'contabilidad',
    'utilidades':       'contabilidad',
    'ventas':           'comercial',
    'compras':          'comercial',
    'productos':        'comercial',
    'inventario':       'comercial',
    'pos':              'comercial',
    'spa':              'comercial',
    'tesoreria':        'comercial',
    'conciliacion':     'comercial',
    'nomina':           'nomina',
    'copropiedades':    'copropiedades',
  };

  const isSidebarCollapsed = $('#sidebar')?.classList.contains('collapsed');

  // 1. Determinar visibilidad básica por licencia y rol para cada ítem
  $$('#nav-menu .nav-item').forEach((item: any) => {
    const page     = item.dataset.page as string;
    const required = MODULE_OF_PAGE[page];

    let hasLic = true;
    if (required) {
      hasLic = hasModule(required);
    }

    let allowed = hasLic;
    if (page === 'usuarios') allowed = can('canManageUsers');
    if (page === 'auditoria') allowed = can('canViewAudit');
    
    const role = pb.currentUser?.role ?? 'viewer';
    if (page === 'superadmin') allowed = (role === 'superadmin');
    if (page === 'licencias') allowed = (role === 'admin');

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
          const required = MODULE_OF_PAGE[page];
          const hasLic = required ? hasModule(required) : true;
          let allowed = hasLic;
          if (page === 'usuarios') allowed = can('canManageUsers');
          if (page === 'auditoria') allowed = can('canViewAudit');
          const role = pb.currentUser?.role ?? 'viewer';
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
  if ($('#dropdown-nav-usuarios')) {
    $('#dropdown-nav-usuarios').style.display = can('canManageUsers') ? '' : 'none';
  }
}

function can(permission) {
  const role = pb.currentUser?.role ?? 'viewer';
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
    selectorScreen.className = 'screen w-full min-h-screen bg-gray-50 flex items-center justify-center p-4';
    document.body.appendChild(selectorScreen);
  }

  selectorScreen.innerHTML = `
    <div class="max-w-4xl w-full">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">GRAVY <span class="text-blue-600">HUB</span></h1>
        <p class="text-gray-500">Selecciona la empresa con la que trabajarás</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${companies.map(co => `
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
               onclick="selectCompany(${JSON.stringify(co).replace(/"/g, '&quot;')})">
            <div class="h-2 w-full" style="background-color: ${co.company_color}"></div>
            <div class="p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-1">${co.company_name}</h3>
              <p class="text-sm text-gray-500 mb-4">Rol: <span class="font-semibold text-gray-700">${co.role}</span></p>
              <div class="flex flex-wrap gap-2">
                ${co.modules.map(m => `<span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">${m}</span>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="mt-8 text-center">
        <button onclick="doHubLogout()" class="text-red-500 hover:text-red-700 font-medium">Cerrar sesión global</button>
      </div>
    </div>
  `;
  
  selectorScreen.style.display = 'flex';
  selectorScreen.classList.add('active');
}

async function selectCompany(co: CompanyAccess) {
  try {
    // Configurar la URL de PocketBase para la empresa seleccionada
    const resolvedUrl = resolveCompanyUrl(co.company_url);
    (window as any).PB_URL = resolvedUrl;
    pb.baseUrl = resolvedUrl;

    // Iniciar sesión en el Tenant usando credenciales sincronizadas
    await pb.authWithPassword(co.company_email, co.company_pass);
    
    // Configurar el contexto local
    ENABLED_MODULES = new Set(['core', ...co.modules]);
    localStorage.setItem('gravy_active_company', JSON.stringify(co));
    
    // Mostrar App
    $('#screen-company-select').style.display = 'none';
    showApp();
  } catch (err) {
    alert('Error conectando a la base de datos de la empresa: ' + err.message);
  }
}

function doHubLogout() {
  localStorage.removeItem('gravy_hub_token');
  $('#screen-company-select').style.display = 'none';
  showLogin();
}

/* -- Logout de la Empresa (Vuelve al selector o Login) ---- */
async function doLogout() {
  pb.logout();
  const hubToken = localStorage.getItem('gravy_hub_token');
  if (hubToken) {
    // Re-cargar empresas
    try {
      const resComp = await fetch(`${HUB_URL}/api/hub/my-companies`, {
        headers: { 'Authorization': `Bearer ${hubToken}` }
      });
      if (resComp.ok) {
        const dataComp = await resComp.json();
        renderCompanySelector(dataComp.companies || []);
        $('#screen-app').style.display = 'none';
        return;
      }
    } catch (_) {}
  }
  showLogin();
}

/* -- Mostrar pantalla de login ----------------------------- */
function showLogin() {
  $$('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  const ls = $('#screen-login');
  ls.style.display = 'flex';
  ls.classList.add('active');
  setInputVal('login-email', '');
  setInputVal('login-pass', '');
  if ($('#login-pass')) $('#login-pass').value = '';
  $('#login-error')?.classList.add('hidden');
  $('#login-server-url').textContent = window.location.host;
}

/* -- Mostrar app principal --------------------------------- */
async function showApp() {
  const user = pb.currentUser;
  if (!user) { showLogin(); return; }

  // Recuperar licencias locales y configurar URL del servidor
  await loadLicenses();
  const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
  if (activeCompany && activeCompany.company_url) {
    const resolvedUrl = resolveCompanyUrl(activeCompany.company_url);
    (window as any).PB_URL = resolvedUrl;
    pb.baseUrl = resolvedUrl;
  }

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

  // Topbar
  $('#topbar-company').textContent = activeCompany.company_name || 'GRAVY';
  $('#topbar-date').textContent    = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Ocultar login, mostrar app
  $$('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
  $('#screen-app').style.display = 'flex';
  $('#screen-app').classList.add('active');

  navigate('dashboard');
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
(window as any).applyModuleVisibility = applyModuleVisibility;
(window as any).HUB_URL = HUB_URL;

