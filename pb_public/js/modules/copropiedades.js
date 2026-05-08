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
        ${can('canWrite') ? `
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
          ${inv.status === 'draft' ? `
            <button class="btn btn-sm ph-inv-post" data-id="${esc(inv.id)}" title="Contabilizar"
              style="background:#ECFDF5;color:#059669;border:1.5px solid #6EE7B7">
              <i class="fas fa-check"></i>
            </button>` : ''}
          ${inv.status === 'posted' ? `
            <button class="btn btn-sm ph-inv-paid" data-id="${esc(inv.id)}" title="Marcar pagada"
              style="background:#EEF4FF;color:#2446B8;border:1.5px solid #93C5FD">
              <i class="fas fa-coins"></i>
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
    btn.addEventListener('click', () => openPhInvoiceDetail(btn.dataset.id));
  });
  document.querySelectorAll('.ph-inv-post').forEach(btn => {
    btn.addEventListener('click', () => postPhInvoiceConfirm(btn.dataset.id, btn));
  });
  document.querySelectorAll('.ph-inv-paid').forEach(btn => {
    btn.addEventListener('click', () => markPhPaidConfirm(btn.dataset.id, btn));
  });
  document.querySelectorAll('.ph-inv-void').forEach(btn => {
    btn.addEventListener('click', () => voidPhInvoiceModal(btn.dataset.id));
  });
}

function openPhGenerateModal() {
  const period = document.getElementById('ph-period-filter')?.value || currentPeriod();
  // Calcular fecha de vencimiento (día 10 del siguiente mes)
  const [y, m] = period.split('-').map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  const dueDateDefault = `${nextMonth.replace('-', '-')}10`.replace(/(\d{4})-(\d{2})(\d{2})/, '$1-$2-$3')
    .replace(/(\d{4}-\d{2})(\d{2})/, '$1-$2');

  openModal(
    'Generar Facturas del Período',
    `<div class="space-y-4">
      <p class="text-sm" style="color:#374151">
        Se generará una factura en estado <strong>Borrador</strong> para cada unidad activa que no tenga factura en este período.
        Los conceptos y montos se toman de la configuración de <em>Conceptos de Facturación</em>.
      </p>
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
          <thead><tr><th>Concepto</th><th class="text-right">Valor</th></tr></thead>
          <tbody>
            ${lines.map(l => `<tr>
              <td>${esc(l.description)}</td>
              <td class="text-right font-semibold">${fmt(l.amount || 0)}</td>
            </tr>`).join('')}
            <tr style="border-top:2px solid #E5E7EB">
              <td class="font-bold" style="color:#0D2137">TOTAL</td>
              <td class="text-right font-bold text-lg" style="color:#0D2137">${fmt(inv.total || 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`
    );
  } catch (err) {
    showToast(err.message || 'Error al cargar la factura.', 'error');
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
          <button class="btn btn-sm ph-inv-paid" data-id="${esc(inv.id)}" title="Marcar pagada"
            style="background:#EEF4FF;color:#2446B8;border:1.5px solid #93C5FD"><i class="fas fa-coins"></i></button>
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
        <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(invoiceId)}" title="Ver detalle"><i class="fas fa-eye"></i></button>`;
      attachPhInvActions();
    }
  } catch (err) {
    showToast(err.message || 'Error.', 'error');
    if (btn) btn.disabled = false;
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
            <button class="btn btn-outline btn-sm ph-inv-view" data-id="${esc(invoiceId)}" title="Ver detalle"><i class="fas fa-eye"></i></button>`;
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
// TAB: UNIDADES HABITACIONALES
// ══════════════════════════════════════════════════════════════════════════════
async function renderPhUnidades(c) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>`;
  try {
    const properties = await API.getPhProperties(false);
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
            <button class="btn btn-primary btn-sm" id="ph-unit-add-btn">
              <i class="fas fa-plus mr-1"></i>Nueva Unidad
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Torre/Piso</th>
                <th>Coef. %</th>
                <th>Propietario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="ph-units-tbody">
              ${renderPhUnitRows(properties)}
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

    c.querySelectorAll('.ph-unit-edit').forEach(btn => {
      btn.addEventListener('click', () => openPhUnitModal(btn.dataset.id, c));
    });
    c.querySelectorAll('.ph-unit-toggle').forEach(btn => {
      btn.addEventListener('click', () => togglePhUnit(btn.dataset.id, btn.dataset.active === 'true', c));
    });
  } catch (err) {
    c.innerHTML = `<div class="p-6 text-center" style="color:#EF4444">${esc(err.message)}</div>`;
  }
}

