/**
 * GRAVY v2.0 — preliquidaciones.ts
 * Módulo Aislado de Preliquidación y Simulador de Viabilidad de Importaciones.
 * Permite a los usuarios dimensionar costos de importación, ajustar libremente
 * "al tanteo" el porcentaje de distribución de costos por producto, calcular
 * recargos comerciales (merma/rotura, comisiones), y determinar precios sugeridos
 * de venta y utilidad proyectada antes de realizar compromisos de compra.
 * Replicando fielmente el modelo de muestra_preliq.xlsx.
 */

'use strict';

const pbClient = {
  list: (col: string, opts: any = {}) => {
    const pb = (window as any).pb;
    if (typeof pb?.list === 'function') return pb.list(col, opts);
    if (typeof pb?.collection === 'function') return pb.collection(col).getList(opts.page || 1, opts.perPage || 200, opts);
    throw new Error('Cliente PocketBase no disponible');
  },
  listAll: (col: string, opts: any = {}) => {
    const pb = (window as any).pb;
    if (typeof pb?.listAll === 'function') return pb.listAll(col, opts);
    if (typeof pb?.collection === 'function') return pb.collection(col).getFullList(opts);
    throw new Error('Cliente PocketBase no disponible');
  },
  get: (col: string, id: string, opts: any = {}) => {
    const pb = (window as any).pb;
    if (typeof pb?.get === 'function') return pb.get(col, id, opts);
    if (typeof pb?.collection === 'function') return pb.collection(col).getOne(id, opts);
    throw new Error('Cliente PocketBase no disponible');
  },
  create: (col: string, data: any) => {
    const pb = (window as any).pb;
    if (typeof pb?.create === 'function') return pb.create(col, data);
    if (typeof pb?.collection === 'function') return pb.collection(col).create(data);
    throw new Error('Cliente PocketBase no disponible');
  },
  update: (col: string, id: string, data: any) => {
    const pb = (window as any).pb;
    if (typeof pb?.update === 'function') return pb.update(col, id, data);
    if (typeof pb?.collection === 'function') return pb.collection(col).update(id, data);
    throw new Error('Cliente PocketBase no disponible');
  },
  delete: (col: string, id: string) => {
    const pb = (window as any).pb;
    if (typeof pb?.delete === 'function') return pb.delete(col, id);
    if (typeof pb?.collection === 'function') return pb.collection(col).delete(id);
    throw new Error('Cliente PocketBase no disponible');
  }
};

interface PreliqLine {
  id?: string;
  product_type: string;
  boxes_count: number;
  conversion_factor: number;
  unit_measure: string;
  qty_base: number;
  fob_unit: number;
  fob_total: number;
  cost_distribution_pct: number; // Columna H (al tanteo) para flete/seguro
  freight_usd: number;
  insurance_usd: number;
  base_cif_usd: number;
  arancel_rate: number;
  iva_rate: number;
  arancel_usd: number;
  arancel_cop: number;
  iva_usd: number;
  iva_cop: number;
  landed_allocation_pct: number; // Columna R (al tanteo) de bolsa total
  landed_total_item_cop: number;
  unit_initial_cost_cop: number;
  breakage_rate: number;
  breakage_amount_cop: number;
  commission_rate: number;
  commission_amount_cop: number;
  unit_final_cost_cop: number;
  target_margin: number;
  suggested_price_cop: number;
  unit_profit_cop: number;
  total_profit_cop: number;
}

interface PreliqData {
  id?: string;
  code: string;
  name: string;
  status: 'borrador' | 'estudio' | 'aprobada' | 'descartada';
  currency: string;
  exchange_rate: number;
  containers_count: number;
  freight_per_container_usd: number;
  origin_costs_per_container_usd: number;
  insurance_rate: number;
  insurance_fixed_usd: number;
  itr_per_container_cop: number;
  storage_per_container_cop: number;
  inspection_per_bl_cop: number;
  customs_agency_per_bl_cop: number;
  other_local_costs_cop: number;
  global_breakage_rate: number;
  global_commission_rate: number;
  global_target_margin: number;
  notes: string;
  lines: PreliqLine[];
}

const PRELIQ_STATUS_META: Record<string, { label: string; badge: string; icon: string }> = {
  borrador:   { label: 'Borrador',   badge: 'badge-gray',   icon: 'fa-pencil' },
  estudio:    { label: 'En Estudio', badge: 'badge-blue',   icon: 'fa-chart-pie' },
  aprobada:   { label: 'Aprobada / Viable', badge: 'badge-green',  icon: 'fa-circle-check' },
  descartada: { label: 'Descartada', badge: 'badge-red',    icon: 'fa-circle-xmark' }
};

// Datos por defecto basados en muestra_preliq.xlsx
export function getDefaultSamplePreliq(): PreliqData {
  return {
    code: 'PRELIQ-MUESTRA',
    name: 'Muestra Preliquidación Cerámica 60x120 y TPB (3 Contenedores)',
    status: 'estudio',
    currency: 'USD',
    exchange_rate: 3200,
    containers_count: 3,
    freight_per_container_usd: 4000,
    origin_costs_per_container_usd: 330,
    insurance_rate: 0.003, // 0.3%
    insurance_fixed_usd: 0,
    itr_per_container_cop: 1700000,
    storage_per_container_cop: 1700000,
    inspection_per_bl_cop: 1900000,
    customs_agency_per_bl_cop: 460000,
    other_local_costs_cop: 0,
    global_breakage_rate: 0.02, // 2%
    global_commission_rate: 0.01, // 1%
    global_target_margin: 0.23, // 23%
    notes: 'Simulación basada en la plantilla muestra_preliq.xlsx para evaluación de viabilidad.',
    lines: [
      {
        product_type: '60x120',
        boxes_count: 3060,
        conversion_factor: 1.44,
        unit_measure: 'mt2',
        qty_base: 4406.40,
        fob_unit: 3.60,
        fob_total: 15863.04,
        cost_distribution_pct: 0.65, // 65%
        freight_usd: 7800,
        insurance_usd: 70.99,
        base_cif_usd: 23734.03,
        arancel_rate: 0.25, // 25%
        iva_rate: 0.19, // 19%
        arancel_usd: 5933.51,
        arancel_cop: 18987223,
        iva_usd: 5636.83,
        iva_cop: 18037862,
        landed_allocation_pct: 0.84, // 84% al tanteo
        landed_total_item_cop: 146612015,
        unit_initial_cost_cop: 33272.52,
        breakage_rate: 0.02,
        breakage_amount_cop: 665.45,
        commission_rate: 0.01,
        commission_amount_cop: 332.73,
        unit_final_cost_cop: 34270.69,
        target_margin: 0.23,
        suggested_price_cop: 44507.39,
        unit_profit_cop: 10236.70,
        total_profit_cop: 45106995
      },
      {
        product_type: 'TPB',
        boxes_count: 0,
        conversion_factor: 1,
        unit_measure: 'unidad',
        qty_base: 27000,
        fob_unit: 0.2884,
        fob_total: 7786.80,
        cost_distribution_pct: 0.35, // 35%
        freight_usd: 4200,
        insurance_usd: 50.00,
        base_cif_usd: 12036.80,
        arancel_rate: 0.00, // 0%
        iva_rate: 0.19, // 19%
        arancel_usd: 0,
        arancel_cop: 0,
        iva_usd: 2286.99,
        iva_cop: 7318374,
        landed_allocation_pct: 0.16, // 16% al tanteo
        landed_total_item_cop: 27926098,
        unit_initial_cost_cop: 1034.30,
        breakage_rate: 0.00,
        breakage_amount_cop: 0,
        commission_rate: 0.01,
        commission_amount_cop: 10.34,
        unit_final_cost_cop: 1044.64,
        target_margin: 0.15,
        suggested_price_cop: 1228.99,
        unit_profit_cop: 184.35,
        total_profit_cop: 4977416
      }
    ]
  };
}

/**
 * Recalcula toda la estructura matemática de una preliquidación en memoria.
 */
