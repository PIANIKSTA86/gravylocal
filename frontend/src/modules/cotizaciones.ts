/**
 * GRAVY v2.0 — cotizaciones.ts
 * Módulo independiente de Cotizaciones Comerciales.
 * Administra el ciclo de vida de propuestas comerciales, ofertas y cotizaciones:
 * - Colecciones de base de datos dedicadas: `quotations` y `quotation_lines`
 * - Soporte para comentarios extensos por ítem (icono fa-comment-dots)
 * - Conversión directa a Pedidos de Venta (PED) o Facturación Electrónica (FV)
 * - Despacho interactivo vía WhatsApp Bot con previsualización y adjunto PDF
 * - Búsqueda dinámica predictiva de clientes (estándar Facturación / Pedidos)
 * - Creación ágil de clientes con validación DIAN y cálculo de DV
 * - Buscador global predictivo de productos con tecla rápida y autocompletado de precios (base_price)
 * - Creación ágil de productos y servicios sin perder estado de la cotización
 * - Cards KPI estandarizadas con la paleta oficial (#F5F3FF, #DDD6FE, text-purple-950)
 */

'use strict';

interface QuotationStatusDetail {
  label: string;
  badge: string;
  icon: string;
}

const QUOTATION_STATUS: Record<string, QuotationStatusDetail> = {
  draft: { label: 'Borrador', badge: 'badge-gray', icon: 'fa-file-lines' },
  sent: { label: 'Enviada', badge: 'badge-purple', icon: 'fa-paper-plane' },
  accepted: { label: 'Aprobada', badge: 'badge-green', icon: 'fa-check' },
  converted_order: { label: 'En Pedido', badge: 'badge-purple', icon: 'fa-cart-shopping' },
  converted_invoice: { label: 'Facturada', badge: 'badge-emerald', icon: 'fa-receipt' },
  rejected: { label: 'Rechazada', badge: 'badge-red', icon: 'fa-xmark' },
  expired: { label: 'Vencida', badge: 'badge-amber', icon: 'fa-clock' },
  cancelled: { label: 'Cancelada', badge: 'badge-red', icon: 'fa-ban' },
};

let _allQuotesCache: any[] = [];

