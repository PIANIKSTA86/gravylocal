/**
 * GRAVY v2.0 — rutas-visitas.ts
 * Módulo de Logística: Planeación de Rutas y Control de Agenda de Visitas de Vendedores.
 */

'use strict';

interface VendorVisit {
  id: string;
  seller_id: string;
  client_id: string;
  visit_date: string;
  order_seq?: number;
  status: 'PROGRAMADA' | 'EN_CURSO' | 'COMPLETADA_PEDIDO' | 'COMPLETADA_RECAUDO' | 'NO_EFECTIVA' | 'REPROGRAMADA';
  objective?: 'VENTA' | 'COBRO' | 'SEGUIMIENTO' | 'PROSPECCION';
  checkin_time?: string;
  checkout_time?: string;
  geo_lat?: number;
  geo_lng?: number;
  sales_order_id?: string;
  no_order_reason?: string;
  notes?: string;
  expand?: {
    seller_id?: { name: string; doc_number?: string };
    client_id?: { name: string; doc_number?: string; address?: string; phone?: string; city?: string };
    sales_order_id?: { number?: string; total?: number };
  };
}

const VISIT_STATUS: Record<string, { label: string; badge: string; icon: string; color: string }> = {
  PROGRAMADA:         { label: 'Programada',         badge: 'badge-gray',   icon: 'fa-calendar',       color: '#6B7280' },
  EN_CURSO:           { label: 'En Curso (Check-in)', badge: 'badge-blue',   icon: 'fa-location-dot',   color: '#0284C7' },
  COMPLETADA_PEDIDO:  { label: 'Venta Exitosa (Pedido)', badge: 'badge-green',  icon: 'fa-circle-check',   color: '#10B981' },
  COMPLETADA_RECAUDO: { label: 'Recaudo / Cobro',    badge: 'badge-teal',   icon: 'fa-hand-holding-dollar', color: '#0D9488' },
  NO_EFECTIVA:        { label: 'No Efectiva',        badge: 'badge-orange', icon: 'fa-triangle-exclamation', color: '#F59E0B' },
  REPROGRAMADA:       { label: 'Reprogramada',       badge: 'badge-purple', icon: 'fa-arrows-rotate',  color: '#8B5CF6' },
};

const NO_ORDER_REASONS: Record<string, string> = {
  STOCK_SUFICIENTE: 'Cliente con stock suficiente',
  LOCAL_CERRADO: 'Establecimiento o local cerrado',
  ENCARGADO_NO_DISPONIBLE: 'Encargado de compras no disponible',
  PRECIO: 'Objeción por precio / presupuesto',
  OTRO: 'Otro motivo / Novedad',
};

const OBJECTIVES: Record<string, string> = {
  VENTA: 'Toma de Pedidos & Ventas',
  COBRO: 'Gestión de Cobro de Cartera',
  SEGUIMIENTO: 'Seguimiento / Fidelización',
  PROSPECCION: 'Prospección de Nuevo Cliente',
};

export async function renderRutasVisitas(container: HTMLElement) {
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo de Rutas y Agenda de Vendedores...</div>`;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const [visits, sellers, clients] = await Promise.all([
      (window as any).pb.listAll('vendor_visits', {
        expand: 'seller_id,client_id,sales_order_id',
        sort: 'visit_date,order_seq',
      }).catch(() => []),
      (window as any).pb.listAll('third_parties', {
        filter: 'type="VENDEDOR" || type="EMPLEADO"',
        sort: 'name',
        fields: 'id,name,doc_number'
      }).catch(() => []),
      (window as any).pb.listAll('third_parties', {
        filter: 'type="CLIENTE" || type="AMBOS"',
        sort: 'name',
        fields: 'id,name,doc_number,address,phone,city'
      }).catch(() => []),
    ]);

    (window as any)._allVendorVisits = visits;
    (window as any)._allSellersList = sellers;
    (window as any)._allClientsList = clients;

    _renderRutasUI(container, visits, sellers, clients, today);
  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>Error: ${(window as any).esc(err.message)}</div>`;
  }
}

