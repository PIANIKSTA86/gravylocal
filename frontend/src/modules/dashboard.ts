/**
 * GRAVY v2.0 — dashboard.ts
 *
 * Panel operacional rediseñado — CORE.
 * ───────────────────────────────────────────────────────────────────
 * KPIs visibles a TODOS los roles (no financieros):
 *   • Transacciones Hoy  (con indicador live)
 *   • Transacciones del Mes  (con tendencia % vs mes anterior)
 *   • Terceros Activos  (con nuevos este mes)
 *   • Cuentas Contables  (plan de cuentas activo)
 *   • Gráfico de volumen mensual (conteo, no montos)
 *   • Distribución por tipo de documento
 *   • Actividad reciente (sin montos financieros)
 *   • Acciones rápidas contextuales según licencias
 *
 * Los KPIs financieros (Activos, Pasivos, Ingresos, Gastos)
 * pertenecen al módulo Contabilidad y serán renderizados en
 * su propia sección cuando esa licencia esté activa.
 */
'use strict';

import { Chart, registerables } from 'chart.js';
import { API } from '../api';
import { WIDGET_REGISTRY, getDefaultWidgetsForRole, WidgetHelpers } from './dashboard/widget-registry';
import { openWidgetCatalogModal } from './dashboard/widget-catalog-modal';
Chart.register(...registerables);

let _activityChart: any = null;
let _typesChart: any    = null;
let _financeChart: any  = null;
let _invChart: any      = null;

// ── Helpers ──────────────────────────────────────────────────────────

