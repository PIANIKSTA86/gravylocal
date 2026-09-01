/**
 * GRAVY v2.0 — rutas-visitas.ts
 * Módulo de Logística: 
 *   - 'mis-rutas': Agenda táctil vertical exclusiva para Vendedores en Terreno.
 *   - 'rutas-gestion': Control gerencial, seguimiento de KPIs y Asignador Masivo para Administradores.
 */

'use strict';

export interface VendorVisit {
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

export const VISIT_STATUS: Record<string, { label: string; badge: string; icon: string; color: string; bg: string }> = {
  PROGRAMADA:         { label: 'Programada',          badge: 'badge-gray',   icon: 'fa-calendar',            color: '#64748B', bg: '#F1F5F9' },
  EN_CURSO:           { label: 'En Curso (Check-in)',  badge: 'badge-blue',   icon: 'fa-location-crosshairs', color: '#0284C7', bg: '#E0F2FE' },
  COMPLETADA_PEDIDO:  { label: 'Venta Exitosa',        badge: 'badge-green',  icon: 'fa-circle-check',        color: '#059669', bg: '#D1FAE5' },
  COMPLETADA_RECAUDO: { label: 'Recaudo / Cobro',     badge: 'badge-teal',   icon: 'fa-hand-holding-dollar', color: '#0D9488', bg: '#CCFBF1' },
  NO_EFECTIVA:        { label: 'No Efectiva',         badge: 'badge-orange', icon: 'fa-triangle-exclamation', color: '#D97706', bg: '#FEF3C7' },
  REPROGRAMADA:       { label: 'Reprogramada',        badge: 'badge-purple', icon: 'fa-arrows-rotate',       color: '#7C3AED', bg: '#EDE9FE' },
};

export const NO_ORDER_REASONS: Record<string, string> = {
  STOCK_SUFICIENTE: 'Cliente con stock suficiente',
  LOCAL_CERRADO: 'Establecimiento o local cerrado',
  ENCARGADO_NO_DISPONIBLE: 'Encargado de compras no disponible',
  PRECIO: 'Objeción por precio / presupuesto',
  OTRO: 'Otro motivo / Novedad',
};

export const OBJECTIVES: Record<string, { label: string; icon: string }> = {
  VENTA:        { label: 'Venta / Pedido',   icon: 'fa-bag-shopping' },
  COBRO:        { label: 'Cobro de Cartera', icon: 'fa-wallet' },
  SEGUIMIENTO:  { label: 'Seguimiento',      icon: 'fa-user-check' },
  PROSPECCION:  { label: 'Prospección',      icon: 'fa-user-plus' },
};

// ═════════════════════════════════════════════════════════════════════════
// 1. VISTA VENDEDOR: MI AGENDA DE RUTAS (100% VERTICAL TÁCTIL)
// ═════════════════════════════════════════════════════════════════════════

export async function renderMiAgendaRutas(container: HTMLElement, initialDate?: string) {
  const esc = (window as any).esc;
  const pb = (window as any).pb;
  const targetDate = initialDate || new Date().toISOString().slice(0, 10);

  container.innerHTML = `
    <div class="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div class="text-center py-10 text-gray-400">
        <i class="fas fa-spinner fa-spin text-2xl mb-2 text-teal-600 block"></i>
        Cargando tu ruta del día...
      </div>
    </div>
  `;

  try {
    const currentUserId = pb?.currentUser?.id || '';
    const currentUserName = pb?.currentUser?.full_name || pb?.currentUser?.name || 'Vendedor';

    // Consultar visitas del vendedor para la fecha
    const visits: VendorVisit[] = await pb.listAll('vendor_visits', {
      filter: `visit_date = "${targetDate}"`,
      expand: 'seller_id,client_id,sales_order_id',
      sort: 'order_seq',
    }).catch(() => []);

    _renderVendorAgendaUI(container, visits, targetDate, currentUserName);
  } catch (err: any) {
    container.innerHTML = `
      <div class="p-6 text-center text-red-500 bg-red-50 rounded-2xl m-4 border border-red-200">
        <i class="fas fa-circle-exclamation text-2xl mb-2 block"></i>
        Error al cargar la ruta: ${esc(err.message)}
      </div>
    `;
  }
}

function _renderVendorAgendaUI(container: HTMLElement, visits: VendorVisit[], activeDate: string, sellerName: string) {
  const esc = (window as any).esc;

  // Calcular KPIs del día
  const total = visits.length;
  const completed = visits.filter(v => v.status === 'COMPLETADA_PEDIDO' || v.status === 'COMPLETADA_RECAUDO').length;
  const inProgress = visits.filter(v => v.status === 'EN_CURSO').length;
  const pending = visits.filter(v => v.status === 'PROGRAMADA').length;
  const notEffective = visits.filter(v => v.status === 'NO_EFECTIVA').length;
  const pct = total > 0 ? Math.round(((completed + notEffective) / total) * 100) : 0;

  // Formato fecha bonita
  const [y, m, d] = activeDate.split('-');
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const dateFormatted = dateObj.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  container.innerHTML = `
    <div class="p-3 sm:p-5 max-w-2xl mx-auto space-y-4 pb-20">
      
      <!-- Selector de Fecha & Cabecera de Ruta -->
      <div class="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
              <i class="fas fa-route mr-1"></i> Mi Ruta de Visitas
            </span>
            <h2 class="text-base font-extrabold text-slate-900 mt-1 capitalize">${dateFormatted}</h2>
          </div>
          
          <div class="flex items-center gap-1.5">
            <button id="btn-date-prev" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center text-xs">
              <i class="fas fa-chevron-left"></i>
            </button>
            <input type="date" id="input-agenda-date" value="${activeDate}" class="form-input text-xs py-1 px-2 rounded-xl border-slate-200 font-bold text-slate-800">
            <button id="btn-date-next" class="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center text-xs">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Barra de Progreso de la Jornada -->
        <div class="pt-2 border-t border-slate-100 space-y-1.5">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-600 font-medium">Progreso del día: <strong class="text-slate-900">${completed + notEffective} de ${total} visitas</strong></span>
            <span class="font-extrabold text-teal-800">${pct}%</span>
          </div>
          <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-linear-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
      </div>

      <!-- Filtros Rápidos en Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
        <button class="filter-pill active px-3.5 py-1.5 rounded-full bg-slate-900 text-white shadow-xs" data-filter="ALL">
          Todas (${total})
        </button>
        <button class="filter-pill px-3.5 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50" data-filter="PROGRAMADA">
          Pendientes (${pending})
        </button>
        <button class="filter-pill px-3.5 py-1.5 rounded-full bg-white text-blue-700 border border-blue-200 hover:bg-blue-50" data-filter="EN_CURSO">
          En Curso (${inProgress})
        </button>
        <button class="filter-pill px-3.5 py-1.5 rounded-full bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50" data-filter="COMPLETADA">
          Finalizadas (${completed + notEffective})
        </button>
      </div>

      <!-- Listado de Visitas en Tarjetas Verticales -->
      <div id="agenda-cards-container" class="space-y-3">
        ${visits.length === 0 ? `
          <div class="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl mx-auto">
              <i class="fas fa-calendar-day"></i>
            </div>
            <h3 class="font-extrabold text-slate-800 text-sm">Sin visitas programadas para esta fecha</h3>
            <p class="text-xs text-slate-500 max-w-xs mx-auto">Comunícate con tu supervisor o logística para la asignación de tu ruta de clientes.</p>
          </div>
        ` : visits.map((v, index) => _renderSingleVisitCard(v, index + 1)).join('')}
      </div>

    </div>
  `;

  // Event Listeners
  const dateInput = container.querySelector('#input-agenda-date') as HTMLInputElement;
  dateInput?.addEventListener('change', () => {
    renderMiAgendaRutas(container, dateInput.value);
  });

  container.querySelector('#btn-date-prev')?.addEventListener('click', () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    renderMiAgendaRutas(container, d.toISOString().slice(0, 10));
  });

