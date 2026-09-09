/**
 * GRAVY v2.0 — pedidos.ts
 * Módulo de Pedidos y Cotizaciones de Venta.
 * Diseñado con paridad visual y operativa al módulo de Ventas.
 */

'use strict';

interface OrderStatusDetail {
  label: string;
  badge: string;
}

const ORDER_STATUS: Record<string, OrderStatusDetail> = {
  pending: { label: 'Pendiente', badge: 'badge-orange' },
  invoiced: { label: 'Facturado', badge: 'badge-green' },
  cancelled: { label: 'Cancelado', badge: 'badge-red' },
};

const SALES_CONFIG_KEY = 'sales_settings_v2';

function defaultSalesConfig() {
  return {
    operational: {
      require_warehouse_for_goods: true,
      enable_discounts: true,
      enable_freight: false,
      enable_withholdings: true,
      withholdings: {
        reterenta: true,
        reteiva: false,
        reteica: true,
      },
      default_due_days: 30,
      immediate_posting: false,
      print_format: 'carta_standard',
      document_title: 'Factura de Venta',
      prices_include_iva: false,
      allow_price_edit: true,
      allow_negative_stock: false,
      default_warehouse_id: '',
      enable_multi_unit_conversions: false,
      dian_dependent_posting: false,
    },
    accounting: {
      accounts: {
        receivable_code: '13050501',
        income_fallback_code: '41359501',
        cost_fallback_code: '61359501',
        inventory_fallback_code: '14350501',
        special_third_party_id: '',
        special_account_code: '',
        iva_by_rate: {
          '0': '233501',
          '5': '233501',
          '19': '233501',
        },
        discount_code: '',
        freight_code: '',
        cash_code: '',
        refund_code: '',
        inventory_loss_code: '531520',
      },
      withholding_rules: [
        { id: 'wr-renta-2.5', concept: 'RETERENTA', base_type: 'SUBTOTAL', min_base: 1100000, rate: 2.5, account_code: '135515' },
        { id: 'wr-ica-0.4', concept: 'RETEICA', base_type: 'SUBTOTAL', min_base: 0, rate: 0.414, account_code: '135518' },
      ],
    },
  };
}

function normalizeSalesConfig(cfg: any) {
  const base = defaultSalesConfig();
  const op = cfg?.operational || {};
  const acc = cfg?.accounting?.accounts || {};
  const ivaByRate: any = {};
  
  if (acc.iva_by_rate && typeof acc.iva_by_rate === 'object') {
    Object.keys(acc.iva_by_rate).forEach(r => {
      const c = String(acc.iva_by_rate[r] || '').trim();
      if (c) ivaByRate[r] = c;
    });
  }

  const normalizedRules = (cfg?.accounting?.withholding_rules || [])
    .map((r: any) => ({
      id: String(r?.id || `wr-${Date.now()}-${Math.random()}`),
      concept: String(r?.concept || '').trim().toUpperCase(),
      base_type: String(r?.base_type || 'SUBTOTAL').trim().toUpperCase(),
      min_base: Math.max(0, Number(r?.min_base || 0) || 0),
      rate: Math.max(0, Number(r?.rate || 0) || 0),
      account_code: String(r?.account_code || '').trim(),
    }))
    .filter((r: any) => r.concept && r.rate > 0);

  return {
    operational: {
      require_warehouse_for_goods: op.require_warehouse_for_goods !== false,
      enable_discounts: op.enable_discounts !== false,
      enable_freight: op.enable_freight === true,
      enable_withholdings: op.enable_withholdings !== false,
      withholdings: {
        reterenta: op?.withholdings?.reterenta !== false,
        reteiva: !!op?.withholdings?.reteiva,
        reteica: op?.withholdings?.reteica !== false,
      },
      default_due_days: Math.max(0, Number(op.default_due_days ?? base.operational.default_due_days) || 0),
      immediate_posting: op.immediate_posting === true,
      print_format: String(op.print_format || 'carta_standard'),
      document_title: String(op.document_title || 'Factura de Venta'),
      prices_include_iva: op.prices_include_iva === true,
      allow_price_edit: op.allow_price_edit !== false,
      allow_negative_stock: op.allow_negative_stock === true,
      default_warehouse_id: String(op.default_warehouse_id || '').trim(),
      enable_multi_unit_conversions: op.enable_multi_unit_conversions === true,
      dian_dependent_posting: op.dian_dependent_posting === true,
    },
    accounting: {
      accounts: {
        receivable_code: String(acc.receivable_code || base.accounting.accounts.receivable_code).trim(),
        income_fallback_code: String(acc.income_fallback_code || base.accounting.accounts.income_fallback_code).trim(),
        cost_fallback_code: String(acc.cost_fallback_code || base.accounting.accounts.cost_fallback_code).trim(),
        inventory_fallback_code: String(acc.inventory_fallback_code || base.accounting.accounts.inventory_fallback_code).trim(),
        special_third_party_id: String(acc.special_third_party_id || '').trim(),
        special_account_code: String(acc.special_account_code || '').trim(),
        iva_by_rate: Object.keys(ivaByRate).length ? ivaByRate : { ...base.accounting.accounts.iva_by_rate },
        discount_code: String(acc.discount_code || '').trim(),
        freight_code: String(acc.freight_code || '').trim(),
        cash_code: String(acc.cash_code || '').trim(),
        refund_code: String(acc.refund_code || '').trim(),
      },
      withholding_rules: normalizedRules.length ? normalizedRules : [...base.accounting.withholding_rules],
    },
  };
}

async function getSalesConfig() {
  try {
    const raw = await (window as any).API.getSetting(SALES_CONFIG_KEY);
    if (!raw) return defaultSalesConfig();
    return normalizeSalesConfig(JSON.parse(raw));
  } catch {
    return defaultSalesConfig();
  }
}

function roundDec(val: number): number {
  return (window as any).roundDec
    ? (window as any).roundDec(val)
    : Math.round((val + Number.EPSILON) * 100) / 100;
}

// Conversión Dinámica de Cantidades (Paridad total con Ventas)
function convertQtyToUnits(qty: number, fromUnit: string, baseUnit: string, largoCm: number, anchoCm: number, undEmpaque: number, pesoBruto: number) {
  const areaPorFicha = (largoCm * anchoCm) / 10000;
  const areaPorCaja = areaPorFicha * undEmpaque;

  let qtyInM2 = 0;
  if (fromUnit === 'M2') {
    qtyInM2 = qty;
  } else if (fromUnit === 'CJ') {
    qtyInM2 = qty * areaPorCaja;
  } else if (fromUnit === 'UND') {
    qtyInM2 = qty * areaPorFicha;
  } else if (fromUnit === 'KG') {
    const cajas = pesoBruto > 0 ? (qty / pesoBruto) : 0;
    qtyInM2 = cajas * areaPorCaja;
  } else {
    qtyInM2 = qty;
  }

  let qtyBase = 0;
  if (baseUnit === 'M2') {
    qtyBase = qtyInM2;
  } else if (baseUnit === 'UND') {
    qtyBase = areaPorFicha > 0 ? (qtyInM2 / areaPorFicha) : qty;
  } else if (baseUnit === 'CJ') {
    qtyBase = areaPorCaja > 0 ? (qtyInM2 / areaPorCaja) : qty;
  } else if (baseUnit === 'KG') {
    const pesoPorM2 = areaPorCaja > 0 ? (pesoBruto / areaPorCaja) : 0;
    qtyBase = pesoPorM2 > 0 ? (qtyInM2 * pesoPorM2) : qty;
  } else {
    qtyBase = qty;
  }

  return {
    baseQty: qtyBase,
    m2: qtyInM2,
    cajas: areaPorCaja > 0 ? (qtyInM2 / areaPorCaja) : 0,
    unidades: areaPorFicha > 0 ? (qtyInM2 / areaPorFicha) : 0,
    pesoKg: areaPorCaja > 0 ? ((qtyInM2 / areaPorCaja) * pesoBruto) : 0
  };
}

