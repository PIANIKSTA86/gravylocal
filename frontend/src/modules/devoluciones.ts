/**
 * GRAVY v2.0 — devoluciones.ts
 * Módulo Centralizado de Gestión de Devoluciones de Mercancías (Ventas & Compras).
 * Proceso integral: Trazabilidad RMA, Inspección física de bodega, Disposición Contable,
 * Afectación Kardex y Cruce de Cartera (CxC / CxP / Saldos a Favor).
 */

'use strict';

interface ReturnStatusDetail {
  label: string;
  badge: string;
}

const RETURN_STATUS: Record<string, ReturnStatusDetail> = {
  draft:     { label: 'Borrador / Solicitud', badge: 'badge-orange' },
  inspected: { label: 'Inspeccionada',        badge: 'badge-blue'   },
  posted:    { label: 'Contabilizada',        badge: 'badge-green'  },
  voided:    { label: 'Anulada',              badge: 'badge-red'    },
};

const RETURN_REASONS: Record<string, string> = {
  CALIDAD_DEFECTO:       'Defecto de Fábrica / No Conforme',
  AVERIA_TRANSPORTE:     'Avería / Daño en Transporte o Flete',
  ERROR_DESPACHO:        'Error en Despacho / Producto Equivocado',
  FECHA_VENCIMIENTO:     'Fecha de Vencimiento Próxima o Cumplida',
  DISCONFORMIDAD_PRECIO: 'Disconformidad Comercial o de Precio',
  GARANTIA:              'Devolución por Garantía Técnica',
  OTRO:                  'Otro Motivo (Ver observaciones)',
};

const SETTLEMENT_MODES: Record<string, string> = {
  CRUCE_DOC_ORIGINAL:  'Abono directo a la Factura Original',
  NUEVO_DOC_NC:        'Generar nuevo Comprobante / Nota Crédito',
  SALDO_A_FAVOR:       'Saldo a Favor / Anticipo (Reutilizable)',
  REEMBOLSO_INMEDIATO: 'Reembolso Monetario (Caja / Banco)',
};

const RETURNS_CONFIG_KEY = 'returns_settings_v1';

function defaultReturnsConfig() {
  return {
    operational: {
      require_warehouse_inspection: false, // si false, permite contabilizar en un solo paso
      default_settlement_mode: 'CRUCE_DOC_ORIGINAL',
      default_loss_warehouse_id: '',
    },
    accounting: {
      refund_sale_code: '417505',
      iva_sale_code: '240805',
      cxc_code: '130505',
      advance_customer_code: '280505',
      cogs_code: '613505',
      inventory_code: '143505',
      loss_code: '531520',
      refund_purchase_code: '622505',
      iva_purchase_code: '240810',
      cxp_code: '220505',
      advance_supplier_code: '133005',
      cash_code: '110505',
    }
  };
}

async function getReturnsConfig() {
  try {
    const raw = await (window as any).API.getSetting(RETURNS_CONFIG_KEY);
    if (!raw) return defaultReturnsConfig();
    const parsed = JSON.parse(raw);
    return {
      operational: { ...defaultReturnsConfig().operational, ...(parsed.operational || {}) },
      accounting:  { ...defaultReturnsConfig().accounting,  ...(parsed.accounting || {}) }
    };
  } catch (_) {
    return defaultReturnsConfig();
  }
}

async function saveReturnsConfig(cfg: any) {
  await (window as any).API.setSetting(RETURNS_CONFIG_KEY, JSON.stringify(cfg));
  await (window as any).API.logAudit('CONFIG', 'ReturnsConfig', null, 'Parámetros de devoluciones actualizados.');
  return cfg;
}

