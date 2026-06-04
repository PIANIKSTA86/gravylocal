/**
 * GRAVY v2.0 — dashboard.ts
 * Panel analítico financiero interactivo con soporte de Chart.js y micro-tendencias.
 */
'use strict';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

let monthlyChart: any = null;
let expensesChart: any = null;

async function renderDashboard(c) {
  // Renderizar esqueleto de carga (skeleton loaders)
  c.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      ${['#EEF4FF','#FFF8F0','#ECFDF5','#FEF2F2'].map(bg => `
        <div class="rounded-2xl p-5 anim-slide-up" style="background:${bg}">
          <div class="h-3 w-20 rounded mb-3" style="background:#E5E7EB;animation:pulse 1.5s ease infinite"></div>
          <div class="h-7 w-28 rounded" style="background:#E5E7EB;animation:pulse 1.5s ease infinite"></div>
        </div>`).join('')}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2 rounded-2xl p-5 bg-white border border-[#F0F0F0]" style="height: 380px; animation:pulse 1.5s ease infinite"></div>
      <div class="rounded-2xl p-5 bg-white border border-[#F0F0F0]" style="height: 380px; animation:pulse 1.5s ease infinite"></div>
    </div>`;

  try {
    const pb = (window as any).pb;
    const [accounts, kpis, lines, txRes] = await Promise.all([
      API.getAccounts(false),
      API.getDashboardKpis(),
      pb.listAll('tx_lines', {
        expand: 'tx_id',
        filter: 'tx_id.status="active"',
      }),
      API.getTransactions({ page: 1, perPage: 8 }),
    ]);

    // Generar dinámicamente los últimos 6 meses finalizando en el mes actual
    const now = new Date();
    const months: string[] = [];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthsLabels: string[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7)); // "YYYY-MM"
      monthsLabels.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
    }

    const currentMonthStr = months[5]; // ej. "2026-06"
    const previousMonthStr = months[4]; // ej. "2026-05"

    const monthlyRevenues = new Array(6).fill(0);
    const monthlyExpenses = new Array(6).fill(0);

    const expensesByCategory: Record<string, number> = {
      'Nómina y Personal': 0,
      'Servicios y Honorarios': 0,
      'Impuestos': 0,
      'Costos de Ventas': 0,
      'Compras y Materia Prima': 0,
      'Gastos Financieros': 0,
      'Otros Gastos': 0,
    };

    let currentMonthActivos = 0;
    let prevMonthActivos = 0;
    let currentMonthPasivos = 0;
    let prevMonthPasivos = 0;

    let currentMonthIngresos = 0;
    let prevMonthIngresos = 0;
    let currentMonthGastos = 0;
    let prevMonthGastos = 0;

    // Mapeo rápido de cuentas por ID para obtener su código
    const accountMap = new Map();
    for (const ac of accounts) {
      accountMap.set(ac.id, ac);
    }

    for (const line of lines) {
      const ac = accountMap.get(line.account_id);
      if (!ac) continue;

      const code = ac.code;
      const cls = code.charAt(0);
      const dateStr = line.expand?.tx_id?.date || '';
      if (!dateStr) continue;

      const yyyymm = dateStr.slice(0, 7);
      const debit = line.debit ?? 0;
      const credit = line.credit ?? 0;
      const balance = debit - credit;

      // 1. Acumulados mensuales para los gráficos de los últimos 6 meses
      const monthIdx = months.indexOf(yyyymm);
      if (monthIdx !== -1) {
        if (cls === '4') {
          monthlyRevenues[monthIdx] += (credit - debit);
        } else if (cls === '5' || cls === '6' || cls === '7') {
          monthlyExpenses[monthIdx] += (debit - credit);
        }
      }

      // 2. Acumulados históricos para Activos (Clase 1) y Pasivos (Clase 2)
      if (cls === '1') {
        if (dateStr <= `${currentMonthStr}-31`) currentMonthActivos += balance;
        if (dateStr <= `${previousMonthStr}-31`) prevMonthActivos += balance;
      } else if (cls === '2') {
        if (dateStr <= `${currentMonthStr}-31`) currentMonthPasivos += (credit - debit);
        if (dateStr <= `${previousMonthStr}-31`) prevMonthPasivos += (credit - debit);
      }

      // 3. Flujos del mes actual y anterior para Ingresos (Clase 4) y Gastos/Costos (Clase 5, 6, 7)
      if (yyyymm === currentMonthStr) {
        if (cls === '4') {
          currentMonthIngresos += (credit - debit);
        } else if (cls === '5' || cls === '6' || cls === '7') {
          currentMonthGastos += (debit - credit);

          // Clasificar gastos del mes actual para el gráfico de dona
          let cat = 'Otros Gastos';
          if (code.startsWith('5105') || code.startsWith('5205')) cat = 'Nómina y Personal';
          else if (code.startsWith('5135') || code.startsWith('5235') || code.startsWith('5110') || code.startsWith('5230')) cat = 'Servicios y Honorarios';
          else if (code.startsWith('5115') || code.startsWith('5215')) cat = 'Impuestos';
          else if (code.startsWith('61')) cat = 'Costos de Ventas';
          else if (code.startsWith('62')) cat = 'Compras y Materia Prima';
          else if (code.startsWith('53')) cat = 'Gastos Financieros';

          expensesByCategory[cat] += (debit - credit);
        }
      } else if (yyyymm === previousMonthStr) {
        if (cls === '4') {
          prevMonthIngresos += (credit - debit);
        } else if (cls === '5' || cls === '6' || cls === '7') {
          prevMonthGastos += (debit - credit);
        }
      }
    }

    // Función auxiliar para formatear la variación porcentual de tendencia
    const getTrendHTML = (current: number, previous: number, isLowerBetter: boolean = false) => {
      if (previous === 0) {
        if (current === 0) return `<span class="text-xs font-bold text-gray-400">— 0.0%</span>`;
        return `<span class="text-xs font-bold text-emerald-500"><i class="fas fa-arrow-trend-up mr-1"></i>▲ N/A</span>`;
      }
      const pct = ((current - previous) / Math.abs(previous)) * 100;
      const isUp = pct > 0;
      const absPct = Math.abs(pct).toFixed(1);
      if (pct === 0) {
        return `<span class="text-xs font-bold text-gray-400">— 0.0%</span>`;
      }
      let color = 'text-emerald-500';
      if (isUp) {
        color = isLowerBetter ? 'text-red-500' : 'text-emerald-500';
      } else {
        color = isLowerBetter ? 'text-emerald-500' : 'text-red-500';
      }
      const icon = isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
      const arrow = isUp ? '▲' : '▼';
      return `<span class="text-xs font-bold ${color}"><i class="fas ${icon} mr-1"></i>${arrow} ${absPct}%</span>`;
    };

    // Renderizar estructura base del dashboard rediseñado
    c.innerHTML = `
    <!-- Fila de Tarjetas KPI con Micro-tendencias -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      <div class="stat-card blue rounded-2xl p-5 anim-slide-up" style="animation-delay:.05s">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <i class="fas fa-building text-sm text-[#2446B8]"></i>
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Activos</span>
          </div>
          ${getTrendHTML(currentMonthActivos, prevMonthActivos)}
        </div>
        <p class="text-2xl font-extrabold text-[#0B1635] mt-1">${fmt(currentMonthActivos)}</p>
        <p class="text-xs text-gray-400 mt-1">${fmtN(kpis.totalAc)} cuentas activas</p>
      </div>

      <div class="stat-card orange rounded-2xl p-5 anim-slide-up" style="animation-delay:.1s">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <i class="fas fa-file-invoice-dollar text-sm text-[#C46516]"></i>
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Pasivos</span>
          </div>
          ${getTrendHTML(currentMonthPasivos, prevMonthPasivos, true)}
        </div>
        <p class="text-2xl font-extrabold text-[#0B1635] mt-1">${fmt(currentMonthPasivos)}</p>
        <p class="text-xs text-gray-400 mt-1">Patrimonio: ${fmt(currentMonthActivos - currentMonthPasivos)}</p>
      </div>

      <div class="stat-card green rounded-2xl p-5 anim-slide-up" style="animation-delay:.15s">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <i class="fas fa-arrow-trend-up text-sm text-[#059669]"></i>
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Ingresos del Mes</span>
          </div>
          ${getTrendHTML(currentMonthIngresos, prevMonthIngresos)}
        </div>
        <p class="text-2xl font-extrabold text-[#0B1635] mt-1">${fmt(currentMonthIngresos)}</p>
        <p class="text-xs text-gray-400 mt-1">Acumulado mes en curso</p>
      </div>

      <div class="stat-card red rounded-2xl p-5 anim-slide-up" style="animation-delay:.2s">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <i class="fas fa-receipt text-sm text-[#DC2626]"></i>
            <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Gastos del Mes</span>
          </div>
          ${getTrendHTML(currentMonthGastos, prevMonthGastos, true)}
        </div>
        <p class="text-2xl font-extrabold text-[#0B1635] mt-1">${fmt(currentMonthGastos)}</p>
        <p class="text-xs text-gray-400 mt-1">Utilidad del Mes: ${fmt(currentMonthIngresos - currentMonthGastos)}</p>
      </div>
    </div>

    <!-- Fila de Gráficos Analíticos -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Gráfico de Evolución de Finanzas (Línea) -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-[#F0F0F0] p-5 shadow-sm anim-slide-up flex flex-col justify-between" style="border-color:#F0F0F0; animation-delay:.25s; min-height: 380px;">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-sm text-[#0D2137]">Evolución Mensual de Finanzas</h3>
            <p class="text-xs text-gray-400">Ingresos vs. Gastos (Últimos 6 meses)</p>
          </div>
          <div class="flex gap-4 text-xs font-semibold">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full" style="background: #33C7FF"></span> Ingresos</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full" style="background: #7F7CFF"></span> Gastos</span>
          </div>
        </div>
        <div class="relative flex-1" style="height: 280px;">
          <canvas id="chart-monthly-evolution"></canvas>
        </div>
      </div>

      <!-- Gráfico de Dona: Distribución de Gastos -->
      <div class="bg-white rounded-2xl border border-[#F0F0F0] p-5 shadow-sm anim-slide-up flex flex-col justify-between" style="border-color:#F0F0F0; animation-delay:.3s; min-height: 380px;">
        <div>
          <h3 class="font-bold text-sm text-[#0D2137]">Estructura de Gastos</h3>
          <p class="text-xs text-gray-400">Distribución por categoría (Mes actual)</p>
        </div>
        <div class="relative flex-1 flex items-center justify-center py-4" style="height: 280px; max-height: 280px;">
          <canvas id="chart-expenses-breakdown"></canvas>
        </div>
      </div>
    </div>

    <!-- Fila de Tabla de Transacciones y Acciones Rápidas -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <!-- Últimas Transacciones -->
      <div class="xl:col-span-2 bg-white rounded-2xl border overflow-hidden anim-slide-up" style="border-color:#F0F0F0; animation-delay:.35s">
        <div class="flex items-center justify-between p-5 pb-3">
          <h3 class="font-bold text-sm" style="color:#0D2137">Últimas Transacciones</h3>
          <button class="btn btn-outline btn-sm" onclick="navigate('consulta-tx')"><i class="fas fa-arrow-right"></i> Ver todas</button>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Tipo / N.°</th><th>Fecha</th><th>Descripción</th><th>Tercero</th></tr></thead>
            <tbody>${txRes.items.length ? txRes.items.map(t => `
              <tr class="cursor-pointer" onclick="viewTransaction('${esc(t.id)}')">
                <td><span class="font-semibold" style="color:#E87D1E">${esc(t.expand?.tx_type_id?.prefix ?? '')}-${esc(t.number)}</span></td>
                <td>${esc(t.date)}</td>
                <td class="max-w-xs truncate">${esc(t.description ?? '—')}</td>
                <td>${esc(t.expand?.third_party_id?.name ?? '—')}</td>
              </tr>`).join('') :
              '<tr><td colspan="4" class="text-center py-8" style="color:#9CA3AF">No hay transacciones registradas</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Acciones Rápidas -->
      <div class="bg-white rounded-2xl border p-5 anim-slide-up flex flex-col justify-between" style="border-color:#F0F0F0; animation-delay:.4s">
        <div>
          <h3 class="font-bold text-sm mb-4" style="color:#0D2137">Acciones Rápidas</h3>
          <div class="flex flex-col gap-3">
            ${can('canWrite') ? `<button onclick="navigate('nueva-tx')" class="btn btn-primary w-full justify-center"><i class="fas fa-plus"></i> Nueva Transacción</button>` : ''}
            <button onclick="navigate('plan-cuentas')" class="btn btn-secondary w-full justify-center"><i class="fas fa-sitemap"></i> Plan de Cuentas</button>
            ${can('canWrite') ? `<button onclick="navigate('terceros')" class="btn btn-outline w-full justify-center"><i class="fas fa-user-plus"></i> Gestionar Terceros</button>` : ''}
            <button onclick="navigate('reportes')" class="btn btn-outline w-full justify-center"><i class="fas fa-chart-pie"></i> Generar Reportes</button>
          </div>
        </div>
        <div class="mt-6 p-4 rounded-xl" style="background:linear-gradient(135deg,#0D2137,#1A4B8C)">
          <p class="text-xs font-bold mb-1" style="color:rgba(255,255,255,.6)">RESULTADO DEL EJERCICIO (MES)</p>
          <p class="text-xl font-extrabold text-white">${fmt(currentMonthIngresos - currentMonthGastos)}</p>
          <p class="text-xs mt-1" style="color:rgba(255,255,255,.5)">Ingresos − Gastos − Costos (Junio)</p>
        </div>
      </div>
    </div>`;

    // --- Inicialización de Gráficos ---
    if (monthlyChart) monthlyChart.destroy();
    if (expensesChart) expensesChart.destroy();

    // 1. Instanciar Gráfico de Evolución Mensual
    const monthlyCtx = (document.getElementById('chart-monthly-evolution') as HTMLCanvasElement)?.getContext('2d');
    if (monthlyCtx) {
      // Gradiantes de fondo para las líneas
      const revenueGradient = monthlyCtx.createLinearGradient(0, 0, 0, 250);
      revenueGradient.addColorStop(0, 'rgba(51, 199, 255, 0.22)');
      revenueGradient.addColorStop(1, 'rgba(51, 199, 255, 0.00)');

      const expenseGradient = monthlyCtx.createLinearGradient(0, 0, 0, 250);
      expenseGradient.addColorStop(0, 'rgba(127, 124, 255, 0.22)');
      expenseGradient.addColorStop(1, 'rgba(127, 124, 255, 0.00)');

      monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
          labels: monthsLabels,
          datasets: [
            {
              label: 'Ingresos',
              data: monthlyRevenues,
              borderColor: '#33C7FF',
              backgroundColor: revenueGradient,
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#33C7FF',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 1.5,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Gastos y Costos',
              data: monthlyExpenses,
              borderColor: '#7F7CFF',
              backgroundColor: expenseGradient,
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#7F7CFF',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 1.5,
              pointRadius: 4,
              pointHoverRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(5, 8, 20, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#e2e8f0',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
              bodyFont: { family: 'Plus Jakarta Sans' },
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) {
                    label += fmt(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: '#61708F',
                font: {
                  family: 'Plus Jakarta Sans',
                  size: 10,
                }
              }
            },
            y: {
              grid: {
                color: 'rgba(220, 230, 248, 0.5)',
              },
              ticks: {
                color: '#61708F',
                font: {
                  family: 'Plus Jakarta Sans',
                  size: 10,
                },
                callback: function(value) {
                  const valNum = Number(value);
                  if (Math.abs(valNum) >= 1000000) {
                    return '$' + (valNum / 1000000).toFixed(1) + 'M';
                  }
                  return '$' + fmtN(valNum);
                }
              }
            }
          }
        }
      });
    }

    // 2. Instanciar Gráfico de Dona de Gastos
    const categoryLabels = Object.keys(expensesByCategory);
    const categoryValues = Object.values(expensesByCategory);

    const nonZeroCategories: string[] = [];
    const nonZeroValues: number[] = [];
    for (let i = 0; i < categoryLabels.length; i++) {
      if (categoryValues[i] > 0) {
        nonZeroCategories.push(categoryLabels[i]);
        nonZeroValues.push(categoryValues[i]);
      }
    }

    // Si no hay gastos registrados, mostrar gráfico vacío explicativo
    if (nonZeroValues.length === 0) {
      nonZeroCategories.push('Sin Gastos');
      nonZeroValues.push(1);
    }

    const expensesCtx = (document.getElementById('chart-expenses-breakdown') as HTMLCanvasElement)?.getContext('2d');
    if (expensesCtx) {
      const palette = ['#7F7CFF', '#33C7FF', '#059669', '#F59E0B', '#EC4899', '#EF4444', '#9CA3AF'];

      expensesChart = new Chart(expensesCtx, {
        type: 'doughnut',
        data: {
          labels: nonZeroCategories,
          datasets: [{
            data: nonZeroValues,
            backgroundColor: nonZeroCategories[0] === 'Sin Gastos' ? ['#E5E7EB'] : palette.slice(0, nonZeroValues.length),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 8,
                padding: 10,
                color: '#4B5563',
                font: {
                  family: 'Plus Jakarta Sans',
                  size: 10,
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(5, 8, 20, 0.9)',
              titleColor: '#ffffff',
              bodyColor: '#e2e8f0',
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
              bodyFont: { family: 'Plus Jakarta Sans' },
              callbacks: {
                label: function (context) {
                  if (nonZeroCategories[0] === 'Sin Gastos') {
                    return 'Sin gastos registrados en el mes';
                  }
                  const label = context.label || '';
                  const val = context.parsed || 0;
                  const total = nonZeroValues.reduce((a, b) => a + b, 0);
                  const pct = ((val / total) * 100).toFixed(1);
                  return ` ${label}: ${fmt(val)} (${pct}%)`;
                }
              }
            }
          },
          cutout: '68%',
        }
      });
    }

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function viewTransaction(id) {
  navigate('consulta-tx');
  // Abrir el detalle una vez que el módulo haya renderizado
  setTimeout(() => {
    if (typeof seeTxDetail === 'function') seeTxDetail(id);
  }, 120);
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderDashboard = renderDashboard;
(window as any).viewTransaction = viewTransaction;