export async function renderCotizaciones(container?: HTMLElement) {
  const getContainer = (window as any).getPageContainer || ((x: any, k: string) => x || document.getElementById('tab-pane-' + k));
  const target = getContainer(container, 'cotizaciones');
  if (!target) return;

  target.innerHTML = `<div class="p-8 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando cotizaciones comerciales...</div>`;
  try {
    await _loadCotizacionesPage(target);
  } catch (err: any) {
    target.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function _loadCotizacionesPage(c: HTMLElement) {
  const result = await (window as any).API.getQuotations({ page: 1, perPage: 250, sort: '-date,-created' });
  const quotes = result.items || [];
  _allQuotesCache = quotes;

  const total = quotes.length;
  const draftCount = quotes.filter((q: any) => q.status === 'draft').length;
  const convertedCount = quotes.filter((q: any) => q.status === 'converted_order' || q.status === 'converted_invoice').length;
  const totalVal = quotes.filter((q: any) => q.status !== 'cancelled' && q.status !== 'rejected').reduce((s: number, q: any) => s + (q.total || 0), 0);

  c.innerHTML = `
    <!-- Encabezado y Botón de Nueva Cotización -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
          <i class="fas fa-file-invoice-dollar text-violet-600"></i>
          <span>Cotizaciones Comerciales</span>
        </h3>
        <p class="text-sm text-slate-500">Gestión independiente de presupuestos, ofertas y propuestas para clientes.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary" id="btn-new-quotation" style="background:#7C3AED;border-color:#6D28D9;color:#fff">
          <i class="fas fa-plus"></i> Nueva Cotización (COT)
        </button>
      </div>
    </div>

    <!-- Cards KPI idénticas al módulo de Facturación -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5" id="quote-kpis-container">
      ${_quoteKpi('TOTAL COTIZACIONES', total, 'fas fa-file-invoice-dollar', '#7C3AED', '#EDE9FE')}
      ${_quoteKpi('BORRADORES', draftCount, 'fas fa-pencil', '#D97706', '#FEF3C7')}
      ${_quoteKpi('CONVERTIDAS', convertedCount, 'fas fa-check-circle', '#059669', '#DCFCE7')}
      ${_quoteKpi('VALOR TOTAL COTIZADO', (window as any).fmt(totalVal), 'fas fa-coins', '#7C3AED', '#EDE9FE')}
    </div>

    <!-- Filtros de Búsqueda -->
    <div class="bg-white rounded-2xl border p-3 mb-4 flex flex-wrap gap-3 items-center shadow-2xs" style="border-color:#F0F0F0">
      <div class="relative flex-1 min-w-56">
        <i class="fas fa-search absolute left-3 top-3 text-slate-400 text-xs"></i>
        <input id="quote-q" class="form-input pl-8 w-full text-xs" placeholder="Buscar número COT, cliente, NIT u observaciones...">
      </div>
      <select id="quote-status-f" class="form-input text-xs" style="max-width:180px">
        <option value="">Todos los estados</option>
        <option value="draft">Borrador</option>
        <option value="sent">Enviada</option>
        <option value="accepted">Aprobada</option>
        <option value="converted_order">Convertida a Pedido</option>
        <option value="converted_invoice">Facturada</option>
        <option value="expired">Vencida</option>
        <option value="rejected">Rechazada</option>
        <option value="cancelled">Cancelada</option>
      </select>
      <input id="quote-from" type="date" class="form-input text-xs" style="max-width:150px" title="Fecha Desde">
      <input id="quote-to"   type="date" class="form-input text-xs" style="max-width:150px" title="Fecha Hasta">
      <button type="button" class="btn btn-outline btn-sm text-xs hover:border-violet-300 hover:text-violet-700" id="btn-quote-clear-filter" title="Limpiar filtros">
        <i class="fas fa-rotate-left"></i>
      </button>
    </div>

    <!-- Tabla de Cotizaciones -->
    <div class="bg-white rounded-2xl border overflow-hidden shadow-2xs" style="border-color:#F0F0F0">
      <div class="overflow-x-auto">
        <table class="table w-full text-xs" id="quotations-table">
          <thead>
            <tr class="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th class="py-3 px-3">Número</th>
              <th class="py-3 px-3">Fecha</th>
              <th class="py-3 px-3">Cliente</th>
              <th class="py-3 px-3">Validez</th>
              <th class="py-3 px-3 text-right">Subtotal</th>
              <th class="py-3 px-3 text-right">IVA</th>
              <th class="py-3 px-3 text-right">Total</th>
              <th class="py-3 px-3 text-center">Estado</th>
              <th class="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody id="quotations-tbody">
            ${quotes.length === 0 ? `
              <tr>
                <td colspan="9" class="p-8 text-center text-slate-400">
                  <div class="max-w-xs mx-auto space-y-2">
                    <i class="fas fa-file-invoice-dollar text-3xl text-violet-300"></i>
                    <p class="font-semibold text-slate-600">No hay cotizaciones registradas</p>
                    <p class="text-xs">Crea tu primera cotización comercial haciendo clic en el botón superior.</p>
                  </div>
                </td>
              </tr>
            ` : quotes.map((q: any) => _renderQuotationRow(q)).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('btn-new-quotation')?.addEventListener('click', () => {
    openQuotationForm(null, () => _loadCotizacionesPage(c));
  });

  const applyFilter = () => _filterQuotationTable();
  document.getElementById('quote-q')?.addEventListener('input', applyFilter);
  document.getElementById('quote-status-f')?.addEventListener('change', applyFilter);
  document.getElementById('quote-from')?.addEventListener('change', applyFilter);
  document.getElementById('quote-to')?.addEventListener('change', applyFilter);
  document.getElementById('btn-quote-clear-filter')?.addEventListener('click', () => {
    (document.getElementById('quote-q') as HTMLInputElement).value = '';
    (document.getElementById('quote-status-f') as HTMLSelectElement).value = '';
    (document.getElementById('quote-from') as HTMLInputElement).value = '';
    (document.getElementById('quote-to') as HTMLInputElement).value = '';
    applyFilter();
  });

  const tbl = document.getElementById('quotations-table') as HTMLTableElement;
  if (tbl && typeof (window as any).makeTableSortable === 'function') {
    (window as any).makeTableSortable(tbl);
  }
}

function _quoteKpi(label: string, value: any, icon: string, color: string, bg: string) {
  return `
    <div class="stat-card" style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:14px;padding:16px 18px;box-shadow:0 1px 3px rgba(124,58,237,0.04);transition:all .2s ease">
      <div class="flex items-center justify-between gap-2 mb-2">
        <span class="text-[11px] font-bold uppercase tracking-wider text-purple-900/75">${label}</span>
        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style="color:${color};background:${bg}">
          <i class="${icon}"></i>
        </div>
      </div>
      <p class="text-2xl font-extrabold tracking-tight text-purple-950">${value}</p>
    </div>
  `;
}

function _renderQuotationRow(q: any) {
  const meta = QUOTATION_STATUS[q.status] || { label: q.status, badge: 'badge-gray', icon: 'fa-circle' };
  const client = q.expand?.customer_id;
  const isExpired = q.due_date && q.due_date < new Date().toISOString().slice(0, 10) && q.status === 'sent';

  return `
    <tr data-qid="${(window as any).esc(q.id)}" data-qstatus="${(window as any).esc(q.status)}" data-qdate="${(window as any).esc(q.date)}">
      <td class="py-2.5 px-3">
        <div class="flex items-center gap-1.5">
          <a href="javascript:void(0)" onclick="window.viewQuotationDetail('${(window as any).esc(q.id)}')" class="font-mono font-bold text-sm text-violet-700 hover:text-violet-900 hover:underline">
            ${(window as any).esc(q.number)}
          </a>
          <span class="badge badge-purple text-[9px] font-bold px-1.5 py-0">COT</span>
        </div>
      </td>
      <td class="py-2.5 px-3 text-slate-600">${(window as any).esc(q.date)}</td>
      <td class="py-2.5 px-3">
        <div class="font-medium text-slate-800">${client ? (window as any).esc(client.name) : '—'}</div>
        <div class="text-[10px] text-slate-400 font-mono">${client ? (window as any).esc(client.doc_number || client.nit || '') : ''}</div>
      </td>
      <td class="py-2.5 px-3 text-slate-500">
        <div>${q.validity_days ? `${q.validity_days} días` : '—'}</div>
        ${q.due_date ? `<div class="text-[10px] ${isExpired ? 'text-red-500 font-bold' : 'text-slate-400'}">Vence: ${q.due_date}</div>` : ''}
      </td>
      <td class="py-2.5 px-3 text-right font-mono text-slate-700">${(window as any).fmt(q.subtotal || 0)}</td>
      <td class="py-2.5 px-3 text-right font-mono text-slate-500">${q.iva_total ? (window as any).fmt(q.iva_total) : '—'}</td>
      <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900">${(window as any).fmt(q.total || 0)}</td>
      <td class="py-2.5 px-3 text-center">
        <span class="badge ${meta.badge} text-[10px] inline-flex items-center gap-1">
          <i class="fas ${meta.icon} text-[9px]"></i>
          <span>${meta.label}</span>
        </span>
      </td>
      <td class="py-2.5 px-3 text-right">
        <div class="inline-flex items-center gap-1.5 justify-end">
          <button type="button" class="btn btn-outline btn-sm px-2 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-300 shadow-2xs transition-colors" title="Enviar PDF por WhatsApp" onclick="window.sendQuotationViaWhatsApp('${(window as any).esc(q.id)}')">
            <i class="fab fa-whatsapp text-xs text-emerald-600"></i>
          </button>
          <button type="button" class="btn btn-outline btn-sm px-2.5 text-slate-700 hover:text-violet-700 hover:border-violet-300 transition-all inline-flex items-center gap-1.5 shadow-2xs" title="Ver detalle de cotización" onclick="window.viewQuotationDetail('${(window as any).esc(q.id)}')">
            <i class="fas fa-eye text-xs text-violet-600"></i>
            <span class="text-xs font-semibold">Ver</span>
          </button>
          <button type="button" class="btn btn-outline btn-sm px-2 text-slate-500 hover:text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs transition-colors" title="Más opciones" onclick="window.openQuotationActionMenu(event, '${(window as any).esc(q.id)}')">
            <i class="fas fa-ellipsis-vertical text-xs"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function _filterQuotationTable() {
  const q = ((document.getElementById('quote-q') as HTMLInputElement)?.value || '').toLowerCase().trim();
  const st = (document.getElementById('quote-status-f') as HTMLSelectElement)?.value || '';
  const from = (document.getElementById('quote-from') as HTMLInputElement)?.value || '';
  const to = (document.getElementById('quote-to') as HTMLInputElement)?.value || '';

  const rows = document.querySelectorAll('#quotations-tbody tr[data-qid]');
  let visibleCount = 0;
  let draftCount = 0;
  let convertedCount = 0;
  let totalAmount = 0;

  rows.forEach((row: any) => {
    const text = row.textContent?.toLowerCase() || '';
    const status = row.dataset.qstatus || '';
    const date = row.dataset.qdate || '';

    const matchQ = !q || text.includes(q);
    const matchSt = !st || status === st;
    const matchFrom = !from || date >= from;
    const matchTo = !to || date <= to;

    const visible = matchQ && matchSt && matchFrom && matchTo;
    row.style.display = visible ? '' : 'none';

    if (visible) {
      visibleCount++;
      if (status === 'draft') draftCount++;
      if (status === 'converted_order' || status === 'converted_invoice') convertedCount++;
      const quoteObj = _allQuotesCache.find(item => item.id === row.dataset.qid);
      if (quoteObj && quoteObj.status !== 'cancelled' && quoteObj.status !== 'rejected') {
        totalAmount += Number(quoteObj.total || 0);
      }
    }
  });

  // Actualizar Cards dinámicamente con los registros visibles/filtrados
  const kpiWrap = document.getElementById('quote-kpis-container');
  if (kpiWrap) {
    kpiWrap.innerHTML = `
      ${_quoteKpi('TOTAL COTIZACIONES', visibleCount, 'fas fa-file-invoice-dollar', '#7C3AED', '#EDE9FE')}
      ${_quoteKpi('BORRADORES', draftCount, 'fas fa-pencil', '#D97706', '#FEF3C7')}
      ${_quoteKpi('CONVERTIDAS', convertedCount, 'fas fa-check-circle', '#059669', '#DCFCE7')}
      ${_quoteKpi('VALOR TOTAL COTIZADO', (window as any).fmt(totalAmount), 'fas fa-coins', '#7C3AED', '#EDE9FE')}
    `;
  }
}

// ── MENÚ FLOTANTE DE ACCIONES ─────────────────────────────────────────
(window as any).openQuotationActionMenu = async function (e: MouseEvent, quoteId: string) {
  e.stopPropagation();
  const oldMenu = document.getElementById('quote-floating-menu');
  if (oldMenu) oldMenu.remove();

  const btn = (e.currentTarget || e.target) as HTMLElement;
  const targetBtn = btn.closest('button') || btn;
  const rect = targetBtn.getBoundingClientRect();

  const menu = document.createElement('div');
  menu.id = 'quote-floating-menu';
  menu.className = 'fixed z-50 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 min-w-[220px] text-xs animate-in fade-in zoom-in-95 duration-100';

  const quote = await (window as any).API.getQuotation(quoteId).catch(() => null);
  if (!quote) return;

  const isConverted = quote.status === 'converted_order' || quote.status === 'converted_invoice';

  menu.innerHTML = `
    <button type="button" class="w-full text-left px-3.5 py-2 text-xs text-violet-700 hover:bg-violet-50 hover:text-violet-900 flex items-center gap-2.5 transition-colors font-semibold" onclick="document.getElementById('quote-floating-menu')?.remove(); window.viewQuotationDetail('${quoteId}')">
      <i class="fas fa-eye text-violet-600 w-4"></i>
      <span>Ver detalle completo</span>
    </button>
    <button type="button" class="w-full text-left px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors font-semibold" onclick="document.getElementById('quote-floating-menu')?.remove(); window.sendQuotationViaWhatsApp('${quoteId}')">
      <i class="fab fa-whatsapp text-emerald-600 w-4"></i>
      <span>Enviar por WhatsApp</span>
    </button>
    <button type="button" class="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors" onclick="document.getElementById('quote-floating-menu')?.remove(); window.printQuotationCarta('${quoteId}')">
      <i class="fas fa-print text-slate-500 w-4"></i>
      <span>Imprimir Formato Carta</span>
    </button>
    <div class="my-1 border-t border-slate-100"></div>
    ${!isConverted ? `
      <button type="button" class="w-full text-left px-3.5 py-2 text-xs text-purple-700 hover:bg-purple-50 hover:text-purple-900 flex items-center gap-2.5 transition-colors font-bold" onclick="document.getElementById('quote-floating-menu')?.remove(); window.convertQuotationToOrder('${quoteId}')">
        <i class="fas fa-cart-shopping text-purple-600 w-4"></i>
        <span>Convertir en Pedido (PED)</span>
      </button>
      <button type="button" class="w-full text-left px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors font-bold" onclick="document.getElementById('quote-floating-menu')?.remove(); window.convertQuotationToInvoice('${quoteId}')">
        <i class="fas fa-receipt text-emerald-600 w-4"></i>
        <span>Facturar Directamente</span>
      </button>
      <div class="my-1 border-t border-slate-100"></div>
      <button type="button" class="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors" onclick="document.getElementById('quote-floating-menu')?.remove(); window.editQuotation('${quoteId}')">
        <i class="fas fa-pen-to-square text-slate-500 w-4"></i>
        <span>Editar Cotización</span>
      </button>
    ` : ''}
    <button type="button" class="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-800 flex items-center gap-2.5 transition-colors" onclick="document.getElementById('quote-floating-menu')?.remove(); window.deleteQuotation('${quoteId}')">
      <i class="fas fa-trash-can text-red-500 w-4"></i>
      <span>Eliminar Cotización</span>
    </button>
  `;

  document.body.appendChild(menu);

  const top = rect.bottom + window.scrollY + 4;
  const left = Math.max(10, rect.right + window.scrollX - menu.offsetWidth);
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;

  const closeFn = (ev: MouseEvent) => {
    if (!menu.contains(ev.target as Node) && ev.target !== targetBtn) {
      menu.remove();
      document.removeEventListener('click', closeFn);
    }
  };
  setTimeout(() => document.addEventListener('click', closeFn), 10);
};

// ── ENVÍO DE COTIZACIÓN POR WHATSAPP ──────────────────────────────────
(window as any).sendQuotationViaWhatsApp = async function (quoteId: string) {
  try {
    (window as any).showToast('Preparando cotización para envío por WhatsApp...', 'info');
    const quote = await (window as any).API.getQuotation(quoteId);
    const lines = await (window as any).API.getQuotationLines(quoteId);
    const client = quote.expand?.customer_id;

    (window as any).openWhatsAppSendModal({
      docType: 'COTIZACION',
      docId: quoteId,
      docNumber: quote.number,
      customerName: client?.name || 'Cliente',
      customerPhone: client?.phone || '',
      total: quote.total || 0,
      lines,
      docData: quote,
      onSent: () => {
        if (quote.status === 'draft') {
          (window as any).pb.update('quotations', quoteId, { status: 'sent' }).catch(() => { });
          const badge = document.querySelector(`tr[data-qid="${quoteId}"] td:nth-child(8)`);
          if (badge) {
            badge.innerHTML = `<span class="badge badge-purple text-[10px] inline-flex items-center gap-1"><i class="fas fa-paper-plane text-[9px]"></i><span>Enviada</span></span>`;
          }
        }
      }
    });
  } catch (err: any) {
    (window as any).showToast('Error al preparar WhatsApp: ' + err.message, 'error');
  }
};

// ── CONVERTIR COTIZACIÓN A PEDIDO (PED) ────────────────────────────────
(window as any).convertQuotationToOrder = async function (quoteId: string) {
  if (!confirm('¿Deseas convertir esta cotización en un Pedido de Venta formal?')) return;
  try {
    (window as any).showToast('Convirtiendo cotización a pedido...', 'info');
    const newOrder = await (window as any).API.convertQuotationToOrder(quoteId);
    (window as any).showToast(`¡Cotización convertida exitosamente en el Pedido #${newOrder.number}!`, 'success');
    if (typeof (window as any).navigate === 'function') {
      (window as any).navigate('pedidos');
    }
  } catch (err: any) {
    (window as any).showToast('Error al convertir a pedido: ' + err.message, 'error');
  }
};

// ── FACTURAR COTIZACIÓN DIRECTAMENTE ──────────────────────────────────
(window as any).convertQuotationToInvoice = async function (quoteId: string) {
  try {
    const quote = await (window as any).API.getQuotation(quoteId);
    const lines = await (window as any).API.getQuotationLines(quoteId);

    if (typeof (window as any).navigate === 'function') {
      (window as any).navigate('ventas');
      setTimeout(() => {
        if (typeof (window as any).openInvoiceFormFromQuotation === 'function') {
          (window as any).openInvoiceFormFromQuotation(quote, lines);
        } else {
          (window as any).showToast(`Abre Nueva Factura y asocia el cliente "${quote.expand?.customer_id?.name || 'Cliente'}"`, 'info');
        }
      }, 300);
    }
  } catch (err: any) {
    (window as any).showToast('Error al preparar facturación: ' + err.message, 'error');
  }
};

// ── IMPRIMIR FORMATO CARTA ────────────────────────────────────────────
(window as any).printQuotationCarta = async function (quoteId: string) {
  try {
    (window as any).showToast('Generando formato carta...', 'info');
    const quote = await (window as any).API.getQuotation(quoteId);
    const lines = await (window as any).API.getQuotationLines(quoteId);

    const [compName, compNit, compAddress, compPhone, compEmail, compCity] = await Promise.all([
      (window as any).API.getSetting('company_name').catch(() => 'GRAVY S.A.S'),
      (window as any).API.getSetting('company_nit').catch(() => '1130636393-2'),
      (window as any).API.getSetting('company_address').catch(() => ''),
      (window as any).API.getSetting('company_phone').catch(() => ''),
      (window as any).API.getSetting('company_email').catch(() => ''),
      (window as any).API.getSetting('company_city').catch(() => ''),
    ]);

    const res = await fetch(`${(window as any).pb.baseUrl}/api/orders/generate-pdf`, {
      method: 'POST',
      headers: { ...(window as any).pb.headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order: { ...quote, order_type: 'COTIZACION' },
        lines,
        company: { name: compName, nit: compNit, address: compAddress, phone: compPhone, email: compEmail, city: compCity },
        format: 'base64'
      })
    });

    if (!res.ok) throw new Error('No se pudo generar el formato PDF');
    const { pdfBase64 } = await res.json();
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (err: any) {
    (window as any).showToast('Error al imprimir: ' + err.message, 'error');
  }
};

// ── VER DETALLE DE COTIZACIÓN ─────────────────────────────────────────
(window as any).viewQuotationDetail = async function (quoteId: string) {
  try {
    (window as any).showToast('Cargando detalle de la cotización...', 'info');
    const quote = await (window as any).API.getQuotation(quoteId);
    const lines = await (window as any).API.getQuotationLines(quoteId);
    const client = quote.expand?.customer_id;
    const seller = quote.expand?.seller_id;
    const meta = QUOTATION_STATUS[quote.status] || { label: quote.status, badge: 'badge-gray', icon: 'fa-circle' };

    const modalHtml = `
      <div class="space-y-4 text-slate-700">
        <!-- Encabezado de la Cotización -->
        <div class="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-violet-50/90 to-purple-50/60 border border-violet-200/80">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-base text-violet-700">${quote.number}</span>
              <span class="badge ${meta.badge} text-[10px] inline-flex items-center gap-1">
                <i class="fas ${meta.icon} text-[9px]"></i>
                <span>${meta.label}</span>
              </span>
            </div>
            <div class="text-xs text-slate-500 mt-0.5">Fecha: <strong>${quote.date}</strong> ${quote.due_date ? `• Vencimiento: <strong>${quote.due_date}</strong>` : ''}</div>
          </div>
          <div class="text-right">
            <div class="text-[11px] text-slate-400">Total Cotizado</div>
            <div class="text-lg font-extrabold font-mono text-violet-700">${(window as any).fmt(quote.total || 0)}</div>
          </div>
        </div>

        <!-- Tercero y Vendedor -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div class="text-[11px] font-bold text-violet-700 uppercase mb-1">Cliente / Tercero</div>
            <div class="font-bold text-slate-800 text-sm">${client ? client.name : '—'}</div>
            <div class="text-slate-500 font-mono">NIT: ${client ? (client.doc_number || client.nit || '—') : '—'}</div>
            <div class="text-slate-500 flex items-center gap-1 mt-0.5">
              <i class="fab fa-whatsapp text-emerald-600"></i>
              <span>${client?.phone || '—'}</span>
            </div>
          </div>
          <div class="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div class="text-[11px] font-bold text-slate-500 uppercase mb-1">Vendedor / Comercial</div>
            <div class="font-semibold text-slate-800">${seller ? seller.name : 'No asignado'}</div>
            <div class="text-slate-500 mt-1">Días de Validez: <strong>${quote.validity_days || 15} días</strong></div>
            ${quote.notes ? `<div class="text-slate-600 italic mt-1 text-[11px]">"${(window as any).esc(quote.notes)}"</div>` : ''}
          </div>
        </div>

        <!-- Tabla de Ítems Cotizados -->
        <div class="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table class="table w-full text-xs">
            <thead class="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th class="py-2.5 px-3">Producto / Servicio</th>
                <th class="py-2.5 px-2 text-right">Cant.</th>
                <th class="py-2.5 px-2 text-right">Precio Unit.</th>
                <th class="py-2.5 px-2 text-right">IVA</th>
                <th class="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map((l: any) => {
      const prod = l.expand?.product_id;
      const prodName = prod?.name || l.description || 'Ítem';
      const parts = String(prodName).split(' — ');
      const mainName = parts[0] || 'Ítem';
      const comment = l.item_notes || (parts.length > 1 ? parts.slice(1).join(' — ') : '');

      return `
                  <tr class="border-b border-slate-100 last:border-0">
                    <td class="py-2.5 px-3">
                      <div class="font-bold text-slate-800">${(window as any).esc(mainName)}</div>
                      ${comment ? `<div class="text-[11px] text-slate-500 italic mt-0.5"><i class="fa-solid fa-quote-left text-[9px] mr-1 text-violet-400"></i>${(window as any).esc(comment)}</div>` : ''}
                    </td>
                    <td class="py-2.5 px-2 text-right font-mono">${l.qty}</td>
                    <td class="py-2.5 px-2 text-right font-mono">${(window as any).fmt(l.unit_price)}</td>
                    <td class="py-2.5 px-2 text-right font-mono text-slate-500">${l.iva_rate || 0}%</td>
                    <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-800">${(window as any).fmt(l.total)}</td>
                  </tr>
                `;
    }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Totales -->
        <div class="flex justify-end text-xs">
          <div class="w-64 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div class="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span class="font-mono">${(window as any).fmt(quote.subtotal || 0)}</span>
            </div>
            ${quote.discount_amount ? `
              <div class="flex justify-between text-slate-600">
                <span>Descuento:</span>
                <span class="font-mono text-red-600">-${(window as any).fmt(quote.discount_amount)}</span>
              </div>
            ` : ''}
            <div class="flex justify-between text-slate-600">
              <span>IVA Total:</span>
              <span class="font-mono">${(window as any).fmt(quote.iva_total || 0)}</span>
            </div>
            <div class="border-t border-slate-200 pt-1 flex justify-between font-bold text-sm text-slate-900">
              <span>Total:</span>
              <span class="font-mono text-violet-700">${(window as any).fmt(quote.total || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <div class="flex flex-wrap items-center justify-between w-full gap-2">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeModal()">Cerrar</button>
        <div class="flex gap-2">
          <button type="button" class="btn btn-outline btn-sm" onclick="window.printQuotationCarta('${quoteId}')">
            <i class="fas fa-print mr-1"></i> Imprimir Carta
          </button>
          <button type="button" class="btn btn-sm" style="background:#059669;color:#fff;border-color:#047857" onclick="window.sendQuotationViaWhatsApp('${quoteId}')">
            <i class="fab fa-whatsapp mr-1"></i> Enviar por WhatsApp
          </button>
          ${quote.status !== 'converted_order' && quote.status !== 'converted_invoice' ? `
            <button type="button" class="btn btn-primary btn-sm" style="background:#7C3AED;border-color:#6D28D9" onclick="closeModal(); window.convertQuotationToOrder('${quoteId}')">
              <i class="fas fa-cart-shopping mr-1"></i> Convertir en Pedido
            </button>
          ` : ''}
        </div>
      </div>
    `;

    (window as any).openModal(`Cotización #${quote.number}`, modalHtml, footerHtml, false);
  } catch (err: any) {
    (window as any).showToast('Error al cargar detalle: ' + err.message, 'error');
  }
};

// ── ELIMINAR COTIZACIÓN ───────────────────────────────────────────────
(window as any).deleteQuotation = async function (quoteId: string) {
  if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta cotización?')) return;
  try {
    await (window as any).API.deleteQuotation(quoteId);
    (window as any).showToast('Cotización eliminada con éxito', 'success');
    const row = document.querySelector(`tr[data-qid="${quoteId}"]`);
    if (row) row.remove();
  } catch (err: any) {
    (window as any).showToast('Error al eliminar cotización: ' + err.message, 'error');
  }
};

// ── MODAL ÁGIL DE CREACIÓN DE CLIENTE (QUICK CUSTOMER CREATION) ───────
export function openQuickCustomerModal(onDone?: (newCustomer: any) => void) {
  document.getElementById('quote-quick-customer-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'quote-quick-customer-modal';
  modal.className = 'fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
      <!-- Header -->
      <div class="px-5 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center text-sm shadow-xs">
            <i class="fas fa-user-plus"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-sm">Nuevo Cliente Rápido</h3>
            <p class="text-[11px] text-violet-700">Creación ágil para cotizaciones y pedidos comerciales</p>
          </div>
        </div>
        <button type="button" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" id="btn-close-quick-cust">
          <i class="fas fa-times text-sm"></i>
        </button>
      </div>

      <!-- Form Body -->
      <form id="form-quick-cust" class="p-5 space-y-3.5 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Tipo de Persona</label>
            <select id="qc-person-type" class="form-input text-xs">
              <option value="NATURAL">Persona Natural</option>
              <option value="JURIDICA">Persona Jurídica</option>
            </select>
          </div>
          <div>
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Tipo de Documento</label>
            <select id="qc-doc-type" class="form-input text-xs">
              <option value="13">Cédula de Ciudadanía (13)</option>
              <option value="31">NIT (31)</option>
              <option value="22">Cédula de Extranjería (22)</option>
              <option value="41">Pasaporte (41)</option>
              <option value="11">Registro Civil (11)</option>
              <option value="12">Tarjeta de Identidad (12)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2">
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Número de Documento / NIT <span class="text-red-500">*</span></label>
            <input type="text" id="qc-doc-number" class="form-input text-xs font-mono font-bold" placeholder="Ej: 10203040 o 900123456" required autocomplete="off">
          </div>
          <div>
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">DV</label>
            <input type="text" id="qc-dv" class="form-input text-xs font-mono text-center bg-slate-50" readonly placeholder="-">
          </div>
        </div>

        <div>
          <label class="form-label text-xs font-semibold text-slate-700 mb-1">Nombre Completo o Razón Social <span class="text-red-500">*</span></label>
          <input type="text" id="qc-name" class="form-input text-xs uppercase" placeholder="Ej: COMERCIALIZADORA DEL VALLE S.A.S." required autocomplete="off">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <i class="fab fa-whatsapp text-emerald-600"></i>
              <span>Teléfono / WhatsApp <span class="text-red-500">*</span></span>
            </label>
            <input type="tel" id="qc-phone" class="form-input text-xs font-mono" placeholder="Ej: 3122839957" required autocomplete="off">
            <span class="text-[10px] text-slate-400">Requerido para envío de cotizaciones PDF</span>
          </div>
          <div>
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
            <input type="email" id="qc-email" class="form-input text-xs" placeholder="cliente@empresa.com" autocomplete="off">
          </div>
        </div>

        <div>
          <label class="form-label text-xs font-semibold text-slate-700 mb-1">Ciudad / Municipio</label>
          <input type="text" id="qc-city" class="form-input text-xs" value="Bogotá, D.C." placeholder="Ciudad">
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>¿Necesitas registrar datos tributarios o RUT completos?</span>
          <button type="button" id="btn-quick-to-full-tp" class="text-violet-600 hover:text-violet-800 font-semibold underline">
            Formulario Completo
          </button>
        </div>

        <div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button type="button" class="btn btn-outline btn-sm text-xs" id="btn-cancel-quick-cust">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm text-xs flex items-center gap-1.5" style="background:#7C3AED;border-color:#6D28D9;color:#fff" id="btn-submit-quick-cust">
            <i class="fas fa-check"></i>
            <span>Guardar y Asociar</span>
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModalFn = () => modal.remove();
  document.getElementById('btn-close-quick-cust')?.addEventListener('click', closeModalFn);
  document.getElementById('btn-cancel-quick-cust')?.addEventListener('click', closeModalFn);

  const ptSelect = document.getElementById('qc-person-type') as HTMLSelectElement;
  const dtSelect = document.getElementById('qc-doc-type') as HTMLSelectElement;
  const docInput = document.getElementById('qc-doc-number') as HTMLInputElement;
  const dvInput = document.getElementById('qc-dv') as HTMLInputElement;

  const updateDv = () => {
    const docVal = docInput.value.replace(/\D/g, '');
    const dt = dtSelect.value;
    if (dt === '31' || ptSelect.value === 'JURIDICA') {
      dvInput.value = typeof (window as any).calcDV === 'function' ? (window as any).calcDV(docVal) : '';
    } else {
      dvInput.value = '';
    }
  };

  ptSelect?.addEventListener('change', () => {
    if (ptSelect.value === 'JURIDICA') {
      dtSelect.value = '31';
    } else if (dtSelect.value === '31') {
      dtSelect.value = '13';
    }
    updateDv();
  });

  dtSelect?.addEventListener('change', updateDv);
  docInput?.addEventListener('input', updateDv);

  document.getElementById('btn-quick-to-full-tp')?.addEventListener('click', () => {
    closeModalFn();
    if (typeof (window as any).openTerceroForm === 'function') {
      (window as any).openTerceroForm(null, async (createdRecord: any) => {
        if (typeof onDone === 'function' && createdRecord) {
          onDone(createdRecord);
        }
      });
    } else {
      (window as any).showToast('Módulo de terceros no disponible.', 'warning');
    }
  });

  document.getElementById('form-quick-cust')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const docNumber = docInput.value.trim();
    const name = (document.getElementById('qc-name') as HTMLInputElement).value.trim();
    const phone = (document.getElementById('qc-phone') as HTMLInputElement).value.trim();
    const email = (document.getElementById('qc-email') as HTMLInputElement).value.trim();
    const city = (document.getElementById('qc-city') as HTMLInputElement).value.trim();
    const pt = ptSelect.value;
    const dt = dtSelect.value;
    const dv = dvInput.value.trim();

    if (!docNumber || !name || !phone) {
      (window as any).showToast('Por favor completa Documento, Nombre y Teléfono.', 'warning');
      return;
    }

    const submitBtn = document.getElementById('btn-submit-quick-cust') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';
    }

    try {
      const pb = (window as any).pb;
      const cleanDoc = pb.escapeFilterValue ? pb.escapeFilterValue(docNumber) : docNumber.replace(/["\\]/g, '');
      const duplicates = await pb.listAll('third_parties', { filter: `doc_number = "${cleanDoc}"` }).catch(() => []);
      if (duplicates && duplicates.length > 0) {
        const dup = duplicates[0];
        (window as any).showToast(`El cliente con documento ${docNumber} ya existe (${dup.name}). Seleccionándolo...`, 'info');
        closeModalFn();
        if (typeof onDone === 'function') onDone(dup);
        return;
      }

      const isJuridica = pt === 'JURIDICA';
      const parts = name.split(/\s+/);
      const half = Math.ceil(parts.length / 2);
      const firstName = isJuridica ? '' : parts.slice(0, half).join(' ');
      const lastName = isJuridica ? '' : parts.slice(half).join(' ');

      const payload = {
        name,
        business_name: isJuridica ? name : '',
        first_name: firstName,
        last_name: lastName,
        person_type: pt,
        type: 'CLIENTE',
        doc_type: dt,
        doc_number: docNumber,
        nit: docNumber,
        dv: dv || '',
        phone,
        email,
        country: 'CO',
        city: city || 'Bogotá, D.C.',
        tax_regime: isJuridica ? 'COMUN' : 'SIMPLIFICADO',
        fiscal_responsibility: 'R-99-PN',
        active: true,
        is_customer: true,
      };

      const created = await pb.create('third_parties', payload);

      try {
        await pb.create('third_party_branches', {
          third_party_id: created.id,
          code: '001',
          name: 'Sede Principal',
          phone,
          email,
          city: city || 'Bogotá, D.C.',
          is_main: true,
        });
      } catch (e) {
        console.warn('Branch creation skipped:', e);
      }

      (window as any).showToast(`Cliente "${created.name}" registrado con éxito.`, 'success');
      closeModalFn();
      if (typeof onDone === 'function') onDone(created);
    } catch (err: any) {
      console.error('Error al crear cliente rápido:', err);
      (window as any).showToast('Error al registrar cliente: ' + err.message, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Guardar y Asociar';
      }
    }
  });
}

(window as any).openQuickCustomerModal = openQuickCustomerModal;
(window as any).quoteQuickAddCustomer = function () {
  openQuickCustomerModal((newCust: any) => {
    if (typeof (window as any).selectQuoteCustomer === 'function') {
      const doc = newCust.doc_number || newCust.nit || '';
      (window as any).selectQuoteCustomer(newCust.id, doc ? `${doc} - ${newCust.name}` : newCust.name);
    }
  });
};

// ── MODAL ÁGIL DE CREACIÓN DE PRODUCTOS / SERVICIOS ───────────────────
export function openQuickProductModal(onDone?: (newProduct: any) => void) {
  document.getElementById('quote-quick-prod-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'quote-quick-prod-modal';
  modal.className = 'fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
      <!-- Header -->
      <div class="px-5 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center text-sm shadow-xs">
            <i class="fas fa-box-open"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-sm">Nuevo Producto / Servicio Rápido</h3>
            <p class="text-[11px] text-violet-700">Creación inmediata para cotizaciones y facturación</p>
          </div>
        </div>
        <button type="button" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors" id="btn-close-quick-prod">
          <i class="fas fa-times text-sm"></i>
        </button>
      </div>

      <!-- Form Body -->
      <form id="form-quick-prod" class="p-5 space-y-3.5 text-xs">
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Código <span class="text-red-500">*</span></label>
            <input type="text" id="qp-code" class="form-input text-xs font-mono uppercase font-bold" placeholder="PROD-001" required autocomplete="off">
          </div>
          <div class="col-span-2">
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Nombre del Producto / Servicio <span class="text-red-500">*</span></label>
            <input type="text" id="qp-name" class="form-input text-xs uppercase" placeholder="Ej: PISO PORCELANATO 60X60" required autocomplete="off">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Tipo</label>
            <select id="qp-type" class="form-input text-xs">
              <option value="BIEN">Producto Físico (Bien)</option>
              <option value="SERVICIO">Servicio / Mano de Obra</option>
            </select>
          </div>
          <div>
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Unidad de Medida</label>
            <select id="qp-unit" class="form-input text-xs">
              <option value="UND">Unidad (UND)</option>
              <option value="M2">Metro Cuadrado (M2)</option>
              <option value="CJ">Caja (CJ)</option>
              <option value="ML">Metro Lineal (ML)</option>
              <option value="KG">Kilogramo (KG)</option>
              <option value="GLOBAL">Global / Servicio (GLOBAL)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Precio Unitario Base (Sin IVA) <span class="text-red-500">*</span></label>
            <input type="number" id="qp-base-price" class="form-input text-xs font-mono font-bold" placeholder="0" min="0" step="any" required autocomplete="off">
          </div>
          <div>
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Tarifa IVA %</label>
            <select id="qp-iva-rate" class="form-input text-xs font-mono">
              <option value="19">19% (General)</option>
              <option value="5">5% (Reducido)</option>
              <option value="0">0% (Exento / Excluido)</option>
            </select>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>¿Deseas configurar cuentas contables o fichas técnicas?</span>
          <button type="button" id="btn-quick-to-full-prod" class="text-violet-600 hover:text-violet-800 font-semibold underline">
            Formulario Completo
          </button>
        </div>

        <div class="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button type="button" class="btn btn-outline btn-sm text-xs" id="btn-cancel-quick-prod">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm text-xs flex items-center gap-1.5" style="background:#7C3AED;border-color:#6D28D9;color:#fff" id="btn-submit-quick-prod">
            <i class="fas fa-check"></i>
            <span>Guardar y Agregar a Cotización</span>
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModalFn = () => modal.remove();
  document.getElementById('btn-close-quick-prod')?.addEventListener('click', closeModalFn);
  document.getElementById('btn-cancel-quick-prod')?.addEventListener('click', closeModalFn);

  document.getElementById('btn-quick-to-full-prod')?.addEventListener('click', () => {
    closeModalFn();
    if (typeof (window as any).openProductForm === 'function') {
      (window as any).openProductForm(null, null, {}, []);
    } else {
      (window as any).showToast('Módulo de productos no disponible.', 'warning');
    }
  });

  document.getElementById('form-quick-prod')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const code = (document.getElementById('qp-code') as HTMLInputElement).value.trim().toUpperCase();
    const name = (document.getElementById('qp-name') as HTMLInputElement).value.trim().toUpperCase();
    const type = (document.getElementById('qp-type') as HTMLSelectElement).value;
    const unit = (document.getElementById('qp-unit') as HTMLSelectElement).value;
    const basePrice = parseFloat((document.getElementById('qp-base-price') as HTMLInputElement).value || '0') || 0;
    const ivaRate = parseFloat((document.getElementById('qp-iva-rate') as HTMLSelectElement).value || '19') || 19;

    if (!code || !name) {
      (window as any).showToast('Por favor ingresa Código y Nombre del producto.', 'warning');
      return;
    }

    const submitBtn = document.getElementById('btn-submit-quick-prod') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Guardando...';
    }

    try {
      const pb = (window as any).pb;
      const cleanCode = pb.escapeFilterValue ? pb.escapeFilterValue(code) : code.replace(/["\\]/g, '');
      const existing = await pb.listAll('products', { filter: `code = "${cleanCode}"` }).catch(() => []);
      if (existing && existing.length > 0) {
        (window as any).showToast(`Ya existe un producto con el código ${code} (${existing[0].name}).`, 'warning');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Guardar y Agregar a Cotización';
        }
        return;
      }

      // Obtener cuentas predeterminadas si están disponibles
      let defaultAccounts: any = null;
      try {
        defaultAccounts = await (window as any).API.getDefaultProductAccountingAndTaxConfig();
      } catch (_) { }

      const payload = {
        code,
        name,
        type,
        unit,
        base_price: basePrice,
        cost_price: 0,
        iva_rate: ivaRate,
        active: true,
        income_account_id: defaultAccounts?.incomeAccountId || '',
        cost_account_id: defaultAccounts?.costAccountId || '',
        inventory_account_id: type === 'BIEN' ? (defaultAccounts?.inventoryAccountId || '') : '',
      };

      const created = await pb.create('products', payload);
      (window as any).showToast(`Producto "${created.name}" creado con éxito.`, 'success');
      closeModalFn();
      if (typeof onDone === 'function') onDone(created);
    } catch (err: any) {
      console.error('Error creando producto rápido:', err);
      (window as any).showToast('Error al crear producto: ' + err.message, 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Guardar y Agregar a Cotización';
      }
    }
  });
}

(window as any).quoteQuickAddProduct = function () {
  openQuickProductModal((newProd: any) => {
    if (typeof (window as any).__addQuoteLineWithProduct === 'function') {
      (window as any).__addQuoteLineWithProduct(newProd);
    }
  });
};

// ── FORMULARIO COMPLETO: NUEVA / EDITAR COTIZACIÓN ─────────────────────
export async function openQuotationForm(quoteId: string | null = null, onDone?: () => void) {
  (window as any).showToast('Cargando catálogo para cotización...', 'info');
  try {
    const [thirdParties, products] = await Promise.all([
      (window as any).pb.listAll('third_parties', { filter: 'active=true', sort: 'name' }).catch(() => []),
      (window as any).API.getProducts({ activeOnly: true }).catch(() => []),
    ]);

    const clientsList = Array.isArray(thirdParties) ? thirdParties : (thirdParties?.items || []);
    const prodsList: any[] = Array.isArray(products) ? products : (products?.items || []);
    const sellersList = clientsList.filter((c: any) => c.type === 'EMPLEADO' || c.type === 'VENDEDOR' || Boolean(c.advisor));

    let existingQuote: any = null;
    let existingLines: any[] = [];
    if (quoteId) {
      existingQuote = await (window as any).API.getQuotation(quoteId);
      existingLines = await (window as any).API.getQuotationLines(quoteId);
    }

    const nextNumber = existingQuote ? existingQuote.number : await (window as any).API.nextQuotationConsecutive();
    const today = new Date().toISOString().slice(0, 10);
    const quoteDate = existingQuote?.date || today;
    const validityDays = existingQuote?.validity_days || 15;

    // Calcular vencimiento inicial
    const d = new Date(quoteDate);
    d.setDate(d.getDate() + validityDays);
    const dueDate = existingQuote?.due_date || d.toISOString().slice(0, 10);

    const formHtml = `
      <div class="space-y-4 text-xs text-slate-700">
        <!-- Encabezado de Documento con estilo Violeta / Lavanda -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-violet-50/90 to-purple-50/60 border border-violet-200/80 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center text-sm shadow-xs">
              <i class="fas fa-file-invoice-dollar"></i>
            </div>
            <div>
              <div class="font-extrabold text-slate-900 text-sm">
                ${existingQuote ? `Editar Cotización ${existingQuote.number}` : 'Nueva Cotización Comercial'}
              </div>
              <div class="text-[11px] text-violet-800 font-mono">Consecutivo: <strong>${nextNumber}</strong></div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge badge-purple text-[10px] font-bold px-2 py-0.5">COTIZACIÓN</span>
          </div>
        </div>

        <!-- Campos de Cabecera con Buscador Dinámico de Terceros -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div class="md:col-span-2 form-group mb-0">
            <label class="form-label text-xs font-semibold text-slate-700 flex items-center justify-between mb-1">
              <span>Cliente / Adquirente <span class="text-red-500">*</span></span>
              <button type="button" class="text-[11px] font-semibold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1" onclick="window.quoteQuickAddCustomer()">
                <i class="fas fa-user-plus text-[10px]"></i> + Nuevo Cliente
              </button>
            </label>
            <div id="quote-customer-search-wrap" class="relative flex gap-1.5 items-center">
              <div class="relative flex-1">
                <i class="fas fa-search absolute left-3 top-2.5 text-slate-400 text-xs pointer-events-none"></i>
                <input id="quote-customer-search" class="form-input pl-8 pr-7 text-xs w-full" autocomplete="off" placeholder="Escribe NIT, cédula o nombre del cliente...">
                <button type="button" id="quote-customer-clear-btn" class="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs hidden" title="Limpiar selección">
                  <i class="fas fa-times-circle"></i>
                </button>
              </div>
              <button type="button" class="btn btn-outline px-2.5 h-[34px] flex items-center justify-center flex-shrink-0 border-slate-300 hover:border-violet-400 hover:bg-violet-50 text-slate-600 hover:text-violet-700" onclick="window.quoteQuickAddCustomer()" title="Crear Nuevo Cliente">
                <i class="fas fa-user-plus text-xs"></i>
              </button>
              <input id="quote-f-customer" type="hidden" value="${(window as any).esc(existingQuote?.customer_id || '')}">
              <div id="quote-customer-results" style="display:none;position:absolute;left:0;right:44px;top:calc(100% + 4px);max-height:220px;overflow-y:auto;background:#fff;border:1px solid #E2E8F0;border-radius:12px;box-shadow:0 12px 30px rgba(124,58,237,0.12);z-index:99999;"></div>
            </div>
          </div>

          <div class="form-group mb-0">
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Vendedor / Asesor</label>
            <select id="quote-f-seller" class="form-input text-xs">
              <option value="">-- Sin asignar --</option>
              ${sellersList.map((s: any) => `
                <option value="${s.id}" ${existingQuote?.seller_id === s.id ? 'selected' : ''}>
                  ${(window as any).esc(s.name)}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="form-group mb-0">
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Fecha de Emisión</label>
            <input id="quote-f-date" type="date" class="form-input text-xs" value="${quoteDate}">
          </div>

          <div class="form-group mb-0">
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Días de Validez</label>
            <input id="quote-f-validity" type="number" class="form-input text-xs" value="${validityDays}" min="1" max="365">
          </div>

          <div class="form-group mb-0">
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Fecha de Vencimiento</label>
            <input id="quote-f-due" type="date" class="form-input text-xs" value="${dueDate}">
          </div>

          <div class="md:col-span-2 form-group mb-0">
            <label class="form-label text-xs font-semibold text-slate-700 mb-1">Observaciones / Términos de Entrega</label>
            <input id="quote-f-notes" type="text" class="form-input text-xs" value="${(window as any).esc(existingQuote?.notes || '')}" placeholder="Ej: Precios vigentes por 15 días, pago de contado, entrega en bodega...">
          </div>
        </div>

        <!-- ══ BUSCADOR GLOBAL DE PRODUCTOS & CREACIÓN RÁPIDA (ESTÁNDAR FACTURACIÓN) ══ -->
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <i class="fas fa-search absolute left-3 top-2.5 text-slate-400 text-xs pointer-events-none"></i>
            <input id="quote-prod-search-global" class="form-input pl-8 w-full text-xs"
                   style="height:38px;border-color:#DDD6FE"
                   autocomplete="off"
                   placeholder="Buscar producto o servicio por nombre o código... (↑↓ para navegar · Enter o clic para agregar)">
            <div id="quote-prod-results-global"
                 style="display:none;position:absolute;left:0;right:0;top:calc(100% + 3px);max-height:280px;overflow-y:auto;background:#fff;border:1.5px solid #DDD6FE;border-radius:12px;box-shadow:0 12px 32px rgba(124,58,237,0.14);z-index:99999;">
            </div>
          </div>
          <button type="button" class="btn btn-outline flex items-center gap-1.5 whitespace-nowrap shadow-xs px-3 h-[38px] text-xs font-bold" id="btn-quote-quick-add-prod" onclick="window.quoteQuickAddProduct()" style="color:#7C3AED; border-color:#DDD6FE; background:#F5F3FF; border-radius:10px" title="Crear nuevo producto o servicio rápido">
            <i class="fas fa-plus text-violet-600"></i> + Nuevo Producto
          </button>
        </div>

        <!-- Tabla de Ítems de Cotización -->
        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div class="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div class="font-bold text-slate-800 text-xs flex items-center gap-2">
              <i class="fas fa-boxes-stacked text-violet-600"></i>
              <span>Artículos / Servicios de la Cotización</span>
              <span id="quote-items-counter" class="text-[10px] font-bold text-purple-700 bg-purple-100 rounded-full px-2 py-0.5">0 líneas · 0 unds</span>
            </div>
            <div class="text-[11px] text-slate-400">Precios y tarifas de IVA cargados automáticamente del catálogo</div>
          </div>

          <div class="overflow-x-auto">
            <table class="table w-full text-xs" id="quote-lines-table">
              <thead class="bg-slate-50/50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-3 text-left" style="min-width:280px">Código / Producto / Servicio & Especificación</th>
                  <th class="py-2.5 px-2 text-right" style="width:90px">Cant.</th>
                  <th class="py-2.5 px-2 text-right" style="width:125px">Precio Unit. (Base)</th>
                  <th class="py-2.5 px-2 text-right" style="width:80px">Desc. %</th>
                  <th class="py-2.5 px-2 text-right" style="width:80px">IVA %</th>
                  <th class="py-2.5 px-3 text-right" style="width:115px">Total Línea</th>
                  <th class="py-2.5 px-2 text-center" style="width:40px"></th>
                </tr>
              </thead>
              <tbody id="quote-lines-tbody">
                <!-- Se poblará dinámicamente -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totales y Resumen -->
        <div class="flex flex-wrap items-start justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div class="text-[11px] text-slate-400 max-w-sm">
            <p>💡 <strong>Tip de especificaciones:</strong> Haz clic en el icono <i class="fa-regular fa-comment-dots text-violet-600"></i> junto a cada producto para añadir comentarios y observaciones que se imprimirán en el PDF y se enviarán por WhatsApp.</p>
          </div>
          <div class="w-72 space-y-1.5">
            <div class="flex justify-between text-xs text-slate-600">
              <span>Subtotal:</span>
              <span class="font-mono" id="quote-sum-subtotal">$ 0</span>
            </div>
            <div class="flex justify-between text-xs text-slate-600">
              <span>Descuento Total:</span>
              <span class="font-mono text-red-600" id="quote-sum-discount">-$ 0</span>
            </div>
            <div class="flex justify-between text-xs text-slate-600">
              <span>IVA Total:</span>
              <span class="font-mono" id="quote-sum-iva">$ 0</span>
            </div>
            <div class="border-t border-slate-200 pt-1.5 flex justify-between font-extrabold text-sm text-slate-900">
              <span>Total Cotización:</span>
              <span class="font-mono text-violet-700" id="quote-sum-total">$ 0</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const footerHtml = `
      <div class="flex items-center justify-between w-full">
        <button type="button" class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
        <button type="button" class="btn btn-primary btn-sm flex items-center gap-1.5" style="background:#7C3AED;border-color:#6D28D9;color:#fff" id="btn-save-quotation">
          <i class="fas fa-check"></i>
          <span>${existingQuote ? 'Guardar Cambios' : 'Emitir Cotización (COT)'}</span>
        </button>
      </div>
    `;

    (window as any).openModal(existingQuote ? 'Editar Cotización' : 'Nueva Cotización Comercial', formHtml, footerHtml, false);

    // ── AutoComplete Predictivo de Clientes ───────────────────────────────
    function initQuoteCustomerSearch() {
      const input = document.getElementById('quote-customer-search') as HTMLInputElement;
      const hidden = document.getElementById('quote-f-customer') as HTMLInputElement;
      const results = document.getElementById('quote-customer-results');
      const clearBtn = document.getElementById('quote-customer-clear-btn');
      if (!input || !hidden || !results) return;

      const updateClearBtn = () => {
        if (clearBtn) {
          if (input.value || hidden.value) clearBtn.classList.remove('hidden');
          else clearBtn.classList.add('hidden');
        }
      };

      if (existingQuote && existingQuote.customer_id) {
        const match = clientsList.find((c: any) => c.id === existingQuote.customer_id) || existingQuote.expand?.customer_id;
        if (match) {
          input.value = `${match.doc_number || match.nit || ''} - ${match.name}`;
          hidden.value = match.id || existingQuote.customer_id;
          updateClearBtn();
        }
      }

      const performSearch = (val: string) => {
        const query = val.toLowerCase().trim();
        const filtered = !query
          ? clientsList.slice(0, 30)
          : clientsList.filter((c: any) => {
            const str = `${c.name || ''} ${c.business_name || ''} ${c.doc_number || ''} ${c.nit || ''} ${c.phone || ''} ${c.email || ''}`.toLowerCase();
            return str.includes(query);
          }).slice(0, 30);

        if (!filtered.length) {
          results.innerHTML = `
            <div class="px-4 py-3 text-xs text-slate-400 text-center">
              <p class="mb-1">No se encontraron clientes con "<strong>${(window as any).esc(val)}</strong>"</p>
              <button type="button" class="text-violet-600 hover:text-violet-800 font-bold underline" onclick="window.quoteQuickAddCustomer()">
                + Registrar cliente ahora
              </button>
            </div>
          `;
          return;
        }

        results.innerHTML = filtered.map((c: any) => `
          <button type="button" class="w-full text-left px-3.5 py-2.5 text-xs border-b border-slate-100 last:border-0 hover:bg-violet-50/70 transition-colors cursor-pointer block group"
                  onclick="window.selectQuoteCustomer('${(window as any).esc(c.id)}', '${(window as any).esc(c.doc_number || c.nit || '')} - ${(window as any).esc(c.name)}')">
            <div class="flex items-center justify-between">
              <div class="font-bold text-slate-800 group-hover:text-violet-700">${(window as any).esc(c.name)}</div>
              ${c.phone ? `<span class="text-[10px] text-emerald-600 font-mono"><i class="fab fa-whatsapp mr-0.5"></i>${(window as any).esc(c.phone)}</span>` : ''}
            </div>
            <div class="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Doc: <strong>${c.doc_number || c.nit || 'S/N'}</strong></span>
              ${c.city ? `<span>• ${c.city}</span>` : ''}
              ${c.email ? `<span class="truncate max-w-[150px]">• ${c.email}</span>` : ''}
            </div>
          </button>
        `).join('');
      };

      input.addEventListener('focus', () => { performSearch(input.value); results.style.display = 'block'; });
      input.addEventListener('input', () => {
        hidden.value = '';
        updateClearBtn();
        performSearch(input.value);
        results.style.display = 'block';
      });
      input.addEventListener('blur', () => { setTimeout(() => { results.style.display = 'none'; }, 250); });

      clearBtn?.addEventListener('click', () => {
        input.value = '';
        hidden.value = '';
        updateClearBtn();
        input.focus();
        performSearch('');
      });

      if (typeof (window as any).initKeyboardAutocomplete === 'function') {
        (window as any).initKeyboardAutocomplete({
          input,
          results,
          itemSelector: 'button',
        });
      }
    }

    (window as any).selectQuoteCustomer = function (id: string, text: string) {
      const hidden = document.getElementById('quote-f-customer') as HTMLInputElement;
      const input = document.getElementById('quote-customer-search') as HTMLInputElement;
      const results = document.getElementById('quote-customer-results');
      const clearBtn = document.getElementById('quote-customer-clear-btn');
      if (hidden && input) {
        hidden.value = id;
        input.value = text;
        if (results) results.style.display = 'none';
        if (clearBtn) clearBtn.classList.remove('hidden');
      }

      const customer = clientsList.find((c: any) => c.id === id);
      if (customer && customer.advisor) {
        const sellerSel = document.getElementById('quote-f-seller') as HTMLSelectElement;
        if (sellerSel && !sellerSel.value) {
          sellerSel.value = customer.advisor;
        }
      }
    };

    (window as any).quoteQuickAddCustomer = function () {
      openQuickCustomerModal((newCust: any) => {
        clientsList.push(newCust);
        const doc = newCust.doc_number || newCust.nit || '';
        (window as any).selectQuoteCustomer(newCust.id, doc ? `${doc} - ${newCust.name}` : newCust.name);
      });
    };
    (window as any).openQuickCustomerModal = (window as any).quoteQuickAddCustomer;

    initQuoteCustomerSearch();

    // ── GESTIÓN DE LÍNEAS DE COTIZACIÓN ──────────────────────────────────
    let lineCounter = 0;
    const addLine = (prod: any = null, lineData: any = null) => {
      lineCounter++;
      const idx = lineCounter;
      const tbody = document.getElementById('quote-lines-tbody');
      if (!tbody) return;

      const prodObj = prod || (lineData?.product_id ? prodsList.find((p: any) => p.id === lineData.product_id) : null);
      const productId = prodObj?.id || lineData?.product_id || '';
      const productCode = prodObj?.code || lineData?.code || '';
      const productName = prodObj?.name || lineData?.description?.split(' — ')[0] || '(Seleccionar producto)';

      // Extracción estandarizada de base_price / iva_rate desde base de datos
      const unitPrice = lineData?.unit_price ?? Number(prodObj?.base_price ?? prodObj?.sales_price ?? prodObj?.price ?? 0);
      const ivaRate = lineData?.iva_rate ?? Number(prodObj?.iva_rate ?? 19);
      const qty = lineData?.qty ?? 1;
      const disc = lineData?.discount_pct ?? 0;
      const comment = lineData?.item_notes ?? '';

      const tr = document.createElement('tr');
      tr.id = `ql-row-${idx}`;
      tr.className = 'border-b border-slate-100 last:border-0 hover:bg-slate-50/50';
      tr.innerHTML = `
        <td class="py-2.5 px-3">
          <div class="flex items-center gap-1.5">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                ${productCode ? `<span class="text-[10px] font-mono font-bold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded flex-shrink-0">${(window as any).esc(productCode)}</span>` : ''}
                <span class="font-semibold text-slate-800 text-xs truncate" title="${(window as any).esc(productName)}">${(window as any).esc(productName)}</span>
              </div>
            </div>
            <button type="button" class="p-1.5 rounded-lg border transition-colors ml-1 flex-shrink-0 ${comment ? 'text-violet-600 bg-violet-50/60 border-violet-300' : 'text-slate-400 hover:text-violet-600 border-slate-200'}" id="ql-comment-btn-${idx}" title="${comment ? 'Editar comentario/especificación' : 'Añadir comentario o especificación'}" onclick="window.openQuoteLineCommentModal(${idx})">
              <i class="${comment ? 'fa-solid' : 'fa-regular'} fa-comment-dots text-xs"></i>
            </button>
          </div>
          <input type="hidden" class="ql-prod-id" id="ql-prod-${idx}" value="${productId}">
          <input type="hidden" id="ql-comment-${idx}" value="${(window as any).esc(comment)}">
          <div id="ql-comment-preview-${idx}" class="text-[10px] text-violet-700 italic mt-1 ${comment ? '' : 'hidden'} pl-1">
            ${comment ? `<i class="fa-solid fa-quote-left text-[8px] mr-1 text-violet-400"></i>${(window as any).esc(comment)}` : ''}
          </div>
        </td>
        <td class="py-2 px-2 text-right">
          <input type="number" class="form-input text-xs text-right font-mono ql-qty" id="ql-qty-${idx}" value="${qty}" min="0.01" step="any">
        </td>
        <td class="py-2 px-2 text-right">
          <input type="number" class="form-input text-xs text-right font-mono ql-price" id="ql-price-${idx}" value="${unitPrice}" min="0" step="any">
        </td>
        <td class="py-2 px-2 text-right">
          <input type="number" class="form-input text-xs text-right font-mono ql-disc" id="ql-disc-${idx}" value="${disc}" min="0" max="100" step="1">
        </td>
        <td class="py-2 px-2 text-right">
          <input type="number" class="form-input text-xs text-right font-mono ql-iva" id="ql-iva-${idx}" value="${ivaRate}" min="0" max="100" step="1">
        </td>
        <td class="py-2 px-3 text-right font-mono font-bold text-slate-800" id="ql-total-${idx}">
          $ 0
        </td>
        <td class="py-2 px-2 text-center">
          <button type="button" class="text-slate-300 hover:text-red-500 p-1" onclick="document.getElementById('ql-row-${idx}')?.remove(); window.recalcQuoteTotals();">
            <i class="fas fa-trash-can text-xs"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);

      tr.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => (window as any).recalcQuoteTotals());
      });

      (window as any).recalcQuoteTotals();
    };

    (window as any).__addQuoteLineWithProduct = (p: any) => {
      prodsList.push(p);
      addLine(p);
    };

    // Recálculo global de totales
    (window as any).recalcQuoteTotals = function () {
      let grandSubtotal = 0;
      let grandDiscount = 0;
      let grandIva = 0;
      let totalUnits = 0;

      const rows = document.querySelectorAll('#quote-lines-tbody tr');
      rows.forEach((row: any) => {
        const idParts = row.id.split('-');
        const idx = idParts[idParts.length - 1];

        const qty = parseFloat((document.getElementById(`ql-qty-${idx}`) as HTMLInputElement)?.value || '0') || 0;
        const price = parseFloat((document.getElementById(`ql-price-${idx}`) as HTMLInputElement)?.value || '0') || 0;
        const discPct = parseFloat((document.getElementById(`ql-disc-${idx}`) as HTMLInputElement)?.value || '0') || 0;
        const ivaRate = parseFloat((document.getElementById(`ql-iva-${idx}`) as HTMLInputElement)?.value || '0') || 0;

        const base = qty * price;
        const discAmt = base * (discPct / 100);
        const sub = base - discAmt;
        const ivaAmt = sub * (ivaRate / 100);
        const tot = sub + ivaAmt;

        grandSubtotal += sub;
        grandDiscount += discAmt;
        grandIva += ivaAmt;
        totalUnits += qty;

        const totalCell = document.getElementById(`ql-total-${idx}`);
        if (totalCell) totalCell.textContent = (window as any).fmt(tot);
      });

      const grandTotal = grandSubtotal + grandIva;

      const subEl = document.getElementById('quote-sum-subtotal');
      const discEl = document.getElementById('quote-sum-discount');
      const ivaEl = document.getElementById('quote-sum-iva');
      const totEl = document.getElementById('quote-sum-total');
      const counterEl = document.getElementById('quote-items-counter');

      if (subEl) subEl.textContent = (window as any).fmt(grandSubtotal);
      if (discEl) discEl.textContent = `-${(window as any).fmt(grandDiscount)}`;
      if (ivaEl) ivaEl.textContent = (window as any).fmt(grandIva);
      if (totEl) totEl.textContent = (window as any).fmt(grandTotal);
      if (counterEl) counterEl.textContent = `${rows.length} líneas · ${(window as any).fmtN(totalUnits)} unds`;
    };

    // ── BUSCADOR GLOBAL PREDICTIVO DE PRODUCTOS (ESTÁNDAR FACTURACIÓN) ───
    function initQuoteGlobalProductSearch() {
      const input = document.getElementById('quote-prod-search-global') as HTMLInputElement;
      const dropdown = document.getElementById('quote-prod-results-global');
      if (!input || !dropdown) return;

      let highlighted = -1;

      const renderResults = (filtered: any[]) => {
        if (!filtered.length) {
          dropdown.innerHTML = `
            <div class="px-4 py-3 text-xs text-gray-400 flex items-center justify-between">
              <span><i class="fas fa-box-open mr-1"></i>Sin resultados para "${(window as any).esc(input.value)}".</span>
              <button type="button" class="text-violet-600 hover:text-violet-800 font-bold underline ml-2" onclick="window.quoteQuickAddProduct()">
                + Crear producto ahora
              </button>
            </div>
          `;
          return;
        }

        dropdown.innerHTML = filtered.map((p: any, i: number) => {
          const unitPrice = Number(p.base_price ?? p.sales_price ?? p.price ?? 0);
          return `
            <button type="button"
              id="quote-gsr-item-${i}"
              data-prod-idx="${i}"
              class="w-full text-left px-4 py-2.5 text-xs border-none bg-white cursor-pointer block quote-gsr-row"
              style="border-bottom:1px solid #F3F4F6;transition:background .1s"
              onmouseenter="window.quoteGlobalHighlightProduct(${i})"
              onclick="window.quoteGlobalSelectProduct(${i})">
              <div class="flex items-center justify-between gap-3">
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-extrabold flex-shrink-0" style="color:#7C3AED;background:#EDE9FE;border-radius:4px;padding:1px 6px">${(window as any).esc(p.code || 'S/C')}</span>
                    <span class="text-gray-700 truncate font-semibold">${(window as any).esc(p.name)}</span>
                  </div>
                  <div class="text-[10px] text-gray-400 mt-0.5 flex items-center gap-2">
                    <span>Unidad: ${p.unit || 'UND'}</span>
                    <span>• Tipo: ${p.type || 'BIEN'}</span>
                  </div>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0 text-right">
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-bold" style="background:#EDE9FE;color:#7C3AED">IVA ${p.iva_rate ?? 19}%</span>
                  <span class="font-extrabold text-violet-700 text-xs">${(window as any).fmt(unitPrice)}</span>
                </div>
              </div>
            </button>
          `;
        }).join('');
        highlighted = -1;
        (window as any).__quoteGlobalFilteredProds = filtered;
      };

      const highlightItem = (idx: number, items: NodeListOf<Element>) => {
        items.forEach((el: any) => { el.style.background = ''; el.style.fontWeight = ''; });
        if (idx >= 0 && idx < items.length) {
          (items[idx] as any).style.background = '#F5F3FF';
          (items[idx] as any).scrollIntoView({ block: 'nearest' });
        }
      };

      (window as any).quoteGlobalHighlightProduct = function (idx: number) {
        highlighted = idx;
        const items = dropdown.querySelectorAll('.quote-gsr-row');
        highlightItem(idx, items);
      };

      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
          dropdown.style.display = 'none';
          return;
        }
        const filtered = prodsList.filter((p: any) => `${p.name} ${p.code} ${p.ean_code || ''}`.toLowerCase().includes(q)).slice(0, 40);
        renderResults(filtered);
        dropdown.style.display = 'block';
      });

      input.addEventListener('focus', () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
          dropdown.style.display = 'none';
          return;
        }
        const filtered = prodsList.filter((p: any) => `${p.name} ${p.code}`.toLowerCase().includes(q)).slice(0, 40);
        renderResults(filtered);
        dropdown.style.display = 'block';
      });

      input.addEventListener('keydown', (ev: KeyboardEvent) => {
        const items = dropdown.querySelectorAll('.quote-gsr-row');
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
            (window as any).quoteGlobalSelectProduct(highlighted);
          } else if (items.length > 0) {
            (window as any).quoteGlobalSelectProduct(0);
          }
        } else if (ev.key === 'Escape') {
          dropdown.style.display = 'none';
        }
      });

      input.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 200));

      dropdown.addEventListener('mousedown', (ev: MouseEvent) => {
        ev.preventDefault();
      });
    }

    (window as any).quoteGlobalSelectProduct = function (idx: number) {
      const filtered: any[] = (window as any).__quoteGlobalFilteredProds || [];
      const prod = filtered[idx];
      if (!prod) return;

      addLine(prod);

      const input = document.getElementById('quote-prod-search-global') as HTMLInputElement;
      const dropdown = document.getElementById('quote-prod-results-global');
      if (input) { input.value = ''; input.focus(); }
      if (dropdown) dropdown.style.display = 'none';

      const tableWrap = document.querySelector('#quote-lines-table')?.closest('div[style*="overflow"]') as HTMLElement;
      if (tableWrap) setTimeout(() => { tableWrap.scrollTop = tableWrap.scrollHeight; }, 50);
    };

    initQuoteGlobalProductSearch();

    // Auto-actualizar fecha de vencimiento según días de validez
    const valInput = document.getElementById('quote-f-validity') as HTMLInputElement;
    const dateInput = document.getElementById('quote-f-date') as HTMLInputElement;
    const dueInput = document.getElementById('quote-f-due') as HTMLInputElement;

    const recalcDueDate = () => {
      const baseDate = new Date(dateInput.value || today);
      const days = parseInt(valInput.value || '15', 10);
      baseDate.setDate(baseDate.getDate() + days);
      dueInput.value = baseDate.toISOString().slice(0, 10);
    };

    valInput?.addEventListener('input', recalcDueDate);
    dateInput?.addEventListener('change', recalcDueDate);

    // Cargar líneas existentes
    if (existingLines.length > 0) {
      existingLines.forEach(l => {
        const prodMatch = prodsList.find((p: any) => p.id === l.product_id) || l.expand?.product_id;
        addLine(prodMatch, l);
      });
    }

    // Guardar Cotización
    document.getElementById('btn-save-quotation')?.addEventListener('click', async () => {
      const customerId = (document.getElementById('quote-f-customer') as HTMLInputElement)?.value;
      if (!customerId) {
        (window as any).showToast('Por favor selecciona un cliente para la cotización.', 'warning');
        return;
      }

      const sellerId = (document.getElementById('quote-f-seller') as HTMLSelectElement)?.value || null;
      const date = (document.getElementById('quote-f-date') as HTMLInputElement)?.value || today;
      const validityDaysVal = parseInt((document.getElementById('quote-f-validity') as HTMLInputElement)?.value || '15', 10);
      const dueDateVal = (document.getElementById('quote-f-due') as HTMLInputElement)?.value || '';
      const notesVal = (document.getElementById('quote-f-notes') as HTMLInputElement)?.value.trim() || '';

      const lines: any[] = [];
      let totalLines = 0;
      let totalIvaLines = 0;
      let totalDiscLines = 0;

      const rows = document.querySelectorAll('#quote-lines-tbody tr');
      for (const row of Array.from(rows)) {
        const idParts = (row as HTMLElement).id.split('-');
        const idx = idParts[idParts.length - 1];

        const prodId = (document.getElementById(`ql-prod-${idx}`) as HTMLInputElement)?.value;
        const prodMatch = prodsList.find((p: any) => p.id === prodId);
        const prodName = prodMatch?.name || 'Ítem';
        const qty = parseFloat((document.getElementById(`ql-qty-${idx}`) as HTMLInputElement)?.value || '0') || 0;
        const unitPrice = parseFloat((document.getElementById(`ql-price-${idx}`) as HTMLInputElement)?.value || '0') || 0;
        const discPct = parseFloat((document.getElementById(`ql-disc-${idx}`) as HTMLInputElement)?.value || '0') || 0;
        const ivaRate = parseFloat((document.getElementById(`ql-iva-${idx}`) as HTMLInputElement)?.value || '0') || 0;
        const comment = (document.getElementById(`ql-comment-${idx}`) as HTMLInputElement)?.value.trim() || '';

        if (!prodId || qty <= 0) continue;

        const base = qty * unitPrice;
        const discAmt = base * (discPct / 100);
        const sub = base - discAmt;
        const ivaAmt = sub * (ivaRate / 100);
        const tot = sub + ivaAmt;

        let fullDesc = prodName;
        if (comment) {
          fullDesc = `${prodName} — ${comment}`;
        }

        lines.push({
          product_id: prodId,
          description: fullDesc,
          item_notes: comment,
          qty,
          unit_price: unitPrice,
          discount_pct: discPct,
          iva_rate: ivaRate,
          iva_amount: ivaAmt,
          subtotal: sub,
          total: tot,
        });

        totalLines += sub;
        totalIvaLines += ivaAmt;
        totalDiscLines += discAmt;
      }

      if (lines.length === 0) {
        (window as any).showToast('Debes agregar al menos un producto o servicio válido a la cotización usando el buscador superior.', 'warning');
        return;
      }

      const header = {
        number: existingQuote ? existingQuote.number : nextNumber,
        customer_id: customerId,
        seller_id: sellerId,
        date,
        due_date: dueDateVal,
        validity_days: validityDaysVal,
        notes: notesVal,
        status: existingQuote?.status || 'draft',
        subtotal: totalLines,
        iva_total: totalIvaLines,
        discount_amount: totalDiscLines,
        total: totalLines + totalIvaLines,
      };

      try {
        (window as any).showToast('Guardando cotización comercial...', 'info');
        if (existingQuote) {
          await (window as any).API.updateQuotation(existingQuote.id, header, lines);
          (window as any).showToast(`Cotización ${header.number} actualizada correctamente`, 'success');
        } else {
          const created = await (window as any).API.createQuotation(header, lines);
          (window as any).showToast(`Cotización ${created.number} emitida con éxito`, 'success');
        }
        (window as any).closeModal();
        if (typeof onDone === 'function') onDone();
      } catch (err: any) {
        console.error('Error guardando cotización:', err);
        (window as any).showToast('Error al guardar cotización: ' + err.message, 'error');
      }
    });
  } catch (err: any) {
    (window as any).showToast('Error al abrir formulario de cotización: ' + err.message, 'error');
  }
}

// ── MODAL PARA COMENTARIOS / ESPECIFICACIONES DE ÍTEM ──────────────────
(window as any).openQuoteLineCommentModal = function (idx: number) {
  const currentComment = (document.getElementById(`ql-comment-${idx}`) as HTMLInputElement)?.value || '';
  const prodId = (document.getElementById(`ql-prod-${idx}`) as HTMLInputElement)?.value;
  const prodName = document.querySelector(`#ql-row-${idx} .font-semibold`)?.textContent || 'Ítem de Cotización';

  const modalHtml = `
    <div class="space-y-3 text-slate-700">
      <div class="p-3 bg-violet-50/70 border border-violet-200/80 rounded-xl text-xs text-violet-950 flex items-start gap-2">
        <i class="fa-solid fa-circle-info text-violet-600 mt-0.5"></i>
        <div>
          <strong class="text-violet-900">Producto:</strong> ${(window as any).esc(prodName)}
          <p class="text-[11px] text-violet-800 mt-0.5">
            Añade especificaciones técnicas, variantes, dimensiones, marcas o notas que acompañarán este producto en la cotización comercial y se heredarán si se convierte a Facturación Electrónica DIAN.
          </p>
        </div>
      </div>
      <div>
        <label class="form-label text-xs font-semibold text-slate-700">Comentario o Especificación Detallada</label>
        <textarea id="modal-ql-comment-txt" class="form-input text-xs" rows="5" maxlength="5000" placeholder="Escribe aquí las especificaciones del ítem (ej: color gris titanio, calibre 18, entrega inmediata en obra)...">${(window as any).esc(currentComment)}</textarea>
        <div class="flex justify-between text-[11px] text-slate-400 mt-1">
          <span>Soporta hasta 5.000 caracteres conforme al estándar DIAN UBL 2.1</span>
          <span id="modal-ql-comment-counter" class="font-mono text-violet-700">${currentComment.length} / 5000</span>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <div class="flex items-center justify-between w-full">
      <button type="button" class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <div class="flex gap-2">
        ${currentComment ? `<button type="button" class="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50" onclick="window.clearQuoteLineComment(${idx})"><i class="fas fa-trash-can mr-1"></i> Borrar</button>` : ''}
        <button type="button" class="btn btn-primary btn-sm" style="background:#7C3AED;border-color:#6D28D9;color:#fff" onclick="window.saveQuoteLineComment(${idx})">
          <i class="fas fa-check mr-1"></i> Guardar Comentario
        </button>
      </div>
    </div>
  `;

  (window as any).openModal('Especificaciones del Ítem', modalHtml, footer, false);

  const txt = document.getElementById('modal-ql-comment-txt') as HTMLTextAreaElement;
  const cnt = document.getElementById('modal-ql-comment-counter');
  if (txt && cnt) {
    txt.addEventListener('input', () => {
      cnt.textContent = `${txt.value.length} / 5000`;
    });
  }
};

(window as any).saveQuoteLineComment = function (idx: number) {
  const txt = (document.getElementById('modal-ql-comment-txt') as HTMLTextAreaElement)?.value.trim() || '';
  const commentInput = document.getElementById(`ql-comment-${idx}`) as HTMLInputElement;
  const preview = document.getElementById(`ql-comment-preview-${idx}`);
  const btn = document.getElementById(`ql-comment-btn-${idx}`);

  if (commentInput) commentInput.value = txt;
  if (preview) {
    if (txt) {
      preview.innerHTML = `<i class="fa-solid fa-quote-left text-[8px] mr-1 text-violet-400"></i>${(window as any).esc(txt)}`;
      preview.classList.remove('hidden');
    } else {
      preview.innerHTML = '';
      preview.classList.add('hidden');
    }
  }
  if (btn) {
    btn.className = `p-1.5 rounded-lg border transition-colors ml-1 flex-shrink-0 ${txt ? 'text-violet-600 bg-violet-50/60 border-violet-300' : 'text-slate-400 hover:text-violet-600 border-slate-200'}`;
    btn.title = txt ? 'Editar comentario/especificación' : 'Añadir comentario o especificación';
    btn.innerHTML = `<i class="${txt ? 'fa-solid' : 'fa-regular'} fa-comment-dots text-xs"></i>`;
  }
  (window as any).closeModal();
};

(window as any).clearQuoteLineComment = function (idx: number) {
  const commentInput = document.getElementById(`ql-comment-${idx}`) as HTMLInputElement;
  const preview = document.getElementById(`ql-comment-preview-${idx}`);
  const btn = document.getElementById(`ql-comment-btn-${idx}`);
  if (commentInput) commentInput.value = '';
  if (preview) { preview.innerHTML = ''; preview.classList.add('hidden'); }
  if (btn) {
    btn.className = 'p-1.5 rounded-lg border border-slate-200 hover:bg-violet-50 transition-colors ml-1 flex-shrink-0 text-slate-400 hover:text-violet-600';
    btn.title = 'Añadir comentario o especificación';
    btn.innerHTML = '<i class="fa-regular fa-comment-dots text-xs"></i>';
  }
  (window as any).closeModal();
};

(window as any).editQuotation = function (quoteId: string) {
  openQuotationForm(quoteId, () => {
    const pane = document.getElementById('tab-pane-cotizaciones');
    if (pane) renderCotizaciones(pane);
  });
};

(window as any).renderCotizaciones = renderCotizaciones;
