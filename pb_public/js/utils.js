/**
 * ContaCO v2.0 — utils.js
 * Funciones utilitarias globales. Sin dependencias externas.
 */

'use strict';

/* ── Selectores ───────────────────────────────────────────── */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ── Sanitización HTML (previene XSS) ────────────────────── */
const _escDiv = document.createElement('div');
function esc(str) {
  _escDiv.textContent = String(str ?? '');
  return _escDiv.innerHTML;
}

/* ── Formato numérico colombiano ─────────────────────────── */
const _fmtCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
const _fmtNum = new Intl.NumberFormat('es-CO');

function fmt(n)   { return _fmtCOP.format(n ?? 0); }
function fmtN(n)  { return _fmtNum.format(n ?? 0); }
function parseNum(s) { return parseFloat(String(s ?? '').replace(/[^0-9.\-]/g, '')) || 0; }

/* ── Fechas ───────────────────────────────────────────────── */
function todayStr() { return new Date().toISOString().slice(0, 10); }
function nowStr()   { return new Date().toISOString().slice(0, 19).replace('T', ' '); }
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
  const t = document.createElement('div');
  t.className = `toast toast-${type} toast-enter`;
  t.innerHTML = `<i class="fas ${TOAST_ICONS[type] ?? TOAST_ICONS.info}"></i><span>${esc(msg)}</span>`;
  container.appendChild(t);
  setTimeout(() => {
    t.style.cssText = 'opacity:0;transform:translateX(100%);transition:all .3s';
    setTimeout(() => t.remove(), 300);
  }, duration);
}

/* ── Modal genérico ───────────────────────────────────────── */
function openModal(title, bodyHtml, footerHtml = '', wide = false) {
  $('#modal-title').innerHTML = title;
  $('#modal-body').innerHTML = bodyHtml;          // bodyHtml ya debe venir con esc() aplicado donde corresponde
  $('#modal-footer').innerHTML = footerHtml;
  $('#modal-box').classList.toggle('wide', wide);
  $('#modal-overlay').classList.add('show');
}

function closeModal() {
  $('#modal-overlay').classList.remove('show');
  $('#modal-body').innerHTML = '';
  $('#modal-footer').innerHTML = '';
}

function confirmDialog(title, message, onConfirm, danger = true) {
  openModal(
    title,
    `<p class="text-sm" style="color:#374151">${esc(message)}</p>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="modal-confirm-btn">Confirmar</button>`
  );
  setTimeout(() => {
    const btn = $('#modal-confirm-btn');
    if (btn) btn.addEventListener('click', () => { closeModal(); onConfirm(); });
  }, 50);
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

const TAX_REGIMES = [
  { code: 'COMUN',       name: 'Régimen Común' },
  { code: 'SIMPLIFICADO',name: 'Régimen Simplificado' },
  { code: 'NO_RESP',     name: 'No Responsable IVA' },
  { code: 'GRAN_CONTR',  name: 'Gran Contribuyente' },
];

const PERSON_TYPES = [
  { code: 'NATURAL',            name: 'Persona Natural' },
  { code: 'JURIDICA',           name: 'Persona Jurídica' },
  { code: 'GRAN_CONTRIBUYENTE', name: 'Gran Contribuyente' },
];

const TP_TYPES = [
  { code: 'CLIENTE',      name: 'Cliente' },
  { code: 'PROVEEDOR',   name: 'Proveedor' },
  { code: 'EMPLEADO',    name: 'Empleado' },
  { code: 'ACREEDOR',    name: 'Acreedor' },
  { code: 'TRANSPORTISTA', name: 'Transportista' },
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
  admin:    { label: 'Administrador',  badge: 'badge-orange' },
  contador: { label: 'Contador',       badge: 'badge-blue'   },
  auxiliar: { label: 'Auxiliar',       badge: 'badge-green'  },
  auditor:  { label: 'Auditor',        badge: 'badge-gray'   },
  viewer:   { label: 'Visualizador',   badge: 'badge-gray'   },
};

function roleLabel(role) { return ROLES[role]?.label ?? role; }
function roleBadge(role) {
  return `<span class="badge ${ROLES[role]?.badge ?? 'badge-gray'}">${esc(roleLabel(role))}</span>`;
}

/* ── Exportar a Excel ────────────────────────────────────── */
function exportToExcel(data, headers, filename) {
  const ws = XLSX.utils.json_to_sheet(data.map(row =>
    Object.fromEntries(headers.map((h, i) => [h.label, row[h.key]]))
  ));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  XLSX.writeFile(wb, `${filename}_${todayStr()}.xlsx`);
}

/* ── Helpers de formulario ───────────────────────────────── */
function getInputVal(id)   { return ($(`#${id}`)?.value ?? '').trim(); }
function getCheckVal(id)   { return !!$(`#${id}`)?.checked; }
function getSelectVal(id)  { return $(`#${id}`)?.value ?? ''; }
function setInputVal(id, v){ const el = $(`#${id}`); if (el) el.value = v ?? ''; }
