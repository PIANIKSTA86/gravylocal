/**
 * GRAVY v2.0 — widget-registry.ts
 *
 * Registro desacoplado de Widgets e Indicadores del Dashboard.
 * Permite renderizado modular, catálogo dinámico y presets por perfil
 * (Administrador, Contador, Auxiliar de Inventarios).
 */
'use strict';

import { Chart } from 'chart.js';

export interface WidgetHelpers {
  fmt: (n: number) => string;
  fmtCount: (n: number) => string;
  animateCounter: (el: HTMLElement, target: number, duration?: number) => void;
  sparklineSVG: (data: number[], color: string, w?: number, h?: number) => string;
  esc: (s: string) => string;
  can: (p: string) => boolean;
  hasModule: (m: string) => boolean;
  navigate: (route: string) => void;
}

export interface DashboardWidget {
  id: string;
  title: string;
  category: 'admin' | 'contabilidad' | 'inventarios' | 'nomina' | 'dian' | 'pos' | 'compras' | 'importaciones' | 'general';
  categoryLabel: string;
  description: string;
  icon: string;
  defaultColSpan: 1 | 2 | 3 | 4;
  roles: string[];
  moduleRequired?: string;
  render: (container: HTMLElement, data: any, helpers: WidgetHelpers) => void;
  onDestroy?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRO DE WIDGETS
// ─────────────────────────────────────────────────────────────────────────────

export const WIDGET_REGISTRY: Record<string, DashboardWidget> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // PERFIL: ADMINISTRADOR (GERENCIAL / EJECUTIVO)
  // ═══════════════════════════════════════════════════════════════════════════

