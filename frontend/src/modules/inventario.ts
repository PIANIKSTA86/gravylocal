/**
 * GRAVY v2.0 — inventario.js
 * Gestión de Inventarios (F5).
 * Tabs: Stock actual · Movimientos · Bodegas
 */
'use strict';

const _pb = (): any => (window as any).pb;

// ── Constantes ────────────────────────────────────────────────────────────────
const INV_MOV_TYPES = [
  { value: 'ENTRADA',         label: 'Entrada',          icon: 'fa-arrow-down',  color: '#059669' },
  { value: 'SALIDA',          label: 'Salida',           icon: 'fa-arrow-up',    color: '#DC2626' },
  { value: 'TRASLADO',        label: 'Traslado',         icon: 'fa-right-left',  color: '#1A4B8C' },
  { value: 'AJUSTE_POSITIVO', label: 'Ajuste +',         icon: 'fa-plus-circle', color: '#059669' },
  { value: 'AJUSTE_NEGATIVO', label: 'Ajuste −',         icon: 'fa-minus-circle',color: '#C46516' },
];

const INV_STATUS_META = {
  draft:   { label: 'Borrador',  badge: 'badge-gray'   },
  applied: { label: 'Aplicado',  badge: 'badge-green'  },
  voided:  { label: 'Anulado',   badge: 'badge-orange' },
};