  container.querySelector('#btn-date-next')?.addEventListener('click', () => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 1);
    renderMiAgendaRutas(container, d.toISOString().slice(0, 10));
  });

  // Filter Pills click
  container.querySelectorAll('.filter-pill').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-pill').forEach((b: any) => {
        b.className = 'filter-pill px-3.5 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50';
      });
      btn.className = 'filter-pill active px-3.5 py-1.5 rounded-full bg-slate-900 text-white shadow-xs';

      const filter = btn.dataset.filter;
      container.querySelectorAll('.vendor-visit-card').forEach((card: any) => {
        const cardStatus = card.dataset.status;
        if (filter === 'ALL') {
          card.style.display = 'block';
        } else if (filter === 'COMPLETADA') {
          card.style.display = (cardStatus === 'COMPLETADA_PEDIDO' || cardStatus === 'COMPLETADA_RECAUDO' || cardStatus === 'NO_EFECTIVA') ? 'block' : 'none';
        } else {
          card.style.display = cardStatus === filter ? 'block' : 'none';
        }
      });
    });
  });

  // Bind Actions per Card
  _bindVisitCardActions(container, activeDate);
}

function _renderSingleVisitCard(v: VendorVisit, seqNum: number): string {
  const esc = (window as any).esc;
  const statusCfg = VISIT_STATUS[v.status] || VISIT_STATUS.PROGRAMADA;
  const objCfg = OBJECTIVES[v.objective || 'VENTA'] || OBJECTIVES.VENTA;
  const client = v.expand?.client_id || { name: 'Cliente no asignado', address: '', phone: '', city: '' };

  const isProgrammed = v.status === 'PROGRAMADA';
  const isInProgress = v.status === 'EN_CURSO';
  const isDone = v.status === 'COMPLETADA_PEDIDO' || v.status === 'COMPLETADA_RECAUDO' || v.status === 'NO_EFECTIVA';

  const mapsQuery = encodeURIComponent(`${client.address || ''} ${client.city || ''}`.trim() || client.name);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return `
    <div class="vendor-visit-card bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5 transition-all" data-id="${v.id}" data-status="${v.status}">
      
      <!-- Top Row: Secuencia + Estado + Objetivo -->
      <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
            #${v.order_seq || seqNum}
          </span>
          <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style="background:${statusCfg.bg}; color:${statusCfg.color}">
            <i class="fas ${statusCfg.icon} mr-1"></i>${statusCfg.label}
          </span>
        </div>

        <span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
          <i class="fas ${objCfg.icon} text-teal-600"></i> ${objCfg.label}
        </span>
      </div>

      <!-- Client Details (Grande y legible hacia abajo) -->
      <div class="space-y-1">
        <h3 class="font-extrabold text-base text-slate-900 leading-snug">${esc(client.name)}</h3>
        
        <div class="text-xs text-slate-600 flex items-start gap-1.5">
          <i class="fas fa-location-dot text-rose-500 mt-0.5 flex-shrink-0"></i>
          <span>${esc(client.address || 'Sin dirección')} ${client.city ? `· <strong class="text-slate-800">${esc(client.city)}</strong>` : ''}</span>
        </div>

        ${v.notes ? `
          <div class="text-xs bg-amber-50/70 border border-amber-200/60 rounded-xl p-2 text-amber-900 mt-1">
            <i class="fas fa-note-sticky text-amber-600 mr-1"></i><strong>Instrucción:</strong> ${esc(v.notes)}
          </div>
        ` : ''}
      </div>

      <!-- Quick Contact & GPS Bar -->
      <div class="flex items-center gap-2 pt-1">
        ${client.phone ? `
          <a href="tel:${esc(client.phone)}" class="flex-1 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors">
            <i class="fas fa-phone text-emerald-600"></i> ${esc(client.phone)}
          </a>
        ` : `
          <button disabled class="flex-1 py-2 px-3 rounded-xl bg-slate-50 text-slate-400 text-xs font-medium">
            <i class="fas fa-phone-slash mr-1"></i> Sin teléfono
          </button>
        `}

        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 px-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors">
          <i class="fas fa-diamond-turn-right text-blue-600"></i> Navegar GPS
        </a>
      </div>

      <!-- Action Buttons Area -->
      <div class="pt-2 border-t border-slate-100">
        ${isProgrammed ? `
          <button class="btn-do-checkin w-full py-2.5 px-4 rounded-xl bg-[#006876] hover:bg-[#004F5A] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs cursor-pointer" data-id="${v.id}">
            <i class="fas fa-location-crosshairs text-sm"></i> Iniciar Check-In (Llegada)
          </button>
        ` : ''}

        ${isInProgress ? `
          <div class="space-y-2">
            <div class="text-[11px] text-blue-800 bg-blue-50/80 p-2 rounded-xl flex items-center justify-between border border-blue-200/60 font-medium">
              <span><i class="fas fa-clock mr-1"></i> Check-In: <strong>${v.checkin_time?.slice(11, 16) || 'En curso'}</strong></span>
              <span class="text-[10px] bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-full font-bold">Atención Activa</span>
            </div>

            <div class="grid grid-cols-3 gap-2">
              <button class="btn-do-order py-2.5 px-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-extrabold flex flex-col items-center justify-center gap-1 hover:bg-indigo-100" data-client="${esc(client.name)}" data-clientid="${v.client_id}">
                <i class="fas fa-bag-shopping text-sm text-indigo-600"></i> Pedido
              </button>
              <button class="btn-do-payment py-2.5 px-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-extrabold flex flex-col items-center justify-center gap-1 hover:bg-teal-100" data-client="${esc(client.name)}">
                <i class="fas fa-wallet text-sm text-teal-600"></i> Recaudo
              </button>
              <button class="btn-do-checkout py-2.5 px-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex flex-col items-center justify-center gap-1 shadow-xs" data-id="${v.id}" data-client="${esc(client.name)}">
                <i class="fas fa-flag-checkered text-sm"></i> Finalizar
              </button>
            </div>
          </div>
        ` : ''}

        ${isDone ? `
          <div class="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
            <div>
              <span class="font-bold text-slate-800 block">${statusCfg.label}</span>
              <span class="text-[10px] text-slate-500">
                ${v.checkin_time?.slice(11, 16) || '--:--'} → ${v.checkout_time?.slice(11, 16) || '--:--'}
                ${v.no_order_reason ? `· ${NO_ORDER_REASONS[v.no_order_reason] || v.no_order_reason}` : ''}
              </span>
            </div>
            <button class="btn-edit-outcome text-slate-600 hover:text-slate-900 text-xs font-bold py-1 px-2.5 bg-white rounded-lg border border-slate-200" data-id="${v.id}">
              <i class="fas fa-pen mr-1"></i> Novedad
            </button>
          </div>
        ` : ''}
      </div>

    </div>
  `;
}

