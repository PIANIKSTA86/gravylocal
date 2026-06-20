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
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando reservas de importacion...</div>`;
  try {
    await loadReservasPage(container);
  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message || 'No se pudo cargar')}</div>`;
  }
}

async function loadReservasPage(c: HTMLElement) {
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
        <h3 class="text-lg font-bold" style="color:#0D2137">Reservas de Importacion</h3>
        <p class="text-sm" style="color:#6B7280">Crea reservas logisticas antes de facturar y conviertelas despues a factura de venta.</p>
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

  document.getElementById('btn-new-reserva')?.addEventListener('click', () => openReservationForm(() => loadReservasPage(c)));
  const applyFilter = () => filterReservationTable();
  document.getElementById('res-q')?.addEventListener('input', applyFilter);
  document.getElementById('res-status-f')?.addEventListener('change', applyFilter);
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
  const canConvert = (r.status === 'active' || r.status === 'partial') && !invoice && !!order;
  const canCancel = (r.status === 'active' || r.status === 'partial') && !invoice;

  return `
    <tr data-resid="${(window as any).esc(r.id)}" data-resstatus="${(window as any).esc(r.status)}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${(window as any).esc(r.number || 'S/N')}</span></td>
      <td>${(window as any).esc((r.created || '').slice(0, 10))}</td>
      <td class="font-medium">${customer ? (window as any).esc(customer.name) : '—'}</td>
      <td>${order ? `<span class="font-mono">${(window as any).esc(order.number || 'PED')}</span>` : '—'}</td>
      <td>${invoice ? `<span class="font-mono" style="color:#059669">${(window as any).esc(invoice.number || 'FV')}</span>` : '—'}</td>
      <td><span class="badge ${status.badge}">${status.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="window.viewImportReservationDetail('${(window as any).esc(r.id)}')"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm text-blue-600" style="border-color:#3b82f6" title="Imprimir" onclick="window.printReservationCarta('${(window as any).esc(r.id)}')"><i class="fas fa-print"></i></button>
          ${canConvert ? `<button class="btn btn-primary btn-sm" title="Convertir a factura" onclick="window.convertReservationToInvoice('${(window as any).esc(r.id)}')"><i class="fas fa-file-invoice"></i> Facturar</button>` : ''}
          ${canCancel ? `<button class="btn btn-danger btn-sm" title="Cancelar" onclick="window.cancelImportReservation('${(window as any).esc(r.id)}','${(window as any).esc(r.number || '')}')"><i class="fas fa-ban"></i></button>` : ''}
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

async function openReservationForm(onDone: any = null) {
  const [customers, warehouses, products] = await Promise.all([
    (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }),
    (window as any).API.getWarehouses(true),
    (window as any).API.getProducts({ activeOnly: true }),
  ]);

  const sellers = customers.filter((c: any) => c.type === 'VENDEDOR');
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
    <button class="btn btn-primary" id="btn-save-reserva"><i class="fas fa-floppy-disk"></i> Guardar Reserva</button>
  `;

  (window as any).openModal('Nueva Reserva de Importacion', html, footer, true);

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

  const addLine = async (prod: any) => {
    lineCounter += 1;
    const idx = lineCounter;
    const tbody = document.getElementById('res-lines-body');
    if (!tbody) return;

    const incoming = await (window as any).API.getIncomingStockForProduct(prod.id).catch(() => []);
    const available = (incoming || []).reduce((sum: number, x: any) => sum + Number(x.qty_available ?? x.qty ?? 0), 0);

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
      <td><input type="number" id="resl-qty-${idx}" class="form-input text-right" min="0.001" step="0.001" value="1" oninput="window.resRecalcLine(${idx})"></td>
      <td><input type="number" id="resl-price-${idx}" class="form-input text-right" min="0" step="0.01" value="${Number(prod.base_price || 0)}" oninput="window.resRecalcLine(${idx})"></td>
      <td>
        <select id="resl-iva-${idx}" class="form-input text-right" onchange="window.resRecalcLine(${idx})">
          <option value="0" ${Number(prod.iva_rate || 19) === 0 ? 'selected' : ''}>0</option>
          <option value="5" ${Number(prod.iva_rate || 19) === 5 ? 'selected' : ''}>5</option>
          <option value="19" ${Number(prod.iva_rate || 19) === 19 ? 'selected' : ''}>19</option>
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
    const sub = qty * price;
    const iva = sub * (ivaRate / 100);
    const total = sub + iva;
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
      const lineSub = qty * price;
      subtotal += lineSub;
      iva += lineSub * (ivaRate / 100);
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
      const customerId = (document.getElementById('res-customer') as HTMLSelectElement)?.value;
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

        const subtotal = qty * unitPrice;
        const ivaAmount = subtotal * (ivaRate / 100);
        const total = subtotal + ivaAmount;

        orderLines.push({
          product_id: productId,
          description: `${product.code || ''} - ${product.name}`,
          qty,
          unit_price: unitPrice,
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

      const order = await (window as any).API.createSalesOrder({
        number: 'AUTO',
        customer_id: customerId,
        warehouse_id: warehouseId,
        seller_id: sellerId,
        date,
        due_date: dueDate,
        notes: notes || 'Pedido generado desde modulo Reservas de Importacion',
        has_pending_delivery: true,
        fulfillment_status: 'RESERVADO_IMPORTACION',
      }, orderLines);

      const reservationNumber = await (window as any).API.nextSalesReservationConsecutive();
      const reservation = await (window as any).pb.create('sales_reservations', {
        number: reservationNumber,
        customer_id: customerId,
        sales_order_id: order.id,
        status: 'active',
        notes: notes || `Reserva creada desde modulo logistica para pedido ${order.number}`,
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

      await (window as any).API.logAudit('CREATE', 'SalesReservation', reservation.id, `Reserva ${reservationNumber} creada y vinculada al pedido ${order.number}`);

      (window as any).closeModal();
      (window as any).showToast(`Reserva ${reservationNumber} creada correctamente`, 'success');
      if (typeof onDone === 'function') onDone();
    } catch (err: any) {
      (window as any).showToast(err.message || 'No se pudo crear la reserva', 'error');
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