function _renderRutasUI(container: HTMLElement, visits: VendorVisit[], sellers: any[], clients: any[], activeDate: string) {
  const esc = (window as any).esc;

  container.innerHTML = `
    <div class="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      <!-- Top Banner Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div class="flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl shadow-xs">
            <i class="fas fa-route"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Logística: Planeación de Rutas & Visitas
              <span class="text-xs font-semibold px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full">Fuerza Comercial</span>
            </h1>
            <p class="text-xs text-gray-500 mt-0.5">Control de agenda de visitas en terreno, check-in GPS y efectividad de pedidos en tiempo real.</p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button id="btn-open-mobile-preview" class="btn btn-secondary text-xs flex items-center gap-1.5 border-teal-300 text-teal-800 bg-teal-50/50 hover:bg-teal-100">
            <i class="fas fa-mobile-screen-button"></i> Vista Móvil Vendedores
          </button>
          <button id="btn-nueva-visita-modal" class="btn btn-primary text-xs flex items-center gap-1.5 bg-[#006876] hover:bg-[#004F5A]">
            <i class="fas fa-plus"></i> Programar Nueva Visita / Ruta
          </button>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="flex border-b border-gray-200 gap-6">
        <button id="tab-rutas-tracker" class="pb-3 text-sm font-bold text-[#006876] border-b-2 border-[#006876] flex items-center gap-2">
          <i class="fas fa-chart-line"></i> Tablero de Control & Seguimiento
        </button>
        <button id="tab-rutas-planner" class="pb-3 text-sm font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-2">
          <i class="fas fa-calendar-plus"></i> Asignador & Planificador Masivo
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="rutas-tab-content">
        <!-- Will be populated dynamically -->
      </div>
    </div>
  `;

  // Event Listeners
  const trackerTabBtn = container.querySelector('#tab-rutas-tracker');
  const plannerTabBtn = container.querySelector('#tab-rutas-planner');

  trackerTabBtn?.addEventListener('click', () => {
    trackerTabBtn.className = 'pb-3 text-sm font-bold text-[#006876] border-b-2 border-[#006876] flex items-center gap-2';
    plannerTabBtn!.className = 'pb-3 text-sm font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-2';
    _renderTrackerTab(container, visits, sellers, clients, activeDate);
  });

  plannerTabBtn?.addEventListener('click', () => {
    plannerTabBtn.className = 'pb-3 text-sm font-bold text-[#006876] border-b-2 border-[#006876] flex items-center gap-2';
    trackerTabBtn!.className = 'pb-3 text-sm font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-2';
    _renderPlannerTab(container, visits, sellers, clients);
  });

  container.querySelector('#btn-nueva-visita-modal')?.addEventListener('click', () => {
    _openNewVisitModal(sellers, clients, activeDate, () => {
      renderRutasVisitas(container);
    });
  });

  container.querySelector('#btn-open-mobile-preview')?.addEventListener('click', () => {
    window.open('/mobile', '_blank', 'width=420,height=840');
  });

  // Default to Tracker Tab
  _renderTrackerTab(container, visits, sellers, clients, activeDate);
}