// ── Render principal ──────────────────────────────────────────────────────────
async function renderInventario(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando inventario...</div>`;

  try {
    const [stock, warehouses] = await Promise.all([
      API.getInventoryStock(),
      API.getWarehouses(false),
    ]);
    _renderInvPage(c, 'stock', { stock, warehouses });
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function _renderInvPage(c, activeTab, ctx = {}) {
  const tabs = [
    { id: 'stock',      label: 'Stock actual',   icon: 'fa-boxes-stacked'  },
    { id: 'movimientos',label: 'Movimientos',    icon: 'fa-arrows-rotate'  },
    { id: 'kardex',     label: 'Kardex',         icon: 'fa-table'          },
    { id: 'bodegas',    label: 'Bodegas',        icon: 'fa-warehouse'      },
    { id: 'reportes',   label: 'Reportes',       icon: 'fa-file-invoice'   },
  ];

  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Gestión de Inventarios</h3>
        <p class="text-sm" style="color:#6B7280">Stock actual, movimientos, bodegas y reportes.</p>
      </div>
    </div>
    <div class="flex gap-1 mb-5 border-b" style="border-color:#E5E7EB">
      ${tabs.map(t => `
        <button class="tab-btn px-5 py-2 text-sm font-medium rounded-t-lg${t.id === activeTab ? ' active' : ''}" data-tab="${t.id}">
          <i class="fas ${t.icon} mr-2"></i>${t.label}
        </button>`).join('')}
    </div>
    <div id="inv-tab-content"></div>`;

  const tabContent = c.querySelector('#inv-tab-content');

  function switchTab(tabId) {
    c.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    if (tabId === 'stock')       renderStockTab(tabContent, ctx);
    if (tabId === 'movimientos') renderMovimientosTab(tabContent, ctx);
    if (tabId === 'kardex')      renderKardexTab(tabContent, ctx);
    if (tabId === 'bodegas')     renderBodegasTab(tabContent, ctx);
    if (tabId === 'reportes')    renderReportesTab(tabContent, ctx);
  }

  c.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  switchTab(activeTab);
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: STOCK ACTUAL
// ══════════════════════════════════════════════════════════════════════════════
async function renderStockTab(c, ctx = {}) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando stock...</div>`;
  try {
    const [stock, warehouses] = await Promise.all([
      API.getInventoryStock(),
      API.getWarehouses(false),
    ]);
    ctx.stock      = stock;
    ctx.warehouses = warehouses;

    const totalSkus    = new Set(stock.map(s => s.product_id)).size;
    const totalUnits   = stock.reduce((a, s) => a + (s.qty_on_hand || 0), 0);
    const lowStock     = stock.filter(s => (s.qty_on_hand || 0) <= 0).length;
    const totalValue   = stock.reduce((a, s) => a + (s.qty_on_hand || 0) * (s.avg_cost || 0), 0);

    c.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        ${invKpi('SKUs en inventario', totalSkus,          'fas fa-box',          '#1A4B8C','#EEF4FF')}
        ${invKpi('Unidades totales',   fmtN(totalUnits),   'fas fa-cubes',        '#059669','#ECFDF5')}
        ${invKpi('Sin stock',          lowStock,           'fas fa-triangle-exclamation','#C46516','#FFF8F0')}
        ${invKpi('Valor estimado',     fmt(totalValue),    'fas fa-coins',        '#7C3AED','#F5F3FF')}
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3" style="border-color:#F0F0F0">
        <input id="st-q" class="form-input flex-1 min-w-48" placeholder="Buscar producto...">
        <select id="st-wh" class="form-input" style="max-width:220px">
          <option value="">Todas las bodegas</option>
          ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
        </select>
        <select id="st-status" class="form-input" style="max-width:180px">
          <option value="">Todo el stock</option>
          <option value="ok">Con stock</option>
          <option value="zero">Sin stock / Agotado</option>
        </select>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="stock-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Bodega</th>
                <th class="text-right">Stock</th>
                <th class="text-right">Costo prom.</th>
                <th class="text-right">Valor total</th>
                <th>Últ. movimiento</th>
              </tr>
            </thead>
            <tbody id="stock-tbody">
              ${stock.length ? renderStockRows(stock) : `<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-boxes-stacked mr-2"></i>No hay stock registrado.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;

    const applyStockFilter = () => filterStockTable();
    $('#st-q')?.addEventListener('input', debounce(applyStockFilter, 150));
    $('#st-wh')?.addEventListener('change', applyStockFilter);
    $('#st-status')?.addEventListener('change', applyStockFilter);
  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

function renderStockRows(stock) {
  return stock.map(s => {
    const prod = s.expand?.product_id;
    const wh   = s.expand?.warehouse_id;
    const qty  = s.qty_on_hand ?? 0;
    const cost = s.avg_cost ?? 0;
    const val  = qty * cost;
    const zero = qty <= 0;
    return `<tr data-whid="${esc(s.warehouse_id)}" data-qty="${qty}">
      <td class="font-medium">${prod ? esc(prod.name) : '<span style="color:#9CA3AF">—</span>'}</td>
      <td><span class="font-mono text-xs" style="color:#1A4B8C">${prod ? esc(prod.code) : '—'}</span></td>
      <td>${wh ? esc(wh.name) : '—'}</td>
      <td class="text-right font-semibold ${zero ? 'text-red-500' : ''}">${fmtN(qty)}</td>
      <td class="text-right">${cost ? fmt(cost) : '—'}</td>
      <td class="text-right">${val ? fmt(val) : '—'}</td>
      <td class="text-sm" style="color:#6B7280">${esc(s.last_mov_date || '—')}</td>
    </tr>`;
  }).join('');
}

function filterStockTable() {
  const q      = (getInputVal('st-q') || '').toLowerCase();
  const whId   = getSelectVal('st-wh');
  const status = getSelectVal('st-status');
  $$('#stock-table tbody tr[data-qty]').forEach(tr => {
    const text  = tr.textContent.toLowerCase();
    const qty   = parseFloat(tr.dataset.qty ?? '0');
    const okQ   = !q      || text.includes(q);
    const okWh  = !whId   || tr.dataset.whid === whId;
    const okSt  = !status || (status === 'ok' ? qty > 0 : qty <= 0);
    tr.style.display = okQ && okWh && okSt ? '' : 'none';
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: MOVIMIENTOS
// ══════════════════════════════════════════════════════════════════════════════
async function renderMovimientosTab(c, ctx = {}) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando movimientos...</div>`;
  try {
    const [result, warehouses, products] = await Promise.all([
      API.getInventoryMovements({ perPage: 100 }),
      ctx.warehouses ? Promise.resolve(ctx.warehouses) : API.getWarehouses(false),
      API.getProducts({ activeOnly: true }),
    ]);
    ctx.warehouses = warehouses;
    ctx.products   = products;
    const movs     = result.items || [];

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div class="flex flex-wrap gap-3">
          <input id="mov-q" class="form-input" style="min-width:200px" placeholder="Buscar número, tipo...">
          <select id="mov-type-f" class="form-input" style="max-width:180px">
            <option value="">Todos los tipos</option>
            ${INV_MOV_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
          </select>
          <select id="mov-status-f" class="form-input" style="max-width:160px">
            <option value="">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="applied">Aplicado</option>
            <option value="voided">Anulado</option>
          </select>
        </div>
        ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-mov"><i class="fas fa-plus"></i> Nuevo Movimiento</button>' : ''}
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="mov-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>Bodega origen</th>
                <th>Bodega destino</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="mov-tbody">
              ${movs.length ? renderMovRows(movs) : `<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-arrows-rotate mr-2"></i>No hay movimientos registrados.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;

    const applyMovFilter = () => {
      const q  = (getInputVal('mov-q') || '').toLowerCase();
      const tp = getSelectVal('mov-type-f');
      const st = getSelectVal('mov-status-f');
      $$('#mov-table tbody tr[data-movid]').forEach(tr => {
        tr.style.display = (
          (!q  || tr.textContent.toLowerCase().includes(q)) &&
          (!tp || tr.dataset.movtype === tp) &&
          (!st || tr.dataset.movstatus === st)
        ) ? '' : 'none';
      });
    };
    $('#mov-q')?.addEventListener('input', debounce(applyMovFilter, 150));
    $('#mov-type-f')?.addEventListener('change', applyMovFilter);
    $('#mov-status-f')?.addEventListener('change', applyMovFilter);
    $('#btn-new-mov')?.addEventListener('click', () => openMovForm(null, ctx, () => renderMovimientosTab(c, ctx)));
  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

function renderMovRows(movs) {
  return movs.map(m => {
    const tm    = INV_MOV_TYPES.find(t => t.value === m.mov_type);
    const meta  = INV_STATUS_META[m.status] || { label: m.status, badge: 'badge-gray' };
    const wh    = m.expand?.warehouse_id;
    const dest  = m.expand?.dest_warehouse_id;
    return `<tr data-movid="${esc(m.id)}" data-movtype="${esc(m.mov_type)}" data-movstatus="${esc(m.status)}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(m.number)}</span></td>
      <td><span style="color:${tm?.color || '#6B7280'}"><i class="fas ${tm?.icon || 'fa-box'} mr-1"></i>${esc(tm?.label || m.mov_type)}</span></td>
      <td>${esc(m.date)}</td>
      <td>${wh  ? esc(wh.name)   : '—'}</td>
      <td>${dest ? esc(dest.name) : '—'}</td>
      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewMovDetail('${esc(m.id)}')"><i class="fas fa-eye"></i></button>
          ${m.status === 'draft' && can('canWrite') ? `<button class="btn btn-primary btn-sm" title="Aplicar movimiento" onclick="applyMovement('${esc(m.id)}')"><i class="fas fa-check"></i></button>` : ''}
          ${m.status === 'applied' && can('canWrite') ? `<button class="btn btn-outline btn-sm" title="Anular" onclick="voidMovement('${esc(m.id)}', '${esc(m.number)}')"><i class="fas fa-ban"></i></button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Ver detalle de movimiento ─────────────────────────────────────────────────
async function viewMovDetail(id) {
  try {
    const [mov, lines] = await Promise.all([
      pb.get('inventory_movements', id, { expand: 'warehouse_id,dest_warehouse_id,third_party_id' }),
      API.getInventoryMovementLines(id),
    ]);
    const tm    = INV_MOV_TYPES.find(t => t.value === mov.mov_type);
    const meta  = INV_STATUS_META[mov.status] || { label: mov.status, badge: 'badge-gray' };
    const wh    = mov.expand?.warehouse_id;
    const dest  = mov.expand?.dest_warehouse_id;
    const tp    = mov.expand?.third_party_id;

    openModal(
      `Movimiento — ${esc(mov.number)}`,
      `<div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
        <div><span class="form-label">Número</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(mov.number)}</p></div>
        <div><span class="form-label">Tipo</span><p style="color:${tm?.color}">${esc(tm?.label || mov.mov_type)}</p></div>
        <div><span class="form-label">Fecha</span><p>${esc(mov.date)}</p></div>
        <div><span class="form-label">Bodega origen</span><p>${wh  ? esc(wh.name)   : '—'}</p></div>
        <div><span class="form-label">Bodega destino</span><p>${dest ? esc(dest.name) : '—'}</p></div>
        <div><span class="form-label">Estado</span><p><span class="badge ${meta.badge}">${meta.label}</span></p></div>
        ${tp ? `<div class="md:col-span-3"><span class="form-label">Tercero</span><p>${esc(tp.name)}</p></div>` : ''}
        ${mov.notes ? `<div class="md:col-span-3"><span class="form-label">Notas</span><p>${esc(mov.notes)}</p></div>` : ''}
      </div>
      <div class="border rounded-xl overflow-hidden" style="border-color:#F0F0F0">
        <table class="data-table">
          <thead><tr><th>Producto</th><th>Código</th><th class="text-right">Cantidad</th><th class="text-right">Costo unit.</th><th class="text-right">Total</th></tr></thead>
          <tbody>
            ${lines.map(l => {
              const p = l.expand?.product_id;
              return `<tr>
                <td>${p ? esc(p.name) : '—'}</td>
                <td class="font-mono text-xs">${p ? esc(p.code) : '—'}</td>
                <td class="text-right font-semibold">${fmtN(l.qty)}</td>
                <td class="text-right">${l.unit_cost ? fmt(l.unit_cost) : '—'}</td>
                <td class="text-right">${l.unit_cost ? fmt(l.qty * l.unit_cost) : '—'}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Aplicar movimiento ────────────────────────────────────────────────────────
async function applyMovement(id) {
  confirmDialog(
    'Aplicar movimiento',
    '¿Confirmas aplicar este movimiento? Se actualizará el stock de las bodegas y no se podrá deshacer salvo anulación.',
    async () => {
      try {
        await API.applyInventoryMovement(id);
        showToast('Movimiento aplicado. Stock actualizado.', 'success');
        renderInventario($('#page-content'));
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}

// ── Anular movimiento ─────────────────────────────────────────────────────────
function voidMovement(id, number) {
  confirmDialog(
    'Anular movimiento',
    `¿Confirmas anular el movimiento <strong>${esc(number)}</strong>? El stock será revertido.`,
    async () => {
      try {
        await API.voidInventoryMovement(id);
        showToast('Movimiento anulado. Stock revertido.', 'success');
        renderInventario($('#page-content'));
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}

// ── Formulario de nuevo movimiento ────────────────────────────────────────────
async function openMovForm(row = null, ctx = {}, onDone = null) {
  const warehouses = ctx.warehouses || await API.getWarehouses(true);
  const products   = ctx.products   || await API.getProducts({ activeOnly: true });

  // Estado reactivo de líneas
  const lines = [];
  let lineCounter = 0;

  function addLineToUI(line = {}) {
    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('mov-lines-body');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.id = `mov-line-${idx}`;
    tr.innerHTML = `
      <td>
        <select class="form-input" id="ml-prod-${idx}" style="min-width:180px">
          <option value="">— Producto —</option>
          ${products.filter(p => p.type === 'BIEN').map(p =>
            `<option value="${esc(p.id)}" data-cost="${p.cost_price || 0}">${esc(p.code)} — ${esc(p.name)}</option>`
          ).join('')}
        </select>
      </td>
      <td><input id="ml-qty-${idx}" type="number" min="0.0001" step="0.0001" class="form-input text-right" style="min-width:90px" placeholder="0" value="${line.qty ?? ''}"></td>
      <td><input id="ml-cost-${idx}" type="number" min="0" step="0.01" class="form-input text-right" style="min-width:100px" placeholder="0.00" value="${line.unit_cost ?? ''}"></td>
      <td><input id="ml-notes-${idx}" class="form-input" style="min-width:120px" placeholder="Nota" value="${esc(line.notes || '')}"></td>
      <td><button type="button" class="btn btn-danger btn-sm" onclick="document.getElementById('mov-line-${idx}').remove()"><i class="fas fa-times"></i></button></td>`;
    tbody.appendChild(tr);

    // Al seleccionar producto — pre-llenar costo
    document.getElementById(`ml-prod-${idx}`)?.addEventListener('change', function () {
      const opt = this.selectedOptions[0];
      const costFld = document.getElementById(`ml-cost-${idx}`);
      if (opt && opt.dataset.cost && costFld && !costFld.value) {
        costFld.value = opt.dataset.cost;
      }
    });
    if (line.product_id) {
      const sel = document.getElementById(`ml-prod-${idx}`);
      if (sel) sel.value = line.product_id;
    }
  }

  const needsDest = () => getSelectVal('mf-type') === 'TRASLADO';

  openModal(
    'Nuevo Movimiento de Inventario',
    `<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="form-group">
        <label class="form-label">Tipo <span style="color:#EF4444">*</span></label>
        <select id="mf-type" class="form-input">
          ${INV_MOV_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha <span style="color:#EF4444">*</span></label>
        <input id="mf-date" type="date" class="form-input" value="${todayStr()}">
      </div>
      <div class="form-group">
        <label class="form-label">Bodega origen <span style="color:#EF4444">*</span></label>
        <select id="mf-wh" class="form-input">
          <option value="">— Seleccionar —</option>
          ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" id="dest-wh-row" style="display:none">
        <label class="form-label">Bodega destino <span style="color:#EF4444">*</span></label>
        <select id="mf-dest-wh" class="form-input">
          <option value="">— Seleccionar —</option>
          ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Notas</label>
        <input id="mf-notes" class="form-input" placeholder="Observaciones del movimiento">
      </div>
    </div>

    <!-- Líneas -->
    <div class="border rounded-xl overflow-hidden mb-3" style="border-color:#E5E7EB">
      <div class="flex items-center justify-between px-4 py-2" style="background:#F9FAFB">
        <span class="text-sm font-semibold" style="color:#0D2137">Productos</span>
        <button type="button" class="btn btn-outline btn-sm" id="btn-add-line"><i class="fas fa-plus"></i> Agregar línea</button>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th class="text-right">Cantidad</th>
              <th class="text-right">Costo unit.</th>
              <th>Nota línea</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="mov-lines-body"></tbody>
        </table>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-mov"><i class="fas fa-floppy-disk"></i> Guardar borrador</button>`,
    true
  );

  // mostrar/ocultar bodega destino cuando tipo cambia
  document.getElementById('mf-type')?.addEventListener('change', () => {
    const row = document.getElementById('dest-wh-row');
    if (row) row.style.display = needsDest() ? '' : 'none';
  });

  document.getElementById('btn-add-line')?.addEventListener('click', () => addLineToUI());
  // Línea inicial
  addLineToUI();

  document.getElementById('btn-save-mov')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-mov');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }
    try {
      const movType  = getSelectVal('mf-type');
      const date     = getInputVal('mf-date');
      const whId     = getSelectVal('mf-wh');
      const destWhId = getSelectVal('mf-dest-wh');
      const notes    = getInputVal('mf-notes');

      if (!movType)  return showToast('Selecciona el tipo de movimiento', 'warning');
      if (!date)     return showToast('La fecha es obligatoria', 'warning');
      if (!whId)     return showToast('Selecciona la bodega origen', 'warning');
      if (movType === 'TRASLADO' && !destWhId) return showToast('Selecciona la bodega destino', 'warning');

      // Recopilar líneas del DOM
      const linesData = [];
      let lineIdx = 1;
      while (true) {
        const prodSel = document.getElementById(`ml-prod-${lineIdx}`);
        if (!prodSel) { lineIdx++; if (lineIdx > lineCounter + 5) break; continue; }
        const prodId = prodSel.value;
        const qty    = parseFloat(getInputVal(`ml-qty-${lineIdx}`)  || '0');
        const cost   = parseFloat(getInputVal(`ml-cost-${lineIdx}`) || '0');
        const lnote  = getInputVal(`ml-notes-${lineIdx}`) || '';
        if (prodId && qty > 0) {
          linesData.push({ product_id: prodId, qty, unit_cost: cost || null, notes: lnote, line_order: linesData.length + 1 });
        }
        lineIdx++;
        if (lineIdx > lineCounter + 2) break;
      }
      if (!linesData.length) return showToast('Agrega al menos una línea con producto y cantidad', 'warning');

      // Generar número correlativo
      const today = date.replaceAll('-', '');
      const rand  = String(Date.now()).slice(-4);
      const number = `INV-${today}-${rand}`;

      const movPayload = {
        number, mov_type: movType, date, warehouse_id: whId,
        dest_warehouse_id: destWhId || null,
        notes, status: 'draft',
      };
      const mov = await pb.create('inventory_movements', movPayload);

      for (const l of linesData) {
        await pb.create('inventory_movement_lines', { movement_id: mov.id, ...l });
      }

      await API.logAudit('CREATE', 'InventoryMovement', mov.id, `${movType} — ${number}`);
      showToast('Movimiento guardado como borrador. Aplícalo cuando estés listo.', 'success');
      closeModal();
      if (onDone) onDone();
    } catch (err) {
      showToast(err.message || 'No se pudo guardar', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar borrador'; }
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: BODEGAS
// ══════════════════════════════════════════════════════════════════════════════
async function renderBodegasTab(c, ctx = {}) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando bodegas...</div>`;
  try {
    const warehouses = await API.getWarehouses(false);
    ctx.warehouses   = warehouses;

    c.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm" style="color:#6B7280">${warehouses.length} bodega(s) registrada(s).</p>
        ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-wh"><i class="fas fa-plus"></i> Nueva Bodega</button>' : ''}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="wh-cards">
        ${warehouses.length ? warehouses.map(w => whCard(w)).join('') : `<div class="md:col-span-3 text-center py-10" style="color:#9CA3AF"><i class="fas fa-warehouse mr-2"></i>No hay bodegas. Crea la primera.</div>`}
      </div>`;

    $('#btn-new-wh')?.addEventListener('click', () => openWarehouseForm(null, () => renderBodegasTab(c, ctx)));
    $$('.btn-edit-wh').forEach(btn => btn.addEventListener('click', () => {
      const wh = warehouses.find(w => w.id === btn.dataset.id);
      if (wh) openWarehouseForm(wh, () => renderBodegasTab(c, ctx));
    }));
    $$('.btn-toggle-wh').forEach(btn => btn.addEventListener('click', async () => {
      try {
        const wh = warehouses.find(w => w.id === btn.dataset.id);
        await pb.update('warehouses', wh.id, { active: !wh.active });
        await API.logAudit('STATUS', 'Bodega', wh.id, `${wh.name} → ${!wh.active ? 'Activa' : 'Inactiva'}`);
        showToast(`Bodega ${!wh.active ? 'activada' : 'desactivada'}`, 'success');
        renderBodegasTab(c, ctx);
      } catch (err) { showToast(err.message, 'error'); }
    }));
  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

function whCard(w) {
  return `<div class="bg-white rounded-2xl border p-4" style="border-color:#F0F0F0">
    <div class="flex items-start justify-between mb-2">
      <div>
        <p class="font-mono text-xs font-semibold mb-1" style="color:#1A4B8C">${esc(w.code)}</p>
        <h4 class="font-bold text-sm" style="color:#0D2137">${esc(w.name)}</h4>
      </div>
      ${w.active ? '<span class="badge badge-green">Activa</span>' : '<span class="badge badge-gray">Inactiva</span>'}
    </div>
    ${w.address ? `<p class="text-xs mb-2" style="color:#6B7280"><i class="fas fa-location-dot mr-1"></i>${esc(w.address)}</p>` : ''}
    ${w.notes   ? `<p class="text-xs mb-2" style="color:#9CA3AF">${esc(w.notes)}</p>` : ''}
    ${can('canWrite') ? `<div class="flex gap-2 mt-3">
      <button class="btn btn-outline btn-sm flex-1 btn-edit-wh" data-id="${esc(w.id)}"><i class="fas fa-pen"></i> Editar</button>
      <button class="btn btn-outline btn-sm btn-toggle-wh" data-id="${esc(w.id)}" title="${w.active ? 'Desactivar' : 'Activar'}">
        <i class="fas ${w.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i></button>
    </div>` : ''}
  </div>`;
}

function openWarehouseForm(row = null, onDone = null) {
  openModal(
    row ? `Editar bodega — ${esc(row.code)}` : 'Nueva Bodega',
    `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span style="color:#EF4444">*</span></label>
        <input id="wf-code" class="form-input font-mono" value="${esc(row?.code || '')}" placeholder="BG-01" oninput="this.value=this.value.toUpperCase()" style="text-transform:uppercase">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span style="color:#EF4444">*</span></label>
        <input id="wf-name" class="form-input" value="${esc(row?.name || '')}" placeholder="Bodega principal">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Dirección</label>
        <input id="wf-address" class="form-input" value="${esc(row?.address || '')}" placeholder="Cra. 1 #23-45, Bogotá">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Notas</label>
        <textarea id="wf-notes" class="form-input" rows="2" placeholder="Descripción u observaciones">${esc(row?.notes || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Activa</label>
        <select id="wf-active" class="form-input">
          <option value="true"  ${(row?.active !== false) ? 'selected' : ''}>Sí</option>
          <option value="false" ${row?.active === false    ? 'selected' : ''}>No</option>
        </select>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-wh"><i class="fas fa-floppy-disk"></i> Guardar</button>`,
    false
  );

  document.getElementById('btn-save-wh')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-wh');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }
    try {
      const code = getInputVal('wf-code').trim().toUpperCase();
      const name = getInputVal('wf-name').trim();
      if (!code) return showToast('El código es obligatorio', 'warning');
      if (!name) return showToast('El nombre es obligatorio', 'warning');

      if (!row?.id) {
        const dup = await pb.list('warehouses', { filter: `code="${pb.escapeFilterValue(code)}"`, perPage: 1 });
        if (dup.items.length) return showToast(`Ya existe una bodega con el código ${code}`, 'warning');
      }

      const payload = {
        code, name,
        address: getInputVal('wf-address').trim(),
        notes:   getInputVal('wf-notes').trim(),
        active:  getSelectVal('wf-active') === 'true',
      };

      if (row?.id) {
        await pb.update('warehouses', row.id, payload);
        await API.logAudit('UPDATE', 'Bodega', row.id, `${code} — ${name}`);
      } else {
        const cr = await pb.create('warehouses', payload);
        await API.logAudit('CREATE', 'Bodega', cr.id, `${code} — ${name}`);
      }

      showToast('Bodega guardada', 'success');
      closeModal();
      if (onDone) onDone();
    } catch (err) {
      showToast(err.message || 'No se pudo guardar', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar'; }
    }
  });
}

// ── KPI helper ────────────────────────────────────────────────────────────────
function invKpi(label, value, icon, color, bg) {
  return `<div class="rounded-2xl p-4" style="background:${bg}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${icon} text-sm" style="color:${color}"></i>
      <span class="text-xs font-semibold" style="color:${color}">${label}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${color}">${value}</p>
  </div>`;
}

// ── TAB: KARDEX CARD ──────────────────────────────────────────────────────────
async function renderKardexTab(c, ctx = {}) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando filtros...</div>`;
  try {
    const [products, warehouses] = await Promise.all([
      API.getProducts({ activeOnly: false }),
      ctx.warehouses ? Promise.resolve(ctx.warehouses) : API.getWarehouses(false)
    ]);
    
    const goods = products.filter((p: any) => p.type === 'BIEN');

    c.innerHTML = `
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <h4 class="text-sm font-bold mb-3" style="color:#0D2137"><i class="fas fa-filter mr-2" style="color:#1A4B8C"></i>Consultar Kardex de Referencia</h4>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div class="form-group md:col-span-2">
            <label class="form-label font-bold text-xs">Producto / Referencia <span style="color:#EF4444">*</span></label>
            <select id="kd-prod" class="form-input w-full text-xs">
              <option value="">— Seleccione Producto —</option>
              ${goods.map((p: any) => `<option value="${esc(p.id)}">${esc(p.code)} — ${esc(p.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label font-bold text-xs">Bodega <span style="color:#EF4444">*</span></label>
            <select id="kd-wh" class="form-input w-full text-xs">
              <option value="">— Seleccione Bodega —</option>
              ${warehouses.map((w: any) => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label font-bold text-xs">Desde</label>
            <input id="kd-date-start" type="date" class="form-input w-full text-xs">
          </div>
          <div class="form-group">
            <label class="form-label font-bold text-xs">Hasta</label>
            <input id="kd-date-end" type="date" class="form-input w-full text-xs">
          </div>
          <div class="flex gap-2 md:col-span-5 justify-end mt-2">
            <button class="btn btn-outline py-2 text-xs" id="kd-btn-clear" title="Limpiar Filtros"><i class="fas fa-eraser mr-1"></i>Limpiar</button>
            <button class="btn btn-primary py-2 text-xs px-6" id="kd-btn-search"><i class="fas fa-magnifying-glass mr-1"></i>Consultar</button>
            <button class="btn btn-outline py-2" id="kd-btn-excel" disabled title="Exportar a Excel"><i class="fas fa-file-excel text-[#059669]"></i></button>
          </div>
        </div>
      </div>

      <div id="kardex-results-container">
        <div class="p-8 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0; color:#9CA3AF">
          <i class="fas fa-table mr-2" style="font-size:24px"></i>
          <p class="mt-2 text-sm">Selecciona un producto y una bodega para consultar los movimientos del Kardex.</p>
        </div>
      </div>
    `;

    let currentKardexData: any[] = [];
    let currentProductName = "";
    let currentWarehouseName = "";

    const searchKardex = async () => {
      const prodId = getSelectVal('kd-prod');
      const whId = getSelectVal('kd-wh');
      const startDate = getInputVal('kd-date-start');
      const endDate = getInputVal('kd-date-end');

      if (!prodId) return showToast('Selecciona un producto.', 'warning');
      if (!whId) return showToast('Selecciona una bodega.', 'warning');

      const searchBtn = document.getElementById('kd-btn-search') as HTMLButtonElement;
      const excelBtn = document.getElementById('kd-btn-excel') as HTMLButtonElement;
      const resultsContainer = document.getElementById('kardex-results-container');
      
      if (searchBtn) { searchBtn.disabled = true; searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Consultando...'; }
      if (excelBtn) excelBtn.disabled = true;
      if (resultsContainer) resultsContainer.innerHTML = `<div class="p-8 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0; color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando movimientos...</div>`;

      try {
        const prod = goods.find((p: any) => p.id === prodId);
        const wh = warehouses.find((w: any) => w.id === whId);
        currentProductName = prod ? `${prod.code} - ${prod.name}` : 'Producto';
        currentWarehouseName = wh ? wh.name : 'Bodega';

        let runningQty = 0;
        let runningAvgCost = 0;

        // 1. Calculate historical opening balance (Saldo Inicial) if startDate is set
        if (startDate) {
          const historicalLines = await (window as any).pb.listAll('inventory_movement_lines', {
            filter: `product_id="${(window as any).pb.escapeFilterValue(prodId)}" && movement_id.status="applied" && movement_id.date < "${startDate}"`,
            expand: 'movement_id,movement_id.warehouse_id,movement_id.dest_warehouse_id'
          });

          const filteredHist = historicalLines.filter((line: any) => {
            const mov = line.expand?.movement_id;
            if (!mov) return false;
            if (mov.mov_type === 'TRASLADO') {
              return mov.warehouse_id === whId || mov.dest_warehouse_id === whId;
            }
            return mov.warehouse_id === whId;
          });

          filteredHist.sort((a: any, b: any) => {
            const movA = a.expand?.movement_id;
            const movB = b.expand?.movement_id;
            const dateA = movA?.date || '';
            const dateB = movB?.date || '';
            if (dateA !== dateB) return dateA.localeCompare(dateB);

            const timeA = movA?.created || '';
            const timeB = movB?.created || '';
            if (timeA !== timeB) return timeA.localeCompare(timeB);

            return (a.line_order || 0) - (b.line_order || 0);
          });

          for (const line of filteredHist) {
            const mov = line.expand?.movement_id;
            let isInput = false;
            let isOutput = false;

            if (mov.mov_type === 'TRASLADO') {
              if (mov.dest_warehouse_id === whId) isInput = true;
              else if (mov.warehouse_id === whId) isOutput = true;
            } else {
              isInput = mov.mov_type === 'ENTRADA' || mov.mov_type === 'AJUSTE_POSITIVO';
              isOutput = mov.mov_type === 'SALIDA' || mov.mov_type === 'AJUSTE_NEGATIVO';
            }

            const qty = line.qty || 0;
            const cost = line.unit_cost || 0;

            if (isInput) {
              const prevQty = runningQty;
              const prevCost = runningAvgCost;
              runningQty += qty;
              if (runningQty > 0) {
                runningAvgCost = ((prevQty * prevCost) + (qty * cost)) / runningQty;
              } else {
                runningAvgCost = cost;
              }
              runningAvgCost = Math.round(runningAvgCost * 100) / 100;
            } else if (isOutput) {
              runningQty -= qty;
            }
          }
        }

        // 2. Fetch movements within date range
        let rangeFilter = `product_id="${(window as any).pb.escapeFilterValue(prodId)}" && movement_id.status="applied"`;
        if (startDate) rangeFilter += ` && movement_id.date >= "${startDate}"`;
        if (endDate) rangeFilter += ` && movement_id.date <= "${endDate}"`;

        const lines = await (window as any).pb.listAll('inventory_movement_lines', {
          filter: rangeFilter,
          expand: 'movement_id,movement_id.warehouse_id,movement_id.dest_warehouse_id,movement_id.third_party_id'
        });

        const filteredLines = lines.filter((line: any) => {
          const mov = line.expand?.movement_id;
          if (!mov) return false;
          if (mov.mov_type === 'TRASLADO') {
            return mov.warehouse_id === whId || mov.dest_warehouse_id === whId;
          }
          return mov.warehouse_id === whId;
        });

        filteredLines.sort((a: any, b: any) => {
          const movA = a.expand?.movement_id;
          const movB = b.expand?.movement_id;
          const dateA = movA?.date || '';
          const dateB = movB?.date || '';
          if (dateA !== dateB) return dateA.localeCompare(dateB);

          const timeA = movA?.created || '';
          const timeB = movB?.created || '';
          if (timeA !== timeB) return timeA.localeCompare(timeB);

          return (a.line_order || 0) - (b.line_order || 0);
        });

        // 3. Map movements and prepends opening balance
        currentKardexData = [];
        if (startDate) {
          currentKardexData.push({
            date: startDate,
            docNumber: 'SALDO INICIAL',
            movType: '—',
            notes: `Saldo acumulado antes del ${startDate}`,
            partner: '—',
            qtyIn: 0,
            costIn: 0,
            totalIn: 0,
            qtyOut: 0,
            costOut: 0,
            totalOut: 0,
            qtyBal: runningQty,
            costBal: runningAvgCost,
            totalBal: runningQty * runningAvgCost,
            isInitial: true
          });
        }

        const mappedLines = filteredLines.map((line: any) => {
          const mov = line.expand?.movement_id;
          const partner = mov.expand?.third_party_id?.name || '—';
          
          let isInput = false;
          let isOutput = false;

          if (mov.mov_type === 'TRASLADO') {
            if (mov.dest_warehouse_id === whId) isInput = true;
            else if (mov.warehouse_id === whId) isOutput = true;
          } else {
            isInput = mov.mov_type === 'ENTRADA' || mov.mov_type === 'AJUSTE_POSITIVO';
            isOutput = mov.mov_type === 'SALIDA' || mov.mov_type === 'AJUSTE_NEGATIVO';
          }

          const qty = line.qty || 0;
          const cost = line.unit_cost || 0;

          let qtyIn = 0;
          let costIn = 0;
          let totalIn = 0;
          let qtyOut = 0;
          let costOut = 0;
          let totalOut = 0;

          if (isInput) {
            qtyIn = qty;
            costIn = cost;
            totalIn = qty * cost;

            const prevQty = runningQty;
            const prevCost = runningAvgCost;
            runningQty += qty;
            if (runningQty > 0) {
              runningAvgCost = ((prevQty * prevCost) + (qty * cost)) / runningQty;
            } else {
              runningAvgCost = cost;
            }
            runningAvgCost = Math.round(runningAvgCost * 100) / 100;
          } else if (isOutput) {
            qtyOut = qty;
            costOut = runningAvgCost;
            totalOut = qty * costOut;

            runningQty -= qty;
          }

          const runningTotal = runningQty * runningAvgCost;

          return {
            date: mov.date,
            docNumber: mov.number,
            movType: mov.mov_type,
            notes: line.notes || mov.notes || '',
            partner,
            qtyIn,
            costIn,
            totalIn,
            qtyOut,
            costOut,
            totalOut,
            qtyBal: runningQty,
            costBal: runningAvgCost,
            totalBal: runningTotal
          };
        });

        currentKardexData.push(...mappedLines);

        if (resultsContainer) {
          if (currentKardexData.length === 0 || (currentKardexData.length === 1 && currentKardexData[0].isInitial && currentKardexData[0].qtyBal === 0)) {
            resultsContainer.innerHTML = `
              <div class="p-8 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0; color:#9CA3AF">
                <i class="fas fa-circle-exclamation mr-2" style="font-size:24px; color:#C46516"></i>
                <p class="mt-2 text-sm">No se encontraron movimientos registrados para este producto en la bodega y rango de fechas seleccionados.</p>
              </div>
            `;
          } else {
            resultsContainer.innerHTML = `
              <div class="bg-white rounded-2xl border overflow-hidden shadow-sm" style="border-color:#F0F0F0">
                <div class="overflow-x-auto">
                  <table class="data-table text-xs w-full" id="kardex-table" style="min-width:1100px">
                    <thead>
                      <tr class="bg-gray-50 border-b font-bold" style="border-color:#E5E7EB">
                        <th colspan="5" class="border-r py-2.5 text-center text-gray-700" style="border-color:#E5E7EB">Datos del Documento</th>
                        <th colspan="3" class="border-r text-center bg-green-50/50" style="border-color:#E5E7EB; color:#047857">Entradas</th>
                        <th colspan="3" class="border-r text-center bg-red-50/50" style="border-color:#E5E7EB; color:#B91C1C">Salidas</th>
                        <th colspan="3" class="text-center bg-blue-50/50" style="color:#1D4ED8">Saldos</th>
                      </tr>
                      <tr class="bg-gray-100/50 font-bold border-b text-gray-600" style="border-color:#E5E7EB">
                        <th class="py-2">Fecha</th>
                        <th>Documento</th>
                        <th>Tipo</th>
                        <th>Tercero</th>
                        <th class="border-r" style="border-color:#E5E7EB">Detalle / Notas</th>
                        
                        <th class="text-right bg-green-50/20" style="color:#047857">Cant.</th>
                        <th class="text-right bg-green-50/20" style="color:#047857">Costo U.</th>
                        <th class="text-right border-r bg-green-50/20" style="border-color:#E5E7EB; color:#047857">Total</th>
                        
                        <th class="text-right bg-red-50/20" style="color:#B91C1C">Cant.</th>
                        <th class="text-right bg-red-50/20" style="color:#B91C1C">Costo U.</th>
                        <th class="text-right border-r bg-red-50/20" style="border-color:#E5E7EB; color:#B91C1C">Total</th>
                        
                        <th class="text-right bg-blue-50/20" style="color:#1D4ED8">Cant.</th>
                        <th class="text-right bg-blue-50/20" style="color:#1D4ED8">Costo Prom.</th>
                        <th class="text-right bg-blue-50/20" style="color:#1D4ED8">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${currentKardexData.map(row => `
                        <tr class="hover:bg-gray-50 border-b ${row.isInitial ? 'bg-blue-50/20 font-semibold' : ''}" style="border-color:#F3F4F6">
                          <td class="py-2">${esc(row.date)}</td>
                          <td class="font-mono font-semibold" style="color:#1A4B8C">${esc(row.docNumber)}</td>
                          <td><span class="text-[10px] font-bold uppercase">${esc(row.movType)}</span></td>
                          <td>${esc(row.partner)}</td>
                          <td class="border-r text-gray-500 max-w-xs truncate" style="border-color:#E5E7EB" title="${esc(row.notes)}">${esc(row.notes)}</td>
                          
                          <td class="text-right font-semibold text-green-700 bg-green-50/30">${row.isInitial ? '—' : (row.qtyIn ? fmtN(row.qtyIn) : '—')}</td>
                          <td class="text-right text-green-700 bg-green-50/30">${row.isInitial ? '—' : (row.qtyIn ? fmt(row.costIn) : '—')}</td>
                          <td class="text-right border-r font-semibold text-green-700 bg-green-50/30" style="border-color:#E5E7EB">${row.isInitial ? '—' : (row.qtyIn ? fmt(row.totalIn) : '—')}</td>
                          
                          <td class="text-right font-semibold text-red-700 bg-red-50/30">${row.isInitial ? '—' : (row.qtyOut ? fmtN(row.qtyOut) : '—')}</td>
                          <td class="text-right text-red-700 bg-red-50/30">${row.isInitial ? '—' : (row.qtyOut ? fmt(row.costOut) : '—')}</td>
                          <td class="text-right border-r font-semibold text-red-700 bg-red-50/30" style="border-color:#E5E7EB">${row.isInitial ? '—' : (row.qtyOut ? fmt(row.totalOut) : '—')}</td>
                          
                          <td class="text-right font-bold text-blue-800 bg-blue-50/30">${fmtN(row.qtyBal)}</td>
                          <td class="text-right text-blue-800 bg-blue-50/30">${fmt(row.costBal)}</td>
                          <td class="text-right font-bold text-blue-800 bg-blue-50/30">${fmt(row.totalBal)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
            if (excelBtn) excelBtn.disabled = false;
          }
        }
      } catch (err: any) {
        showToast(err.message, 'error');
        if (resultsContainer) resultsContainer.innerHTML = `<div class="p-8 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0; color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>Error: ${esc(err.message)}</div>`;
      } finally {
        if (searchBtn) { searchBtn.disabled = false; searchBtn.innerHTML = '<i class="fas fa-magnifying-glass mr-1"></i>Consultar'; }
      }
    };

    const clearFilters = () => {
      const prodSel = document.getElementById('kd-prod') as HTMLSelectElement;
      const whSel = document.getElementById('kd-wh') as HTMLSelectElement;
      const startFld = document.getElementById('kd-date-start') as HTMLInputElement;
      const endFld = document.getElementById('kd-date-end') as HTMLInputElement;
      
      if (prodSel) prodSel.value = '';
      if (whSel) whSel.value = '';
      if (startFld) startFld.value = '';
      if (endFld) endFld.value = '';
      
      currentKardexData = [];
      const resultsContainer = document.getElementById('kardex-results-container');
      if (resultsContainer) {
        resultsContainer.innerHTML = `
          <div class="p-8 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0; color:#9CA3AF">
            <i class="fas fa-table mr-2" style="font-size:24px"></i>
            <p class="mt-2 text-sm">Selecciona un producto y una bodega para consultar los movimientos del Kardex.</p>
          </div>
        `;
      }
      const excelBtn = document.getElementById('kd-btn-excel') as HTMLButtonElement;
      if (excelBtn) excelBtn.disabled = true;
    };

    const exportKardexExcel = () => {
      if (!currentKardexData.length) return;
      const dataToExport = currentKardexData.map(row => ({
        'Fecha': row.date,
        'Documento': row.docNumber,
        'Tipo': row.movType,
        'Tercero': row.partner,
        'Notas': row.notes,
        'Entradas Cant.': row.isInitial ? '—' : (row.qtyIn || 0),
        'Entradas Costo Unit.': row.isInitial ? '—' : (row.costIn || 0),
        'Entradas Costo Total': row.isInitial ? '—' : (row.totalIn || 0),
        'Salidas Cant.': row.isInitial ? '—' : (row.qtyOut || 0),
        'Salidas Costo Unit.': row.isInitial ? '—' : (row.costOut || 0),
        'Salidas Costo Total': row.isInitial ? '—' : (row.totalOut || 0),
        'Saldo Cant.': row.qtyBal,
        'Saldo Costo Prom.': row.costBal,
        'Saldo Costo Total': row.totalBal
      }));

      const headers = [
        { key: 'Fecha', label: 'Fecha' },
        { key: 'Documento', label: 'Documento' },
        { key: 'Tipo', label: 'Tipo Movimiento' },
        { key: 'Tercero', label: 'Tercero / Cliente / Prov' },
        { key: 'Notas', label: 'Notas' },
        { key: 'Entradas Cant.', label: 'Entradas Cant.' },
        { key: 'Entradas Costo Unit.', label: 'Entradas Costo Unit.' },
        { key: 'Entradas Costo Total', label: 'Entradas Costo Total' },
        { key: 'Salidas Cant.', label: 'Salidas Cant.' },
        { key: 'Salidas Costo Unit.', label: 'Salidas Costo Unit.' },
        { key: 'Salidas Costo Total', label: 'Salidas Costo Total' },
        { key: 'Saldo Cant.', label: 'Saldo Cant. Saldo' },
        { key: 'Saldo Costo Prom.', label: 'Saldo Costo Prom.' },
        { key: 'Saldo Costo Total', label: 'Saldo Costo Total' }
      ];

      const cleanProdName = currentProductName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Kardex_${cleanProdName}_${currentWarehouseName.replace(/\s+/g, '_')}`;
      (window as any).exportToExcel(dataToExport, headers, filename);
      showToast('Kardex exportado a Excel.', 'success');
    };

    $('#kd-btn-search')?.addEventListener('click', searchKardex);
    $('#kd-btn-clear')?.addEventListener('click', clearFilters);
    $('#kd-btn-excel')?.addEventListener('click', exportKardexExcel);
  } catch (err: any) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderStockTab = renderStockTab;
(window as any).filterStockTable = filterStockTable;
(window as any).openWarehouseForm = openWarehouseForm;
(window as any).renderBodegasTab = renderBodegasTab;
(window as any).renderMovimientosTab = renderMovimientosTab;
(window as any).applyMovement = applyMovement;
(window as any).renderStockRows = renderStockRows;
(window as any).voidMovement = voidMovement;
(window as any).whCard = whCard;
(window as any).invKpi = invKpi;
(window as any).INV_STATUS_META = INV_STATUS_META;
(window as any).openMovForm = openMovForm;
(window as any).renderInventario = renderInventario;
(window as any).renderMovRows = renderMovRows;
(window as any).viewMovDetail = viewMovDetail;
(window as any)._renderInvPage = _renderInvPage;
(window as any).INV_MOV_TYPES = INV_MOV_TYPES;
(window as any).renderKardexTab = renderKardexTab;

// ── Nuevas funciones de reportes contables e inventario físico ──

async function renderReportesTab(c: HTMLElement, ctx: any = {}) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos de reportes...</div>`;
  try {
    const [products, warehouses] = await Promise.all([
      API.getProducts({ activeOnly: false }),
      ctx.warehouses ? Promise.resolve(ctx.warehouses) : API.getWarehouses(false)
    ]);
    ctx.products = products;
    ctx.warehouses = warehouses;

    // Obtener categorías y líneas únicas
    const categorias = [...new Set(products.map((p: any) => p.categoria).filter(Boolean))].sort() as string[];
    const lineas     = [...new Set(products.map((p: any) => p.linea).filter(Boolean))].sort() as string[];

    c.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Tarjeta 1: Reporte General de Inventarios -->
        <div class="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200" style="border-color:#E5E7EB">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
              <i class="fas fa-clipboard-list text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-gray-800">Reporte General de Inventarios</h4>
              <p class="text-xs text-gray-400">Toda la información consolidada de los productos</p>
            </div>
          </div>
          <div class="space-y-3 mb-4">
            <div>
              <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Costo a Reportar</label>
              <select id="rep-gen-cost" class="form-input text-xs w-full">
                <option value="promedio">Costo Promedio Actual (Kardex)</option>
                <option value="ultimo">Último Costo del Producto</option>
              </select>
            </div>
            <div>
              <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bodega (Opcional)</label>
              <select id="rep-gen-wh" class="form-input text-xs w-full">
                <option value="">Todas las bodegas (Consolidado)</option>
                ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Categoría (Opcional)</label>
              <select id="rep-gen-cat" class="form-input text-xs w-full">
                <option value="">Todas las categorías</option>
                ${categorias.map(cat => `<option value="${esc(cat)}">${esc(cat)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Línea (Opcional)</label>
              <select id="rep-gen-line" class="form-input text-xs w-full">
                <option value="">Todas las líneas</option>
                ${lineas.map(lin => `<option value="${esc(lin)}">${esc(lin)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <button class="btn btn-outline py-2 text-xs" onclick="window._printReport('general')"><i class="fas fa-print mr-1"></i>Imprimir</button>
            <button class="btn btn-primary py-2 text-xs" onclick="window._exportReport('general')"><i class="fas fa-file-excel mr-1"></i>Exportar</button>
          </div>
        </div>

        <!-- Tarjeta 2: Existencias por Bodega (Comparativo) -->
        <div class="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200" style="border-color:#E5E7EB">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
              <i class="fas fa-columns text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-gray-800">Comparativo de Existencias</h4>
              <p class="text-xs text-gray-400">Existencias cruzadas por producto entre bodegas</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-6">Genera una matriz comparativa cruzada con las existencias de todos los productos en cada una de las bodegas creadas.</p>
          <div class="flex gap-2 justify-end">
            <button class="btn btn-outline py-2 text-xs" onclick="window._printReport('comparativo')"><i class="fas fa-print mr-1"></i>Imprimir</button>
            <button class="btn btn-primary py-2 text-xs" onclick="window._exportReport('comparativo')"><i class="fas fa-file-excel mr-1"></i>Exportar</button>
          </div>
        </div>

        <!-- Tarjeta 3: Listado para Conteo Físico -->
        <div class="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200" style="border-color:#E5E7EB">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600">
              <i class="fas fa-list-check text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-gray-800">Listado para Conteo Físico</h4>
              <p class="text-xs text-gray-400">Planilla para inventario físico en campo</p>
            </div>
          </div>
          <div class="space-y-3 mb-4">
            <div>
              <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bodega <span class="text-red-500">*</span></label>
              <select id="rep-conteo-wh" class="form-input text-xs w-full">
                ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
              </select>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" id="rep-conteo-show-stock" class="w-4 h-4 text-blue-600 rounded">
              <label for="rep-conteo-show-stock" class="text-xs text-gray-600">Mostrar stock del sistema (no ciego)</label>
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <button class="btn btn-outline py-2 text-xs" onclick="window._printReport('conteo')"><i class="fas fa-print mr-1"></i>Imprimir</button>
            <button class="btn btn-primary py-2 text-xs" onclick="window._exportReport('conteo')"><i class="fas fa-file-excel mr-1"></i>Exportar</button>
          </div>
        </div>

        <!-- Tarjeta 4: Lista de Precios -->
        <div class="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200" style="border-color:#E5E7EB">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600">
              <i class="fas fa-tags text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-gray-800">Lista de Precios</h4>
              <p class="text-xs text-gray-400">Consulta y exportación de precios vigentes</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-6">Muestra la lista de precios de venta (Precio Base, Precio Venta 2, Precio Venta 3) de todos los productos y servicios.</p>
          <div class="flex gap-2 justify-end">
            <button class="btn btn-outline py-2 text-xs" onclick="window._printReport('precios')"><i class="fas fa-print mr-1"></i>Imprimir</button>
            <button class="btn btn-primary py-2 text-xs" onclick="window._exportReport('precios')"><i class="fas fa-file-excel mr-1"></i>Exportar</button>
          </div>
        </div>
      </div>
      
      <!-- BOTÓN DE TOMA FÍSICA -->
      <div class="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-inner flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex gap-3">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-600 text-white flex-shrink-0">
            <i class="fas fa-boxes-packing text-xl"></i>
          </div>
          <div>
            <h4 class="font-bold text-blue-900">Toma de Inventario Físico (Ajuste Contable)</h4>
            <p class="text-xs text-blue-700 mt-1">Cierra el inventario previo de las referencias contadas en la bodega elegida y genera un ajuste contable automático balanceado.</p>
          </div>
        </div>
        <button class="btn btn-primary px-6 py-2.5 flex items-center gap-2 shadow" onclick="window._openTomaFisicaModal()">
          <i class="fas fa-boxes-packing"></i> Iniciar Toma Física
        </button>
      </div>

      <!-- BOTÓN DE REVALORIZACIÓN DE COSTOS -->
      <div class="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-5 shadow-inner flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex gap-3">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-600 text-white flex-shrink-0">
            <i class="fas fa-calculator text-xl"></i>
          </div>
          <div>
            <h4 class="font-bold text-purple-900">Recálculo y Revalorización de Costos</h4>
            <p class="text-xs text-purple-700 mt-1">Recalcula el costo promedio ponderado de los productos y genera ajustes contables retroactivos para corregir desfases de costo en el período.</p>
          </div>
        </div>
        <button class="btn btn-primary bg-purple-600 hover:bg-purple-700 border-none px-6 py-2.5 flex items-center gap-2 shadow text-white" onclick="window._openRevalorizacionModal()">
          <i class="fas fa-calculator"></i> Iniciar Recálculo
        </button>
      </div>
    `;
  } catch (err: any) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

async function _updateTomaFisicaSystemStock(whId: string) {
  const tableBody = document.getElementById('toma-products-body');
  if (!tableBody) return;
  if (!whId) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-gray-400"><i class="fas fa-warehouse text-2xl mb-2"></i><p>Selecciona una bodega para listar las existencias.</p></td></tr>`;
    return;
  }
  tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando existencias...</td></tr>`;
  try {
    const stock = await API.getInventoryStock({ warehouseId: whId });
    const stockByProd = new Map(stock.map((s: any) => [s.product_id, s]));
    const products = (window as any)._tomaProducts || [];
    if (!products.length) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-gray-400">No hay productos tipo BIEN registrados.</td></tr>`;
      return;
    }
    
    tableBody.innerHTML = products.map((p: any) => {
      const st = stockByProd.get(p.id) || { qty_on_hand: 0, avg_cost: Number(p.cost_price || 0) };
      const systemStock = Number(st.qty_on_hand || 0);
      return `
        <tr class="toma-prod-row hover:bg-gray-50 border-b border-gray-100" data-code="${esc(p.code)}" data-name="${esc(p.name)}">
          <td class="p-2 font-mono text-xs text-blue-800 font-semibold">${esc(p.code)}</td>
          <td class="p-2 text-sm">${esc(p.name)}</td>
          <td class="p-2 text-xs text-gray-500">${esc(p.unit || '—')}</td>
          <td class="p-2 text-right font-semibold text-gray-700" id="toma-sys-${p.id}">${fmtN(systemStock)}</td>
          <td class="p-2 text-right">
            <input type="number" min="0" step="0.0001" 
              class="form-input text-right w-24 py-1 text-xs toma-phys-input" 
              id="toma-phys-${p.id}" 
              data-prodid="${p.id}" 
              data-sys="${systemStock}" 
              data-avgcost="${st.avg_cost || p.cost_price || 0}" 
              data-lastcost="${p.cost_price || 0}"
              placeholder="Sin contar">
          </td>
        </tr>
      `;
    }).join('');
  } catch (err: any) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-red-500">Error: ${esc(err.message)}</td></tr>`;
  }
}

async function _openTomaFisicaModal() {
  const pb = _pb();
  const [products, warehouses, accounts] = await Promise.all([
    API.getProducts({ activeOnly: true }),
    API.getWarehouses(true),
    API.getAccounts(false)
  ]);
  
  const bienProducts = products.filter((p: any) => p.type === 'BIEN');
  (window as any)._tomaProducts = bienProducts;

  const detailAccounts = accounts
    .filter((a: any) => a.level >= 3 && a.active)
    .sort((a: any, b: any) => (a.code || '').localeCompare(b.code || ''));

  const bodyHtml = `
    <div class="space-y-4" style="font-family:'Segoe UI',sans-serif">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="form-group">
          <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bodega a Ajustar <span class="text-red-500">*</span></label>
          <select id="toma-wh" class="form-input text-xs w-full" onchange="window._updateTomaFisicaSystemStock(this.value)">
            <option value="">— Seleccionar —</option>
            ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha de Ajuste <span class="text-red-500">*</span></label>
          <input id="toma-date" type="date" class="form-input text-xs w-full" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Costo a Utilizar <span class="text-red-500">*</span></label>
          <select id="toma-cost-type" class="form-input text-xs w-full">
            <option value="promedio">Costo Promedio Actual</option>
            <option value="ultimo">Último Costo del Producto</option>
          </select>
        </div>
        <div class="form-group">
          <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cuenta Contrapartida <span class="text-red-500">*</span></label>
          <select id="toma-acc" class="form-input text-xs w-full">
            <option value="">— Seleccionar Cuenta —</option>
            ${detailAccounts.map(a => `<option value="${esc(a.id)}">${esc(a.code)} — ${esc(a.name)}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Buscador -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-search text-xs"></i></div>
        <input id="toma-search" class="form-input pl-8 py-1.5 text-xs w-full" placeholder="Filtrar por código o nombre..." oninput="window._filterTomaFisicaTable(this.value)">
      </div>

      <!-- Tabla de Productos -->
      <div class="border border-gray-200 rounded-xl overflow-hidden shadow-inner max-h-[300px] overflow-y-auto">
        <table class="w-full text-xs data-table">
          <thead class="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
            <tr>
              <th class="p-2 text-left">Código</th>
              <th class="p-2 text-left">Producto</th>
              <th class="p-2 text-left">Unidad</th>
              <th class="p-2 text-right">Stock Sistema</th>
              <th class="p-2 text-right" style="width: 130px">Cant. Física</th>
            </tr>
          </thead>
          <tbody id="toma-products-body">
            <tr>
              <td colspan="5" class="text-center py-10 text-gray-400">
                <i class="fas fa-warehouse text-2xl mb-2"></i>
                <p>Selecciona una bodega para listar las existencias.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-[10px] text-gray-400 italic">* Nota: Los productos con cantidad física vacía ("Sin contar") no sufrirán ningún cambio ni ajuste.</p>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-toma-save" onclick="window._saveTomaFisica()">
      <i class="fas fa-floppy-disk mr-2"></i>Aplicar Ajuste Físico
    </button>
  `;

  openModal('Toma de Inventario Físico y Ajuste Contable', bodyHtml, footerHtml, true);
}

// Filtro de tabla toma física
(window as any)._filterTomaFisicaTable = (q: string) => {
  const query = q.toLowerCase().trim();
  const rows = document.querySelectorAll('.toma-prod-row');
  rows.forEach((row: any) => {
    const code = row.dataset.code?.toLowerCase() || '';
    const name = row.dataset.name?.toLowerCase() || '';
    if (!query || code.includes(query) || name.includes(query)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
};

async function _saveTomaFisica() {
  const whId = getSelectVal('toma-wh');
  const date = getInputVal('toma-date');
  const costType = getSelectVal('toma-cost-type');
  const accContraId = getSelectVal('toma-acc');

  if (!whId) return showToast('Selecciona la bodega a ajustar.', 'warning');
  if (!date) return showToast('La fecha es obligatoria.', 'warning');
  if (!accContraId) return showToast('Selecciona la cuenta contable de contrapartida.', 'warning');

  const btn = document.getElementById('btn-toma-save') as HTMLButtonElement;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando ajuste...'; }

  try {
    const pb = _pb();
    
    // 1. Recopilar cantidades físicas ingresadas
    const inputs = document.querySelectorAll('.toma-phys-input');
    const adjustments = [];

    for (const input of inputs as any) {
      const val = input.value.trim();
      if (val === '') continue; // ignore uncounted items

      const physicalQty = parseFloat(val);
      if (isNaN(physicalQty) || physicalQty < 0) {
        throw new Error('Las cantidades contadas deben ser números mayores o iguales a 0.');
      }

      const prodId = input.dataset.prodid;
      const systemQty = parseFloat(input.dataset.sys || '0');
      const avgCost = parseFloat(input.dataset.avgcost || '0');
      const lastCost = parseFloat(input.dataset.lastcost || '0');
      
      const qtyDiff = physicalQty - systemQty;
      if (Math.abs(qtyDiff) > 0.0001) {
        const cost = costType === 'promedio' ? avgCost : lastCost;
        adjustments.push({
          productId: prodId,
          qtyDiff,
          cost,
          systemQty,
          physicalQty
        });
      }
    }

    if (!adjustments.length) {
      showToast('No se detectaron diferencias entre el conteo físico y el stock del sistema.', 'info');
      closeModal();
      return;
    }

    // 2. Cargar todos los productos ajustados para obtener sus cuentas de inventario
    const products = (window as any)._tomaProducts || [];
    const prodMap = new Map(products.map((p: any) => [p.id, p]));

    // 3. Crear o buscar tipo de transacción AJ (Ajuste de Inventario)
    let ajType = await pb.listAll('transaction_types', { filter: 'code="AJ"' });
    if (!ajType.length) {
      ajType = [await pb.create('transaction_types', {
        code: 'AJ',
        prefix: 'AJ',
        name: 'Ajuste de Inventario',
        description: 'Ajustes por toma física de inventario',
        consecutive: 0,
        active: true
      })];
    }
    const txTypeId = ajType[0].id;

    // 4. Construir las líneas de transacción contable (Debito y Credito balanceados)
    const txLines = [];
    const today = date || new Date().toISOString().slice(0, 10);
    const rand = String(Date.now()).slice(-4);
    const txNumber = `AJ-${today.replaceAll('-', '')}-${rand}`;

    for (const adj of adjustments) {
      const prod = prodMap.get(adj.productId);
      const inventoryAccId = prod?.inventory_account_id;
      if (!inventoryAccId) {
        throw new Error(`El producto "${prod?.code} — ${prod?.name}" no tiene configurada una cuenta de inventario.`);
      }

      const totalValue = Math.round(Math.abs(adj.qtyDiff) * adj.cost * 100) / 100;
      if (totalValue <= 0) continue;

      if (adj.qtyDiff > 0) {
        // Sobrante (AJUSTE_POSITIVO):
        // Debito a la Cuenta de Inventario
        txLines.push({
          account_id: inventoryAccId,
          debit: totalValue,
          credit: 0,
          description: `Sobrante toma física ${prod.code} (${fmtN(adj.qtyDiff)} und)`,
          line_order: txLines.length + 1
        });
        // Credito a la Cuenta de Contrapartida
        txLines.push({
          account_id: accContraId,
          debit: 0,
          credit: totalValue,
          description: `Ajuste sobrante ${prod.code} en bodega`,
          line_order: txLines.length + 1
        });
      } else {
        // Faltante (AJUSTE_NEGATIVO):
        // Credito a la Cuenta de Inventario
        txLines.push({
          account_id: inventoryAccId,
          debit: 0,
          credit: totalValue,
          description: `Faltante toma física ${prod.code} (${fmtN(Math.abs(adj.qtyDiff))} und)`,
          line_order: txLines.length + 1
        });
        // Debito a la Cuenta de Contrapartida
        txLines.push({
          account_id: accContraId,
          debit: totalValue,
          credit: 0,
          description: `Ajuste faltante ${prod.code} en bodega`,
          line_order: txLines.length + 1
        });
      }
    }

    if (!txLines.length) {
      throw new Error('El valor total de los ajustes es de $0. No se requiere registro contable.');
    }

    // 5. Registrar la transacción contable general en estado draft
    const tx = await API.createTransaction({
      tx_type_id: txTypeId,
      number: txNumber,
      date,
      description: `Ajuste por Toma Física de Inventario en Bodega`,
      status: 'draft',
      payment_days: 0,
      cross_enabled: false
    }, txLines);

    // 6. Crear los movimientos de inventario asociados
    const positiveAdjs = adjustments.filter(a => a.qtyDiff > 0);
    const negativeAdjs = adjustments.filter(a => a.qtyDiff < 0);

    // 6a. Movimiento positivo
    if (positiveAdjs.length) {
      const mov = await pb.create('inventory_movements', {
        number: `AJP-${today.replaceAll('-', '')}-${rand}`,
        mov_type: 'AJUSTE_POSITIVO',
        date,
        warehouse_id: whId,
        notes: `Ajuste sobrantes toma física - Ref Tx ${txNumber}`,
        status: 'draft',
        tx_id: tx.id
      });
      for (let i = 0; i < positiveAdjs.length; i++) {
        const a = positiveAdjs[i];
        await pb.create('inventory_movement_lines', {
          movement_id: mov.id,
          product_id: a.productId,
          qty: a.qtyDiff,
          unit_cost: a.cost,
          notes: `Sobrante: contados ${fmtN(a.physicalQty)} vs sistema ${fmtN(a.systemQty)}`,
          line_order: i + 1
        });
      }
      await API.applyInventoryMovement(mov.id);
    }

    // 6b. Movimiento negativo
    if (negativeAdjs.length) {
      const mov = await pb.create('inventory_movements', {
        number: `AJN-${today.replaceAll('-', '')}-${rand}`,
        mov_type: 'AJUSTE_NEGATIVO',
        date,
        warehouse_id: whId,
        notes: `Ajuste faltantes toma física - Ref Tx ${txNumber}`,
        status: 'draft',
        tx_id: tx.id
      });
      for (let i = 0; i < negativeAdjs.length; i++) {
        const a = negativeAdjs[i];
        await pb.create('inventory_movement_lines', {
          movement_id: mov.id,
          product_id: a.productId,
          qty: Math.abs(a.qtyDiff),
          unit_cost: a.cost,
          notes: `Faltante: contados ${fmtN(a.physicalQty)} vs sistema ${fmtN(a.systemQty)}`,
          line_order: i + 1
        });
      }
      await API.applyInventoryMovement(mov.id);
    }

    // 7. Aprobar la transacción contable una vez aplicados los movimientos
    await pb.update('transactions', tx.id, { status: 'active' });

    showToast('Ajuste contable e inventario aplicados con éxito.', 'success');
    closeModal();
    renderInventario(document.getElementById('page-content')!);
  } catch (err: any) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk mr-2"></i>Aplicar Ajuste Físico'; }
  }
}

// --- REPORT IMPRESSION AND EXPORT UTILITIES ---

(window as any)._printReport = async (type: string) => {
  try {
    const pb = _pb();
    const [products, stock, warehouses] = await Promise.all([
      pb.listAll('products', { filter: 'active=true', sort: 'code' }),
      API.getInventoryStock(),
      API.getWarehouses(false)
    ]);

    const whMap = new Map(warehouses.map((w: any) => [w.id, w.name]));
    
    if (type === 'general') {
      const whId = getSelectVal('rep-gen-wh');
      const costType = getSelectVal('rep-gen-cost');
      const catVal = getSelectVal('rep-gen-cat');
      const lineVal = getSelectVal('rep-gen-line');
      
      const filteredStock = whId ? stock.filter((s: any) => s.warehouse_id === whId) : stock;
      const stockByProd = new Map();
      for (const s of filteredStock) {
        const pid = s.product_id;
        if (!stockByProd.has(pid)) {
          stockByProd.set(pid, { qty: 0, costSum: 0, costCount: 0 });
        }
        const entry = stockByProd.get(pid);
        entry.qty += Number(s.qty_on_hand || 0);
        if (Number(s.avg_cost || 0) > 0) {
          entry.costSum += Number(s.avg_cost);
          entry.costCount++;
        }
      }

      let filteredProducts = products;
      if (catVal) filteredProducts = filteredProducts.filter((p: any) => p.categoria === catVal);
      if (lineVal) filteredProducts = filteredProducts.filter((p: any) => p.linea === lineVal);

      const whTitle = whId ? `Bodega: ${whMap.get(whId) || ''}` : 'Consolidado General';
      const costTitle = costType === 'promedio' ? 'Costo Promedio Kardex' : 'Último Costo del Producto';
      
      let filterText = `Filtros - ${whTitle} | Costo: ${costTitle}`;
      if (catVal) filterText += ` | Categoría: ${catVal}`;
      if (lineVal) filterText += ` | Línea: ${lineVal}`;

      let html = `
        <h3>${filterText}</h3>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Línea</th>
              <th>Unidad</th>
              <th class="text-right">Stock</th>
              <th class="text-right">Costo Unit.</th>
              <th class="text-right">Valor Estimado</th>
            </tr>
          </thead>
          <tbody>
      `;
      let totalStock = 0;
      let totalVal = 0;

      for (const p of filteredProducts) {
        const st = stockByProd.get(p.id) || { qty: 0, costSum: 0, costCount: 0 };
        let cost = 0;
        if (costType === 'promedio') {
          cost = st.costCount > 0 ? (st.costSum / st.costCount) : Number(p.cost_price || 0);
        } else {
          cost = Number(p.cost_price || 0);
        }
        const val = st.qty * cost;
        totalStock += st.qty;
        totalVal += val;

        html += `
          <tr>
            <td style="font-family:monospace">${esc(p.code)}</td>
            <td>${esc(p.name)}</td>
            <td>${esc(p.categoria || '—')}</td>
            <td>${esc(p.linea || '—')}</td>
            <td>${esc(p.unit || '—')}</td>
            <td class="text-right">${fmtN(st.qty)}</td>
            <td class="text-right">${fmt(cost)}</td>
            <td class="text-right">${fmt(val)}</td>
          </tr>
        `;
      }

      html += `
          </tbody>
          <tfoot>
            <tr style="font-weight:bold;background:#f9f9f9">
              <td colspan="5">TOTALES</td>
              <td class="text-right">${fmtN(totalStock)}</td>
              <td></td>
              <td class="text-right">${fmt(totalVal)}</td>
            </tr>
          </tfoot>
        </table>
      `;

      _printHTMLReport('Reporte General de Inventarios', html);

    } else if (type === 'comparativo') {
      const activeWarehouses = warehouses.filter((w: any) => w.active);
      const stockMap = new Map();
      for (const s of stock) {
        stockMap.set(`${s.product_id}_${s.warehouse_id}`, Number(s.qty_on_hand || 0));
      }

      let html = `
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Unidad</th>
              ${activeWarehouses.map(w => `<th class="text-right">${esc(w.name)}</th>`).join('')}
              <th class="text-right">Total Existencia</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (const p of products.filter((p: any) => p.type === 'BIEN')) {
        let totalQty = 0;
        const whCells = activeWarehouses.map(w => {
          const qty = stockMap.get(`${p.id}_${w.id}`) || 0;
          totalQty += qty;
          return `<td class="text-right">${qty > 0 ? fmtN(qty) : '—'}</td>`;
        }).join('');

        html += `
          <tr>
            <td style="font-family:monospace">${esc(p.code)}</td>
            <td>${esc(p.name)}</td>
            <td>${esc(p.unit || '—')}</td>
            ${whCells}
            <td class="text-right" style="font-weight:bold">${fmtN(totalQty)}</td>
          </tr>
        `;
      }

      html += `</tbody></table>`;
      _printHTMLReport('Reporte Comparativo de Existencias por Bodega', html);

    } else if (type === 'conteo') {
      const whId = getSelectVal('rep-conteo-wh');
      const showStock = (document.getElementById('rep-conteo-show-stock') as HTMLInputElement).checked;

      const filteredStock = stock.filter((s: any) => s.warehouse_id === whId);
      const stockMap = new Map(filteredStock.map((s: any) => [s.product_id, s.qty_on_hand]));

      let html = `
        <h3>Bodega: ${whMap.get(whId) || ''}</h3>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Unidad</th>
              ${showStock ? '<th class="text-right">Stock Sistema</th>' : ''}
              <th style="width:180px">Conteo Físico (Lápiz)</th>
              <th style="width:200px">Observación</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (const p of products.filter((p: any) => p.type === 'BIEN')) {
        const sys = stockMap.get(p.id) || 0;
        html += `
          <tr>
            <td style="font-family:monospace">${esc(p.code)}</td>
            <td>${esc(p.name)}</td>
            <td>${esc(p.unit || '—')}</td>
            ${showStock ? `<td class="text-right">${fmtN(sys)}</td>` : ''}
            <td style="border-bottom: 1px solid #000; height: 30px;"></td>
            <td style="border-bottom: 1px solid #000;"></td>
          </tr>
        `;
      }

      html += `
          </tbody>
        </table>
        <div style="margin-top: 60px; display:flex; justify-content:space-around">
          <div style="border-top:1px solid #000; width: 220px; text-align:center; padding-top: 5px; font-size:11px">Firma Responsable Conteo</div>
          <div style="border-top:1px solid #000; width: 220px; text-align:center; padding-top: 5px; font-size:11px">Firma Revisor / Auditor</div>
        </div>
      `;

      _printHTMLReport('Listado para Conteo de Inventario Físico', html);

    } else if (type === 'precios') {
      let html = `
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto / Servicio</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th class="text-right">Precio Base (1)</th>
              <th class="text-right">Precio 2</th>
              <th class="text-right">Precio 3</th>
              <th class="text-right">IVA</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (const p of products) {
        html += `
          <tr>
            <td style="font-family:monospace">${esc(p.code)}</td>
            <td>${esc(p.name)}</td>
            <td>${esc(p.categoria || '—')}</td>
            <td>${esc(p.unit || '—')}</td>
            <td class="text-right">${fmt(p.base_price || 0)}</td>
            <td class="text-right">${p.precio_venta_2 ? fmt(p.precio_venta_2) : '—'}</td>
            <td class="text-right">${p.precio_venta_3 ? fmt(p.precio_venta_3) : '—'}</td>
            <td class="text-right">${p.iva_rate ? p.iva_rate + '%' : 'Exento'}</td>
          </tr>
        `;
      }

      html += `</tbody></table>`;
      _printHTMLReport('Lista de Precios Vigente', html);
    }
  } catch (err: any) {
    showToast(err.message, 'error');
  }
};

(window as any)._exportReport = async (type: string) => {
  try {
    const pb = _pb();
    const [products, stock, warehouses] = await Promise.all([
      pb.listAll('products', { filter: 'active=true', sort: 'code' }),
      API.getInventoryStock(),
      API.getWarehouses(false)
    ]);

    const whMap = new Map(warehouses.map((w: any) => [w.id, w.name]));

    if (type === 'general') {
      const whId = getSelectVal('rep-gen-wh');
      const costType = getSelectVal('rep-gen-cost');
      const catVal = getSelectVal('rep-gen-cat');
      const lineVal = getSelectVal('rep-gen-line');
      
      const filteredStock = whId ? stock.filter((s: any) => s.warehouse_id === whId) : stock;
      const stockByProd = new Map();
      for (const s of filteredStock) {
        const pid = s.product_id;
        if (!stockByProd.has(pid)) {
          stockByProd.set(pid, { qty: 0, costSum: 0, costCount: 0 });
        }
        const entry = stockByProd.get(pid);
        entry.qty += Number(s.qty_on_hand || 0);
        if (Number(s.avg_cost || 0) > 0) {
          entry.costSum += Number(s.avg_cost);
          entry.costCount++;
        }
      }

      // Re-consultamos con expansiones contables para exportar
      const productsDetailed = await pb.listAll('products', {
        filter: 'active=true',
        sort: 'code',
        expand: 'income_account_id,cost_account_id,inventory_account_id'
      });

      let filteredProducts = productsDetailed;
      if (catVal) filteredProducts = filteredProducts.filter((p: any) => p.categoria === catVal);
      if (lineVal) filteredProducts = filteredProducts.filter((p: any) => p.linea === lineVal);

      const exportRows = filteredProducts.map(p => {
        const st = stockByProd.get(p.id) || { qty: 0, costSum: 0, costCount: 0 };
        let cost = 0;
        if (costType === 'promedio') {
          cost = st.costCount > 0 ? (st.costSum / st.costCount) : Number(p.cost_price || 0);
        } else {
          cost = Number(p.cost_price || 0);
        }

        const ia = p.expand?.income_account_id;
        const ca = p.expand?.cost_account_id;
        const inv = p.expand?.inventory_account_id;

        return {
          codigo: p.code,
          nombre: p.name,
          tipo: p.type || '—',
          categoria: p.categoria || '—',
          linea: p.linea || '—',
          unidad: p.unit || '—',
          presentacion: p.presentacion || '—',
          iva_rate: p.iva_rate != null ? `${p.iva_rate}%` : '—',
          base_price: p.base_price || 0,
          precio_venta_2: p.precio_venta_2 || 0,
          precio_venta_3: p.precio_venta_3 || 0,
          cost_price_ficha: p.cost_price || 0,
          existencia: st.qty,
          costo_unitario: cost,
          valor_estimado: st.qty * cost,
          posicion_arancelaria: p.posicion_arancelaria || '—',
          arancel_rate: p.arancel_rate_default != null ? `${p.arancel_rate_default}%` : '—',
          pais_origen: p.pais_origen || '—',
          marca: p.marca || '—',
          modelo: p.modelo || '—',
          visto_bueno_req: p.visto_bueno_required ? 'Sí' : 'No',
          visto_bueno_ent: p.visto_bueno_entidad || '—',
          registro_sanitario: p.registro_sanitario || '—',
          peso_neto: p.peso_neto || 0,
          peso_bruto: p.peso_bruto || 0,
          peso_general: p.peso || 0,
          cajas_pallet: p.cajas_en_pallet || 0,
          und_empaque: p.und_empaque || 0,
          peso_und_empaque: p.peso_x_und_empaque || 0,
          ean_code: p.ean_code || '—',
          unspsc_code: p.unspsc_code || '—',
          description: p.description || '—',
          cuenta_ingresos: ia ? `${ia.code} — ${ia.name}` : '—',
          cuenta_costos: ca ? `${ca.code} — ${ca.name}` : '—',
          cuenta_inventario: inv ? `${inv.code} — ${inv.name}` : '—',
        };
      });

      const headers = [
        { key: 'codigo', label: 'Código' },
        { key: 'nombre', label: 'Producto' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'linea', label: 'Línea' },
        { key: 'unidad', label: 'Unidad de Medida' },
        { key: 'presentacion', label: 'Presentación' },
        { key: 'iva_rate', label: 'Tarifa IVA' },
        { key: 'base_price', label: 'Precio Base Venta' },
        { key: 'precio_venta_2', label: 'Precio Venta 2' },
        { key: 'precio_venta_3', label: 'Precio Venta 3' },
        { key: 'cost_price_ficha', label: 'Costo de Ficha' },
        { key: 'existencia', label: 'Existencia' },
        { key: 'costo_unitario', label: 'Costo Unitario Reportado' },
        { key: 'valor_estimado', label: 'Valorización Inventario' },
        { key: 'posicion_arancelaria', label: 'Posición Arancelaria' },
        { key: 'arancel_rate', label: 'Arancel %' },
        { key: 'pais_origen', label: 'País de Origen' },
        { key: 'marca', label: 'Marca' },
        { key: 'modelo', label: 'Modelo' },
        { key: 'visto_bueno_req', label: '¿Requiere Visto Bueno?' },
        { key: 'visto_bueno_ent', label: 'Entidad Visto Bueno' },
        { key: 'registro_sanitario', label: 'Registro Sanitario / Venta' },
        { key: 'peso_neto', label: 'Peso Neto (Kg)' },
        { key: 'peso_bruto', label: 'Peso Bruto (Kg)' },
        { key: 'peso_general', label: 'Peso General (Kg)' },
        { key: 'cajas_pallet', label: 'Cajas en Pallet' },
        { key: 'und_empaque', label: 'Unidades por Empaque' },
        { key: 'peso_und_empaque', label: 'Peso x Unidad Empaque' },
        { key: 'ean_code', label: 'Código EAN/Barras' },
        { key: 'unspsc_code', label: 'Código UNSPSC (DIAN)' },
        { key: 'description', label: 'Descripción' },
        { key: 'cuenta_ingresos', label: 'Cuenta de Ingresos' },
        { key: 'cuenta_costos', label: 'Cuenta de Costos/Gastos' },
        { key: 'cuenta_inventario', label: 'Cuenta de Inventario' },
      ];

      const whTitlePart = whId ? whMap.get(whId) : 'Consolidado';
      (window as any).exportToExcel(exportRows, headers, `Reporte_Inventario_${whTitlePart}`);
      showToast('Reporte exportado a Excel.', 'success');

    } else if (type === 'comparativo') {
      const activeWarehouses = warehouses.filter((w: any) => w.active);
      const stockMap = new Map();
      for (const s of stock) {
        stockMap.set(`${s.product_id}_${s.warehouse_id}`, Number(s.qty_on_hand || 0));
      }

      const exportRows = products.filter((p: any) => p.type === 'BIEN').map(p => {
        const r: any = {
          codigo: p.code,
          nombre: p.name,
          unidad: p.unit || '—',
        };
        let total = 0;
        activeWarehouses.forEach(w => {
          const qty = stockMap.get(`${p.id}_${w.id}`) || 0;
          r[w.id] = qty;
          total += qty;
        });
        r.total = total;
        return r;
      });

      const headers = [
        { key: 'codigo', label: 'Código' },
        { key: 'nombre', label: 'Producto' },
        { key: 'unidad', label: 'Unidad' },
        ...activeWarehouses.map(w => ({ key: w.id, label: w.name })),
        { key: 'total', label: 'Total Existencia' }
      ];

      (window as any).exportToExcel(exportRows, headers, 'Comparativo_Existencias_Bodegas');
      showToast('Comparativo exportado a Excel.', 'success');

    } else if (type === 'conteo') {
      const whId = getSelectVal('rep-conteo-wh');
      const showStock = (document.getElementById('rep-conteo-show-stock') as HTMLInputElement).checked;

      const filteredStock = stock.filter((s: any) => s.warehouse_id === whId);
      const stockMap = new Map(filteredStock.map((s: any) => [s.product_id, s.qty_on_hand]));

      const exportRows = products.filter((p: any) => p.type === 'BIEN').map(p => {
        const sys = stockMap.get(p.id) || 0;
        const r: any = {
          codigo: p.code,
          nombre: p.name,
          unidad: p.unit || '—',
        };
        if (showStock) {
          r.stock_sistema = sys;
        }
        r.conteo_fisico = '';
        r.observacion = '';
        return r;
      });

      const headers = [
        { key: 'codigo', label: 'Código' },
        { key: 'nombre', label: 'Producto' },
        { key: 'unidad', label: 'Unidad' }
      ];
      if (showStock) {
        headers.push({ key: 'stock_sistema', label: 'Stock Sistema' });
      }
      headers.push({ key: 'conteo_fisico', label: 'Conteo Físico' });
      headers.push({ key: 'observacion', label: 'Observación' });

      (window as any).exportToExcel(exportRows, headers, `Planilla_Conteo_${whMap.get(whId)}`);
      showToast('Planilla de conteo exportada.', 'success');

    } else if (type === 'precios') {
      const exportRows = products.map(p => ({
        codigo: p.code,
        nombre: p.name,
        categoria: p.categoria || '—',
        unidad: p.unit || '—',
        precio_base: p.base_price || 0,
        precio_2: p.precio_venta_2 || 0,
        precio_3: p.precio_venta_3 || 0,
        tarifa_iva: p.iva_rate ? p.iva_rate + '%' : 'Exento'
      }));

      const headers = [
        { key: 'codigo', label: 'Código' },
        { key: 'nombre', label: 'Producto' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'unidad', label: 'Unidad' },
        { key: 'precio_base', label: 'Precio Base (1)' },
        { key: 'precio_2', label: 'Precio 2' },
        { key: 'precio_3', label: 'Precio 3' },
        { key: 'tarifa_iva', label: 'IVA' }
      ];

      (window as any).exportToExcel(exportRows, headers, 'Lista_Precios_Inventario');
      showToast('Lista de precios exportada a Excel.', 'success');
    }
  } catch (err: any) {
    showToast(err.message, 'error');
  }
};

function _printHTMLReport(title: string, htmlContent: string) {
  const w = window.open('', '_blank', 'width=950,height=750');
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; font-size: 11.5px; color: #333; }
      table { border-collapse: collapse; width: 100%; margin-top: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      th, td { border: 1px solid #e2e8f0; padding: 7px 9px; text-align: left; }
      th { background-color: #f7fafc; color: #2d3748; font-weight: bold; }
      tfoot tr td { background-color: #edf2f7; color: #2d3748; }
      .text-right { text-align: right; }
      .no-print { display: inline-block; padding: 8px 18px; background: #1a4b8c; color: white; border: none; cursor: pointer; border-radius: 6px; font-weight: 600; margin-bottom: 20px; transition: background 0.2s; }
      .no-print:hover { background: #12335f; }
      h2 { color: #0d2137; font-size: 20px; margin-bottom: 4px; }
      p { margin: 2px 0; color: #718096; }
      @media print { .no-print { display: none; } body { padding: 0; } }
    </style>
    </head><body>
    <h2>${title}</h2>
    <p>Generado el: ${new Date().toLocaleString('es-CO')}</p>
    <button class="no-print" onclick="window.print()"><i class="fas fa-print"></i> Imprimir Reporte</button>
    ${htmlContent}
    </body></html>`);
  w.document.close();
}

async function _openRevalorizacionModal() {
  try {
    const warehouses = await API.getWarehouses(true);
    
    // Rango predeterminado: desde el 1 del mes actual hasta hoy
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);

    const bodyHtml = `
      <div class="space-y-4" style="font-family:'Segoe UI',sans-serif">
        <div class="bg-purple-50 border border-purple-100 rounded-xl p-4 text-xs text-purple-800 flex items-start gap-2.5 mb-2">
          <i class="fas fa-circle-info mt-0.5 text-purple-500 text-sm"></i>
          <div>
            <span class="font-bold">¿Cómo funciona?</span> Esta herramienta recorre el historial completo de movimientos de inventario de forma estrictamente cronológica. Identifica compras o entradas que resolvieron saldos negativos (ventas antes de compras) y calcula la diferencia entre el costo real y el provisional para generar los ajustes contables de revalorización correspondientes.
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="form-group">
            <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha Inicio <span class="text-red-500">*</span></label>
            <input id="reval-start-date" type="date" class="form-input text-xs w-full" value="${firstDay}">
          </div>
          <div class="form-group">
            <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha Fin <span class="text-red-500">*</span></label>
            <input id="reval-end-date" type="date" class="form-input text-xs w-full" value="${today}">
          </div>
          <div class="form-group">
            <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bodega <span class="text-red-500">*</span></label>
            <select id="reval-wh" class="form-input text-xs w-full">
              <option value="">— Todas las Bodegas —</option>
              ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="flex justify-start">
          <button class="btn btn-primary bg-purple-600 hover:bg-purple-700 border-none text-white px-5 py-2.5 flex items-center gap-2 shadow-sm rounded-lg text-xs" id="btn-reval-analyze" onclick="window._analyzeRevaluation()">
            <i class="fas fa-magnifying-glass"></i> Analizar Diferencias
          </button>
        </div>

        <!-- Resultados -->
        <div id="reval-results" class="border border-gray-200 rounded-xl overflow-hidden shadow-inner max-h-[280px] overflow-y-auto bg-gray-50">
          <div class="text-center py-12 text-gray-400">
            <i class="fas fa-calculator text-3xl mb-2 text-purple-200"></i>
            <p class="text-xs">Define el rango de fechas y haz clic en <strong>Analizar Diferencias</strong>.</p>
          </div>
        </div>

        <!-- Resumen de Ajuste -->
        <div id="reval-summary-box" class="bg-gray-100 border border-gray-200 rounded-xl p-3 flex justify-between items-center text-xs hidden">
          <div>
            <span class="text-gray-500">Ajustes seleccionados:</span>
            <span class="font-bold text-purple-800 ml-1" id="reval-selected-count">0</span>
          </div>
          <div class="flex gap-4">
            <div>
              <span class="text-gray-500">Total Débito Costos (+):</span>
              <span class="font-bold text-green-600 ml-1" id="reval-total-debit">$ 0.00</span>
            </div>
            <div>
              <span class="text-gray-500">Total Crédito Costos (-):</span>
              <span class="font-bold text-red-600 ml-1" id="reval-total-credit">$ 0.00</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary bg-purple-600 hover:bg-purple-700 border-none text-white" id="btn-reval-apply" disabled onclick="window._applyRevaluation()">
        <i class="fas fa-calculator mr-2"></i>Aplicar Ajustes
      </button>
    `;

    openModal('Recálculo y Revalorización de Costos', bodyHtml, footerHtml, true);
  } catch (err: any) {
    showToast(`Error al cargar el modal: ${err.message}`, 'error');
  }
}

async function _analyzeRevaluation() {
  const startDate = getInputVal('reval-start-date');
  const endDate = getInputVal('reval-end-date');
  const whId = getSelectVal('reval-wh');

  if (!startDate || !endDate) {
    return showToast('Por favor, selecciona las fechas de inicio y fin.', 'warning');
  }

  const btn = document.getElementById('btn-reval-analyze') as HTMLButtonElement;
  const resultsDiv = document.getElementById('reval-results');
  const summaryBox = document.getElementById('reval-summary-box');
  if (!resultsDiv) return;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analizando...';
  }
  resultsDiv.innerHTML = `<div class="text-center py-12 text-gray-500"><i class="fas fa-spinner fa-spin mr-2 text-2xl text-purple-600"></i><p class="text-xs mt-2">Simulando flujo cronológico de inventarios...</p></div>`;
  if (summaryBox) summaryBox.classList.add('hidden');

  try {
    const pb = _pb();

    // 1. Cargar productos de tipo BIEN y bodegas
    const [products, warehouses] = await Promise.all([
      pb.listAll('products', { filter: 'active=true' }),
      API.getWarehouses(false)
    ]);
    const bienProducts = products.filter((p: any) => p.type === 'BIEN');
    const prodMap = new Map(bienProducts.map((p: any) => [p.id, p]));
    const whMap = new Map(warehouses.map((w: any) => [w.id, w.name]));

    // 2. Traer todas las líneas de movimientos aplicados.
    const lines = await pb.listAll('inventory_movement_lines', {
      filter: 'movement_id.status = "applied"',
      expand: 'movement_id'
    });

    // 3. Ordenar las líneas cronológicamente por fecha, fecha de creación y orden de línea
    lines.sort((a: any, b: any) => {
      const dateA = a.expand?.movement_id?.date || '';
      const dateB = b.expand?.movement_id?.date || '';
      if (dateA !== dateB) return dateA.localeCompare(dateB);

      const createdA = a.expand?.movement_id?.created || '';
      const createdB = b.expand?.movement_id?.created || '';
      if (createdA !== createdB) return createdA.localeCompare(createdB);

      return (a.line_order || 0) - (b.line_order || 0);
    });

    // 4. Inicializar estado de stock por producto y bodega
    const stockState: { [prodId: string]: { [whId: string]: { qty: number, avg_cost: number } } } = {};

    const getStock = (pId: string, wId: string) => {
      if (!stockState[pId]) stockState[pId] = {};
      if (!stockState[pId][wId]) {
        stockState[pId][wId] = { qty: 0, avg_cost: 0 };
      }
      return stockState[pId][wId];
    };

    const simulatedAdjustments: any[] = [];

    // 5. Simular cronológicamente
    for (const line of lines) {
      const mov = line.expand?.movement_id;
      if (!mov) continue;

      const prodId = line.product_id;
      if (!prodMap.has(prodId)) continue;

      const type = mov.mov_type;
      const qty = Number(line.qty || 0);
      const unitCost = Number(line.unit_cost || 0);
      const date = mov.date || '';

      const isWithinDateRange = date >= startDate && date <= endDate;
      const isTargetWarehouse = !whId || mov.warehouse_id === whId || mov.dest_warehouse_id === whId;

      if (type === 'ENTRADA' || type === 'AJUSTE_POSITIVO') {
        const st = getStock(prodId, mov.warehouse_id);
        const priorQty = st.qty;
        const priorAvgCost = st.avg_cost;

        st.qty = priorQty + qty;

        if (priorQty < 0) {
          // Resolución de stock negativo!
          const resolvedQty = Math.min(qty, Math.abs(priorQty));
          const costDiff = unitCost - priorAvgCost;
          const adjustmentVal = Math.round((resolvedQty * costDiff) * 100) / 100;

          if (isWithinDateRange && isTargetWarehouse && Math.abs(adjustmentVal) > 0.009) {
            simulatedAdjustments.push({
              prodId,
              whId: mov.warehouse_id,
              date,
              adjustmentVal,
              resolvedQty,
              costDiff,
              priorAvgCost,
              newCost: unitCost,
              movementNumber: mov.number,
              movementId: mov.id
            });
          }
          st.avg_cost = unitCost;
        } else {
          if (st.qty > 0) {
            st.avg_cost = Math.round((((priorQty * priorAvgCost) + (qty * unitCost)) / st.qty) * 100) / 100;
          } else {
            st.avg_cost = unitCost;
          }
        }
      } else if (type === 'SALIDA' || type === 'AJUSTE_NEGATIVO') {
        const st = getStock(prodId, mov.warehouse_id);
        st.qty = st.qty - qty;
      } else if (type === 'TRASLADO') {
        // Origen
        const stSrc = getStock(prodId, mov.warehouse_id);
        const transferCost = stSrc.avg_cost;
        stSrc.qty = stSrc.qty - qty;

        // Destino
        const stDst = getStock(prodId, mov.dest_warehouse_id);
        const priorQtyDst = stDst.qty;
        const priorAvgCostDst = stDst.avg_cost;

        stDst.qty = priorQtyDst + qty;

        if (priorQtyDst < 0) {
          const resolvedQty = Math.min(qty, Math.abs(priorQtyDst));
          const costDiff = transferCost - priorAvgCostDst;
          const adjustmentVal = Math.round((resolvedQty * costDiff) * 100) / 100;

          if (isWithinDateRange && isTargetWarehouse && Math.abs(adjustmentVal) > 0.009) {
            simulatedAdjustments.push({
              prodId,
              whId: mov.dest_warehouse_id,
              date,
              adjustmentVal,
              resolvedQty,
              costDiff,
              priorAvgCost: priorAvgCostDst,
              newCost: transferCost,
              movementNumber: mov.number,
              movementId: mov.id
            });
          }
          stDst.avg_cost = transferCost;
        } else {
          if (stDst.qty > 0) {
            stDst.avg_cost = Math.round((((priorQtyDst * priorAvgCostDst) + (qty * transferCost)) / stDst.qty) * 100) / 100;
          } else {
            stDst.avg_cost = transferCost;
          }
        }
      }
    }

    // 6. Agrupar ajustes por producto y bodega
    const grouped: { [key: string]: any } = {};
    for (const adj of simulatedAdjustments) {
      const key = `${adj.prodId}_${adj.whId}`;
      if (!grouped[key]) {
        const prod = prodMap.get(adj.prodId);
        grouped[key] = {
          prodId: adj.prodId,
          code: prod?.code || '',
          name: prod?.name || '',
          whId: adj.whId,
          whName: whMap.get(adj.whId) || '',
          totalAdjustment: 0,
          details: [],
          hasAccounts: !!(prod?.inventory_account_id && prod?.cost_account_id)
        };
      }
      grouped[key].totalAdjustment += adj.adjustmentVal;
      grouped[key].details.push(adj);
    }

    const groupedList = Object.values(grouped);
    (window as any)._simulatedRevalAdjustments = groupedList;

    if (!groupedList.length) {
      resultsDiv.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <i class="fas fa-check-circle text-3xl mb-2 text-green-500"></i>
          <p class="text-xs">No se encontraron desfases de costos ni resoluciones de stock negativo en el rango seleccionado.</p>
        </div>
      `;
      const applyBtn = document.getElementById('btn-reval-apply') as HTMLButtonElement;
      if (applyBtn) applyBtn.disabled = true;
      return;
    }

    if (summaryBox) summaryBox.classList.remove('hidden');

    const rowsHtml = groupedList.map((item: any, idx) => {
      const adjVal = Math.round(item.totalAdjustment * 100) / 100;
      const isPositive = adjVal > 0;

      const statusHtml = item.hasAccounts
        ? `<span class="badge badge-green text-[10px]">Listo</span>`
        : `<span class="badge badge-red text-[10px]" title="Configura cuenta de inventario y costo en catálogo de productos"><i class="fas fa-circle-exclamation mr-1"></i>Sin Cuentas</span>`;

      const checkboxDisabled = !item.hasAccounts ? 'disabled' : '';
      const checkboxChecked = item.hasAccounts ? 'checked' : '';

      return `
        <tr class="hover:bg-gray-50 border-b border-gray-100">
          <td class="p-2 text-center">
            <input type="checkbox" class="reval-select-row w-4 h-4 text-purple-600 rounded" data-index="${idx}" ${checkboxDisabled} ${checkboxChecked} onchange="window._recalcRevalTotals()">
          </td>
          <td class="p-2 font-mono text-xs text-purple-900 font-semibold">${esc(item.code)}</td>
          <td class="p-2 text-sm">${esc(item.name)}</td>
          <td class="p-2 text-xs text-gray-500">${esc(item.whName)}</td>
          <td class="p-2 text-center text-xs text-gray-500 font-semibold">${item.details.length}</td>
          <td class="p-2 text-right font-bold text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}">
            $ ${fmtN(adjVal)}
          </td>
          <td class="p-2 text-center">${statusHtml}</td>
        </tr>
      `;
    }).join('');

    resultsDiv.innerHTML = `
      <table class="w-full text-xs data-table">
        <thead class="bg-purple-50 sticky top-0 z-10 border-b border-purple-200">
          <tr>
            <th class="p-2 text-center" style="width: 40px">
              <input type="checkbox" id="reval-select-all" class="w-4 h-4 text-purple-600 rounded" checked onchange="window._revalToggleAll(this.checked)">
            </th>
            <th class="p-2 text-left">Código</th>
            <th class="p-2 text-left">Producto</th>
            <th class="p-2 text-left">Bodega</th>
            <th class="p-2 text-center">Resoluciones</th>
            <th class="p-2 text-right">Ajuste Neto</th>
            <th class="p-2 text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;

    window._recalcRevalTotals();

  } catch (err: any) {
    resultsDiv.innerHTML = `<div class="p-6 text-center text-red-500">Error: ${esc(err.message)}</div>`;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-magnifying-glass"></i> Analizar Diferencias';
    }
  }
}

async function _applyRevaluation() {
  const groupedList = (window as any)._simulatedRevalAdjustments || [];
  const checkboxes = document.querySelectorAll('.reval-select-row') as NodeListOf<HTMLInputElement>;
  
  const selectedItems: any[] = [];
  checkboxes.forEach(cb => {
    if (cb.checked) {
      const idx = parseInt(cb.dataset.index || '0', 10);
      const item = groupedList[idx];
      if (item) selectedItems.push(item);
    }
  });

  if (!selectedItems.length) {
    return showToast('Por favor, selecciona al menos un producto para ajustar.', 'warning');
  }

  const btn = document.getElementById('btn-reval-apply') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Aplicando revalorización...';
  }

  try {
    const pb = _pb();

    // 1. Obtener productos para leer cuentas contables configuradas
    const products = await pb.listAll('products', { filter: 'active=true' });
    const prodMap = new Map(products.map((p: any) => [p.id, p]));

    // 2. Buscar/Crear tipo de transacción contable AJ (Ajuste de Inventario)
    let ajType = await pb.listAll('transaction_types', { filter: 'code="AJ"' });
    if (!ajType.length) {
      ajType = [await pb.create('transaction_types', {
        code: 'AJ',
        prefix: 'AJ',
        name: 'Ajuste de Inventario',
        description: 'Ajustes por revalorización de costos',
        consecutive: 0,
        active: true
      })];
    }
    const txTypeId = ajType[0].id;

    // 3. Construir líneas de la transacción contable consolidada
    const txLines: any[] = [];
    const today = new Date().toISOString().slice(0, 10);
    const rand = String(Date.now()).slice(-4);
    const txNumber = `AJ-REV-${today.replaceAll('-', '')}-${rand}`;

    for (const item of selectedItems) {
      const prod = prodMap.get(item.prodId) as any;
      if (!prod) continue;

      const inventoryAccId = prod.inventory_account_id;
      const costAccId = prod.cost_account_id;

      if (!inventoryAccId || !costAccId) {
        throw new Error(`El producto "${prod.code} — ${prod.name}" no tiene cuentas configuradas.`);
      }

      const totalVal = Math.round(item.totalAdjustment * 100) / 100;
      if (Math.abs(totalVal) <= 0.009) continue;

      if (totalVal > 0) {
        // Ajuste positivo: Débito a la Cuenta de Costo y Crédito a la Cuenta de Inventario
        txLines.push({
          account_id: costAccId,
          debit: totalVal,
          credit: 0,
          description: `Ajuste Costo Ventas revalorización ${prod.code}`,
          line_order: txLines.length + 1
        });
        txLines.push({
          account_id: inventoryAccId,
          debit: 0,
          credit: totalVal,
          description: `Ajuste Inventario revalorización ${prod.code}`,
          line_order: txLines.length + 1
        });
      } else {
        // Ajuste negativo: Crédito a la Cuenta de Costo y Débito a la Cuenta de Inventario
        const absVal = Math.abs(totalVal);
        txLines.push({
          account_id: costAccId,
          debit: 0,
          credit: absVal,
          description: `Ajuste Costo Ventas revalorización ${prod.code}`,
          line_order: txLines.length + 1
        });
        txLines.push({
          account_id: inventoryAccId,
          debit: absVal,
          credit: 0,
          description: `Ajuste Inventario revalorización ${prod.code}`,
          line_order: txLines.length + 1
        });
      }
    }

    if (!txLines.length) {
      throw new Error('El valor neto de los ajustes seleccionados es de $0. No se requiere registro contable.');
    }

    // 4. Registrar la transacción contable consolidada
    await API.createTransaction({
      tx_type_id: txTypeId,
      number: txNumber,
      date: today,
      description: `Revalorización manual de costos de inventario`,
      status: 'active',
      payment_days: 0,
      cross_enabled: false
    }, txLines);

    showToast(`Revalorización aplicada con éxito. Transacción ${txNumber} registrada.`, 'success');
    closeModal();
    renderInventario(document.getElementById('page-content')!);
  } catch (err: any) {
    showToast(`Error al aplicar revalorización: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-calculator mr-2"></i>Aplicar Ajustes`;
    }
  }
}

(window as any)._revalToggleAll = (checked: boolean) => {
  const checkboxes = document.querySelectorAll('.reval-select-row:not(:disabled)') as NodeListOf<HTMLInputElement>;
  checkboxes.forEach(cb => cb.checked = checked);
  (window as any)._recalcRevalTotals();
};

(window as any)._recalcRevalTotals = () => {
  const groupedList = (window as any)._simulatedRevalAdjustments || [];
  const checkboxes = document.querySelectorAll('.reval-select-row') as NodeListOf<HTMLInputElement>;
  
  let debitSum = 0;
  let creditSum = 0;
  let selectedCount = 0;

  checkboxes.forEach(cb => {
    if (cb.checked) {
      const idx = parseInt(cb.dataset.index || '0', 10);
      const item = groupedList[idx];
      if (item) {
        selectedCount++;
        const val = Math.round(item.totalAdjustment * 100) / 100;
        if (val > 0) debitSum += val;
        else creditSum += Math.abs(val);
      }
    }
  });

  const selectedCountEl = document.getElementById('reval-selected-count');
  const totalDebitEl = document.getElementById('reval-total-debit');
  const totalCreditEl = document.getElementById('reval-total-credit');

  if (selectedCountEl) selectedCountEl.innerText = String(selectedCount);
  if (totalDebitEl) totalDebitEl.innerText = `$ ${fmtN(debitSum)}`;
  if (totalCreditEl) totalCreditEl.innerText = `$ ${fmtN(creditSum)}`;

  const applyBtn = document.getElementById('btn-reval-apply') as HTMLButtonElement;
  if (applyBtn) {
    applyBtn.disabled = selectedCount === 0;
    applyBtn.innerHTML = `<i class="fas fa-calculator mr-2"></i>Aplicar Ajustes (${selectedCount})`;
  }
};

(window as any)._updateTomaFisicaSystemStock = _updateTomaFisicaSystemStock;
(window as any)._openTomaFisicaModal = _openTomaFisicaModal;
(window as any)._saveTomaFisica = _saveTomaFisica;
(window as any)._printReport = _printReport;
(window as any)._exportReport = _exportReport;
(window as any)._printHTMLReport = _printHTMLReport;
(window as any)._openRevalorizacionModal = _openRevalorizacionModal;
(window as any)._analyzeRevaluation = _analyzeRevaluation;
(window as any)._applyRevaluation = _applyRevaluation;
