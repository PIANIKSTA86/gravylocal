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
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  c = getContainer(c);
  if (!c) return;
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
    { id: 'consignaciones', label: 'Consignaciones', icon: 'fa-handshake'   },
    { id: 'reportes',   label: 'Reportes',       icon: 'fa-file-invoice'   },
  ];

  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5 w-full">
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
    if (tabId === 'stock')          renderStockTab(tabContent, ctx);
    if (tabId === 'movimientos')     renderMovimientosTab(tabContent, ctx);
    if (tabId === 'kardex')          renderKardexTab(tabContent, ctx);
    if (tabId === 'bodegas')         renderBodegasTab(tabContent, ctx);
    if (tabId === 'consignaciones')  renderConsignacionesTab(tabContent, ctx);
    if (tabId === 'reportes')        renderReportesTab(tabContent, ctx);
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
    const warehouses = ctx.warehouses ? ctx.warehouses : await API.getWarehouses(false);
    ctx.warehouses = warehouses;

    const todayDate = todayStr();
    const asOfDateVal = (ctx as any).asOfDate || todayDate;

    let stock = [];
    if (asOfDateVal === todayDate) {
      stock = await API.getInventoryStock();
    } else {
      stock = await API.getInventoryStockAsOf({ asOfDate: asOfDateVal });
    }
    ctx.stock = stock;

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
      <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center justify-between" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-3 flex-1 items-center">
          <input id="st-q" class="form-input min-w-48" placeholder="Buscar producto...">
          <select id="st-wh" class="form-input" style="max-width:200px">
            <option value="">Todas las bodegas</option>
            ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
          </select>
          <select id="st-status" class="form-input" style="max-width:160px">
            <option value="">Todo el stock</option>
            <option value="ok">Con stock</option>
            <option value="zero">Sin stock / Agotado</option>
          </select>
          <div class="flex items-center gap-1.5 bg-blue-50/70 p-1.5 rounded-xl border border-blue-200">
            <span class="text-xs font-bold text-blue-900 ml-1"><i class="fas fa-calendar-day mr-1"></i>Corte:</span>
            <input type="date" id="st-as-of-date" class="form-input text-xs py-1 px-2 border-blue-300" value="${asOfDateVal}">
            <button id="btn-apply-as-of" class="btn btn-primary py-1 px-2.5 text-xs" title="Consultar stock a la fecha de corte">
              <i class="fas fa-filter mr-1"></i>Filtrar
            </button>
          </div>
        </div>
        ${['superadmin', 'admin'].includes(_pb().currentUser?.role) ? `
          <button id="btn-recalc-stock" class="btn btn-secondary flex items-center gap-1.5" style="border-radius:12px; font-size:13px; padding:6px 12px">
            <i class="fas fa-arrows-rotate"></i> Recalcular Existencias
          </button>
        ` : ''}
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="stock-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th>Bodega</th>
                <th class="text-right">Mínimo</th>
                <th class="text-right">Máximo</th>
                <th class="text-right">Stock (${asOfDateVal === todayDate ? 'Actual' : 'al ' + asOfDateVal})</th>
                <th class="text-right">Costo prom.</th>
                <th class="text-right">Valor total</th>
                <th>Estado Alerta</th>
                <th>Últ. movimiento</th>
              </tr>
            </thead>
            <tbody id="stock-tbody">
              ${stock.length ? renderStockRows(stock) : `<tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-boxes-stacked mr-2"></i>No hay stock registrado a la fecha seleccionada.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;

    const applyStockFilter = () => filterStockTable();
    $('#st-q')?.addEventListener('input', debounce(applyStockFilter, 150));
    $('#st-wh')?.addEventListener('change', applyStockFilter);
    $('#st-status')?.addEventListener('change', applyStockFilter);

    $('#btn-apply-as-of')?.addEventListener('click', () => {
      const selectedDate = (document.getElementById('st-as-of-date') as HTMLInputElement)?.value;
      (ctx as any).asOfDate = selectedDate;
      renderStockTab(c, ctx);
    });

    $('#btn-recalc-stock')?.addEventListener('click', () => {
      const confirm = (window as any).confirmDialog;
      const runRecalc = async () => {
        const btn = document.getElementById('btn-recalc-stock') as HTMLButtonElement;
        if (!btn) return;
        btn.disabled = true;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1.5"></i>Recalculando...';
        try {
          const resp = await (window as any).API.recalculateStock();
          if (resp && resp.success) {
            showToast(resp.message || 'Existencias recalculadas exitosamente.', 'success');
            // Recargar la pestaña de stock
            await renderStockTab(c, ctx);
          } else {
            showToast(resp?.message || 'No se pudo completar la recalculación.', 'error');
          }
        } catch (err: any) {
          showToast(err.message || 'Error al recalcular stock.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }
      };

      if (confirm) {
        confirm(
          'Recalcular Existencias',
          '¿Deseas recalcular todas las existencias y costo promedio ponderado de los productos? Se procesará cronológicamente todo el historial de movimientos aplicados y puede demorar unos segundos.',
          runRecalc
        );
      } else {
        if (window.confirm('¿Deseas recalcular todas las existencias y costos promedio de los productos?')) {
          runRecalc();
        }
      }
    });

    const tbl = $('#stock-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);
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

    const stockMin = prod?.stock_min !== null && prod?.stock_min !== undefined ? Number(prod.stock_min) : null;
    const stockMax = prod?.stock_max !== null && prod?.stock_max !== undefined ? Number(prod.stock_max) : null;

    const minVal = stockMin !== null ? fmtN(stockMin) : '—';
    const maxVal = stockMax !== null ? fmtN(stockMax) : '—';

    let alertState = '<span class="badge badge-green">OK</span>';
    let qtyClass = 'font-semibold text-green-700';

    if (qty <= 0) {
      alertState = '<span class="badge badge-red">Agotado</span>';
      qtyClass = 'font-semibold text-red-500';
    } else if (stockMin !== null && qty < stockMin) {
      alertState = '<span class="badge badge-orange">Bajo Mínimo</span>';
      qtyClass = 'font-semibold text-orange-600';
    } else if (stockMax !== null && qty > stockMax) {
      alertState = '<span class="badge badge-blue" style="background:#EFF6FF; color:#1E40AF; border-color:#DBEAFE">Sobre Máximo</span>';
      qtyClass = 'font-semibold text-blue-600';
    }

    return `<tr data-whid="${esc(s.warehouse_id)}" data-qty="${qty}">
      <td class="font-medium">${prod ? esc(prod.name) : '<span style="color:#9CA3AF">—</span>'}</td>
      <td><span class="font-mono text-xs" style="color:#1A4B8C">${prod ? esc(prod.code) : '—'}</span></td>
      <td>${wh ? esc(wh.name) : '—'}</td>
      <td class="text-right">${minVal}</td>
      <td class="text-right">${maxVal}</td>
      <td class="text-right ${qtyClass}">${fmtN(qty)}</td>
      <td class="text-right">${cost ? fmt(cost) : '—'}</td>
      <td class="text-right">${val ? fmt(val) : '—'}</td>
      <td>${alertState}</td>
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

    const totalDocs  = movs.length;
    const totalUnits = movs.reduce((sum, m) => sum + (Number(m.total_qty) || 0), 0);
    const totalCost  = movs.reduce((sum, m) => sum + (Number(m.total_cost) || 0), 0);

    // Cargar documentos asociados (Facturas de venta y Facturas de compra)
    const movIds = movs.map(m => m.id);
    let salesMap = new Map();
    let purchaseMap = new Map();

    if (movIds.length > 0) {
      try {
        const filterQuery = movIds.map((id: string) => `inv_movement_id="${pb.escapeFilterValue(id)}"`).join('||');
        const [linkedSales, linkedPurchases] = await Promise.all([
          pb.listAll('invoices', { filter: filterQuery, fields: 'id,number,inv_movement_id,status,tx_number' }).catch(() => []),
          pb.listAll('purchase_invoices', { filter: filterQuery, fields: 'id,number,inv_movement_id,status,tx_number' }).catch(() => []),
        ]);
        (linkedSales || []).forEach((inv: any) => salesMap.set(inv.inv_movement_id, inv));
        (linkedPurchases || []).forEach((pur: any) => purchaseMap.set(pur.inv_movement_id, pur));
      } catch (_) {}
    }

    c.innerHTML = `
      <!-- Tarjetas Resumen (KPIs UX/UI) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4" id="mov-kpi-container">
        ${invKpi('Movimientos Registrados', totalDocs,          'fa-arrows-rotate', '#1A4B8C', '#EEF4FF')}
        ${invKpi('Total Unidades Movidas',  fmtN(totalUnits),   'fa-cubes',         '#059669', '#ECFDF5')}
        ${invKpi('Valor Total en Movs.',    fmt(totalCost),     'fa-coins',         '#7C3AED', '#F5F3FF')}
      </div>

      <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center justify-between" style="border-color:#F0F0F0">
        <div class="flex flex-wrap gap-3 flex-1 items-center">
          <input id="mov-q" class="form-input" style="min-width:220px" placeholder="Buscar número, nota, tipo, doc...">
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
        <div class="flex items-center gap-2 flex-wrap">
          ${_pb().currentUser?.role === 'superadmin' ? `
            <button type="button" class="btn btn-outline text-purple-700 border-purple-200 hover:bg-purple-50" title="Renumerar historial de movimientos al formato mensual" onclick="renumberInventoryMovements()">
              <i class="fas fa-wand-magic-sparkles mr-1"></i> Renumerar Historial
            </button>
          ` : ''}
          ${can('canWrite') ? `
            <button type="button" class="btn btn-outline text-indigo-700 border-indigo-200 hover:bg-indigo-50" id="btn-manage-concepts" title="Configurar conceptos contables de inventario">
              <i class="fas fa-tags mr-1"></i> Conceptos
            </button>
            <button type="button" class="btn btn-primary" id="btn-new-mov"><i class="fas fa-plus mr-1"></i> Nuevo Movimiento</button>
          ` : ''}
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="mov-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Concepto</th>
                <th>Fecha</th>
                <th>Doc. Asociado</th>
                <th>Bodega Origen</th>
                <th>Bodega Destino</th>
                <th>Comentario / Observación</th>
                <th class="text-right">Cant. Total</th>
                <th class="text-right">Costo Total</th>
                <th>Estado</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody id="mov-tbody">
              ${movs.length ? renderMovRows(movs, salesMap, purchaseMap) : `<tr><td colspan="12" class="text-center py-10" style="color:#9CA3AF"><i class="fas fa-arrows-rotate mr-2"></i>No hay movimientos registrados.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;

    const applyMovFilter = () => {
      const q  = (getInputVal('mov-q') || '').toLowerCase();
      const tp = getSelectVal('mov-type-f');
      const st = getSelectVal('mov-status-f');

      let filterDocs = 0;
      let filterUnits = 0;
      let filterCost = 0;

      $$('#mov-table tbody tr[data-movid]').forEach(tr => {
        const match = (
          (!q  || tr.textContent.toLowerCase().includes(q)) &&
          (!tp || tr.dataset.movtype === tp) &&
          (!st || tr.dataset.movstatus === st)
        );
        tr.style.display = match ? '' : 'none';

        if (match) {
          filterDocs++;
          filterUnits += parseFloat(tr.dataset.totalqty || '0');
          filterCost  += parseFloat(tr.dataset.totalcost || '0');
        }
      });

      const kpiWrap = $('#mov-kpi-container');
      if (kpiWrap) {
        kpiWrap.innerHTML = `
          ${invKpi('Movimientos Registrados', filterDocs,         'fa-arrows-rotate', '#1A4B8C', '#EEF4FF')}
          ${invKpi('Total Unidades Movidas',  fmtN(filterUnits),  'fa-cubes',         '#059669', '#ECFDF5')}
          ${invKpi('Valor Total en Movs.',    fmt(filterCost),    'fa-coins',         '#7C3AED', '#F5F3FF')}
        `;
      }
    };

    $('#mov-q')?.addEventListener('input', debounce(applyMovFilter, 150));
    $('#mov-type-f')?.addEventListener('change', applyMovFilter);
    $('#mov-status-f')?.addEventListener('change', applyMovFilter);
    $('#btn-manage-concepts')?.addEventListener('click', () => openInventoryConceptsModal(() => renderMovimientosTab(c, ctx)));
    $('#btn-new-mov')?.addEventListener('click', () => openMovForm(null, ctx, () => renderMovimientosTab(c, ctx)));

    const tbl = $('#mov-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);
  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

function resolveAssociatedDocHtml(m: any, salesMap: Map<string, any>, purchaseMap: Map<string, any>): string {
  const salesInv = salesMap.get(m.id);
  if (salesInv) {
    const txId = m.tx_id || m.expand?.tx_id?.id || '';
    const clickAttr = txId ? `onclick="window.seeTxDetail('${esc(txId)}')" style="cursor:pointer;" title="Factura de Venta ${esc(salesInv.number)} (Ver asiento contable)"` : `title="Factura de Venta ${esc(salesInv.number)}"`;
    const correctedBadge = salesInv.cost_corrected ? `<i class="fas fa-rotate text-blue-400 ml-1" title="Costo corregido el ${esc(salesInv.cost_corrected_at || '')}"></i>` : '';
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200" ${clickAttr}>
      <i class="fas fa-file-invoice-dollar text-blue-500"></i> ${esc(salesInv.number)}${correctedBadge}
    </span>`;
  }

  const purInv = purchaseMap.get(m.id);
  if (purInv) {
    const txId = m.tx_id || m.expand?.tx_id?.id || '';
    const clickAttr = txId ? `onclick="window.seeTxDetail('${esc(txId)}')" style="cursor:pointer;" title="Factura de Compra ${esc(purInv.number)} (Ver asiento contable)"` : `title="Factura de Compra ${esc(purInv.number)}"`;
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200" ${clickAttr}>
      <i class="fas fa-file-import text-emerald-500"></i> ${esc(purInv.number)}
    </span>`;
  }

  const tx = m.expand?.tx_id;
  if (tx) {
    const isCDE = m.notes && (m.notes.includes('CDE') || m.notes.includes('Electrónico'));
    const isTomaFisica = m.notes && (m.notes.includes('toma física') || m.notes.includes('Toma física'));
    
    let icon = 'fa-file-invoice';
    let bgClass = 'bg-purple-50 text-purple-700 border-purple-200';
    let iconClass = 'text-purple-500';

    if (isCDE) {
      icon = 'fa-receipt';
      bgClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      iconClass = 'text-indigo-500';
    } else if (isTomaFisica) {
      icon = 'fa-clipboard-check';
      bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
      iconClass = 'text-amber-500';
    }

    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${bgClass} cursor-pointer" onclick="window.seeTxDetail('${esc(tx.id)}')" title="Asiento Contable ${esc(tx.number)} (Click para ver detalle)">
      <i class="fas ${icon} ${iconClass}"></i> ${esc(tx.number)}
    </span>`;
  }

  if (m.notes) {
    const docMatch = m.notes.match(/(?:Factura|Doc|Documento|Ref|POS|CDE)[\s:#-]*([A-Z0-9-]+)/i);
    if (docMatch && docMatch[0]) {
      return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200" title="${esc(m.notes)}">
        <i class="fas fa-file-alt text-gray-400"></i> ${esc(docMatch[0])}
      </span>`;
    }
  }

  return `<span class="text-xs text-gray-400">—</span>`;
}

function renderMovRows(movs, salesMap = new Map(), purchaseMap = new Map()) {
  return movs.map(m => {
    const tm    = INV_MOV_TYPES.find(t => t.value === m.mov_type);
    const meta  = INV_STATUS_META[m.status] || { label: m.status, badge: 'badge-gray' };
    const wh    = m.expand?.warehouse_id;
    const dest  = m.expand?.dest_warehouse_id;
    const concept = m.expand?.concept_id;

    const totalQty  = Number(m.total_qty  || 0);
    const totalCost = Number(m.total_cost || 0);
    const docHtml   = resolveAssociatedDocHtml(m, salesMap, purchaseMap);

    const conceptBadge = concept
      ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200" title="${esc(concept.name)}">
          <i class="fas fa-tag text-indigo-500"></i> ${esc(concept.name)}
        </span>`
      : '<span class="text-gray-300">—</span>';

    return `<tr data-movid="${esc(m.id)}" data-movtype="${esc(m.mov_type)}" data-movstatus="${esc(m.status)}" data-totalqty="${totalQty}" data-totalcost="${totalCost}">
      <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(m.number)}</span></td>
      <td><span style="color:${tm?.color || '#6B7280'}"><i class="fas ${tm?.icon || 'fa-box'} mr-1"></i>${esc(tm?.label || m.mov_type)}</span></td>
      <td>${conceptBadge}</td>
      <td class="whitespace-nowrap text-xs text-gray-600">${esc(m.date)}</td>
      <td>${docHtml}</td>
      <td>${wh   ? esc(wh.name)   : '—'}</td>
      <td>${dest ? esc(dest.name) : '—'}</td>
      <td class="max-w-xs text-xs font-normal truncate" title="${m.notes ? esc(m.notes) : ''}">
        ${m.notes ? `<span class="italic" style="color:#374151">${esc(m.notes)}</span>` : `<span class="text-gray-300">—</span>`}
      </td>
      <td class="text-right font-semibold text-gray-800">${fmtN(totalQty)}</td>
      <td class="text-right font-semibold" style="color:#059669">${fmt(totalCost)}</td>
      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
      <td class="text-center">
        <div class="flex justify-center gap-1">
          <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewMovDetail('${esc(m.id)}')"><i class="fas fa-eye"></i></button>
          ${(m.status === 'draft' || m.status === 'applied') && can('canWrite') ? `
            <button class="btn btn-outline btn-sm text-blue-600 border-blue-200 hover:bg-blue-50" title="Editar movimiento" onclick="editMovement('${esc(m.id)}')"><i class="fas fa-pen-to-square"></i></button>
          ` : ''}
          ${m.status === 'draft' && can('canWrite') ? `<button class="btn btn-primary btn-sm" title="Aplicar movimiento" onclick="applyMovement('${esc(m.id)}')"><i class="fas fa-check"></i></button>` : ''}
          ${m.status === 'applied' && can('canWrite') ? `<button class="btn btn-outline btn-sm" title="Anular" onclick="voidMovement('${esc(m.id)}', '${esc(m.number)}')"><i class="fas fa-ban"></i></button>` : ''}
          ${(m.status === 'draft' || m.status === 'voided') && ['superadmin', 'admin'].includes(_pb().currentUser?.role) ? `
            <button class="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50" title="Eliminar permanentemente" onclick="window._deleteInventoryMovement('${esc(m.id)}', '${esc(m.number)}')"><i class="fas fa-trash-can"></i></button>
          ` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ── Homogeneizar Numeración Histórica ─────────────────────────────────────────
async function renumberInventoryMovements() {
  if (_pb().currentUser?.role !== 'superadmin') {
    return showToast('Esta acción está reservada únicamente para el Superadministrador.', 'error');
  }

  confirmDialog(
    'Homogeneizar Numeración Histórica',
    '¿Deseas renumerar todos los movimientos de inventario existentes al nuevo formato mensual <strong>INV-YYYYMM-0001</strong>?<br><br>Esta acción actualizará la base de datos central de la empresa y todos los equipos verán los cambios inmediatamente.',
    async () => {
      try {
        showToast('Procesando renumeración en la base de datos...', 'info');
        const res = await API.renumberLegacyInventoryMovements();
        showToast(`Proceso completado. ${res.updated} documentos renumerados de ${res.total} totales.`, 'success');
        renderInventario($('#page-content'));
      } catch (err: any) {
        showToast(err.message || 'Error al renumerar documentos', 'error');
      }
    }
  );
}

// ── MODAL UNIFICADO DE CONFIGURACIÓN DE PRODUCTOS E INVENTARIOS ─────────────────
async function openUnifiedInventoryConfigModal() {
  let prodCfg = { auto_code: false, prefix: 'PROD-', consecutive: 1, digits: 4 };
  try {
    const rawProd = await API.getSetting('product_config_v1');
    if (rawProd) prodCfg = { ...prodCfg, ...JSON.parse(rawProd) };
  } catch (_) {}

  let invCfg = { allow_negative_stock: false };
  try {
    const rawInv = await API.getSetting('inventory_settings_v1');
    if (rawInv) invCfg = { ...invCfg, ...JSON.parse(rawInv) };
  } catch (_) {}

  const bodyHtml = `
    <div class="space-y-4 text-left" style="font-family:'Segoe UI',sans-serif">
      <!-- Sección 1: Codificación Automática de Productos (SKU) -->
      <div class="p-4 rounded-xl border border-gray-200 bg-gray-50/70">
        <h4 class="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2 border-b pb-2">
          <i class="fas fa-barcode text-blue-600"></i> Codificación Automática de Productos (SKU)
        </h4>
        <p class="text-xs text-gray-500 mb-3">Configura la asignación automática de códigos consecutivos para nuevos productos y servicios.</p>
        
        <div class="form-group flex items-center gap-3 mb-3">
          <input type="checkbox" id="cfg-cod-auto" class="rounded text-blue-600 w-4 h-4 cursor-pointer" ${prodCfg.auto_code ? 'checked' : ''} onchange="window._toggleCodificacionFields(this.checked)">
          <label for="cfg-cod-auto" class="text-xs font-bold text-gray-700 cursor-pointer select-none">Habilitar Codificación Automática de SKU</label>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3" id="cfg-cod-fields" style="${prodCfg.auto_code ? '' : 'display:none'}">
          <div class="form-group">
            <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Prefijo</label>
            <input id="cfg-cod-prefix" type="text" class="form-input text-xs w-full font-mono uppercase" value="${esc(prodCfg.prefix || '')}" placeholder="Ej: PROD-">
          </div>
          <div class="form-group">
            <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Siguiente Consecutivo <span class="text-red-500">*</span></label>
            <input id="cfg-cod-consecutive" type="number" min="1" step="1" class="form-input text-xs w-full font-mono" value="${prodCfg.consecutive || 1}">
          </div>
          <div class="form-group">
            <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Dígitos de Relleno <span class="text-red-500">*</span></label>
            <input id="cfg-cod-digits" type="number" min="1" max="10" step="1" class="form-input text-xs w-full font-mono" value="${prodCfg.digits || 4}" placeholder="Ej: 4">
          </div>
        </div>
      </div>

      <!-- Sección 2: Operaciones de Inventario & Stock Negativo -->
      <div class="p-4 rounded-xl border border-gray-200 bg-gray-50/70">
        <h4 class="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2 border-b pb-2">
          <i class="fas fa-boxes-stacked text-emerald-600"></i> Operaciones de Inventario y Stock Negativo
        </h4>
        <label class="flex items-start gap-3 cursor-pointer">
          <input id="inv-cfg-allow-negative" type="checkbox" class="form-checkbox h-5 w-5 text-emerald-600 rounded mt-0.5" ${invCfg.allow_negative_stock ? 'checked' : ''}>
          <div>
            <span class="font-bold text-gray-800 block text-xs">Permitir salidas de inventario con stock en rojo / negativo</span>
            <span class="text-[11px] text-gray-500 block mt-0.5">Si se activa, el sistema autorizará el registro y aplicación de salidas, traslados y ajustes negativos aun cuando la bodega de origen no cuente con existencias suficientes.</span>
          </div>
        </label>
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-unified-cfg" onclick="window._saveUnifiedInventoryConfig()">
      <i class="fas fa-floppy-disk mr-1.5"></i>Guardar Configuración
    </button>
  `;

  openModal('Configuración de Productos e Inventarios', bodyHtml, footerHtml, true);
}

// ── Manejador para Editar Movimiento ──────────────────────────────────────────
async function editMovement(movId) {
  try {
    const mov = await pb.get('inventory_movements', movId);

    if (mov.status === 'voided') {
      return showToast('Los movimientos anulados no se pueden modificar.', 'warning');
    }

    if (mov.status === 'applied') {
      confirmDialog(
        'Modificar movimiento aplicado',
        `El movimiento <strong>${esc(mov.number)}</strong> ya se encuentra aplicado al inventario.<br><br>Para modificarlo, el sistema validará existencias y <strong>revertirá temporalmente su stock a estado borrador</strong>.<br><br>¿Deseas continuar?`,
        async () => {
          try {
            showToast('Validando existencias y desaplicando movimiento...', 'info');
            await API.unapplyMovementForEdit(movId);
            showToast('Movimiento desaplicado. Puedes realizar los cambios y volver a aplicarlo.', 'success');
            const updatedMov = await pb.get('inventory_movements', movId);
            const lines = await API.getInventoryMovementLines(movId);
            openMovForm({ mov: updatedMov, lines }, {}, () => renderInventario($('#page-content')));
          } catch (err) {
            showToast(err.message || 'Error al desaplicar el movimiento', 'error');
          }
        }
      );
      return;
    }

    // Si es borrador, abrir directamente
    const lines = await API.getInventoryMovementLines(movId);
    openMovForm({ mov, lines }, {}, () => renderInventario($('#page-content')));

  } catch (err) {
    showToast(err.message || 'Error al abrir el movimiento para edición', 'error');
  }
}

// ── Ver detalle de movimiento ─────────────────────────────────────────────────
async function viewMovDetail(id) {
  try {
    const [mov, lines] = await Promise.all([
      pb.get('inventory_movements', id, { expand: 'warehouse_id,dest_warehouse_id,third_party_id,tx_id,concept_id,concept_id.account_id' }),
      API.getInventoryMovementLines(id),
    ]);
    const tm    = INV_MOV_TYPES.find(t => t.value === mov.mov_type);
    const meta  = INV_STATUS_META[mov.status] || { label: mov.status, badge: 'badge-gray' };
    const wh    = mov.expand?.warehouse_id;
    const dest  = mov.expand?.dest_warehouse_id;
    const tp    = mov.expand?.third_party_id;
    const concept = mov.expand?.concept_id;

    const sumQty  = lines.reduce((acc, l) => acc + (Number(l.qty) || 0), 0);
    const sumCost = lines.reduce((acc, l) => acc + ((Number(l.qty) || 0) * (Number(l.unit_cost) || 0)), 0);

    openModal(
      `Movimiento — ${esc(mov.number)}`,
      `<div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
        <div><span class="form-label text-xs">Número</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(mov.number)}</p></div>
        <div><span class="form-label text-xs">Tipo</span><p class="font-medium" style="color:${tm?.color}">${esc(tm?.label || mov.mov_type)}</p></div>
        <div><span class="form-label text-xs">Fecha</span><p class="font-medium">${esc(mov.date)}</p></div>
        <div><span class="form-label text-xs">Estado</span><p><span class="badge ${meta.badge}">${meta.label}</span></p></div>
        <div><span class="form-label text-xs">Bodega Origen</span><p class="font-medium">${wh ? esc(wh.name) : '—'}</p></div>
        <div><span class="form-label text-xs">Bodega Destino</span><p class="font-medium">${dest ? esc(dest.name) : '—'}</p></div>
        <div><span class="form-label text-xs">Total Cantidades</span><p class="font-bold text-gray-800 text-base">${fmtN(sumQty)}</p></div>
        <div><span class="form-label text-xs">Costo Total Doc.</span><p class="font-bold text-emerald-600 text-base">${fmt(sumCost)}</p></div>
        ${concept ? `<div class="md:col-span-2"><span class="form-label text-xs">Concepto de Inventario</span><p class="font-semibold text-indigo-700 text-xs"><i class="fas fa-tag mr-1 text-xs"></i>${esc(concept.name)} ${concept.expand?.account_id ? `(${esc(concept.expand.account_id.code)} - ${esc(concept.expand.account_id.name)})` : ''}</p></div>` : ''}
        ${mov.expand?.tx_id ? `<div class="md:col-span-2"><span class="form-label text-xs">Asiento Contable</span><p class="font-mono font-semibold"><a href="#" onclick="closeModal(); (window as any).seeTxDetail('${esc(mov.tx_id.id || mov.tx_id)}'); return false;" class="text-blue-600 hover:underline"><i class="fas fa-file-invoice mr-1 text-xs"></i>${esc(mov.expand.tx_id.number)}</a></p></div>` : ''}
        ${tp ? `<div class="md:col-span-2"><span class="form-label text-xs">Tercero</span><p class="font-medium">${esc(tp.name)}</p></div>` : ''}
        ${mov.notes ? `<div class="md:col-span-4"><span class="form-label text-xs">Notas</span><p class="text-gray-600 italic">${esc(mov.notes)}</p></div>` : ''}
      </div>
      <div class="border rounded-xl overflow-hidden" style="border-color:#F0F0F0">
        <table class="data-table">
          <thead>
            <tr class="bg-gray-100 text-gray-700">
              <th>Producto</th>
              <th>Código</th>
              <th class="text-center">Unidad (UM)</th>
              <th class="text-right">Cantidad</th>
              <th class="text-right">Costo Unit.</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map(l => {
              const p = l.expand?.product_id;
              const unitMeasure = p?.unit || p?.unit_measure || 'UND';
              const lineTotal = (Number(l.qty) || 0) * (Number(l.unit_cost) || 0);

              return `<tr>
                <td class="font-medium">${p ? esc(p.name) : '—'}</td>
                <td class="font-mono text-xs text-gray-500">${p ? esc(p.code) : '—'}</td>
                <td class="text-center"><span class="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">${esc(unitMeasure)}</span></td>
                <td class="text-right font-semibold">${fmtN(l.qty)}</td>
                <td class="text-right text-gray-600">${l.unit_cost ? fmt(l.unit_cost) : '—'}</td>
                <td class="text-right font-semibold text-gray-800">${fmt(lineTotal)}</td>
              </tr>`;
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="bg-gray-50 font-bold border-t border-gray-200 text-sm">
              <td colspan="3" class="text-right py-2.5 px-4 text-gray-700">TOTALES DEL DOCUMENTO:</td>
              <td class="text-right py-2.5 px-4 text-blue-900">${fmtN(sumQty)}</td>
              <td></td>
              <td class="text-right py-2.5 px-4 text-emerald-700">${fmt(sumCost)}</td>
            </tr>
          </tfoot>
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

// Auxiliar para autocompletar productos fila a fila con navegación por teclado y mouse
function setupRowProductAutocomplete(idx, products, originStockMap, isOutboundType, updateFormTotals) {
  const hiddenInput = document.getElementById(`ml-prod-${idx}`);
  const searchInput = document.getElementById(`ml-prod-input-${idx}`);
  const dropdown    = document.getElementById(`ml-prod-dropdown-${idx}`);
  if (!hiddenInput || !searchInput || !dropdown) return;

  let highlighted = -1;

  const renderDropdown = (filtered) => {
    if (!filtered.length) {
      dropdown.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400"><i class="fas fa-box-open mr-1"></i>Sin coincidencias</div>';
      dropdown.style.display = 'block';
      return;
    }

    const isOutbound = isOutboundType();
    dropdown.innerHTML = filtered.map((p, i) => {
      const available = originStockMap.get(p.id) || 0;
      const stockBadge = isOutbound ? `
        <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${available > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}">
          Disp: ${fmtN(available)}
        </span>
      ` : '';

      return `
        <button type="button"
          data-prod-idx="${i}"
          class="w-full text-left px-3 py-2 text-xs border-none bg-white cursor-pointer block ml-dropdown-item-${idx}"
          style="border-bottom:1px solid #F3F4F6;transition:background .1s">
          <div class="flex items-center justify-between gap-2">
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-900">${esc(p.code || 'S/C')}</span>
                <span class="font-medium text-gray-800 truncate">${esc(p.name)}</span>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              ${stockBadge}
              <span class="font-bold text-gray-700">${fmt(p.cost_price || 0)}</span>
            </div>
          </div>
        </button>
      `;
    }).join('');

    highlighted = -1;
    dropdown.style.display = 'block';

    dropdown.querySelectorAll(`.ml-dropdown-item-${idx}`).forEach((btn, i) => {
      btn.addEventListener('mouseenter', () => highlightItem(i));
      btn.addEventListener('mousedown', (ev) => ev.preventDefault());
      btn.addEventListener('click', () => selectProduct(filtered[i]));
    });
  };

  const highlightItem = (i) => {
    const items = dropdown.querySelectorAll(`.ml-dropdown-item-${idx}`);
    items.forEach(el => el.style.background = '');
    if (i >= 0 && i < items.length) {
      items[i].style.background = '#EEF4FF';
      items[i].scrollIntoView({ block: 'nearest' });
      highlighted = i;
    }
  };

  const selectProduct = (p) => {
    hiddenInput.value = p.id;
    searchInput.value = `${p.code} — ${p.name}`;
    dropdown.style.display = 'none';

    const costFld = document.getElementById(`ml-cost-${idx}`);
    const unitBadge = document.getElementById(`ml-unit-${idx}`);

    if (unitBadge) unitBadge.textContent = p.unit || p.unit_measure || 'UND';
    if (costFld && (!costFld.value || parseFloat(costFld.value) === 0)) {
      costFld.value = p.cost_price || 0;
    }

    updateFormTotals();

    setTimeout(() => {
      const qtyInp = document.getElementById(`ml-qty-${idx}`);
      qtyInp?.focus();
      qtyInp?.select();
    }, 50);
  };

  searchInput.addEventListener('input', () => {
    hiddenInput.value = '';
    const q = searchInput.value.trim().toLowerCase();
    if (!q) { dropdown.style.display = 'none'; return; }
    const filtered = products.filter(p => p.type === 'BIEN' && `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 30);
    renderDropdown(filtered);
  });

  searchInput.addEventListener('focus', () => {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = products.filter(p => p.type === 'BIEN' && (!q || `${p.name} ${p.code}`.toLowerCase().includes(q))).slice(0, 30);
    renderDropdown(filtered);
  });

  searchInput.addEventListener('keydown', (ev) => {
    const items = dropdown.querySelectorAll(`.ml-dropdown-item-${idx}`);
    if (ev.key === 'ArrowDown') { ev.preventDefault(); highlightItem(Math.min(highlighted + 1, items.length - 1)); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); highlightItem(Math.max(highlighted - 1, 0)); }
    else if (ev.key === 'Enter') {
      ev.preventDefault();
      const q = searchInput.value.trim().toLowerCase();
      const filtered = products.filter(p => p.type === 'BIEN' && `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 30);
      if (highlighted >= 0 && filtered[highlighted]) {
        selectProduct(filtered[highlighted]);
      } else if (filtered.length > 0) {
        selectProduct(filtered[0]);
      }
    } else if (ev.key === 'Escape') {
      dropdown.style.display = 'none';
    }
  });

  searchInput.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));
}

// Auxiliar para la barra de búsqueda rápida global en la cabecera del modal
function setupGlobalProductSearchInMovForm(products, originStockMap, isOutboundType, addLineToUI) {
  const input = document.getElementById('mf-prod-search-global');
  const dropdown = document.getElementById('mf-prod-results-global');
  if (!input || !dropdown) return;

  let highlighted = -1;

  const renderResults = (filtered) => {
    if (!filtered.length) {
      dropdown.innerHTML = '<div class="px-3 py-2 text-xs text-gray-400"><i class="fas fa-box-open mr-1"></i>Sin resultados</div>';
      dropdown.style.display = 'block';
      return;
    }

    const isOutbound = isOutboundType();
    dropdown.innerHTML = filtered.map((p, i) => {
      const available = originStockMap.get(p.id) || 0;
      const stockBadge = isOutbound ? `
        <span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${available > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}">
          Disp: ${fmtN(available)}
        </span>
      ` : '';

      return `
        <button type="button"
          class="w-full text-left px-3 py-2 text-xs border-none bg-white cursor-pointer block mf-gsr-row"
          style="border-bottom:1px solid #F3F4F6;transition:background .1s">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-900">${esc(p.code || 'S/C')}</span>
              <span class="font-medium text-gray-800 truncate">${esc(p.name)}</span>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              ${stockBadge}
              <span class="font-bold text-gray-700">${fmt(p.cost_price || 0)}</span>
            </div>
          </div>
        </button>
      `;
    }).join('');

    highlighted = -1;
    dropdown.style.display = 'block';

    dropdown.querySelectorAll('.mf-gsr-row').forEach((btn, i) => {
      btn.addEventListener('mouseenter', () => highlightItem(i));
      btn.addEventListener('mousedown', (ev) => ev.preventDefault());
      btn.addEventListener('click', () => selectProduct(filtered[i]));
    });
  };

  const highlightItem = (i) => {
    const items = dropdown.querySelectorAll('.mf-gsr-row');
    items.forEach(el => el.style.background = '');
    if (i >= 0 && i < items.length) {
      items[i].style.background = '#EEF4FF';
      items[i].scrollIntoView({ block: 'nearest' });
      highlighted = i;
    }
  };

  const selectProduct = (p) => {
    dropdown.style.display = 'none';
    input.value = '';

    addLineToUI({ product_id: p.id, unit_cost: p.cost_price || 0 });
  };

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.style.display = 'none'; return; }
    const filtered = products.filter(p => p.type === 'BIEN' && `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 30);
    renderResults(filtered);
  });

  input.addEventListener('keydown', (ev) => {
    const items = dropdown.querySelectorAll('.mf-gsr-row');
    if (ev.key === 'ArrowDown') { ev.preventDefault(); highlightItem(Math.min(highlighted + 1, items.length - 1)); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); highlightItem(Math.max(highlighted - 1, 0)); }
    else if (ev.key === 'Enter') {
      ev.preventDefault();
      const q = input.value.trim().toLowerCase();
      const filtered = products.filter(p => p.type === 'BIEN' && `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 30);
      if (highlighted >= 0 && filtered[highlighted]) {
        selectProduct(filtered[highlighted]);
      } else if (filtered.length > 0) {
        selectProduct(filtered[0]);
      }
    } else if (ev.key === 'Escape') {
      dropdown.style.display = 'none';
    }
  });

  input.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));
}

// ── Formulario de movimiento (Crear / Editar) ─────────────────────────────────
async function openMovForm(editData = null, ctx = {}, onDone = null) {
  const warehouses = ctx.warehouses || await API.getWarehouses(true);
  const products   = ctx.products   || await API.getProducts({ activeOnly: true });
  const accounts   = await API.getAccounts(true).catch(() => []);
  const thirdParties = await API.getTerceros({}).catch(() => []);
  const txTypes    = await API.getTxTypes().catch(() => []);
  const concepts   = await API.getInventoryConcepts({ activeOnly: true }).catch(() => []);

  const isEdit = !!(editData && editData.mov);
  const movRecord = isEdit ? editData.mov : null;
  const initialLines = isEdit ? (editData.lines || []) : [];

  let originStockMap = new Map<string, number>();

  async function loadOriginStock(whId) {
    originStockMap.clear();
    if (!whId) return;
    const stockRows = await API.getInventoryStock({ warehouseId: whId }).catch(() => []);
    for (const s of stockRows) {
      originStockMap.set(s.product_id, Number(s.qty_on_hand || 0));
    }
  }

  const isOutboundType = () => {
    const tp = getSelectVal('mf-type');
    return tp === 'SALIDA' || tp === 'TRASLADO' || tp === 'AJUSTE_NEGATIVO';
  };

  const getFilteredConcepts = (movType: string) => {
    if (movType === 'ENTRADA' || movType === 'AJUSTE_POSITIVO') {
      return concepts.filter((c: any) => c.type === 'ENTRADA' || c.type === 'AMBOS');
    }
    if (movType === 'SALIDA' || movType === 'AJUSTE_NEGATIVO') {
      return concepts.filter((c: any) => c.type === 'SALIDA' || c.type === 'AMBOS');
    }
    return concepts;
  };

  let lineCounter = 0;

  function updateFormTotals() {
    let totalQty  = 0;
    let totalCost = 0;

    const tbody = document.getElementById('mov-lines-body');
    if (!tbody) return;

    const isOutbound = isOutboundType();

    tbody.querySelectorAll('tr').forEach(tr => {
      const idxStr = tr.id.replace('mov-line-', '');
      const idx = parseInt(idxStr, 10);
      if (isNaN(idx)) return;

      const prodHidden = document.getElementById(`ml-prod-${idx}`);
      const qtyInput   = document.getElementById(`ml-qty-${idx}`);
      const costInput  = document.getElementById(`ml-cost-${idx}`);
      const stockBadge = document.getElementById(`ml-stock-${idx}`);

      const prodId = prodHidden?.value || '';
      const qty    = parseFloat(qtyInput?.value || '0');
      const cost   = parseFloat(costInput?.value || '0');
      const subtotal = qty * cost;

      const available = originStockMap.get(prodId) || 0;
      if (stockBadge) {
        if (prodId && isOutbound) {
          stockBadge.textContent = `Disp: ${fmtN(available)}`;
          stockBadge.className = `inline-block px-1.5 py-0.5 rounded text-[11px] font-bold border ${available > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`;
          stockBadge.style.display = '';
        } else {
          stockBadge.style.display = 'none';
        }
      }

      if (prodId && isOutbound && qty > available) {
        qtyInput?.classList.add('border-red-500', 'bg-red-50', 'text-red-700');
        qtyInput?.setAttribute('title', `Cantidad excede el stock disponible en bodega origen (${fmtN(available)})`);
      } else {
        qtyInput?.classList.remove('border-red-500', 'bg-red-50', 'text-red-700');
        qtyInput?.removeAttribute('title');
      }

      const subLabel = document.getElementById(`ml-subtotal-${idx}`);
      if (subLabel) subLabel.textContent = fmt(subtotal);

      if (!isNaN(qty))  totalQty  += qty;
      if (!isNaN(cost)) totalCost += subtotal;
    });

    const lblQty  = document.getElementById('mf-total-qty');
    const lblCost = document.getElementById('mf-total-cost');
    if (lblQty)  lblQty.textContent  = fmtN(totalQty);
    if (lblCost) lblCost.textContent = fmt(totalCost);
  }

  function addLineToUI(line = {}) {
    lineCounter++;
    const idx = lineCounter;
    const tbody = document.getElementById('mov-lines-body');
    if (!tbody) return;

    let initProdText = '';
    let initUnitText = 'UND';
    if (line.product_id) {
      const foundP = products.find(p => p.id === line.product_id) || line.expand?.product_id;
      if (foundP) {
        initProdText = `${foundP.code} — ${foundP.name}`;
        initUnitText = foundP.unit || foundP.unit_measure || 'UND';
      }
    }

    const tr = document.createElement('tr');
    tr.id = `mov-line-${idx}`;
    tr.innerHTML = `
      <td>
        <div class="relative min-w-[220px]">
          <input type="hidden" id="ml-prod-${idx}" value="${line.product_id || ''}">
          <input type="text" id="ml-prod-input-${idx}" class="form-input text-xs" autocomplete="off" placeholder="Buscar por código o nombre..." value="${esc(initProdText)}">
          <div id="ml-prod-dropdown-${idx}" class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto hidden text-xs"></div>
        </div>
        <div class="mt-1" id="ml-stock-${idx}" style="display:none"></div>
      </td>
      <td class="text-center align-middle">
        <span id="ml-unit-${idx}" class="inline-block px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 min-w-[45px]">${esc(initUnitText)}</span>
      </td>
      <td><input id="ml-qty-${idx}" type="number" min="0.0001" step="0.0001" class="form-input text-right ml-calc-input" style="min-width:90px" placeholder="0" value="${line.qty ?? ''}"></td>
      <td><input id="ml-cost-${idx}" type="number" min="0" step="0.01" class="form-input text-right ml-calc-input" style="min-width:110px" placeholder="0.00" value="${line.unit_cost ?? ''}"></td>
      <td class="text-right font-semibold align-middle text-gray-800" id="ml-subtotal-${idx}">$0.00</td>
      <td><input id="ml-notes-${idx}" class="form-input" style="min-width:120px" placeholder="Nota" value="${esc(line.notes || '')}"></td>
      <td class="text-center"><button type="button" class="btn btn-danger btn-sm" id="btn-del-line-${idx}"><i class="fas fa-times"></i></button></td>`;

    tbody.appendChild(tr);

    setupRowProductAutocomplete(idx, products, originStockMap, isOutboundType, updateFormTotals);

    document.getElementById(`ml-qty-${idx}`)?.addEventListener('input', updateFormTotals);
    document.getElementById(`ml-cost-${idx}`)?.addEventListener('input', updateFormTotals);

    document.getElementById(`btn-del-line-${idx}`)?.addEventListener('click', () => {
      tr.remove();
      updateFormTotals();
    });
  }

  const needsDest = () => getSelectVal('mf-type') === 'TRASLADO';
  const initialMovType = isEdit ? movRecord.mov_type : 'SALIDA';
  const initialConcepts = getFilteredConcepts(initialMovType);
  const modalTitle = isEdit ? `Editar Movimiento — ${esc(movRecord.number)}` : 'Nuevo Movimiento de Inventario';
  const saveBtnText = isEdit ? '<i class="fas fa-floppy-disk mr-1"></i> Actualizar Borrador' : '<i class="fas fa-floppy-disk mr-1"></i> Guardar Borrador';

  openModal(
    modalTitle,
    `<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div class="form-group">
        <label class="form-label">Tipo Movimiento <span style="color:#EF4444">*</span></label>
        <select id="mf-type" class="form-input">
          ${INV_MOV_TYPES.map(t => `<option value="${t.value}" ${isEdit && movRecord.mov_type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" id="concept-wrap" style="${initialMovType === 'TRASLADO' ? 'display:none' : ''}">
        <label class="form-label">Concepto de Inventario <span style="color:#EF4444">*</span></label>
        <select id="mf-concept-id" class="form-input">
          <option value="">— Seleccionar Concepto —</option>
          ${initialConcepts.map(c => `<option value="${esc(c.id)}" ${isEdit && movRecord.concept_id === c.id ? 'selected' : ''}>${esc(c.code)} - ${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha <span style="color:#EF4444">*</span></label>
        <input id="mf-date" type="date" class="form-input" value="${isEdit ? esc(movRecord.date) : todayStr()}">
      </div>
      <div class="form-group">
        <label class="form-label">Bodega Origen <span style="color:#EF4444">*</span></label>
        <select id="mf-wh" class="form-input">
          <option value="">— Seleccionar —</option>
          ${warehouses.map(w => `<option value="${esc(w.id)}" ${isEdit && movRecord.warehouse_id === w.id ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" id="dest-wh-row" style="${isEdit && movRecord.mov_type === 'TRASLADO' ? '' : 'display:none'}">
        <label class="form-label">Bodega Destino <span style="color:#EF4444">*</span></label>
        <select id="mf-dest-wh" class="form-input">
          <option value="">— Seleccionar —</option>
          ${warehouses.map(w => `<option value="${esc(w.id)}" ${isEdit && movRecord.dest_warehouse_id === w.id ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Notas / Observaciones</label>
        <input id="mf-notes" class="form-input" placeholder="Observaciones generales del movimiento" value="${isEdit ? esc(movRecord.notes || '') : ''}">
      </div>
      <div class="form-group md:col-span-3" id="posting-container" style="${initialMovType === 'TRASLADO' ? 'display:none' : ''}">
        <div class="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60">
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-xs text-blue-900 flex items-center gap-1.5">
              <i class="fas fa-file-invoice-dollar text-blue-700 text-sm"></i>
              Contabilización Automática Obligatoria
            </span>
            <span class="badge badge-blue text-[10px] uppercase font-mono">Partida Doble</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label class="block text-[11px] font-bold text-gray-700 mb-1">Tipo de Comprobante Contable <span class="text-red-500">*</span></label>
              <select id="mf-posting-tx-type" class="form-input text-xs">
                <option value="">— Seleccionar Tipo Comprobante —</option>
                ${txTypes.map((t: any) => `<option value="${esc(t.id)}">${esc(t.prefix || t.code || '')} - ${esc(t.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-700 mb-1">Cuenta Contable de Contrapartida <span class="text-red-500">*</span></label>
              <div id="mf-concept-account-badge" class="px-2.5 py-1.5 rounded bg-white border border-blue-200 font-mono text-xs font-semibold text-blue-900 flex items-center gap-1.5 min-h-[34px]">
                <i class="fas fa-link text-blue-500"></i> <span id="mf-concept-account-name">Selecciona un concepto</span>
              </div>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-700 mb-1">Tercero Asociado (Opcional)</label>
              <select id="mf-posting-third" class="form-input text-xs">
                <option value="">— Seleccionar Tercero —</option>
                ${thirdParties.map((t: any) => `<option value="${esc(t.id)}" ${isEdit && movRecord?.third_party_id === t.id ? 'selected' : ''}>${esc(t.name)} (${esc(t.doc_number || '')})</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección de Líneas con Buscador Rápido Global -->
    <div class="border rounded-xl overflow-hidden mb-3" style="border-color:#E5E7EB">
      <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div class="flex items-center gap-2 flex-1 min-w-[260px]">
          <span class="text-sm font-bold text-gray-800 flex-shrink-0"><i class="fas fa-boxes-stacked mr-1 text-blue-800"></i>Detalle Productos</span>
          <div class="relative flex-1 max-w-sm">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
            <input id="mf-prod-search-global" class="form-input pl-8 py-1 text-xs" autocomplete="off" placeholder="Búsqueda rápida por código o nombre (Enter agrega)...">
            <div id="mf-prod-results-global" class="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto hidden text-xs"></div>
          </div>
        </div>
        <button type="button" class="btn btn-outline btn-sm" id="btn-add-line"><i class="fas fa-plus mr-1"></i> Agregar Fila</button>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto (Búsqueda Teclado/Mouse)</th>
              <th class="text-center">Unidad</th>
              <th class="text-right">Cantidad</th>
              <th class="text-right">Costo Unit.</th>
              <th class="text-right">Subtotal</th>
              <th>Nota Línea</th>
              <th class="text-center">Acción</th>
            </tr>
          </thead>
          <tbody id="mov-lines-body"></tbody>
          <tfoot>
            <tr class="bg-blue-50/50 font-bold border-t border-gray-200 text-sm">
              <td colspan="2" class="text-right py-3 px-4 text-gray-700">TOTALES DEL BORRADOR:</td>
              <td class="text-right py-3 px-4 text-blue-900 text-base" id="mf-total-qty">0</td>
              <td></td>
              <td class="text-right py-3 px-4 text-emerald-700 text-base" id="mf-total-cost">$0.00</td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-mov">${saveBtnText}</button>`,
    true
  );

  setupGlobalProductSearchInMovForm(products, originStockMap, isOutboundType, addLineToUI);

  const initialWhId = isEdit ? movRecord.warehouse_id : getSelectVal('mf-wh');
  if (initialWhId) {
    await loadOriginStock(initialWhId);
  }

  document.getElementById('mf-wh')?.addEventListener('change', async function() {
    await loadOriginStock(this.value);
    updateFormTotals();
  });

  function updateDefaultTxType(forceReset: boolean = false) {
    const txTypeSelect = document.getElementById('mf-posting-tx-type') as HTMLSelectElement;
    if (!txTypeSelect) return;
    if (forceReset) txTypeSelect.value = '';
    if (txTypeSelect.value) return;

    const currentMovType = getSelectVal('mf-type');
    let matched: any = null;
    if (currentMovType === 'ENTRADA' || currentMovType === 'AJUSTE_POSITIVO') {
      matched = txTypes.find((t: any) =>
        (t.prefix || '').toUpperCase() === 'EI' ||
        (t.prefix || '').toUpperCase() === 'ENT' ||
        (t.code || '').toUpperCase() === 'EI' ||
        (t.name || '').toLowerCase().includes('entrada')
      );
    } else if (currentMovType === 'SALIDA' || currentMovType === 'AJUSTE_NEGATIVO') {
      matched = txTypes.find((t: any) =>
        (t.prefix || '').toUpperCase() === 'SI' ||
        (t.prefix || '').toUpperCase() === 'SAL' ||
        (t.code || '').toUpperCase() === 'SI' ||
        (t.name || '').toLowerCase().includes('salida')
      );
    }
    if (matched) {
      txTypeSelect.value = matched.id;
    } else if (txTypes.length > 0 && !txTypeSelect.value) {
      txTypeSelect.value = txTypes[0].id;
    }
  }

  function syncConceptAccountUI() {
    const conceptId = getSelectVal('mf-concept-id');
    const badgeName = document.getElementById('mf-concept-account-name');
    if (!badgeName) return;

    if (!conceptId) {
      badgeName.textContent = 'Selecciona un concepto';
      return;
    }

    const concept = concepts.find((c: any) => c.id === conceptId);
    if (!concept) {
      badgeName.textContent = 'Selecciona un concepto';
      return;
    }

    const acc = concept.expand?.account_id || accounts.find((a: any) => a.id === concept.account_id);
    if (acc) {
      badgeName.textContent = `${acc.code} - ${acc.name}`;
    } else {
      badgeName.textContent = 'Cuenta no configurada';
    }
  }

  function updateConceptsDropdown(movType: string) {
    const conceptSelect = document.getElementById('mf-concept-id') as HTMLSelectElement;
    if (!conceptSelect) return;

    const filtered = getFilteredConcepts(movType);
    const currentVal = conceptSelect.value;

    conceptSelect.innerHTML = `<option value="">— Seleccionar Concepto —</option>` +
      filtered.map((c: any) => `<option value="${esc(c.id)}" ${currentVal === c.id || (isEdit && movRecord?.concept_id === c.id) ? 'selected' : ''}>${esc(c.code)} - ${esc(c.name)}</option>`).join('');

    syncConceptAccountUI();
  }

  document.getElementById('mf-concept-id')?.addEventListener('change', syncConceptAccountUI);

  document.getElementById('mf-type')?.addEventListener('change', () => {
    const currentType = getSelectVal('mf-type');
    const destRow = document.getElementById('dest-wh-row');
    const conceptWrap = document.getElementById('concept-wrap');
    const postingContainer = document.getElementById('posting-container');

    if (destRow) destRow.style.display = needsDest() ? '' : 'none';
    if (conceptWrap) conceptWrap.style.display = currentType === 'TRASLADO' ? 'none' : '';
    if (postingContainer) postingContainer.style.display = currentType === 'TRASLADO' ? 'none' : '';

    updateConceptsDropdown(currentType);
    updateDefaultTxType(true);
    updateFormTotals();
  });

  updateDefaultTxType();
  syncConceptAccountUI();

  document.getElementById('btn-add-line')?.addEventListener('click', () => addLineToUI());

  if (initialLines.length > 0) {
    initialLines.forEach(l => addLineToUI(l));
  } else {
    addLineToUI();
  }

  updateFormTotals();

  document.getElementById('btn-save-mov')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-save-mov');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...'; }
    try {
      const movType  = getSelectVal('mf-type');
      const date     = getInputVal('mf-date');
      const whId     = getSelectVal('mf-wh');
      const destWhId = getSelectVal('mf-dest-wh');
      const notes    = getInputVal('mf-notes');
      const conceptId = getSelectVal('mf-concept-id');
      const postingThirdId  = getSelectVal('mf-posting-third') || null;
      const postingTxTypeId = getSelectVal('mf-posting-tx-type') || null;

      // 1. Validaciones campos obligatorios de cabecera
      if (!movType)  return showToast('Selecciona el tipo de movimiento', 'warning');
      if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) return showToast('La fecha es obligatoria y debe ser válida (AAAA-MM-DD)', 'warning');
      if (!whId)     return showToast('Selecciona la bodega origen', 'warning');

      if (movType === 'TRASLADO') {
        if (!destWhId) return showToast('Selecciona la bodega destino para el traslado', 'warning');
        if (destWhId === whId) return showToast('La bodega destino debe ser diferente a la bodega origen', 'warning');
      } else {
        if (!conceptId) {
          return showToast('El selector de conceptos es obligatorio para entradas y salidas de inventario.', 'warning');
        }
        const selectedConcept = concepts.find((c: any) => c.id === conceptId);
        if (!selectedConcept) {
          return showToast('El concepto seleccionado no es válido o está inactivo', 'warning');
        }
        const conceptAcc = selectedConcept.expand?.account_id || accounts.find((a: any) => a.id === selectedConcept.account_id);
        if (!conceptAcc || !conceptAcc.id) {
          return showToast(`El concepto "${selectedConcept.name}" no posee una cuenta contable de contrapartida válida asignada.`, 'warning');
        }
        if (!postingTxTypeId) {
          return showToast('Selecciona el Tipo de Comprobante Contable para la contabilización obligatoria.', 'warning');
        }
      }

      // 2. Extraer y validar detalle de líneas de producto
      const linesData = [];
      let totalQty = 0;
      let totalCost = 0;

      let lineIdx = 1;
      while (true) {
        const prodHidden = document.getElementById(`ml-prod-${lineIdx}`);
        if (!prodHidden) { lineIdx++; if (lineIdx > lineCounter + 5) break; continue; }
        const prodId = prodHidden.value;
        const qty    = parseFloat(getInputVal(`ml-qty-${lineIdx}`)  || '0');
        const cost   = parseFloat(getInputVal(`ml-cost-${lineIdx}`) || '0');
        const lnote  = getInputVal(`ml-notes-${lineIdx}`) || '';

        if (prodId || qty > 0) {
          if (!prodId) return showToast(`Fila #${linesData.length + 1}: Selecciona un producto válido`, 'warning');
          if (isNaN(qty) || qty <= 0) return showToast(`Fila #${linesData.length + 1}: La cantidad debe ser mayor a cero (>0)`, 'warning');
          if (isNaN(cost) || cost < 0) return showToast(`Fila #${linesData.length + 1}: El costo unitario debe ser mayor o igual a cero (>=0)`, 'warning');

          const subtotal = qty * cost;
          totalQty += qty;
          totalCost += subtotal;
          linesData.push({ product_id: prodId, qty, unit_cost: cost || 0, notes: lnote, line_order: linesData.length + 1 });
        }
        lineIdx++;
        if (lineIdx > lineCounter + 2) break;
      }

      if (!linesData.length) return showToast('Agrega al menos un producto con cantidad válida (>0)', 'warning');

      if (movType !== 'TRASLADO') {
        if (totalCost <= 0) {
          return showToast('El costo total del movimiento debe ser mayor a $0.00 para generar la transacción contable.', 'warning');
        }

        // 3. Validar disponibilidad de cuenta de inventario para cada producto
        const postableAccountIds = new Set(accounts.filter((a: any) => a.active !== false).map((a: any) => a.id));
        const fallbackAccount = accounts.find((a: any) => a.code.startsWith('1435') || a.code.startsWith('14'));

        for (const line of linesData) {
          const prod = products.find((p: any) => p.id === line.product_id);
          const hasAcc = prod?.inventory_account_id && postableAccountIds.has(prod.inventory_account_id);
          if (!hasAcc && !fallbackAccount) {
            return showToast(`El producto "${prod?.name || line.product_id}" no tiene cuenta de inventario y no existe cuenta 1435 en el plan de cuentas.`, 'error');
          }
        }
      }

      if (movType === 'SALIDA' || movType === 'TRASLADO' || movType === 'AJUSTE_NEGATIVO') {
        await API.validateOutgoingStock(whId, linesData, movType);
      }

      const movPayload: any = {
        mov_type: movType,
        date,
        warehouse_id: whId,
        dest_warehouse_id: destWhId || null,
        concept_id: conceptId || null,
        notes,
        status: 'draft',
        total_qty: totalQty,
        total_cost: totalCost,
      };

      let createdMov: any = null;

      if (isEdit) {
        await API.updateInventoryMovement(movRecord.id, movPayload, linesData);
        showToast(`Movimiento ${movRecord.number} actualizado correctamente.`, 'success');
      } else {
        const number = await API.getNextInventoryMovementNumber(date, movType);
        movPayload.number = number;

        createdMov = await pb.create('inventory_movements', movPayload);
        for (const line of linesData) {
          await pb.create('inventory_movement_lines', { movement_id: createdMov.id, ...line });
        }
        await API.logAudit('CREATE', 'InventoryMovement', createdMov.id, `${movType} — ${number}`);
        showToast(`Movimiento ${number} creado en borrador exitosamente.`, 'success');
      }

      const targetMovId = isEdit ? movRecord.id : createdMov?.id;
      if (movType !== 'TRASLADO' && conceptId && targetMovId) {
        try {
          showToast('Generando asiento contable automático obligatorio...', 'info');
          const conceptObj = concepts.find((c: any) => c.id === conceptId);
          const counterpartAccId = conceptObj?.account_id || null;
          await API.createInventoryMovementTransaction(targetMovId, counterpartAccId, postingThirdId, postingTxTypeId);
          showToast('Comprobante contable automático generado exitosamente.', 'success');
        } catch (postErr: any) {
          showToast(`Movimiento guardado, pero no se pudo contabilizar: ${postErr.message}`, 'warning');
        }
      }

      closeModal();
      if (onDone) onDone();
    } catch (err: any) {
      showToast(err.message || 'No se pudo guardar', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = saveBtnText; }
    }
  });
}

// ── Modal de Gestión de Conceptos de Inventario ────────────────────────────────
async function openInventoryConceptsModal(onCloseCallback?: () => void) {
  try {
    const [concepts, accounts] = await Promise.all([
      API.getInventoryConcepts({ activeOnly: false }),
      API.getAccounts(true),
    ]);

    const renderConceptsList = (items: any[]) => {
      if (!items.length) {
        return `<tr><td colspan="6" class="text-center py-8 text-gray-400"><i class="fas fa-tags mr-2"></i>No hay conceptos registrados. Crea el primero.</td></tr>`;
      }
      return items.map(c => {
        const acc = c.expand?.account_id || accounts.find((a: any) => a.id === c.account_id);
        const typeBadge = c.type === 'ENTRADA' ? '<span class="badge badge-green">Entrada</span>'
          : c.type === 'SALIDA' ? '<span class="badge badge-red">Salida</span>'
          : '<span class="badge badge-blue">Ambos</span>';
        const statusBadge = c.active !== false ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>';

        return `<tr>
          <td><span class="font-mono font-bold text-xs text-blue-900">${esc(c.code)}</span></td>
          <td class="font-semibold text-gray-800">${esc(c.name)}</td>
          <td>${typeBadge}</td>
          <td>
            ${acc ? `<span class="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200" title="${esc(acc.name)}">${esc(acc.code)} - ${esc(acc.name)}</span>` : '<span class="text-red-500 text-xs">Sin cuenta</span>'}
          </td>
          <td>${statusBadge}</td>
          <td class="text-center">
            <div class="flex justify-center gap-1">
              <button class="btn btn-outline btn-sm text-blue-600 border-blue-200 hover:bg-blue-50" title="Editar" onclick="window._editInventoryConcept('${esc(c.id)}')">
                <i class="fas fa-pen-to-square"></i>
              </button>
              <button class="btn btn-outline btn-sm ${c.active !== false ? 'text-amber-600 border-amber-200 hover:bg-amber-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}" title="${c.active !== false ? 'Desactivar' : 'Activar'}" onclick="window._toggleInventoryConceptStatus('${esc(c.id)}')">
                <i class="fas ${c.active !== false ? 'fa-ban' : 'fa-check'}"></i>
              </button>
            </div>
          </td>
        </tr>`;
      }).join('');
    };

    const bodyHtml = `
      <div class="space-y-4 text-left">
        <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div>
            <h4 class="font-bold text-sm text-gray-800 flex items-center gap-2">
              <i class="fas fa-tags text-indigo-600"></i> Conceptos de Inventario y Cuentas Contables
            </h4>
            <p class="text-xs text-gray-500">Configuración de motivos de entrada y salida con su contrapartida contable asignada.</p>
          </div>
          ${can('canWrite') ? `
            <button class="btn btn-primary text-xs px-3 py-1.5" id="btn-add-concept">
              <i class="fas fa-plus mr-1"></i> Nuevo Concepto
            </button>
          ` : ''}
        </div>

        <div class="border rounded-xl overflow-hidden" style="border-color:#F0F0F0">
          <table class="data-table" id="concepts-table">
            <thead>
              <tr class="bg-gray-100 text-gray-700">
                <th>Código</th>
                <th>Nombre del Concepto</th>
                <th>Aplica a</th>
                <th>Cuenta Contable (PUC)</th>
                <th>Estado</th>
                <th class="text-center">Acción</th>
              </tr>
            </thead>
            <tbody id="concepts-tbody">
              ${renderConceptsList(concepts)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    openModal(
      'Configuración de Conceptos de Inventario',
      bodyHtml,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );

    (window as any)._editInventoryConcept = (id: string) => {
      const c = concepts.find(item => item.id === id);
      if (c) openConceptFormModal(c, accounts, async () => {
        closeModal();
        openInventoryConceptsModal(onCloseCallback);
      });
    };

    (window as any)._toggleInventoryConceptStatus = async (id: string) => {
      const c = concepts.find(item => item.id === id);
      if (!c) return;
      try {
        await API.updateInventoryConcept(id, { active: !c.active });
        showToast(`Concepto ${!c.active ? 'activado' : 'desactivado'} correctamente`, 'success');
        closeModal();
        openInventoryConceptsModal(onCloseCallback);
      } catch (err: any) {
        showToast(err.message || 'Error al cambiar estado', 'error');
      }
    };

    document.getElementById('btn-add-concept')?.addEventListener('click', () => {
      openConceptFormModal(null, accounts, async () => {
        closeModal();
        openInventoryConceptsModal(onCloseCallback);
      });
    });

  } catch (err: any) {
    showToast(err.message || 'Error al cargar conceptos', 'error');
  }
}

function openConceptFormModal(concept: any = null, accounts: any[] = [], onSaved?: () => void) {
  const isEdit = !!concept;
  const modalTitle = isEdit ? `Editar Concepto — ${esc(concept.code)}` : 'Nuevo Concepto de Inventario';

  const bodyHtml = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      <div class="form-group">
        <label class="form-label">Código <span class="text-red-500">*</span></label>
        <input id="cf-code" class="form-input font-mono uppercase" placeholder="Ej: CON-SAL-001" value="${isEdit ? esc(concept.code) : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de Aplicación <span class="text-red-500">*</span></label>
        <select id="cf-type" class="form-input">
          <option value="SALIDA" ${isEdit && concept.type === 'SALIDA' ? 'selected' : ''}>Salida de Inventario</option>
          <option value="ENTRADA" ${isEdit && concept.type === 'ENTRADA' ? 'selected' : ''}>Entrada de Inventario</option>
          <option value="AMBOS" ${isEdit && concept.type === 'AMBOS' ? 'selected' : ''}>Ambos (Entrada y Salida)</option>
        </select>
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Nombre del Concepto <span class="text-red-500">*</span></label>
        <input id="cf-name" class="form-input" placeholder="Ej: Baja por Deterioro / Avería de Mercancía" value="${isEdit ? esc(concept.name) : ''}">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Cuenta Contable de Contrapartida (PUC) <span class="text-red-500">*</span></label>
        <select id="cf-account" class="form-input font-mono text-xs">
          <option value="">— Seleccionar Cuenta Contable —</option>
          ${accounts.map(a => `<option value="${esc(a.id)}" ${isEdit && concept.account_id === a.id ? 'selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}
        </select>
        <span class="text-[11px] text-gray-500 mt-1 block">Cuenta contable que recibirá la contrapartida al registrar el movimiento con este concepto.</span>
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Descripción / Justificación</label>
        <input id="cf-desc" class="form-input" placeholder="Descripción adicional del motivo de inventario" value="${isEdit ? esc(concept.description || '') : ''}">
      </div>
      <div class="form-group flex items-center gap-2">
        <input type="checkbox" id="cf-active" class="form-checkbox h-4 w-4 text-blue-600 rounded" ${!isEdit || concept.active !== false ? 'checked' : ''}>
        <label for="cf-active" class="font-bold text-xs text-gray-700 cursor-pointer select-none">Concepto Activo</label>
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-concept"><i class="fas fa-floppy-disk mr-1"></i> Guardar Concepto</button>
  `;

  openModal(modalTitle, bodyHtml, footerHtml, true);

  document.getElementById('btn-save-concept')?.addEventListener('click', async () => {
    const code = (getInputVal('cf-code') || '').trim().toUpperCase();
    const name = (getInputVal('cf-name') || '').trim();
    const type = getSelectVal('cf-type');
    const account_id = getSelectVal('cf-account');
    const description = (getInputVal('cf-desc') || '').trim();
    const active = (document.getElementById('cf-active') as HTMLInputElement)?.checked ?? true;

    if (!code) return showToast('El código es obligatorio', 'warning');
    if (!name) return showToast('El nombre del concepto es obligatorio', 'warning');
    if (!type) return showToast('Selecciona el tipo de aplicación', 'warning');
    if (!account_id) return showToast('Selecciona la cuenta contable de contrapartida', 'warning');

    const payload = { code, name, type, account_id, description, active };

    try {
      if (isEdit) {
        await API.updateInventoryConcept(concept.id, payload);
        showToast('Concepto actualizado exitosamente', 'success');
      } else {
        await API.createInventoryConcept(payload);
        showToast('Concepto creado exitosamente', 'success');
      }
      closeModal();
      if (onSaved) onSaved();
    } catch (err: any) {
      showToast(err.message || 'Error al guardar el concepto', 'error');
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: BODEGAS
// ══════════════════════════════════════════════════════════════════════════════
async function renderBodegasTab(c, ctx = {}) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando bodegas...</div>`;
  try {
    const [warehouses, branches] = await Promise.all([
      API.getWarehouses(false),
      pb.listAll('branches', { filter: 'active=true', ignoreBranch: true }).catch(() => [])
    ]);
    ctx.warehouses   = warehouses;

    c.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm" style="color:#6B7280">${warehouses.length} bodega(s) registrada(s).</p>
        ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-wh"><i class="fas fa-plus"></i> Nueva Bodega</button>' : ''}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="wh-cards">
        ${warehouses.length ? warehouses.map(w => whCard(w, branches)).join('') : `<div class="md:col-span-3 text-center py-10" style="color:#9CA3AF"><i class="fas fa-warehouse mr-2"></i>No hay bodegas. Crea la primera.</div>`}
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

function whCard(w, branches = []) {
  const branch = branches.find(b => b.id === w.branch_id);
  const branchBadge = branch 
    ? `<span class="badge badge-indigo text-xs mt-1" style="background:#EEF2FF;color:#4F46E5;border:1px solid #E0E7FF"><i class="fas fa-building mr-1"></i>${esc(branch.code)} - ${esc(branch.name)}</span>` 
    : `<span class="badge badge-gray text-xs mt-1" style="background:#F3F4F6;color:#4B5563;border:1px solid #E5E7EB"><i class="fas fa-globe mr-1"></i>Global / Todas</span>`;

  let consignmentBadge = '';
  if (w.is_consignment) {
    if (w.consignment_type === 'INBOUND') {
      consignmentBadge = `<span class="badge text-xs mt-1" style="background:#ECFDF5;color:#059669;border:1px solid #A7F3D0"><i class="fas fa-handshake mr-1"></i>Consignación Proveedor</span>`;
    } else if (w.consignment_type === 'OUTBOUND') {
      consignmentBadge = `<span class="badge text-xs mt-1" style="background:#F5F3FF;color:#7C3AED;border:1px solid #DDD6FE"><i class="fas fa-truck-ramp-box mr-1"></i>Consignación Cliente</span>`;
    }
  }

  return `<div class="bg-white rounded-2xl border p-4 flex flex-col justify-between" style="border-color:#F0F0F0">
    <div>
      <div class="flex items-start justify-between mb-2">
        <div>
          <p class="font-mono text-xs font-semibold mb-1" style="color:#1A4B8C">${esc(w.code)}</p>
          <h4 class="font-bold text-sm" style="color:#0D2137">${esc(w.name)}</h4>
        </div>
        ${w.active ? '<span class="badge badge-green">Activa</span>' : '<span class="badge badge-gray">Inactiva</span>'}
      </div>
      <div class="mb-3 flex flex-wrap gap-1">${branchBadge} ${consignmentBadge}</div>
      ${w.address ? `<p class="text-xs mb-2" style="color:#6B7280"><i class="fas fa-location-dot mr-1"></i>${esc(w.address)}</p>` : ''}
      ${w.notes   ? `<p class="text-xs mb-2" style="color:#9CA3AF">${esc(w.notes)}</p>` : ''}
    </div>
    ${can('canWrite') ? `<div class="flex gap-2 mt-3 pt-2 border-t border-[#FAFAFA]">
      <button class="btn btn-outline btn-sm flex-1 btn-edit-wh" data-id="${esc(w.id)}"><i class="fas fa-pen"></i> Editar</button>
      <button class="btn btn-outline btn-sm btn-toggle-wh" data-id="${esc(w.id)}" title="${w.active ? 'Desactivar' : 'Activar'}">
        <i class="fas ${w.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i></button>
    </div>` : ''}
  </div>`;
}

async function openWarehouseForm(row = null, onDone = null) {
  let branches = [];
  let parties = [];
  try {
    [branches, parties] = await Promise.all([
      pb.listAll('branches', { filter: 'active=true', ignoreBranch: true }).catch(() => []),
      pb.listAll('third_parties', { filter: 'active=true' }).catch(() => [])
    ]);
  } catch (err) {
    console.warn('Error al cargar datos:', err);
  }

  const suppliers = parties.filter((p: any) => p.type === 'PROVEEDOR');
  const clients = parties.filter((p: any) => p.type === 'CLIENTE' || p.type === 'EMPLEADO');

  const branchOptions = `<option value="">— Ninguna (Global) —</option>` +
    branches.map(b => `<option value="${esc(b.id)}"${row?.branch_id === b.id ? ' selected' : ''}>${esc(b.code)} - ${esc(b.name)}</option>`).join('');

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
        <label class="form-label">Sucursal <span style="font-size:11px;color:#9CA3AF;font-weight:400">— opcional</span></label>
        <select id="wf-branch" class="form-input">
          ${branchOptions}
        </select>
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

      <!-- Consignment Fields -->
      <div class="form-group md:col-span-2 border-t pt-3 mt-2" style="border-color:#F0F0F0">
        <label class="inline-flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
          <input type="checkbox" id="wf-is-consignment" class="rounded text-violet-600 focus:ring-violet-500" ${row?.is_consignment ? 'checked' : ''}>
          <span>¿Es bodega de consignación?</span>
        </label>
      </div>
      <div class="form-group" id="wf-cons-type-group" style="display:none;">
        <label class="form-label text-xs">Tipo de Consignación</label>
        <select id="wf-consignment-type" class="form-input text-xs">
          <option value="">— Seleccionar Tipo —</option>
          <option value="INBOUND" ${row?.consignment_type === 'INBOUND' ? 'selected' : ''}>Inbound (Recibido de Proveedor)</option>
          <option value="OUTBOUND" ${row?.consignment_type === 'OUTBOUND' ? 'selected' : ''}>Outbound (Entregado a Cliente)</option>
        </select>
      </div>
      <div class="form-group" id="wf-cons-party-group" style="display:none;">
        <label class="form-label text-xs" id="wf-cons-party-label">Tercero Relacionado</label>
        <select id="wf-linked-party" class="form-input text-xs">
          <option value="">— Seleccionar Tercero —</option>
        </select>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-wh"><i class="fas fa-floppy-disk"></i> Guardar</button>`,
    false
  );

  const syncWarehouseConsignment = () => {
    const isCons = (document.getElementById('wf-is-consignment') as HTMLInputElement)?.checked;
    const typeGrp = document.getElementById('wf-cons-type-group') as HTMLDivElement;
    const partyGrp = document.getElementById('wf-cons-party-group') as HTMLDivElement;
    if (typeGrp) typeGrp.style.display = isCons ? 'block' : 'none';
    if (partyGrp) partyGrp.style.display = isCons ? 'block' : 'none';
  };

  const populateThirdParties = () => {
    const typeVal = (document.getElementById('wf-consignment-type') as HTMLSelectElement)?.value;
    const partySel = document.getElementById('wf-linked-party') as HTMLSelectElement;
    const labelEl = document.getElementById('wf-cons-party-label') as HTMLLabelElement;
    if (!partySel) return;

    partySel.innerHTML = `<option value="">— Seleccionar Tercero —</option>`;
    if (typeVal === 'INBOUND') {
      if (labelEl) labelEl.textContent = 'Proveedor';
      suppliers.forEach(s => {
        partySel.innerHTML += `<option value="${esc(s.id)}" ${row?.linked_third_party_id === s.id ? 'selected' : ''}>${esc(s.name)}</option>`;
      });
    } else if (typeVal === 'OUTBOUND') {
      if (labelEl) labelEl.textContent = 'Cliente / Vendedor';
      clients.forEach(c => {
        partySel.innerHTML += `<option value="${esc(c.id)}" ${row?.linked_third_party_id === c.id ? 'selected' : ''}>${esc(c.name)}</option>`;
      });
    }
  };

  document.getElementById('wf-is-consignment')?.addEventListener('change', () => {
    syncWarehouseConsignment();
    populateThirdParties();
  });
  document.getElementById('wf-consignment-type')?.addEventListener('change', populateThirdParties);
  
  syncWarehouseConsignment();
  populateThirdParties();

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

      const isCons = (document.getElementById('wf-is-consignment') as HTMLInputElement)?.checked || false;
      const payload = {
        code, name,
        address: getInputVal('wf-address').trim(),
        notes:   getInputVal('wf-notes').trim(),
        active:  getSelectVal('wf-active') === 'true',
        branch_id: getSelectVal('wf-branch') || null,
        is_consignment: isCons,
        consignment_type: isCons ? getSelectVal('wf-consignment-type') || null : null,
        linked_third_party_id: isCons ? getSelectVal('wf-linked-party') || null : null,
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
          <div class="form-group md:col-span-2 relative">
            <label class="form-label font-bold text-xs">Producto / Referencia <span style="color:#EF4444">*</span></label>
            <input type="hidden" id="kd-prod" value="">
            <input type="text" id="kd-prod-search" class="form-input w-full text-xs" placeholder="🔍 Escribe para buscar por código o nombre..." autocomplete="off">
            <div id="kd-prod-results" class="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto max-h-60 z-50" style="display:none"></div>
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

    const initKardexProductSearch = () => {
      const searchInput = document.getElementById('kd-prod-search') as HTMLInputElement;
      const hiddenInput = document.getElementById('kd-prod') as HTMLInputElement;
      const resultsDiv = document.getElementById('kd-prod-results') as HTMLDivElement;
      if (!searchInput || !hiddenInput || !resultsDiv) return;

      let highlightedIdx = -1;
      let currentFiltered: any[] = [];

      const renderResults = (filtered: any[]) => {
        currentFiltered = filtered;
        if (!filtered.length) {
          resultsDiv.innerHTML = '<div class="p-3 text-xs text-gray-400 text-center"><i class="fas fa-box-open mr-1"></i>Sin resultados</div>';
          return;
        }

        resultsDiv.innerHTML = filtered.map((p, i) => `
          <button type="button"
            class="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-none bg-white cursor-pointer block text-gray-800 transition-colors kd-prod-row"
            style="border-bottom:1px solid #F3F4F6; text-align:left;"
            data-index="${i}">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[10px] text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-semibold">[${esc(p.code)}]</span>
              <span class="font-semibold truncate">${esc(p.name)}</span>
            </div>
          </button>
        `).join('');

        highlightedIdx = -1;

        resultsDiv.querySelectorAll('.kd-prod-row').forEach(row => {
          row.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const idx = parseInt(row.getAttribute('data-index') || '0');
            selectProduct(currentFiltered[idx]);
          });
        });
      };

      const selectProduct = (prod: any) => {
        searchInput.value = `${prod.code} — ${prod.name}`;
        hiddenInput.value = prod.id;
        resultsDiv.style.display = 'none';
        highlightedIdx = -1;
      };

      const highlightRow = (idx: number) => {
        const rows = resultsDiv.querySelectorAll('.kd-prod-row');
        rows.forEach((row: any) => {
          row.style.background = '';
        });
        if (idx >= 0 && idx < rows.length) {
          (rows[idx] as any).style.background = '#EEF4FF';
          (rows[idx] as any).scrollIntoView({ block: 'nearest' });
        }
      };

      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) {
          hiddenInput.value = '';
          resultsDiv.style.display = 'none';
          return;
        }

        const filtered = goods.filter((p: any) => 
          `${p.name} ${p.code}`.toLowerCase().includes(q)
        ).slice(0, 30);

        renderResults(filtered);
        resultsDiv.style.display = 'block';
      });

      searchInput.addEventListener('focus', () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q) {
          const filtered = goods.filter((p: any) => 
            `${p.name} ${p.code}`.toLowerCase().includes(q)
          ).slice(0, 30);
          renderResults(filtered);
          resultsDiv.style.display = 'block';
        }
      });

      document.addEventListener('click', (e) => {
        if (e.target !== searchInput && e.target !== resultsDiv && !resultsDiv.contains(e.target as Node)) {
          resultsDiv.style.display = 'none';
        }
      });

      searchInput.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (resultsDiv.style.display === 'none') return;

        const rows = resultsDiv.querySelectorAll('.kd-prod-row');
        if (!rows.length) return;

        if (ev.key === 'ArrowDown') {
          ev.preventDefault();
          highlightedIdx = (highlightedIdx + 1) % rows.length;
          highlightRow(highlightedIdx);
        } else if (ev.key === 'ArrowUp') {
          ev.preventDefault();
          highlightedIdx = (highlightedIdx - 1 + rows.length) % rows.length;
          highlightRow(highlightedIdx);
        } else if (ev.key === 'Enter') {
          ev.preventDefault();
          if (highlightedIdx >= 0 && highlightedIdx < currentFiltered.length) {
            selectProduct(currentFiltered[highlightedIdx]);
          }
        } else if (ev.key === 'Escape') {
          resultsDiv.style.display = 'none';
          searchInput.blur();
        }
      });
    };

    initKardexProductSearch();

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
            totalBal: runningTotal,
            txId: mov.tx_id || '',
            movId: mov.id
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
                          <td class="font-mono font-semibold">
                            ${row.movId ? `
                              <a href="#" onclick="event.preventDefault(); window.viewMovDetail('${esc(row.movId)}');" 
                                 class="hover:text-blue-800 hover:underline inline-flex items-center gap-1" 
                                 style="color:#1A4B8C; font-weight:700;"
                                 title="Ver detalle del movimiento de inventario">
                                <i class="fas fa-box text-[10px] opacity-75"></i>
                                ${esc(row.docNumber)}
                              </a>
                            ` : esc(row.docNumber)}
                            ${row.txId ? `
                              <a href="#" onclick="event.preventDefault(); event.stopPropagation(); window.openAuxTxDetailInReport('${esc(row.txId)}');"
                                 class="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 inline-flex items-center gap-1"
                                 style="text-decoration:none;"
                                 title="Ver comprobante contable">
                                <i class="fas fa-book text-[9px]"></i>
                                Comp.
                              </a>
                            ` : ''}
                          </td>
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
      const prodSel = document.getElementById('kd-prod') as HTMLInputElement;
      const prodSearch = document.getElementById('kd-prod-search') as HTMLInputElement;
      const whSel = document.getElementById('kd-wh') as HTMLSelectElement;
      const startFld = document.getElementById('kd-date-start') as HTMLInputElement;
      const endFld = document.getElementById('kd-date-end') as HTMLInputElement;
      
      if (prodSel) prodSel.value = '';
      if (prodSearch) prodSearch.value = '';
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
              <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha de Corte <span class="text-blue-600">(Opcional)</span></label>
              <input type="date" id="rep-gen-date" class="form-input text-xs w-full" value="${todayStr()}">
            </div>
            <div>
              <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Costo a Reportar</label>
              <select id="rep-gen-cost" class="form-input text-xs w-full">
                <option value="promedio">Costo Promedio (Kardex a Fecha)</option>
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
            <div class="flex items-center gap-2">
              <input type="checkbox" id="rep-conteo-only-mov-stock" class="w-4 h-4 text-blue-600 rounded">
              <label for="rep-conteo-only-mov-stock" class="text-xs text-gray-600">Listar solo con movimiento o saldo</label>
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

        <!-- Tarjeta 5: Alertas de Stock Mínimo y Máximo (Reposición) -->
        <div class="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200" style="border-color:#E5E7EB">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600">
              <i class="fas fa-triangle-exclamation text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-gray-800">Alertas de Stock Mínimo y Máximo</h4>
              <p class="text-xs text-gray-400">Control de reposición y sobreabastecimiento</p>
            </div>
          </div>
          <div class="space-y-3 mb-4">
            <div>
              <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bodega (Opcional)</label>
              <select id="rep-alert-wh" class="form-input text-xs w-full">
                <option value="">Todas las bodegas (Consolidado)</option>
                ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Filtrar Alerta</label>
              <select id="rep-alert-type" class="form-input text-xs w-full">
                <option value="">Todos los desvíos (Bajo mínimo y Sobre máximo)</option>
                <option value="bajo_min">Solo bajo mínimo (Reposición requerida)</option>
                <option value="sobre_max">Solo sobre máximo (Sobreabastecido)</option>
              </select>
            </div>
          </div>
          <div class="flex gap-2 justify-end">
            <button class="btn btn-outline py-2 text-xs" onclick="window._printReport('alertas')"><i class="fas fa-print mr-1"></i>Imprimir</button>
            <button class="btn btn-primary py-2 text-xs" onclick="window._exportReport('alertas')"><i class="fas fa-file-excel mr-1"></i>Exportar</button>
          </div>
        </div>

        <!-- Tarjeta 6: Análisis de Rotación de Inventarios -->
        <div class="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all duration-200" style="border-color:#E5E7EB">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
              <i class="fas fa-arrows-spin text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-gray-800">Análisis de Rotación de Inventarios</h4>
              <p class="text-xs text-gray-400">Indicadores de rotación y días de inventario</p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-6">Calcula la velocidad con la que se mueven las existencias. Evalúa la rotación y los días de permanencia por producto.</p>
          <div class="flex gap-2 justify-end">
            <button class="btn btn-primary py-2 text-xs w-full md:w-auto" onclick="window._openRotacionModal()"><i class="fas fa-chart-line mr-1"></i>Iniciar Análisis de Rotación</button>
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

      <!-- BOTÓN DE IMPORTACIÓN MASIVA DE INVENTARIOS -->
      ${['superadmin', 'admin'].includes(_pb().currentUser?.role) ? `
        <div class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-inner flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-600 text-white flex-shrink-0">
              <i class="fas fa-file-import text-xl"></i>
            </div>
            <div>
              <h4 class="font-bold text-amber-900">Carga Masiva de Saldos Iniciales / Entradas (Excel)</h4>
              <p class="text-xs text-amber-700 mt-1">Carga cantidades y costos unitarios en lote desde un archivo Excel para registrar entradas de inventario o saldos iniciales.</p>
            </div>
          </div>
          <button class="btn btn-primary bg-amber-600 hover:bg-amber-700 border-none px-6 py-2.5 flex items-center gap-2 shadow text-white" onclick="window._openImportInventarioModal()">
            <i class="fas fa-file-import"></i> Importar desde Excel
          </button>
        </div>
      ` : ''}
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
  tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando existencias a la fecha de corte...</td></tr>`;
  try {
    const dateInput = document.getElementById('toma-date') as HTMLInputElement;
    const asOfDateVal = (dateInput?.value || todayStr()).slice(0, 10);
    const isToday = (asOfDateVal === todayStr());

    let stock: any[] = [];
    if (isToday) {
      stock = await API.getInventoryStock({ warehouseId: whId });
    } else {
      stock = await API.getInventoryStockAsOf({ asOfDate: asOfDateVal, warehouseId: whId });
    }

    const stockByProd = new Map(
      stock
        .filter((s: any) => !s.warehouse_id || s.warehouse_id === whId)
        .map((s: any) => [s.product_id, s])
    );
    const products = (window as any)._tomaProducts || [];
    if (!products.length) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-gray-400">No hay productos tipo BIEN registrados.</td></tr>`;
      return;
    }
    
    tableBody.innerHTML = products.map((p: any) => {
      const st = stockByProd.get(p.id) || { qty_on_hand: 0, avg_cost: Number(p.cost_price || 0) };
      const systemStock = Number(st.qty_on_hand || 0);
      const avgCost = Number(st.avg_cost || p.cost_price || 0);

      return `
        <tr class="toma-prod-row hover:bg-gray-50 border-b border-gray-100" data-code="${esc(p.code)}" data-name="${esc(p.name)}">
          <td class="p-2 font-mono text-xs text-blue-800 font-semibold">${esc(p.code)}</td>
          <td class="p-2 text-sm">${esc(p.name)}</td>
          <td class="p-2 text-xs text-gray-500">${esc(p.unit || '—')}</td>
          <td class="p-2 text-right font-semibold text-gray-700" id="toma-sys-${p.id}">${fmtN(systemStock)}</td>
          <td class="p-2 text-right">
            <input type="number" step="0.0001" 
              class="form-input text-right w-24 py-1 text-xs toma-phys-input" 
              id="toma-phys-${p.id}" 
              data-prodid="${p.id}" 
              data-sys="${systemStock}" 
              data-avgcost="${avgCost}" 
              data-lastcost="${p.cost_price || 0}"
              placeholder="Sin contar">
          </td>
        </tr>
      `;
    }).join('');
  } catch (err: any) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-red-500">Error al cargar existencias: ${esc(err.message)}</td></tr>`;
  }
}

async function _downloadTomaFisicaTemplate() {
  const whId = getSelectVal('toma-wh');
  if (!whId) {
    showToast('Selecciona primero la bodega para generar la plantilla.', 'warning');
    return;
  }
  const selectEl = document.getElementById('toma-wh') as HTMLSelectElement;
  const whName = selectEl.options[selectEl.selectedIndex].text;
  const asOfDateVal = (getInputVal('toma-date') || todayStr()).slice(0, 10);
  const isToday = (asOfDateVal === todayStr());

  const XLSX = (window as any).XLSX;
  if (!XLSX) {
    showToast('La librería XLSX no está cargada.', 'error');
    return;
  }

  try {
    let stock: any[] = [];
    if (isToday) {
      stock = await API.getInventoryStock({ warehouseId: whId });
    } else {
      stock = await API.getInventoryStockAsOf({ asOfDate: asOfDateVal, warehouseId: whId });
    }

    const stockByProd = new Map(
      stock
        .filter((s: any) => !s.warehouse_id || s.warehouse_id === whId)
        .map((s: any) => [s.product_id, s])
    );
    const products = (window as any)._tomaProducts || [];

    if (!products.length) {
      showToast('No hay productos tipo BIEN registrados para exportar.', 'warning');
      return;
    }

    const data = products.map((p: any) => {
      const st = stockByProd.get(p.id) || { qty_on_hand: 0 };
      const systemStock = Number(st.qty_on_hand || 0);
      return {
        'Código': p.code || '',
        'Producto': p.name || '',
        'Unidad': p.unit || '',
        'Stock Sistema': systemStock,
        'Cantidad Física': ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Toma Física');
    XLSX.writeFile(wb, `Plantilla_Toma_Fisica_${whName.replaceAll(' ', '_')}_${asOfDateVal}.xlsx`);
    showToast('Plantilla descargada con éxito.', 'success');
  } catch (err: any) {
    showToast(`Error al generar plantilla: ${err.message}`, 'error');
  }
}

async function _importTomaFisicaExcel(file: File) {
  const XLSX = (window as any).XLSX;
  if (!XLSX) {
    showToast('La librería XLSX no está cargada.', 'error');
    return;
  }

  const whId = getSelectVal('toma-wh');
  if (!whId) {
    showToast('Por favor, selecciona primero la Bodega a Ajustar antes de importar el conteo.', 'warning');
    return;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as any[];

    if (!rows || rows.length === 0) {
      showToast('El archivo Excel está vacío o no es válido.', 'warning');
      return;
    }

    let codeKey = '';
    let qtyKey = '';

    const firstRow = rows[0];
    const keys = Object.keys(firstRow);

    for (const key of keys) {
      const normalized = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      if (['codigo', 'code', 'ref', 'referencia'].includes(normalized)) {
        codeKey = key;
      }
      if (['cantidad fisica', 'cantidad', 'qty', 'cant', 'cant. fisica', 'fisico', 'conteo'].includes(normalized)) {
        qtyKey = key;
      }
    }

    if (!codeKey) {
      codeKey = keys[0];
    }
    if (!qtyKey) {
      for (const key of keys) {
        const normalized = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        if (normalized.includes('cant') || normalized.includes('fisic') || normalized.includes('conteo') || normalized.includes('real')) {
          qtyKey = key;
          break;
        }
      }
      if (!qtyKey && keys.length > 1) {
        qtyKey = keys[keys.length - 1];
      }
    }

    if (!codeKey || !qtyKey || codeKey === qtyKey) {
      showToast('No se pudieron identificar las columnas de Código y Cantidad Física en el Excel.', 'error');
      return;
    }

    const products = (window as any)._tomaProducts || [];
    const prodByCode = new Map(products.map((p: any) => [String(p.code).trim().toLowerCase(), p]));

    let updatedCount = 0;
    let notFoundCodes: string[] = [];
    let invalidQtyCount = 0;

    for (const row of rows) {
      const rawCode = String(row[codeKey] || '').trim();
      if (!rawCode) continue;

      const codeNormalized = rawCode.toLowerCase();
      const product = prodByCode.get(codeNormalized);

      if (!product) {
        notFoundCodes.push(rawCode);
        continue;
      }

      const rawQty = row[qtyKey];
      if (rawQty === undefined || rawQty === null || String(rawQty).trim() === '') {
        continue;
      }

      const qty = parseFloat(rawQty);
      if (isNaN(qty) || qty < 0) {
        invalidQtyCount++;
        continue;
      }

      const inputEl = document.getElementById(`toma-phys-${product.id}`) as HTMLInputElement;
      if (inputEl) {
        inputEl.value = qty.toString();
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      showToast(`Éxito: Se cargaron ${updatedCount} cantidades del Excel.`, 'success');
    } else {
      showToast('No se actualizó ningún producto. Verifica los códigos y cantidades en el archivo.', 'warning');
    }

    if (notFoundCodes.length > 0) {
      const maxShow = 5;
      const shownCodes = notFoundCodes.slice(0, maxShow).join(', ');
      const extra = notFoundCodes.length > maxShow ? ` y ${notFoundCodes.length - maxShow} más` : '';
      showToast(`Aviso: ${notFoundCodes.length} códigos no existen en bodega (${shownCodes}${extra}).`, 'info');
    }

    if (invalidQtyCount > 0) {
      showToast(`Aviso: Se ignoraron ${invalidQtyCount} filas con cantidades no válidas.`, 'warning');
    }

  } catch (err: any) {
    showToast(`Error al importar Excel: ${err.message}`, 'error');
  }
}

async function _handleTomaFisicaExcelUpload(input: HTMLInputElement) {
  const file = input.files?.[0];
  if (!file) return;
  showToast('Procesando archivo Excel...', 'info');
  await _importTomaFisicaExcel(file);
  input.value = '';
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
          <input id="toma-date" type="date" class="form-input text-xs w-full" value="${todayStr()}" onchange="window._updateTomaFisicaSystemStock(getSelectVal('toma-wh'))">
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

      <!-- Barra de Acciones (Buscador + Excel) -->
      <div class="flex flex-col sm:flex-row gap-2 items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
        <div class="relative w-full sm:flex-grow">
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400"><i class="fas fa-search text-xs"></i></div>
          <input id="toma-search" class="form-input pl-8 py-1.5 text-xs w-full bg-white border-gray-200" placeholder="Filtrar por código o nombre..." oninput="window._filterTomaFisicaTable(this.value)">
        </div>
        <div class="flex gap-2 w-full sm:w-auto justify-end flex-shrink-0">
          <button class="btn btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5 border-green-200 text-green-700 hover:bg-green-50" onclick="window._downloadTomaFisicaTemplate()">
            <i class="fas fa-file-excel text-green-600"></i> Descargar Plantilla
          </button>
          <label class="btn btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50">
            <i class="fas fa-file-import text-blue-600"></i> Cargar Conteo
            <input type="file" id="toma-excel-input" accept=".xlsx,.xls,.csv" class="hidden" onchange="window._handleTomaFisicaExcelUpload(this)">
          </label>
        </div>
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

  const whSelect = document.getElementById('toma-wh') as HTMLSelectElement;
  const whName = whSelect?.options[whSelect.selectedIndex]?.text || 'Bodega';

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
    const today = date || (window as any).todayStr();
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
          description: `Sobrante toma física ${prod.code} (${fmtN(adj.qtyDiff)} und) - ${whName}`,
          line_order: txLines.length + 1
        });
        // Credito a la Cuenta de Contrapartida
        txLines.push({
          account_id: accContraId,
          debit: 0,
          credit: totalValue,
          description: `Ajuste sobrante ${prod.code} en ${whName}`,
          line_order: txLines.length + 1
        });
      } else {
        // Faltante (AJUSTE_NEGATIVO):
        // Credito a la Cuenta de Inventario
        txLines.push({
          account_id: inventoryAccId,
          debit: 0,
          credit: totalValue,
          description: `Faltante toma física ${prod.code} (${fmtN(Math.abs(adj.qtyDiff))} und) - ${whName}`,
          line_order: txLines.length + 1
        });
        // Debito a la Cuenta de Contrapartida
        txLines.push({
          account_id: accContraId,
          debit: totalValue,
          credit: 0,
          description: `Ajuste faltante ${prod.code} en ${whName}`,
          line_order: txLines.length + 1
        });
      }
    }

    if (!txLines.length) {
      throw new Error('El valor total de los ajustes es de $0. No se requiere registro contable.');
    }

    // Resolver sucursal activa o por defecto del usuario
    const activeBranchId = localStorage.getItem('active_branch_id');
    const currentUser = _pb().currentUser;
    const targetBranchId = (activeBranchId && activeBranchId !== 'TODAS')
      ? activeBranchId
      : (currentUser?.default_branch_id || null);

    // 5. Registrar la transacción contable general en estado draft
    const tx = await API.createTransaction({
      tx_type_id: txTypeId,
      number: txNumber,
      date,
      description: `Ajuste por Toma Física de Inventario en ${whName}`,
      status: 'draft',
      payment_days: 0,
      cross_enabled: false,
      branch_id: targetBranchId || null,
    }, txLines);

    // 6. Crear los movimientos de inventario asociados
    const positiveAdjs = adjustments.filter(a => a.qtyDiff > 0);
    const negativeAdjs = adjustments.filter(a => a.qtyDiff < 0);

    // 6a. Movimiento positivo
    if (positiveAdjs.length) {
      const movNumberPos = await API.getNextInventoryMovementNumber(date || today, 'AJUSTE_POSITIVO');
      const mov = await pb.create('inventory_movements', {
        number: movNumberPos,
        mov_type: 'AJUSTE_POSITIVO',
        date,
        warehouse_id: whId,
        notes: `Ajuste sobrantes toma física (${whName}) - Ref Tx ${txNumber}`,
        status: 'draft',
        tx_id: tx.id,
        branch_id: targetBranchId || null,
      });
      for (let i = 0; i < positiveAdjs.length; i++) {
        const a = positiveAdjs[i];
        await pb.create('inventory_movement_lines', {
          movement_id: mov.id,
          product_id: a.productId,
          qty: a.qtyDiff,
          unit_cost: a.cost,
          notes: `Sobrante: contados ${fmtN(a.physicalQty)} vs sistema ${fmtN(a.systemQty)} en ${whName}`,
          line_order: i + 1
        });
      }
      await API.applyInventoryMovement(mov.id);
    }

    // 6b. Movimiento negativo
    if (negativeAdjs.length) {
      const movNumberNeg = await API.getNextInventoryMovementNumber(date || today, 'AJUSTE_NEGATIVO');
      const mov = await pb.create('inventory_movements', {
        number: movNumberNeg,
        mov_type: 'AJUSTE_NEGATIVO',
        date,
        warehouse_id: whId,
        notes: `Ajuste faltantes toma física (${whName}) - Ref Tx ${txNumber}`,
        status: 'draft',
        tx_id: tx.id,
        branch_id: targetBranchId || null,
      });
      for (let i = 0; i < negativeAdjs.length; i++) {
        const a = negativeAdjs[i];
        await pb.create('inventory_movement_lines', {
          movement_id: mov.id,
          product_id: a.productId,
          qty: Math.abs(a.qtyDiff),
          unit_cost: a.cost,
          notes: `Faltante: contados ${fmtN(a.physicalQty)} vs sistema ${fmtN(a.systemQty)} en ${whName}`,
          line_order: i + 1
        });
      }
      await API.applyInventoryMovement(mov.id);
    }

    // 7. Aprobar la transacción contable una vez aplicados los movimientos
    await pb.update('transactions', tx.id, { status: 'active' });

    showToast(`Ajuste contable e inventario aplicados con éxito en ${whName}.`, 'success');
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
    const [products, warehouses] = await Promise.all([
      pb.listAll('products', { filter: 'active=true', sort: 'code' }),
      API.getWarehouses(false)
    ]);

    const whMap = new Map(warehouses.map((w: any) => [w.id, w.name]));
    
    if (type === 'general') {
      const asOfDateVal = (getInputVal('rep-gen-date') || todayStr()).slice(0, 10);
      const isToday = (asOfDateVal === todayStr());
      const whId = getSelectVal('rep-gen-wh');
      const costType = getSelectVal('rep-gen-cost');
      const catVal = getSelectVal('rep-gen-cat');
      const lineVal = getSelectVal('rep-gen-line');

      let stock = [];
      if (isToday) {
        stock = await API.getInventoryStock();
      } else {
        stock = await API.getInventoryStockAsOf({ asOfDate: asOfDateVal });
      }
      
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
      const onlyMovStock = (document.getElementById('rep-conteo-only-mov-stock') as HTMLInputElement).checked;

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

      let listProducts = products.filter((p: any) => p.type === 'BIEN');
      if (onlyMovStock) {
        listProducts = listProducts.filter((p: any) => stockMap.has(p.id));
      }

      for (const p of listProducts) {
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

    } else if (type === 'alertas') {
      const whId = getSelectVal('rep-alert-wh');
      const alertType = getSelectVal('rep-alert-type'); // bajo_min, sobre_max or empty
      
      const filteredStock = whId ? stock.filter((s: any) => s.warehouse_id === whId) : stock;
      const stockByProd = new Map();
      for (const s of filteredStock) {
        const pid = s.product_id;
        if (!stockByProd.has(pid)) {
          stockByProd.set(pid, 0);
        }
        stockByProd.set(pid, stockByProd.get(pid) + Number(s.qty_on_hand || 0));
      }

      const whTitle = whId ? `Bodega: ${whMap.get(whId) || ''}` : 'Consolidado General (Todas las Bodegas)';
      let filterText = `Alertas de Stock - ${whTitle}`;
      if (alertType === 'bajo_min') filterText += ' (Solo Bajo Mínimo)';
      else if (alertType === 'sobre_max') filterText += ' (Solo Sobre Máximo)';

      let html = `
        <h3>${filterText}</h3>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Unidad</th>
              <th class="text-right">Mínimo</th>
              <th class="text-right">Máximo</th>
              <th class="text-right">Stock Actual</th>
              <th class="text-right">Desviación</th>
              <th>Estado Alerta</th>
            </tr>
          </thead>
          <tbody>
      `;
      let alertCount = 0;

      for (const p of products.filter((p: any) => p.type === 'BIEN')) {
        const qty = stockByProd.get(p.id) || 0;
        const stockMin = p.stock_min !== null && p.stock_min !== undefined ? Number(p.stock_min) : null;
        const stockMax = p.stock_max !== null && p.stock_max !== undefined ? Number(p.stock_max) : null;

        let isAlert = false;
        let diffText = '—';
        let alertLabel = '';
        let rowStyle = '';

        if (qty <= 0) {
          isAlert = true;
          alertLabel = 'Agotado';
          const reqMin = stockMin !== null ? stockMin : 0;
          diffText = reqMin > 0 ? `Déficit: -${fmtN(reqMin)}` : '—';
          rowStyle = 'color:#DC2626; font-weight:bold; background-color:#FEF2F2;';
        } else if (stockMin !== null && qty < stockMin) {
          isAlert = true;
          alertLabel = 'Bajo Mínimo';
          diffText = `Déficit: -${fmtN(stockMin - qty)}`;
          rowStyle = 'color:#C46516; background-color:#FFFBEB;';
        } else if (stockMax !== null && qty > stockMax) {
          isAlert = true;
          alertLabel = 'Sobre Máximo';
          diffText = `Exceso: +${fmtN(qty - stockMax)}`;
          rowStyle = 'color:#1E40AF; background-color:#EFF6FF;';
        }

        // Aplicar filtro de tipo de alerta
        if (isAlert) {
          if (alertType === 'bajo_min' && alertLabel === 'Sobre Máximo') continue;
          if (alertType === 'sobre_max' && (alertLabel === 'Bajo Mínimo' || alertLabel === 'Agotado')) continue;

          alertCount++;
          html += `
            <tr style="${rowStyle}">
              <td style="font-family:monospace">${esc(p.code)}</td>
              <td>${esc(p.name)}</td>
              <td>${esc(p.unit || '—')}</td>
              <td class="text-right">${stockMin !== null ? fmtN(stockMin) : '—'}</td>
              <td class="text-right">${stockMax !== null ? fmtN(stockMax) : '—'}</td>
              <td class="text-right">${fmtN(qty)}</td>
              <td class="text-right">${diffText}</td>
              <td>${alertLabel}</td>
            </tr>
          `;
        }
      }

      if (alertCount === 0) {
        html += `<tr><td colspan="8" class="text-center" style="padding: 20px; color:#6B7280">No hay desvíos de stock que reportar bajo los criterios seleccionados.</td></tr>`;
      }

      html += `</tbody></table>`;
      _printHTMLReport('Reporte de Alertas de Stock Mínimo y Máximo', html);

    } else if (type === 'rotacion') {
      const data = (window as any)._lastTurnoverAnalysisData || [];
      if (!data.length) {
        return showToast('No hay datos de análisis para imprimir. Realice el cálculo primero.', 'warning');
      }

      let html = `
        <h3>Filtro Bodega: ${(window as any)._lastTurnoverWhName || 'Todas'} | Período: ${(window as any)._lastTurnoverPeriod || '—'}</h3>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th class="text-right">S. Inicial</th>
              <th class="text-right">Entradas</th>
              <th class="text-right">Salidas (Cant. COGS)</th>
              <th class="text-right">S. Final</th>
              <th class="text-right">Costo Prom</th>
              <th class="text-right">Valor COGS</th>
              <th class="text-right">Stock Prom</th>
              <th class="text-right">Valor Stock Prom</th>
              <th class="text-right">Rotación (Veces)</th>
              <th class="text-right">Días Inv. (DSI)</th>
              <th>Recomendación</th>
            </tr>
          </thead>
          <tbody>
      `;

      for (const r of data) {
        html += `
          <tr>
            <td style="font-family:monospace">${esc(r.sku)}</td>
            <td>${esc(r.name)}</td>
            <td class="text-right">${fmtN(r.qtyInitial)}</td>
            <td class="text-right">${fmtN(r.qtyIn)}</td>
            <td class="text-right">${fmtN(r.qtyOut)}</td>
            <td class="text-right">${fmtN(r.qtyFinal)}</td>
            <td class="text-right">${fmt(r.cost)}</td>
            <td class="text-right">${fmt(r.valOut)}</td>
            <td class="text-right">${fmtN(r.qtyAvg)}</td>
            <td class="text-right">${fmt(r.valAvg)}</td>
            <td class="text-right">${r.turnoverStr}</td>
            <td class="text-right">${r.dsiStr}</td>
            <td>${esc(r.suggestion)}</td>
          </tr>
        `;
      }

      html += `</tbody></table>`;
      _printHTMLReport('Análisis de Rotación de Inventarios', html);
    }
  } catch (err: any) {
    showToast(err.message, 'error');
  }
};

(window as any)._exportReport = async (type: string) => {
  try {
    const pb = _pb();
    const [products, warehouses] = await Promise.all([
      pb.listAll('products', { filter: 'active=true', sort: 'code' }),
      API.getWarehouses(false)
    ]);

    const whMap = new Map(warehouses.map((w: any) => [w.id, w.name]));

    if (type === 'general') {
      const asOfDateVal = (getInputVal('rep-gen-date') || todayStr()).slice(0, 10);
      const isToday = (asOfDateVal === todayStr());
      const whId = getSelectVal('rep-gen-wh');
      const costType = getSelectVal('rep-gen-cost');
      const catVal = getSelectVal('rep-gen-cat');
      const lineVal = getSelectVal('rep-gen-line');

      let stock = [];
      if (isToday) {
        stock = await API.getInventoryStock();
      } else {
        stock = await API.getInventoryStockAsOf({ asOfDate: asOfDateVal });
      }
      
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
      const onlyMovStock = (document.getElementById('rep-conteo-only-mov-stock') as HTMLInputElement).checked;

      const filteredStock = stock.filter((s: any) => s.warehouse_id === whId);
      const stockMap = new Map(filteredStock.map((s: any) => [s.product_id, s.qty_on_hand]));

      let listProducts = products.filter((p: any) => p.type === 'BIEN');
      if (onlyMovStock) {
        listProducts = listProducts.filter((p: any) => stockMap.has(p.id));
      }

      const exportRows = listProducts.map(p => {
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

    } else if (type === 'alertas') {
      const whId = getSelectVal('rep-alert-wh');
      const alertType = getSelectVal('rep-alert-type'); // bajo_min, sobre_max or empty
      
      const filteredStock = whId ? stock.filter((s: any) => s.warehouse_id === whId) : stock;
      const stockByProd = new Map();
      for (const s of filteredStock) {
        const pid = s.product_id;
        if (!stockByProd.has(pid)) {
          stockByProd.set(pid, 0);
        }
        stockByProd.set(pid, stockByProd.get(pid) + Number(s.qty_on_hand || 0));
      }

      const exportRows = [];

      for (const p of products.filter((p: any) => p.type === 'BIEN')) {
        const qty = stockByProd.get(p.id) || 0;
        const stockMin = p.stock_min !== null && p.stock_min !== undefined ? Number(p.stock_min) : null;
        const stockMax = p.stock_max !== null && p.stock_max !== undefined ? Number(p.stock_max) : null;

        let isAlert = false;
        let diff = 0;
        let diffType = '—';
        let alertLabel = '';

        if (qty <= 0) {
          isAlert = true;
          alertLabel = 'Agotado';
          const reqMin = stockMin !== null ? stockMin : 0;
          diff = -reqMin;
          diffType = reqMin > 0 ? `Déficit: -${reqMin}` : '—';
        } else if (stockMin !== null && qty < stockMin) {
          isAlert = true;
          alertLabel = 'Bajo Mínimo';
          diff = qty - stockMin;
          diffType = `Déficit: -${stockMin - qty}`;
        } else if (stockMax !== null && qty > stockMax) {
          isAlert = true;
          alertLabel = 'Sobre Máximo';
          diff = qty - stockMax;
          diffType = `Exceso: +${qty - stockMax}`;
        }

        if (isAlert) {
          if (alertType === 'bajo_min' && alertLabel === 'Sobre Máximo') continue;
          if (alertType === 'sobre_max' && (alertLabel === 'Bajo Mínimo' || alertLabel === 'Agotado')) continue;

          exportRows.push({
            codigo: p.code,
            nombre: p.name,
            unidad: p.unit || '—',
            stock_minimo: stockMin !== null ? stockMin : '—',
            stock_maximo: stockMax !== null ? stockMax : '—',
            stock_actual: qty,
            desviacion_num: diff,
            desviacion_txt: diffType,
            estado_alerta: alertLabel
          });
        }
      }

      const headers = [
        { key: 'codigo', label: 'Código' },
        { key: 'nombre', label: 'Producto' },
        { key: 'unidad', label: 'Unidad' },
        { key: 'stock_minimo', label: 'Stock Mínimo' },
        { key: 'stock_maximo', label: 'Stock Máximo' },
        { key: 'stock_actual', label: 'Stock Actual' },
        { key: 'desviacion_txt', label: 'Desviación' },
        { key: 'estado_alerta', label: 'Estado Alerta' }
      ];

      const whTitlePart = whId ? whMap.get(whId) : 'Consolidado';
      (window as any).exportToExcel(exportRows, headers, `Alertas_Stock_${whTitlePart}`);
      showToast('Alertas exportadas a Excel.', 'success');

    } else if (type === 'rotacion') {
      const data = (window as any)._lastTurnoverAnalysisData || [];
      if (!data.length) {
        return showToast('No hay datos de análisis para exportar. Realice el cálculo primero.', 'warning');
      }

      const exportRows = data.map((r: any) => ({
        sku: r.sku,
        producto: r.name,
        stock_inicial: r.qtyInitial,
        entradas: r.qtyIn,
        salidas_cogs_qty: r.qtyOut,
        stock_final: r.qtyFinal,
        costo_promedio: r.cost,
        valor_cogs: r.valOut,
        stock_promedio: r.qtyAvg,
        valor_stock_promedio: r.valAvg,
        indice_rotacion_veces: r.turnoverRate,
        dias_permanencia_dsi: r.dsi,
        recomendacion: r.suggestion
      }));

      const headers = [
        { key: 'sku', label: 'SKU' },
        { key: 'producto', label: 'Producto' },
        { key: 'stock_inicial', label: 'Stock Inicial' },
        { key: 'entradas', label: 'Entradas' },
        { key: 'salidas_cogs_qty', label: 'Salidas (Cant. COGS)' },
        { key: 'stock_final', label: 'Stock Final' },
        { key: 'costo_promedio', label: 'Costo Promedio' },
        { key: 'valor_cogs', label: 'Valor COGS (Consumo)' },
        { key: 'stock_promedio', label: 'Stock Promedio' },
        { key: 'valor_stock_promedio', label: 'Valor Stock Promedio' },
        { key: 'indice_rotacion_veces', label: 'Índice Rotación (Veces)' },
        { key: 'dias_permanencia_dsi', label: 'Días Permanencia (DSI)' },
        { key: 'recomendacion', label: 'Recomendación' }
      ];

      (window as any).exportToExcel(exportRows, headers, 'Analisis_Rotacion_Inventario');
      showToast('Análisis de rotación exportado a Excel.', 'success');
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
    const firstDay = (window as any).getColombiaFirstDayOfMonth();
    const today = (window as any).todayStr();

    const bodyHtml = `
      <div class="space-y-4" style="font-family:'Segoe UI',sans-serif">
        <div class="bg-purple-50 border border-purple-100 rounded-xl p-4 text-xs text-purple-800 flex items-start gap-2.5 mb-2">
          <i class="fas fa-circle-info mt-0.5 text-purple-500 text-sm"></i>
          <div>
            <span class="font-bold">¿Cómo funciona?</span> Esta herramienta recorre el historial completo de movimientos de inventario de forma estrictamente cronológica, usando los costos de entrada vigentes hoy (incluye correcciones tardías de costo). Detecta tanto resoluciones de saldo negativo como ventas cuyo costo posteado quedó desactualizado tras corregir una entrada. Cuando la venta afectada tiene factura y su periodo contable sigue abierto, el ajuste se aplica <span class="font-bold">directamente sobre el asiento original de esa factura</span>; en los demás casos (periodo cerrado o sin factura asociada) se agrupa en un asiento de ajuste consolidado.
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

    // 2. Traer todas las líneas de movimientos no anulados y facturas relacionadas
    const [lines, allInvoices] = await Promise.all([
      pb.listAll('inventory_movement_lines', {
        filter: 'movement_id.status != "voided"',
        expand: 'movement_id'
      }),
      pb.listAll('invoices', {
        fields: 'id,number,date,status,tx_id,inv_movement_id,cost_corrected'
      }).catch(() => [])
    ]);

    const invByMovMap = new Map<string, any>();
    (allInvoices || []).forEach((inv: any) => {
      if (inv.inv_movement_id) invByMovMap.set(inv.inv_movement_id, inv);
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
        const prod = prodMap.get(pId);
        stockState[pId][wId] = { qty: 0, avg_cost: Number(prod?.cost_price || 0) };
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
      const linkedInv = invByMovMap.get(mov.id);
      const isCreditNote = linkedInv && (
        String(linkedInv.number || '').startsWith('NC') ||
        String(mov.notes || '').toLowerCase().includes('crédito') ||
        String(mov.notes || '').toLowerCase().includes('credito') ||
        String(mov.notes || '').toLowerCase().includes('devolución') ||
        String(mov.notes || '').toLowerCase().includes('devolucion')
      );

      if (type === 'ENTRADA' || type === 'AJUSTE_POSITIVO') {
        const st = getStock(prodId, mov.warehouse_id);
        const priorQty = st.qty;
        const priorAvgCost = st.avg_cost;

        // Si es una Devolución en Venta (Nota Crédito): reingresa al costo promedio ponderado vigente
        if (isCreditNote) {
          let effectiveAvgCost = priorAvgCost;
          if (effectiveAvgCost <= 0 && prodMap.get(prodId)?.cost_price > 0) {
            effectiveAvgCost = Number(prodMap.get(prodId).cost_price);
            st.avg_cost = effectiveAvgCost;
          }

          const recordedCost = unitCost;
          const costDiff = effectiveAvgCost - recordedCost;
          const adjustmentVal = Math.round((qty * costDiff) * 100) / 100;

          if (isWithinDateRange && isTargetWarehouse && Math.abs(adjustmentVal) > 0.009 && effectiveAvgCost > 0) {
            simulatedAdjustments.push({
              prodId,
              whId: mov.warehouse_id,
              date,
              adjustmentVal,
              resolvedQty: qty,
              costDiff,
              priorAvgCost: recordedCost,
              newCost: effectiveAvgCost,
              movementNumber: mov.number,
              movementId: mov.id,
              movementLineId: line.id,
              kind: 'DEVOLUCION_VENTA_COST_FIX',
              isCreditNote: true
            });
          }

          st.qty = priorQty + qty;
          if (st.qty > 0) {
            st.avg_cost = Math.round((((priorQty * priorAvgCost) + (qty * effectiveAvgCost)) / st.qty) * 100) / 100;
          } else {
            st.avg_cost = effectiveAvgCost;
          }
        } else {
          // Entrada normal / Compra
          st.qty = priorQty + qty;

          if (priorQty < 0) {
            // Resolución de stock negativo
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
                movementId: mov.id,
                movementLineId: line.id,
                kind: 'NEG_STOCK_RESOLUTION'
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
        }
      } else if (type === 'SALIDA' || type === 'AJUSTE_NEGATIVO') {
        const st = getStock(prodId, mov.warehouse_id);
        const priorQty = st.qty;
        let effectiveAvgCost = st.avg_cost;
        if (effectiveAvgCost <= 0 && prodMap.get(prodId)?.cost_price > 0) {
          effectiveAvgCost = Number(prodMap.get(prodId).cost_price);
          st.avg_cost = effectiveAvgCost;
        }

        const recordedCost = unitCost;
        const costDiff = effectiveAvgCost - recordedCost;
        const adjustmentVal = Math.round((qty * costDiff) * 100) / 100;

        if (isWithinDateRange && isTargetWarehouse && Math.abs(adjustmentVal) > 0.009 && effectiveAvgCost > 0) {
          simulatedAdjustments.push({
            prodId,
            whId: mov.warehouse_id,
            date,
            adjustmentVal,
            resolvedQty: qty,
            costDiff,
            priorAvgCost: recordedCost,
            newCost: effectiveAvgCost,
            movementNumber: mov.number,
            movementId: mov.id,
            movementLineId: line.id,
            kind: 'SALIDA_COST_FIX',
            isCreditNote: false
          });
        }

        st.qty = priorQty - qty;
      } else if (type === 'TRASLADO') {
        // Origen
        const stSrc = getStock(prodId, mov.warehouse_id);
        const transferCost = stSrc.avg_cost > 0 ? stSrc.avg_cost : Number(prodMap.get(prodId)?.cost_price || 0);
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
              movementId: mov.id,
              kind: 'NEG_STOCK_RESOLUTION'
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

    // 5.1 Enlazar los ajustes directos (SALIDA_COST_FIX y DEVOLUCION_VENTA_COST_FIX) con su factura/nota y periodo
    const directCandidateAdjustments = simulatedAdjustments.filter((a: any) => 
      a.kind === 'SALIDA_COST_FIX' || a.kind === 'DEVOLUCION_VENTA_COST_FIX'
    );

    if (directCandidateAdjustments.length) {
      let periodos: any[] = [];
      try {
        const raw = await API.getSetting('periodos_cierre');
        if (raw) periodos = JSON.parse(raw);
      } catch (_) { /* sin periodos configurados: se tratan como cerrados */ }
      const isClosedPeriod = (dateStr: string) => {
        const key = (dateStr || '').slice(0, 7);
        const found = periodos.find((p: any) => p.key === key);
        return !found || !!found.closed;
      };

      for (const adj of directCandidateAdjustments) {
        const inv = invByMovMap.get(adj.movementId);
        adj.invoiceId = inv ? inv.id : null;
        adj.invoiceNumber = inv ? inv.number : null;
        adj.invoiceTxId = inv ? inv.tx_id : null;
        adj.invoiceDate = inv ? inv.date : null;
        adj.periodClosed = inv ? isClosedPeriod(inv.date) : true;
        adj.directTarget = !!(inv && inv.tx_id && !adj.periodClosed);
        if (inv && String(inv.number || '').startsWith('NC')) {
          adj.isCreditNote = true;
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
          directInvoicesCount: 0,
          directCreditNotesCount: 0,
          consolidatedCount: 0,
          hasAccounts: !!(prod?.inventory_account_id && prod?.cost_account_id)
        };
      }
      grouped[key].totalAdjustment += adj.adjustmentVal;
      grouped[key].details.push(adj);
      if ((adj.kind === 'SALIDA_COST_FIX' || adj.kind === 'DEVOLUCION_VENTA_COST_FIX') && adj.directTarget) {
        if (adj.isCreditNote) grouped[key].directCreditNotesCount++;
        else grouped[key].directInvoicesCount++;
      } else {
        grouped[key].consolidatedCount++;
      }
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

      const directParts: string[] = [];
      if (item.directInvoicesCount) directParts.push(`${item.directInvoicesCount} Factura(s)`);
      if (item.directCreditNotesCount) directParts.push(`${item.directCreditNotesCount} Devolución(es)`);

      const destinoHtml = [
        directParts.length ? `<span class="badge badge-blue text-[10px]" title="Se corrige directamente el asiento">${directParts.join(', ')}</span>` : '',
        item.consolidatedCount ? `<span class="badge badge-gray text-[10px]" title="Periodo cerrado, sin documento asociado o resolución de stock negativo: va a un asiento consolidado AJ-REV">${item.consolidatedCount} Consolidado</span>` : ''
      ].filter(Boolean).join(' ');

      return `
        <tr class="hover:bg-gray-50 border-b border-gray-100">
          <td class="p-2 text-center">
            <input type="checkbox" class="reval-select-row w-4 h-4 text-purple-600 rounded" data-index="${idx}" ${checkboxDisabled} ${checkboxChecked} onchange="window._recalcRevalTotals()">
          </td>
          <td class="p-2 font-mono text-xs text-purple-900 font-semibold">${esc(item.code)}</td>
          <td class="p-2 text-sm">${esc(item.name)}</td>
          <td class="p-2 text-xs text-gray-500">${esc(item.whName)}</td>
          <td class="p-2 text-center text-xs text-gray-500 font-semibold">${item.details.length}</td>
          <td class="p-2 text-center">${destinoHtml}</td>
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
            <th class="p-2 text-center">Destino</th>
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
    const round2 = (n: number) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
    const today = (window as any).todayStr();

    // 2. Separar todos los detalles de los productos seleccionados
    const allDirectDetails: any[] = [];
    const allConsolidatedDetails: any[] = [];

    for (const item of selectedItems) {
      const prod = prodMap.get(item.prodId) as any;
      if (!prod) continue;
      const inventoryAccId = prod.inventory_account_id;
      const costAccId = prod.cost_account_id;
      if (!inventoryAccId || !costAccId) {
        throw new Error(`El producto "${prod.code} — ${prod.name}" no tiene cuentas configuradas.`);
      }

      for (const d of (item.details || [])) {
        const isDirect = (d.kind === 'SALIDA_COST_FIX' || d.kind === 'DEVOLUCION_VENTA_COST_FIX') && d.directTarget && d.invoiceId;
        if (isDirect) {
          allDirectDetails.push({ ...d, prod });
        } else {
          allConsolidatedDetails.push({ ...d, prod });
        }
      }
    }

    // 3. Agrupar las correcciones directas por factura
    const directByInvoice: { [invId: string]: any[] } = {};
    for (const d of allDirectDetails) {
      if (!directByInvoice[d.invoiceId]) directByInvoice[d.invoiceId] = [];
      directByInvoice[d.invoiceId].push(d);
    }

    let directCorrections = 0;
    const directInvoiceNumbers: string[] = [];
    const affectedMovementIds = new Set<string>();

    // 4. Procesar cada factura candidata a ajuste directo
    for (const invId of Object.keys(directByInvoice)) {
      const detailsForInv = directByInvoice[invId];
      const inv = await pb.get('invoices', invId).catch(() => null);
      if (!inv || !inv.tx_id) {
        allConsolidatedDetails.push(...detailsForInv);
        continue;
      }

      if (inv.inv_movement_id) {
        affectedMovementIds.add(inv.inv_movement_id);
      }

      // Validar si el periodo contable está cerrado
      let isClosed = false;
      if (typeof (window as any).isPeriodClosed === 'function') {
        isClosed = await (window as any).isPeriodClosed(inv.date);
      }
      if (isClosed) {
        allConsolidatedDetails.push(...detailsForInv);
        continue;
      }

      // Obtener todas las líneas de la transacción original de la factura
      let invTxLines = await pb.listAll('tx_lines', {
        filter: `tx_id="${pb.escapeFilterValue(inv.tx_id)}"`,
        ignoreBranch: true
      });

      const lineDeltaMap = new Map<string, number>();
      const touchedLines = new Map<string, any>();
      const successfullyAppliedDetails: any[] = [];
      let canApplyAllOnInvoice = true;

      for (const d of detailsForInv) {
        const prod = d.prod;
        const delta = round2(d.adjustmentVal);
        if (d.movementId) affectedMovementIds.add(d.movementId);
        if (Math.abs(delta) <= 0.009) continue;

        // Buscar línea de costo existente (por cuenta exacta del producto o por descripción/código)
        let costLine = invTxLines.find((l: any) => l.account_id === prod.cost_account_id);
        if (!costLine) {
          costLine = invTxLines.find((l: any) => String(l.description || '').toLowerCase().includes('costo'));
        }

        // Buscar línea de inventario existente (por cuenta exacta del producto o por descripción/código)
        let invLine = invTxLines.find((l: any) => l.account_id === prod.inventory_account_id);
        if (!invLine) {
          invLine = invTxLines.find((l: any) => (String(l.description || '').toLowerCase().includes('inventario') || String(l.description || '').toLowerCase().includes('cogs')));
        }

        // Si no existían en el asiento (porque originalmente se posteó con costo $0), crearlas en el asiento original
        if (!costLine) {
          try {
            costLine = await pb.create('tx_lines', {
              tx_id: inv.tx_id,
              account_id: prod.cost_account_id,
              debit: 0,
              credit: 0,
              description: `Costo de Ventas consolidado - ${inv.number}`,
              line_order: invTxLines.length + 1
            });
            invTxLines.push(costLine);
          } catch (createErr) {
            console.warn('[REVAL] No se pudo crear línea de costo en tx:', createErr);
          }
        }

        if (!invLine) {
          try {
            invLine = await pb.create('tx_lines', {
              tx_id: inv.tx_id,
              account_id: prod.inventory_account_id,
              debit: 0,
              credit: 0,
              description: `Baja Inventario COGS consolidada - ${inv.number}`,
              line_order: invTxLines.length + 1
            });
            invTxLines.push(invLine);
          } catch (createErr) {
            console.warn('[REVAL] No se pudo crear línea de inventario en tx:', createErr);
          }
        }

        if (!costLine || !invLine) {
          canApplyAllOnInvoice = false;
          break;
        }

        lineDeltaMap.set(costLine.id, round2((lineDeltaMap.get(costLine.id) || 0) + delta));
        lineDeltaMap.set(invLine.id, round2((lineDeltaMap.get(invLine.id) || 0) + delta));
        touchedLines.set(costLine.id, costLine);
        touchedLines.set(invLine.id, invLine);
        successfullyAppliedDetails.push(d);
      }

      if (!canApplyAllOnInvoice || !successfullyAppliedDetails.length) {
        allConsolidatedDetails.push(...detailsForInv);
        continue;
      }

      // Modificar directamente el asiento contable de la factura
      for (const [lineId, totalDelta] of lineDeltaMap.entries()) {
        const line = touchedLines.get(lineId);
        if (!line) continue;
        const currentDebit = Number(line.debit || 0);
        const currentCredit = Number(line.credit || 0);

        // Si es la línea de débito (Costo)
        if (currentDebit > 0 || currentCredit === 0) {
          const newDebit = round2(Math.max(0, currentDebit + totalDelta));
          await pb.update('tx_lines', lineId, { debit: newDebit, credit: 0 });
        } 
        // Si es la línea de crédito (Inventario)
        else {
          const newCredit = round2(Math.max(0, currentCredit + totalDelta));
          await pb.update('tx_lines', lineId, { credit: newCredit, debit: 0 });
        }
      }

      // Actualizar el costo grabado en cada línea de movimiento de inventario de las salidas
      for (const d of successfullyAppliedDetails) {
        if (d.movementLineId) {
          const movLine = await pb.get('inventory_movement_lines', d.movementLineId).catch(() => null);
          if (movLine) {
            const patch: any = { unit_cost: round2(d.newCost) };
            if (movLine.original_unit_cost === null || movLine.original_unit_cost === undefined || movLine.original_unit_cost === 0) {
              patch.original_unit_cost = movLine.unit_cost || d.priorAvgCost;
            }
            await pb.update('inventory_movement_lines', d.movementLineId, patch);
          }
        }
      }

      // Marcar la factura como corregida
      await pb.update('invoices', invId, { cost_corrected: true, cost_corrected_at: today });

      // Registrar auditoría detallada
      await API.logAudit('COST_CORRECTION', 'Invoice', invId, JSON.stringify({
        invoice: inv.number,
        adjustedLinesCount: successfullyAppliedDetails.length,
        totalAdjustedDelta: detailsForInv.reduce((sum: number, d: any) => sum + d.adjustmentVal, 0)
      }));

      directCorrections++;
      directInvoiceNumbers.push(inv.number);
    }

    // 5. Procesar los ajustes que quedaron en Asiento Consolidado (periodo cerrado, sin factura o resoluciones)
    const consolidatedByProd: { [prodId: string]: { prod: any, total: number, details: any[] } } = {};
    for (const d of allConsolidatedDetails) {
      const pId = d.prodId || d.prod?.id;
      if (d.movementId) affectedMovementIds.add(d.movementId);
      if (!pId) continue;
      if (!consolidatedByProd[pId]) {
        consolidatedByProd[pId] = { prod: d.prod, total: 0, details: [] };
      }
      consolidatedByProd[pId].total += Number(d.adjustmentVal || 0);
      consolidatedByProd[pId].details.push(d);
    }

    // Actualizar unit_cost en inventory_movement_lines para los movimientos consolidados de salida
    for (const group of Object.values(consolidatedByProd)) {
      for (const d of group.details) {
        if (d.movementLineId && d.kind === 'SALIDA_COST_FIX') {
          const movLine = await pb.get('inventory_movement_lines', d.movementLineId).catch(() => null);
          if (movLine) {
            const patch: any = { unit_cost: round2(d.newCost) };
            if (movLine.original_unit_cost === null || movLine.original_unit_cost === undefined || movLine.original_unit_cost === 0) {
              patch.original_unit_cost = movLine.unit_cost || d.priorAvgCost;
            }
            await pb.update('inventory_movement_lines', d.movementLineId, patch);
          }
        }
      }
    }

    // 6. Recalcular y actualizar total_cost y total_qty en la cabecera de inventory_movements afectados
    for (const movId of affectedMovementIds) {
      try {
        const movLines = await pb.listAll('inventory_movement_lines', { filter: `movement_id="${pb.escapeFilterValue(movId)}"` });
        if (movLines.length) {
          const totalCost = movLines.reduce((sum: number, ml: any) => sum + (Number(ml.qty || 0) * Number(ml.unit_cost || 0)), 0);
          const currentMov = await pb.get('inventory_movements', movId).catch(() => null);
          if (currentMov && currentMov.status === 'draft') {
            await pb.update('inventory_movements', movId, { status: 'applied' });
          }
        }
      } catch (movErr) {
        console.warn(`[REVAL] No se pudo actualizar cabecera del movimiento ${movId}:`, movErr);
      }
    }

    let consolidatedTxNumber = '';
    const consolidatedItemsToPost = Object.values(consolidatedByProd).filter(g => Math.abs(round2(g.total)) > 0.009);

    if (consolidatedItemsToPost.length) {
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
      const rand = String(Date.now()).slice(-4);
      consolidatedTxNumber = `AJ-REV-${today.replaceAll('-', '')}-${rand}`;
      const txLines: any[] = [];

      for (const { prod, total } of consolidatedItemsToPost) {
        const roundedTotal = round2(total);
        const inventoryAccId = prod.inventory_account_id;
        const costAccId = prod.cost_account_id;

        if (roundedTotal > 0) {
          txLines.push({
            account_id: costAccId,
            debit: roundedTotal,
            credit: 0,
            description: `Ajuste Costo Ventas revalorización ${prod.code}`,
            line_order: txLines.length + 1
          });
          txLines.push({
            account_id: inventoryAccId,
            debit: 0,
            credit: roundedTotal,
            description: `Ajuste Inventario revalorización ${prod.code}`,
            line_order: txLines.length + 1
          });
        } else {
          const absVal = Math.abs(roundedTotal);
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

      if (txLines.length) {
        await API.createTransaction({
          tx_type_id: txTypeId,
          number: consolidatedTxNumber,
          date: today,
          description: 'Revalorización manual de costos de inventario',
          status: 'active',
          payment_days: 0,
          cross_enabled: false
        }, txLines);
        await API.logAudit('COST_CORRECTION', 'transactions', null, `Ajuste consolidado ${consolidatedTxNumber} por revalorización de costos (resoluciones de negativo / periodos cerrados / sin factura).`);
      }
    }

    if (!directCorrections && !consolidatedTxNumber) {
      throw new Error('El valor neto de los ajustes seleccionados es de $0. No se requiere registro contable.');
    }

    const parts: string[] = [];
    if (directCorrections) parts.push(`${directCorrections} factura(s) corregida(s) directamente en su asiento contable original`);
    if (consolidatedTxNumber) parts.push(`asiento consolidado ${consolidatedTxNumber} registrado`);
    showToast(`Revalorización aplicada con éxito: ${parts.join(' y ')}.`, 'success');
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

async function _openRotacionModal() {
  try {
    const warehouses = await API.getWarehouses(true);
    
    const firstDay = (window as any).getColombiaFirstDayOfMonth();
    const today = (window as any).todayStr();

    const bodyHtml = `
      <div class="space-y-4" style="font-family:'Segoe UI',sans-serif">
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 flex items-start gap-2.5 mb-2">
          <i class="fas fa-circle-info mt-0.5 text-blue-500 text-sm"></i>
          <div>
            <span class="font-bold">Análisis de Rotación de Inventarios (Veces y DSI)</span><br>
            El índice de rotación mide cuántas veces se venden o consumen las existencias de un producto en un período. 
            Los días de inventario (DSI) indican el número promedio de días que tarda el stock en agotarse.
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="form-group">
            <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha Inicio <span class="text-red-500">*</span></label>
            <input id="rot-start-date" type="date" class="form-input text-xs w-full" value="${firstDay}">
          </div>
          <div class="form-group">
            <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha Fin <span class="text-red-500">*</span></label>
            <input id="rot-end-date" type="date" class="form-input text-xs w-full" value="${today}">
          </div>
          <div class="form-group">
            <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bodega (Opcional)</label>
            <select id="rot-wh" class="form-input text-xs w-full">
              <option value="">— Todas las Bodegas (Consolidado) —</option>
              ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="flex justify-start">
          <button class="btn btn-primary px-5 py-2.5 flex items-center gap-2 shadow-sm rounded-lg text-xs" id="btn-rot-analyze" onclick="window._runRotacionAnalysis()">
            <i class="fas fa-arrows-spin"></i> Ejecutar Análisis
          </button>
        </div>

        <!-- Resultados -->
        <div id="rot-results" class="border border-gray-200 rounded-xl overflow-hidden shadow-inner max-h-[300px] overflow-y-auto bg-gray-50">
          <div class="text-center py-12 text-gray-400">
            <i class="fas fa-chart-line text-3xl mb-2 text-blue-200"></i>
            <p class="text-xs">Define el rango de fechas y haz clic en <strong>Ejecutar Análisis</strong>.</p>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-outline border-blue-600 text-blue-600" id="btn-rot-print" disabled onclick="window._printReport('rotacion')">
        <i class="fas fa-print mr-2"></i>Imprimir
      </button>
      <button class="btn btn-primary" id="btn-rot-excel" disabled onclick="window._exportReport('rotacion')">
        <i class="fas fa-file-excel mr-2"></i>Exportar Excel
      </button>
    `;

    openModal('Análisis de Rotación de Inventario', bodyHtml, footerHtml, true);
  } catch (err: any) {
    showToast(`Error al abrir modal de rotación: ${err.message}`, 'error');
  }
}

async function _runRotacionAnalysis() {
  const startDate = getInputVal('rot-start-date');
  const endDate = getInputVal('rot-end-date');
  const whId = getSelectVal('rot-wh');

  if (!startDate || !endDate) {
    return showToast('Por favor, selecciona las fechas de inicio y fin.', 'warning');
  }

  const btn = document.getElementById('btn-rot-analyze') as HTMLButtonElement;
  const resultsDiv = document.getElementById('rot-results');
  const printBtn = document.getElementById('btn-rot-print') as HTMLButtonElement;
  const excelBtn = document.getElementById('btn-rot-excel') as HTMLButtonElement;
  
  if (!resultsDiv) return;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analizando...';
  }
  resultsDiv.innerHTML = `<div class="text-center py-12 text-gray-500"><i class="fas fa-spinner fa-spin mr-2 text-2xl text-blue-600"></i><p class="text-xs mt-2">Calculando índices de rotación...</p></div>`;

  try {
    const pb = _pb();

    // 1. Cargar productos tipo BIEN y bodegas
    const [products, stock, warehouses] = await Promise.all([
      pb.listAll('products', { filter: 'active=true && type="BIEN"' }),
      API.getInventoryStock(),
      API.getWarehouses(false)
    ]);
    const whMap = new Map(warehouses.map((w: any) => [w.id, w.name]));

    // 2. Filtrar stock actual
    const filteredStock = whId ? stock.filter((s: any) => s.warehouse_id === whId) : stock;
    const currentStockByProd = new Map();
    for (const s of filteredStock) {
      const pid = s.product_id;
      if (!currentStockByProd.has(pid)) {
        currentStockByProd.set(pid, { qty: 0, costSum: 0, costCount: 0 });
      }
      const entry = currentStockByProd.get(pid);
      entry.qty += Number(s.qty_on_hand || 0);
      if (Number(s.avg_cost || 0) > 0) {
        entry.costSum += Number(s.avg_cost);
        entry.costCount++;
      }
    }

    // 3. Traer todas las líneas de movimientos aplicados desde startDate hasta hoy
    const lines = await pb.listAll('inventory_movement_lines', {
      filter: `movement_id.status = "applied" && movement_id.date >= "${startDate}"`,
      expand: 'movement_id'
    });

    // 4. Calcular entradas y salidas
    // Estructuras para acumular cantidades y costos
    const prodFlow = new Map(); // prodId -> { periodIn: 0, periodOut: 0, postIn: 0, postOut: 0, outCostSum: 0 }
    
    for (const line of lines) {
      const mov = line.expand?.movement_id;
      if (!mov) continue;

      const pid = line.product_id;
      if (!prodFlow.has(pid)) {
        prodFlow.set(pid, { periodIn: 0, periodOut: 0, postIn: 0, postOut: 0, outCostSum: 0 });
      }

      const flow = prodFlow.get(pid);
      const qty = Number(line.qty || 0);
      const unitCost = Number(line.unit_cost || line.expand?.product_id?.cost_price || 0);
      const date = mov.date || '';

      const isPostPeriod = date > endDate;

      let isInput = false;
      let isOutput = false;

      if (whId) {
        // Para una bodega específica
        if (mov.mov_type === 'TRASLADO') {
          if (mov.dest_warehouse_id === whId) isInput = true;
          else if (mov.warehouse_id === whId) isOutput = true;
        } else {
          if (mov.warehouse_id === whId) {
            isInput = mov.mov_type === 'ENTRADA' || mov.mov_type === 'AJUSTE_POSITIVO';
            isOutput = mov.mov_type === 'SALIDA' || mov.mov_type === 'AJUSTE_NEGATIVO';
          }
        }
      } else {
        // Consolidado
        if (mov.mov_type !== 'TRASLADO') {
          isInput = mov.mov_type === 'ENTRADA' || mov.mov_type === 'AJUSTE_POSITIVO';
          isOutput = mov.mov_type === 'SALIDA' || mov.mov_type === 'AJUSTE_NEGATIVO';
        }
      }

      if (isInput) {
        if (isPostPeriod) flow.postIn += qty;
        else flow.periodIn += qty;
      } else if (isOutput) {
        if (isPostPeriod) flow.postOut += qty;
        else {
          flow.periodOut += qty;
          flow.outCostSum += (qty * unitCost);
        }
      }
    }

    // 5. Calcular indicadores para cada producto
    const analysisData = [];
    const daysInPeriod = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);

    for (const p of products) {
      const flow = prodFlow.get(p.id) || { periodIn: 0, periodOut: 0, postIn: 0, postOut: 0, outCostSum: 0 };
      const curStock = currentStockByProd.get(p.id) || { qty: 0, costSum: 0, costCount: 0 };
      
      let cost = 0;
      if (curStock.costCount > 0) {
        cost = curStock.costSum / curStock.costCount;
      } else {
        cost = Number(p.cost_price || 0);
      }
      cost = Math.round(cost * 100) / 100;

      // Reconstruir existencias históricas
      const qtyFinal = curStock.qty - flow.postIn + flow.postOut;
      const qtyInitial = qtyFinal - flow.periodIn + flow.periodOut;

      const qtyAvg = Math.max(0, (qtyInitial + qtyFinal) / 2);
      const valAvg = Math.round((qtyAvg * cost) * 100) / 100;

      const qtyOut = flow.periodOut;
      const valOut = flow.outCostSum > 0 ? Math.round(flow.outCostSum * 100) / 100 : Math.round((qtyOut * cost) * 100) / 100;

      let turnoverRate = 0;
      let turnoverStr = '0.00';
      let dsi = 0;
      let dsiStr = '—';
      let suggestion = '';

      if (valAvg > 0) {
        turnoverRate = valOut / valAvg;
        turnoverStr = fmtN(turnoverRate);
        if (turnoverRate > 0) {
          dsi = daysInPeriod / turnoverRate;
          dsiStr = `${fmtN(dsi)} días`;
        }
      } else if (valOut > 0) {
        turnoverRate = 99.9;
        turnoverStr = 'Alta';
        dsi = 0;
        dsiStr = '0 días';
      }

      // Recomendación
      if (qtyOut === 0) {
        suggestion = 'Sin movimiento (Inventario estancado)';
      } else if (dsi <= 30) {
        suggestion = 'Alta rotación: Monitorear stock para evitar rotura';
      } else if (dsi > 30 && dsi <= 90) {
        suggestion = 'Rotación saludable';
      } else if (dsi > 90 && dsi <= 180) {
        suggestion = 'Rotación lenta: Reducir compras';
      } else {
        suggestion = 'Exceso de stock: Liquidar excedentes';
      }

      // Alertas por límites
      if (qtyFinal < (p.stock_min ?? 0)) {
        suggestion += ' | ¡Bajo mínimo!';
      } else if (p.stock_max !== null && qtyFinal > p.stock_max) {
        suggestion += ' | Exceso sobre máx';
      }

      analysisData.push({
        id: p.id,
        sku: p.code,
        name: p.name,
        qtyInitial,
        qtyIn: flow.periodIn,
        qtyOut,
        qtyFinal,
        cost,
        valOut,
        qtyAvg,
        valAvg,
        turnoverRate,
        turnoverStr,
        dsi,
        dsiStr,
        suggestion
      });
    }

    analysisData.sort((a, b) => b.turnoverRate - a.turnoverRate);

    (window as any)._lastTurnoverAnalysisData = analysisData;
    (window as any)._lastTurnoverWhName = whId ? whMap.get(whId) : 'Todas las Bodegas';
    (window as any)._lastTurnoverPeriod = `Desde ${startDate} hasta ${endDate} (${daysInPeriod} días)`;

    resultsDiv.innerHTML = `
      <table class="w-full text-xs data-table">
        <thead class="bg-blue-50 sticky top-0 z-10 border-b border-blue-200">
          <tr>
            <th class="p-2 text-left">Código</th>
            <th class="p-2 text-left">Producto</th>
            <th class="p-2 text-right">Cant. Inicial</th>
            <th class="p-2 text-right">Consumo Qty</th>
            <th class="text-right p-2">Valor COGS</th>
            <th class="text-right p-2">Stock Prom.</th>
            <th class="text-right p-2">Rotación (Veces)</th>
            <th class="text-right p-2">Permanencia (DSI)</th>
            <th class="p-2 text-left">Sugerencia</th>
          </tr>
        </thead>
        <tbody>
          ${analysisData.map(r => `
            <tr class="hover:bg-gray-50 border-b border-gray-100">
              <td class="p-2 font-mono text-xs text-blue-800 font-semibold">${esc(r.sku)}</td>
              <td class="p-2 text-xs font-medium">${esc(r.name)}</td>
              <td class="p-2 text-right text-gray-500">${fmtN(r.qtyInitial)}</td>
              <td class="p-2 text-right font-semibold text-gray-700">${fmtN(r.qtyOut)}</td>
              <td class="p-2 text-right">${fmt(r.valOut)}</td>
              <td class="p-2 text-right text-gray-500">${fmtN(r.qtyAvg)}</td>
              <td class="p-2 text-right font-bold text-blue-700">${r.turnoverStr}</td>
              <td class="p-2 text-right font-bold text-purple-700">${r.dsiStr}</td>
              <td class="p-2 text-xs text-gray-600 max-w-xs truncate" title="${esc(r.suggestion)}">${esc(r.suggestion)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    if (printBtn) printBtn.disabled = false;
    if (excelBtn) excelBtn.disabled = false;

  } catch (err: any) {
    resultsDiv.innerHTML = `<div class="p-6 text-center text-red-500">Error: ${esc(err.message)}</div>`;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-arrows-spin"></i> Ejecutar Análisis';
    }
  }
}

(window as any)._updateTomaFisicaSystemStock = _updateTomaFisicaSystemStock;
(window as any)._openTomaFisicaModal = _openTomaFisicaModal;
(window as any)._downloadTomaFisicaTemplate = _downloadTomaFisicaTemplate;
(window as any)._handleTomaFisicaExcelUpload = _handleTomaFisicaExcelUpload;
(window as any)._saveTomaFisica = _saveTomaFisica;
(window as any)._printReport = _printReport;
(window as any)._exportReport = _exportReport;
(window as any)._printHTMLReport = _printHTMLReport;
(window as any)._openRevalorizacionModal = _openRevalorizacionModal;
(window as any)._analyzeRevaluation = _analyzeRevaluation;
(window as any)._applyRevaluation = _applyRevaluation;
(window as any)._openRotacionModal = _openRotacionModal;
(window as any)._runRotacionAnalysis = _runRotacionAnalysis;

// ── CARGA MASIVA DE INVENTARIOS DESDE EXCEL ────────────────────────────────────
async function _openImportInventarioModal() {
  const pb = _pb();
  const [products, warehouses, accounts, txTypes] = await Promise.all([
    API.getProducts({ activeOnly: true }),
    API.getWarehouses(true),
    API.getAccounts(false),
    pb.listAll('transaction_types', { filter: 'active=true', sort: 'code' })
  ]);

  const bienProducts = products.filter((p: any) => p.type === 'BIEN');
  const detailAccounts = accounts
    .filter((a: any) => a.level >= 3 && a.active)
    .sort((a: any, b: any) => (a.code || '').localeCompare(b.code || ''));

  const bodyHtml = `
    <div class="space-y-4" style="font-family:'Segoe UI',sans-serif">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="form-group">
          <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tipo de Documento <span class="text-red-500">*</span></label>
          <select id="imp-inv-tx-type" class="form-input text-xs w-full">
            ${txTypes.map(t => `<option value="${esc(t.id)}" ${t.code === 'AP' ? 'selected' : ''}>${esc(t.code)} — ${esc(t.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bodega de Destino <span class="text-red-500">*</span></label>
          <select id="imp-inv-wh" class="form-input text-xs w-full">
            <option value="">— Seleccionar —</option>
            ${warehouses.map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha de Registro <span class="text-red-500">*</span></label>
          <input id="imp-inv-date" type="date" class="form-input text-xs w-full" value="${todayStr()}">
        </div>
        <div class="form-group">
          <label class="block text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cuenta de Contrapartida <span class="text-red-500">*</span></label>
          <select id="imp-inv-acc" class="form-input text-xs w-full">
            <option value="">— Seleccionar Cuenta —</option>
            ${detailAccounts.map(a => `<option value="${esc(a.id)}">${esc(a.code)} — ${esc(a.name)}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Barra de Acciones (Descargar plantilla + Cargar) -->
      <div class="flex flex-col sm:flex-row gap-2 items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-200">
        <div class="text-xs text-gray-500 font-medium">
          Carga existencias y costos unitarios reales en lote desde un archivo Excel/CSV.
        </div>
        <div class="flex gap-2 w-full sm:w-auto justify-end flex-shrink-0">
          <button class="btn btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5 border-green-200 text-green-700 hover:bg-green-50" onclick="window._downloadImportInventarioTemplate()">
            <i class="fas fa-file-excel text-green-600"></i> Descargar Plantilla
          </button>
          <label class="btn btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50">
            <i class="fas fa-file-import text-blue-600"></i> Seleccionar Archivo
            <input type="file" id="imp-inv-excel-input" accept=".xlsx,.xls,.csv" class="hidden" onchange="window._handleImportInventarioExcelUpload(this)">
          </label>
        </div>
      </div>

      <!-- Vista Previa de Productos Cargados -->
      <div id="imp-inv-preview-container" class="hidden font-sans">
        <h5 class="font-bold text-xs text-gray-700 mb-2 uppercase tracking-wide">Vista Previa de Carga</h5>
        <div class="border border-gray-200 rounded-xl overflow-hidden shadow-inner max-h-[250px] overflow-y-auto bg-white">
          <table class="w-full text-xs data-table">
            <thead class="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th class="p-2 text-left">Fila</th>
                <th class="p-2 text-left">Código</th>
                <th class="p-2 text-left">Nombre</th>
                <th class="p-2 text-right">Cantidad</th>
                <th class="p-2 text-right">Costo Unit.</th>
                <th class="p-2 text-right">Subtotal</th>
                <th class="p-2 text-center">Estado</th>
              </tr>
            </thead>
            <tbody id="imp-inv-tbody"></tbody>
          </table>
        </div>
        <div class="mt-2.5 flex items-center justify-between text-xs font-semibold bg-blue-50/50 p-2.5 rounded-xl border border-blue-100" style="color:#1E3A8A">
          <div>Ítems Válidos: <span id="imp-inv-val-count">0</span> / <span id="imp-inv-tot-count">0</span></div>
          <div>Costo Total: <span id="imp-inv-tot-value">$0.00</span></div>
        </div>
      </div>
    </div>
  `;

  const footerHtml = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary hidden" id="btn-imp-inv-save" onclick="window._saveImportInventario()">
      <i class="fas fa-bolt mr-1"></i>Ejecutar Carga Masiva
    </button>
  `;

  (window as any)._importedInvRows = [];
  (window as any)._importInventarioProducts = bienProducts;
  openModal('Carga Masiva de Inventarios (Excel/CSV)', bodyHtml, footerHtml, true);
}

function _downloadImportInventarioTemplate() {
  const headers = [
    { key: 'codigo', label: 'codigo (REQUERIDO)' },
    { key: 'cantidad', label: 'cantidad (REQUERIDO)' },
    { key: 'costo_unitario', label: 'costo_unitario (REQUERIDO)' },
    { key: 'detalles', label: 'detalles (opcional)' }
  ];
  const sampleData = [
    { codigo: 'P-001', cantidad: 100, costo_unitario: 5000, detalles: 'Inventario de apertura' },
    { codigo: 'P-002', cantidad: 50, costo_unitario: 12000, detalles: 'Compra de inventario inicial' }
  ];
  (window as any).exportToExcel(sampleData, headers, 'plantilla_carga_inventarios');
}

async function _handleImportInventarioExcelUpload(input: HTMLInputElement) {
  const file = input.files?.[0];
  if (!file) return;

  const btn = document.getElementById('btn-imp-inv-save') as HTMLButtonElement;
  const tbody = document.getElementById('imp-inv-tbody');
  const container = document.getElementById('imp-inv-preview-container');
  const validCountEl = document.getElementById('imp-inv-val-count');
  const totalCountEl = document.getElementById('imp-inv-tot-count');
  const totalValueEl = document.getElementById('imp-inv-tot-value');

  if (!tbody || !container) return;

  showToast('Procesando archivo Excel...', 'info');

  try {
    const arrayBuffer = await file.arrayBuffer();
    const parsed = (window as any)._massTxParseExcel(arrayBuffer);
    const rawRows = Array.isArray(parsed) ? parsed : (parsed?.rows || []);
    
    const products = (window as any)._importInventarioProducts || [];
    const prodMap = new Map(products.map((p: any) => [String(p.code || '').toUpperCase().trim(), p]));

    const parsedRows: any[] = [];
    let validCount = 0;
    let totalVal = 0;

    rawRows.forEach((row: any, i: number) => {
      const rowNo = i + 2; 
      const rawCode = String(row.codigo || '').toUpperCase().trim();
      const rawQty = parseFloat(row.cantidad);
      const rawCost = parseFloat(row.costo_unitario || row.costo);
      const details = String(row.detalles || row.detalle || '').trim();

      const prod = prodMap.get(rawCode);
      let statusHtml = '';
      let isValid = true;
      let reason = '';

      if (!rawCode) {
        isValid = false;
        reason = 'Código vacío';
      } else if (!prod) {
        isValid = false;
        reason = 'No encontrado';
      } else if (isNaN(rawQty) || rawQty <= 0) {
        isValid = false;
        reason = 'Cantidad inválida';
      } else if (isNaN(rawCost) || rawCost < 0) {
        isValid = false;
        reason = 'Costo inválido';
      } else if (!prod.inventory_account_id) {
        isValid = false;
        reason = 'Sin cuenta inventario';
      }

      const qty = isValid ? rawQty : 0;
      const cost = isValid ? rawCost : 0;
      const subtotal = qty * cost;

      if (isValid) {
        validCount++;
        totalVal += subtotal;
        statusHtml = '<span class="badge badge-green">Válido</span>';
      } else {
        statusHtml = `<span class="badge badge-red" title="${esc(reason)}">${esc(reason)}</span>`;
      }

      parsedRows.push({
        rowNo,
        code: rawCode || '—',
        name: prod ? prod.name : '—',
        qty,
        cost,
        subtotal,
        details,
        productId: prod?.id || null,
        inventoryAccId: prod?.inventory_account_id || null,
        isValid,
        statusHtml
      });
    });

    (window as any)._importedInvRows = parsedRows;

    tbody.innerHTML = parsedRows.map(r => {
      const rowClass = r.isValid ? '' : 'bg-red-50/50';
      return `
        <tr class="${rowClass}">
          <td class="p-2 text-center text-gray-500 font-mono">${r.rowNo}</td>
          <td class="p-2 font-mono font-medium">${esc(r.code)}</td>
          <td class="p-2">${esc(r.name)}</td>
          <td class="p-2 text-right font-semibold">${r.isValid ? fmtN(r.qty) : '—'}</td>
          <td class="p-2 text-right">${r.isValid ? fmt(r.cost) : '—'}</td>
          <td class="p-2 text-right font-semibold">${r.isValid ? fmt(r.subtotal) : '—'}</td>
          <td class="p-2 text-center">${r.statusHtml}</td>
        </tr>
      `;
    }).join('');

    validCountEl!.textContent = String(validCount);
    totalCountEl!.textContent = String(parsedRows.length);
    totalValueEl!.textContent = fmt(totalVal);

    container.classList.remove('hidden');

    if (validCount > 0) {
      btn?.classList.remove('hidden');
    } else {
      btn?.classList.add('hidden');
    }

    showToast(`Procesado: ${validCount} filas válidas de ${parsedRows.length} encontradas.`, 'success');
  } catch (err: any) {
    showToast(`Error al leer el archivo: ${err.message}`, 'error');
  } finally {
    input.value = '';
  }
}

async function _saveImportInventario() {
  const whId = getSelectVal('imp-inv-wh');
  const date = getInputVal('imp-inv-date');
  const accContraId = getSelectVal('imp-inv-acc');

  if (!whId) return showToast('Selecciona la bodega de destino.', 'warning');
  if (!date) return showToast('La fecha de registro es obligatoria.', 'warning');
  if (!accContraId) return showToast('Selecciona la cuenta contable de contrapartida.', 'warning');

  const importedRows = (window as any)._importedInvRows || [];
  const validRows = importedRows.filter((r: any) => r.isValid);

  if (!validRows.length) return showToast('No hay filas válidas para cargar.', 'warning');

  const btn = document.getElementById('btn-imp-inv-save') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando Carga...';
  }

  try {
    const pb = _pb();

    const debitMap = new Map<string, number>();
    validRows.forEach((r: any) => {
      const accId = r.inventoryAccId;
      const current = debitMap.get(accId) || 0;
      debitMap.set(accId, current + r.subtotal);
    });

    let totalTransactionValue = 0;
    const txLines: any[] = [];
    let order = 1;

    debitMap.forEach((val, accId) => {
      const roundedVal = Math.round(val * 100) / 100;
      if (roundedVal <= 0) return;
      totalTransactionValue += roundedVal;

      txLines.push({
        account_id: accId,
        debit: roundedVal,
        credit: 0,
        description: `Carga masiva de inventario - Ingreso mercancía`,
        line_order: order++
      });
    });

    const roundedTotal = Math.round(totalTransactionValue * 100) / 100;
    if (roundedTotal <= 0) {
      throw new Error('El valor total neto cargado es $0. No se requiere registro contable.');
    }

    txLines.push({
      account_id: accContraId,
      debit: 0,
      credit: roundedTotal,
      description: `Contrapartida de carga masiva de inventarios`,
      line_order: order++
    });

    const activeBranchId = localStorage.getItem('active_branch_id');
    const currentUser = pb.currentUser;
    let targetBranchId = (activeBranchId && activeBranchId !== 'TODAS')
      ? activeBranchId
      : (currentUser?.default_branch_id || null);

    if (!targetBranchId) {
      const branches = await pb.listAll('branches').catch(() => []);
      if (branches.length > 0) {
        targetBranchId = branches[0].id;
      }
    }

    const txTypeId = (document.getElementById('imp-inv-tx-type') as HTMLSelectElement)?.value;
    if (!txTypeId) throw new Error('El tipo de documento es obligatorio.');

    const txType = await pb.get('transaction_types', txTypeId);
    const txPrefix = txType.code || 'AJ';
    const rand = String(Date.now()).slice(-4);
    const txNumber = `${txPrefix}-${date.replaceAll('-', '')}-${rand}`;

    const tx = await API.createTransaction({
      tx_type_id: txTypeId,
      number: txNumber,
      date,
      description: `Carga masiva de inventario en bodega`,
      status: 'draft',
      payment_days: 0,
      cross_enabled: false,
      branch_id: targetBranchId || null,
    }, txLines);

    const movNumber = await API.getNextInventoryMovementNumber(date, 'ENTRADA');
    const mov = await pb.create('inventory_movements', {
      number: movNumber,
      mov_type: 'ENTRADA',
      date,
      warehouse_id: whId,
      notes: `Carga masiva de inventario - Ref Tx ${txNumber}`,
      status: 'draft',
      tx_id: tx.id,
      branch_id: targetBranchId || null,
    });

    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i];
      await pb.create('inventory_movement_lines', {
        movement_id: mov.id,
        product_id: r.productId,
        qty: r.qty,
        unit_cost: r.cost,
        notes: r.details || `Carga masiva - Fila Excel ${r.rowNo}`,
        line_order: i + 1
      });
    }

    await API.applyInventoryMovement(mov.id);

    await pb.update('transactions', tx.id, { status: 'active' });

    showToast(`Inventario cargado exitosamente. Se ingresaron ${validRows.length} productos.`, 'success');
    closeModal();
    renderInventario(document.getElementById('page-content')!);
  } catch (err: any) {
    showToast(`Error al ejecutar la carga: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar Carga Masiva';
    }
  }
}

(window as any)._openImportInventarioModal = _openImportInventarioModal;
(window as any)._downloadImportInventarioTemplate = _downloadImportInventarioTemplate;
(window as any)._handleImportInventarioExcelUpload = _handleImportInventarioExcelUpload;
(window as any)._saveImportInventario = _saveImportInventario;

(window as any)._toggleCodificacionFields = (checked: boolean) => {
  const fields = document.getElementById('cfg-cod-fields');
  if (fields) fields.style.display = checked ? '' : 'none';
};

async function _saveUnifiedInventoryConfig() {
  const btn = document.getElementById('btn-save-unified-cfg') as HTMLButtonElement;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1.5"></i>Guardando...';
  }

  try {
    // 1. Guardar Configuración de Productos (SKU)
    const auto_code = (document.getElementById('cfg-cod-auto') as HTMLInputElement)?.checked || false;
    const prefix = ((document.getElementById('cfg-cod-prefix') as HTMLInputElement)?.value || '').trim().toUpperCase();
    const consecutive = parseInt((document.getElementById('cfg-cod-consecutive') as HTMLInputElement)?.value || '1');
    const digits = parseInt((document.getElementById('cfg-cod-digits') as HTMLInputElement)?.value || '4');

    if (auto_code) {
      if (isNaN(consecutive) || consecutive < 1) {
        throw new Error('El consecutivo debe ser un número entero mayor o igual a 1.');
      }
      if (isNaN(digits) || digits < 1 || digits > 10) {
        throw new Error('Los dígitos de relleno deben ser un número entre 1 y 10.');
      }
    }

    const prodConfig = { auto_code, prefix, consecutive, digits };
    await API.setSetting('product_config_v1', JSON.stringify(prodConfig));

    // 2. Guardar Configuración de Stock Negativo
    const allow_negative_stock = (document.getElementById('inv-cfg-allow-negative') as HTMLInputElement)?.checked || false;
    const invConfig = { allow_negative_stock };
    await API.setSetting('inventory_settings_v1', JSON.stringify(invConfig));

    showToast('Configuración de productos e inventario guardada correctamente.', 'success');
    closeModal();
    renderInventario($('#page-content'));
  } catch (err: any) {
    showToast(`Error al guardar: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-floppy-disk mr-1.5"></i>Guardar Configuración';
    }
  }
}

(window as any).openUnifiedInventoryConfigModal = openUnifiedInventoryConfigModal;
(window as any).openInventoryConfigModal = openUnifiedInventoryConfigModal;
(window as any)._openConfigCodificacionModal = openUnifiedInventoryConfigModal;
(window as any)._saveUnifiedInventoryConfig = _saveUnifiedInventoryConfig;
(window as any)._saveConfigCodificacion = _saveUnifiedInventoryConfig;

async function _deleteInventoryMovement(id: string, number: string) {
  if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente el movimiento ${number}? Esta acción borrará el registro y sus líneas en la base de datos.`)) {
    return;
  }

  try {
    const pb = _pb();
    
    // Deleting lines programmatically because cascadeDelete is false in this relation field
    const lines = await API.getInventoryMovementLines(id);
    for (const line of lines) {
      await pb.delete('inventory_movement_lines', line.id);
    }
    
    await pb.delete('inventory_movements', id);
    
    showToast(`Movimiento ${number} eliminado exitosamente.`, 'success');
    renderInventario(document.getElementById('page-content')!);
  } catch (err: any) {
    showToast(`Error al eliminar: ${err.message}`, 'error');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CONSIGNACIONES
// ══════════════════════════════════════════════════════════════════════════════
async function renderConsignacionesTab(c, ctx = {}) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando panel de consignaciones...</div>`;
  try {
    const [whList, settlements, allStock] = await Promise.all([
      API.getWarehouses(false),
      API.getConsignmentSettlements({ perPage: 200 }),
      API.getInventoryStock()
    ]);

    const consWhs = whList.filter(w => w.is_consignment);
    const inboundWhIds = consWhs.filter(w => w.consignment_type === 'INBOUND').map(w => w.id);
    const outboundWhIds = consWhs.filter(w => w.consignment_type === 'OUTBOUND').map(w => w.id);

    const inboundVal = allStock.filter(s => inboundWhIds.includes(s.warehouse_id)).reduce((a, s) => a + (s.qty_on_hand || 0) * (s.avg_cost || 0), 0);
    const outboundVal = allStock.filter(s => outboundWhIds.includes(s.warehouse_id)).reduce((a, s) => a + (s.qty_on_hand || 0) * (s.avg_cost || 0), 0);
    const pendingDrafts = settlements.items.filter(s => s.status === 'draft').length;

    c.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div class="bg-white rounded-2xl border p-4 shadow-sm flex items-center gap-4" style="border-color:#F0F0F0">
          <div class="rounded-xl p-3 bg-emerald-50 text-emerald-600"><i class="fas fa-handshake text-xl"></i></div>
          <div>
            <p class="text-xs text-gray-500 uppercase font-bold">Consignación Proveedores</p>
            <h4 class="text-lg font-bold text-gray-800">${fmt(inboundVal)}</h4>
            <p class="text-[10px] text-gray-400">Stock físico de terceros en nuestras bodegas</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm flex items-center gap-4" style="border-color:#F0F0F0">
          <div class="rounded-xl p-3 bg-violet-50 text-violet-600"><i class="fas fa-truck-ramp-box text-xl"></i></div>
          <div>
            <p class="text-xs text-gray-500 uppercase font-bold">Consignación Clientes</p>
            <h4 class="text-lg font-bold text-gray-800">${fmt(outboundVal)}</h4>
            <p class="text-[10px] text-gray-400">Stock nuestro entregado en custodia</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl border p-4 shadow-sm flex items-center gap-4" style="border-color:#F0F0F0">
          <div class="rounded-xl p-3 bg-amber-50 text-amber-600"><i class="fas fa-file-invoice text-xl"></i></div>
          <div>
            <p class="text-xs text-gray-500 uppercase font-bold">Liquidaciones Pendientes</p>
            <h4 class="text-lg font-bold text-gray-800">${pendingDrafts}</h4>
            <p class="text-[10px] text-gray-400">Borradores pendientes de contabilización</p>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3 mb-4 w-full">
        <h4 class="text-sm font-bold text-gray-800"><i class="fas fa-history mr-1.5 text-gray-400"></i>Historial de Liquidaciones</h4>
        <div class="flex gap-2">
          ${can('canWrite') ? `
            <button class="btn btn-primary" onclick="openConsignmentSettlementWizard()"><i class="fas fa-calculator mr-1.5"></i>Nueva Liquidación</button>
          ` : ''}
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Tercero</th>
                <th>Bodega</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Vínculo Doc.</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${settlements.items.length ? settlements.items.map(s => {
                const badgeClass = s.status === 'posted' ? 'badge-green' : (s.status === 'voided' ? 'badge-orange' : 'badge-gray');
                const label = s.status === 'posted' ? 'Aplicada' : (s.status === 'voided' ? 'Anulada' : 'Borrador');
                const typeLabel = s.type === 'INBOUND' ? '<span class="text-emerald-700 font-medium"><i class="fas fa-arrow-down mr-1"></i>Proveedor (Inbound)</span>' : '<span class="text-violet-700 font-medium"><i class="fas fa-arrow-up mr-1"></i>Cliente (Outbound)</span>';
                
                let linkDocHtml = '—';
                if (s.invoice_id) {
                  linkDocHtml = `<a href="#" onclick="closeModal(); (window as any).seeInvoiceDetail && (window as any).seeInvoiceDetail('${s.invoice_id}'); return false;" class="text-blue-600 hover:underline"><i class="fas fa-file-invoice mr-1 text-xs"></i>FV-${s.expand?.invoice_id?.number || 'Venta'}</a>`;
                } else if (s.purchase_invoice_id) {
                  linkDocHtml = `<a href="#" onclick="closeModal(); (window as any).seePurchaseDetail && (window as any).seePurchaseDetail('${s.purchase_invoice_id}'); return false;" class="text-blue-600 hover:underline"><i class="fas fa-file-invoice mr-1 text-xs"></i>FC-${s.expand?.purchase_invoice_id?.number || 'Compra'}</a>`;
                }

                return `
                  <tr>
                    <td><span class="font-mono font-semibold" style="color:#1A4B8C">${esc(s.number)}</span></td>
                    <td>${typeLabel}</td>
                    <td>${esc(s.expand?.third_party_id?.name || '—')}</td>
                    <td>${esc(s.expand?.warehouse_id?.name || '—')}</td>
                    <td>${esc(s.date)}</td>
                    <td><span class="badge ${badgeClass}">${label}</span></td>
                    <td>${linkDocHtml}</td>
                    <td>
                      <div class="flex gap-1.5">
                        <button class="btn btn-outline btn-sm" onclick="viewConsignmentSettlementDetail('${esc(s.id)}')" title="Ver detalle"><i class="fas fa-eye"></i></button>
                        ${s.status === 'draft' && can('canWrite') ? `
                          <button class="btn btn-primary btn-sm" onclick="applyConsignmentSettlement('${esc(s.id)}')" title="Contabilizar"><i class="fas fa-check"></i></button>
                          <button class="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50" onclick="deleteConsignmentSettlement('${esc(s.id)}', '${esc(s.number)}')" title="Eliminar"><i class="fas fa-trash-can"></i></button>
                        ` : ''}
                        ${s.status === 'posted' && can('canWrite') ? `
                          <button class="btn btn-outline btn-sm text-orange-600 border-orange-200 hover:bg-orange-50" onclick="voidConsignmentSettlement('${esc(s.id)}', '${esc(s.number)}')" title="Anular"><i class="fas fa-ban"></i></button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `<tr><td colspan="8" class="text-center py-10 text-gray-400"><i class="fas fa-handshake mr-2 text-lg"></i>No hay liquidaciones registradas en el sistema.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-triangle-exclamation mr-2"></i>Error al cargar panel: ${esc(err.message)}</div>`;
  }
}

async function openConsignmentSettlementWizard() {
  openModal('Cargando...', `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>`, '', true);
  try {
    const warehouses = await API.getWarehouses(false);
    const consignmentWhs = warehouses.filter(w => w.is_consignment);

    openModal(
      'Nueva Liquidación de Consignación',
      `
      <div id="cons-wizard-step1">
        <h4 class="text-sm font-bold text-gray-800 mb-3">Paso 1: Selección de Tercero y Bodega</h4>
        <div class="grid grid-cols-1 gap-4 mb-4">
          <div class="form-group">
            <label class="form-label">Tipo de Consignación <span class="text-red-500">*</span></label>
            <select id="wz-type" class="form-input">
              <option value="INBOUND">Inbound (Recibido de Proveedores)</option>
              <option value="OUTBOUND">Outbound (Entregado a Clientes/Vendedores)</option>
            </select>
          </div>
          <div class="form-group relative">
            <label class="form-label" id="wz-party-label">Proveedor <span class="text-red-500">*</span></label>
            <input type="hidden" id="wz-party-id" value="">
            <input type="text" id="wz-party-search" class="form-input" placeholder="Escribe para buscar..." autocomplete="off">
            <div id="wz-party-results" style="display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);max-height:200px;overflow:auto;background:#fff;border:1px solid #E5E7EB;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,.12);z-index:60"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Bodega de Consignación <span class="text-red-500">*</span></label>
            <select id="wz-warehouse" class="form-input">
              <option value="">— Seleccionar Bodega —</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Fecha de Registro <span class="text-red-500">*</span></label>
            <input type="date" id="wz-date" class="form-input" value="${(window as any).todayStr()}">
          </div>
          <div class="form-group">
            <label class="form-label">Bodega de Retorno (para Devoluciones)</label>
            <select id="wz-return-wh" class="form-input">
              <option value="">— Seleccionar Bodega de Devolución —</option>
              ${warehouses.filter(w => !w.is_consignment).map(w => `<option value="${esc(w.id)}">${esc(w.name)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t pt-3">
          <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
          <button class="btn btn-primary" id="wz-btn-go-step2">Siguiente <i class="fas fa-arrow-right ml-1"></i></button>
        </div>
      </div>

      <div id="cons-wizard-step2" style="display:none;">
        <h4 class="text-sm font-bold text-gray-800 mb-2">Paso 2: Conciliación de Existencias</h4>
        <p class="text-xs text-gray-500 mb-4">Ingresa las cantidades vendidas/legalizadas y las devueltas. El stock restante se calculará de forma automática.</p>
        <div class="overflow-x-auto max-h-[350px] border rounded-xl mb-4" style="border-color:#F0F0F0">
          <table class="data-table text-xs">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Código</th>
                <th class="text-right">Stock Actual</th>
                <th class="text-right" style="width:110px">Cant. Vendida</th>
                <th class="text-right" style="width:110px">Cant. Devuelta</th>
                <th class="text-right">Nuevo Stock</th>
                <th class="text-right">Costo/Precio</th>
              </tr>
            </thead>
            <tbody id="wz-step2-tbody"></tbody>
          </table>
        </div>
        <div class="flex justify-between items-center border-t pt-3">
          <button class="btn btn-outline" id="wz-btn-back-step1"><i class="fas fa-arrow-left mr-1"></i> Atrás</button>
          <div class="flex gap-2">
            <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" id="wz-btn-go-step3">Siguiente <i class="fas fa-arrow-right ml-1"></i></button>
          </div>
        </div>
      </div>

      <div id="cons-wizard-step3" style="display:none;">
        <h4 class="text-sm font-bold text-gray-800 mb-3">Paso 3: Confirmación y Resumen</h4>
        <div class="bg-violet-50/20 border border-violet-100/50 rounded-xl p-4 mb-4 text-xs">
          <div class="grid grid-cols-2 gap-y-2">
            <span class="text-gray-500">Tipo:</span><span class="font-bold text-gray-800" id="wz-summary-type"></span>
            <span class="text-gray-500">Tercero:</span><span class="font-bold text-gray-800" id="wz-summary-party"></span>
            <span class="text-gray-500">Bodega Consignación:</span><span class="font-bold text-gray-800" id="wz-summary-wh"></span>
            <span class="text-gray-500">Fecha:</span><span class="font-bold text-gray-800" id="wz-summary-date"></span>
            <span class="text-gray-500">Total Liquidado:</span><span class="font-bold text-violet-700 text-sm" id="wz-summary-total"></span>
          </div>
        </div>
        <div class="form-group mb-4">
          <label class="form-label">Observaciones / Notas</label>
          <textarea id="wz-notes" class="form-input" rows="2" placeholder="Notas opcionales para la liquidación"></textarea>
        </div>
        <div class="flex justify-between items-center border-t pt-3">
          <button class="btn btn-outline" id="wz-btn-back-step2"><i class="fas fa-arrow-left mr-1"></i> Atrás</button>
          <div class="flex gap-2">
            <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" id="wz-btn-save-draft"><i class="fas fa-floppy-disk mr-1"></i> Guardar Borrador</button>
            <button class="btn btn-success" id="wz-btn-post"><i class="fas fa-check-double mr-1"></i> Contabilizar Ahora</button>
          </div>
        </div>
      </div>
      `,
      '',
      false
    );

    const typeSel = document.getElementById('wz-type') as HTMLSelectElement;
    const partySearchInput = document.getElementById('wz-party-search') as HTMLInputElement;
    const partyIdHidden = document.getElementById('wz-party-id') as HTMLInputElement;
    const partyResultsDiv = document.getElementById('wz-party-results') as HTMLDivElement;
    const whSel = document.getElementById('wz-warehouse') as HTMLSelectElement;
    const partyLabel = document.getElementById('wz-party-label') as HTMLLabelElement;

    const syncWarehouses = () => {
      const type = typeSel.value;
      const partyId = partyIdHidden.value;
      whSel.innerHTML = `<option value="">— Seleccionar Bodega —</option>`;

      const filteredWhs = consignmentWhs.filter(w => 
        w.consignment_type === type && 
        (w.linked_third_party_id === partyId || !w.linked_third_party_id)
      );
      filteredWhs.forEach(w => {
        whSel.innerHTML += `<option value="${esc(w.id)}">${esc(w.name)}</option>`;
      });
    };

    typeSel.addEventListener('change', () => {
      partyLabel.textContent = typeSel.value === 'INBOUND' ? 'Proveedor *' : 'Cliente / Vendedor *';
      partySearchInput.value = '';
      partyIdHidden.value = '';
      syncWarehouses();
    });

    let searchTimeout: any = null;
    partySearchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const q = partySearchInput.value.trim();
      if (!q) {
        partyIdHidden.value = '';
        partyResultsDiv.style.display = 'none';
        syncWarehouses();
        return;
      }

      searchTimeout = setTimeout(async () => {
        try {
          const type = typeSel.value;
          const roleFilter = type === 'INBOUND' ? 'type="PROVEEDOR"' : '(type="CLIENTE" || type="EMPLEADO")';
          const filter = `active=true && ${roleFilter} && (name ~ "${pb.escapeFilterValue(q)}" || doc_number ~ "${pb.escapeFilterValue(q)}")`;
          
          const res = await pb.list('third_parties', { page: 1, perPage: 10, filter, sort: 'name' });
          
          if (!res.items.length) {
            partyResultsDiv.innerHTML = `<div class="p-3 text-xs text-gray-400 text-center">No se encontraron resultados</div>`;
          } else {
            partyResultsDiv.innerHTML = res.items.map((p: any) => `
              <div class="p-2.5 hover:bg-gray-50 cursor-pointer text-xs border-b border-gray-100 last:border-0" data-id="${esc(p.id)}" data-name="${esc(p.name)}">
                <span class="font-semibold text-gray-700">${esc(p.name)}</span>
                <span class="text-gray-400 ml-1">(${esc(p.doc_number || '')})</span>
              </div>
            `).join('');

            partyResultsDiv.querySelectorAll('[data-id]').forEach((el: any) => {
              el.addEventListener('click', () => {
                partyIdHidden.value = el.dataset.id;
                partySearchInput.value = el.dataset.name;
                partyResultsDiv.style.display = 'none';
                syncWarehouses();
              });
            });
          }
          partyResultsDiv.style.display = 'block';
        } catch (err) {
          console.error("Error al buscar tercero:", err);
        }
      }, 250);
    });

    document.addEventListener('click', (e: any) => {
      if (!partySearchInput.contains(e.target) && !partyResultsDiv.contains(e.target)) {
        partyResultsDiv.style.display = 'none';
      }
    });

    syncWarehouses();

    let step2Products = [];

    // Navigation Step 1 -> Step 2
    document.getElementById('wz-btn-go-step2')?.addEventListener('click', async () => {
      const type = typeSel.value;
      const partyId = partyIdHidden.value;
      const whId = whSel.value;
      const date = (document.getElementById('wz-date') as HTMLInputElement).value;

      if (!partyId) return showToast('Selecciona el tercero relacionado', 'warning');
      if (!whId) return showToast('Selecciona la bodega de consignación', 'warning');
      if (!date) return showToast('La fecha es obligatoria', 'warning');

      const tbody = document.getElementById('wz-step2-tbody');
      if (!tbody) return;

      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando saldos...</td></tr>`;
      
      document.getElementById('cons-wizard-step1')!.style.display = 'none';
      document.getElementById('cons-wizard-step2')!.style.display = 'block';

      try {
        const stockRows = await API.getInventoryStock({ warehouseId: whId });
        
        // Si es Inbound, podemos filtrar el stock de la bodega por el proveedor seleccionado.
        // Así soportamos tener una única Bodega de Consignación compartida para múltiples proveedores.
        let filteredRows = stockRows;
        if (type === 'INBOUND' && partyId) {
          filteredRows = stockRows.filter((s: any) => s.expand?.product_id?.consignment_supplier_id === partyId);
        }
        
        step2Products = filteredRows;

        if (!filteredRows.length) {
          tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-gray-400"><i class="fas fa-boxes-stacked mr-2"></i>No hay existencias registradas de este proveedor en la bodega seleccionada.</td></tr>`;
          return;
        }

        tbody.innerHTML = stockRows.map((s, index) => {
          const prodName = s.expand?.product_id?.name || '—';
          const prodCode = s.expand?.product_id?.code || '—';
          const stock = s.qty_on_hand || 0;
          const cost = type === 'INBOUND' ? (s.expand?.product_id?.consignment_cost || s.expand?.product_id?.cost_price || 0) : (s.expand?.product_id?.base_price || 0);

          return `
            <tr data-stock-idx="${index}">
              <td class="font-semibold text-gray-700">${esc(prodName)}</td>
              <td class="font-mono text-[10px] text-gray-500">${esc(prodCode)}</td>
              <td class="text-right font-semibold" id="wz-stock-${index}">${fmtN(stock)}</td>
              <td><input type="number" id="wz-qty-sold-${index}" class="form-input text-xs text-right p-1 py-0.5 wz-calc-trigger" value="0" min="0" max="${stock}" step="any"></td>
              <td><input type="number" id="wz-qty-ret-${index}" class="form-input text-xs text-right p-1 py-0.5 wz-calc-trigger" value="0" min="0" max="${stock}" step="any"></td>
              <td class="text-right font-bold text-gray-600" id="wz-stock-new-${index}">${fmtN(stock)}</td>
              <td class="text-right font-mono font-semibold" data-cost="${cost}">${fmt(cost)}</td>
            </tr>
          `;
        }).join('');

        const recalculateRow = (idx) => {
          const stock = step2Products[idx].qty_on_hand || 0;
          const sold = parseFloat((document.getElementById(`wz-qty-sold-${idx}`) as HTMLInputElement).value || '0');
          const ret = parseFloat((document.getElementById(`wz-qty-ret-${idx}`) as HTMLInputElement).value || '0');
          
          if (sold < 0 || ret < 0) return;
          const newStock = Math.max(0, stock - sold - ret);
          document.getElementById(`wz-stock-new-${idx}`)!.textContent = fmtN(newStock);
        };

        tbody.querySelectorAll('.wz-calc-trigger').forEach(input => {
          input.addEventListener('input', (e: any) => {
            const tr = e.target.closest('tr');
            const idx = parseInt(tr.dataset.stockIdx);
            recalculateRow(idx);
          });
        });

      } catch (err) {
        showToast('Error al cargar existencias: ' + err.message, 'error');
      }
    });

    document.getElementById('wz-btn-back-step1')?.addEventListener('click', () => {
      document.getElementById('cons-wizard-step2')!.style.display = 'none';
      document.getElementById('cons-wizard-step1')!.style.display = 'block';
    });

    // Navigation Step 2 -> Step 3
    document.getElementById('wz-btn-go-step3')?.addEventListener('click', () => {
      const type = typeSel.value;
      const partyText = partySearchInput.value;
      const whText = whSel.options[whSel.selectedIndex].text;
      const date = (document.getElementById('wz-date') as HTMLInputElement).value;

      let totalVal = 0;
      let hasLines = false;

      for (let i = 0; i < step2Products.length; i++) {
        const sold = parseFloat((document.getElementById(`wz-qty-sold-${i}`) as HTMLInputElement).value || '0');
        const ret = parseFloat((document.getElementById(`wz-qty-ret-${i}`) as HTMLInputElement).value || '0');
        
        const stock = step2Products[i].qty_on_hand || 0;
        if (sold + ret > stock) {
          showToast(`La cantidad liquidada/devuelta para el producto ${step2Products[i].expand?.product_id?.name} supera el stock actual.`, 'warning');
          return;
        }

        if (sold > 0 || ret > 0) {
          hasLines = true;
          const cost = type === 'INBOUND' ? (step2Products[i].expand?.product_id?.consignment_cost || step2Products[i].expand?.product_id?.cost_price || 0) : (step2Products[i].expand?.product_id?.base_price || 0);
          totalVal += sold * cost;
        }
      }

      if (!hasLines) {
        return showToast('Ingresa al menos una cantidad a liquidar o devolver.', 'warning');
      }

      document.getElementById('wz-summary-type')!.textContent = type === 'INBOUND' ? 'Inbound (De Proveedores)' : 'Outbound (A Clientes)';
      document.getElementById('wz-summary-party')!.textContent = partyText;
      document.getElementById('wz-summary-wh')!.textContent = whText;
      document.getElementById('wz-summary-date')!.textContent = date;
      document.getElementById('wz-summary-total')!.textContent = fmt(totalVal);

      document.getElementById('cons-wizard-step2')!.style.display = 'none';
      document.getElementById('cons-wizard-step3')!.style.display = 'block';
    });

    document.getElementById('wz-btn-back-step2')?.addEventListener('click', () => {
      document.getElementById('cons-wizard-step3')!.style.display = 'none';
      document.getElementById('cons-wizard-step2')!.style.display = 'block';
    });

    // Save logic
    const saveSettlement = async (postImmediately = false) => {
      const type = typeSel.value;
      const partyId = partyIdHidden.value;
      const whId = whSel.value;
      const date = (document.getElementById('wz-date') as HTMLInputElement).value;
      const returnWhId = (document.getElementById('wz-return-wh') as HTMLSelectElement).value;
      const notes = (document.getElementById('wz-notes') as HTMLTextAreaElement).value.trim();

      const linesData = [];
      for (let i = 0; i < step2Products.length; i++) {
        const sold = parseFloat((document.getElementById(`wz-qty-sold-${i}`) as HTMLInputElement).value || '0');
        const ret = parseFloat((document.getElementById(`wz-qty-ret-${i}`) as HTMLInputElement).value || '0');
        const cost = type === 'INBOUND' ? (step2Products[i].expand?.product_id?.consignment_cost || step2Products[i].expand?.product_id?.cost_price || 0) : (step2Products[i].expand?.product_id?.base_price || 0);
        
        if (sold > 0 || ret > 0) {
          linesData.push({
            product_id: step2Products[i].product_id,
            qty_sold: sold,
            qty_returned: ret,
            unit_cost: cost,
            subtotal: sold * cost,
          });
        }
      }

      const activeBranchId = localStorage.getItem('active_branch_id');
      const targetBranchId = (activeBranchId && activeBranchId !== 'TODAS') ? activeBranchId : (pb.currentUser?.default_branch_id || null);

      const header = {
        type,
        third_party_id: partyId,
        warehouse_id: whId,
        date,
        notes,
        return_warehouse_id: returnWhId || null,
        branch_id: targetBranchId,
      };

      try {
        const res = await API.createConsignmentSettlement(header, linesData);
        if (postImmediately) {
          await API.postConsignmentSettlement(res.id);
          showToast('Liquidación contabilizada exitosamente', 'success');
        } else {
          showToast('Liquidación guardada en borrador', 'success');
        }
        closeModal();
        renderConsignacionesTab(document.getElementById('inv-tab-content')!, {});
      } catch (err) {
        showToast('Error al guardar: ' + err.message, 'error');
      }
    };

    document.getElementById('wz-btn-save-draft')?.addEventListener('click', () => saveSettlement(false));
    document.getElementById('wz-btn-post')?.addEventListener('click', () => saveSettlement(true));

  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function viewConsignmentSettlementDetail(id) {
  openModal('Cargando...', `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>`, '', true);
  try {
    const [settle, lines] = await Promise.all([
      pb.get('consignment_settlements', id, { expand: 'third_party_id,warehouse_id,invoice_id,purchase_invoice_id' }),
      API.getConsignmentSettlementLines(id)
    ]);

    const badgeClass = settle.status === 'posted' ? 'badge-green' : (settle.status === 'voided' ? 'badge-orange' : 'badge-gray');
    const label = settle.status === 'posted' ? 'Aplicada' : (settle.status === 'voided' ? 'Anulada' : 'Borrador');
    const typeLabel = settle.type === 'INBOUND' ? 'Inbound (De Proveedores)' : 'Outbound (A Clientes)';

    let linkDocHtml = '—';
    if (settle.invoice_id) {
      linkDocHtml = `<a href="#" onclick="closeModal(); (window as any).seeInvoiceDetail && (window as any).seeInvoiceDetail('${settle.invoice_id}'); return false;" class="text-blue-600 hover:underline font-semibold"><i class="fas fa-file-invoice mr-1 text-xs"></i>FV-${settle.expand?.invoice_id?.number || settle.invoice_id}</a>`;
    } else if (settle.purchase_invoice_id) {
      linkDocHtml = `<a href="#" onclick="closeModal(); (window as any).seePurchaseDetail && (window as any).seePurchaseDetail('${settle.purchase_invoice_id}'); return false;" class="text-blue-600 hover:underline font-semibold"><i class="fas fa-file-invoice mr-1 text-xs"></i>FC-${settle.expand?.purchase_invoice_id?.number || settle.purchase_invoice_id}</a>`;
    }

    const totalVal = lines.reduce((a, l) => a + (l.subtotal || 0), 0);

    openModal(
      `Liquidación — ${esc(settle.number)}`,
      `
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs mb-4">
        <div><span class="form-label">Número</span><p class="font-mono font-semibold" style="color:#1A4B8C">${esc(settle.number)}</p></div>
        <div><span class="form-label">Tipo</span><p class="font-semibold text-gray-800">${typeLabel}</p></div>
        <div><span class="form-label">Fecha</span><p>${esc(settle.date)}</p></div>
        <div><span class="form-label">Bodega Consignación</span><p>${esc(settle.expand?.warehouse_id?.name || '—')}</p></div>
        <div><span class="form-label">Estado</span><p><span class="badge ${badgeClass}">${label}</span></p></div>
        <div><span class="form-label">Tercero Relacionado</span><p>${esc(settle.expand?.third_party_id?.name || '—')}</p></div>
        <div><span class="form-label">Documento Relacionado</span><p>${linkDocHtml}</p></div>
        ${settle.notes ? `<div class="md:col-span-3"><span class="form-label">Notas</span><p>${esc(settle.notes)}</p></div>` : ''}
      </div>
      <div class="border rounded-xl overflow-hidden mb-2" style="border-color:#F0F0F0">
        <table class="data-table text-xs">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Código</th>
              <th class="text-right">Cant. Vendida</th>
              <th class="text-right">Cant. Devuelta</th>
              <th class="text-right">Precio/Costo Unit.</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${lines.map(l => {
              const pName = l.expand?.product_id?.name || '—';
              const pCode = l.expand?.product_id?.code || '—';
              return `
                <tr>
                  <td>${esc(pName)}</td>
                  <td class="font-mono text-[10px] text-gray-500">${esc(pCode)}</td>
                  <td class="text-right">${fmtN(l.qty_sold)}</td>
                  <td class="text-right">${fmtN(l.qty_returned)}</td>
                  <td class="text-right">${fmt(l.unit_cost)}</td>
                  <td class="text-right font-semibold">${fmt(l.subtotal)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="font-bold">
              <td colspan="5" class="text-right py-2">Total Consolidado:</td>
              <td class="text-right py-2 text-violet-700 font-bold">${fmt(totalVal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      `,
      `<button class="btn btn-primary" onclick="closeModal()">Cerrar</button>`,
      false
    );

  } catch (err) {
    showToast('Error al cargar detalle: ' + err.message, 'error');
  }
}

async function applyConsignmentSettlement(id) {
  confirmDialog(
    'Contabilizar Liquidación',
    '¿Confirmas contabilizar esta liquidación? Se generará el documento contable de venta/compra y se descargarán las existencias físicamente.',
    async () => {
      try {
        await API.postConsignmentSettlement(id);
        showToast('Liquidación contabilizada exitosamente.', 'success');
        renderConsignacionesTab(document.getElementById('inv-tab-content')!, {});
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  );
}

async function voidConsignmentSettlement(id, number) {
  confirmDialog(
    'Anular Liquidación',
    `¿Confirmas anular la liquidación ${esc(number)}? Se anularán las facturas de venta/compra vinculadas y se revertirá el inventario.`,
    async () => {
      try {
        await API.voidConsignmentSettlement(id);
        showToast('Liquidación anulada y transacciones revertidas.', 'success');
        renderConsignacionesTab(document.getElementById('inv-tab-content')!, {});
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  );
}

async function deleteConsignmentSettlement(id, number) {
  confirmDialog(
    'Eliminar Liquidación',
    `¿Confirmas eliminar permanentemente el borrador de la liquidación ${esc(number)}? Esta acción es irreversible.`,
    async () => {
      try {
        // Borrar líneas
        const lines = await API.getConsignmentSettlementLines(id);
        for (const l of lines) {
          await pb.delete('consignment_settlement_lines', l.id);
        }
        // Borrar cabecera
        await pb.delete('consignment_settlements', id);
        showToast('Borrador eliminado.', 'success');
        renderConsignacionesTab(document.getElementById('inv-tab-content')!, {});
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  );
}

// Asignar funciones globales al objeto window para su ejecución en onclick
(window as any).openInventoryConfigModal = openInventoryConfigModal;
(window as any).renumberInventoryMovements = renumberInventoryMovements;
(window as any).editMovement = editMovement;
(window as any).viewMovDetail = viewMovDetail;
(window as any).applyMovement = applyMovement;
(window as any).voidMovement = voidMovement;
(window as any).openMovForm = openMovForm;
(window as any).renderConsignacionesTab = renderConsignacionesTab;
(window as any).openConsignmentSettlementWizard = openConsignmentSettlementWizard;
(window as any).viewConsignmentSettlementDetail = viewConsignmentSettlementDetail;
(window as any).applyConsignmentSettlement = applyConsignmentSettlement;
(window as any).voidConsignmentSettlement = voidConsignmentSettlement;
(window as any).deleteConsignmentSettlement = deleteConsignmentSettlement;
(window as any)._deleteInventoryMovement = _deleteInventoryMovement;



