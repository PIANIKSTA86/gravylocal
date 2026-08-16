/**
 * GRAVY v2.0 — utils.js
 * Funciones utilitarias globales. Sin dependencias externas.
 */

'use strict';

/* ── Selectores Escopados y Protección de Contenedor de Pestaña ── */
function getActivePane(): HTMLElement | Document {
  if (typeof document === 'undefined') return {} as any;
  const active = document.querySelector('#page-content .tab-pane.active');
  return (active as HTMLElement) || document.getElementById('page-content') || document;
}

function getPageContainer(container?: HTMLElement | null): HTMLElement {
  if (typeof document === 'undefined') return {} as any;
  if (container && container.id && container.id !== 'page-content' && !container.id.startsWith('page-content')) {
    return container;
  }
  const active = document.querySelector('#page-content .tab-pane.active') as HTMLElement;
  if (active) return active;
  return (container || document.getElementById('page-content') || document.body) as HTMLElement;
}

const $ = (s: string, context?: HTMLElement | Document): HTMLElement | null => {
  if (!s) return null;
  const root = context || getActivePane();
  let el = root.querySelector(s);
  if (!el && root !== document) {
    el = document.querySelector(s);
  }
  return el as HTMLElement | null;
};

const $$ = (s: string, context?: HTMLElement | Document): HTMLElement[] => {
  if (!s) return [];
  const root = context || getActivePane();
  const list = root.querySelectorAll(s);
  if (list.length > 0) return [...list] as HTMLElement[];
  return root !== document ? ([...document.querySelectorAll(s)] as HTMLElement[]) : [];
};

/* ── Sanitización HTML (previene XSS) ────────────────────── */
const _escDiv = document.createElement('div');
function esc(str) {
  _escDiv.textContent = String(str ?? '');
  return _escDiv.innerHTML;
}

/* ── Formato numérico colombiano ─────────────────────────── */
let _decimalPlaces = 2;
let _fmtCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: _decimalPlaces, maximumFractionDigits: _decimalPlaces });
let _fmtNum = new Intl.NumberFormat('es-CO', { minimumFractionDigits: _decimalPlaces, maximumFractionDigits: _decimalPlaces });

function setDecimalPlaces(n: any) {
  const parsed = parseInt(String(n ?? ''), 10);
  const d = Number.isNaN(parsed) ? 2 : Math.max(0, Math.min(6, parsed));
  _decimalPlaces = d;
  _fmtCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: d, maximumFractionDigits: d });
  _fmtNum = new Intl.NumberFormat('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (typeof window !== 'undefined') {
    (window as any).APP_DECIMAL_PLACES = d;
  }
}

function getDecimalPlaces(): number {
  return _decimalPlaces;
}

function roundDecimals(val: number, decimals: number = _decimalPlaces): number {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(val || 0) + Number.EPSILON) * factor) / factor;
}

function fmt(n)   { return _fmtCOP.format(n ?? 0); }
function fmtN(n)  { return _fmtNum.format(n ?? 0); }
function parseNum(s) { return parseFloat(String(s ?? '').replace(/[^0-9.\-]/g, '')) || 0; }

if (typeof window !== 'undefined') {
  (window as any).setDecimalPlaces = setDecimalPlaces;
  (window as any).getDecimalPlaces = getDecimalPlaces;
  (window as any).roundDecimals = roundDecimals;
  (window as any).fmt = fmt;
  (window as any).fmtN = fmtN;
}

/* ── Fechas (Colombia America/Bogota / UTC-5) ─────────────── */
function getColombiaDateStr(d?: Date | string | number): string {
  const dt = d ? (d instanceof Date ? d : new Date(d)) : new Date();
  if (isNaN(dt.getTime())) return '';
  const cot = new Date(dt.getTime() - 5 * 3600 * 1000);
  return cot.toISOString().slice(0, 10);
}

function getColombiaDateTimeStr(d?: Date | string | number): string {
  const dt = d ? (d instanceof Date ? d : new Date(d)) : new Date();
  if (isNaN(dt.getTime())) return '';
  const cot = new Date(dt.getTime() - 5 * 3600 * 1000);
  return cot.toISOString().replace('T', ' ').slice(0, 19);
}

function getColombiaFirstDayOfMonth(d?: Date | string | number): string {
  const dateStr = getColombiaDateStr(d);
  if (!dateStr) return '';
  return `${dateStr.slice(0, 7)}-01`;
}

function getColombiaLastDayOfMonth(d?: Date | string | number): string {
  const dateStr = getColombiaDateStr(d);
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${parts[0]}-${parts[1]}-${String(lastDay).padStart(2, '0')}`;
}

function todayStr(d?: Date | string | number): string {
  return getColombiaDateStr(d);
}

function nowStr(d?: Date | string | number): string {
  return getColombiaDateTimeStr(d);
}

function fmtDate(d) {
  if (!d) return '—';
  const dateStr = getColombiaDateStr(d);
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/* ── Traducción de Estados y Eventos (Inglés a Español) ───── */
function translateText(text: string): string {
  if (!text) return '';
  let res = text;
  
  const translations = [
    { eng: 'drafts', esp: 'borradores' },
    { eng: 'draft', esp: 'borrador' },
    { eng: 'approved', esp: 'aprobado' },
    { eng: 'active', esp: 'activo' },
    { eng: 'voided', esp: 'anulado' },
    { eng: 'posted', esp: 'contabilizado' },
    { eng: 'paid', esp: 'pagado' },
    { eng: 'applied', esp: 'aplicado' },
    { eng: 'processed', esp: 'procesado' },
    { eng: 'void', esp: 'anulado' }
  ];

  for (const item of translations) {
    const reLower = new RegExp('\\\\b' + item.eng + '\\\\b', 'g');
    res = res.replace(reLower, item.esp);

    const capEng = item.eng.charAt(0).toUpperCase() + item.eng.slice(1);
    const capEsp = item.esp.charAt(0).toUpperCase() + item.esp.slice(1);
    const reCap = new RegExp('\\\\b' + capEng + '\\\\b', 'g');
    res = res.replace(reCap, capEsp);

    const upperEng = item.eng.toUpperCase();
    const upperEsp = item.esp.toUpperCase();
    const reUpper = new RegExp('\\\\b' + upperEng + '\\\\b', 'g');
    res = res.replace(reUpper, upperEsp);
  }

  return res;
}

/* ── Toasts ───────────────────────────────────────────────── */
const TOAST_ICONS = {
  success: 'fa-check-circle',
  error:   'fa-times-circle',
  warning: 'fa-exclamation-triangle',
  info:    'fa-info-circle',
};

function showToast(msg, type = 'success', duration = 3500) {
  const container = $('#toast-container');
  if (!container) return;
  const translatedMsg = translateText(msg);
  const t = document.createElement('div');
  t.className = `toast toast-${type} toast-enter`;
  t.innerHTML = `<i class="fas ${TOAST_ICONS[type] ?? TOAST_ICONS.info}"></i><span>${esc(translatedMsg)}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.cssText = 'opacity:0;transform:translateX(100%);transition:all .3s';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

function getIconForDocumentTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('factura') || t.includes('venta')) return 'fa-receipt';
  if (t.includes('compra')) return 'fa-cart-flatbed';
  if (t.includes('tercero') || t.includes('cliente') || t.includes('proveedor')) return 'fa-user-plus';
  if (t.includes('centro')) return 'fa-sitemap';
  if (t.includes('cuenta')) return 'fa-list-tree';
  if (t.includes('serie') || t.includes('tipo')) return 'fa-tags';
  if (t.includes('transaccion') || t.includes('comprobante') || t.includes('asiento')) return 'fa-plus-circle';
  if (t.includes('soporte')) return 'fa-file-signature';
  if (t.includes('producto') || t.includes('servicio')) return 'fa-box-open';
  if (t.includes('bodega')) return 'fa-warehouse';
  if (t.includes('consignacion') || t.includes('consignación')) return 'fa-boxes-packing';
  if (t.includes('toma') || t.includes('fisica') || t.includes('física')) return 'fa-clipboard-check';
  if (t.includes('recalculo') || t.includes('recálculo')) return 'fa-calculator';
  if (t.includes('recibo') || t.includes('recaudo')) return 'fa-receipt';
  if (t.includes('ingreso')) return 'fa-hand-holding-dollar';
  if (t.includes('egreso') || t.includes('pago')) return 'fa-money-bill-transfer';
  if (t.includes('importacion') || t.includes('importación')) return 'fa-ship';
  if (t.includes('reserva')) return 'fa-calendar-check';
  if (t.includes('entrega') || t.includes('despacho')) return 'fa-truck-fast';
  if (t.includes('empleado')) return 'fa-user-gear';
  if (t.includes('configuracion') || t.includes('configuración')) return 'fa-sliders';
  if (t.includes('periodo') || t.includes('período')) return 'fa-calendar-days';
  if (t.includes('novedad')) return 'fa-notes-medical';
  if (t.includes('liquidacion') || t.includes('liquidación')) return 'fa-calculator';
  if (t.includes('inventario') || t.includes('kardex') || t.includes('movimiento')) return 'fa-boxes-stacked';
  return 'fa-file-lines';
}

/* ── Modal genérico — Adaptador Inteligente Tab vs Overlay ─── */
// tabKey opcional: fija la pestaña destino cuando el título cambia entre llamadas
// sucesivas del mismo flujo (ej: "Verificando..." -> "Modificar — N°123"), evitando
// que cada título genere un slug distinto y quede la pestaña de carga huérfana.
function openModal(title: string, bodyHtml: string, footerHtml: any = '', wide = false, tabKey: string | null = null) {
  const titleClean = String(title || '').replace(/<[^>]*>/g, '').trim();

  let compiledFooterHtml = '';
  const pendingClickHandlers: Array<{ id: string; action: Function }> = [];

  if (typeof footerHtml === 'string') {
    compiledFooterHtml = footerHtml;
  } else if (Array.isArray(footerHtml)) {
    compiledFooterHtml = footerHtml.map((item, idx) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        const btnId = `modal-act-btn-${Date.now()}-${idx}`;
        if (typeof item.action === 'function') {
          pendingClickHandlers.push({ id: btnId, action: item.action });
        }
        const cls = item.class || 'btn-outline';
        const label = item.label || 'Aceptar';
        return `<button type="button" id="${btnId}" class="btn ${cls}">${esc(label)}</button>`;
      }
      return '';
    }).join(' ');
  } else if (footerHtml && typeof footerHtml === 'object') {
    const btnId = `modal-act-btn-${Date.now()}-0`;
    if (typeof footerHtml.action === 'function') {
      pendingClickHandlers.push({ id: btnId, action: footerHtml.action });
    }
    const cls = footerHtml.class || 'btn-outline';
    const label = footerHtml.label || 'Aceptar';
    compiledFooterHtml = `<button type="button" id="${btnId}" class="btn ${cls}">${esc(label)}</button>`;
  }

  const titleLower = titleClean.toLowerCase();
  const isDocumentForm = wide || 
    titleLower.includes('factura') || 
    titleLower.includes('tercero') || 
    titleLower.includes('producto') || 
    titleLower.includes('compra') || 
    titleLower.includes('pedido') || 
    titleLower.includes('transaccion') || 
    titleLower.includes('transacción') || 
    titleLower.includes('recaudo') || 
    titleLower.includes('egreso') || 
    titleLower.includes('nomina') || 
    titleLower.includes('nómina') || 
    titleLower.includes('toma de inventario') || 
    titleLower.includes('reserva') || 
    titleLower.includes('cotizacion') || 
    titleLower.includes('cotización') || 
    titleLower.includes('crear') || 
    titleLower.includes('nuevo') || 
    titleLower.includes('nueva');

  if (isDocumentForm && typeof (window as any).openDocumentTab === 'function') {
    const slug = titleClean.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const resolvedKey = tabKey || `doc-${slug || Date.now()}`;
    const icon = getIconForDocumentTitle(titleClean);

    (window as any).openDocumentTab(resolvedKey, titleClean, icon, bodyHtml, compiledFooterHtml, () => {
      pendingClickHandlers.forEach(({ id, action }) => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.addEventListener('click', (e) => {
            try { action(e); } catch (err) { console.error("Modal action error:", err); }
          });
        }
      });
    });
    return;
  }

  // Diálogo liviano en overlay dentro del pane activo
  const activePane = (getActivePane() as HTMLElement) || document.body;
  let overlay = activePane.querySelector('.tab-modal-overlay') as HTMLElement;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'tab-modal-overlay modal-overlay show';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(5,8,20,.6)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.zIndex = '300';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.padding = '16px';
    activePane.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="modal-box bg-white rounded-2xl p-6 shadow-2xl ${wide ? 'wide max-w-4xl' : 'max-w-xl'} w-full border border-gray-200 anim-fade" style="border-color:#E2E8F0">
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-gray-200">
        <h4 class="text-base font-bold text-gray-900">${esc(titleClean)}</h4>
        <button type="button" class="btn btn-outline btn-sm" onclick="closeModal()">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
      <div class="modal-body max-h-[70vh] overflow-y-auto py-2">
        ${bodyHtml}
      </div>
      <div class="modal-footer pt-4 mt-4 border-t border-gray-200 flex items-center justify-end gap-2">
        ${compiledFooterHtml}
      </div>
    </div>
  `;
  overlay.classList.add('show');
  overlay.style.display = 'flex';

  pendingClickHandlers.forEach(({ id, action }) => {
    const btn = overlay.querySelector(`#${id}`);
    if (btn) {
      btn.addEventListener('click', (e) => {
        try { action(e); } catch (err) { console.error("Modal action error:", err); }
      });
    }
  });
}

