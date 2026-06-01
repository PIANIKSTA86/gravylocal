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
  pending:   { label: 'Pendiente',   badge: 'badge-orange' },
  invoiced:  { label: 'Facturado',   badge: 'badge-green'  },
  cancelled: { label: 'Cancelado',   badge: 'badge-red'    },
};

// --- Render Principal ---
export async function renderPedidos(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando historial de pedidos...</div>`;
  try {
    await _loadPedidosPage(container);
  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
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
      ${orderKpi('Total pedidos',     total,                     'fas fa-file-signature',      '#1A4B8C', '#EEF4FF')}
      ${orderKpi('Pendientes',        pending,                   'fas fa-clock',               '#C46516', '#FFF8F0')}
      ${orderKpi('Facturados',        invoiced,                  'fas fa-check-double',        '#059669', '#ECFDF5')}
      ${orderKpi('Valor total activos', (window as any).fmt(totalVal), 'fas fa-coins',               '#7C3AED', '#F5F3FF')}
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

  document.getElementById('btn-new-order')?.addEventListener('click', () => openOrderForm(null, () => _loadPedidosPage(c)));

  const applyFilter = () => filterOrderTable();
  document.getElementById('ord-q')?.addEventListener('input', applyFilter);
  document.getElementById('ord-status-f')?.addEventListener('change', applyFilter);
  document.getElementById('ord-from')?.addEventListener('change', applyFilter);
  document.getElementById('ord-to')?.addEventListener('change', applyFilter);
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
  return `
    <tr data-ordid="${(window as any).esc(ord.id)}" data-ordstatus="${(window as any).esc(ord.status)}" data-orddate="${(window as any).esc(ord.date)}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(ord.number)}</span></td>
      <td>${(window as any).esc(ord.date)}</td>
      <td class="font-medium">${client ? (window as any).esc(client.name) : '—'}</td>
      <td class="text-sm">${wh ? (window as any).esc(wh.name) : '—'}</td>
      <td class="text-right">${(window as any).fmt(ord.subtotal || 0)}</td>
      <td class="text-right">${ord.iva_total ? (window as any).fmt(ord.iva_total) : '—'}</td>
      <td class="text-right font-semibold">${(window as any).fmt(ord.total || 0)}</td>
      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="window.viewSalesOrderDetail('${(window as any).esc(ord.id)}')"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm text-blue-600" style="border-color:#3b82f6" title="Imprimir Carta" onclick="window.printOrderCarta('${(window as any).esc(ord.id)}')"><i class="fas fa-print"></i></button>
          <button class="btn btn-outline btn-sm text-orange-600" style="border-color:#f97316" title="Imprimir Tirilla" onclick="window.printOrderTirilla('${(window as any).esc(ord.id)}')"><i class="fas fa-receipt"></i></button>
          ${ord.status === 'pending' ? `
            <button class="btn btn-outline btn-sm" title="Editar" style="border-color:#1A4B8C;color:#1A4B8C" onclick="window.editSalesOrder('${(window as any).esc(ord.id)}')"><i class="fas fa-pen"></i></button>
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
async function openOrderForm(orderId: string | null = null, onDone: any = null) {
  let ord: any = null, existingLines: any[] = [];

  const [customers, warehouses, products] = await Promise.all([
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getWarehouses(true),
    (window as any).API.getProducts({ activeOnly: true }),
  ]);

  if (orderId) {
    [ord, existingLines] = await Promise.all([
      (window as any).pb.get('sales_orders', orderId, { expand: 'customer_id,warehouse_id' }),
      (window as any).API.getSalesOrderLines(orderId),
    ]);
  }

  let lineCounter = 0;
  const orderDate = ord?.date || (window as any).todayStr();
  const orderDueDate = ord?.due_date || (window as any).addDaysToDateStr(orderDate, 5);

  const formHtml = `
    <div class="space-y-6 text-sm" style="color:#374151">
      <!-- Encabezado -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl" style="background:#F9FAFB;border:1px solid #E5E7EB">
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
          <label class="form-label font-bold">Bodega de Despacho</label>
          <select id="ord-warehouse" class="form-input">
            <option value="">— Sin bodega —</option>
            ${warehouses.map(w => `<option value="${(window as any).esc(w.id)}"${(ord?.warehouse_id === w.id || (!ord && warehouses.length === 1)) ? ' selected' : ''}>${(window as any).esc(w.name)}</option>`).join('')}
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
        <div class="form-group col-span-1 md:col-span-3">
          <label class="form-label font-bold">Observaciones / Notas</label>
          <input id="ord-notes" class="form-input" placeholder="Ej: entrega en oficina principal, cotización válida por 15 días, etc." value="${(window as any).esc(ord?.notes || '')}">
        </div>
      </div>

      <!-- Líneas de Pedido -->
      <div class="border rounded-xl overflow-hidden mb-3" style="border-color:#E5E7EB">
        <div class="flex items-center justify-between px-4 py-2 flex-wrap gap-2" style="background:#F9FAFB;border-bottom:1px solid #E5E7EB">
          <span class="text-sm font-semibold" style="color:#0D2137"><i class="fas fa-boxes mr-1"></i> Artículos / Servicios</span>
          <button type="button" class="btn btn-outline btn-sm" id="btn-add-ord-line"><i class="fas fa-plus"></i> Agregar línea</button>
        </div>

        <div style="overflow-x:auto;max-height:300px;overflow-y:auto">
          <table class="data-table" id="ord-lines-table" style="min-width:740px">
            <thead style="position:sticky;top:0;z-index:10">
              <tr>
                <th style="min-width:260px;background:#F4F8FF;color:#374151">Producto / Servicio</th>
                <th class="text-right" style="width:80px;background:#F4F8FF;color:#374151">Cant.</th>
                <th class="text-right" style="width:130px;background:#F4F8FF;color:#374151">P. Unitario</th>
                <th class="text-right" style="width:80px;background:#F4F8FF;color:#374151">IVA %</th>
                <th class="text-right" style="width:135px;background:#F4F8FF;color:#374151">Total línea</th>
                <th style="width:58px;background:#F4F8FF;color:#374151">Acción</th>
              </tr>
            </thead>
            <tbody id="ord-lines-body"></tbody>
          </table>
        </div>
      </div>

      <!-- Totales -->
      <div class="flex justify-end p-4 rounded-xl" style="background:#F9FAFB">
        <div class="text-sm space-y-1 min-w-80 font-medium">
          <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal:</span> <span id="ord-total-sub" class="font-semibold">$ 0</span></div>
          <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA:</span>      <span id="ord-total-iva" class="font-semibold">$ 0</span></div>
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
  }

  (window as any).selectOrdCustomer = function(id: string, text: string) {
    const hidden = document.getElementById('ord-customer-id') as HTMLInputElement;
    const input = document.getElementById('ord-customer-search') as HTMLInputElement;
    if (hidden && input) {
      hidden.value = id;
      input.value = text;
    }
  };

  (window as any).ordQuickAddCustomer = function() {
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
  (window as any).addOrdLine = function(line: any = null) {
    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('ord-lines-body');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.id = `ord-row-${idx}`;
    tr.innerHTML = `
      <td>
        <div id="ordl-prod-wrap-${idx}" class="relative">
          <input id="ordl-prod-search-${idx}" class="form-input w-full" autocomplete="off" placeholder="Buscar producto o servicio...">
          <input type="hidden" id="ordl-prod-id-${idx}" value="${line?.product_id || ''}">
          <div id="ordl-prod-results-${idx}" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:180px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:45"></div>
        </div>
      </td>
      <td><input type="number" id="ordl-qty-${idx}" class="form-input text-right w-full font-semibold" min="0.001" step="0.001" value="${line?.qty || '1'}" oninput="window.ordRecalcLine(${idx})"></td>
      <td><input type="number" id="ordl-price-${idx}" class="form-input text-right w-full" min="0" step="0.01" value="${line?.unit_price || ''}" oninput="window.ordRecalcLine(${idx})"></td>
      <td><input type="number" id="ordl-iva-${idx}" class="form-input text-right w-full" min="0" max="100" step="1" value="${line?.iva_rate ?? '19'}" oninput="window.ordRecalcLine(${idx})"></td>
      <td class="text-right font-extrabold text-blue-700" id="ordl-total-${idx}">$ 0</td>
      <td class="text-center">
        <button type="button" class="btn btn-danger btn-sm p-1.5" onclick="this.closest('tr').remove(); window.ordRecalcTotals();" title="Quitar línea"><i class="fas fa-trash-can"></i></button>
      </td>
    `;
    tbody.appendChild(tr);

    // Inicializar autocompletar producto para la línea
    const input = document.getElementById(`ordl-prod-search-${idx}`) as HTMLInputElement;
    const hidden = document.getElementById(`ordl-prod-id-${idx}`) as HTMLInputElement;
    const results = document.getElementById(`ordl-prod-results-${idx}`);
    const priceInput = document.getElementById(`ordl-price-${idx}`) as HTMLInputElement;
    const ivaInput = document.getElementById(`ordl-iva-${idx}`) as HTMLInputElement;

    if (line && line.product_id) {
      const match = products.find(p => p.id === line.product_id);
      if (match) {
        input.value = `${match.code} - ${match.name}`;
      }
    }

    const performProdSearch = (val: string) => {
      const q = val.toLowerCase().trim();
      const filtered = !q 
        ? products.slice(0, 30) 
        : products.filter(p => `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 30);

      if (!filtered.length) {
        if (results) results.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400">Sin coincidencias</div>';
        return;
      }

      if (results) {
        results.innerHTML = filtered.map(p => `
          <button type="button" class="w-full text-left px-3 py-2 text-xs border-none bg-white hover:bg-gray-100 cursor-pointer block"
                  onclick="window.selectOrdLineProduct(${idx}, '${(window as any).esc(p.id)}', '${(window as any).esc(p.code)} - ${(window as any).esc(p.name)}', ${p.base_price || 0}, ${p.iva_rate ?? 19})">
            <div class="font-bold text-gray-800">${(window as any).esc(p.name)}</div>
            <div class="text-[10px] text-gray-500">SKU: ${p.code} | Precio: ${(window as any).fmt(p.base_price || 0)}</div>
          </button>
        `).join('');
      }
    };

    input.addEventListener('focus', () => { performProdSearch(input.value); if (results) results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performProdSearch(input.value); if (results) results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { if (results) results.style.display = 'none'; }, 200); });

    window.ordRecalcLine(idx);
  };

  (window as any).selectOrdLineProduct = function(idx: number, id: string, label: string, price: number, ivaRate: number) {
    const input = document.getElementById(`ordl-prod-search-${idx}`) as HTMLInputElement;
    const hidden = document.getElementById(`ordl-prod-id-${idx}`) as HTMLInputElement;
    const priceInput = document.getElementById(`ordl-price-${idx}`) as HTMLInputElement;
    const ivaInput = document.getElementById(`ordl-iva-${idx}`) as HTMLInputElement;

    if (input && hidden && priceInput && ivaInput) {
      input.value = label;
      hidden.value = id;
      priceInput.value = String(price);
      ivaInput.value = String(ivaRate);
      window.ordRecalcLine(idx);
    }
  };

  (window as any).ordRecalcLine = function(idx: number) {
    const qty = parseFloat((document.getElementById(`ordl-qty-${idx}`) as HTMLInputElement)?.value || '0');
    const price = parseFloat((document.getElementById(`ordl-price-${idx}`) as HTMLInputElement)?.value || '0');
    const ivaRate = parseFloat((document.getElementById(`ordl-iva-${idx}`) as HTMLInputElement)?.value || '0');
    const totalEl = document.getElementById(`ordl-total-${idx}`);

    const subtotal = qty * price;
    const iva = subtotal * (ivaRate / 100);
    const lineTotal = subtotal + iva;

    if (totalEl) {
      totalEl.textContent = (window as any).fmt(lineTotal);
    }
    window.ordRecalcTotals();
  };

  (window as any).ordRecalcTotals = function() {
    let subtotal = 0;
    let iva = 0;

    const rows = document.querySelectorAll('#ord-lines-body tr');
    rows.forEach(row => {
      const idx = row.id.split('-').pop();
      const qty = parseFloat((document.getElementById(`ordl-qty-${idx}`) as HTMLInputElement)?.value || '0');
      const price = parseFloat((document.getElementById(`ordl-price-${idx}`) as HTMLInputElement)?.value || '0');
      const ivaRate = parseFloat((document.getElementById(`ordl-iva-${idx}`) as HTMLInputElement)?.value || '0');

      const lineSub = qty * price;
      const lineIva = lineSub * (ivaRate / 100);

      subtotal += lineSub;
      iva += lineIva;
    });

    const net = subtotal + iva;

    const subEl = document.getElementById('ord-total-sub');
    const ivaEl = document.getElementById('ord-total-iva');
    const netEl = document.getElementById('ord-total-net');

    if (subEl) subEl.textContent = (window as any).fmt(subtotal);
    if (ivaEl) ivaEl.textContent = (window as any).fmt(iva);
    if (netEl) netEl.textContent = (window as any).fmt(net);
  };

  // Cargar líneas iniciales
  if (existingLines.length) {
    existingLines.forEach(l => (window as any).addOrdLine(l));
  } else {
    (window as any).addOrdLine();
  }

  document.getElementById('btn-add-ord-line')?.addEventListener('click', () => (window as any).addOrdLine());

  // Listener para guardar
  document.getElementById('btn-save-order')?.addEventListener('click', async () => {
    try {
      const customerId = (document.getElementById('ord-customer-id') as HTMLInputElement)?.value;
      const date = (document.getElementById('ord-date') as HTMLInputElement)?.value;
      const dueDate = (document.getElementById('ord-due-date') as HTMLInputElement)?.value;
      const notes = (document.getElementById('ord-notes') as HTMLInputElement)?.value.trim();
      const number = (document.getElementById('ord-number') as HTMLInputElement)?.value;
      const warehouseId = (document.getElementById('ord-warehouse') as HTMLSelectElement)?.value || null;

      if (!customerId) throw new Error('Por favor selecciona un cliente.');
      if (!date) throw new Error('Por favor selecciona la fecha de emisión del pedido.');

      const lines: any[] = [];
      const rows = document.querySelectorAll('#ord-lines-body tr');
      
      rows.forEach((row, i) => {
        const idx = row.id.split('-').pop();
        const productId = (document.getElementById(`ordl-prod-id-${idx}`) as HTMLInputElement)?.value;
        const prodLabel = (document.getElementById(`ordl-prod-search-${idx}`) as HTMLInputElement)?.value;
        const qty = parseFloat((document.getElementById(`ordl-qty-${idx}`) as HTMLInputElement)?.value || '0');
        const price = parseFloat((document.getElementById(`ordl-price-${idx}`) as HTMLInputElement)?.value || '0');
        const ivaRate = parseFloat((document.getElementById(`ordl-iva-${idx}`) as HTMLInputElement)?.value || '0');

        if (!productId) {
          throw new Error(`Por favor selecciona un producto válido en la línea ${i + 1}.`);
        }
        if (qty <= 0) {
          throw new Error(`La cantidad debe ser mayor a cero en la línea ${i + 1}.`);
        }
        if (price < 0) {
          throw new Error(`El precio unitario no puede ser negativo en la línea ${i + 1}.`);
        }

        const subtotal = qty * price;
        const ivaAmount = subtotal * (ivaRate / 100);
        const total = subtotal + ivaAmount;

        lines.push({
          product_id: productId,
          description: prodLabel,
          qty,
          unit_price: price,
          iva_rate: ivaRate,
          iva_amount: ivaAmount,
          subtotal,
          total,
        });
      });

      if (!lines.length) throw new Error('El pedido debe tener al menos una línea.');

      const header = {
        number,
        customer_id: customerId,
        warehouse_id: warehouseId,
        date,
        due_date: dueDate,
        notes,
      };

      if (orderId) {
        await (window as any).API.updateSalesOrder(orderId, header, lines);
        (window as any).showToast('Pedido actualizado correctamente', 'success');
      } else {
        await (window as any).API.createSalesOrder(header, lines);
        (window as any).showToast('Pedido registrado con éxito', 'success');
      }

      (window as any).closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      (window as any).showToast(err.message || 'No se pudo registrar el pedido', 'error');
    }
  });
}

// --- Detalle del Pedido / Cotización ---
(window as any).viewSalesOrderDetail = async function(orderId: string) {
  try {
    const [ord, lines] = await Promise.all([
      (window as any).pb.get('sales_orders', orderId, { expand: 'customer_id,warehouse_id,invoice_id,user_id' }),
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
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Registrado por</span><span class="font-semibold">${user ? (window as any).esc(user.name || user.full_name) : '—'}</span></div>
          
          <div class="col-span-4"><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Observaciones</span><span>${(window as any).esc(ord.notes || 'Sin observaciones.')}</span></div>
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
(window as any).editSalesOrder = function(orderId: string) {
  openOrderForm(orderId, () => {
    const activeContent = document.getElementById('page-content');
    if (activeContent) {
      renderPedidos(activeContent);
    }
  });
};

// Anular Pedido
(window as any).cancelSalesOrderDirect = async function(orderId: string, orderNumber: string) {
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

// Facturar Pedido desde Pedidos
(window as any).invoiceSalesOrderDirect = function(orderId: string) {
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
(window as any).viewSalesInvoiceFromOrder = function(invoiceId: string) {
  (window as any).closeModal();
  (window as any).navigate('ventas');
  setTimeout(() => {
    if (typeof (window as any).viewSalesInvoiceDetail === 'function') {
      (window as any).viewSalesInvoiceDetail(invoiceId);
    }
  }, 250);
};

// --- Impresión de Pedidos (Carta y Tirilla) ---
window.printOrderCarta = async function(orderId: string) {
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

window.printOrderTirilla = async function(orderId: string) {
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

// Exponer renderPedidos globalmente
(window as any).renderPedidos = renderPedidos;
