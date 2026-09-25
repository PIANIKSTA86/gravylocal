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
      if ((window as any).__txModalOpen) return; // Ítem 5: no cerrar modal de transacción
      if ((window as any).__poModalOpen) return; // No cerrar modal de compras al hacer clic afuera
      closeModal();
    }
    modalBackdropPointerDown = false;
  });

  // ── Botones de login ───────────────────────────────────────
  $('#form-login')?.addEventListener('submit', (e) => { e.preventDefault(); doLogin(); });
  $('#btn-login')?.addEventListener('click', (e) => { e.preventDefault(); doLogin(); });
  $('#btn-toggle-pass')?.addEventListener('click', togglePassVisibility);
  $('#login-pass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  $('#login-email')?.addEventListener('keydown', e => { if (e.key === 'Enter') $('#login-pass')?.focus(); });

  // ── Botón logout ───────────────────────────────────────────
  $('#btn-logout')?.addEventListener('click', doLogout);

  // ── Paleta de Comandos Global (Ctrl + K) & Slide-Over Drawer ──
  initOmniSearch();
  initGlobalDrawer();

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

  // ── Dropdown de Notificaciones ─────────────────────────────
  const btnNotifications = $('#btn-notifications');
  const notifDropdown = $('#notif-dropdown');

  btnNotifications?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShow = notifDropdown?.style.display === 'block';
    if (isShow) {
      if (notifDropdown) notifDropdown.style.display = 'none';
    } else {
      if (notifDropdown) notifDropdown.style.display = 'block';
      (window as any).checkUpcomingVencimientos?.();
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
    if (notifDropdown && notifDropdown.style.display === 'block') {
      const target = e.target as HTMLElement;
      if (!target.closest('#notif-container')) {
        notifDropdown.style.display = 'none';
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

  // ── Backdrop para Drawer Móvil ─────────────────────────────
  let backdrop = document.getElementById('sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', () => {
      _sidebar?.classList.remove('open');
      backdrop?.classList.remove('show');
    });
  }

  // ── Sidebar navegación ─────────────────────────────────────
  $$('#nav-menu .nav-item').forEach(n =>
    n.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        _sidebar?.classList.remove('open');
        backdrop?.classList.remove('show');
      }
      navigate(n.dataset.page);
    })
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
      const isOpen = _sidebar?.classList.toggle('open');
      backdrop?.classList.toggle('show', !!isOpen);
    } else {
      setSidebarCollapsed(!_sidebar?.classList.contains('collapsed'));
    }
  });

  // Hamburguesa del sidebar → siempre expande
  $('#sidebar-hamburger')?.addEventListener('click', () => setSidebarCollapsed(false));

  // ── Bottom Navigation Bar Móvil Exclusiva para Vendedores y Propietarios ──
  function initRoleBottomNav(role: string) {
    let bottomNav = document.getElementById('mobile-bottom-nav');
    if (role !== 'vendedor' && role !== 'propietario') {
      if (bottomNav) bottomNav.remove();
      return;
    }

    if (!bottomNav) {
      bottomNav = document.createElement('nav');
      bottomNav.id = 'mobile-bottom-nav';
      document.getElementById('screen-app')?.appendChild(bottomNav);
    }

    const cur = (window as any).currentPage || 'dashboard';

    if (role === 'vendedor') {
      bottomNav.innerHTML = `
        <button data-page="dashboard" class="mob-nav-btn ${cur === 'dashboard' ? 'active' : ''}">
          <i class="fas fa-gauge-high"></i>
          <span>Inicio</span>
        </button>
        <button data-page="productos" class="mob-nav-btn ${cur === 'productos' ? 'active' : ''}">
          <i class="fas fa-box-open"></i>
          <span>Catálogo</span>
        </button>
        <button data-page="mis-reservas" class="mob-nav-btn ${cur === 'mis-reservas' ? 'active' : ''}">
          <i class="fas fa-boxes-packing"></i>
          <span>Reservas</span>
        </button>
        <button data-page="pedidos" class="mob-nav-btn ${cur === 'pedidos' ? 'active' : ''}">
          <i class="fas fa-file-signature"></i>
          <span>Pedidos</span>
        </button>
        <button data-page="mis-rutas" class="mob-nav-btn ${cur === 'mis-rutas' || cur === 'rutas-vendedores' ? 'active' : ''}">
          <i class="fas fa-route"></i>
          <span>Rutas</span>
        </button>
      `;
    } else if (role === 'propietario') {
      bottomNav.innerHTML = `
        <button data-page="dashboard" class="mob-nav-btn ${cur === 'dashboard' ? 'active' : ''}">
          <i class="fas fa-gauge-high"></i>
          <span>Inicio</span>
        </button>
        <button data-page="copro-reservas" class="mob-nav-btn ${cur === 'copro-reservas' ? 'active' : ''}">
          <i class="fas fa-calendar-days"></i>
          <span>Reservas</span>
        </button>
        <button data-page="copro-pqrs" class="mob-nav-btn ${cur === 'copro-pqrs' ? 'active' : ''}">
          <i class="fas fa-comments"></i>
          <span>PQRs</span>
        </button>
        <button data-page="copro-cartera" class="mob-nav-btn ${cur === 'copro-cartera' ? 'active' : ''}">
          <i class="fas fa-wallet"></i>
          <span>Cartera</span>
        </button>
      `;
    }

    bottomNav.querySelectorAll('.mob-nav-btn').forEach((btn: any) => {
      btn.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const page = btn.dataset.page;
        if (page && typeof (window as any).navigate === 'function') {
          (window as any).navigate(page);
        }
      });
    });
  }
  (window as any).initRoleBottomNav = initRoleBottomNav;

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

  // Configurar la URL de PocketBase según la empresa activa antes de verificar sesión y servidor
  try {
    const activeCompany = JSON.parse(localStorage.getItem('gravy_active_company') || '{}');
    if (activeCompany && activeCompany.company_url) {
      const resolvedUrl = (window as any).resolveCompanyUrl
        ? (window as any).resolveCompanyUrl(activeCompany.company_url)
        : activeCompany.company_url;
      pb.baseUrl = resolvedUrl;
    }
  } catch (e) {
    console.warn('[initApp] Error al precargar la URL de la empresa activa:', e);
  }

  setMsg('Verificando servidor...');

  // 1. Verificar que PocketBase responde
  const online = await pb.ping();
  if (!online) {
    setMsg('No se puede conectar al servidor. ¿Están iniciados los servicios GRAVY?');
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
              Asegúrate de que los servicios estén iniciados:<br>
              <span style="color:#64E1FF;font-size:13px">start-portable.bat &nbsp;·&nbsp; start-lan.bat &nbsp;·&nbsp; start.bat</span>
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

      // --- VALIDACIÓN DEL HUB TOKEN ---
      // Aunque el token del tenant sea válido, si el Hub cerró sesión
      // también debemos exigir un nuevo login.
      const hubToken = localStorage.getItem('gravy_hub_token');
      if (!hubToken) {
        console.warn('[GRAVY Auth] Sesión del tenant activa pero sin hub token — forzando login.');
        pb.logout();
        hideSplash();
        showLogin();
        startConnCheck();
        return;
      }

      // Verificar que el hub token siga siendo aceptado por el servidor
      let hubValid = false;
      try {
        const hubUrl = (window as any).HUB_URL ||
          (() => {
            const { protocol, hostname, port } = window.location;
            return port ? `${protocol}//${hostname}:8089` : `${protocol}//hub.${hostname}`;
          })();
        const hubRes = await fetch(`${hubUrl}/api/hub/my-companies`, {
          headers: { 'Authorization': `Bearer ${hubToken}` }
        });
        hubValid = hubRes.ok;
      } catch (_) { hubValid = false; }

      if (!hubValid) {
        console.warn('[GRAVY Auth] Hub token inválido o expirado — forzando login.');
        pb.logout();
        localStorage.removeItem('gravy_hub_token');
        localStorage.removeItem('gravy_active_company');
        localStorage.removeItem('gravy_last_activity');
        hideSplash();
        showLogin();
        startConnCheck();
        return;
      }

      // Sesión válida en tenant y HUB — ir directo a la app
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

async function checkUpcomingVencimientos() {
  const pb = (window as any).pb;
  const badge = document.getElementById('notif-badge');
  const countEl = document.getElementById('notif-critical-count');
  const listEl = document.getElementById('notif-list');
  if (!pb || !pb.currentUser) return;

  try {
    // Buscar vencimientos no pagados
    const records = await pb.listAll('agenda_vencimientos', {
      filter: "status != 'pagado'"
    });

    const todayStr = new Date().toISOString().split('T')[0];
    // Rango de alerta: hoy o ya vencidos, o dentro de los próximos 3 días
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + 3);
    const limitStr = limitDate.toISOString().split('T')[0];

    const alerts = records.filter((r: any) => {
      return r.status === 'vencido' || r.due_date <= limitStr;
    });

    // Ordenar alertas por fecha de vencimiento ascendente
    alerts.sort((a: any, b: any) => a.due_date.localeCompare(b.due_date));

    if (alerts.length > 0) {
      if (badge) badge.style.display = 'block';
      if (countEl) countEl.innerText = `${alerts.length} Alertas`;
      
      if (listEl) {
        listEl.innerHTML = alerts.map((a: any) => {
          const typeIcons: Record<string, string> = {
            cxp_proveedor: 'fa-truck-field',
            impuesto_dian_iva: 'fa-percent',
            impuesto_dian_retencion: 'fa-building-columns',
            exogena_dian: 'fa-file-invoice-dollar',
            otro: 'fa-info-circle'
          };
          const icon = typeIcons[a.type] || 'fa-bell';
          const isOverdue = a.status === 'vencido' || a.due_date < todayStr;
          const statusColor = isOverdue ? '#EF4444' : '#F59E0B';
          const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

          return `
            <div style="display:flex; gap:10px; padding:8px; border-radius:8px; background:rgba(15,23,42,0.02); border-left:3px solid ${statusColor}; cursor:pointer" onclick="navigate('agenda-pagos')">
              <div style="color:var(--text-muted); padding-top:2px"><i class="fas ${icon}"></i></div>
              <div style="flex:1; min-width:0">
                <div style="font-weight:700; color:var(--text-strong); text-overflow:ellipsis; overflow:hidden; white-space:nowrap">${a.title}</div>
                <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:10px">
                  <span style="color:${statusColor}; font-weight:700">${isOverdue ? 'VENCIDO' : 'PRÓXIMO'} (${a.due_date})</span>
                  <span style="font-weight:700">${formatCOP(a.amount)}</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    } else {
      if (badge) badge.style.display = 'none';
      if (countEl) countEl.innerText = '0 Alertas';
      if (listEl) {
        listEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:12px">Sin vencimientos críticos en los próximos 3 días.</p>`;
      }
    }
  } catch (err) {
    console.warn('[Notifications] Error checking vencimientos:', err);
  }
}

(window as any).checkUpcomingVencimientos = checkUpcomingVencimientos;

/* ── Paleta de Comandos Global (Ctrl + K) ────────────────────────── */
function initOmniSearch() {
  const overlay = document.getElementById('omni-command-palette');
  const input = document.getElementById('omni-command-input') as HTMLInputElement;
  const results = document.getElementById('omni-command-results');
  const trigger = document.getElementById('btn-omni-search');

  if (!overlay || !input || !results) return;

  const quickLinks = [
    { page: 'dashboard', title: 'Dashboard General', category: 'General', icon: 'fa-gauge-high' },
    { page: 'ventas', title: 'Facturación / Ventas', category: 'Comercial', icon: 'fa-receipt' },
    { page: 'facturacion-dian', title: 'Validación DIAN', category: 'Contabilidad', icon: 'fa-file-invoice' },
    { page: 'terceros', title: 'Terceros (Clientes y Proveedores)', category: 'Maestros', icon: 'fa-users' },
    { page: 'plan-cuentas', title: 'Plan de Cuentas (PUC)', category: 'Maestros', icon: 'fa-sitemap' },
    { page: 'compras', title: 'Compras y Gastos', category: 'Comercial', icon: 'fa-cart-flatbed' },
    { page: 'productos', title: 'Productos y Servicios', category: 'Inventarios', icon: 'fa-box-open' },
    { page: 'inventario-stock', title: 'Stock Actual', category: 'Inventarios', icon: 'fa-boxes-stacked' },
    { page: 'conciliacion', title: 'Conciliación Bancaria', category: 'Tesorería', icon: 'fa-scale-balanced' },
    { page: 'recaudos', title: 'Recaudos (Recibos de Caja)', category: 'Tesorería', icon: 'fa-hand-holding-dollar' },
    { page: 'egresos', title: 'Egresos (Comprobantes)', category: 'Tesorería', icon: 'fa-money-bill-transfer' },
    { page: 'nomina-empleados', title: 'Nómina - Empleados', category: 'Nómina', icon: 'fa-users-gear' },
    { page: 'importaciones', title: 'Gestión de Importaciones', category: 'Logística', icon: 'fa-ship' },
    { page: 'preliquidaciones', title: 'Preliquidación & Viabilidad (Simulador)', category: 'Logística', icon: 'fa-calculator' },
    { page: 'reportes', title: 'Reportes y Estados Financieros', category: 'Reportes', icon: 'fa-chart-pie' },
    { page: 'configuracion', title: 'Configuración de Empresa', category: 'Ajustes', icon: 'fa-sliders' },
  ];

  function openOmni() {
    overlay.style.display = 'flex';
    input.value = '';
    renderResults('');
    setTimeout(() => input.focus(), 60);
  }

  function closeOmni() {
    overlay.style.display = 'none';
  }

  function renderResults(query: string) {
    const q = query.toLowerCase().trim();
    const filtered = quickLinks.filter(l => 
      l.title.toLowerCase().includes(q) || 
      l.category.toLowerCase().includes(q) ||
      l.page.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      const escapedQ = typeof esc === 'function' ? esc(query) : query;
      results.innerHTML = `<div style="padding:16px;text-align:center;font-size:12.5px;color:var(--text-muted)">No se encontraron módulos con "${escapedQ}"</div>`;
      return;
    }

    results.innerHTML = filtered.map((item) => `
      <div class="omni-item" data-page="${item.page}" style="display:flex;align-items:center;gap:12px;padding:8px 12px;border-radius:10px;cursor:pointer;transition:background 0.15s">
        <div style="width:30px;height:30px;border-radius:8px;background:var(--accent-lavender-subtle, #F1EFFE);color:var(--accent-lavender, #7C66F0);display:flex;align-items:center;justify-content:center;font-size:13px"><i class="fas ${item.icon}"></i></div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:13px;color:var(--text-strong)">${item.title}</div>
          <div style="font-size:11px;color:var(--text-muted)">${item.category}</div>
        </div>
        <i class="fas fa-arrow-turn-down text-[10px]" style="color:#94A3B8"></i>
      </div>
    `).join('');

    results.querySelectorAll('.omni-item').forEach(el => {
      el.addEventListener('mouseenter', () => { (el as HTMLElement).style.background = 'var(--accent-lavender-soft, #FAF9FF)'; });
      el.addEventListener('mouseleave', () => { (el as HTMLElement).style.background = ''; });
      el.addEventListener('click', () => {
        const page = (el as HTMLElement).dataset.page;
        if (page) {
          (window as any).navigate?.(page);
          closeOmni();
        }
      });
    });
  }

  trigger?.addEventListener('click', openOmni);

  input?.addEventListener('input', (e) => {
    renderResults((e.target as HTMLInputElement).value);
  });

  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOmni();
    if (e.key === 'Enter') {
      const first = results.querySelector('.omni-item') as HTMLElement;
      if (first && first.dataset.page) {
        (window as any).navigate?.(first.dataset.page);
        closeOmni();
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (overlay.style.display === 'flex') closeOmni();
      else openOmni();
    }
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      closeOmni();
    }
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOmni();
  });
}