function closeModal() {
  try {
    const cb = (window as any).__modalCloseCallback;
    if (cb) {
      (window as any).__modalCloseCallback = null;
      try { cb(); } catch (e) { console.error(e); }
      return;
    }

    if ((window as any).__salesModalOpen && typeof (window as any).soSaveTempState === 'function') {
      try {
        (window as any).soSaveTempState();
      } catch (e) {
        console.error("Error saving temporary state on close:", e);
      }
    }

    // 1. Si hay un overlay modal en el pane activo, cerrar solo el overlay
    const activePane = (getActivePane() as HTMLElement);
    const overlay = activePane ? (activePane.querySelector('.tab-modal-overlay') as HTMLElement) : null;
    if (overlay && (overlay.classList.contains('show') || overlay.style.display !== 'none')) {
      overlay.classList.remove('show');
      overlay.style.display = 'none';
      overlay.remove();
      return;
    }

    // 2. Si es una pestaña de documento (doc-*), cerrar la pestaña activa
    const curPage = (window as any).currentPage;
    if (typeof curPage === 'string' && typeof (window as any).closeTab === 'function' && 
       (curPage.startsWith('doc-') || curPage.startsWith('nueva-') || curPage.startsWith('editar-') || curPage.startsWith('nuevo-') || curPage.startsWith('iniciar-') || curPage.startsWith('programar-') || curPage.startsWith('registrar-') || curPage.startsWith('configuracion-'))) {
      try {
        (window as any).closeTab(curPage);
      } catch (e) {
        console.error(e);
      }
      return;
    }

    const globalOverlay = $('#modal-overlay');
    if (globalOverlay) {
      globalOverlay.classList.remove('show');
      const globalBody = $('#modal-body');
      if (globalBody) globalBody.innerHTML = '';
      const globalFooter = $('#modal-footer');
      if (globalFooter) globalFooter.innerHTML = '';
    }
  } catch (err) {
    console.error("[closeModal] Error caught safely:", err);
  } finally {
    (window as any).__salesModalOpen = false;
    (window as any).__txModalOpen = false;
    (window as any).__poModalOpen = false;
    (window as any).__poFormActive = false;
  }
}

// ── Mini-overlay de comentario de línea (no reemplaza el modal padre) ────────
let _lineCommentState = null; // { lineIdx, ctx: 'new'|'edit' }

function openLineComment(lineIdx: number, ctx: string) {
  const state = ctx === 'edit'
    ? (window as any).TX_EDIT_STATE
    : (window as any).TX_STATE;
  if (!state || !state.lines) return;
  const current = state.lines[lineIdx]?.description || '';
  _lineCommentState = { lineIdx, ctx };
  const ta = document.getElementById('line-comment-textarea') as HTMLTextAreaElement;
  if (ta) ta.value = current;
  const overlay = document.getElementById('line-comment-overlay');
  if (overlay) { overlay.style.display = 'flex'; setTimeout(() => ta?.focus(), 50); }
}

function closeLineComment() {
  _lineCommentState = null;
  const overlay = document.getElementById('line-comment-overlay');
  if (overlay) overlay.style.display = 'none';
}

function saveLineComment() {
  if (!_lineCommentState) return closeLineComment();
  const { lineIdx, ctx } = _lineCommentState;
  const val = ((document.getElementById('line-comment-textarea') as HTMLTextAreaElement)?.value || '').trim();
  const state = ctx === 'edit'
    ? (window as any).TX_EDIT_STATE
    : (window as any).TX_STATE;
  if (state && state.lines && state.lines[lineIdx] !== undefined) {
    state.lines[lineIdx].description = val;
    closeLineComment();
    if (ctx === 'edit' && typeof (window as any).renderEditTxLines === 'function') (window as any).renderEditTxLines(true);
    else if (typeof (window as any).renderTxLines === 'function') (window as any).renderTxLines(true);
  } else {
    closeLineComment();
  }
}

function confirmDialog(title: string, message: string, onConfirm: () => void, danger = true) {
  const overlay = document.getElementById('confirm-dialog-overlay');
  const titleEl = document.getElementById('confirm-dialog-title');
  const bodyEl = document.getElementById('confirm-dialog-body');
  const btnOk = document.getElementById('confirm-dialog-ok');
  const btnCancel = document.getElementById('confirm-dialog-cancel');

  if (overlay && titleEl && bodyEl && btnOk && btnCancel) {
    titleEl.innerHTML = title;
    bodyEl.innerHTML = message;
    btnOk.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;
    overlay.style.display = 'flex';

    const close = () => { overlay.style.display = 'none'; };
    btnCancel.onclick = close;
    btnOk.onclick = () => { close(); onConfirm(); };
  } else {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  }
}

/* ── Tabla filtrable ──────────────────────────────────────── */
function filterTable(tableId, query, filterField = null, filterValue = '') {
  const q = query.toLowerCase();
  $$(`#${tableId} tbody tr`).forEach(tr => {
    const textMatch = !q || tr.textContent.toLowerCase().includes(q);
    const fieldMatch = !filterValue || (tr.dataset[filterField] ?? '') === filterValue;
    tr.style.display = textMatch && fieldMatch ? '' : 'none';
  });
}

