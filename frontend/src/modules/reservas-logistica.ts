/**
 * GRAVY v2.0 - reservas-logistica.ts
 * Modulo dedicado para reservas de productos en importacion y conversion posterior a factura.
 */

'use strict';

interface ReservationStatusMeta {
  label: string;
  badge: string;
}

const RES_STATUS: Record<string, ReservationStatusMeta> = {
  active: { label: 'Activa', badge: 'badge-orange' },
  partial: { label: 'Parcial', badge: 'badge-blue' },
  completed: { label: 'Completada', badge: 'badge-green' },
  released: { label: 'Liberada', badge: 'badge-gray' },
  cancelled: { label: 'Cancelada', badge: 'badge-red' },
};

export async function renderReservasImportacion(container: HTMLElement) {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  container = getContainer(container);
  if (!container) return;
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando reservas de importacion...</div>`;
  try {
    await loadReservasPage(container);
  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message || 'No se pudo cargar')}</div>`;
  }
}

async function loadReservasPage(c: HTMLElement, activeTab: string = 'reservas') {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Logística de Reservas & Tránsito</h3>
        <p class="text-sm" style="color:#6B7280">Gestión de reservas de clientes y reporte de disponibilidad de inventario en tránsito para el equipo comercial.</p>
      </div>
    </div>

    <div class="flex border-b mb-5" style="border-color:#E5E7EB">
      <button id="tab-btn-reservas" class="px-5 py-3 font-bold text-sm border-b-2 cursor-pointer transition-colors ${activeTab === 'reservas' ? 'border-blue-700 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}">
        <i class="fas fa-clipboard-list mr-2"></i>Gestión de Reservas
      </button>
      <button id="tab-btn-transit-report" class="px-5 py-3 font-bold text-sm border-b-2 cursor-pointer transition-colors ${activeTab === 'transit' ? 'border-blue-700 text-blue-800' : 'border-transparent text-gray-500 hover:text-gray-700'}">
        <i class="fas fa-boxes-packing mr-2"></i>Inventario en Tránsito & Disponibilidad para Ventas
      </button>
    </div>

    <div id="res-tab-content"></div>
  `;

  const tabContainer = document.getElementById('res-tab-content') as HTMLElement;

  document.getElementById('tab-btn-reservas')?.addEventListener('click', () => {
    loadReservasPage(c, 'reservas');
  });

  document.getElementById('tab-btn-transit-report')?.addEventListener('click', () => {
    loadReservasPage(c, 'transit');
  });

  if (activeTab === 'transit') {
    await renderTransitInventoryReport(tabContainer);
  } else {
    await renderReservasDashboardTab(tabContainer, c);
  }
}

async function renderReservasDashboardTab(c: HTMLElement, parentContainer: HTMLElement) {
  const result = await (window as any).pb.list('sales_reservations', {
    page: 1,
    perPage: 200,
    sort: '-created',
    expand: 'customer_id,sales_order_id,invoice_id',
  });
  const rows = result.items || [];

  const total = rows.length;
  const active = rows.filter((r: any) => r.status === 'active' || r.status === 'partial').length;
  const converted = rows.filter((r: any) => !!r.invoice_id).length;

  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h4 class="text-base font-bold" style="color:#0D2137">Lista de Reservas Activas y Convertidas</h4>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary" id="btn-new-reserva"><i class="fas fa-plus"></i> Nueva Reserva</button>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      ${resKpi('Total reservas', total, 'fas fa-clipboard-list', '#1A4B8C', '#EEF4FF')}
      ${resKpi('Activas', active, 'fas fa-hourglass-half', '#C46516', '#FFF8F0')}
      ${resKpi('Convertidas a factura', converted, 'fas fa-file-invoice', '#059669', '#ECFDF5')}
      ${resKpi('Sin facturar', Math.max(0, total - converted), 'fas fa-truck-loading', '#7C3AED', '#F5F3FF')}
    </div>

    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center" style="border-color:#F0F0F0">
      <input id="res-q" class="form-input flex-1 min-w-48" placeholder="Buscar por numero, cliente, pedido o observaciones...">
      <select id="res-status-f" class="form-input" style="max-width:200px">
        <option value="">Todos los estados</option>
        <option value="active">Activa</option>
        <option value="partial">Parcial</option>
        <option value="completed">Completada</option>
        <option value="released">Liberada</option>
        <option value="cancelled">Cancelada</option>
      </select>
    </div>

    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto">
        <table class="data-table" id="res-table">
          <thead>
            <tr>
              <th>Numero</th>
              <th>Creacion</th>
              <th>Cliente</th>
              <th>Pedido</th>
              <th>Factura</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="res-tbody">
            ${rows.length ? rows.map(renderReservationRow).join('') : `<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-clipboard-list mr-2"></i>No hay reservas registradas.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('btn-new-reserva')?.addEventListener('click', () => openReservationForm(() => loadReservasPage(parentContainer, 'reservas')));
  const applyFilter = () => filterReservationTable();
  document.getElementById('res-q')?.addEventListener('input', applyFilter);
  document.getElementById('res-status-f')?.addEventListener('change', applyFilter);

  const tbl = document.getElementById('res-table') as HTMLTableElement;
  if (tbl) (window as any).makeTableSortable(tbl);
}