function _renderTrackerTab(container: HTMLElement, visits: VendorVisit[], sellers: any[], clients: any[], defaultDate: string) {
  const contentEl = container.querySelector('#rutas-tab-content');
  if (!contentEl) return;

  const esc = (window as any).esc;
  const fmt = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);

  contentEl.innerHTML = `
    <div class="space-y-5">
      <!-- Filter Bar -->
      <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3 justify-between">
        <div class="flex flex-wrap items-center gap-3 flex-1">
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase">Fecha</label>
            <input type="date" id="filter-visit-date" value="${defaultDate}" class="form-input text-xs py-1.5 px-3 rounded-lg border-gray-300">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase">Vendedor</label>
            <select id="filter-visit-seller" class="form-input text-xs py-1.5 px-3 rounded-lg border-gray-300 min-w-44">
              <option value="">Todos los vendedores</option>
              ${sellers.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase">Estatus</label>
            <select id="filter-visit-status" class="form-input text-xs py-1.5 px-3 rounded-lg border-gray-300">
              <option value="">Todos los estados</option>
              ${Object.entries(VISIT_STATUS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2 sm:mt-0">
          <button id="btn-export-visits-excel" class="btn btn-secondary text-xs flex items-center gap-1.5">
            <i class="fas fa-file-excel text-emerald-600"></i> Exportar Excel
          </button>
          <button id="btn-refresh-visits" class="btn btn-secondary text-xs flex items-center gap-1.5">
            <i class="fas fa-arrows-rotate"></i> Actualizar
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div id="tracker-kpi-container" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Dynamically rendered -->
      </div>

      <!-- Visits Table -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-sm text-gray-800 flex items-center gap-2">
            <i class="fas fa-list-check text-teal-600"></i> Agenda de Visitas y Estado en Tiempo Real
          </h3>
          <span id="visit-counter-badge" class="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">0 visitas</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-gray-600">
            <thead class="bg-gray-50/80 text-gray-700 uppercase font-extrabold border-b border-gray-200">
              <tr>
                <th class="py-3 px-3 w-12 text-center">#</th>
                <th class="py-3 px-4">Vendedor</th>
                <th class="py-3 px-4">Cliente / Tercero</th>
                <th class="py-3 px-4">Objetivo</th>
                <th class="py-3 px-4">Horarios (Check-in/out)</th>
                <th class="py-3 px-4 text-center">Estatus</th>
                <th class="py-3 px-4">Novedad / Resultado</th>
                <th class="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="visits-table-body" class="divide-y divide-gray-100 font-medium">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Function to filter and repaint
  const repaintTable = () => {
    const filterDate = (contentEl.querySelector('#filter-visit-date') as HTMLInputElement)?.value;
    const filterSeller = (contentEl.querySelector('#filter-visit-seller') as HTMLSelectElement)?.value;
    const filterStatus = (contentEl.querySelector('#filter-visit-status') as HTMLSelectElement)?.value;

    const filtered = visits.filter(v => {
      const matchDate = !filterDate || v.visit_date === filterDate;
      const matchSeller = !filterSeller || v.seller_id === filterSeller;
      const matchStatus = !filterStatus || v.status === filterStatus;
      return matchDate && matchSeller && matchStatus;
    });

    // Update KPIs
    const total = filtered.length;
    const programadas = filtered.filter(v => v.status === 'PROGRAMADA').length;
    const enCurso = filtered.filter(v => v.status === 'EN_CURSO').length;
    const exitosas = filtered.filter(v => v.status === 'COMPLETADA_PEDIDO').length;
    const recaudos = filtered.filter(v => v.status === 'COMPLETADA_RECAUDO').length;
    const noEfectivas = filtered.filter(v => v.status === 'NO_EFECTIVA').length;
    const gestionadas = exitosas + recaudos + noEfectivas;
    const efectividadPct = total > 0 ? Math.round(((exitosas + recaudos) / total) * 100) : 0;

    const kpiContainer = contentEl.querySelector('#tracker-kpi-container');
    if (kpiContainer) {
      kpiContainer.innerHTML = `
        <div class="bg-white p-3.5 rounded-xl border border-gray-200">
          <span class="text-[11px] font-bold text-gray-400 uppercase block">Total Planificadas</span>
          <span class="text-xl font-extrabold text-gray-900 mt-1 block">${total}</span>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-gray-200">
          <span class="text-[11px] font-bold text-sky-600 uppercase block">En Curso (Check-in)</span>
          <span class="text-xl font-extrabold text-sky-700 mt-1 block">${enCurso}</span>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-gray-200">
          <span class="text-[11px] font-bold text-emerald-600 uppercase block">Venta Exitosa</span>
          <span class="text-xl font-extrabold text-emerald-700 mt-1 block">${exitosas}</span>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-gray-200">
          <span class="text-[11px] font-bold text-teal-600 uppercase block">Cobro / Recaudos</span>
          <span class="text-xl font-extrabold text-teal-700 mt-1 block">${recaudos}</span>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-gray-200">
          <span class="text-[11px] font-bold text-amber-600 uppercase block">No Efectivas</span>
          <span class="text-xl font-extrabold text-amber-700 mt-1 block">${noEfectivas}</span>
        </div>
        <div class="bg-teal-50/80 p-3.5 rounded-xl border border-teal-200">
          <span class="text-[11px] font-bold text-teal-800 uppercase block">% Efectividad</span>
          <span class="text-xl font-extrabold text-teal-900 mt-1 block">${efectividadPct}%</span>
        </div>
      `;
    }

    const badgeEl = contentEl.querySelector('#visit-counter-badge');
    if (badgeEl) badgeEl.textContent = `${filtered.length} visitas encontradas`;

    const tbody = contentEl.querySelector('#visits-table-body');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-10 text-gray-400">
            <i class="fas fa-calendar-xmark text-3xl mb-2 block"></i>
            No se encontraron visitas registradas con los filtros seleccionados.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((v, i) => {
      const st = VISIT_STATUS[v.status] || VISIT_STATUS.PROGRAMADA;
      const clientName = v.expand?.client_id?.name || 'Cliente';
      const clientDoc = v.expand?.client_id?.doc_number || '';
      const clientAddr = v.expand?.client_id?.address || 'Sin dirección';
      const sellerName = v.expand?.seller_id?.name || 'Vendedor';
      const orderNum = v.expand?.sales_order_id?.number || '';
      const reasonLabel = v.no_order_reason ? (NO_ORDER_REASONS[v.no_order_reason] || v.no_order_reason) : '';

      return `
        <tr class="hover:bg-gray-50/80 transition-colors">
          <td class="py-3 px-3 text-center font-bold text-gray-400">${v.order_seq || (i + 1)}</td>
          <td class="py-3 px-4">
            <span class="font-bold text-gray-900 block">${esc(sellerName)}</span>
          </td>
          <td class="py-3 px-4">
            <span class="font-bold text-gray-900 block">${esc(clientName)}</span>
            <span class="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
              <i class="fas fa-location-dot text-gray-400"></i> ${esc(clientAddr)}
            </span>
          </td>
          <td class="py-3 px-4">
            <span class="inline-block px-2 py-0.5 text-[11px] font-semibold bg-gray-100 rounded text-gray-700">
              ${OBJECTIVES[v.objective || 'VENTA'] || v.objective || 'Venta'}
            </span>
          </td>
          <td class="py-3 px-4">
            <div class="text-[11px]">
              <div><strong class="text-gray-500">In:</strong> ${v.checkin_time || '—'}</div>
              <div><strong class="text-gray-500">Out:</strong> ${v.checkout_time || '—'}</div>
            </div>
          </td>
          <td class="py-3 px-4 text-center">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold rounded-full ${st.badge}">
              <i class="fas ${st.icon}"></i> ${st.label}
            </span>
          </td>
          <td class="py-3 px-4">
            ${orderNum ? `<span class="text-emerald-700 font-bold text-[11px] block"><i class="fas fa-receipt mr-1"></i>Pedido #${esc(orderNum)}</span>` : ''}
            ${reasonLabel ? `<span class="text-amber-700 font-semibold text-[11px] block"><i class="fas fa-circle-info mr-1"></i>${esc(reasonLabel)}</span>` : ''}
            ${v.notes ? `<span class="text-gray-500 text-[11px] italic block line-clamp-1">${esc(v.notes)}</span>` : ''}
            ${!orderNum && !reasonLabel && !v.notes ? '<span class="text-gray-400 text-[11px]">Sin novedades</span>' : ''}
          </td>
          <td class="py-3 px-4 text-right">
            <div class="flex items-center justify-end gap-1">
              <button class="p-1.5 text-gray-500 hover:text-[#006876] hover:bg-teal-50 rounded-lg btn-edit-visit" data-id="${v.id}" title="Editar Visita">
                <i class="fas fa-pen-to-square"></i>
              </button>
              <button class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg btn-delete-visit" data-id="${v.id}" title="Eliminar">
                <i class="fas fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row listeners
    tbody.querySelectorAll('.btn-edit-visit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        const item = visits.find(v => v.id === id);
        if (item) _openEditVisitModal(item, sellers, clients, () => renderRutasVisitas(container));
      });
    });

    tbody.querySelectorAll('.btn-delete-visit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (confirm('¿Deseas eliminar esta visita planificada?')) {
          try {
            await (window as any).pb.delete('vendor_visits', id);
            (window as any).showToast('Visita eliminada exitosamente');
            renderRutasVisitas(container);
          } catch (err: any) {
            (window as any).showToast('Error al eliminar: ' + err.message, 'error');
          }
        }
      });
    });
  };

  // Filter change events
  contentEl.querySelector('#filter-visit-date')?.addEventListener('change', repaintTable);
  contentEl.querySelector('#filter-visit-seller')?.addEventListener('change', repaintTable);
  contentEl.querySelector('#filter-visit-status')?.addEventListener('change', repaintTable);
  contentEl.querySelector('#btn-refresh-visits')?.addEventListener('click', () => renderRutasVisitas(container));

  repaintTable();
}

