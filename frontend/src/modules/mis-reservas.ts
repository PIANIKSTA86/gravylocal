/**
 * GRAVY v2.0 — mis-reservas.ts
 * Módulo Móvil de Consulta y Gestión de Reservas de Preventa para Vendedores.
 * Diseño en tarjetas verticales de alta ergonomía táctil y seguimiento de embarques en tránsito (ETA).
 */

'use strict';

interface ReservationStatusMeta {
  label: string;
  badge: string;
  icon: string;
}

const RES_STATUS_MAP: Record<string, ReservationStatusMeta> = {
  active:    { label: 'En Tránsito (Activa)',      badge: 'bg-amber-100 text-amber-900 border-amber-300',   icon: 'fas fa-ship' },
  ready:     { label: 'Lista para Facturar',       badge: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: 'fas fa-circle-check' },
  completed: { label: 'Facturada / Despachada',    badge: 'bg-blue-100 text-blue-900 border-blue-300',       icon: 'fas fa-file-invoice-dollar' },
  cancelled: { label: 'Cancelada / Liberada',      badge: 'bg-rose-100 text-rose-900 border-rose-300',       icon: 'fas fa-ban' },
};

export async function renderMisReservasVendedor(container: HTMLElement) {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  container = getContainer(container);
  if (!container) return;

  container.innerHTML = `
    <div class="p-8 text-center" style="color:#9CA3AF">
      <i class="fas fa-spinner fa-spin mr-2"></i>Cargando reservas de preventa...
    </div>
  `;

  try {
    const pb = (window as any).pb;
    const isVendedor = pb.currentUser?.role === 'vendedor';

    // 1. Obtener Reservas y Líneas
    const [reservations, lines] = await Promise.all([
      pb.listAll('sales_reservations', {
        sort: '-created',
        expand: 'customer_id,sales_order_id,invoice_id',
      }).catch(() => []),
      pb.listAll('sales_reservation_lines', {
        expand: 'product_id,import_id,import_line_id',
      }).catch(() => []),
    ]);

    // Filtrar por vendedor si aplica
    let userReservations = reservations;
    if (isVendedor && pb.currentUser?.id) {
      const uid = pb.currentUser.id;
      userReservations = reservations.filter((r: any) => r.created_by === uid || r.expand?.sales_order_id?.user_id === uid);
    }

    // Mapear líneas por reserva
    const linesByResId: Record<string, any[]> = {};
    for (const line of lines) {
      const rid = line.reservation_id;
      if (!rid) continue;
      if (!linesByResId[rid]) linesByResId[rid] = [];
      linesByResId[rid].push(line);
    }

    // Calcular estadísticas
    const totalCount = userReservations.length;
    const activeCount = userReservations.filter((r: any) => r.status === 'active' || r.status === 'partial').length;
    const readyCount = userReservations.filter((r: any) => {
      if (r.status !== 'active' && r.status !== 'partial') return false;
      const resLines = linesByResId[r.id] || [];
      return resLines.some((l: any) => {
        const impStatus = l.expand?.import_id?.status;
        return impStatus === 'nacionalizacion' || impStatus === 'bodega' || impStatus === 'recibida';
      });
    }).length;
    const completedCount = userReservations.filter((r: any) => !!r.invoice_id || r.status === 'completed').length;

    const totalValue = userReservations.reduce((sum: number, r: any) => {
      const resLines = linesByResId[r.id] || [];
      const lineSum = resLines.reduce((s: number, l: any) => {
        const price = Number(l.expand?.product_id?.base_price || 0);
        return s + (Number(l.qty_reserved || 0) * price);
      }, 0);
      return sum + lineSum;
    }, 0);

    // 2. Renderizar Estructura Principal
    container.innerHTML = `
      <div class="max-w-4xl mx-auto space-y-4 pb-20">
        
        <!-- Top Header Móvil -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h3 class="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-[#006876] text-white flex items-center justify-center text-sm shadow-xs">
                <i class="fas fa-boxes-packing"></i>
              </span>
              <span>Mis Reservas de Preventa</span>
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Seguimiento a pedidos de mercancía en tránsito y fechas de arribo (ETA).</p>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-refresh-res" class="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 text-xs font-bold flex items-center gap-1.5 active:scale-95" title="Actualizar">
              <i class="fas fa-rotate"></i>
              <span class="hidden sm:inline">Refrescar</span>
            </button>
            <button id="btn-go-catalogo-res" class="btn btn-primary px-3.5 py-2 rounded-xl font-extrabold text-xs bg-[#006876] hover:bg-[#004F5A] text-white flex items-center gap-1.5 shadow-sm">
              <i class="fas fa-plus"></i>
              <span>Nueva Reserva</span>
            </button>
          </div>
        </div>

        <!-- KPIs Resumen -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div class="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Reservas</span>
            <span class="text-xl font-extrabold text-slate-800">${totalCount}</span>
          </div>
          <div class="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 shadow-2xs">
            <span class="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">En Tránsito (ETA)</span>
            <span class="text-xl font-extrabold text-amber-900">${activeCount}</span>
          </div>
          <div class="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 shadow-2xs">
            <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Listas p/ Facturar</span>
            <span class="text-xl font-extrabold text-emerald-900">${readyCount}</span>
          </div>
          <div class="bg-blue-50/70 p-3 rounded-2xl border border-blue-200 shadow-2xs">
            <span class="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Total Comprometido</span>
            <span class="text-xs sm:text-sm font-extrabold text-blue-900 truncate block mt-1">${(window as any).fmt(totalValue)}</span>
          </div>
        </div>

        <!-- Píldoras de Filtro Rápido -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold" id="res-filter-pills">
          <button class="res-pill px-3 py-1.5 rounded-full border bg-slate-900 text-white border-slate-900 shadow-xs" data-filter="all">
            Todas (${totalCount})
          </button>
          <button class="res-pill px-3 py-1.5 rounded-full border bg-white text-slate-700 border-slate-200 hover:bg-slate-50" data-filter="active">
            🟡 En Tránsito (${activeCount})
          </button>
          <button class="res-pill px-3 py-1.5 rounded-full border bg-white text-slate-700 border-slate-200 hover:bg-slate-50" data-filter="ready">
            🟢 Listas para Facturar (${readyCount})
          </button>
          <button class="res-pill px-3 py-1.5 rounded-full border bg-white text-slate-700 border-slate-200 hover:bg-slate-50" data-filter="completed">
            🔵 Facturadas (${completedCount})
          </button>
        </div>

        <!-- Búsqueda en Vivo -->
        <div class="relative">
          <i class="fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input id="res-search-input" type="text" placeholder="Buscar por cliente, documento o embarque..." 
                 class="w-full bg-white border border-slate-200 rounded-2xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 shadow-2xs focus:ring-1 focus:ring-teal-600 outline-none">
        </div>

        <!-- Lista de Tarjetas Verticales -->
        <div class="space-y-3" id="res-cards-list">
          ${renderReservationCards(userReservations, linesByResId)}
        </div>

      </div>
    `;

    // ── Eventos de Filtro y Búsqueda ──────────────────────────────
    const pills = container.querySelectorAll('.res-pill');
    let currentFilter = 'all';

    pills.forEach((p: any) => {
      p.addEventListener('click', () => {
        pills.forEach((x: any) => {
          x.className = 'res-pill px-3 py-1.5 rounded-full border bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
        });
        p.className = 'res-pill px-3 py-1.5 rounded-full border bg-slate-900 text-white border-slate-900 shadow-xs';
        currentFilter = p.dataset.filter;
        applyFilter();
      });
    });

    const searchInput = container.querySelector('#res-search-input') as HTMLInputElement;
    searchInput?.addEventListener('input', () => applyFilter());

    function applyFilter() {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const cardEls = container.querySelectorAll('.res-timeline-card') as NodeListOf<HTMLElement>;

      cardEls.forEach(card => {
        const text = card.textContent?.toLowerCase() || '';
        const status = card.dataset.status || '';
        const isReady = card.dataset.ready === 'true';

        let matchesFilter = true;
        if (currentFilter === 'active') matchesFilter = (status === 'active' || status === 'partial') && !isReady;
        else if (currentFilter === 'ready') matchesFilter = isReady && (status === 'active' || status === 'partial');
        else if (currentFilter === 'completed') matchesFilter = status === 'completed' || !!card.dataset.invoiced;

        const matchesQuery = !q || text.includes(q);
        card.style.display = (matchesFilter && matchesQuery) ? 'block' : 'none';
      });
    }

    // ── Acciones de Botones en Tarjetas ───────────────────────────
    _bindReservationCardEvents(container, userReservations, linesByResId);

    // Botón Refrescar
    container.querySelector('#btn-refresh-res')?.addEventListener('click', () => {
      renderMisReservasVendedor(container);
    });

    // Botón Nueva Reserva -> Va al Catálogo en Modo Reserva
    container.querySelector('#btn-go-catalogo-res')?.addEventListener('click', () => {
      if ((window as any).SalesCart) {
        (window as any).SalesCart.setCartMode('reserva');
      }
      if (typeof (window as any).navigate === 'function') {
        (window as any).navigate('productos');
      }
    });

  } catch (err: any) {
    container.innerHTML = `
      <div class="p-8 text-center" style="color:#EF4444">
        <i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message || 'Error al cargar reservas')}
      </div>
    `;
  }
}