export function recalculatePreliqModel(data: PreliqData): {
  totalFobUsd: number;
  totalFreightUsd: number;
  totalInsuranceUsd: number;
  totalCifUsd: number;
  totalOriginUsd: number;
  totalOriginCop: number;
  totalCifCop: number;
  totalItrCop: number;
  totalStorageCop: number;
  totalInspectionCop: number;
  totalAgencyCop: number;
  totalOtherLocalCop: number;
  totalArancelCop: number;
  totalIvaCop: number;
  totalBolsaCostosCop: number;
  sumDistCostPct: number;
  sumLandedAllocPct: number;
  totalRevenueCop: number;
  totalProfitCop: number;
  overallMarginPct: number;
} {
  const exRate = Number(data.exchange_rate) || 1;
  const contCount = Number(data.containers_count) || 1;
  const freightPerCont = Number(data.freight_per_container_usd) || 0;
  const totalFreightUsd = freightPerCont * contCount;

  const originPerCont = Number(data.origin_costs_per_container_usd) || 0;
  const totalOriginUsd = originPerCont * contCount;
  const totalOriginCop = totalOriginUsd * exRate;

  const totalItrCop = (Number(data.itr_per_container_cop) || 0) * contCount;
  const totalStorageCop = (Number(data.storage_per_container_cop) || 0) * contCount;
  const totalInspectionCop = Number(data.inspection_per_bl_cop) || 0;
  const totalAgencyCop = Number(data.customs_agency_per_bl_cop) || 0;
  const totalOtherLocalCop = Number(data.other_local_costs_cop) || 0;

  // Paso 1: Cantidades, FOB y bases CIF
  let totalFobUsd = 0;
  let sumDistCostPct = 0;
  let sumLandedAllocPct = 0;

  data.lines.forEach(l => {
    const boxes = Number(l.boxes_count) || 0;
    const factor = Number(l.conversion_factor) || 0;
    if (boxes > 0 && factor > 0) {
      l.qty_base = Math.round(boxes * factor * 100) / 100;
    } else {
      l.qty_base = Number(l.qty_base) || 0;
    }

    l.fob_unit = Number(l.fob_unit) || 0;
    l.fob_total = Math.round(l.qty_base * l.fob_unit * 100) / 100;
    totalFobUsd += l.fob_total;

    sumDistCostPct += Number(l.cost_distribution_pct) || 0;
    sumLandedAllocPct += Number(l.landed_allocation_pct) || 0;
  });

  // Paso 2: Flete por ítem, Seguro, Aranceles e IVA
  let totalInsuranceUsd = 0;
  let totalArancelCop = 0;
  let totalIvaCop = 0;
  let totalCifUsd = 0;

  data.lines.forEach(l => {
    const distPct = Number(l.cost_distribution_pct) || 0;
    l.freight_usd = Math.round(totalFreightUsd * distPct * 100) / 100;

    if (data.insurance_fixed_usd > 0) {
      l.insurance_usd = Math.round(data.insurance_fixed_usd * distPct * 100) / 100;
    } else {
      const insRate = Number(data.insurance_rate) || 0.003;
      l.insurance_usd = Math.round((l.fob_total + l.freight_usd) * insRate * 100) / 100;
    }
    totalInsuranceUsd += l.insurance_usd;

    l.base_cif_usd = Math.round((l.fob_total + l.freight_usd + l.insurance_usd) * 100) / 100;
    totalCifUsd += l.base_cif_usd;

    const arRate = Number(l.arancel_rate) || 0;
    l.arancel_usd = Math.round(l.base_cif_usd * arRate * 100) / 100;
    l.arancel_cop = Math.round(l.arancel_usd * exRate);
    totalArancelCop += l.arancel_cop;

    const ivaRate = Number(l.iva_rate) || 0;
    l.iva_usd = Math.round((l.base_cif_usd + l.arancel_usd) * ivaRate * 100) / 100;
    l.iva_cop = Math.round(l.iva_usd * exRate);
    totalIvaCop += l.iva_cop;
  });

  const totalCifCop = Math.round(totalCifUsd * exRate);

  // Paso 3: BOLSA TOTAL DE COSTOS DE IMPORTACIÓN (COP)
  // CIF COP + Gastos Origen COP + ITR + Bodegaje + Inspección + Agenciamiento + Otros + Aranceles + IVA
  const totalBolsaCostosCop = Math.round(
    totalCifCop +
    totalOriginCop +
    totalItrCop +
    totalStorageCop +
    totalInspectionCop +
    totalAgencyCop +
    totalOtherLocalCop +
    totalArancelCop +
    totalIvaCop
  );

  // Paso 4: Asignación al tanteo por producto, Rotura, Comisión, Costo Final y Precios Sugeridos
  let totalRevenueCop = 0;
  let totalProfitCop = 0;

  data.lines.forEach(l => {
    const allocPct = Number(l.landed_allocation_pct) || 0;
    l.landed_total_item_cop = Math.round(totalBolsaCostosCop * allocPct);

    if (l.qty_base > 0) {
      l.unit_initial_cost_cop = Math.round((l.landed_total_item_cop / l.qty_base) * 100) / 100;
    } else {
      l.unit_initial_cost_cop = 0;
    }

    const brkRate = Number(l.breakage_rate ?? data.global_breakage_rate) || 0;
    l.breakage_amount_cop = Math.round(l.unit_initial_cost_cop * brkRate * 100) / 100;

    const commRate = Number(l.commission_rate ?? data.global_commission_rate) || 0;
    l.commission_amount_cop = Math.round(l.unit_initial_cost_cop * commRate * 100) / 100;

    l.unit_final_cost_cop = Math.round((l.unit_initial_cost_cop + l.breakage_amount_cop + l.commission_amount_cop) * 100) / 100;

    const margin = Number(l.target_margin ?? data.global_target_margin) || 0;
    if (margin < 1) {
      l.suggested_price_cop = Math.round((l.unit_final_cost_cop / (1 - margin)) * 100) / 100;
    } else {
      l.suggested_price_cop = l.unit_final_cost_cop;
    }

    l.unit_profit_cop = Math.round((l.suggested_price_cop - l.unit_final_cost_cop) * 100) / 100;
    l.total_profit_cop = Math.round(l.unit_profit_cop * l.qty_base);

    const lineRevenue = Math.round(l.suggested_price_cop * l.qty_base);
    totalRevenueCop += lineRevenue;
    totalProfitCop += l.total_profit_cop;
  });

  const overallMarginPct = totalRevenueCop > 0 ? (totalProfitCop / totalRevenueCop) : 0;

  return {
    totalFobUsd: Math.round(totalFobUsd * 100) / 100,
    totalFreightUsd: Math.round(totalFreightUsd * 100) / 100,
    totalInsuranceUsd: Math.round(totalInsuranceUsd * 100) / 100,
    totalCifUsd: Math.round(totalCifUsd * 100) / 100,
    totalOriginUsd: Math.round(totalOriginUsd * 100) / 100,
    totalOriginCop,
    totalCifCop,
    totalItrCop,
    totalStorageCop,
    totalInspectionCop,
    totalAgencyCop,
    totalOtherLocalCop,
    totalArancelCop,
    totalIvaCop,
    totalBolsaCostosCop,
    sumDistCostPct: Math.round(sumDistCostPct * 1000) / 1000,
    sumLandedAllocPct: Math.round(sumLandedAllocPct * 1000) / 1000,
    totalRevenueCop,
    totalProfitCop,
    overallMarginPct: Math.round(overallMarginPct * 10000) / 10000
  };
}

/**
 * Renderiza la sección de Preliquidaciones en el contenedor del módulo.
 */