function _renderPlannerTab(container: HTMLElement, visits: VendorVisit[], sellers: any[], clients: any[]) {
  const contentEl = container.querySelector('#rutas-tab-content');
  if (!contentEl) return;

  const esc = (window as any).esc;

  contentEl.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Asignador de Rutas Form -->
      <div class="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 class="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
          <i class="fas fa-user-plus text-teal-600"></i> Asignación Rápida de Rutas
        </h3>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Vendedor Responsable</label>
          <select id="planner-seller-id" class="form-input text-xs w-full">
            <option value="">Selecciona un vendedor...</option>
            ${sellers.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Fecha de la Ruta</label>
          <input type="date" id="planner-date" value="${new Date().toISOString().slice(0, 10)}" class="form-input text-xs w-full">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Objetivo Predeterminado</label>
          <select id="planner-objective" class="form-input text-xs w-full">
            ${Object.entries(OBJECTIVES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Instrucciones / Notas para el Vendedor</label>
          <textarea id="planner-notes" rows="2" class="form-input text-xs w-full" placeholder="Ej: Cobrar factura vencida de hace 15 días y presentar catálogo nuevo..."></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Seleccionar Clientes para la Ruta</label>
          <input type="text" id="planner-search-client" class="form-input text-xs w-full mb-2" placeholder="Buscar cliente por nombre o ciudad...">
          
          <div id="planner-client-list" class="max-h-60 overflow-y-auto space-y-1.5 border border-gray-200 p-2 rounded-xl bg-gray-50/50">
            ${clients.map(c => `
              <label class="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-teal-50/30 cursor-pointer client-check-item">
                <input type="checkbox" value="${esc(c.id)}" class="rounded text-teal-600 focus:ring-teal-500 chk-planner-client">
                <div class="text-xs">
                  <span class="font-bold text-gray-800 block">${esc(c.name)}</span>
                  <span class="text-[10px] text-gray-500">${esc(c.address || '')} · ${esc(c.city || '')}</span>
                </div>
              </label>
            `).join('')}
          </div>
        </div>

        <button id="btn-save-batch-route" class="btn btn-primary w-full py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 bg-[#006876]">
          <i class="fas fa-check-double"></i> Programar Ruta Completa
        </button>
      </div>

      <!-- Resumen de Rutas Programadas -->
      <div class="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 class="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
          <i class="fas fa-calendar-days text-teal-600"></i> Planificación Vigente por Vendedor
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${sellers.map(s => {
            const sellerVisits = visits.filter(v => v.seller_id === s.id);
            return `
              <div class="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-sm text-gray-900">${esc(s.name)}</h4>
                  <span class="text-xs font-extrabold px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full">${sellerVisits.length} visitas</span>
                </div>
                <p class="text-xs text-gray-500">Documento: ${esc(s.doc_number || 'S/N')}</p>
                <div class="text-xs text-gray-600 space-y-1 pt-1 border-t border-gray-200">
                  <div class="flex justify-between">
                    <span>Programadas pendientes:</span>
                    <strong class="text-gray-800">${sellerVisits.filter(v => v.status === 'PROGRAMADA').length}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>Completadas exitosas:</span>
                    <strong class="text-emerald-700">${sellerVisits.filter(v => v.status === 'COMPLETADA_PEDIDO' || v.status === 'COMPLETADA_RECAUDO').length}</strong>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Search in clients
  contentEl.querySelector('#planner-search-client')?.addEventListener('input', (e) => {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    contentEl.querySelectorAll('.client-check-item').forEach(el => {
      const txt = el.textContent?.toLowerCase() || '';
      (el as HTMLElement).style.display = txt.includes(q) ? 'flex' : 'none';
    });
  });

  // Batch Save Route
  contentEl.querySelector('#btn-save-batch-route')?.addEventListener('click', async () => {
    const sellerId = (contentEl.querySelector('#planner-seller-id') as HTMLSelectElement)?.value;
    const visitDate = (contentEl.querySelector('#planner-date') as HTMLInputElement)?.value;
    const objective = (contentEl.querySelector('#planner-objective') as HTMLSelectElement)?.value;
    const notes = (contentEl.querySelector('#planner-notes') as HTMLTextAreaElement)?.value;

    const checkedClients = Array.from(contentEl.querySelectorAll('.chk-planner-client:checked')).map(
      (chk: any) => chk.value
    );

    if (!sellerId) {
      alert('Por favor selecciona un vendedor.');
      return;
    }
    if (!visitDate) {
      alert('Por favor selecciona una fecha para la ruta.');
      return;
    }
    if (checkedClients.length === 0) {
      alert('Por favor marca al menos un cliente para la ruta.');
      return;
    }

    try {
      const btn = contentEl.querySelector('#btn-save-batch-route') as HTMLButtonElement;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';

      let seq = 1;
      for (const clientId of checkedClients) {
        await (window as any).pb.create('vendor_visits', {
          seller_id: sellerId,
          client_id: clientId,
          visit_date: visitDate,
          order_seq: seq++,
          status: 'PROGRAMADA',
          objective: objective || 'VENTA',
          notes: notes || '',
        });
      }

      (window as any).showToast(`Ruta de ${checkedClients.length} visitas programada con éxito!`);
      renderRutasVisitas(container);
    } catch (err: any) {
      alert('Error al guardar ruta: ' + err.message);
    }
  });
}

function _openNewVisitModal(sellers: any[], clients: any[], defaultDate: string, onDone: () => void) {
  const esc = (window as any).esc;
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-gray-900 flex items-center gap-2">
          <i class="fas fa-calendar-plus text-teal-600"></i> Programar Nueva Visita
        </h3>
        <button id="modal-close-btn" class="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-gray-700 mb-1">Vendedor Asignado</label>
          <select id="modal-seller" class="form-input text-xs w-full">
            ${sellers.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Cliente / Destino</label>
          <select id="modal-client" class="form-input text-xs w-full">
            ${clients.map(c => `<option value="${esc(c.id)}">${esc(c.name)} (${esc(c.city || 'Ciudad')})</option>`).join('')}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Fecha</label>
            <input type="date" id="modal-date" value="${defaultDate}" class="form-input text-xs w-full">
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Secuencia (Orden #)</label>
            <input type="number" id="modal-seq" value="1" min="1" class="form-input text-xs w-full">
          </div>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Objetivo de Visita</label>
          <select id="modal-objective" class="form-input text-xs w-full">
            ${Object.entries(OBJECTIVES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Notas / Indicaciones</label>
          <textarea id="modal-notes" rows="2" class="form-input text-xs w-full" placeholder="Observaciones especiales..."></textarea>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button id="modal-cancel-btn" class="btn btn-secondary text-xs">Cancelar</button>
        <button id="modal-save-btn" class="btn btn-primary text-xs bg-[#006876]">Guardar Visita</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#modal-close-btn')?.addEventListener('click', close);
  modal.querySelector('#modal-cancel-btn')?.addEventListener('click', close);

  modal.querySelector('#modal-save-btn')?.addEventListener('click', async () => {
    const seller_id = (modal.querySelector('#modal-seller') as HTMLSelectElement).value;
    const client_id = (modal.querySelector('#modal-client') as HTMLSelectElement).value;
    const visit_date = (modal.querySelector('#modal-date') as HTMLInputElement).value;
    const order_seq = Number((modal.querySelector('#modal-seq') as HTMLInputElement).value) || 1;
    const objective = (modal.querySelector('#modal-objective') as HTMLSelectElement).value;
    const notes = (modal.querySelector('#modal-notes') as HTMLTextAreaElement).value;

    try {
      await (window as any).pb.create('vendor_visits', {
        seller_id,
        client_id,
        visit_date,
        order_seq,
        objective,
        status: 'PROGRAMADA',
        notes,
      });
      (window as any).showToast('Visita creada exitosamente');
      close();
      onDone();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  });
}

function _openEditVisitModal(visit: VendorVisit, sellers: any[], clients: any[], onDone: () => void) {
  const esc = (window as any).esc;
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 class="font-bold text-base text-gray-900 flex items-center gap-2">
          <i class="fas fa-pen-to-square text-teal-600"></i> Modificar Visita
        </h3>
        <button id="modal-close-btn" class="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-gray-700 mb-1">Estatus Actual</label>
          <select id="modal-status" class="form-input text-xs w-full font-bold">
            ${Object.entries(VISIT_STATUS).map(([k, v]) => `
              <option value="${k}" ${visit.status === k ? 'selected' : ''}>${v.label}</option>
            `).join('')}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-gray-700 mb-1">Fecha</label>
            <input type="date" id="modal-date" value="${visit.visit_date}" class="form-input text-xs w-full">
          </div>
          <div>
            <label class="block font-bold text-gray-700 mb-1">Secuencia (Orden #)</label>
            <input type="number" id="modal-seq" value="${visit.order_seq || 1}" min="1" class="form-input text-xs w-full">
          </div>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Motivo si No es Efectiva</label>
          <select id="modal-reason" class="form-input text-xs w-full">
            <option value="">— Ninguno —</option>
            ${Object.entries(NO_ORDER_REASONS).map(([k, v]) => `
              <option value="${k}" ${visit.no_order_reason === k ? 'selected' : ''}>${v}</option>
            `).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-gray-700 mb-1">Notas / Observaciones</label>
          <textarea id="modal-notes" rows="2" class="form-input text-xs w-full">${esc(visit.notes || '')}</textarea>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t">
        <button id="modal-cancel-btn" class="btn btn-secondary text-xs">Cancelar</button>
        <button id="modal-save-btn" class="btn btn-primary text-xs bg-[#006876]">Actualizar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#modal-close-btn')?.addEventListener('click', close);
  modal.querySelector('#modal-cancel-btn')?.addEventListener('click', close);

  modal.querySelector('#modal-save-btn')?.addEventListener('click', async () => {
    const status = (modal.querySelector('#modal-status') as HTMLSelectElement).value;
    const visit_date = (modal.querySelector('#modal-date') as HTMLInputElement).value;
    const order_seq = Number((modal.querySelector('#modal-seq') as HTMLInputElement).value) || 1;
    const no_order_reason = (modal.querySelector('#modal-reason') as HTMLSelectElement).value;
    const notes = (modal.querySelector('#modal-notes') as HTMLTextAreaElement).value;

    try {
      await (window as any).pb.update('vendor_visits', visit.id, {
        status,
        visit_date,
        order_seq,
        no_order_reason,
        notes,
      });
      (window as any).showToast('Visita actualizada exitosamente');
      close();
      onDone();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  });
}

(window as any).renderRutasVisitas = renderRutasVisitas;