/* ── Paginación simple ────────────────────────────────────── */
function renderPagination(containerId, totalPages, currentPage, onPageChange) {
  const c = $(`#${containerId}`);
  if (!c || totalPages <= 1) { if (c) c.innerHTML = ''; return; }
  let html = `<div class="pagination justify-end mt-4">`;
  html += `<button class="page-btn" onclick="(${onPageChange.toString()})(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left text-xs"></i></button>`;
  const range = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 2) range.push(i);
    else if (range[range.length - 1] !== '…') range.push('…');
  }
  range.forEach(p => {
    if (p === '…') html += `<span class="page-btn" style="cursor:default">…</span>`;
    else html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="(${onPageChange.toString()})(${p})">${p}</button>`;
  });
  html += `<button class="page-btn" onclick="(${onPageChange.toString()})(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right text-xs"></i></button>`;
  html += '</div>';
  c.innerHTML = html;
}

/* ── Debounce ─────────────────────────────────────────────── */
function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/* ── Constantes del dominio colombiano ───────────────────── */
const DOC_TYPES = [
  { code: 'NIT', name: 'NIT' },
  { code: 'CC',  name: 'Cédula de Ciudadanía' },
  { code: 'CE',  name: 'Cédula de Extranjería' },
  { code: 'TI',  name: 'Tarjeta de Identidad' },
  { code: 'PAS', name: 'Pasaporte' },
  { code: 'RC',  name: 'Registro Civil' },
];

/** Tipos de documento ampliados para terceros (incluye NITPE para extranjeros) */
const LOCAL_DOC_TYPES = [
  { code: 'NIT',   name: 'NIT — Número de Identificación Tributaria' },
  { code: 'NITPE', name: 'NITPE — NIT Persona Extranjera (DIAN)' },
  { code: 'CC',    name: 'CC — Cédula de Ciudadanía' },
  { code: 'CE',    name: 'CE — Cédula de Extranjería' },
  { code: 'TI',    name: 'TI — Tarjeta de Identidad' },
  { code: 'PAS',   name: 'PAS — Pasaporte' },
  { code: 'RC',    name: 'RC — Registro Civil' },
];

/** Responsabilidades fiscales DIAN (catálogo oficial) */
const DIAN_RESP = [
  { c: '01', l: 'Aporte especial para la administración de justicia' },
  { c: '02', l: 'Gravamen a los Movimientos Financieros (GMF)' },
  { c: '03', l: 'Impuesto al Patrimonio' },
  { c: '04', l: 'Impuesto Sobre la Renta y Complementarios Régimen Tributario Especial' },
  { c: '05', l: 'Impuesto Sobre la Renta y Complementarios Régimen Ordinario' },
  { c: '06', l: 'Ingresos y patrimonio' },
  { c: '07', l: 'Retención en la Fuente a título de renta' },
  { c: '08', l: 'Retención Timbre Nacional' },
  { c: '09', l: 'Retención en la Fuente en el Impuesto Sobre las Ventas' },
  { c: '10', l: 'Obligado aduanero' },
  { c: '13', l: 'Gran contribuyente' },
  { c: '14', l: 'Informante de Exógena' },
  { c: '15', l: 'Autorretenedor' },
  { c: '16', l: 'Obligación de facturar por ingresos de bienes y/o servicios excluidos' },
  { c: '17', l: 'Profesionales de compra y venta de divisas' },
  { c: '18', l: 'Precios de Transferencia' },
  { c: '19', l: 'Productor y/o exportador de bienes exentos' },
  { c: '20', l: 'Obtención NIT' },
  { c: '21', l: 'Declarar el ingreso o salida del país de divisas o moneda legal colombiana' },
  { c: '22', l: 'Obligado a cumplir deberes formales a nombre de terceros' },
  { c: '23', l: 'Agente de retención en el impuesto sobre las ventas' },
  { c: '26', l: 'Declaración Informativa Individual Precios de transferencia' },
  { c: '32', l: 'Impuesto Nacional a la Gasolina y al ACPM' },
  { c: '33', l: 'Impuesto Nacional al Consumo' },
  { c: '36', l: 'Establecimiento Permanente' },
  { c: '39', l: 'Proveedor de Servicios Tecnológicos (PST)' },
  { c: '41', l: 'Declaración anual de activos en el exterior' },
  { c: '42', l: 'Obligado a llevar contabilidad' },
  { c: '45', l: 'Autorretenedor de rendimientos financieros' },
  { c: '46', l: 'IVA Prestadores de Servicios desde el Exterior' },
  { c: '47', l: 'Régimen Simple de Tributación (SIMPLE)' },
  { c: '48', l: 'Impuesto sobre las ventas (IVA)' },
  { c: '49', l: 'No responsable de IVA' },
  { c: '50', l: 'No responsable de Consumo restaurantes y bares' },
  { c: '52', l: 'Facturador Electrónico' },
  { c: '53', l: 'Persona Jurídica No Responsable de IVA' },
  { c: '54', l: 'Intercambio Automático de Información CRS' },
  { c: '55', l: 'Informante de Beneficiarios Finales' },
  { c: '56', l: 'Impuesto Nacional al Carbono' },
  { c: '58', l: 'Intercambio Automático de Información FATCA' },
  { c: '59', l: 'Autorretención especial renta' },
  { c: '60', l: 'Autorretención por concepto de intereses y rendimientos financieros de entidades vigiladas por la Superintendencia Financiera' },
  { c: '61', l: 'Autorretención por concepto de comisiones de entidades vigiladas por la Superintendencia Financiera' },
  { c: '62', l: 'Impuesto nacional sobre productos plásticos un solo uso' },
  { c: '63', l: 'Impuestos a las bebidas ultraprocesada azucaradas' },
  { c: 'R-99-PN', l: 'No aplica — Otros' }
];

/** Actividades económicas CIIU — DIAN Colombia (510 actividades según CIIU v4 A.C.) */
const DIAN_CIIU = [
  { c: '0010', l: 'Asalariados' },
  { c: '0020', l: 'Pensionados' },
  { c: '0081', l: 'Personas naturales y sucesiones ilíquidas sin actividad económica' },
  { c: '0082', l: 'Personas naturales subsidiadas por terceros' },
  { c: '0090', l: 'Rentistas de capital, solo para personas naturales y sucesiones ilíquidas' },
  { c: '0111', l: 'Cultivo de cereales (excepto arroz), legumbres y semillas oleaginosas' },
  { c: '0112', l: 'Cultivo de arroz' },
  { c: '0113', l: 'Cultivo de hortalizas, raíces y tubérculos' },
  { c: '0114', l: 'Cultivo de tabaco' },
  { c: '0115', l: 'Cultivo de plantas textiles' },
  { c: '0119', l: 'Otros cultivos transitorios n.c.p.' },
  { c: '0121', l: 'Cultivo de frutas tropicales y subtropicales' },
  { c: '0122', l: 'Cultivo de plátano y banano' },
  { c: '0123', l: 'Cultivo de café' },
  { c: '0124', l: 'Cultivo de caña de azúcar' },
  { c: '0125', l: 'Cultivo de flor de corte' },
  { c: '0126', l: 'Cultivo de palma para aceite (palma africana) y otros frutos oleaginosos' },
  { c: '0127', l: 'Cultivo de plantas con las que se preparan bebidas' },
  { c: '0128', l: 'Cultivo de especias y de plantas aromáticas y medicinales' },
  { c: '0129', l: 'Otros cultivos permanentes n.c.p.' },
  { c: '0130', l: 'Propagación de plantas (actividades de los viveros, excepto viveros forestales)' },
  { c: '0141', l: 'Cría de ganado bovino y bufalino' },
  { c: '0142', l: 'Cría de caballos y otros equinos' },
  { c: '0143', l: 'Cría de ovejas y cabras' },
  { c: '0144', l: 'Cría de ganado porcino' },
  { c: '0145', l: 'Cría de aves de corral' },
  { c: '0149', l: 'Cría de otros animales n.c.p.' },
  { c: '0150', l: 'Explotación mixta (agrícola y pecuaria)' },
  { c: '0161', l: 'Actividades de apoyo a la agricultura' },
  { c: '0162', l: 'Actividades de apoyo a la ganadería' },
  { c: '0163', l: 'Actividades posteriores a la cosecha' },
  { c: '0164', l: 'Tratamiento de semillas para propagación' },
  { c: '0170', l: 'Caza ordinaria y mediante trampas y actividades de servicios conexas' },
  { c: '0210', l: 'Silvicultura y otras actividades forestales' },
  { c: '0220', l: 'Extracción de madera' },
  { c: '0230', l: 'Recolección de productos forestales diferentes a la madera' },
  { c: '0240', l: 'Servicios de apoyo a la silvicultura' },
  { c: '0311', l: 'Pesca marítima' },
  { c: '0312', l: 'Pesca de agua dulce' },
  { c: '0321', l: 'Acuicultura marítima' },
  { c: '0322', l: 'Acuicultura de agua dulce' },
  { c: '0510', l: 'Extracción de hulla (carbón de piedra)' },
  { c: '0520', l: 'Extracción de carbón lignito' },
  { c: '0610', l: 'Extracción de petróleo crudo' },
  { c: '0620', l: 'Extracción de gas natural' },
  { c: '0710', l: 'Extracción de minerales de hierro' },
  { c: '0721', l: 'Extracción de minerales de uranio y de torio' },
  { c: '0722', l: 'Extracción de oro y otros metales preciosos' },
  { c: '0723', l: 'Extracción de minerales de níquel' },
  { c: '0729', l: 'Extracción de otros minerales metalíferos no ferrosos n.c.p.' },
  { c: '0811', l: 'Extracción de piedra, arena, arcillas comunes, yeso y anhidrita' },
  { c: '0812', l: 'Extracción de arcillas de uso industrial, caliza, caolín y bentonitas' },
  { c: '0820', l: 'Extracción de esmeraldas, piedras preciosas y semipreciosas' },
  { c: '0891', l: 'Extracción de minerales para la fabricación de abonos y productos químicos' },
  { c: '0892', l: 'Extracción de halita (sal)' },
  { c: '0899', l: 'Extracción de otros minerales no metálicos n.c.p.' },
  { c: '0910', l: 'Actividades de apoyo para la extracción de petróleo y de gas natural' },
  { c: '0990', l: 'Actividades de apoyo para otras actividades de explotación de minas y canteras' },
  { c: '1011', l: 'Procesamiento y conservación de carne y productos cárnicos' },
  { c: '1012', l: 'Procesamiento y conservación de pescados, crustáceos y moluscos' },
  { c: '1020', l: 'Procesamiento y conservación de frutas, legumbres, hortalizas y tubérculos' },
  { c: '1030', l: 'Elaboración de aceites y grasas de origen vegetal y animal' },
  { c: '1031', l: 'Extracción de aceites de origen vegetal crudos' },
  { c: '1032', l: 'Elaboración de aceites y grasas de origen vegetal refinados' },
  { c: '1033', l: 'Elaboración de aceites y grasas de origen animal' },
  { c: '1040', l: 'Elaboración de productos lácteos' },
  { c: '1051', l: 'Elaboración de productos de molinería' },
  { c: '1052', l: 'Elaboración de almidones y productos derivados del almidón' },
  { c: '1061', l: 'Trilla de café' },
  { c: '1062', l: 'Descafeinado, tostión y molienda del café' },
  { c: '1063', l: 'Otros derivados del café' },
  { c: '1071', l: 'Elaboración y refinación de azúcar' },
  { c: '1072', l: 'Elaboración de panela' },
  { c: '1081', l: 'Elaboración de productos de panadería' },
  { c: '1082', l: 'Elaboración de cacao, chocolate y productos de confitería' },
  { c: '1083', l: 'Elaboración de macarrones, fideos, alcuzcuz y productos farináceos similares' },
  { c: '1084', l: 'Elaboración de comidas y platos preparados' },
  { c: '1089', l: 'Elaboración de otros productos alimenticios n.c.p.' },
  { c: '1090', l: 'Elaboración de alimentos preparados para animales' },
  { c: '1101', l: 'Destilación, rectificación y mezcla de bebidas alcohólicas' },
  { c: '1102', l: 'Elaboración de bebidas fermentadas no destiladas' },
  { c: '1103', l: 'Producción de malta, elaboración de cervezas y otras bebidas malteadas' },
  { c: '1104', l: 'Elaboración de bebidas no alcohólicas, producción de aguas minerales y de otras aguas embotelladas' },
  { c: '1200', l: 'Elaboración de productos de tabaco' },
  { c: '1311', l: 'Preparación e hilatura de fibras textiles' },
  { c: '1312', l: 'Tejeduría de productos textiles' },
  { c: '1313', l: 'Acabado de productos textiles' },
  { c: '1391', l: 'Fabricación de tejidos de punto y ganchillo' },
  { c: '1392', l: 'Confección de artículos con materiales textiles, excepto prendas de vestir' },
  { c: '1393', l: 'Fabricación de tapetes y alfombras para pisos' },
  { c: '1394', l: 'Fabricación de cuerdas, cordeles, cables, bramantes y redes' },
  { c: '1399', l: 'Fabricación de otros artículos textiles n.c.p.' },
  { c: '1410', l: 'Confección de prendas de vestir, excepto prendas de piel' },
  { c: '1420', l: 'Fabricación de artículos de piel' },
  { c: '1430', l: 'Fabricación de artículos de punto y ganchillo' },
  { c: '1511', l: 'Curtido y recurtido de cueros; recurtido y teñido de pieles' },
  { c: '1512', l: 'Fabricación de artículos de viaje, bolsos de mano y artículos similares elaborados en cuero, y fabricación de artículos de talabartería y guarnicionería' },
  { c: '1513', l: 'Fabricación de artículos de viaje, bolsos de mano y artículos similares; artículos de talabartería y guarnicionería elaborados en otros materiales' },
  { c: '1521', l: 'Fabricación de calzado de cuero y piel, con cualquier tipo de suela' },
  { c: '1522', l: 'Fabricación de otros tipos de calzado, excepto calzado de cuero y piel' },
  { c: '1523', l: 'Fabricación de partes del calzado' },
  { c: '1610', l: 'Aserrado, acepillado e impregnación de la madera' },
  { c: '1620', l: 'Fabricación de hojas de madera para enchapado; fabricación de tableros contrachapados, tableros laminados, tableros de partículas y otros tableros y paneles' },
  { c: '1630', l: 'Fabricación de partes y piezas de madera, de carpintería y ebanistería para la construcción' },
  { c: '1640', l: 'Fabricación de recipientes de madera' },
  { c: '1690', l: 'Fabricación de otros productos de madera; fabricación de artículos de corcho, cestería y espartería' },
  { c: '1701', l: 'Fabricación de pulpas (pastas) celulósicas; papel y cartón' },
  { c: '1702', l: 'Fabricación de papel y cartón ondulado (corrugado); fabricación de envases, empaques y de embalajes de papel y cartón.' },
  { c: '1709', l: 'Fabricación de otros artículos de papel y cartón' },
  { c: '1811', l: 'Actividades de impresión' },
  { c: '1812', l: 'Actividades de servicios relacionados con la impresión' },
  { c: '1820', l: 'Producción de copias a partir de grabaciones originales' },
  { c: '1910', l: 'Fabricación de productos de hornos de coque' },
  { c: '1921', l: 'Fabricación de productos de la refinación del petróleo' },
  { c: '1922', l: 'Actividad de mezcla de combustibles' },
  { c: '2011', l: 'Fabricación de sustancias y productos químicos básicos' },
  { c: '2012', l: 'Fabricación de abonos y compuestos inorgánicos nitrogenados' },
  { c: '2013', l: 'Fabricación de plásticos en formas primarias' },
  { c: '2014', l: 'Fabricación de caucho sintético en formas primarias' },
  { c: '2021', l: 'Fabricación de plaguicidas y otros productos químicos de uso agropecuario' },
  { c: '2022', l: 'Fabricación de pinturas, barnices y revestimientos similares, tintas para impresión y masillas' },
  { c: '2023', l: 'Fabricación de jabones y detergentes, preparados para limpiar y pulir; perfumes y preparados de tocador' },
  { c: '2029', l: 'Fabricación de otros productos químicos n.c.p.' },
  { c: '2030', l: 'Fabricación de fibras sintéticas y artificiales' },
  { c: '2100', l: 'Fabricación de productos farmacéuticos, sustancias químicas medicinales y productos botánicos de uso farmacéutico' },
  { c: '2211', l: 'Fabricación de llantas y neumáticos de caucho' },
  { c: '2212', l: 'Reencauche de llantas usadas' },
  { c: '2219', l: 'Fabricación de formas básicas de caucho y otros productos de caucho n.c.p.' },
  { c: '2221', l: 'Fabricación de formas básicas de plástico' },
  { c: '2229', l: 'Fabricación de artículos de plástico n.c.p.' },
  { c: '2310', l: 'Fabricación de vidrio y productos de vidrio' },
  { c: '2391', l: 'Fabricación de productos refractarios' },
  { c: '2392', l: 'Fabricación de materiales de arcilla para la construcción' },
  { c: '2393', l: 'Fabricación de otros productos de cerámica y porcelana' },
  { c: '2394', l: 'Fabricación de cemento, cal y yeso' },
  { c: '2395', l: 'Fabricación de artículos de hormigón, cemento y yeso' },
  { c: '2396', l: 'Corte, tallado y acabado de la piedra' },
  { c: '2399', l: 'Fabricación de otros productos minerales no metálicos n.c.p.' },
  { c: '2410', l: 'Industrias básicas de hierro y de acero' },
  { c: '2421', l: 'Industrias básicas de metales preciosos' },
  { c: '2429', l: 'Industrias básicas de otros metales no ferrosos' },
  { c: '2431', l: 'Fundición de hierro y de acero' },
  { c: '2432', l: 'Fundición de metales no ferrosos' },
  { c: '2511', l: 'Fabricación de productos metálicos para uso estructural' },
  { c: '2512', l: 'Fabricación de tanques, depósitos y recipientes de metal, excepto los utilizados para el envase o transporte de mercancías' },
  { c: '2513', l: 'Fabricación de generadores de vapor, excepto calderas de agua caliente para calefacción central' },
  { c: '2520', l: 'Fabricación de armas y municiones' },
  { c: '2591', l: 'Forja, prensado, estampado y laminado de metal; pulvimetalurgia' },
  { c: '2592', l: 'Tratamiento y revestimiento de metales; mecanizado' },
  { c: '2593', l: 'Fabricación de artículos de cuchillería, herramientas de mano y artículos de ferretería' },
  { c: '2599', l: 'Fabricación de otros productos elaborados de metal n.c.p.' },
  { c: '2610', l: 'Fabricación de componentes y tableros electrónicos' },
  { c: '2620', l: 'Fabricación de computadoras y de equipo periférico' },
  { c: '2630', l: 'Fabricación de equipos de comunicación' },
  { c: '2640', l: 'Fabricación de aparatos electrónicos de consumo' },
  { c: '2651', l: 'Fabricación de equipo de medición, prueba, navegación y control' },
  { c: '2652', l: 'Fabricación de relojes' },
  { c: '2660', l: 'Fabricación de equipo de irradiación y equipo electrónico de uso médico y terapéutico' },
  { c: '2670', l: 'Fabricación de instrumentos ópticos y equipo fotográfico' },
  { c: '2680', l: 'Fabricación de medios magnéticos y ópticos para almacenamiento de datos' },
  { c: '2711', l: 'Fabricación de motores, generadores y transformadores eléctricos' },
  { c: '2712', l: 'Fabricación de aparatos de distribución y control de la energía eléctrica' },
  { c: '2720', l: 'Fabricación de pilas, baterías y acumuladores eléctricos' },
  { c: '2731', l: 'Fabricación de hilos y cables eléctricos y de fibra óptica' },
  { c: '2732', l: 'Fabricación de dispositivos de cableado' },
  { c: '2740', l: 'Fabricación de equipos eléctricos de iluminación' },
  { c: '2750', l: 'Fabricación de aparatos de uso doméstico' },
  { c: '2790', l: 'Fabricación de otros tipos de equipo eléctrico n.c.p.' },
  { c: '2811', l: 'Fabricación de motores, turbinas, y partes para motores de combustión interna' },
  { c: '2812', l: 'Fabricación de equipos de potencia hidráulica y neumática' },
  { c: '2813', l: 'Fabricación de otras bombas, compresores, grifos y válvulas' },
  { c: '2814', l: 'Fabricación de cojinetes, engranajes, trenes de engranajes y piezas de transmisión' },
  { c: '2815', l: 'Fabricación de hornos, hogares y quemadores industriales' },
  { c: '2816', l: 'Fabricación de equipo de elevación y manipulación' },
  { c: '2817', l: 'Fabricación de maquinaria y equipo de oficina (excepto computadoras y equipo periférico)' },
  { c: '2818', l: 'Fabricación de herramientas manuales con motor' },
  { c: '2819', l: 'Fabricación de otros tipos de maquinaria y equipo de uso general n.c.p.' },
  { c: '2821', l: 'Fabricación de maquinaria agropecuaria y forestal' },
  { c: '2822', l: 'Fabricación de máquinas formadoras de metal y de máquinas herramienta' },
  { c: '2823', l: 'Fabricación de maquinaria para la metalurgia' },
  { c: '2824', l: 'Fabricación de maquinaria para explotación de minas y canteras y para obras de construcción' },
  { c: '2825', l: 'Fabricación de maquinaria para la elaboración de alimentos, bebidas y tabaco' },
  { c: '2826', l: 'Fabricación de maquinaria para la elaboración de productos textiles, prendas de vestir y cueros' },
  { c: '2829', l: 'Fabricación de otros tipos de maquinaria y equipo de uso especial n.c.p.' },
  { c: '2910', l: 'Fabricación de vehículos automotores y sus motores' },
  { c: '2920', l: 'Fabricación de carrocerías para vehículos automotores; fabricación de remolques y semirremolques' },
  { c: '2930', l: 'Fabricación de partes, piezas (autopartes) y accesorios (lujos) para vehículos automotores' },
  { c: '3011', l: 'Construcción de barcos y de estructuras flotantes' },
  { c: '3012', l: 'Construcción de embarcaciones de recreo y deporte' },
  { c: '3020', l: 'Fabricación de locomotoras y de material rodante para ferrocarriles' },
  { c: '3030', l: 'Fabricación de aeronaves, naves espaciales y de maquinaria conexa' },
  { c: '3040', l: 'Fabricación de vehículos militares de combate' },
  { c: '3091', l: 'Fabricación de motocicletas' },
  { c: '3092', l: 'Fabricación de bicicletas y de sillas de ruedas para personas con discapacidad' },
  { c: '3099', l: 'Fabricación de otros tipos de equipo de transporte n.c.p.' },
  { c: '3110', l: 'Fabricación de muebles' },
  { c: '3120', l: 'Fabricación de colchones y somieres' },
  { c: '3210', l: 'Fabricación de joyas, bisutería y artículos conexos' },
  { c: '3220', l: 'Fabricación de instrumentos musicales' },
  { c: '3230', l: 'Fabricación de artículos y equipo para la práctica del deporte' },
  { c: '3240', l: 'Fabricación de juegos, juguetes y rompecabezas' },
  { c: '3250', l: 'Fabricación de instrumentos, aparatos y materiales médicos y odontológicos (incluido mobiliario)' },
  { c: '3290', l: 'Otras industrias manufactureras n.c.p.' },
  { c: '3311', l: 'Mantenimiento y reparación especializado de productos elaborados en metal' },
  { c: '3312', l: 'Mantenimiento y reparación especializado de maquinaria y equipo' },
  { c: '3313', l: 'Mantenimiento y reparación especializado de equipo electrónico y óptico' },
  { c: '3314', l: 'Mantenimiento y reparación especializado de equipo eléctrico' },
  { c: '3315', l: 'Mantenimiento y reparación especializado de equipo de transporte, excepto los vehículos automotores, motocicletas y bicicletas' },
  { c: '3319', l: 'Mantenimiento y reparación de otros tipos de equipos y sus componentes n.c.p.' },
  { c: '3320', l: 'Instalación especializada de maquinaria y equipo industrial' },
  { c: '3511', l: 'Generación de energía eléctrica' },
  { c: '3512', l: 'Transmisión de energía eléctrica' },
  { c: '3513', l: 'Distribución de energía eléctrica' },
  { c: '3514', l: 'Comercialización de energía eléctrica' },
  { c: '3520', l: 'Producción de gas; distribución de combustibles gaseosos por tuberías' },
  { c: '3530', l: 'Suministro de vapor y aire acondicionado' },
  { c: '3600', l: 'Captación, tratamiento y distribución de agua' },
  { c: '3700', l: 'Evacuación y tratamiento de aguas residuales' },
  { c: '3811', l: 'Recolección de desechos no peligrosos' },
  { c: '3812', l: 'Recolección de desechos peligrosos' },
  { c: '3821', l: 'Tratamiento y disposición de desechos no peligrosos' },
  { c: '3822', l: 'Tratamiento y disposición de desechos peligrosos' },
  { c: '3830', l: 'Recuperación de materiales' },
  { c: '3900', l: 'Actividades de saneamiento ambiental y otros servicios de gestión de desechos' },
  { c: '4111', l: 'Construcción de edificios residenciales' },
  { c: '4112', l: 'Construcción de edificios no residenciales' },
  { c: '4210', l: 'Construcción de carreteras y vías de ferrocarril' },
  { c: '4220', l: 'Construcción de proyectos de servicio público' },
  { c: '4290', l: 'Construcción de otras obras de ingeniería civil' },
  { c: '4311', l: 'Demolición' },
  { c: '4312', l: 'Preparación del terreno' },
  { c: '4321', l: 'Instalaciones eléctricas' },
  { c: '4322', l: 'Instalaciones de fontanería, calefacción y aire acondicionado' },
  { c: '4329', l: 'Otras instalaciones especializadas' },
  { c: '4330', l: 'Terminación y acabado de edificios y obras de ingeniería civil' },
  { c: '4390', l: 'Otras actividades especializadas para la construcción de edificios y obras de ingeniería civil' },
  { c: '4511', l: 'Comercio de vehículos automotores nuevos' },
  { c: '4512', l: 'Comercio de vehículos automotores usados' },
  { c: '4520', l: 'Mantenimiento y reparación de vehículos automotores' },
  { c: '4530', l: 'Comercio de partes, piezas (autopartes) y accesorios (lujos) para vehículos automotores' },
  { c: '4541', l: 'Comercio de motocicletas y de sus partes, piezas y accesorios' },
  { c: '4542', l: 'Mantenimiento y reparación de motocicletas y de sus partes y piezas' },
  { c: '4610', l: 'Comercio al por mayor a cambio de una retribución o por contrata' },
  { c: '4620', l: 'Comercio al por mayor de materias primas agropecuarias; animales vivos' },
  { c: '4631', l: 'Comercio al por mayor de productos alimenticios' },
  { c: '4632', l: 'Comercio al por mayor de bebidas y tabaco' },
  { c: '4641', l: 'Comercio al por mayor de productos textiles, productos confeccionados para uso doméstico' },
  { c: '4642', l: 'Comercio al por mayor de prendas de vestir' },
  { c: '4643', l: 'Comercio al por mayor de calzado' },
  { c: '4644', l: 'Comercio al por mayor de aparatos y equipo de uso doméstico' },
  { c: '4645', l: 'Comercio al por mayor de productos farmacéuticos, medicinales, cosméticos y de tocador' },
  { c: '4649', l: 'Comercio al por mayor de otros utensilios domésticos n.c.p.' },
  { c: '4651', l: 'Comercio al por mayor de computadores, equipo periférico y programas de informática' },
  { c: '4652', l: 'Comercio al por mayor de equipo, partes y piezas electrónicos y de telecomunicaciones' },
  { c: '4653', l: 'Comercio al por mayor de maquinaria y equipo agropecuarios' },
  { c: '4659', l: 'Comercio al por mayor de otros tipos de maquinaria y equipo n.c.p.' },
  { c: '4661', l: 'Comercio al por mayor de combustibles sólidos, líquidos, gaseosos y productos conexos' },
  { c: '4662', l: 'Comercio al por mayor de metales y productos metalíferos' },
  { c: '4663', l: 'Comercio al por mayor de materiales de construcción, artículos de ferretería, pinturas, productos de vidrio, equipo y materiales de fontanería y calefacción' },
  { c: '4664', l: 'Comercio al por mayor de productos químicos básicos, cauchos y plásticos en formas primarias y productos químicos de uso agropecuario' },
  { c: '4665', l: 'Comercio al por mayor de desperdicios, desechos y chatarra' },
  { c: '4669', l: 'Comercio al por mayor de otros productos n.c.p.' },
  { c: '4690', l: 'Comercio al por mayor no especializado' },
  { c: '4711', l: 'Comercio al por menor en establecimientos no especializados con surtido compuesto principalmente por alimentos, bebidas o tabaco' },
  { c: '4719', l: 'Comercio al por menor en establecimientos no especializados, con surtido compuesto principalmente por productos diferentes de alimentos (víveres en general), bebidas y tabaco' },
  { c: '4721', l: 'Comercio al por menor de productos agrícolas para el consumo en establecimientos especializados' },
  { c: '4722', l: 'Comercio al por menor de leche, productos lácteos y huevos, en establecimientos especializados' },
  { c: '4723', l: 'Comercio al por menor de carnes (incluye aves de corral), productos cárnicos, pescados y productos de mar, en establecimientos especializados' },
  { c: '4724', l: 'Comercio al por menor de bebidas y productos del tabaco, en establecimientos especializados' },
  { c: '4729', l: 'Comercio al por menor de otros productos alimenticios n.c.p., en establecimientos especializados' },
  { c: '4731', l: 'Comercio al por menor de combustible para automotores' },
  { c: '4732', l: 'Comercio al por menor de lubricantes (aceites, grasas), aditivos y productos de limpieza para vehículos automotores' },
  { c: '4741', l: 'Comercio al por menor de computadores, equipos periféricos, programas de informática y equipos de telecomunicaciones en establecimientos especializados' },
  { c: '4742', l: 'Comercio al por menor de equipos y aparatos de sonido y de video, en establecimientos especializados' },
  { c: '4751', l: 'Comercio al por menor de productos textiles en establecimientos especializados' },
  { c: '4752', l: 'Comercio al por menor de artículos de ferretería, pinturas y productos de vidrio en establecimientos especializados' },
  { c: '4753', l: 'Comercio al por menor de tapices, alfombras y cubrimientos para paredes y pisos en establecimientos especializados' },
  { c: '4754', l: 'Comercio al por menor de electrodomésticos y gasodomésticos de uso doméstico, muebles y equipos de iluminación' },
  { c: '4755', l: 'Comercio al por menor de artículos y utensilios de uso doméstico' },
  { c: '4759', l: 'Comercio al por menor de otros artículos domésticos en establecimientos especializados' },
  { c: '4761', l: 'Comercio al por menor de libros, periódicos, materiales y artículos de papelería y escritorio, en establecimientos especializados' },
  { c: '4762', l: 'Comercio al por menor de artículos deportivos, en establecimientos especializados' },
  { c: '4769', l: 'Comercio al por menor de otros artículos culturales y de entretenimiento n.c.p. en establecimientos especializados' },
  { c: '4771', l: 'Comercio al por menor de prendas de vestir y sus accesorios (incluye artículos de piel) en establecimientos especializados' },
  { c: '4772', l: 'Comercio al por menor de todo tipo de calzado y artículos de cuero y sucedáneos del cuero en establecimientos especializados.' },
  { c: '4773', l: 'Comercio al por menor de productos farmacéuticos y medicinales, cosméticos y artículos de tocador en establecimientos especializados' },
  { c: '4774', l: 'Comercio al por menor de otros productos nuevos en establecimientos especializados' },
  { c: '4775', l: 'Comercio al por menor de artículos de segunda mano' },
  { c: '4781', l: 'Comercio al por menor de alimentos, bebidas y tabaco, en puestos de venta móviles' },
  { c: '4782', l: 'Comercio al por menor de productos textiles, prendas de vestir y calzado, en puestos de venta móviles' },
  { c: '4789', l: 'Comercio al por menor de otros productos en puestos de venta móviles' },
  { c: '4791', l: 'Comercio al por menor realizado a través de Internet' },
  { c: '4792', l: 'Comercio al por menor realizado a través de casas de venta o por correo' },
  { c: '4799', l: 'Otros tipos de comercio al por menor no realizado en establecimientos, puestos de venta o mercados.' },
  { c: '4911', l: 'Transporte férreo de pasajeros' },
  { c: '4912', l: 'Transporte férreo de carga' },
  { c: '4921', l: 'Transporte de pasajeros' },
  { c: '4922', l: 'Transporte mixto' },
  { c: '4923', l: 'Transporte de carga por carretera' },
  { c: '4930', l: 'Transporte por tuberías' },
  { c: '5011', l: 'Transporte de pasajeros marítimo y de cabotaje' },
  { c: '5012', l: 'Transporte de carga marítimo y de cabotaje' },
  { c: '5021', l: 'Transporte fluvial de pasajeros' },
  { c: '5022', l: 'Transporte fluvial de carga' },
  { c: '5111', l: 'Transporte aéreo nacional de pasajeros' },
  { c: '5112', l: 'Transporte aéreo internacional de pasajeros' },
  { c: '5121', l: 'Transporte aéreo nacional de carga' },
  { c: '5122', l: 'Transporte aéreo internacional de carga' },
  { c: '5210', l: 'Almacenamiento y depósito' },
  { c: '5221', l: 'Actividades de estaciones, vías y servicios complementarios para el transporte terrestre' },
  { c: '5222', l: 'Actividades de puertos y servicios complementarios para el transporte acuático' },
  { c: '5223', l: 'Actividades de aeropuertos, servicios de navegación aérea y demás actividades conexas al transporte aéreo' },
  { c: '5224', l: 'Manipulación de carga' },
  { c: '5229', l: 'Otras actividades complementarias al transporte' },
  { c: '5310', l: 'Actividades postales nacionales' },
  { c: '5320', l: 'Actividades de mensajería' },
  { c: '5511', l: 'Alojamiento en hoteles' },
  { c: '5512', l: 'Alojamiento en apartahoteles' },
  { c: '5513', l: 'Alojamiento en centros vacacionales' },
  { c: '5514', l: 'Alojamiento rural' },
  { c: '5519', l: 'Otros tipos de alojamientos para visitantes' },
  { c: '5520', l: 'Actividades de zonas de camping y parques para vehículos recreacionales' },
  { c: '5530', l: 'Servicio por horas' },
  { c: '5590', l: 'Otros tipos de alojamiento n.c.p.' },
  { c: '5611', l: 'Expendio a la mesa de comidas preparadas' },
  { c: '5612', l: 'Expendio por autoservicio de comidas preparadas' },
  { c: '5613', l: 'Expendio de comidas preparadas en cafeterías' },
  { c: '5619', l: 'Otros tipos de expendio de comidas preparadas n.c.p.' },
  { c: '5621', l: 'Catering para eventos' },
  { c: '5629', l: 'Actividades de otros servicios de comidas' },
  { c: '5630', l: 'Expendio de bebidas alcohólicas para el consumo dentro del establecimiento' },
  { c: '5811', l: 'Edición de libros' },
  { c: '5812', l: 'Edición de directorios y listas de correo' },
  { c: '5813', l: 'Edición de periódicos, revistas y otras publicaciones periódicas' },
  { c: '5819', l: 'Otros trabajos de edición' },
  { c: '5820', l: 'Edición de programas de informática (software)' },
  { c: '5911', l: 'Actividades de producción de películas cinematográficas, videos, programas, anuncios y comerciales de televisión' },
  { c: '5912', l: 'Actividades de posproducción de películas cinematográficas, videos, programas, anuncios y comerciales de televisión' },
  { c: '5913', l: 'Actividades de distribución de películas cinematográficas, videos, programas, anuncios y comerciales de televisión' },
  { c: '5914', l: 'Actividades de exhibición de películas cinematográficas y videos' },
  { c: '5920', l: 'Actividades de grabación de sonido y edición de música' },
  { c: '6010', l: 'Actividades de programación y transmisión en el servicio de radiodifusión sonora' },
  { c: '6020', l: 'Actividades de programación y transmisión de televisión' },
  { c: '6110', l: 'Actividades de telecomunicaciones alámbricas' },
  { c: '6120', l: 'Actividades de telecomunicaciones inalámbricas' },
  { c: '6130', l: 'Actividades de telecomunicación satelital' },
  { c: '6190', l: 'Otras actividades de telecomunicaciones' },
  { c: '6201', l: 'Actividades de desarrollo de sistemas informáticos (planificación, análisis, diseño, programación, pruebas)' },
  { c: '6202', l: 'Actividades de consultoría informática y actividades de administración de instalaciones informáticas' },
  { c: '6209', l: 'Otras actividades de tecnologías de información y actividades de servicios informáticos' },
  { c: '6311', l: 'Procesamiento de datos, alojamiento (hosting) y actividades relacionadas' },
  { c: '6312', l: 'Portales web' },
  { c: '6391', l: 'Actividades de agencias de noticias' },
  { c: '6399', l: 'Otras actividades de servicio de información n.c.p.' },
  { c: '6411', l: 'Banco Central' },
  { c: '6412', l: 'Bancos comerciales' },
  { c: '6421', l: 'Actividades de las corporaciones financieras' },
  { c: '6422', l: 'Actividades de las compañías de financiamiento' },
  { c: '6423', l: 'Banca de segundo piso' },
  { c: '6424', l: 'Actividades de las cooperativas financieras' },
  { c: '6431', l: 'Fideicomisos, fondos y entidades financieras similares' },
  { c: '6432', l: 'Fondos de cesantías' },
  { c: '6491', l: 'Leasing financiero (arrendamiento financiero)' },
  { c: '6492', l: 'Actividades financieras de fondos de empleados y otras formas asociativas del sector solidario' },
  { c: '6493', l: 'Actividades de compra de cartera o factoring' },
  { c: '6494', l: 'Otras actividades de distribución de fondos' },
  { c: '6495', l: 'Instituciones especiales oficiales' },
  { c: '6496', l: 'Capitalización' },
  { c: '6499', l: 'Otras actividades de servicio financiero, excepto las de seguros y pensiones n.c.p.' },
  { c: '6511', l: 'Seguros generales' },
  { c: '6512', l: 'Seguros de vida' },
  { c: '6513', l: 'Reaseguros' },
  { c: '6514', l: 'Capitalización' },
  { c: '6515', l: 'Seguros de salud' },
  { c: '6521', l: 'Servicios de seguros sociales de salud' },
  { c: '6522', l: 'Servicios de seguros sociales de riesgos laborales' },
  { c: '6523', l: 'Servicios de seguros sociales en riesgos de familia' },
  { c: '6531', l: 'Régimen de prima media con prestación definida (RPM)' },
  { c: '6532', l: 'Régimen de ahorro con solidaridad (RAIS).' },
  { c: '6611', l: 'Administración de mercados financieros' },
  { c: '6612', l: 'Corretaje de valores y de contratos de productos básicos' },
  { c: '6613', l: 'Otras actividades relacionadas con el mercado de valores' },
  { c: '6614', l: 'Actividades de las sociedades de intermediación cambiaria y de servicios financieros especiales' },
  { c: '6615', l: 'Actividades de los profesionales de compra y venta de divisas' },
  { c: '6619', l: 'Otras actividades auxiliares de las actividades de servicios financieros n.c.p.' },
  { c: '6621', l: 'Actividades de agentes y corredores de seguros' },
  { c: '6629', l: 'Evaluación de riesgos y daños, y otras actividades de servicios auxiliares' },
  { c: '6630', l: 'Actividades de administración de fondos' },
  { c: '6810', l: 'Actividades inmobiliarias realizadas con bienes propios o arrendados' },
  { c: '6820', l: 'Actividades inmobiliarias realizadas a cambio de una retribución o por contrata' },
  { c: '6910', l: 'Actividades jurídicas' },
  { c: '6920', l: 'Actividades de contabilidad, teneduría de libros, auditoría financiera y asesoría tributaria' },
  { c: '7010', l: 'Actividades de administración empresarial' },
  { c: '7020', l: 'Actividades de consultoría de gestión' },
  { c: '7110', l: 'Actividades de arquitectura e ingeniería y otras actividades conexas de consultoría técnica' },
  { c: '7111', l: 'Actividades de arquitectura' },
  { c: '7112', l: 'Actividades de ingeniería y otras actividades conexas de consultoría técnica' },
  { c: '7120', l: 'Ensayos y análisis técnicos' },
  { c: '7210', l: 'Investigaciones y desarrollo experimental en el campo de las ciencias naturales y la ingeniería' },
  { c: '7220', l: 'Investigaciones y desarrollo experimental en el campo de las ciencias sociales y las humanidades' },
  { c: '7310', l: 'Publicidad' },
  { c: '7320', l: 'Estudios de mercado y realización de encuestas de opinión pública' },
  { c: '7410', l: 'Actividades especializadas de diseño' },
  { c: '7420', l: 'Actividades de fotografía' },
  { c: '7490', l: 'Otras actividades profesionales, científicas y técnicas n.c.p.' },
  { c: '7500', l: 'Actividades veterinarias' },
  { c: '7710', l: 'Alquiler y arrendamiento de vehículos automotores' },
  { c: '7721', l: 'Alquiler y arrendamiento de equipo recreativo y deportivo' },
  { c: '7722', l: 'Alquiler de videos y discos' },
  { c: '7729', l: 'Alquiler y arrendamiento de otros efectos personales y enseres domésticos n.c.p.' },
  { c: '7730', l: 'Alquiler y arrendamiento de otros tipos de maquinaria, equipo y bienes tangibles n.c.p.' },
  { c: '7740', l: 'Arrendamiento de propiedad intelectual y productos similares, excepto obras protegidas por derechos de autor' },
  { c: '7810', l: 'Actividades de agencias de gestión y colocación de empleo' },
  { c: '7820', l: 'Actividades de empresas de servicios temporales' },
  { c: '7830', l: 'Otras actividades de provisión de talento humano' },
  { c: '7911', l: 'Actividades de las agencias de viaje' },
  { c: '7912', l: 'Actividades de operadores turísticos' },
  { c: '7990', l: 'Otros servicios de reserva y actividades relacionadas' },
  { c: '8010', l: 'Actividades de seguridad privada' },
  { c: '8020', l: 'Actividades de servicios de sistemas de seguridad' },
  { c: '8030', l: 'Actividades de detectives e investigadores privados' },
  { c: '8110', l: 'Actividades combinadas de apoyo a instalaciones' },
  { c: '8121', l: 'Limpieza general interior de edificios' },
  { c: '8129', l: 'Otras actividades de limpieza de edificios e instalaciones industriales' },
  { c: '8130', l: 'Actividades de paisajismo y servicios de mantenimiento conexos' },
  { c: '8211', l: 'Actividades combinadas de servicios administrativos de oficina' },
  { c: '8219', l: 'Fotocopiado, preparación de documentos y otras actividades especializadas de apoyo a oficina' },
  { c: '8220', l: 'Actividades de centros de llamadas (Call center)' },
  { c: '8230', l: 'Organización de convenciones y eventos comerciales' },
  { c: '8291', l: 'Actividades de agencias de cobranza y oficinas de calificación crediticia' },
  { c: '8292', l: 'Actividades de envase y empaque' },
  { c: '8299', l: 'Otras actividades de servicio de apoyo a las empresas n.c.p.' },
  { c: '8411', l: 'Actividades legislativas de la administración pública' },
  { c: '8412', l: 'Actividades ejecutivas de la administración pública' },
  { c: '8413', l: 'Regulación de las actividades de organismos que prestan servicios de salud, educativos, culturales y otros servicios sociales, excepto servicios de seguridad social' },
  { c: '8414', l: 'Actividades reguladoras y facilitadoras de la actividad económica' },
  { c: '8415', l: 'Actividades de los otros órganos de control y otras instituciones' },
  { c: '8421', l: 'Relaciones exteriores' },
  { c: '8422', l: 'Actividades de defensa' },
  { c: '8423', l: 'Orden público y actividades de seguridad' },
  { c: '8424', l: 'Administración de justicia' },
  { c: '8430', l: 'Actividades de planes de seguridad social de afiliación obligatoria' },
  { c: '8511', l: 'Educación de la primera infancia' },
  { c: '8512', l: 'Educación preescolar' },
  { c: '8513', l: 'Educación básica primaria' },
  { c: '8521', l: 'Educación básica secundaria' },
  { c: '8522', l: 'Educación media académica' },
  { c: '8523', l: 'Educación media técnica' },
  { c: '8530', l: 'Establecimientos que combinan diferentes niveles de educación' },
  { c: '8541', l: 'Educación técnica profesional' },
  { c: '8542', l: 'Educación tecnológica' },
  { c: '8543', l: 'Educación de instituciones universitarias o de escuelas tecnológicas' },
  { c: '8544', l: 'Educación de universidades' },
  { c: '8551', l: 'Formación para el trabajo' },
  { c: '8552', l: 'Enseñanza deportiva y recreativa' },
  { c: '8553', l: 'Enseñanza cultural' },
  { c: '8559', l: 'Otros tipos de educación n.c.p.' },
  { c: '8560', l: 'Actividades de apoyo a la educación' },
  { c: '8610', l: 'Actividades de hospitales y clínicas, con internación' },
  { c: '8621', l: 'Actividades de la práctica médica, sin internación' },
  { c: '8622', l: 'Actividades de la práctica odontológica' },
  { c: '8691', l: 'Actividades de apoyo diagnóstico' },
  { c: '8692', l: 'Actividades de apoyo terapéutico' },
  { c: '8699', l: 'Otras actividades de atención de la salud humana' },
  { c: '8710', l: 'Actividades de atención residencial medicalizada de tipo general' },
  { c: '8720', l: 'Actividades de atención residencial, para el cuidado de pacientes con retardo mental, enfermedad mental y consumo de sustancias psicoactivas' },
  { c: '8730', l: 'Actividades de atención en instituciones para el cuidado de personas mayores y/o discapacitadas' },
  { c: '8790', l: 'Otras actividades de atención en instituciones con alojamiento' },
  { c: '8810', l: 'Actividades de asistencia social sin alojamiento para personas mayores y discapacitadas' },
  { c: '8890', l: 'Otras actividades de asistencia social sin alojamiento' },
  { c: '8891', l: 'Actividades de guarderías para niños y niñas' },
  { c: '8899', l: 'Otras actividades de asistencia social n.c.p.' },
  { c: '9001', l: 'Creación literaria' },
  { c: '9002', l: 'Creación musical' },
  { c: '9003', l: 'Creación teatral' },
  { c: '9004', l: 'Creación audiovisual' },
  { c: '9005', l: 'Artes plásticas y visuales' },
  { c: '9006', l: 'Actividades teatrales' },
  { c: '9007', l: 'Actividades de espectáculos musicales en vivo' },
  { c: '9008', l: 'Otras actividades de espectáculos en vivo n.c.p.' },
  { c: '9101', l: 'Actividades de bibliotecas y archivos' },
  { c: '9102', l: 'Actividades y funcionamiento de museos, conservación de edificios y sitios históricos' },
  { c: '9103', l: 'Actividades de jardines botánicos, zoológicos y reservas naturales' },
  { c: '9200', l: 'Actividades de juegos de azar y apuestas' },
  { c: '9311', l: 'Gestión de instalaciones deportivas' },
  { c: '9312', l: 'Actividades de clubes deportivos' },
  { c: '9319', l: 'Otras actividades deportivas' },
  { c: '9321', l: 'Actividades de parques de atracciones y parques temáticos' },
  { c: '9329', l: 'Otras actividades recreativas y de esparcimiento n.c.p.' },
  { c: '9411', l: 'Actividades de asociaciones empresariales y de empleadores' },
  { c: '9412', l: 'Actividades de asociaciones profesionales' },
  { c: '9420', l: 'Actividades de sindicatos de empleados' },
  { c: '9491', l: 'Actividades de asociaciones religiosas' },
  { c: '9492', l: 'Actividades de asociaciones políticas' },
  { c: '9499', l: 'Actividades de otras asociaciones n.c.p.' },
  { c: '9511', l: 'Mantenimiento y reparación de computadores y de equipo periférico' },
  { c: '9512', l: 'Mantenimiento y reparación de equipos de comunicación' },
  { c: '9521', l: 'Mantenimiento y reparación de aparatos electrónicos de consumo' },
  { c: '9522', l: 'Mantenimiento y reparación de aparatos y equipos domésticos y de jardinería' },
  { c: '9523', l: 'Reparación de calzado y artículos de cuero' },
  { c: '9524', l: 'Reparación de muebles y accesorios para el hogar' },
  { c: '9529', l: 'Mantenimiento y reparación de otros efectos personales y enseres domésticos' },
  { c: '9601', l: 'Lavado y limpieza, incluso la limpieza en seco, de productos textiles y de piel' },
  { c: '9602', l: 'Peluquería y otros tratamientos de belleza' },
  { c: '9603', l: 'Pompas fúnebres y actividades relacionadas' },
  { c: '9609', l: 'Otras actividades de servicios personales n.c.p.' },
  { c: '9700', l: 'Actividades de los hogares individuales como empleadores de personal doméstico' },
  { c: '9810', l: 'Actividades no diferenciadas de los hogares individuales como productores de bienes para uso propio' },
  { c: '9820', l: 'Actividades no diferenciadas de los hogares individuales como productores de servicios para uso propio' },
  { c: '9900', l: 'Actividades de organizaciones y entidades extraterritoriales' },
];

const TAX_REGIMES = [
  { code: 'COMUN',        name: 'Responsable de IVA' },
  { code: 'NO_RESP',      name: 'No Responsable de IVA' },
  { code: 'SIMPLIFICADO', name: 'Régimen Simple de Tributación / Simplificado' },
  { code: 'GRAN_CONTR',   name: 'Gran Contribuyente' },
];

const PERSON_TYPES = [
  { code: 'NATURAL',  name: 'Persona Natural' },
  { code: 'JURIDICA', name: 'Persona Jurídica' },
];

const TP_TYPES = [
  { code: 'CLIENTE',     name: 'Cliente' },
  { code: 'PROVEEDOR',   name: 'Proveedor' },
  { code: 'EMPLEADO',    name: 'Empleado' },
  { code: 'PROPIETARIO', name: 'Propietario' },
  { code: 'OTRO',        name: 'Otro' },
];

/* Departamentos de Colombia (DANE) */
/* Departamentos de Colombia — fuente: geodata.js (GEO_DEPTS) */
/* COL_DEPTS mantenido como alias de compatibilidad */
const COL_DEPTS = typeof GEO_DEPTS !== 'undefined' ? GEO_DEPTS : [];

/* Cálculo dígito de verificación DIAN (NIT) */
const _NIT_FACTORS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
function calcDV(nit) {
  const d = String(nit).replace(/\D/g, '');
  if (!d) return '';
  let s = 0;
  for (let i = 0; i < d.length; i++) s += +d[d.length - 1 - i] * _NIT_FACTORS[i];
  const r = s % 11;
  return String(r < 2 ? r : 11 - r);
}

const CROSS_DOC_TYPES = [
  'Factura de Venta','Factura de Compra','Recibo de Caja',
  'Comprobante de Egreso','Nota Crédito','Nota Débito',
  'Orden de Compra','Contrato','Otro',
];

const CROSS_PURPOSES = ['Causar','Recaudar','Reportar Cartera'];

const ROLES = {
  admin:    { label: 'Administrador',  badge: 'badge-orange'  },
  contador: { label: 'Contador',       badge: 'badge-blue'    },
  auxiliar: { label: 'Auxiliar',       badge: 'badge-green'   },
  cajero:   { label: 'Cajero POS',     badge: 'badge-purple'  },
  vendedor: { label: 'Vendedor',       badge: 'badge-teal'    },
  auditor:  { label: 'Auditor',        badge: 'badge-gray'    },
  viewer:   { label: 'Visualizador',   badge: 'badge-gray'    },
  propietario: { label: 'Propietario PH', badge: 'badge-pink' },
};

function roleLabel(role) { return ROLES[role]?.label ?? role; }
function roleBadge(role) {
  return `<span class="badge ${ROLES[role]?.badge ?? 'badge-gray'}">${esc(roleLabel(role))}</span>`;
}

function parseTitleFromFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return 'Reporte';
  const name = filename.toLowerCase();
  if (name.includes('balance_prueba') || name.includes('trial_balance')) return 'Balance de Prueba (Detallado)';
  if (name.includes('auxiliar') || name.includes('auxiliary')) return 'Libro Auxiliar Contable';
  if (name.includes('flujo_caja') || name.includes('cash_flow')) return 'Estado de Flujo de Efectivo';
  if (name.includes('diario') || name.includes('journal')) return 'Libro Diario';
  if (name.includes('estados_financieros') || name.includes('financial')) return 'Estados Financieros';
  if (name.includes('cartera') || name.includes('aging')) return 'Informe de Cartera por Edades';
  if (name.includes('saldos')) return 'Reporte de Saldos de Cuentas';
  if (name.includes('inventario') || name.includes('stock')) return 'Reporte de Inventarios';
  if (name.includes('ventas') || name.includes('sales')) return 'Reporte de Ventas';
  if (name.includes('costos') || name.includes('cost_center')) return 'Reporte de Centros de Costo';
  if (name.includes('tesoreria') || name.includes('treasury')) return 'Informe de Tesorería';

  return filename
    .replace(/^reporte_?|^informe_?/i, '')
    .replace(/_\d{4}-\d{2}-\d{2}.*/g, '')
    .replace(/_/g, ' ')
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase());
}

function parseSubtitlesFromFilename(filename: string): string[] {
  if (!filename || typeof filename !== 'string') return [];
  const subs: string[] = [];
  const rangeMatch = filename.match(/(\d{4}-\d{2}-\d{2})_a_(\d{4}-\d{2}-\d{2})/) || filename.match(/(\d{4}-\d{2}-\d{2})_(\d{4}-\d{2}-\d{2})/);
  if (rangeMatch) {
    subs.push(`Desde: ${rangeMatch[1]}`);
    subs.push(`Hasta: ${rangeMatch[2]}`);
  } else {
    const singleDate = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (singleDate) {
      subs.push(`Corte al: ${singleDate[1]}`);
    }
  }
  return subs;
}

/* ── Exportar a Excel ────────────────────────────────────── */
function exportToExcel(data, headers, filename, options?: any) {
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  html += `<head><meta charset="utf-8"/><style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10pt; }
    th { background-color: #E6E6E6; font-weight: bold; border: 0.5pt solid #CCCCCC; padding: 5px; text-align: left; }
    td { border: 0.5pt solid #E5E7EB; padding: 4px; vertical-align: middle; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .bold { font-weight: bold; }
  </style></head><body><table>`;

  const colCount = Math.max(headers?.length || 1, 3);
  const leftSpan = Math.max(1, Math.floor(colCount * 0.35));
  const centerSpan = Math.max(1, Math.floor(colCount * 0.30));
  const rightSpan = Math.max(1, colCount - leftSpan - centerSpan);

  const optObj = typeof options === 'object' && options !== null
    ? options
    : (typeof filename === 'object' && filename !== null ? filename : {});

  const fnameStr = typeof filename === 'string' ? filename : (typeof options === 'string' ? options : '');

  const pbInst = (window as any).pb || (typeof pb !== 'undefined' ? pb : null);
  const userObj = pbInst?.authStore?.model;
  const userName = optObj.userName || (userObj ? (userObj.name || userObj.email) : null) || sessionStorage.getItem('user_name') || localStorage.getItem('user_name') || 'Usuario';
  const branchName = optObj.branchName || (typeof (window as any).getScopeBranchNameSync === 'function' ? (window as any).getScopeBranchNameSync(optObj.branchId) : null) || (localStorage.getItem('active_branch_id') === 'TODAS' || !localStorage.getItem('active_branch_id') ? 'Todas las sucursales' : localStorage.getItem('active_branch_id'));
  const costCenterName = optObj.costCenterName || (typeof (window as any).getScopeCostCenterNameSync === 'function' ? (window as any).getScopeCostCenterNameSync(optObj.costCenterId) : null) || (localStorage.getItem('active_cost_center_id') === 'TODOS' || !localStorage.getItem('active_cost_center_id') ? 'Todos los centros de costo' : localStorage.getItem('active_cost_center_id'));

  const companyName = optObj.companyName || (window as any).COMPANY_NAME_CACHE || localStorage.getItem('active_company_name') || localStorage.getItem('company_name') || 'DOMESTIKO SAS';
  const companyNit = optObj.companyNit || (window as any).COMPANY_NIT_CACHE || localStorage.getItem('active_company_nit') || localStorage.getItem('company_nit') || '';
  const companyAddress = optObj.companyAddress || (window as any).COMPANY_ADDRESS_CACHE || localStorage.getItem('active_company_address') || localStorage.getItem('company_address') || '';

  const title = optObj.title || parseTitleFromFilename(fnameStr);
  const parsedSubtitles = parseSubtitlesFromFilename(fnameStr);
  const subtitles = Array.isArray(optObj.subtitles) && optObj.subtitles.length ? optObj.subtitles : parsedSubtitles;
  const softwareName = optObj.softwareName || 'GRAVY v2.0';
  const generatedAt = new Date().toLocaleString('es-CO');

  // Encabezado de 3 columnas (Empresa | Título y Filtros | Auditoría y Ámbito)
  html += '<tr>';
  html += `<td colspan="${leftSpan}" style="font-size:11pt;font-weight:bold;color:#0D2137;border:none;padding:2px 4px;vertical-align:top;">${esc(String(companyName).toUpperCase())}</td>`;
  html += `<td colspan="${centerSpan}" style="font-size:12pt;font-weight:bold;color:#0D2137;text-align:center;border:none;padding:2px 4px;vertical-align:top;">${esc(title)}</td>`;
  html += `<td colspan="${rightSpan}" style="font-size:8.5pt;color:#6B7280;text-align:right;border:none;padding:2px 4px;vertical-align:top;">${esc(softwareName)}</td>`;
  html += '</tr>';

  html += '<tr>';
  html += `<td colspan="${leftSpan}" style="font-size:8.5pt;color:#6B7280;border:none;padding:2px 4px;">${companyNit ? (String(companyNit).startsWith('NIT') ? esc(companyNit) : `NIT: ${esc(companyNit)}`) : ''}</td>`;
  html += `<td colspan="${centerSpan}" style="font-size:8.5pt;color:#4B5563;text-align:center;border:none;padding:2px 4px;">${subtitles[0] ? esc(subtitles[0]) : ''}</td>`;
  html += `<td colspan="${rightSpan}" style="font-size:8.5pt;color:#6B7280;text-align:right;border:none;padding:2px 4px;">Usuario: ${esc(userName)}</td>`;
  html += '</tr>';

  html += '<tr>';
  html += `<td colspan="${leftSpan}" style="font-size:8.5pt;color:#6B7280;border:none;padding:2px 4px;">${esc(companyAddress)}</td>`;
  html += `<td colspan="${centerSpan}" style="font-size:8.5pt;color:#4B5563;text-align:center;border:none;padding:2px 4px;">${subtitles[1] ? esc(subtitles[1]) : ''}</td>`;
  html += `<td colspan="${rightSpan}" style="font-size:8.5pt;color:#6B7280;text-align:right;border:none;padding:2px 4px;">Sucursal: ${esc(branchName)}</td>`;
  html += '</tr>';

  html += '<tr>';
  html += `<td colspan="${leftSpan}" style="border:none;"></td>`;
  html += `<td colspan="${centerSpan}" style="font-size:8.5pt;color:#4B5563;text-align:center;border:none;padding:2px 4px;">${subtitles[2] ? esc(subtitles[2]) : ''}</td>`;
  html += `<td colspan="${rightSpan}" style="font-size:8.5pt;color:#6B7280;text-align:right;border:none;padding:2px 4px;">C. Costo: ${esc(costCenterName)}</td>`;
  html += '</tr>';

  html += '<tr>';
  html += `<td colspan="${leftSpan}" style="border:none;"></td>`;
  html += `<td colspan="${centerSpan}" style="font-size:8.5pt;color:#4B5563;text-align:center;border:none;padding:2px 4px;">${subtitles[3] ? esc(subtitles[3]) : ''}</td>`;
  html += `<td colspan="${rightSpan}" style="font-size:8.5pt;color:#6B7280;text-align:right;border:none;padding:2px 4px;">Impreso: ${esc(generatedAt)}</td>`;
  html += '</tr>';

  html += `<tr><td colspan="${colCount}" style="border-bottom:1.5pt solid #CCCCCC;height:4px;padding:0;"></td></tr>`;
  html += `<tr><td colspan="${colCount}" style="border:none;height:8px;"></td></tr>`;

  // Headers
  html += '<tr>';
  headers.forEach(h => {
    html += `<th>${esc(h.label)}</th>`;
  });
  html += '</tr>';

  // Data rows
  data.forEach(row => {
    let isBold = !!row.isBold;
    const firstColKey = headers[0]?.key;
    const firstColVal = String(row[firstColKey] || '').trim();

    if (
      firstColVal.startsWith('Total') ||
      firstColVal.toLowerCase().includes('resultado neto') ||
      firstColVal === 'Activos' ||
      firstColVal === 'Pasivos' ||
      firstColVal === 'Patrimonio' ||
      firstColVal === 'TOTAL GENERAL' ||
      (row.level && Number(row.level) <= 3)
    ) {
      isBold = true;
    }

    html += '<tr>';
    headers.forEach((h, idx) => {
      let val = row[h.key] ?? '';
      let cls = [];
      if (isBold) cls.push('bold');

      let styleAttr = '';
      let isNumericValue = typeof val === 'number';

      if (isNumericValue) {
        cls.push('text-right');
        val = val.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else {
        val = String(val);
        if (h.key === 'nota') cls.push('text-center');
      }

      // If it is the first column and level is present, add padding
      let styleParts = [];
      if (idx === 0 && row.level) {
        const padding = (Number(row.level) - 1) * 15;
        if (padding > 0) {
          styleParts.push(`padding-left: ${padding}px`);
        }
      }

      // Force text format for non-numeric fields in Excel to preserve leading zeros
      if (!isNumericValue) {
        styleParts.push('mso-number-format:\\@');
      }

      if (styleParts.length > 0) {
        styleAttr = ` style="${styleParts.join(';')}"`;
      }

      html += `<td class="${cls.join(' ')}"${styleAttr}>${esc(val)}</td>`;
    });
    html += '</tr>';
  });

  html += '</table></body></html>';

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${todayStr()}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Helpers de formulario ───────────────────────────────── */
function getInputVal(id)   { return ($(`#${id}`)?.value ?? '').trim(); }
function getCheckVal(id)   { return !!$(`#${id}`)?.checked; }
function getSelectVal(id)  { return $(`#${id}`)?.value ?? ''; }
function setInputVal(id, v){ const el = $(`#${id}`); if (el) el.value = v ?? ''; }

// --- VITE MIGRATION GLOBALS ---
(window as any).getCheckVal = getCheckVal;
(window as any)._lineCommentState = _lineCommentState;
(window as any).fmt = fmt;
(window as any).exportToExcel = exportToExcel;
(window as any).getSelectVal = getSelectVal;
(window as any)._fmtCOP = _fmtCOP;
(window as any).esc = esc;
(window as any).$ = $;
(window as any).fmtDate = fmtDate;
(window as any).calcDV = calcDV;
(window as any).nowStr = nowStr;
(window as any).closeModal = closeModal;
(window as any).renderPagination = renderPagination;
(window as any).debounce = debounce;
(window as any).CROSS_PURPOSES = CROSS_PURPOSES;
(window as any).confirmDialog = confirmDialog;
(window as any).DOC_TYPES = DOC_TYPES;
(window as any).LOCAL_DOC_TYPES = LOCAL_DOC_TYPES;
(window as any).DIAN_RESP = DIAN_RESP;
(window as any).DIAN_CIIU = DIAN_CIIU;
(window as any).$$ = $$;
(window as any).CROSS_DOC_TYPES = CROSS_DOC_TYPES;
(window as any).COL_DEPTS = COL_DEPTS;
(window as any).getInputVal = getInputVal;
(window as any).openModal = openModal;
(window as any).TOAST_ICONS = TOAST_ICONS;
(window as any).TAX_REGIMES = TAX_REGIMES;
(window as any).filterTable = filterTable;
(window as any).openLineComment = openLineComment;
(window as any).PERSON_TYPES = PERSON_TYPES;
(window as any)._NIT_FACTORS = _NIT_FACTORS;
(window as any).roleLabel = roleLabel;
(window as any).saveLineComment = saveLineComment;
(window as any).fmtN = fmtN;
(window as any).closeLineComment = closeLineComment;
(window as any).TP_TYPES = TP_TYPES;
(window as any).showToast = showToast;
(window as any).translateText = translateText;
(window as any).setInputVal = setInputVal;
(window as any).ROLES = ROLES;
(window as any).todayStr = todayStr;
(window as any).nowStr = nowStr;
(window as any).getColombiaDateStr = getColombiaDateStr;
(window as any).getColombiaDateTimeStr = getColombiaDateTimeStr;
(window as any).getColombiaFirstDayOfMonth = getColombiaFirstDayOfMonth;
(window as any).getColombiaLastDayOfMonth = getColombiaLastDayOfMonth;
(window as any).fmtDate = fmtDate;
(window as any).roleBadge = roleBadge;
(window as any).parseNum = parseNum;
(window as any)._escDiv = _escDiv;
(window as any)._fmtNum = _fmtNum;

async function showStockBreakdownModal(productId: string, productName: string) {
  (window as any).showToast('Consultando existencias de: ' + productName, 'info');
  try {
    const [stocks, incoming] = await Promise.all([
      (window as any).API.getInventoryStock({ productId }),
      (window as any).API.getIncomingStockForProduct(productId)
    ]);
    
    let overlay = document.getElementById('stock-details-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'stock-details-overlay';
      overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(5,8,20,.6);backdrop-filter:blur(4px);z-index:250;align-items:center;justify-content:center;padding:16px';
      document.body.appendChild(overlay);
    }
    
    let whRowsHtml = '';
    if (!stocks.length) {
      whRowsHtml = `<tr><td colspan="2" class="text-center py-4 text-gray-400 font-medium"><i class="fas fa-warehouse mr-1"></i>Sin inventario en ninguna bodega.</td></tr>`;
    } else {
      whRowsHtml = stocks.map((s: any) => {
        const qty = Number(s.qty_on_hand || 0);
        const qtyClass = qty > 0 ? 'text-green-600 font-bold' : 'text-gray-400';
        return `
          <tr class="border-b" style="border-color:#F3F4F6">
            <td class="py-2.5 px-3 font-semibold text-gray-700">${(window as any).esc(s.expand?.warehouse_id?.name || 'Bodega')}</td>
            <td class="py-2.5 px-3 text-right font-mono text-xs ${qtyClass}">${(window as any).fmtN(qty)}</td>
          </tr>
        `;
      }).join('');
    }

    let transitRowsHtml = '';
    const incomingAvailable = incoming.filter((i: any) => Number(i.qty_available ?? i.qty ?? 0) > 0);
    if (!incomingAvailable.length) {
      transitRowsHtml = `<tr><td colspan="4" class="text-center py-4 text-gray-400 font-medium"><i class="fas fa-ship mr-1"></i>No hay unidades en tránsito.</td></tr>`;
    } else {
      transitRowsHtml = incomingAvailable.map((i: any) => {
        const qty = Number(i.qty_available ?? i.qty ?? 0);
        const eta = i.expand?.import_id?.estimated_arrival ? (window as any).fmtDate(i.expand.import_id.estimated_arrival) : '—';
        const impNumber = i.expand?.import_id?.number || 'IMP';
        const impStatus = i.expand?.import_id?.status === 'transito' ? 'En Tránsito' : 'Nacionalización';
        const badgeClass = i.expand?.import_id?.status === 'transito' ? 'badge-blue' : 'badge-orange';
        return `
          <tr class="border-b text-xs" style="border-color:#F3F4F6">
            <td class="py-2.5 px-3 font-semibold text-gray-700 font-mono">${(window as any).esc(impNumber)}</td>
            <td class="py-2.5 px-3"><span class="badge ${badgeClass} text-[10px] px-1.5 py-0.5 rounded font-bold">${impStatus}</span></td>
            <td class="py-2.5 px-3 text-gray-600 font-semibold">${eta}</td>
            <td class="py-2.5 px-3 text-right font-mono font-bold text-blue-600">${(window as any).fmtN(qty)}</td>
          </tr>
        `;
      }).join('');
    }

    overlay.innerHTML = `
      <div class="anim-slide-up" style="background:#fff;border-radius:20px;width:100%;max-width:680px;box-shadow:0 25px 60px rgba(0,0,0,.22);overflow:hidden">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid #F0F0F0">
          <h4 style="font-weight:800;color:#0D2137;font-size:15px;margin:0"><i class="fas fa-boxes-stacked mr-2" style="color:#1A4B8C"></i>Existencias detalladas: ${(window as any).esc(productName)}</h4>
          <button onclick="document.getElementById('stock-details-overlay').style.display='none'" style="background:none;border:none;font-size:20px;color:#9CA3AF;cursor:pointer"><i class="fas fa-xmark"></i></button>
        </div>
        <div style="padding:24px;max-height:70vh;overflow-y:auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Existencias por Bodega -->
            <div class="border rounded-xl p-3 bg-white" style="border-color:#E5E7EB">
              <h5 class="font-bold mb-2 text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5" style="margin-top:0"><i class="fas fa-warehouse text-blue-600"></i> Físico por Bodega</h5>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead>
                    <tr class="border-b text-gray-400 text-[10px] font-bold uppercase" style="border-color:#E5E7EB">
                      <th class="pb-1.5 px-3">Bodega</th>
                      <th class="pb-1.5 px-3 text-right">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${whRowsHtml}
                  </tbody>
                </table>
              </div>
            </div>
            <!-- Mercancía en Tránsito -->
            <div class="border rounded-xl p-3 bg-white" style="border-color:#E5E7EB">
              <h5 class="font-bold mb-2 text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5" style="margin-top:0"><i class="fas fa-ship text-sky-600"></i> Tránsito (Importaciones)</h5>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead>
                    <tr class="border-b text-gray-400 text-[10px] font-bold uppercase" style="border-color:#E5E7EB">
                      <th class="pb-1.5 px-3">IMP</th>
                      <th class="pb-1.5 px-3">Estado</th>
                      <th class="pb-1.5 px-3">ETA</th>
                      <th class="pb-1.5 px-3 text-right">Cant.</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${transitRowsHtml}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid #F0F0F0;background:#F9FAFB">
          <button class="btn btn-outline" onclick="document.getElementById('stock-details-overlay').style.display='none'">Cerrar</button>
        </div>
      </div>
    `;
    
    overlay.style.display = 'flex';
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al obtener inventario', 'error');
  }
}

(window as any).showStockBreakdownModal = showStockBreakdownModal;

/* ── ORDENAMIENTO DE TABLAS ────────────────────────────────── */
function parseTableValue(text: string): any {
  let s = String(text ?? '').trim();
  if (!s) return '';

  if (s.endsWith('%')) {
    const val = parseFloat(s.replace('%', '').trim());
    return isNaN(val) ? s : val;
  }

  let cleaned = s.replace(/[\$\%\s]/g, '');

  if (/^-?[\d.,]+$/.test(cleaned)) {
    const hasComma = cleaned.includes(',');
    const hasDot = cleaned.includes('.');
    
    if (hasComma && hasDot) {
      cleaned = cleaned.replace(/\./g, '').replace(/,/g, '.');
    } else if (hasComma) {
      cleaned = cleaned.replace(/,/g, '.');
    } else if (hasDot) {
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = cleaned.replace(/\./g, '');
      } else {
        const decimals = parts[1];
        if (decimals.length === 3) {
          cleaned = cleaned.replace(/\./g, '');
        }
      }
    }
    const num = parseFloat(cleaned);
    return isNaN(num) ? s : num;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const parts = s.split('/');
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(s).getTime();
  }

  return s;
}

function sortTableRows(tableElement: HTMLTableElement, columnIndex: number, ascending: boolean) {
  const tbody = tableElement.querySelector('tbody');
  if (!tbody) return;
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const dataRows = rows.filter(row => {
    const cells = row.cells;
    if (!cells || cells.length === 0) return false;
    if (cells[0]?.hasAttribute('colspan')) return false;
    return true;
  });

  if (dataRows.length === 0) return;

  const parsedValues = dataRows.map(row => {
    const cell = row.cells[columnIndex];
    const text = cell ? cell.textContent?.trim() || '' : '';
    return { row, val: parseTableValue(text), text };
  });

  parsedValues.sort((a, b) => {
    let cmp = 0;
    if (typeof a.val === 'number' && typeof b.val === 'number') {
      cmp = a.val - b.val;
    } else {
      cmp = String(a.val).localeCompare(String(b.val), 'es', { sensitivity: 'base', numeric: true });
    }
    return ascending ? cmp : -cmp;
  });

  parsedValues.forEach(item => {
    tbody.appendChild(item.row);
  });
}

function makeTableSortable(table: HTMLTableElement, onSort?: () => void) {
  if (!table) return;
  const thead = table.querySelector('thead');
  if (!thead) return;
  const headers = thead.querySelectorAll('th');

  headers.forEach((th, index) => {
    const cleanText = th.textContent?.trim().toLowerCase() || '';
    if (
      th.classList.contains('no-sort') || 
      cleanText === 'acciones' || 
      cleanText === 'acción' || 
      cleanText === ''
    ) {
      return;
    }

    th.classList.add('sortable-th');

    if (!th.querySelector('.sort-icon')) {
      const icon = document.createElement('i');
      icon.className = 'fas fa-sort text-gray-300 ml-1 text-xs sort-icon';
      th.appendChild(icon);
    }

    (th as any).onclick = () => {
      const currentDir = th.getAttribute('data-sort-dir') || 'none';
      const nextDir = currentDir === 'asc' ? 'desc' : 'asc';

      headers.forEach(h => {
        h.removeAttribute('data-sort-dir');
        const icon = h.querySelector('.sort-icon');
        if (icon) {
          icon.className = 'fas fa-sort text-gray-300 ml-1 text-xs sort-icon';
        }
      });

      th.setAttribute('data-sort-dir', nextDir);
      const icon = th.querySelector('.sort-icon');
      if (icon) {
        icon.className = nextDir === 'asc' 
          ? 'fas fa-sort-up text-blue-600 ml-1 text-xs sort-icon' 
          : 'fas fa-sort-down text-blue-600 ml-1 text-xs sort-icon';
      }

      table.setAttribute('data-sort-col', String(index));
      table.setAttribute('data-sort-dir', nextDir);

      sortTableRows(table, index, nextDir === 'asc');
      if (onSort) onSort();
    };
  });
}

function reapplyTableSort(table: HTMLTableElement) {
  if (!table) return;
  const colStr = table.getAttribute('data-sort-col');
  const dirStr = table.getAttribute('data-sort-dir');
  if (colStr !== null && dirStr !== null) {
    const colIndex = parseInt(colStr, 10);
    const ascending = dirStr === 'asc';
    sortTableRows(table, colIndex, ascending);

    const headers = table.querySelectorAll('thead th');
    headers.forEach((h, index) => {
      const icon = h.querySelector('.sort-icon');
      if (icon) {
        if (index === colIndex) {
          h.setAttribute('data-sort-dir', dirStr);
          icon.className = dirStr === 'asc' 
            ? 'fas fa-sort-up text-blue-600 ml-1 text-xs sort-icon' 
            : 'fas fa-sort-down text-blue-600 ml-1 text-xs sort-icon';
        } else {
          h.removeAttribute('data-sort-dir');
          icon.className = 'fas fa-sort text-gray-300 ml-1 text-xs sort-icon';
        }
      }
    });
  }
}

(window as any).makeTableSortable = makeTableSortable;
(window as any).reapplyTableSort = reapplyTableSort;
(window as any).getPageContainer = getPageContainer;
(window as any).getActivePane = getActivePane;