/** Anima un número desde 0 hasta `target` en `duration` ms. */
function animateCounter(el: HTMLElement, target: number, duration = 900): void {
  if (!el || target === 0) { if (el) el.textContent = '0'; return; }
  const start = performance.now();
  const tick  = (now: number) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString('es-CO');
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Genera un sparkline SVG inline a partir de un array de valores. */
function sparklineSVG(data: number[], color: string, w = 100, h = 32): string {
  if (!data || data.length < 2) return '';
  const max   = Math.max(...data) || 1;
  const min   = Math.min(...data);
  const range = (max - min) || 1;
  const pts   = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const lastX = w;
  const lastY = (h - ((data[data.length - 1] - min) / range) * (h - 6) - 3).toFixed(1);
  return `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible;display:block">
      <defs>
        <linearGradient id="sp-${color.replace('#','')}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity=".25"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="${pts} ${lastX},${h} 0,${h}"
        fill="url(#sp-${color.replace('#','')})" />
      <polyline points="${pts}" fill="none"
        stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="${lastX}" cy="${lastY}" r="3.5" fill="${color}" stroke="#fff" stroke-width="1.5"/>
    </svg>`;
}

/** Formato número es-CO */
function fmtCount(n: number): string {
  return Math.round(n).toLocaleString('es-CO');
}

// ── Render principal ──────────────────────────────────────────────────

async function renderDashboard(c: HTMLElement, advisorId: string = ''): Promise<void> {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  c = getContainer(c, 'dashboard');
  if (!c) return;

  const pb = (window as any).pb;
  if (pb?.currentUser?.role === 'vendedor') {
    return renderVendedorDashboard(c);
  }

  // ── Greeting dinámico
  const now       = new Date();
  const hour      = now.getHours();
  const greeting  = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
  const dayNames  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const monNames  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const monShort  = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const dateLabel = `${dayNames[now.getDay()]}, ${now.getDate()} de ${monNames[now.getMonth()]} de ${now.getFullYear()}`;

  // ── Skeleton loader premium
  c.innerHTML = `
    <style>
      @keyframes dash-shimmer {
        0%   { background-position: -400px 0; }
        100% { background-position:  400px 0; }
      }
      @keyframes dash-pulse-ring {
        0%   { box-shadow: 0 0 0 0 var(--ring-color,rgba(16,185,129,.55)); }
        70%  { box-shadow: 0 0 0 7px transparent; }
        100% { box-shadow: 0 0 0 0 transparent; }
      }
      @keyframes dash-breathe {
        0%,100% { opacity: 1; }
        50%      { opacity: .55; }
      }
      .dash-skeleton {
        background: linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%);
        background-size: 400px 100%;
        animation: dash-shimmer 1.4s ease-in-out infinite;
        border-radius: 8px;
      }
      .dash-live-dot {
        display: inline-block;
        width: 8px; height: 8px;
        border-radius: 50%;
        --ring-color: rgba(16,185,129,.5);
        animation: dash-pulse-ring 1.8s cubic-bezier(0,0,.2,1) infinite;
      }
      .dash-kpi-card {
        background: #fff;
        border-radius: 14px;
        padding: 20px;
        border: 1px solid var(--border-soft, #EAEFF5);
        position: relative;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(25, 33, 61, 0.04);
        transition: transform .22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow .22s;
      }
      .dash-kpi-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(25, 33, 61, 0.08); border-color: var(--border-strong, #D5DFEB); }
      .dash-kpi-accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 14px 14px 0 0; }
      .dash-chart-panel {
        background: #fff;
        border-radius: 16px;
        padding: 20px 24px;
        border: 1px solid var(--border-soft, #EAEFF5);
        box-shadow: 0 2px 8px rgba(25, 33, 61, 0.04);
        display: flex; flex-direction: column;
      }
      .dash-action-btn {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 16px;
        border-radius: 12px;
        border: 1px solid var(--border-soft, #EAEFF5);
        background: #fff;
        cursor: pointer;
        transition: transform .18s, background .18s, border-color .18s, box-shadow .18s;
        text-align: left; width: 100%;
        font-family: inherit;
      }
      .dash-action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(25, 33, 61, 0.06); border-color: #CBD5E1; }
      .dash-action-icon {
        width: 38px; height: 38px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .dash-table tr { cursor: pointer; transition: background .13s; }
      .dash-table tr:hover td { background: var(--accent-lavender-soft, #FAF9FF); }
    </style>

    <div class="anim-fade">
      <!-- Hero skeleton -->
      <div style="background:linear-gradient(135deg,rgba(124,102,240,.06),rgba(56,157,242,.05));border:1px solid rgba(124,102,240,.14);border-radius:18px;padding:26px 32px;margin-bottom:22px">
        <div class="dash-skeleton" style="height:22px;width:230px;margin-bottom:10px"></div>
        <div class="dash-skeleton" style="height:14px;width:160px"></div>
      </div>
      <!-- KPI skeletons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        ${[0,1,2,3].map(i=>`
          <div class="dash-kpi-card" style="animation-delay:${i*.06}s">
            <div class="dash-skeleton" style="height:40px;width:40px;border-radius:12px;margin-bottom:14px"></div>
            <div class="dash-skeleton" style="height:34px;width:90px;margin-bottom:8px"></div>
            <div class="dash-skeleton" style="height:12px;width:130px;margin-bottom:5px"></div>
            <div class="dash-skeleton" style="height:11px;width:100px"></div>
          </div>`).join('')}
      </div>
      <!-- Charts skeletons -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="dash-chart-panel lg:col-span-2" style="min-height:290px">
          <div class="dash-skeleton" style="height:16px;width:180px;margin-bottom:6px"></div>
          <div class="dash-skeleton" style="height:12px;width:130px;margin-bottom:20px"></div>
          <div class="dash-skeleton" style="flex:1;height:200px;border-radius:12px"></div>
        </div>
        <div class="dash-chart-panel" style="min-height:290px">
          <div class="dash-skeleton" style="height:16px;width:150px;margin-bottom:6px"></div>
          <div class="dash-skeleton" style="height:12px;width:110px;margin-bottom:20px"></div>
          <div class="dash-skeleton" style="flex:1;height:200px;border-radius:50%"></div>
        </div>
      </div>
    </div>`;

  try {
    const pb       = (window as any).pb;
    const branchId = pb?.currentUser?.default_branch_id || '';
    const userId   = pb?.currentUser?.id || '';
    const userRole = String(pb?.currentUser?.role || 'admin').toLowerCase().trim();
    const rawName  = pb?.currentUser?.name || pb?.currentUser?.email?.split('@')[0] || 'Usuario';
    const userName = rawName.split(' ')[0]; // Solo primer nombre

    // ── Cargar datos del backend
    const summary = await (API as any).getDashboardSummary(branchId, advisorId);

    // ── Extraer datos auxiliares
    const sellers: any[] = summary.sellers || [];

    // ── Configuración de widgets activos del usuario
    const storageKey = `gravy_dash_widgets_${userId || 'default'}`;
    let activeWidgetIds: string[] = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeWidgetIds = parsed;
        }
      }
    } catch (_) {}

    if (activeWidgetIds.length === 0) {
      activeWidgetIds = getDefaultWidgetsForRole(userRole);
    }

    const _hasModule = (k: string): boolean => typeof (window as any).hasModule === 'function'
      ? (window as any).hasModule(k) : false;
    const _can = (p: string): boolean => typeof (window as any).can === 'function'
      ? (window as any).can(p) : false;
    const _esc = (s: string): string => typeof (window as any).esc === 'function'
      ? (window as any).esc(s) : String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // ════════════════════════════════════════════════════
    //  RENDER ESTRUCTURAL
    // ════════════════════════════════════════════════════
    c.innerHTML = `

    <!-- ████  HERO  ████ -->
    <div class="anim-slide-up" style="
      background: linear-gradient(135deg,rgba(124,102,240,.07) 0%,rgba(56,157,242,.05) 60%,rgba(23,135,84,.04) 100%);
      border: 1px solid rgba(124,102,240,.14);
      border-radius: 18px;
      padding: 22px 28px;
      margin-bottom: 22px;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 14px;
      position: relative; overflow: hidden;
    ">
      <div style="position:absolute;right:-50px;top:-50px;width:220px;height:220px;border-radius:50%;
        background:radial-gradient(circle,rgba(124,102,240,.08),transparent 70%);pointer-events:none"></div>
      <div style="position:absolute;left:40%;bottom:-70px;width:180px;height:180px;border-radius:50%;
        background:radial-gradient(circle,rgba(56,157,242,.06),transparent 70%);pointer-events:none"></div>

      <div style="position:relative">
        <h1 style="font-size:21px;font-weight:800;color:var(--text-strong, #19213D);margin:0 0 5px;letter-spacing:-.3px">
          ${greeting}, ${_esc(userName)} 👋
        </h1>
        <p style="font-size:13px;color:var(--text-muted, #5E6D82);margin:0;font-weight:500;display:flex;align-items:center;gap:6px">
          <i class="fas fa-calendar-days" style="color:var(--accent-lavender, #7C66F0);font-size:11px"></i>
          ${dateLabel}
          <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;background:var(--accent-lavender-subtle, #F1EFFE);color:var(--accent-lavender-hover, #6850E2);margin-left:6px;text-transform:uppercase">
            Perfil: ${_esc(userRole)}
          </span>
        </p>
      </div>

      <!-- Barra de herramientas: Biblioteca de Indicadores y Filtros -->
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <button id="btn-open-widget-catalog" style="
          display:flex;align-items:center;gap:7px;padding:9px 16px;
          background:var(--accent-lavender, #7C66F0);color:#fff;border-radius:12px;
          font-size:12px;font-weight:700;box-shadow:0 4px 14px rgba(124,102,240,.24);border:none;cursor:pointer;
          transition:all .18s;font-family:inherit
        " onmouseover="this.style.background='var(--accent-lavender-hover, #6850E2)';this.style.transform='translateY(-1px)'" onmouseout="this.style.background='var(--accent-lavender, #7C66F0)';this.style.transform='none'">
          <i class="fas fa-shapes"></i>
          <span>Biblioteca de Indicadores</span>
        </button>

        <button id="btn-reset-to-profile-preset" style="
          display:flex;align-items:center;gap:6px;padding:8px 14px;
          background:#fff;border:1px solid #CBD5E1;color:#475569;border-radius:12px;
          font-size:12px;font-weight:700;cursor:pointer;transition:background .15s;font-family:inherit
        " onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#fff'" title="Restablecer indicadores recomendados para tu perfil">
          <i class="fas fa-rotate-left"></i>
          <span>Plantilla (${_esc(userRole)})</span>
        </button>

        ${sellers.length > 0 ? `
          <select id="dash-seller-filter" style="
            font-size:11px;font-weight:600;color:#475569;border:1px solid #E2E8F0;
            background:#fff;border-radius:12px;padding:8px 12px;cursor:pointer;outline:none;font-family:inherit
          ">
            <option value="">Todos los Asesores</option>
            ${sellers.map((s: any) => `
              <option value="${_esc(s.id)}" ${s.id === advisorId ? 'selected' : ''}>
                ${_esc(s.name)}
              </option>`).join('')}
          </select>` : ''}

        <div style="display:flex;align-items:center;gap:7px;padding:7px 14px;
          background:rgba(16,185,129,.09);border:1px solid rgba(16,185,129,.2);border-radius:20px">
          <span class="dash-live-dot" style="background:#10B981;--ring-color:rgba(16,185,129,.5)"></span>
          <span style="font-size:11px;font-weight:700;color:#059669">Sistema activo</span>
        </div>
      </div>
    </div>

    <!-- ████  GRID DINÁMICO DE WIDGETS PERSONALIZABLES  ████ -->
    <div id="dashboard-dynamic-grid" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6"></div>

    <!-- ████  ACCIONES RÁPIDAS DEL SISTEMA  ████ -->
    <div style="
      background:#fff;border-radius:14px;border:1px solid var(--border-soft, #EAEFF5);
      padding:14px 18px;margin-bottom:24px;box-shadow:0 2px 8px rgba(25,33,61,.04);
      display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px
    ">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:34px;height:34px;border-radius:10px;background:var(--accent-lavender-subtle, #F1EFFE);display:flex;align-items:center;justify-content:center;color:var(--accent-lavender, #7C66F0);font-size:14px">
          <i class="fas fa-bolt"></i>
        </div>
        <div>
          <h4 style="font-size:13px;font-weight:700;color:var(--text-strong, #19213D);margin:0">Acciones Frecuentes</h4>
          <p style="font-size:11px;color:var(--text-muted, #5E6D82);margin:0">Accesos directos operacionales según tus permisos</p>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        ${_can('canWrite') ? `
          <button onclick="navigate('consulta-tx')" style="
            display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:8px;
            background:var(--accent-lavender-subtle, #F1EFFE);color:var(--accent-lavender-hover, #6850E2);border:1px solid rgba(124,102,240,.2);
            font-size:12px;font-weight:600;cursor:pointer;transition:all .15s
          ">
            <i class="fas fa-plus"></i> Nueva Tx
          </button>` : ''}

        <button onclick="navigate('terceros')" style="
          display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:8px;
          background:var(--color-success-bg, #E8F8F0);color:var(--color-success, #178754);border:1px solid rgba(23,135,84,.2);
          font-size:12px;font-weight:600;cursor:pointer;transition:all .15s
        ">
          <i class="fas fa-users"></i> Terceros
        </button>

        ${_hasModule('inventarios') ? `
          <button onclick="navigate('inventario')" style="
            display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:8px;
            background:var(--accent-sky-subtle, #E6F3FD);color:var(--accent-sky-hover, #1D80D8);border:1px solid rgba(56,157,242,.2);
            font-size:12px;font-weight:600;cursor:pointer;transition:all .15s
          ">
            <i class="fas fa-boxes-stacked"></i> Kardex
          </button>` : ''}

        ${_hasModule('contabilidad') ? `
          <button onclick="navigate('reportes')" style="
            display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;
            background:rgba(245,158,11,.08);color:#B45309;border:1px solid rgba(245,158,11,.2);
            font-size:12px;font-weight:700;cursor:pointer
          ">
            <i class="fas fa-chart-pie"></i> Reportes PUC
          </button>` : ''}
      </div>
    </div>`;

    // ── RENDERIZAR CADA WIDGET DINÁMICO
    const helpers: WidgetHelpers = {
      fmt: (window as any).fmt || ((n: number) => `$ ${Math.round(n).toLocaleString('es-CO')}`),
      fmtCount,
      animateCounter,
      sparklineSVG,
      esc: _esc,
      can: _can,
      hasModule: _hasModule,
      navigate: (window as any).navigate || (() => {})
    };

    const gridEl = document.getElementById('dashboard-dynamic-grid');
    if (gridEl) {
      gridEl.innerHTML = '';
      activeWidgetIds.forEach((wId) => {
        const widgetDef = WIDGET_REGISTRY[wId];
        if (!widgetDef) return;
        if (widgetDef.moduleRequired && !_hasModule(widgetDef.moduleRequired)) return;

        const wWrapper = document.createElement('div');
        wWrapper.id = `widget-box-${wId}`;
        const span = widgetDef.defaultColSpan || 1;
        if (span === 1) {
          wWrapper.className = 'col-span-1';
        } else if (span === 2) {
          wWrapper.className = 'col-span-1 sm:col-span-2 xl:col-span-2';
        } else if (span === 3) {
          wWrapper.className = 'col-span-1 sm:col-span-2 xl:col-span-3';
        } else {
          wWrapper.className = 'col-span-1 sm:col-span-2 xl:col-span-4';
        }
        gridEl.appendChild(wWrapper);

        try {
          widgetDef.render(wWrapper, summary, helpers);
        } catch (e) {
          console.error(`[Dashboard] Error al renderizar widget ${wId}:`, e);
        }
      });
    }

    // ── CONECTAR EVENTOS DEL DASHBOARD
    document.getElementById('btn-open-widget-catalog')?.addEventListener('click', () => {
      openWidgetCatalogModal({
        activeWidgetIds: [...activeWidgetIds],
        userRole: userRole,
        onSave: (updatedIds) => {
          localStorage.setItem(storageKey, JSON.stringify(updatedIds));
          if ((window as any).API?.setSetting) {
            (window as any).API.setSetting(`dash_pref_${userId || 'default'}`, JSON.stringify(updatedIds)).catch(() => {});
          }
          if (typeof (window as any).showToast === 'function') {
            (window as any).showToast('Dashboard actualizado correctamente', 'success');
          }
          renderDashboard(c, advisorId);
        },
        onResetToRole: () => {
          const defaults = getDefaultWidgetsForRole(userRole);
          localStorage.setItem(storageKey, JSON.stringify(defaults));
          renderDashboard(c, advisorId);
        }
      });
    });

    document.getElementById('btn-reset-to-profile-preset')?.addEventListener('click', () => {
      const defaults = getDefaultWidgetsForRole(userRole);
      localStorage.setItem(storageKey, JSON.stringify(defaults));
      if (typeof (window as any).showToast === 'function') {
        (window as any).showToast(`Restablecida plantilla predeterminada de ${userRole}`, 'info');
      }
      renderDashboard(c, advisorId);
    });

    document.getElementById('dash-seller-filter')?.addEventListener('change', (ev: any) => {
      renderDashboard(c, ev.target.value);
    });

  } catch (err: any) {
    c.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:55vh;gap:16px;text-align:center;padding:30px">
        <div style="width:68px;height:68px;border-radius:20px;background:#FEF2F2;
          display:flex;align-items:center;justify-content:center">
          <i class="fas fa-triangle-exclamation" style="font-size:28px;color:#EF4444"></i>
        </div>
        <div>
          <p style="font-size:16px;font-weight:800;color:#0F172A;margin:0 0 6px">Error al cargar el dashboard</p>
          <p style="font-size:13px;color:#64748B;max-width:360px;margin:0 auto">${
            typeof (window as any).esc === 'function'
              ? (window as any).esc(err.message || 'Error desconocido')
              : String(err.message || 'Error desconocido').replace(/</g,'&lt;')
          }</p>
        </div>
        <button onclick="if(window.reloadTab){window.reloadTab('dashboard')}else{renderDashboard(document.getElementById('page-content'))}"
          class="btn btn-outline" style="margin-top:4px">
          <i class="fas fa-rotate-right"></i> Reintentar
        </button>
      </div>`;
  }
}

// ── DASHBOARD COMERCIAL DEDICADO PARA EL VENDEDOR ─────────────────────────────
async function renderVendedorDashboard(c: HTMLElement): Promise<void> {
  const pb = (window as any).pb;
  const esc = (window as any).esc || ((s: any) => String(s || ''));
  const fmt = (window as any).fmt || ((n: number) => `$ ${Number(n || 0).toLocaleString('es-CO')}`);
  const fmtN = (window as any).fmtN || ((n: number) => Number(n || 0).toLocaleString('es-CO'));
  const today = (window as any).todayStr ? (window as any).todayStr() : new Date().toISOString().slice(0, 10);
  const uid = pb?.currentUser?.id || '';
  const userName = pb?.currentUser?.name || pb?.currentUser?.email?.split('@')[0] || 'Vendedor';

  // Greeting dinámico
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  c.innerHTML = `
    <div class="p-8 text-center text-slate-400">
      <i class="fas fa-spinner fa-spin mr-2 text-xl text-teal-600"></i>
      <span class="font-bold text-sm">Cargando cabina comercial...</span>
    </div>
  `;

  try {
    const curMonthPrefix = today.slice(0, 7); // 'YYYY-MM'

    // Buscar si el usuario actual corresponde a un tercero vendedor
    const currentUserName = (pb?.currentUser?.full_name || pb?.currentUser?.name || pb?.currentUser?.email?.split('@')[0] || '').toLowerCase().trim();
    const currentUserEmail = (pb?.currentUser?.email || '').toLowerCase().trim();
    const currentTpId = pb?.currentUser?.third_party_id || '';

    // Fetch en paralelo de la información del vendedor
    const [ordersRes, invoicesRes, reservations, resLines, allVisits, allSellers] = await Promise.all([
      (window as any).API.getSalesOrders({ perPage: 100, sort: '-date,-created' }).catch(() => ({ items: [] })),
      (window as any).API.getInvoices({ perPage: 100, sort: '-date,-created' }).catch(() => ({ items: [] })),
      pb.listAll('sales_reservations', {
        sort: '-created',
        expand: 'customer_id,sales_order_id,invoice_id',
      }).catch(() => []),
      pb.listAll('sales_reservation_lines', {
        expand: 'product_id,import_id,import_line_id',
      }).catch(() => []),
      pb.listAll('vendor_visits', {
        filter: `visit_date = "${today}"`,
        sort: 'order_seq,created',
        expand: 'client_id,sales_order_id,seller_id',
      }).catch(() => []),
      pb.listAll('third_parties', {
        filter: 'type="VENDEDOR" || type="EMPLEADO"',
        fields: 'id,name,email,doc_number'
      }).catch(() => []),
    ]);

    const matchedSeller = allSellers.find((s: any) => 
      s.id === currentTpId || 
      (s.email && s.email.toLowerCase().trim() === currentUserEmail) ||
      (currentUserName && s.name && s.name.toLowerCase().includes(currentUserName)) ||
      (currentUserName && s.name && currentUserName.includes(s.name.toLowerCase()))
    );

    const sellerIds = [uid];
    if (currentTpId) sellerIds.push(currentTpId);
    if (matchedSeller) sellerIds.push(matchedSeller.id);

    const orders = ordersRes.items || [];
    const invoices = invoicesRes.items || [];

    // Filtrar reservas del vendedor
    const userReservations = reservations.filter((r: any) => 
      !r.created_by || r.created_by === uid || (r.expand?.sales_order_id?.user_id && sellerIds.includes(r.expand.sales_order_id.user_id))
    );

    // 1. Métricas de Ventas y Facturas
    const monthlyInvoices = invoices.filter((i: any) => (i.date || '').startsWith(curMonthPrefix) && i.status !== 'voided');
    const totalSalesMonth = monthlyInvoices.reduce((sum: number, i: any) => sum + Number(i.payable_total ?? i.total ?? 0), 0);

    // Meta Comercial Mensual (por defecto 35M o la configurada en el perfil)
    const monthlyTarget = Number(pb.currentUser?.monthly_target || 35000000);
    const targetPct = Math.min(100, Math.round((totalSalesMonth / monthlyTarget) * 100));

    // 2. Métricas de Pedidos Activos
    const pendingOrders = orders.filter((o: any) => o.status === 'pending');
    const pendingOrdersVal = pendingOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

    // 3. Métricas de Reservas de Importación
    const linesByResId: Record<string, any[]> = {};
    for (const l of resLines) {
      if (!l.reservation_id) continue;
      if (!linesByResId[l.reservation_id]) linesByResId[l.reservation_id] = [];
      linesByResId[l.reservation_id].push(l);
    }

    const activeReservations = userReservations.filter((r: any) => r.status === 'active' || r.status === 'partial');
    const reservationsVal = activeReservations.reduce((sum: number, r: any) => {
      const rlines = linesByResId[r.id] || [];
      return sum + rlines.reduce((s: number, l: any) => s + (Number(l.qty_reserved || 0) * Number(l.expand?.product_id?.base_price || 0)), 0);
    }, 0);
    const reservasVal = reservationsVal;

    // Reservas próximas a arribar (ETA)
    const upcomingEtaRes = activeReservations.filter((r: any) => {
      const rlines = linesByResId[r.id] || [];
      return rlines.some((l: any) => !!l.expand?.import_id?.eta);
    }).slice(0, 3);

    // 4. Métricas de Agenda y Visitas de Hoy
    let todayVisits = allVisits;
    if (sellerIds.length > 0) {
      const myVisits = allVisits.filter((v: any) => {
        if (!v.seller_id) return true;
        if (sellerIds.includes(v.seller_id)) return true;
        const sName = (v.expand?.seller_id?.name || '').toLowerCase();
        if (currentUserName && sName && (sName.includes(currentUserName) || currentUserName.includes(sName))) return true;
        return false;
      });
      todayVisits = myVisits.length > 0 ? myVisits : allVisits;
    }
    const completedVisits = todayVisits.filter((v: any) => v.status === 'COMPLETADA_PEDIDO' || v.status === 'COMPLETADA_RECAUDO');

    // RENDERIZADO DEL DASHBOARD COMERCIAL
    c.innerHTML = `
      <div class="max-w-6xl mx-auto space-y-6 pb-24 anim-fade">
        
        <!-- HERO BANNER: Saludo, Rol y Barra de Meta Comercial -->
        <div class="relative overflow-hidden bg-gradient-to-br from-[#003B46] via-[#004F5A] to-[#075E6D] rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-teal-200 border border-white/10 mb-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Vendedor Comercial Autorizado</span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-black tracking-tight">
                ${greeting}, <span class="text-teal-200">${esc(userName)}</span> 👋
              </h1>
              <p class="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-xl">
                Impulsa tus ventas de stock físico y preventas de importación en ruta. Consulta tus metas y agenda del día.
              </p>
            </div>

            <!-- Progreso de Meta del Mes -->
            <div class="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 min-w-[280px]">
              <div class="flex items-center justify-between text-xs font-bold text-teal-100 mb-1.5">
                <span>🎯 Meta Comercial Mes</span>
                <span class="text-emerald-300 font-extrabold text-sm">${targetPct}% Logrado</span>
              </div>
              
              <!-- Progress bar -->
              <div class="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div class="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700 shadow-sm" style="width: ${targetPct}%"></div>
              </div>

              <div class="flex items-center justify-between text-[11px] font-mono text-teal-200 mt-2">
                <span>Vendido: <strong>${fmt(totalSalesMonth)}</strong></span>
                <span class="opacity-75">Meta: ${fmt(monthlyTarget)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4 KPIS CLAVE COMERCIALES -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <!-- KPI 1: Ventas Mes -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Ventas del Mes</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-black">
                <i class="fas fa-receipt"></i>
              </div>
            </div>
            <div class="text-lg sm:text-xl font-black text-slate-900 font-mono">${fmt(totalSalesMonth)}</div>
            <div class="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <i class="fas fa-check-circle text-xs"></i>
              <span>${monthlyInvoices.length} facturas emitidas</span>
            </div>
          </div>

          <!-- KPI 2: Pedidos Activos -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer" onclick="navigate('pedidos')">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Pedidos en Curso</span>
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black">
                <i class="fas fa-file-signature"></i>
              </div>
            </div>
            <div class="text-lg sm:text-xl font-black text-slate-900 font-mono">${pendingOrders.length}</div>
            <div class="text-[11px] text-blue-600 font-bold mt-1 truncate">
              <span>${fmt(pendingOrdersVal)} por facturar</span>
            </div>
          </div>

          <!-- KPI 3: Reservas en Preventa -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer" onclick="navigate('mis-reservas')">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Reservas Tránsito</span>
              <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm font-black">
                <i class="fas fa-boxes-packing"></i>
              </div>
            </div>
            <div class="text-lg sm:text-xl font-black text-slate-900 font-mono">${activeReservations.length}</div>
            <div class="text-[11px] text-teal-700 font-bold mt-1 truncate">
              <span>${fmt(reservasVal)} apartado</span>
            </div>
          </div>

          <!-- KPI 4: Visitas de Hoy -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer" onclick="navigate('mis-rutas')">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">Visitas de Hoy</span>
              <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-black">
                <i class="fas fa-route"></i>
              </div>
            </div>
            <div class="text-lg sm:text-xl font-black text-slate-900 font-mono">${completedVisits.length} / ${todayVisits.length}</div>
            <div class="text-[11px] text-indigo-600 font-bold mt-1">
              <span>${todayVisits.length - completedVisits.length} visitas pendientes</span>
            </div>
          </div>

        </div>

        <!-- ACTION HUB: Accesos Rápidos Táctiles en 1 Toque -->
        <div>
          <h3 class="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Acciones Rápidas del Vendedor</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <button type="button" onclick="navigate('productos')" class="bg-gradient-to-br from-[#006876] to-[#004F5A] text-white p-4 rounded-2xl flex flex-col items-start justify-between gap-3 text-left shadow-xs hover:shadow-md active:scale-95 transition-all">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                <i class="fas fa-box-open"></i>
              </div>
              <div>
                <span class="font-extrabold text-sm block leading-tight">Tomar Pedido</span>
                <span class="text-[11px] text-teal-100 opacity-80">Catálogo interactivo</span>
              </div>
            </button>

            <button type="button" onclick="navigate('mis-reservas')" class="bg-white border border-teal-200 text-teal-900 p-4 rounded-2xl flex flex-col items-start justify-between gap-3 text-left shadow-xs hover:shadow-md hover:bg-teal-50/50 active:scale-95 transition-all">
              <div class="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-lg">
                <i class="fas fa-boxes-packing"></i>
              </div>
              <div>
                <span class="font-extrabold text-sm block leading-tight">Mis Reservas</span>
                <span class="text-[11px] text-slate-500">Stock en preventa</span>
              </div>
            </button>

            <button type="button" onclick="navigate('mis-rutas')" class="bg-white border border-slate-200 text-slate-900 p-4 rounded-2xl flex flex-col items-start justify-between gap-3 text-left shadow-xs hover:shadow-md hover:bg-slate-50 active:scale-95 transition-all">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg">
                <i class="fas fa-route"></i>
              </div>
              <div>
                <span class="font-extrabold text-sm block leading-tight">Mi Agenda Hoy</span>
                <span class="text-[11px] text-slate-500">Rutas de clientes</span>
              </div>
            </button>

            <button type="button" onclick="navigate('pedidos')" class="bg-white border border-slate-200 text-slate-900 p-4 rounded-2xl flex flex-col items-start justify-between gap-3 text-left shadow-xs hover:shadow-md hover:bg-slate-50 active:scale-95 transition-all">
              <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg">
                <i class="fas fa-file-signature"></i>
              </div>
              <div>
                <span class="font-extrabold text-sm block leading-tight">Mis Pedidos</span>
                <span class="text-[11px] text-slate-500">Historial y estados</span>
              </div>
            </button>

          </div>
        </div>

        <!-- 2 COLUMNAS PRINCIPALES: Agenda de Hoy + Alertas de Preventa -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- COLUMNA 1: Agenda de Visitas de Hoy -->
          <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                  <i class="fas fa-location-dot"></i>
                </div>
                <div>
                  <h3 class="font-extrabold text-sm text-slate-900">Agenda de Visitas de Hoy</h3>
                  <p class="text-[11px] text-slate-400 font-semibold">${todayVisits.length} clientes agendados para hoy</p>
                </div>
              </div>
              <button type="button" onclick="navigate('mis-rutas')" class="text-xs font-extrabold text-indigo-600 hover:underline">
                Ver Todo <i class="fas fa-arrow-right ml-1"></i>
              </button>
            </div>

            <div class="space-y-2.5 max-h-80 overflow-y-auto">
              ${todayVisits.length === 0 ? `
                <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <i class="fas fa-calendar-check text-slate-300 text-3xl mb-2"></i>
                  <p class="text-xs font-bold text-slate-600">No tienes visitas agendadas para hoy</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Puedes crear una nueva ruta o visitar clientes directamente.</p>
                  <button type="button" onclick="navigate('mis-rutas')" class="btn btn-outline btn-sm mt-3 text-xs">
                    <i class="fas fa-plus mr-1"></i> Planear Ruta
                  </button>
                </div>
              ` : todayVisits.map((v: any, idx: number) => {
                const client = v.expand?.client_id || {};
                const isDone = v.status === 'completed';
                return `
                  <div class="p-3 rounded-2xl border ${isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'} flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-7 h-7 rounded-lg ${isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                        ${isDone ? '<i class="fas fa-check text-[10px]"></i>' : (idx + 1)}
                      </div>
                      <div class="min-w-0">
                        <h4 class="font-extrabold text-xs text-slate-900 truncate">${esc(client.name || 'Cliente')}</h4>
                        <p class="text-[10px] text-slate-400 truncate">${esc(client.address || client.city || 'Sin dirección')}</p>
                      </div>
                    </div>

                    <div class="flex items-center gap-1.5 flex-shrink-0">
                      ${client.phone ? `
                        <a href="tel:${esc(client.phone)}" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs" title="Llamar">
                          <i class="fas fa-phone"></i>
                        </a>
                      ` : ''}
                      <button type="button" onclick="window.SalesCart?.setActiveCustomer(${JSON.stringify(client).replace(/"/g, '&quot;')}); navigate('productos');" class="btn btn-primary btn-sm py-1 px-2.5 rounded-lg text-[11px] font-bold bg-[#006876] hover:bg-[#004F5A] text-white">
                        <i class="fas fa-cart-plus mr-1"></i> Pedir
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- COLUMNA 2: Alertas de Embarques de Preventa (ETA) -->
          <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm font-bold">
                  <i class="fas fa-ship"></i>
                </div>
                <div>
                  <h3 class="font-extrabold text-sm text-slate-900">Preventas en Tránsito (ETA)</h3>
                  <p class="text-[11px] text-slate-400 font-semibold">Mercancía en camino para tus clientes</p>
                </div>
              </div>
              <button type="button" onclick="navigate('mis-reservas')" class="text-xs font-extrabold text-teal-600 hover:underline">
                Ver Todas <i class="fas fa-arrow-right ml-1"></i>
              </button>
            </div>

            <div class="space-y-2.5 max-h-80 overflow-y-auto">
              ${upcomingEtaRes.length === 0 ? `
                <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <i class="fas fa-boxes-packing text-slate-300 text-3xl mb-2"></i>
                  <p class="text-xs font-bold text-slate-600">No tienes reservas activas de preventa</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Ofrece los productos en tránsito desde el catálogo para ganar preventas.</p>
                  <button type="button" onclick="window.SalesCart?.setCartMode('reserva'); navigate('productos');" class="btn btn-outline btn-sm mt-3 text-xs text-teal-800 border-teal-300">
                    <i class="fas fa-ship mr-1"></i> Ver Catálogo en Preventa
                  </button>
                </div>
              ` : upcomingEtaRes.map((r: any) => {
                const cust = r.expand?.customer_id || {};
                const rlines = linesByResId[r.id] || [];
                const firstLine = rlines[0];
                const eta = firstLine?.expand?.import_id?.eta || 'Pronto';
                const impNum = firstLine?.expand?.import_id?.number || 'IMP';

                const waPhone = (cust.phone || '').replace(/\D/g, '');
                const waMsg = encodeURIComponent(`Hola ${cust.name || 'Cliente'}, te saludamos de GRAVY. Te recordamos que tu reserva de preventa #RES-${r.id.slice(-6).toUpperCase()} viene en el embarque ${impNum} con fecha estimada de arribo ${eta}. ¡Te avisaremos cuando ingrese a bodega!`);
                const waUrl = waPhone ? `https://wa.me/57${waPhone}?text=${waMsg}` : `https://wa.me/?text=${waMsg}`;

                return `
                  <div class="p-3.5 rounded-2xl border border-slate-200 bg-teal-50/20 space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md">#RES-${esc(r.id.slice(-6).toUpperCase())}</span>
                        <span class="font-extrabold text-xs text-slate-800">${esc(cust.name || 'Cliente')}</span>
                      </div>
                      <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 border border-teal-200">
                        <i class="fas fa-calendar-day mr-1"></i>ETA ${eta}
                      </span>
                    </div>

                    <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span class="text-slate-500 font-mono text-[11px]">${rlines.length} producto(s) en preventa</span>
                      <a href="${waUrl}" target="_blank" class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                      </a>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>

        <!-- SECCIÓN 3: Últimos Pedidos Registrados del Vendedor -->
        <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-extrabold text-sm text-slate-900">Mis Últimos Pedidos</h3>
              <p class="text-[11px] text-slate-400 font-semibold">Historial reciente de pedidos y cotizaciones</p>
            </div>
            <button type="button" onclick="navigate('pedidos')" class="text-xs font-extrabold text-blue-600 hover:underline">
              Ver Todos los Pedidos <i class="fas fa-arrow-right ml-1"></i>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                  <th class="pb-2">Número</th>
                  <th class="pb-2">Fecha</th>
                  <th class="pb-2">Cliente</th>
                  <th class="pb-2 text-right">Total</th>
                  <th class="pb-2 text-center">Estado</th>
                  <th class="pb-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${orders.slice(0, 5).map((o: any) => {
                  const cust = o.expand?.customer_id || {};
                  const isPending = o.status === 'pending';
                  return `
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="py-2.5 font-mono font-bold text-slate-900">${esc(o.number)}</td>
                      <td class="py-2.5 text-slate-500 font-mono text-[11px]">${esc(o.date)}</td>
                      <td class="py-2.5 font-bold text-slate-800">${esc(cust.name || '—')}</td>
                      <td class="py-2.5 text-right font-mono font-bold text-slate-900">${fmt(o.total)}</td>
                      <td class="py-2.5 text-center">
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}">
                          ${isPending ? 'Pendiente' : 'Procesado'}
                        </span>
                      </td>
                      <td class="py-2.5 text-right">
                        <button type="button" onclick="navigate('pedidos')" class="text-slate-400 hover:text-slate-700">
                          <i class="fas fa-chevron-right text-xs"></i>
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

  } catch (err: any) {
    console.error('[VendedorDashboard] Error:', err);
    c.innerHTML = `
      <div class="p-8 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200 max-w-lg mx-auto">
        <i class="fas fa-circle-exclamation text-3xl mb-2"></i>
        <h4 class="font-extrabold text-sm text-slate-900">Error al cargar el dashboard comercial</h4>
        <p class="text-xs text-slate-500 mt-1">${esc(err.message)}</p>
        <button onclick="if(window.reloadTab){window.reloadTab('dashboard')}else{renderDashboard(document.getElementById('page-content'))}" class="btn btn-outline btn-sm mt-3">
          <i class="fas fa-rotate-right mr-1"></i> Reintentar
        </button>
      </div>
    `;
  }
}

async function viewTransaction(id: string): Promise<void> {
  navigate('consulta-tx');
  setTimeout(() => {
    if (typeof (window as any).seeTxDetail === 'function') {
      (window as any).seeTxDetail(id);
    }
  }, 120);
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderDashboard  = renderDashboard;
(window as any).renderVendedorDashboard = renderVendedorDashboard;
(window as any).viewTransaction  = viewTransaction;