  kpi_admin_ventas_mes: {
    id: 'kpi_admin_ventas_mes',
    title: 'Ventas del Mes',
    category: 'admin',
    categoryLabel: 'Administración',
    description: 'Facturación acumulada en el mes vs mes anterior',
    icon: 'fa-arrow-trend-up',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'gerente'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const cur = kpis.ventasMes || 0;
      const prev = kpis.ventasMesPrev || 0;
      let trendHTML = '';
      if (prev > 0) {
        const pct = ((cur - prev) / prev) * 100;
        const isUp = pct >= 0;
        const color = isUp ? '#059669' : '#DC2626';
        const bg = isUp ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)';
        trendHTML = `
          <div style="display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;background:${bg}">
            <i class="fas ${isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}" style="font-size:10px;color:${color}"></i>
            <span style="font-size:10px;font-weight:700;color:${color}">${isUp ? '+' : ''}${Math.abs(pct).toFixed(1)}%</span>
          </div>`;
      }
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#10B981,#059669)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#10B981,#059669);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(16,185,129,.3)">
              <i class="fas fa-hand-holding-dollar" style="font-size:16px;color:#fff"></i>
            </div>
            ${trendHTML}
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#064E3B;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(cur)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#047857;margin:0 0 2px">Ventas del Mes</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">${prev > 0 ? `Ant: ${h.fmt(prev)}` : 'Mes en curso'}</p>
        </div>`;
    }
  },

  kpi_admin_liquidez_bancos: {
    id: 'kpi_admin_liquidez_bancos',
    title: 'Disponibilidad Bancaria',
    category: 'admin',
    categoryLabel: 'Administración',
    description: 'Saldo disponible real consolidado en Bancos y Cajas',
    icon: 'fa-building-columns',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'tesoreria', 'contador'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const liq = kpis.totalLiquidez || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#38BDF8,#0284C7)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#38BDF8,#0284C7);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(56,189,248,.3)">
              <i class="fas fa-wallet" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(56,189,248,.1);color:#0284C7">DISPONIBLE</span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#0C4A6E;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(liq)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#0284C7;margin:0 0 2px">Bancos y Caja General</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Cuentas 11 (Efectivo y equivalentes)</p>
        </div>`;
    }
  },

  kpi_admin_cartera_cxc: {
    id: 'kpi_admin_cartera_cxc',
    title: 'Cartera Clientes (CxC)',
    category: 'admin',
    categoryLabel: 'Administración',
    description: 'Saldo abierto de cuentas por cobrar a clientes y saldo vencido',
    icon: 'fa-users-line',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'cartera', 'contador'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const tot = kpis.carteraTotal || 0;
      const venc = Math.min(tot, Math.max(0, kpis.carteraVencida || 0));
      const pctVenc = tot > 0 ? Math.min(100, Math.round((venc / tot) * 100)) : 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#F59E0B,#D97706)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#F59E0B,#D97706);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(245,158,11,.3)">
              <i class="fas fa-file-invoice-dollar" style="font-size:16px;color:#fff"></i>
            </div>
            <div style="padding:3px 8px;border-radius:20px;background:rgba(239,68,68,.1);color:#DC2626;font-size:10px;font-weight:700">
              ${pctVenc}% vencida
            </div>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#78350F;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(tot)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#B45309;margin:0 0 2px">Cartera por Cobrar</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">Mora: <b>${h.fmt(venc)}</b></span>
            <button onclick="navigate('reportes')" style="font-size:11px;font-weight:700;color:#D97706;background:none;border:none;cursor:pointer;padding:0">
              Ver Saldos →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, tot);
    }
  },

  kpi_admin_cxp_semana: {
    id: 'kpi_admin_cxp_semana',
    title: 'Cuentas por Pagar (7 Días)',
    category: 'admin',
    categoryLabel: 'Administración',
    description: 'Obligaciones con proveedores vencidas o a vencer en 7 días',
    icon: 'fa-calendar-week',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'compras', 'contador'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const cxpWeek = kpis.cxpWeek || 0;
      const cxpTot = kpis.cxpTotal || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#EF4444,#DC2626)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#EF4444,#DC2626);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(239,68,68,.3)">
              <i class="fas fa-receipt" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(239,68,68,.1);color:#DC2626">URGENTE</span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#7F1D1D;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(cxpWeek)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#B91C1C;margin:0 0 2px">CxP Próximos 7 Días</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">Total proveedores: <b>${h.fmt(cxpTot)}</b></span>
            <button onclick="navigate('reportes')" style="font-size:11px;font-weight:700;color:#DC2626;background:none;border:none;cursor:pointer;padding:0">
              Ver Saldos →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, cxpWeek);
    }
  },

  chart_admin_ventas_gastos: {
    id: 'chart_admin_ventas_gastos',
    title: 'Evolución de Ventas vs Gastos',
    category: 'admin',
    categoryLabel: 'Administración',
    description: 'Ingresos operacionales contra costos y gastos del año',
    icon: 'fa-chart-line',
    defaultColSpan: 2,
    roles: ['superadmin', 'admin', 'contador'],
    render: (c, data, h) => {
      const canvasId = `chart-vg-${Math.random().toString(36).substring(2, 7)}`;
      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px">
            <div>
              <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
                <span style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#10B981,#EF4444);display:inline-block"></span>
                Ventas vs. Gastos y Costos
              </h3>
              <p style="font-size:12px;color:#94A3B8;margin:0">Comparativa mensual de ingresos contra egresos</p>
            </div>
          </div>
          <div style="flex:1;min-height:220px;position:relative">
            <canvas id="${canvasId}"></canvas>
          </div>
        </div>`;
      setTimeout(() => {
        const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
        if (ctx) {
          const m12 = data.months12Labels || [];
          const rev12 = data.monthlyRevenues12 || [];
          const exp12 = data.monthlyExpenses12 || [];
          const monShort = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
          const labels = m12.slice(-6).map((m: string) => {
            const [, mStr] = m.split('-');
            return monShort[parseInt(mStr, 10) - 1];
          });
          new Chart(ctx, {
            type: 'line',
            data: {
              labels: labels,
              datasets: [
                {
                  label: 'Ventas',
                  data: rev12.slice(-6),
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16,185,129,.06)',
                  borderWidth: 2.5,
                  fill: true,
                  tension: 0.35,
                },
                {
                  label: 'Gastos y Costos',
                  data: exp12.slice(-6),
                  borderColor: '#EF4444',
                  backgroundColor: 'rgba(239,68,68,.06)',
                  borderWidth: 2.5,
                  fill: true,
                  tension: 0.35,
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top', labels: { boxWidth: 8, font: { size: 10 } } },
                tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${h.fmt(ctx.parsed.y)}` } }
              },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(226,232,240,.6)' }, ticks: { callback: (v: any) => h.fmt(v) } }
              }
            }
          });
        }
      }, 50);
    }
  },

  chart_admin_cartera_edades: {
    id: 'chart_admin_cartera_edades',
    title: 'Cartera por Edades',
    category: 'admin',
    categoryLabel: 'Administración',
    description: 'Distribución de saldos por cobrar según días de mora',
    icon: 'fa-chart-pie',
    defaultColSpan: 2,
    roles: ['superadmin', 'admin', 'cartera', 'contador'],
    render: (c, data, h) => {
      const canvasId = `chart-aging-${Math.random().toString(36).substring(2, 7)}`;
      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="margin-bottom:12px">
            <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
              <span style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#38BDF8,#10B981);display:inline-block"></span>
              Cartera por Edades
            </h3>
            <p style="font-size:11px;color:#94A3B8;margin:0">Cuentas por cobrar clasificadas por vencimiento</p>
          </div>
          <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;max-height:220px">
            <canvas id="${canvasId}"></canvas>
          </div>
        </div>`;
      setTimeout(() => {
        const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
        if (ctx) {
          const buckets = data.carteraBuckets || { porVencer: 0, c0_30: 0, c31_60: 0, c61_90: 0, cMayor90: 0 };
          const labels = ['Por Vencer', '0-30 días', '31-60 días', '61-90 días', '+90 días'];
          const values = [buckets.porVencer || 0, buckets.c0_30 || 0, buckets.c31_60 || 0, buckets.c61_90 || 0, buckets.cMayor90 || 0];
          const colors = ['#10B981', '#F59E0B', '#EF4444', '#DC2626', '#991B1B'];
          new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: labels,
              datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '65%',
              plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10 } } },
                tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${h.fmt(ctx.parsed)}` } }
              }
            }
          });
        }
      }, 50);
    }
  },

  chart_admin_volumen_tx: {
    id: 'chart_admin_volumen_tx',
    title: 'Volumen Mensual de Operaciones',
    category: 'general',
    categoryLabel: 'General',
    description: 'Cantidad de transacciones registradas por mes (últimos 6 meses)',
    icon: 'fa-chart-bar',
    defaultColSpan: 2,
    roles: ['superadmin', 'admin', 'contador', 'auxiliar'],
    render: (c, data) => {
      const canvasId = `chart-vol-${Math.random().toString(36).substring(2, 7)}`;
      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div>
              <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
                <span style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#38BDF8);display:inline-block"></span>
                Volumen Transaccional
              </h3>
              <p style="font-size:11px;color:#94A3B8;margin:0">Comprobantes y asientos contables creados</p>
            </div>
          </div>
          <div style="flex:1;min-height:210px;position:relative">
            <canvas id="${canvasId}"></canvas>
          </div>
        </div>`;
      setTimeout(() => {
        const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
        if (ctx) {
          const m = data.monthsLabels || [];
          const counts = data.monthlyTxCounts || [];
          const monShort = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
          const labels = m.map((x: string) => monShort[parseInt(x.split('-')[1], 10) - 1]);
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels,
              datasets: [{
                label: 'Transacciones',
                data: counts,
                backgroundColor: 'rgba(99,102,241,.75)',
                borderRadius: 6,
                barPercentage: 0.55
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(226,232,240,.6)' } }
              }
            }
          });
        }
      }, 50);
    }
  },

  widget_admin_actividad_reciente: {
    id: 'widget_admin_actividad_reciente',
    title: 'Actividad Reciente',
    category: 'general',
    categoryLabel: 'General',
    description: 'Últimas transacciones registradas en el sistema',
    icon: 'fa-clock-rotate-left',
    defaultColSpan: 2,
    roles: ['superadmin', 'admin', 'contador', 'auxiliar'],
    render: (c, data, h) => {
      const recent = data.recentActivity || [];
      const rows = recent.slice(0, 6).map((r: any) => `
        <tr style="border-bottom:1px solid #F1F5F9;font-size:12px" onclick="navigate('consulta-tx')">
          <td style="padding:10px 12px;font-weight:700;color:#4338CA">${h.esc(r.consecutive || '-')}</td>
          <td style="padding:10px 12px;color:#64748B">${h.esc(r.typeName || '-')}</td>
          <td style="padding:10px 12px;color:#334155;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.esc(r.thirdParty || '-')}</td>
          <td style="padding:10px 12px;color:#94A3B8;text-align:right">${h.esc(r.date ? r.date.split(' ')[0] : '-')}</td>
        </tr>`).join('');
      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0;display:flex;align-items:center;gap:8px">
              <i class="fas fa-list-check" style="color:#6366F1"></i>
              Últimas Transacciones
            </h3>
            <button onclick="navigate('consulta-tx')" style="font-size:11px;font-weight:700;color:#6366F1;background:none;border:none;cursor:pointer">
              Ver todas →
            </button>
          </div>
          <div style="overflow-x:auto">
            <table class="dash-table" style="width:100%;border-collapse:collapse;text-align:left">
              <thead>
                <tr style="border-bottom:1px solid #E2E8F0;font-size:11px;color:#94A3B8;text-transform:uppercase">
                  <th style="padding:8px 12px">Nº</th>
                  <th style="padding:8px 12px">Tipo</th>
                  <th style="padding:8px 12px">Tercero</th>
                  <th style="padding:8px 12px;text-align:right">Fecha</th>
                </tr>
              </thead>
              <tbody>${rows || '<tr><td colspan="4" style="text-align:center;padding:20px;color:#94A3B8">Sin transacciones recientes</td></tr>'}</tbody>
            </table>
          </div>
        </div>`;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERFIL: CONTADOR (FINANCIERO / FISCAL / AUDITORÍA)
  // ═══════════════════════════════════════════════════════════════════════════

  kpi_cont_utilidad_ejercicio: {
    id: 'kpi_cont_utilidad_ejercicio',
    title: 'Utilidad Operacional Mes',
    category: 'contabilidad',
    categoryLabel: 'Contabilidad',
    description: 'Ingresos operacionales (Clase 4) menos Gastos y Costos (Clases 5,6,7)',
    icon: 'fa-scale-balanced',
    defaultColSpan: 1,
    roles: ['superadmin', 'contador'],
    moduleRequired: 'contabilidad',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const ut = kpis.utilidadMes || 0;
      const isPos = ut >= 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,${isPos ? '#10B981,#059669' : '#EF4444,#DC2626'})"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,${isPos ? '#10B981,#059669' : '#EF4444,#DC2626'});display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.15)">
              <i class="fas fa-coins" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${isPos ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'};color:${isPos ? '#059669' : '#DC2626'}">
              ${isPos ? 'SUPERÁVIT' : 'DÉFICIT'}
            </span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:${isPos ? '#064E3B' : '#7F1D1D'};letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(ut)}
          </div>
          <p style="font-size:12px;font-weight:700;color:${isPos ? '#047857' : '#B91C1C'};margin:0 0 2px">Resultado del Mes</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Ingresos 4 - (Gastos 5 + Costos 6/7)</p>
        </div>`;
    }
  },

  kpi_cont_razon_corriente: {
    id: 'kpi_cont_razon_corriente',
    title: 'Razón Corriente (Liquidez)',
    category: 'contabilidad',
    categoryLabel: 'Contabilidad',
    description: 'Índice de solvencia inmediata (Activo Total / Pasivo Total)',
    icon: 'fa-shield-halved',
    defaultColSpan: 1,
    roles: ['superadmin', 'contador'],
    moduleRequired: 'contabilidad',
    render: (c, data) => {
      const kpis = data.kpis || {};
      const rc = kpis.razonCorriente || 0;
      const isOk = rc >= 1.2;
      const isWarn = rc >= 1.0 && rc < 1.2;
      const color = isOk ? '#059669' : isWarn ? '#D97706' : '#DC2626';
      const bg = isOk ? 'rgba(16,185,129,.12)' : isWarn ? 'rgba(245,158,11,.12)' : 'rgba(239,68,68,.12)';
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:${color}"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.15)">
              <i class="fas fa-divide" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${bg};color:${color}">
              ${isOk ? 'ÓPTIMO' : isWarn ? 'ALERTA' : 'RIESGO'}
            </span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:${color};letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${rc.toFixed(2)}
          </div>
          <p style="font-size:12px;font-weight:700;color:${color};margin:0 0 2px">Razón de Solvencia</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Meta recomendada: > 1.20</p>
        </div>`;
    }
  },

  kpi_cont_iva_estimado: {
    id: 'kpi_cont_iva_estimado',
    title: 'Estimación IVA por Pagar',
    category: 'contabilidad',
    categoryLabel: 'Contabilidad',
    description: 'IVA generado en ventas menos IVA descontable en compras',
    icon: 'fa-percent',
    defaultColSpan: 1,
    roles: ['superadmin', 'contador'],
    moduleRequired: 'contabilidad',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const ivaGen = kpis.ivaGenerado || 0;
      const ivaDesc = kpis.ivaDescontable || 0;
      const ivaNeto = kpis.ivaEstimadoAPagar || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#6366F1,#4F46E5)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#6366F1,#4F46E5);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(99,102,241,.3)">
              <i class="fas fa-percent" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(99,102,241,.1);color:#4F46E5">
              ${ivaNeto >= 0 ? 'A PAGAR' : 'A FAVOR'}
            </span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#1E1B4B;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(Math.abs(ivaNeto))}
          </div>
          <p style="font-size:12px;font-weight:700;color:#4338CA;margin:0 0 2px">IVA Neto Estimado</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Gen: ${h.fmt(ivaGen)} | Desc: ${h.fmt(ivaDesc)}</p>
        </div>`;
    }
  },

  kpi_cont_retenciones: {
    id: 'kpi_cont_retenciones',
    title: 'Retenciones del Mes',
    category: 'contabilidad',
    categoryLabel: 'Contabilidad',
    description: 'Retenciones en la fuente practicadas en el mes (Cuentas 2365/2367/2368)',
    icon: 'fa-stamp',
    defaultColSpan: 1,
    roles: ['superadmin', 'contador'],
    moduleRequired: 'contabilidad',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const ret = kpis.retencionesMes || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#8B5CF6,#7C3AED)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#8B5CF6,#7C3AED);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(139,92,246,.3)">
              <i class="fas fa-file-invoice" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(139,92,246,.1);color:#7C3AED">DIAN</span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#3B0764;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(ret)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#6D28D9;margin:0 0 2px">Retefuente por Declarar</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Cuentas 2365, 2367, 2368</p>
        </div>`;
    }
  },

  chart_cont_balance_resumen: {
    id: 'chart_cont_balance_resumen',
    title: 'Ecuación Patrimonial (Balance)',
    category: 'contabilidad',
    categoryLabel: 'Contabilidad',
    description: 'Comparativa de Activos, Pasivos y Patrimonio resultante',
    icon: 'fa-scale-balanced',
    defaultColSpan: 2,
    roles: ['superadmin', 'contador'],
    moduleRequired: 'contabilidad',
    render: (c, data, h) => {
      const canvasId = `chart-bal-${Math.random().toString(36).substring(2, 7)}`;
      const activos = data.currentMonthActivos || 0;
      const pasivos = data.currentMonthPasivos || 0;
      const patrimonio = activos - pasivos;
      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div>
              <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
                <span style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#38BDF8);display:inline-block"></span>
                Estructura de Balance General
              </h3>
              <p style="font-size:11px;color:#94A3B8;margin:0">Activo = Pasivo + Patrimonio neto</p>
            </div>
          </div>
          <div style="flex:1;min-height:220px;position:relative">
            <canvas id="${canvasId}"></canvas>
          </div>
        </div>`;
      setTimeout(() => {
        const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
        if (ctx) {
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Activos (1)', 'Pasivos (2)', 'Patrimonio Neto'],
              datasets: [{
                data: [activos, pasivos, patrimonio],
                backgroundColor: ['#10B981', '#EF4444', '#6366F1'],
                borderRadius: 6,
                barPercentage: 0.55
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${h.fmt(ctx.parsed.y)}` } }
              },
              scales: {
                x: { grid: { display: false } },
                y: { grid: { color: 'rgba(226,232,240,.6)' }, ticks: { callback: (v: any) => h.fmt(v) } }
              }
            }
          });
        }
      }, 50);
    }
  },

  chart_cont_desglose_gastos: {
    id: 'chart_cont_desglose_gastos',
    title: 'Estructura de Costos y Gastos',
    category: 'contabilidad',
    categoryLabel: 'Contabilidad',
    description: 'Distribución por concepto (Nómina, Servicios, Compras, Impuestos)',
    icon: 'fa-chart-pie',
    defaultColSpan: 2,
    roles: ['superadmin', 'contador'],
    moduleRequired: 'contabilidad',
    render: (c, data, h) => {
      const canvasId = `chart-exp-${Math.random().toString(36).substring(2, 7)}`;
      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="margin-bottom:12px">
            <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
              <span style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#EF4444,#F59E0B);display:inline-block"></span>
              Distribución de Costos y Gastos
            </h3>
            <p style="font-size:11px;color:#94A3B8;margin:0">Composición del egreso operacional del mes</p>
          </div>
          <div style="flex:1;display:flex;align-items:center;justify-content:center;position:relative;max-height:220px">
            <canvas id="${canvasId}"></canvas>
          </div>
        </div>`;
      setTimeout(() => {
        const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
        if (ctx) {
          const expCat = data.expensesByCategory || {};
          const filtered = Object.entries(expCat).filter(([, v]) => (v as number) > 0);
          const labels = filtered.length ? filtered.map(([k]) => k) : ['Sin Gastos'];
          const values = filtered.length ? filtered.map(([, v]) => v as number) : [1];
          const colors = ['#6366F1', '#38BDF8', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#94A3B8'];
          new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: labels,
              datasets: [{ data: values, backgroundColor: colors, borderWidth: 2, borderColor: '#fff' }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '65%',
              plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10 } } },
                tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${h.fmt(ctx.parsed)}` } }
              }
            }
          });
        }
      }, 50);
    }
  },

  widget_cont_alertas_dian: {
    id: 'widget_cont_alertas_dian',
    title: 'Auditoría y Comprobantes Pendientes',
    category: 'contabilidad',
    categoryLabel: 'Contabilidad',
    description: 'Transacciones en borrador y alertas de revisión fiscal',
    icon: 'fa-clipboard-check',
    defaultColSpan: 2,
    roles: ['superadmin', 'contador'],
    render: (c, data) => {
      const kpis = data.kpis || {};
      const drafts = kpis.draftTxCount || 0;
      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0;display:flex;align-items:center;gap:8px">
              <i class="fas fa-shield-virus" style="color:#F59E0B"></i>
              Auditoría y Alertas Contables
            </h3>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:${drafts > 0 ? 'rgba(245,158,11,.08)' : 'rgba(16,185,129,.08)'};border-radius:12px;border:1px solid ${drafts > 0 ? 'rgba(245,158,11,.2)' : 'rgba(16,185,129,.2)'}">
              <div style="display:flex;align-items:center;gap:10px">
                <i class="fas ${drafts > 0 ? 'fa-file-circle-exclamation text-amber-500' : 'fa-circle-check text-emerald-500'}" style="font-size:18px"></i>
                <div>
                  <p style="font-size:12px;font-weight:700;color:#1E293B;margin:0">Comprobantes en Borrador</p>
                  <p style="font-size:11px;color:#64748B;margin:0">${drafts > 0 ? `${drafts} comprobantes pendientes de aprobación contable` : 'Todos los comprobantes están aprobados'}</p>
                </div>
              </div>
              <button onclick="navigate('consulta-tx')" style="font-size:11px;font-weight:700;color:${drafts > 0 ? '#B45309' : '#047857'};background:none;border:none;cursor:pointer">
                Revisar →
              </button>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(99,102,241,.06);border-radius:12px;border:1px solid rgba(99,102,241,.15)">
              <div style="display:flex;align-items:center;gap:10px">
                <i class="fas fa-network-wired text-indigo-500" style="font-size:18px"></i>
                <div>
                  <p style="font-size:12px;font-weight:700;color:#1E293B;margin:0">Facturación & Documentos DIAN</p>
                  <p style="font-size:11px;color:#64748B;margin:0">Sincronización electrónica de facturas y eventos</p>
                </div>
              </div>
              <button onclick="navigate('documentos-electronicos')" style="font-size:11px;font-weight:700;color:#4F46E5;background:none;border:none;cursor:pointer">
                Ver estado →
              </button>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:rgba(56,189,248,.06);border-radius:12px;border:1px solid rgba(56,189,248,.15)">
              <div style="display:flex;align-items:center;gap:10px">
                <i class="fas fa-money-bill-transfer text-sky-500" style="font-size:18px"></i>
                <div>
                  <p style="font-size:12px;font-weight:700;color:#1E293B;margin:0">Conciliación Bancaria</p>
                  <p style="font-size:11px;color:#64748B;margin:0">Extractos bancarios vs movimientos contables</p>
                </div>
              </div>
              <button onclick="navigate('conciliacion')" style="font-size:11px;font-weight:700;color:#0284C7;background:none;border:none;cursor:pointer">
                Ir →
              </button>
            </div>
          </div>
        </div>`;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERFIL: AUXILIAR DE INVENTARIOS (BODEGA / LOGÍSTICA)
  // ═══════════════════════════════════════════════════════════════════════════

  kpi_inv_valor_total: {
    id: 'kpi_inv_valor_total',
    title: 'Valor Total en Bodega',
    category: 'inventarios',
    categoryLabel: 'Inventarios',
    description: 'Valorización total de existencias de almacén a costo promedio',
    icon: 'fa-boxes-stacked',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'auxiliar', 'inventarios'],
    moduleRequired: 'inventarios',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const val = kpis.totalStockVal || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#0EA5E9,#0284C7)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#0EA5E9,#0284C7);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(14,165,233,.3)">
              <i class="fas fa-boxes-stacked" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(14,165,233,.1);color:#0284C7">ACTIVO</span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#0C4A6E;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(val)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#0284C7;margin:0 0 2px">Valorización Inventario</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Costo promedio ponderado</p>
        </div>`;
    }
  },

  kpi_inv_quiebre_stock: {
    id: 'kpi_inv_quiebre_stock',
    title: 'Quiebre de Stock (Mínimos)',
    category: 'inventarios',
    categoryLabel: 'Inventarios',
    description: 'Productos con existencias en o por debajo del stock mínimo',
    icon: 'fa-triangle-exclamation',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'auxiliar', 'inventarios'],
    moduleRequired: 'inventarios',
    render: (c, data) => {
      const kpis = data.kpis || {};
      const count = kpis.criticalStockCount || 0;
      const isWarn = count > 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:${isWarn ? 'linear-gradient(90deg,#EF4444,#DC2626)' : 'linear-gradient(90deg,#10B981,#059669)'}"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:${isWarn ? 'linear-gradient(135deg,#EF4444,#DC2626)' : 'linear-gradient(135deg,#10B981,#059669)'};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.15)">
              <i class="fas fa-triangle-exclamation" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${isWarn ? 'rgba(239,68,68,.12)' : 'rgba(16,185,129,.12)'};color:${isWarn ? '#DC2626' : '#059669'}">
              ${isWarn ? 'ALERTA REPOSICIÓN' : 'ÓPTIMO'}
            </span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:${isWarn ? '#7F1D1D' : '#064E3B'};letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${count} ${count === 1 ? 'producto' : 'productos'}
          </div>
          <p style="font-size:12px;font-weight:700;color:${isWarn ? '#B91C1C' : '#047857'};margin:0 0 2px">Stock Crítico</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Existencia <= Stock Mínimo</p>
        </div>`;
    }
  },

  kpi_inv_movimientos_mes: {
    id: 'kpi_inv_movimientos_mes',
    title: 'Movimientos de Almacén',
    category: 'inventarios',
    categoryLabel: 'Inventarios',
    description: 'Entradas, salidas y traslados de almacén en el mes en curso',
    icon: 'fa-dolly',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'auxiliar', 'inventarios'],
    moduleRequired: 'inventarios',
    render: (c, data) => {
      const kpis = data.kpis || {};
      const movs = kpis.totalInvMovs || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#F59E0B,#D97706)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#F59E0B,#D97706);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(245,158,11,.3)">
              <i class="fas fa-truck-ramp-box" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(245,158,11,.1);color:#D97706">KARDEX</span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#78350F;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${movs}
          </div>
          <p style="font-size:12px;font-weight:700;color:#B45309;margin:0 0 2px">Movimientos del Mes</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Entradas, salidas y traslados</p>
        </div>`;
    }
  },

  kpi_inv_stock_negativo: {
    id: 'kpi_inv_stock_negativo',
    title: 'Monitor de Stock Negativo',
    category: 'inventarios',
    categoryLabel: 'Inventarios',
    description: 'Control de descuadre: productos con cantidades menores a cero',
    icon: 'fa-circle-nodes',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'auxiliar', 'inventarios'],
    moduleRequired: 'inventarios',
    render: (c, data) => {
      const kpis = data.kpis || {};
      const neg = kpis.negativeStockCount || 0;
      const hasNeg = neg > 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:${hasNeg ? '#DC2626' : '#10B981'}"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:${hasNeg ? '#DC2626' : '#10B981'};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.15)">
              <i class="fas ${hasNeg ? 'fa-circle-xmark' : 'fa-circle-check'}" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${hasNeg ? 'rgba(239,68,68,.12)' : 'rgba(16,185,129,.12)'};color:${hasNeg ? '#DC2626' : '#059669'}">
              ${hasNeg ? 'DESCUADRE' : 'SIN NEGATIVOS'}
            </span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:${hasNeg ? '#7F1D1D' : '#064E3B'};letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${neg}
          </div>
          <p style="font-size:12px;font-weight:700;color:${hasNeg ? '#B91C1C' : '#047857'};margin:0 0 2px">Stock Negativo</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Productos con cantidad < 0</p>
        </div>`;
    }
  },

  chart_inv_valor_categoria: {
    id: 'chart_inv_valor_categoria',
    title: 'Valorización por Categoría',
    category: 'inventarios',
    categoryLabel: 'Inventarios',
    description: 'Capital inmovilizado en existencia agrupado por categoría',
    icon: 'fa-chart-column',
    defaultColSpan: 2,
    roles: ['superadmin', 'admin', 'auxiliar', 'inventarios'],
    moduleRequired: 'inventarios',
    render: (c, data, h) => {
      const canvasId = `chart-invcat-${Math.random().toString(36).substring(2, 7)}`;
      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div>
              <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
                <span style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#0EA5E9,#10B981);display:inline-block"></span>
                Inventario por Categoría
              </h3>
              <p style="font-size:11px;color:#94A3B8;margin:0">Valor monetario en existencias</p>
            </div>
          </div>
          <div style="flex:1;min-height:220px;position:relative">
            <canvas id="${canvasId}"></canvas>
          </div>
        </div>`;
      setTimeout(() => {
        const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
        if (ctx) {
          const invCat = data.invByCategory || {};
          const sorted = Object.entries(invCat)
            .map(([cat, val]) => ({ cat, val: Number(val) || 0 }))
            .sort((a, b) => b.val - a.val)
            .slice(0, 6);
          new Chart(ctx, {
            type: 'bar',
            data: {
              labels: sorted.map(s => s.cat),
              datasets: [{
                data: sorted.map(s => s.val),
                backgroundColor: 'rgba(14,165,233,.8)',
                borderRadius: 6,
                barPercentage: 0.55
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx: any) => ` Valor: ${h.fmt(ctx.parsed.x)}` } }
              },
              scales: {
                x: { grid: { color: 'rgba(226,232,240,.6)' }, ticks: { callback: (v: any) => h.fmt(v) } },
                y: { grid: { display: false } }
              }
            }
          });
        }
      }, 50);
    }
  },

  widget_inv_top_criticos: {
    id: 'widget_inv_top_criticos',
    title: 'Top Productos Críticos a Reponer',
    category: 'inventarios',
    categoryLabel: 'Inventarios',
    description: 'Productos con mayor urgencia de compra o reposición',
    icon: 'fa-list-ol',
    defaultColSpan: 2,
    roles: ['superadmin', 'admin', 'auxiliar', 'inventarios'],
    moduleRequired: 'inventarios',
    render: (c, data, h) => {
      const prods = data.topCriticalProducts || [];
      const rows = prods.map((p: any) => `
        <tr style="border-bottom:1px solid #F1F5F9;font-size:12px">
          <td style="padding:10px 12px;font-weight:700;color:#0284C7">${h.esc(p.code || '-')}</td>
          <td style="padding:10px 12px;color:#334155;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.esc(p.name || '-')}</td>
          <td style="padding:10px 12px;color:#EF4444;font-weight:700;text-align:right">${p.qtyOnHand}</td>
          <td style="padding:10px 12px;color:#64748B;text-align:right">${p.stockMin}</td>
        </tr>`).join('');
      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0;display:flex;align-items:center;gap:8px">
              <i class="fas fa-boxes-packing" style="color:#EF4444"></i>
              Urgencia de Reposición en Bodega
            </h3>
            <button onclick="navigate('inventario')" style="font-size:11px;font-weight:700;color:#0284C7;background:none;border:none;cursor:pointer">
              Ver Kardex →
            </button>
          </div>
          <div style="overflow-x:auto">
            <table class="dash-table" style="width:100%;border-collapse:collapse;text-align:left">
              <thead>
                <tr style="border-bottom:1px solid #E2E8F0;font-size:11px;color:#94A3B8;text-transform:uppercase">
                  <th style="padding:8px 12px">Código</th>
                  <th style="padding:8px 12px">Producto</th>
                  <th style="padding:8px 12px;text-align:right">Stock Actual</th>
                  <th style="padding:8px 12px;text-align:right">Mínimo</th>
                </tr>
              </thead>
              <tbody>${rows || '<tr><td colspan="4" style="text-align:center;padding:20px;color:#94A3B8">Sin productos en nivel crítico</td></tr>'}</tbody>
            </table>
          </div>
        </div>`;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO A: NÓMINA ELECTRÓNICA Y RECURSOS HUMANOS
  // ═══════════════════════════════════════════════════════════════════════════

  kpi_nom_costo_mes: {
    id: 'kpi_nom_costo_mes',
    title: 'Costo Nómina Mes',
    category: 'nomina',
    categoryLabel: 'Nómina & RRHH',
    description: 'Total devengado neto en el período de nómina activo',
    icon: 'fa-money-bill-wave',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'nomina', 'rrhh', 'contador'],
    moduleRequired: 'nomina',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const val = kpis.payrollCostMonth || 0;
      const status = kpis.currentPayrollStatus || 'Sin ciclo';
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#8B5CF6,#6366F1)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#8B5CF6,#6366F1);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(139,92,246,.3)">
              <i class="fas fa-money-bill-wave" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(139,92,246,.1);color:#7C3AED">Nómina</span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#3B0764;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(val)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#6D28D9;margin:0 0 2px">Neto a Pagar del Ciclo</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">Estado: <b style="color:#475569">${h.esc(status)}</b></span>
            <button onclick="navigate('nomina-periodos')" style="font-size:11px;font-weight:700;color:#7C3AED;background:none;border:none;cursor:pointer;padding:0">
              Gestionar →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, val);
    }
  },

  kpi_nom_empleados_activos: {
    id: 'kpi_nom_empleados_activos',
    title: 'Colaboradores Activos',
    category: 'nomina',
    categoryLabel: 'Nómina & RRHH',
    description: 'Personal con contrato y vinculación activa en el sistema',
    icon: 'fa-users-gear',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'nomina', 'rrhh'],
    moduleRequired: 'nomina',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const count = kpis.activeEmployeesCount || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#A855F7,#7E22CE)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#A855F7,#7E22CE);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(168,85,247,.3)">
              <i class="fas fa-users-gear" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(168,85,247,.1);color:#7E22CE">Planta</span>
          </div>
          <div id="val-${c.id}" style="font-size:28px;font-weight:900;color:#581C87;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmtCount(count)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#7E22CE;margin:0 0 2px">Personal Contratado</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">Contratos vigentes</span>
            <button onclick="navigate('nomina-empleados')" style="font-size:11px;font-weight:700;color:#7E22CE;background:none;border:none;cursor:pointer;padding:0">
              Ver Empleados →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, count);
    }
  },

  kpi_nom_pendientes_dian: {
    id: 'kpi_nom_pendientes_dian',
    title: 'Nóminas por Transmitir DIAN',
    category: 'nomina',
    categoryLabel: 'Nómina & RRHH',
    description: 'Períodos o soportes de nómina pendientes de transmisión electrónica',
    icon: 'fa-paper-plane',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'nomina', 'rrhh', 'contador'],
    moduleRequired: 'nomina',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const count = kpis.payrollPendingDian || 0;
      const isPending = count > 0;
      const color = isPending ? '#D97706' : '#059669';
      const bg = isPending ? 'rgba(245,158,11,.12)' : 'rgba(16,185,129,.12)';
      const accent = isPending ? 'linear-gradient(90deg,#F59E0B,#D97706)' : 'linear-gradient(90deg,#10B981,#059669)';

      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:${accent}"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:${accent};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px ${isPending ? 'rgba(245,158,11,.3)' : 'rgba(16,185,129,.3)'}">
              <i class="fas fa-paper-plane" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${bg};color:${color}">
              ${isPending ? 'Pendiente' : 'Al Día'}
            </span>
          </div>
          <div id="val-${c.id}" style="font-size:28px;font-weight:900;color:${color};letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmtCount(count)}
          </div>
          <p style="font-size:12px;font-weight:700;color:${color};margin:0 0 2px">Períodos por Emitir</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">
            ${isPending ? 'Requiere envío de eventos a la DIAN' : 'Todos los períodos transmitidos'}
          </p>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, count);
    }
  },

  kpi_nom_estado_periodo: {
    id: 'kpi_nom_estado_periodo',
    title: 'Ciclo de Nómina Actual',
    category: 'nomina',
    categoryLabel: 'Nómina & RRHH',
    description: 'Estado operativo del período de nómina corriente',
    icon: 'fa-calendar-check',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'nomina', 'rrhh'],
    moduleRequired: 'nomina',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const status = (kpis.currentPayrollStatus || 'Sin Ciclo').toUpperCase();
      let badgeColor = '#64748B';
      let badgeBg = '#F1F5F9';
      if (status.includes('PAGAD') || status.includes('CERRAD')) {
        badgeColor = '#059669'; badgeBg = 'rgba(16,185,129,.12)';
      } else if (status.includes('APROB')) {
        badgeColor = '#0284C7'; badgeBg = 'rgba(2,132,199,.12)';
      } else if (status.includes('BORR')) {
        badgeColor = '#D97706'; badgeBg = 'rgba(245,158,11,.12)';
      }

      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#6366F1,#4F46E5)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#6366F1,#4F46E5);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(99,102,241,.3)">
              <i class="fas fa-calendar-days" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:11px;font-weight:800;padding:3px 10px;border-radius:20px;background:${badgeBg};color:${badgeColor}">
              ${h.esc(status)}
            </span>
          </div>
          <div style="font-size:22px;font-weight:900;color:#1E1B4B;letter-spacing:-0.5px;line-height:1.2;margin-bottom:6px">
            ${h.esc(status)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#4F46E5;margin:0 0 2px">Estado del Período Activo</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">Liquidación mensual</span>
            <button onclick="navigate('nomina-periodos')" style="font-size:11px;font-weight:700;color:#4F46E5;background:none;border:none;cursor:pointer;padding:0">
              Ir a Liquidar →
            </button>
          </div>
        </div>`;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO B: FACTURACIÓN ELECTRÓNICA Y RESOLUCIONES DIAN
  // ═══════════════════════════════════════════════════════════════════════════

  kpi_dian_alertas_resolucion: {
    id: 'kpi_dian_alertas_resolucion',
    title: 'Resoluciones por Vencer',
    category: 'dian',
    categoryLabel: 'Facturación DIAN',
    description: 'Rangos de facturación electrónica próximos a expirar (<30 días o <100 folios)',
    icon: 'fa-triangle-exclamation',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'contador', 'facturacion'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const count = kpis.dianResolutionsExpiring || 0;
      const isUrgent = count > 0;
      const color = isUrgent ? '#DC2626' : '#059669';
      const bg = isUrgent ? 'rgba(220,38,38,.12)' : 'rgba(16,185,129,.12)';
      const accent = isUrgent ? 'linear-gradient(90deg,#DC2626,#B91C1C)' : 'linear-gradient(90deg,#10B981,#059669)';

      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:${accent}"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:${accent};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px ${isUrgent ? 'rgba(220,38,38,.3)' : 'rgba(16,185,129,.3)'}">
              <i class="fas ${isUrgent ? 'fa-triangle-exclamation' : 'fa-circle-check'}" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${bg};color:${color}">
              ${isUrgent ? '¡Atención!' : 'Vigentes'}
            </span>
          </div>
          <div id="val-${c.id}" style="font-size:28px;font-weight:900;color:${color};letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmtCount(count)}
          </div>
          <p style="font-size:12px;font-weight:700;color:${color};margin:0 0 2px">Resoluciones en Alerta</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">${isUrgent ? '<30 días o <100 folios' : 'Rangos con saldo disponible'}</span>
            <button onclick="navigate('facturacion-dian')" style="font-size:11px;font-weight:700;color:${color};background:none;border:none;cursor:pointer;padding:0">
              Ver DIAN →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, count);
    }
  },

  kpi_dian_docs_rechazados: {
    id: 'kpi_dian_docs_rechazados',
    title: 'Rechazos o Errores DIAN',
    category: 'dian',
    categoryLabel: 'Facturación DIAN',
    description: 'Documentos electrónicos con rechazo o error en la validación previa',
    icon: 'fa-circle-xmark',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'contador', 'facturacion'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const count = kpis.dianDocsRejected || 0;
      const hasErrors = count > 0;
      const color = hasErrors ? '#EA580C' : '#059669';
      const bg = hasErrors ? 'rgba(234,88,12,.12)' : 'rgba(16,185,129,.12)';

      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:${hasErrors ? 'linear-gradient(90deg,#EA580C,#C2410C)' : 'linear-gradient(90deg,#10B981,#059669)'}"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:${hasErrors ? 'linear-gradient(135deg,#EA580C,#C2410C)' : 'linear-gradient(135deg,#10B981,#059669)'};display:flex;align-items:center;justify-content:center">
              <i class="fas ${hasErrors ? 'fa-triangle-exclamation' : 'fa-check-double'}" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${bg};color:${color}">
              ${hasErrors ? 'Revisión' : 'Sin fallos'}
            </span>
          </div>
          <div id="val-${c.id}" style="font-size:28px;font-weight:900;color:${color};letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmtCount(count)}
          </div>
          <p style="font-size:12px;font-weight:700;color:${color};margin:0 0 2px">Facturas Rechazadas</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">${hasErrors ? 'Requiere corrección' : 'Validación 100% limpia'}</span>
            <button onclick="navigate('documentos-electronicos')" style="font-size:11px;font-weight:700;color:${color};background:none;border:none;cursor:pointer;padding:0">
              Corregir →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, count);
    }
  },

  kpi_dian_tasa_exito: {
    id: 'kpi_dian_tasa_exito',
    title: 'Tasa Aceptación DIAN',
    category: 'dian',
    categoryLabel: 'Facturación DIAN',
    description: 'Porcentaje de documentos aceptados exitosamente por el webservice DIAN',
    icon: 'fa-shield-halved',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'contador', 'facturacion'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const rate = kpis.dianSuccessRate !== undefined ? kpis.dianSuccessRate : 100;
      const isGreat = rate >= 95;
      const color = isGreat ? '#059669' : '#D97706';

      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#059669,#10B981)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#059669,#10B981);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(16,185,129,.3)">
              <i class="fas fa-shield-halved" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(16,185,129,.1);color:#059669">Efectividad</span>
          </div>
          <div id="val-${c.id}" style="font-size:28px;font-weight:900;color:${color};letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${rate}%
          </div>
          <p style="font-size:12px;font-weight:700;color:#059669;margin:0 0 6px">Éxito en Transmisión</p>
          <div style="width:100%;height:6px;background:#F1F5F9;border-radius:4px;overflow:hidden">
            <div style="width:${rate}%;height:100%;background:linear-gradient(90deg,#10B981,#059669);border-radius:4px;transition:width 1s ease"></div>
          </div>
        </div>`;
    }
  },

  kpi_dian_doc_soporte: {
    id: 'kpi_dian_doc_soporte',
    title: 'Documento Soporte Mes',
    category: 'dian',
    categoryLabel: 'Facturación DIAN',
    description: 'Valor acumulado de compras a personas no obligadas a expedir factura',
    icon: 'fa-file-signature',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'contador'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const val = kpis.dianDocSoporteMonth || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#0284C7,#0369A1)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#0284C7,#0369A1);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(2,132,199,.3)">
              <i class="fas fa-file-signature" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(2,132,199,.1);color:#0284C7">No Obligados</span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#0C4A6E;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(val)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#0284C7;margin:0 0 2px">Compras en Doc. Soporte</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">Transmisión electrónica</span>
            <button onclick="navigate('doc-soporte')" style="font-size:11px;font-weight:700;color:#0284C7;background:none;border:none;cursor:pointer;padding:0">
              Ver Soportes →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, val);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO C: PUNTO DE VENTA (POS) Y CAJAS REGISTRADORAS
  // ═══════════════════════════════════════════════════════════════════════════

  kpi_pos_ventas_hoy: {
    id: 'kpi_pos_ventas_hoy',
    title: 'Ventas POS de Hoy',
    category: 'pos',
    categoryLabel: 'Punto de Venta POS',
    description: 'Total facturado en cajas durante la jornada actual',
    icon: 'fa-cash-register',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'cajero', 'pos'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const val = kpis.posSalesToday || 0;
      const count = kpis.posTicketsCount || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#10B981,#059669)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#10B981,#059669);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(16,185,129,.3)">
              <i class="fas fa-cash-register" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(16,185,129,.1);color:#059669">POS Hoy</span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#064E3B;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(val)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#059669;margin:0 0 2px">Recaudo Diario en Caja</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8"><b>${h.fmtCount(count)}</b> tickets emitidos</span>
            <button onclick="navigate('pos')" style="font-size:11px;font-weight:700;color:#059669;background:none;border:none;cursor:pointer;padding:0">
              Abrir POS →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, val);
    }
  },

  kpi_pos_ticket_promedio: {
    id: 'kpi_pos_ticket_promedio',
    title: 'Ticket Promedio POS',
    category: 'pos',
    categoryLabel: 'Punto de Venta POS',
    description: 'Valor medio por comprobante expedido hoy en caja',
    icon: 'fa-receipt',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'cajero', 'pos'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const val = kpis.posAvgTicket || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#06B6D4,#0891B2)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#06B6D4,#0891B2);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(6,182,212,.3)">
              <i class="fas fa-receipt" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(6,182,212,.1);color:#0891B2">Promedio</span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#164E63;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(val)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#0891B2;margin:0 0 2px">Valor Medio por Ticket</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Calculado sobre transacciones de hoy</p>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, val);
    }
  },

  kpi_pos_cajas_abiertas: {
    id: 'kpi_pos_cajas_abiertas',
    title: 'Turnos de Caja Abiertos',
    category: 'pos',
    categoryLabel: 'Punto de Venta POS',
    description: 'Sesiones de caja operando activamente en este momento',
    icon: 'fa-store',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'cajero', 'pos'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const count = kpis.posOpenShiftsCount || 0;
      const isOpen = count > 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:${isOpen ? 'linear-gradient(90deg,#10B981,#059669)' : 'linear-gradient(90deg,#64748B,#475569)'}"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:${isOpen ? 'linear-gradient(135deg,#10B981,#059669)' : 'linear-gradient(135deg,#64748B,#475569)'};display:flex;align-items:center;justify-content:center">
              <i class="fas fa-store" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${isOpen ? 'rgba(16,185,129,.12)' : 'rgba(100,116,139,.12)'};color:${isOpen ? '#059669' : '#475569'}">
              ${isOpen ? 'Activas' : 'Cerradas'}
            </span>
          </div>
          <div id="val-${c.id}" style="font-size:28px;font-weight:900;color:${isOpen ? '#064E3B' : '#334155'};letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmtCount(count)}
          </div>
          <p style="font-size:12px;font-weight:700;color:${isOpen ? '#059669' : '#64748B'};margin:0 0 2px">Cajas con Sesión Abierta</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">${isOpen ? 'Operando en sucursales' : 'Sin turnos activos'}</span>
            <button onclick="navigate('pos')" style="font-size:11px;font-weight:700;color:#059669;background:none;border:none;cursor:pointer;padding:0">
              Ir a Caja →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, count);
    }
  },

  chart_pos_medios_pago: {
    id: 'chart_pos_medios_pago',
    title: 'Medios de Pago POS (Hoy)',
    category: 'pos',
    categoryLabel: 'Punto de Venta POS',
    description: 'Distribución de recaudo por Efectivo, Tarjeta, Transferencia y Crédito',
    icon: 'fa-chart-pie',
    defaultColSpan: 2,
    roles: ['superadmin', 'admin', 'cajero', 'pos'],
    render: (c, data, h) => {
      const canvasId = `chart-pos-${Math.random().toString(36).substring(2, 7)}`;
      const methods = data.posPaymentMethods || { 'Efectivo': 0, 'Tarjeta / Datáfono': 0, 'Transferencia': 0, 'Crédito': 0 };
      const labels = Object.keys(methods);
      const vals = Object.values(methods) as number[];
      const total = vals.reduce((a, b) => a + b, 0);

      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div>
              <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
                <span style="width:8px;height:8px;border-radius:50%;background:#10B981;display:inline-block"></span>
                Recaudo por Medio de Pago en Caja
              </h3>
              <p style="font-size:11px;color:#94A3B8;margin:0">Total recaudado hoy: <b>${h.fmt(total)}</b></p>
            </div>
            <button onclick="navigate('pos')" style="font-size:11px;font-weight:700;color:#10B981;background:none;border:none;cursor:pointer">
              Ver Terminal POS →
            </button>
          </div>
          <div style="flex:1;min-height:220px;position:relative;display:flex;align-items:center;justify-content:center">
            <canvas id="${canvasId}"></canvas>
          </div>
        </div>`;

      setTimeout(() => {
        const ctx = (document.getElementById(canvasId) as HTMLCanvasElement)?.getContext('2d');
        if (ctx) {
          new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: labels,
              datasets: [{
                data: total > 0 ? vals : [1],
                backgroundColor: total > 0
                  ? ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B']
                  : ['#E2E8F0'],
                borderWidth: 2,
                borderColor: '#ffffff'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 12,
                    font: { size: 11, family: "'Plus Jakarta Sans', sans-serif", weight: 600 }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      if (total === 0) return ' Sin ventas hoy';
                      const val = Number(context.raw) || 0;
                      const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                      return ` ${context.label}: $${val.toLocaleString('es-CO')} (${pct}%)`;
                    }
                  }
                }
              }
            }
          });
        }
      }, 50);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO D: COMPRAS, ÓRDENES DE COMPRA Y PROVEEDORES
  // ═══════════════════════════════════════════════════════════════════════════

  kpi_comp_volumen_mes: {
    id: 'kpi_comp_volumen_mes',
    title: 'Compras del Mes',
    category: 'compras',
    categoryLabel: 'Compras & Proveedores',
    description: 'Facturas de proveedores acumuladas en el mes vs mes anterior',
    icon: 'fa-cart-shopping',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'compras'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const cur = kpis.purchasesThisMonth || 0;
      const prev = kpis.purchasesPrevMonth || 0;
      let trendHTML = '';
      if (prev > 0) {
        const pct = ((cur - prev) / prev) * 100;
        const isUp = pct >= 0;
        const color = isUp ? '#EA580C' : '#059669';
        const bg = isUp ? 'rgba(234,88,12,.12)' : 'rgba(16,185,129,.12)';
        trendHTML = `
          <div style="display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;background:${bg}">
            <i class="fas ${isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}" style="font-size:10px;color:${color}"></i>
            <span style="font-size:10px;font-weight:700;color:${color}">${isUp ? '+' : ''}${Math.abs(pct).toFixed(1)}%</span>
          </div>`;
      }
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#F97316,#EA580C)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#F97316,#EA580C);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(249,115,22,.3)">
              <i class="fas fa-cart-shopping" style="font-size:16px;color:#fff"></i>
            </div>
            ${trendHTML || '<span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(249,115,22,.1);color:#EA580C">Compras</span>'}
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#7C2D12;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(cur)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#EA580C;margin:0 0 2px">Abastecimiento del Mes</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">Mes anterior: ${h.fmt(prev)}</span>
            <button onclick="navigate('compras')" style="font-size:11px;font-weight:700;color:#EA580C;background:none;border:none;cursor:pointer;padding:0">
              Ver Facturas →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, cur);
    }
  },

  kpi_comp_oc_pendientes: {
    id: 'kpi_comp_oc_pendientes',
    title: 'Órdenes de Compra Activas',
    category: 'compras',
    categoryLabel: 'Compras & Proveedores',
    description: 'Órdenes aprobadas o pendientes por ingresar a inventario',
    icon: 'fa-clipboard-list',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'compras'],
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const count = kpis.pendingPurchaseOrders || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#FB923C,#F97316)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#FB923C,#F97316);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(251,146,60,.3)">
              <i class="fas fa-clipboard-list" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(249,115,22,.1);color:#C2410C">Por Recibir</span>
          </div>
          <div id="val-${c.id}" style="font-size:28px;font-weight:900;color:#9A3412;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmtCount(count)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#C2410C;margin:0 0 2px">Órdenes de Compra</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">Pendientes de ingreso físico</span>
            <button onclick="navigate('ordenes-compra')" style="font-size:11px;font-weight:700;color:#C2410C;background:none;border:none;cursor:pointer;padding:0">
              Ver Órdenes →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, count);
    }
  },

  chart_comp_top_proveedores: {
    id: 'chart_comp_top_proveedores',
    title: 'Top Proveedores del Mes',
    category: 'compras',
    categoryLabel: 'Compras & Proveedores',
    description: 'Proveedores principales clasificados por volumen de compra acumulado',
    icon: 'fa-truck-field',
    defaultColSpan: 2,
    roles: ['superadmin', 'admin', 'compras', 'contador'],
    render: (c, data, h) => {
      const suppliers = data.topSuppliers || [];
      const maxVal = suppliers.reduce((m: number, s: any) => Math.max(m, s.total || 0), 0) || 1;

      const itemsHTML = suppliers.map((s: any, idx: number) => {
        const pct = Math.round(((s.total || 0) / maxVal) * 100);
        return `
          <div style="margin-bottom:12px">
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;margin-bottom:4px">
              <span style="font-weight:700;color:#1E293B;display:flex;align-items:center;gap:6px">
                <span style="width:18px;height:18px;border-radius:50%;background:#F1F5F9;display:flex;align-items:center;justify-content:center;font-size:10px;color:#64748B">${idx + 1}</span>
                ${h.esc(s.name)}
              </span>
              <span style="font-weight:800;color:#EA580C">${h.fmt(s.total)}</span>
            </div>
            <div style="width:100%;height:6px;background:#F1F5F9;border-radius:4px;overflow:hidden">
              <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#FB923C,#EA580C);border-radius:4px"></div>
            </div>
          </div>`;
      }).join('');

      c.innerHTML = `
        <div class="dash-chart-panel anim-slide-up" style="min-height:300px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
            <div>
              <h3 style="font-size:14px;font-weight:800;color:#0F172A;margin:0 0 3px;display:flex;align-items:center;gap:8px">
                <i class="fas fa-truck-field" style="color:#EA580C"></i>
                Concentración de Proveedores
              </h3>
              <p style="font-size:11px;color:#94A3B8;margin:0">Distribución de compras por tercero</p>
            </div>
            <button onclick="navigate('compras')" style="font-size:11px;font-weight:700;color:#EA580C;background:none;border:none;cursor:pointer">
              Ver Compras →
            </button>
          </div>
          <div style="padding:4px 0">
            ${itemsHTML || '<div style="text-align:center;padding:30px;color:#94A3B8;font-size:12px">Sin compras registradas en el período</div>'}
          </div>
        </div>`;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MÓDULO G: COMERCIO EXTERIOR E IMPORTACIONES (D.O.)
  // ═══════════════════════════════════════════════════════════════════════════

  kpi_imp_embarques_transito: {
    id: 'kpi_imp_embarques_transito',
    title: 'D.O. en Tránsito',
    category: 'importaciones',
    categoryLabel: 'Comercio Exterior',
    description: 'Documentos de importación activos en tránsito internacional, puerto o aduana',
    icon: 'fa-ship',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'importaciones', 'comex'],
    moduleRequired: 'importaciones',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const count = kpis.importsInTransitCount || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#0284C7,#0F172A)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#0284C7,#0F172A);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(2,132,199,.3)">
              <i class="fas fa-ship" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(2,132,199,.1);color:#0284C7">En Ruta</span>
          </div>
          <div id="val-${c.id}" style="font-size:28px;font-weight:900;color:#0C4A6E;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmtCount(count)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#0284C7;margin:0 0 2px">Embarques Internacionales</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">Tránsito, Puerto o Aduana</span>
            <button onclick="navigate('importaciones')" style="font-size:11px;font-weight:700;color:#0284C7;background:none;border:none;cursor:pointer;padding:0">
              Ver D.O. →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, count);
    }
  },

  kpi_imp_valor_transito: {
    id: 'kpi_imp_valor_transito',
    title: 'Valor FOB en Tránsito',
    category: 'importaciones',
    categoryLabel: 'Comercio Exterior',
    description: 'Valor FOB acumulado de mercancía extranjera actualmente en viaje o aduana',
    icon: 'fa-globe',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'importaciones', 'comex'],
    moduleRequired: 'importaciones',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const val = kpis.importsValueTransit || 0;
      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:linear-gradient(90deg,#0D9488,#115E59)"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#0D9488,#115E59);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(13,148,136,.3)">
              <i class="fas fa-globe" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:rgba(13,148,136,.1);color:#0D9488">FOB USD</span>
          </div>
          <div id="val-${c.id}" style="font-size:26px;font-weight:900;color:#134E4A;letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmt(val)}
          </div>
          <p style="font-size:12px;font-weight:700;color:#0D9488;margin:0 0 2px">Mercancía en Tránsito</p>
          <p style="font-size:11px;color:#94A3B8;margin:0">Compromiso de compras internacionales</p>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, val);
    }
  },

  kpi_imp_pendientes_kardex: {
    id: 'kpi_imp_pendientes_kardex',
    title: 'D.O. por Liquidar a Kardex',
    category: 'importaciones',
    categoryLabel: 'Comercio Exterior',
    description: 'Cargas nacionalizadas pendientes de liquidación y prorrateo definitivo a inventario',
    icon: 'fa-boxes-packing',
    defaultColSpan: 1,
    roles: ['superadmin', 'admin', 'importaciones', 'comex'],
    moduleRequired: 'importaciones',
    render: (c, data, h) => {
      const kpis = data.kpis || {};
      const count = kpis.importsPendingKardex || 0;
      const hasPending = count > 0;
      const color = hasPending ? '#D97706' : '#059669';
      const bg = hasPending ? 'rgba(245,158,11,.12)' : 'rgba(16,185,129,.12)';

      c.innerHTML = `
        <div class="dash-kpi-card anim-slide-up">
          <div class="dash-kpi-accent" style="background:${hasPending ? 'linear-gradient(90deg,#F59E0B,#D97706)' : 'linear-gradient(90deg,#10B981,#059669)'}"></div>
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:${hasPending ? 'linear-gradient(135deg,#F59E0B,#D97706)' : 'linear-gradient(135deg,#10B981,#059669)'};display:flex;align-items:center;justify-content:center">
              <i class="fas fa-boxes-packing" style="font-size:16px;color:#fff"></i>
            </div>
            <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;background:${bg};color:${color}">
              ${hasPending ? 'Pendiente' : 'Al Día'}
            </span>
          </div>
          <div id="val-${c.id}" style="font-size:28px;font-weight:900;color:${color};letter-spacing:-1px;line-height:1;margin-bottom:6px">
            ${h.fmtCount(count)}
          </div>
          <p style="font-size:12px;font-weight:700;color:${color};margin:0 0 2px">Nacionalizadas sin Costear</p>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px">
            <span style="font-size:11px;color:#94A3B8">Prorrateo de aranceles & fletes</span>
            <button onclick="navigate('importaciones')" style="font-size:11px;font-weight:700;color:${color};background:none;border:none;cursor:pointer;padding:0">
              Liquidar →
            </button>
          </div>
        </div>`;
      const el = document.getElementById(`val-${c.id}`);
      if (el) h.animateCounter(el, count);
    }
  }

};

// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLAS POR DEFECTO (PRESETS POR ROL)
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_PRESETS: Record<string, string[]> = {
  // Administrador / Superadmin / Gerente
  admin: [
    'kpi_admin_ventas_mes',
    'kpi_admin_liquidez_bancos',
    'kpi_admin_cartera_cxc',
    'kpi_admin_cxp_semana',
    'chart_admin_ventas_gastos',
    'chart_admin_cartera_edades',
    'chart_admin_volumen_tx',
    'widget_admin_actividad_reciente'
  ],
  superadmin: [
    'kpi_admin_ventas_mes',
    'kpi_admin_liquidez_bancos',
    'kpi_admin_cartera_cxc',
    'kpi_admin_cxp_semana',
    'chart_admin_ventas_gastos',
    'chart_admin_cartera_edades',
    'chart_admin_volumen_tx',
    'widget_admin_actividad_reciente'
  ],

  // Contador / Revisor Fiscal / Auditor
  contador: [
    'kpi_cont_utilidad_ejercicio',
    'kpi_cont_razon_corriente',
    'kpi_cont_iva_estimado',
    'kpi_cont_retenciones',
    'kpi_dian_alertas_resolucion',
    'kpi_dian_docs_rechazados',
    'chart_cont_balance_resumen',
    'chart_cont_desglose_gastos',
    'chart_admin_ventas_gastos',
    'widget_cont_alertas_dian'
  ],
  auditor: [
    'kpi_cont_utilidad_ejercicio',
    'kpi_cont_razon_corriente',
    'kpi_cont_iva_estimado',
    'kpi_cont_retenciones',
    'kpi_dian_alertas_resolucion',
    'kpi_dian_docs_rechazados',
    'chart_cont_balance_resumen',
    'chart_cont_desglose_gastos',
    'chart_admin_ventas_gastos',
    'widget_cont_alertas_dian'
  ],

  // Auxiliar de Inventarios / Bodeguero / Almacén
  auxiliar: [
    'kpi_inv_valor_total',
    'kpi_inv_quiebre_stock',
    'kpi_inv_movimientos_mes',
    'kpi_inv_stock_negativo',
    'chart_inv_valor_categoria',
    'widget_inv_top_criticos',
    'chart_admin_volumen_tx',
    'widget_admin_actividad_reciente'
  ],
  inventarios: [
    'kpi_inv_valor_total',
    'kpi_inv_quiebre_stock',
    'kpi_inv_movimientos_mes',
    'kpi_inv_stock_negativo',
    'chart_inv_valor_categoria',
    'widget_inv_top_criticos',
    'chart_admin_volumen_tx',
    'widget_admin_actividad_reciente'
  ],

  // Cajero / Punto de Venta (POS)
  cajero: [
    'kpi_pos_ventas_hoy',
    'kpi_pos_ticket_promedio',
    'kpi_pos_cajas_abiertas',
    'chart_pos_medios_pago',
    'kpi_admin_liquidez_bancos',
    'widget_admin_actividad_reciente'
  ],
  pos: [
    'kpi_pos_ventas_hoy',
    'kpi_pos_ticket_promedio',
    'kpi_pos_cajas_abiertas',
    'chart_pos_medios_pago',
    'kpi_admin_liquidez_bancos',
    'widget_admin_actividad_reciente'
  ],

  // Compras y Abastecimiento
  compras: [
    'kpi_comp_volumen_mes',
    'kpi_comp_oc_pendientes',
    'kpi_admin_cxp_semana',
    'chart_comp_top_proveedores',
    'kpi_inv_quiebre_stock',
    'widget_inv_top_criticos'
  ],

  // Nómina y Recursos Humanos
  nomina: [
    'kpi_nom_costo_mes',
    'kpi_nom_empleados_activos',
    'kpi_nom_pendientes_dian',
    'kpi_nom_estado_periodo',
    'kpi_dian_alertas_resolucion',
    'widget_admin_actividad_reciente'
  ],
  rrhh: [
    'kpi_nom_costo_mes',
    'kpi_nom_empleados_activos',
    'kpi_nom_pendientes_dian',
    'kpi_nom_estado_periodo',
    'kpi_dian_alertas_resolucion',
    'widget_admin_actividad_reciente'
  ],

  // Comercio Exterior / Importaciones
  importaciones: [
    'kpi_imp_embarques_transito',
    'kpi_imp_valor_transito',
    'kpi_imp_pendientes_kardex',
    'kpi_comp_volumen_mes',
    'kpi_admin_cxp_semana',
    'widget_admin_actividad_reciente'
  ],
  comex: [
    'kpi_imp_embarques_transito',
    'kpi_imp_valor_transito',
    'kpi_imp_pendientes_kardex',
    'kpi_comp_volumen_mes',
    'kpi_admin_cxp_semana',
    'widget_admin_actividad_reciente'
  ]
};

/**
 * Obtiene la lista de widget IDs por defecto para un rol dado
 */
export function getDefaultWidgetsForRole(role: string): string[] {
  const norm = String(role || '').toLowerCase().trim();
  if (ROLE_PRESETS[norm]) return [...ROLE_PRESETS[norm]];
  if (norm.includes('admin') || norm.includes('gerent')) return [...ROLE_PRESETS.admin];
  if (norm.includes('cont') || norm.includes('audit')) return [...ROLE_PRESETS.contador];
  if (norm.includes('caj') || norm.includes('pos')) return [...ROLE_PRESETS.cajero];
  if (norm.includes('compra')) return [...ROLE_PRESETS.compras];
  if (norm.includes('nom') || norm.includes('rrhh') || norm.includes('talent')) return [...ROLE_PRESETS.nomina];
  if (norm.includes('imp') || norm.includes('comex') || norm.includes('aduan')) return [...ROLE_PRESETS.importaciones];
  if (norm.includes('aux') || norm.includes('inv') || norm.includes('bodeg')) return [...ROLE_PRESETS.auxiliar];
  return [...ROLE_PRESETS.admin];
}