function renderPhUnitRows(properties) {
  if (!properties.length) {
    return `<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay unidades registradas.</td></tr>`;
  }
  return properties.map(p => {
    const owner   = p.expand?.owner_id;
    const active  = p.active !== false;
    return `<tr>
      <td class="font-mono text-xs font-bold">${esc(p.code)}</td>
      <td class="font-semibold" style="color:#0D2137">${esc(p.name)}</td>
      <td><span class="badge badge-gray">${esc(p.unit_type || '—')}</span></td>
      <td class="text-sm">
        ${p.tower ? `Torre ${esc(p.tower)} ` : ''}${p.floor ? `Piso ${esc(p.floor)}` : '—'}
      </td>
      <td class="text-sm text-right">${p.coef_participacion ? fmtN(p.coef_participacion) + '%' : '—'}</td>
      <td class="text-sm">${esc(owner?.name || '—')}</td>
      <td><span class="badge ${active ? 'badge-green' : 'badge-gray'}">${active ? 'Activa' : 'Inactiva'}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm ph-unit-edit" data-id="${esc(p.id)}" title="Editar">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-outline btn-sm ph-unit-toggle" data-id="${esc(p.id)}"
            data-active="${active}" title="${active ? 'Desactivar' : 'Activar'}"
            style="${active ? 'color:#DC2626;border-color:#FECACA' : 'color:#059669;border-color:#6EE7B7'}">
            <i class="fas ${active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function openPhUnitModal(unitId, container) {
  let unit = null;
  let terceros = [];
  try {
    [terceros] = await Promise.all([
      API.getTerceros({ type: 'CLIENTE' }),
      unitId ? pb.get('ph_properties', unitId).then(u => { unit = u; }) : Promise.resolve(),
    ]);
  } catch (err) {
    showToast('Error al cargar datos.', 'error');
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
        <label class="form-label">Coef. Participación (%)</label>
        <input id="pu-coef" type="number" step="0.0001" min="0" max="100" class="form-input"
          value="${esc(unit?.coef_participacion ?? '')}" placeholder="0.0000">
      </div>
      <div class="form-group">
        <label class="form-label">Torre</label>
        <input id="pu-tower" class="form-input" value="${esc(unit?.tower || '')}" placeholder="Ej: A, 1">
      </div>
      <div class="form-group">
        <label class="form-label">Piso</label>
        <input id="pu-floor" class="form-input" value="${esc(unit?.floor || '')}" placeholder="Ej: 1, PB">
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
          ${terceros.map(t => `<option value="${esc(t.id)}" ${unit?.owner_id === t.id ? 'selected' : ''}>${esc(t.name)} (${esc(t.doc_number)})</option>`).join('')}
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Notas</label>
        <textarea id="pu-notes" class="form-input" rows="2" placeholder="Observaciones...">${esc(unit?.notes || '')}</textarea>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="pu-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`
  );

  setTimeout(() => {
    document.getElementById('pu-save-btn')?.addEventListener('click', async () => {
      const code  = (document.getElementById('pu-code')?.value  || '').trim();
      const name  = (document.getElementById('pu-name')?.value  || '').trim();
      const utype = document.getElementById('pu-type')?.value   || 'APARTAMENTO';
      if (!code || !name) { showToast('Código y nombre son obligatorios.', 'warning'); return; }

      const data = {
        code,
        name,
        unit_type:           utype,
        coef_participacion:  parseFloat(document.getElementById('pu-coef')?.value  || 0) || 0,
        tower:               (document.getElementById('pu-tower')?.value  || '').trim(),
        floor:               (document.getElementById('pu-floor')?.value  || '').trim(),
        area_m2:             parseFloat(document.getElementById('pu-area')?.value   || 0) || 0,
        owner_id:            document.getElementById('pu-owner')?.value  || null,
        notes:               document.getElementById('pu-notes')?.value  || '',
        active:              document.getElementById('pu-active')?.value === 'true',
      };

      const btn = document.getElementById('pu-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
      try {
        if (unit) {
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
      } catch (err) {
        showToast(err.message || 'Error al guardar.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Guardar'; }
      }
    }, { once: true });
  }, 50);
}

async function togglePhUnit(unitId, currentActive, container) {
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
    const today = new Date().toISOString().slice(0, 10);
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
          <table class="data-table">
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
    });

    document.getElementById('ph-res-add-btn')?.addEventListener('click', () => openPhResModal(null, c, areas));
    attachPhResActions(c, areas);
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

  const today = new Date().toISOString().slice(0, 10);
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
      API.getPhPqrs({ filter: 'status!="closed"', sort: '-created', perPage: 100 }),
      API.getPhProperties(true),
    ]);
    const pqrs   = pqrsRes.items || [];
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
          <table class="data-table">
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
      let filter   = '';
      if (status) filter += `status="${pb.escapeFilterValue(status)}"`;
      if (type)   filter += (filter ? ' && ' : '') + `pqrs_type="${pb.escapeFilterValue(type)}"`;
      if (!status) filter = filter || 'status!="closed"';
      const res = await API.getPhPqrs({ filter, sort: '-created', perPage: 100 });
      document.getElementById('ph-pqrs-tbody').innerHTML = renderPhPqrRows(res.items || []);
      attachPhPqrActions(c, props);
    }

    document.getElementById('ph-pqr-status-filter')?.addEventListener('change', reloadPqrs);
    document.getElementById('ph-pqr-type-filter')?.addEventListener('change', reloadPqrs);
    document.getElementById('ph-pqr-add-btn')?.addEventListener('click', () => openPhPqrModal(null, c, props));
    attachPhPqrActions(c, props);
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
            updateData.closed_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
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
            opened_at:   new Date().toISOString().replace('T', ' ').slice(0, 19),
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
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>`;
  try {
    const [concepts, areas, phCfgRaw, accounts] = await Promise.all([
      API.getPhBillingConcepts(false),
      API.getPhCommonAreas(false),
      API.getSetting('ph_config_v1'),
      API.getAccounts(true),
    ]);
    let phCfg = {};
    try { phCfg = phCfgRaw ? JSON.parse(phCfgRaw) : {}; } catch (_) { phCfg = {}; }
    const cxcCode    = phCfg.cxc_code    || '130505';
    const incomeCode = phCfg.income_code || '413505';

    c.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
            <input id="ph-cfg-cxc" class="form-input font-mono" value="${esc(cxcCode)}" placeholder="Ej: 130505">
            <p class="text-xs mt-1" style="color:#9CA3AF">Cuenta a debitar al generar la factura (cartera de propietarios).</p>
          </div>
          <div class="form-group">
            <label class="form-label">Cuenta de Ingreso por Defecto (Crédito)</label>
            <input id="ph-cfg-income" class="form-input font-mono" value="${esc(incomeCode)}" placeholder="Ej: 413505">
            <p class="text-xs mt-1" style="color:#9CA3AF">Usada cuando el concepto no tiene cuenta propia asignada.</p>
          </div>
          <button class="btn btn-primary" id="ph-cfg-save-btn">
            <i class="fas fa-save mr-1"></i>Guardar Configuración
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
      </div>`;

    // Guardar config contable
    document.getElementById('ph-cfg-save-btn')?.addEventListener('click', async () => {
      const cxc    = (document.getElementById('ph-cfg-cxc')?.value    || '').trim();
      const income = (document.getElementById('ph-cfg-income')?.value  || '').trim();
      if (!cxc || !income) { showToast('Completa ambas cuentas.', 'warning'); return; }
      const btn = document.getElementById('ph-cfg-save-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }
      try {
        await API.setSetting('ph_config_v1', JSON.stringify({ cxc_code: cxc, income_code: income }));
        showToast('Configuración guardada.', 'success');
      } catch (err) {
        showToast(err.message || 'Error.', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar Configuración'; }
      }
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
          ${accounts.filter(a => String(a.code||'').length >= 4).map(a =>
            `<option value="${esc(a.id)}" ${concept?.account_id === a.id ? 'selected' : ''}>
              ${esc(a.code)} — ${esc(a.name)}
            </option>`).join('')}
        </select>
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
