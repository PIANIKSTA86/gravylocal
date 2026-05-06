/**
 * GRAVY v2.0 — app.js
 * Punto de entrada: inicializa la aplicación.
 */

'use strict';

/* ── Event listeners globales ────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {

  // Registrar Service Worker para PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err =>
      console.warn('[SW] No se pudo registrar:', err)
    );
  }

  // ── Botones del modal ──────────────────────────────────────
  $('#modal-close-btn')?.addEventListener('click', closeModal);
  let modalBackdropPointerDown = false;
  $('#modal-overlay')?.addEventListener('pointerdown', e => {
    modalBackdropPointerDown = (e.target === $('#modal-overlay'));
  });
  $('#modal-box')?.addEventListener('pointerdown', () => {
    modalBackdropPointerDown = false;
  });
  $('#modal-overlay')?.addEventListener('click', e => {
    if (e.target === $('#modal-overlay') && modalBackdropPointerDown) closeModal();
    modalBackdropPointerDown = false;
  });

  // ── Botones de login ───────────────────────────────────────
  $('#btn-login')?.addEventListener('click', doLogin);
  $('#btn-toggle-pass')?.addEventListener('click', togglePassVisibility);
  $('#login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  $('#login-email')?.addEventListener('keydown', e => { if (e.key === 'Enter') $('#login-pass')?.focus(); });

  // ── Botón logout ───────────────────────────────────────────
  $('#btn-logout')?.addEventListener('click', doLogout);

  // ── Sidebar navegación ─────────────────────────────────────
  $$('#nav-menu .nav-item').forEach(n =>
    n.addEventListener('click', () => navigate(n.dataset.page))
  );

  // ── Toggle sidebar móvil ───────────────────────────────────
  $('#btn-menu-toggle')?.addEventListener('click', () =>
    $('#sidebar')?.classList.toggle('open')
  );

  // ── Inicializar aplicación ─────────────────────────────────
  await initApp();
});

async function initApp() {
  const loadMsg = $('#loading-msg');
  const setMsg  = m => { if (loadMsg) loadMsg.textContent = m; };

  setMsg('Verificando servidor...');

  // 1. Verificar que PocketBase responde
  const online = await pb.ping();
  if (!online) {
    setMsg('No se puede conectar al servidor. ¿Está ejecutando start.bat?');
    // Mostrar error en la pantalla de carga
    const loadScreen = $('#screen-loading');
    if (loadScreen) {
      loadScreen.innerHTML = `
        <div class="flex flex-col items-center gap-5 text-center px-8">
          <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background:rgba(239,68,68,.15)">
            <i class="fas fa-server text-2xl" style="color:#EF4444"></i>
          </div>
          <div>
            <h2 class="text-white text-xl font-bold mb-2">Servidor no disponible</h2>
            <p style="color:rgba(255,255,255,.6);font-size:14px;line-height:1.7">
              No se pudo conectar con el servidor GRAVY.<br>
              Asegúrate de haber ejecutado <strong style="color:#64E1FF">start.bat</strong> antes de abrir esta página.
            </p>
          </div>
          <button onclick="window.location.reload()" class="btn btn-primary mt-2">
            <i class="fas fa-rotate-right"></i> Reintentar
          </button>
        </div>`;
    }
    return;
  }

  setMsg('Verificando sesión...');

  // 2. Intentar restaurar sesión existente
  const existing = pb.currentUser;
  if (existing && pb.authToken) {
    try {
      await pb.authRefresh();
      // Sesión válida — ir directo a la app
      hideSplash();
      await showApp();
      startConnCheck();
      return;
    } catch (_) {
      // Token expirado — mostrar login
      pb.logout();
    }
  }

  // 3. Mostrar login
  hideSplash();
  showLogin();
  startConnCheck();
}

function hideSplash() {
  const splash = $('#screen-loading');
  if (!splash) return;
  splash.classList.add('fade-out');
  setTimeout(() => { splash.style.display = 'none'; }, 500);
}
