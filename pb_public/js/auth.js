/**
 * ContaCO v2.0 � auth.js
 * Autenticaci�n, sesi�n y control de acceso por rol.
 */

'use strict';

/* -- Permisos por rol --------------------------------------- */
const PERMISSIONS = {
  admin:    { canWrite: true,  canDelete: true,  canManageUsers: true,  canViewAudit: true,  canExport: true  },
  contador: { canWrite: true,  canDelete: false, canManageUsers: false, canViewAudit: false, canExport: true  },
  auxiliar: { canWrite: true,  canDelete: false, canManageUsers: false, canViewAudit: false, canExport: false },
  auditor:  { canWrite: false, canDelete: false, canManageUsers: false, canViewAudit: true,  canExport: true  },
  viewer:   { canWrite: false, canDelete: false, canManageUsers: false, canViewAudit: false, canExport: false },
};

function can(permission) {
  const role = pb.currentUser?.role ?? 'viewer';
  return !!(PERMISSIONS[role]?.[permission]);
}

function requireRole(...roles) {
  const role = pb.currentUser?.role ?? 'viewer';
  return roles.includes(role);
}

/* -- Login ------------------------------------------------- */
async function doLogin() {
  const email = getInputVal('login-email');
     const pass  = getInputVal('login-pass');  // sin leer la contraseña desde el DOM aquí adentro
  // Leer contrase�a directamente del input (sin trimming para no alterar espacios)
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
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';

  try {
    await pb.authWithPassword(email, rawPass);
    const user = pb.currentUser;

    if (!user.active) {
      pb.logout();
      errEl.textContent = 'Usuario inactivo. Contacta al administrador.';
      errEl.classList.remove('hidden');
      return;
    }

    showApp();
  } catch (err) {
     errEl.textContent = err.status === 400 ? 'Correo o contraseña incorrectos.' : `Error: ${err.message}`;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-arrow-right-to-bracket"></i> Ingresar';
  }
}

/* -- Logout ------------------------------------------------ */
async function doLogout() {
  pb.logout();
  showLogin();
}

/* -- Mostrar pantalla de login ----------------------------- */
function showLogin() {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const ls = $('#screen-login');
  ls.style.display = '';
  ls.classList.add('active');
  setInputVal('login-email', '');
  setInputVal('login-pass', '');  // no limpiar el field de contrase�a real para evitar warnings
  if ($('#login-pass')) $('#login-pass').value = '';
  $('#login-error')?.classList.add('hidden');
  $('#login-server-url').textContent = window.location.host;
}

/* -- Mostrar app principal --------------------------------- */
async function showApp() {
  const user = pb.currentUser;
  if (!user) { showLogin(); return; }

  // Actualizar sidebar
  $('#sidebar-username').textContent = user.full_name || user.email;
  $('#sidebar-role').textContent     = roleLabel(user.role ?? 'viewer');
  $('#sidebar-avatar').textContent   = (user.full_name || user.email).charAt(0).toUpperCase();

  // Mostrar/ocultar �tems de men� seg�n rol
  if ($('#nav-auditoria')) $('#nav-auditoria').style.display = can('canViewAudit') ? '' : 'none';
  if ($('#nav-usuarios'))  $('#nav-usuarios').style.display  = can('canManageUsers') ? '' : 'none';

  // Topbar
  const companyName = await API.getSetting('company_name');
  $('#topbar-company').textContent = companyName;
  $('#topbar-date').textContent    = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Ocultar login, mostrar app
  $$('.screen').forEach(s => { s.classList.remove('active'); s.style.display = ''; });
  $('#screen-app').style.display = 'flex';
  $('#screen-app').classList.add('active');

  navigate('dashboard');
}

/* -- Toggle contrase�a visible ----------------------------- */
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

/* -- Verificar estado de conexi�n -------------------------- */
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
      label.textContent = 'En l�nea';
    } else {
      dot.className   = 'w-2 h-2 rounded-full bg-red-400';
      label.textContent = 'Sin conexi�n';
    }
  }, 15000);
}
