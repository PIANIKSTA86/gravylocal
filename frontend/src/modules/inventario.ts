/**
 * GRAVY v2.0 — inventario.js
 * Gestión de Inventarios (F5).
 * Tabs: Stock actual · Movimientos · Bodegas
 */
'use strict';

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
  ];

  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Gestión de Inventarios</h3>
        <p class="text-sm" style="color:#6B7280">Stock actual, movimientos (entradas/salidas/traslados) y bodegas.</p>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div class="form-group">
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
          <div class="flex gap-2">
            <button class="btn btn-primary flex-1 py-2 text-xs" id="kd-btn-search"><i class="fas fa-magnifying-glass mr-1"></i>Consultar</button>
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

        const lines = await (window as any).pb.listAll('inventory_movement_lines', {
          filter: `product_id="${(window as any).pb.escapeFilterValue(prodId)}" && movement_id.status="applied"`,
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

        let runningQty = 0;
        let runningAvgCost = 0;

        currentKardexData = filteredLines.map((line: any) => {
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

        if (resultsContainer) {
          if (currentKardexData.length === 0) {
            resultsContainer.innerHTML = `
              <div class="p-8 text-center bg-white rounded-2xl border" style="border-color:#F0F0F0; color:#9CA3AF">
                <i class="fas fa-circle-exclamation mr-2" style="font-size:24px; color:#C46516"></i>
                <p class="mt-2 text-sm">No se encontraron movimientos registrados para este producto en la bodega seleccionada.</p>
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
                        <tr class="hover:bg-gray-50 border-b" style="border-color:#F3F4F6">
                          <td class="py-2">${esc(row.date)}</td>
                          <td class="font-mono font-semibold" style="color:#1A4B8C">${esc(row.docNumber)}</td>
                          <td><span class="text-[10px] font-bold uppercase">${esc(row.movType)}</span></td>
                          <td>${esc(row.partner)}</td>
                          <td class="border-r text-gray-500 max-w-xs truncate" style="border-color:#E5E7EB" title="${esc(row.notes)}">${esc(row.notes)}</td>
                          
                          <td class="text-right font-semibold text-green-700 bg-green-50/30">${row.qtyIn ? fmtN(row.qtyIn) : '—'}</td>
                          <td class="text-right text-green-700 bg-green-50/30">${row.qtyIn ? fmt(row.costIn) : '—'}</td>
                          <td class="text-right border-r font-semibold text-green-700 bg-green-50/30" style="border-color:#E5E7EB">${row.qtyIn ? fmt(row.totalIn) : '—'}</td>
                          
                          <td class="text-right font-semibold text-red-700 bg-red-50/30">${row.qtyOut ? fmtN(row.qtyOut) : '—'}</td>
                          <td class="text-right text-red-700 bg-red-50/30">${row.qtyOut ? fmt(row.costOut) : '—'}</td>
                          <td class="text-right border-r font-semibold text-red-700 bg-red-50/30" style="border-color:#E5E7EB">${row.qtyOut ? fmt(row.totalOut) : '—'}</td>
                          
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

    const exportKardexExcel = () => {
      if (!currentKardexData.length) return;
      const dataToExport = currentKardexData.map(row => ({
        'Fecha': row.date,
        'Documento': row.docNumber,
        'Tipo': row.movType,
        'Tercero': row.partner,
        'Notas': row.notes,
        'Entradas Cant.': row.qtyIn || 0,
        'Entradas Costo Unit.': row.costIn || 0,
        'Entradas Costo Total': row.totalIn || 0,
        'Salidas Cant.': row.qtyOut || 0,
        'Salidas Costo Unit.': row.costOut || 0,
        'Salidas Costo Total': row.totalOut || 0,
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