// --- Render Principal ---
export async function renderPedidos(container?: HTMLElement) {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  const target = getContainer(container);
  if (!target) return;
  target.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando historial de pedidos...</div>`;
  try {
    await _loadPedidosPage(target);
  } catch (err: any) {
    target.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function _loadPedidosPage(c: HTMLElement) {
  const result = await (window as any).API.getSalesOrders({ page: 1, perPage: 200, sort: '-date,-number' });
  const orders = result.items || [];

  const total = orders.length;
  const pending = orders.filter((o: any) => o.status === 'pending').length;
  const invoiced = orders.filter((o: any) => o.status === 'invoiced').length;
  const totalVal = orders.filter((o: any) => o.status !== 'cancelled').reduce((s: number, o: any) => s + (o.total || 0), 0);

  c.innerHTML = `
    <!-- KPIs -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Pedidos y Cotizaciones de Venta</h3>
        <p class="text-sm" style="color:#6B7280">Registra preventas y cotizaciones de clientes para facturarlas posteriormente desde Ventas o POS.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary" id="btn-new-order"><i class="fas fa-plus"></i> Nuevo Pedido (PED)</button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${orderKpi('Total pedidos', total, 'fas fa-file-signature', '#1A4B8C', '#EEF4FF')}
      ${orderKpi('Pendientes', pending, 'fas fa-clock', '#C46516', '#FFF8F0')}
      ${orderKpi('Facturados', invoiced, 'fas fa-check-double', '#059669', '#ECFDF5')}
      ${orderKpi('Valor total activos', (window as any).fmt(totalVal), 'fas fa-coins', '#7C3AED', '#F5F3FF')}
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center" style="border-color:#F0F0F0">
      <input id="ord-q" class="form-input flex-1 min-w-48" placeholder="Buscar número de pedido, cliente, NIT u observaciones...">
      <select id="ord-status-f" class="form-input" style="max-width:180px">
        <option value="">Todos los estados</option>
        <option value="pending">Pendiente</option>
        <option value="invoiced">Facturado</option>
        <option value="cancelled">Cancelado</option>
      </select>
      <input id="ord-from" type="date" class="form-input" style="max-width:160px" title="Desde">
      <input id="ord-to"   type="date" class="form-input" style="max-width:160px" title="Hasta">
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto">
        <table class="data-table" id="ord-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Bodega</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">IVA</th>
              <th class="text-right">Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="ord-tbody">
            ${orders.length ? orders.map(renderOrderRow).join('') : `<tr><td colspan="9" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-file-signature mr-2"></i>No hay pedidos registrados.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

    document.getElementById('btn-new-order')?.addEventListener('click', () => {
      const isMobile = window.innerWidth <= 768 || (window as any).pb?.currentUser?.role === 'vendedor';
      if (isMobile && typeof (window as any).openECommerceOrderModal === 'function') {
        (window as any).openECommerceOrderModal({ onDone: () => _loadPedidosPage(c) });
      } else {
        openOrderForm(null, () => _loadPedidosPage(c));
      }
    });

  const applyFilter = () => filterOrderTable();
  document.getElementById('ord-q')?.addEventListener('input', applyFilter);
  document.getElementById('ord-status-f')?.addEventListener('change', applyFilter);
  document.getElementById('ord-from')?.addEventListener('change', applyFilter);
  document.getElementById('ord-to')?.addEventListener('change', applyFilter);

  const tbl = document.getElementById('ord-table') as HTMLTableElement;
  if (tbl) (window as any).makeTableSortable(tbl);
}

function orderKpi(title: string, value: any, icon: string, color: string, bg: string) {
  return `
    <div class="stat-card blue" style="background:#fff;border-color:#E5E7EB">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs uppercase font-bold tracking-wider" style="color:#6B7280">${title}</span>
          <h4 class="text-2xl font-extrabold mt-1" style="color:#0D2137">${value}</h4>
        </div>
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="color:${color};background:${bg}">
          <i class="${icon}"></i>
        </div>
      </div>
    </div>
  `;
}

function renderOrderRow(ord: any) {
  const meta = ORDER_STATUS[ord.status] || { label: ord.status, badge: 'badge-gray' };
  const client = ord.expand?.customer_id;
  const wh = ord.expand?.warehouse_id;
  const fulfillmentStatus = ord.fulfillment_status;
  const isEnDespacho = fulfillmentStatus === 'EN_DESPACHO';
  const isEntregado = fulfillmentStatus === 'ENTREGADO';

  return `
    <tr data-ordid="${(window as any).esc(ord.id)}" data-ordstatus="${(window as any).esc(ord.status)}" data-orddate="${(window as any).esc(ord.date)}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(ord.number)}</span></td>
      <td>${(window as any).esc(ord.date)}</td>
      <td class="font-medium">${client ? (window as any).esc(client.name) : '—'}</td>
      <td class="text-sm">${wh ? (window as any).esc(wh.name) : '—'}</td>
      <td class="text-right">${(window as any).fmt(ord.subtotal || 0)}</td>
      <td class="text-right">${ord.iva_total ? (window as any).fmt(ord.iva_total) : '—'}</td>
      <td class="text-right font-semibold">${(window as any).fmt(ord.total || 0)}</td>
      <td>
        <div class="flex flex-col gap-1 items-start">
          <span class="badge ${meta.badge}">${meta.label}</span>
          ${isEnDespacho ? '<span class="badge badge-blue text-[10px]"><i class="fas fa-truck mr-1"></i>En Despacho</span>' : ''}
          ${isEntregado && ord.status !== 'invoiced' ? '<span class="badge badge-green text-[10px]"><i class="fas fa-check mr-1"></i>Entregado</span>' : ''}
        </div>
      </td>
      <td>
        <div class="flex gap-1 flex-wrap">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="window.viewSalesOrderDetail('${(window as any).esc(ord.id)}')"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm text-blue-600" style="border-color:#3b82f6" title="Imprimir Carta" onclick="window.printOrderCarta('${(window as any).esc(ord.id)}')"><i class="fas fa-print"></i></button>
          <button class="btn btn-outline btn-sm text-orange-600" style="border-color:#f97316" title="Imprimir Tirilla" onclick="window.printOrderTirilla('${(window as any).esc(ord.id)}')"><i class="fas fa-receipt"></i></button>
          ${ord.status === 'pending' ? `
            <button class="btn btn-outline btn-sm" title="Editar" style="border-color:#1A4B8C;color:#1A4B8C" onclick="window.editSalesOrder('${(window as any).esc(ord.id)}')"><i class="fas fa-pen"></i></button>
            ${!isEnDespacho && !isEntregado ? `
              <button class="btn btn-outline btn-sm text-purple-700" style="border-color:#7C3AED; background:#F5F3FF" title="Despachar a Logística" onclick="window.dispatchSalesOrderDirect('${(window as any).esc(ord.id)}')"><i class="fas fa-truck"></i> Despachar</button>
            ` : ''}
            <button class="btn btn-primary btn-sm" title="Facturar" onclick="window.invoiceSalesOrderDirect('${(window as any).esc(ord.id)}')"><i class="fas fa-receipt"></i> Facturar</button>
            <button class="btn btn-danger btn-sm" title="Anular" onclick="window.cancelSalesOrderDirect('${(window as any).esc(ord.id)}', '${(window as any).esc(ord.number)}')"><i class="fas fa-ban"></i></button>
          ` : ''}
          ${ord.status === 'invoiced' && ord.invoice_id ? `
            <button class="btn btn-outline btn-sm text-green-600" style="border-color:#059669" title="Ver factura asociada" onclick="window.viewSalesInvoiceFromOrder('${(window as any).esc(ord.invoice_id)}')"><i class="fas fa-file-invoice"></i></button>
          ` : ''}
        </div>
      </td>
    </tr>
  `;
}

function filterOrderTable() {
  const q = ((document.getElementById('ord-q') as HTMLInputElement)?.value || '').toLowerCase().trim();
  const st = (document.getElementById('ord-status-f') as HTMLSelectElement)?.value || '';
  const from = (document.getElementById('ord-from') as HTMLInputElement)?.value || '';
  const to = (document.getElementById('ord-to') as HTMLInputElement)?.value || '';

  const rows = document.querySelectorAll('#ord-table tbody tr[data-ordid]');
  rows.forEach((row: any) => {
    const text = row.textContent.toLowerCase();
    const status = row.getAttribute('data-ordstatus');
    const date = row.getAttribute('data-orddate');

    const matchesQ = !q || text.includes(q);
    const matchesStatus = !st || status === st;
    const matchesFrom = !from || date >= from;
    const matchesTo = !to || date <= to;

    row.style.display = (matchesQ && matchesStatus && matchesFrom && matchesTo) ? '' : 'none';
  });
}

// --- Formulario de Pedidos (Crear / Editar) ---
async function openOrderForm(orderId: string | null = null, onDone: any = null, preloadedDealId: string | null = null) {
  let ord: any = null, existingLines: any[] = [];

  const [customers, warehouses, products, salesConfig] = await Promise.all([
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getWarehouses(true),
    (window as any).API.getProducts({ activeOnly: true }),
    getSalesConfig(),
  ]);

  const pricesIncludeIva = salesConfig.operational.prices_include_iva === true;
  const isMultiUnitEnabled = salesConfig.operational.enable_multi_unit_conversions === true;
  const isDiscountsEnabled = salesConfig.operational.enable_discounts !== false;
  const allowPriceEdit = salesConfig.operational.allow_price_edit !== false;
  const allowNegativeStock = salesConfig.operational.allow_negative_stock === true;
  const requireWarehouse = salesConfig.operational.require_warehouse_for_goods !== false;
  const defaultDueDays = Number(salesConfig.operational.default_due_days ?? 30) || 0;

  const sellers = customers.filter((c: any) => c.type === 'EMPLEADO');

  if (orderId) {
    [ord, existingLines] = await Promise.all([
      (window as any).pb.get('sales_orders', orderId, { expand: 'customer_id,warehouse_id' }),
      (window as any).API.getSalesOrderLines(orderId),
    ]);
  } else if (preloadedDealId) {
    try {
      const deal = await (window as any).pb.get('crm_deals', preloadedDealId);
      ord = {
        customer_id: deal.client_id,
        seller_id: deal.seller_id || null,
        notes: `Oportunidad CRM: ${deal.title}`,
        total: deal.value || 0,
        date: (window as any).todayStr()
      };
    } catch (err: any) {
      console.error("Error preloading deal into order form:", err);
    }
  }

  const defaultWhId = salesConfig.operational.default_warehouse_id || '';
  const initialWhId = ord?.warehouse_id || (warehouses.some((w: any) => w.id === defaultWhId) ? defaultWhId : (!ord && warehouses.length === 1 ? warehouses[0].id : ''));
  let currentWhStock: any[] = [];
  if (initialWhId) {
    currentWhStock = await (window as any).API.getInventoryStock({ warehouseId: initialWhId }).catch(() => []);
  }

  (window as any).ordUpdateStockDisplay = async function (idx: number, productId: string) {
    const whId = (document.getElementById('ord-warehouse') as HTMLSelectElement)?.value;
    const qtyInput = document.getElementById(`ordl-qty-${idx}`) as HTMLInputElement;
    const qtyRequested = parseFloat(qtyInput?.value || '0') || 0;

    const stockWhLabel = document.getElementById(`ordl-stock-wh-lbl-${idx}`);
    const transitLabel = document.getElementById(`ordl-stock-transit-lbl-${idx}`);
    const stockContainer = document.getElementById(`ordl-stock-container-${idx}`);

    if (!stockWhLabel || !transitLabel || !stockContainer) return;

    try {
      const [stocks, incoming] = await Promise.all([
        (window as any).API.getInventoryStock({ productId }),
        (window as any).API.getIncomingStockForProduct(productId).catch(() => [])
      ]);

      const currentWh = stocks.find((s: any) => s.warehouse_id === whId);
      const qtyAvailable = currentWh ? Number(currentWh.qty_on_hand || 0) : 0;

      const whName = warehouses.find((w: any) => w.id === whId)?.name || 'Sin bodega';
      if (whId) {
        stockWhLabel.innerHTML = `<i class="fas fa-warehouse mr-0.5"></i> ${whName}: <strong>${(window as any).fmtN(qtyAvailable)}</strong> disp.`;
        if (qtyRequested > qtyAvailable) {
          stockWhLabel.style.cssText = 'color:#DC2626; background:#FEF2F2; border: 1px solid #FCA5A5; font-weight:700';
          if (!allowNegativeStock && qtyInput) {
            qtyInput.style.borderColor = '#EF4444';
            qtyInput.style.backgroundColor = '#FEF2F2';
            qtyInput.title = `Atención: La cantidad supera las existencias (${qtyAvailable}) y el stock negativo no está permitido según la política de facturación.`;
          }
        } else {
          stockWhLabel.style.cssText = 'color:#059669; background:#ECFDF5; border: 1px solid #A7F3D0';
          if (qtyInput) {
            qtyInput.style.borderColor = '';
            qtyInput.style.backgroundColor = '';
            qtyInput.title = '';
          }
        }
      } else {
        const totalStock = stocks.reduce((sum: number, s: any) => sum + Number(s.qty_on_hand || 0), 0);
        stockWhLabel.innerHTML = `<i class="fas fa-warehouse mr-0.5"></i> Disp. Total: <strong>${(window as any).fmtN(totalStock)}</strong>`;
        stockWhLabel.style.cssText = 'color:#4B5563; background:#F3F4F6; border: 1px solid #E5E7EB';
        if (qtyInput) {
          qtyInput.style.borderColor = '';
          qtyInput.style.backgroundColor = '';
          qtyInput.title = '';
        }
      }

      const transitQty = incoming.reduce((sum: number, item: any) => sum + Number(item.qty_available ?? item.qty ?? 0), 0);
      if (transitQty > 0) {
        transitLabel.innerHTML = `<i class="fas fa-truck-ramp-box mr-0.5"></i> Tránsito: <strong>${(window as any).fmtN(transitQty)}</strong>`;
        transitLabel.style.cssText = 'color:#0284C7; background:#E0F2FE; border: 1px solid #BAE6FD';
        transitLabel.classList.remove('hidden');
      } else {
        transitLabel.classList.add('hidden');
      }

      stockContainer.classList.remove('hidden');
    } catch (err) {
      console.warn('Error fetching stock for line:', err);
    }
  };

  const whSelect = document.getElementById('ord-warehouse') as HTMLSelectElement;
  if (whSelect) {
    const handleWhChange = async () => {
      const newWhId = whSelect.value;
      currentWhStock = newWhId ? await (window as any).API.getInventoryStock({ warehouseId: newWhId }).catch(() => []) : [];
      const rows = document.querySelectorAll('#ord-lines-body tr');
      rows.forEach((row: any) => {
        const idx = row.id.split('-').pop();
        const prodId = (document.getElementById(`ordl-prod-id-${idx}`) as HTMLInputElement)?.value;
        if (prodId && (window as any).ordUpdateStockDisplay) {
          (window as any).ordUpdateStockDisplay(idx, prodId);
        }
      });
    };
    whSelect.addEventListener('change', handleWhChange);
  }

  let lineCounter = 0;
  const orderDate = ord?.date || (window as any).todayStr();
  const orderDueDate = ord?.due_date || (window as any).addDaysToDateStr(orderDate, defaultDueDays);

  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <!-- Indicadores de Parámetros de Facturación Heredados -->
      <div class="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border bg-slate-50 text-xs" style="border-color:#E5E7EB">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-700"><i class="fas fa-sliders mr-1 text-teal-700"></i> Parámetros de Facturación:</span>
          ${pricesIncludeIva 
            ? `<span class="font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200"><i class="fas fa-check-circle mr-1"></i>Precios incluyen IVA (Tax-In)</span>`
            : `<span class="font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200"><i class="fas fa-info-circle mr-1"></i>Precios antes de IVA (Tax-Ex)</span>`
          }
          ${isDiscountsEnabled ? `<span class="font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200"><i class="fas fa-tag mr-1"></i>Descuentos habilitados</span>` : ''}
          ${isMultiUnitEnabled ? `<span class="font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200"><i class="fas fa-cube mr-1"></i>Conversión M²/Cajas activa</span>` : ''}
          ${allowPriceEdit ? '' : `<span class="font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200"><i class="fas fa-lock mr-1"></i>Edición precio bloqueada</span>`}
        </div>
        <span class="text-[11px] text-gray-500 italic">Plazo estándar: ${defaultDueDays} días</span>
      </div>

      <!-- Encabezado -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl" style="background:#F9FAFB;border:1px solid #E5E7EB">
        <div class="form-group relative col-span-1 md:col-span-2">
          <label class="form-label font-bold">Cliente <span style="color:#EF4444">*</span></label>
          <div id="ord-customer-search-wrap" class="relative flex gap-1 items-center">
            <input id="ord-customer-search" class="form-input" autocomplete="off" placeholder="Escribe NIT o nombre del cliente...">
            <button type="button" class="btn btn-outline p-2 h-[34px] flex items-center justify-center flex-shrink-0" onclick="window.ordQuickAddCustomer()" title="Nuevo Cliente" style="border-color:#D1D5DB; background:#fff;">
              <i class="fas fa-user-plus text-xs" style="color:#4B5563"></i>
            </button>
            <input id="ord-customer-id" type="hidden" value="${(window as any).esc(ord?.customer_id || '')}">
            <div id="ord-customer-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Bodega de Despacho ${requireWarehouse ? '<span style="color:#EF4444">*</span>' : ''}</label>
          <select id="ord-warehouse" class="form-input">
            <option value="">— Sin bodega —</option>
            ${warehouses.map(w => `<option value="${(window as any).esc(w.id)}"${(ord?.warehouse_id === w.id || (!ord && initialWhId === w.id)) ? ' selected' : ''}>${(window as any).esc(w.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Vendedor</label>
          <select id="ord-seller" class="form-input">
            <option value="">— Sin vendedor —</option>
            ${sellers.map(s => `<option value="${(window as any).esc(s.id)}"${ord?.seller_id === s.id ? ' selected' : ''}>${(window as any).esc(s.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Fecha Pedido <span style="color:#EF4444">*</span></label>
          <input id="ord-date" type="date" class="form-input" value="${(window as any).esc(orderDate)}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Vence / Despacho Estimado</label>
          <input id="ord-due-date" type="date" class="form-input" value="${(window as any).esc(orderDueDate)}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Número Pedido</label>
          <input id="ord-number" class="form-input" placeholder="AUTO" readonly value="${(window as any).esc(ord?.number || 'AUTO')}" style="background:#F3F4F6">
        </div>
        <input id="ord-crm-deal-id" type="hidden" value="${preloadedDealId || ''}">
        <div class="form-group col-span-1 md:col-span-4">
          <label class="form-label font-bold">Observaciones / Notas</label>
          <input id="ord-notes" class="form-input" placeholder="Ej: entrega en oficina principal, cotización válida por 15 días, etc." value="${(window as any).esc(ord?.notes || '')}">
        </div>
      </div>

      <!-- Líneas de Pedido -->
      <div class="border rounded-xl overflow-hidden mb-3" style="border-color:#E5E7EB">
        <div class="flex items-center justify-between px-4 py-2 flex-wrap gap-2" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
          <span class="text-sm font-semibold" style="color:#0D2137"><i class="fas fa-boxes mr-1"></i> Artículos / Servicios</span>
          <span class="text-xs text-gray-500">${pricesIncludeIva ? 'Precios digitados con IVA incluido' : 'Precios digitados antes de IVA'}</span>
        </div>
        <!-- Buscador Global de Productos -->
        <div class="relative p-2 bg-white border-b" style="border-color:#E5E7EB">
          <i class="fas fa-search" style="position:absolute;left:21px;top:50%;transform:translateY(-50%);color:#9CA3AF;font-size:13px;pointer-events:none"></i>
          <input id="ord-prod-search-global" class="form-input"
                 style="padding-left:38px;font-size:14px;border-color:#DCE6F8"
                 autocomplete="off"
                 placeholder="Buscar producto o servicio por nombre o código... (↑↓ para navegar · Enter o clic para agregar)">
          <div id="ord-prod-results-global"
               style="display:none;position:absolute;left:8px;right:8px;top:calc(100% + 3px);max-height:240px;overflow:auto;background:#fff;border:1.5px solid #DCE6F8;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.14);z-index:50">
          </div>
        </div>

        <div style="overflow-x:auto;max-height:300px;overflow-y:auto">
          <table class="data-table" id="ord-lines-table" style="min-width:${isDiscountsEnabled ? '820px' : '740px'}">
            <thead style="position:sticky;top:0;z-index:10">
              <tr>
                <th style="min-width:240px;background:#F4F8FF;color:#374151">Producto / Servicio</th>
                <th class="text-right" style="width:115px;background:#F4F8FF;color:#374151">Cant.</th>
                <th class="text-right" style="width:145px;background:#F4F8FF;color:#374151">P. Unitario</th>
                <th class="text-right" style="width:105px;background:#F4F8FF;color:#374151">IVA %</th>
                ${isDiscountsEnabled ? '<th class="text-right" style="width:100px;background:#F4F8FF;color:#374151">Dscto %</th>' : ''}
                <th class="text-right" style="width:145px;background:#F4F8FF;color:#374151">Total línea</th>
                <th style="width:58px;background:#F4F8FF;color:#374151">Acción</th>
              </tr>
            </thead>
            <tbody id="ord-lines-body"></tbody>
          </table>
        </div>
      </div>

      <!-- Totales -->
      <div class="flex justify-end p-4 rounded-xl" style="background:#F9FAFB">
        <div class="text-sm space-y-1.5 min-w-80 font-medium">
          <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal (Base gravable):</span> <span id="ord-total-sub" class="font-semibold text-gray-800">$ 0</span></div>
          ${isDiscountsEnabled ? `<div class="flex justify-between gap-8 text-rose-600"><span style="color:#EF4444">Descuento líneas:</span> <span id="ord-total-discount" class="font-semibold">-$ 0</span></div>` : ''}
          <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA Liquidado:</span> <span id="ord-total-iva" class="font-semibold text-gray-800">$ 0</span></div>
          <div class="flex justify-between gap-8 text-base border-t pt-2 font-extrabold" style="border-color:#E5E7EB;color:#0D2137"><span class="font-extrabold text-gray-900">TOTAL PEDIDO:</span> <span id="ord-total-net" class="font-extrabold text-blue-700 text-lg">$ 0</span></div>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-order"><i class="fas fa-floppy-disk"></i> Guardar Pedido</button>
  `;

  (window as any).openModal(orderId ? 'Editar Pedido de Venta' : 'Nuevo Pedido de Venta', formHtml, footer, true);

  // Autocomplete de clientes
  function initOrdCustomerSearch() {
    const input = document.getElementById('ord-customer-search') as HTMLInputElement;
    const hidden = document.getElementById('ord-customer-id') as HTMLInputElement;
    const results = document.getElementById('ord-customer-results');
    if (!input || !hidden || !results) return;

    if (ord && ord.customer_id) {
      const match = customers.find((c: any) => c.id === ord.customer_id);
      if (match) input.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
    }

    const performSearch = (val: string) => {
      const query = val.toLowerCase().trim();
      const filtered = !query
        ? customers.slice(0, 30)
        : customers.filter((c: any) => `${c.name} ${c.doc_number} ${c.nit}`.toLowerCase().includes(query)).slice(0, 30);

      if (!filtered.length) {
        results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        return;
      }

      results.innerHTML = filtered.map((c: any) => `
        <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
                onclick="window.selectOrdCustomer('${(window as any).esc(c.id)}', '${(window as any).esc(c.doc_number || c.nit || '')} - ${(window as any).esc(c.name)}')">
          <div class="font-bold text-gray-800">${(window as any).esc(c.name)}</div>
          <div class="text-[10px] text-gray-500">Doc: ${c.doc_number || c.nit || 'S/N'}</div>
        </button>
      `).join('');
    };

    input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

    (window as any).initKeyboardAutocomplete({
      input,
      results,
      itemSelector: 'button',
    });
  }

  (window as any).selectOrdCustomer = function (id: string, text: string) {
    const hidden = document.getElementById('ord-customer-id') as HTMLInputElement;
    const input = document.getElementById('ord-customer-search') as HTMLInputElement;
    if (hidden && input) {
      hidden.value = id;
      input.value = text;
    }
  };

  (window as any).ordQuickAddCustomer = function () {
    if (typeof (window as any).openTerceroForm === 'function') {
      (window as any).openTerceroForm(null, async (createdRecord: any) => {
        try {
          const thirds = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
          customers.length = 0;
          customers.push(...thirds);
          const docNum = createdRecord.doc_number || createdRecord.nit || '';
          const selectText = docNum ? `${docNum} - ${createdRecord.name}` : createdRecord.name;
          (window as any).selectOrdCustomer(createdRecord.id, selectText);
          (window as any).showToast('Cliente creado y seleccionado.', 'success');
        } catch (err: any) {
          (window as any).showToast('Error al recargar clientes: ' + err.message, 'error');
        }
      });
    } else {
      (window as any).showToast('Módulo de terceros no disponible.', 'warning');
    }
  };

  initOrdCustomerSearch();

  // Líneas del Pedido
  (window as any).addOrdLine = function (prod: any = null, preloadedLine: any = null) {
    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('ord-lines-body');
    if (!tbody) return;

    const productId = prod?.id || preloadedLine?.product_id || '';
    const productCode = prod?.code || preloadedLine?._code || '';
    const productName = prod?.name || preloadedLine?._name || preloadedLine?.description || '(producto)';
    const initQty = preloadedLine?.qty ?? 1;
    const initIva = preloadedLine?.iva_rate ?? prod?.iva_rate ?? 19;
    const initDisc = preloadedLine?.discount_pct ?? preloadedLine?.discount_rate ?? 0;

    let initPrice = 0;
    if (preloadedLine) {
      initPrice = pricesIncludeIva
        ? roundDec(preloadedLine.unit_price * (1 + (preloadedLine.iva_rate || 0) / 100))
        : preloadedLine.unit_price;
    } else if (prod) {
      const prodPrice = prod.sales_price || prod.base_price || 0;
      const prodIva = prod.iva_rate ?? 19;
      initPrice = pricesIncludeIva
        ? roundDec(prodPrice * (1 + prodIva / 100))
        : prodPrice;
    }

    // Configuración de conversiones dinámicas (Paridad total con Ventas)
    const undEmpaque = Number(prod?.und_empaque || preloadedLine?.und_empaque || 0);
    const largoCm = Number(prod?.largo_cm || preloadedLine?.largo_cm || 0);
    const anchoCm = Number(prod?.ancho_cm || preloadedLine?.ancho_cm || 0);
    const pesoBruto = Number(prod?.peso_bruto || preloadedLine?.peso_bruto || 0);
    const hasConversions = undEmpaque > 0 && largoCm > 0 && anchoCm > 0;
    const baseUnit = (prod?.unit || preloadedLine?.unit || 'UND').toUpperCase();

    let salesUnit = baseUnit;
    let displayQty = initQty;
    let displayPrice = initPrice;

    if (isMultiUnitEnabled && hasConversions && (prod || preloadedLine)) {
      const areaPorFicha = (largoCm * anchoCm) / 10000;
      const areaPorCaja = areaPorFicha * undEmpaque;

      const descText = preloadedLine?.description || '';
      const matchDesc = descText.match(/\[(Pedido|Facturado):\s*([\d.]+)\s*(M2|CJ|UND|KG)/i);
      if (matchDesc) {
        displayQty = parseFloat(matchDesc[2]);
        salesUnit = matchDesc[3].toUpperCase();
      }

      let priceM2 = 0;
      if (baseUnit === 'M2') {
        priceM2 = initPrice;
      } else if (baseUnit === 'UND') {
        priceM2 = areaPorFicha > 0 ? (initPrice / areaPorFicha) : initPrice;
      } else if (baseUnit === 'CJ') {
        priceM2 = areaPorCaja > 0 ? (initPrice / areaPorCaja) : initPrice;
      } else if (baseUnit === 'KG') {
        const pesoPorM2 = areaPorCaja > 0 ? (pesoBruto / areaPorCaja) : 0;
        priceM2 = pesoPorM2 > 0 ? (initPrice * pesoPorM2) : initPrice;
      }

      if (salesUnit === 'M2') {
        displayPrice = priceM2;
      } else if (salesUnit === 'CJ') {
        displayPrice = priceM2 * areaPorCaja;
      } else if (salesUnit === 'UND') {
        displayPrice = priceM2 * areaPorFicha;
      } else if (salesUnit === 'KG') {
        const pesoPorCaja = pesoBruto;
        displayPrice = pesoPorCaja > 0 ? ((priceM2 * areaPorCaja) / pesoPorCaja) : priceM2;
      }
    }

    const tr = document.createElement('tr');
    tr.id = `ord-row-${idx}`;
    tr.dataset.baseUnit = baseUnit;
    tr.dataset.largoCm = String(largoCm);
    tr.dataset.anchoCm = String(anchoCm);
    tr.dataset.undEmpaque = String(undEmpaque);
    tr.dataset.pesoBruto = String(pesoBruto);
    tr.dataset.hasConversions = String(hasConversions);

    tr.innerHTML = `
      <td>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 flex-shrink-0">[${(window as any).esc(productCode || 'S/C')}]</span>
            <span class="text-xs font-semibold text-gray-800 truncate" title="${(window as any).esc(productName)}">${(window as any).esc(productName)}</span>
          </div>
          <input type="hidden" id="ordl-prod-id-${idx}" value="${(window as any).esc(productId)}">
          <input type="hidden" id="ordl-prod-search-${idx}" value="${(window as any).esc(productCode ? `${productCode} - ${productName}` : productName)}">
          <div class="flex items-center gap-2 mt-1.5 text-[10px] hidden" id="ordl-stock-container-${idx}">
            <span class="cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform px-1.5 py-0.5 rounded flex items-center shadow-xs" id="ordl-stock-wh-lbl-${idx}">
              <i class="fas fa-warehouse mr-0.5"></i> Bodega: ...
            </span>
            <span class="cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform px-1.5 py-0.5 rounded flex items-center shadow-xs hidden" id="ordl-stock-transit-lbl-${idx}">
              <i class="fas fa-truck-ramp-box mr-0.5"></i> Tránsito: ...
            </span>
          </div>
          <div class="text-[10px] text-gray-500 font-semibold mt-1 hidden" style="line-height:1.2" id="ordl-equiv-lbl-${idx}"></div>
        </div>
      </td>
      <td>
        <div class="flex flex-col gap-1">
          <input type="number" id="ordl-qty-${idx}" class="form-input text-right w-full font-bold" style="font-size:12px" min="0.001" step="0.001" value="${displayQty}" oninput="window.ordRecalcLine(${idx})">
          ${isMultiUnitEnabled && hasConversions ? `
            <select id="ordl-unit-${idx}" class="form-input text-right w-full py-0.5 text-xs font-semibold" style="height:24px; color:#1A4B8C; padding: 2px 2px 2px 4px;">
              <option value="M2" ${salesUnit === 'M2' ? 'selected' : ''}>M² (Área)</option>
              <option value="CJ" ${salesUnit === 'CJ' ? 'selected' : ''}>CJ (Cajas)</option>
              <option value="UND" ${salesUnit === 'UND' ? 'selected' : ''}>UND (Fichas)</option>
              <option value="KG" ${salesUnit === 'KG' ? 'selected' : ''}>KG (Peso)</option>
            </select>
          ` : `
            <div class="text-right text-[10px] text-gray-400 font-semibold pr-1">${(window as any).esc(baseUnit)}</div>
          `}
        </div>
      </td>
      <td>
        <input type="number" id="ordl-price-${idx}" class="form-input text-right w-full" style="font-size:12px" min="0" step="0.01" value="${roundDec(displayPrice) || ''}" oninput="window.ordRecalcLine(${idx})" ${allowPriceEdit ? '' : 'readonly style="background-color:#F3F4F6;cursor:not-allowed"'}>
      </td>
      <td>
        <select id="ordl-iva-${idx}" class="form-input text-right w-full" style="font-size:11px; padding: 4px 18px 4px 4px;" onchange="window.ordRecalcLine(${idx})">
          <option value="0"  ${initIva == 0 ? 'selected' : ''}>0 %</option>
          <option value="5"  ${initIva == 5 ? 'selected' : ''}>5 %</option>
          <option value="19" ${initIva == 19 ? 'selected' : ''}>19 %</option>
        </select>
      </td>
      ${isDiscountsEnabled ? `
        <td>
          <input type="number" id="ordl-disc-${idx}" class="form-input text-right w-full" style="font-size:12px" min="0" max="100" step="0.01" value="${initDisc}" placeholder="0" oninput="window.ordRecalcLine(${idx})">
        </td>
      ` : ''}
      <td class="text-right font-extrabold text-blue-700" style="font-size:13px" id="ordl-total-${idx}">$ 0</td>
      <td class="text-center">
        <button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('ord-row-${idx}').remove(); window.ordRecalcTotals();" title="Quitar línea"><i class="fas fa-trash-can"></i></button>
      </td>
    `;
    tbody.appendChild(tr);

    setTimeout(() => {
      const whLbl = document.getElementById(`ordl-stock-wh-lbl-${idx}`);
      const transLbl = document.getElementById(`ordl-stock-transit-lbl-${idx}`);
      whLbl?.addEventListener('click', () => (window as any).showStockBreakdownModal(productId, productName));
      transLbl?.addEventListener('click', () => (window as any).showStockBreakdownModal(productId, productName));

      const unitSel = document.getElementById(`ordl-unit-${idx}`) as HTMLSelectElement;
      if (unitSel) {
        let prevUnit = salesUnit;
        unitSel.addEventListener('change', () => {
          const newUnit = unitSel.value;
          const priceInput = document.getElementById(`ordl-price-${idx}`) as HTMLInputElement;
          let currentPrice = parseFloat(priceInput?.value || '0') || 0;
          const areaPorFicha = (largoCm * anchoCm) / 10000;
          const areaPorCaja = areaPorFicha * undEmpaque;
          const pesoPorCaja = pesoBruto;

          let priceInBase = currentPrice;
          if (prevUnit === 'M2') {
            if (baseUnit === 'UND') priceInBase = currentPrice * areaPorFicha;
            else if (baseUnit === 'CJ') priceInBase = currentPrice * areaPorCaja;
            else if (baseUnit === 'KG') priceInBase = pesoPorCaja > 0 ? ((currentPrice * areaPorCaja) / pesoPorCaja) : currentPrice;
          } else if (prevUnit === 'CJ') {
            if (baseUnit === 'M2') priceInBase = areaPorCaja > 0 ? (currentPrice / areaPorCaja) : currentPrice;
            else if (baseUnit === 'UND') priceInBase = undEmpaque > 0 ? (currentPrice / undEmpaque) : currentPrice;
            else if (baseUnit === 'KG') priceInBase = pesoPorCaja > 0 ? (currentPrice / pesoPorCaja) : currentPrice;
          } else if (prevUnit === 'UND') {
            if (baseUnit === 'M2') priceInBase = areaPorFicha > 0 ? (currentPrice / areaPorFicha) : currentPrice;
            else if (baseUnit === 'CJ') priceInBase = currentPrice * undEmpaque;
            else if (baseUnit === 'KG') priceInBase = (undEmpaque > 0 && pesoPorCaja > 0) ? ((currentPrice * undEmpaque) / pesoPorCaja) : currentPrice;
          } else if (prevUnit === 'KG') {
            if (baseUnit === 'M2') priceInBase = areaPorCaja > 0 ? ((currentPrice * pesoPorCaja) / areaPorCaja) : currentPrice;
            else if (baseUnit === 'CJ') priceInBase = currentPrice * pesoPorCaja;
            else if (baseUnit === 'UND') priceInBase = undEmpaque > 0 ? ((currentPrice * pesoPorCaja) / undEmpaque) : currentPrice;
          }

          let newPrice = priceInBase;
          if (newUnit === 'M2') {
            if (baseUnit === 'UND') newPrice = areaPorFicha > 0 ? (priceInBase / areaPorFicha) : priceInBase;
            else if (baseUnit === 'CJ') newPrice = areaPorCaja > 0 ? (priceInBase / areaPorCaja) : priceInBase;
            else if (baseUnit === 'KG') newPrice = areaPorCaja > 0 ? ((priceInBase * pesoPorCaja) / areaPorCaja) : priceInBase;
          } else if (newUnit === 'CJ') {
            if (baseUnit === 'M2') newPrice = priceInBase * areaPorCaja;
            else if (baseUnit === 'UND') newPrice = priceInBase * undEmpaque;
            else if (baseUnit === 'KG') newPrice = priceInBase * pesoPorCaja;
          } else if (newUnit === 'UND') {
            if (baseUnit === 'M2') newPrice = priceInBase * areaPorFicha;
            else if (baseUnit === 'CJ') newPrice = undEmpaque > 0 ? (priceInBase / undEmpaque) : priceInBase;
            else if (baseUnit === 'KG') newPrice = undEmpaque > 0 ? ((priceInBase * pesoPorCaja) / undEmpaque) : priceInBase;
          } else if (newUnit === 'KG') {
            if (baseUnit === 'M2') newPrice = pesoPorCaja > 0 ? ((priceInBase * areaPorCaja) / pesoPorCaja) : priceInBase;
            else if (baseUnit === 'CJ') newPrice = pesoPorCaja > 0 ? (priceInBase / pesoPorCaja) : priceInBase;
            else if (baseUnit === 'UND') newPrice = (undEmpaque > 0 && pesoPorCaja > 0) ? ((priceInBase * undEmpaque) / pesoPorCaja) : priceInBase;
          }

          if (priceInput) priceInput.value = String(roundDec(newPrice));
          prevUnit = newUnit;
          (window as any).ordRecalcLine(idx);
        });
      }

      if ((window as any).ordUpdateStockDisplay) {
        (window as any).ordUpdateStockDisplay(idx, productId);
      }
    }, 20);

    (window as any).ordRecalcLine(idx);
  };

  function initOrdGlobalProductSearch() {
    const input = document.getElementById('ord-prod-search-global') as HTMLInputElement;
    const dropdown = document.getElementById('ord-prod-results-global');
    if (!input || !dropdown) return;

    let highlighted = -1;

    const renderResults = (filtered: any[]) => {
      if (!filtered.length) {
        dropdown.innerHTML = '<div class="px-4 py-3 text-xs text-gray-400"><i class="fas fa-box-open mr-1"></i>Sin resultados para esta búsqueda.</div>';
        return;
      }
      dropdown.innerHTML = filtered.map((p: any, i: number) => {
        const stockRow = currentWhStock.find((s: any) => s.product_id === p.id);
        const stockQty = stockRow ? Number(stockRow.qty_on_hand || 0) : 0;
        const whId = (document.getElementById('ord-warehouse') as HTMLSelectElement)?.value;
        const whName = warehouses.find((w: any) => w.id === whId)?.name || 'Sin bodega';
        const stockText = whId ? `${(window as any).fmtN(stockQty)} en ${whName}` : 'Selecciona bodega';
        const stockColor = stockQty > 0 ? 'color:#059669;background:#ECFDF5' : 'color:#9CA3AF;background:#F3F4F6';

        const prodPrice = p.sales_price || p.base_price || 0;
        const displayCatalogPrice = pricesIncludeIva ? roundDec(prodPrice * (1 + (p.iva_rate ?? 19) / 100)) : prodPrice;

        return `
          <button type="button"
            id="ord-gsr-item-${i}"
            data-prod-idx="${i}"
            class="w-full text-left px-4 py-2.5 text-xs border-none bg-white cursor-pointer block ord-gsr-row"
            style="border-bottom:1px solid #F3F4F6;transition:background .1s"
            onmouseenter="this.style.background='#F0FBFF'"
            onmouseleave="this.style.background=''"
            onclick="window.ordGlobalSelectProduct(${i})">
            <div class="flex items-center justify-between gap-3">
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[9px] font-mono text-gray-400 flex-shrink-0">[${(window as any).esc(p.code || 'S/C')}]</span>
                  <span class="font-semibold text-gray-800 truncate">${(window as any).esc(p.name)}</span>
                </div>
                <div class="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;${stockColor}">${(window as any).esc(stockText)}</span>
                </div>
              </div>
              <div class="flex items-center justify-between gap-3 flex-shrink-0 text-right">
                <span class="text-[10px] px-1.5 py-0.5 rounded font-bold" style="background:#EEF4FF;color:#1A4B8C">IVA ${p.iva_rate ?? 19}%</span>
                <span class="font-extrabold text-blue-600 text-xs">${(window as any).fmt(displayCatalogPrice)}${pricesIncludeIva ? ' <span class="text-[9px] text-gray-500 font-normal">(IVA inc.)</span>' : ''}</span>
              </div>
            </div>
          </button>
        `;
      }).join('');
      highlighted = -1;
      (window as any).__ordGlobalFilteredProds = filtered;
    };

    const highlightItem = (idx: number, items: NodeListOf<Element>) => {
      items.forEach((el: any) => { el.style.background = ''; el.style.fontWeight = ''; });
      if (idx >= 0 && idx < items.length) {
        (items[idx] as any).style.background = '#EEF4FF';
        (items[idx] as any).scrollIntoView({ block: 'nearest' });
      }
    };

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      const filtered = !q
        ? products.slice(0, 40)
        : products.filter((p: any) => `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 40);
      renderResults(filtered);
      dropdown.style.display = 'block';
    });

    input.addEventListener('focus', () => {
      const q = input.value.trim().toLowerCase();
      const filtered = !q ? products.slice(0, 40) : products.filter((p: any) => `${p.name} ${p.code}`.toLowerCase().includes(q)).slice(0, 40);
      renderResults(filtered);
      dropdown.style.display = 'block';
    });

    input.addEventListener('keydown', (ev: KeyboardEvent) => {
      const items = dropdown.querySelectorAll('.ord-gsr-row');
      if (ev.key === 'ArrowDown') { ev.preventDefault(); highlighted = Math.min(highlighted + 1, items.length - 1); highlightItem(highlighted, items); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); highlighted = Math.max(highlighted - 1, 0); highlightItem(highlighted, items); }
      else if (ev.key === 'Enter') {
        ev.preventDefault();
        const selIdx = highlighted >= 0 ? highlighted : 0;
        window.ordGlobalSelectProduct(selIdx);
      } else if (ev.key === 'Escape') {
        dropdown.style.display = 'none';
      }
    });

    input.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));
  }

  (window as any).ordGlobalSelectProduct = function (idx: number) {
    const filtered: any[] = (window as any).__ordGlobalFilteredProds || [];
    const prod = filtered[idx];
    if (!prod) return;
    (window as any).addOrdLine(prod, null);
    const input = document.getElementById('ord-prod-search-global') as HTMLInputElement;
    const dropdown = document.getElementById('ord-prod-results-global');
    if (input) { input.value = ''; input.focus(); }
    if (dropdown) dropdown.style.display = 'none';
    const tableWrap = document.querySelector('#ord-lines-table')?.closest('div[style*="overflow"]') as HTMLElement;
    if (tableWrap) setTimeout(() => { tableWrap.scrollTop = tableWrap.scrollHeight; }, 50);
  };

  (window as any).ordRecalcLine = function (idx: number) {
    const rows = document.querySelectorAll('#ord-lines-body tr');
    let subtotalSum = 0;
    let discountSum = 0;
    let ivaSum = 0;
    let totalSum = 0;

    rows.forEach(row => {
      const curIdx = row.id.split('-').pop();
      const qty = parseFloat((document.getElementById(`ordl-qty-${curIdx}`) as HTMLInputElement)?.value || '0') || 0;
      const price = parseFloat((document.getElementById(`ordl-price-${curIdx}`) as HTMLInputElement)?.value || '0') || 0;
      const ivaRate = parseFloat((document.getElementById(`ordl-iva-${curIdx}`) as HTMLSelectElement || document.getElementById(`ordl-iva-${curIdx}`) as HTMLInputElement)?.value || '0') || 0;
      const discPct = parseFloat((document.getElementById(`ordl-disc-${curIdx}`) as HTMLInputElement)?.value || '0') || 0;

      // Recálculo de equivalencias descriptivas
      const baseUnit = ((row as HTMLElement).dataset.baseUnit || 'UND').toUpperCase();
      const largoCm = parseFloat((row as HTMLElement).dataset.largoCm || '0') || 0;
      const anchoCm = parseFloat((row as HTMLElement).dataset.anchoCm || '0') || 0;
      const undEmpaque = parseFloat((row as HTMLElement).dataset.undEmpaque || '0') || 0;
      const pesoBruto = parseFloat((row as HTMLElement).dataset.pesoBruto || '0') || 0;
      const hasConversions = (row as HTMLElement).dataset.hasConversions === 'true';

      const equivLbl = document.getElementById(`ordl-equiv-lbl-${curIdx}`);
      if (hasConversions && equivLbl) {
        const unitSelect = document.getElementById(`ordl-unit-${curIdx}`) as HTMLSelectElement;
        const selectedUnit = unitSelect ? unitSelect.value : baseUnit;
        const convs = convertQtyToUnits(qty, selectedUnit, baseUnit, largoCm, anchoCm, undEmpaque, pesoBruto);
        equivLbl.innerHTML = `Equivale a: <strong class="text-blue-700">${(window as any).fmtN(convs.cajas)} CJ</strong> | <strong class="text-blue-700">${(window as any).fmtN(convs.m2)} M²</strong> | <strong class="text-blue-700">${(window as any).fmtN(convs.unidades)} UND</strong> | <strong class="text-blue-700">${(window as any).fmtN(convs.pesoKg)} Kg</strong>`;
        equivLbl.classList.remove('hidden');
      } else if (equivLbl) {
        equivLbl.classList.add('hidden');
      }

      let lineGross = 0, lineDisc = 0, lineSub = 0, lineIva = 0, lineTot = 0;
      if (pricesIncludeIva) {
        const lineTotalGross = roundDec(qty * price);
        lineDisc = roundDec(lineTotalGross * (discPct / 100));
        lineTot = roundDec(lineTotalGross - lineDisc);
        lineSub = roundDec(lineTot / (1 + ivaRate / 100));
        lineIva = roundDec(lineTot - lineSub);
        lineGross = roundDec(lineTotalGross / (1 + ivaRate / 100));
      } else {
        lineGross = roundDec(qty * price);
        lineDisc = roundDec(lineGross * (discPct / 100));
        lineSub = roundDec(lineGross - lineDisc);
        lineIva = roundDec(lineSub * (ivaRate / 100));
        lineTot = roundDec(lineSub + lineIva);
      }

      const totalEl = document.getElementById(`ordl-total-${curIdx}`);
      if (totalEl) totalEl.textContent = (window as any).fmt(lineTot);

      subtotalSum = roundDec(subtotalSum + (pricesIncludeIva ? lineGross : lineGross));
      discountSum = roundDec(discountSum + lineDisc);
      ivaSum = roundDec(ivaSum + lineIva);
      totalSum = roundDec(totalSum + lineTot);
    });

    const netSubtotal = roundDec(subtotalSum - discountSum);
    const subEl = document.getElementById('ord-total-sub');
    const discEl = document.getElementById('ord-total-discount');
    const ivaEl = document.getElementById('ord-total-iva');
    const netEl = document.getElementById('ord-total-net');

    if (subEl) subEl.textContent = (window as any).fmt(pricesIncludeIva ? roundDec(totalSum - ivaSum) : netSubtotal);
    if (discEl) discEl.textContent = `-${(window as any).fmt(discountSum)}`;
    if (ivaEl) ivaEl.textContent = (window as any).fmt(ivaSum);
    if (netEl) netEl.textContent = (window as any).fmt(totalSum);

    // Resaltado de stock para la línea
    if (idx > 0) {
      const prodId = (document.getElementById(`ordl-prod-id-${idx}`) as HTMLInputElement)?.value;
      if (prodId && (window as any).ordUpdateStockDisplay) {
        (window as any).ordUpdateStockDisplay(idx, prodId);
      }
    } else {
      rows.forEach((row: any) => {
        const curIdx = row.id.split('-').pop();
        const prodId = (document.getElementById(`ordl-prod-id-${curIdx}`) as HTMLInputElement)?.value;
        if (prodId && (window as any).ordUpdateStockDisplay) {
          (window as any).ordUpdateStockDisplay(curIdx, prodId);
        }
      });
    }
  };

  (window as any).ordRecalcTotals = function () {
    (window as any).ordRecalcLine(0);
  };

  // Cargar líneas iniciales
  if (existingLines.length) {
    existingLines.forEach((l: any) => {
      const match = products.find((p: any) => p.id === l.product_id);
      if (match) {
        l._name = match.name;
        l._code = match.code;
        l.unit = match.unit;
        l.largo_cm = match.largo_cm;
        l.ancho_cm = match.ancho_cm;
        l.und_empaque = match.und_empaque;
        l.peso_bruto = match.peso_bruto;
      }
      (window as any).addOrdLine(match || null, l);
    });
  }

  initOrdGlobalProductSearch();

  // Listener para guardar
  document.getElementById('btn-save-order')?.addEventListener('click', async () => {
    try {
      const customerId = (document.getElementById('ord-customer-id') as HTMLInputElement)?.value;
      const date = (document.getElementById('ord-date') as HTMLInputElement)?.value;
      const dueDate = (document.getElementById('ord-due-date') as HTMLInputElement)?.value;
      const notes = (document.getElementById('ord-notes') as HTMLInputElement)?.value.trim();
      const number = (document.getElementById('ord-number') as HTMLInputElement)?.value;
      const warehouseId = (document.getElementById('ord-warehouse') as HTMLSelectElement)?.value || null;
      const sellerId = (document.getElementById('ord-seller') as HTMLSelectElement)?.value || null;

      if (!customerId) throw new Error('Por favor selecciona un cliente.');
      if (!date) throw new Error('Por favor selecciona la fecha de emisión del pedido.');

      const rows = document.querySelectorAll('#ord-lines-body tr');
      if (!rows.length) throw new Error('El pedido debe tener al menos una línea.');

      // Validar regla de bodega exigida cuando hay bienes físicos
      if (requireWarehouse && !warehouseId) {
        let hasPhysicalGoods = false;
        rows.forEach(row => {
          const curIdx = row.id.split('-').pop();
          const prodId = (document.getElementById(`ordl-prod-id-${curIdx}`) as HTMLInputElement)?.value;
          const match = products.find((p: any) => p.id === prodId);
          if (match && String(match.type || '').toUpperCase() !== 'SERVICIO') {
            hasPhysicalGoods = true;
          }
        });
        if (hasPhysicalGoods) {
          throw new Error('La política de facturación exige seleccionar una bodega de despacho para pedidos con artículos físicos.');
        }
      }

      const lines: any[] = [];
      let totalOrderGross = 0;
      let totalOrderDiscount = 0;
      let totalOrderIva = 0;
      let totalOrderFinal = 0;

      rows.forEach((row, i) => {
        const curIdx = row.id.split('-').pop();
        const productId = (document.getElementById(`ordl-prod-id-${curIdx}`) as HTMLInputElement)?.value;
        const prodLabel = (document.getElementById(`ordl-prod-search-${curIdx}`) as HTMLInputElement)?.value;
        const qty = parseFloat((document.getElementById(`ordl-qty-${curIdx}`) as HTMLInputElement)?.value || '0');
        const price = parseFloat((document.getElementById(`ordl-price-${curIdx}`) as HTMLInputElement)?.value || '0');
        const ivaRate = parseFloat((document.getElementById(`ordl-iva-${curIdx}`) as HTMLSelectElement || document.getElementById(`ordl-iva-${curIdx}`) as HTMLInputElement)?.value || '0');
        const discPct = parseFloat((document.getElementById(`ordl-disc-${curIdx}`) as HTMLInputElement)?.value || '0');

        if (!productId) {
          throw new Error(`Por favor selecciona un producto válido en la línea ${i + 1}.`);
        }
        if (qty <= 0) {
          throw new Error(`La cantidad debe ser mayor a cero en la línea ${i + 1}.`);
        }
        if (price < 0) {
          throw new Error(`El precio unitario no puede ser negativo en la línea ${i + 1}.`);
        }

        // Conversión a unidad base de inventario si aplica
        const baseUnit = ((row as HTMLElement).dataset.baseUnit || 'UND').toUpperCase();
        const largoCm = parseFloat((row as HTMLElement).dataset.largoCm || '0') || 0;
        const anchoCm = parseFloat((row as HTMLElement).dataset.anchoCm || '0') || 0;
        const undEmpaque = parseFloat((row as HTMLElement).dataset.undEmpaque || '0') || 0;
        const pesoBruto = parseFloat((row as HTMLElement).dataset.pesoBruto || '0') || 0;
        const hasConversions = (row as HTMLElement).dataset.hasConversions === 'true';

        const unitSelect = document.getElementById(`ordl-unit-${curIdx}`) as HTMLSelectElement;
        const selectedUnit = unitSelect ? unitSelect.value : baseUnit;

        const unitPriceDb = pricesIncludeIva ? (price / (1 + ivaRate / 100)) : price;
        let finalQty = qty;
        let finalPrice = unitPriceDb;
        let descriptionExtra = '';

        if (hasConversions && selectedUnit !== baseUnit) {
          const convs = convertQtyToUnits(qty, selectedUnit, baseUnit, largoCm, anchoCm, undEmpaque, pesoBruto);
          finalQty = convs.baseQty;

          const areaPorFicha = (largoCm * anchoCm) / 10000;
          const areaPorCaja = areaPorFicha * undEmpaque;
          let priceInBase = unitPriceDb;

          if (selectedUnit === 'M2') {
            if (baseUnit === 'UND') priceInBase = unitPriceDb * areaPorFicha;
            else if (baseUnit === 'CJ') priceInBase = unitPriceDb * areaPorCaja;
            else if (baseUnit === 'KG') {
              const pesoPorM2 = areaPorCaja > 0 ? (pesoBruto / areaPorCaja) : 0;
              priceInBase = pesoPorM2 > 0 ? (unitPriceDb / pesoPorM2) : unitPriceDb;
            }
          } else if (selectedUnit === 'CJ') {
            if (baseUnit === 'M2') priceInBase = areaPorCaja > 0 ? (unitPriceDb / areaPorCaja) : unitPriceDb;
            else if (baseUnit === 'UND') priceInBase = undEmpaque > 0 ? (unitPriceDb / undEmpaque) : unitPriceDb;
            else if (baseUnit === 'KG') priceInBase = pesoBruto > 0 ? (unitPriceDb / pesoBruto) : unitPriceDb;
          } else if (selectedUnit === 'UND') {
            if (baseUnit === 'M2') priceInBase = areaPorFicha > 0 ? (unitPriceDb / areaPorFicha) : unitPriceDb;
            else if (baseUnit === 'CJ') priceInBase = unitPriceDb * undEmpaque;
            else if (baseUnit === 'KG') {
              const pesoPorFicha = undEmpaque > 0 ? (pesoBruto / undEmpaque) : 0;
              priceInBase = pesoPorFicha > 0 ? (unitPriceDb / pesoPorFicha) : unitPriceDb;
            }
          } else if (selectedUnit === 'KG') {
            const pesoPorCaja = pesoBruto;
            if (baseUnit === 'M2') priceInBase = areaPorCaja > 0 ? ((unitPriceDb * pesoPorCaja) / areaPorCaja) : unitPriceDb;
            else if (baseUnit === 'CJ') priceInBase = unitPriceDb * pesoPorCaja;
            else if (baseUnit === 'UND') priceInBase = undEmpaque > 0 ? ((unitPriceDb * pesoPorCaja) / undEmpaque) : unitPriceDb;
          }
          finalPrice = priceInBase;
          descriptionExtra = ` [Pedido: ${qty} ${selectedUnit} a ${(window as any).fmt(price)}/${selectedUnit}]`;
        }

        let lineGross = 0, lineDisc = 0, lineSub = 0, lineIva = 0, lineTot = 0;
        if (pricesIncludeIva) {
          const lineTotalGross = roundDec(qty * price);
          lineDisc = roundDec(lineTotalGross * (discPct / 100));
          lineTot = roundDec(lineTotalGross - lineDisc);
          lineSub = roundDec(lineTot / (1 + ivaRate / 100));
          lineIva = roundDec(lineTot - lineSub);
          lineGross = roundDec(lineTotalGross / (1 + ivaRate / 100));
        } else {
          lineGross = roundDec(qty * price);
          lineDisc = roundDec(lineGross * (discPct / 100));
          lineSub = roundDec(lineGross - lineDisc);
          lineIva = roundDec(lineSub * (ivaRate / 100));
          lineTot = roundDec(lineSub + lineIva);
        }

        totalOrderGross = roundDec(totalOrderGross + lineGross);
        totalOrderDiscount = roundDec(totalOrderDiscount + lineDisc);
        totalOrderIva = roundDec(totalOrderIva + lineIva);
        totalOrderFinal = roundDec(totalOrderFinal + lineTot);

        lines.push({
          product_id: productId,
          description: descriptionExtra ? `${prodLabel}${descriptionExtra}` : prodLabel,
          qty: finalQty,
          unit_price: finalPrice,
          iva_rate: ivaRate,
          iva_amount: lineIva,
          subtotal: lineSub,
          total: lineTot,
          discount_pct: discPct,
          discount_amount: lineDisc,
        });
      });

      const header = {
        number,
        customer_id: customerId,
        warehouse_id: warehouseId,
        seller_id: sellerId,
        date,
        due_date: dueDate,
        notes,
        subtotal: roundDec(totalOrderFinal - totalOrderIva),
        iva_total: totalOrderIva,
        discount_amount: totalOrderDiscount,
        total: totalOrderFinal,
      };

      const crmDealId = (document.getElementById('ord-crm-deal-id') as HTMLInputElement)?.value || null;
      let order: any = null;

      if (orderId) {
        order = await (window as any).API.updateSalesOrder(orderId, header, lines);
        (window as any).showToast('Pedido actualizado correctamente con parámetros de facturación', 'success');
      } else {
        order = await (window as any).API.createSalesOrder(header, lines);
        (window as any).showToast('Pedido registrado con éxito con parámetros de facturación', 'success');
      }
      if (crmDealId && order && order.id) {
        try {
          await (window as any).pb.update('crm_deals', crmDealId, {
            sales_order_id: order.id,
            stage: 'NEGOCIACION'
          });
          (window as any).showToast('Oportunidad CRM vinculada y actualizada a Negociación', 'success');

          // Guardar interacción del pedido creado en el historial del CRM
          await (window as any).pb.create('crm_interactions', {
            deal_id: crmDealId,
            user_id: (window as any).pb.currentUser?.id || null,
            type: 'COTIZACION',
            request_details: `Pedido de venta creado: ${order.number}`,
            response_details: `Valor total del pedido: ${(window as any).fmt(order.total || 0)}. Estado: Pendiente de despacho.`,
            response_at: (window as any).todayStr()
          });
        } catch (crmErr: any) {
          console.error("Error al vincular oportunidad CRM:", crmErr);
        }
      } (window as any).closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      (window as any).showToast(err.message || 'No se pudo registrar el pedido', 'error');
    }
  });
}

// --- Detalle del Pedido / Cotización ---
(window as any).viewSalesOrderDetail = async function (orderId: string) {
  try {
    const [ord, lines] = await Promise.all([
      (window as any).pb.get('sales_orders', orderId, { expand: 'customer_id,warehouse_id,invoice_id,user_id,seller_id' }),
      (window as any).API.getSalesOrderLines(orderId),
    ]);

    const meta = ORDER_STATUS[ord.status] || { label: ord.status, badge: 'badge-gray' };
    const client = ord.expand?.customer_id;
    const wh = ord.expand?.warehouse_id;
    const user = ord.expand?.user_id;

    const detailHtml = `
      <div class="space-y-6 text-sm" style="color:#374151">
        <!-- Grid de Información -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border" style="background:#F9FAFB;border-color:#E5E7EB">
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Número de Pedido</span><span class="font-semibold font-mono text-sm" style="color:#1A4B8C">${(window as any).esc(ord.number)}</span></div>
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Fecha Registro</span><span class="font-semibold">${(window as any).esc(ord.date)}</span></div>
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Fecha Estimada Despacho</span><span class="font-semibold">${(window as any).esc(ord.due_date || '—')}</span></div>
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Estado Pedido</span><span class="badge ${meta.badge} mt-1">${meta.label}</span></div>
          
          <div class="col-span-2"><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Cliente / Adquirente</span><span class="font-semibold text-gray-800">${client ? (window as any).esc(client.name) : '—'} (Doc: ${client ? (window as any).esc(client.doc_number || client.nit) : '—'})</span></div>
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Bodega</span><span class="font-semibold">${wh ? (window as any).esc(wh.name) : '—'}</span></div>
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Vendedor</span><span class="font-semibold text-gray-800">${ord.expand?.seller_id ? (window as any).esc(ord.expand.seller_id.name) : '—'}</span></div>
          
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Registrado por</span><span class="font-semibold">${user ? (window as any).esc(user.name || user.full_name) : '—'}</span></div>
          <div class="col-span-3"><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Observaciones</span><span>${(window as any).esc(ord.notes || 'Sin observaciones.')}</span></div>
        </div>

        <!-- Tabla de Artículos -->
        <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
          <table class="data-table w-full">
            <thead>
              <tr style="background:#F4F8FF">
                <th>Producto / Servicio</th>
                <th class="text-right" style="width:80px">Cant.</th>
                <th class="text-right" style="width:130px">Precio Unitario</th>
                <th class="text-right" style="width:80px">IVA</th>
                <th class="text-right" style="width:140px">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map((l: any) => `
                <tr>
                  <td class="font-semibold text-gray-800">${(window as any).esc(l.description || l.expand?.product_id?.name || 'Articulo')}</td>
                  <td class="text-right font-mono">${(window as any).fmt(l.qty)}</td>
                  <td class="text-right font-mono">${(window as any).fmt(l.unit_price)}</td>
                  <td class="text-right font-mono">${l.iva_rate}%</td>
                  <td class="text-right font-extrabold text-blue-700 font-mono">${(window as any).fmt(l.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Resumen Totales -->
        <div class="flex justify-end p-4 rounded-xl" style="background:#F9FAFB">
          <div class="text-sm space-y-1 min-w-80">
            <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal:</span> <span class="font-semibold font-mono">${(window as any).fmt(ord.subtotal || 0)}</span></div>
            <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA:</span>      <span class="font-semibold font-mono">${(window as any).fmt(ord.iva_total || 0)}</span></div>
            <div class="flex justify-between gap-8 text-base border-t pt-2 font-extrabold" style="border-color:#E5E7EB;color:#0D2137">
              <span>TOTAL PEDIDO:</span> <span class="font-extrabold text-blue-700 text-lg font-mono">${(window as any).fmt(ord.total || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const footer = `
      <div class="flex justify-between items-center w-full">
        <div class="flex gap-2">
          <button class="btn btn-outline" style="border-color:#3b82f6;color:#3b82f6" onclick="window.printOrderCarta('${ord.id}')"><i class="fas fa-print mr-1"></i> Imprimir Carta</button>
          <button class="btn btn-outline" style="border-color:#f97316;color:#f97316" onclick="window.printOrderTirilla('${ord.id}')"><i class="fas fa-receipt mr-1"></i> Imprimir Tirilla</button>
        </div>
        <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      </div>
    `;
    (window as any).openModal(`Detalle del Pedido: ${ord.number}`, detailHtml, footer, false);
  } catch (err: any) {
    (window as any).showToast('Error al cargar detalle del pedido: ' + err.message, 'error');
  }
};

// Editar Pedido
(window as any).editSalesOrder = function (orderId: string) {
  openOrderForm(orderId, () => {
    const activeContent = document.getElementById('page-content');
    if (activeContent) {
      renderPedidos(activeContent);
    }
  });
};

// Anular Pedido
(window as any).cancelSalesOrderDirect = async function (orderId: string, orderNumber: string) {
  const reason = prompt(`¿Estás seguro de que deseas ANULAR el pedido ${orderNumber}?\nEscribe el motivo:`);
  if (reason === null) return;
  if (!reason.trim()) {
    alert('Debes indicar un motivo de anulación.');
    return;
  }

  try {
    await (window as any).API.cancelSalesOrder(orderId, reason.trim());
    (window as any).showToast('Pedido anulado con éxito', 'success');

    const activeContent = document.getElementById('page-content');
    if (activeContent) {
      renderPedidos(activeContent);
    }
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al anular pedido', 'error');
  }
};

// Despachar Pedido a Logística
(window as any).dispatchSalesOrderDirect = async function (orderId: string) {
  try {
    const [ord, vehicles, lines] = await Promise.all([
      (window as any).pb.get('sales_orders', orderId, { expand: 'customer_id,warehouse_id' }),
      (window as any).pb.listAll('logistica_vehicles', { filter: 'active=true', sort: 'plate', expand: 'transportista_id' }).catch(() => []),
      (window as any).API.getSalesOrderLines(orderId),
    ]);

    const client = ord.expand?.customer_id;
    const activeVehicles = vehicles.filter((v: any) => v.status === 'DISPONIBLE');

    const modalHtml = `
      <div class="space-y-4 text-sm" style="color:#374151">
        <div class="p-3 rounded-xl bg-blue-50 border border-blue-200">
          <div class="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
            <i class="fas fa-truck text-blue-600"></i> Despacho de Mercancía — Pedido ${(window as any).esc(ord.number)}
          </div>
          <div class="text-xs text-blue-800">
            Cliente: <strong>${(window as any).esc(client?.name || '—')}</strong> | Total Pedido: <strong>${(window as any).fmt(ord.total || 0)}</strong>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label font-bold">Vehículo de Flota</label>
            <select id="dsp-veh-select" class="form-input">
              <option value="">-- Sin vehículo asignado aún --</option>
              ${activeVehicles.map((v: any) => `<option value="${v.id}">${v.plate} — ${(window as any).esc(v.expand?.transportista_id?.name || v.driver)} (${(window as any).fmtN(v.capacity)} Kg)</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label font-bold">Fecha de Despacho <span style="color:#EF4444">*</span></label>
            <input type="date" id="dsp-date" class="form-input" value="${(window as any).todayStr()}">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Dirección de Entrega / Obra</label>
          <input type="text" id="dsp-address" class="form-input" value="${(window as any).esc(client?.address || '')}" placeholder="Dirección física de destino...">
        </div>

        <div class="form-group">
          <label class="form-label font-bold">Observaciones / Instrucciones de Ruta</label>
          <textarea id="dsp-notes" class="form-input" rows="2" placeholder="Detalles para el transportista, persona que recibe, teléfono de contacto..."></textarea>
        </div>

        <div class="border rounded-xl p-3 bg-gray-50">
          <div class="text-xs font-bold uppercase text-gray-600 mb-2">Ítems a despachar (${lines.length})</div>
          <div class="max-h-36 overflow-y-auto space-y-1 text-xs">
            ${lines.map((l: any) => `
              <div class="flex justify-between border-b pb-1">
                <span>${(window as any).esc(l.expand?.product_id?.name || l.description)}</span>
                <span class="font-bold font-mono">${(window as any).fmtN(l.qty)} unds</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const footer = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-confirm-dispatch-order"><i class="fas fa-truck-ramp-box mr-1"></i> Programar Despacho</button>
    `;

    (window as any).openModal(`Programar Despacho para Pedido ${ord.number}`, modalHtml, footer, false);

    document.getElementById('btn-confirm-dispatch-order')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-confirm-dispatch-order') as HTMLButtonElement;
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Programando...'; }
      try {
        const vehicleId = (document.getElementById('dsp-veh-select') as HTMLSelectElement)?.value || null;
        const date = (document.getElementById('dsp-date') as HTMLInputElement)?.value || (window as any).todayStr();
        const address = (document.getElementById('dsp-address') as HTMLInputElement)?.value?.trim() || '';
        const notes = (document.getElementById('dsp-notes') as HTMLTextAreaElement)?.value?.trim() || '';

        await (window as any).SupplyChainOrchestrator.createDeliveryFromSalesOrder(orderId, {
          vehicleId,
          date,
          address,
          notes,
        });

        (window as any).showToast(`Despacho programado con éxito para el pedido ${ord.number}`, 'success');
        (window as any).closeModal();
        const activeContent = document.getElementById('page-content');
        if (activeContent) renderPedidos(activeContent);
      } catch (err: any) {
        (window as any).showToast(err.message || 'Error al programar despacho', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-truck-ramp-box mr-1"></i> Programar Despacho'; }
      }
    });
  } catch (err: any) {
    (window as any).showToast('Error al preparar despacho: ' + err.message, 'error');
  }
};

// Facturar Pedido desde Pedidos
(window as any).invoiceSalesOrderDirect = function (orderId: string) {
  (window as any).closeModal();
  // Exponer e ir a ventas cargando el pedido
  (window as any).navigate('ventas');
  setTimeout(() => {
    if (typeof (window as any).openSalesForm === 'function') {
      (window as any).openSalesForm(null, () => {
        // Al terminar de facturar, ir de vuelta a Pedidos
        (window as any).navigate('pedidos');
      }, orderId);
    }
  }, 250);
};

// Ver Factura Asociada
(window as any).viewSalesInvoiceFromOrder = function (invoiceId: string) {
  (window as any).closeModal();
  (window as any).navigate('ventas');
  setTimeout(() => {
    if (typeof (window as any).viewSalesInvoiceDetail === 'function') {
      (window as any).viewSalesInvoiceDetail(invoiceId);
    }
  }, 250);
};

// --- Impresión de Pedidos (Carta y Tirilla) ---
window.printOrderCarta = async function (orderId: string) {
  try {
    const ord = await (window as any).pb.get('sales_orders', orderId, { expand: 'customer_id,warehouse_id' });
    const lines = await (window as any).API.getSalesOrderLines(orderId);

    const [compName, compNit, compAddress, compPhone, compEmail, compCity, compCountry] = await Promise.all([
      (window as any).API.getSetting('company_name').catch(() => 'GRAVY S.A.S'),
      (window as any).API.getSetting('company_nit').catch(() => '901.442.115-3'),
      (window as any).API.getSetting('company_address').catch(() => ''),
      (window as any).API.getSetting('company_phone').catch(() => ''),
      (window as any).API.getSetting('company_email').catch(() => ''),
      (window as any).API.getSetting('company_city').catch(() => ''),
      (window as any).API.getSetting('company_country').catch(() => ''),
    ]);

    const printWin = window.open('', '_blank');
    if (!printWin) {
      (window as any).showToast('Por favor, permite abrir ventanas emergentes para imprimir.', 'warning');
      return;
    }

    const isCotizacion = String(ord.notes || '').toLowerCase().includes('cotiz') || String(ord.notes || '').toLowerCase().includes('presupuesto');
    const docTitle = isCotizacion ? 'COTIZACIÓN DE VENTA' : 'PEDIDO DE VENTA';

    const docStr = printWin.document;
    docStr.write(`
      <html>
      <head>
        <title>${docTitle} — ${ord.number}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #222; margin: 40px; font-size: 13px; line-height: 1.5; }
          .hdr-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .hdr-left { vertical-align: top; width: 60%; }
          .hdr-right { vertical-align: top; width: 40%; text-align: right; }
          .company-name { font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
          .document-title { font-size: 22px; font-weight: 800; color: #1e3a8a; margin-bottom: 5px; }
          .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; margin-bottom: 20px; }
          .box-title { font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 10px; color: #1e293b; }
          .details-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 8px; }
          .details-grid div span { font-weight: bold; color: #475569; }
          .lines-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .lines-table th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; }
          .lines-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .lines-table tr:last-child td { border-bottom: 2px solid #0f172a; }
          .totals-table { width: 40%; float: right; border-collapse: collapse; margin-bottom: 30px; }
          .totals-table td { padding: 8px 10px; }
          .totals-table tr.grand-total td { font-size: 15px; font-weight: bold; color: #1e3a8a; border-top: 1px solid #cbd5e1; }
          .footer { clear: both; text-align: center; border-top: 1.5px dashed #cbd5e1; padding-top: 20px; color: #64748b; font-size: 11px; margin-top: 40px; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <table class="hdr-table">
          <tr>
            <td class="hdr-left">
              <div class="company-name">${(window as any).esc(compName)}</div>
              <div>NIT: ${(window as any).esc(compNit)}</div>
              ${compAddress ? `<div>Dirección: ${(window as any).esc(compAddress)}</div>` : ''}
              ${compPhone ? `<div>Teléfono: ${(window as any).esc(compPhone)}</div>` : ''}
              ${compEmail ? `<div>Email: ${(window as any).esc(compEmail)}</div>` : ''}
              ${(compCity || compCountry) ? `<div>${(window as any).esc(compCity)}${compCity && compCountry ? ', ' : ''}${(window as any).esc(compCountry)}</div>` : ''}
            </td>
            <td class="hdr-right">
              <div class="document-title">${docTitle}</div>
              <div style="font-size:16px;font-weight:bold;color:#ef4444;margin-bottom:10px">${(window as any).esc(ord.number)}</div>
              <div>Fecha Emisión: ${(window as any).fmtDate(ord.date)}</div>
              ${ord.due_date ? `<div>Vencimiento/Entrega: ${(window as any).fmtDate(ord.due_date)}</div>` : ''}
              <div>Estado: <span style="font-weight:bold;text-transform:uppercase;color:${ord.status === 'invoiced' ? 'green' : (ord.status === 'cancelled' ? 'red' : 'orange')}">${ord.status === 'invoiced' ? 'FACTURADO' : (ord.status === 'cancelled' ? 'ANULADO' : 'PENDIENTE')}</span></div>
            </td>
          </tr>
        </table>

        <!-- Datos del Cliente -->
        <div class="box">
          <div class="box-title">Cliente / Adquirente</div>
          <div class="details-grid">
            <div><span>Nombre/Razón Social:</span> ${(window as any).esc(ord.expand?.customer_id?.name || '—')}</div>
            <div><span>NIT/Documento:</span> ${(window as any).esc(ord.expand?.customer_id?.doc_number || ord.expand?.customer_id?.nit || '—')}</div>
            <div><span>Dirección:</span> ${(window as any).esc(ord.expand?.customer_id?.address || '—')}</div>
            <div><span>Teléfono:</span> ${(window as any).esc(ord.expand?.customer_id?.phone || '—')}</div>
            <div><span>Bodega Despacho:</span> ${(window as any).esc(ord.expand?.warehouse_id?.name || '—')}</div>
            <div><span>Observaciones:</span> ${(window as any).esc(ord.notes || '—')}</div>
          </div>
        </div>

        <!-- Tabla de Artículos -->
        <table class="lines-table">
          <thead>
            <tr>
              <th>Detalle del Artículo / Servicio</th>
              <th style="text-align:right">Cantidad</th>
              <th style="text-align:right">Precio Unitario</th>
              <th style="text-align:right">IVA %</th>
              <th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map((l: any) => `
              <tr>
                <td style="font-weight:600">${(window as any).esc(l.expand?.product_id?.name || l.description || 'Línea de Pedido')}</td>
                <td style="text-align:right">${(window as any).fmtN(l.qty)}</td>
                <td style="text-align:right">${(window as any).fmt(l.unit_price)}</td>
                <td style="text-align:right">${l.iva_rate}%</td>
                <td style="text-align:right;font-weight:bold;color:#1e3a8a">${(window as any).fmt(l.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totales -->
        <table class="totals-table">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align:right;font-weight:600">${(window as any).fmt(ord.subtotal || 0)}</td>
          </tr>
          <tr>
            <td>IVA Calculado:</td>
            <td style="text-align:right;font-weight:600">${(window as any).fmt(ord.iva_total || 0)}</td>
          </tr>
          ${ord.discount_amount > 0 ? `
          <tr>
            <td style="color:#dc2626">Descuento:</td>
            <td style="text-align:right;font-weight:600;color:#dc2626">- ${(window as any).fmt(ord.discount_amount)}</td>
          </tr>
          ` : ''}
          <tr class="grand-total">
            <td>TOTAL PEDIDO:</td>
            <td style="text-align:right">${(window as any).fmt(ord.total || 0)}</td>
          </tr>
        </table>

        <div class="footer">
          <p>Este documento constituye un soporte administrativo de pedido/cotización y no representa una factura de venta ni título valor contable.</p>
          <p>Software de Gestión GRAVY v2.0 — Control Administrativo Autorizado.</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    docStr.close();
  } catch (err: any) {
    (window as any).showToast('Error al imprimir cotización en formato carta: ' + err.message, 'error');
  }
};

window.printOrderTirilla = async function (orderId: string) {
  try {
    const ord = await (window as any).pb.get('sales_orders', orderId, { expand: 'customer_id,warehouse_id' });
    const lines = await (window as any).API.getSalesOrderLines(orderId);

    const [compName, compNit, compAddress, compPhone, compEmail, compCity, compCountry] = await Promise.all([
      (window as any).API.getSetting('company_name').catch(() => 'GRAVY S.A.S'),
      (window as any).API.getSetting('company_nit').catch(() => '901.442.115-3'),
      (window as any).API.getSetting('company_address').catch(() => ''),
      (window as any).API.getSetting('company_phone').catch(() => ''),
      (window as any).API.getSetting('company_email').catch(() => ''),
      (window as any).API.getSetting('company_city').catch(() => ''),
      (window as any).API.getSetting('company_country').catch(() => ''),
    ]);

    const printWin = window.open('', '_blank');
    if (!printWin) {
      (window as any).showToast('Por favor, permite abrir ventanas emergentes para imprimir.', 'warning');
      return;
    }

    const isCotizacion = String(ord.notes || '').toLowerCase().includes('cotiz') || String(ord.notes || '').toLowerCase().includes('presupuesto');
    const docTitle = isCotizacion ? 'COTIZACIÓN DE VENTA' : 'PEDIDO DE VENTA';

    const docStr = printWin.document;
    docStr.write(`
      <html>
      <head>
        <title>${docTitle} — ${ord.number}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: monospace; font-size: 11px; margin: 5mm; color:#000; width: 70mm; line-height: 1.3; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .flex-between { display: flex; justify-content: space-between; }
          .hr { border-top: 1px dashed #000; margin: 5px 0; }
          .dbl-hr { border-top: 1.5px double #000; margin: 5px 0; }
          .total-row { font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size:13px">${(window as any).esc(compName)}</div>
        <div class="center">NIT: ${(window as any).esc(compNit)}</div>
        ${compAddress ? `<div class="center">${(window as any).esc(compAddress)}</div>` : ''}
        ${compPhone ? `<div class="center">Tel: ${(window as any).esc(compPhone)}</div>` : ''}
        <div class="dbl-hr"></div>
        <div class="center bold">${docTitle}</div>
        <div class="center bold">${(window as any).esc(ord.number)}</div>
        <div class="dbl-hr"></div>
        <div>Fecha: ${(window as any).fmtDate(ord.date)}</div>
        ${ord.due_date ? `<div>Vence: ${(window as any).fmtDate(ord.due_date)}</div>` : ''}
        <div>Cliente: ${(window as any).esc(ord.expand?.customer_id?.name || '—')}</div>
        <div>NIT/C.C: ${(window as any).esc(ord.expand?.customer_id?.doc_number || ord.expand?.customer_id?.nit || '—')}</div>
        <div class="dbl-hr"></div>
        <div class="flex-between bold"><span>DETALLE</span><span>TOTAL</span></div>
        <div class="hr"></div>
        ${lines.map((l: any) => `
          <div style="margin-bottom:3px">
            <div class="bold">${(window as any).esc(l.expand?.product_id?.name || l.description)}</div>
            <div style="color:#555;font-size:10px">Cód: ${(window as any).esc(l.expand?.product_id?.code || '—')} | IVA: ${l.iva_rate}%</div>
            <div class="flex-between">
              <span>${(window as any).fmtN(l.qty)} x ${(window as any).fmt(l.unit_price)}</span>
              <span>${(window as any).fmt(l.total)}</span>
            </div>
          </div>
        `).join('')}
        <div class="hr"></div>
        <div class="flex-between"><span>Subtotal:</span><span>${(window as any).fmt(ord.subtotal || 0)}</span></div>
        <div class="flex-between"><span>IVA:</span><span>${(window as any).fmt(ord.iva_total || 0)}</span></div>
        ${ord.discount_amount > 0 ? `<div class="flex-between" style="color:#dc2626"><span>Descuento:</span><span>-${(window as any).fmt(ord.discount_amount)}</span></div>` : ''}
        <div class="flex-between total-row"><span>TOTAL:</span><span>${(window as any).fmt(ord.total || 0)}</span></div>
        <div class="dbl-hr"></div>
        <div class="center" style="font-size:8px;color:#555">
          Este documento es un soporte administrativo y no posee validez como factura de venta ni título contable.
        </div>
        <script>
          window.onload = function() { window.print(); setTimeout(function(){ window.close(); }, 500); }
        </script>
      </body>
      </html>
    `);
    docStr.close();
  } catch (err: any) {
    (window as any).showToast('Error al imprimir cotización en formato tirilla: ' + err.message, 'error');
  }
};

// ── Modal de Toma de Pedidos en Cards Estilo E-Commerce para Móvil ─────────────
export async function openECommerceOrderModal(opts: {
  orderId?: string | null;
  preselectedCustomerId?: string | null;
  onDone?: () => void;
} = {}) {
  const { orderId = null, preselectedCustomerId = null, onDone = null } = opts;

  (window as any).showToast('Cargando catálogo para toma de pedido...', 'info');

  try {
    const [customers, warehouses, products, stockRows, incomingRows, salesConfig] = await Promise.all([
      (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
      (window as any).API.getWarehouses(true),
      (window as any).API.getProducts({ activeOnly: true }),
      (window as any).API.getInventoryStock().catch(() => []),
      (window as any).pb.listAll('import_items', { expand: 'import_id', filter: 'qty_available > 0' }).catch(() => []),
      getSalesConfig(),
    ]);

    const pricesIncludeIva = salesConfig.operational.prices_include_iva === true;
    const defaultWhId = salesConfig.operational.default_warehouse_id || '';
    const defaultDueDays = Number(salesConfig.operational.default_due_days ?? 30) || 0;
    const requireWarehouse = salesConfig.operational.require_warehouse_for_goods !== false;

    // Mapeo de stock físico por producto
    const stockMap: Record<string, number> = {};
    (stockRows || []).forEach((s: any) => {
      stockMap[s.product_id] = (stockMap[s.product_id] || 0) + Number(s.qty_on_hand || 0);
    });

    // Mapeo de unidades en tránsito de importación
    const incomingMap: Record<string, { qty: number; eta: string; importNumber: string }> = {};
    (incomingRows || []).forEach((inc: any) => {
      const pid = inc.product_id;
      const q = Number(inc.qty_available ?? inc.qty ?? 0);
      if (q > 0) {
        const prev = incomingMap[pid]?.qty || 0;
        const eta = inc.expand?.import_id?.estimated_arrival ? (window as any).fmtDate(inc.expand.import_id.estimated_arrival) : '';
        const impNumber = inc.expand?.import_id?.number || '';
        incomingMap[pid] = { qty: prev + q, eta, importNumber };
      }
    });

    // Estado del carrito: { [productId]: { product, qty, price, ivaRate } }
    const cart: Record<string, { product: any; qty: number; price: number; ivaRate: number }> = {};
    let activeCategory = '';
    let searchQuery = '';

    const categorias = [...new Set(products.map((p: any) => p.categoria).filter(Boolean))].sort();

    const esc = (window as any).esc;
    const fmt = (window as any).fmt;
    const fmtN = (window as any).fmtN;

    const preselectedCust = preselectedCustomerId ? customers.find((c: any) => c.id === preselectedCustomerId) : null;
    const initialCustDisplay = preselectedCust ? `${preselectedCust.name} (${preselectedCust.doc_number || preselectedCust.nit || 'S/N'})` : '';

    const modalHtml = `
      <div class="flex flex-col h-full max-h-[85vh] text-slate-800 -m-4 sm:-m-6 relative select-none" id="ecom-order-app">
        
        <!-- Header Superior: Cliente y Bodega -->
        <div class="p-3.5 bg-slate-900 text-white flex flex-col gap-2 rounded-t-2xl shadow-md">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-[#006876] flex items-center justify-center text-xs text-white">
                <i class="fas fa-bag-shopping"></i>
              </span>
              <span class="font-extrabold text-sm tracking-tight text-white">Toma de Pedido Móvil</span>
              ${pricesIncludeIva ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">IVA Inc.</span>' : '<span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">Tax-Ex</span>'}
            </div>
            <button type="button" class="text-slate-400 hover:text-white p-1 text-sm" onclick="window.closeModal()">
              <i class="fas fa-xmark text-lg"></i>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            <!-- Selector Dinámico de Cliente -->
            <div class="relative">
              <div class="relative flex items-center">
                <input type="text" id="ecom-customer-search-inp" autocomplete="off"
                       placeholder="🔍 Buscar cliente (NIT, nombre, ciudad)..." 
                       value="${esc(initialCustDisplay)}"
                       class="w-full bg-slate-800 text-white placeholder-slate-400 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl border border-slate-700 outline-none focus:border-teal-500">
                <input type="hidden" id="ecom-customer-id" value="${esc(preselectedCustomerId || '')}">
                
                <button type="button" id="ecom-customer-clear-btn" class="absolute right-2 text-slate-400 hover:text-rose-400 p-1 ${preselectedCustomerId ? '' : 'hidden'}" title="Limpiar Cliente">
                  <i class="fas fa-times-circle text-xs"></i>
                </button>
              </div>

              <!-- Dropdown Flotante Dinámico de Resultados -->
              <div id="ecom-customer-results" class="hidden absolute left-0 right-0 top-full mt-1 max-h-52 overflow-y-auto bg-white text-slate-800 border border-slate-200 rounded-xl shadow-2xl z-50 divide-y divide-slate-100">
              </div>
            </div>

            <!-- Selector Bodega y Modo -->
            <div class="flex gap-2">
              <select id="ecom-warehouse-sel" class="flex-1 bg-slate-800 text-white text-xs font-semibold px-2 py-2 rounded-xl border border-slate-700 outline-none">
                <option value="">— Bodega Principal —</option>
                ${warehouses.map((w: any) => `<option value="${esc(w.id)}"${(defaultWhId === w.id) ? ' selected' : ''}>${esc(w.name)}</option>`).join('')}
              </select>
              <select id="ecom-mode-sel" class="bg-slate-800 text-white text-xs font-bold px-2 py-2 rounded-xl border border-slate-700 outline-none">
                <option value="venta">🛍️ Venta</option>
                <option value="reserva">📦 Reserva</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Buscador y Slider de Categorías -->
        <div class="p-3 bg-white border-b border-slate-200 shadow-2xs space-y-2 sticky top-0 z-20">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input id="ecom-search-input" 
                   type="text" 
                   placeholder="Buscar producto, referencia o código..." 
                   class="w-full pl-8 pr-8 py-2 bg-slate-100 text-xs rounded-xl border-none font-medium text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-600">
            <button id="ecom-clear-search" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs hidden">
              <i class="fas fa-circle-xmark"></i>
            </button>
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs" id="ecom-pills-slider">
            <button class="ecom-cat-btn px-3 py-1 rounded-full font-extrabold whitespace-nowrap bg-teal-900 text-white shadow-2xs transition-all" data-cat="">
              Todos
            </button>
            ${categorias.map((cat: string) => `
              <button class="ecom-cat-btn px-3 py-1 rounded-full font-semibold whitespace-nowrap bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all" data-cat="${esc(cat)}">
                ${esc(cat)}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Grid de Tarjetas E-Commerce de Producto -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-50" id="ecom-products-scroll" style="min-height: 280px; max-height: calc(85vh - 240px);">
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3" id="ecom-cards-list">
            <!-- Dynamic Cards -->
          </div>
        </div>

        <!-- Barra Flotante de Carrito -->
        <div class="p-3 bg-white border-t border-slate-200 shadow-lg flex items-center justify-between gap-3 sticky bottom-0 z-30 rounded-b-2xl" id="ecom-cart-bottom-bar">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-extrabold text-sm relative shadow-xs">
              <i class="fas fa-cart-shopping"></i>
              <span id="ecom-cart-badge" class="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold border-2 border-white">0</span>
            </div>
            <div>
              <span class="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Total Pedido</span>
              <span id="ecom-cart-total-txt" class="text-sm sm:text-base font-extrabold text-slate-900">$ 0</span>
            </div>
          </div>

          <button id="ecom-btn-open-drawer" class="btn btn-primary px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 bg-[#006876] hover:bg-[#004F5A] text-white shadow-md">
            <span>Ver Pedido</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>

        <!-- Bottom Sheet / Drawer de Confirmación de Pedido -->
        <div id="ecom-drawer-overlay" style="display:none" class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex flex-col justify-end">
          <div class="bg-white rounded-t-3xl max-h-[90%] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div class="p-4 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center text-sm font-bold">
                  <i class="fas fa-receipt"></i>
                </span>
                <div>
                  <h4 class="font-extrabold text-sm text-slate-900">Resumen del Pedido</h4>
                  <p class="text-[10px] text-slate-500 font-semibold" id="ecom-drawer-client-lbl">Cliente: Selecciona uno arriba</p>
                </div>
              </div>
              <button id="ecom-btn-close-drawer" class="text-slate-400 hover:text-slate-700 p-1.5 text-base">
                <i class="fas fa-xmark"></i>
              </button>
            </div>

            <!-- Lista de Ítems en Carrito -->
            <div class="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100" id="ecom-drawer-items" style="max-height: 42vh">
              <!-- Item rows -->
            </div>

            <!-- Totales y Confirmar -->
            <div class="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <input id="ecom-drawer-notes" type="text" placeholder="Observaciones / Instrucciones de entrega..." class="w-full form-input text-xs py-2">
              
              <div class="flex justify-between items-baseline pt-1">
                <span class="text-xs font-bold text-slate-600">Total Neto a Registrar:</span>
                <span id="ecom-drawer-total-sum" class="text-lg font-extrabold text-blue-900">$ 0</span>
              </div>

              <button id="ecom-btn-save-final" class="w-full btn btn-primary py-3 rounded-xl font-extrabold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center gap-2">
                <i class="fas fa-circle-check"></i>
                <span>Confirmar y Guardar Pedido</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    (window as any).openModal('Toma de Pedido Móvil', modalHtml, '', true);

    const cardsContainer = document.getElementById('ecom-cards-list');
    const searchInput = document.getElementById('ecom-search-input') as HTMLInputElement;
    const clearSearchBtn = document.getElementById('ecom-clear-search');
    const badgeEl = document.getElementById('ecom-cart-badge');
    const totalTxtEl = document.getElementById('ecom-cart-total-txt');
    const drawerOverlay = document.getElementById('ecom-drawer-overlay');
    const drawerItemsEl = document.getElementById('ecom-drawer-items');
    const drawerTotalSum = document.getElementById('ecom-drawer-total-sum');
    const drawerClientLbl = document.getElementById('ecom-drawer-client-lbl');

    const custSearchInput = document.getElementById('ecom-customer-search-inp') as HTMLInputElement;
    const custHiddenId = document.getElementById('ecom-customer-id') as HTMLInputElement;
    const custClearBtn = document.getElementById('ecom-customer-clear-btn') as HTMLButtonElement;
    const custResults = document.getElementById('ecom-customer-results') as HTMLElement;

    const renderCustResults = (query: string) => {
      const q = (query || '').toLowerCase().trim();
      const filtered = !q 
        ? customers.slice(0, 25) 
        : customers.filter((c: any) => {
            const matchStr = `${c.name || ''} ${c.doc_number || ''} ${c.nit || ''} ${c.city || ''} ${c.phone || ''}`.toLowerCase();
            return matchStr.includes(q);
          }).slice(0, 25);

      if (!filtered.length) {
        custResults.innerHTML = `
          <div class="p-3 text-center text-xs text-slate-400">
            <i class="fas fa-user-slash mr-1"></i> No se encontraron clientes
          </div>
        `;
        custResults.classList.remove('hidden');
        return;
      }

      custResults.innerHTML = filtered.map((c: any) => `
        <div class="p-2.5 hover:bg-teal-50 cursor-pointer flex items-center justify-between gap-2 transition-colors item-cust-pick" data-id="${esc(c.id)}">
          <div class="min-w-0">
            <h5 class="font-extrabold text-xs text-slate-900 truncate">${esc(c.name)}</h5>
            <p class="text-[10px] text-slate-500 truncate">
              Doc: <span class="font-mono font-bold text-slate-700">${esc(c.doc_number || c.nit || 'S/N')}</span>
              ${c.city ? ` · 📍 ${esc(c.city)}` : ''}
              ${c.phone ? ` · 📞 ${esc(c.phone)}` : ''}
            </p>
          </div>
          <span class="text-[10px] bg-slate-100 text-teal-700 font-bold px-2 py-0.5 rounded-md flex-shrink-0">Seleccionar</span>
        </div>
      `).join('');

      custResults.querySelectorAll('.item-cust-pick').forEach((item: any) => {
        item.addEventListener('click', () => {
          const selId = item.dataset.id;
          const selCust = customers.find((c: any) => c.id === selId);
          if (selCust) {
            custHiddenId.value = selCust.id;
            custSearchInput.value = `${selCust.name} (${selCust.doc_number || selCust.nit || 'S/N'})`;
            custClearBtn.classList.remove('hidden');
            custResults.classList.add('hidden');
            if (drawerClientLbl) drawerClientLbl.textContent = selCust.name;
          }
        });
      });

      custResults.classList.remove('hidden');
    };

    custSearchInput?.addEventListener('focus', () => renderCustResults(custSearchInput.value));
    custSearchInput?.addEventListener('input', () => {
      custHiddenId.value = '';
      custClearBtn.classList.toggle('hidden', !custSearchInput.value);
      renderCustResults(custSearchInput.value);
    });

    custClearBtn?.addEventListener('click', () => {
      custHiddenId.value = '';
      custSearchInput.value = '';
      custClearBtn.classList.add('hidden');
      if (drawerClientLbl) drawerClientLbl.textContent = 'Cliente no seleccionado';
      custSearchInput.focus();
      renderCustResults('');
    });

    document.addEventListener('click', (ev: any) => {
      if (!ev.target.closest('#ecom-customer-search-inp') && !ev.target.closest('#ecom-customer-results')) {
        custResults?.classList.add('hidden');
      }
    });

    // Render Cards in Catalog
    function renderCards() {
      if (!cardsContainer) return;
      const q = searchQuery.toLowerCase().trim();

      const filtered = products.filter((p: any) => {
        const matchesCat = !activeCategory || p.categoria === activeCategory;
        const matchesQ = !q || `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q);
        return matchesCat && matchesQ;
      });

      if (!filtered.length) {
        cardsContainer.innerHTML = `
          <div class="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <i class="fas fa-box-open text-3xl mb-2 text-slate-300"></i>
            <p class="text-xs font-semibold">No se encontraron productos con estos criterios.</p>
          </div>
        `;
        return;
      }

      cardsContainer.innerHTML = filtered.map((p: any) => {
        const onHand = Number(stockMap[p.id] || 0);
        const incoming = incomingMap[p.id];
        const currentQty = cart[p.id]?.qty || 0;
        const imageUrl = p.image 
          ? `${(window as any).PB_URL}/api/files/products/${p.id}/${p.image}?thumb=300x300${(window as any).pb.authToken ? '&token=' + (window as any).pb.authToken : ''}`
          : '';

        let stockBadge = '';
        if (p.type === 'SERVICIO') {
          stockBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">Servicio</span>`;
        } else if (onHand > 10) {
          stockBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800"><i class="fas fa-circle-check mr-1"></i>${fmtN(onHand)} en bodega</span>`;
        } else if (onHand > 0) {
          stockBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-800"><i class="fas fa-triangle-exclamation mr-1"></i>Últimas ${fmtN(onHand)}</span>`;
        } else if (incoming && incoming.qty > 0) {
          stockBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800"><i class="fas fa-ship mr-1"></i>Reserva (+${fmtN(incoming.qty)})</span>`;
        } else {
          stockBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-800"><i class="fas fa-ban mr-1"></i>Agotado</span>`;
        }

        return `
          <div class="ecom-p-card bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200 shadow-xs flex flex-col justify-between" data-id="${p.id}">
            <div>
              <div class="relative w-full aspect-square bg-slate-50 rounded-xl overflow-hidden mb-2 border border-slate-100 flex items-center justify-center">
                ${imageUrl ? `
                  <img src="${imageUrl}" alt="${esc(p.name)}" class="w-full h-full object-cover">
                ` : `
                  <i class="fas fa-box-open text-slate-300 text-2xl"></i>
                `}
                ${incoming && incoming.qty > 0 ? `
                  <span class="absolute top-1.5 left-1.5 text-[8px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-md shadow-2xs" title="Llega: ${incoming.eta || 'Pronto'}">
                    <i class="fas fa-ship mr-0.5"></i>ETA ${incoming.eta?.slice(0, 5) || 'Pronto'}
                  </span>
                ` : ''}
              </div>

              <div class="mb-1">
                ${stockBadge}
              </div>

              <p class="text-[9px] font-mono text-slate-400 uppercase truncate">${esc(p.code)}</p>
              <h4 class="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2 mt-0.5">${esc(p.name)}</h4>
            </div>

            <div class="mt-2 pt-2 border-t border-slate-100">
              <div class="flex items-baseline justify-between mb-2">
                <span class="text-xs sm:text-sm font-extrabold text-blue-900">${p.base_price ? fmt(p.base_price) : '$ 0'}</span>
                <span class="text-[9px] font-bold ${pricesIncludeIva ? 'text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded' : 'text-slate-400'}">${pricesIncludeIva ? `IVA ${p.iva_rate ?? 0}% inc.` : `+ IVA ${p.iva_rate ?? 0}%`}</span>
              </div>

              <!-- Stepper Táctil [ - ] [ Cantidad ] [ + ] -->
              <div class="flex items-center justify-between bg-slate-100 rounded-xl p-1">
                <button type="button" class="btn-step-minus w-7 h-7 rounded-lg bg-white text-slate-700 font-extrabold flex items-center justify-center shadow-xs active:scale-90" data-id="${p.id}">
                  <i class="fas fa-minus text-[10px]"></i>
                </button>
                <span class="font-extrabold text-xs text-slate-900 px-2 stepper-qty-val-${p.id}">
                  ${currentQty}
                </span>
                <button type="button" class="btn-step-plus w-7 h-7 rounded-lg bg-[#006876] text-white font-extrabold flex items-center justify-center shadow-xs active:scale-90" data-id="${p.id}">
                  <i class="fas fa-plus text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Wire Stepper Buttons
      cardsContainer.querySelectorAll('.btn-step-plus').forEach((btn: any) => {
        btn.addEventListener('click', () => {
          const pid = btn.dataset.id;
          const prod = products.find((p: any) => p.id === pid);
          if (!prod) return;
          if (!cart[pid]) {
            cart[pid] = { product: prod, qty: 0, price: Number(prod.base_price || 0), ivaRate: Number(prod.iva_rate || 0) };
          }
          cart[pid].qty += 1;
          updateCartUI();
        });
      });

      cardsContainer.querySelectorAll('.btn-step-minus').forEach((btn: any) => {
        btn.addEventListener('click', () => {
          const pid = btn.dataset.id;
          if (cart[pid]) {
            cart[pid].qty -= 1;
            if (cart[pid].qty <= 0) {
              delete cart[pid];
            }
            updateCartUI();
          }
        });
      });
    }

    // Update Totals & Floating Bar UI
    function updateCartUI() {
      let totalItems = 0;
      let totalMonto = 0;

      Object.keys(cart).forEach((pid) => {
        const item = cart[pid];
        const qty = item.qty;
        const p = item.price;
        const iva = item.ivaRate;
        totalItems += qty;

        const lineTotal = pricesIncludeIva ? (qty * p) : (qty * p * (1 + iva / 100));
        totalMonto += lineTotal;

        // Update stepper badge on screen
        const qtyEl = document.querySelector(`.stepper-qty-val-${pid}`);
        if (qtyEl) qtyEl.textContent = String(qty);
      });

      // Clear zeroed items
      products.forEach((p: any) => {
        if (!cart[p.id]) {
          const qtyEl = document.querySelector(`.stepper-qty-val-${p.id}`);
          if (qtyEl) qtyEl.textContent = '0';
        }
      });

      if (badgeEl) badgeEl.textContent = String(totalItems);
      if (totalTxtEl) totalTxtEl.textContent = fmt(totalMonto);
      if (drawerTotalSum) drawerTotalSum.textContent = fmt(totalMonto);
    }

    // Render Drawer items
    function renderDrawer() {
      if (!drawerItemsEl) return;
      const items = Object.values(cart).filter(i => i.qty > 0);

      const custName = custSearchInput.value;
      if (drawerClientLbl) {
        drawerClientLbl.textContent = custName ? `Cliente: ${custName}` : '⚠️ Sin cliente seleccionado';
      }

      if (!items.length) {
        drawerItemsEl.innerHTML = `
          <div class="py-8 text-center text-slate-400">
            <i class="fas fa-cart-arrow-down text-2xl mb-1 text-slate-300"></i>
            <p class="text-xs font-semibold">El carrito está vacío. Agrega productos desde el catálogo.</p>
          </div>
        `;
        return;
      }

      drawerItemsEl.innerHTML = items.map(item => {
        const p = item.product;
        const lineTotal = pricesIncludeIva ? (item.qty * item.price) : (item.qty * item.price * (1 + item.ivaRate / 100));

        return `
          <div class="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
            <div class="flex-1 min-w-0">
              <h5 class="font-extrabold text-xs text-slate-900 truncate">${esc(p.name)}</h5>
              <p class="text-[10px] text-slate-500 font-mono">${esc(p.code)} · ${fmt(item.price)} c/u</p>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <div class="flex items-center bg-slate-100 rounded-lg p-0.5">
                <button type="button" class="drawer-step-min w-6 h-6 rounded bg-white text-slate-700 font-bold text-[10px] flex items-center justify-center shadow-xs" data-id="${p.id}">-</button>
                <span class="font-extrabold text-xs px-2">${item.qty}</span>
                <button type="button" class="drawer-step-plus w-6 h-6 rounded bg-[#006876] text-white font-bold text-[10px] flex items-center justify-center shadow-xs" data-id="${p.id}">+</button>
              </div>
              <span class="font-extrabold text-xs text-blue-900 w-16 text-right">${fmt(lineTotal)}</span>
            </div>
          </div>
        `;
      }).join('');

      drawerItemsEl.querySelectorAll('.drawer-step-plus').forEach((b: any) => {
        b.addEventListener('click', () => {
          const pid = b.dataset.id;
          if (cart[pid]) {
            cart[pid].qty += 1;
            updateCartUI();
            renderDrawer();
          }
        });
      });

      drawerItemsEl.querySelectorAll('.drawer-step-min').forEach((b: any) => {
        b.addEventListener('click', () => {
          const pid = b.dataset.id;
          if (cart[pid]) {
            cart[pid].qty -= 1;
            if (cart[pid].qty <= 0) delete cart[pid];
            updateCartUI();
            renderDrawer();
          }
        });
      });
    }

    // Category slider events
    document.querySelectorAll('.ecom-cat-btn').forEach((btn: any) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ecom-cat-btn').forEach((b: any) => {
          b.className = 'ecom-cat-btn px-3 py-1 rounded-full font-semibold whitespace-nowrap bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all';
        });
        btn.className = 'ecom-cat-btn px-3 py-1 rounded-full font-extrabold whitespace-nowrap bg-teal-900 text-white shadow-2xs transition-all';
        activeCategory = btn.dataset.cat || '';
        renderCards();
      });
    });

    // Search events
    searchInput?.addEventListener('input', () => {
      searchQuery = searchInput.value;
      if (clearSearchBtn) clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
      renderCards();
    });

    clearSearchBtn?.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      renderCards();
    });

    // Drawer open / close
    document.getElementById('ecom-btn-open-drawer')?.addEventListener('click', () => {
      renderDrawer();
      if (drawerOverlay) drawerOverlay.style.display = 'flex';
    });

    document.getElementById('ecom-btn-close-drawer')?.addEventListener('click', () => {
      if (drawerOverlay) drawerOverlay.style.display = 'none';
    });

    // Final Order Save
    document.getElementById('ecom-btn-save-final')?.addEventListener('click', async () => {
      try {
        const customerId = custHiddenId.value;
        if (!customerId) throw new Error('Por favor selecciona un cliente para el pedido.');

        const items = Object.values(cart).filter(i => i.qty > 0);
        if (!items.length) throw new Error('El pedido debe tener al menos un producto.');

        const warehouseId = (document.getElementById('ecom-warehouse-sel') as HTMLSelectElement)?.value || null;
        const mode = (document.getElementById('ecom-mode-sel') as HTMLSelectElement)?.value || 'venta';
        const notes = (document.getElementById('ecom-drawer-notes') as HTMLInputElement)?.value.trim() || (mode === 'reserva' ? 'Reserva de stock en preventa' : '');

        if (requireWarehouse && !warehouseId) {
          const hasPhysicalProducts = items.some(i => i.product?.type !== 'service');
          if (hasPhysicalProducts) {
            throw new Error('Debes seleccionar una bodega para los productos físicos según los parámetros de facturación.');
          }
        }

        const lines: any[] = items.map(item => {
          const p = item.product;
          const qty = item.qty;
          const price = item.price;
          const ivaRate = item.ivaRate;
          
          let unitPriceDb = price;
          let subtotal = 0;
          let ivaAmount = 0;
          let total = 0;

          if (pricesIncludeIva) {
            total = roundDec(qty * price, 2);
            subtotal = roundDec(total / (1 + ivaRate / 100), 2);
            ivaAmount = roundDec(total - subtotal, 2);
            unitPriceDb = qty > 0 ? roundDec(subtotal / qty, 4) : roundDec(price / (1 + ivaRate / 100), 4);
          } else {
            subtotal = roundDec(qty * price, 2);
            ivaAmount = roundDec(subtotal * (ivaRate / 100), 2);
            total = roundDec(subtotal + ivaAmount, 2);
            unitPriceDb = roundDec(price, 4);
          }

          return {
            product_id: p.id,
            description: p.name,
            qty,
            unit_price: unitPriceDb,
            iva_rate: ivaRate,
            iva_amount: ivaAmount,
            subtotal,
            total,
          };
        });

        const header = {
          customer_id: customerId,
          warehouse_id: warehouseId,
          date: (window as any).todayStr(),
          due_date: (window as any).addDaysToDateStr((window as any).todayStr(), mode === 'reserva' ? 7 : (defaultDueDays || 30)),
          notes,
        };

        const saveBtn = document.getElementById('ecom-btn-save-final') as HTMLButtonElement;
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando Pedido...';
        }

        const createdOrder = await (window as any).API.createSalesOrder(header, lines);
        (window as any).showToast(`Pedido #${createdOrder.number} registrado con éxito`, 'success');
        (window as any).closeModal();
        if (onDone) onDone();
      } catch (err: any) {
        (window as any).showToast(err.message || 'Error al guardar el pedido', 'error');
        const saveBtn = document.getElementById('ecom-btn-save-final') as HTMLButtonElement;
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fas fa-circle-check"></i> <span>Confirmar y Guardar Pedido</span>';
        }
      }
    });

    // Initial render of cards
    renderCards();

  } catch (err: any) {
    (window as any).showToast('Error al inicializar toma de pedido e-commerce: ' + err.message, 'error');
  }
}

// Exponer globalmente
(window as any).openECommerceOrderModal = openECommerceOrderModal;
(window as any).renderPedidos = renderPedidos;
