/**
 * GRAVY v2.0 — copropiedades.js
 * F8: Módulo de Copropiedades / Propiedad Horizontal.
 * - Gestión de unidades habitacionales
 * - Facturación mensual de conceptos con integración contable
 * - Reservas de zonas comunes
 * - PQRs (Peticiones, Quejas, Reclamos, Sugerencias)
 * - Configuración contable del módulo
 */
'use strict';

// ── Constantes ─────────────────────────────────────────────────────────────
const PH_STATUS = {
  draft:  { label: 'Borrador',       badge: 'badge-orange' },
  posted: { label: 'Contabilizada',  badge: 'badge-green'  },
  paid:   { label: 'Pagada',         badge: 'badge-blue'   },
  voided: { label: 'Anulada',        badge: 'badge-red'    },
};
const PH_RES_STATUS = {
  pending:   { label: 'Pendiente',  badge: 'badge-orange' },
  confirmed: { label: 'Confirmada', badge: 'badge-green'  },
  cancelled: { label: 'Cancelada',  badge: 'badge-red'    },
};
const PH_PQRS_STATUS = {
  open:       { label: 'Abierta',       badge: 'badge-orange' },
  in_process: { label: 'En proceso',    badge: 'badge-blue'   },
  resolved:   { label: 'Resuelta',      badge: 'badge-green'  },
  closed:     { label: 'Cerrada',       badge: 'badge-gray'   },
};
const PH_PQRS_PRIORITY = {
  baja:  { label: 'Baja',  badge: 'badge-gray'   },
  media: { label: 'Media', badge: 'badge-orange' },
  alta:  { label: 'Alta',  badge: 'badge-red'    },
};
const PH_PQRS_TYPES = [
  { value: 'PETICION',    label: 'Petición'     },
  { value: 'QUEJA',       label: 'Queja'        },
  { value: 'RECLAMO',     label: 'Reclamo'      },
  { value: 'SUGERENCIA',  label: 'Sugerencia'   },
  { value: 'FELICITACION',label: 'Felicitación' },
];
const PH_UNIT_TYPES = [
  'APARTAMENTO','PARQUEADERO','DEPOSITO','LOCAL','CASA','OFICINA','OTRO',
];

// ── Helpers locales ─────────────────────────────────────────────────────────
function phKpi(label, value, iconClass, color, bg) {
  return `<div class="rounded-2xl p-4" style="background:${bg}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${iconClass} text-sm" style="color:${color}"></i>
      <span class="text-xs font-semibold" style="color:${color}">${label}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${color}">${value}</p>
  </div>`;
}

