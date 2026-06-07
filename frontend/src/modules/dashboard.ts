/**
 * GRAVY v2.0 — dashboard.ts
 * Panel analítico financiero interactivo con soporte de Chart.js y micro-tendencias.
 */
'use strict';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

let monthlyChart: any = null;
let agingChart: any = null;
let inventoryChart: any = null;

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
    const [accounts, kpis, lines, stockRows] = await Promise.all([
      API.getAccounts(false),
      API.getDashboardKpis(),
      pb.listAll('tx_lines', {
        expand: 'tx_id',
        filter: 'tx_id.status="active"',
      }),
      pb.listAll('inventory_stock', { expand: 'product_id' }),
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

    // --- NUEVO: Cartera e Inventario ---
    const invByCategory: Record<string, number> = {};
    for (const st of stockRows) {
      const qty = Number(st.qty_on_hand) || 0;
      if (qty !== 0) {
        let cat = st.expand?.product_id?.categoria?.trim();
        if (!cat) cat = 'Sin Categoría';
        
        let cost = Number(st.avg_cost);
        if (!cost || cost <= 0) {
          cost = Number(st.expand?.product_id?.cost_price) || 0;
        }
        
        const val = qty * cost;
        invByCategory[cat] = (invByCategory[cat] || 0) + val;
      }
    }

    const openInvoices = new Map();
    let carteraPorVencer = 0, cartera0_30 = 0, cartera31_60 = 0, cartera61_90 = 0, carteraMayor90 = 0;

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

      // PyG Anual removido

      // --- NUEVO: Cartera por Edades ---
      if (ac.maneja_cruce && ac.nature === 'debit') {
        const ref = (line.cross_doc_ref || '').trim();
        if (ref) {
          const tx = line.expand?.tx_id;
          if (tx) {
            const key = `${line.third_party_id || tx.third_party_id || 'NO_TERCERO'}|${ref}`;
            if (!openInvoices.has(key)) {
              openInvoices.set(key, { open: 0, doc_date: tx.date, payment_days: Number(tx.payment_days || 0) });
            }
            const doc = openInvoices.get(key);
            doc.open += (debit - credit);
            if (String(tx.date) < String(doc.doc_date)) {
              doc.doc_date = tx.date;
              doc.payment_days = Number(tx.payment_days || 0);
            }
          }
        }
      }
    }

    // --- NUEVO: Calcular Buckets Cartera ---
    const asOfDate = new Date();
    asOfDate.setHours(0, 0, 0, 0);
    for (const doc of openInvoices.values()) {
      if (doc.open > 0.0001) {
        const from = new Date(`${doc.doc_date}T00:00:00`);
        const due = new Date(from.getTime() + (doc.payment_days * 86400000));
        const expiredDays = Math.floor((asOfDate.getTime() - due.getTime()) / 86400000);

        if (expiredDays < 0) carteraPorVencer += doc.open;
        else if (expiredDays <= 30) cartera0_30 += doc.open;
        else if (expiredDays <= 60) cartera31_60 += doc.open;
        else if (expiredDays <= 90) cartera61_90 += doc.open;
        else carteraMayor90 += doc.open;
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
            <h3 class="font-bold text-sm text-[#0D2137]">Evolución Financiera</h3>
            <p class="text-xs text-gray-400">Ingresos vs. Gastos</p>
          </div>
          <div class="flex gap-4 items-center text-xs font-semibold">
            <select id="finance-filter" class="form-select py-1 px-2 border-gray-200 rounded" style="font-size: 11px;">
              <option value="6months">Últimos 6 meses</option>
              <option value="thisMonth">Este mes (Diario)</option>
            </select>
            <div class="flex gap-3">
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full" style="background: #33C7FF"></span> Ingresos</span>
              <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full" style="background: #7F7CFF"></span> Gastos</span>
            </div>
          </div>
        </div>
        <div class="relative flex-1" style="height: 280px;">
          <canvas id="chart-monthly-evolution"></canvas>
        </div>
      </div>

      <!-- Gráfico de Dona: Cartera por Edades -->
      <div class="bg-white rounded-2xl border border-[#F0F0F0] p-5 shadow-sm anim-slide-up flex flex-col justify-between" style="border-color:#F0F0F0; animation-delay:.3s; min-height: 380px;">
        <div>
          <h3 class="font-bold text-sm text-[#0D2137]">Cartera por Edades</h3>
          <p class="text-xs text-gray-400">Cuentas por cobrar a la fecha actual</p>
        </div>
        <div class="relative flex-1 flex items-center justify-center py-4" style="height: 280px; max-height: 280px;">
          <canvas id="chart-aging-breakdown"></canvas>
        </div>
      </div>
    </div>

    <!-- Fila de Tabla de Transacciones y Acciones Rápidas -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <!-- Gráfico de Inventario -->
      <div class="xl:col-span-2 bg-white rounded-2xl border p-5 shadow-sm anim-slide-up flex flex-col justify-between" style="border-color:#F0F0F0; animation-delay:.35s; min-height: 380px;">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-sm text-[#0D2137]">Inventario Valorizado</h3>
            <p class="text-xs text-gray-400">Distribución por categoría (Valor Total)</p>
          </div>
        </div>
        <div class="relative flex-1" style="height: 280px;">
          <canvas id="chart-inventory-categories"></canvas>
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
    if (agingChart) agingChart.destroy();
    if (inventoryChart) inventoryChart.destroy();

    const renderFinanceChart = (filterVal: string) => {
      const monthlyCtx = (document.getElementById('chart-monthly-evolution') as HTMLCanvasElement)?.getContext('2d');
      if (!monthlyCtx) return;

      if (monthlyChart) monthlyChart.destroy();

      let labels: string[] = [];
      let revData: number[] = [];
      let expData: number[] = [];

      if (filterVal === 'thisMonth') {
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        for (let i = 1; i <= daysInMonth; i++) {
          labels.push(`${i} ${monthNames[currentMonth]}`);
        }
        revData = new Array(daysInMonth).fill(0);
        expData = new Array(daysInMonth).fill(0);
        
        const yyyymm = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

        for (const line of lines) {
          const ac = accountMap.get(line.account_id);
          if (!ac) continue;
          const cls = ac.code.charAt(0);
          const dateStr = line.expand?.tx_id?.date || ''; 
          if (!dateStr || !dateStr.startsWith(yyyymm)) continue;
          
          const dayIdx = parseInt(dateStr.slice(8, 10), 10) - 1;
          if (dayIdx >= 0 && dayIdx < daysInMonth) {
            if (cls === '4') revData[dayIdx] += ((line.credit ?? 0) - (line.debit ?? 0));
            else if (cls === '5' || cls === '6' || cls === '7') expData[dayIdx] += ((line.debit ?? 0) - (line.credit ?? 0));
          }
        }
      } else { // 6months
        labels = [...monthsLabels];
        revData = new Array(6).fill(0);
        expData = new Array(6).fill(0);
        
        for (const line of lines) {
          const ac = accountMap.get(line.account_id);
          if (!ac) continue;
          const cls = ac.code.charAt(0);
          const dateStr = line.expand?.tx_id?.date || '';
          if (!dateStr) continue;
          
          const yyyymm = dateStr.slice(0, 7);
          const idx = months.indexOf(yyyymm);
          if (idx !== -1) {
            if (cls === '4') revData[idx] += ((line.credit ?? 0) - (line.debit ?? 0));
            else if (cls === '5' || cls === '6' || cls === '7') expData[idx] += ((line.debit ?? 0) - (line.credit ?? 0));
          }
        }
      }

      const revenueGradient = monthlyCtx.createLinearGradient(0, 0, 0, 250);
      revenueGradient.addColorStop(0, 'rgba(51, 199, 255, 0.22)');
      revenueGradient.addColorStop(1, 'rgba(51, 199, 255, 0.00)');

      const expenseGradient = monthlyCtx.createLinearGradient(0, 0, 0, 250);
      expenseGradient.addColorStop(0, 'rgba(127, 124, 255, 0.22)');
      expenseGradient.addColorStop(1, 'rgba(127, 124, 255, 0.00)');

      monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Ingresos',
              data: revData,
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
              data: expData,
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
            legend: { display: false },
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
                label: function (context: any) {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) {
                    label += (window as any).fmt(context.parsed.y);
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#61708F', font: { family: 'Plus Jakarta Sans', size: 10 } }
            },
            y: {
              grid: { color: 'rgba(220, 230, 248, 0.5)' },
              ticks: {
                color: '#61708F',
                font: { family: 'Plus Jakarta Sans', size: 10 },
                callback: function(value) {
                  const valNum = Number(value);
                  if (Math.abs(valNum) >= 1000000) return '$' + (valNum / 1000000).toFixed(1) + 'M';
                  return '$' + (window as any).fmtN(valNum);
                }
              }
            }
          }
        }
      });
    };

    renderFinanceChart('6months');
    document.getElementById('finance-filter')?.addEventListener('change', (e: any) => {
      renderFinanceChart(e.target.value);
    });

    // 2. Instanciar Gráfico de Dona de Cartera por Edades
    const agingLabels = ['Por Vencer', '0-30 días', '31-60 días', '61-90 días', 'Más de 90 días'];
    const agingValues = [carteraPorVencer, cartera0_30, cartera31_60, cartera61_90, carteraMayor90];
    const nonZeroAgingLabels: string[] = [];
    const nonZeroAgingValues: number[] = [];
    const agingPalette = ['#059669', '#D97706', '#EA580C', '#DC2626', '#991B1B'];
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

    const agingCtx = (document.getElementById('chart-aging-breakdown') as HTMLCanvasElement)?.getContext('2d');
    if (agingCtx) {
      agingChart = new Chart(agingCtx, {
        type: 'doughnut',
        data: {
          labels: nonZeroAgingLabels,
          datasets: [{
            data: nonZeroAgingValues,
            backgroundColor: nonZeroPalette,
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
                font: { family: 'Plus Jakarta Sans', size: 10 }
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
                  if (nonZeroAgingLabels[0] === 'Sin Cartera') return 'Sin cartera pendiente';
                  const label = context.label || '';
                  const val = context.parsed || 0;
                  const total = nonZeroAgingValues.reduce((a, b) => a + b, 0);
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

    // 3. Instanciar Gráfico de Inventario
    const invCtx = (document.getElementById('chart-inventory-categories') as HTMLCanvasElement)?.getContext('2d');
    if (invCtx) {
      const invLabels = Object.keys(invByCategory).sort((a, b) => invByCategory[b] - invByCategory[a]);
      const invValues = invLabels.map(l => invByCategory[l]);
      
      const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
      const bgColors = invLabels.map((_, i) => palette[i % palette.length]);

      if (invLabels.length > 0) {
        inventoryChart = new Chart(invCtx, {
          type: 'bar',
          data: {
            labels: invLabels,
            datasets: [{
              label: 'Valor Total',
              data: invValues,
              backgroundColor: bgColors,
              borderRadius: 4,
              barPercentage: 0.5,
              categoryPercentage: 0.8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(5, 8, 20, 0.9)',
                titleColor: '#ffffff',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                borderWidth: 1,
                callbacks: {
                  label: function(context) {
                    return `Valor: ${fmt(context.parsed.y)}`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: '#61708F', font: { family: 'Plus Jakarta Sans', size: 10 } }
              },
              y: {
                grid: { color: 'rgba(220, 230, 248, 0.5)' },
                ticks: {
                  color: '#61708F',
                  font: { family: 'Plus Jakarta Sans', size: 10 },
                  callback: function(value) {
                    const valNum = Number(value);
                    if (Math.abs(valNum) >= 1000000) return '$' + (valNum / 1000000).toFixed(1) + 'M';
                    return '$' + fmtN(valNum);
                  }
                }
              }
            }
          }
        });
      } else {
        inventoryChart = new Chart(invCtx, {
          type: 'bar',
          data: { labels: ['Sin Inventario'], datasets: [{ data: [0] }] },
          options: { responsive: true, maintainAspectRatio: false }
        });
      }
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
