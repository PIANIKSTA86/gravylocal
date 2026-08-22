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
  c = getContainer(c);
  if (!c) return;

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
        border-radius: 18px;
        padding: 22px;
        border: 1px solid #E2E8F0;
        position: relative;
        overflow: hidden;
        transition: transform .22s, box-shadow .22s;
      }
      .dash-kpi-card:hover { transform: translateY(-3px); box-shadow: 0 14px 32px rgba(15,23,42,.09); }
      .dash-kpi-accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 18px 18px 0 0; }
      .dash-chart-panel {
        background: #fff;
        border-radius: 18px;
        padding: 22px 24px;
        border: 1px solid #E2E8F0;
        box-shadow: 0 1px 4px rgba(15,23,42,.04);
        display: flex; flex-direction: column;
      }
      .dash-action-btn {
        display: flex; align-items: center; gap: 12px;
        padding: 13px 16px;
        border-radius: 14px;
        border: 1px solid transparent;
        background: transparent;
        cursor: pointer;
        transition: transform .18s, background .18s, border-color .18s, box-shadow .18s;
        text-align: left; width: 100%;
        font-family: inherit;
      }
      .dash-action-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(15,23,42,.08); }
      .dash-action-icon {
        width: 38px; height: 38px;
        border-radius: 11px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .dash-table tr { cursor: pointer; transition: background .13s; }
      .dash-table tr:hover td { background: #F8FAFC; }
    </style>

    <div class="anim-fade">
      <!-- Hero skeleton -->
      <div style="background:linear-gradient(135deg,rgba(99,102,241,.07),rgba(56,189,248,.05));border:1px solid rgba(99,102,241,.12);border-radius:20px;padding:26px 32px;margin-bottom:22px">
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
    const rawName  = pb?.currentUser?.name || pb?.currentUser?.email?.split('@')[0] || 'Usuario';
    const userName = rawName.split(' ')[0]; // Solo primer nombre

    // ── Cargar datos del backend
    const summary = await (API as any).getDashboardSummary(branchId, advisorId);

    // ── Extraer KPIs CORE (operacionales)
    const kpis          = summary.kpis           || {};
    const txToday       = kpis.txToday           || 0;
    const txThisMonth   = kpis.txThisMonth       || 0;
    const txPrevMonth   = kpis.txPrevMonth       || 0;
    const totalTp       = kpis.totalTp           || 0;
    const totalAc       = kpis.totalAc           || 0;
    const newTpMonth    = kpis.newTpThisMonth    || 0;

    const months        = summary.monthsLabels   || [];
    const monthlyTxCounts: number[] = summary.monthlyTxCounts || new Array(6).fill(0);
    const txByType: any[]           = summary.txByType        || [];
    const recentActivity: any[]     = summary.recentActivity  || [];
    const sellers: any[]            = summary.sellers         || [];
    const stockDetails: any[]       = summary.stockDetails    || [];

    const monthsShort = months.map((m: string) => {
      const [, mStr] = m.split('-');
      return `${monShort[parseInt(mStr,10) - 1]}`;
    });

    // Tendencia mes actual vs anterior
    let trendHTML = '';
    if (txPrevMonth > 0) {
      const pct     = ((txThisMonth - txPrevMonth) / txPrevMonth * 100);
      const isUp    = pct >= 0;
      const absPct  = Math.abs(pct).toFixed(1);
      const color   = isUp ? '#059669' : '#DC2626';
      const bg      = isUp ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)';
      const border  = isUp ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)';
      const icon    = isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
      trendHTML = `
        <div style="display:flex;align-items:center;gap:4px;padding:4px 9px;border-radius:20px;background:${bg};border:1px solid ${border}">
          <i class="fas ${icon}" style="font-size:10px;color:${color}"></i>
          <span style="font-size:10px;font-weight:700;color:${color}">${isUp?'+':''}${absPct}%</span>
        </div>`;
    }

    // ── Módulos activos (para acciones rápidas y badges)
    const MODULE_META: Record<string,{label:string;color:string}> = {
      contabilidad:  { label:'Contabilidad',   color:'#6366F1' },
      comercial:     { label:'Comercial',       color:'#0C728F' },
      nomina:        { label:'Nómina',          color:'#7F7CFF' },
      inventarios:   { label:'Inventarios',     color:'#10B981' },
      tesoreria:     { label:'Tesorería',       color:'#F59E0B' },
      crm:           { label:'CRM',             color:'#EC4899' },
      copropiedades: { label:'Copropiedades',   color:'#F59E0B' },
      inmobiliarias: { label:'Inmobiliaria',    color:'#EC4899' },
      logistica:     { label:'Logística',       color:'#3B82F6' },
      niif:          { label:'NIIF',            color:'#7F7CFF' },
      activos_fijos: { label:'Activos Fijos',   color:'#10B981' },
      spa:           { label:'Spa Mascotas',    color:'#F43F5E' },
      'spa-belleza': { label:'Spa Belleza',     color:'#EC4899' },
      conciliacion:  { label:'Conciliación',    color:'#6366F1' },
    };
    const _hasModule = (k: string): boolean => typeof (window as any).hasModule === 'function'
      ? (window as any).hasModule(k) : false;
    const _can = (p: string): boolean => typeof (window as any).can === 'function'
      ? (window as any).can(p) : false;
    const _esc = (s: string): string => typeof (window as any).esc === 'function'
      ? (window as any).esc(s) : String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const activeModulesBadges = Object.entries(MODULE_META)
      .filter(([k]) => _hasModule(k))
      .map(([, v]) => `
        <span style="font-size:10px;font-weight:600;padding:3px 9px;border-radius:20px;
          background:${v.color}1A;color:${v.color};white-space:nowrap">
          ${v.label}
        </span>`).join('');

    // ── Paleta de colores para chart de tipos
    const TYPE_PALETTE = ['#6366F1','#38BDF8','#10B981','#F59E0B','#EF4444','#EC4899','#14B8A6','#8B5CF6'];
    const typeColors   = txByType.map((_: any, i: number) => TYPE_PALETTE[i % TYPE_PALETTE.length]);

    // ════════════════════════════════════════════════════
    //  RENDER
    // ════════════════════════════════════════════════════
    c.innerHTML = `

    <!-- ████  HERO  ████ -->
    <div class="anim-slide-up" style="
      background: linear-gradient(135deg,rgba(99,102,241,.09) 0%,rgba(56,189,248,.07) 60%,rgba(16,185,129,.05) 100%);
      border: 1px solid rgba(99,102,241,.14);
      border-radius: 20px;
      padding: 24px 30px;
      margin-bottom: 22px;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 14px;
      position: relative; overflow: hidden;
    ">
      <div style="position:absolute;right:-50px;top:-50px;width:220px;height:220px;border-radius:50%;
        background:radial-gradient(circle,rgba(99,102,241,.07),transparent 70%);pointer-events:none"></div>
      <div style="position:absolute;left:40%;bottom:-70px;width:180px;height:180px;border-radius:50%;
        background:radial-gradient(circle,rgba(56,189,248,.05),transparent 70%);pointer-events:none"></div>

      <div style="position:relative">
        <h1 style="font-size:21px;font-weight:800;color:#0F172A;margin:0 0 5px;letter-spacing:-.3px">
          ${greeting}, ${_esc(userName)} 👋
        </h1>
        <p style="font-size:13px;color:#64748B;margin:0;font-weight:500;display:flex;align-items:center;gap:6px">
          <i class="fas fa-calendar-days" style="color:#6366F1;font-size:11px"></i>
          ${dateLabel}
        </p>
      </div>

      <!-- Live pill -->
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:7px;padding:8px 15px;
          background:rgba(16,185,129,.09);border:1px solid rgba(16,185,129,.2);border-radius:20px">
          <span class="dash-live-dot" style="background:#10B981;--ring-color:rgba(16,185,129,.5)"></span>
          <span style="font-size:12px;font-weight:700;color:#059669">Sistema activo</span>
        </div>
      </div>
    </div>

    <!-- ████  KPI CARDS × 4  ████ -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

      <!-- ① Transacciones Hoy -->
      <div class="dash-kpi-card anim-slide-up" style="animation-delay:.05s">
        <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#38BDF8,#0EA5E9)"></div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
          <div style="width:44px;height:44px;border-radius:13px;
            background:linear-gradient(135deg,#38BDF8,#0EA5E9);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 14px rgba(56,189,248,.35)">
            <i class="fas fa-file-lines" style="font-size:18px;color:#fff"></i>
          </div>
          <!-- Live badge -->
          <div style="display:flex;align-items:center;gap:5px;padding:4px 10px;
            border-radius:20px;background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.22)">
            <span class="dash-live-dot" style="background:#38BDF8;width:6px;height:6px;--ring-color:rgba(56,189,248,.5)"></span>
            <span style="font-size:10px;font-weight:700;color:#0284C7">LIVE</span>
          </div>
        </div>
        <div id="kpi-tx-today" style="font-size:38px;font-weight:900;color:#0C4A6E;letter-spacing:-1.5px;line-height:1;margin-bottom:7px">0</div>
        <p style="font-size:12px;font-weight:700;color:#0369A1;margin:0 0 3px">Transacciones Hoy</p>
        <p style="font-size:11px;color:#94A3B8;margin:0">Documentos del día actual</p>
      </div>

      <!-- ② Transacciones del Mes -->
      <div class="dash-kpi-card anim-slide-up" style="animation-delay:.10s">
        <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#6366F1,#4F46E5)"></div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
          <div style="width:44px;height:44px;border-radius:13px;
            background:linear-gradient(135deg,#6366F1,#4F46E5);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 14px rgba(99,102,241,.35)">
            <i class="fas fa-chart-bar" style="font-size:18px;color:#fff"></i>
          </div>
          ${trendHTML}
        </div>
        <div id="kpi-tx-month" style="font-size:38px;font-weight:900;color:#1E1B4B;letter-spacing:-1.5px;line-height:1;margin-bottom:7px">0</div>
        <p style="font-size:12px;font-weight:700;color:#4338CA;margin:0 0 3px">Transacciones del Mes</p>
        <p style="font-size:11px;color:#94A3B8;margin:0 0 10px">${txPrevMonth > 0 ? `${fmtCount(txPrevMonth)} el mes anterior` : 'Mes en curso'}</p>
        <!-- Sparkline -->
        <div style="opacity:.8;margin-top:2px">${sparklineSVG(monthlyTxCounts,'#6366F1',110,30)}</div>
      </div>

      <!-- ③ Terceros Activos -->
      <div class="dash-kpi-card anim-slide-up" style="animation-delay:.15s">
        <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#10B981,#059669)"></div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
          <div style="width:44px;height:44px;border-radius:13px;
            background:linear-gradient(135deg,#10B981,#059669);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 14px rgba(16,185,129,.35)">
            <i class="fas fa-users" style="font-size:18px;color:#fff"></i>
          </div>
          ${newTpMonth > 0 ? `
          <div style="padding:4px 10px;border-radius:20px;
            background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.22)">
            <span style="font-size:10px;font-weight:700;color:#059669">+${fmtCount(newTpMonth)} nuevos</span>
          </div>` : ''}
        </div>
        <div id="kpi-tp" style="font-size:38px;font-weight:900;color:#064E3B;letter-spacing:-1.5px;line-height:1;margin-bottom:7px">0</div>
        <p style="font-size:12px;font-weight:700;color:#047857;margin:0 0 3px">Terceros Activos</p>
        <p style="font-size:11px;color:#94A3B8;margin:0">Clientes, proveedores y otros</p>
      </div>

      <!-- ④ Cuentas Contables -->
      <div class="dash-kpi-card anim-slide-up" style="animation-delay:.20s">
        <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#F59E0B,#D97706)"></div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
          <div style="width:44px;height:44px;border-radius:13px;
            background:linear-gradient(135deg,#F59E0B,#D97706);
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 14px rgba(245,158,11,.35)">
            <i class="fas fa-book-open" style="font-size:18px;color:#fff"></i>
          </div>
        </div>
        <div id="kpi-ac" style="font-size:38px;font-weight:900;color:#78350F;letter-spacing:-1.5px;line-height:1;margin-bottom:7px">0</div>
        <p style="font-size:12px;font-weight:700;color:#B45309;margin:0 0 3px">Cuentas Contables</p>
        <p style="font-size:11px;color:#94A3B8;margin:0">Cuentas activas en el plan</p>
      </div>
    </div>

    <!-- ████  GRÁFICOS  ████ -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

      <!-- Volumen mensual (2/3) -->
      <div class="dash-chart-panel lg:col-span-2 anim-slide-up" style="animation-delay:.25s;min-height:300px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
          <div>
            <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
              <span style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#38BDF8);display:inline-block"></span>
              Volumen de Actividad
            </h3>
            <p style="font-size:12px;color:#94A3B8;margin:0">Cantidad de transacciones registradas por mes</p>
          </div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#64748B;font-weight:600">
            <span style="width:26px;height:3px;border-radius:3px;background:linear-gradient(90deg,#6366F1,#38BDF8);display:inline-block"></span>
            Últimos 6 meses
          </div>
        </div>
        <div style="flex:1;min-height:210px;position:relative">
          <canvas id="chart-monthly-activity"></canvas>
        </div>
      </div>

      <!-- Cartera por Edades a Día de Hoy (1/3) -->
      <div class="dash-chart-panel anim-slide-up" style="animation-delay:.30s;min-height:300px">
        <div style="margin-bottom:14px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px">
          <div>
            <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
              <span style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#38BDF8,#10B981);display:inline-block"></span>
              Cartera por Edades
            </h3>
            <p style="font-size:11px;color:#94A3B8;margin:0">Cuentas por cobrar hoy</p>
          </div>
          <!-- Filtro de Vendedores -->
          <select id="dash-seller-filter" style="
            font-size:11px;font-weight:600;color:#475569;
            border:1px solid #E2E8F0;background:#fff;
            border-radius:8px;padding:4px 8px;cursor:pointer;
            max-width:130px;outline:none;font-family:inherit
          ">
            <option value="">Todos los Asesores</option>
            ${sellers.map((s: any) => `
              <option value="${_esc(s.id)}" ${s.id === advisorId ? 'selected' : ''}>
                ${_esc(s.name)}
              </option>`).join('')}
          </select>
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;max-height:240px">
          <canvas id="chart-aging-portfolio"></canvas>
        </div>
      </div>
    </div>

      <!-- Evolución de Ventas vs Costos/Gastos (2/3) -->
      <div class="dash-chart-panel xl:col-span-2 anim-slide-up" style="animation-delay:.35s;min-height:300px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
          <div>
            <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
              <span style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#10B981,#EF4444);display:inline-block"></span>
              Ventas vs. Gastos y Costos
            </h3>
            <p style="font-size:12px;color:#94A3B8;margin:0">Comparativa de ingresos operacionales contra egresos</p>
          </div>
          <!-- Filtro de rango de tiempo -->
          <select id="dash-finance-range" style="
            font-size:11px;font-weight:600;color:#475569;
            border:1px solid #E2E8F0;background:#fff;
            border-radius:8px;padding:4px 8px;cursor:pointer;
            outline:none;font-family:inherit
          ">
            <option value="year">Año Actual</option>
            <option value="6months">Últimos 6 Meses</option>
            <option value="quarter">Último Trimestre</option>
            <option value="month">Último Mes (Diario)</option>
          </select>
        </div>
        <div style="flex:1;min-height:220px;position:relative">
          <canvas id="chart-finance-evolution"></canvas>
        </div>
      </div>

      <!-- Acciones Rápidas y Estadísticas de Inventario (1/3) -->
      <div style="display:flex;flex-direction:column;gap:20px;justify-content:stretch">
        
        <!-- Acciones Rápidas (Compact) -->
        <div class="dash-chart-panel anim-slide-up" style="animation-delay:.40s;padding:18px 22px;gap:0">
          <div style="margin-bottom:12px">
            <h3 style="font-size:13px;font-weight:800;color:#0F172A;margin:0 0 2px;display:flex;align-items:center;gap:6px">
              <span style="width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#F59E0B,#F43F5E);display:inline-block"></span>
              Acciones Rápidas
            </h3>
            <p style="font-size:11px;color:#94A3B8;margin:0">Accesos directos de tu perfil</p>
          </div>

          <div style="display:flex;flex-direction:column;gap:6px">
            ${_can('canWrite') ? `
            <button class="dash-action-btn" onclick="navigate('consulta-tx')"
              style="border-color:rgba(99,102,241,.15);background:rgba(99,102,241,.03);padding:9px 12px;border-radius:10px"
              onmouseover="this.style.background='rgba(99,102,241,.08)';this.style.borderColor='rgba(99,102,241,.25)'"
              onmouseout="this.style.background='rgba(99,102,241,.03)';this.style.borderColor='rgba(99,102,241,.15)'">
              <div class="dash-action-icon" style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#6366F1,#4F46E5);box-shadow:0 2px 6px rgba(99,102,241,.25)">
                <i class="fas fa-plus" style="color:#fff;font-size:12px"></i>
              </div>
              <div>
                <p style="font-size:12px;font-weight:700;color:#1E293B;margin:0">Nueva Transacción</p>
              </div>
            </button>` : ''}

            <button class="dash-action-btn" onclick="navigate('terceros')"
              style="border-color:rgba(16,185,129,.15);background:rgba(16,185,129,.03);padding:9px 12px;border-radius:10px"
              onmouseover="this.style.background='rgba(16,185,129,.08)';this.style.borderColor='rgba(16,185,129,.25)'"
              onmouseout="this.style.background='rgba(16,185,129,.03)';this.style.borderColor='rgba(16,185,129,.15)'">
              <div class="dash-action-icon" style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#10B981,#059669);box-shadow:0 2px 6px rgba(16,185,129,.25)">
                <i class="fas fa-users" style="color:#fff;font-size:12px"></i>
              </div>
              <div>
                <p style="font-size:12px;font-weight:700;color:#1E293B;margin:0">Terceros</p>
              </div>
            </button>

            <button class="dash-action-btn" onclick="navigate('plan-cuentas')"
              style="border-color:rgba(245,158,11,.15);background:rgba(245,158,11,.03);padding:9px 12px;border-radius:10px"
              onmouseover="this.style.background='rgba(245,158,11,.08)';this.style.borderColor='rgba(245,158,11,.25)'"
              onmouseout="this.style.background='rgba(245,158,11,.03)';this.style.borderColor='rgba(245,158,11,.15)'">
              <div class="dash-action-icon" style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#F59E0B,#D97706);box-shadow:0 2px 6px rgba(245,158,11,.25)">
                <i class="fas fa-sitemap" style="color:#fff;font-size:12px"></i>
              </div>
              <div>
                <p style="font-size:12px;font-weight:700;color:#1E293B;margin:0">Plan de Cuentas</p>
              </div>
            </button>

            ${_hasModule('contabilidad') ? `
            <button class="dash-action-btn" onclick="navigate('reportes')"
              style="border-color:rgba(56,189,248,.15);background:rgba(56,189,248,.03);padding:9px 12px;border-radius:10px"
              onmouseover="this.style.background='rgba(56,189,248,.08)';this.style.borderColor='rgba(56,189,248,.25)'"
              onmouseout="this.style.background='rgba(56,189,248,.03)';this.style.borderColor='rgba(56,189,248,.15)'">
              <div class="dash-action-icon" style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#38BDF8,#0284C7);box-shadow:0 2px 6px rgba(56,189,248,.25)">
                <i class="fas fa-chart-pie" style="color:#fff;font-size:12px"></i>
              </div>
              <div>
                <p style="font-size:12px;font-weight:700;color:#1E293B;margin:0">Reportes Financieros</p>
              </div>
            </button>` : ''}
          </div>
        </div>

        <!-- Estadísticas de Inventario (Nuevo KPI) -->
        <div class="dash-chart-panel anim-slide-up" style="animation-delay:.45s;padding:18px 22px;min-height:300px">
          <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
            <div>
              <h3 style="font-size:13px;font-weight:800;color:#0F172A;margin:0 0 2px;display:flex;align-items:center;gap:6px">
                <span style="width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#38BDF8,#10B981);display:inline-block"></span>
                Inventario por Valor
              </h3>
              <p style="font-size:11px;color:#94A3B8;margin:0">Valorización de existencias</p>
            </div>
            <!-- Total Valorizado Pequeño -->
            <div style="text-align:right">
              <span id="dash-inv-val" style="font-size:12px;font-weight:800;color:#0F172A">$0</span>
              <p style="font-size:9px;color:#94A3B8;margin:0">Total filtros</p>
            </div>
          </div>

          <!-- Filtros de Categoría y Línea -->
          <div style="display:grid;grid-template-cols:1fr 1fr;gap:8px;margin-bottom:12px">
            <select id="dash-inv-category" style="
              font-size:10px;font-weight:600;color:#475569;
              border:1px solid #E2E8F0;background:#fff;
              border-radius:8px;padding:4px 6px;cursor:pointer;outline:none;font-family:inherit
            ">
              <option value="">Todas las Categorías</option>
            </select>
            <select id="dash-inv-line" style="
              font-size:10px;font-weight:600;color:#475569;
              border:1px solid #E2E8F0;background:#fff;
              border-radius:8px;padding:4px 6px;cursor:pointer;outline:none;font-family:inherit
            ">
              <option value="">Todas las Líneas</option>
            </select>
          </div>

          <!-- Gráfico de barras -->
          <div style="flex:1;min-height:160px;position:relative">
            <canvas id="chart-inventory-bars"></canvas>
          </div>
        </div>

      </div>
    </div>`;

    // ── Animaciones de contadores
    const ce = (id: string, val: number) => {
      const el = document.getElementById(id);
      if (el) animateCounter(el, val);
    };
    ce('kpi-tx-today', txToday);
    ce('kpi-tx-month', txThisMonth);
    ce('kpi-tp',       totalTp);
    ce('kpi-ac',       totalAc);

    // ── Gráfico de Volumen Mensual
    if (_activityChart) _activityChart.destroy();
    const actCtx = (document.getElementById('chart-monthly-activity') as HTMLCanvasElement)?.getContext('2d');
    if (actCtx) {
      // Gradiente para la barra del mes actual
      const barGrad = actCtx.createLinearGradient(0, 0, 0, 200);
      barGrad.addColorStop(0, 'rgba(99,102,241,.92)');
      barGrad.addColorStop(1, 'rgba(56,189,248,.80)');

      _activityChart = new Chart(actCtx, {
        type: 'bar',
        data: {
          labels: monthsShort,
          datasets: [{
            label: 'Transacciones',
            data: monthlyTxCounts,
            backgroundColor: monthlyTxCounts.map((_, i) =>
              i === monthlyTxCounts.length - 1
                ? barGrad
                : 'rgba(99,102,241,.18)'
            ),
            borderRadius: 8,
            borderSkipped: false,
            barPercentage: 0.58,
            categoryPercentage: 0.72,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(5,8,20,.93)',
              titleColor: '#F8FAFC',
              bodyColor: '#CBD5E1',
              borderColor: 'rgba(255,255,255,.1)',
              borderWidth: 1,
              padding: 12,
              cornerRadius: 10,
              callbacks: {
                title: (ctx: any) => ctx[0].label,
                label: (ctx: any) => ` ${ctx.parsed.y.toLocaleString('es-CO')} transacciones`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans', size: 11, weight: 600 as any } },
            },
            y: {
              grid: { color: 'rgba(226,232,240,.55)' },
              ticks: {
                color: '#94A3B8',
                font: { family: 'Plus Jakarta Sans', size: 10 },
                callback: (v: any) => v.toLocaleString('es-CO'),
              },
            },
          },
        },
      });
    }

    // ── Gráfico de Cartera por Edades
    if (_typesChart) _typesChart.destroy();
    const agingCtx = (document.getElementById('chart-aging-portfolio') as HTMLCanvasElement)?.getContext('2d');
    if (agingCtx) {
      const carteraBuckets = summary.carteraBuckets || { porVencer: 0, c0_30: 0, c31_60: 0, c61_90: 0, cMayor90: 0 };
      const agingLabels = ['Por Vencer', '0-30 días', '31-60 días', '61-90 días', 'Más de 90 días'];
      const agingValues = [
        carteraBuckets.porVencer || 0,
        carteraBuckets.c0_30     || 0,
        carteraBuckets.c31_60    || 0,
        carteraBuckets.c61_90    || 0,
        carteraBuckets.cMayor90  || 0
      ];

      const nonZeroAgingLabels: string[] = [];
      const nonZeroAgingValues: number[] = [];
      const agingPalette = ['#10B981', '#F59E0B', '#EF4444', '#DC2626', '#991B1B'];
      const nonZeroPalette: string[] = [];

      for (let i = 0; i < agingValues.length; i++) {
        if (agingValues[i] > 0.0001) {
          nonZeroAgingLabels.push(agingLabels[i]);
          nonZeroAgingValues.push(agingValues[i]);
          nonZeroPalette.push(agingPalette[i]);
        }
      }

      if (nonZeroAgingValues.length === 0) {
        nonZeroAgingLabels.push('Sin Cartera');
        nonZeroAgingValues.push(1);
        nonZeroPalette.push('#E5E7EB');
      }

      _typesChart = new Chart(agingCtx, {
        type: 'doughnut',
        data: {
          labels: nonZeroAgingLabels,
          datasets: [{
            data: nonZeroAgingValues,
            backgroundColor: nonZeroPalette,
            borderWidth: 2,
            borderColor: '#fff',
            hoverOffset: 7,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '66%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 9,
                padding: 9,
                color: '#475569',
                font: { family: 'Plus Jakarta Sans', size: 10 },
                usePointStyle: true,
                pointStyleWidth: 8,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(5,8,20,.93)',
              titleColor: '#F8FAFC',
              bodyColor: '#CBD5E1',
              borderColor: 'rgba(255,255,255,.1)',
              borderWidth: 1,
              cornerRadius: 10,
              callbacks: {
                label: (ctx: any) => {
                  if (nonZeroAgingLabels[0] === 'Sin Cartera') return ' Sin cartera pendiente';
                  const total = nonZeroAgingValues.reduce((a: number, b: number) => a + b, 0);
                  const pct   = ((ctx.parsed / total) * 100).toFixed(1);
                  const formattedValue = (window as any).fmt ? (window as any).fmt(ctx.parsed) : `$${Math.round(ctx.parsed).toLocaleString('es-CO')}`;
                  return ` ${ctx.label}: ${formattedValue} (${pct}%)`;
                },
              },
            },
          },
        },
      });
    }

    // ── Escuchar cambios en el filtro de vendedores
    document.getElementById('dash-seller-filter')?.addEventListener('change', (ev: any) => {
      renderDashboard(c, ev.target.value);
    });

    // ── Lógica del gráfico de evolución Ventas vs. Gastos y Costos
    const months12Labels = summary.months12Labels || [];
    const monthlyRevenues12: number[] = summary.monthlyRevenues12 || [];
    const monthlyExpenses12: number[] = summary.monthlyExpenses12 || [];
    const dailyRevenues: number[] = summary.dailyRevenues || [];
    const dailyExpenses: number[] = summary.dailyExpenses || [];

    const updateFinanceChart = (range: string) => {
      let labels: string[] = [];
      let revenueData: number[] = [];
      let expenseData: number[] = [];
      let chartType: 'line' | 'bar' = 'line';

      if (range === 'year') {
        const currentYearStr = new Date().getFullYear().toString();
        const yearIndices = months12Labels
          .map((m: string, idx: number) => m.startsWith(currentYearStr) ? idx : -1)
          .filter((idx: number) => idx !== -1);

        // Si estamos a inicio de año, mostrar mínimo los últimos 6 meses para que no esté vacío
        const targetIndices = yearIndices.length >= 3 ? yearIndices : Array.from({ length: 6 }, (_, i) => 12 - 6 + i);

        labels = targetIndices.map((idx: number) => {
          const [, mStr] = months12Labels[idx].split('-');
          return monShort[parseInt(mStr, 10) - 1];
        });
        revenueData = targetIndices.map((idx: number) => monthlyRevenues12[idx]);
        expenseData = targetIndices.map((idx: number) => monthlyExpenses12[idx]);
        chartType = 'line';
      } else if (range === '6months') {
        const last6Labels = months12Labels.slice(-6);
        labels = last6Labels.map((m: string) => {
          const [, mStr] = m.split('-');
          return monShort[parseInt(mStr, 10) - 1];
        });
        revenueData = monthlyRevenues12.slice(-6);
        expenseData = monthlyExpenses12.slice(-6);
        chartType = 'line';
      } else if (range === 'quarter') {
        const last3Labels = months12Labels.slice(-3);
        labels = last3Labels.map((m: string) => {
          const [, mStr] = m.split('-');
          return monShort[parseInt(mStr, 10) - 1];
        });
        revenueData = monthlyRevenues12.slice(-3);
        expenseData = monthlyExpenses12.slice(-3);
        chartType = 'line';
      } else if (range === 'month') {
        labels = Array.from({ length: 31 }, (_, i) => `Día ${i + 1}`);
        revenueData = dailyRevenues;
        expenseData = dailyExpenses;
        chartType = 'line';
      }

      if (_financeChart) _financeChart.destroy();
      const finCtx = (document.getElementById('chart-finance-evolution') as HTMLCanvasElement)?.getContext('2d');
      if (finCtx) {
        _financeChart = new Chart(finCtx, {
          type: chartType,
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Ventas (Ingresos)',
                data: revenueData,
                borderColor: '#10B981',
                backgroundColor: chartType === 'line' ? 'rgba(16,185,129,.05)' : 'rgba(16,185,129,.75)',
                borderWidth: 2,
                fill: chartType === 'line',
                tension: 0.35,
                borderRadius: chartType === 'bar' ? 6 : 0,
                barPercentage: 0.55,
              },
              {
                label: 'Gastos y Costos',
                data: expenseData,
                borderColor: '#EF4444',
                backgroundColor: chartType === 'line' ? 'rgba(239,68,68,.05)' : 'rgba(239,68,68,.75)',
                borderWidth: 2,
                fill: chartType === 'line',
                tension: 0.35,
                borderRadius: chartType === 'bar' ? 6 : 0,
                barPercentage: 0.55,
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  boxWidth: 9,
                  padding: 10,
                  color: '#475569',
                  font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' as any },
                  usePointStyle: true,
                  pointStyleWidth: 8,
                }
              },
              tooltip: {
                backgroundColor: 'rgba(5,8,20,.93)',
                titleColor: '#F8FAFC',
                bodyColor: '#CBD5E1',
                borderColor: 'rgba(255,255,255,.1)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                  label: (ctx: any) => {
                    const formatted = (window as any).fmt ? (window as any).fmt(ctx.parsed.y) : `$${Math.round(ctx.parsed.y).toLocaleString('es-CO')}`;
                    return ` ${ctx.dataset.label}: ${formatted}`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#94A3B8', font: { family: 'Plus Jakarta Sans', size: 10 } }
              },
              y: {
                grid: { color: 'rgba(226,232,240,.55)' },
                ticks: {
                  color: '#94A3B8',
                  font: { family: 'Plus Jakarta Sans', size: 9 },
                  callback: (v: any) => {
                    return (window as any).fmt ? (window as any).fmt(v) : `$${Math.round(v).toLocaleString('es-CO')}`;
                  }
                }
              }
            }
          }
        });
      }
    };

    // Render inicial en Año Actual
    updateFinanceChart('year');

    // Cambios de rango
    document.getElementById('dash-finance-range')?.addEventListener('change', (ev: any) => {
      updateFinanceChart(ev.target.value);
    });

    // ── Lógica del panel de estadísticas de Inventario (Gráfico de barras horizontales)
    const catSelect = document.getElementById('dash-inv-category') as HTMLSelectElement;
    const lineSelect = document.getElementById('dash-inv-line') as HTMLSelectElement;
    if (catSelect && lineSelect) {
      const uniqueCategories = Array.from(new Set(stockDetails.map(d => d.category))).sort();
      const uniqueLines = Array.from(new Set(stockDetails.map(d => d.line))).sort();

      uniqueCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
      });

      uniqueLines.forEach(line => {
        const opt = document.createElement('option');
        opt.value = line;
        opt.textContent = line;
        lineSelect.appendChild(opt);
      });

      const updateInventoryStats = () => {
        const selectedCat = catSelect.value || '';
        const selectedLine = lineSelect.value || '';

        let totalVal = 0;
        const groupings: Record<string, number> = {};

        stockDetails.forEach(d => {
          const matchesCat = !selectedCat || d.category === selectedCat;
          const matchesLine = !selectedLine || d.line === selectedLine;

          if (matchesCat && matchesLine) {
            totalVal += d.totalVal;

            const groupKey = selectedCat ? d.line : d.category;
            groupings[groupKey] = (groupings[groupKey] || 0) + d.totalVal;
          }
        });

        const valEl = document.getElementById('dash-inv-val');
        if (valEl) {
          valEl.textContent = (window as any).fmt ? (window as any).fmt(totalVal) : `$${Math.round(totalVal).toLocaleString('es-CO')}`;
        }

        // Ordenar y tomar los top 6
        const sortedGroups = Object.entries(groupings)
          .map(([name, val]) => ({ name, val }))
          .sort((a, b) => b.val - a.val)
          .slice(0, 6);

        const labels = sortedGroups.map(g => g.name);
        const chartData = sortedGroups.map(g => g.val);

        if (_invChart) _invChart.destroy();
        const invCtx = (document.getElementById('chart-inventory-bars') as HTMLCanvasElement)?.getContext('2d');
        if (invCtx) {
          _invChart = new Chart(invCtx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: 'Valor Stock',
                data: chartData,
                backgroundColor: 'rgba(56,189,248,.85)',
                borderColor: '#38BDF8',
                borderWidth: 1.5,
                borderRadius: 4,
                barPercentage: 0.55,
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(5,8,20,.93)',
                  titleColor: '#F8FAFC',
                  bodyColor: '#CBD5E1',
                  borderColor: 'rgba(255,255,255,.1)',
                  borderWidth: 1,
                  padding: 8,
                  cornerRadius: 8,
                  callbacks: {
                    label: (ctx: any) => {
                      const formatted = (window as any).fmt ? (window as any).fmt(ctx.parsed.x) : `$${Math.round(ctx.parsed.x).toLocaleString('es-CO')}`;
                      return ` Valor: ${formatted}`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  grid: { color: 'rgba(226,232,240,.4)' },
                  ticks: {
                    color: '#94A3B8',
                    font: { family: 'Plus Jakarta Sans', size: 9 },
                    callback: (v: any) => {
                      if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
                      if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}k`;
                      return `$${v}`;
                    }
                  }
                },
                y: {
                  grid: { display: false },
                  ticks: {
                    color: '#475569',
                    font: { family: 'Plus Jakarta Sans', size: 9, weight: '600' as any }
                  }
                }
              }
            }
          });
        }
      };

      catSelect.addEventListener('change', updateInventoryStats);
      lineSelect.addEventListener('change', updateInventoryStats);

      // Render inicial
      updateInventoryStats();
    }

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
        <button onclick="renderDashboard(document.getElementById('page-content'))"
          class="btn btn-outline" style="margin-top:4px">
          <i class="fas fa-rotate-right"></i> Reintentar
        </button>
      </div>`;
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
(window as any).viewTransaction  = viewTransaction;