function _bindVisitCardActions(container: HTMLElement, activeDate: string) {
  const pb = (window as any).pb;

  // Check-In
  container.querySelectorAll('.btn-do-checkin').forEach((btn: any) => {
    btn.addEventListener('click', async () => {
      const visitId = btn.dataset.id;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Obteniendo GPS...';

      let lat: number | undefined;
      let lng: number | undefined;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 7000, enableHighAccuracy: true });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch (_) {}
      }

      try {
        await pb.update('vendor_visits', visitId, {
          status: 'EN_CURSO',
          checkin_time: new Date().toISOString(),
          geo_lat: lat,
          geo_lng: lng,
        });
        (window as any).showToast('Check-In registrado con éxito');
        renderMiAgendaRutas(container, activeDate);
      } catch (err: any) {
        alert('Error en Check-In: ' + err.message);
        btn.disabled = false;
      }
    });
  });

  // Check-Out / Finalizar
  container.querySelectorAll('.btn-do-checkout').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      const visitId = btn.dataset.id;
      const clientName = btn.dataset.client;
      _openCheckoutModal(visitId, clientName, () => {
        renderMiAgendaRutas(container, activeDate);
      });
    });
  });

  // Editar Novedad / Resultado
  container.querySelectorAll('.btn-edit-outcome').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      const visitId = btn.dataset.id;
      _openOutcomeEditModal(visitId, () => {
        renderMiAgendaRutas(container, activeDate);
      });
    });
  });

  // Tomar Pedido Shortcut
  container.querySelectorAll('.btn-do-order').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      const clientName = btn.dataset.client;
      if (typeof (window as any).navigate === 'function') {
        (window as any).navigate('pedidos');
        (window as any).showToast(`Iniciando pedido para ${clientName}...`);
      }
    });
  });

  // Recaudo Shortcut
  container.querySelectorAll('.btn-do-payment').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      const clientName = btn.dataset.client;
      if (typeof (window as any).navigate === 'function') {
        (window as any).navigate('ventas');
        (window as any).showToast(`Consulta de cartera para ${clientName}...`);
      }
    });
  });
}