/* ── Slide-Over Drawer Global (Reutilizable para Módulos) ────────── */
function initGlobalDrawer() {
  const backdrop = document.getElementById('global-drawer-backdrop');
  const closeBtn = document.getElementById('btn-close-drawer');
  const cancelBtn = document.getElementById('btn-drawer-cancel');
  const titleEl = document.getElementById('drawer-title');
  const iconEl = document.getElementById('drawer-icon');
  const bodyEl = document.getElementById('drawer-body');

  function openDrawer(options?: { title?: string; icon?: string; contentHtml?: string; onMount?: () => void }) {
    if (!backdrop) return;
    if (options?.title && titleEl) titleEl.textContent = options.title;
    if (options?.icon && iconEl) iconEl.className = `fas ${options.icon}`;
    if (options?.contentHtml && bodyEl) {
      bodyEl.innerHTML = options.contentHtml;
      options.onMount?.();
    }
    backdrop.classList.add('open');
  }

  function closeDrawer() {
    if (!backdrop) return;
    backdrop.classList.remove('open');
  }

  closeBtn?.addEventListener('click', closeDrawer);
  cancelBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeDrawer();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop?.classList.contains('open')) {
      closeDrawer();
    }
  });

  (window as any).openDrawer = openDrawer;
  (window as any).closeDrawer = closeDrawer;
}