// ────────────────────────────────────────────────────────────
// VISTA PRINCIPAL DEL MÓDULO
// ────────────────────────────────────────────────────
export async function renderDevoluciones(container?: HTMLElement) {
  const target = container || (document.getElementById('content-area') as HTMLElement);
  if (!target) return;

  target.innerHTML = `
    <div class="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in" style="font-family: inherit;">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shadow-sm">
              <i class="fas fa-arrow-right-arrow-left"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Gestión de Devoluciones</h1>
              <p class="text-xs text-gray-500 font-medium mt-0.5">Control unificado de Devoluciones en Ventas (Clientes) y Compras (Proveedores), Inspección física y Cruces.</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-outline btn-sm text-gray-600 hover:text-purple-700 border-gray-300" onclick="window.openReturnsSettingsModal()" title="Configuración de cuentas y políticas">
            <i class="fas fa-sliders mr-1.5"></i> Parámetros
          </button>
          <button class="btn btn-outline btn-sm text-purple-700 border-purple-300 bg-purple-50/50 hover:bg-purple-100" onclick="window.reloadTab('devoluciones')" title="Actualizar datos">
            <i class="fas fa-rotate mr-1.5"></i> Refrescar
          </button>
          <div class="relative inline-block text-left">
            <button class="btn btn-primary btn-sm flex items-center gap-2 shadow-sm font-semibold" onclick="window.openNewReturnModal('VENTA')">
              <i class="fas fa-plus"></i> Nueva Devolución
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Bar -->
      <div id="ret-kpi-bar" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl border border-purple-100 bg-purple-50/40 animate-pulse">
          <span class="text-xs text-purple-700 font-medium">Cargando indicadores...</span>
        </div>
      </div>

      <!-- Control Bar (Tabs & Filters) -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <!-- Segmented Pills -->
          <div class="inline-flex p-1 bg-gray-100 rounded-xl text-xs font-semibold select-none" id="ret-type-tabs">
            <button class="px-3.5 py-1.5 rounded-lg transition-all ret-tab-btn active bg-white shadow-sm text-purple-900" data-type="ALL" onclick="window.setReturnsTabFilter('ALL', this)">
              Todas
            </button>
            <button class="px-3.5 py-1.5 rounded-lg transition-all ret-tab-btn text-gray-600 hover:text-gray-900" data-type="VENTA" onclick="window.setReturnsTabFilter('VENTA', this)">
              <i class="fas fa-file-invoice-dollar mr-1 text-purple-600"></i> Devoluciones de Clientes (Venta)
            </button>
            <button class="px-3.5 py-1.5 rounded-lg transition-all ret-tab-btn text-gray-600 hover:text-gray-900" data-type="COMPRA" onclick="window.setReturnsTabFilter('COMPRA', this)">
              <i class="fas fa-cart-shopping mr-1 text-blue-600"></i> Devoluciones a Proveedor (Compra)
            </button>
          </div>

          <!-- Date Filters -->
          <div class="flex items-center gap-2 text-xs">
            <span class="text-gray-500 font-medium">Período:</span>
            <input type="date" id="ret-filter-from" class="form-input text-xs py-1 px-2.5 rounded-lg border-gray-300 w-32" onchange="window.reloadReturnsTable()">
            <span class="text-gray-400">—</span>
            <input type="date" id="ret-filter-to" class="form-input text-xs py-1 px-2.5 rounded-lg border-gray-300 w-32" onchange="window.reloadReturnsTable()">
          </div>
        </div>

        <!-- Sub Filters -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <div class="relative">
            <i class="fas fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-xs"></i>
            <input type="text" id="ret-filter-search" placeholder="Buscar por número, tercero o motivo..." class="form-input pl-8 text-xs py-1.5 w-full rounded-lg border-gray-300" oninput="window.filterReturnsListLocal()">
          </div>
          <div>
            <select id="ret-filter-status" class="form-input text-xs py-1.5 w-full rounded-lg border-gray-300" onchange="window.filterReturnsListLocal()">
              <option value="">Todos los Estados</option>
              <option value="draft">Borrador / Solicitud</option>
              <option value="inspected">Inspeccionada en Bodega</option>
              <option value="posted">Contabilizada / Liquidada</option>
              <option value="voided">Anulada</option>
            </select>
          </div>
          <div>
            <select id="ret-filter-reason" class="form-input text-xs py-1.5 w-full rounded-lg border-gray-300" onchange="window.filterReturnsListLocal()">
              <option value="">Todos los Motivos</option>
              <option value="CALIDAD_DEFECTO">Defecto de Fábrica</option>
              <option value="AVERIA_TRANSPORTE">Avería en Transporte</option>
              <option value="ERROR_DESPACHO">Error en Despacho</option>
              <option value="FECHA_VENCIMIENTO">Vencimiento</option>
              <option value="DISCONFORMIDAD_PRECIO">Disconformidad Comercial</option>
              <option value="GARANTIA">Garantía</option>
              <option value="OTRO">Otro Motivo</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs" id="ret-main-table">
            <thead>
              <tr class="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th class="py-3 px-4">Número</th>
                <th class="py-3 px-3">Fecha</th>
                <th class="py-3 px-3">Tipo</th>
                <th class="py-3 px-4">Tercero (Cliente / Proveedor)</th>
                <th class="py-3 px-3">Doc. Origen</th>
                <th class="py-3 px-3 text-right">Subtotal</th>
                <th class="py-3 px-3 text-right">IVA</th>
                <th class="py-3 px-4 text-right">Total Devuelto</th>
                <th class="py-3 px-3">Estado</th>
                <th class="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="ret-table-body" class="divide-y divide-gray-100">
              <tr>
                <td colspan="10" class="py-12 text-center text-gray-400">
                  <i class="fas fa-spinner fa-spin mr-2 text-purple-600 text-base"></i> Cargando devoluciones...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Inicializar fechas por defecto (desde inicio de año para abarcar notas crédito históricas)
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const firstDay = `${y}-01-01`;
  const todayStr = `${y}-${m}-${d}`;

  const fromEl = document.getElementById('ret-filter-from') as HTMLInputElement;
  const toEl = document.getElementById('ret-filter-to') as HTMLInputElement;
  if (fromEl) fromEl.value = firstDay;
  if (toEl) toEl.value = todayStr;

  (window as any).__retActiveTypeFilter = 'ALL';
  await window.reloadReturnsTable();
}

// ────────────────────────────────────────────────────────────
// CARGA Y KPI DEVOLUCIONES
// ────────────────────────────────────────────────────────────
(window as any).reloadReturnsTable = async () => {
  const tbody = document.getElementById('ret-table-body');
  if (!tbody) return;

  const from = (document.getElementById('ret-filter-from') as HTMLInputElement)?.value || '';
  const to = (document.getElementById('ret-filter-to') as HTMLInputElement)?.value || '';

  let filter = '';
  if (from && to) {
    filter = `date >= "${from}" && date <= "${to} 23:59:59"`;
  } else if (from) {
    filter = `date >= "${from}"`;
  } else if (to) {
    filter = `date <= "${to} 23:59:59"`;
  }

  try {
    const res = await (window as any).API.getMerchandiseReturns({
      from,
      to,
      filter,
      page: 1,
      perPage: 500,
      sort: '-date,-number'
    });

    const items = res.items || [];
    (window as any).__retLoadedItems = items;

    // Calcular KPIs
    let totalAmt = 0;
    let salesAmt = 0;
    let purAmt = 0;
    let pendingCount = 0;

    items.forEach((item: any) => {
      if (item.status !== 'voided') {
        const val = Number(item.total || 0);
        totalAmt += val;
        if (item.return_type === 'VENTA') salesAmt += val;
        else if (item.return_type === 'COMPRA') purAmt += val;
      }
      if (item.status === 'draft' || item.status === 'inspected') {
        pendingCount++;
      }
    });

    const kpiWrap = document.getElementById('ret-kpi-bar');
    if (kpiWrap) {
      kpiWrap.innerHTML = `
        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-lg">
            <i class="fas fa-coins"></i>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 uppercase">Total Devoluciones</p>
            <p class="text-base font-extrabold text-gray-900">${(window as any).fmt(totalAmt)}</p>
            <span class="text-[10px] text-gray-400">${items.length} documento${items.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center text-lg">
            <i class="fas fa-file-invoice-dollar"></i>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 uppercase">Dev. Clientes (Ventas)</p>
            <p class="text-base font-extrabold text-violet-950">${(window as any).fmt(salesAmt)}</p>
            <span class="text-[10px] text-gray-400">Reclamaciones y NC Facturación</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg">
            <i class="fas fa-cart-shopping"></i>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 uppercase">Dev. Proveedores (Compras)</p>
            <p class="text-base font-extrabold text-blue-950">${(window as any).fmt(purAmt)}</p>
            <span class="text-[10px] text-gray-400">Salidas por no conformidad / NDS</span>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-lg">
            <i class="fas fa-clock-rotate-left"></i>
          </div>
          <div>
            <p class="text-[11px] font-semibold text-gray-500 uppercase">En Trámite / Inspección</p>
            <p class="text-base font-extrabold text-amber-900">${pendingCount} caso${pendingCount === 1 ? '' : 's'}</p>
            <span class="text-[10px] text-amber-700 font-medium">Pendientes de liquidar</span>
          </div>
        </div>
      `;
    }

    window.filterReturnsListLocal();
  } catch (err: any) {
    tbody.innerHTML = `<tr><td colspan="10" class="py-8 text-center text-red-500 font-medium">Error al cargar datos: ${(window as any).esc(err.message)}</td></tr>`;
  }
};

(window as any).setReturnsTabFilter = (type: string, btnEl: HTMLElement) => {
  (window as any).__retActiveTypeFilter = type;
  document.querySelectorAll('.ret-tab-btn').forEach((b: any) => {
    b.classList.remove('active', 'bg-white', 'shadow-sm', 'text-purple-900');
    b.classList.add('text-gray-600');
  });
  btnEl.classList.add('active', 'bg-white', 'shadow-sm', 'text-purple-900');
  btnEl.classList.remove('text-gray-600');
  window.filterReturnsListLocal();
};

(window as any).filterReturnsListLocal = () => {
  const tbody = document.getElementById('ret-table-body');
  if (!tbody) return;

  const typeFilter = (window as any).__retActiveTypeFilter || 'ALL';
  const q = ((document.getElementById('ret-filter-search') as HTMLInputElement)?.value || '').toLowerCase().trim();
  const statusFilter = (document.getElementById('ret-filter-status') as HTMLSelectElement)?.value || '';
  const reasonFilter = (document.getElementById('ret-filter-reason') as HTMLSelectElement)?.value || '';

  const items: any[] = (window as any).__retLoadedItems || [];

  const filtered = items.filter(it => {
    if (typeFilter !== 'ALL' && it.return_type !== typeFilter) return false;
    if (statusFilter && it.status !== statusFilter) return false;
    if (reasonFilter && it.reason_code !== reasonFilter) return false;
    if (q) {
      const num = String(it.number || '').toLowerCase();
      const third = String(it.expand?.third_party_id?.name || '').toLowerCase();
      const doc = String(it.expand?.invoice_id?.number || it.expand?.purchase_invoice_id?.number || '').toLowerCase();
      const notes = String(it.reason_notes || '').toLowerCase();
      if (!num.includes(q) && !third.includes(q) && !doc.includes(q) && !notes.includes(q)) return false;
    }
    return true;
  });

  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="py-12 text-center text-gray-400">
          <i class="fas fa-arrow-right-arrow-left text-2xl mb-2 text-gray-300 block"></i>
          No se encontraron devoluciones con los filtros seleccionados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(ret => {
    const meta = RETURN_STATUS[ret.status] || { label: ret.status, badge: 'badge-gray' };
    const third = ret.expand?.third_party_id;
    const isSale = ret.return_type === 'VENTA';
    const docNum = isSale
      ? (ret.expand?.invoice_id?.number || '—')
      : (ret.expand?.purchase_invoice_id?.number || '—');

    const typeBadge = isSale
      ? `<span class="badge badge-purple text-[10px]"><i class="fas fa-file-invoice mr-1"></i>Venta</span>`
      : `<span class="badge badge-blue text-[10px]"><i class="fas fa-cart-shopping mr-1"></i>Compra</span>`;

    let originBadge = '';
    if (ret.origin_source === 'INVOICE_NC') {
      originBadge = `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-200" title="Generada como Nota Crédito en Facturación"><i class="fas fa-bolt mr-1 text-[8px]"></i>Facturación NC</span>`;
    } else if (ret.origin_source === 'PURCHASE_NC') {
      originBadge = `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200" title="Generada como Nota de Ajuste en Compras"><i class="fas fa-bolt mr-1 text-[8px]"></i>Compras NC</span>`;
    } else {
      originBadge = `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Devolución tramitada en RMA / Bodega"><i class="fas fa-box-open mr-1 text-[8px]"></i>RMA Bodega</span>`;
    }

    const settlementText = SETTLEMENT_MODES[ret.settlement_mode] || ret.settlement_mode;

    return `
      <tr class="hover:bg-purple-50/20 transition-colors">
        <td class="py-3 px-4 font-mono font-bold text-purple-700">
          <div>${(window as any).esc(ret.number)}</div>
          <div class="mt-0.5">${originBadge}</div>
        </td>
        <td class="py-3 px-3 text-gray-600">${(window as any).esc(ret.date)}</td>
        <td class="py-3 px-3">${typeBadge}</td>
        <td class="py-3 px-4 font-medium text-gray-900">
          <div>${third ? (window as any).esc(third.name) : '—'}</div>
          <div class="text-[10px] text-gray-400 font-mono">${third?.nit ? 'NIT/CC: ' + (window as any).esc(third.nit) : ''}</div>
        </td>
        <td class="py-3 px-3 font-mono font-semibold text-gray-700 text-[11px]">${(window as any).esc(docNum)}</td>
        <td class="py-3 px-3 text-right text-gray-700 font-mono">${(window as any).fmt(ret.subtotal || 0)}</td>
        <td class="py-3 px-3 text-right text-gray-500 font-mono">${ret.iva_total ? (window as any).fmt(ret.iva_total) : '—'}</td>
        <td class="py-3 px-4 text-right font-bold text-gray-900 font-mono">${(window as any).fmt(ret.total || 0)}</td>
        <td class="py-3 px-3">
          <div class="flex flex-col gap-0.5">
            <span class="badge ${meta.badge} text-[10px]">${meta.label}</span>
            <span class="text-[9px] text-gray-400 truncate max-w-[120px]" title="${(window as any).esc(settlementText)}">${(window as any).esc(settlementText)}</span>
          </div>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="inline-flex items-center gap-1">
            <button class="btn btn-outline btn-sm px-2 text-gray-600" title="Ver Detalle" onclick="window.viewReturnDetail('${(window as any).esc(ret.id)}')">
              <i class="fas fa-eye"></i>
            </button>
            ${(ret.status === 'draft' || ret.status === 'inspected') ? `
              <button class="btn btn-primary btn-sm px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 border-emerald-600" title="Contabilizar y Liquidar Devolución" onclick="window.postReturnAction('${(window as any).esc(ret.id)}', '${(window as any).esc(ret.number)}')">
                <i class="fas fa-check mr-1"></i> Asentar
              </button>
              <button class="btn btn-danger btn-sm px-2 text-red-600 border-red-200" title="Anular" onclick="window.voidReturnAction('${(window as any).esc(ret.id)}', '${(window as any).esc(ret.number)}')">
                <i class="fas fa-ban"></i>
              </button>
            ` : ''}
            ${ret.status === 'posted' ? `
              ${ret.tx_id ? `<button class="btn btn-outline btn-sm px-2 text-purple-600 border-purple-200" title="Ver Comprobante Contable" onclick="window.seeSalesTxDetail ? window.seeSalesTxDetail('${(window as any).esc(ret.tx_id)}') : null"><i class="fas fa-book-open"></i></button>` : ''}
              ${ret.origin_source === 'MERCHANDISE_RETURN' ? `
                <button class="btn btn-danger btn-sm px-2 text-red-600 border-red-200" title="Anular Devolución" onclick="window.voidReturnAction('${(window as any).esc(ret.id)}', '${(window as any).esc(ret.number)}')">
                  <i class="fas fa-ban"></i>
                </button>
              ` : ''}
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

// ────────────────────────────────────────────────────────────
// ACCIONES: ASENTAR Y ANULAR
// ────────────────────────────────────────────────────
(window as any).postReturnAction = function(returnId: string, returnNum: string) {
  (window as any).confirmDialog(
    'Contabilizar y Asentar Devolución',
    `¿Confirmas la liquidación y contabilización de la devolución <strong>${returnNum}</strong>?<br><br>
     Esta operación:<br>
     • Publicará el asiento contable de diario con reversión de ingresos/costos/impuestos.<br>
     • Actualizará Kardex generando el movimiento de inventario correspondiente.<br>
     • Aplicará el saldo contra la cartera o generará saldo a favor según la parametrización.`,
    async () => {
      try {
        (window as any).showToast('Procesando devolución...', 'info');
        await (window as any).API.postMerchandiseReturn(returnId);
        (window as any).showToast(`Devolución ${returnNum} contabilizada exitosamente`, 'success');
        await window.reloadReturnsTable();
      } catch (err: any) {
        (window as any).showToast(err.message || 'Error al contabilizar devolución', 'error');
      }
    }
  );
};

(window as any).voidReturnAction = function(returnId: string, returnNum: string) {
  (window as any).openSalesReasonDialog
    ? (window as any).openSalesReasonDialog(
        {
          title: 'Anular Devolución de Mercancía',
          messageHtml: `<p>Se anulará definitivamente la devolución <strong>${(window as any).esc(returnNum)}</strong>.</p>
                        <p class="mt-2 text-xs text-gray-500">• Se revertirá el comprobante contable vinculado si estaba asentado.<br>• Se revertirá el movimiento Kardex reingresado o egresado.</p>`,
          actionLabel: 'Anular Devolución',
          actionClass: 'btn-danger',
          placeholder: 'Escribe el motivo legal o justificación de anulación...'
        },
        async (reason: string) => {
          await (window as any).API.voidMerchandiseReturn(returnId, reason);
          (window as any).showToast(`Devolución ${returnNum} anulada correctamente`, 'success');
          await window.reloadReturnsTable();
        }
      )
    : (window as any).confirmDialog(
        'Anular Devolución',
        `¿Seguro de anular la devolución <strong>${returnNum}</strong>?`,
        async () => {
          await (window as any).API.voidMerchandiseReturn(returnId, 'Anulación directa');
          (window as any).showToast(`Devolución ${returnNum} anulada`, 'success');
          await window.reloadReturnsTable();
        }
      );
};

// ────────────────────────────────────────────────────────────
// MODAL: WIZARD NUEVA DEVOLUCIÓN (3 PASOS)
// ────────────────────────────────────────────────────
(window as any).openNewReturnModal = async (initialType: 'VENTA' | 'COMPRA' = 'VENTA', preselectedInvoiceId?: string) => {
  const cfg = await getReturnsConfig();
  const warehouses = await (window as any).API.getWarehouses(true).catch(() => []);

  const whOptions = warehouses.map((w: any) => `<option value="${w.id}">${(window as any).esc(w.name)}</option>`).join('');

  const html = `
    <div class="space-y-4 text-xs text-gray-700" id="ret-wizard-container">
      <!-- Selector Tipo de Devolución -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label font-bold text-gray-800">Tipo de Devolución <span class="text-red-500">*</span></label>
          <select id="rw-type" class="form-input text-xs" onchange="window.onRwTypeChange(this.value)">
            <option value="VENTA"${initialType === 'VENTA' ? ' selected' : ''}>Devolución de Cliente (Venta)</option>
            <option value="COMPRA"${initialType === 'COMPRA' ? ' selected' : ''}>Devolución a Proveedor (Compra)</option>
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-bold text-gray-800">Fecha del Documento</label>
          <input type="date" id="rw-date" class="form-input text-xs" value="${(window as any).todayStr ? (window as any).todayStr() : new Date().toISOString().slice(0, 10)}">
        </div>
      </div>

      <!-- Buscador de Factura Origen -->
      <div class="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
        <div class="flex items-center justify-between">
          <label class="form-label font-bold text-purple-950 mb-0">
            <i class="fas fa-file-invoice mr-1 text-purple-600"></i> Factura de Origen <span class="text-red-500">*</span>
          </label>
          <span class="text-[10px] text-purple-700 font-medium" id="rw-invoice-status-hint">Digita el número o busca el tercero</span>
        </div>
        <div class="relative">
          <input type="text" id="rw-invoice-search" class="form-input text-xs pl-8 w-full" placeholder="Buscar factura (ej: FV-0012, Fac 4500, o nombre)..." autocomplete="off" oninput="window.debounceRwSearchInvoice(this.value)">
          <i class="fas fa-magnifying-glass absolute left-3 top-2.5 text-gray-400 text-xs"></i>
          <input type="hidden" id="rw-selected-invoice-id" value="">
          <div id="rw-invoice-dropdown" class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto hidden"></div>
        </div>
        <div id="rw-selected-invoice-summary" class="hidden p-2.5 bg-white rounded-lg border border-purple-200 text-xs flex justify-between items-center">
          <div>
            <span class="font-bold text-purple-900" id="rw-summary-num"></span> · <span class="text-gray-600" id="rw-summary-third"></span>
            <div class="text-[10px] text-gray-400" id="rw-summary-date"></div>
          </div>
          <button type="button" class="btn btn-outline btn-sm text-red-500 text-[10px]" onclick="window.clearRwSelectedInvoice()">Cambiar</button>
        </div>
      </div>

      <!-- Tabla de Inspección de Líneas -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="form-label font-bold text-gray-800 mb-0">Mercancías a Devolver e Inspección Física</label>
          <span class="text-[10px] text-gray-400">Indica la cantidad real devuelta y su condición</span>
        </div>
        <div class="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
          <table class="w-full text-left text-[11px] border-collapse" id="rw-lines-table">
            <thead class="bg-gray-50 text-gray-600 uppercase text-[10px] sticky top-0 bg-gray-50">
              <tr class="border-b border-gray-200">
                <th class="p-2">Producto</th>
                <th class="p-2 text-right">Facturado</th>
                <th class="p-2 text-right">Devuelto Previo</th>
                <th class="p-2 text-right text-purple-700 font-bold">A Devolver</th>
                <th class="p-2">Condición Física</th>
                <th class="p-2 text-right">Precio Unit.</th>
                <th class="p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody id="rw-lines-body" class="divide-y divide-gray-100">
              <tr>
                <td colspan="7" class="p-6 text-center text-gray-400">
                  Selecciona una factura de origen para cargar sus productos.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Parámetros de Liquidación y Bodega -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
        <div class="form-group mb-0">
          <label class="form-label font-semibold text-gray-700">Bodega Destino / Origen <span class="text-red-500">*</span></label>
          <select id="rw-warehouse" class="form-input text-xs">${whOptions}</select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-semibold text-gray-700">Motivo de Devolución <span class="text-red-500">*</span></label>
          <select id="rw-reason-code" class="form-input text-xs">
            <option value="CALIDAD_DEFECTO">Defecto de Fábrica</option>
            <option value="AVERIA_TRANSPORTE">Avería en Transporte</option>
            <option value="ERROR_DESPACHO">Error en Despacho</option>
            <option value="FECHA_VENCIMIENTO">Fecha de Vencimiento</option>
            <option value="DISCONFORMIDAD_PRECIO">Disconformidad Comercial</option>
            <option value="GARANTIA">Garantía Técnica</option>
            <option value="OTRO">Otro Motivo</option>
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-semibold text-gray-700">Disposición Financiera / Cruce</label>
          <select id="rw-settlement-mode" class="form-input text-xs">
            <option value="CRUCE_DOC_ORIGINAL"${cfg.operational?.default_settlement_mode === 'CRUCE_DOC_ORIGINAL' ? ' selected' : ''}>Abono a Factura Original</option>
            <option value="NUEVO_DOC_NC"${cfg.operational?.default_settlement_mode === 'NUEVO_DOC_NC' ? ' selected' : ''}>Nuevo Documento NC / Cruce</option>
            <option value="SALDO_A_FAVOR"${cfg.operational?.default_settlement_mode === 'SALDO_A_FAVOR' ? ' selected' : ''}>Generar Saldo a Favor (Anticipo)</option>
            <option value="REEMBOLSO_INMEDIATO"${cfg.operational?.default_settlement_mode === 'REEMBOLSO_INMEDIATO' ? ' selected' : ''}>Reembolso en Efectivo / Banco</option>
          </select>
        </div>
      </div>

      <!-- Observaciones y Totales -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group mb-0">
          <label class="form-label font-semibold text-gray-700">Observaciones / Causa Raíz</label>
          <textarea id="rw-notes" class="form-input text-xs" rows="2" placeholder="Describe detalladamente el estado de la mercancía devuelta..."></textarea>
        </div>
        <div class="p-3 bg-purple-50/40 rounded-xl border border-purple-200 text-xs space-y-1">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal Devolución:</span>
            <span class="font-mono font-semibold" id="rw-total-sub">$ 0</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>IVA Reversado:</span>
            <span class="font-mono font-semibold" id="rw-total-iva">$ 0</span>
          </div>
          <div class="flex justify-between text-sm font-bold text-purple-950 pt-1 border-t border-purple-200">
            <span>Total Liquidado:</span>
            <span class="font-mono" id="rw-total-net">$ 0</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="window.closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-return-draft" onclick="window.submitNewReturnModal(false)">Guardar Borrador</button>
    <button class="btn btn-primary bg-emerald-600 hover:bg-emerald-700 border-emerald-600" id="btn-save-return-post" onclick="window.submitNewReturnModal(true)">
      <i class="fas fa-check-double mr-1"></i> Asentar y Contabilizar
    </button>
  `;

  (window as any).openModal('Asistente de Registro de Devolución', html, footer, false);

  (window as any).__rwLinesData = [];
  (window as any).__rwCurrentInvoice = null;

  if (preselectedInvoiceId) {
    window.selectRwInvoice(preselectedInvoiceId);
  }
};

(window as any).onRwTypeChange = () => {
  window.clearRwSelectedInvoice();
};

let _rwDebounceTimer: any = null;
(window as any).debounceRwSearchInvoice = (val: string) => {
  clearTimeout(_rwDebounceTimer);
  _rwDebounceTimer = setTimeout(() => {
    window.searchRwInvoices(val);
  }, 250);
};

(window as any).searchRwInvoices = async (query: string) => {
  const dd = document.getElementById('rw-invoice-dropdown');
  if (!dd) return;
  const q = String(query || '').trim();
  if (q.length < 2) {
    dd.style.display = 'none';
    return;
  }

  const type = (document.getElementById('rw-type') as HTMLSelectElement)?.value || 'VENTA';
  dd.innerHTML = '<div class="p-3 text-center text-gray-400 text-xs"><i class="fas fa-spinner fa-spin mr-1"></i> Buscando facturas...</div>';
  dd.style.display = 'block';

  try {
    let items: any[] = [];
    if (type === 'VENTA') {
      const res = await (window as any).pb.list('invoices', {
        filter: `status="posted" && (number ~ "${(window as any).pb.escapeFilterValue(q)}" || customer_id.name ~ "${(window as any).pb.escapeFilterValue(q)}")`,
        sort: '-date,-number',
        perPage: 10,
        expand: 'customer_id'
      });
      items = res.items || [];
    } else {
      const res = await (window as any).pb.list('purchase_invoices', {
        filter: `status="posted" && (number ~ "${(window as any).pb.escapeFilterValue(q)}" || supplier_id.name ~ "${(window as any).pb.escapeFilterValue(q)}")`,
        sort: '-date,-number',
        perPage: 10,
        expand: 'supplier_id'
      });
      items = res.items || [];
    }

    if (!items.length) {
      dd.innerHTML = '<div class="p-3 text-center text-gray-400 text-xs">No se encontraron facturas contabilizadas con ese criterio.</div>';
      return;
    }

    dd.innerHTML = items.map(inv => {
      const thirdName = (inv.expand?.customer_id || inv.expand?.supplier_id)?.name || 'Sin tercero';
      return `
        <div class="p-2.5 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-none flex justify-between items-center transition-colors" onclick="window.selectRwInvoice('${inv.id}')">
          <div>
            <div class="font-bold text-gray-900 font-mono text-xs">${(window as any).esc(inv.number)}</div>
            <div class="text-[11px] text-gray-500">${(window as any).esc(thirdName)}</div>
          </div>
          <div class="text-right">
            <div class="font-bold text-purple-700 font-mono text-xs">$ ${(window as any).fmt(inv.payable_total ?? inv.total ?? 0)}</div>
            <div class="text-[10px] text-gray-400">${(window as any).esc(inv.date)}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err: any) {
    dd.innerHTML = `<div class="p-3 text-center text-red-500 text-xs">${(window as any).esc(err.message)}</div>`;
  }
};

(window as any).selectRwInvoice = async (invoiceId: string) => {
  const dd = document.getElementById('rw-invoice-dropdown');
  if (dd) dd.style.display = 'none';

  const type = (document.getElementById('rw-type') as HTMLSelectElement)?.value || 'VENTA';
  (document.getElementById('rw-selected-invoice-id') as HTMLInputElement).value = invoiceId;

  try {
    (window as any).showToast('Cargando ítems de la factura...', 'info');
    const data = await (window as any).API.getReturnableInvoiceLines(type, invoiceId);
    (window as any).__rwCurrentInvoice = data.invoice;
    (window as any).__rwLinesData = data.lines;

    // Actualizar caja de resumen
    const sumBox = document.getElementById('rw-selected-invoice-summary');
    const searchInp = document.getElementById('rw-invoice-search');
    if (sumBox && searchInp) {
      const thirdName = (data.invoice.expand?.customer_id || data.invoice.expand?.supplier_id)?.name || '';
      document.getElementById('rw-summary-num')!.textContent = data.invoice.number;
      document.getElementById('rw-summary-third')!.textContent = thirdName;
      document.getElementById('rw-summary-date')!.textContent = `Fecha: ${data.invoice.date} · Total: $ ${(window as any).fmt(data.invoice.payable_total ?? data.invoice.total ?? 0)}`;
      sumBox.classList.remove('hidden');
      searchInp.classList.add('hidden');
    }

    // Setear bodega si existe
    if (data.invoice.warehouse_id) {
      const whSel = document.getElementById('rw-warehouse') as HTMLSelectElement;
      if (whSel) whSel.value = data.invoice.warehouse_id;
    }

    // Renderizar líneas
    const tbody = document.getElementById('rw-lines-body');
    if (tbody) {
      if (!data.lines.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-gray-400">Esta factura no tiene líneas o ya fue devuelta en su totalidad.</td></tr>';
        return;
      }

      tbody.innerHTML = data.lines.map((ln: any, idx: number) => {
        const prodName = ln.description || ln.expand?.product_id?.name || ln._name || 'Producto';
        const price = Number(ln.unit_price || 0);
        const maxQty = Number(ln.qty_available_to_return || 0);

        return `
          <tr id="rw-row-${idx}" class="hover:bg-gray-50/50">
            <td class="p-2 font-medium text-gray-900">${(window as any).esc(prodName)}</td>
            <td class="p-2 text-right text-gray-500 font-mono">${(window as any).fmtN(ln.qty)}</td>
            <td class="p-2 text-right text-amber-600 font-mono">${(window as any).fmtN(ln.qty_previously_returned || 0)}</td>
            <td class="p-2 text-right">
              <input type="number" min="0" max="${maxQty}" step="any" class="form-input text-xs py-1 px-1.5 w-20 text-right font-bold text-purple-700 border-purple-300 rounded" id="rw-qty-${idx}" value="0" oninput="window.recalcRwLine(${idx})">
            </td>
            <td class="p-2">
              <select class="form-input text-[11px] py-0.5 px-1 rounded" id="rw-cond-${idx}" onchange="window.recalcRwTotals()">
                <option value="BUENO_REINGRESABLE">Bueno (Reingresa)</option>
                <option value="AVERIA_PERDIDA">Avería / Pérdida (Gasto)</option>
                <option value="REPARACION_GARANTIA">Garantía / Taller</option>
              </select>
            </td>
            <td class="p-2 text-right font-mono text-gray-600">$ ${(window as any).fmt(price)}</td>
            <td class="p-2 text-right font-mono font-bold text-gray-900" id="rw-sub-${idx}">$ 0</td>
          </tr>
        `;
      }).join('');
    }

    window.recalcRwTotals();
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al cargar factura', 'error');
  }
};

(window as any).clearRwSelectedInvoice = () => {
  (document.getElementById('rw-selected-invoice-id') as HTMLInputElement).value = '';
  const searchInp = document.getElementById('rw-invoice-search') as HTMLInputElement;
  const sumBox = document.getElementById('rw-selected-invoice-summary');
  if (searchInp) { searchInp.value = ''; searchInp.classList.remove('hidden'); }
  if (sumBox) sumBox.classList.add('hidden');
  const tbody = document.getElementById('rw-lines-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-gray-400">Selecciona una factura de origen para cargar sus productos.</td></tr>';
  (window as any).__rwLinesData = [];
  (window as any).__rwCurrentInvoice = null;
  window.recalcRwTotals();
};

(window as any).recalcRwLine = (idx: number) => {
  const line = (window as any).__rwLinesData[idx];
  if (!line) return;
  const qtyInp = document.getElementById(`rw-qty-${idx}`) as HTMLInputElement;
  const maxQty = Number(line.qty_available_to_return || 0);
  let val = parseFloat(qtyInp?.value || '0') || 0;
  if (val > maxQty) {
    val = maxQty;
    qtyInp.value = String(val);
    (window as any).showToast(`Cantidad máxima a devolver para esta línea: ${maxQty}`, 'warning');
  }
  const price = Number(line.unit_price || 0);
  const sub = val * price;
  const subEl = document.getElementById(`rw-sub-${idx}`);
  if (subEl) subEl.textContent = `$ ${(window as any).fmt(sub)}`;
  window.recalcRwTotals();
};

(window as any).recalcRwTotals = () => {
  const lines: any[] = (window as any).__rwLinesData || [];
  let subtotal = 0;
  let ivaTotal = 0;

  lines.forEach((l, idx) => {
    const qtyInp = document.getElementById(`rw-qty-${idx}`) as HTMLInputElement;
    const qty = parseFloat(qtyInp?.value || '0') || 0;
    if (qty > 0) {
      const price = Number(l.unit_price || 0);
      const rate = Number(l.iva_rate || 0);
      const sub = qty * price;
      const iva = sub * (rate / 100);
      subtotal += sub;
      ivaTotal += iva;
    }
  });

  const net = subtotal + ivaTotal;
  const subEl = document.getElementById('rw-total-sub');
  const ivaEl = document.getElementById('rw-total-iva');
  const netEl = document.getElementById('rw-total-net');
  if (subEl) subEl.textContent = `$ ${(window as any).fmt(subtotal)}`;
  if (ivaEl) ivaEl.textContent = `$ ${(window as any).fmt(ivaTotal)}`;
  if (netEl) netEl.textContent = `$ ${(window as any).fmt(net)}`;
};

(window as any).submitNewReturnModal = async (isPostImmediate: boolean) => {
  const inv = (window as any).__rwCurrentInvoice;
  if (!inv) {
    return (window as any).showToast('Debes seleccionar una factura de origen válida.', 'warning');
  }
  const type = (document.getElementById('rw-type') as HTMLSelectElement)?.value || 'VENTA';
  const date = (document.getElementById('rw-date') as HTMLInputElement)?.value || '';
  const whId = (document.getElementById('rw-warehouse') as HTMLSelectElement)?.value || '';
  const reasonCode = (document.getElementById('rw-reason-code') as HTMLSelectElement)?.value || 'OTRO';
  const settlementMode = (document.getElementById('rw-settlement-mode') as HTMLSelectElement)?.value || 'CRUCE_DOC_ORIGINAL';
  const notes = (document.getElementById('rw-notes') as HTMLTextAreaElement)?.value || '';

  if (!whId) return (window as any).showToast('Selecciona la bodega.', 'warning');

  // Recolectar líneas con cantidad > 0
  const rawLines: any[] = (window as any).__rwLinesData || [];
  const linesToSubmit: any[] = [];
  let subtotalSum = 0;
  let ivaSum = 0;

  rawLines.forEach((l, idx) => {
    const qtyInp = document.getElementById(`rw-qty-${idx}`) as HTMLInputElement;
    const condSel = document.getElementById(`rw-cond-${idx}`) as HTMLSelectElement;
    const qty = parseFloat(qtyInp?.value || '0') || 0;
    if (qty > 0) {
      const price = Number(l.unit_price || 0);
      const rate = Number(l.iva_rate || 0);
      const sub = qty * price;
      const iva = sub * (rate / 100);
      subtotalSum += sub;
      ivaSum += iva;

      linesToSubmit.push({
        product_id: l.product_id || null,
        account_id: l.account_id || null,
        qty_invoiced: Number(l.qty || 0),
        qty_previously_returned: Number(l.qty_previously_returned || 0),
        qty_returned: qty,
        unit_price: price,
        unit_cost: Number(l.unit_cost || l.cost_price || 0),
        iva_rate: rate,
        iva_amount: iva,
        subtotal: sub,
        total: sub + iva,
        physical_condition: condSel?.value || 'BUENO_REINGRESABLE',
        target_warehouse_id: whId,
      });
    }
  });

  if (!linesToSubmit.length) {
    return (window as any).showToast('Debes ingresar una cantidad a devolver en al menos un producto.', 'warning');
  }

  const thirdPartyId = (type === 'VENTA') ? inv.customer_id : inv.supplier_id;

  const returnPayload: any = {
    return_type: type,
    date,
    status: 'draft',
    third_party_id: thirdPartyId,
    warehouse_id: whId,
    reason_code: reasonCode,
    reason_notes: notes,
    subtotal: subtotalSum,
    iva_total: ivaSum,
    total: subtotalSum + ivaSum,
    settlement_mode: settlementMode,
  };

  if (type === 'VENTA') {
    returnPayload.invoice_id = inv.id;
  } else {
    returnPayload.purchase_invoice_id = inv.id;
  }

  const btnDraft = document.getElementById('btn-save-return-draft') as HTMLButtonElement;
  const btnPost = document.getElementById('btn-save-return-post') as HTMLButtonElement;
  if (btnDraft) btnDraft.disabled = true;
  if (btnPost) btnPost.disabled = true;

  try {
    (window as any).showToast('Guardando devolución de mercancía...', 'info');
    const created = await (window as any).API.createMerchandiseReturn(returnPayload, linesToSubmit);

    if (isPostImmediate) {
      (window as any).showToast('Liquidando y contabilizando...', 'info');
      await (window as any).API.postMerchandiseReturn(created.id);
      (window as any).showToast(`Devolución ${created.number} creada y contabilizada con éxito`, 'success');
    } else {
      (window as any).showToast(`Devolución ${created.number} guardada en borrador`, 'success');
    }

    (window as any).closeModal();
    await window.reloadReturnsTable();
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al registrar devolución', 'error');
    if (btnDraft) btnDraft.disabled = false;
    if (btnPost) btnPost.disabled = false;
  }
};

// ────────────────────────────────────────────────────────────
// MODAL: VER DETALLE DE LA DEVOLUCIÓN
// ────────────────────────────────────────────────────
(window as any).viewReturnDetail = async (id: string) => {
  try {
    const ret = await (window as any).API.getMerchandiseReturn(id);
    const meta = RETURN_STATUS[ret.status] || { label: ret.status, badge: 'badge-gray' };
    const thirdName = ret.expand?.third_party_id?.name || '—';
    const docNum = (ret.expand?.invoice_id?.number || ret.expand?.purchase_invoice_id?.number || '—');

    const linesHtml = (ret.lines || []).map((l: any, i: number) => {
      const prodName = l.expand?.product_id?.name || 'Producto';
      const condBadge = l.physical_condition === 'BUENO_REINGRESABLE'
        ? '<span class="badge badge-green text-[10px]">Apto para Stock</span>'
        : l.physical_condition === 'AVERIA_PERDIDA'
          ? '<span class="badge badge-red text-[10px]">Avería / Pérdida</span>'
          : '<span class="badge badge-orange text-[10px]">Garantía</span>';

      return `
        <tr>
          <td class="p-2 font-mono">${i + 1}</td>
          <td class="p-2 font-medium text-gray-900">${(window as any).esc(prodName)}</td>
          <td class="p-2 text-right font-mono">${(window as any).fmtN(l.qty_returned)}</td>
          <td class="p-2">${condBadge}</td>
          <td class="p-2 text-right font-mono">${(window as any).fmt(l.unit_price)}</td>
          <td class="p-2 text-right font-mono font-bold text-gray-900">${(window as any).fmt(l.total || l.subtotal || 0)}</td>
        </tr>
      `;
    }).join('');

    let originLabel = 'Módulo Devoluciones (RMA Bodega)';
    if (ret.origin_source === 'INVOICE_NC') originLabel = 'Facturación Electrónica (Nota Crédito)';
    else if (ret.origin_source === 'PURCHASE_NC') originLabel = 'Módulo de Compras (Nota de Ajuste)';

    const html = `
      <div class="space-y-4 text-xs text-gray-700">
        <div class="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-purple-900 font-mono">${(window as any).esc(ret.number)}</h3>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-purple-200 text-purple-800">${originLabel}</span>
            </div>
            <p class="text-[11px] text-purple-700 mt-0.5">Tipo: <strong>${ret.return_type === 'VENTA' ? 'Devolución de Cliente' : 'Devolución a Proveedor'}</strong> · Fecha: ${ret.date}</p>
          </div>
          <span class="badge ${meta.badge} text-xs">${meta.label}</span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
          <div>
            <span class="text-gray-400 block text-[10px]">Tercero:</span>
            <span class="font-bold text-gray-900">${(window as any).esc(thirdName)}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px]">Doc. Origen:</span>
            <span class="font-mono font-bold text-purple-700">${(window as any).esc(docNum)}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px]">Motivo:</span>
            <span class="font-medium text-gray-800">${(window as any).esc(RETURN_REASONS[ret.reason_code] || ret.reason_code)}</span>
          </div>
          <div>
            <span class="text-gray-400 block text-[10px]">Disposición:</span>
            <span class="font-medium text-gray-800">${(window as any).esc(SETTLEMENT_MODES[ret.settlement_mode] || ret.settlement_mode)}</span>
          </div>
        </div>

        ${ret.reason_notes ? `
          <div class="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
            <strong>Observaciones / Detalle DIAN:</strong> ${(window as any).esc(ret.reason_notes)}
          </div>
        ` : ''}

        <div class="border border-gray-200 rounded-xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-100 text-gray-600 font-semibold uppercase text-[10px]">
              <tr>
                <th class="p-2">#</th>
                <th class="p-2">Producto</th>
                <th class="p-2 text-right">Cant. Devuelta</th>
                <th class="p-2">Condición</th>
                <th class="p-2 text-right">Precio Unit.</th>
                <th class="p-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${linesHtml}
            </tbody>
          </table>
        </div>

        <div class="flex justify-end gap-6 p-3 bg-purple-50/40 rounded-xl border border-purple-200 text-xs font-mono">
          <div>Subtotal: <strong>${(window as any).fmt(ret.subtotal || 0)}</strong></div>
          <div>IVA: <strong>${(window as any).fmt(ret.iva_total || 0)}</strong></div>
          <div class="text-sm font-bold text-purple-950">Total: ${(window as any).fmt(ret.total || 0)}</div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="window.closeModal()">Cerrar</button>
      ${ret.tx_id ? `<button class="btn btn-primary" onclick="window.seeSalesTxDetail ? window.seeSalesTxDetail('${ret.tx_id}') : null"><i class="fas fa-book-open mr-1"></i> Comprobante Contable</button>` : ''}
      ${(ret.origin_source === 'INVOICE_NC' && window.viewSalesInvoiceDetail) ? `<button class="btn btn-outline text-purple-700 border-purple-300" onclick="window.viewSalesInvoiceDetail('${ret.id}')"><i class="fas fa-receipt mr-1"></i> Ver Facturación</button>` : ''}
    `;

    (window as any).openModal(`Detalle Devolución — ${ret.number}`, html, footer, false);
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al ver detalle', 'error');
  }
};

// ────────────────────────────────────────────────────────────
// MODAL: CONFIGURACIÓN Y PARÁMETROS GENERALES DEL MÓDULO
// ────────────────────────────────────────────────────
(window as any).openReturnsSettingsModal = async () => {
  const cfg = await getReturnsConfig();
  const accounts = await (window as any).API.getAccounts(true).catch(() => []);
  const warehouses = await (window as any).API.getWarehouses(true).catch(() => []);

  const acctOptions = (selected = '') => {
    return `<option value="">— Sin definir —</option>${accounts.map((a: any) => `<option value="${a.code}"${a.code === selected ? ' selected' : ''}>${a.code} — ${(window as any).esc(a.name)}</option>`).join('')}`;
  };

  const whOptions = (selected = '') => {
    return `<option value="">— Ninguna —</option>${warehouses.map((w: any) => `<option value="${w.id}"${w.id === selected ? ' selected' : ''}>${(window as any).esc(w.name)}</option>`).join('')}`;
  };

  const html = `
    <div class="space-y-4 text-xs text-gray-700">
      <!-- Parámetros Operativos -->
      <div class="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
        <h4 class="font-bold text-gray-900 text-xs flex items-center gap-1.5">
          <i class="fas fa-sliders text-purple-600"></i> Políticas Operativas
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group mb-0">
            <label class="form-label">Modo de Cruce por Defecto</label>
            <select id="cfg-ret-default-mode" class="form-input text-xs">
              <option value="CRUCE_DOC_ORIGINAL"${cfg.operational.default_settlement_mode === 'CRUCE_DOC_ORIGINAL' ? ' selected' : ''}>Abono a Factura Original (Rebaja Cartera)</option>
              <option value="NUEVO_DOC_NC"${cfg.operational.default_settlement_mode === 'NUEVO_DOC_NC' ? ' selected' : ''}>Generar nuevo Comprobante NC</option>
              <option value="SALDO_A_FAVOR"${cfg.operational.default_settlement_mode === 'SALDO_A_FAVOR' ? ' selected' : ''}>Generar Saldo a Favor / Anticipo</option>
              <option value="REEMBOLSO_INMEDIATO"${cfg.operational.default_settlement_mode === 'REEMBOLSO_INMEDIATO' ? ' selected' : ''}>Reembolso en Efectivo / Banco</option>
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Bodega de Averías / Cuarentena</label>
            <select id="cfg-ret-loss-wh" class="form-input text-xs">${whOptions(cfg.operational.default_loss_warehouse_id)}</select>
          </div>
        </div>
      </div>

      <!-- Cuentas Contables Ventas -->
      <div class="p-3 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3">
        <h4 class="font-bold text-purple-950 text-xs flex items-center gap-1.5">
          <i class="fas fa-file-invoice text-purple-600"></i> Contabilidad Devoluciones en Ventas (Clientes)
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Devoluciones en Ventas (4175)</label>
            <select id="cfg-ret-sale-acct" class="form-input text-xs">${acctOptions(cfg.accounting.refund_sale_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta IVA Devoluciones (2408)</label>
            <select id="cfg-ret-iva-sale-acct" class="form-input text-xs">${acctOptions(cfg.accounting.iva_sale_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Gasto Averías / Deterioro (5315)</label>
            <select id="cfg-ret-loss-acct" class="form-input text-xs">${acctOptions(cfg.accounting.loss_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Anticipos de Clientes (2805)</label>
            <select id="cfg-ret-adv-cust-acct" class="form-input text-xs">${acctOptions(cfg.accounting.advance_customer_code)}</select>
          </div>
        </div>
      </div>

      <!-- Cuentas Contables Compras -->
      <div class="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
        <h4 class="font-bold text-blue-950 text-xs flex items-center gap-1.5">
          <i class="fas fa-cart-shopping text-blue-600"></i> Contabilidad Devoluciones en Compras (Proveedores)
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Devoluciones Compras (6225 / 1435)</label>
            <select id="cfg-ret-pur-acct" class="form-input text-xs">${acctOptions(cfg.accounting.refund_purchase_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta IVA Descontable Reversado (2408)</label>
            <select id="cfg-ret-iva-pur-acct" class="form-input text-xs">${acctOptions(cfg.accounting.iva_purchase_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Proveedores Nacionales (2205)</label>
            <select id="cfg-ret-cxp-acct" class="form-input text-xs">${acctOptions(cfg.accounting.cxp_code)}</select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Cuenta Anticipos a Proveedores (1330)</label>
            <select id="cfg-ret-adv-supp-acct" class="form-input text-xs">${acctOptions(cfg.accounting.advance_supplier_code)}</select>
          </div>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="window.closeModal()">Cancelar</button>
    <button class="btn btn-primary" onclick="window.saveReturnsSettingsAction()">Guardar Parámetros</button>
  `;

  (window as any).openModal('Parámetros de Devoluciones', html, footer, false);
};

(window as any).saveReturnsSettingsAction = async () => {
  const defaultMode = (document.getElementById('cfg-ret-default-mode') as HTMLSelectElement)?.value || 'CRUCE_DOC_ORIGINAL';
  const lossWh = (document.getElementById('cfg-ret-loss-wh') as HTMLSelectElement)?.value || '';

  const saleAcct = (document.getElementById('cfg-ret-sale-acct') as HTMLSelectElement)?.value || '417505';
  const ivaSaleAcct = (document.getElementById('cfg-ret-iva-sale-acct') as HTMLSelectElement)?.value || '240805';
  const lossAcct = (document.getElementById('cfg-ret-loss-acct') as HTMLSelectElement)?.value || '531520';
  const advCustAcct = (document.getElementById('cfg-ret-adv-cust-acct') as HTMLSelectElement)?.value || '280505';

  const purAcct = (document.getElementById('cfg-ret-pur-acct') as HTMLSelectElement)?.value || '622505';
  const ivaPurAcct = (document.getElementById('cfg-ret-iva-pur-acct') as HTMLSelectElement)?.value || '240810';
  const cxpAcct = (document.getElementById('cfg-ret-cxp-acct') as HTMLSelectElement)?.value || '220505';
  const advSuppAcct = (document.getElementById('cfg-ret-adv-supp-acct') as HTMLSelectElement)?.value || '133005';

  const newCfg = {
    operational: {
      default_settlement_mode: defaultMode,
      default_loss_warehouse_id: lossWh,
      require_warehouse_inspection: false,
    },
    accounting: {
      refund_sale_code: saleAcct,
      iva_sale_code: ivaSaleAcct,
      loss_code: lossAcct,
      advance_customer_code: advCustAcct,
      cxc_code: '130505',
      cogs_code: '613505',
      inventory_code: '143505',
      refund_purchase_code: purAcct,
      iva_purchase_code: ivaPurAcct,
      cxp_code: cxpAcct,
      advance_supplier_code: advSuppAcct,
      cash_code: '110505',
    }
  };

  try {
    await saveReturnsConfig(newCfg);
    (window as any).showToast('Parámetros guardados exitosamente', 'success');
    (window as any).closeModal();
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al guardar parámetros', 'error');
  }
};

// Inyecciones Globales
(window as any).renderDevoluciones = renderDevoluciones;