// ── Renderizado de Tarjetas Verticales de Reservas ────────────────────────────
function renderReservationCards(reservations: any[], linesByResId: Record<string, any[]>) {
  const esc = (window as any).esc;
  const fmt = (window as any).fmt;
  const fmtN = (window as any).fmtN;
  const fmtDate = (window as any).fmtDate;

  if (!reservations.length) {
    return `
      <div class="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        <i class="fas fa-boxes-packing text-3xl mb-2 text-slate-300"></i>
        <p class="text-xs font-semibold">No tienes reservas registradas actualmente.</p>
      </div>
    `;
  }

  return reservations.map(r => {
    const cust = r.expand?.customer_id || {};
    const lines = linesByResId[r.id] || [];
    const isCompleted = !!r.invoice_id || r.status === 'completed';
    const isCancelled = r.status === 'cancelled';

    // Analizar embarques y ETA de las líneas
    let firstImportNumber = '';
    let firstEta = '';
    let firstStatus = '';
    let isReadyToInvoice = false;

    lines.forEach(l => {
      const imp = l.expand?.import_id;
      if (imp) {
        if (!firstImportNumber) firstImportNumber = imp.number || 'IMP';
        if (!firstEta && imp.estimated_arrival) firstEta = imp.estimated_arrival;
        if (!firstStatus) firstStatus = imp.status;
        if (imp.status === 'nacionalizacion' || imp.status === 'bodega' || imp.status === 'recibida') {
          isReadyToInvoice = true;
        }
      }
    });

    let statusMeta = RES_STATUS_MAP[r.status] || RES_STATUS_MAP.active;
    if (isReadyToInvoice && !isCompleted && !isCancelled) {
      statusMeta = RES_STATUS_MAP.ready;
    }

    const totalRes = lines.reduce((s, l) => {
      const price = Number(l.expand?.product_id?.base_price || 0);
      return s + (Number(l.qty_reserved || 0) * price);
    }, 0);

    const etaStr = firstEta ? fmtDate(firstEta) : 'Por definir';

    // Cálculo de días restantes
    let daysRemainingText = '';
    if (firstEta && !isCompleted && !isCancelled) {
      const targetDate = new Date(firstEta);
      const today = new Date();
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        daysRemainingText = `⏳ Faltan aprox. ${diffDays} días para arribo`;
      } else if (diffDays === 0) {
        daysRemainingText = `⚓ Arribo programado para hoy`;
      } else {
        daysRemainingText = `📦 Arribo estimado superado (${Math.abs(diffDays)} días)`;
      }
    }

    return `
      <div class="res-timeline-card bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 transition-all hover:shadow-md"
           data-id="${r.id}"
           data-status="${esc(r.status)}"
           data-ready="${isReadyToInvoice}"
           data-invoiced="${!!r.invoice_id}">
        
        <!-- Cabecera Tarjeta: Número y Estado -->
        <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-extrabold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                #RES-${esc(r.id.slice(-6).toUpperCase())}
              </span>
              <span class="text-[10px] text-slate-400 font-semibold">${fmtDate(r.created)}</span>
            </div>
            <h4 class="font-extrabold text-sm text-slate-900 mt-1">${esc(cust.name || 'Cliente Particular')}</h4>
            <p class="text-[11px] text-slate-500 font-mono">
              ${cust.doc_number ? `NIT/CC: ${esc(cust.doc_number)}` : ''} 
              ${cust.phone ? `· <a href="tel:${esc(cust.phone)}" class="text-blue-600 hover:underline"><i class="fas fa-phone text-[10px]"></i> ${esc(cust.phone)}</a>` : ''}
            </p>
          </div>

          <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${statusMeta.badge} flex items-center gap-1 shadow-2xs whitespace-nowrap">
            <i class="${statusMeta.icon} text-[10px]"></i>
            <span>${statusMeta.label}</span>
          </span>
        </div>

        <!-- Información de Embarque y Arribo (ETA) -->
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-slate-600 font-bold flex items-center gap-1.5">
              <i class="fas fa-ship text-blue-600"></i>
              <span>Embarque: <strong>${esc(firstImportNumber || 'IMP-TRANSITO')}</strong></span>
            </span>
            <span class="text-[11px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              <i class="fas fa-calendar-day mr-1"></i>ETA: ${etaStr}
            </span>
          </div>

          ${daysRemainingText ? `
            <p class="text-[10px] font-semibold text-slate-500 pt-0.5">${daysRemainingText}</p>
          ` : ''}
        </div>

        <!-- Desglose de Artículos Reservados -->
        <div class="space-y-1.5">
          <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Artículos Apartados (${lines.length})</span>
          <div class="divide-y divide-slate-100 text-xs">
            ${lines.map(l => {
              const p = l.expand?.product_id || {};
              const unit = p.unit || 'UND';
              const price = Number(p.base_price || 0);
              const lineTotal = Number(l.qty_reserved || 0) * price;

              // Conversión informativa si tiene dimensiones
              const conv = (window as any).convertProductQty(l.qty_reserved, unit, p);
              const equivParts: string[] = [];
              if (conv?.cajas != null && unit !== 'CJ') equivParts.push(`${conv.cajas} Cajas`);
              if (conv?.m2 != null && unit !== 'M2') equivParts.push(`${conv.m2} m²`);
              if (conv?.pesoKg != null && unit !== 'KG') equivParts.push(`${conv.pesoKg} Kg`);

              return `
                <div class="py-1.5 flex items-center justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <p class="font-extrabold text-slate-800 text-xs truncate">${esc(p.name || 'Producto')}</p>
                    <p class="text-[10px] text-slate-500">
                      <strong class="text-slate-900">${fmtN(l.qty_reserved)} ${esc(unit)}</strong> x ${fmt(price)}
                      ${equivParts.length ? `· <span class="text-teal-700 font-semibold">(${equivParts.join(' · ')})</span>` : ''}
                    </p>
                  </div>
                  <span class="font-extrabold text-xs text-blue-900 font-mono">${fmt(lineTotal)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Total de la Reserva -->
        <div class="flex items-baseline justify-between pt-2 border-t border-slate-100">
          <span class="text-xs font-bold text-slate-500">Valor Total Estimado:</span>
          <span class="text-base font-extrabold text-slate-900 font-mono">${fmt(totalRes)}</span>
        </div>

        <!-- Botones de Acción Comercial Rápida -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
          
          <!-- Botón WhatsApp -->
          <button type="button" class="btn-res-wa btn btn-outline btn-sm py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 active:scale-95"
                  data-phone="${esc(cust.phone || '')}"
                  data-client="${esc(cust.name || '')}"
                  data-res="${esc(r.id.slice(-6).toUpperCase())}"
                  data-eta="${etaStr}">
            <i class="fab fa-whatsapp text-emerald-600 text-xs"></i>
            <span>WhatsApp</span>
          </button>

          <!-- Botón Comprobante -->
          <button type="button" class="btn-res-voucher btn btn-outline btn-sm py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 active:scale-95"
                  data-id="${r.id}">
            <i class="fas fa-file-pdf text-slate-500 text-xs"></i>
            <span>Comprobante</span>
          </button>

          <!-- Botón Convertir a Factura -->
          ${!isCompleted && !isCancelled ? `
            <button type="button" class="btn-res-to-invoice btn btn-primary btn-sm py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold active:scale-95"
                    data-id="${r.id}"
                    data-clientid="${esc(cust.id || '')}">
              <i class="fas fa-receipt text-xs"></i>
              <span>Facturar</span>
            </button>
          ` : `
            <div class="text-center py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
              Procesada
            </div>
          `}

          <!-- Botón Cancelar/Liberar -->
          ${!isCompleted && !isCancelled ? `
            <button type="button" class="btn-res-cancel btn btn-outline btn-sm py-1.5 px-2 rounded-xl text-[11px] flex items-center justify-center gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 active:scale-95"
                    data-id="${r.id}">
              <i class="fas fa-ban text-xs"></i>
              <span>Liberar</span>
            </button>
          ` : `
            <div class="text-center py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
              Finalizada
            </div>
          `}

        </div>

      </div>
    `;
  }).join('');
}

// ── Enlazar Eventos de Tarjetas de Reserva ────────────────────────────────────
function _bindReservationCardEvents(container: HTMLElement, reservations: any[], linesByResId: Record<string, any[]>) {
  const pb = (window as any).pb;
  const showToast = (window as any).showToast;

  // 1. Acción WhatsApp
  container.querySelectorAll('.btn-res-wa').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      const phone = (btn.dataset.phone || '').replace(/\D/g, '');
      const client = btn.dataset.client || 'Estimado cliente';
      const resCode = btn.dataset.res || '';
      const eta = btn.dataset.eta || '';

      const msg = `Hola ${client}, te saludamos de GRAVY. Te confirmamos el estado de tu Reserva de Preventa #RES-${resCode}. Tu mercancía se encuentra en tránsito con fecha estimada de entrega ${eta}. Te notificaremos inmediatamente ingrese a bodega para tu despacho. ¡Gracias por tu preferencia!`;

      const url = phone 
        ? `https://wa.me/57${phone}?text=${encodeURIComponent(msg)}`
        : `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });
  });

  // 2. Acción Comprobante Modal
  container.querySelectorAll('.btn-res-voucher').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      const rid = btn.dataset.id;
      const r = reservations.find((x: any) => x.id === rid);
      const lines = linesByResId[rid] || [];
      if (!r) return;

      const cust = r.expand?.customer_id || {};
      const fmt = (window as any).fmt;
      const fmtN = (window as any).fmtN;
      const fmtDate = (window as any).fmtDate;

      const html = `
        <div class="space-y-4 text-slate-800 -m-2 sm:-m-4" id="print-res-voucher">
          <div class="text-center border-b pb-3 border-slate-200">
            <h4 class="font-extrabold text-base text-slate-900">COMPROBANTE DE RESERVA DE PREVENTA</h4>
            <p class="font-mono text-xs text-slate-500">#RES-${r.id.slice(-6).toUpperCase()} · Fecha: ${fmtDate(r.created)}</p>
          </div>

          <div class="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
            <p><strong>Cliente:</strong> ${cust.name || 'Particular'}</p>
            <p><strong>Documento:</strong> ${cust.doc_number || 'S/N'}</p>
            <p><strong>Teléfono:</strong> ${cust.phone || 'S/N'}</p>
          </div>

          <div class="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table class="w-full text-left">
              <thead class="bg-slate-100 font-extrabold text-slate-700">
                <tr>
                  <th class="p-2">Producto</th>
                  <th class="p-2 text-right">Cant</th>
                  <th class="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${lines.map(l => {
                  const p = l.expand?.product_id || {};
                  const price = Number(p.base_price || 0);
                  return `
                    <tr>
                      <td class="p-2 font-semibold">${p.name || 'Producto'}</td>
                      <td class="p-2 text-right font-mono">${fmtN(l.qty_reserved)} ${p.unit || 'UND'}</td>
                      <td class="p-2 text-right font-mono">${fmt(Number(l.qty_reserved || 0) * price)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="text-center text-[10px] text-slate-400">
            Mercancía apartada en tránsito. Documento informativo no válido como factura tributaria.
          </div>
        </div>
      `;

      const footer = `
        <button class="btn btn-outline" onclick="window.closeModal()">Cerrar</button>
        <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print mr-1"></i> Imprimir</button>
      `;

      (window as any).openModal('Comprobante de Reserva', html, footer, true);
    });
  });

  // 3. Acción Cancelar / Liberar
  container.querySelectorAll('.btn-res-cancel').forEach((btn: any) => {
    btn.addEventListener('click', async () => {
      const rid = btn.dataset.id;
      if (!confirm('¿Deseas cancelar esta reserva y liberar las unidades en tránsito para otros vendedores?')) return;

      try {
        await pb.update('sales_reservations', rid, { status: 'cancelled' });
        showToast('Reserva cancelada y stock en tránsito liberado', 'info');
        renderMisReservasVendedor(container);
      } catch (err: any) {
        showToast(err.message || 'Error al cancelar reserva', 'error');
      }
    });
  });

  // 4. Acción Facturar (Ir a Facturación con el cliente y pedido)
  container.querySelectorAll('.btn-res-to-invoice').forEach((btn: any) => {
    btn.addEventListener('click', () => {
      const clientId = btn.dataset.clientid;
      if (typeof (window as any).navigate === 'function') {
        (window as any).navigate('ventas');
        showToast('Convirtiendo reserva a factura de venta...');
      }
    });
  });
}

(window as any).renderMisReservasVendedor = renderMisReservasVendedor;