// Obtiene el período actual en formato YYYY-MM
function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function fmtPeriod(p) {
  if (!p) return '—';
  const [y, m] = String(p).split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${months[(parseInt(m, 10) || 1) - 1]} ${y}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDER PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
async function renderCopropiedades(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">
    <i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo Copropiedades...</div>`;
  _renderPhPage(c, 'facturacion');
}

function _renderPhPage(c, activeTab) {
  const tabs = [
    { id: 'facturacion', label: 'Facturación',   icon: 'fa-file-invoice-dollar' },
    { id: 'cartera',     label: 'Cartera',       icon: 'fa-chart-line'          },
    { id: 'presupuesto', label: 'Presupuesto',   icon: 'fa-sack-dollar'         },
    { id: 'unidades',    label: 'Unidades',       icon: 'fa-building'            },
    { id: 'reservas',    label: 'Reservas',       icon: 'fa-calendar-check'      },
    { id: 'pqrs',        label: 'PQRs',           icon: 'fa-comments'            },
    { id: 'config',      label: 'Configuración',  icon: 'fa-sliders'             },
  ];

  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-city mr-2" style="color:#7F7CFF"></i>Copropiedades
        </h3>
        <p class="text-sm" style="color:#6B7280">Propiedad Horizontal — Gestión integral de conjuntos residenciales y comerciales.</p>
      </div>
    </div>
    <div class="flex gap-1 mb-5 border-b flex-wrap" style="border-color:#E5E7EB">
      ${tabs.map(t => `
        <button class="tab-btn${t.id === activeTab ? ' active' : ''}" data-tab="${t.id}">
          <i class="fas ${t.icon} mr-2"></i>${t.label}
        </button>`).join('')}
    </div>
    <div id="ph-tab-content"></div>`;

  const tabContent = c.querySelector('#ph-tab-content');

  function switchTab(tabId) {
    c.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    if (tabId === 'facturacion') renderPhFacturacion(tabContent);
    if (tabId === 'cartera')     renderPhCartera(tabContent);
    if (tabId === 'presupuesto') renderPhPresupuesto(tabContent);
    if (tabId === 'unidades')    renderPhUnidades(tabContent);
    if (tabId === 'reservas')    renderPhReservas(tabContent);
    if (tabId === 'pqrs')        renderPhPqrs(tabContent);
    if (tabId === 'config')      renderPhConfig(tabContent);
  }

  c.querySelectorAll('.tab-btn').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab))
  );
  switchTab(activeTab);
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: FACTURACIÓN
// ══════════════════════════════════════════════════════════════════════════════
async function renderPhFacturacion(c) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>`;
  try {
    const period = currentPeriod();
    const safePeriod = pb.escapeFilterValue(period);
    const [invoicesRes, allRes] = await Promise.all([
      API.getPhInvoices({ filter: `period="${safePeriod}"`, perPage: 200 }),
      API.getPhInvoices({ filter: '', perPage: 1 }),
    ]);
    const invoices    = invoicesRes.items || [];
    const totalAll    = allRes.totalItems || 0;
    const posted      = invoices.filter(i => i.status === 'posted').length;
    const paid        = invoices.filter(i => i.status === 'paid').length;
    const draft       = invoices.filter(i => i.status === 'draft').length;
    const totalMonth  = invoices.reduce((s, i) => s + (i.total || 0), 0);

    c.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${phKpi('Facturas del mes', invoices.length,       'fas fa-file-invoice', '#7F7CFF', '#F5F3FF')}
        ${phKpi('Borradores',       draft,                  'fas fa-pen-to-square','#C46516', '#FFF8F0')}
        ${phKpi('Contabilizadas',   posted,                 'fas fa-check-circle', '#059669', '#ECFDF5')}
        ${phKpi('Valor del mes',    fmt(totalMonth),        'fas fa-coins',        '#1A4B8C', '#EEF4FF')}
      </div>

      <!-- Barra de acciones -->
      <div class="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3" style="border-color:#F0F0F0">
        <div>
          <label class="form-label mb-1">Período</label>
          <input id="ph-period-filter" type="month" class="form-input" style="max-width:180px" value="${esc(period)}">
        </div>
        <div class="flex-1"></div>
        ${can('canApprove') ? `
          <button class="btn btn-outline" id="ph-post-period-btn" title="Contabilizar todas las facturas en borrador del período"
            style="color:#059669;border-color:#6EE7B7">
            <i class="fas fa-layer-group"></i> Contabilizar período
          </button>
          <button class="btn btn-outline" id="ph-unpost-period-btn" title="Descontabilizar liquidación del período"
            style="color:#1A4B8C;border-color:#93C5FD">
            <i class="fas fa-rotate-left"></i> Descontabilizar período
          </button>
          <button class="btn btn-outline" id="ph-delete-period-btn" title="Eliminar liquidación del período"
            style="color:#DC2626;border-color:#FECACA">
            <i class="fas fa-trash"></i> Eliminar período
          </button>` : ''}
        ${can('canWrite') ? `
          <button class="btn btn-outline" id="ph-config-btn" title="Configuración Copropiedades" style="color:#7F7CFF;border-color:#7F7CFF">
            <i class="fas fa-cog"></i>
          </button>
          <button class="btn btn-outline" id="ph-bulk-pdf-btn" title="Descargar PDF unificado con todas las facturas del período para impresión masiva" style="color:#1D4ED8;border-color:#93C5FD">
            <i class="fas fa-file-pdf"></i> Imprimir período (PDF)
          </button>
          <button class="btn btn-outline" id="ph-bulk-email-btn" title="Enviar masivo de facturas o estados de cuenta por correo" style="color:#7F7CFF;border-color:#C4B5FD">
            <i class="fas fa-mail-bulk"></i> Enviar masivo
          </button>
          <button class="btn btn-primary" id="ph-gen-btn">
            <i class="fas fa-wand-magic-sparkles"></i> Generar facturas del período
          </button>` : ''}
      </div>

      <!-- Tabla de facturas -->
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">
            Facturas — <span id="ph-period-label">${fmtPeriod(period)}</span>
          </span>
          <input id="ph-inv-search" class="form-input text-sm" placeholder="Buscar unidad..." style="max-width:200px">
        </div>
        <div class="overflow-x-auto">
          <table class="data-table" id="ph-inv-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Unidad</th>
                <th>Propietario</th>
                <th>Período</th>
                <th class="text-right">Total</th>
                <th>Vence</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="ph-inv-tbody">
              ${renderPhInvRows(invoices)}
            </tbody>
          </table>
        </div>
        ${invoices.length === 0 ? `
          <div class="py-12 text-center" style="color:#9CA3AF">
            <i class="fas fa-file-invoice text-3xl mb-3 block"></i>
            No hay facturas para este período. Usa <strong>Generar facturas</strong> para crearlas.
          </div>` : ''}
      </div>`;

    // Filtro por período
    document.getElementById('ph-period-filter')?.addEventListener('change', async (e) => {
      const p = e.target.value;
      if (!p) return;
      document.getElementById('ph-period-label').textContent = fmtPeriod(p);
      const safep = pb.escapeFilterValue(p);
      const res = await API.getPhInvoices({ filter: `period="${safep}"`, perPage: 200 });
      document.getElementById('ph-inv-tbody').innerHTML = renderPhInvRows(res.items || []);
      attachPhInvActions();
      const tbl = document.getElementById('ph-inv-table') as HTMLTableElement;
      if (tbl) (window as any).reapplyTableSort(tbl);
    });

    // Búsqueda
    document.getElementById('ph-inv-search')?.addEventListener('input', debounce(() => {
      const q = (document.getElementById('ph-inv-search')?.value || '').toLowerCase();
      document.querySelectorAll('#ph-inv-table tbody tr').forEach(row => {
        row.style.display = q && !row.textContent.toLowerCase().includes(q) ? 'none' : '';
      });
    }, 150));

    // Generar
    document.getElementById('ph-gen-btn')?.addEventListener('click', () => openPhGenerateModal());
    document.getElementById('ph-bulk-pdf-btn')?.addEventListener('click', () => openPhBulkPdfModal());
    document.getElementById('ph-bulk-email-btn')?.addEventListener('click', () => openPhBulkEmailModal());
    document.getElementById('ph-post-period-btn')?.addEventListener('click', () => openPhPostPeriodModal(c));
    document.getElementById('ph-unpost-period-btn')?.addEventListener('click', () => openPhUnpostPeriodModal(c));
    document.getElementById('ph-delete-period-btn')?.addEventListener('click', () => openPhDeletePeriodModal(c));
    document.getElementById('ph-config-btn')?.addEventListener('click', () => {
      openModal(
        'Configuración Copropiedades',
        `<div id="ph-config-modal-body" style="min-height: 450px;"></div>`,
        `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
        true
      );
      renderPhConfig(document.getElementById('ph-config-modal-body'));
    });

    const tbl = document.getElementById('ph-inv-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);

    attachPhInvActions();
  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function renderPhInvRows(invoices) {
  if (!invoices.length) {
    return `<tr><td colspan="8" class="text-center py-8" style="color:#9CA3AF">Sin registros</td></tr>`;
  }
  return invoices.map(inv => {
    const prop    = inv.expand?.property_id;
    const owner   = prop?.expand?.owner_id || inv.expand?.['property_id.owner_id'];
    const meta    = PH_STATUS[inv.status] || PH_STATUS.draft;
    const isVoid  = inv.status === 'voided';
    return `<tr data-id="${esc(inv.id)}" style="${isVoid ? 'opacity:.55' : ''}">
      <td class="font-mono text-xs">${esc(inv.number)}</td>
      <td>
        <span class="font-semibold" style="color:#0D2137">${esc(prop?.name || prop?.code || inv.property_id)}</span>
        <br><span class="text-xs" style="color:#9CA3AF">${esc(prop?.unit_type || '')}</span>
      </td>
      <td class="text-sm">${esc(owner?.name || '—')}</td>
      <td>${fmtPeriod(inv.period)}</td>
      <td class="text-right font-semibold">${fmt(inv.total || 0)}</td>
      <td class="text-sm">${esc(inv.due_date || '—')}</td>
      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(inv.id)}" title="Ver detalle">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-outline btn-sm ph-inv-download-pdf" data-id="${esc(inv.id)}" title="Descargar PDF (Factura / Cuenta de Cobro)"
            style="color:#DC2626;border-color:#FCA5A5">
            <i class="fas fa-file-pdf"></i>
          </button>
          ${inv.status === 'draft' ? `
            <button class="btn btn-outline btn-sm ph-inv-add-individual" data-id="${esc(inv.id)}" title="Añadir concepto individual"
              style="color:#7F7CFF;border-color:#C4B5FD">
              <i class="fas fa-plus-circle"></i>
            </button>
            <button class="btn btn-sm ph-inv-post" data-id="${esc(inv.id)}" title="Contabilizar"
              style="background:#ECFDF5;color:#059669;border:1.5px solid #6EE7B7">
              <i class="fas fa-check"></i>
            </button>` : ''}
          ${inv.status === 'posted' ? `
            <button class="btn btn-sm ph-inv-paid" data-id="${esc(inv.id)}" title="Marcar pagada"
              style="background:#EEF4FF;color:#2446B8;border:1.5px solid #93C5FD">
              <i class="fas fa-coins"></i>
            </button>` : ''}
          ${(can('canApprove') && (inv.status === 'posted' || inv.status === 'paid')) ? `
            <button class="btn btn-outline btn-sm ph-inv-unpost" data-id="${esc(inv.id)}" title="Descontabilizar factura"
              style="color:#1A4B8C;border-color:#93C5FD">
              <i class="fas fa-rotate-left"></i>
            </button>` : ''}
          ${(inv.status === 'draft' || inv.status === 'posted') ? `
            <button class="btn btn-outline btn-sm ph-inv-void" data-id="${esc(inv.id)}" title="Anular"
              style="color:#DC2626;border-color:#FECACA">
              <i class="fas fa-ban"></i>
            </button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function attachPhInvActions() {
  document.querySelectorAll('.ph-inv-view').forEach(btn => {
    btn.addEventListener('click', () => openPhInvoiceDetail((btn as HTMLElement).dataset.id!));
  });
  document.querySelectorAll('.ph-inv-download-pdf').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPhDownloadPdfModal((btn as HTMLElement).dataset.id!);
    });
  });
  document.querySelectorAll('.ph-inv-add-individual').forEach(btn => {
    btn.addEventListener('click', () => openPhAddIndividualLinesModal(btn.dataset.id));
  });
  document.querySelectorAll('.ph-inv-post').forEach(btn => {
    btn.addEventListener('click', () => postPhInvoiceConfirm(btn.dataset.id, btn));
  });
  document.querySelectorAll('.ph-inv-paid').forEach(btn => {
    btn.addEventListener('click', () => markPhPaidConfirm(btn.dataset.id, btn));
  });
  document.querySelectorAll('.ph-inv-unpost').forEach(btn => {
    btn.addEventListener('click', () => unpostPhInvoiceConfirm(btn.dataset.id, btn));
  });
  document.querySelectorAll('.ph-inv-void').forEach(btn => {
    btn.addEventListener('click', () => voidPhInvoiceModal(btn.dataset.id));
  });
}

function openPhPostPeriodModal(container) {
  const period = document.getElementById('ph-period-filter')?.value || currentPeriod();
  openModal(
    'Contabilizar Liquidación del Período',
    `<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción contabilizará en lote todas las facturas en estado <strong>Borrador</strong> del período <strong>${fmtPeriod(period)}</strong>.
      </p>
      <ul class="text-sm list-disc pl-5" style="color:#6B7280">
        <li>Las facturas ya contabilizadas o pagadas serán omitidas.</li>
        <li>Si alguna factura falla, el proceso continuará con las demás.</li>
      </ul>
      <div class="form-group mb-0">
        <label class="form-label">Confirma escribiendo el período</label>
        <input id="ph-post-period-confirm" class="form-input" placeholder="${esc(period)}">
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-post-period-confirm-btn"><i class="fas fa-layer-group mr-1"></i>Contabilizar</button>`
  );

  setTimeout(() => {
    document.getElementById('ph-post-period-confirm-btn')?.addEventListener('click', async () => {
      const typed = (document.getElementById('ph-post-period-confirm')?.value || '').trim();
      if (typed !== period) {
        showToast(`Debes escribir exactamente ${period}.`, 'warning');
        return;
      }
      const btn = document.getElementById('ph-post-period-confirm-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }
      try {
        const r = await API.postPhInvoicesByPeriod(period);
        showToast(`Período ${period}: ${r.posted} contabilizadas, ${r.skipped} omitidas, ${r.failed} fallidas.`, r.failed ? 'warning' : 'success');
        closeModal();
        renderPhFacturacion(container);
      } catch (err) {
        showToast(err.message || 'Error al contabilizar período.', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-layer-group mr-1"></i>Contabilizar'; }
      }
    }, { once: true });
  }, 50);
}

function openPhUnpostPeriodModal(container) {
  const period = document.getElementById('ph-period-filter')?.value || currentPeriod();
  openModal(
    'Descontabilizar Liquidación del Período',
    `<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción quitará la contabilización de todas las facturas del período <strong>${fmtPeriod(period)}</strong>.
      </p>
      <ul class="text-sm list-disc pl-5" style="color:#6B7280">
        <li>Facturas en estado Contabilizada/Pagada pasarán a Borrador.</li>
        <li>Se eliminarán completamente los comprobantes contables asociados en el módulo de Contabilidad.</li>
      </ul>
      <div class="form-group mb-0">
        <label class="form-label">Confirma escribiendo el período</label>
        <input id="ph-unpost-period-confirm" class="form-input" placeholder="${esc(period)}">
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-unpost-period-confirm-btn"><i class="fas fa-rotate-left mr-1"></i>Descontabilizar</button>`
  );

  setTimeout(() => {
    document.getElementById('ph-unpost-period-confirm-btn')?.addEventListener('click', async () => {
      const typed = (document.getElementById('ph-unpost-period-confirm')?.value || '').trim();
      if (typed !== period) {
        showToast(`Debes escribir exactamente ${period}.`, 'warning');
        return;
      }
      const btn = document.getElementById('ph-unpost-period-confirm-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }
      try {
        const r = await API.unpostPhInvoicesByPeriod(period);
        showToast(`Período ${period}: ${r.reverted} facturas descontabilizadas.`, 'success');
        closeModal();
        renderPhFacturacion(container);
      } catch (err) {
        showToast(err.message || 'Error al descontabilizar período.', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-rotate-left mr-1"></i>Descontabilizar'; }
      }
    }, { once: true });
  }, 50);
}

function openPhDeletePeriodModal(container) {
  const period = document.getElementById('ph-period-filter')?.value || currentPeriod();
  openModal(
    'Eliminar Liquidación del Período',
    `<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Esta acción eliminará todas las facturas del período <strong>${fmtPeriod(period)}</strong>.
      </p>
      <ul class="text-sm list-disc pl-5" style="color:#DC2626">
        <li>Se eliminarán cabeceras y líneas de factura del período.</li>
        <li>Se eliminarán definitivamente los comprobantes contables en el módulo de Contabilidad.</li>
        <li>Esta acción no se puede deshacer.</li>
      </ul>
      <div class="form-group mb-0">
        <label class="form-label">Confirma escribiendo <strong>ELIMINAR ${esc(period)}</strong></label>
        <input id="ph-delete-period-confirm" class="form-input" placeholder="ELIMINAR ${esc(period)}">
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" id="ph-delete-period-confirm-btn"><i class="fas fa-trash mr-1"></i>Eliminar Todo</button>`
  );

  setTimeout(() => {
    document.getElementById('ph-delete-period-confirm-btn')?.addEventListener('click', async () => {
      const typed = (document.getElementById('ph-delete-period-confirm')?.value || '').trim().toUpperCase();
      const expected = `ELIMINAR ${period}`.toUpperCase();
      if (typed !== expected) {
        showToast(`Debes escribir exactamente: ${expected}`, 'warning');
        return;
      }
      const btn = document.getElementById('ph-delete-period-confirm-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Eliminando...'; }
      try {
        const r = await API.deletePhInvoicesByPeriod(period);
        showToast(`Período ${period}: ${r.deleted} facturas eliminadas.`, 'success');
        closeModal();
        renderPhFacturacion(container);
      } catch (err) {
        showToast(err.message || 'Error al eliminar período.', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-trash mr-1"></i>Eliminar Todo'; }
      }
    }, { once: true });
  }, 50);
}

async function openPhGenerateModal() {
  const period = (document.getElementById('ph-period-filter') as HTMLInputElement)?.value || currentPeriod();
  // Calcular fecha de vencimiento (día 10 del siguiente mes)
  const [y, m] = period.split('-').map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  const dueDateDefault = `${nextMonth.replace('-', '-')}10`.replace(/(\d{4})-(\d{2})(\d{2})/, '$1-$2-$3')
    .replace(/(\d{4}-\d{2})(\d{2})/, '$1-$2');

  let warningNoOwner = '';
  try {
    const props = await API.getPhProperties(true);
    const withoutOwner = props.filter(p => !p.owner_id);
    if (withoutOwner.length > 0) {
      warningNoOwner = `<div class="p-3 rounded-xl text-xs bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2">
        <i class="fas fa-triangle-exclamation mt-0.5 text-amber-600"></i>
        <span><strong>Aviso contable:</strong> Hay ${withoutOwner.length} unidad(es) sin propietario asignado (${withoutOwner.slice(0, 3).map(p => esc(p.name || p.code)).join(', ')}${withoutOwner.length > 3 ? '...' : ''}). Podrás generar sus borradores, pero para contabilizarlas contablemente requerirán un propietario con NIT asignado.</span>
      </div>`;
    }
  } catch (_) {}

  openModal(
    'Generar Facturas del Período',
    `<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Se generará una factura en estado <strong>Borrador</strong> para cada unidad activa que no tenga factura en este período.
        Los conceptos y montos se toman de la configuración de <em>Conceptos de Facturación</em>.
      </p>
      ${warningNoOwner}
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group mb-0">
          <label class="form-label">Período</label>
          <input id="ph-gen-period" type="month" class="form-input" value="${esc(period)}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Fecha de Vencimiento</label>
          <input id="ph-gen-due" type="date" class="form-input" value="${esc(period + '-10')}">
        </div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-gen-confirm-btn">
       <i class="fas fa-wand-magic-sparkles"></i> Generar
     </button>`
  );

  setTimeout(() => {
    document.getElementById('ph-gen-confirm-btn')?.addEventListener('click', async () => {
      const p    = document.getElementById('ph-gen-period')?.value;
      const due  = document.getElementById('ph-gen-due')?.value;
      const btn  = document.getElementById('ph-gen-confirm-btn');
      if (!p) { showToast('Selecciona un período.', 'warning'); return; }
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generando...';
      try {
        const count = await API.generatePhInvoices(p, due);
        showToast(`${count} facturas generadas para ${fmtPeriod(p)}.`, 'success');
        closeModal();
        // Actualizar filtro y tabla
        const filterInput = document.getElementById('ph-period-filter');
        if (filterInput) filterInput.value = p;
        const tbody = document.getElementById('ph-inv-tbody');
        if (tbody) {
          const safep = pb.escapeFilterValue(p);
          const res = await API.getPhInvoices({ filter: `period="${safep}"`, perPage: 200 });
          tbody.innerHTML = renderPhInvRows(res.items || []);
          attachPhInvActions();
        }
      } catch (err) {
        showToast(err.message || 'Error al generar facturas.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generar';
      }
    }, { once: true });
  }, 50);
}

async function openPhInvoiceDetail(invoiceId) {
  try {
    const [inv, lines] = await Promise.all([
      pb.get('ph_invoices', invoiceId, { expand: 'property_id,property_id.owner_id,tx_id' }),
      API.getPhInvoiceLines(invoiceId),
    ]);
    const prop  = inv.expand?.property_id;
    const owner = prop?.expand?.owner_id;
    const meta  = PH_STATUS[inv.status] || PH_STATUS.draft;
    const canEditDraftLines = inv.status === 'draft' && (typeof (window as any).can === 'function' ? (window as any).can('canWrite') : true);
    const isLateLine = (line) => {
      const code = String(line?.expand?.concept_id?.code || '').trim().toUpperCase();
      if (code === 'MORA') return true;
      const desc = String(line?.description || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return desc.includes('interes') || desc.includes('mora');
    };
    const isEditableManualLine = (line) => canEditDraftLines && !line?.concept_id && !isLateLine(line);

    openModal(
      `Factura ${inv.number}`,
      `<div class="space-y-4">
        <div class="grid grid-cols-2 gap-3 p-3 rounded-xl" style="background:#F8FAFF">
          <div><p class="text-xs" style="color:#6B7280">Unidad</p><p class="font-bold" style="color:#0D2137">${esc(prop?.name || prop?.code || inv.property_id)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Tipo</p><p class="font-semibold" style="color:#374151">${esc(prop?.unit_type || '—')}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Propietario</p><p class="font-semibold" style="color:#374151">${esc(owner?.name || '—')}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Período</p><p class="font-semibold" style="color:#374151">${fmtPeriod(inv.period)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Fecha</p><p class="font-semibold" style="color:#374151">${esc(inv.date)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Vence</p><p class="font-semibold" style="color:#374151">${esc(inv.due_date || '—')}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Estado</p><span class="badge ${meta.badge}">${meta.label}</span></div>
          ${inv.tx_id ? `<div><p class="text-xs" style="color:#6B7280">Asiento</p><p class="font-mono text-xs" style="color:#374151">${esc(inv.expand?.tx_id?.number || inv.tx_id)}</p></div>` : ''}
        </div>
        <table class="data-table text-sm">
          <thead><tr><th>Concepto</th><th class="text-right">Valor</th>${canEditDraftLines ? '<th>Acciones</th>' : ''}</tr></thead>
          <tbody>
            ${lines.map(l => `<tr>
              <td>${esc(l.description)}</td>
              <td class="text-right font-semibold">${fmt(l.amount || 0)}</td>
              ${canEditDraftLines ? `<td>
                ${isEditableManualLine(l) ? `<div class="flex gap-1">
                  <button class="btn btn-outline btn-sm ph-line-edit" data-line-id="${esc(l.id)}" data-inv-id="${esc(inv.id)}" title="Editar línea"><i class="fas fa-pen"></i></button>
                  <button class="btn btn-outline btn-sm ph-line-del" data-line-id="${esc(l.id)}" data-inv-id="${esc(inv.id)}" title="Eliminar línea" style="color:#DC2626;border-color:#FECACA"><i class="fas fa-trash"></i></button>
                </div>` : '<span class="text-xs" style="color:#9CA3AF">No editable</span>'}
              </td>` : ''}
            </tr>`).join('')}
            <tr style="border-top:2px solid #E5E7EB">
              <td class="font-bold" style="color:#0D2137">TOTAL</td>
              <td class="text-right font-bold text-lg" style="color:#0D2137">${fmt(inv.total || 0)}</td>
              ${canEditDraftLines ? '<td></td>' : ''}
            </tr>
          </tbody>
        </table>
        <div class="p-3.5 rounded-xl border bg-gray-50 flex items-start justify-between gap-3 mt-3" style="border-color:#E5E7EB">
          <div class="flex-1">
            <p class="text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <i class="fas fa-comment-dots text-indigo-500"></i>Comentario / Pie de Factura:
            </p>
            <p class="text-xs text-gray-600 italic whitespace-pre-line" id="ph-inv-detail-note-display">${esc(inv.notes || '— Sin nota individual asignada (usará el comentario configurado en la copropiedad) —')}</p>
          </div>
          ${canEditDraftLines ? `
            <button class="btn btn-outline btn-sm flex-shrink-0" id="ph-edit-inv-note-btn" title="Editar nota de esta factura">
              <i class="fas fa-pen mr-1"></i>Editar nota
            </button>
          ` : ''}
        </div>
      </div>`,
      `<div class="flex flex-wrap gap-2">
        <button class="btn btn-outline" id="ph-inv-detail-download-pdf" style="color:#DC2626;border-color:#FCA5A5"><i class="fas fa-file-pdf mr-1"></i> Descargar PDF</button>
        <button class="btn btn-outline" id="ph-inv-detail-print-inv"><i class="fas fa-print mr-1"></i> Imprimir Factura</button>
        <button class="btn btn-outline" id="ph-inv-detail-print-statement"><i class="fas fa-file-invoice mr-1"></i> Imprimir Estado Cuenta</button>
        <button class="btn btn-primary" id="ph-inv-detail-send-email"><i class="fas fa-envelope mr-1"></i> Enviar Correo</button>
        <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       </div>`
    );

    setTimeout(() => {
      document.getElementById('ph-inv-detail-download-pdf')?.addEventListener('click', () => openPhDownloadPdfModal(invoiceId));
      document.getElementById('ph-inv-detail-print-inv')?.addEventListener('click', () => printPhInvoice(invoiceId, 'invoice'));
      document.getElementById('ph-inv-detail-print-statement')?.addEventListener('click', () => printPhInvoice(invoiceId, 'statement'));
      document.getElementById('ph-inv-detail-send-email')?.addEventListener('click', () => openPhInvoiceEmailModal(invoiceId));

      if (canEditDraftLines) {
        document.getElementById('ph-edit-inv-note-btn')?.addEventListener('click', () => {
          openModal(
            'Editar Pie de Factura',
            `<div class="space-y-3">
               <p class="text-xs text-gray-600">Instrucción o cuentas bancarias para el pie de esta factura:</p>
               <textarea id="ph-modal-edit-note" class="form-input text-xs font-sans" rows="4" style="resize:vertical;">${esc(inv.notes || '')}</textarea>
             </div>`,
            `<button class="btn btn-outline" onclick="openPhInvoiceDetail('${esc(invoiceId)}')">Cancelar</button>
             <button class="btn btn-primary" id="ph-modal-save-note-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`
          );
          setTimeout(() => {
            document.getElementById('ph-modal-save-note-btn')?.addEventListener('click', async () => {
              const newNote = ((document.getElementById('ph-modal-edit-note') as HTMLTextAreaElement)?.value || '').trim();
              try {
                await pb.update('ph_invoices', invoiceId, { notes: newNote });
                showToast('Nota de la factura actualizada.', 'success');
                openPhInvoiceDetail(invoiceId);
              } catch (e: any) {
                showToast(e.message || 'Error al actualizar nota.', 'error');
              }
            });
          }, 50);
        });

        document.querySelectorAll('.ph-line-edit').forEach(btn => {
          btn.addEventListener('click', () => openPhEditDraftLineModal(btn.dataset.lineId, btn.dataset.invId));
        });
        document.querySelectorAll('.ph-line-del').forEach(btn => {
          btn.addEventListener('click', () => removePhDraftLineConfirm(btn.dataset.lineId, btn.dataset.invId));
        });
      }
    }, 40);
  } catch (err) {
    showToast(err.message || 'Error al cargar la factura.', 'error');
  }
}

async function openPhEditDraftLineModal(lineId, invoiceId) {
  let line;
  try {
    line = await pb.get('ph_invoice_lines', lineId);
  } catch (err) {
    showToast('No se pudo cargar la línea.', 'error');
    return;
  }
  openModal(
    'Editar Concepto Manual',
    `<div class="space-y-4">
      <div class="form-group mb-0">
        <label class="form-label">Descripción <span class="text-red-500">*</span></label>
        <input id="ph-line-edit-desc" class="form-input" value="${esc(line.description || '')}">
      </div>
      <div class="form-group mb-0">
        <label class="form-label">Valor <span class="text-red-500">*</span></label>
        <input id="ph-line-edit-amount" type="number" min="0" step="1" class="form-input" value="${esc(line.amount || 0)}">
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="openPhInvoiceDetail('${esc(invoiceId)}')">Cancelar</button>
     <button class="btn btn-primary" id="ph-line-edit-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`
  );

  setTimeout(() => {
    document.getElementById('ph-line-edit-save-btn')?.addEventListener('click', async () => {
      const desc = (document.getElementById('ph-line-edit-desc')?.value || '').trim();
      const amount = parseFloat(document.getElementById('ph-line-edit-amount')?.value || 0) || 0;
      if (!desc || amount <= 0) {
        showToast('Descripción y valor son obligatorios.', 'warning');
        return;
      }
      const btn = document.getElementById('ph-line-edit-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
      try {
        await API.updatePhDraftInvoiceLine(lineId, {
          description: desc,
          amount,
          account_code: line.account_code || '',
        });
        showToast('Línea actualizada.', 'success');
        openPhInvoiceDetail(invoiceId);
      } catch (err) {
        showToast(err.message || 'Error al actualizar línea.', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar'; }
      }
    }, { once: true });
  }, 40);
}

async function removePhDraftLineConfirm(lineId, invoiceId) {
  if (!confirm('¿Eliminar este concepto manual de la factura?')) return;
  try {
    await API.deletePhDraftInvoiceLine(lineId);
    showToast('Línea eliminada.', 'success');
    openPhInvoiceDetail(invoiceId);
  } catch (err) {
    showToast(err.message || 'Error al eliminar línea.', 'error');
  }
}

async function postPhInvoiceConfirm(invoiceId, btn) {
  if (!confirm('¿Contabilizar esta factura? Se generará el asiento contable correspondiente.')) return;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
  try {
    await API.postPhInvoice(invoiceId);
    showToast('Factura contabilizada correctamente.', 'success');
    // Refrescar fila
    const row = document.querySelector(`tr[data-id="${CSS.escape(invoiceId)}"]`);
    if (row) {
      const inv = await pb.get('ph_invoices', invoiceId, { expand: 'property_id,property_id.owner_id' });
      const meta = PH_STATUS[inv.status];
      row.querySelector('td:nth-child(7)').innerHTML = `<span class="badge ${meta.badge}">${meta.label}</span>`;
      row.querySelector('td:nth-child(8)').innerHTML = `
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(inv.id)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-download-pdf" data-id="${esc(inv.id)}" title="Descargar PDF" style="color:#DC2626;border-color:#FCA5A5"><i class="fas fa-file-pdf"></i></button>
          <button class="btn btn-sm ph-inv-paid" data-id="${esc(inv.id)}" title="Marcar pagada"
            style="background:#EEF4FF;color:#2446B8;border:1.5px solid #93C5FD"><i class="fas fa-coins"></i></button>
          ${can('canApprove') ? `<button class="btn btn-outline btn-sm ph-inv-unpost" data-id="${esc(inv.id)}" title="Descontabilizar factura"
            style="color:#1A4B8C;border-color:#93C5FD"><i class="fas fa-rotate-left"></i></button>` : ''}
          <button class="btn btn-outline btn-sm ph-inv-void" data-id="${esc(inv.id)}" title="Anular"
            style="color:#DC2626;border-color:#FECACA"><i class="fas fa-ban"></i></button>
        </div>`;
      attachPhInvActions();
    }
  } catch (err) {
    showToast(err.message || 'Error al contabilizar.', 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i>'; }
  }
}

async function markPhPaidConfirm(invoiceId, btn) {
  if (!confirm('¿Marcar esta factura como pagada?')) return;
  if (btn) { btn.disabled = true; }
  try {
    await API.markPhInvoicePaid(invoiceId);
    showToast('Factura marcada como pagada.', 'success');
    const row = document.querySelector(`tr[data-id="${CSS.escape(invoiceId)}"]`);
    if (row) {
      row.querySelector('td:nth-child(7)').innerHTML = `<span class="badge badge-blue">Pagada</span>`;
      row.querySelector('td:nth-child(8)').innerHTML = `
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(invoiceId)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-download-pdf" data-id="${esc(invoiceId)}" title="Descargar PDF" style="color:#DC2626;border-color:#FCA5A5"><i class="fas fa-file-pdf"></i></button>
          ${can('canApprove') ? `<button class="btn btn-outline btn-sm ph-inv-unpost" data-id="${esc(invoiceId)}" title="Descontabilizar factura"
            style="color:#1A4B8C;border-color:#93C5FD"><i class="fas fa-rotate-left"></i></button>` : ''}
        </div>`;
      attachPhInvActions();
    }
  } catch (err) {
    showToast(err.message || 'Error.', 'error');
    if (btn) btn.disabled = false;
  }
}

async function unpostPhInvoiceConfirm(invoiceId, btn) {
  if (!confirm('¿Descontabilizar esta factura? Volverá a estado Borrador y se eliminará su comprobante contable.')) return;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
  try {
    await API.unpostPhInvoice(invoiceId);
    showToast('Factura descontabilizada correctamente.', 'success');
    const row = document.querySelector(`tr[data-id="${CSS.escape(invoiceId)}"]`);
    if (row) {
      const draftMeta = PH_STATUS.draft || { badge: 'badge-orange', label: 'Borrador' };
      row.style.opacity = '';
      row.querySelector('td:nth-child(7)').innerHTML = `<span class="badge ${draftMeta.badge}">${draftMeta.label}</span>`;
      row.querySelector('td:nth-child(8)').innerHTML = `
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(invoiceId)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-download-pdf" data-id="${esc(invoiceId)}" title="Descargar PDF" style="color:#DC2626;border-color:#FCA5A5"><i class="fas fa-file-pdf"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-add-individual" data-id="${esc(invoiceId)}" title="Añadir concepto individual"
            style="color:#7F7CFF;border-color:#C4B5FD"><i class="fas fa-plus-circle"></i></button>
          <button class="btn btn-sm ph-inv-post" data-id="${esc(invoiceId)}" title="Contabilizar"
            style="background:#ECFDF5;color:#059669;border:1.5px solid #6EE7B7"><i class="fas fa-check"></i></button>
          <button class="btn btn-outline btn-sm ph-inv-void" data-id="${esc(invoiceId)}" title="Anular"
            style="color:#DC2626;border-color:#FECACA"><i class="fas fa-ban"></i></button>
        </div>`;
      attachPhInvActions();
    }
  } catch (err) {
    showToast(err.message || 'Error al descontabilizar factura.', 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-rotate-left"></i>'; }
  }
}

function voidPhInvoiceModal(invoiceId) {
  openModal(
    'Anular Factura PH',
    `<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        <i class="fas fa-triangle-exclamation text-orange-500 mr-1"></i>
        Si la factura está contabilizada, el asiento contable también será anulado.
      </p>
      <div class="form-group mb-0">
        <label class="form-label">Motivo de anulación <span class="text-red-500">*</span></label>
        <textarea id="ph-void-reason" class="form-input" rows="3" placeholder="Describe el motivo..."></textarea>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" id="ph-void-confirm-btn"><i class="fas fa-ban mr-1"></i>Anular</button>`
  );
  setTimeout(() => {
    document.getElementById('ph-void-confirm-btn')?.addEventListener('click', async () => {
      const reason = (document.getElementById('ph-void-reason')?.value || '').trim();
      if (reason.length < 8) { showToast('Indica un motivo de al menos 8 caracteres.', 'warning'); return; }
      const btn = document.getElementById('ph-void-confirm-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Anulando...'; }
      try {
        await API.voidPhInvoice(invoiceId, reason);
        showToast('Factura anulada.', 'success');
        closeModal();
        const row = document.querySelector(`tr[data-id="${CSS.escape(invoiceId)}"]`);
        if (row) {
          row.style.opacity = '.55';
          row.querySelector('td:nth-child(7)').innerHTML = `<span class="badge badge-red">Anulada</span>`;
          row.querySelector('td:nth-child(8)').innerHTML = `
            <div class="flex gap-1">
              <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(invoiceId)}" title="Ver detalle"><i class="fas fa-eye"></i></button>
              <button class="btn btn-outline btn-sm ph-inv-download-pdf" data-id="${esc(invoiceId)}" title="Descargar PDF" style="color:#DC2626;border-color:#FCA5A5"><i class="fas fa-file-pdf"></i></button>
            </div>`;
          attachPhInvActions();
        }
      } catch (err) {
        showToast(err.message || 'Error al anular.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Anular'; }
      }
    }, { once: true });
  }, 50);
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CARTERA POR CONCEPTO
// ══════════════════════════════════════════════════════════════════════════════
async function renderPhCartera(c) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando cartera...</div>`;
  try {
    const properties = await API.getPhProperties(false);

    c.innerHTML = `
      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <div>
            <label class="form-label mb-1">Unidad</label>
            <select id="ph-cartera-unit-filter" class="form-input">
              <option value="">— Todas las unidades —</option>
              ${properties.map(p => `<option value="${esc(p.id)}">${esc(p.code)} - ${esc(p.name)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label mb-1">Fecha de corte</label>
            <input id="ph-cartera-to" type="date" class="form-input">
          </div>
          <div>
            <label class="form-label mb-1">Concepto</label>
            <select id="ph-cartera-concept-filter" class="form-input">
              <option value="">— Todos —</option>
            </select>
          </div>
          <div class="flex items-end">
            <button class="btn btn-primary w-full" id="ph-cartera-refresh-btn">
              <i class="fas fa-sync"></i> Actualizar
            </button>
          </div>
        </div>
      </div>

      <div id="ph-cartera-integrity" class="mb-4"></div>

      <div class="flex gap-1 mb-4 border-b" style="border-color:#E5E7EB">
        <button class="cartera-tab-btn active" data-tab="resumen">
          <i class="fas fa-table mr-2"></i>Saldos Cuentas por Cobrar
        </button>
        <button class="cartera-tab-btn" data-tab="detalle">
          <i class="fas fa-hourglass-half mr-2"></i>Cartera por Edades
        </button>
      </div>

      <div id="ph-cartera-resumen" class="cartera-tab-content">
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
          <div class="px-5 py-3 border-b flex items-center justify-between gap-3" style="border-color:#F0F0F0">
            <span class="font-bold text-sm" style="color:#0D2137">Saldos CxC PH por Unidad y Concepto</span>
            <button class="btn btn-outline btn-sm" id="ph-cartera-pdf-bal" disabled>
              <i class="fas fa-file-pdf"></i> PDF
            </button>
          </div>
          <div id="ph-cartera-bal-meta" class="p-4 border-b text-sm" style="border-color:#F3F4F6;color:#6B7280">
            <i class="fas fa-calendar-days mr-1"></i>Selecciona filtros y pulsa Actualizar.
          </div>
          <div class="overflow-x-auto">
            <table class="data-table" id="ph-cartera-resumen-table">
              <colgroup id="ph-cartera-resumen-colgroup">
                <col style="width:180px">
                <col style="width:230px">
                <col style="width:160px">
              </colgroup>
              <thead id="ph-cartera-resumen-thead">
                <tr>
                  <th>Unidad</th>
                  <th>Propietario / Tercero</th>
                  <th class="text-right">Total general</th>
                </tr>
              </thead>
              <tbody id="ph-cartera-resumen-tbody">
                <tr><td colspan="3" class="text-center py-4" style="color:#9CA3AF">Cargando...</td></tr>
              </tbody>
              <tfoot id="ph-cartera-resumen-tfoot"></tfoot>
            </table>
          </div>
        </div>
      </div>

      <div id="ph-cartera-detalle" class="cartera-tab-content" style="display:none">
        <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
          <div class="px-5 py-3 border-b flex items-center justify-between gap-3" style="border-color:#F0F0F0">
            <span class="font-bold text-sm" style="color:#0D2137">Cartera por Edades PH por Concepto</span>
            <button class="btn btn-outline btn-sm" id="ph-cartera-pdf-aging" disabled>
              <i class="fas fa-file-pdf"></i> PDF
            </button>
          </div>
          <div id="ph-cartera-aging-meta" class="p-4 border-b text-sm" style="border-color:#F3F4F6;color:#6B7280">
            <i class="fas fa-hourglass-half mr-1"></i>Distribución por vencer / 0-30 / 31-60 / 61-90 / más de 90 días.
          </div>
          <div class="overflow-x-auto">
            <table class="data-table" id="ph-cartera-detalle-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Propietario / Tercero</th>
                  <th>Concepto</th>
                  <th class="text-right">Por Vencer</th>
                  <th class="text-right">0-30 días</th>
                  <th class="text-right">31-60 días</th>
                  <th class="text-right">61-90 días</th>
                  <th class="text-right">Más de 90</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody id="ph-cartera-detalle-tbody">
                <tr><td colspan="9" class="text-center py-4" style="color:#9CA3AF">Cargando...</td></tr>
              </tbody>
              <tfoot id="ph-cartera-detalle-tfoot"></tfoot>
            </table>
          </div>
        </div>
      </div>`;

    c.querySelectorAll('.cartera-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        c.querySelectorAll('.cartera-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        const tab = btn.dataset.tab;
        c.querySelectorAll('.cartera-tab-content').forEach(t => t.style.display = 'none');
        c.querySelector(`#ph-cartera-${tab}`).style.display = '';
      });
    });

    let lastBalPdf = null;
    let lastAgingPdf = null;

    function getPhPdfDateStamp() {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${day}`;
    }

    async function exportPhCarteraBalPdf() {
      if (!lastBalPdf?.rows?.length) {
        showToast('No hay datos para exportar en Saldos CxC.', 'warning');
        return;
      }
      const jsPdfCtor = typeof getPdfCtorOrWarn === 'function' ? getPdfCtorOrWarn() : null;
      if (!jsPdfCtor) return;
      try {
        const headerCtx = typeof getPdfHeaderContext === 'function'
          ? await getPdfHeaderContext()
          : {
              companyName: 'GRAVY',
              companyNit: 'N/A',
              companyAddress: '',
              softwareName: 'GRAVY v2.0',
              userName: String(sessionStorage.getItem('user_name') || 'Usuario').trim(),
              generatedAt: new Date().toLocaleString('es-CO'),
            };
        const doc = new jsPdfCtor({ orientation: 'landscape', unit: 'pt', format: 'letter' });
        const unitSel = document.getElementById('ph-cartera-unit-filter');
        const unitLabel = unitSel?.selectedOptions?.[0]?.textContent?.trim() || 'Todas las unidades';
        const fromPeriod = document.getElementById('ph-cartera-from')?.value || '—';
        const toPeriod = document.getElementById('ph-cartera-to')?.value || '—';
        const header = typeof drawPdfHeader === 'function'
          ? drawPdfHeader(doc, headerCtx, {
              title: 'Copropiedades - Saldos CxC por Concepto',
              subtitles: [
                `Unidad: ${unitLabel}`,
                `Periodo: ${fromPeriod} a ${toPeriod}`,
              ],
            })
          : { marginLeft: 24, marginRight: doc.internal.pageSize.getWidth() - 24, startY: 50 };

        const head = [['Unidad', 'Propietario / Tercero', ...lastBalPdf.concepts.map(c => c.label), 'Total general']];
        const body = lastBalPdf.rows.map((r) => {
          const ownerLabel = r.ownerName
            ? (r.ownerDoc ? `${r.ownerName} (${r.ownerDoc})` : r.ownerName)
            : '—';
          return [
            r.unidad,
            ownerLabel,
            ...lastBalPdf.concepts.map((c) => {
              const v = Number(r.byConcept[c.id] || 0);
              return v ? (typeof fmtPdfNum === 'function' ? fmtPdfNum(v) : fmt(v)) : '';
            }),
            typeof fmtPdfNum === 'function' ? fmtPdfNum(r.totalGeneral || 0) : fmt(r.totalGeneral || 0),
          ];
        });
        body.push([
          'TOTAL',
          '',
          ...lastBalPdf.concepts.map((c) => {
            const v = Number(lastBalPdf.totalByConcept[c.id] || 0);
            return v ? (typeof fmtPdfNum === 'function' ? fmtPdfNum(v) : fmt(v)) : '';
          }),
          typeof fmtPdfNum === 'function' ? fmtPdfNum(lastBalPdf.grandTotal || 0) : fmt(lastBalPdf.grandTotal || 0),
        ]);

        doc.autoTable({
          startY: header.startY,
          head,
          body,
          theme: 'plain',
          margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 24 },
          styles: { font: 'helvetica', fontSize: 7, textColor: [55, 55, 55], cellPadding: 2.2, lineWidth: 0 },
          headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 7.2, lineWidth: { bottom: 0.25 } },
          columnStyles: {
            0: { cellWidth: 105, halign: 'left' },
            1: { cellWidth: 135, halign: 'left' },
          },
          didParseCell: (data) => {
            // Alineación contable: a partir de columna 2 (conceptos y total), siempre a la derecha
            // Aplica a 'head', 'body' y 'foot' para que títulos numéricos coincidan con los valores
            if (data.column.index >= 2) {
              data.cell.styles.halign = 'right';
            }
            if (data.section !== 'body') return;
            const isTotal = data.row.index === body.length - 1;
            if (isTotal) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [236, 236, 236];
              data.cell.styles.textColor = [13, 33, 55];
              data.cell.styles.lineWidth = { top: 0.2 };
              data.cell.styles.lineColor = [13, 33, 55];
            }
          },
          didDrawPage: (data) => {
            if (typeof drawPdfFooter === 'function') drawPdfFooter(doc, data.pageNumber);
          },
        });

        doc.save(`ph_saldos_cxc_${getPhPdfDateStamp()}.pdf`);
      } catch (err) {
        showToast(`Error al generar PDF: ${err.message}`, 'error');
      }
    }

    async function exportPhCarteraAgingPdf() {
      if (!lastAgingPdf?.rows?.length) {
        showToast('No hay datos para exportar en Cartera por Edades.', 'warning');
        return;
      }
      const jsPdfCtor = typeof getPdfCtorOrWarn === 'function' ? getPdfCtorOrWarn() : null;
      if (!jsPdfCtor) return;
      try {
        const headerCtx = typeof getPdfHeaderContext === 'function'
          ? await getPdfHeaderContext()
          : {
              companyName: 'GRAVY',
              companyNit: 'N/A',
              companyAddress: '',
              softwareName: 'GRAVY v2.0',
              userName: String(sessionStorage.getItem('user_name') || 'Usuario').trim(),
              generatedAt: new Date().toLocaleString('es-CO'),
            };
        const doc = new jsPdfCtor({ orientation: 'landscape', unit: 'pt', format: 'letter' });
        const unitSel = document.getElementById('ph-cartera-unit-filter');
        const unitLabel = unitSel?.selectedOptions?.[0]?.textContent?.trim() || 'Todas las unidades';
        const fromPeriod = document.getElementById('ph-cartera-from')?.value || '—';
        const toPeriod = document.getElementById('ph-cartera-to')?.value || '—';
        const header = typeof drawPdfHeader === 'function'
          ? drawPdfHeader(doc, headerCtx, {
              title: 'Copropiedades - Cartera por Edades',
              subtitles: [
                `Unidad: ${unitLabel}`,
                `Periodo: ${fromPeriod} a ${toPeriod}`,
              ],
            })
          : { marginLeft: 24, marginRight: doc.internal.pageSize.getWidth() - 24, startY: 50 };

        // Agrupar por unidad y agregar subtotales por unidad en el PDF (sin duplicados)
        const rows = lastAgingPdf.rows;
        const body = [];
        let currentUnidad = null;
        let subtotal = { por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 };
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          if (currentUnidad !== r.unidad) {
            currentUnidad = r.unidad;
            subtotal = { por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 };
          }
          const ownerLabel = r.ownerName
            ? (r.ownerDoc ? `${r.ownerName} (${r.ownerDoc})` : r.ownerName)
            : '—';
          body.push([
            r.unidad,
            ownerLabel,
            r.concepto,
            typeof fmtPdfNum === 'function' ? fmtPdfNum(r.por_vencer || 0) : fmt(r.por_vencer || 0),
            typeof fmtPdfNum === 'function' ? fmtPdfNum(r.de_0_a_30 || 0) : fmt(r.de_0_a_30 || 0),
            typeof fmtPdfNum === 'function' ? fmtPdfNum(r.de_31_a_60 || 0) : fmt(r.de_31_a_60 || 0),
            typeof fmtPdfNum === 'function' ? fmtPdfNum(r.de_61_a_90 || 0) : fmt(r.de_61_a_90 || 0),
            typeof fmtPdfNum === 'function' ? fmtPdfNum(r.mayor_a_90 || 0) : fmt(r.mayor_a_90 || 0),
            typeof fmtPdfNum === 'function' ? fmtPdfNum(r.total || 0) : fmt(r.total || 0),
          ]);
          subtotal.por_vencer += r.por_vencer;
          subtotal.de_0_a_30 += r.de_0_a_30;
          subtotal.de_31_a_60 += r.de_31_a_60;
          subtotal.de_61_a_90 += r.de_61_a_90;
          subtotal.mayor_a_90 += r.mayor_a_90;
          subtotal.total += r.total;
          // Si es el último row o cambia de unidad en el siguiente, agregar subtotal
          const nextUnidad = rows[i + 1]?.unidad;
          if (nextUnidad !== currentUnidad) {
            body.push([
              `Subtotal ${currentUnidad}`, '', '',
              typeof fmtPdfNum === 'function' ? fmtPdfNum(subtotal.por_vencer) : fmt(subtotal.por_vencer),
              typeof fmtPdfNum === 'function' ? fmtPdfNum(subtotal.de_0_a_30) : fmt(subtotal.de_0_a_30),
              typeof fmtPdfNum === 'function' ? fmtPdfNum(subtotal.de_31_a_60) : fmt(subtotal.de_31_a_60),
              typeof fmtPdfNum === 'function' ? fmtPdfNum(subtotal.de_61_a_90) : fmt(subtotal.de_61_a_90),
              typeof fmtPdfNum === 'function' ? fmtPdfNum(subtotal.mayor_a_90) : fmt(subtotal.mayor_a_90),
              typeof fmtPdfNum === 'function' ? fmtPdfNum(subtotal.total) : fmt(subtotal.total),
            ]);
          }
        }
        // Fila total general
        body.push([
          'TOTAL', '', '',
          typeof fmtPdfNum === 'function' ? fmtPdfNum(lastAgingPdf.totals.por_vencer || 0) : fmt(lastAgingPdf.totals.por_vencer || 0),
          typeof fmtPdfNum === 'function' ? fmtPdfNum(lastAgingPdf.totals.de_0_a_30 || 0) : fmt(lastAgingPdf.totals.de_0_a_30 || 0),
          typeof fmtPdfNum === 'function' ? fmtPdfNum(lastAgingPdf.totals.de_31_a_60 || 0) : fmt(lastAgingPdf.totals.de_31_a_60 || 0),
          typeof fmtPdfNum === 'function' ? fmtPdfNum(lastAgingPdf.totals.de_61_a_90 || 0) : fmt(lastAgingPdf.totals.de_61_a_90 || 0),
          typeof fmtPdfNum === 'function' ? fmtPdfNum(lastAgingPdf.totals.mayor_a_90 || 0) : fmt(lastAgingPdf.totals.mayor_a_90 || 0),
          typeof fmtPdfNum === 'function' ? fmtPdfNum(lastAgingPdf.totals.total || 0) : fmt(lastAgingPdf.totals.total || 0),
        ]);

        doc.autoTable({
          startY: header.startY,
          head: [['Unidad', 'Propietario / Tercero', 'Concepto', 'Por Vencer', '0-30', '31-60', '61-90', 'Más de 90', 'Total']],
          body,
          theme: 'plain',
          margin: { top: header.startY, left: header.marginLeft, right: 24, bottom: 24 },
          styles: { font: 'helvetica', fontSize: 7, textColor: [55, 55, 55], cellPadding: 2.4, lineWidth: 0 },
          headStyles: { fillColor: [230, 230, 230], textColor: [13, 33, 55], fontStyle: 'bold', fontSize: 7.2, lineWidth: { bottom: 0.25 } },
          columnStyles: {
            0: { cellWidth: 110, halign: 'left' },
            1: { cellWidth: 144, halign: 'left' },
            2: { cellWidth: 130, halign: 'left' },
            3: { cellWidth: 60, halign: 'right' },
            4: { cellWidth: 60, halign: 'right' },
            5: { cellWidth: 60, halign: 'right' },
            6: { cellWidth: 60, halign: 'right' },
            7: { cellWidth: 60, halign: 'right' },
            8: { cellWidth: 60, halign: 'right' },
          },
          didParseCell: (data) => {
            // Alineación contable: a partir de columna 3 (tramos de mora y total) siempre a la derecha
            // Aplica a 'head', 'body' y 'foot' para que títulos coincidan con las cifras
            if (data.column.index >= 3) {
              data.cell.styles.halign = 'right';
            }
            if (data.section !== 'body') return;
            const isTotal = data.row.index === body.length - 1;
            const isSubtotal = String(data.row.raw[0] || '').startsWith('Subtotal ');
            if (isTotal || isSubtotal) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [236, 236, 236];
              data.cell.styles.textColor = [13, 33, 55];
              data.cell.styles.lineWidth = { top: 0.2 };
              data.cell.styles.lineColor = [13, 33, 55];
            }
          },
          didDrawPage: (data) => {
            if (typeof drawPdfFooter === 'function') drawPdfFooter(doc, data.pageNumber);
          },
        });

        doc.save(`ph_cartera_edades_${getPhPdfDateStamp()}.pdf`);
      } catch (err) {
        showToast(`Error al generar PDF: ${err.message}`, 'error');
      }
    }

    function renderIntegrity(info) {
      const box = document.getElementById('ph-cartera-integrity');
      if (!box) return;
      if (!info) {
        box.innerHTML = '';
        return;
      }
      const tone = info.isBalanced
        ? { bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46', icon: 'fa-circle-check', title: 'Integridad OK' }
        : { bg: '#FFF7ED', border: '#FDBA74', color: '#9A3412', icon: 'fa-triangle-exclamation', title: 'Descuadres detectados' };

      box.innerHTML = `
        <div class="rounded-2xl border p-4" style="background:${tone.bg};border-color:${tone.border}">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div class="font-bold" style="color:${tone.color}">
              <i class="fas ${tone.icon} mr-2"></i>${tone.title}
            </div>
            <div class="text-sm" style="color:${tone.color}">
              Facturas: <strong>${info.totals.invoices}</strong> | Líneas: <strong>${info.totals.lines}</strong>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm" style="color:${tone.color}">
            <div>Total facturas: <strong>${fmt(info.totals.totalFacturas)}</strong></div>
            <div>Total líneas: <strong>${fmt(info.totals.totalLineas)}</strong></div>
            <div>Pendiente: <strong>${fmt(info.totals.totalPendiente)}</strong></div>
            <div>Cancelado: <strong>${fmt(info.totals.totalCancelado)}</strong></div>
            <div>Diferencia global: <strong>${fmt(info.totals.diferenciaGlobal)}</strong></div>
          </div>
          ${info.mismatches.length ? `
            <div class="mt-3 text-sm" style="color:${tone.color}">
              <div class="font-semibold mb-1">Facturas descuadradas (Top ${Math.min(5, info.mismatches.length)}):</div>
              ${info.mismatches.slice(0, 5).map(m =>
                `<div>#${esc(m.number)} (${esc(m.period)}): Factura ${fmt(m.totalFactura)} vs Líneas ${fmt(m.totalLineas)} (dif ${fmt(m.diferencia)})</div>`
              ).join('')}
            </div>` : ''}
        </div>`;
    }

    async function loadCartera() {
      const unitId = document.getElementById('ph-cartera-unit-filter')?.value || '';
      // Eliminar el uso de fromPeriod, solo usar fecha de corte
      const toDate = document.getElementById('ph-cartera-to')?.value || '';
      const conceptId = document.getElementById('ph-cartera-concept-filter')?.value || '';
      const thead = document.getElementById('ph-cartera-resumen-thead');
      const colgroup = document.getElementById('ph-cartera-resumen-colgroup');

      const conceptKey = (label) => String(label || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();

      const norm = (str: string) => String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      const conceptSort = (labelA: string, labelB: string) => {
        const normA = norm(labelA);
        const normB = norm(labelB);

        const isCuotaA = normA.includes('cuota de administracion') || normA.includes('cuota administracion');
        const isCuotaB = normB.includes('cuota de administracion') || normB.includes('cuota administracion');

        const isMoraA = normA.includes('interes de mora') || normA.includes('intereses de mora') || normA.includes('interes mora') || normA.includes('intereses mora');
        const isMoraB = normB.includes('interes de mora') || normB.includes('intereses de mora') || normB.includes('interes mora') || normB.includes('intereses mora');

        if (isCuotaA && !isCuotaB) return -1;
        if (!isCuotaA && isCuotaB) return 1;

        if (isMoraA && !isMoraB) return -1;
        if (!isMoraA && isMoraB) return 1;

        return labelA.localeCompare(labelB, 'es');
      };

      // Pasar solo la fecha de corte como toPeriod, y vacío el fromPeriod
      const openParties = await API.getPhCarteraOpenParties(unitId, '', toDate, {
        conceptoId: conceptId,
        estado: 'all',
      });
      const activeParties = openParties.filter(p => p.estado !== 'cancelado');

      try {
        const [cartera, integrity] = await Promise.all([
          API.getPhCarteraByUnit(unitId, '', toDate),
          API.getPhCarteraIntegrity(unitId, '', toDate),
        ]);
        renderIntegrity(integrity);

        const conceptFilter = document.getElementById('ph-cartera-concept-filter');
        if (conceptFilter) {
          const current = conceptFilter.value;
          conceptFilter.innerHTML = `<option value="">— Todos —</option>${cartera.map(x =>
            `<option value="${esc(x.conceptoId)}">${esc(x.concepto)}</option>`).join('')}`;
          conceptFilter.value = current;
        }

        if (cartera.length === 0 || activeParties.length === 0) {
          if (colgroup) {
            colgroup.innerHTML = `
              <col style="width:180px">
              <col style="width:230px">
              <col style="width:160px">`;
          }
          if (thead) {
            thead.innerHTML = `
            <tr>
              <th>Unidad</th>
              <th>Propietario / Tercero</th>
              <th class="text-right">Total general</th>
            </tr>`;
          }
          document.getElementById('ph-cartera-resumen-tbody').innerHTML = `
            <tr><td colspan="3" class="text-center py-4" style="color:#9CA3AF">No hay saldos abiertos para los filtros seleccionados.</td></tr>`;
          document.getElementById('ph-cartera-resumen-tfoot').innerHTML = '';
          document.getElementById('ph-cartera-bal-meta').innerHTML = `<i class="fas fa-info-circle mr-1"></i>Sin datos de saldo abierto.`;
          lastBalPdf = null;
          const pdfBtn = document.getElementById('ph-cartera-pdf-bal');
          if (pdfBtn) pdfBtn.disabled = true;
        } else {
          const conceptMap = new Map();
          for (const p of activeParties) {
            const cLabel = String(p.concepto || 'Concepto').trim() || 'Concepto';
            const cKey = conceptKey(cLabel);
            if (!conceptMap.has(cKey)) conceptMap.set(cKey, cLabel);
          }
          const concepts = [...conceptMap.entries()]
            .map(([id, label]) => ({ id, label }))
            .sort((a, b) => conceptSort(a.label, b.label));

          const byUnit = new Map();
          for (const p of activeParties) {
            const uLabel = [p.propertyCode, p.propertyName].filter(Boolean).join(' - ') || 'Unidad';
            const unitKey = `${p.propertyId}|${uLabel}`;
            if (!byUnit.has(unitKey)) {
              byUnit.set(unitKey, {
                unidad: uLabel,
                ownerName: p.ownerName || '',
                ownerDoc: p.ownerDoc || '',
                byConcept: {},
                totalGeneral: 0,
                saldoAnticipo: Number(p.saldoAnticipo || 0),
              });
            }
            const row = byUnit.get(unitKey);
            if (!row.ownerName && p.ownerName) {
              row.ownerName = p.ownerName;
              row.ownerDoc = p.ownerDoc || '';
            }
            if (p.saldoAnticipo) {
              row.saldoAnticipo = Math.max(row.saldoAnticipo || 0, Number(p.saldoAnticipo));
            }
            const cKey = conceptKey(p.concepto || 'Concepto');
            row.byConcept[cKey] = (row.byConcept[cKey] || 0) + Number(p.amount || 0);
            row.totalGeneral += Number(p.amount || 0);
          }

          const rows = [...byUnit.values()].sort((a, b) => a.unidad.localeCompare(b.unidad, 'es'));

          const totalByConcept = {};
          let grandTotal = 0;
          let grandAnticipos = 0;
          for (const r of rows) {
            grandTotal += Number(r.totalGeneral || 0);
            grandAnticipos += Number(r.saldoAnticipo || 0);
            for (const c of concepts) {
              totalByConcept[c.id] = (totalByConcept[c.id] || 0) + Number(r.byConcept[c.id] || 0);
            }
          }

          const uniqueDocs = new Set(activeParties.map(p => String(p.invoiceId || ''))).size;

          document.getElementById('ph-cartera-bal-meta').innerHTML =
            `Unidades: <strong>${fmtN(rows.length)}</strong> · Conceptos: <strong>${fmtN(concepts.length)}</strong> · Documentos: <strong>${fmtN(uniqueDocs)}</strong> · Saldo facturado: <strong>${fmt(grandTotal)}</strong>${grandAnticipos > 0 ? ` · Saldo a favor (Anticipos 28): <strong class="text-emerald-700">-${fmt(grandAnticipos)}</strong> · Saldo neto real: <strong class="text-blue-800">${fmt(Math.max(0, grandTotal - grandAnticipos))}</strong>` : ''}`;

          if (colgroup) {
            colgroup.innerHTML = `
              <col style="width:200px">
              <col style="width:230px">
              ${concepts.map(() => '<col style="width:140px">').join('')}
              <col style="width:160px">`;
          }

          if (thead) {
            thead.innerHTML = `
            <tr>
              <th>Unidad</th>
              <th>Propietario / Tercero</th>
              ${concepts.map(c => `<th class="text-right">${esc(c.label)}</th>`).join('')}
              <th class="text-right">Total general</th>
            </tr>`;
          }

          document.getElementById('ph-cartera-resumen-tbody').innerHTML = rows.map(r => {
            const netAmt = Math.max(0, r.totalGeneral - (r.saldoAnticipo || 0));
            return `
            <tr>
              <td class="font-semibold" style="color:#0D2137">${esc(r.unidad)}</td>
              <td>
                <span class="text-sm font-medium" style="color:#374151">${esc(r.ownerName || '—')}</span>
                ${r.ownerDoc ? `<br><span class="text-xs" style="color:#9CA3AF">${esc(r.ownerDoc)}</span>` : ''}
              </td>
              ${concepts.map(c => {
                const v = Number(r.byConcept[c.id] || 0);
                return `<td class="text-right">${v ? fmt(v) : ''}</td>`;
              }).join('')}
              <td class="text-right font-semibold" style="color:#065F46">
                <div>${fmt(r.totalGeneral)}</div>
                ${r.saldoAnticipo > 0 ? `<div class="text-[11px] font-medium text-emerald-700" title="Saldo a favor en cuenta 28">Anticipo: -${fmt(r.saldoAnticipo)}<br><span class="font-bold ${netAmt > 0 ? 'text-amber-800' : 'text-emerald-800'}">Neto: ${fmt(netAmt)}</span></div>` : ''}
              </td>
            </tr>`;
          }).join('');
          document.getElementById('ph-cartera-resumen-tfoot').innerHTML = `
            <tr>
              <td colspan="2" class="font-bold">Total general</td>
              ${concepts.map(c => `<td class="font-bold text-right">${totalByConcept[c.id] ? fmt(totalByConcept[c.id]) : ''}</td>`).join('')}
              <td class="font-bold text-right">${fmt(grandTotal)}</td>
            </tr>`;

          lastBalPdf = { concepts, rows, totalByConcept, grandTotal };
          const pdfBtn = document.getElementById('ph-cartera-pdf-bal');
          if (pdfBtn) pdfBtn.disabled = false;
        }
      } catch (err) {
        console.error(err);
        if (colgroup) {
          colgroup.innerHTML = `
            <col style="width:180px">
            <col style="width:230px">
            <col style="width:160px">`;
        }
        if (thead) {
          thead.innerHTML = `
          <tr>
            <th>Unidad</th>
            <th>Propietario / Tercero</th>
            <th class="text-right">Total general</th>
          </tr>`;
        }
        document.getElementById('ph-cartera-resumen-tbody').innerHTML = `
          <tr><td colspan="3" class="text-center py-4" style="color:#EF4444">${esc(err.message)}</td></tr>`;
        document.getElementById('ph-cartera-resumen-tfoot').innerHTML = '';
        renderIntegrity(null);
        lastBalPdf = null;
        const pdfBtn = document.getElementById('ph-cartera-pdf-bal');
        if (pdfBtn) pdfBtn.disabled = true;
      }

      try {
        if (activeParties.length === 0) {
          document.getElementById('ph-cartera-detalle-tbody').innerHTML = `
            <tr><td colspan="9" class="text-center py-4" style="color:#9CA3AF">No hay cartera abierta para los filtros seleccionados.</td></tr>`;
          document.getElementById('ph-cartera-detalle-tfoot').innerHTML = '';
          document.getElementById('ph-cartera-aging-meta').innerHTML = `<i class="fas fa-info-circle mr-1"></i>Sin datos de cartera por edades.`;
          lastAgingPdf = null;
          const pdfBtn = document.getElementById('ph-cartera-pdf-aging');
          if (pdfBtn) pdfBtn.disabled = true;
        } else {
          const bucketize = (days) => {
            const d = Number(days || 0);
            if (d < 0) return 'por_vencer';
            if (d <= 30) return 'b0_30';
            if (d <= 60) return 'b31_60';
            if (d <= 90) return 'b61_90';
            return 'b90p';
          };

          // Group by unit and concept, aggregate buckets
          const grouped = {};
          for (const p of activeParties) {
            const bucket = bucketize(p.diasMoraRaw !== undefined ? p.diasMoraRaw : p.diasMora);
            const amount = Number(p.amount || 0);
            const uLabel = [p.propertyCode, p.propertyName].filter(Boolean).join(' - ') || 'Unidad';
            const concept = p.concepto || 'Concepto';
            if (!grouped[uLabel]) grouped[uLabel] = {};
            if (!grouped[uLabel][concept]) {
              grouped[uLabel][concept] = {
                unidad: uLabel,
                ownerName: p.ownerName || '',
                ownerDoc: p.ownerDoc || '',
                concepto: concept,
                por_vencer: 0,
                de_0_a_30: 0,
                de_31_a_60: 0,
                de_61_a_90: 0,
                mayor_a_90: 0,
                total: 0,
              };
            }
            const row = grouped[uLabel][concept];
            if (!row.ownerName && p.ownerName) {
              row.ownerName = p.ownerName;
              row.ownerDoc = p.ownerDoc || '';
            }
            if (bucket === 'por_vencer') row.por_vencer += amount;
            else if (bucket === 'b0_30') row.de_0_a_30 += amount;
            else if (bucket === 'b31_60') row.de_31_a_60 += amount;
            else if (bucket === 'b61_90') row.de_61_a_90 += amount;
            else if (bucket === 'b90p') row.mayor_a_90 += amount;
            row.total += amount;
          }

          // Prepare rows for rendering and PDF
          const allRows = [];
          const bodyRows = [];
          let totals = { por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 };
          Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'es')).forEach(unidad => {
            const concepts = grouped[unidad];
            // Subtotal accumulator for this unit
            let subtotal = { por_vencer: 0, de_0_a_30: 0, de_31_a_60: 0, de_61_a_90: 0, mayor_a_90: 0, total: 0 };
            bodyRows.push(`<tr style="background:#F0F4F8">
              <td colspan="9" style="font-weight:600;padding:5px 10px;font-size:12px;color:#0D2137;border-top:1px solid #D1D5DB">
                <i class="fas fa-building mr-1" style="color:#E87D1E"></i>${esc(unidad)}
              </td>
            </tr>`);
            Object.keys(concepts).sort(conceptSort).forEach(concepto => {
              const r = concepts[concepto];
              bodyRows.push(`<tr>
                <td class="font-semibold" style="color:#0D2137">${esc(r.unidad)}</td>
                <td>
                  <span class="text-sm font-medium" style="color:#374151">${esc(r.ownerName || '—')}</span>
                  ${r.ownerDoc ? `<br><span class="text-xs" style="color:#9CA3AF">${esc(r.ownerDoc)}</span>` : ''}
                </td>
                <td>${esc(r.concepto)}</td>
                <td class="text-right" style="color:#059669">${fmt(r.por_vencer)}</td>
                <td class="text-right">${fmt(r.de_0_a_30)}</td>
                <td class="text-right">${fmt(r.de_31_a_60)}</td>
                <td class="text-right">${fmt(r.de_61_a_90)}</td>
                <td class="text-right font-semibold">${fmt(r.mayor_a_90)}</td>
                <td class="text-right font-semibold" style="color:#0D2137">${fmt(r.total)}</td>
              </tr>`);
              // For PDF
              allRows.push({ ...r });
              // Subtotal
              subtotal.por_vencer += r.por_vencer;
              subtotal.de_0_a_30 += r.de_0_a_30;
              subtotal.de_31_a_60 += r.de_31_a_60;
              subtotal.de_61_a_90 += r.de_61_a_90;
              subtotal.mayor_a_90 += r.mayor_a_90;
              subtotal.total += r.total;
            });
            // Subtotal row
            bodyRows.push(`<tr style="background:#FDF6E3">
              <td colspan="3" class="font-bold">Subtotal ${esc(unidad)}</td>
              <td class="font-bold text-right" style="color:#059669">${fmt(subtotal.por_vencer)}</td>
              <td class="font-bold text-right">${fmt(subtotal.de_0_a_30)}</td>
              <td class="font-bold text-right">${fmt(subtotal.de_31_a_60)}</td>
              <td class="font-bold text-right">${fmt(subtotal.de_61_a_90)}</td>
              <td class="font-bold text-right">${fmt(subtotal.mayor_a_90)}</td>
              <td class="font-bold text-right">${fmt(subtotal.total)}</td>
            </tr>`);
            // Add to global totals
            totals.por_vencer += subtotal.por_vencer;
            totals.de_0_a_30 += subtotal.de_0_a_30;
            totals.de_31_a_60 += subtotal.de_31_a_60;
            totals.de_61_a_90 += subtotal.de_61_a_90;
            totals.mayor_a_90 += subtotal.mayor_a_90;
            totals.total += subtotal.total;
          });

          document.getElementById('ph-cartera-aging-meta').innerHTML =
            `Unidades: <strong>${Object.keys(grouped).length}</strong> · Total: <strong>${fmt(totals.total)}</strong>`;

          document.getElementById('ph-cartera-detalle-tbody').innerHTML = bodyRows.join('');
          document.getElementById('ph-cartera-detalle-tfoot').innerHTML = `
            <tr>
              <td colspan="3" class="font-bold">Total general</td>
              <td class="font-bold text-right" style="color:#059669">${fmt(totals.por_vencer)}</td>
              <td class="font-bold text-right">${fmt(totals.de_0_a_30)}</td>
              <td class="font-bold text-right">${fmt(totals.de_31_a_60)}</td>
              <td class="font-bold text-right">${fmt(totals.de_61_a_90)}</td>
              <td class="font-bold text-right">${fmt(totals.mayor_a_90)}</td>
              <td class="font-bold text-right">${fmt(totals.total)}</td>
            </tr>`;

          lastAgingPdf = { rows: allRows, totals };
          const pdfBtn = document.getElementById('ph-cartera-pdf-aging');
          if (pdfBtn) pdfBtn.disabled = false;
        }
      } catch (err) {
        console.error(err);
        document.getElementById('ph-cartera-detalle-tbody').innerHTML = `
          <tr><td colspan="9" class="text-center py-4" style="color:#EF4444">${esc(err.message)}</td></tr>`;
        document.getElementById('ph-cartera-detalle-tfoot').innerHTML = '';
        lastAgingPdf = null;
        const pdfBtn = document.getElementById('ph-cartera-pdf-aging');
        if (pdfBtn) pdfBtn.disabled = true;
      }
    }

    document.getElementById('ph-cartera-refresh-btn')?.addEventListener('click', loadCartera);
    document.getElementById('ph-cartera-pdf-bal')?.addEventListener('click', exportPhCarteraBalPdf);
    document.getElementById('ph-cartera-pdf-aging')?.addEventListener('click', exportPhCarteraAgingPdf);
    // No ejecutar loadCartera automáticamente ni al cambiar filtros, solo con el botón Actualizar

  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: UNIDADES HABITACIONALES
// ══════════════════════════════════════════════════════════════════════════════
async function renderPhUnidades(c) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>`;
  try {
    const properties = await API.getPhProperties(false);
    const canEditUnits = can('canWrite');
    const active   = properties.filter(p => p.active !== false).length;
    const inactive = properties.length - active;

    c.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        ${phKpi('Total unidades',  properties.length, 'fas fa-building',    '#7F7CFF', '#F5F3FF')}
        ${phKpi('Activas',         active,             'fas fa-check-circle','#059669', '#ECFDF5')}
        ${phKpi('Inactivas',       inactive,           'fas fa-pause-circle','#C46516', '#FFF8F0')}
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">Unidades Habitacionales</span>
          <div class="flex gap-2">
            <input id="ph-unit-search" class="form-input text-sm" placeholder="Buscar..." style="max-width:200px">
            ${canEditUnits ? `
            <button class="btn btn-primary btn-sm" id="ph-unit-add-btn">
              <i class="fas fa-plus mr-1"></i>Nueva Unidad
            </button>` : ''}
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table" id="ph-unidades-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Apartamento</th>
                <th>Coef. %</th>
                <th>Cuota Admin.</th>
                <th>F. Entrega</th>
                <th>Propietario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="ph-units-tbody">
              ${renderPhUnitRows(properties, canEditUnits)}
            </tbody>
          </table>
        </div>
      </div>`;

    document.getElementById('ph-unit-search')?.addEventListener('input', debounce(() => {
      const q = (document.getElementById('ph-unit-search')?.value || '').toLowerCase();
      document.querySelectorAll('#ph-units-tbody tr').forEach(row => {
        row.style.display = q && !row.textContent.toLowerCase().includes(q) ? 'none' : '';
      });
    }, 150));

    document.getElementById('ph-unit-add-btn')?.addEventListener('click', () => openPhUnitModal(null, c));

    if (canEditUnits) {
      c.querySelectorAll('.ph-unit-edit').forEach(btn => {
        btn.addEventListener('click', () => openPhUnitModal(btn.dataset.id, c));
      });
      c.querySelectorAll('.ph-unit-toggle').forEach(btn => {
        btn.addEventListener('click', () => togglePhUnit(btn.dataset.id, btn.dataset.active === 'true', c));
      });
    }

    const tbl = document.getElementById('ph-unidades-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);
  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

function renderPhUnitRows(properties, canEditUnits = can('canWrite')) {
  if (!properties.length) {
    return `<tr><td colspan="10" class="text-center py-10" style="color:#9CA3AF">No hay unidades registradas.</td></tr>`;
  }
  return properties.map(p => {
    const owner   = p.expand?.owner_id;
    const active  = p.active !== false;
    const dDate   = p.delivery_date ? String(p.delivery_date).slice(0, 10) : '';
    return `<tr>
      <td class="font-mono text-xs font-bold">${esc(p.code)}</td>
      <td class="font-semibold" style="color:#0D2137">${esc(p.name)}</td>
      <td><span class="badge badge-gray">${esc(p.unit_type || '—')}</span></td>
      <td class="text-sm font-semibold">${esc(p.apartment || '—')}</td>
      <td class="text-sm text-right">${p.coef_participacion ? fmtN(p.coef_participacion) + '%' : '—'}</td>
      <td class="text-sm text-right font-semibold" style="color:#E87D1E">${p.admin_fee ? fmt(p.admin_fee) : '—'}</td>
      <td class="text-xs text-center">${dDate ? `<span class="badge badge-blue" title="Fecha de entrega material">${esc(dDate)}</span>` : '<span class="text-gray-400">—</span>'}</td>
      <td class="text-sm">${esc(owner?.name || '—')}</td>
      <td><span class="badge ${active ? 'badge-green' : 'badge-gray'}">${active ? 'Activa' : 'Inactiva'}</span></td>
      <td>
        ${canEditUnits ? `<div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-unit-edit" data-id="${esc(p.id)}" title="Editar">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-outline btn-sm ph-unit-toggle" data-id="${esc(p.id)}"
            data-active="${active}" title="${active ? 'Desactivar' : 'Activar'}"
            style="${active ? 'color:#DC2626;border-color:#FECACA' : 'color:#059669;border-color:#6EE7B7'}">
            <i class="fas ${active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
          </button>
        </div>` : `<span class="text-xs" style="color:#9CA3AF">Solo lectura</span>`}
      </td>
    </tr>`;
  }).join('');
}

async function openPhUnitModal(unitId, container) {
  if (!can('canWrite')) {
    showToast('No tienes permisos para guardar unidades.', 'warning');
    return;
  }
  let unit = null;
  let terceros = [];
  try {
    [terceros] = await Promise.all([
      API.getTerceros(),
      unitId ? pb.get('ph_properties', unitId).then(u => { unit = u; }) : Promise.resolve(),
    ]);
    terceros = (terceros || []).filter(t => {
      if (t.role) return String(t.role).toLowerCase() === 'propietario' || String(t.role).toLowerCase() === 'cliente';
      if (t.type) return String(t.type).toLowerCase() === 'propietario' || String(t.type).toLowerCase() === 'cliente';
      return true;
    });
  } catch (err) {
    showToast('Error al cargar datos de la unidad.', 'error');
    return;
  }

  const title = unit ? 'Editar Unidad' : 'Nueva Unidad';
  openModal(
    title,
    `<div class="grid grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span class="text-red-500">*</span></label>
        <input id="pu-code" class="form-input" value="${esc(unit?.code || '')}" placeholder="Ej: 101, P-02">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span class="text-red-500">*</span></label>
        <input id="pu-name" class="form-input" value="${esc(unit?.name || '')}" placeholder="Ej: Apartamento 101">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo <span class="text-red-500">*</span></label>
        <select id="pu-type" class="form-input">
          ${PH_UNIT_TYPES.map(t => `<option value="${t}" ${unit?.unit_type === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Torre</label>
        <input id="pu-tower" class="form-input" value="${esc(unit?.tower || '')}" placeholder="Ej: Torre 1, A, Norte">
      </div>
      <div class="form-group">
        <label class="form-label">Apartamento (número sin torre)</label>
        <input id="pu-apartment" class="form-input" value="${esc(unit?.apartment || '')}" placeholder="Ej: 101, 305, PB-01">
      </div>
      <div class="form-group">
        <label class="form-label">Coef. Participación (%)</label>
        <input id="pu-coef" type="number" step="0.0001" min="0" max="100" class="form-input"
          value="${esc(unit?.coef_participacion ?? '')}" placeholder="0.0000">
      </div>
      <div class="form-group">
        <label class="form-label">Cuota Administración (valor fijo)</label>
        <input id="pu-admin-fee" type="number" min="0" step="0.01" class="form-input"
          value="${esc(unit?.admin_fee ?? '')}" placeholder="0.00">
        <p class="text-xs mt-1" style="color:#6B7280">Si se completa, esta unidad pagará este valor fijo en vez del coeficiente.</p>
      </div>
      <div class="form-group">
        <label class="form-label">Área (m²)</label>
        <input id="pu-area" type="number" min="0" step="0.01" class="form-input"
          value="${esc(unit?.area_m2 ?? '')}" placeholder="0.00">
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="pu-active" class="form-input">
          <option value="true"  ${unit?.active !== false ? 'selected' : ''}>Activa</option>
          <option value="false" ${unit?.active === false  ? 'selected' : ''}>Inactiva</option>
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Propietario</label>
        <select id="pu-owner" class="form-input">
          <option value="">— Sin asignar —</option>
          ${terceros.map(t => `<option value="${esc(t.id)}" ${unit?.owner_id === t.id ? 'selected' : ''}>${esc(t.name)} (${esc(t.doc_number || 'N/A')})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de Entrega</label>
        <input id="pu-delivery-date" type="date" class="form-input"
          value="${esc(unit?.delivery_date ? String(unit.delivery_date).slice(0, 10) : '')}">
        <p class="text-xs mt-1" style="color:#6B7280">Si la entrega ocurrió en el mes de facturación, se causará la expensa proporcional a los días transcurridos.</p>
      </div>
      <div class="form-group">
        <label class="form-label">Notas</label>
        <textarea id="pu-notes" class="form-input" rows="2" placeholder="Observaciones...">${esc(unit?.notes || '')}</textarea>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pu-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`
  );

  const saveBtn = document.getElementById('pu-save-btn');
  saveBtn?.addEventListener('click', async () => {
    const code  = ((document.getElementById('pu-code') as HTMLInputElement)?.value  || '').trim();
    const name  = ((document.getElementById('pu-name') as HTMLInputElement)?.value  || '').trim();
    const utype = (document.getElementById('pu-type') as HTMLSelectElement)?.value   || 'APARTAMENTO';
    if (!code || !name) { showToast('Código y nombre son obligatorios.', 'warning'); return; }

    const rawOwner = (document.getElementById('pu-owner') as HTMLSelectElement)?.value || '';

    const data = {
      code,
      name,
      unit_type:           utype,
      tower:               ((document.getElementById('pu-tower') as HTMLInputElement)?.value     || '').trim(),
      apartment:           ((document.getElementById('pu-apartment') as HTMLInputElement)?.value || '').trim(),
      coef_participacion:  parseFloat((document.getElementById('pu-coef') as HTMLInputElement)?.value  || '0') || 0,
      admin_fee:           parseFloat((document.getElementById('pu-admin-fee') as HTMLInputElement)?.value || '0') || 0,
      area_m2:             parseFloat((document.getElementById('pu-area') as HTMLInputElement)?.value   || '0') || 0,
      delivery_date:       ((document.getElementById('pu-delivery-date') as HTMLInputElement)?.value || '').trim() || null,
      owner_id:            rawOwner ? rawOwner : null,
      notes:               (document.getElementById('pu-notes') as HTMLTextAreaElement)?.value  || '',
      active:              (document.getElementById('pu-active') as HTMLSelectElement)?.value === 'true',
    };

    saveBtn.setAttribute('disabled', 'true');
    saveBtn.textContent = 'Guardando...';
    try {
      if (unit && unit.id) {
        await pb.update('ph_properties', unit.id, data);
        await API.logAudit('UPDATE', 'PhProperty', unit.id, `Unidad ${code} actualizada`);
        showToast('Unidad actualizada.', 'success');
      } else {
        data.active = true;
        const created = await pb.create('ph_properties', data);
        await API.logAudit('CREATE', 'PhProperty', created.id, `Nueva unidad ${code}`);
        showToast('Unidad creada.', 'success');
      }
      closeModal();
      renderPhUnidades(container);
    } catch (err: any) {
      showToast(err.message || 'Error al guardar.', 'error');
      saveBtn.removeAttribute('disabled');
      saveBtn.textContent = 'Guardar';
    }
  });
}

async function togglePhUnit(unitId, currentActive, container) {
  if (!can('canWrite')) {
    showToast('No tienes permisos para actualizar unidades.', 'warning');
    return;
  }
  const action = currentActive ? 'desactivar' : 'activar';
  if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} esta unidad?`)) return;
  try {
    await pb.update('ph_properties', unitId, { active: !currentActive });
    showToast(`Unidad ${action}da.`, 'success');
    renderPhUnidades(container);
  } catch (err) {
    showToast(err.message || 'Error.', 'error');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: RESERVAS
// ══════════════════════════════════════════════════════════════════════════════
async function renderPhReservas(c) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>`;
  try {
    const today = (window as any).todayStr();
    const [resRes, areas] = await Promise.all([
      API.getPhReservations({ filter: `date>="${pb.escapeFilterValue(today)}"`, sort: 'date,time_from', perPage: 100 }),
      API.getPhCommonAreas(true),
    ]);
    const reservations = resRes.items || [];

    c.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        ${phKpi('Zonas comunes',    areas.length,       'fas fa-map-marked-alt','#1A4B8C','#EEF4FF')}
        ${phKpi('Próximas reservas',reservations.length,'fas fa-calendar-check','#059669','#ECFDF5')}
        ${phKpi('Confirmadas',      reservations.filter(r => r.status === 'confirmed').length,
                                    'fas fa-circle-check','#7F7CFF','#F5F3FF')}
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">Reservas Próximas (desde hoy)</span>
          <div class="flex gap-2">
            <select id="ph-res-area-filter" class="form-input text-sm" style="max-width:200px">
              <option value="">Todas las zonas</option>
              ${areas.map(a => `<option value="${esc(a.id)}">${esc(a.name)}</option>`).join('')}
            </select>
            <button class="btn btn-primary btn-sm" id="ph-res-add-btn">
              <i class="fas fa-plus mr-1"></i>Nueva Reserva
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table" id="ph-reservas-table">
            <thead><tr>
              <th>Zona</th><th>Unidad</th><th>Fecha</th><th>Horario</th>
              <th>Asistentes</th><th>Estado</th><th>Acciones</th>
            </tr></thead>
            <tbody id="ph-res-tbody">
              ${renderPhResRows(reservations)}
            </tbody>
          </table>
        </div>
      </div>`;

    document.getElementById('ph-res-area-filter')?.addEventListener('change', async (e) => {
      const areaId = e.target.value;
      let filter   = `date>="${pb.escapeFilterValue(today)}"`;
      if (areaId) filter += ` && area_id="${pb.escapeFilterValue(areaId)}"`;
      const res = await API.getPhReservations({ filter, sort: 'date,time_from', perPage: 100 });
      document.getElementById('ph-res-tbody').innerHTML = renderPhResRows(res.items || []);
      attachPhResActions(c, areas);
      const tbl = document.getElementById('ph-reservas-table') as HTMLTableElement;
      if (tbl) (window as any).reapplyTableSort(tbl);
    });

    document.getElementById('ph-res-add-btn')?.addEventListener('click', () => openPhResModal(null, c, areas));
    attachPhResActions(c, areas);
    const tbl = document.getElementById('ph-reservas-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);
  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

function renderPhResRows(reservations) {
  if (!reservations.length) {
    return `<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay reservas próximas.</td></tr>`;
  }
  return reservations.map(r => {
    const area = r.expand?.area_id;
    const prop = r.expand?.property_id;
    const meta = PH_RES_STATUS[r.status] || PH_RES_STATUS.pending;
    return `<tr data-res-id="${esc(r.id)}">
      <td class="font-semibold" style="color:#0D2137">${esc(area?.name || '—')}</td>
      <td>${esc(prop?.name || prop?.code || '—')}</td>
      <td>${esc(r.date)}</td>
      <td class="text-sm">${esc(r.time_from)} – ${esc(r.time_to)}</td>
      <td class="text-center">${r.attendees || '—'}</td>
      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
      <td>
        <div class="flex gap-1">
          ${r.status === 'pending' ? `
            <button class="btn btn-sm ph-res-confirm" data-id="${esc(r.id)}" title="Confirmar"
              style="background:#ECFDF5;color:#059669;border:1.5px solid #6EE7B7">
              <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-sm ph-res-cancel" data-id="${esc(r.id)}" title="Cancelar"
              style="background:#FEF2F2;color:#DC2626;border:1.5px solid #FECACA">
              <i class="fas fa-xmark"></i>
            </button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function attachPhResActions(c, areas) {
  c.querySelectorAll('.ph-res-confirm').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await pb.update('ph_reservations', btn.dataset.id, { status: 'confirmed' });
        showToast('Reserva confirmada.', 'success');
        renderPhReservas(c);
      } catch (err) { showToast(err.message || 'Error.', 'error'); }
    });
  });
  c.querySelectorAll('.ph-res-cancel').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('¿Cancelar esta reserva?')) return;
      try {
        await pb.update('ph_reservations', btn.dataset.id, { status: 'cancelled' });
        showToast('Reserva cancelada.', 'success');
        renderPhReservas(c);
      } catch (err) { showToast(err.message || 'Error.', 'error'); }
    });
  });
}

async function openPhResModal(resId, container, areasPreloaded) {
  let res    = null;
  let areas  = areasPreloaded || [];
  let props  = [];
  try {
    [props] = await Promise.all([
      API.getPhProperties(true),
      resId ? pb.get('ph_reservations', resId, { expand: 'area_id,property_id' }).then(r => { res = r; }) : Promise.resolve(),
    ]);
    if (!areas.length) areas = await API.getPhCommonAreas(true);
  } catch (err) {
    showToast('Error al cargar datos.', 'error');
    return;
  }

  const today = (window as any).todayStr();
  openModal(
    res ? 'Editar Reserva' : 'Nueva Reserva',
    `<div class="grid grid-cols-2 gap-4">
      <div class="form-group col-span-2">
        <label class="form-label">Zona Común <span class="text-red-500">*</span></label>
        <select id="pr-area" class="form-input">
          <option value="">Seleccionar zona...</option>
          ${areas.map(a => `<option value="${esc(a.id)}" ${res?.area_id === a.id ? 'selected' : ''}>
            ${esc(a.name)}${a.capacity ? ` (cap: ${a.capacity})` : ''}
          </option>`).join('')}
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Unidad <span class="text-red-500">*</span></label>
        <select id="pr-prop" class="form-input">
          <option value="">Seleccionar unidad...</option>
          ${props.map(p => `<option value="${esc(p.id)}" ${res?.property_id === p.id ? 'selected' : ''}>${esc(p.name)} (${esc(p.code)})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Fecha <span class="text-red-500">*</span></label>
        <input id="pr-date" type="date" class="form-input" min="${today}" value="${esc(res?.date || today)}">
      </div>
      <div class="form-group">
        <label class="form-label">Número de asistentes</label>
        <input id="pr-att" type="number" min="0" class="form-input" value="${esc(res?.attendees || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Hora inicio <span class="text-red-500">*</span></label>
        <input id="pr-from" type="time" class="form-input" value="${esc(res?.time_from || '08:00')}">
      </div>
      <div class="form-group">
        <label class="form-label">Hora fin <span class="text-red-500">*</span></label>
        <input id="pr-to" type="time" class="form-input" value="${esc(res?.time_to || '10:00')}">
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Notas / Observaciones</label>
        <textarea id="pr-notes" class="form-input" rows="2" placeholder="Ej: Reunión de copropietarios...">${esc(res?.notes || '')}</textarea>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pr-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`
  );

  setTimeout(() => {
    document.getElementById('pr-save-btn')?.addEventListener('click', async () => {
      const areaId = document.getElementById('pr-area')?.value;
      const propId = document.getElementById('pr-prop')?.value;
      const date   = document.getElementById('pr-date')?.value;
      const tFrom  = document.getElementById('pr-from')?.value;
      const tTo    = document.getElementById('pr-to')?.value;
      if (!areaId || !propId || !date || !tFrom || !tTo) {
        showToast('Completa los campos obligatorios.', 'warning');
        return;
      }
      if (tTo <= tFrom) { showToast('La hora fin debe ser posterior a la hora inicio.', 'warning'); return; }

      const data = {
        area_id: areaId, property_id: propId, date, time_from: tFrom, time_to: tTo,
        attendees: parseInt(document.getElementById('pr-att')?.value || 0) || 0,
        notes:     document.getElementById('pr-notes')?.value || '',
        status:    'pending',
      };
      const btn = document.getElementById('pr-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
      try {
        if (res) {
          await pb.update('ph_reservations', res.id, data);
          showToast('Reserva actualizada.', 'success');
        } else {
          await pb.create('ph_reservations', data);
          showToast('Reserva creada.', 'success');
        }
        closeModal();
        renderPhReservas(container);
      } catch (err) {
        showToast(err.message || 'Error.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
      }
    }, { once: true });
  }, 50);
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: PQRs
// ══════════════════════════════════════════════════════════════════════════════
async function renderPhPqrs(c) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>`;
  try {
    const [pqrsRes, props] = await Promise.all([
      API.getPhPqrs({ perPage: 100 }),
      API.getPhProperties(true),
    ]);
    const allPqrs = pqrsRes.items || [];
    const pqrs    = allPqrs.filter(p => (p.status || 'open') !== 'closed');
    const open   = pqrs.filter(p => p.status === 'open').length;
    const inProc = pqrs.filter(p => p.status === 'in_process').length;
    const alta   = pqrs.filter(p => p.priority === 'alta').length;

    c.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${phKpi('Abiertas',     open,        'fas fa-inbox',            '#C46516','#FFF8F0')}
        ${phKpi('En proceso',   inProc,      'fas fa-arrows-spin',      '#1A4B8C','#EEF4FF')}
        ${phKpi('Prioridad Alta',alta,        'fas fa-triangle-exclamation','#DC2626','#FEF2F2')}
        ${phKpi('Total activas',pqrs.length, 'fas fa-comments',         '#7F7CFF','#F5F3FF')}
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between flex-wrap gap-2" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">PQRs Activas</span>
          <div class="flex gap-2 flex-wrap">
            <select id="ph-pqr-status-filter" class="form-input text-sm" style="max-width:160px">
              <option value="">Todos los estados</option>
              ${Object.entries(PH_PQRS_STATUS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
            </select>
            <select id="ph-pqr-type-filter" class="form-input text-sm" style="max-width:160px">
              <option value="">Todos los tipos</option>
              ${PH_PQRS_TYPES.map(t => `<option value="${t.value}">${t.label}</option>`).join('')}
            </select>
            <button class="btn btn-primary btn-sm" id="ph-pqr-add-btn">
              <i class="fas fa-plus mr-1"></i>Nueva PQR
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table" id="ph-pqrs-table">
            <thead><tr>
              <th>N°</th><th>Tipo</th><th>Asunto</th><th>Unidad</th>
              <th>Prioridad</th><th>Estado</th><th>Fecha</th><th>Acciones</th>
            </tr></thead>
            <tbody id="ph-pqrs-tbody">
              ${renderPhPqrRows(pqrs)}
            </tbody>
          </table>
        </div>
      </div>`;

    async function reloadPqrs() {
      const status = document.getElementById('ph-pqr-status-filter')?.value;
      const type   = document.getElementById('ph-pqr-type-filter')?.value;
      const res = await API.getPhPqrs({ perPage: 100 });
      const items = (res.items || []).filter(p => {
        const currentStatus = p.status || 'open';
        if (!status && currentStatus === 'closed') return false;
        if (status && currentStatus !== status) return false;
        if (type && p.pqrs_type !== type) return false;
        return true;
      });
      document.getElementById('ph-pqrs-tbody').innerHTML = renderPhPqrRows(items);
      attachPhPqrActions(c, props);
      const tbl = document.getElementById('ph-pqrs-table') as HTMLTableElement;
      if (tbl) (window as any).reapplyTableSort(tbl);
    }

    document.getElementById('ph-pqr-status-filter')?.addEventListener('change', reloadPqrs);
    document.getElementById('ph-pqr-type-filter')?.addEventListener('change', reloadPqrs);
    document.getElementById('ph-pqr-add-btn')?.addEventListener('click', () => openPhPqrModal(null, c, props));
    attachPhPqrActions(c, props);
    const tbl = document.getElementById('ph-pqrs-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);
  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

function renderPhPqrRows(pqrs) {
  if (!pqrs.length) {
    return `<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay PQRs activas.</td></tr>`;
  }
  return pqrs.map(p => {
    const prop     = p.expand?.property_id;
    const sttMeta  = PH_PQRS_STATUS[p.status]   || PH_PQRS_STATUS.open;
    const priMeta  = PH_PQRS_PRIORITY[p.priority] || PH_PQRS_PRIORITY.media;
    const typeLabel= PH_PQRS_TYPES.find(t => t.value === p.pqrs_type)?.label || p.pqrs_type || '—';
    const dateStr  = p.created ? new Date(p.created).toLocaleDateString('es-CO') : '—';
    return `<tr>
      <td class="font-mono text-xs font-bold">${esc(p.number)}</td>
      <td><span class="badge badge-gray">${esc(typeLabel)}</span></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
          title="${esc(p.subject)}">${esc(p.subject)}</td>
      <td class="text-sm">${esc(prop?.name || prop?.code || '—')}</td>
      <td><span class="badge ${priMeta.badge}">${priMeta.label}</span></td>
      <td><span class="badge ${sttMeta.badge}">${sttMeta.label}</span></td>
      <td class="text-xs">${dateStr}</td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-pqr-view" data-id="${esc(p.id)}" title="Ver / Responder">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function attachPhPqrActions(c, props) {
  c.querySelectorAll('.ph-pqr-view').forEach(btn => {
    btn.addEventListener('click', () => openPhPqrModal(btn.dataset.id, c, props));
  });
}

async function openPhPqrModal(pqrId, container, propsPreloaded) {
  let pqr   = null;
  let props = propsPreloaded || [];
  try {
    if (pqrId) {
      pqr = await pb.get('ph_pqrs', pqrId, { expand: 'property_id' });
    }
    if (!props.length) props = await API.getPhProperties(false);
  } catch (err) {
    showToast('Error al cargar datos.', 'error');
    return;
  }

  const isView = !!pqrId;
  const title  = pqr ? `PQR ${pqr.number}` : 'Nueva PQR';
  const statusOptions = Object.entries(PH_PQRS_STATUS)
    .map(([k, v]) => `<option value="${k}" ${pqr?.status === k ? 'selected' : ''}>${v.label}</option>`)
    .join('');

  openModal(
    title,
    `<div class="space-y-4">
      ${pqr ? `
        <div class="grid grid-cols-3 gap-3 p-3 rounded-xl text-sm" style="background:#F8FAFF">
          <div><p class="text-xs" style="color:#6B7280">Número</p><p class="font-bold font-mono">${esc(pqr.number)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Tipo</p><p class="font-semibold">${esc(PH_PQRS_TYPES.find(t=>t.value===pqr.pqrs_type)?.label || pqr.pqrs_type)}</p></div>
          <div><p class="text-xs" style="color:#6B7280">Prioridad</p>
            <span class="badge ${PH_PQRS_PRIORITY[pqr.priority]?.badge || 'badge-gray'}">${PH_PQRS_PRIORITY[pqr.priority]?.label || pqr.priority || '—'}</span>
          </div>
        </div>` : ''}
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Tipo <span class="text-red-500">*</span></label>
          <select id="pq-type" class="form-input" ${pqr ? 'disabled' : ''}>
            ${PH_PQRS_TYPES.map(t => `<option value="${t.value}" ${pqr?.pqrs_type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Prioridad</label>
          <select id="pq-priority" class="form-input">
            <option value="baja"  ${pqr?.priority === 'baja'  ? 'selected' : ''}>Baja</option>
            <option value="media" ${pqr?.priority === 'media' ? 'selected' : ''}>Media</option>
            <option value="alta"  ${pqr?.priority === 'alta'  ? 'selected' : ''}>Alta</option>
          </select>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Unidad</label>
          <select id="pq-prop" class="form-input" ${pqr ? 'disabled' : ''}>
            <option value="">— Sin unidad específica —</option>
            ${props.map(p => `<option value="${esc(p.id)}" ${pqr?.property_id === p.id ? 'selected' : ''}>${esc(p.name)} (${esc(p.code)})</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Asunto <span class="text-red-500">*</span></label>
          <input id="pq-subject" class="form-input" value="${esc(pqr?.subject || '')}" placeholder="Descripción breve del motivo" ${pqr ? 'readonly' : ''}>
        </div>
        <div class="form-group col-span-2">
          <label class="form-label">Descripción <span class="text-red-500">*</span></label>
          <textarea id="pq-desc" class="form-input" rows="3" placeholder="Detalle completo de la solicitud..." ${pqr ? 'readonly' : ''}>${esc(pqr?.description || '')}</textarea>
        </div>
        ${pqr ? `
          <div class="form-group">
            <label class="form-label">Estado</label>
            <select id="pq-status" class="form-input">${statusOptions}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Asignado a</label>
            <input id="pq-assigned" class="form-input" value="${esc(pqr.assigned_to || '')}" placeholder="Nombre del responsable">
          </div>
          <div class="form-group col-span-2">
            <label class="form-label">Respuesta / Gestión</label>
            <textarea id="pq-response" class="form-input" rows="3" placeholder="Describe las acciones tomadas...">${esc(pqr.response || '')}</textarea>
          </div>` : ''}
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
     <button class="btn btn-primary" id="pq-save-btn">
       <i class="fas fa-save mr-1"></i>${pqr ? 'Actualizar' : 'Crear PQR'}
     </button>`
  );

  setTimeout(() => {
    document.getElementById('pq-save-btn')?.addEventListener('click', async () => {
      const btn = document.getElementById('pq-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

      try {
        if (pqr) {
          // Actualizar estado y respuesta
          const newStatus   = document.getElementById('pq-status')?.value;
          const newResponse = document.getElementById('pq-response')?.value || '';
          const assigned    = document.getElementById('pq-assigned')?.value || '';
          const priority    = document.getElementById('pq-priority')?.value || 'media';
          const updateData  = { status: newStatus, response: newResponse, assigned_to: assigned, priority };
          if (newStatus === 'closed' || newStatus === 'resolved') {
            updateData.closed_at = (window as any).nowStr();
          }
          await pb.update('ph_pqrs', pqr.id, updateData);
          await API.logAudit('UPDATE', 'PhPqr', pqr.id, `PQR ${pqr.number} → ${newStatus}`);
          showToast('PQR actualizada.', 'success');
        } else {
          // Crear nueva PQR
          const subject  = (document.getElementById('pq-subject')?.value || '').trim();
          const desc     = (document.getElementById('pq-desc')?.value    || '').trim();
          const pqrType  = document.getElementById('pq-type')?.value     || 'PETICION';
          const priority = document.getElementById('pq-priority')?.value  || 'media';
          const propId   = document.getElementById('pq-prop')?.value      || null;
          if (!subject) { showToast('El asunto es obligatorio.', 'warning'); if (btn) { btn.disabled=false; btn.textContent='Crear PQR'; } return; }
          if (!desc)    { showToast('La descripción es obligatoria.', 'warning'); if (btn) { btn.disabled=false; btn.textContent='Crear PQR'; } return; }

          const number = await API.nextPhPqrNumber();
          const created = await pb.create('ph_pqrs', {
            number, subject, description: desc, pqrs_type: pqrType, priority,
            property_id: propId || null,
            status:      'open',
            opened_at:   (window as any).nowStr(),
          });
          await API.logAudit('CREATE', 'PhPqr', created.id, `Nueva PQR ${number} — ${subject}`);
          showToast('PQR creada correctamente.', 'success');
        }
        closeModal();
        renderPhPqrs(container);
      } catch (err) {
        showToast(err.message || 'Error.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = pqr ? 'Actualizar' : 'Crear PQR'; }
      }
    }, { once: true });
  }, 50);
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CONFIGURACIÓN
// ══════════════════════════════════════════════════════════════════════════════
async function renderPhConfig(c) {
  c.id = c.id || 'ph-config-container';
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>`;
  try {
    const [concepts, areas, phCfgRaw, accounts, properties, indConceptsRes, rawFooterNote, rawMailSubject, rawMailBody, rawMailNotice, activeTxTypes] = await Promise.all([
      API.getPhBillingConcepts(false),
      API.getPhCommonAreas(false),
      API.getSetting('ph_config_v1'),
      API.getAccounts(true),
      API.getPhProperties(true),
      API.getPhIndividualCharges({ filter: '' }).catch(() => ({ items: [] })),
      API.getSetting('ph_invoice_footer_note').catch(() => ''),
      API.getSetting('ph_email_template_invoice_subject').catch(() => ''),
      API.getSetting('ph_email_template_invoice_body').catch(() => ''),
      API.getSetting('ph_email_monthly_notice').catch(() => ''),
      pb.listAll('transaction_types', { filter: 'active=true', sort: 'code,prefix' }).catch(() => []),
    ]);
    const indConcepts = (indConceptsRes?.items || []).slice().sort((a, b) => {
      const an = String(a?.name || a?.description || '').toLowerCase();
      const bn = String(b?.name || b?.description || '').toLowerCase();
      return an.localeCompare(bn);
    });
    const propMap = new Map((properties || []).map(p => [p.id, p]));
    let phCfg = {};
    try { phCfg = phCfgRaw ? JSON.parse(phCfgRaw) : {}; } catch (_) { phCfg = {}; }
    const defaultFooterNote = 'CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.';
    const invoiceFooterNote = (rawFooterNote || phCfg.invoice_footer_note || defaultFooterNote).trim();

    const defaultEmailSubject = '{copropiedad} — Cuenta de Cobro No. {numero_factura} — Unidad {unidad}';
    const defaultEmailBody = `Estimado(a) {propietario},\n\nLe compartimos su cuenta de cobro correspondiente al período {periodo} para la unidad {unidad}.\n\n{aviso_adicional}\n\nAdjunto a este correo encontrará su documento oficial en formato PDF.\n\nInstrucciones de Pago:\n{instrucciones_pago}\n\nAgradecemos realizar su pago oportunamente.\nAtentamente,\nAdministración {copropiedad}`;
    const emailSubject = rawMailSubject || defaultEmailSubject;
    const emailBody = rawMailBody || defaultEmailBody;
    const emailNotice = rawMailNotice || '';

    const cxcCode    = phCfg.cxc_code    || '130505';
    const incomeCode = phCfg.income_code || '413505';
    const lateFeeIncomeCode = phCfg.late_fee_income_code || incomeCode;
    const anticipoAccountCode = phCfg.anticipo_account_code || '';
    const cruceTxTypeId = phCfg.cruce_anticipo_tx_type_id || '';
    const activeLeafAccounts = (accounts || [])
      .filter(a => a.active !== false && Number(a.level || 0) >= 3)
      .sort((a, b) => String(a.code || '').localeCompare(String(b.code || '')));
    const accountByCode = new Map(activeLeafAccounts.map(a => [String(a.code || ''), a]));
    const cxcAccounts = activeLeafAccounts.filter(a => String(a.code || '').startsWith('1'));
    const incomeAccounts = activeLeafAccounts.filter(a => String(a.code || '').startsWith('4'));
    const liabilityAccounts = activeLeafAccounts.filter(a => String(a.code || '').startsWith('2'));
    const accountOptions = (rows, selectedCode = '') => {
      const selected = String(selectedCode || '');
      const hasSelected = rows.some(a => String(a.code || '') === selected);
      const orphanOption = selected && !hasSelected
        ? `<option value="${esc(selected)}" selected>${esc(selected)} — (No encontrada en PUC activo)</option>`
        : '';
      return `${orphanOption}<option value="">— Seleccionar cuenta —</option>${rows.map(a => `<option value="${esc(a.code)}"${String(a.code || '') === selected ? ' selected' : ''}>${esc(a.code)} — ${esc(a.name || '')}</option>`).join('')}`;
    };
    const txTypeOptions = (types: any[], selectedId = '') => {
      return `<option value="">— Automático (Sugerido: Nota Contable NC / CC / AJ) —</option>${(types || []).map(t => {
        const sel = String(t.id) === String(selectedId || '') ? ' selected' : '';
        return `<option value="${esc(t.id)}"${sel}>[${esc(t.prefix || t.code)}] ${esc(t.name)}</option>`;
      }).join('')}`;
    };

    c.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Plantilla de Correo y Avisos para Facturación PH -->
        <div class="bg-white rounded-2xl border p-5 lg:col-span-2" style="border-color:#F0F0F0">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h4 class="font-bold text-base" style="color:#0D2137">
                <i class="fas fa-envelope-open-text mr-2" style="color:#7F7CFF"></i>Plantilla de Correo y Avisos para Facturación PH
              </h4>
              <p class="text-xs text-gray-500">
                Personaliza el asunto predeterminado, el cuerpo del correo y los avisos o circulares (ej: convocatorias a asamblea) que recibirán los copropietarios.
              </p>
            </div>
            <button class="btn btn-primary btn-sm" id="ph-cfg-save-email-btn">
              <i class="fas fa-save mr-1"></i>Guardar Plantilla de Correo
            </button>
          </div>

          <!-- Barra de ayuda de variables dinámicas -->
          <div class="p-3 rounded-xl bg-purple-50 border border-purple-100 mb-4 text-xs">
            <span class="font-bold text-purple-900 block mb-1.5"><i class="fas fa-tags mr-1"></i>Variables dinámicas disponibles (haz clic para insertar en el campo activo):</span>
            <div class="flex flex-wrap gap-1.5" id="ph-cfg-email-tokens">
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 font-mono hover:bg-purple-100 transition cursor-pointer" data-token="{propietario}">{propietario}</button>
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 font-mono hover:bg-purple-100 transition cursor-pointer" data-token="{unidad}">{unidad}</button>
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 font-mono hover:bg-purple-100 transition cursor-pointer" data-token="{periodo}">{periodo}</button>
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 font-mono hover:bg-purple-100 transition cursor-pointer" data-token="{numero_factura}">{numero_factura}</button>
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 font-mono hover:bg-purple-100 transition cursor-pointer" data-token="{total_mes}">{total_mes}</button>
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 font-mono hover:bg-purple-100 transition cursor-pointer" data-token="{saldo_anterior}">{saldo_anterior}</button>
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 font-mono hover:bg-purple-100 transition cursor-pointer" data-token="{total_pagar}">{total_pagar}</button>
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 font-mono hover:bg-purple-100 transition cursor-pointer" data-token="{fecha_vencimiento}">{fecha_vencimiento}</button>
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 font-mono hover:bg-purple-100 transition cursor-pointer" data-token="{copropiedad}">{copropiedad}</button>
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-white border border-purple-200 text-purple-700 font-mono hover:bg-purple-100 transition cursor-pointer" data-token="{instrucciones_pago}">{instrucciones_pago}</button>
              <button type="button" class="ph-token-chip px-2 py-1 rounded bg-amber-100 border border-amber-300 text-amber-800 font-mono font-bold hover:bg-amber-200 transition cursor-pointer" data-token="{aviso_adicional}">📢 {aviso_adicional}</button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div class="form-group mb-0">
                <label class="form-label font-semibold">Asunto Predeterminado del Correo</label>
                <input id="ph-cfg-email-subject" class="form-input text-xs font-mono" value="${esc(emailSubject)}" placeholder="[{copropiedad}] Cuenta de Cobro No. {numero_factura} — Unidad {unidad}">
                <p class="text-xs text-gray-400 mt-1">Soporta tokens como {copropiedad}, {periodo}, {unidad}, {propietario}, etc.</p>
              </div>
              <div class="form-group mb-0">
                <label class="form-label font-semibold">
                  <span class="text-amber-600 mr-1">📢</span>Aviso / Circular del Mes (Opcional)
                </label>
                <textarea id="ph-cfg-email-notice" class="form-input font-sans text-xs bg-amber-50/40 border-amber-200" rows="4" style="resize:vertical;"
                  placeholder="Ej: Recuerde la asamblea extraordinaria de copropietarios el sábado 28 de marzo a las 9:00 a.m. en el salón comunal.">${esc(emailNotice)}</textarea>
                <p class="text-xs text-amber-700 mt-1">Si se diligencia, se resalta como comunicado oficial de la administración.</p>
              </div>
            </div>

            <div class="form-group mb-0">
              <label class="form-label font-semibold">Cuerpo Predeterminado del Correo</label>
              <textarea id="ph-cfg-email-body" class="form-input font-sans text-xs" rows="8" style="resize:vertical;"
                placeholder="Texto del cuerpo del correo...">${esc(emailBody)}</textarea>
              <p class="text-xs text-gray-400 mt-1">La cuenta de cobro oficial siempre irá adjunta en formato PDF.</p>
            </div>
          </div>
        </div>

        <!-- Parámetros de Facturación y Pie de Factura -->
        <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <h4 class="font-bold mb-4" style="color:#0D2137">
            <i class="fas fa-file-invoice-dollar mr-2" style="color:#7F7CFF"></i>Parámetros de Facturación y Pie de Factura
          </h4>
          <p class="text-sm mb-4" style="color:#6B7280">
            Define el comentario, instrucciones de consignación y cuentas bancarias oficiales que se imprimirán al pie de las facturas y cuentas de cobro de esta copropiedad.
          </p>
          <div class="form-group">
            <label class="form-label font-semibold">Comentario / Instrucciones de Pago al Pie de Factura</label>
            <textarea id="ph-cfg-footer-note" class="form-input font-sans text-xs" rows="5" style="resize:vertical;"
              placeholder="Ej: CONSIGNAR EN LA CUENTA CORRIENTE BANCOLOMBIA No. 123-456789-01 A NOMBRE DE LA COPROPIEDAD...">${esc(invoiceFooterNote)}</textarea>
            <p class="text-xs mt-1.5" style="color:#9CA3AF">
              Indica números de cuenta, convenios bancarios, PSE, Nequi/Daviplata o advertencias de recaudo específicas de este conjunto.
            </p>
          </div>
          <button class="btn btn-primary" id="ph-cfg-save-note-btn">
            <i class="fas fa-save mr-1"></i>Guardar Parámetros de Facturación
          </button>
        </div>

        <!-- Configuración Contable -->
        <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <h4 class="font-bold mb-4" style="color:#0D2137">
            <i class="fas fa-calculator mr-2" style="color:#7F7CFF"></i>Cuentas Contables PH
          </h4>
          <p class="text-sm mb-4" style="color:#6B7280">
            Cuentas utilizadas al contabilizar facturas de copropiedad.
          </p>
          <div class="form-group">
            <label class="form-label">Cuenta CxC Propietarios (Débito)</label>
            <select id="ph-cfg-cxc" class="form-input font-mono">${accountOptions(cxcAccounts, cxcCode)}</select>
            <p class="text-xs mt-1" style="color:#9CA3AF">Cuenta a debitar al generar la factura (cartera de propietarios).</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Ingreso por Defecto (Crédito)</label>
            <select id="ph-cfg-income" class="form-input font-mono">${accountOptions(incomeAccounts, incomeCode)}</select>
            <p class="text-xs mt-1" style="color:#9CA3AF">Usada cuando el concepto no tiene cuenta propia asignada.</p>
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fas fa-piggy-bank mr-1" style="color:#059669"></i>Cuenta de Anticipos de Propietarios (Pasivo)</label>
            <select id="ph-cfg-anticipo" class="form-input font-mono">${accountOptions(liabilityAccounts, anticipoAccountCode)}</select>
            <p class="text-xs mt-1" style="color:#9CA3AF">Cuenta clase 2 donde se registran los saldos a favor de propietarios (ej: 280505 Anticipos de Clientes).</p>
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fas fa-file-invoice mr-1" style="color:#2563EB"></i>Tipo de Comprobante para Cruce de Anticipos</label>
            <select id="ph-cfg-cruce-tx-type" class="form-input">${txTypeOptions(activeTxTypes, cruceTxTypeId)}</select>
            <p class="text-xs mt-1" style="color:#9CA3AF">Tipo de comprobante utilizado para registrar los cruces contables de saldos a favor (ej: Nota de Contabilidad NC, Comprobante CC o Ajustes AJ).</p>
          </div>
          <button class="btn btn-primary" id="ph-cfg-save-btn">
            <i class="fas fa-save mr-1"></i>Guardar Cuentas Contables
          </button>
        </div>

        <!-- Zonas Comunes -->
        <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-bold" style="color:#0D2137">
              <i class="fas fa-map-marked-alt mr-2" style="color:#1A4B8C"></i>Zonas Comunes
            </h4>
            <button class="btn btn-primary btn-sm" id="ph-area-add-btn">
              <i class="fas fa-plus mr-1"></i>Nueva zona
            </button>
          </div>
          <div id="ph-areas-list">
            ${renderPhAreasList(areas, c)}
          </div>
        </div>

        <!-- Conceptos de Facturación -->
        <div class="bg-white rounded-2xl border p-5 lg:col-span-2" style="border-color:#F0F0F0">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-bold" style="color:#0D2137">
              <i class="fas fa-tags mr-2" style="color:#059669"></i>Conceptos de Facturación
            </h4>
            <button class="btn btn-primary btn-sm" id="ph-concept-add-btn">
              <i class="fas fa-plus mr-1"></i>Nuevo concepto
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="data-table text-sm">
              <thead>
                <tr>
                  <th>Código</th><th>Nombre</th><th>Valor</th>
                  <th>Aplica Coef.</th><th>Cuenta ingreso</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody id="ph-concepts-tbody">
                ${renderPhConceptRows(concepts, accounts)}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Intereses de Mora -->
        <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
          <h4 class="font-bold mb-4" style="color:#0D2137">
            <i class="fas fa-hourglass-end mr-2" style="color:#DC2626"></i>Configuración de Intereses de Mora
          </h4>
          <p class="text-sm mb-4" style="color:#6B7280">
            Define qué conceptos generan interés de mora y la tasa mensual aplicable sobre saldos vencidos.
          </p>
          <div class="form-group">
            <label class="form-label">Tasa de Mora (% mensual)</label>
            <input id="ph-late-rate" type="number" min="0" max="100" step="0.01" class="form-input" 
              value="${phCfg.late_fee_rate || 2}" placeholder="2">
            <p class="text-xs mt-1" style="color:#6B7280">Ingresa el valor entero. Ej: <strong>2</strong> para aplicar el 2% mensual sobre el saldo vencido.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Ingreso para Intereses de Mora</label>
            <select id="ph-late-income" class="form-input font-mono">${accountOptions(incomeAccounts, lateFeeIncomeCode)}</select>
            <p class="text-xs mt-1" style="color:#6B7280">Cuenta clase 4 donde se contabilizarán los intereses de mora.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Conceptos que generan mora</label>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:8px;margin-top:8px">
              ${concepts.filter(c => c.active !== false).map(c => `
                <label class="flex items-center gap-2 p-3 rounded-lg" style="background:#F8FAFF;border:1px solid #E5E7EB;cursor:pointer">
                  <input type="checkbox" class="ph-mora-concept" value="${esc(c.id)}" 
                    ${(phCfg.late_fee_concepts || []).includes(c.id) ? 'checked' : ''}>
                  <span class="text-sm font-medium">${esc(c.code)} — ${esc(c.name)}</span>
                </label>`).join('')}
            </div>
          </div>
          <button class="btn btn-primary mt-4" id="ph-mora-save-btn">
            <i class="fas fa-save mr-1"></i>Guardar Configuración de Mora
          </button>
        </div>

        <!-- Conceptos Individuales -->
        <div class="bg-white rounded-2xl border p-5 lg:col-span-2" style="border-color:#F0F0F0">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-bold" style="color:#0D2137">
              <i class="fas fa-receipt mr-2" style="color:#7F7CFF"></i>Conceptos Individuales
            </h4>
            <button class="btn btn-primary btn-sm" id="ph-individual-concept-add-btn">
              <i class="fas fa-plus mr-1"></i>Nuevo concepto individual
            </button>
          </div>
          <p class="text-sm mb-4" style="color:#6B7280">
            Conceptos que se añaden manualmente a facturas individuales en borrador (sanciones, servicios adicionales, etc.).
            No se agregan automáticamente; se seleccionan por unidad luego de generar las facturas del período.
          </p>
          <div class="overflow-x-auto">
            <table class="data-table text-sm">
              <thead>
                <tr>
                  <th>Código</th><th>Nombre</th><th>Descripción</th><th class="text-right">Valor ref.</th>
                  <th>Cuenta ingreso</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody id="ph-ind-concepts-tbody">
                ${renderPhIndividualConceptRows(indConcepts, accounts)}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;

    // Guardar plantilla de correo y avisos
    document.getElementById('ph-cfg-save-email-btn')?.addEventListener('click', async () => {
      const subj = ((document.getElementById('ph-cfg-email-subject') as HTMLInputElement)?.value || '').trim();
      const body = ((document.getElementById('ph-cfg-email-body') as HTMLTextAreaElement)?.value || '').trim();
      const noti = ((document.getElementById('ph-cfg-email-notice') as HTMLTextAreaElement)?.value || '').trim();
      const btn = document.getElementById('ph-cfg-save-email-btn') as HTMLButtonElement;
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...'; }
      try {
        await Promise.all([
          API.setSetting('ph_email_template_invoice_subject', subj),
          API.setSetting('ph_email_template_invoice_body', body),
          API.setSetting('ph_email_monthly_notice', noti),
        ]);
        showToast('Plantilla de correo y avisos guardados exitosamente.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Error al guardar plantilla.', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar Plantilla de Correo'; }
      }
    });

    // Helper para insertar tokens en el campo enfocado
    let lastFocusedConfigInput: HTMLInputElement | HTMLTextAreaElement | null = document.getElementById('ph-cfg-email-body') as HTMLTextAreaElement;
    ['ph-cfg-email-subject', 'ph-cfg-email-body', 'ph-cfg-email-notice'].forEach(id => {
      document.getElementById(id)?.addEventListener('focus', (e) => {
        lastFocusedConfigInput = e.target as any;
      });
    });
    document.querySelectorAll('#ph-cfg-email-tokens .ph-token-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const token = btn.getAttribute('data-token');
        if (!token || !lastFocusedConfigInput) return;
        const start = lastFocusedConfigInput.selectionStart || 0;
        const end = lastFocusedConfigInput.selectionEnd || 0;
        const text = lastFocusedConfigInput.value;
        lastFocusedConfigInput.value = text.substring(0, start) + token + text.substring(end);
        lastFocusedConfigInput.focus();
        lastFocusedConfigInput.selectionStart = lastFocusedConfigInput.selectionEnd = start + token.length;
      });
    });

    // Guardar parámetros de facturación (Pie de factura)
    document.getElementById('ph-cfg-save-note-btn')?.addEventListener('click', async () => {
      const noteVal = ((document.getElementById('ph-cfg-footer-note') as HTMLTextAreaElement)?.value || '').trim();
      const btn = document.getElementById('ph-cfg-save-note-btn') as HTMLButtonElement;
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...'; }
      try {
        const cfg = { ...phCfg, invoice_footer_note: noteVal };
        await Promise.all([
          API.setSetting('ph_config_v1', JSON.stringify(cfg)),
          API.setSetting('ph_invoice_footer_note', noteVal),
        ]);
        phCfg.invoice_footer_note = noteVal;
        showToast('Parámetros de facturación guardados exitosamente.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Error al guardar parámetros.', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar Parámetros de Facturación'; }
      }
    });

    // Guardar config contable
    document.getElementById('ph-cfg-save-btn')?.addEventListener('click', async () => {
      const cxc    = (document.getElementById('ph-cfg-cxc')?.value    || '').trim();
      const income = (document.getElementById('ph-cfg-income')?.value  || '').trim();
      const anticipo = (document.getElementById('ph-cfg-anticipo')?.value || '').trim();
      const noteVal = ((document.getElementById('ph-cfg-footer-note') as HTMLTextAreaElement)?.value || '').trim();
      if (!cxc || !income) { showToast('Completa la cuenta CxC y la cuenta de ingreso.', 'warning'); return; }
      if (!accountByCode.has(cxc) || !accountByCode.has(income)) {
        showToast('Selecciona cuentas válidas del PUC activo.', 'warning');
        return;
      }
      if (!cxc.startsWith('1')) {
        showToast('La cuenta CxC debe ser de clase 1 (Activo).', 'warning');
        return;
      }
      if (!income.startsWith('4')) {
        showToast('La cuenta de ingreso debe ser de clase 4 (Ingreso).', 'warning');
        return;
      }
      const btn = document.getElementById('ph-cfg-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
      try {
        // Obtener el account_id del anticipo (para el backend que usa ID no código)
        let anticipoAccountId = null;
        if (anticipo) {
          try {
            const antiRes = await pb.listAll('accounts', { filter: `code="${anticipo}"`, perPage: 1 });
            if (antiRes.length) anticipoAccountId = antiRes[0].id;
          } catch(_) {}
        }
        const cruceTxTypeId = ((document.getElementById('ph-cfg-cruce-tx-type') as HTMLSelectElement)?.value || '').trim() || null;
        const cfg = {
          ...phCfg,
          cxc_code: cxc,
          income_code: income,
          anticipo_account_code: anticipo || null,
          anticipo_account_id: anticipoAccountId,
          cruce_anticipo_tx_type_id: cruceTxTypeId,
          invoice_footer_note: noteVal
        };
        await Promise.all([
          API.setSetting('ph_config_v1', JSON.stringify(cfg)),
          API.setSetting('ph_invoice_footer_note', noteVal),
        ]);
        phCfg = cfg;
        showToast('Configuración contable guardada.', 'success');
      } catch (err) {
        showToast(err.message || 'Error.', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar Cuentas Contables'; }
      }
    });

    // Guardar config de mora
    document.getElementById('ph-mora-save-btn')?.addEventListener('click', async () => {
      const rate = parseFloat(document.getElementById('ph-late-rate')?.value || 0.5) || 0.5;
      const lateIncome = (document.getElementById('ph-late-income')?.value || '').trim();
      const selectedConcepts = Array.from(document.querySelectorAll('.ph-mora-concept:checked')).map(cb => cb.value);
      if (!lateIncome) {
        showToast('Selecciona la cuenta de ingreso para mora.', 'warning');
        return;
      }
      if (!accountByCode.has(lateIncome) || !lateIncome.startsWith('4')) {
        showToast('La cuenta de mora debe existir en el PUC activo y ser clase 4.', 'warning');
        return;
      }
      const btn = document.getElementById('ph-mora-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
      try {
        const cfg = {
          ...phCfg,
          late_fee_rate: rate,
          late_fee_concepts: selectedConcepts,
          late_fee_income_code: lateIncome,
        };
        await API.setSetting('ph_config_v1', JSON.stringify(cfg));
        showToast('Configuración de mora guardada.', 'success');
      } catch (err) {
        showToast(err.message || 'Error.', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar Configuración de Mora'; }
      }
    });

    // Conceptos individuales — botones
    document.getElementById('ph-individual-concept-add-btn')?.addEventListener('click', () => openPhIndividualConceptModal(null, c, accounts));
    c.querySelectorAll('.ph-ind-concept-edit').forEach(btn => {
      btn.addEventListener('click', () => openPhIndividualConceptModal(btn.dataset.id, c, accounts));
    });
    c.querySelectorAll('.ph-ind-concept-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const active = btn.dataset.active === 'true';
        await pb.update('ph_individual_charges', btn.dataset.id, { active: !active });
        showToast(`Concepto ${active ? 'desactivado' : 'activado'}.`, 'success');
        renderPhConfig(c);
      });
    });

    // Zonas comunes
    document.getElementById('ph-area-add-btn')?.addEventListener('click', () => openPhAreaModal(null, c));
    c.querySelectorAll('.ph-area-edit').forEach(btn => {
      btn.addEventListener('click', () => openPhAreaModal(btn.dataset.id, c));
    });
    c.querySelectorAll('.ph-area-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const active = btn.dataset.active === 'true';
        await pb.update('ph_common_areas', btn.dataset.id, { active: !active });
        showToast(`Zona ${active ? 'desactivada' : 'activada'}.`, 'success');
        renderPhConfig(c);
      });
    });

    // Conceptos
    document.getElementById('ph-concept-add-btn')?.addEventListener('click', () => openPhConceptModal(null, c, accounts));
    c.querySelectorAll('.ph-concept-edit').forEach(btn => {
      btn.addEventListener('click', () => openPhConceptModal(btn.dataset.id, c, accounts));
    });
    c.querySelectorAll('.ph-concept-toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const active = btn.dataset.active === 'true';
        await pb.update('ph_billing_concepts', btn.dataset.id, { active: !active });
        showToast(`Concepto ${active ? 'desactivado' : 'activado'}.`, 'success');
        renderPhConfig(c);
      });
    });

  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

function renderPhAreasList(areas, c) {
  if (!areas.length) {
    return `<p class="text-sm text-center py-4" style="color:#9CA3AF">No hay zonas comunes registradas.</p>`;
  }
  return `<div class="space-y-2">
    ${areas.map(a => `
      <div class="flex items-center justify-between p-3 rounded-xl" style="background:#F8FAFF">
        <div>
          <p class="font-semibold text-sm" style="color:#0D2137">${esc(a.name)}</p>
          <p class="text-xs" style="color:#6B7280">${a.capacity ? `Cap: ${a.capacity} pers.` : ''}${a.description ? ` · ${esc(a.description)}` : ''}</p>
        </div>
        <div class="flex gap-1">
          <span class="badge ${a.active !== false ? 'badge-green' : 'badge-gray'} mr-2">
            ${a.active !== false ? 'Activa' : 'Inactiva'}
          </span>
          <button class="btn btn-outline btn-sm ph-area-edit" data-id="${esc(a.id)}" title="Editar"><i class="fas fa-pen"></i></button>
          <button class="btn btn-outline btn-sm ph-area-toggle" data-id="${esc(a.id)}"
            data-active="${a.active !== false}"
            style="${a.active !== false ? 'color:#DC2626;border-color:#FECACA' : 'color:#059669;border-color:#6EE7B7'}" title="${a.active !== false ? 'Desactivar' : 'Activar'}">
            <i class="fas ${a.active !== false ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
          </button>
        </div>
      </div>`).join('')}
  </div>`;
}

function renderPhIndividualConceptRows(concepts, accounts) {
  if (!concepts.length) {
    return `<tr><td colspan="6" class="text-center py-8" style="color:#9CA3AF">No hay conceptos individuales. Crea el primero.</td></tr>`;
  }
  const accByCode = new Map((accounts || []).map(a => [String(a.code || ''), a]));
  return concepts.map(con => {
    const active = con.active !== false;
    const effectiveAccCode = getIndividualConceptAccountCode(con);
    const accName = effectiveAccCode ? (accByCode.get(effectiveAccCode)?.name || effectiveAccCode) : '—';
    return `<tr>
      <td class="font-mono text-xs font-bold">${esc(con.code || 'GEN')}</td>
      <td class="font-semibold" style="color:#0D2137">${esc(con.name || con.description || '—')}</td>
      <td class="text-xs" style="color:#6B7280">${esc(con.description || '')}</td>
      <td class="text-right font-semibold">${con.amount ? fmt(con.amount) : '—'}</td>
      <td class="font-mono text-xs">${effectiveAccCode ? esc(effectiveAccCode + ' — ' + accName) : '—'}</td>
      <td><span class="badge ${active ? 'badge-green' : 'badge-gray'}">${active ? 'Activo' : 'Inactivo'}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-ind-concept-edit" data-id="${esc(con.id)}" title="Editar"><i class="fas fa-pen"></i></button>
          <button class="btn btn-outline btn-sm ph-ind-concept-toggle" data-id="${esc(con.id)}"
            data-active="${active}"
            style="${active ? 'color:#DC2626;border-color:#FECACA' : 'color:#059669;border-color:#6EE7B7'}">
            <i class="fas ${active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

function getIndividualConceptAccountCode(concept) {
  const direct = String(concept?.account_code || '').trim();
  if (direct) return direct;
  const notes = String(concept?.notes || '');
  const m = notes.match(/\[ACC:([^\]]+)\]/i);
  return m ? String(m[1] || '').trim() : '';
}

function upsertIndividualConceptAccInNotes(notes, accountCode) {
  const clean = String(notes || '').replace(/\[ACC:[^\]]+\]\s*/ig, '').trim();
  const code = String(accountCode || '').trim();
  if (!code) return clean;
  return `[ACC:${code}]${clean ? ' ' + clean : ''}`;
}

function renderPhConceptRows(concepts, accounts) {
  if (!concepts.length) {
    return `<tr><td colspan="7" class="text-center py-8" style="color:#9CA3AF">No hay conceptos de facturación. Crea el primero.</td></tr>`;
  }
  return concepts.map(con => {
    const acc    = con.expand?.account_id;
    const active = con.active !== false;
    return `<tr>
      <td class="font-mono text-xs font-bold">${esc(con.code)}</td>
      <td class="font-semibold" style="color:#0D2137">${esc(con.name)}</td>
      <td class="text-right font-semibold">${fmt(con.amount || 0)}</td>
      <td class="text-center">${con.applies_coef ? '<i class="fas fa-check text-green-500"></i>' : '<i class="fas fa-minus text-gray-300"></i>'}</td>
      <td class="font-mono text-xs">${acc ? esc(acc.code + ' — ' + acc.name) : '—'}</td>
      <td><span class="badge ${active ? 'badge-green' : 'badge-gray'}">${active ? 'Activo' : 'Inactivo'}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-concept-edit" data-id="${esc(con.id)}" title="Editar"><i class="fas fa-pen"></i></button>
          <button class="btn btn-outline btn-sm ph-concept-toggle" data-id="${esc(con.id)}"
            data-active="${active}"
            style="${active ? 'color:#DC2626;border-color:#FECACA' : 'color:#059669;border-color:#6EE7B7'}">
            <i class="fas ${active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function openPhAreaModal(areaId, container) {
  let area = null;
  try {
    if (areaId) area = await pb.get('ph_common_areas', areaId);
  } catch (err) { showToast('Error al cargar zona.', 'error'); return; }

  openModal(
    area ? 'Editar Zona Común' : 'Nueva Zona Común',
    `<div class="grid grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span class="text-red-500">*</span></label>
        <input id="pa-code" class="form-input" value="${esc(area?.code || '')}" placeholder="Ej: SALON, PISCINA">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span class="text-red-500">*</span></label>
        <input id="pa-name" class="form-input" value="${esc(area?.name || '')}" placeholder="Ej: Salón Comunal">
      </div>
      <div class="form-group">
        <label class="form-label">Capacidad (personas)</label>
        <input id="pa-cap" type="number" min="0" class="form-input" value="${esc(area?.capacity ?? '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Horas mín. de reserva</label>
        <input id="pa-minhrs" type="number" min="0" step="0.5" class="form-input" value="${esc(area?.min_hours ?? '')}">
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Descripción</label>
        <input id="pa-desc" class="form-input" value="${esc(area?.description || '')}" placeholder="Breve descripción de la zona">
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Reglamento / Reglas de uso</label>
        <textarea id="pa-rules" class="form-input" rows="3" placeholder="Reglas de uso de la zona común...">${esc(area?.rules || '')}</textarea>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pa-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`
  );

  setTimeout(() => {
    document.getElementById('pa-save-btn')?.addEventListener('click', async () => {
      const code = (document.getElementById('pa-code')?.value || '').trim().toUpperCase();
      const name = (document.getElementById('pa-name')?.value || '').trim();
      if (!code || !name) { showToast('Código y nombre son obligatorios.', 'warning'); return; }
      const btn = document.getElementById('pa-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
      try {
        const data = {
          code, name,
          capacity:    parseInt(document.getElementById('pa-cap')?.value   || 0) || 0,
          min_hours:   parseFloat(document.getElementById('pa-minhrs')?.value || 0) || 0,
          description: document.getElementById('pa-desc')?.value  || '',
          rules:       document.getElementById('pa-rules')?.value || '',
          active:      true,
        };
        if (area) {
          await pb.update('ph_common_areas', area.id, data);
          showToast('Zona actualizada.', 'success');
        } else {
          await pb.create('ph_common_areas', data);
          showToast('Zona creada.', 'success');
        }
        closeModal();
        renderPhConfig(container);
      } catch (err) {
        showToast(err.message || 'Error.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
      }
    }, { once: true });
  }, 50);
}

async function openPhConceptModal(conceptId, container, accountsPreloaded) {
  let concept  = null;
  let accounts = accountsPreloaded || [];
  try {
    if (conceptId) concept = await pb.get('ph_billing_concepts', conceptId, { expand: 'account_id' });
    if (!accounts.length) accounts = await API.getAccounts(true);
  } catch (err) { showToast('Error al cargar datos.', 'error'); return; }

  // Filtrar solo cuentas de ingresos (clase 4) para el selector
  const incomeAccounts = accounts.filter(a => String(a.code || '').startsWith('4') || String(a.code || '').startsWith('41'));

  openModal(
    concept ? 'Editar Concepto' : 'Nuevo Concepto de Facturación',
    `<div class="grid grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span class="text-red-500">*</span></label>
        <input id="pc-code" class="form-input" value="${esc(concept?.code || '')}" placeholder="Ej: ADM, FIM">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span class="text-red-500">*</span></label>
        <input id="pc-name" class="form-input" value="${esc(concept?.name || '')}" placeholder="Ej: Cuota de administración">
      </div>
      <div class="form-group">
        <label class="form-label">Valor Base <span class="text-red-500">*</span></label>
        <input id="pc-amount" type="number" min="0" step="1" class="form-input"
          value="${esc(concept?.amount ?? '')}" placeholder="0">
      </div>
      <div class="form-group">
        <label class="form-label">¿Aplicar coeficiente de participación?</label>
        <select id="pc-coef" class="form-input">
          <option value="false" ${!concept?.applies_coef ? 'selected' : ''}>No — Valor fijo igual para todos</option>
          <option value="true"  ${concept?.applies_coef   ? 'selected' : ''}>Sí — Proporcional al coeficiente</option>
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Cuenta de Ingreso (opcional)</label>
        <select id="pc-account" class="form-input">
          <option value="">— Usar cuenta por defecto —</option>
          ${accounts.filter(a => String(a.code||'').startsWith('4')).map(a =>
            `<option value="${esc(a.id)}" ${concept?.account_id === a.id ? 'selected' : ''}>
              ${esc(a.code)} — ${esc(a.name)}
            </option>`).join('')}
        </select>
        <p class="text-xs mt-1" style="color:#6B7280">Solo cuentas de ingresos (clase 4). Si no seleccionas, se usa la cuenta por defecto.</p>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Descripción</label>
        <input id="pc-desc" class="form-input" value="${esc(concept?.description || '')}" placeholder="Descripción del concepto">
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pc-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`
  );

  setTimeout(() => {
    document.getElementById('pc-save-btn')?.addEventListener('click', async () => {
      const code   = (document.getElementById('pc-code')?.value   || '').trim().toUpperCase();
      const name   = (document.getElementById('pc-name')?.value   || '').trim();
      const amount = parseFloat(document.getElementById('pc-amount')?.value || 0) || 0;
      if (!code || !name || !amount) { showToast('Código, nombre y valor son obligatorios.', 'warning'); return; }
      const btn = document.getElementById('pc-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
      try {
        const data = {
          code, name, amount,
          applies_coef: document.getElementById('pc-coef')?.value === 'true',
          account_id:   document.getElementById('pc-account')?.value || null,
          description:  document.getElementById('pc-desc')?.value    || '',
          active:       true,
        };
        if (concept) {
          await pb.update('ph_billing_concepts', concept.id, data);
          showToast('Concepto actualizado.', 'success');
        } else {
          await pb.create('ph_billing_concepts', data);
          showToast('Concepto creado.', 'success');
        }
        closeModal();
        renderPhConfig(container);
      } catch (err) {
        showToast(err.message || 'Error.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
      }
    }, { once: true });
  }, 50);
}

// ══════════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════════
// AÑADIR CONCEPTOS INDIVIDUALES A UNA FACTURA EN BORRADOR
// ══════════════════════════════════════════════════════════════════════════════
async function openPhAddIndividualLinesModal(invoiceId) {
  let inv = null;
  let concepts = [];
  try {
    [inv, concepts] = await Promise.all([
      pb.get('ph_invoices', invoiceId, { expand: 'property_id' }),
      API.getPhIndividualCharges({ filter: '' }),
    ]);
    concepts = (concepts?.items || []).filter(c => c?.active !== false);
  } catch (err) { showToast('Error al cargar datos.', 'error'); return; }

  if (!concepts.length) {
    showToast('No hay conceptos individuales activos. Crea al menos uno en Configuración.', 'warning');
    return;
  }

  const prop = inv.expand?.property_id;
  const propLabel = prop ? `${esc(prop.name || prop.code || '')}` : esc(inv.property_id);
  const sortedConcepts = concepts.slice().sort((a, b) => {
    const an = String(a?.name || a?.description || '').toLowerCase();
    const bn = String(b?.name || b?.description || '').toLowerCase();
    return an.localeCompare(bn);
  });

  openModal(
    `Añadir conceptos individuales — ${propLabel}`,
    `<div class="space-y-3">
      <p class="text-sm" style="color:#6B7280">
        Selecciona los conceptos a añadir y ajusta el valor si es necesario.
        Solo se puede modificar facturas en estado <strong>Borrador</strong>.
      </p>
      <div class="space-y-2" id="ph-add-ind-list">
        ${sortedConcepts.map((con, i) => {
          const effectiveAccCode = getIndividualConceptAccountCode(con);
          return `
          <div class="flex items-center gap-3 p-3 rounded-lg" style="background:#F8FAFF;border:1px solid #E5E7EB">
            <input type="checkbox" class="ph-add-ind-check" id="pic-chk-${i}"
              data-idx="${i}" data-name="${esc(con.name || con.description || '')}"
              data-code="${esc(con.code || 'GEN')}"
              data-account="${esc(effectiveAccCode || '')}" style="width:18px;height:18px;cursor:pointer">
            <label for="pic-chk-${i}" class="flex-1 cursor-pointer">
              <p class="font-medium text-sm" style="color:#0D2137"><span class="badge badge-gray mr-2">${esc(con.code || 'GEN')}</span>${esc(con.name || con.description || '—')}</p>
              ${con.description ? `<p class="text-xs" style="color:#9CA3AF">${esc(con.description)}</p>` : ''}
            </label>
            <input type="number" class="form-input ph-add-ind-amount" data-idx="${i}"
              min="0" step="1" style="max-width:130px;text-align:right"
              value="${esc(con.amount || '')}" placeholder="Valor">
          </div>`;
        }).join('')}
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-add-ind-confirm-btn">
       <i class="fas fa-plus-circle mr-1"></i>Añadir a factura
     </button>`
  );

  setTimeout(() => {
    document.getElementById('ph-add-ind-confirm-btn')?.addEventListener('click', async () => {
      const selected = [];
      document.querySelectorAll('.ph-add-ind-check:checked').forEach(chk => {
        const idx = chk.dataset.idx;
        const amountEl = document.querySelector(`.ph-add-ind-amount[data-idx="${idx}"]`);
        const amount = parseFloat(amountEl?.value || 0) || 0;
        if (amount <= 0) return; // skip conceptos sin valor
        selected.push({
          description: `[${chk.dataset.code || 'GEN'}] ${chk.dataset.name}`,
          amount,
          account_code: chk.dataset.account || '',
        });
      });
      if (!selected.length) {
        showToast('Selecciona al menos un concepto con valor mayor a 0.', 'warning');
        return;
      }
      const btn = document.getElementById('ph-add-ind-confirm-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
      try {
        const newTotal = await API.addPhIndividualLinesToInvoice(invoiceId, selected);
        showToast(`${selected.length} concepto(s) añadido(s). Nuevo total: ${fmt(newTotal)}`, 'success');
        closeModal();
        // Actualizar celda de total en la fila
        const row = document.querySelector(`tr[data-id="${CSS.escape(invoiceId)}"]`);
        if (row) {
          row.querySelector('td:nth-child(5)').textContent = fmt(newTotal);
        }
      } catch (err) {
        showToast(err.message || 'Error al añadir conceptos.', 'error');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus-circle mr-1"></i>Añadir a factura'; }
      }
    }, { once: true });
  }, 50);
}

// ══════════════════════════════════════════════════════════════════════════════
// CONCEPTOS INDIVIDUALES (manuales, seleccionables por unidad al liquidar)
// ══════════════════════════════════════════════════════════════════════════════
async function openPhIndividualConceptModal(conceptId, container, accountsPreloaded) {
  let concept  = null;
  let accounts = accountsPreloaded || [];
  let properties = [];
  try {
    if (conceptId) concept = await pb.get('ph_individual_charges', conceptId);
    if (!accounts.length) accounts = await API.getAccounts(true);
    properties = await API.getPhProperties(true);
  } catch (err) { showToast('Error al cargar datos.', 'error'); return; }

  const conceptAccCode = getIndividualConceptAccountCode(concept);
  openModal(
    concept ? 'Editar Concepto Individual' : 'Nuevo Concepto Individual',
    `<div class="grid grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span class="text-red-500">*</span></label>
        <input id="pic-code" class="form-input" value="${esc(concept?.code || '')}"
          placeholder="Ej: MUL, PAR">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre <span class="text-red-500">*</span></label>
        <input id="pic-name" class="form-input" value="${esc(concept?.name || concept?.description || '')}"
          placeholder="Ej: Sanción de convivencia, Parqueadero extra">
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Descripción</label>
        <input id="pic-desc" class="form-input" value="${esc(concept?.description || '')}"
          placeholder="Descripción adicional del concepto">
      </div>
      <div class="form-group">
        <label class="form-label">Valor de referencia</label>
        <input id="pic-amount" type="number" min="0" step="1" class="form-input"
          value="${esc(concept?.amount || '')}" placeholder="0 (ajustable al aplicar)">
        <p class="text-xs mt-1" style="color:#6B7280">Opcional. Se puede modificar al añadir a cada factura.</p>
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="pic-active" class="form-input">
          <option value="true"  ${concept?.active !== false ? 'selected' : ''}>Activo</option>
          <option value="false" ${concept?.active === false ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Cuenta de Ingreso (opcional)</label>
        <select id="pic-account" class="form-input font-mono">
          <option value="">— Usar cuenta por defecto de la configuración —</option>
          ${accounts.filter(a => String(a.code||'').startsWith('4')).map(a =>
            `<option value="${esc(a.code)}" ${conceptAccCode === a.code ? 'selected' : ''}>
              ${esc(a.code)} — ${esc(a.name)}
            </option>`).join('')}
        </select>
        <p class="text-xs mt-1" style="color:#6B7280">Cuenta clase 4. Si no seleccionas, se usa la cuenta de ingreso por defecto al contabilizar.</p>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pic-save-btn"><i class="fas fa-save mr-1"></i>${concept ? 'Actualizar' : 'Crear'}</button>`
  );

  setTimeout(() => {
    document.getElementById('pic-save-btn')?.addEventListener('click', async () => {
      const code   = (document.getElementById('pic-code')?.value || '').trim().toUpperCase();
      const name   = (document.getElementById('pic-name')?.value || '').trim();
      const desc   = (document.getElementById('pic-desc')?.value || '').trim();
      const amount = parseFloat(document.getElementById('pic-amount')?.value || 0) || 0;
      const active = document.getElementById('pic-active')?.value !== 'false';
      const accCode = (document.getElementById('pic-account')?.value || '').trim();
      if (!name || !code) { showToast('El código y el nombre son obligatorios.', 'warning'); return; }
      const btn = document.getElementById('pic-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
      try {
        const fallbackPropertyId = concept?.property_id || properties?.[0]?.id || '';
        const data: Record<string, any> = {
          // Esquema nuevo
          code: code || 'GEN',
          name,
          description: desc || name,
          amount: amount || 0,
          active,
          account_code: accCode || '',
          // Compatibilidad con esquema legado (evita 400 si aún no aplicó migración)
          period: concept?.period || currentPeriod(),
          notes: upsertIndividualConceptAccInNotes(concept?.notes || '', accCode),
        };
        if (fallbackPropertyId) {
          data.property_id = fallbackPropertyId;
        }
        if (concept) {
          await pb.update('ph_individual_charges', concept.id, data);
          showToast('Concepto actualizado.', 'success');
        } else {
          await pb.create('ph_individual_charges', data);
          showToast('Concepto creado. Disponible para añadir a facturas en borrador.', 'success');
        }
        closeModal();
        renderPhConfig(container);
      } catch (err) {
        showToast(err.message || 'Error al guardar. Si persiste, reinicia el servidor para aplicar la migración.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = concept ? 'Actualizar' : 'Crear'; }
      }
    }, { once: true });
  }, 50);
}

async function renderPhFacturacionPage(c) {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-file-invoice-dollar mr-2" style="color:#7F7CFF"></i>Facturación PH
        </h3>
        <p class="text-sm" style="color:#6B7280">Propiedad Horizontal — Gestión y generación de facturas mensuales por unidad.</p>
      </div>
    </div>
    <div id="ph-facturacion-inner"></div>`;
  renderPhFacturacion(c.querySelector('#ph-facturacion-inner'));
}

async function renderPhCarteraPage(c) {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-wallet mr-2" style="color:#1A4B8C"></i>Cartera PH
        </h3>
        <p class="text-sm" style="color:#6B7280">Propiedad Horizontal — Control de cartera, saldos por concepto y edades.</p>
      </div>
    </div>
    <div id="ph-cartera-inner"></div>`;
  renderPhCartera(c.querySelector('#ph-cartera-inner'));
}

async function renderPhPresupuestoPage(c) {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-sack-dollar mr-2" style="color:#059669"></i>Presupuesto PH
        </h3>
        <p class="text-sm" style="color:#6B7280">Propiedad Horizontal — Presupuesto anual y comparación de ejecución.</p>
      </div>
    </div>
    <div id="ph-presupuesto-inner"></div>`;
  renderPhPresupuesto(c.querySelector('#ph-presupuesto-inner'));
}

async function renderPhUnidadesPage(c) {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-building mr-2" style="color:#7F7CFF"></i>Unidades PH
        </h3>
        <p class="text-sm" style="color:#6B7280">Propiedad Horizontal — Administración de unidades habitacionales y coeficientes.</p>
      </div>
    </div>
    <div id="ph-unidades-inner"></div>`;
  renderPhUnidades(c.querySelector('#ph-unidades-inner'));
}

async function renderPhReservasPage(c) {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-calendar-days mr-2" style="color:#1A4B8C"></i>Reservas PH
        </h3>
        <p class="text-sm" style="color:#6B7280">Propiedad Horizontal — Reservación de zonas comunes y control de depósitos.</p>
      </div>
    </div>
    <div id="ph-reservas-inner"></div>`;
  renderPhReservas(c.querySelector('#ph-reservas-inner'));
}

async function renderPhPqrsPage(c) {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-comments mr-2" style="color:#059669"></i>PQRs PH
        </h3>
        <p class="text-sm" style="color:#6B7280">Propiedad Horizontal — Peticiones, Quejas, Reclamos y Sugerencias de copropietarios.</p>
      </div>
    </div>
    <div id="ph-pqrs-inner"></div>`;
  renderPhPqrs(c.querySelector('#ph-pqrs-inner'));
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderPhFacturacionPage = renderPhFacturacionPage;
(window as any).renderPhCarteraPage = renderPhCarteraPage;
(window as any).renderPhPresupuestoPage = renderPhPresupuestoPage;
(window as any).renderPhUnidadesPage = renderPhUnidadesPage;
(window as any).renderPhReservasPage = renderPhReservasPage;
(window as any).renderPhPqrsPage = renderPhPqrsPage;
(window as any).postPhInvoiceConfirm = postPhInvoiceConfirm;
(window as any).renderPhIndividualConceptRows = renderPhIndividualConceptRows;
(window as any).PH_UNIT_TYPES = PH_UNIT_TYPES;
(window as any).renderPhConfig = renderPhConfig;
(window as any).attachPhInvActions = attachPhInvActions;
(window as any).PH_PQRS_STATUS = PH_PQRS_STATUS;
(window as any).phKpi = phKpi;
(window as any).attachPhPqrActions = attachPhPqrActions;
(window as any).openPhPostPeriodModal = openPhPostPeriodModal;
(window as any).getIndividualConceptAccountCode = getIndividualConceptAccountCode;
(window as any).voidPhInvoiceModal = voidPhInvoiceModal;
(window as any).openPhEditDraftLineModal = openPhEditDraftLineModal;
(window as any).renderPhFacturacion = renderPhFacturacion;
(window as any).renderPhUnitRows = renderPhUnitRows;
(window as any).removePhDraftLineConfirm = removePhDraftLineConfirm;
(window as any).renderPhAreasList = renderPhAreasList;
(window as any).renderCopropiedades = renderCopropiedades;
(window as any).openPhAreaModal = openPhAreaModal;
(window as any).openPhResModal = openPhResModal;
(window as any).openPhIndividualConceptModal = openPhIndividualConceptModal;
(window as any).openPhUnpostPeriodModal = openPhUnpostPeriodModal;
(window as any).openPhConceptModal = openPhConceptModal;
(window as any).openPhDeletePeriodModal = openPhDeletePeriodModal;
(window as any).upsertIndividualConceptAccInNotes = upsertIndividualConceptAccInNotes;
(window as any).openPhGenerateModal = openPhGenerateModal;
(window as any).attachPhResActions = attachPhResActions;
(window as any).openPhPqrModal = openPhPqrModal;
(window as any).renderPhPqrs = renderPhPqrs;
(window as any).PH_RES_STATUS = PH_RES_STATUS;
(window as any).renderPhCartera = renderPhCartera;

// ══════════════════════════════════════════════════════════════════════════════
// TAB: PRESUPUESTO
// ══════════════════════════════════════════════════════════════════════════════
async function renderPhPresupuesto(c) {
  c.innerHTML = `
    <div class="flex gap-1 mb-5">
      <button class="btn btn-outline active" id="ph-pres-list-tab">Listado de Presupuestos</button>
      <button class="btn btn-outline" id="ph-pres-exec-tab">Ejecución Presupuestal</button>
    </div>
    <div id="ph-pres-content"></div>`;

  const content = c.querySelector('#ph-pres-content');
  const tabs = {
    list: c.querySelector('#ph-pres-list-tab'),
    exec: c.querySelector('#ph-pres-exec-tab')
  };

  const switchSubTab = (t) => {
    Object.values(tabs).forEach(b => b.classList.remove('active', 'btn-primary'));
    tabs[t].classList.add('active', 'btn-primary');
    if (t === 'list') _renderPhPresList(content);
    if (t === 'exec') _renderPhPresExec(content);
  };

  tabs.list.addEventListener('click', () => switchSubTab('list'));
  tabs.exec.addEventListener('click', () => switchSubTab('exec'));
  switchSubTab('list');
}

async function _renderPhPresList(c) {
  c.innerHTML = `<div class="py-10 text-center"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>`;
  try {
    const budgets = await API.getPhBudgets();
    c.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <h4 class="font-bold">Presupuestos Anuales</h4>
        <div class="flex gap-2">
          <button class="btn btn-outline" onclick="if (typeof window.launchReportModal === 'function' && typeof window.renderDetailedBudgetExecutionReport === 'function') { window.launchReportModal('Ejecución Presupuestal Detallada', () => window.renderDetailedBudgetExecutionReport()); } else { window.showToast('Módulo de Reportes no cargado aún.', 'warning'); }">
            <i class="fas fa-chart-line mr-1 text-emerald-600"></i>Ejecución Detallada
          </button>
          <button class="btn btn-primary" onclick="openPhBudgetModal()">
            <i class="fas fa-plus mr-1"></i>Nuevo Presupuesto
          </button>
        </div>
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden">
        <table class="data-table">
          <thead>
            <tr>
              <th>Año</th><th>Nombre</th><th>Monto Total</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${budgets.map(b => `
              <tr>
                <td>${b.year}</td>
                <td>${esc(b.name)}</td>
                <td>${fmt(b.total_amount || 0)}</td>
                <td><span class="badge ${b.status === 'approved' ? 'badge-green' : 'badge-orange'}">${esc(b.status)}</span></td>
                <td>
                  <div class="flex gap-1">
                    <button class="btn btn-outline btn-sm" onclick="openPhBudgetModal('${b.id}')" title="Editar"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="printPhBudget('${b.id}')" title="Imprimir"><i class="fas fa-print"></i></button>
                    <button class="btn btn-outline btn-sm text-emerald-600 border-emerald-300" onclick="if (typeof window.launchReportModal === 'function' && typeof window.renderDetailedBudgetExecutionReport === 'function') { window.launchReportModal('Ejecución Presupuestal Detallada', () => window.renderDetailedBudgetExecutionReport('${b.id}', '${b.year}')); } else { window.showToast('Módulo de Reportes no cargado aún.', 'warning'); }" title="Ejecución Detallada"><i class="fas fa-chart-line"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
            ${budgets.length === 0 ? '<tr><td colspan="5" class="text-center py-10">No hay presupuestos registrados.</td></tr>' : ''}
          </tbody>
        </table>
      </div>`;
  } catch (err) {
    c.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
  }
}

async function openPhBudgetModal(id = null) {
  let budget = { name: '', year: new Date().getFullYear(), status: 'draft', total_amount: 0 };
  let lines = [];
  
  if (id) {
    try {
      budget = await pb.get('ph_budgets', id);
      lines = await API.getPhBudgetLines(id);
    } catch (err) { return showToast(err.message, 'error'); }
  }

  const accounts = await API.getAccounts();

  openModal(
    id ? 'Editar Presupuesto' : 'Nuevo Presupuesto',
    `
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="form-group">
        <label class="form-label">Año</label>
        <input id="pres-year" type="number" class="form-input" value="${budget.year}">
      </div>
      <div class="form-group">
        <label class="form-label">Nombre</label>
        <input id="pres-name" class="form-input" value="${esc(budget.name)}" placeholder="Ej: Presupuesto 2026">
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="pres-status" class="form-input">
          <option value="draft" ${budget.status === 'draft' ? 'selected' : ''}>Borrador</option>
          <option value="approved" ${budget.status === 'approved' ? 'selected' : ''}>Aprobado</option>
        </select>
      </div>
    </div>
    <div class="mb-2 flex justify-between items-center">
      <h5 class="font-bold text-sm">Cuentas y Montos</h5>
      <button class="btn btn-sm btn-outline" id="add-pres-line"><i class="fas fa-plus mr-1"></i>Añadir Cuenta</button>
    </div>
    <div class="overflow-x-auto" style="max-height: 400px">
      <table class="data-table text-sm" id="pres-lines-table">
        <thead>
          <tr>
            <th>Cuenta (PUC)</th><th class="text-right">Monto Anual</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${lines.map((l, idx) => `
            <tr data-idx="${idx}">
              <td>
                <select class="form-input pres-acc-select" style="min-width: 250px">
                  ${accounts.map(a => `<option value="${a.id}" ${l.account_id === a.id ? 'selected' : ''}>${a.code} - ${esc(a.name)}</option>`).join('')}
                </select>
              </td>
              <td><input type="number" class="form-input text-right pres-amount" value="${l.annual_amount}"></td>
              <td><button class="btn btn-danger btn-sm remove-line"><i class="fas fa-trash"></i></button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    `,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="save-pres-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`
  );

  const table = document.getElementById('pres-lines-table').querySelector('tbody');
  
  document.getElementById('add-pres-line').addEventListener('click', () => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <select class="form-input pres-acc-select" style="min-width: 250px">
          ${accounts.map(a => `<option value="${a.id}">${a.code} - ${esc(a.name)}</option>`).join('')}
        </select>
      </td>
      <td><input type="number" class="form-input text-right pres-amount" value="0"></td>
      <td><button class="btn btn-danger btn-sm remove-line"><i class="fas fa-trash"></i></button></td>
    `;
    table.appendChild(tr);
    tr.querySelector('.remove-line').addEventListener('click', () => tr.remove());
  });

  table.querySelectorAll('.remove-line').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('tr').remove());
  });

  document.getElementById('save-pres-btn').addEventListener('click', async () => {
    const btn = document.getElementById('save-pres-btn');
    const newLines = [];
    table.querySelectorAll('tr').forEach(tr => {
      newLines.push({
        account_id: tr.querySelector('.pres-acc-select').value,
        annual_amount: parseFloat(tr.querySelector('.pres-amount').value) || 0
      });
    });

    const total = newLines.reduce((s, l) => s + l.annual_amount, 0);
    const data = {
      id,
      year: parseInt(document.getElementById('pres-year').value),
      name: document.getElementById('pres-name').value,
      status: document.getElementById('pres-status').value,
      total_amount: total
    };

    if (!data.name || !data.year) return showToast('Nombre y Año son requeridos', 'warning');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Guardando...';
    try {
      await API.savePhBudget(data, newLines);
      showToast('Presupuesto guardado correctamente', 'success');
      closeModal();
      _renderPhPresList(document.getElementById('ph-pres-content'));
    } catch (err) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar';
    }
  });
}

async function _renderPhPresExec(c) {
  c.innerHTML = `<div class="py-10 text-center"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando comparativa...</div>`;
  try {
    const budgets = await API.getPhBudgets();
    if (budgets.length === 0) {
      c.innerHTML = `<div class="py-12 text-center text-gray-500">No hay presupuestos creados para comparar ejecución.</div>`;
      return;
    }

    c.innerHTML = `
      <div class="bg-white rounded-2xl border p-4 mb-4 flex gap-4 items-end">
        <div class="flex-1">
          <label class="form-label">Selecciona Presupuesto</label>
          <select id="exec-pres-id" class="form-input">
            ${budgets.map(b => `<option value="${b.id}" data-year="${b.year}">${b.year} - ${esc(b.name)}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary" id="refresh-exec-btn"><i class="fas fa-sync mr-1"></i>Actualizar</button>
      </div>
      <div id="exec-results"></div>`;

    const results = c.querySelector('#exec-results');
    const refresh = async () => {
      const select = document.getElementById('exec-pres-id');
      const bid = select.value;
      const year = select.options[select.selectedIndex].dataset.year;
      results.innerHTML = `<div class="py-10 text-center"><i class="fas fa-spinner fa-spin mr-2"></i>Calculando ejecución...</div>`;
      try {
        const data = await API.getBudgetExecution(bid, year);
        results.innerHTML = `
          <div class="bg-white rounded-2xl border overflow-hidden">
            <table class="data-table text-sm">
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th class="text-right">Presupuestado (Anual)</th>
                  <th class="text-right">Ejecutado (Acumulado)</th>
                  <th class="text-right">Diferencia</th>
                  <th class="text-right">% Ejec.</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(l => {
                  const diff = l.annual_amount - Math.abs(l.executed);
                  const perc = l.annual_amount > 0 ? (Math.abs(l.executed) / l.annual_amount * 100) : 0;
                  const color = perc > 100 ? 'text-red-600' : (perc > 90 ? 'text-orange-600' : 'text-green-600');
                  return `
                    <tr>
                      <td><span class="font-bold">${l.expand?.account_id?.code}</span> - ${esc(l.expand?.account_id?.name)}</td>
                      <td class="text-right font-semibold">${fmt(l.annual_amount)}</td>
                      <td class="text-right font-semibold">${fmt(Math.abs(l.executed))}</td>
                      <td class="text-right ${diff < 0 ? 'text-red-600' : ''}">${fmt(diff)}</td>
                      <td class="text-right font-bold ${color}">${perc.toFixed(1)}%</td>
                    </tr>
                  `;
                }).join('')}
                <tr class="bg-gray-50 font-bold">
                  <td>TOTALES</td>
                  <td class="text-right">${fmt(data.reduce((s, l) => s + l.annual_amount, 0))}</td>
                  <td class="text-right">${fmt(data.reduce((s, l) => s + Math.abs(l.executed), 0))}</td>
                  <td class="text-right">${fmt(data.reduce((s, l) => s + (l.annual_amount - Math.abs(l.executed)), 0))}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>`;
      } catch (err) { results.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`; }
    };

    document.getElementById('refresh-exec-btn').addEventListener('click', refresh);
    refresh();
  } catch (err) { c.innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`; }
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERACIÓN Y DESCARGA DE DOCUMENTOS OFICIALES (PDF VECTORIAL ORQUESTADO)
// ══════════════════════════════════════════════════════════════════════════════

async function buildPhStatementData(invoiceId: string, type: 'invoice' | 'statement') {
  const [inv, lines, billingConcepts] = await Promise.all([
    (window as any).pb.get('ph_invoices', invoiceId, { expand: 'property_id,property_id.owner_id' }),
    (window as any).API.getPhInvoiceLines(invoiceId),
    (window as any).API.getPhBillingConcepts(false).catch(() => []),
  ]);
  const prop = inv.expand?.property_id;
  let owner = prop?.expand?.owner_id;
  if (!owner && prop?.owner_id) {
    try {
      owner = await (window as any).pb.get('third_parties', prop.owner_id);
    } catch (_) {}
  }

  let outstandingInvoices: any[] = [];
  if (type === 'statement') {
    try {
      const safePropId = (window as any).pb.escapeFilterValue(inv.property_id);
      const res = await (window as any).pb.listAll('ph_invoices', {
        filter: `property_id="${safePropId}" && id!="${invoiceId}" && status!="paid" && status!="voided" && period < "${inv.period}"`,
        sort: 'period'
      });
      outstandingInvoices = res || [];
    } catch (err) {
      console.warn('Error al cargar cartera pendiente:', err);
    }
  }

  const [compName, compNit, compAddress, compPhone, compEmail, compCity, logoBase64, customFooterNote] = await Promise.all([
    (window as any).API.getSetting('company_name').catch(() => 'GRAVY S.A.S'),
    (window as any).API.getSetting('company_nit').catch(() => ''),
    (window as any).API.getSetting('company_address').catch(() => ''),
    (window as any).API.getSetting('company_phone').catch(() => ''),
    (window as any).API.getSetting('company_email').catch(() => ''),
    (window as any).API.getSetting('company_city').catch(() => ''),
    (window as any).API.getSetting('company_logo').catch(() => ''),
    (window as any).API.getSetting('ph_invoice_footer_note').catch(() => ''),
  ]);

  function getCanonicalConceptName(rawDesc: string): string {
    if (!rawDesc) return 'CONCEPTO';
    const str = String(rawDesc).trim();
    const norm = str
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u');

    if (
      (norm.includes('interes') && norm.includes('mora')) ||
      norm === 'mora' ||
      norm.startsWith('mora ') ||
      norm.includes('intereses mora')
    ) {
      return 'INTERESES DE MORA';
    }

    if (
      norm.includes('cuota de administracion') ||
      norm.includes('cuota administracion') ||
      norm.includes('cuota ordinaria') ||
      norm === 'administracion'
    ) {
      return 'CUOTA ADMINISTRACION';
    }

    if (
      norm.includes('fondo de imprevistos') ||
      norm.includes('fondo imprevistos')
    ) {
      return 'FONDO DE IMPREVISTOS';
    }

    return str;
  }

  const conceptsById: Record<string, any> = {};
  const conceptsByCanonical: Record<string, any> = {};
  let moraConceptId = '';
  (billingConcepts || []).forEach((c: any) => {
    const code = String(c.code || '').trim().toUpperCase();
    const name = String(c.name || '').trim();
    conceptsById[c.id] = c;
    if (code === 'MORA' || name.toUpperCase().includes('MORA')) {
      moraConceptId = c.id;
    }
    conceptsByCanonical[getCanonicalConceptName(name)] = c.id;
  });

  function resolveConceptGroup(line: any) {
    const rawId = line.concept_id || '';
    const rawDesc = line.description || 'Concepto';
    const canonicalDesc = getCanonicalConceptName(rawDesc);
    const conceptObj = rawId ? conceptsById[rawId] : null;

    const isMoraById = rawId && (rawId === moraConceptId || (conceptObj && (conceptObj.code === 'MORA' || String(conceptObj.name).toUpperCase().includes('MORA'))));
    const isMoraByText = canonicalDesc === 'INTERESES DE MORA';

    if (isMoraById || isMoraByText) {
      return {
        groupKey: '__MORA__',
        conceptId: (conceptObj ? conceptObj.id : moraConceptId) || '',
        description: 'INTERESES DE MORA'
      };
    }

    if (conceptObj) {
      return {
        groupKey: 'ID_' + conceptObj.id,
        conceptId: conceptObj.id,
        description: String(conceptObj.name).toUpperCase()
      };
    }

    if (conceptsByCanonical[canonicalDesc]) {
      const matchedId = conceptsByCanonical[canonicalDesc];
      const matched = conceptsById[matchedId];
      if (matched) {
        return {
          groupKey: 'ID_' + matched.id,
          conceptId: matched.id,
          description: String(matched.name).toUpperCase()
        };
      }
    }

    if (rawId) {
      return {
        groupKey: 'ID_' + rawId,
        conceptId: rawId,
        description: canonicalDesc || String(rawDesc).toUpperCase()
      };
    }

    return {
      groupKey: '__TEXT_' + canonicalDesc,
      conceptId: '',
      description: canonicalDesc || 'CONCEPTO'
    };
  }

  // Agrupar saldos por conceptos (ID-First con respaldo canónico)
  const conceptsMap: Record<string, { conceptId: string; description: string; saldoAnterior: number; cobrosMes: number; saldoActual: number }> = {};
  
  // Cargar cobros del mes
  lines.forEach((l: any) => {
    const group = resolveConceptGroup(l);
    if (!conceptsMap[group.groupKey]) {
      conceptsMap[group.groupKey] = {
        conceptId: group.conceptId,
        description: group.description,
        saldoAnterior: 0,
        cobrosMes: 0,
        saldoActual: 0
      };
    }
    conceptsMap[group.groupKey].cobrosMes += Number(l.amount) || 0;
    conceptsMap[group.groupKey].saldoActual += Number(l.amount) || 0;
  });

  // Consultar el estado de cartera real (pagos contables via tx_lines)
  let unitBalMap: Record<string, any> = {};
  try {
    const balUrl = `${(window as any).pb.baseUrl}/api/ph/unit-balance?propertyId=${encodeURIComponent(inv.property_id)}`;
    const balRes = await fetch(balUrl, { headers: (window as any).pb.headers() });
    if (balRes.ok) {
      const balData = await balRes.json();
      if (Array.isArray(balData?.invoices)) {
        balData.invoices.forEach((b: any) => { unitBalMap[b.invoiceId] = b; });
      }
    }
  } catch (balErr) {
    console.warn('Error al consultar saldo contable de unidad:', balErr);
  }

  // Fallback directo a contabilidad (tx_lines) si el endpoint backend no devolvió datos
  if (Object.keys(unitBalMap).length === 0 && outstandingInvoices.length > 0) {
    try {
      for (const oldInv of outstandingInvoices) {
        const safeInvNum = (window as any).pb.escapeFilterValue(oldInv.number);
        const credits = await (window as any).pb.listAll('tx_lines', {
          filter: `(cross_doc_ref="${safeInvNum}" || cross_doc_ref~"${safeInvNum}-") && credit > 0`
        }).catch(() => []);
        const totalPaid = (credits || []).reduce((s: number, c: any) => s + (Number(c.credit) || 0), 0);
        const invTotal = Number(oldInv.total || 0);
        const pendingAmount = Math.max(0, invTotal - totalPaid);
        unitBalMap[oldInv.id] = {
          invoiceId: oldInv.id,
          invoiceNumber: oldInv.number,
          period: oldInv.period,
          total: invTotal,
          paidAmount: totalPaid,
          pendingAmount: pendingAmount,
          isSettled: pendingAmount < 0.01
        };
      }
    } catch (fbErr) {
      console.warn('Error en fallback contable de saldo anterior:', fbErr);
    }
  }

  // Cargar saldos anteriores descontando pagos contables reales
  for (const oldInv of outstandingInvoices) {
    try {
      const balInfo = unitBalMap[oldInv.id];
      // Si la factura está completamente saldada en contabilidad, NO se arrastra al saldo anterior
      if (balInfo && (balInfo.isSettled || Number(balInfo.pendingAmount || 0) < 0.01)) {
        continue;
      }
      const invTotal = Number(oldInv.total || 0);
      const pendingBalance = balInfo ? Number(balInfo.pendingAmount || 0) : invTotal;
      const proportionFactor = (invTotal > 0.01 && pendingBalance < invTotal) ? (pendingBalance / invTotal) : 1;

      const oldLines = await (window as any).API.getPhInvoiceLines(oldInv.id);
      oldLines.forEach((ol: any) => {
        const fullAmt = Number(ol.amount) || 0;
        const pendingAmt = Math.round(fullAmt * proportionFactor);
        if (pendingAmt < 0.01) return;

        const groupOld = resolveConceptGroup(ol);
        if (!conceptsMap[groupOld.groupKey]) {
          conceptsMap[groupOld.groupKey] = {
            conceptId: groupOld.conceptId,
            description: groupOld.description,
            saldoAnterior: 0,
            cobrosMes: 0,
            saldoActual: 0
          };
        }
        conceptsMap[groupOld.groupKey].saldoAnterior += pendingAmt;
        conceptsMap[groupOld.groupKey].saldoActual += pendingAmt;
      });
    } catch (_) {}
  }

  const conceptsList = Object.keys(conceptsMap).map(k => conceptsMap[k]);
  conceptsList.sort((a, b) => {
    const nameA = a.description.toUpperCase();
    const nameB = b.description.toUpperCase();
    if (nameA.includes('ADMIN') && !nameB.includes('ADMIN')) return -1;
    if (!nameA.includes('ADMIN') && nameB.includes('ADMIN')) return 1;
    if (nameA.includes('MORA') && !nameB.includes('MORA')) return 1;
    if (!nameA.includes('MORA') && nameB.includes('MORA')) return -1;
    return nameA.localeCompare(nameB, 'es');
  });

  const totalActual = conceptsList.reduce((s, c) => s + c.saldoActual, 0);

  function getPreviousPeriod(p: string): string {
    if (!p || typeof p !== 'string') return '';
    const parts = p.split('-');
    let y = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    return `${y}-${String(m).padStart(2, '0')}`;
  }

  function getMonthNameUpper(p: string) {
    if (!p) return '';
    const parts = p.split('-');
    const m = parseInt(parts[1], 10) || 1;
    const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
    return months[m - 1] || '';
  }

  const prevPeriod = getPreviousPeriod(inv.period);
  const prevMonthName = getMonthNameUpper(prevPeriod);
  let prevMonthUnitRecaudo = 0;
  let prevMonthTotalRecaudo = 0;

  if (prevPeriod) {
    try {
      const safePropId = (window as any).pb.escapeFilterValue(inv.property_id);
      const ownerId = prop?.owner_id || owner?.id || '';
      const safeOwnerId = ownerId ? (window as any).pb.escapeFilterValue(ownerId) : '';
      const prevStart = `${prevPeriod}-01`;
      const prevEnd = `${prevPeriod}-31`;

      // 1. Recaudo real de la unidad en el mes anterior (consultar transacciones activas de recaudo RC)
      try {
        let filterTx = `date >= "${prevStart}" && date <= "${prevEnd}" && status="active" && (number ~ "RC-" || teso_mode != "")`;
        if (safeOwnerId) {
          filterTx += ` && (third_party_id="${safeOwnerId}" || teso_params~"${safePropId}")`;
        } else {
          filterTx += ` && teso_params~"${safePropId}"`;
        }
        const rcs = await (window as any).pb.listAll('transactions', { filter: filterTx }).catch(() => []);
        for (const tx of (rcs || [])) {
          let amt = 0;
          try {
            const p = JSON.parse(tx.teso_params || '{}');
            if (p.amount) amt = Number(p.amount) || 0;
          } catch (_) {}
          if (amt <= 0 && tx.id) {
            const lines = await (window as any).pb.listAll('tx_lines', {
              filter: `tx_id="${tx.id}" && credit > 0`,
              expand: 'account_id'
            }).catch(() => []);
            amt = (lines || []).reduce((s: number, l: any) => {
              const code = String(l.expand?.account_id?.code || l.account_code || '');
              if (!code || code.startsWith('13')) {
                return s + (Number(l.credit) || 0);
              }
              return s;
            }, 0);
          }
          prevMonthUnitRecaudo += amt;
        }
      } catch (eTx) {
        console.warn('Error al consultar transacciones de recaudo de unidad:', eTx);
      }

      // Fallback a unitBalMap o ph_invoices pagadas si no se encontró en transacciones
      if (prevMonthUnitRecaudo <= 0) {
        const prevInv = Object.values(unitBalMap).find((b: any) => b.period === prevPeriod);
        if (prevInv) {
          prevMonthUnitRecaudo = Number(prevInv.paidAmount || 0);
        }
      }
      if (prevMonthUnitRecaudo <= 0) {
        const unitPrevPaid = await (window as any).pb.listAll('ph_invoices', {
          filter: `property_id="${safePropId}" && period="${prevPeriod}" && status="paid"`
        }).catch(() => []);
        if (unitPrevPaid && unitPrevPaid.length > 0) {
          prevMonthUnitRecaudo = unitPrevPaid.reduce((sum: number, x: any) => sum + (Number(x.total) || 0), 0);
        }
      }

      // 2. Recaudo total de la copropiedad en el mes anterior
      try {
        const allRcs = await (window as any).pb.listAll('transactions', {
          filter: `date >= "${prevStart}" && date <= "${prevEnd}" && status="active" && (number ~ "RC-" || teso_mode != "")`
        }).catch(() => []);
        if (allRcs && allRcs.length > 0) {
          for (const tx of allRcs) {
            try {
              const p = JSON.parse(tx.teso_params || '{}');
              if (p.amount) prevMonthTotalRecaudo += Number(p.amount) || 0;
              else if (tx.total) prevMonthTotalRecaudo += Number(tx.total) || 0;
            } catch (_) {
              if (tx.total) prevMonthTotalRecaudo += Number(tx.total) || 0;
            }
          }
        }
      } catch (eAll) {
        console.warn('Error al consultar recaudo total del mes:', eAll);
      }

      if (prevMonthTotalRecaudo <= 0) {
        const allPrevPaid = await (window as any).pb.listAll('ph_invoices', {
          filter: `period="${prevPeriod}" && status="paid"`
        }).catch(() => []);
        if (allPrevPaid && allPrevPaid.length > 0) {
          prevMonthTotalRecaudo = allPrevPaid.reduce((sum: number, x: any) => sum + (Number(x.total) || 0), 0);
        }
      }
    } catch (err) {
      console.warn('Error al calcular recaudos del mes anterior:', err);
    }
  }

  const ownerDocNumber = owner?.doc_number ? (owner.doc_number + (owner.dv ? '-' + owner.dv : '')) : (owner?.nit || owner?.document || '—');
  const numberText = inv.number || 'cuenta';
  const rawUnit = prop?.name || prop?.code || 'Unidad';
  const cleanUnit = rawUnit.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const filename = `${type === 'statement' ? 'EstadoCuenta' : 'CuentaCobro'}_${numberText}_${cleanUnit}`;

  const notes = (inv.notes || customFooterNote || 'CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.').trim();

  return {
    filename,
    statementData: {
      companyName: compName,
      companyNit: compNit,
      companyAddress: compAddress,
      companyPhone: compPhone,
      companyEmail: compEmail,
      companyCity: compCity,
      companyLogo: logoBase64,
      docType: type,
      docNumber: numberText,
      period: inv.period,
      date: inv.date,
      dueDate: inv.due_date || inv.date,
      propertyName: prop?.name || prop?.code || 'Unidad',
      propertyCode: prop?.code || '',
      propertyArea: prop?.area_m2 || prop?.area || '',
      propertyCoef: prop?.coef_participacion ? `${prop.coef_participacion}%` : '',
      propertyMatricula: prop?.matricula || '',
      ownerName: owner?.name || 'Copropietario',
      ownerNit: ownerDocNumber,
      ownerDocNumber,
      ownerAddress: owner?.address || '',
      ownerPhone: owner?.phone || owner?.celular || '—',
      ownerEmail: owner?.email || owner?.correo || '—',
      conceptsList,
      totalActual,
      notes,
      prevMonthUnitRecaudo,
      prevMonthTotalRecaudo,
      prevMonthName
    }
  };
}

async function printPhInvoice(invoiceId: string, type: 'invoice' | 'statement') {
  try {
    (window as any).showToast('Generando documento oficial en PDF...', 'info');
    const { filename, statementData } = await buildPhStatementData(invoiceId, type);
    
    // Generar PDF vectorial idéntico al enviado por correo
    let pdfBase64 = '';
    try {
      const directRes = await (window as any).API.generatePhStatementPdfDirect(statementData, filename);
      if (directRes && directRes.pdfBase64) {
        pdfBase64 = directRes.pdfBase64;
      }
    } catch (directErr) {
      console.warn('Fallo generación directa orquestador, intentando fallback backend:', directErr);
      const backendRes = await (window as any).API.downloadPhInvoicePdf(invoiceId, type);
      if (backendRes && backendRes.pdfBase64) {
        pdfBase64 = backendRes.pdfBase64;
      }
    }

    if (!pdfBase64) {
      throw new Error('No se pudo generar el archivo PDF oficial.');
    }

    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    (window as any).showToast('Documento PDF oficial abierto en nueva pestaña.', 'success');
  } catch (err: any) {
    console.error('Error al imprimir documento PDF:', err);
    (window as any).showToast('Error al generar PDF: ' + (err.message || err), 'error');
  }
}

async function openPhInvoiceEmailModal(invoiceId: string) {
  try {
    const inv = await (window as any).pb.get('ph_invoices', invoiceId, { expand: 'property_id,property_id.owner_id' });
    const prop = inv.expand?.property_id;
    const owner = prop?.expand?.owner_id;
    const defaultEmail = owner?.email || owner?.correo || '';

    (window as any).openModal(
      'Enviar Documento por Correo',
      `<div class="space-y-4">
        <p class="text-xs text-gray-500">Envía la factura o estado de cuenta al propietario de la unidad <strong>${(window as any).esc(prop?.name || '')}</strong>.</p>
        <div class="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2">
          <i class="fas fa-file-pdf text-red-500 text-base"></i>
          <span>Se adjuntará automáticamente el archivo <strong>PDF oficial</strong> de cobro en el correo.</span>
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Correo Destinatario <span class="text-red-500">*</span></label>
          <input id="ph-email-dest" type="email" class="form-input" value="${(window as any).esc(defaultEmail)}" placeholder="correo@ejemplo.com">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Tipo de Envío</label>
          <select id="ph-email-type" class="form-input">
            <option value="statement" selected>Estado de Cuenta Completo (Incluye Cartera)</option>
            <option value="invoice">Factura del Período</option>
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Asunto Personalizado (Opcional)</label>
          <input id="ph-email-subject" class="form-input" placeholder="Asunto predeterminado del sistema">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Mensaje Corto (Opcional)</label>
          <textarea id="ph-email-msg" class="form-input" rows="2" placeholder="Se enviará junto al cobro..."></textarea>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" id="ph-email-send-btn"><i class="fas fa-paper-plane mr-1"></i> Enviar</button>`
    );

    setTimeout(() => {
      document.getElementById('ph-email-send-btn')?.addEventListener('click', async () => {
        const dest = (document.getElementById('ph-email-dest') as HTMLInputElement)?.value.trim();
        const type = (document.getElementById('ph-email-type') as HTMLSelectElement)?.value;
        const subject = (document.getElementById('ph-email-subject') as HTMLInputElement)?.value.trim();
        const message = (document.getElementById('ph-email-msg') as HTMLTextAreaElement)?.value.trim();

        if (!dest) {
          (window as any).showToast('El correo destinatario es obligatorio.', 'warning');
          return;
        }

        const btn = document.getElementById('ph-email-send-btn') as HTMLButtonElement;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Enviando...';

        try {
          const res = await (window as any).API.sendPhInvoiceEmail(invoiceId, type, dest, subject, message);
          (window as any).showToast(res.message || 'Correo enviado exitosamente', 'success');
          (window as any).closeModal();
        } catch (err: any) {
          (window as any).showToast(err.message || 'Error al enviar correo', 'error');
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-paper-plane mr-1"></i> Enviar';
        }
      });
    }, 40);

  } catch (err: any) {
    (window as any).showToast('Error al cargar datos de contacto: ' + err.message, 'error');
  }
}

async function openPhDownloadPdfModal(invoiceId: string) {
  try {
    const inv = await pb.get('ph_invoices', invoiceId, { expand: 'property_id,property_id.owner_id' });
    const prop = inv.expand?.property_id;
    const propName = prop?.name || prop?.code || 'Unidad';
    const num = inv.number || 'Factura';

    (window as any).openModal(
      `Descargar Documento PDF — ${esc(propName)}`,
      `<div class="space-y-4">
        <p class="text-sm text-gray-600">
          Selecciona el formato de documento PDF que deseas generar y descargar para la factura <strong>${esc(num)}</strong> (${esc(propName)}):
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div id="ph-opt-dl-statement" class="p-3.5 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50/50" style="border-color:#3B82F6; background:#F8FAFC;">
            <div class="flex items-center gap-2 mb-1.5">
              <i class="fas fa-file-lines text-indigo-600 text-lg"></i>
              <span class="font-bold text-sm text-gray-800">Estado de Cuenta Integral</span>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">
              Incluye saldo anterior de períodos vencidos no pagados, cobros del mes y saldo total acumulado a la fecha.
            </p>
          </div>
          <div id="ph-opt-dl-invoice" class="p-3.5 rounded-xl border-2 cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50/50" style="border-color:#E2E8F0; background:#FFFFFF;">
            <div class="flex items-center gap-2 mb-1.5">
              <i class="fas fa-file-invoice text-blue-600 text-lg"></i>
              <span class="font-bold text-sm text-gray-800">Factura / Cuenta del Mes</span>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">
              Muestra exclusivamente los conceptos y valores liquidados para el período facturado actual (${fmtPeriod(inv.period)}).
            </p>
          </div>
        </div>
        <div id="ph-dl-pdf-status" class="hidden text-xs font-semibold text-blue-600 flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Generando archivo PDF oficial...</span>
        </div>
      </div>`,
      `<button class="btn btn-outline" id="ph-dl-pdf-cancel" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" id="ph-dl-pdf-btn"><i class="fas fa-download mr-1"></i> Descargar PDF</button>`
    );

    setTimeout(() => {
      let selectedType: 'invoice' | 'statement' = 'statement';
      const optInv = document.getElementById('ph-opt-dl-invoice');
      const optStat = document.getElementById('ph-opt-dl-statement');
      const btn = document.getElementById('ph-dl-pdf-btn') as HTMLButtonElement;
      const cancelBtn = document.getElementById('ph-dl-pdf-cancel') as HTMLButtonElement;
      const statusBox = document.getElementById('ph-dl-pdf-status');

      optInv?.addEventListener('click', () => {
        selectedType = 'invoice';
        if (optInv) { optInv.style.borderColor = '#3B82F6'; optInv.style.background = '#F8FAFC'; }
        if (optStat) { optStat.style.borderColor = '#E2E8F0'; optStat.style.background = '#FFFFFF'; }
      });

      optStat?.addEventListener('click', () => {
        selectedType = 'statement';
        if (optStat) { optStat.style.borderColor = '#3B82F6'; optStat.style.background = '#F8FAFC'; }
        if (optInv) { optInv.style.borderColor = '#E2E8F0'; optInv.style.background = '#FFFFFF'; }
      });

      btn?.addEventListener('click', async () => {
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Generando...'; }
        if (cancelBtn) cancelBtn.disabled = true;
        if (statusBox) statusBox.classList.remove('hidden');

        await executePhInvoicePdfDownload(invoiceId, selectedType);
        (window as any).closeModal();
      });
    }, 40);
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al preparar descarga de factura', 'error');
  }
}

async function executePhInvoicePdfDownload(invoiceId: string, type: 'invoice' | 'statement') {
  try {
    (window as any).showToast('Generando y descargando PDF oficial...', 'info');
    const { filename, statementData } = await buildPhStatementData(invoiceId, type);

    let pdfBase64 = '';
    let finalFilename = filename ? `${filename}.pdf` : `Factura_${invoiceId}.pdf`;

    try {
      const directRes = await (window as any).API.generatePhStatementPdfDirect(statementData, filename);
      if (directRes && directRes.pdfBase64) {
        pdfBase64 = directRes.pdfBase64;
        if (directRes.filename) finalFilename = directRes.filename.endsWith('.pdf') ? directRes.filename : `${directRes.filename}.pdf`;
      }
    } catch (directErr) {
      console.warn('Fallo generación directa orquestador, intentando fallback backend:', directErr);
      const backendRes = await (window as any).API.downloadPhInvoicePdf(invoiceId, type);
      if (backendRes && backendRes.pdfBase64) {
        pdfBase64 = backendRes.pdfBase64;
        if (backendRes.filename) finalFilename = backendRes.filename.endsWith('.pdf') ? backendRes.filename : `${backendRes.filename}.pdf`;
      }
    }

    if (!pdfBase64) {
      throw new Error('No se pudo generar el archivo PDF oficial desde el orquestador.');
    }

    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    (window as any).showToast('Archivo PDF oficial descargado exitosamente.', 'success');
  } catch (err: any) {
    console.error('[GRAVY PH DOWNLOAD PDF ERROR]', err);
    (window as any).showToast('Error al descargar PDF: ' + (err.message || err), 'error');
  }
}

async function openPhBulkPdfModal() {
  const filterInput = document.getElementById('ph-period-filter') as HTMLInputElement;
  const initialPeriod = (filterInput && filterInput.value ? filterInput.value.trim() : '') || currentPeriod();

  (window as any).openModal(
    'Imprimir Período en PDF (Lote Unificado)',
    `<div class="space-y-4">
      <p class="text-sm text-gray-600">
        Esta utilidad compila todas las facturas activas del período en un <strong>único documento PDF multipágina</strong> (1 página tamaño Carta por unidad), en orden correlativo, listo para impresión masiva inmediata con <code>Ctrl + P</code>.
      </p>
      <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
        <i class="fas fa-print text-blue-600 text-base"></i>
        <span>Ideal para la entrega física de cuentas de cobro en portería o casilleros sin necesidad de imprimir unidad por unidad.</span>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="form-group mb-0">
          <label class="form-label">Período de Facturación</label>
          <input id="ph-bulk-pdf-period" type="month" class="form-input" value="${(window as any).esc(initialPeriod)}" disabled>
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Tipo de Documento</label>
          <select id="ph-bulk-pdf-type" class="form-input">
            <option value="invoice">Facturas del Período (Solo cobros del mes)</option>
            <option value="statement">Estados de Cuenta Integrales (Con Cartera / Saldos Anteriores)</option>
          </select>
        </div>
      </div>
      
      <!-- Estado y progreso -->
      <div id="ph-bulk-pdf-status" class="hidden text-xs font-semibold text-blue-600 flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
        <i class="fas fa-spinner fa-spin text-base"></i>
        <span>El orquestador está compilando el archivo PDF unificado en alta fidelidad... Por favor espere unos segundos.</span>
      </div>
    </div>`,
    `<button class="btn btn-outline" id="ph-bulk-pdf-cancel" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-bulk-pdf-download-btn"><i class="fas fa-download mr-1"></i> Descargar PDF Unificado</button>`
  );

  setTimeout(() => {
    document.getElementById('ph-bulk-pdf-download-btn')?.addEventListener('click', async () => {
      const modalPeriodInput = document.getElementById('ph-bulk-pdf-period') as HTMLInputElement;
      const pagePeriodInput = document.getElementById('ph-period-filter') as HTMLInputElement;
      const effectivePeriod = (modalPeriodInput && modalPeriodInput.value ? modalPeriodInput.value.trim() : '') ||
                              (pagePeriodInput && pagePeriodInput.value ? pagePeriodInput.value.trim() : '') ||
                              initialPeriod ||
                              currentPeriod();

      if (!effectivePeriod) {
        (window as any).showToast('Por favor seleccione un período válido.', 'error');
        return;
      }

      const type = ((document.getElementById('ph-bulk-pdf-type') as HTMLSelectElement)?.value || 'invoice') as 'invoice' | 'statement';
      const downloadBtn = document.getElementById('ph-bulk-pdf-download-btn') as HTMLButtonElement;
      const cancelBtn = document.getElementById('ph-bulk-pdf-cancel') as HTMLButtonElement;
      const statusBox = document.getElementById('ph-bulk-pdf-status');

      downloadBtn.disabled = true;
      downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Generando PDF...';
      cancelBtn.disabled = true;
      if (statusBox) statusBox.classList.remove('hidden');

      try {
        (window as any).showToast('Compilando lote de facturas en PDF...', 'info');
        const res = await (window as any).API.downloadPhPeriodPdf(effectivePeriod, type);

        if (res && res.success && res.pdfBase64) {
          const byteCharacters = atob(res.pdfBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = res.filename || `Facturas_Copropiedad_${effectivePeriod}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          (window as any).showToast(`PDF unificado descargado exitosamente (${res.totalInvoices || 'todas las'} unidades compiladas).`, 'success');
          (window as any).closeModal();
          return;
        }

        throw new Error(res?.message || 'No se recibió el archivo PDF consolidado desde el servidor.');
      } catch (err: any) {
        console.error('[GRAVY PH BULK PDF ERROR]', err);
        (window as any).showToast(err.message || 'Error al generar el PDF unificado', 'error');
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download mr-1"></i> Descargar PDF Unificado';
        cancelBtn.disabled = false;
        if (statusBox) statusBox.classList.add('hidden');
      }
    });
  }, 40);
}

async function openPhBulkEmailModal() {
  const filterInput = document.getElementById('ph-period-filter') as HTMLInputElement;
  const initialPeriod = (filterInput && filterInput.value ? filterInput.value.trim() : '') || currentPeriod();

  // Consultar configuración guardada de plantillas y muestra de datos reales
  let savedSubject = '';
  let savedBody = '';
  let savedNotice = '';
  let companyName = 'Copropiedad';
  let sampleInv: any = null;
  let initialTotalCount = 0;
  let initialPendingCount = 0;

  try {
    const [subRes, bodyRes, notRes, compRes, invsRes] = await Promise.all([
      (window as any).API.getSetting('ph_email_template_invoice_subject').catch(() => ''),
      (window as any).API.getSetting('ph_email_template_invoice_body').catch(() => ''),
      (window as any).API.getSetting('ph_email_monthly_notice').catch(() => ''),
      (window as any).API.getSetting('company_name').catch(() => 'Copropiedad'),
      (window as any).API.getPhInvoices({
        filter: `period="${(window as any).pb.escapeFilterValue(initialPeriod)}" && status != 'voided'`,
        perPage: 500,
        expand: 'property_id,property_id.owner_id'
      }).catch(() => ({ items: [] }))
    ]);
    savedSubject = subRes || '';
    savedBody = bodyRes || '';
    savedNotice = notRes || '';
    companyName = compRes || 'Copropiedad';
    if (invsRes && invsRes.items && invsRes.items.length > 0) {
      sampleInv = invsRes.items[0];
      initialTotalCount = invsRes.items.length;
      initialPendingCount = invsRes.items.filter((i: any) => !i.email_sent && i.email_status !== 'sent').length;
    }
  } catch (_) {}

  const defaultSubject = savedSubject || '{copropiedad} — Cuenta de Cobro No. {numero_factura} — Unidad {unidad}';
  const defaultBody = savedBody || `Estimado(a) {propietario},\n\nLe compartimos su cuenta de cobro correspondiente al período {periodo} para la unidad {unidad}.\n\n{aviso_adicional}\n\nAdjunto a este correo encontrará su documento oficial en formato PDF.\n\nInstrucciones de Pago:\n{instrucciones_pago}\n\nAgradecemos realizar su pago oportunamente.\nAtentamente,\nAdministración {copropiedad}`;
  const defaultNotice = savedNotice || '';

  (window as any).openModal(
    'Envío Masivo por Correo (Con PDF Adjunto)',
    `<div class="space-y-4">
      <div class="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
        <i class="fas fa-shield-alt text-amber-600 text-base"></i>
        <span>El proceso aplicará la plantilla personalizada y control de ráfagas (rate limiting) para garantizar la compatibilidad con el servidor <strong>SMTP de Gmail</strong> sin bloqueos.</span>
      </div>

      <!-- Selector de Período y Documento -->
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label font-semibold">Período</label>
          <input id="ph-bulk-email-period" type="month" class="form-input" value="${(window as any).esc(initialPeriod)}" disabled>
        </div>
        <div class="form-group mb-0">
          <label class="form-label font-semibold">Tipo de Documento</label>
          <select id="ph-bulk-email-type" class="form-input">
            <option value="invoice">Factura del Período</option>
            <option value="statement">Estado de Cuenta (Con Cartera)</option>
          </select>
        </div>
      </div>

      <!-- Pestañas del Modal -->
      <div class="flex border-b border-gray-200 text-xs font-semibold gap-4">
        <button type="button" id="ph-bulk-tab-edit-btn" class="pb-2 text-blue-600 border-b-2 border-blue-600 flex items-center gap-1 cursor-pointer">
          <i class="fas fa-pen-to-square"></i> Mensaje y Parámetros
        </button>
        <button type="button" id="ph-bulk-tab-prev-btn" class="pb-2 text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer">
          <i class="fas fa-eye"></i> Vista Previa Simulada
        </button>
      </div>

      <!-- Pestaña 1: Editor -->
      <div id="ph-bulk-pane-edit" class="space-y-3">
        <div class="form-group mb-0">
          <label class="form-label font-semibold">Asunto del Correo (Con Tokens)</label>
          <input id="ph-bulk-email-subject" class="form-input font-mono text-xs" value="${(window as any).esc(defaultSubject)}" placeholder="Asunto...">
        </div>

        <!-- Chips interactivos de tokens -->
        <div class="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs">
          <span class="font-bold text-gray-700 block mb-1"><i class="fas fa-tags mr-1"></i>Insertar variable en el campo activo:</span>
          <div class="flex flex-wrap gap-1" id="ph-bulk-email-tokens">
            <button type="button" class="ph-bulk-token px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 font-mono hover:bg-gray-100 transition cursor-pointer" data-token="{propietario}">{propietario}</button>
            <button type="button" class="ph-bulk-token px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 font-mono hover:bg-gray-100 transition cursor-pointer" data-token="{unidad}">{unidad}</button>
            <button type="button" class="ph-bulk-token px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 font-mono hover:bg-gray-100 transition cursor-pointer" data-token="{periodo}">{periodo}</button>
            <button type="button" class="ph-bulk-token px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 font-mono hover:bg-gray-100 transition cursor-pointer" data-token="{numero_factura}">{numero_factura}</button>
            <button type="button" class="ph-bulk-token px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 font-mono hover:bg-gray-100 transition cursor-pointer" data-token="{total_pagar}">{total_pagar}</button>
            <button type="button" class="ph-bulk-token px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 font-mono hover:bg-gray-100 transition cursor-pointer" data-token="{fecha_vencimiento}">{fecha_vencimiento}</button>
            <button type="button" class="ph-bulk-token px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 font-mono font-bold hover:bg-amber-200 transition cursor-pointer" data-token="{aviso_adicional}">📢 {aviso_adicional}</button>
          </div>
        </div>

        <div class="form-group mb-0">
          <label class="form-label font-semibold">
            <span class="text-amber-600 mr-1">📢</span>Aviso / Circular Especial del Mes (Opcional)
          </label>
          <textarea id="ph-bulk-email-notice" class="form-input font-sans text-xs bg-amber-50/50 border-amber-200" rows="2" style="resize:vertical;"
            placeholder="Ej: Recuerde la asamblea extraordinaria de copropietarios convocada para el sábado 28 de marzo...">${(window as any).esc(defaultNotice)}</textarea>
          <p class="text-xs text-amber-700 mt-0.5">Se resalta en el correo como comunicado oficial o sustituye el token {aviso_adicional}.</p>
        </div>

        <div class="form-group mb-0">
          <label class="form-label font-semibold">Cuerpo / Mensaje del Correo</label>
          <textarea id="ph-bulk-email-message" class="form-input font-sans text-xs" rows="5" style="resize:vertical;"
            placeholder="Texto que recibirá el copropietario...">${(window as any).esc(defaultBody)}</textarea>
        </div>

        <!-- Filtro inteligente para reanudar envíos pendientes -->
        <div class="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-xs mt-1">
          <label class="flex items-center gap-2 cursor-pointer font-semibold text-blue-950 select-none">
            <input type="checkbox" id="ph-bulk-email-only-pending" checked class="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
            <span><i class="fas fa-filter text-blue-600 mr-1"></i> Omitir facturas ya enviadas exitosamente <span class="font-normal text-blue-700">(Reanudar solo pendientes del período)</span></span>
          </label>
        </div>
      </div>

      <!-- Pestaña 2: Vista Previa Simulada -->
      <div id="ph-bulk-pane-prev" class="hidden border rounded-xl p-3.5 bg-gray-50 border-gray-200 space-y-2.5">
        <div class="text-xs text-gray-500 font-semibold border-b pb-1.5 flex justify-between">
          <span>Vista Previa con datos de: <strong id="ph-prev-unit-label" class="text-blue-600">${sampleInv?.expand?.property_id?.name || 'Unidad de Ejemplo'}</strong></span>
          <span class="text-green-600"><i class="fas fa-paperclip"></i> PDF adjunto incluido</span>
        </div>
        <div class="bg-white p-3 rounded-lg border border-gray-200 text-xs space-y-2">
          <div><strong class="text-gray-500">Asunto:</strong> <span id="ph-prev-subject" class="font-bold text-gray-800"></span></div>
          <hr class="border-gray-100">
          <div id="ph-prev-notice-box" class="hidden p-2.5 rounded bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs">
            <strong class="block text-amber-800 mb-0.5">📢 AVISO IMPORTANTE DE LA ADMINISTRACIÓN</strong>
            <span id="ph-prev-notice-text"></span>
          </div>
          <div id="ph-prev-body" class="text-gray-700 whitespace-pre-line leading-relaxed"></div>
        </div>
      </div>
      
      <!-- Panel de Registro / Progreso -->
      <div id="ph-bulk-email-progress-container" class="hidden border rounded-xl p-3 bg-gray-50" style="border-color:#e2e8f0;">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-bold text-gray-500 uppercase">Estado del Envío</span>
          <span id="ph-bulk-email-progress-counts" class="text-xs font-bold text-blue-600">${initialPendingCount} / ${initialTotalCount} Pendientes</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-3 overflow-hidden">
          <div id="ph-bulk-email-progress-bar" class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
        <div id="ph-bulk-email-log" class="text-xs font-mono bg-white border p-2 rounded-lg overflow-y-auto max-h-36 space-y-1" style="height: 120px; border-color:#e2e8f0;">
          <p class="text-gray-400">${initialTotalCount > 0 ? (initialPendingCount > 0 ? `Listo para enviar ${initialPendingCount} facturas pendientes.` : `Todas las facturas (${initialTotalCount}) de este período ya fueron enviadas.`) : `No se encontraron facturas activas para el período seleccionado.`}</p>
        </div>
      </div>
    </div>`,
    `<button class="btn btn-outline" id="ph-bulk-email-cancel" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="ph-bulk-email-confirm-btn"><i class="fas fa-mail-bulk mr-1"></i> Iniciar Envío Masivo</button>`
  );

  setTimeout(() => {
    // Manejo de inserción de tokens con click en chips
    let lastFocusedBulkInput: HTMLInputElement | HTMLTextAreaElement | null = document.getElementById('ph-bulk-email-message') as HTMLTextAreaElement;
    ['ph-bulk-email-subject', 'ph-bulk-email-notice', 'ph-bulk-email-message'].forEach(id => {
      document.getElementById(id)?.addEventListener('focus', (e) => {
        lastFocusedBulkInput = e.target as any;
      });
    });

    document.querySelectorAll('#ph-bulk-email-tokens .ph-bulk-token').forEach(btn => {
      btn.addEventListener('click', () => {
        const token = btn.getAttribute('data-token');
        if (!token || !lastFocusedBulkInput) return;
        const start = lastFocusedBulkInput.selectionStart || 0;
        const end = lastFocusedBulkInput.selectionEnd || 0;
        const text = lastFocusedBulkInput.value;
        lastFocusedBulkInput.value = text.substring(0, start) + token + text.substring(end);
        lastFocusedBulkInput.focus();
        lastFocusedBulkInput.selectionStart = lastFocusedBulkInput.selectionEnd = start + token.length;
      });
    });

    // Pestañas (Editar vs Vista Previa)
    const tabEditBtn = document.getElementById('ph-bulk-tab-edit-btn');
    const tabPrevBtn = document.getElementById('ph-bulk-tab-prev-btn');
    const paneEdit = document.getElementById('ph-bulk-pane-edit');
    const panePrev = document.getElementById('ph-bulk-pane-prev');

    const updatePreview = () => {
      const subjTpl = (document.getElementById('ph-bulk-email-subject') as HTMLInputElement)?.value || '';
      const bodyTpl = (document.getElementById('ph-bulk-email-message') as HTMLTextAreaElement)?.value || '';
      const noticeVal = (document.getElementById('ph-bulk-email-notice') as HTMLTextAreaElement)?.value.trim() || '';

      const prop = sampleInv?.expand?.property_id;
      const owner = prop?.expand?.owner_id;

      const dummyCtx: Record<string, string> = {
        '{propietario}': owner?.name || 'Carlos Alberto Gómez',
        '{unidad}': prop?.name || 'Apto 302 - Torre A',
        '{periodo}': (window as any).fmtPeriod(initialPeriod),
        '{numero_factura}': sampleInv?.number || 'CC-2026-0001',
        '{total_mes}': (window as any).fmt(sampleInv?.total || 245000),
        '{saldo_anterior}': '$ 0',
        '{total_pagar}': (window as any).fmt(sampleInv?.total || 245000),
        '{fecha_vencimiento}': sampleInv?.due_date ? (window as any).fmtDate(sampleInv.due_date) : '15/03/2026',
        '{copropiedad}': companyName || 'Copropiedad',
        '{instrucciones_pago}': 'Consignar a la Cuenta de Ahorros Bancolombia No. 123-456789-00 a nombre de la copropiedad.',
        '{aviso_adicional}': noticeVal
      };

      let simSubj = subjTpl;
      let simBody = bodyTpl;
      Object.keys(dummyCtx).forEach(k => {
        const re = new RegExp(k, 'gi');
        simSubj = simSubj.replace(re, dummyCtx[k]);
        simBody = simBody.replace(re, dummyCtx[k]);
      });

      const prevSubjElem = document.getElementById('ph-prev-subject');
      const prevBodyElem = document.getElementById('ph-prev-body');
      const prevNoticeBox = document.getElementById('ph-prev-notice-box');
      const prevNoticeText = document.getElementById('ph-prev-notice-text');

      if (prevSubjElem) prevSubjElem.textContent = simSubj;
      if (prevBodyElem) prevBodyElem.textContent = simBody;

      if (noticeVal && !bodyTpl.includes('{aviso_adicional}')) {
        if (prevNoticeBox) prevNoticeBox.classList.remove('hidden');
        if (prevNoticeText) prevNoticeText.textContent = noticeVal;
      } else {
        if (prevNoticeBox) prevNoticeBox.classList.add('hidden');
      }
    };

    tabEditBtn?.addEventListener('click', () => {
      tabEditBtn.className = 'pb-2 text-blue-600 border-b-2 border-blue-600 flex items-center gap-1 cursor-pointer';
      tabPrevBtn!.className = 'pb-2 text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer';
      paneEdit?.classList.remove('hidden');
      panePrev?.classList.add('hidden');
    });

    tabPrevBtn?.addEventListener('click', () => {
      tabPrevBtn.className = 'pb-2 text-blue-600 border-b-2 border-blue-600 flex items-center gap-1 cursor-pointer';
      tabEditBtn!.className = 'pb-2 text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer';
      panePrev?.classList.remove('hidden');
      paneEdit?.classList.add('hidden');
      updatePreview();
    });

    // Acción de envío masivo
    document.getElementById('ph-bulk-email-confirm-btn')?.addEventListener('click', async () => {
      const modalPeriodInput = document.getElementById('ph-bulk-email-period') as HTMLInputElement;
      const pagePeriodInput = document.getElementById('ph-period-filter') as HTMLInputElement;
      const effectivePeriod = (modalPeriodInput && modalPeriodInput.value ? modalPeriodInput.value.trim() : '') ||
                              (pagePeriodInput && pagePeriodInput.value ? pagePeriodInput.value.trim() : '') ||
                              initialPeriod ||
                              currentPeriod();

      if (!effectivePeriod) {
        (window as any).showToast('Por favor seleccione un período válido.', 'error');
        return;
      }

      const type = (document.getElementById('ph-bulk-email-type') as HTMLSelectElement)?.value || 'invoice';
      const subject = (document.getElementById('ph-bulk-email-subject') as HTMLInputElement)?.value.trim();
      const message = (document.getElementById('ph-bulk-email-message') as HTMLTextAreaElement)?.value.trim();
      const notice = (document.getElementById('ph-bulk-email-notice') as HTMLTextAreaElement)?.value.trim();
      const onlyPending = (document.getElementById('ph-bulk-email-only-pending') as HTMLInputElement)?.checked ?? true;
      
      const confirmBtn = document.getElementById('ph-bulk-email-confirm-btn') as HTMLButtonElement;
      const cancelBtn = document.getElementById('ph-bulk-email-cancel') as HTMLButtonElement;
      const progressContainer = document.getElementById('ph-bulk-email-progress-container') as HTMLDivElement;
      const progressCounts = document.getElementById('ph-bulk-email-progress-counts') as HTMLSpanElement;
      const progressBar = document.getElementById('ph-bulk-email-progress-bar') as HTMLDivElement;
      const log = document.getElementById('ph-bulk-email-log') as HTMLDivElement;

      confirmBtn.disabled = true;
      cancelBtn.disabled = true;
      progressContainer.classList.remove('hidden');
      log.innerHTML = `<p class="text-blue-500 font-bold"><i class="fas fa-spinner fa-spin mr-1"></i> Consultando facturas del período ${effectivePeriod}...</p>`;

      try {
        // 1. Consultar facturas activas del período
        const allInvsRes = await (window as any).API.getPhInvoices({
          filter: `period="${(window as any).pb.escapeFilterValue(effectivePeriod)}" && status != 'voided'`,
          perPage: 1000,
          sort: 'number'
        });
        
        const allInvoices = (allInvsRes && allInvsRes.items) ? allInvsRes.items : [];
        if (!allInvoices.length) {
          log.innerHTML = `<div class="p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded text-xs font-semibold">
            <i class="fas fa-exclamation-triangle text-amber-600 mr-1.5"></i> No se encontraron facturas activas para el período <strong>${effectivePeriod}</strong>.<br>
            <span class="text-gray-600 font-normal">Por favor verifique que la facturación de dicho mes ya haya sido emitida en el módulo.</span>
          </div>`;
          (window as any).showToast(`No hay facturas activas para el período ${effectivePeriod}.`, 'warning');
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = '<i class="fas fa-mail-bulk mr-1"></i> Iniciar Envío Masivo';
          cancelBtn.disabled = false;
          return;
        }

        // 2. Filtrar si onlyPending está activo
        let targetInvoices = allInvoices;
        if (onlyPending) {
          targetInvoices = allInvoices.filter((inv: any) => !inv.email_sent && inv.email_status !== 'sent');
        }

        if (!targetInvoices.length) {
          progressCounts.textContent = `${allInvoices.length} / ${allInvoices.length} Enviadas`;
          progressBar.style.width = '100%';
          log.innerHTML = `<div class="p-3 bg-green-50 border-l-4 border-green-500 text-green-900 rounded text-xs font-semibold">
            <i class="fas fa-check-circle text-green-600 mr-1.5"></i> Todas las facturas (${allInvoices.length}) de este período ya fueron enviadas exitosamente.<br>
            <span class="text-gray-600 font-normal">Si desea reenviarlas a todos los copropietarios, desmarque la casilla "Omitir facturas ya enviadas".</span>
          </div>`;
          (window as any).showToast('Todas las facturas ya fueron enviadas previamente.', 'info');
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Completado';
          cancelBtn.disabled = false;
          cancelBtn.textContent = 'Cerrar';
          return;
        }

        const totalToProcess = targetInvoices.length;
        progressCounts.textContent = `0 / ${totalToProcess} Procesados`;
        progressBar.style.width = '0%';
        log.innerHTML = `<p class="text-blue-600 font-bold mb-1">Iniciando envío seguro por lotes (${totalToProcess} facturas a procesar)...</p>`;

        // 3. Dividir en Chunks de 3 facturas por lote
        const chunkSize = 3;
        const chunks: any[][] = [];
        for (let i = 0; i < targetInvoices.length; i += chunkSize) {
          chunks.push(targetInvoices.slice(i, i + chunkSize));
        }

        let sentTotal = 0;
        let skippedTotal = 0;
        let failedTotal = 0;
        let processedTotal = 0;
        let circuitBreakerHit = false;
        let circuitBreakerReason = '';

        for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
          const currentChunk = chunks[cIdx];
          const chunkIds = currentChunk.map((inv: any) => inv.id);

          try {
            const res = await (window as any).API.sendPhBulkEmails(
              effectivePeriod,
              type,
              subject,
              message,
              notice,
              onlyPending,
              chunkIds
            );

            sentTotal += (res.sent || 0);
            skippedTotal += (res.skipped || 0);
            failedTotal += (res.failed || 0);
            processedTotal += currentChunk.length;

            // Actualizar progreso visual en tiempo real
            const pct = Math.min(100, Math.round((processedTotal / totalToProcess) * 100));
            progressBar.style.width = `${pct}%`;
            progressCounts.textContent = `${processedTotal} / ${totalToProcess} (${pct}%)`;

            // Insertar líneas de log en tiempo real
            if (res.details && res.details.length > 0) {
              res.details.forEach((det: any) => {
                const p = document.createElement('p');
                if (det.status === 'sent') {
                  const pdfTag = det.pdfAttached ? ' <span style="color:#10b981;font-weight:bold;">[+PDF]</span>' : '';
                  p.className = 'text-green-600';
                  p.innerHTML = `[ENV] Unidad ${det.unit || ''} — Enviado a ${det.email} ${pdfTag}`;
                } else if (det.status === 'skipped') {
                  p.className = 'text-orange-500';
                  p.textContent = `[OMI] Factura ${det.number || ''} ${det.unit ? 'Unidad ' + det.unit : ''} — ${det.reason || ''}`;
                } else {
                  p.className = 'text-red-500';
                  p.textContent = `[ERR] Factura ${det.number || ''} — Error: ${det.reason || ''}`;
                }
                log.appendChild(p);
              });
              log.scrollTop = log.scrollHeight;
            }

            // Validar si saltó el Circuit Breaker de Gmail / SMTP
            if (res.circuitBreaker && res.circuitBreaker.triggered) {
              circuitBreakerHit = true;
              circuitBreakerReason = res.circuitBreaker.reason || 'Protección SMTP activada.';
              break; // Detener el bucle de chunks inmediatamente
            }

          } catch (chunkErr: any) {
            console.error('[GRAVY PH CHUNK ERROR]', chunkErr);
            failedTotal += currentChunk.length;
            processedTotal += currentChunk.length;
            const p = document.createElement('p');
            p.className = 'text-red-500 font-bold';
            p.textContent = `[ERR LOTE] Error en lote ${cIdx + 1}: ${chunkErr.message || chunkErr}`;
            log.appendChild(p);
            log.scrollTop = log.scrollHeight;
          }
        }

        // Resumen final
        let finalBanner = '';
        if (circuitBreakerHit) {
          finalBanner = `<div class="p-2.5 mt-2 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded text-xs font-semibold">
            <i class="fas fa-shield-alt text-amber-600 mr-1.5"></i><strong>Envío en pausa preventiva (Circuit Breaker):</strong><br>
            <span>${circuitBreakerReason}</span><br>
            <span class="text-gray-600 font-normal">Los correos ya enviados están registrados. Cuando se renueve la cuota o configure Brevo, presione "Reintentar Pendientes".</span>
          </div>`;
          (window as any).showToast(`Envío pausado por seguridad: ${circuitBreakerReason}`, 'warning');
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = '<i class="fas fa-redo mr-1"></i> Reintentar Pendientes';
        } else {
          finalBanner = `<p class="text-green-600 font-bold mt-2">¡Proceso de envío finalizado!</p>`;
          (window as any).showToast(`Envío masivo completo. ${sentTotal} enviados con PDF, ${skippedTotal} omitidos, ${failedTotal} fallidos.`, failedTotal > 0 ? 'warning' : 'success');
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = '<i class="fas fa-check mr-1"></i> Finalizado';
        }

        const summaryDiv = document.createElement('div');
        summaryDiv.innerHTML = finalBanner + `<p class="text-xs font-semibold text-gray-700 mt-1 mb-2">Total procesado: ${sentTotal} enviados (+PDF), ${skippedTotal} omitidos, ${failedTotal} fallidos.</p>`;
        log.appendChild(summaryDiv);
        log.scrollTop = log.scrollHeight;

        cancelBtn.disabled = false;
        cancelBtn.textContent = 'Cerrar';

      } catch (err: any) {
        console.error('[GRAVY PH BULK EMAIL ERROR]', err);
        log.innerHTML += `<p class="text-red-500 font-bold"><i class="fas fa-exclamation-circle mr-1"></i> Fallo general: ${err.message}</p>`;
        (window as any).showToast(err.message || 'Error en envío masivo', 'error');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-mail-bulk mr-1"></i> Iniciar Envío Masivo';
        cancelBtn.disabled = false;
      }
    });
  }, 40);
}

(window as any).renderPhPresupuesto = renderPhPresupuesto;
(window as any).openPhBudgetModal = openPhBudgetModal;

(window as any).renderPhPqrRows = renderPhPqrRows;
(window as any).openPhAddIndividualLinesModal = openPhAddIndividualLinesModal;
(window as any).PH_STATUS = PH_STATUS;
(window as any).renderPhReservas = renderPhReservas;
(window as any).PH_PQRS_TYPES = PH_PQRS_TYPES;
(window as any).markPhPaidConfirm = markPhPaidConfirm;
(window as any).openPhUnitModal = openPhUnitModal;
(window as any).fmtPeriod = fmtPeriod;
(window as any).openPhInvoiceDetail = openPhInvoiceDetail;
(window as any).renderPhInvRows = renderPhInvRows;
(window as any).renderPhUnidades = renderPhUnidades;
(window as any).PH_PQRS_PRIORITY = PH_PQRS_PRIORITY;
(window as any).renderPhConceptRows = renderPhConceptRows;
(window as any).renderPhResRows = renderPhResRows;
(window as any).currentPeriod = currentPeriod;
(window as any).unpostPhInvoiceConfirm = unpostPhInvoiceConfirm;
(window as any)._renderPhPage = _renderPhPage;
(window as any).togglePhUnit = togglePhUnit;

(window as any).printPhInvoice = printPhInvoice;
(window as any).openPhInvoiceEmailModal = openPhInvoiceEmailModal;
(window as any).openPhBulkEmailModal = openPhBulkEmailModal;
(window as any).openPhBulkPdfModal = openPhBulkPdfModal;
(window as any).openPhDownloadPdfModal = openPhDownloadPdfModal;
(window as any).executePhInvoicePdfDownload = executePhInvoicePdfDownload;