function resKpi(title: string, value: any, icon: string, color: string, bg: string) {
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

function renderReservationRow(r: any) {
  const status = RES_STATUS[r.status] || { label: r.status || 'N/D', badge: 'badge-gray' };
  const customer = r.expand?.customer_id;
  const order = r.expand?.sales_order_id;
  const invoice = r.expand?.invoice_id;

  const canAccept = (r.status === 'por_confirmar' || r.status === 'active') && !order;
  const canEdit = (r.status === 'por_confirmar' || r.status === 'accepted' || r.status === 'active' || r.status === 'partial') && !invoice;
  const canConvert = (r.status === 'accepted' || r.status === 'active' || r.status === 'partial') && !invoice && !!order;
  const canCancel = r.status !== 'completed' && r.status !== 'released' && r.status !== 'cancelled' && !invoice;

  return `
    <tr data-resid="${(window as any).esc(r.id)}" data-resstatus="${(window as any).esc(r.status)}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(r.number || 'S/N')}</span></td>
      <td>${(window as any).esc((r.created || '').slice(0, 10))}</td>
      <td class="font-medium">${customer ? (window as any).esc(customer.name) : '—'}</td>
      <td>${order ? `<span class="font-mono" style="color:#2563EB">${(window as any).esc(order.number || 'PED')}</span>` : '<span class="text-xs text-amber-600 font-semibold"><i class="fas fa-clock mr-1"></i>Sin Pedido</span>'}</td>
      <td>${invoice ? `<span class="font-mono" style="color:#059669">${(window as any).esc(invoice.number || 'FV')}</span>` : '—'}</td>
      <td><span class="badge ${status.badge}">${status.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="window.viewImportReservationDetail('${(window as any).esc(r.id)}')"><i class="fas fa-eye"></i></button>
          ${canAccept ? `<button class="btn btn-sm text-white font-semibold" style="background:#059669;border-color:#059669" title="Aceptar Reserva y Generar Orden de Carga / Pedido" onclick="window.acceptImportReservation('${(window as any).esc(r.id)}')"><i class="fas fa-check-double mr-1"></i> Aceptar</button>` : ''}
          ${canEdit ? `<button class="btn btn-outline btn-sm text-amber-600" style="border-color:#d97706" title="Editar Reserva" onclick="window.editImportReservation('${(window as any).esc(r.id)}')"><i class="fas fa-pen"></i></button>` : ''}
          <button class="btn btn-outline btn-sm text-blue-600" style="border-color:#3b82f6" title="Imprimir" onclick="window.printReservationCarta('${(window as any).esc(r.id)}')"><i class="fas fa-print"></i></button>
          ${canConvert ? `<button class="btn btn-primary btn-sm" title="Convertir a factura" onclick="window.convertReservationToInvoice('${(window as any).esc(r.id)}')"><i class="fas fa-file-invoice"></i> Facturar</button>` : ''}
          ${canCancel ? `<button class="btn btn-danger btn-sm" title="Cancelar / Liberar" onclick="window.cancelImportReservation('${(window as any).esc(r.id)}','${(window as any).esc(r.number || '')}')"><i class="fas fa-ban"></i></button>` : ''}
        </div>
      </td>
    </tr>
  `;
}

function filterReservationTable() {
  const q = ((document.getElementById('res-q') as HTMLInputElement)?.value || '').toLowerCase().trim();
  const st = (document.getElementById('res-status-f') as HTMLSelectElement)?.value || '';
  const rows = document.querySelectorAll('#res-table tbody tr[data-resid]');

  rows.forEach((row: any) => {
    const text = (row.textContent || '').toLowerCase();
    const status = row.getAttribute('data-resstatus');
    const ok = (!q || text.includes(q)) && (!st || status === st);
    row.style.display = ok ? '' : 'none';
  });
}

async function openReservationForm(reservationId: any = null, onDone: any = null) {
  let targetResId: string | null = null;
  let doneCallback: any = null;

  if (typeof reservationId === 'string') {
    targetResId = reservationId;
    doneCallback = onDone;
  } else if (typeof reservationId === 'function') {
    doneCallback = reservationId;
    targetResId = null;
  } else {
    doneCallback = onDone;
    targetResId = null;
  }

  let existingRes: any = null;
  let existingResLines: any[] = [];
  let existingOrderLines: any[] = [];

  if (targetResId) {
    existingRes = await (window as any).pb.get('sales_reservations', targetResId, { expand: 'customer_id,sales_order_id,invoice_id' });
    if (existingRes.status === 'completed' || existingRes.status === 'released' || existingRes.invoice_id) {
      (window as any).showToast('Esta reserva no se puede modificar porque ya ha sido facturada o anulada.', 'warning');
      return;
    }
    existingResLines = await (window as any).pb.listAll('sales_reservation_lines', {
      filter: `reservation_id="${(window as any).pb.escapeFilterValue(targetResId)}"`,
      expand: 'product_id,import_id'
    });
    if (existingRes.sales_order_id) {
      existingOrderLines = await (window as any).pb.listAll('sales_order_lines', {
        filter: `sales_order_id="${(window as any).pb.escapeFilterValue(existingRes.sales_order_id)}"`,
        expand: 'product_id'
      });
    }
  }

  const [customers, warehouses, products, rawSalesCfg, rawPosCfg] = await Promise.all([
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getWarehouses(true),
    (window as any).API.getProducts({ activeOnly: true }),
    (window as any).API.getSetting('sales_settings_v2').catch(() => null),
    (window as any).API.getSetting('pos_settings_v1').catch(() => null),
  ]);
  const salesConfig = rawSalesCfg ? JSON.parse(rawSalesCfg) : null;
  const posConfig = rawPosCfg ? JSON.parse(rawPosCfg) : null;
  const pricesIncludeIva = (salesConfig?.operational?.prices_include_iva === true) || (posConfig?.special?.prices_include_iva === true);

  const sellers = customers.filter((c: any) => c.type === 'EMPLEADO');
  let lineCounter = 0;

  const html = `
    <div class="space-y-6 text-sm" style="color:#374151">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl" style="background:#F9FAFB;border:1px solid #E5E7EB">
        <div class="form-group md:col-span-2">
          <label class="form-label font-bold">Cliente <span style="color:#EF4444">*</span></label>
          <div id="res-customer-search-wrap" class="relative flex gap-1 items-center">
            <input id="res-customer-search" class="form-input flex-1" autocomplete="off" placeholder="NIT o nombre del cliente...">
            <button type="button" class="btn btn-outline p-2 h-[34px] flex items-center justify-center flex-shrink-0" onclick="window.resQuickAddThirdParty()" title="Nuevo Cliente" style="border-color:#D1D5DB; background:#fff;">
              <i class="fas fa-user-plus text-xs" style="color:#4B5563"></i>
            </button>
            <input id="res-customer-id" type="hidden" value="">
            <div id="res-customer-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:40"></div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Bodega</label>
          <select id="res-warehouse" class="form-input">
            <option value="">Sin bodega</option>
            ${warehouses.map((w: any) => `<option value="${(window as any).esc(w.id)}">${(window as any).esc(w.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Vendedor</label>
          <select id="res-seller" class="form-input">
            <option value="">Sin vendedor</option>
            ${sellers.map((s: any) => `<option value="${(window as any).esc(s.id)}">${(window as any).esc(s.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Fecha</label>
          <input id="res-date" type="date" class="form-input" value="${(window as any).esc((window as any).todayStr())}">
        </div>
        <div class="form-group">
          <label class="form-label font-bold">Entrega estimada</label>
          <input id="res-due-date" type="date" class="form-input" value="${(window as any).esc((window as any).addDaysToDateStr((window as any).todayStr(), 5))}">
        </div>
        <div class="form-group md:col-span-2">
          <label class="form-label font-bold">Observaciones</label>
          <input id="res-notes" class="form-input" placeholder="Notas logisticas o comerciales">
        </div>
      </div>

      <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
        <div class="p-2 border-b" style="border-color:#E5E7EB;background:#fff">
          <div class="relative">
            <i class="fas fa-search" style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#9CA3AF;font-size:13px;pointer-events:none"></i>
            <input id="res-prod-search" class="form-input"
              style="padding-left:38px;font-size:14px;border-color:#DCE6F8"
              autocomplete="off"
              placeholder="Buscar producto o servicio por nombre o codigo... (↑↓ para navegar · Enter o clic para agregar)">
            <div id="res-prod-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 3px);max-height:280px;overflow:auto;background:#fff;border:1.5px solid #DCE6F8;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.14);z-index:50"></div>
          </div>
        </div>
        <div style="overflow-x:auto;max-height:300px;overflow-y:auto">
          <table class="data-table" style="min-width:740px">
            <thead>
              <tr>
                <th style="min-width:240px">Producto</th>
                <th class="text-right" style="width:130px">Disponible imp.</th>
                <th class="text-right" style="width:120px">Cant.</th>
                <th class="text-right" style="width:140px">P. Unitario</th>
                <th class="text-right" style="width:90px">IVA %</th>
                <th class="text-right" style="width:140px">Total</th>
                <th style="width:58px">Accion</th>
              </tr>
            </thead>
            <tbody id="res-lines-body"></tbody>
          </table>
        </div>
      </div>

      <div class="flex justify-end p-4 rounded-xl" style="background:#F9FAFB">
        <div class="text-sm space-y-1 min-w-80 font-medium">
          <div class="flex justify-between gap-8"><span style="color:#6B7280">Subtotal:</span> <span id="res-total-sub" class="font-semibold">$ 0</span></div>
          <div class="flex justify-between gap-8"><span style="color:#6B7280">IVA:</span> <span id="res-total-iva" class="font-semibold">$ 0</span></div>
          <div class="flex justify-between gap-8 text-base border-t pt-2 font-extrabold" style="border-color:#E5E7EB;color:#0D2137"><span>TOTAL RESERVA:</span> <span id="res-total-net" class="font-extrabold text-blue-700 text-lg">$ 0</span></div>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-reserva"><i class="fas fa-floppy-disk"></i> ${existingRes ? 'Guardar Cambios' : 'Guardar Reserva'}</button>
  `;

  (window as any).openModal(existingRes ? `Editar Reserva ${existingRes.number || ''}` : 'Nueva Reserva de Importacion', html, footer, true);

  setTimeout(() => {
    const customerInput = document.getElementById('res-customer-search') as HTMLInputElement | null;
    if (customerInput) {
      customerInput.focus();
      customerInput.select();
    }
  }, 80);

  function initResCustomerSearch() {
    const input = document.getElementById('res-customer-search') as HTMLInputElement;
    const hidden = document.getElementById('res-customer-id') as HTMLInputElement;
    const results = document.getElementById('res-customer-results');
    if (!input || !hidden || !results) return;

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
                onclick="window.selectResCustomer('${(window as any).esc(c.id)}', '${(window as any).esc(c.doc_number || c.nit || '')} - ${(window as any).esc(c.name)}')">
          <div class="font-bold text-gray-800">${(window as any).esc(c.name)}</div>
          <div class="text-[10px] text-gray-500">Doc: ${c.doc_number || c.nit || 'S/N'}</div>
        </button>
      `).join('');
    };

    input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('input', () => { hidden.value = ''; performSearch(input.value); results.style.display = 'block'; });
    input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 200); });

    let highlighted = -1;

    const highlightItem = (idx: number, items: NodeListOf<Element>) => {
      items.forEach((el: any) => { el.style.background = ''; });
      if (idx >= 0 && idx < items.length) {
        (items[idx] as any).style.background = '#EEF4FF';
        (items[idx] as any).scrollIntoView({ block: 'nearest' });
      }
    };

    input.addEventListener('keydown', (ev: KeyboardEvent) => {
      const items = results.querySelectorAll('button');
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        highlighted = Math.min(highlighted + 1, items.length - 1);
        highlightItem(highlighted, items);
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        highlighted = Math.max(highlighted - 1, 0);
        highlightItem(highlighted, items);
      } else if (ev.key === 'Enter') {
        ev.preventDefault();
        if (!input.value.trim()) return;
        if (highlighted >= 0) {
          const arr = customers.filter((c: any) => `${c.name} ${c.doc_number} ${c.nit}`.toLowerCase().includes(input.value.toLowerCase().trim())).slice(0, 30);
          const selected = arr[highlighted] || arr[0];
          if (selected) {
            (window as any).selectResCustomer(selected.id, `${selected.doc_number || selected.nit || ''} - ${selected.name}`);
          }
        } else if (items.length > 0) {
          const arr = customers.filter((c: any) => `${c.name} ${c.doc_number} ${c.nit}`.toLowerCase().includes(input.value.toLowerCase().trim())).slice(0, 30);
          const selected = arr[0];
          if (selected) {
            (window as any).selectResCustomer(selected.id, `${selected.doc_number || selected.nit || ''} - ${selected.name}`);
          }
        }
      } else if (ev.key === 'Escape') {
        results.style.display = 'none';
      }
    });

    results.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
    });
  }

  (window as any).selectResCustomer = function(id: string, text: string) {
    const hidden = document.getElementById('res-customer-id') as HTMLInputElement;
    const input = document.getElementById('res-customer-search') as HTMLInputElement;
    const results = document.getElementById('res-customer-results') as HTMLElement;
    if (hidden && input) {
      hidden.value = id;
      input.value = text;
      if (results) results.style.display = 'none';
    }
  };

  (window as any).resQuickAddThirdParty = function() {
    if (typeof (window as any).openTerceroForm === 'function') {
      (window as any).openTerceroForm(null, async (createdRecord: any) => {
        try {
          const thirds = await (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' });
          customers.length = 0;
          customers.push(...thirds);
          const docNum = createdRecord.doc_number || createdRecord.nit || '';
          const selectText = docNum ? `${docNum} - ${createdRecord.name}` : createdRecord.name;
          (window as any).selectResCustomer(createdRecord.id, selectText);
          (window as any).showToast('Cliente creado y seleccionado.', 'success');
        } catch (err: any) {
          (window as any).showToast('Error al recargar terceros: ' + err.message, 'error');
        }
      });
    } else {
      (window as any).showToast('Módulo de terceros no disponible.', 'warning');
    }
  };

  initResCustomerSearch();

  if (existingRes) {
    setTimeout(async () => {
      const cust = existingRes.expand?.customer_id || customers.find((c: any) => c.id === existingRes.customer_id);
      if (cust) {
        const selectText = `${cust.doc_number || cust.nit || ''} - ${cust.name}`;
        (window as any).selectResCustomer(cust.id, selectText);
      }

      const order = existingRes.expand?.sales_order_id;
      if (order) {
        const whSelect = document.getElementById('res-warehouse') as HTMLSelectElement;
        const sellerSelect = document.getElementById('res-seller') as HTMLSelectElement;
        const dateInput = document.getElementById('res-date') as HTMLInputElement;
        const dueDateInput = document.getElementById('res-due-date') as HTMLInputElement;
        const notesInput = document.getElementById('res-notes') as HTMLInputElement;

        if (whSelect) whSelect.value = order.warehouse_id || '';
        if (sellerSelect) sellerSelect.value = order.seller_id || '';
        if (dateInput) dateInput.value = order.date || (existingRes.created || '').slice(0, 10);
        if (dueDateInput) dueDateInput.value = order.due_date || (window as any).todayStr();
        if (notesInput) notesInput.value = existingRes.notes || order.notes || '';
      }

      if (existingOrderLines.length) {
        for (const ol of existingOrderLines) {
          const p = products.find((x: any) => x.id === ol.product_id);
          if (p) {
            const unitP = pricesIncludeIva
              ? Math.round(Number(ol.unit_price || 0) * (1 + Number(ol.iva_rate || 0) / 100) * 100) / 100
              : Number(ol.unit_price || 0);
            await addLine(p, { qty: ol.qty, unit_price: unitP, iva_rate: ol.iva_rate });
          }
        }
      } else if (existingResLines.length) {
        const grouped: Record<string, number> = {};
        existingResLines.forEach((l: any) => {
          grouped[l.product_id] = (grouped[l.product_id] || 0) + Number(l.qty_reserved || 0);
        });
        for (const pId of Object.keys(grouped)) {
          const p = products.find((x: any) => x.id === pId);
          if (p) {
            await addLine(p, { qty: grouped[pId] });
          }
        }
      }
    }, 100);
  }

  const addLine = async (prod: any, preloadedLine: any = null) => {
    lineCounter += 1;
    const idx = lineCounter;
    const tbody = document.getElementById('res-lines-body');
    if (!tbody) return;

    const incoming = await (window as any).API.getIncomingStockForProduct(prod.id).catch(() => []);
    const available = (incoming || []).reduce((sum: number, x: any) => sum + Number(x.qty_available ?? x.qty ?? 0), 0);

    let initPrice = 0;
    let initQty = preloadedLine?.qty ?? 1;
    let initIva = preloadedLine?.iva_rate ?? Number(prod.iva_rate ?? 19);

    if (preloadedLine && preloadedLine.unit_price !== undefined) {
      initPrice = preloadedLine.unit_price;
    } else {
      const prodPrice = Number(prod.base_price || 0);
      if (pricesIncludeIva) {
        initPrice = Math.round(prodPrice * (1 + initIva / 100) * 100) / 100;
      } else {
        initPrice = prodPrice;
      }
    }

    const tr = document.createElement('tr');
    tr.id = `res-row-${idx}`;
    tr.innerHTML = `
      <td>
        <div class="flex flex-col">
          <span class="text-[10px] font-mono text-gray-400">[${(window as any).esc(prod.code || 'S/C')}]</span>
          <span class="text-xs font-semibold text-gray-800">${(window as any).esc(prod.name)}</span>
        </div>
        <input type="hidden" id="resl-prod-${idx}" value="${(window as any).esc(prod.id)}">
      </td>
      <td class="text-right font-mono" id="resl-avail-${idx}">${(window as any).fmtN(available)}</td>
      <td><input type="number" id="resl-qty-${idx}" class="form-input text-right" min="0.001" step="0.001" value="${initQty}" oninput="window.resRecalcLine(${idx})"></td>
      <td><input type="number" id="resl-price-${idx}" class="form-input text-right" min="0" step="0.01" value="${initPrice}" oninput="window.resRecalcLine(${idx})"></td>
      <td>
        <select id="resl-iva-${idx}" class="form-input text-right" onchange="window.resRecalcLine(${idx})">
          <option value="0" ${initIva === 0 ? 'selected' : ''}>0</option>
          <option value="5" ${initIva === 5 ? 'selected' : ''}>5</option>
          <option value="19" ${initIva === 19 ? 'selected' : ''}>19</option>
        </select>
      </td>
      <td class="text-right font-extrabold text-blue-700" id="resl-total-${idx}">$ 0</td>
      <td class="text-center"><button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('res-row-${idx}').remove(); window.resRecalcTotals();"><i class="fas fa-trash-can"></i></button></td>
    `;
    tbody.appendChild(tr);
    (window as any).resRecalcLine(idx);
  };

  const input = document.getElementById('res-prod-search') as HTMLInputElement;
  const resultBox = document.getElementById('res-prod-results') as HTMLElement;
  (window as any).__resProdFiltered = [];

  let highlighted = -1;

  (window as any).resGlobalSearchHover = (idx: number) => {
    highlighted = idx;
    const items = resultBox.querySelectorAll('.res-gsr-row');
    items.forEach((el: any) => { el.style.background = ''; });
    if (idx >= 0 && idx < items.length) {
      (items[idx] as any).style.background = '#EEF4FF';
    }
  };

  const renderProductSearch = (q: string) => {
    const query = (q || '').toLowerCase().trim();
    if (!query) {
      resultBox.style.display = 'none';
      return;
    }

    const filtered = products
      .filter((p: any) => `${p.name} ${p.code || ''} ${p.ean_code || ''}`.toLowerCase().includes(query))
      .slice(0, 40);

    (window as any).__resProdFiltered = filtered;

    if (!filtered.length) {
      resultBox.innerHTML = '<div class="px-4 py-3 text-xs text-gray-400"><i class="fas fa-box-open mr-1"></i>Sin resultados para esta busqueda.</div>';
      highlighted = -1;
      resultBox.style.display = 'block';
      return;
    }

    resultBox.innerHTML = filtered.map((p: any, i: number) => `
      <button type="button"
        id="res-gsr-item-${i}"
        data-prod-idx="${i}"
        class="w-full text-left px-4 py-2.5 text-xs border-none bg-white cursor-pointer block res-gsr-row"
        style="border-bottom:1px solid #F3F4F6;transition:background .1s"
        onmouseenter="window.resGlobalSearchHover(${i})"
        onmouseleave="this.style.background=''"
        onclick="window.selectResProduct(${i})">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-[9px] font-mono text-gray-400 flex-shrink-0">[${(window as any).esc(p.code || 'S/C')}]</span>
            <span class="font-semibold text-gray-800 truncate">${(window as any).esc(p.name)}</span>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0 text-right">
            <span class="text-[10px] px-1.5 py-0.5 rounded font-bold" style="background:#EEF4FF;color:#1A4B8C">IVA ${p.iva_rate ?? 19}%</span>
            <span class="font-extrabold text-blue-600 text-xs">${(window as any).fmt(Number(p.base_price || 0))}</span>
          </div>
        </div>
      </button>
    `).join('');

    highlighted = -1;
    resultBox.style.display = 'block';
  };

  const highlightItem = (idx: number, items: NodeListOf<Element>) => {
    items.forEach((el: any) => { el.style.background = ''; });
    if (idx >= 0 && idx < items.length) {
      (items[idx] as any).style.background = '#EEF4FF';
      (items[idx] as any).scrollIntoView({ block: 'nearest' });
    }
  };

  input?.addEventListener('input', () => renderProductSearch(input.value));
  input?.addEventListener('focus', () => renderProductSearch(input.value));

  input?.addEventListener('keydown', (ev: KeyboardEvent) => {
    const items = resultBox.querySelectorAll('.res-gsr-row');

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      highlighted = Math.min(highlighted + 1, items.length - 1);
      highlightItem(highlighted, items);
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      highlighted = Math.max(highlighted - 1, 0);
      highlightItem(highlighted, items);
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      if (!input.value.trim()) return;
      if (highlighted >= 0) {
        (window as any).selectResProduct(highlighted);
      } else if (items.length > 0) {
        (window as any).selectResProduct(0);
      }
    } else if (ev.key === 'Escape') {
      resultBox.style.display = 'none';
    }
  });

  resultBox.addEventListener('mousedown', (ev) => {
    ev.preventDefault();
  });

  input?.addEventListener('blur', () => setTimeout(() => { resultBox.style.display = 'none'; }, 200));

  (window as any).selectResProduct = async function(i: number) {
    const arr = (window as any).__resProdFiltered || [];
    const p = arr[i];
    if (!p) return;
    await addLine(p);
    input.value = '';
    input.focus();
    resultBox.style.display = 'none';
  };

  (window as any).resRecalcLine = function(idx: number) {
    const qty = parseFloat((document.getElementById(`resl-qty-${idx}`) as HTMLInputElement)?.value || '0');
    const price = parseFloat((document.getElementById(`resl-price-${idx}`) as HTMLInputElement)?.value || '0');
    const ivaRate = parseFloat((document.getElementById(`resl-iva-${idx}`) as HTMLSelectElement)?.value || '0');
    
    let sub = 0;
    let iva = 0;
    let total = 0;

    if (pricesIncludeIva) {
      total = qty * price;
      sub = total / (1 + ivaRate / 100);
      iva = total - sub;
    } else {
      sub = qty * price;
      iva = sub * (ivaRate / 100);
      total = sub + iva;
    }

    const totalEl = document.getElementById(`resl-total-${idx}`);
    if (totalEl) totalEl.textContent = (window as any).fmt(total);
    (window as any).resRecalcTotals();
  };

  (window as any).resRecalcTotals = function() {
    let subtotal = 0;
    let iva = 0;
    const rows = document.querySelectorAll('#res-lines-body tr');
    rows.forEach((row) => {
      const idx = (row as HTMLElement).id.split('-').pop();
      const qty = parseFloat((document.getElementById(`resl-qty-${idx}`) as HTMLInputElement)?.value || '0');
      const price = parseFloat((document.getElementById(`resl-price-${idx}`) as HTMLInputElement)?.value || '0');
      const ivaRate = parseFloat((document.getElementById(`resl-iva-${idx}`) as HTMLSelectElement)?.value || '0');
      
      let lineSub = 0;
      let lineIva = 0;
      if (pricesIncludeIva) {
        const lineTotal = qty * price;
        lineSub = lineTotal / (1 + ivaRate / 100);
        lineIva = lineTotal - lineSub;
      } else {
        lineSub = qty * price;
        lineIva = lineSub * (ivaRate / 100);
      }
      subtotal += lineSub;
      iva += lineIva;
    });
    const net = subtotal + iva;
    const subEl = document.getElementById('res-total-sub');
    const ivaEl = document.getElementById('res-total-iva');
    const netEl = document.getElementById('res-total-net');
    if (subEl) subEl.textContent = (window as any).fmt(subtotal);
    if (ivaEl) ivaEl.textContent = (window as any).fmt(iva);
    if (netEl) netEl.textContent = (window as any).fmt(net);
  };

  document.getElementById('btn-save-reserva')?.addEventListener('click', async () => {
    try {
      const customerId = (document.getElementById('res-customer-id') as HTMLInputElement)?.value;
      const warehouseId = (document.getElementById('res-warehouse') as HTMLSelectElement)?.value || null;
      const sellerId = (document.getElementById('res-seller') as HTMLSelectElement)?.value || null;
      const date = (document.getElementById('res-date') as HTMLInputElement)?.value || (window as any).todayStr();
      const dueDate = (document.getElementById('res-due-date') as HTMLInputElement)?.value || date;
      const notes = (document.getElementById('res-notes') as HTMLInputElement)?.value?.trim() || '';

      if (!customerId) throw new Error('Selecciona un cliente para la reserva.');

      const orderLines: any[] = [];
      const reservationRequested: any[] = [];
      const rows = document.querySelectorAll('#res-lines-body tr');
      if (!rows.length) throw new Error('Agrega al menos una linea para reservar.');

      for (let i = 0; i < rows.length; i++) {
        const idx = (rows[i] as HTMLElement).id.split('-').pop();
        const productId = (document.getElementById(`resl-prod-${idx}`) as HTMLInputElement)?.value;
        const qty = Number((document.getElementById(`resl-qty-${idx}`) as HTMLInputElement)?.value || 0);
        const unitPrice = Number((document.getElementById(`resl-price-${idx}`) as HTMLInputElement)?.value || 0);
        const ivaRate = Number((document.getElementById(`resl-iva-${idx}`) as HTMLSelectElement)?.value || 0);
        if (!productId) throw new Error(`Producto invalido en linea ${i + 1}.`);
        if (!Number.isFinite(qty) || qty <= 0) throw new Error(`Cantidad invalida en linea ${i + 1}.`);
        if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error(`Precio invalido en linea ${i + 1}.`);

        const product = products.find((p: any) => p.id === productId);
        if (!product) throw new Error(`No se encontro el producto de la linea ${i + 1}.`);
        if (String(product.type || '').toUpperCase() !== 'BIEN') {
          throw new Error(`Solo se pueden reservar productos tipo BIEN. Revisa la linea ${i + 1}.`);
        }

        const unitPriceDb = pricesIncludeIva ? (unitPrice / (1 + ivaRate / 100)) : unitPrice;
        const subtotal = qty * unitPriceDb;
        const ivaAmount = subtotal * (ivaRate / 100);
        const total = subtotal + ivaAmount;

        orderLines.push({
          product_id: productId,
          description: `${product.code || ''} - ${product.name}`,
          qty,
          unit_price: unitPriceDb,
          iva_rate: ivaRate,
          iva_amount: ivaAmount,
          subtotal,
          total,
        });

        reservationRequested.push({
          product,
          qty,
        });
      }

      if (targetResId && existingRes) {
        // --- EDICIÓN DE RESERVA EXISTENTE ---
        for (const oldLine of existingResLines) {
          await (window as any).pb.delete('sales_reservation_lines', oldLine.id).catch(() => {});
        }

        try {
          const allocations: any[] = [];
          for (const req of reservationRequested) {
            let pending = Number(req.qty || 0);
            const incoming = await (window as any).API.getIncomingStockForProduct(req.product.id);
            const sorted = [...incoming].sort((a: any, b: any) => {
              const etaA = String(a.expand?.import_id?.estimated_arrival || '9999-99-99');
              const etaB = String(b.expand?.import_id?.estimated_arrival || '9999-99-99');
              return etaA.localeCompare(etaB);
            });

            for (const lot of sorted) {
              if (pending <= 0) break;
              const available = Number(lot.qty_available ?? lot.qty ?? 0);
              if (available <= 0) continue;
              const take = Math.min(pending, available);
              allocations.push({
                product_id: req.product.id,
                import_id: lot.import_id,
                import_line_id: lot.id,
                qty_reserved: take,
                eta_snapshot: lot.expand?.import_id?.estimated_arrival || null,
              });
              pending -= take;
            }

            if (pending > 0) {
              throw new Error(`No hay suficiente stock en importación para ${req.product.name}. Faltan ${(window as any).fmtN(pending)} und.`);
            }
          }

          const orderId = existingRes.sales_order_id;
          if (orderId) {
            let subtotalOrder = 0, ivaOrder = 0;
            for (const l of orderLines) {
              subtotalOrder += l.subtotal || 0;
              ivaOrder += l.iva_amount || 0;
            }
            const totalOrder = subtotalOrder + ivaOrder;

            await (window as any).pb.update('sales_orders', orderId, {
              customer_id: customerId,
              warehouse_id: warehouseId,
              seller_id: sellerId,
              date,
              due_date: dueDate,
              notes: notes || 'Pedido de reserva de importación actualizado',
              subtotal: subtotalOrder,
              iva_total: ivaOrder,
              total: totalOrder,
            });

            const oldOrderLines = await (window as any).pb.listAll('sales_order_lines', { filter: `sales_order_id="${(window as any).pb.escapeFilterValue(orderId)}"` });
            for (const ol of oldOrderLines) {
              await (window as any).pb.delete('sales_order_lines', ol.id).catch(() => {});
            }
            for (let i = 0; i < orderLines.length; i++) {
              await (window as any).pb.create('sales_order_lines', {
                sales_order_id: orderId,
                line_order: i + 1,
                ...orderLines[i],
              });
            }
          }

          await (window as any).pb.update('sales_reservations', targetResId, {
            customer_id: customerId,
            notes: notes || `Reserva actualizada desde módulo logística`,
          });

          for (let i = 0; i < allocations.length; i++) {
            const a = allocations[i];
            await (window as any).pb.create('sales_reservation_lines', {
              reservation_id: targetResId,
              line_order: i + 1,
              product_id: a.product_id,
              import_id: a.import_id,
              import_line_id: a.import_line_id,
              qty_reserved: a.qty_reserved,
              qty_dispatched: 0,
              qty_released: 0,
              eta_snapshot: a.eta_snapshot,
              status: 'active',
              notes: `Reserva ${existingRes.number}`,
            });
          }

          await (window as any).API.logAudit('UPDATE', 'SalesReservation', targetResId, `Reserva ${existingRes.number} actualizada`);

          (window as any).closeModal();
          (window as any).showToast(`Reserva ${existingRes.number} actualizada correctamente`, 'success');
          if (typeof doneCallback === 'function') doneCallback();

        } catch (allocErr: any) {
          for (let i = 0; i < existingResLines.length; i++) {
            const oldL = existingResLines[i];
            await (window as any).pb.create('sales_reservation_lines', {
              reservation_id: targetResId,
              line_order: oldL.line_order || (i + 1),
              product_id: oldL.product_id,
              import_id: oldL.import_id,
              import_line_id: oldL.import_line_id,
              qty_reserved: oldL.qty_reserved,
              qty_dispatched: oldL.qty_dispatched || 0,
              qty_released: oldL.qty_released || 0,
              eta_snapshot: oldL.eta_snapshot || null,
              status: oldL.status || 'active',
              notes: oldL.notes || '',
            }).catch(() => {});
          }
          throw allocErr;
        }

      } else {
        // --- CREACIÓN DE NUEVA RESERVA ---
        const allocations: any[] = [];
        for (const req of reservationRequested) {
          let pending = Number(req.qty || 0);
          const incoming = await (window as any).API.getIncomingStockForProduct(req.product.id);
          const sorted = [...incoming].sort((a: any, b: any) => {
            const etaA = String(a.expand?.import_id?.estimated_arrival || '9999-99-99');
            const etaB = String(b.expand?.import_id?.estimated_arrival || '9999-99-99');
            return etaA.localeCompare(etaB);
          });

          for (const lot of sorted) {
            if (pending <= 0) break;
            const available = Number(lot.qty_available ?? lot.qty ?? 0);
            if (available <= 0) continue;
            const take = Math.min(pending, available);
            allocations.push({
              product_id: req.product.id,
              import_id: lot.import_id,
              import_line_id: lot.id,
              qty_reserved: take,
              eta_snapshot: lot.expand?.import_id?.estimated_arrival || null,
            });
            pending -= take;
          }

          if (pending > 0) {
            throw new Error(`No hay suficiente stock en importacion para ${req.product.name}. Faltan ${(window as any).fmtN(pending)} und.`);
          }
        }

        const reservationNumber = await (window as any).API.nextSalesReservationConsecutive();
        const reservation = await (window as any).pb.create('sales_reservations', {
          number: reservationNumber,
          customer_id: customerId,
          sales_order_id: '',
          status: 'por_confirmar',
          notes: notes || `Reserva creada en estado Por Confirmar`,
        });

        for (let i = 0; i < allocations.length; i++) {
          const a = allocations[i];
          await (window as any).pb.create('sales_reservation_lines', {
            reservation_id: reservation.id,
            line_order: i + 1,
            product_id: a.product_id,
            import_id: a.import_id,
            import_line_id: a.import_line_id,
            qty_reserved: a.qty_reserved,
            qty_dispatched: 0,
            qty_released: 0,
            eta_snapshot: a.eta_snapshot,
            status: 'active',
            notes: `Reserva ${reservationNumber}`,
          });
        }

        await (window as any).API.logAudit('CREATE', 'SalesReservation', reservation.id, `Reserva ${reservationNumber} creada en estado Por Confirmar`);

        (window as any).closeModal();
        (window as any).showToast(`Reserva ${reservationNumber} creada en estado "Por Confirmar". Utiliza el botón "Aceptar" cuando el cliente confirme o abone para generar la Orden de Carga.`, 'success');
        if (typeof doneCallback === 'function') doneCallback();

      }
    } catch (err: any) {
      (window as any).showToast(err.message || 'No se pudo guardar la reserva', 'error');
    }
  });
}

(window as any).viewImportReservationDetail = async function(reservationId: string) {
  try {
    const [res, lines] = await Promise.all([
      (window as any).pb.get('sales_reservations', reservationId, { expand: 'customer_id,sales_order_id,invoice_id' }),
      (window as any).pb.listAll('sales_reservation_lines', {
        filter: `reservation_id="${(window as any).pb.escapeFilterValue(reservationId)}"`,
        sort: 'line_order',
        expand: 'product_id,import_id,import_line_id',
      }),
    ]);

    const status = RES_STATUS[res.status] || { label: res.status || 'N/D', badge: 'badge-gray' };

    const html = `
      <div class="space-y-5 text-sm" style="color:#374151">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl border" style="background:#F9FAFB;border-color:#E5E7EB">
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Reserva</span><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(res.number || 'S/N')}</span></div>
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Cliente</span><span class="font-semibold">${(window as any).esc(res.expand?.customer_id?.name || '—')}</span></div>
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Estado</span><span class="badge ${status.badge}">${status.label}</span></div>
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Pedido</span><span class="font-mono">${(window as any).esc(res.expand?.sales_order_id?.number || '—')}</span></div>
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Factura</span><span class="font-mono">${(window as any).esc(res.expand?.invoice_id?.number || '—')}</span></div>
          <div><span class="text-[10px] uppercase font-bold block" style="color:#6B7280">Creada</span><span class="font-semibold">${(window as any).esc((res.created || '').slice(0, 10))}</span></div>
        </div>

        <div class="border rounded-xl overflow-hidden" style="border-color:#E5E7EB">
          <table class="data-table w-full">
            <thead>
              <tr style="background:#F4F8FF">
                <th>Producto</th>
                <th>Importacion</th>
                <th>ETA</th>
                <th class="text-right">Reservado</th>
                <th class="text-right">Despachado</th>
                <th class="text-right">Liberado</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map((l: any) => {
                const st = RES_STATUS[l.status] || { label: l.status || 'N/D', badge: 'badge-gray' };
                return `<tr>
                  <td>${(window as any).esc(l.expand?.product_id?.name || l.product_id)}</td>
                  <td>${(window as any).esc(l.expand?.import_id?.number || '—')}</td>
                  <td>${(window as any).esc(l.eta_snapshot || '—')}</td>
                  <td class="text-right font-mono">${(window as any).fmtN(Number(l.qty_reserved || 0))}</td>
                  <td class="text-right font-mono">${(window as any).fmtN(Number(l.qty_dispatched || 0))}</td>
                  <td class="text-right font-mono">${(window as any).fmtN(Number(l.qty_released || 0))}</td>
                  <td><span class="badge ${st.badge}">${st.label}</span></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="p-3 rounded-xl" style="background:#F9FAFB;border:1px solid #E5E7EB">
          <strong>Notas:</strong> ${(window as any).esc(res.notes || 'Sin notas')}
        </div>
      </div>
    `;

    const canConvert = (res.status === 'active' || res.status === 'partial') && !res.invoice_id && !!res.sales_order_id;
    const footer = `
      <button class="btn btn-outline" style="border-color:#3b82f6;color:#3b82f6" onclick="window.printReservationCarta('${(window as any).esc(res.id)}')"><i class="fas fa-print mr-1"></i> Imprimir</button>
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      ${canConvert ? `<button class="btn btn-primary" onclick="window.convertReservationToInvoice('${(window as any).esc(res.id)}')"><i class="fas fa-file-invoice"></i> Convertir a factura</button>` : ''}
    `;

    (window as any).openModal(`Detalle Reserva ${res.number || ''}`, html, footer, true);
  } catch (err: any) {
    (window as any).showToast(err.message || 'No se pudo abrir el detalle', 'error');
  }
};

(window as any).convertReservationToInvoice = async function(reservationId: string) {
  try {
    const res = await (window as any).pb.get('sales_reservations', reservationId, { expand: 'sales_order_id,invoice_id' });

    if (res.invoice_id) {
      (window as any).showToast('La reserva ya tiene factura asociada.', 'info');
      if (typeof (window as any).viewSalesInvoiceFromOrder === 'function' && res.invoice_id) {
        (window as any).viewSalesInvoiceFromOrder(res.invoice_id);
      }
      return;
    }

    if (!res.sales_order_id) {
      throw new Error('La reserva no tiene pedido vinculado para facturar.');
    }

    await (window as any).pb.update('sales_orders', res.sales_order_id, {
      has_pending_delivery: true,
      fulfillment_status: 'RESERVADO_IMPORTACION',
    }).catch(() => {});

    (window as any).closeModal();
    if (typeof (window as any).invoiceSalesOrderDirect === 'function') {
      (window as any).invoiceSalesOrderDirect(res.sales_order_id);
      (window as any).showToast('Pedido de la reserva abierto para facturacion.', 'info');
    } else {
      throw new Error('No se encontro el flujo de facturacion de pedidos.');
    }
  } catch (err: any) {
    (window as any).showToast(err.message || 'No se pudo convertir la reserva', 'error');
  }
};

(window as any).acceptImportReservation = async function(reservationId: string) {
  try {
    const res = await (window as any).pb.get('sales_reservations', reservationId, {
      expand: 'customer_id,sales_order_id'
    });

    if (res.sales_order_id) {
      (window as any).showToast('Esta reserva ya fue aceptada y tiene la Orden de Carga / Pedido generada.', 'info');
      return;
    }

    const resLines = await (window as any).pb.listAll('sales_reservation_lines', {
      filter: `reservation_id="${(window as any).pb.escapeFilterValue(reservationId)}"`,
      expand: 'product_id'
    });

    if (!resLines.length) {
      throw new Error('La reserva no contiene productos para generar la orden de carga.');
    }

    (window as any).confirmDialog(
      'Aceptar Reserva y Crear Pedido',
      `¿Confirmar que el cliente ACEPTÓ o realizó abono para la reserva <strong>${(window as any).esc(res.number || '')}</strong> y generar la ORDEN DE CARGA / PEDIDO para logística?`,
      async () => {
        try {
          const products = await (window as any).API.getProducts({ activeOnly: false });
          const rawSalesCfg = await (window as any).API.getSetting('sales_settings_v2').catch(() => null);
          const salesConfig = rawSalesCfg ? JSON.parse(rawSalesCfg) : null;
          const pricesIncludeIva = (salesConfig?.operational?.prices_include_iva === true);

          const groupedProducts: Record<string, { product: any, qty: number }> = {};
          for (const l of resLines) {
            const p = l.expand?.product_id || products.find((x: any) => x.id === l.product_id);
            if (!p) continue;
            if (!groupedProducts[p.id]) {
              groupedProducts[p.id] = { product: p, qty: 0 };
            }
            groupedProducts[p.id].qty += Number(l.qty_reserved || 0);
          }

          const orderLines: any[] = [];
          for (const pId of Object.keys(groupedProducts)) {
            const item = groupedProducts[pId];
            const prodPrice = Number(item.product.base_price || 0);
            const ivaRate = Number(item.product.iva_rate ?? 19);
            const unitPriceDb = pricesIncludeIva ? (prodPrice / (1 + ivaRate / 100)) : prodPrice;
            const subtotal = item.qty * unitPriceDb;
            const ivaAmount = subtotal * (ivaRate / 100);
            const total = subtotal + ivaAmount;

            orderLines.push({
              product_id: item.product.id,
              description: `${item.product.code || ''} - ${item.product.name}`,
              qty: item.qty,
              unit_price: unitPriceDb,
              iva_rate: ivaRate,
              iva_amount: ivaAmount,
              subtotal,
              total,
            });
          }

          const order = await (window as any).API.createSalesOrder({
            number: 'AUTO',
            customer_id: res.customer_id,
            date: (window as any).todayStr(),
            due_date: (window as any).addDaysToDateStr((window as any).todayStr(), 5),
            notes: res.notes ? `Reserva ${res.number}: ${res.notes}` : `Orden de Carga generada desde Reserva ${res.number}`,
            has_pending_delivery: true,
            fulfillment_status: 'RESERVADO_IMPORTACION',
          }, orderLines);

          await (window as any).pb.update('sales_reservations', reservationId, {
            status: 'accepted',
            sales_order_id: order.id,
            notes: res.notes ? `${res.notes} | Aceptada -> Pedido ${order.number}` : `Aceptada -> Pedido ${order.number}`,
          });

          await (window as any).API.logAudit('UPDATE', 'SalesReservation', reservationId, `Reserva ${res.number} ACEPTADA. Pedido ${order.number} generado.`);

          (window as any).showToast(`Reserva ${res.number} ACEPTADA. Se ha creado la Orden de Carga / Pedido ${order.number} para despacho.`, 'success');

          const content = document.getElementById('page-content');
          if (content && typeof (window as any).renderReservasImportacion === 'function') {
            (window as any).renderReservasImportacion(content);
          }
        } catch (err: any) {
          (window as any).showToast('Error al aceptar la reserva: ' + (err.message || err), 'error');
        }
      },
      false
    );
  } catch (err: any) {
    (window as any).showToast(err.message || 'No se pudo procesar la reserva', 'error');
  }
};


(window as any).cancelImportReservation = async function(reservationId: string, reservationNumber: string) {
  const reason = prompt(`Vas a cancelar la reserva ${reservationNumber}.\nEscribe el motivo:`);
  if (reason === null) return;
  if (!reason.trim()) {
    alert('Debes indicar un motivo de cancelacion.');
    return;
  }

  try {
    const lines = await (window as any).pb.listAll('sales_reservation_lines', {
      filter: `reservation_id="${(window as any).pb.escapeFilterValue(reservationId)}"`,
    });

    for (const l of lines) {
      const reserved = Number(l.qty_reserved || 0);
      const dispatched = Number(l.qty_dispatched || 0);
      const released = Number(l.qty_released || 0);
      const pendingRelease = Math.max(0, reserved - dispatched - released);
      await (window as any).pb.update('sales_reservation_lines', l.id, {
        qty_released: released + pendingRelease,
        status: dispatched >= reserved ? 'completed' : 'cancelled',
        notes: `${l.notes || ''} | Cancelada: ${reason.trim()}`,
      });
    }

    await (window as any).pb.update('sales_reservations', reservationId, {
      status: 'cancelled',
      notes: `Cancelada: ${reason.trim()}`,
    });

    await (window as any).API.logAudit('CANCEL', 'SalesReservation', reservationId, `Reserva ${reservationNumber} cancelada | Motivo: ${reason.trim()}`);

    (window as any).showToast('Reserva cancelada', 'success');
    const content = document.getElementById('page-content');
    if (content) renderReservasImportacion(content);
  } catch (err: any) {
    (window as any).showToast(err.message || 'No se pudo cancelar la reserva', 'error');
  }
};

(window as any).printReservationCarta = async function(reservationId: string) {
  try {
    const [reservation, reservationLines] = await Promise.all([
      (window as any).pb.get('sales_reservations', reservationId, { expand: 'customer_id,sales_order_id,invoice_id' }),
      (window as any).pb.listAll('sales_reservation_lines', {
        filter: `reservation_id="${(window as any).pb.escapeFilterValue(reservationId)}"`,
        sort: 'line_order',
        expand: 'product_id,import_id',
      }),
    ]);

    let salesOrder: any = null;
    let salesOrderLines: any[] = [];
    if (reservation.sales_order_id) {
      salesOrder = await (window as any).pb.get('sales_orders', reservation.sales_order_id, { expand: 'warehouse_id' }).catch(() => null);
      salesOrderLines = await (window as any).API.getSalesOrderLines(reservation.sales_order_id).catch(() => []);
    }

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

    const subtotal = Number(salesOrder?.subtotal || 0);
    const ivaTotal = Number(salesOrder?.iva_total || 0);
    const total = Number(salesOrder?.total || 0);

    const docStr = printWin.document;
    docStr.write(`
      <html>
      <head>
        <title>Reserva de Importacion — ${(window as any).esc(reservation.number || '')}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #222; margin: 40px; font-size: 13px; line-height: 1.5; }
          .hdr-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .hdr-left { vertical-align: top; width: 60%; }
          .hdr-right { vertical-align: top; width: 40%; text-align: right; }
          .company-name { font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
          .document-title { font-size: 22px; font-weight: 800; color: #1e3a8a; margin-bottom: 5px; }
          .box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; margin-bottom: 16px; }
          .box-title { font-weight: bold; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 10px; color: #1e293b; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .details-grid div span { font-weight: bold; color: #475569; }
          .lines-table { width: 100%; border-collapse: collapse; margin: 14px 0 24px 0; }
          .lines-table th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; font-size: 12px; text-transform: uppercase; }
          .lines-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .lines-table tr:last-child td { border-bottom: 2px solid #0f172a; }
          .totals-table { width: 40%; float: right; border-collapse: collapse; margin-bottom: 30px; }
          .totals-table td { padding: 8px 10px; }
          .totals-table tr.grand-total td { font-size: 15px; font-weight: bold; color: #1e3a8a; border-top: 1px solid #cbd5e1; }
          .footer { clear: both; text-align: center; border-top: 1.5px dashed #cbd5e1; padding-top: 18px; color: #64748b; font-size: 11px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <table class="hdr-table">
          <tr>
            <td class="hdr-left">
              <div class="company-name">${(window as any).esc(compName)}</div>
              <div>NIT: ${(window as any).esc(compNit)}</div>
              ${compAddress ? `<div>Direccion: ${(window as any).esc(compAddress)}</div>` : ''}
              ${compPhone ? `<div>Telefono: ${(window as any).esc(compPhone)}</div>` : ''}
              ${compEmail ? `<div>Email: ${(window as any).esc(compEmail)}</div>` : ''}
              ${(compCity || compCountry) ? `<div>${(window as any).esc(compCity)}${compCity && compCountry ? ', ' : ''}${(window as any).esc(compCountry)}</div>` : ''}
            </td>
            <td class="hdr-right">
              <div class="document-title">RESERVA DE IMPORTACION</div>
              <div style="font-size:16px;font-weight:bold;color:#ef4444;margin-bottom:10px">${(window as any).esc(reservation.number || 'S/N')}</div>
              <div>Fecha: ${(window as any).esc((reservation.created || '').slice(0, 10))}</div>
              <div>Estado: ${(window as any).esc((RES_STATUS[reservation.status]?.label || reservation.status || 'N/D').toUpperCase())}</div>
              ${reservation.expand?.sales_order_id?.number ? `<div>Pedido: ${(window as any).esc(reservation.expand.sales_order_id.number)}</div>` : ''}
              ${reservation.expand?.invoice_id?.number ? `<div>Factura: ${(window as any).esc(reservation.expand.invoice_id.number)}</div>` : ''}
            </td>
          </tr>
        </table>

        <div class="box">
          <div class="box-title">Datos del Cliente</div>
          <div class="details-grid">
            <div><span>Cliente:</span> ${(window as any).esc(reservation.expand?.customer_id?.name || '—')}</div>
            <div><span>NIT/Documento:</span> ${(window as any).esc(reservation.expand?.customer_id?.doc_number || reservation.expand?.customer_id?.nit || '—')}</div>
            <div><span>Pedido asociado:</span> ${(window as any).esc(reservation.expand?.sales_order_id?.number || '—')}</div>
            <div><span>Bodega:</span> ${(window as any).esc(salesOrder?.expand?.warehouse_id?.name || '—')}</div>
            <div><span>Notas:</span> ${(window as any).esc(reservation.notes || 'Sin notas')}</div>
          </div>
        </div>

        <div class="box">
          <div class="box-title">Lineas de Reserva (Logistica)</div>
          <table class="lines-table" style="margin-top:0">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Importacion</th>
                <th>ETA</th>
                <th style="text-align:right">Reservado</th>
                <th style="text-align:right">Despachado</th>
                <th style="text-align:right">Liberado</th>
              </tr>
            </thead>
            <tbody>
              ${reservationLines.map((l: any) => `
                <tr>
                  <td>${(window as any).esc(l.expand?.product_id?.name || l.product_id || 'Producto')}</td>
                  <td>${(window as any).esc(l.expand?.import_id?.number || '—')}</td>
                  <td>${(window as any).esc(l.eta_snapshot || '—')}</td>
                  <td style="text-align:right">${(window as any).fmtN(Number(l.qty_reserved || 0))}</td>
                  <td style="text-align:right">${(window as any).fmtN(Number(l.qty_dispatched || 0))}</td>
                  <td style="text-align:right">${(window as any).fmtN(Number(l.qty_released || 0))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${salesOrderLines.length ? `
          <div class="box">
            <div class="box-title">Detalle Comercial del Pedido Asociado</div>
            <table class="lines-table" style="margin-top:0">
              <thead>
                <tr>
                  <th>Producto/Servicio</th>
                  <th style="text-align:right">Cant.</th>
                  <th style="text-align:right">Vlr Unitario</th>
                  <th style="text-align:right">IVA %</th>
                  <th style="text-align:right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${salesOrderLines.map((l: any) => `
                  <tr>
                    <td>${(window as any).esc(l.description || l.expand?.product_id?.name || 'Linea')}</td>
                    <td style="text-align:right">${(window as any).fmtN(Number(l.qty || 0))}</td>
                    <td style="text-align:right">${(window as any).fmt(Number(l.unit_price || 0))}</td>
                    <td style="text-align:right">${(window as any).esc(String(l.iva_rate || 0))}%</td>
                    <td style="text-align:right">${(window as any).fmt(Number(l.total || 0))}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align:right;font-weight:600">${(window as any).fmt(subtotal)}</td>
            </tr>
            <tr>
              <td>IVA:</td>
              <td style="text-align:right;font-weight:600">${(window as any).fmt(ivaTotal)}</td>
            </tr>
            <tr class="grand-total">
              <td>TOTAL:</td>
              <td style="text-align:right">${(window as any).fmt(total)}</td>
            </tr>
          </table>
        ` : ''}

        <div class="footer">
          <p>Documento de reserva logistica de importacion para control de entregas pendientes.</p>
          <p>Software de Gestion GRAVY v2.0</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    docStr.close();
  } catch (err: any) {
    (window as any).showToast('Error al imprimir reserva: ' + (err.message || err), 'error');
  }
};

(window as any).renderReservasImportacion = renderReservasImportacion;
(window as any).editImportReservation = (reservationId: string) => {
  const container = document.getElementById('page-content');
  openReservationForm(reservationId, () => {
    if (container) renderReservasImportacion(container);
  });
};

export async function renderTransitInventoryReport(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando reporte de inventario en tránsito...</div>`;

  try {
    const [importLines, reservationLines, products] = await Promise.all([
      (window as any).pb.listAll('import_lines', {
        filter: 'import_id.status="transito" || import_id.status="nacionalizacion"',
        expand: 'import_id,product_id,import_id.supplier_id',
      }),
      (window as any).pb.listAll('sales_reservation_lines', {
        filter: 'import_line_id!="" && (status="active" || status="partial") && (reservation_id.status="active" || reservation_id.status="partial")',
        expand: 'reservation_id,reservation_id.customer_id,product_id',
      }).catch(() => []),
      (window as any).API.getProducts({ activeOnly: false }),
    ]);

    // Mapear reservas activas por import_line_id
    const reservedByImportLine: Record<string, { qty: number, items: any[] }> = {};
    for (const r of reservationLines) {
      const lineId = r.import_line_id;
      if (!lineId) continue;
      const committed = Math.max(0, Number(r.qty_reserved || 0) - Number(r.qty_dispatched || 0) - Number(r.qty_released || 0));
      if (!reservedByImportLine[lineId]) {
        reservedByImportLine[lineId] = { qty: 0, items: [] };
      }
      reservedByImportLine[lineId].qty += committed;
      reservedByImportLine[lineId].items.push({
        reservation_number: r.expand?.reservation_id?.number || 'RES',
        customer_name: r.expand?.reservation_id?.expand?.customer_id?.name || 'Cliente',
        qty_reserved: committed,
        created: r.created,
      });
    }

    // Estructurar ítems por línea de importación
    const itemRecords = importLines.map((il: any) => {
      const prod = il.expand?.product_id || products.find((p: any) => p.id === il.product_id);
      const imp = il.expand?.import_id;
      const supp = imp?.expand?.supplier_id;
      const totalQty = Number(il.qty || 0);
      const resData = reservedByImportLine[il.id] || { qty: 0, items: [] };
      const reservedQty = resData.qty;
      const availableQty = Math.max(0, totalQty - reservedQty);

      return {
        id: il.id,
        product_id: il.product_id,
        code: prod?.code || 'S/C',
        name: prod?.name || 'Producto Desconocido',
        unit_measure: prod?.unit_measure || 'UND',
        import_id: imp?.id,
        import_number: imp?.number || 'S/N',
        supplier_name: supp?.name || 'Proveedor Int.',
        estimated_arrival: imp?.estimated_arrival || '—',
        total_qty: totalQty,
        reserved_qty: reservedQty,
        available_qty: availableQty,
        reservations: resData.items,
      };
    });

    // Agrupar consolidado por producto
    const productSummaryMap: Record<string, any> = {};
    for (const rec of itemRecords) {
      const pid = rec.product_id || rec.code;
      if (!productSummaryMap[pid]) {
        productSummaryMap[pid] = {
          code: rec.code,
          name: rec.name,
          unit_measure: rec.unit_measure,
          total_qty: 0,
          reserved_qty: 0,
          available_qty: 0,
          imports_count: 0,
          items: [],
        };
      }
      productSummaryMap[pid].total_qty += rec.total_qty;
      productSummaryMap[pid].reserved_qty += rec.reserved_qty;
      productSummaryMap[pid].available_qty += rec.available_qty;
      productSummaryMap[pid].imports_count += 1;
      productSummaryMap[pid].items.push(rec);
    }
    const summaryRows = Object.values(productSummaryMap);

    const totalRefs = summaryRows.length;
    const totalTransitUnits = summaryRows.reduce((s, r) => s + r.total_qty, 0);
    const totalReservedUnits = summaryRows.reduce((s, r) => s + r.reserved_qty, 0);
    const totalAvailableUnits = summaryRows.reduce((s, r) => s + r.available_qty, 0);

    (window as any).__transitReportData = { itemRecords, summaryRows };

    container.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Inventario en Tránsito & Disponibilidad para Ventas</h3>
          <p class="text-sm" style="color:#6B7280">Monitoreo de referencias en importación: unidades totales, reservas de clientes y disponible libre para ofertar.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-outline" id="btn-export-transit-excel"><i class="fas fa-file-excel text-emerald-600 mr-1.5"></i> Exportar a Excel</button>
          <button class="btn btn-outline" id="btn-print-transit-report"><i class="fas fa-print text-blue-600 mr-1.5"></i> Imprimir</button>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${resKpi('Referencias en Tránsito', totalRefs, 'fas fa-boxes-stacked', '#1A4B8C', '#EEF4FF')}
        ${resKpi('Total Unidades Importación', (window as any).fmtN(totalTransitUnits), 'fas fa-truck-ramp-box', '#374151', '#F3F4F6')}
        ${resKpi('Unidades Reservadas', (window as any).fmtN(totalReservedUnits), 'fas fa-lock', '#D97706', '#FEF3C7')}
        ${resKpi('Disponibles para Vender', (window as any).fmtN(totalAvailableUnits), 'fas fa-circle-check', '#059669', '#D1FAE5')}
      </div>

      <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center justify-between" style="border-color:#F0F0F0">
        <div class="flex flex-1 gap-3 items-center min-w-64">
          <div class="relative flex-1">
            <i class="fas fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9CA3AF;font-size:12px"></i>
            <input id="transit-q" class="form-input w-full pl-9 text-sm" placeholder="Buscar por código, producto, importación o proveedor...">
          </div>
          <select id="transit-view-mode" class="form-input text-sm" style="max-width:260px">
            <option value="summary">Vista Consolidada por Producto</option>
            <option value="detailed">Vista Detallada por Importación</option>
          </select>
        </div>
      </div>

      <div id="transit-report-table-wrap" class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        ${renderTransitReportSummaryTable(summaryRows)}
      </div>
    `;

    const qInput = document.getElementById('transit-q') as HTMLInputElement;
    const viewSelect = document.getElementById('transit-view-mode') as HTMLSelectElement;

    const updateView = () => {
      const q = (qInput?.value || '').toLowerCase().trim();
      const mode = viewSelect?.value || 'summary';
      const wrap = document.getElementById('transit-report-table-wrap');
      if (!wrap) return;

      if (mode === 'summary') {
        const filtered = summaryRows.filter(r => `${r.code} ${r.name}`.toLowerCase().includes(q));
        wrap.innerHTML = renderTransitReportSummaryTable(filtered);
      } else {
        const filtered = itemRecords.filter(r => `${r.code} ${r.name} ${r.import_number} ${r.supplier_name}`.toLowerCase().includes(q));
        wrap.innerHTML = renderTransitReportDetailedTable(filtered);
      }
    };

    qInput?.addEventListener('input', updateView);
    viewSelect?.addEventListener('change', updateView);

    document.getElementById('btn-export-transit-excel')?.addEventListener('click', () => exportTransitReportToExcel(itemRecords));
    document.getElementById('btn-print-transit-report')?.addEventListener('click', () => printTransitReport(itemRecords, summaryRows));

  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>Error al cargar reporte de inventario en tránsito: ${(window as any).esc(err.message)}</div>`;
  }
}

function renderTransitReportSummaryTable(rows: any[]) {
  if (!rows.length) {
    return `<div class="p-10 text-center text-gray-400"><i class="fas fa-box-open mr-2 text-xl"></i>No se encontraron referencias en tránsito.</div>`;
  }

  return `
    <div class="overflow-x-auto">
      <table class="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto / Referencia</th>
            <th class="text-center">Importaciones</th>
            <th class="text-right">Total Tránsito</th>
            <th class="text-right">Reservado Clientes</th>
            <th class="text-right font-extrabold" style="color:#059669">Disponible Ventas</th>
            <th class="text-center">Estado</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => {
            let badge = '<span class="badge badge-green">🟢 100% Libre</span>';
            if (r.available_qty <= 0) {
              badge = '<span class="badge badge-red">🔴 100% Reservado</span>';
            } else if (r.reserved_qty > 0) {
              badge = '<span class="badge badge-yellow">🔵 Parcialmente Reservado</span>';
            }

            return `
              <tr>
                <td class="font-mono font-bold text-xs" style="color:#1A4B8C">${(window as any).esc(r.code)}</td>
                <td class="font-semibold text-gray-800">${(window as any).esc(r.name)}</td>
                <td class="text-center"><span class="badge badge-gray">${r.imports_count} ord.</span></td>
                <td class="text-right font-mono font-bold">${(window as any).fmtN(r.total_qty)} ${r.unit_measure}</td>
                <td class="text-right font-mono text-amber-600 font-semibold">${(window as any).fmtN(r.reserved_qty)} ${r.unit_measure}</td>
                <td class="text-right font-mono font-extrabold text-emerald-600 text-sm">${(window as any).fmtN(r.available_qty)} ${r.unit_measure}</td>
                <td class="text-center">${badge}</td>
                <td class="text-center">
                  <button class="btn btn-outline btn-sm" title="Ver desglose por importación" onclick="window.viewProductTransitDetail('${(window as any).esc(r.code)}')">
                    <i class="fas fa-eye"></i> Detalle
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderTransitReportDetailedTable(rows: any[]) {
  if (!rows.length) {
    return `<div class="p-10 text-center text-gray-400"><i class="fas fa-box-open mr-2 text-xl"></i>No se encontraron importaciones en tránsito.</div>`;
  }

  return `
    <div class="overflow-x-auto">
      <table class="data-table">
        <thead>
          <tr>
            <th>Importación</th>
            <th>Proveedor Int.</th>
            <th>ETA (Llegada)</th>
            <th>Código</th>
            <th>Producto</th>
            <th class="text-right">Cant. Importada</th>
            <th class="text-right">Reservada</th>
            <th class="text-right font-extrabold" style="color:#059669">Disponible Ventas</th>
            <th>Reservas Activas de Clientes</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => {
            const resBadges = r.reservations.length
              ? r.reservations.map((res: any) => `
                  <span class="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200" title="${(window as any).esc(res.customer_name)}">
                    <i class="fas fa-user text-[9px]"></i> <b>${(window as any).esc(res.reservation_number)}:</b> ${(window as any).esc(res.customer_name)} (${(window as any).fmtN(res.qty_reserved)})
                  </span>
                `).join(' ')
              : '<span class="text-xs text-gray-400 italic">Sin reservas</span>';

            return `
              <tr>
                <td><span class="font-mono font-bold text-xs" style="color:#1A4B8C">${(window as any).esc(r.import_number)}</span></td>
                <td class="text-xs text-gray-600">${(window as any).esc(r.supplier_name)}</td>
                <td class="text-xs font-semibold" style="color:#D97706"><i class="fas fa-calendar-day mr-1"></i>${(window as any).esc(r.estimated_arrival)}</td>
                <td class="font-mono text-xs text-gray-700">${(window as any).esc(r.code)}</td>
                <td class="font-semibold text-gray-800 text-xs">${(window as any).esc(r.name)}</td>
                <td class="text-right font-mono text-xs font-bold">${(window as any).fmtN(r.total_qty)}</td>
                <td class="text-right font-mono text-xs text-amber-600 font-semibold">${(window as any).fmtN(r.reserved_qty)}</td>
                <td class="text-right font-mono text-xs font-extrabold text-emerald-600">${(window as any).fmtN(r.available_qty)}</td>
                <td class="text-xs">${resBadges}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function exportTransitReportToExcel(itemRecords: any[]) {
  if (typeof (window as any).exportToExcel === 'function') {
    const headers = [
      { key: 'import_number', label: 'Nro. Importación' },
      { key: 'supplier_name', label: 'Proveedor Internacional' },
      { key: 'estimated_arrival', label: 'ETA Arribo Estimado' },
      { key: 'code', label: 'Código Producto' },
      { key: 'name', label: 'Producto / Referencia' },
      { key: 'total_qty', label: 'Cantidad Importada' },
      { key: 'reserved_qty', label: 'Cantidad Reservada Clientes' },
      { key: 'available_qty', label: 'Disponible para Ventas' },
    ];
    (window as any).exportToExcel('Reporte_Inventario_Transito_Disponibilidad', headers, itemRecords);
    (window as any).showToast('Reporte exportado a Excel correctamente.', 'success');
  } else {
    (window as any).showToast('Exportador de Excel no disponible.', 'error');
  }
}

function printTransitReport(itemRecords: any[], summaryRows: any[]) {
  const win = window.open('', '_blank');
  if (!win) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reporte de Inventario en Tránsito & Disponibilidad</title>
      <style>
        body { font-family: sans-serif; padding: 20px; color: #333; }
        h2 { color: #0D2137; margin-bottom: 4px; }
        p { color: #666; font-size: 13px; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f3f4f6; color: #111827; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-emerald { color: #059669; font-weight: bold; }
        .text-amber { color: #d97706; }
      </style>
    </head>
    <body>
      <h2>GRAVY v2.0 - Reporte de Disponibilidad de Inventario en Tránsito</h2>
      <p>Generado el: ${new Date().toLocaleString('es-CO')}</p>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Nro. Imp</th>
            <th>Proveedor</th>
            <th>ETA</th>
            <th class="text-right">Importado</th>
            <th class="text-right">Reservado</th>
            <th class="text-right">Disponible Ventas</th>
          </tr>
        </thead>
        <tbody>
          ${itemRecords.map((r: any) => `
            <tr>
              <td>${(window as any).esc(r.code)}</td>
              <td>${(window as any).esc(r.name)}</td>
              <td>${(window as any).esc(r.import_number)}</td>
              <td>${(window as any).esc(r.supplier_name)}</td>
              <td>${(window as any).esc(r.estimated_arrival)}</td>
              <td class="text-right font-bold">${(window as any).fmtN(r.total_qty)}</td>
              <td class="text-right text-amber">${(window as any).fmtN(r.reserved_qty)}</td>
              <td class="text-right text-emerald">${(window as any).fmtN(r.available_qty)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
}

(window as any).viewProductTransitDetail = function(productCode: string) {
  const data = (window as any).__transitReportData;
  if (!data) return;
  const items = data.itemRecords.filter((rec: any) => rec.code === productCode);
  if (!items.length) {
    (window as any).showToast('No hay detalles para este producto.', 'info');
    return;
  }

  const prodName = items[0].name;
  const html = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="p-3 rounded-xl bg-blue-50 border border-blue-100">
        <span class="text-xs text-blue-700 font-mono">[${(window as any).esc(productCode)}]</span>
        <h4 class="font-bold text-blue-900">${(window as any).esc(prodName)}</h4>
      </div>
      ${renderTransitReportDetailedTable(items)}
    </div>
  `;

  (window as any).openModal(`Desglose de Tránsito: ${productCode}`, html, `<button class="btn btn-primary" onclick="closeModal()">Cerrar</button>`, true);
};

(window as any).renderTransitInventoryReport = renderTransitInventoryReport;