function _openCheckoutModal(visitId: string, clientName: string, onDone: () => void) {
  const esc = (window as any).esc;
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
      <div class="flex items-center justify-between border-b pb-3 border-slate-100">
        <div>
          <span class="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Cierre de Atención</span>
          <h3 class="font-extrabold text-base text-slate-900">${esc(clientName)}</h3>
        </div>
        <button id="modal-close-x" class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm">&times;</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1.5">Resultado de la Visita</label>
          <div class="grid grid-cols-2 gap-2" id="checkout-status-group">
            <label class="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer flex items-center gap-2">
              <input type="radio" name="co-status" value="COMPLETADA_PEDIDO" checked class="text-emerald-600 focus:ring-emerald-500">
              <span class="font-extrabold text-emerald-900 text-xs">🛍️ Pedido Tomado</span>
            </label>
            <label class="p-3 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 cursor-pointer flex items-center gap-2">
              <input type="radio" name="co-status" value="COMPLETADA_RECAUDO" class="text-teal-600 focus:ring-teal-500">
              <span class="font-extrabold text-teal-900 text-xs">💰 Recaudo / Cobro</span>
            </label>
            <label class="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 cursor-pointer flex items-center gap-2 col-span-2">
              <input type="radio" name="co-status" value="NO_EFECTIVA" class="text-amber-600 focus:ring-amber-500">
              <span class="font-extrabold text-amber-900 text-xs">⚠️ Visita No Efectiva (Sin Venta)</span>
            </label>
          </div>
        </div>

        <div id="co-reason-container" style="display:none" class="space-y-1">
          <label class="block font-bold text-slate-700">Motivo de No Compra</label>
          <select id="co-reason" class="form-input text-xs w-full">
            ${Object.entries(NO_ORDER_REASONS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Notas de Cierre</label>
          <textarea id="co-notes" rows="2" class="form-input text-xs w-full" placeholder="Observaciones o compromisos..."></textarea>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button id="modal-cancel-btn" class="btn btn-secondary text-xs flex-1 py-2.5">Cancelar</button>
        <button id="modal-save-checkout" class="btn btn-primary text-xs flex-1 py-2.5 bg-[#006876] font-extrabold">Finalizar Visita</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const close = () => modal.remove();

  modal.querySelector('#modal-close-x')?.addEventListener('click', close);
  modal.querySelector('#modal-cancel-btn')?.addEventListener('click', close);

  const reasonContainer = modal.querySelector('#co-reason-container') as HTMLElement;
  modal.querySelectorAll('input[name="co-status"]').forEach((radio: any) => {
    radio.addEventListener('change', () => {
      reasonContainer.style.display = radio.value === 'NO_EFECTIVA' ? 'block' : 'none';
    });
  });

  modal.querySelector('#modal-save-checkout')?.addEventListener('click', async () => {
    const status = (modal.querySelector('input[name="co-status"]:checked') as HTMLInputElement)?.value;
    const reason = (modal.querySelector('#co-reason') as HTMLSelectElement)?.value;
    const notes = (modal.querySelector('#co-notes') as HTMLTextAreaElement)?.value;

    try {
      await (window as any).pb.update('vendor_visits', visitId, {
        status,
        checkout_time: new Date().toISOString(),
        no_order_reason: status === 'NO_EFECTIVA' ? reason : '',
        notes: notes || '',
      });
      (window as any).showToast('Visita finalizada exitosamente');
      close();
      onDone();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  });
}

function _openOutcomeEditModal(visitId: string, onDone: () => void) {
  const pb = (window as any).pb;
  pb.get('vendor_visits', visitId).then((v: VendorVisit) => {
    const esc = (window as any).esc;
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-extrabold text-sm text-slate-900">Editar Novedad de Visita</h3>
          <button id="modal-close-x" class="text-slate-400 hover:text-slate-600">&times;</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Estado</label>
            <select id="edit-status" class="form-input text-xs w-full font-bold">
              ${Object.entries(VISIT_STATUS).map(([k, st]) => `
                <option value="${k}" ${v.status === k ? 'selected' : ''}>${st.label}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Motivo si No es Efectiva</label>
            <select id="edit-reason" class="form-input text-xs w-full">
              <option value="">— Ninguno —</option>
              ${Object.entries(NO_ORDER_REASONS).map(([k, r]) => `
                <option value="${k}" ${v.no_order_reason === k ? 'selected' : ''}>${r}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Notas</label>
            <textarea id="edit-notes" rows="3" class="form-input text-xs w-full">${esc(v.notes || '')}</textarea>
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <button id="modal-cancel-btn" class="btn btn-secondary text-xs flex-1">Cancelar</button>
          <button id="modal-save-edit" class="btn btn-primary text-xs flex-1 bg-[#006876]">Guardar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const close = () => modal.remove();
    modal.querySelector('#modal-close-x')?.addEventListener('click', close);
    modal.querySelector('#modal-cancel-btn')?.addEventListener('click', close);

    modal.querySelector('#modal-save-edit')?.addEventListener('click', async () => {
      const status = (modal.querySelector('#edit-status') as HTMLSelectElement).value;
      const no_order_reason = (modal.querySelector('#edit-reason') as HTMLSelectElement).value;
      const notes = (modal.querySelector('#edit-notes') as HTMLTextAreaElement).value;

      try {
        await pb.update('vendor_visits', visitId, { status, no_order_reason, notes });
        (window as any).showToast('Novedad actualizada');
        close();
        onDone();
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    });
  });
}

// ═════════════════════════════════════════════════════════════════════════
// 2. VISTA ADMINISTRACIÓN: CONTROL Y PLANIFICACIÓN DE RUTAS
// ═════════════════════════════════════════════════════════════════════════

export async function renderControlRutasAdmin(container: HTMLElement) {
  const esc = (window as any).esc;
  const pb = (window as any).pb;

  container.innerHTML = `
    <div class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-spinner fa-spin mr-2"></i>Cargando Control Gerencial de Rutas...
    </div>
  `;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const [visits, sellers, clients] = await Promise.all([
      pb.listAll('vendor_visits', {
        expand: 'seller_id,client_id,sales_order_id',
        sort: 'visit_date,order_seq',
      }).catch(() => []),
      pb.listAll('third_parties', {
        filter: 'type="VENDEDOR" || type="EMPLEADO"',
        sort: 'name',
        fields: 'id,name,doc_number'
      }).catch(() => []),
      pb.listAll('third_parties', {
        filter: 'type="CLIENTE" || type="AMBOS"',
        sort: 'name',
        fields: 'id,name,doc_number,address,phone,city'
      }).catch(() => []),
    ]);

    _renderAdminRutasUI(container, visits, sellers, clients, today);
  } catch (err: any) {
    container.innerHTML = `
      <div class="p-8 text-center text-red-500">
        <i class="fas fa-circle-exclamation mr-2"></i>Error: ${esc(err.message)}
      </div>
    `;
  }
}

function _renderAdminRutasUI(container: HTMLElement, visits: VendorVisit[], sellers: any[], clients: any[], activeDate: string) {
  container.innerHTML = `
    <div class="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      <!-- Top Banner Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div class="flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl shadow-xs">
            <i class="fas fa-calendar-check"></i>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Logística: Control y Planificación de Rutas
              <span class="text-xs font-semibold px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full">Gerencia Comercial</span>
            </h1>
            <p class="text-xs text-gray-500 mt-0.5">Asignación masiva de rutas, auditoría de check-in GPS y tablero de efectividad.</p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <button id="btn-nueva-visita-admin" class="btn btn-primary text-xs flex items-center gap-1.5 bg-[#006876] hover:bg-[#004F5A]">
            <i class="fas fa-plus"></i> Programar Nueva Visita
          </button>
        </div>
      </div>

      <!-- Main Navigation Tabs -->
      <div class="flex border-b border-gray-200 gap-6">
        <button id="tab-admin-tracker" class="pb-3 text-sm font-bold text-[#006876] border-b-2 border-[#006876] flex items-center gap-2">
          <i class="fas fa-chart-line"></i> Tablero de Control & Seguimiento
        </button>
        <button id="tab-admin-planner" class="pb-3 text-sm font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-2">
          <i class="fas fa-calendar-plus"></i> Asignador & Planificador Masivo
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="admin-rutas-content"></div>
    </div>
  `;

  const trackerTabBtn = container.querySelector('#tab-admin-tracker');
  const plannerTabBtn = container.querySelector('#tab-admin-planner');

  trackerTabBtn?.addEventListener('click', () => {
    trackerTabBtn.className = 'pb-3 text-sm font-bold text-[#006876] border-b-2 border-[#006876] flex items-center gap-2';
    plannerTabBtn!.className = 'pb-3 text-sm font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-2';
    _renderAdminTrackerTab(container, visits, sellers, clients, activeDate);
  });

  plannerTabBtn?.addEventListener('click', () => {
    plannerTabBtn.className = 'pb-3 text-sm font-bold text-[#006876] border-b-2 border-[#006876] flex items-center gap-2';
    trackerTabBtn!.className = 'pb-3 text-sm font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-2';
    _renderAdminPlannerTab(container, visits, sellers, clients);
  });

  container.querySelector('#btn-nueva-visita-admin')?.addEventListener('click', () => {
    _openNewVisitModal(sellers, clients, activeDate, () => {
      renderControlRutasAdmin(container);
    });
  });

  _renderAdminTrackerTab(container, visits, sellers, clients, activeDate);
}

function _renderAdminTrackerTab(container: HTMLElement, visits: VendorVisit[], sellers: any[], clients: any[], defaultDate: string) {
  const contentEl = container.querySelector('#admin-rutas-content');
  if (!contentEl) return;
  const esc = (window as any).esc;

  contentEl.innerHTML = `
    <div class="space-y-5">
      <!-- Filter Bar -->
      <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3 justify-between">
        <div class="flex flex-wrap items-center gap-3 flex-1">
          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase">Fecha</label>
            <input type="date" id="filter-admin-date" value="${defaultDate}" class="form-input text-xs py-1.5 px-3 rounded-lg border-gray-300">
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase">Vendedor</label>
            <select id="filter-admin-seller" class="form-input text-xs py-1.5 px-3 rounded-lg border-gray-300 min-w-44">
              <option value="">Todos los vendedores</option>
              ${sellers.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-500 uppercase">Estatus</label>
            <select id="filter-admin-status" class="form-input text-xs py-1.5 px-3 rounded-lg border-gray-300">
              <option value="">Todos los estados</option>
              ${Object.entries(VISIT_STATUS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-2 sm:mt-0">
          <button id="btn-export-excel" class="btn btn-secondary text-xs flex items-center gap-1.5">
            <i class="fas fa-file-excel text-emerald-600"></i> Exportar Excel
          </button>
          <button id="btn-refresh-admin" class="btn btn-secondary text-xs flex items-center gap-1.5">
            <i class="fas fa-rotate"></i> Actualizar
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" id="admin-kpi-container">
        <!-- populated dynamically -->
      </div>

      <!-- Table Section -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-sm text-gray-800 flex items-center gap-2">
            <i class="fas fa-list-check text-teal-600"></i> Auditoría de Visitas
          </h3>
          <span class="text-xs text-gray-500" id="admin-count-label">0 visitas</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th class="py-3 px-3">#</th>
                <th class="py-3 px-3">Vendedor</th>
                <th class="py-3 px-3">Cliente</th>
                <th class="py-3 px-3">Objetivo</th>
                <th class="py-3 px-3">Horarios</th>
                <th class="py-3 px-3">Estatus</th>
                <th class="py-3 px-3">Novedad</th>
                <th class="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="admin-visits-tbody" class="divide-y divide-gray-100">
              <!-- rows -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const repaint = () => {
    const dVal = (contentEl.querySelector('#filter-admin-date') as HTMLInputElement)?.value;
    const sVal = (contentEl.querySelector('#filter-admin-seller') as HTMLSelectElement)?.value;
    const stVal = (contentEl.querySelector('#filter-admin-status') as HTMLSelectElement)?.value;

    let filtered = visits;
    if (dVal) filtered = filtered.filter(v => v.visit_date === dVal);
    if (sVal) filtered = filtered.filter(v => v.seller_id === sVal);
    if (stVal) filtered = filtered.filter(v => v.status === stVal);

    // Update KPIs
    const total = filtered.length;
    const inProgress = filtered.filter(v => v.status === 'EN_CURSO').length;
    const salesOk = filtered.filter(v => v.status === 'COMPLETADA_PEDIDO').length;
    const paymentsOk = filtered.filter(v => v.status === 'COMPLETADA_RECAUDO').length;
    const notEff = filtered.filter(v => v.status === 'NO_EFECTIVA').length;
    const effPct = total > 0 ? Math.round(((salesOk + paymentsOk) / total) * 100) : 0;

    const kpiEl = contentEl.querySelector('#admin-kpi-container');
    if (kpiEl) {
      kpiEl.innerHTML = `
        <div class="bg-white p-3 rounded-xl border border-gray-200">
          <p class="text-[10px] font-bold text-gray-500 uppercase">Total</p>
          <p class="text-xl font-extrabold text-gray-900">${total}</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-blue-200 bg-blue-50/30">
          <p class="text-[10px] font-bold text-blue-700 uppercase">En Curso</p>
          <p class="text-xl font-extrabold text-blue-700">${inProgress}</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/30">
          <p class="text-[10px] font-bold text-emerald-700 uppercase">Ventas</p>
          <p class="text-xl font-extrabold text-emerald-700">${salesOk}</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-teal-200 bg-teal-50/30">
          <p class="text-[10px] font-bold text-teal-700 uppercase">Recaudos</p>
          <p class="text-xl font-extrabold text-teal-700">${paymentsOk}</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-amber-200 bg-amber-50/30">
          <p class="text-[10px] font-bold text-amber-700 uppercase">No Efectivas</p>
          <p class="text-xl font-extrabold text-amber-700">${notEff}</p>
        </div>
        <div class="bg-white p-3 rounded-xl border border-teal-300 bg-teal-50/60">
          <p class="text-[10px] font-bold text-teal-800 uppercase">% Efectividad</p>
          <p class="text-xl font-extrabold text-teal-900">${effPct}%</p>
        </div>
      `;
    }

    const tbody = contentEl.querySelector('#admin-visits-tbody');
    const countLabel = contentEl.querySelector('#admin-count-label');
    if (countLabel) countLabel.textContent = `${filtered.length} visitas encontradas`;

    if (!tbody) return;
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-gray-400">No hay visitas que coincidan con los filtros.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((v, i) => {
      const st = VISIT_STATUS[v.status] || VISIT_STATUS.PROGRAMADA;
      const obj = OBJECTIVES[v.objective || 'VENTA'] || OBJECTIVES.VENTA;
      const sellerName = v.expand?.seller_id?.name || 'Vendedor';
      const clientName = v.expand?.client_id?.name || 'Cliente';
      const clientCity = v.expand?.client_id?.city || '';

      return `
        <tr class="hover:bg-gray-50/80">
          <td class="py-3 px-3 font-bold text-gray-500">${v.order_seq || (i + 1)}</td>
          <td class="py-3 px-3 font-bold text-gray-900">${esc(sellerName)}</td>
          <td class="py-3 px-3">
            <span class="font-bold text-gray-800 block">${esc(clientName)}</span>
            <span class="text-[10px] text-gray-400">${esc(clientCity)}</span>
          </td>
          <td class="py-3 px-3">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
              <i class="fas ${obj.icon} mr-1"></i>${obj.label}
            </span>
          </td>
          <td class="py-3 px-3 text-[11px] text-gray-500">
            In: ${v.checkin_time?.slice(11, 16) || '--:--'}<br>
            Out: ${v.checkout_time?.slice(11, 16) || '--:--'}
          </td>
          <td class="py-3 px-3">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold" style="background:${st.bg}; color:${st.color}">
              <i class="fas ${st.icon} mr-1"></i>${st.label}
            </span>
          </td>
          <td class="py-3 px-3 text-[11px] text-gray-500 max-w-xs truncate">
            ${v.no_order_reason ? NO_ORDER_REASONS[v.no_order_reason] || v.no_order_reason : (v.notes || '—')}
          </td>
          <td class="py-3 px-3 text-right">
            <button class="btn-admin-edit p-1.5 text-gray-400 hover:text-teal-700" data-id="${v.id}" title="Modificar"><i class="fas fa-pen"></i></button>
            <button class="btn-admin-del p-1.5 text-gray-400 hover:text-red-700" data-id="${v.id}" title="Eliminar"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('');

    // Bind edit/del in table
    tbody.querySelectorAll('.btn-admin-edit').forEach((b: any) => {
      b.addEventListener('click', () => {
        const item = visits.find(x => x.id === b.dataset.id);
        if (item) {
          _openOutcomeEditModal(item.id, () => renderControlRutasAdmin(container));
        }
      });
    });

    tbody.querySelectorAll('.btn-admin-del').forEach((b: any) => {
      b.addEventListener('click', async () => {
        if (confirm('¿Eliminar esta visita programada?')) {
          await (window as any).pb.delete('vendor_visits', b.dataset.id);
          (window as any).showToast('Visita eliminada');
          renderControlRutasAdmin(container);
        }
      });
    });
  };

  contentEl.querySelector('#filter-admin-date')?.addEventListener('change', repaint);
  contentEl.querySelector('#filter-admin-seller')?.addEventListener('change', repaint);
  contentEl.querySelector('#filter-admin-status')?.addEventListener('change', repaint);
  contentEl.querySelector('#btn-refresh-admin')?.addEventListener('click', () => renderControlRutasAdmin(container));

  repaint();
}

function _renderAdminPlannerTab(container: HTMLElement, visits: VendorVisit[], sellers: any[], clients: any[]) {
  const contentEl = container.querySelector('#admin-rutas-content');
  if (!contentEl) return;
  const esc = (window as any).esc;

  contentEl.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Asignador de Rutas Form -->
      <div class="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 class="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
          <i class="fas fa-user-plus text-teal-600"></i> Asignación Masiva de Rutas
        </h3>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Vendedor Responsable</label>
          <select id="admin-plan-seller" class="form-input text-xs w-full">
            <option value="">Selecciona un vendedor...</option>
            ${sellers.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Fecha de la Ruta</label>
          <input type="date" id="admin-plan-date" value="${new Date().toISOString().slice(0, 10)}" class="form-input text-xs w-full">
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Objetivo Predeterminado</label>
          <select id="admin-plan-obj" class="form-input text-xs w-full">
            ${Object.entries(OBJECTIVES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Instrucciones para el Vendedor</label>
          <textarea id="admin-plan-notes" rows="2" class="form-input text-xs w-full" placeholder="Ej: Visita de fidelización y cobro de saldo vencido..."></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-700 mb-1">Seleccionar Clientes para la Ruta</label>
          <input type="text" id="admin-search-client" class="form-input text-xs w-full mb-2" placeholder="Filtrar por nombre o ciudad...">
          
          <div id="admin-client-list" class="max-h-60 overflow-y-auto space-y-1.5 border border-gray-200 p-2 rounded-xl bg-gray-50/50">
            ${clients.map(c => `
              <label class="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-teal-50/30 cursor-pointer client-row">
                <input type="checkbox" value="${esc(c.id)}" class="rounded text-teal-600 chk-admin-client">
                <div class="text-xs">
                  <span class="font-bold text-gray-800 block">${esc(c.name)}</span>
                  <span class="text-[10px] text-gray-500">${esc(c.address || '')} · ${esc(c.city || '')}</span>
                </div>
              </label>
            `).join('')}
          </div>
        </div>

        <button id="btn-save-admin-batch" class="btn btn-primary w-full py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 bg-[#006876]">
          <i class="fas fa-check-double"></i> Asignar y Guardar Ruta
        </button>
      </div>

      <!-- Resumen de Rutas Programadas -->
      <div class="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 class="font-bold text-base text-gray-900 flex items-center gap-2 border-b pb-3 border-gray-100">
          <i class="fas fa-users-viewfinder text-teal-600"></i> Carga de Visitas por Asesor
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${sellers.map(s => {
            const sellerVisits = visits.filter(v => v.seller_id === s.id);
            return `
              <div class="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="font-bold text-sm text-gray-900">${esc(s.name)}</h4>
                  <span class="text-xs font-extrabold px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full">${sellerVisits.length} visitas</span>
                </div>
                <div class="text-xs text-gray-600 space-y-1 pt-1 border-t border-gray-200">
                  <div class="flex justify-between">
                    <span>Programadas pendientes:</span>
                    <strong class="text-gray-800">${sellerVisits.filter(v => v.status === 'PROGRAMADA').length}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span>Completadas:</span>
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

  contentEl.querySelector('#admin-search-client')?.addEventListener('input', (e) => {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    contentEl.querySelectorAll('.client-row').forEach(el => {
      const txt = el.textContent?.toLowerCase() || '';
      (el as HTMLElement).style.display = txt.includes(q) ? 'flex' : 'none';
    });
  });

  contentEl.querySelector('#btn-save-admin-batch')?.addEventListener('click', async () => {
    const sellerId = (contentEl.querySelector('#admin-plan-seller') as HTMLSelectElement)?.value;
    const visitDate = (contentEl.querySelector('#admin-plan-date') as HTMLInputElement)?.value;
    const objective = (contentEl.querySelector('#admin-plan-obj') as HTMLSelectElement)?.value;
    const notes = (contentEl.querySelector('#admin-plan-notes') as HTMLTextAreaElement)?.value;

    const checkedClients = Array.from(contentEl.querySelectorAll('.chk-admin-client:checked')).map(
      (chk: any) => chk.value
    );

    if (!sellerId || !visitDate || checkedClients.length === 0) {
      alert('Por favor selecciona vendedor, fecha y al menos un cliente.');
      return;
    }

    try {
      const btn = contentEl.querySelector('#btn-save-admin-batch') as HTMLButtonElement;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';

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

      (window as any).showToast(`Ruta de ${checkedClients.length} visitas asignada con éxito!`);
      renderControlRutasAdmin(container);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  });
}

function _openNewVisitModal(sellers: any[], clients: any[], defaultDate: string, onDone: () => void) {
  const esc = (window as any).esc;
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="font-extrabold text-sm text-slate-900">Programar Nueva Visita</h3>
        <button id="modal-close-x" class="text-slate-400 hover:text-slate-600">&times;</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">Vendedor</label>
          <select id="modal-seller" class="form-input text-xs w-full">
            ${sellers.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Cliente</label>
          <select id="modal-client" class="form-input text-xs w-full">
            ${clients.map(c => `<option value="${esc(c.id)}">${esc(c.name)} (${esc(c.city || 'Ciudad')})</option>`).join('')}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Fecha</label>
            <input type="date" id="modal-date" value="${defaultDate}" class="form-input text-xs w-full">
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Secuencia #</label>
            <input type="number" id="modal-seq" value="1" min="1" class="form-input text-xs w-full">
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Objetivo</label>
          <select id="modal-objective" class="form-input text-xs w-full">
            ${Object.entries(OBJECTIVES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">Notas</label>
          <textarea id="modal-notes" rows="2" class="form-input text-xs w-full"></textarea>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button id="modal-cancel-btn" class="btn btn-secondary text-xs flex-1">Cancelar</button>
        <button id="modal-save-btn" class="btn btn-primary text-xs flex-1 bg-[#006876]">Guardar Visita</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#modal-close-x')?.addEventListener('click', close);
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
      (window as any).showToast('Visita guardada');
      close();
      onDone();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  });
}

// Router general
export async function renderRutasVisitas(container: HTMLElement) {
  const role = (window as any).pb?.currentUser?.role;
  if (role === 'vendedor') {
    return renderMiAgendaRutas(container);
  }
  return renderControlRutasAdmin(container);
}

(window as any).renderRutasVisitas = renderRutasVisitas;
(window as any).renderMiAgendaRutas = renderMiAgendaRutas;
(window as any).renderControlRutasAdmin = renderControlRutasAdmin;
