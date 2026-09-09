/**
 * GRAVY v2.0 — ordenes-compra.ts
 * Módulo de Administración de Órdenes de Compra (OC).
 * Diseñado con paridad operativa y visual al módulo de Pedidos de Venta.
 * Permite gestionar compromisos comerciales con proveedores con numeración propia y configurable,
 * imprimir órdenes formales y convertirlas directamente en facturas de compra.
 */
'use strict';

interface POStatusDetail {
  label: string;
  badge: string;
}

const PO_STATUS_MAP: Record<string, POStatusDetail> = {
  pending:   { label: 'Pendiente', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  invoiced:  { label: 'Facturada', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Anulada',   badge: 'bg-rose-100 text-rose-800 border-rose-200' },
};

(window as any).renderOrdenesCompra = async function(c: HTMLElement) {
  c.innerHTML = `
    <div class="p-12 text-center text-slate-400">
      <i class="fas fa-spinner fa-spin mr-2 text-indigo-600 text-lg"></i>Cargando órdenes de compra...
    </div>
  `;

  try {
    const pb = (window as any).pb;
    const api = (window as any).API;
    const fmt = (window as any).fmt;
    const fmtN = (window as any).fmtN;
    const esc = (window as any).esc;

    const [suppliers, warehouses, products] = await Promise.all([
      pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }).catch(() => []),
      api.getWarehouses(false).catch(() => []),
      api.getProducts({ activeOnly: true }).catch(() => [])
    ]);

    const physicalProducts = products.filter((p: any) => p.type === 'BIEN');

    let state = {
      page: 1,
      perPage: 25,
      statusFilter: 'TODOS',
      supplierFilter: 'TODOS',
      searchQuery: '',
      orders: [] as any[],
      totalItems: 0,
      totalPages: 1,
      isLoading: false
    };

    // Montar layout principal
    c.innerHTML = `
      <div id="po-root" class="space-y-6">
        <!-- Encabezado de Página -->
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-lg shadow-md shadow-emerald-200">
              <i class="fas fa-clipboard-list"></i>
            </span>
            <div>
              <h3 class="text-xl font-black text-slate-900 leading-tight">Órdenes de Compra</h3>
              <p class="text-xs text-slate-500 font-medium">Administración y control de pedidos comerciales emitidos a proveedores.</p>
            </div>
          </div>

          <div class="flex items-center gap-2.5">
            <button id="po-btn-config" class="px-3.5 py-2 text-xs font-bold flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:border-orange-300 transition-all shadow-xs cursor-pointer">
              <i class="fas fa-cog text-orange-600"></i> Consecutivo
            </button>
            <button id="po-btn-sugerida" class="px-3.5 py-2 text-xs font-bold flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-all shadow-xs cursor-pointer">
              <i class="fas fa-wand-magic-sparkles text-emerald-600"></i> Compra Sugerida
            </button>
            <button id="po-btn-new" class="px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer">
              <i class="fas fa-plus"></i> Nueva Orden
            </button>
          </div>
        </div>

        <!-- Filtros Rápidos -->
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-end gap-3">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Buscar Orden</label>
            <div class="relative">
              <input id="po-search" type="text" placeholder="Número, proveedor o notas..." class="form-input w-full text-xs pl-8 h-[36px]">
              <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            </div>
          </div>

          <div class="w-[180px]">
            <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Estado</label>
            <select id="po-filter-status" class="form-input w-full text-xs h-[36px]">
              <option value="TODOS">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="invoiced">Facturadas</option>
              <option value="cancelled">Anuladas</option>
            </select>
          </div>

          <div class="w-[220px]">
            <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Proveedor</label>
            <select id="po-filter-supplier" class="form-input w-full text-xs h-[36px]">
              <option value="TODOS">[ Todos los proveedores ]</option>
              ${suppliers.map((s: any) => `<option value="${s.id}">${esc(s.name || s.trade_name)}</option>`).join('')}
            </select>
          </div>

          <button id="po-btn-refresh" class="px-3.5 py-2 h-[36px] flex items-center gap-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs cursor-pointer" title="Actualizar lista">
            <i class="fas fa-arrows-rotate text-slate-500"></i>
          </button>
        </div>

        <!-- Tabla de Órdenes de Compra -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th class="p-3.5">Número</th>
                  <th class="p-3.5">Fecha</th>
                  <th class="p-3.5">Proveedor</th>
                  <th class="p-3.5">Bodega Destino</th>
                  <th class="p-3.5 text-right">Subtotal</th>
                  <th class="p-3.5 text-right">Total</th>
                  <th class="p-3.5 text-center">Estado</th>
                  <th class="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody id="po-table-body" class="divide-y divide-slate-100 text-xs">
                <tr>
                  <td colspan="8" class="p-8 text-center text-slate-400">
                    <i class="fas fa-spinner fa-spin mr-2 text-indigo-600"></i>Cargando órdenes...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div class="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <span id="po-pagination-info">Mostrando 0 de 0 órdenes</span>
            <div class="flex items-center gap-1" id="po-pagination-buttons"></div>
          </div>
        </div>
      </div>

      <!-- Modal de Consecutivo -->
      <div id="po-modal-config" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center hidden">
        <div class="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 border border-slate-100 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <i class="fas fa-cog text-orange-600"></i> Consecutivo de Órdenes de Compra
            </h4>
            <button type="button" class="po-close-modal text-slate-400 hover:text-slate-600 text-sm">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Prefijo</label>
              <input id="cfg-po-prefix" type="text" value="OC" class="form-input w-full text-xs" placeholder="Ej: OC">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Relleno de Ceros (Padding)</label>
              <input id="cfg-po-padding" type="number" min="1" max="10" value="4" class="form-input w-full text-xs">
              <p class="text-[11px] text-slate-400 mt-1">Con padding 4, el número 1 se mostrará como OC-0001.</p>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Siguiente Número</label>
              <input id="cfg-po-next" type="number" min="1" value="1" class="form-input w-full text-xs">
            </div>
          </div>
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" class="po-close-modal px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">Cancelar</button>
            <button type="button" id="po-btn-save-config" class="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 transition-all cursor-pointer">Guardar Cambios</button>
          </div>
        </div>
      </div>

      <!-- Modal de Creación / Edición de Orden de Compra -->
      <div id="po-modal-form" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center hidden p-4 overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-100 flex flex-col max-h-[90vh]">
          <div class="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h4 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <i class="fas fa-file-invoice text-emerald-600"></i> <span id="po-modal-title">Nueva Orden de Compra</span>
            </h4>
            <button type="button" class="po-close-modal text-slate-400 hover:text-slate-600 text-sm">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="p-6 space-y-4 overflow-y-auto flex-1">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Proveedor *</label>
                <select id="pof-supplier" class="form-input w-full text-xs">
                  <option value="">Selecciona proveedor...</option>
                  ${suppliers.map((s: any) => `<option value="${s.id}">${esc(s.name || s.trade_name)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Bodega Destino</label>
                <select id="pof-warehouse" class="form-input w-full text-xs">
                  ${warehouses.map((w: any) => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha Emisión</label>
                <input id="pof-date" type="date" value="${(window as any).todayStr()}" class="form-input w-full text-xs">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha Estimada de Entrega</label>
                <input id="pof-due-date" type="date" class="form-input w-full text-xs">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase mb-1">Notas / Instrucciones de Entrega</label>
                <input id="pof-notes" type="text" placeholder="Condiciones comerciales, transporte, etc." class="form-input w-full text-xs">
              </div>
            </div>

            <!-- Grilla de Líneas de la Orden -->
            <div class="pt-2">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Productos de la Orden</span>
                <button type="button" id="pof-btn-add-line" class="px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer">
                  <i class="fas fa-plus text-emerald-600"></i> Agregar Producto
                </button>
              </div>

              <div class="border border-slate-200 rounded-xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th class="p-2.5">Producto</th>
                      <th class="p-2.5 w-24 text-right">Cantidad</th>
                      <th class="p-2.5 w-28 text-right">Precio Pactado</th>
                      <th class="p-2.5 w-28 text-right">Subtotal</th>
                      <th class="p-2.5 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody id="pof-lines-body" class="divide-y divide-slate-100">
                    <!-- Filas inyectadas -->
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Totales -->
            <div class="flex justify-end pt-3">
              <div class="w-64 space-y-1.5 text-xs">
                <div class="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span class="font-bold" id="pof-subtotal">$0</span>
                </div>
                <div class="flex justify-between text-slate-600">
                  <span>IVA (Estimado):</span>
                  <span class="font-bold" id="pof-iva">$0</span>
                </div>
                <div class="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-100">
                  <span>Total Orden:</span>
                  <span class="text-emerald-600" id="pof-total">$0</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/50 rounded-b-2xl">
            <button type="button" class="po-close-modal px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-all cursor-pointer">Cancelar</button>
            <button type="button" id="pof-btn-save" class="px-5 py-2 text-xs font-bold flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer">
              <i class="fas fa-save"></i> Guardar Orden de Compra
            </button>
          </div>
        </div>
      </div>
    `;

    // Cargar órdenes
    async function loadOrders() {
      const tbody = document.getElementById('po-table-body');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="p-8 text-center text-slate-400">
              <i class="fas fa-spinner fa-spin mr-2 text-indigo-600"></i>Consultando órdenes...
            </td>
          </tr>
        `;
      }

      try {
        let filters: string[] = [];
        if (state.statusFilter !== 'TODOS') {
          filters.push(`status = "${pb.escapeFilterValue(state.statusFilter)}"`);
        }
        if (state.supplierFilter !== 'TODOS') {
          filters.push(`supplier_id = "${pb.escapeFilterValue(state.supplierFilter)}"`);
        }
        if (state.searchQuery.trim()) {
          const q = pb.escapeFilterValue(state.searchQuery.trim());
          filters.push(`(number ~ "${q}" || notes ~ "${q}")`);
        }

        const filterStr = filters.join(' && ');
        const res = await api.getPurchaseOrders({
          page: state.page,
          perPage: state.perPage,
          filter: filterStr,
          sort: '-date,-created'
        });

        state.orders = res.items || [];
        state.totalItems = res.totalItems || 0;
        state.totalPages = res.totalPages || 1;

        renderOrdersTable();
      } catch (err: any) {
        if (tbody) {
          tbody.innerHTML = `
            <tr>
              <td colspan="8" class="p-8 text-center text-rose-500 font-bold">
                <i class="fas fa-circle-exclamation mr-2"></i>Error al cargar órdenes: ${err.message}
              </td>
            </tr>
          `;
        }
      }
    }

    // Renderizado de tabla
    function renderOrdersTable() {
      const tbody = document.getElementById('po-table-body');
      if (!tbody) return;

      if (state.orders.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="8" class="p-8 text-center text-slate-400">
              <i class="fas fa-folder-open mr-2"></i>No se encontraron órdenes de compra con los filtros actuales.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = state.orders.map(o => {
          const statusInfo = PO_STATUS_MAP[o.status] || { label: o.status, badge: 'bg-slate-100 text-slate-700' };
          const suppName = o.expand?.supplier_id?.name || o.expand?.supplier_id?.trade_name || 'Sin proveedor';
          const whName = o.expand?.warehouse_id?.name || 'General';

          return `
            <tr class="hover:bg-slate-50 transition-colors">
              <td class="p-3.5 font-bold font-mono text-indigo-600">
                ${esc(o.number)}
              </td>
              <td class="p-3.5 text-slate-600">
                ${esc(o.date)}
                ${o.due_date ? `<div class="text-[10px] text-slate-400">Entr: ${esc(o.due_date)}</div>` : ''}
              </td>
              <td class="p-3.5 font-semibold text-slate-800 max-w-[200px] truncate" title="${esc(suppName)}">
                ${esc(suppName)}
              </td>
              <td class="p-3.5 text-slate-600">
                ${esc(whName)}
              </td>
              <td class="p-3.5 text-right font-medium text-slate-600">
                ${fmt(o.subtotal || 0)}
              </td>
              <td class="p-3.5 text-right font-bold text-slate-900">
                ${fmt(o.total || 0)}
              </td>
              <td class="p-3.5 text-center">
                <span class="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusInfo.badge}">
                  ${statusInfo.label}
                </span>
              </td>
              <td class="p-3.5 text-center">
                <div class="inline-flex items-center gap-1.5">
                  ${o.status === 'pending' ? `
                    <button type="button" class="po-action-bill p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors" data-id="${o.id}" title="Facturar / Recibir en Compras">
                      <i class="fas fa-file-invoice-dollar"></i>
                    </button>
                  ` : ''}
                  <button type="button" class="po-action-print p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors" data-id="${o.id}" title="Imprimir Orden">
                    <i class="fas fa-print"></i>
                  </button>
                  ${o.status === 'pending' ? `
                    <button type="button" class="po-action-cancel p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors" data-id="${o.id}" title="Anular Orden">
                      <i class="fas fa-ban"></i>
                    </button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }

      // Paginación info
      const pInfo = document.getElementById('po-pagination-info');
      if (pInfo) {
        const start = (state.page - 1) * state.perPage + 1;
        const end = Math.min(start + state.orders.length - 1, state.totalItems);
        pInfo.innerText = state.totalItems > 0 ? `Mostrando ${start} - ${end} de ${state.totalItems} órdenes` : 'Mostrando 0 de 0 órdenes';
      }

      // Botones paginación
      const pBtns = document.getElementById('po-pagination-buttons');
      if (pBtns) {
        if (state.totalPages <= 1) {
          pBtns.innerHTML = '';
        } else {
          let h = '';
          h += `<button type="button" class="po-page-btn px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold ${state.page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'}" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
          for (let i = 1; i <= state.totalPages; i++) {
            h += `<button type="button" class="po-page-btn px-3 py-1 rounded-lg text-xs font-bold ${i === state.page ? 'bg-emerald-600 text-white shadow-xs' : 'border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer'}" data-page="${i}">${i}</button>`;
          }
          h += `<button type="button" class="po-page-btn px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold ${state.page === state.totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'}" data-page="${state.page + 1}" ${state.page === state.totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
          pBtns.innerHTML = h;
        }
      }
    }

    // Modal de Consecutivo
    const modalConfig = document.getElementById('po-modal-config');
    const btnConfig = document.getElementById('po-btn-config');
    btnConfig?.addEventListener('click', async () => {
      const cfg = await api.getPurchaseOrderConfig();
      (document.getElementById('cfg-po-prefix') as HTMLInputElement).value = cfg.prefix || 'OC';
      (document.getElementById('cfg-po-padding') as HTMLInputElement).value = String(cfg.padding || 4);
      (document.getElementById('cfg-po-next') as HTMLInputElement).value = String(cfg.next_number || 1);
      modalConfig?.classList.remove('hidden');
    });

    const btnSaveConfig = document.getElementById('po-btn-save-config');
    btnSaveConfig?.addEventListener('click', async () => {
      const prefix = (document.getElementById('cfg-po-prefix') as HTMLInputElement).value.trim().toUpperCase() || 'OC';
      const padding = parseInt((document.getElementById('cfg-po-padding') as HTMLInputElement).value) || 4;
      const next_number = parseInt((document.getElementById('cfg-po-next') as HTMLInputElement).value) || 1;

      await api.savePurchaseOrderConfig({ prefix, padding, next_number });
      (window as any).showToast('Configuración de consecutivo guardada exitosamente', 'success');
      modalConfig?.classList.add('hidden');
    });

    // Cerrar modales
    document.querySelectorAll('.po-close-modal').forEach(b => {
      b.addEventListener('click', () => {
        document.getElementById('po-modal-config')?.classList.add('hidden');
        document.getElementById('po-modal-form')?.classList.add('hidden');
      });
    });

    // Botón ir a Compra Sugerida
    document.getElementById('po-btn-sugerida')?.addEventListener('click', () => {
      (window as any).navigate('compra-sugerida');
    });

    // Modal de Nueva Orden Manual
    let formLines: any[] = [];
    const modalForm = document.getElementById('po-modal-form');
    const btnNew = document.getElementById('po-btn-new');
    btnNew?.addEventListener('click', () => {
      formLines = [];
      addFormLine();
      updateFormTotals();
      modalForm?.classList.remove('hidden');
    });

    function addFormLine() {
      formLines.push({
        product_id: physicalProducts[0]?.id || '',
        qty: 1,
        unit_price: physicalProducts[0]?.cost_price || 0,
        iva_rate: 0,
        subtotal: physicalProducts[0]?.cost_price || 0,
        total: physicalProducts[0]?.cost_price || 0
      });
      renderFormLines();
    }

    function renderFormLines() {
      const tbody = document.getElementById('pof-lines-body');
      if (!tbody) return;

      tbody.innerHTML = formLines.map((line, idx) => `
        <tr data-idx="${idx}">
          <td class="p-2.5">
            <select class="form-input w-full text-xs pof-line-prod" data-idx="${idx}">
              ${physicalProducts.map((p: any) => `
                <option value="${p.id}" ${p.id === line.product_id ? 'selected' : ''}>${esc(p.code)} - ${esc(p.name)}</option>
              `).join('')}
            </select>
          </td>
          <td class="p-2.5">
            <input type="number" min="1" value="${line.qty}" class="form-input w-full text-xs text-right pof-line-qty" data-idx="${idx}">
          </td>
          <td class="p-2.5">
            <input type="number" min="0" value="${line.unit_price}" class="form-input w-full text-xs text-right pof-line-price" data-idx="${idx}">
          </td>
          <td class="p-2.5 text-right font-bold text-slate-800">
            ${fmt(line.subtotal)}
          </td>
          <td class="p-2.5 text-center">
            <button type="button" class="pof-line-del text-rose-500 hover:text-rose-700 p-1" data-idx="${idx}" title="Eliminar fila">
              <i class="fas fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `).join('');

      updateFormTotals();
    }

    function updateFormTotals() {
      let sub = 0;
      for (const l of formLines) {
        l.subtotal = l.qty * l.unit_price;
        l.total = l.subtotal;
        sub += l.subtotal;
      }
      const subEl = document.getElementById('pof-subtotal');
      const totEl = document.getElementById('pof-total');
      if (subEl) subEl.innerText = fmt(sub);
      if (totEl) totEl.innerText = fmt(sub);
    }

    // Delegación eventos del modal de líneas
    const pofLinesBody = document.getElementById('pof-lines-body');
    pofLinesBody?.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      const idx = parseInt(target.dataset.idx || '-1');
      if (idx < 0 || idx >= formLines.length) return;

      if (target.classList.contains('pof-line-prod')) {
        const sel = target as HTMLSelectElement;
        const pObj = physicalProducts.find((p: any) => p.id === sel.value);
        formLines[idx].product_id = sel.value;
        if (pObj) {
          formLines[idx].unit_price = pObj.cost_price || 0;
        }
        renderFormLines();
      } else if (target.classList.contains('pof-line-qty')) {
        formLines[idx].qty = Math.max(1, parseInt((target as HTMLInputElement).value) || 1);
        renderFormLines();
      } else if (target.classList.contains('pof-line-price')) {
        formLines[idx].unit_price = Math.max(0, Number((target as HTMLInputElement).value) || 0);
        renderFormLines();
      }
    });

    pofLinesBody?.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.pof-line-del') as HTMLButtonElement;
      if (target) {
        const idx = parseInt(target.dataset.idx || '-1');
        if (idx >= 0 && formLines.length > 1) {
          formLines.splice(idx, 1);
          renderFormLines();
        }
      }
    });

    document.getElementById('pof-btn-add-line')?.addEventListener('click', addFormLine);

    // Guardar nueva orden manual
    document.getElementById('pof-btn-save')?.addEventListener('click', async () => {
      const supplierId = (document.getElementById('pof-supplier') as HTMLSelectElement)?.value;
      if (!supplierId) {
        (window as any).showToast('Debes seleccionar un proveedor.', 'warning');
        return;
      }

      if (!formLines.length) {
        (window as any).showToast('Agrega al menos un producto a la orden.', 'warning');
        return;
      }

      const warehouseId = (document.getElementById('pof-warehouse') as HTMLSelectElement)?.value || null;
      const date = (document.getElementById('pof-date') as HTMLInputElement)?.value || (window as any).todayStr();
      const dueDate = (document.getElementById('pof-due-date') as HTMLInputElement)?.value || null;
      const notes = (document.getElementById('pof-notes') as HTMLInputElement)?.value || '';

      const btnSave = document.getElementById('pof-btn-save') as HTMLButtonElement;
      btnSave.disabled = true;

      try {
        const linesPayload = formLines.map(l => {
          const pObj = physicalProducts.find((p: any) => p.id === l.product_id);
          return {
            product_id: l.product_id,
            description: pObj ? `${pObj.code} - ${pObj.name}` : 'Producto',
            qty: l.qty,
            unit_price: l.unit_price,
            iva_rate: 0,
            iva_amount: 0,
            subtotal: l.qty * l.unit_price,
            total: l.qty * l.unit_price
          };
        });

        const header = {
          number: 'AUTO',
          supplier_id: supplierId,
          warehouse_id: warehouseId,
          date,
          due_date: dueDate,
          notes,
          discount_amount: 0
        };

        const created = await api.createPurchaseOrder(header, linesPayload);
        (window as any).showToast(`Orden de compra ${created.number} creada exitosamente`, 'success');
        modalForm?.classList.add('hidden');
        await loadOrders();
      } catch (err: any) {
        (window as any).showToast(`Error al guardar orden: ${err.message}`, 'error');
      } finally {
        btnSave.disabled = false;
      }
    });

    // Delegación eventos de tabla de órdenes (Facturar, Imprimir, Anular)
    const tbody = document.getElementById('po-table-body');
    tbody?.addEventListener('click', async (e) => {
      const btnBill = (e.target as HTMLElement).closest('.po-action-bill') as HTMLButtonElement;
      const btnPrint = (e.target as HTMLElement).closest('.po-action-print') as HTMLButtonElement;
      const btnCancel = (e.target as HTMLElement).closest('.po-action-cancel') as HTMLButtonElement;

      if (btnBill) {
        const orderId = btnBill.dataset.id;
        if (orderId) {
          localStorage.setItem('preloaded_purchase_order_id', orderId);
          (window as any).navigate('compras');
          setTimeout(() => {
            if (typeof (window as any).openPurchaseForm === 'function') {
              (window as any).openPurchaseForm(null, () => {
                const pane = document.getElementById('tab-pane-compras');
                if (pane && typeof (window as any).renderCompras === 'function') {
                  (window as any).renderCompras(pane);
                }
              }, null, null, orderId);
            }
          }, 100);
        }
        return;
      }

      if (btnPrint) {
        const orderId = btnPrint.dataset.id;
        if (orderId) {
          printPurchaseOrder(orderId);
        }
        return;
      }

      if (btnCancel) {
        const orderId = btnCancel.dataset.id;
        if (orderId && confirm('¿Estás seguro de anular esta orden de compra?')) {
          try {
            await api.cancelPurchaseOrder(orderId, 'Anulada por el usuario');
            (window as any).showToast('Orden de compra anulada correctamente', 'success');
            await loadOrders();
          } catch (err: any) {
            (window as any).showToast(`Error al anular: ${err.message}`, 'error');
          }
        }
        return;
      }
    });

    // Paginación clicks
    document.getElementById('po-pagination-buttons')?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.po-page-btn') as HTMLButtonElement;
      if (btn && !btn.disabled) {
        const p = parseInt(btn.dataset.page || '1');
        if (p && p !== state.page) {
          state.page = p;
          loadOrders();
        }
      }
    });

    // Filtros
    let searchDebounce: any;
    document.getElementById('po-search')?.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        state.searchQuery = (e.target as HTMLInputElement).value;
        state.page = 1;
        loadOrders();
      }, 200);
    });

    document.getElementById('po-filter-status')?.addEventListener('change', (e) => {
      state.statusFilter = (e.target as HTMLSelectElement).value;
      state.page = 1;
      loadOrders();
    });

    document.getElementById('po-filter-supplier')?.addEventListener('change', (e) => {
      state.supplierFilter = (e.target as HTMLSelectElement).value;
      state.page = 1;
      loadOrders();
    });

    document.getElementById('po-btn-refresh')?.addEventListener('click', () => {
      state.page = 1;
      loadOrders();
    });

    // Función de impresión formal de Orden de Compra
    async function printPurchaseOrder(orderId: string) {
      try {
        const order = await pb.get('purchase_orders', orderId, { expand: 'supplier_id,warehouse_id,user_id' });
        const lines = await api.getPurchaseOrderLines(orderId);
        let company: any = { name: 'GRAVY ERP', legal_name: 'GRAVY ERP', nit: '' };
        if (typeof api.getCompanyInfo === 'function') {
          company = await api.getCompanyInfo().catch(() => company);
        } else if (typeof api.getSetting === 'function') {
          const cName = await api.getSetting('company_name').catch(() => '');
          const cNit = await api.getSetting('company_nit').catch(() => '');
          if (cName) company.legal_name = cName;
          if (cNit) company.nit = cNit;
        }

        const supp = order.expand?.supplier_id || {};
        const wh = order.expand?.warehouse_id || {};

        const printWin = window.open('', '_blank');
        if (!printWin) return;

        printWin.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Orden de Compra - ${order.number}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
              .doc-title { font-size: 24px; font-weight: 800; color: #4338ca; }
              .doc-number { font-size: 16px; font-weight: bold; color: #64748b; margin-top: 4px; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; font-size: 13px; }
              .info-box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
              .info-box h5 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #64748b; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
              th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; }
              td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
              .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
              .totals-table { width: 280px; font-size: 13px; }
              .totals-table td { padding: 6px 12px; }
              .grand-total { font-size: 16px; font-weight: 800; color: #4338ca; border-top: 2px solid #cbd5e1; }
              .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 60px; text-align: center; font-size: 12px; color: #64748b; }
              .sig-line { border-top: 1px solid #94a3b8; padding-top: 8px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h2>${company.legal_name || company.trade_name || 'MI EMPRESA'}</h2>
                <div style="font-size: 12px; color: #64748b;">NIT: ${company.nit || ''}</div>
              </div>
              <div style="text-align: right;">
                <div class="doc-title">ORDEN DE COMPRA</div>
                <div class="doc-number">${order.number}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Fecha: ${order.date}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-box">
                <h5>Datos del Proveedor</h5>
                <strong>${supp.name || supp.trade_name || 'Sin nombre'}</strong><br>
                NIT / Doc: ${supp.identification || 'N/A'}<br>
                Tel: ${supp.phone || 'N/A'}<br>
                Email: ${supp.email || 'N/A'}
              </div>
              <div class="info-box">
                <h5>Destino y Entrega</h5>
                Bodega: <strong>${wh.name || 'General'}</strong><br>
                Fecha Entrega Requerida: <strong>${order.due_date || 'Inmediata'}</strong><br>
                Instrucciones: ${order.notes || 'Ninguna'}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Ítem</th>
                  <th>Descripción</th>
                  <th style="text-align: right;">Cantidad</th>
                  <th style="text-align: right;">Precio Unit.</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${lines.map((l: any, idx: number) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${esc(l.description || l.expand?.product_id?.name || 'Ítem')}</td>
                    <td style="text-align: right;">${fmtN(l.qty)}</td>
                    <td style="text-align: right;">${fmt(l.unit_price)}</td>
                    <td style="text-align: right;">${fmt(l.total)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="totals">
              <table class="totals-table">
                <tr><td>Subtotal:</td><td style="text-align: right;"><strong>${fmt(order.subtotal || 0)}</strong></td></tr>
                <tr><td>IVA:</td><td style="text-align: right;"><strong>${fmt(order.iva_total || 0)}</strong></td></tr>
                <tr class="grand-total"><td>Total:</td><td style="text-align: right;">${fmt(order.total || 0)}</td></tr>
              </table>
            </div>

            <div class="signatures">
              <div><div class="sig-line">Autorizado por (Compras)</div></div>
              <div><div class="sig-line">Aceptado por (Proveedor)</div></div>
            </div>

            <script>window.print();</script>
          </body>
          </html>
        `);
        printWin.document.close();
      } catch (err: any) {
        (window as any).showToast(`Error al imprimir orden: ${err.message}`, 'error');
      }
    }

    // Carga inicial
    await loadOrders();

  } catch (err: any) {
    c.innerHTML = `
      <div class="p-8 text-center text-rose-500 font-bold">
        <i class="fas fa-circle-exclamation mr-2"></i>Error al cargar módulo de órdenes de compra: ${err.message}
      </div>
    `;
  }
};
