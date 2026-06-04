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
    if (e.target === $('#modal-overlay') && modalBackdropPointerDown) {
      if ((window as any).__salesModalOpen) return;
      closeModal();
    }
    modalBackdropPointerDown = false;
  });

  // ── Botones de login ───────────────────────────────────────
  $('#btn-login')?.addEventListener('click', doLogin);
  $('#btn-toggle-pass')?.addEventListener('click', togglePassVisibility);
  $('#login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  $('#login-email')?.addEventListener('keydown', e => { if (e.key === 'Enter') $('#login-pass')?.focus(); });

  // ── Botón logout ───────────────────────────────────────────
  $('#btn-logout')?.addEventListener('click', doLogout);

  // ── Dropdown del Menú de Usuario ───────────────────────────
  const btnUserMenu = $('#btn-user-menu');
  const userDropdown = $('#user-dropdown');
  const navbarChevron = $('#navbar-chevron');

  btnUserMenu?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShow = userDropdown?.classList.contains('show');
    if (isShow) {
      userDropdown?.classList.remove('show');
      if (navbarChevron) navbarChevron.style.transform = '';
    } else {
      userDropdown?.classList.add('show');
      if (navbarChevron) navbarChevron.style.transform = 'rotate(180deg)';
    }
  });

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', (e) => {
    if (userDropdown && userDropdown.classList.contains('show')) {
      const target = e.target as HTMLElement;
      if (!target.closest('#user-menu-container')) {
        userDropdown.classList.remove('show');
        if (navbarChevron) navbarChevron.style.transform = '';
      }
    }
  });

  // Navegación desde los items del dropdown de usuario
  $$('#user-dropdown .dropdown-item').forEach((item: any) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page) {
        navigate(page);
        userDropdown?.classList.remove('show');
        if (navbarChevron) navbarChevron.style.transform = '';
      }
    });
  });

  // ── Collapsible Sidebar Sections ───────────────────────────
  $$('#nav-menu .nav-section').forEach((section: any) => {
    section.addEventListener('click', () => {
      // Solo colapsar si el sidebar principal está expandido
      if ($('#sidebar')?.classList.contains('collapsed')) return;
      const sectionId = section.dataset.section;
      if (!sectionId) return;
      const isCollapsed = localStorage.getItem(`section-collapsed-${sectionId}`) === '1';
      
      if (!isCollapsed) {
        localStorage.setItem(`section-collapsed-${sectionId}`, '1');
      } else {
        // Colapsar todas las demás secciones
        $$('#nav-menu .nav-section').forEach((other: any) => {
          const otherId = other.dataset.section;
          if (otherId) {
            localStorage.setItem(`section-collapsed-${otherId}`, '1');
          }
        });
        localStorage.setItem(`section-collapsed-${sectionId}`, '0');
      }
      
      if (typeof (window as any).applyModuleVisibility === 'function') {
        (window as any).applyModuleVisibility();
      }
    });
  });

  // ── Sidebar navegación ─────────────────────────────────────
  $$('#nav-menu .nav-item').forEach(n =>
    n.addEventListener('click', () => navigate(n.dataset.page))
  );

  // ── Toggle sidebar móvil ───────────────────────────────────
  // ── Toggle menú (colapso desktop ↔ overlay móvil) ──────────
  const _sidebar   = $('#sidebar');
  const _screenApp = $('#screen-app');

  function setSidebarCollapsed(collapsed, animate = true) {
    if (!_sidebar || !_screenApp) return;
    if (!animate) {
      _sidebar.style.transition = 'none';
      requestAnimationFrame(() => { _sidebar.style.transition = ''; });
    }
    _sidebar.classList.toggle('collapsed', collapsed);
    _screenApp.classList.toggle('sidebar-collapsed', collapsed);
    localStorage.setItem('sidebar-collapsed', collapsed ? '1' : '0');
    
    // Al colapsar/expandir el sidebar principal, reevaluar visibilidades
    if (typeof (window as any).applyModuleVisibility === 'function') {
      (window as any).applyModuleVisibility();
    }
  }

  // Restaurar estado guardado sin animación al cargar
  setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === '1', false);

  // Topbar hamburguesa → colapsa (desktop) | abre overlay (móvil)
  $('#btn-menu-toggle')?.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      _sidebar?.classList.toggle('open');
    } else {
      setSidebarCollapsed(!_sidebar?.classList.contains('collapsed'));
    }
  });

  // Hamburguesa del sidebar → siempre expande
  $('#sidebar-hamburger')?.addEventListener('click', () => setSidebarCollapsed(false));

  // ── Tooltips fixed para nav-items en modo colapsado ────────
  (function () {
    const tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;z-index:400;padding:5px 13px;border-radius:8px;font-size:12px;font-weight:600;font-family:Plus Jakarta Sans,sans-serif;color:#fff;background:#111E43;border:1px solid rgba(100,225,255,.25);box-shadow:0 4px 20px rgba(5,8,20,.5);pointer-events:none;opacity:0;transition:opacity .15s;white-space:nowrap;';
    document.body.appendChild(tip);
    const nav = $('#nav-menu');
    nav?.addEventListener('mouseover', e => {
      const item = e.target.closest('.nav-item');
      if (!item || !_sidebar?.classList.contains('collapsed') || !item.dataset.label) return;
      const r = item.getBoundingClientRect();
      tip.textContent = item.dataset.label;
      tip.style.left  = (r.right + 10) + 'px';
      tip.style.top   = (r.top + r.height / 2) + 'px';
      tip.style.transform = 'translateY(-50%)';
      tip.style.opacity = '1';
    });
    nav?.addEventListener('mouseout', e => {
      if (!e.relatedTarget?.closest?.('.nav-item')) tip.style.opacity = '0';
    });
    nav?.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
  })();

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

// --- VITE MIGRATION GLOBALS ---
(window as any).initApp = initApp;
(window as any).hideSplash = hideSplash;