export async function renderPreliquidaciones(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-8 text-center text-slate-400">
      <i class="fas fa-spinner fa-spin mr-2"></i> Cargando simulaciones de preliquidación...
    </div>
  `;

  try {
    let sims: any[] = [];
    try {
      const res = await pbClient.list('import_simulations', {
        sort: '-id',
        page: 1,
        perPage: 100
      });
      sims = res.items || [];
    } catch (_) {
      sims = [];
    }

    _loadPreliquidacionesView(container, sims);
  } catch (err: any) {
    container.innerHTML = `
      <div class="p-8 text-center text-rose-500">
        <i class="fas fa-circle-exclamation mr-2"></i> ${err.message}
      </div>
    `;
  }
}

function _loadPreliquidacionesView(container: HTMLElement, sims: any[]) {
  const totalSims = sims.length;
  const approvedSims = sims.filter(s => s.status === 'aprobada').length;
  const studySims = sims.filter(s => s.status === 'estudio').length;

  container.innerHTML = `
    <!-- Barra Superior de Acciones -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i class="fas fa-calculator text-blue-700"></i>
          Simulador y Preliquidación de Costos de Importación
        </h3>
        <p class="text-xs text-slate-500">
          Proceso 100% aislado de la contabilidad para estudio de viabilidad comercial y ajuste al tanteo de costos landed antes de importar.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" class="btn btn-outline text-xs flex items-center gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50" id="btn-load-sample-preliq">
          <i class="fas fa-file-excel text-emerald-600"></i>
          <span>Cargar Muestra Excel (60x120 + TPB)</span>
        </button>
        <button type="button" class="btn btn-primary text-xs flex items-center gap-1.5" id="btn-new-preliq">
          <i class="fas fa-plus"></i>
          <span>Nueva Preliquidación</span>
        </button>
      </div>
    </div>

    <!-- KPIs de Simulaciones -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${_renderKpi('Total Simulaciones', totalSims, 'fas fa-folder-open', '#1E40AF', '#EFF6FF')}
      ${_renderKpi('En Estudio', studySims, 'fas fa-chart-pie', '#D97706', '#FEF3C7')}
      ${_renderKpi('Aprobadas / Viables', approvedSims, 'fas fa-circle-check', '#059669', '#ECFDF5')}
      ${_renderKpi('Modelo de Referencia', 'muestra_preliq.xlsx', 'fas fa-file-invoice-dollar', '#7C3AED', '#F5F3FF')}
    </div>

    <!-- Filtros de Búsqueda -->
    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center border-slate-200 shadow-sm">
      <input id="preliq-search" class="form-input flex-1 min-w-48 text-xs py-1.5" placeholder="Buscar por código, nombre de simulación o notas...">
      <select id="preliq-status-filter" class="form-input text-xs py-1.5" style="max-width:180px">
        <option value="">Todos los estados</option>
        <option value="borrador">Borradores</option>
        <option value="estudio">En Estudio</option>
        <option value="aprobada">Aprobadas / Viables</option>
        <option value="descartada">Descartadas</option>
      </select>
    </div>

    <!-- Tabla de Simulaciones Guardadas -->
    <div class="bg-white rounded-2xl border overflow-hidden border-slate-200 shadow-sm">
      <div class="overflow-x-auto">
        <table class="data-table w-full text-xs text-left" id="preliq-table">
          <thead>
            <tr class="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th class="py-2.5 px-3">Código</th>
              <th class="py-2.5 px-3">Nombre del Escenario</th>
              <th class="py-2.5 px-3">Fecha</th>
              <th class="py-2.5 px-3 text-center">Contenedores</th>
              <th class="py-2.5 px-3 text-right">TRM (COP)</th>
              <th class="py-2.5 px-3 text-right">Flete USD</th>
              <th class="py-2.5 px-3 text-right">Bolsa Costos (COP)</th>
              <th class="py-2.5 px-3 text-center">Estado</th>
              <th class="py-2.5 px-3 text-center" style="width:130px">Acciones</th>
            </tr>
          </thead>
          <tbody id="preliq-tbody" class="divide-y divide-slate-100">
            ${sims.length > 0 ? sims.map(_renderPreliqRow).join('') : `
              <tr>
                <td colspan="9" class="text-center py-12 text-slate-400">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <i class="fas fa-calculator text-3xl text-slate-300"></i>
                    <p class="font-medium">No hay preliquidaciones registradas aún.</p>
                    <p class="text-[11px] text-slate-400">Crea una nueva simulación o prueba con la muestra de referencia del Excel.</p>
                  </div>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Event Listeners
  document.getElementById('btn-new-preliq')?.addEventListener('click', () => {
    openPreliquidacionModal(null, null, () => renderPreliquidaciones(container));
  });

  document.getElementById('btn-load-sample-preliq')?.addEventListener('click', () => {
    const sample = getDefaultSamplePreliq();
    openPreliquidacionModal(null, sample, () => renderPreliquidaciones(container));
  });

  const searchInput = document.getElementById('preliq-search') as HTMLInputElement;
  const statusFilter = document.getElementById('preliq-status-filter') as HTMLSelectElement;

  const applyTableFilter = () => {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const st = statusFilter?.value || '';
    const rows = document.querySelectorAll<HTMLTableRowElement>('#preliq-tbody tr[data-preliq-id]');

    rows.forEach(r => {
      const text = r.innerText.toLowerCase();
      const rowStatus = r.dataset.status || '';
      const matchQ = !q || text.includes(q);
      const matchSt = !st || rowStatus === st;
      r.style.display = matchQ && matchSt ? '' : 'none';
    });
  };

  searchInput?.addEventListener('input', applyTableFilter);
  statusFilter?.addEventListener('change', applyTableFilter);
}

function _renderKpi(title: string, value: any, icon: string, color: string, bg: string) {
  return `
    <div class="stat-card" style="background:#fff;border-color:#E2E8F0">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-[11px] uppercase font-bold tracking-wider text-slate-500">${title}</span>
          <h4 class="text-xl font-extrabold mt-0.5 text-slate-900">${value}</h4>
        </div>
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm" style="color:${color};background:${bg}">
          <i class="${icon}"></i>
        </div>
      </div>
    </div>
  `;
}

function _renderPreliqRow(s: any) {
  const meta = PRELIQ_STATUS_META[s.status] || { label: s.status, badge: 'badge-gray', icon: 'fa-tag' };
  const dateStr = s.created ? s.created.split(' ')[0] : '—';
  const totals = s.summary_cache || {};

  return `
    <tr data-preliq-id="${s.id}" data-status="${s.status}" class="hover:bg-slate-50/80 transition-colors">
      <td class="py-2.5 px-3 font-mono font-bold text-blue-700">${(window as any).esc(s.code || 'S/N')}</td>
      <td class="py-2.5 px-3 font-semibold text-slate-800">
        <div>${(window as any).esc(s.name || 'Sin título')}</div>
        ${s.notes ? `<div class="text-[10px] text-slate-400 truncate max-w-xs">${(window as any).esc(s.notes)}</div>` : ''}
      </td>
      <td class="py-2.5 px-3 text-slate-500">${dateStr}</td>
      <td class="py-2.5 px-3 text-center font-bold text-slate-700">${s.containers_count || 1}</td>
      <td class="py-2.5 px-3 text-right font-mono text-slate-600">${(window as any).fmt(s.exchange_rate || 0)}</td>
      <td class="py-2.5 px-3 text-right font-mono font-semibold text-sky-800">$ ${(totals.totalFreightUsd || 0).toLocaleString()} USD</td>
      <td class="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">${(window as any).fmt(totals.totalBolsaCostosCop || 0)}</td>
      <td class="py-2.5 px-3 text-center">
        <span class="badge ${meta.badge} text-[10px] py-0.5 px-2">
          <i class="fas ${meta.icon} mr-1"></i> ${meta.label}
        </span>
      </td>
      <td class="py-2.5 px-3 text-center">
        <div class="flex items-center justify-center gap-1">
          <button type="button" class="btn btn-outline btn-xs p-1 text-blue-600 hover:text-blue-800" title="Abrir y Editar en Simulador" onclick="window.openPreliqById('${s.id}')">
            <i class="fas fa-calculator"></i>
          </button>
          <button type="button" class="btn btn-outline btn-xs p-1 text-emerald-600 hover:text-emerald-800" title="Exportar a Excel (Formato muestra_preliq)" onclick="window.exportPreliqById('${s.id}')">
            <i class="fas fa-file-excel"></i>
          </button>
          <button type="button" class="btn btn-outline btn-xs p-1 text-rose-600 hover:text-rose-800" title="Eliminar Simulación" onclick="window.deletePreliqById('${s.id}')">
            <i class="fas fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/**
 * Abre el Modal Interactivo del Simulador de Preliquidación.
 */
export async function openPreliquidacionModal(
  simId: string | null = null,
  initialData: PreliqData | null = null,
  onDone: any = null
) {
  const existingOverlay = document.getElementById('preliq-modal-overlay');
  if (existingOverlay) existingOverlay.remove();

  let data: PreliqData;

  if (initialData) {
    data = JSON.parse(JSON.stringify(initialData));
  } else if (simId) {
    try {
      const record = await pbClient.get('import_simulations', simId);
      const linesRes = await pbClient.listAll('import_simulation_lines', {
        filter: `simulation_id="${simId}"`,
        sort: 'line_order'
      });

      data = {
        id: record.id,
        code: record.code,
        name: record.name,
        status: record.status,
        currency: record.currency || 'USD',
        exchange_rate: record.exchange_rate || 3200,
        containers_count: record.containers_count || 1,
        freight_per_container_usd: record.freight_per_container_usd || 0,
        origin_costs_per_container_usd: record.origin_costs_per_container_usd || 0,
        insurance_rate: record.insurance_rate || 0.003,
        insurance_fixed_usd: record.insurance_fixed_usd || 0,
        itr_per_container_cop: record.itr_per_container_cop || 0,
        storage_per_container_cop: record.storage_per_container_cop || 0,
        inspection_per_bl_cop: record.inspection_per_bl_cop || 0,
        customs_agency_per_bl_cop: record.customs_agency_per_bl_cop || 0,
        other_local_costs_cop: record.other_local_costs_cop || 0,
        global_breakage_rate: record.global_breakage_rate || 0.02,
        global_commission_rate: record.global_commission_rate || 0.01,
        global_target_margin: 0.23,
        notes: record.notes || '',
        lines: linesRes.map((l: any) => ({
          id: l.id,
          product_type: l.product_type || '',
          boxes_count: l.boxes_count || 0,
          conversion_factor: l.conversion_factor || 1,
          unit_measure: l.unit_measure || 'mt2',
          qty_base: l.qty_base || 0,
          fob_unit: l.fob_unit || 0,
          fob_total: l.fob_total || 0,
          cost_distribution_pct: l.cost_distribution_pct || 0,
          freight_usd: 0,
          insurance_usd: 0,
          base_cif_usd: 0,
          arancel_rate: l.arancel_rate || 0,
          iva_rate: l.iva_rate || 0.19,
          arancel_usd: 0,
          arancel_cop: 0,
          iva_usd: 0,
          iva_cop: 0,
          landed_allocation_pct: l.landed_allocation_pct || 0,
          landed_total_item_cop: 0,
          unit_initial_cost_cop: 0,
          breakage_rate: l.breakage_rate || 0.02,
          breakage_amount_cop: 0,
          commission_rate: l.commission_rate || 0.01,
          commission_amount_cop: 0,
          unit_final_cost_cop: 0,
          target_margin: l.target_margin || 0.23,
          suggested_price_cop: 0,
          unit_profit_cop: 0,
          total_profit_cop: 0
        }))
      };
    } catch (err: any) {
      (window as any).showToast('Error al cargar la simulación: ' + err.message, 'error');
      return;
    }
  } else {
    // Nueva simulación en blanco
    const randNum = Math.floor(1000 + Math.random() * 9000);
    data = {
      code: `PRELIQ-${randNum}`,
      name: 'Nueva Simulación de Importación',
      status: 'borrador',
      currency: 'USD',
      exchange_rate: 4000,
      containers_count: 1,
      freight_per_container_usd: 4000,
      origin_costs_per_container_usd: 300,
      insurance_rate: 0.003,
      insurance_fixed_usd: 0,
      itr_per_container_cop: 1700000,
      storage_per_container_cop: 1700000,
      inspection_per_bl_cop: 1900000,
      customs_agency_per_bl_cop: 460000,
      other_local_costs_cop: 0,
      global_breakage_rate: 0.02,
      global_commission_rate: 0.01,
      global_target_margin: 0.23,
      notes: '',
      lines: [
        {
          product_type: 'Producto Principal',
          boxes_count: 1000,
          conversion_factor: 1.44,
          unit_measure: 'mt2',
          qty_base: 1440,
          fob_unit: 4.50,
          fob_total: 6480,
          cost_distribution_pct: 1.0,
          freight_usd: 4000,
          insurance_usd: 31.44,
          base_cif_usd: 10511.44,
          arancel_rate: 0.15,
          iva_rate: 0.19,
          arancel_usd: 0,
          arancel_cop: 0,
          iva_usd: 0,
          iva_cop: 0,
          landed_allocation_pct: 1.0,
          landed_total_item_cop: 0,
          unit_initial_cost_cop: 0,
          breakage_rate: 0.02,
          breakage_amount_cop: 0,
          commission_rate: 0.01,
          commission_amount_cop: 0,
          unit_final_cost_cop: 0,
          target_margin: 0.23,
          suggested_price_cop: 0,
          unit_profit_cop: 0,
          total_profit_cop: 0
        }
      ]
    };
  }

  const overlay = document.createElement('div');
  overlay.id = 'preliq-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.75);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:12px;';

  overlay.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden w-full max-w-7xl h-[94vh] animate-in fade-in zoom-in-95 duration-150">
      
      <!-- Cabecera del Modal -->
      <div class="p-3.5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between flex-wrap gap-2 border-b border-slate-700">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/30 text-blue-300 font-bold">
            <i class="fas fa-calculator text-base"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-sm text-white" id="preliq-modal-title">
                ${data.id ? 'Editar Preliquidación' : 'Simulador de Preliquidación & Costos Landed'}
              </h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-slate-950">
                PROCESO AISLADO
              </span>
            </div>
            <p class="text-[11px] text-slate-300">
              Control manual "al tanteo" de porcentajes de distribución para estimación de viabilidad y precio sugerido.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" class="btn btn-outline btn-xs bg-slate-800/80 text-emerald-300 border-slate-600 hover:bg-slate-700 flex items-center gap-1" id="btn-preliq-load-sample" title="Cargar los datos del Excel muestra_preliq.xlsx">
            <i class="fas fa-file-excel"></i> Muestra Excel
          </button>
          <button type="button" class="btn btn-outline btn-xs bg-slate-800/80 text-sky-300 border-slate-600 hover:bg-slate-700 flex items-center gap-1" id="btn-preliq-suggest-fob" title="Distribuir flete proporcional al valor FOB">
            <i class="fas fa-wand-magic-sparkles"></i> Sugerir % FOB
          </button>
          <button type="button" class="btn btn-outline btn-xs bg-slate-800/80 text-amber-300 border-slate-600 hover:bg-slate-700 flex items-center gap-1" id="btn-preliq-export-excel" title="Descargar como archivo Excel">
            <i class="fas fa-download"></i> Descargar Excel
          </button>
          <button type="button" class="btn btn-primary btn-xs flex items-center gap-1" id="btn-preliq-save">
            <i class="fas fa-floppy-disk"></i> Guardar Simulación
          </button>
          <button type="button" class="text-slate-400 hover:text-white text-lg p-1 ml-2 border-0 bg-transparent cursor-pointer" id="btn-preliq-close">
            <i class="fas fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Cuerpo del Modal (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 text-xs">
        
        <!-- Bloque 1: Parámetros del Escenario -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <!-- Tarjeta A: Datos del Escenario y Tránsito -->
          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2.5">
            <div class="flex items-center justify-between border-b pb-1.5 border-slate-100">
              <span class="font-bold text-slate-800 flex items-center gap-1.5">
                <i class="fas fa-ship text-blue-600"></i> 1. Tránsito & Fletes
              </span>
              <select id="preliq-status" class="form-input text-[11px] py-0.5 px-2" style="width:110px">
                <option value="borrador" ${data.status === 'borrador' ? 'selected' : ''}>Borrador</option>
                <option value="estudio" ${data.status === 'estudio' ? 'selected' : ''}>En Estudio</option>
                <option value="aprobada" ${data.status === 'aprobada' ? 'selected' : ''}>Aprobada</option>
                <option value="descartada" ${data.status === 'descartada' ? 'selected' : ''}>Descartada</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-600 text-[10px] mb-0.5">Código:</label>
                <input type="text" id="preliq-code" class="form-input text-xs font-mono font-bold w-full" value="${(window as any).esc(data.code)}">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 text-[10px] mb-0.5">TRM COP <span class="text-rose-500">*</span></label>
                <input type="number" id="preliq-exchange-rate" class="form-input text-xs font-mono font-bold text-right w-full" min="1" step="1" value="${data.exchange_rate}">
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-600 text-[10px] mb-0.5">Nombre / Referencia de Estudio:</label>
              <input type="text" id="preliq-name" class="form-input text-xs font-semibold w-full" placeholder="Ej: Cerámica 60x120 - 3 Contenedores..." value="${(window as any).esc(data.name)}">
            </div>

            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block font-semibold text-slate-600 text-[10px] mb-0.5"># Contenedores:</label>
                <input type="number" id="preliq-containers" class="form-input text-xs font-bold text-center w-full" min="1" step="1" value="${data.containers_count}">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 text-[10px] mb-0.5">Flete USD/Cont:</label>
                <input type="number" id="preliq-freight-cont" class="form-input text-xs font-mono text-right w-full" min="0" step="50" value="${data.freight_per_container_usd}">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 text-[10px] mb-0.5">Origen USD/Cont:</label>
                <input type="number" id="preliq-origin-cont" class="form-input text-xs font-mono text-right w-full" min="0" step="10" value="${data.origin_costs_per_container_usd}">
              </div>
            </div>

            <div class="flex items-center justify-between text-[11px] pt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
              <span class="text-slate-500">Total Flete:</span>
              <strong class="text-sky-900" id="lbl-preliq-total-freight">$ 0 USD</strong>
            </div>
          </div>

          <!-- Tarjeta B: Gastos Portuarios y Locales (COP) -->
          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2.5">
            <div class="flex items-center justify-between border-b pb-1.5 border-slate-100">
              <span class="font-bold text-slate-800 flex items-center gap-1.5">
                <i class="fas fa-truck text-emerald-600"></i> 2. Gastos Portuarios (COP)
              </span>
              <span class="text-[10px] text-slate-400">Por Contenedor / BL</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-600 text-[10px] mb-0.5">ITR / Contenedor ($):</label>
                <input type="number" id="preliq-itr-cont" class="form-input text-xs font-mono text-right w-full" step="10000" value="${data.itr_per_container_cop}">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 text-[10px] mb-0.5">Bodegaje / Cont ($):</label>
                <input type="number" id="preliq-storage-cont" class="form-input text-xs font-mono text-right w-full" step="10000" value="${data.storage_per_container_cop}">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-600 text-[10px] mb-0.5">Inspección / BL ($):</label>
                <input type="number" id="preliq-inspection-bl" class="form-input text-xs font-mono text-right w-full" step="10000" value="${data.inspection_per_bl_cop}">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 text-[10px] mb-0.5">Agenciamiento / BL ($):</label>
                <input type="number" id="preliq-agency-bl" class="form-input text-xs font-mono text-right w-full" step="10000" value="${data.customs_agency_per_bl_cop}">
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-600 text-[10px] mb-0.5">Otros Gastos Locales / Flete a Bodega ($):</label>
              <input type="number" id="preliq-other-local" class="form-input text-xs font-mono text-right w-full" step="10000" value="${data.other_local_costs_cop}">
            </div>

            <div class="flex items-center justify-between text-[11px] pt-1 bg-slate-50 p-2 rounded-lg border border-slate-100 font-mono">
              <span class="text-slate-500">Total Gastos Locales:</span>
              <strong class="text-emerald-900" id="lbl-preliq-total-locals">$ 0 COP</strong>
            </div>
          </div>

          <!-- Tarjeta C: Bolsa Total de Costos & Resumen de Liquidación -->
          <div class="p-3 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl shadow-md space-y-2 flex flex-col justify-between">
            <div class="flex items-center justify-between border-b pb-1.5 border-slate-700">
              <span class="font-extrabold text-xs text-blue-200 flex items-center gap-1.5">
                <i class="fas fa-sack-dollar text-amber-400"></i> BOLSA TOTAL DE COSTOS
              </span>
              <span class="text-[10px] text-slate-300 font-mono" id="lbl-preliq-cif-usd">CIF: $ 0 USD</span>
            </div>

            <div class="space-y-1 text-[11px]">
              <div class="flex justify-between text-slate-300">
                <span>Base CIF (Mercancía + Logística):</span>
                <span class="font-mono text-white" id="lbl-res-cif-cop">$ 0</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>Gastos Origen (COP):</span>
                <span class="font-mono text-white" id="lbl-res-origin-cop">$ 0</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>Gastos Locales Puerto:</span>
                <span class="font-mono text-white" id="lbl-res-ports-cop">$ 0</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>Aranceles DIAN:</span>
                <span class="font-mono text-amber-300" id="lbl-res-arancel-cop">$ 0</span>
              </div>
              <div class="flex justify-between text-slate-300">
                <span>IVA Importación DIAN:</span>
                <span class="font-mono text-amber-300" id="lbl-res-iva-cop">$ 0</span>
              </div>
            </div>

            <div class="p-2.5 bg-blue-950/80 rounded-xl border border-blue-400/30 text-center mt-1">
              <div class="text-[10px] uppercase tracking-wider font-extrabold text-blue-300">Costo Total Desembolsado</div>
              <div class="text-xl font-black text-amber-300 font-mono mt-0.5" id="lbl-res-bolsa-total">$ 0 COP</div>
              <div class="text-[9px] text-slate-400 mt-0.5">Bolsa total a distribuir al tanteo entre los productos</div>
            </div>
          </div>

        </div>

        <!-- Bloque 2: Tabla Reactiva de Productos con Controles Al Tanteo -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          
          <div class="p-3 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <h4 class="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <i class="fas fa-boxes-packing text-blue-600"></i>
                Productos y Distribución al Tanteo
              </h4>

              <!-- Indicador de Balance de % Distribución -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold" id="badge-dist-flete-wrap" style="background:#F8FAFC;border-color:#E2E8F0">
                <span class="text-slate-500">Distribución Flete:</span>
                <span class="font-mono" id="lbl-sum-dist-pct">0%</span>
              </div>

              <!-- Indicador de Balance de % Asignación de Costo Total -->
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold" id="badge-dist-landed-wrap" style="background:#F8FAFC;border-color:#E2E8F0">
                <span class="text-slate-500">Asignación Bolsa Costos:</span>
                <span class="font-mono" id="lbl-sum-alloc-pct">0%</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" class="btn btn-primary btn-xs flex items-center gap-1" id="btn-preliq-add-line">
                <i class="fas fa-plus"></i> Agregar Producto
              </button>
            </div>
          </div>

          <!-- Contenedor con Scroll Horizontal para la Matriz Completa -->
          <div class="overflow-x-auto max-h-[48vh] border border-slate-200 rounded-xl shadow-inner bg-white">
            <style>
              #preliq-lines-table input[type=number]::-webkit-inner-spin-button,
              #preliq-lines-table input[type=number]::-webkit-outer-spin-button {
                opacity: 0.25;
                cursor: pointer;
              }
              #preliq-lines-table input[type=number]:hover::-webkit-inner-spin-button,
              #preliq-lines-table input[type=number]:focus::-webkit-inner-spin-button {
                opacity: 1;
              }
            </style>
            <table class="text-xs text-left border-collapse" id="preliq-lines-table" style="min-width:3200px; width:100%; table-layout:fixed;">
              <thead class="sticky top-0 bg-slate-100 text-slate-700 font-semibold border-b border-slate-300 z-10 shadow-sm">
                <tr>
                  <th class="py-2.5 px-2 text-center" style="width:45px">#</th>
                  <th class="py-2.5 px-2" style="width:220px">Producto / Partida</th>
                  <th class="py-2.5 px-2 text-right" style="width:110px">Cajas</th>
                  <th class="py-2.5 px-2 text-right" style="width:100px">Factor</th>
                  <th class="py-2.5 px-2 text-right" style="width:130px">Cant. Base</th>
                  <th class="py-2.5 px-2 text-center" style="width:95px">Unidad</th>
                  <th class="py-2.5 px-2 text-right" style="width:125px">FOB Unit ($)</th>
                  <th class="py-2.5 px-2 text-right" style="width:135px">FOB Total ($)</th>
                  <th class="py-2.5 px-2 text-right bg-blue-50/70 border-x border-blue-200" style="width:125px" title="Porcentaje de asignación manual de Flete y Seguro">
                    % Dist. Costo <i class="fas fa-hand-pointer text-blue-600 text-[10px]"></i>
                  </th>
                  <th class="py-2.5 px-2 text-right" style="width:110px">Seguro ($)</th>
                  <th class="py-2.5 px-2 text-right" style="width:125px">Flete ($)</th>
                  <th class="py-2.5 px-2 text-right" style="width:135px">Base CIF ($)</th>
                  <th class="py-2.5 px-2 text-right" style="width:100px">Arancel %</th>
                  <th class="py-2.5 px-2 text-right" style="width:100px">IVA %</th>
                  <th class="py-2.5 px-2 text-right" style="width:135px">Arancel ($COP)</th>
                  <th class="py-2.5 px-2 text-right" style="width:135px">IVA ($COP)</th>
                  <th class="py-2.5 px-2 text-right bg-amber-50/80 border-x border-amber-200" style="width:125px" title="Porcentaje manual al tanteo para asignar la bolsa total de costos">
                    % Asign. Total <i class="fas fa-sliders text-amber-600 text-[10px]"></i>
                  </th>
                  <th class="py-2.5 px-2 text-right" style="width:145px">Costo Asign. ($)</th>
                  <th class="py-2.5 px-2 text-right font-bold text-slate-800" style="width:140px">Costo Inic./Unid</th>
                  <th class="py-2.5 px-2 text-right" style="width:105px">Rotura %</th>
                  <th class="py-2.5 px-2 text-right" style="width:105px">Comisión %</th>
                  <th class="py-2.5 px-2 text-right font-extrabold bg-indigo-50/80 text-indigo-950 border-x border-indigo-200" style="width:145px">
                    Costo Final/Unid
                  </th>
                  <th class="py-2.5 px-2 text-right bg-emerald-50/50" style="width:105px">Margen %</th>
                  <th class="py-2.5 px-2 text-right font-black bg-emerald-50 text-emerald-900 border-x border-emerald-200" style="width:150px">
                    Precio Sugerido
                  </th>
                  <th class="py-2.5 px-2 text-right" style="width:130px">Margen ($)</th>
                  <th class="py-2.5 px-2 text-right font-bold text-emerald-700" style="width:145px">Utilidad Total</th>
                  <th class="py-2.5 px-2 text-center" style="width:50px"></th>
                </tr>
              </thead>
              <tbody id="preliq-lines-tbody" class="divide-y divide-slate-200">
                <!-- Filas renderizadas dinámicamente -->
              </tbody>
              <tfoot class="sticky bottom-0 bg-slate-100/95 font-bold border-t-2 border-slate-300 text-slate-800 z-10" id="preliq-lines-tfoot">
                <!-- Fila de Totales -->
              </tfoot>
            </table>
          </div>

        </div>

        <!-- Bloque 3: Resumen Ejecutivo de Rentabilidad y Viabilidad -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span class="text-[10px] uppercase font-bold text-slate-400">Total Unidades Base</span>
            <div class="text-base font-extrabold text-slate-800 font-mono mt-0.5" id="kpi-total-units">0</div>
            <div class="text-[10px] text-slate-400 mt-1">Superficie o unidades importadas</div>
          </div>

          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span class="text-[10px] uppercase font-bold text-slate-400">Facturación Estimada Sugerida</span>
            <div class="text-base font-extrabold text-sky-900 font-mono mt-0.5" id="kpi-total-revenue">$ 0 COP</div>
            <div class="text-[10px] text-slate-400 mt-1">Ventas brutas a precios sugeridos</div>
          </div>

          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span class="text-[10px] uppercase font-bold text-slate-400">Utilidad Bruta Proyectada</span>
            <div class="text-base font-extrabold text-emerald-700 font-mono mt-0.5" id="kpi-total-profit">$ 0 COP</div>
            <div class="text-[10px] text-slate-400 mt-1">Beneficio después de rotura y comisión</div>
          </div>

          <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span class="text-[10px] uppercase font-bold text-slate-400">Margen Promedio de Operación</span>
            <div class="text-base font-black text-indigo-700 font-mono mt-0.5" id="kpi-overall-margin">0.0 %</div>
            <div class="text-[10px] text-slate-400 mt-1">Rentabilidad sobre ventas</div>
          </div>

        </div>

      </div>

      <!-- Pie del Modal -->
      <div class="p-3 bg-white border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div class="flex items-center gap-2 text-slate-500">
          <i class="fas fa-info-circle text-blue-500"></i>
          <span>Este simulador es autónomo. Los valores calculados sirven para toma de decisiones y fijación de precios comerciales.</span>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="btn btn-outline" id="btn-preliq-cancel">Cerrar</button>
          <button type="button" class="btn btn-primary" id="btn-preliq-save-bottom">
            <i class="fas fa-floppy-disk mr-1"></i> Guardar Simulación
          </button>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);

  // Funciones de recálculo y repintado de la tabla de partidas
  function renderLines() {
    const tbody = overlay.querySelector('#preliq-lines-tbody');
    const tfoot = overlay.querySelector('#preliq-lines-tfoot');
    if (!tbody || !tfoot) return;

    const calc = recalculatePreliqModel(data);

    // Actualizar badges de sumas y alertas
    const badgeDist = overlay.querySelector('#badge-dist-flete-wrap') as HTMLElement;
    const lblDist = overlay.querySelector('#lbl-sum-dist-pct') as HTMLElement;
    if (lblDist && badgeDist) {
      lblDist.innerText = `${Math.round(calc.sumDistCostPct * 100)}%`;
      if (Math.abs(calc.sumDistCostPct - 1.0) < 0.001) {
        badgeDist.style.background = '#ECFDF5';
        badgeDist.style.borderColor = '#A7F3D0';
        lblDist.className = 'font-mono text-emerald-700 font-bold';
      } else {
        badgeDist.style.background = '#FEF3C7';
        badgeDist.style.borderColor = '#FDE68A';
        lblDist.className = 'font-mono text-amber-700 font-bold';
      }
    }

    const badgeAlloc = overlay.querySelector('#badge-dist-landed-wrap') as HTMLElement;
    const lblAlloc = overlay.querySelector('#lbl-sum-alloc-pct') as HTMLElement;
    if (lblAlloc && badgeAlloc) {
      lblAlloc.innerText = `${Math.round(calc.sumLandedAllocPct * 100)}%`;
      if (Math.abs(calc.sumLandedAllocPct - 1.0) < 0.001) {
        badgeAlloc.style.background = '#ECFDF5';
        badgeAlloc.style.borderColor = '#A7F3D0';
        lblAlloc.className = 'font-mono text-emerald-700 font-bold';
      } else {
        badgeAlloc.style.background = '#FFF1F2';
        badgeAlloc.style.borderColor = '#FECDD3';
        lblAlloc.className = 'font-mono text-rose-700 font-bold';
      }
    }

    // Actualizar Resumen en Tarjeta C y KPIs
    const elFob = overlay.querySelector('#lbl-preliq-cif-usd');
    if (elFob) elFob.textContent = `CIF: $ ${calc.totalCifUsd.toLocaleString()} USD`;

    const elFreight = overlay.querySelector('#lbl-preliq-total-freight');
    if (elFreight) elFreight.textContent = `$ ${calc.totalFreightUsd.toLocaleString()} USD ($ ${(calc.totalFreightUsd * data.exchange_rate).toLocaleString()} COP)`;

    const elLocals = overlay.querySelector('#lbl-preliq-total-locals');
    const sumLocals = calc.totalItrCop + calc.totalStorageCop + calc.totalInspectionCop + calc.totalAgencyCop + calc.totalOtherLocalCop;
    if (elLocals) elLocals.textContent = `$ ${sumLocals.toLocaleString()} COP`;

    const elResCif = overlay.querySelector('#lbl-res-cif-cop');
    if (elResCif) elResCif.textContent = `$ ${calc.totalCifCop.toLocaleString()}`;

    const elResOrigin = overlay.querySelector('#lbl-res-origin-cop');
    if (elResOrigin) elResOrigin.textContent = `$ ${calc.totalOriginCop.toLocaleString()}`;

    const elResPorts = overlay.querySelector('#lbl-res-ports-cop');
    if (elResPorts) elResPorts.textContent = `$ ${sumLocals.toLocaleString()}`;

    const elResArancel = overlay.querySelector('#lbl-res-arancel-cop');
    if (elResArancel) elResArancel.textContent = `$ ${calc.totalArancelCop.toLocaleString()}`;

    const elResIva = overlay.querySelector('#lbl-res-iva-cop');
    if (elResIva) elResIva.textContent = `$ ${calc.totalIvaCop.toLocaleString()}`;

    const elResBolsa = overlay.querySelector('#lbl-res-bolsa-total');
    if (elResBolsa) elResBolsa.textContent = `$ ${calc.totalBolsaCostosCop.toLocaleString()} COP`;

    // KPIs inferiores
    let totalQty = 0;
    data.lines.forEach(l => totalQty += l.qty_base);

    const kpiUnits = overlay.querySelector('#kpi-total-units');
    if (kpiUnits) kpiUnits.textContent = `${totalQty.toLocaleString()}`;

    const kpiRev = overlay.querySelector('#kpi-total-revenue');
    if (kpiRev) kpiRev.textContent = `$ ${calc.totalRevenueCop.toLocaleString()}`;

    const kpiProfit = overlay.querySelector('#kpi-total-profit');
    if (kpiProfit) kpiProfit.textContent = `$ ${calc.totalProfitCop.toLocaleString()}`;

    const kpiMargin = overlay.querySelector('#kpi-overall-margin');
    if (kpiMargin) kpiMargin.textContent = `${(calc.overallMarginPct * 100).toFixed(1)} %`;

    // Renderizado de Filas de Partidas
    tbody.innerHTML = data.lines.map((l, idx) => `
      <tr class="hover:bg-slate-50/80 transition-colors" data-line-index="${idx}">
        <td class="py-2.5 px-2 text-center text-slate-400 font-mono" style="width:45px">${idx + 1}</td>
        
        <!-- Nombre Producto -->
        <td class="py-2.5 px-2" style="width:220px">
          <input type="text" class="form-input text-xs font-semibold py-1.5 px-2.5 w-full line-field rounded-lg border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="product_type" value="${(window as any).esc(l.product_type)}" title="${(window as any).esc(l.product_type)}">
        </td>

        <!-- Cajas -->
        <td class="py-2.5 px-2 text-right" style="width:110px">
          <input type="number" class="form-input text-xs text-right font-mono py-1.5 px-2 w-full line-field rounded-lg border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="boxes_count" min="0" step="1" value="${l.boxes_count}">
        </td>

        <!-- Factor -->
        <td class="py-2.5 px-2 text-right" style="width:100px">
          <input type="number" class="form-input text-xs text-right font-mono py-1.5 px-2 w-full line-field rounded-lg border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="conversion_factor" min="0" step="0.01" value="${l.conversion_factor}">
        </td>

        <!-- Cantidad Base -->
        <td class="py-2.5 px-2 text-right" style="width:130px">
          <input type="number" class="form-input text-xs text-right font-bold font-mono py-1.5 px-2 w-full line-field rounded-lg border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="qty_base" min="0.01" step="0.01" value="${l.qty_base}">
        </td>

        <!-- Unidad -->
        <td class="py-2.5 px-2 text-center" style="width:95px">
          <input type="text" class="form-input text-xs text-center py-1.5 px-1.5 w-full line-field rounded-lg border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="unit_measure" value="${(window as any).esc(l.unit_measure || 'mt2')}">
        </td>

        <!-- FOB Unit USD -->
        <td class="py-2.5 px-2 text-right" style="width:125px">
          <input type="number" class="form-input text-xs text-right font-mono py-1.5 px-2 w-full line-field rounded-lg border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="fob_unit" min="0" step="0.01" value="${l.fob_unit}">
        </td>

        <!-- FOB Total USD -->
        <td class="py-2.5 px-2 text-right font-mono font-semibold text-slate-800 whitespace-nowrap" style="width:135px">
          $ ${(l.fob_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>

        <!-- % Distribución Costo Flete (AL TANTEO) -->
        <td class="py-2.5 px-2 text-right bg-blue-50/40 border-x border-blue-200" style="width:125px">
          <input type="number" class="form-input text-xs text-right font-mono font-bold text-blue-900 py-1.5 px-2 w-full line-field rounded-lg border-blue-300 bg-blue-50/50 focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="cost_distribution_pct" min="0" max="1" step="0.01" value="${l.cost_distribution_pct}">
        </td>

        <!-- Seguro USD -->
        <td class="py-2.5 px-2 text-right font-mono text-slate-600 whitespace-nowrap" style="width:110px">
          $ ${(l.insurance_usd || 0).toFixed(2)}
        </td>

        <!-- Flete USD -->
        <td class="py-2.5 px-2 text-right font-mono text-sky-800 whitespace-nowrap" style="width:125px">
          $ ${(l.freight_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>

        <!-- Base CIF USD -->
        <td class="py-2.5 px-2 text-right font-mono font-semibold text-slate-900 whitespace-nowrap" style="width:135px">
          $ ${(l.base_cif_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>

        <!-- % Arancel -->
        <td class="py-2.5 px-2 text-right" style="width:100px">
          <input type="number" class="form-input text-xs text-right font-mono py-1.5 px-2 w-full line-field rounded-lg border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="arancel_rate" min="0" max="1" step="0.01" value="${l.arancel_rate}">
        </td>

        <!-- % IVA -->
        <td class="py-2.5 px-2 text-right" style="width:100px">
          <input type="number" class="form-input text-xs text-right font-mono py-1.5 px-2 w-full line-field rounded-lg border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="iva_rate" min="0" max="1" step="0.01" value="${l.iva_rate}">
        </td>

        <!-- Arancel COP -->
        <td class="py-2.5 px-2 text-right font-mono text-slate-700 whitespace-nowrap" style="width:135px">
          ${(l.arancel_cop || 0).toLocaleString()}
        </td>

        <!-- IVA COP -->
        <td class="py-2.5 px-2 text-right font-mono text-slate-700 whitespace-nowrap" style="width:135px">
          ${(l.iva_cop || 0).toLocaleString()}
        </td>

        <!-- % Asignación Bolsa Total (AL TANTEO) -->
        <td class="py-2.5 px-2 text-right bg-amber-50/60 border-x border-amber-200" style="width:125px">
          <input type="number" class="form-input text-xs text-right font-mono font-bold text-amber-950 py-1.5 px-2 w-full line-field rounded-lg border-amber-300 bg-amber-50/50 focus:ring-1 focus:ring-amber-500 shadow-sm" data-field="landed_allocation_pct" min="0" max="1" step="0.01" value="${l.landed_allocation_pct}">
        </td>

        <!-- Costo Asignado COP -->
        <td class="py-2.5 px-2 text-right font-mono font-semibold text-slate-800 whitespace-nowrap" style="width:145px">
          ${(l.landed_total_item_cop || 0).toLocaleString()}
        </td>

        <!-- Costo Inicial Unitario COP -->
        <td class="py-2.5 px-2 text-right font-mono font-bold text-slate-900 whitespace-nowrap" style="width:140px">
          ${(l.unit_initial_cost_cop || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>

        <!-- Rotura % -->
        <td class="py-2.5 px-2 text-right" style="width:105px">
          <input type="number" class="form-input text-xs text-right font-mono py-1.5 px-2 w-full line-field rounded-lg border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="breakage_rate" min="0" max="0.5" step="0.005" value="${l.breakage_rate}">
        </td>

        <!-- Comisión % -->
        <td class="py-2.5 px-2 text-right" style="width:105px">
          <input type="number" class="form-input text-xs text-right font-mono py-1.5 px-2 w-full line-field rounded-lg border-slate-300 bg-white focus:ring-1 focus:ring-blue-500 shadow-sm" data-field="commission_rate" min="0" max="0.5" step="0.005" value="${l.commission_rate}">
        </td>

        <!-- Costo Final Unitario COP -->
        <td class="py-2.5 px-2 text-right font-mono font-extrabold bg-indigo-50/50 text-indigo-950 border-x border-indigo-200 whitespace-nowrap" style="width:145px">
          ${(l.unit_final_cost_cop || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>

        <!-- Margen % -->
        <td class="py-2.5 px-2 text-right bg-emerald-50/30" style="width:105px">
          <input type="number" class="form-input text-xs text-right font-mono font-bold py-1.5 px-2 w-full line-field rounded-lg border-emerald-300 bg-white focus:ring-1 focus:ring-emerald-500 shadow-sm" data-field="target_margin" min="0" max="0.95" step="0.01" value="${l.target_margin}">
        </td>

        <!-- Precio Sugerido Venta -->
        <td class="py-2.5 px-2 text-right font-mono font-black text-emerald-900 bg-emerald-50/70 border-x border-emerald-200 whitespace-nowrap" style="width:150px">
          ${(l.suggested_price_cop || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>

        <!-- Margen Unitario $ -->
        <td class="py-2.5 px-2 text-right font-mono text-slate-700 whitespace-nowrap" style="width:130px">
          ${(l.unit_profit_cop || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>

        <!-- Utilidad Total $ -->
        <td class="py-2.5 px-2 text-right font-mono font-bold text-emerald-700 whitespace-nowrap" style="width:145px">
          ${(l.total_profit_cop || 0).toLocaleString()}
        </td>

        <!-- Eliminar fila -->
        <td class="py-2.5 px-2 text-center" style="width:50px">
          <button type="button" class="text-rose-500 hover:text-rose-700 border-0 bg-transparent cursor-pointer p-1 transition-colors" data-remove-line="${idx}" title="Eliminar fila">
            <i class="fas fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');

    // Renderizar Totales en tfoot
    tfoot.innerHTML = `
      <tr>
        <td colspan="2" class="py-2.5 px-3 whitespace-nowrap" style="width:265px">TOTALES</td>
        <td class="py-2.5 px-2 text-right font-mono whitespace-nowrap" style="width:110px">${data.lines.reduce((s, l) => s + (Number(l.boxes_count) || 0), 0).toLocaleString()}</td>
        <td class="py-2.5 px-2" style="width:100px"></td>
        <td class="py-2.5 px-2 text-right font-mono whitespace-nowrap" style="width:130px">${data.lines.reduce((s, l) => s + (Number(l.qty_base) || 0), 0).toLocaleString()}</td>
        <td class="py-2.5 px-2" style="width:95px"></td>
        <td class="py-2.5 px-2" style="width:125px"></td>
        <td class="py-2.5 px-2 text-right font-mono whitespace-nowrap" style="width:135px">$ ${calc.totalFobUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="py-2.5 px-2 text-right font-mono bg-blue-50/70 border-x border-blue-200 whitespace-nowrap" style="width:125px">${Math.round(calc.sumDistCostPct * 100)}%</td>
        <td class="py-2.5 px-2 text-right font-mono whitespace-nowrap" style="width:110px">$ ${calc.totalInsuranceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="py-2.5 px-2 text-right font-mono whitespace-nowrap" style="width:125px">$ ${calc.totalFreightUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="py-2.5 px-2 text-right font-mono whitespace-nowrap" style="width:135px">$ ${calc.totalCifUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="py-2.5 px-2" style="width:100px"></td>
        <td class="py-2.5 px-2" style="width:100px"></td>
        <td class="py-2.5 px-2 text-right font-mono whitespace-nowrap" style="width:135px">${calc.totalArancelCop.toLocaleString()}</td>
        <td class="py-2.5 px-2 text-right font-mono whitespace-nowrap" style="width:135px">${calc.totalIvaCop.toLocaleString()}</td>
        <td class="py-2.5 px-2 text-right font-mono bg-amber-50/80 border-x border-amber-200 whitespace-nowrap" style="width:125px">${Math.round(calc.sumLandedAllocPct * 100)}%</td>
        <td class="py-2.5 px-2 text-right font-mono whitespace-nowrap" style="width:145px">${calc.totalBolsaCostosCop.toLocaleString()}</td>
        <td colspan="7" class="py-2.5 px-2" style="width:880px"></td>
        <td class="py-2.5 px-2 text-right font-mono text-emerald-800 font-extrabold whitespace-nowrap" style="width:145px">${calc.totalProfitCop.toLocaleString()}</td>
        <td class="py-2.5 px-2" style="width:50px"></td>
      </tr>
    `;

    // Bind listeners a los inputs de cada línea
    tbody.querySelectorAll<HTMLInputElement>('.line-field').forEach(input => {
      input.addEventListener('input', (ev: any) => {
        const tr = ev.target.closest('tr');
        const idx = Number(tr?.dataset.lineIndex);
        const field = ev.target.dataset.field;
        if (isNaN(idx) || !field || !data.lines[idx]) return;

        const val = ev.target.value;
        if (field === 'product_type' || field === 'unit_measure') {
          (data.lines[idx] as any)[field] = val;
        } else {
          (data.lines[idx] as any)[field] = parseFloat(val) || 0;
        }
        renderLines();
      });
    });

    tbody.querySelectorAll<HTMLButtonElement>('[data-remove-line]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.removeLine);
        if (data.lines.length <= 1) {
          (window as any).showToast('Debe haber al menos un producto en la preliquidación.', 'warning');
          return;
        }
        data.lines.splice(idx, 1);
        renderLines();
      });
    });
  }

  // Eventos de Parámetros Globales
  const bindGlobalParam = (elementId: string, prop: keyof PreliqData, isNumber: boolean = true) => {
    const el = overlay.querySelector(`#${elementId}`) as HTMLInputElement;
    if (!el) return;
    el.addEventListener('input', () => {
      if (isNumber) {
        (data as any)[prop] = parseFloat(el.value) || 0;
      } else {
        (data as any)[prop] = el.value;
      }
      renderLines();
    });
  };

  bindGlobalParam('preliq-code', 'code', false);
  bindGlobalParam('preliq-name', 'name', false);
  bindGlobalParam('preliq-status', 'status', false);
  bindGlobalParam('preliq-exchange-rate', 'exchange_rate', true);
  bindGlobalParam('preliq-containers', 'containers_count', true);
  bindGlobalParam('preliq-freight-cont', 'freight_per_container_usd', true);
  bindGlobalParam('preliq-origin-cont', 'origin_costs_per_container_usd', true);
  bindGlobalParam('preliq-itr-cont', 'itr_per_container_cop', true);
  bindGlobalParam('preliq-storage-cont', 'storage_per_container_cop', true);
  bindGlobalParam('preliq-inspection-bl', 'inspection_per_bl_cop', true);
  bindGlobalParam('preliq-agency-bl', 'customs_agency_per_bl_cop', true);
  bindGlobalParam('preliq-other-local', 'other_local_costs_cop', true);

  // Botón Agregar Fila
  overlay.querySelector('#btn-preliq-add-line')?.addEventListener('click', () => {
    data.lines.push({
      product_type: `Producto ${data.lines.length + 1}`,
      boxes_count: 0,
      conversion_factor: 1,
      unit_measure: 'unidad',
      qty_base: 100,
      fob_unit: 1.0,
      fob_total: 100,
      cost_distribution_pct: 0,
      freight_usd: 0,
      insurance_usd: 0,
      base_cif_usd: 0,
      arancel_rate: 0.1,
      iva_rate: 0.19,
      arancel_usd: 0,
      arancel_cop: 0,
      iva_usd: 0,
      iva_cop: 0,
      landed_allocation_pct: 0,
      landed_total_item_cop: 0,
      unit_initial_cost_cop: 0,
      breakage_rate: data.global_breakage_rate || 0.02,
      breakage_amount_cop: 0,
      commission_rate: data.global_commission_rate || 0.01,
      commission_amount_cop: 0,
      unit_final_cost_cop: 0,
      target_margin: data.global_target_margin || 0.23,
      suggested_price_cop: 0,
      unit_profit_cop: 0,
      total_profit_cop: 0
    });
    renderLines();
  });

  // Botón Sugerir Distribución Proporcional al FOB
  overlay.querySelector('#btn-preliq-suggest-fob')?.addEventListener('click', () => {
    let totFob = 0;
    data.lines.forEach(l => totFob += (l.qty_base * l.fob_unit));
    if (totFob <= 0) {
      (window as any).showToast('Ingrese cantidades y precios FOB primero.', 'warning');
      return;
    }
    data.lines.forEach(l => {
      const lineFob = l.qty_base * l.fob_unit;
      const pct = Math.round((lineFob / totFob) * 1000) / 1000;
      l.cost_distribution_pct = pct;
      l.landed_allocation_pct = pct;
    });
    renderLines();
    (window as any).showToast('Distribución FOB aplicada como base. Puede ajustarla al tanteo.', 'info');
  });

  // Botón Cargar Muestra Excel
  overlay.querySelector('#btn-preliq-load-sample')?.addEventListener('click', () => {
    const sample = getDefaultSamplePreliq();
    data = sample;
    // Sincronizar inputs globales
    (overlay.querySelector('#preliq-code') as HTMLInputElement).value = data.code;
    (overlay.querySelector('#preliq-name') as HTMLInputElement).value = data.name;
    (overlay.querySelector('#preliq-exchange-rate') as HTMLInputElement).value = String(data.exchange_rate);
    (overlay.querySelector('#preliq-containers') as HTMLInputElement).value = String(data.containers_count);
    (overlay.querySelector('#preliq-freight-cont') as HTMLInputElement).value = String(data.freight_per_container_usd);
    (overlay.querySelector('#preliq-origin-cont') as HTMLInputElement).value = String(data.origin_costs_per_container_usd);
    (overlay.querySelector('#preliq-itr-cont') as HTMLInputElement).value = String(data.itr_per_container_cop);
    (overlay.querySelector('#preliq-storage-cont') as HTMLInputElement).value = String(data.storage_per_container_cop);
    (overlay.querySelector('#preliq-inspection-bl') as HTMLInputElement).value = String(data.inspection_per_bl_cop);
    (overlay.querySelector('#preliq-agency-bl') as HTMLInputElement).value = String(data.customs_agency_per_bl_cop);
    (overlay.querySelector('#preliq-other-local') as HTMLInputElement).value = String(data.other_local_costs_cop);
    renderLines();
    (window as any).showToast('Datos de muestra_preliq.xlsx cargados.', 'success');
  });

  // Botón Exportar a Excel
  overlay.querySelector('#btn-preliq-export-excel')?.addEventListener('click', () => {
    exportPreliquidacionToExcel(data);
  });

  // Guardar en PocketBase
  const savePreliq = async () => {
    const btnSave = overlay.querySelector('#btn-preliq-save') as HTMLButtonElement;
    if (btnSave) btnSave.disabled = true;

    try {
      const calc = recalculatePreliqModel(data);

      const payload = {
        code: data.code.trim() || `PRELIQ-${Date.now().toString().slice(-4)}`,
        name: data.name.trim() || 'Simulación de Importación',
        status: data.status || 'borrador',
        currency: data.currency || 'USD',
        exchange_rate: Number(data.exchange_rate) || 3200,
        containers_count: Number(data.containers_count) || 1,
        freight_per_container_usd: Number(data.freight_per_container_usd) || 0,
        origin_costs_per_container_usd: Number(data.origin_costs_per_container_usd) || 0,
        insurance_rate: Number(data.insurance_rate) || 0.003,
        insurance_fixed_usd: Number(data.insurance_fixed_usd) || 0,
        itr_per_container_cop: Number(data.itr_per_container_cop) || 0,
        storage_per_container_cop: Number(data.storage_per_container_cop) || 0,
        inspection_per_bl_cop: Number(data.inspection_per_bl_cop) || 0,
        customs_agency_per_bl_cop: Number(data.customs_agency_per_bl_cop) || 0,
        other_local_costs_cop: Number(data.other_local_costs_cop) || 0,
        global_breakage_rate: Number(data.global_breakage_rate) || 0.02,
        global_commission_rate: Number(data.global_commission_rate) || 0.01,
        notes: data.notes || '',
        summary_cache: calc,
        created: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      let savedId = data.id;
      if (data.id) {
        await pbClient.update('import_simulations', data.id, payload);
      } else {
        const created = await pbClient.create('import_simulations', payload);
        savedId = created.id;
        data.id = savedId;
      }

      // Sincronizar partidas (eliminar previas y recrear para garantizar consistencia)
      if (savedId) {
        try {
          const oldLines = await pbClient.listAll('import_simulation_lines', {
            filter: `simulation_id="${savedId}"`
          });
          for (const ol of oldLines) {
            await pbClient.delete('import_simulation_lines', ol.id);
          }
        } catch (_) {}

        for (let i = 0; i < data.lines.length; i++) {
          const l = data.lines[i];
          await pbClient.create('import_simulation_lines', {
            simulation_id: savedId,
            product_type: l.product_type || 'Ítem',
            boxes_count: l.boxes_count || 0,
            conversion_factor: l.conversion_factor || 1,
            unit_measure: l.unit_measure || 'mt2',
            qty_base: l.qty_base || 0,
            fob_unit: l.fob_unit || 0,
            fob_total: l.fob_total || 0,
            cost_distribution_pct: l.cost_distribution_pct || 0,
            landed_allocation_pct: l.landed_allocation_pct || 0,
            arancel_rate: l.arancel_rate || 0,
            iva_rate: l.iva_rate || 0.19,
            breakage_rate: l.breakage_rate || 0.02,
            commission_rate: l.commission_rate || 0.01,
            target_margin: l.target_margin || 0.23,
            line_order: i + 1
          });
        }
      }

      (window as any).showToast('Preliquidación guardada exitosamente.', 'success');
      overlay.remove();
      if (typeof onDone === 'function') onDone();
    } catch (err: any) {
      (window as any).showToast('Error al guardar: ' + err.message, 'error');
    } finally {
      if (btnSave) btnSave.disabled = false;
    }
  };

  overlay.querySelector('#btn-preliq-save')?.addEventListener('click', savePreliq);
  overlay.querySelector('#btn-preliq-save-bottom')?.addEventListener('click', savePreliq);

  // Cerrar modal
  const closeModal = () => overlay.remove();
  overlay.querySelector('#btn-preliq-close')?.addEventListener('click', closeModal);
  overlay.querySelector('#btn-preliq-cancel')?.addEventListener('click', closeModal);

  // Primer renderizado
  renderLines();
}

/**
 * Exporta la preliquidación a un archivo Excel (.xlsx) estructurado
 * exactamente como la plantilla de referencia muestra_preliq.xlsx.
 */
export function exportPreliquidacionToExcel(data: PreliqData) {
  if (typeof (window as any).XLSX === 'undefined') {
    (window as any).showToast('La librería XLSX no está disponible en este momento.', 'error');
    return;
  }

  const XLSX = (window as any).XLSX;
  const calc = recalculatePreliqModel(data);

  // Encabezados y datos
  const wsData: any[][] = [];

  // Fila 1 y 2: Parámetros globales de Rotura y Comisión
  wsData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Rotura', 'Comision / Mt']);
  wsData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', data.global_breakage_rate, data.global_commission_rate]);
  wsData.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Costos Totales', '', '', '', 'Rentabilidad']);

  // Fila 4: Encabezados de Partidas
  wsData.push([
    'tipo de Producto',
    'Cantidad Cajas',
    'Unidad de medida base',
    'Cantidad (en unidad de medida)',
    'FOB unitario',
    'FOB Total',
    '% de distribucion de costo',
    'SEGURO en USD',
    'FLETE en USD',
    '%ARANCEL',
    'BASE',
    'ARANCEL',
    'IVA',
    'ARANCEL $',
    'IVA $',
    'LIQ $ X ITEM',
    'Costo inicial / Mt',
    'Rotura',
    'Comision venta /mt',
    'Costo final / Mt',
    '% utilidad en venta',
    'Precio sugerido x mt2',
    'Diferencia',
    'Total Utilidad Proyectada'
  ]);

  // Filas de Partidas
  data.lines.forEach(l => {
    wsData.push([
      l.product_type,
      l.boxes_count,
      l.unit_measure,
      l.qty_base,
      l.fob_unit,
      l.fob_total,
      l.cost_distribution_pct,
      l.insurance_usd,
      l.freight_usd,
      l.arancel_rate,
      l.base_cif_usd,
      l.arancel_usd,
      l.iva_usd,
      l.arancel_cop,
      l.iva_cop,
      l.landed_total_item_cop,
      l.unit_initial_cost_cop,
      l.breakage_amount_cop,
      l.commission_amount_cop,
      l.unit_final_cost_cop,
      l.target_margin,
      l.suggested_price_cop,
      l.unit_profit_cop,
      l.total_profit_cop
    ]);
  });

  // Fila de TOTAL
  wsData.push([
    'TOTAL',
    data.lines.reduce((s, l) => s + (l.boxes_count || 0), 0),
    '',
    data.lines.reduce((s, l) => s + (l.qty_base || 0), 0),
    '',
    calc.totalFobUsd,
    calc.sumDistCostPct,
    calc.totalInsuranceUsd,
    calc.totalFreightUsd,
    '',
    calc.totalCifUsd,
    '',
    '',
    calc.totalArancelCop,
    calc.totalIvaCop,
    calc.totalBolsaCostosCop,
    '',
    data.lines.reduce((s, l) => s + (l.breakage_amount_cop || 0), 0),
    data.lines.reduce((s, l) => s + (l.commission_amount_cop || 0), 0),
    data.lines.reduce((s, l) => s + (l.unit_final_cost_cop || 0), 0),
    '',
    '',
    '',
    calc.totalProfitCop
  ]);

  // Filas vacías de separación
  wsData.push([]);
  wsData.push([]);

  // Bloque inferior de Resumen y Bolsa Total
  wsData.push(['TASA COP', data.exchange_rate, 'PRINCIPALES', '', 'TOTAL USD', 'TOTAL COP']);
  wsData.push(['Flete + gastos origen', data.freight_per_container_usd, 'Flete USD', calc.totalFreightUsd, calc.totalFreightUsd, calc.totalFreightUsd * data.exchange_rate]);
  wsData.push(['Gastos Origen', data.origin_costs_per_container_usd, '# Contenedor', data.containers_count, calc.totalOriginUsd, calc.totalOriginCop]);
  wsData.push(['', '', 'Base FOB', calc.totalFobUsd, calc.totalFobUsd, calc.totalFobUsd * data.exchange_rate]);
  wsData.push(['', '', 'Seguro', calc.totalInsuranceUsd, calc.totalInsuranceUsd, calc.totalInsuranceUsd * data.exchange_rate]);
  wsData.push(['', '', 'Base Liquidadora CIF', calc.totalCifUsd, calc.totalCifUsd, calc.totalCifCop + calc.totalOriginCop]);
  wsData.push(['', '', 'ITR']);
  wsData.push(['ITR / Cont', data.itr_per_container_cop, 'Transporte ITR', calc.totalItrCop, '', calc.totalItrCop]);
  wsData.push(['Bodegaje / Cont', data.storage_per_container_cop, 'Bodegaje', calc.totalStorageCop, '', calc.totalStorageCop]);
  wsData.push(['Inspección / BL', data.inspection_per_bl_cop, 'Inspección', calc.totalInspectionCop, '', calc.totalInspectionCop]);
  wsData.push(['Agenciamiento / BL', data.customs_agency_per_bl_cop, 'Agenciamiento', calc.totalAgencyCop, '', calc.totalAgencyCop]);
  wsData.push(['', '', 'IMPUESTOS']);
  wsData.push(['Arancel Total', '', 'Arancel', '', '', calc.totalArancelCop]);
  wsData.push(['IVA Total', '', 'IVA Importación', '', '', calc.totalIvaCop]);
  wsData.push([]);
  wsData.push(['', '', 'TOTAL COSTOS DE IMPORTACION', '', '', calc.totalBolsaCostosCop]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'PRELIQUIDACION');

  const cleanCode = (data.code || 'PRELIQ').replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `${cleanCode}_Preliquidacion.xlsx`);
  (window as any).showToast('Archivo Excel descargado exitosamente.', 'success');
}

// Helpers expuestos en window para llamadas desde la tabla o eventos
(window as any).openPreliqById = function(simId: string) {
  openPreliquidacionModal(simId, null, () => {
    const tabPreliq = document.getElementById('imp-tab-content');
    if (tabPreliq) renderPreliquidaciones(tabPreliq);
  });
};

(window as any).exportPreliqById = async function(simId: string) {
  try {
    const record = await pbClient.get('import_simulations', simId);
    const linesRes = await pbClient.listAll('import_simulation_lines', {
      filter: `simulation_id="${simId}"`,
      sort: 'line_order'
    });

    const data: PreliqData = {
      id: record.id,
      code: record.code,
      name: record.name,
      status: record.status,
      currency: record.currency || 'USD',
      exchange_rate: record.exchange_rate || 3200,
      containers_count: record.containers_count || 1,
      freight_per_container_usd: record.freight_per_container_usd || 0,
      origin_costs_per_container_usd: record.origin_costs_per_container_usd || 0,
      insurance_rate: record.insurance_rate || 0.003,
      insurance_fixed_usd: record.insurance_fixed_usd || 0,
      itr_per_container_cop: record.itr_per_container_cop || 0,
      storage_per_container_cop: record.storage_per_container_cop || 0,
      inspection_per_bl_cop: record.inspection_per_bl_cop || 0,
      customs_agency_per_bl_cop: record.customs_agency_per_bl_cop || 0,
      other_local_costs_cop: record.other_local_costs_cop || 0,
      global_breakage_rate: record.global_breakage_rate || 0.02,
      global_commission_rate: record.global_commission_rate || 0.01,
      global_target_margin: 0.23,
      notes: record.notes || '',
      lines: linesRes.map((l: any) => ({
        id: l.id,
        product_type: l.product_type || '',
        boxes_count: l.boxes_count || 0,
        conversion_factor: l.conversion_factor || 1,
        unit_measure: l.unit_measure || 'mt2',
        qty_base: l.qty_base || 0,
        fob_unit: l.fob_unit || 0,
        fob_total: l.fob_total || 0,
        cost_distribution_pct: l.cost_distribution_pct || 0,
        freight_usd: 0,
        insurance_usd: 0,
        base_cif_usd: 0,
        arancel_rate: l.arancel_rate || 0,
        iva_rate: l.iva_rate || 0.19,
        arancel_usd: 0,
        arancel_cop: 0,
        iva_usd: 0,
        iva_cop: 0,
        landed_allocation_pct: l.landed_allocation_pct || 0,
        landed_total_item_cop: 0,
        unit_initial_cost_cop: 0,
        breakage_rate: l.breakage_rate || 0.02,
        breakage_amount_cop: 0,
        commission_rate: l.commission_rate || 0.01,
        commission_amount_cop: 0,
        unit_final_cost_cop: 0,
        target_margin: l.target_margin || 0.23,
        suggested_price_cop: 0,
        unit_profit_cop: 0,
        total_profit_cop: 0
      }))
    };

    exportPreliquidacionToExcel(data);
  } catch (err: any) {
    (window as any).showToast('Error al exportar: ' + err.message, 'error');
  }
};

(window as any).deletePreliqById = async function(simId: string) {
  if (!confirm('¿Está seguro de eliminar esta simulación de preliquidación?')) return;
  try {
    await pbClient.delete('import_simulations', simId);
    (window as any).showToast('Simulación eliminada.', 'info');
    const tabPreliq = document.getElementById('imp-tab-content');
    if (tabPreliq) renderPreliquidaciones(tabPreliq);
  } catch (err: any) {
    (window as any).showToast('Error al eliminar: ' + err.message, 'error');
  }
};

(window as any).renderPreliquidaciones = renderPreliquidaciones;
(window as any).openPreliquidacionModal = openPreliquidacionModal;
