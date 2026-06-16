/**
 * GRAVY v2.0 — inmobiliarias.ts
 * F9: Módulo de Gestión Inmobiliaria / Arrendamientos.
 * - Gestión de inmuebles (propiedades)
 * - Contratos de arrendamiento con inquilino y propietario
 * - Liquidación y causación mensual de cánones de arriendo
 * - Configuración contable e intermediación (comisiones)
 */

'use strict';

// ── Constantes y Estados ──────────────────────────────────────────────────
const INMO_STATUS = {
  DISPONIBLE:    { label: 'Disponible',       badge: 'badge-green'  },
  ARRENDADO:     { label: 'Arrendado',        badge: 'badge-blue'   },
  VENDIDO:       { label: 'Vendido',          badge: 'badge-gray'   },
  MANTENIMIENTO: { label: 'Mantenimiento',    badge: 'badge-orange' },
};

const CONTRACT_STATUS = {
  VIGENTE:    { label: 'Vigente',    badge: 'badge-green'  },
  FINALIZADO: { label: 'Finalizado', badge: 'badge-gray'   },
  SUSPENDIDO: { label: 'Suspendido', badge: 'badge-orange' },
};

const INVOICE_STATUS_META = {
  draft:  { label: 'Borrador',       badge: 'badge-orange' },
  posted: { label: 'Contabilizada',  badge: 'badge-green'  },
  paid:   { label: 'Pagada',         badge: 'badge-blue'   },
  voided: { label: 'Anulada',        badge: 'badge-red'    },
};

const PROPERTY_TYPES = ['CASA', 'APARTAMENTO', 'LOCAL', 'BODEGA', 'OFICINA', 'LOTE', 'OTRO'];

// Helper local para KPI
function inmoKpi(label, value, iconClass, color, bg) {
  return `<div class="rounded-2xl p-4 shadow-sm" style="background:${bg}">
    <div class="flex items-center gap-2 mb-1">
      <i class="${iconClass} text-sm" style="color:${color}"></i>
      <span class="text-xs font-semibold" style="color:${color}">${label}</span>
    </div>
    <p class="text-2xl font-extrabold" style="color:${color}">${value}</p>
  </div>`;
}

// Helper para autocompletar terceros
function setupThirdPartyAutocomplete(inputId, hiddenId, resultsId, typeFilter = '') {
  const input = document.getElementById(inputId) as HTMLInputElement;
  const hidden = document.getElementById(hiddenId) as HTMLInputElement;
  const results = document.getElementById(resultsId) as HTMLElement;

  if (!input || !hidden || !results) return;

  input.addEventListener('input', (window as any).debounce(async () => {
    const q = input.value.trim();
    if (q.length < 2) {
      results.style.display = 'none';
      return;
    }

    try {
      const list = await (window as any).API.getTerceros({ query: q });
      const filtered = typeFilter ? list.filter(t => t.type === typeFilter) : list;

      if (!filtered.length) {
        results.innerHTML = `<div class="p-3 text-xs text-gray-400">Sin resultados</div>`;
        results.style.display = 'block';
        return;
      }

      results.innerHTML = filtered.map(t => `
        <div class="p-2 hover:bg-gray-100 cursor-pointer text-xs flex justify-between items-center" data-id="${t.id}" data-name="${(window as any).esc(t.name)}">
          <div>
            <strong>${(window as any).esc(t.name)}</strong>
            <span class="text-[10px] text-gray-500 block">NIT/CC: ${t.doc_number}</span>
          </div>
          <span class="badge badge-gray">${t.type}</span>
        </div>
      `).join('');
      results.style.display = 'block';

      results.querySelectorAll('[data-id]').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.getAttribute('data-id') || '';
          const name = el.getAttribute('data-name') || '';
          hidden.value = id;
          input.value = name;
          results.style.display = 'none';
        });
      });
    } catch (err) {
      console.error(err);
    }
  }, 200));

  // Cerrar al hacer click fuera
  document.addEventListener('click', (e) => {
    if (e.target !== input && e.target !== results) {
      results.style.display = 'none';
    }
  });
}

// Helper de cuentas contables
async function renderAccountSelect(selectId, defaultCode) {
  const select = document.getElementById(selectId) as HTMLSelectElement;
  if (!select) return;
  try {
    const accounts = await (window as any).API.getAccounts(true);
    select.innerHTML = accounts.map(a => `
      <option value="${a.code}" ${a.code === defaultCode ? 'selected' : ''}>
        ${a.code} - ${(window as any).esc(a.name)}
      </option>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// RENDER PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
async function renderInmobiliarias(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">
    <i class="fas fa-spinner fa-spin mr-2"></i>Cargando módulo Inmobiliaria...</div>`;
  _renderInmoPage(c, 'dashboard');
}

function _renderInmoPage(c: HTMLElement, activeTab: string) {
  const tabs = [
    { id: 'dashboard',   label: 'Dashboard',      icon: 'fa-chart-pie'            },
    { id: 'inmuebles',   label: 'Inmuebles',      icon: 'fa-house-chimney'        },
    { id: 'contratos',   label: 'Contratos',      icon: 'fa-file-signature'       },
    { id: 'liquidacion', label: 'Liquidación',    icon: 'fa-file-invoice-dollar'  },
    { id: 'config',      label: 'Configuración',  icon: 'fa-sliders'              },
  ];

  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-house-chimney-window mr-2" style="color:#EC4899"></i>Gestión Inmobiliaria
        </h3>
        <p class="text-sm" style="color:#6B7280">Administración de inmuebles, arrendamientos e intermediación.</p>
      </div>
    </div>
    <div class="flex gap-1 mb-5 border-b flex-wrap" style="border-color:#E5E7EB">
      ${tabs.map(t => `
        <button class="tab-btn${t.id === activeTab ? ' active' : ''}" data-tab="${t.id}">
          <i class="fas ${t.icon} mr-2"></i>${t.label}
        </button>`).join('')}
    </div>
    <div id="inmo-tab-content"></div>`;

  const tabContent = c.querySelector('#inmo-tab-content') as HTMLElement;

  function switchTab(tabId) {
    c.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', (b as HTMLElement).dataset.tab === tabId));
    if (tabId === 'dashboard')   renderInmoDashboard(tabContent);
    if (tabId === 'inmuebles')   renderInmoInmuebles(tabContent);
    if (tabId === 'contratos')   renderInmoContratos(tabContent);
    if (tabId === 'liquidacion') renderInmoLiquidacion(tabContent);
    if (tabId === 'config')      renderInmoConfig(tabContent);
  }

  c.querySelectorAll('.tab-btn').forEach(btn =>
    btn.addEventListener('click', () => switchTab((btn as HTMLElement).dataset.tab))
  );
  switchTab(activeTab);
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
async function renderInmoDashboard(c: HTMLElement) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando resumen...</div>`;
  try {
    const [props, contracts, invoices] = await Promise.all([
      (window as any).API.getInmoProperties(false),
      (window as any).API.getInmoContracts(false),
      (window as any).API.getInmoInvoices({ perPage: 100 }),
    ]);

    const activeContracts = contracts.filter(c => c.status === 'VIGENTE' && c.active).length;
    const totalProperties = props.length;
    const rentedProperties = props.filter(p => p.status === 'ARRENDADO').length;

    // Calcular comisiones del mes actual
    const currentPeriodStr = (window as any).currentPeriod();
    const currentMonthInvoices = (invoices.items || []).filter(i => i.period === currentPeriodStr && i.status === 'posted');
    const commissionsThisMonth = currentMonthInvoices.reduce((s, i) => s + (i.commission_amount || 0), 0);

    // Cartera pendiente (facturas emitidas pendientes de pago)
    const unpaidInvoices = (invoices.items || []).filter(i => i.status === 'posted');
    const outstandingPortfolio = unpaidInvoices.reduce((s, i) => s + (i.total || 0), 0);

    c.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${inmoKpi('Total Inmuebles', totalProperties, 'fas fa-building', '#3B82F6', '#EFF6FF')}
        ${inmoKpi('Contratos Activos', activeContracts, 'fas fa-file-signature', '#10B981', '#ECFDF5')}
        ${inmoKpi('Comisiones del Mes', (window as any).fmt(commissionsThisMonth), 'fas fa-percent', '#EC4899', '#FDF2F8')}
        ${inmoKpi('Cartera Pendiente', (window as any).fmt(outstandingPortfolio), 'fas fa-wallet', '#F59E0B', '#FFFBEB')}
      </div>
      
      <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
        <h4 class="font-bold text-sm mb-4" style="color:#0D2137"><i class="fas fa-history mr-2"></i>Facturas de Arriendo Recientes</h4>
        <div class="overflow-x-auto">
          <table class="data-table text-sm">
            <thead>
              <tr>
                <th>Factura N°</th>
                <th>Inmueble</th>
                <th>Inquilino</th>
                <th>Período</th>
                <th class="text-right">Monto</th>
                <th class="text-right">Comisión</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${(invoices.items || []).slice(0, 5).map(inv => {
                const con = inv.expand?.contract_id;
                const prop = con?.expand?.property_id;
                const tenant = con?.expand?.tenant_id;
                const meta = INVOICE_STATUS_META[inv.status] || INVOICE_STATUS_META.draft;
                return `<tr>
                  <td class="font-mono text-xs">${inv.number}</td>
                  <td class="font-semibold">${(window as any).esc(prop?.title || prop?.code || '')}</td>
                  <td>${(window as any).esc(tenant?.name || '')}</td>
                  <td>${(window as any).fmtPeriod(inv.period)}</td>
                  <td class="text-right font-semibold">${(window as any).fmt(inv.total || 0)}</td>
                  <td class="text-right font-semibold text-gray-500">${(window as any).fmt(inv.commission_amount || 0)}</td>
                  <td><span class="badge ${meta.badge}">${meta.label}</span></td>
                </tr>`;
              }).join('')}
              ${!(invoices.items || []).length ? '<tr><td colspan="7" class="text-center py-6 text-gray-400">Sin facturas generadas aún</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>`;
  } catch (err: any) {
    c.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: INMUEBLES
// ══════════════════════════════════════════════════════════════════════════════
async function renderInmoInmuebles(c: HTMLElement) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando inmuebles...</div>`;
  try {
    const list = await (window as any).API.getInmoProperties(false);

    c.innerHTML = `
      <div class="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3 justify-between" style="border-color:#F0F0F0">
        <input id="inmo-search" class="form-input text-sm" placeholder="Buscar inmueble por código o nombre..." style="max-width:300px">
        <button class="btn btn-primary" id="btn-new-inmueble">
          <i class="fas fa-plus mr-1"></i>Nuevo Inmueble
        </button>
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="table-inmuebles">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Ciudad</th>
                <th>Propietario</th>
                <th class="text-right">Alquiler Ref.</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(p => {
                const owner = p.expand?.owner_id;
                const statusMeta = INMO_STATUS[p.status] || { label: p.status, badge: 'badge-gray' };
                return `<tr data-id="${p.id}">
                  <td class="font-mono text-xs font-bold">${(window as any).esc(p.code)}</td>
                  <td>
                    <span class="font-semibold text-gray-800">${(window as any).esc(p.title)}</span>
                    <br><span class="text-xs text-gray-400">${(window as any).esc(p.address || '')}</span>
                  </td>
                  <td><span class="text-xs font-medium">${p.type}</span></td>
                  <td>${(window as any).esc(p.city || '—')}</td>
                  <td class="text-sm">${(window as any).esc(owner?.name || '—')}</td>
                  <td class="text-right font-semibold">${(window as any).fmt(p.rental_price || 0)}</td>
                  <td><span class="badge ${statusMeta.badge}">${statusMeta.label}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm inmo-edit-btn" data-id="${p.id}"><i class="fas fa-pen"></i></button>
                  </td>
                </tr>`;
              }).join('')}
              ${!list.length ? '<tr><td colspan="8" class="text-center py-8 text-gray-400">No hay inmuebles registrados</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>`;

    // Buscador
    document.getElementById('inmo-search')?.addEventListener('input', () => {
      const q = (document.getElementById('inmo-search') as HTMLInputElement).value.toLowerCase();
      document.querySelectorAll('#table-inmuebles tbody tr').forEach(row => {
        const text = row.textContent?.toLowerCase() || '';
        (row as HTMLElement).style.display = text.includes(q) ? '' : 'none';
      });
    });

    document.getElementById('btn-new-inmueble')?.addEventListener('click', () => openInmuebleModal());
    document.querySelectorAll('.inmo-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openInmuebleModal((btn as HTMLElement).dataset.id));
    });

  } catch (err: any) {
    c.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function openInmuebleModal(id = '') {
  let record = { code: '', title: '', type: 'APARTAMENTO', address: '', city: '', owner_id: '', rental_price: 0, sale_price: 0, commission_rate: 8, status: 'DISPONIBLE', notes: '', active: true };
  let ownerName = '';

  if (id) {
    try {
      const p = await (window as any).pb.get('inmo_properties', id, { expand: 'owner_id' });
      record = { ...record, ...p };
      ownerName = p.expand?.owner_id?.name || '';
    } catch (err: any) {
      (window as any).showToast('Error al cargar inmueble: ' + err.message, 'error');
      return;
    }
  }

  (window as any).openModal(
    id ? 'Editar Inmueble' : 'Nuevo Inmueble',
    `<div class="space-y-4" style="text-align: left;">
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Código Único <span class="text-red-500">*</span></label>
          <input id="inmo-code" class="form-input" value="${(window as any).esc(record.code)}" placeholder="Ej: APTO-101" ${id ? 'disabled' : ''}>
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Título/Nombre <span class="text-red-500">*</span></label>
          <input id="inmo-title" class="form-input" value="${(window as any).esc(record.title)}" placeholder="Ej: Apartamento 101 Edificio Central">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Tipo de Inmueble</label>
          <select id="inmo-type" class="form-input">
            ${PROPERTY_TYPES.map(t => `<option value="${t}" ${record.type === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Estado</label>
          <select id="inmo-status" class="form-input">
            ${Object.keys(INMO_STATUS).map(k => `<option value="${k}" ${record.status === k ? 'selected' : ''}>${INMO_STATUS[k].label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Dirección</label>
          <input id="inmo-address" class="form-input" value="${(window as any).esc(record.address)}" placeholder="Ej: Calle 45 # 10-20">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Ciudad</label>
          <input id="inmo-city" class="form-input" value="${(window as any).esc(record.city)}" placeholder="Ej: Bogotá">
        </div>
      </div>
      <div class="form-group mb-0 relative">
        <label class="form-label">Propietario (Tercero) <span class="text-red-500">*</span></label>
        <input id="inmo-owner-search" class="form-input" autocomplete="off" placeholder="Buscar por NIT o nombre..." value="${(window as any).esc(ownerName)}">
        <input id="inmo-owner-id" type="hidden" value="${(window as any).esc(record.owner_id)}">
        <div id="inmo-owner-results" class="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto hidden z-50"></div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Canon Alquiler Ref.</label>
          <input id="inmo-rent" type="number" class="form-input" value="${record.rental_price}" min="0">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Precio Venta Ref.</label>
          <input id="inmo-sale" type="number" class="form-input" value="${record.sale_price}" min="0">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">% Comisión Admin</label>
          <input id="inmo-rate" type="number" class="form-input" value="${record.commission_rate}" min="0" max="100" step="0.5">
        </div>
      </div>
      <div class="form-group mb-0">
        <label class="form-label">Notas Adicionales</label>
        <textarea id="inmo-notes" class="form-input" rows="2" placeholder="Observaciones...">${(window as any).esc(record.notes)}</textarea>
      </div>
      <div class="flex items-center gap-2">
        <input id="inmo-active" type="checkbox" ${record.active ? 'checked' : ''}>
        <label for="inmo-active" class="text-sm font-semibold select-none cursor-pointer">Inmueble Activo</label>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="inmo-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`
  );

  setupThirdPartyAutocomplete('inmo-owner-search', 'inmo-owner-id', 'inmo-owner-results', 'PROPIETARIO');

  document.getElementById('inmo-save-btn')?.addEventListener('click', async () => {
    const code = (document.getElementById('inmo-code') as HTMLInputElement).value.trim();
    const title = (document.getElementById('inmo-title') as HTMLInputElement).value.trim();
    const type = (document.getElementById('inmo-type') as HTMLSelectElement).value;
    const status = (document.getElementById('inmo-status') as HTMLSelectElement).value;
    const address = (document.getElementById('inmo-address') as HTMLInputElement).value.trim();
    const city = (document.getElementById('inmo-city') as HTMLInputElement).value.trim();
    const owner_id = (document.getElementById('inmo-owner-id') as HTMLInputElement).value;
    const rental_price = parseFloat((document.getElementById('inmo-rent') as HTMLInputElement).value) || 0;
    const sale_price = parseFloat((document.getElementById('inmo-sale') as HTMLInputElement).value) || 0;
    const commission_rate = parseFloat((document.getElementById('inmo-rate') as HTMLInputElement).value) || 8;
    const notes = (document.getElementById('inmo-notes') as HTMLTextAreaElement).value.trim();
    const active = (document.getElementById('inmo-active') as HTMLInputElement).checked;

    if (!code || !title || !owner_id) {
      (window as any).showToast('Código, título y propietario son obligatorios.', 'warning');
      return;
    }

    const payload = { code, title, type, status, address, city, owner_id, rental_price, sale_price, commission_rate, notes, active };
    const btn = document.getElementById('inmo-save-btn') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      if (id) {
        await (window as any).pb.update('inmo_properties', id, payload);
        (window as any).showToast('Inmueble actualizado exitosamente.', 'success');
      } else {
        await (window as any).pb.create('inmo_properties', payload);
        (window as any).showToast('Inmueble creado exitosamente.', 'success');
      }
      (window as any).closeModal();
      renderInmoInmuebles(document.getElementById('inmo-tab-content') as HTMLElement);
    } catch (err: any) {
      (window as any).showToast(err.message || 'Error al guardar inmueble', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar';
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CONTRATOS
// ══════════════════════════════════════════════════════════════════════════════
async function renderInmoContratos(c: HTMLElement) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando contratos...</div>`;
  try {
    const list = await (window as any).API.getInmoContracts(false);

    c.innerHTML = `
      <div class="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3 justify-between" style="border-color:#F0F0F0">
        <input id="contract-search" class="form-input text-sm" placeholder="Buscar por número o inquilino..." style="max-width:300px">
        <button class="btn btn-primary" id="btn-new-contract">
          <i class="fas fa-plus mr-1"></i>Nuevo Contrato
        </button>
      </div>
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto">
          <table class="data-table" id="table-contratos">
            <thead>
              <tr>
                <th>Contrato N°</th>
                <th>Inmueble</th>
                <th>Inquilino</th>
                <th>Inicio</th>
                <th>Vence</th>
                <th class="text-right">Canon Mensual</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(contract => {
                const prop = contract.expand?.property_id;
                const tenant = contract.expand?.tenant_id;
                const statusMeta = CONTRACT_STATUS[contract.status] || { label: contract.status, badge: 'badge-gray' };
                return `<tr data-id="${contract.id}">
                  <td class="font-mono text-xs font-bold">${(window as any).esc(contract.number)}</td>
                  <td>
                    <span class="font-semibold text-gray-800">${(window as any).esc(prop?.title || '')}</span>
                  </td>
                  <td>${(window as any).esc(tenant?.name || '')}</td>
                  <td>${contract.start_date}</td>
                  <td>${contract.end_date}</td>
                  <td class="text-right font-semibold">${(window as any).fmt(contract.monthly_rent || 0)}</td>
                  <td><span class="badge ${statusMeta.badge}">${statusMeta.label}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm contract-edit-btn" data-id="${contract.id}"><i class="fas fa-pen"></i></button>
                  </td>
                </tr>`;
              }).join('')}
              ${!list.length ? '<tr><td colspan="8" class="text-center py-8 text-gray-400">No hay contratos activos registrados</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>`;

    document.getElementById('contract-search')?.addEventListener('input', () => {
      const q = (document.getElementById('contract-search') as HTMLInputElement).value.toLowerCase();
      document.querySelectorAll('#table-contratos tbody tr').forEach(row => {
        const text = row.textContent?.toLowerCase() || '';
        (row as HTMLElement).style.display = text.includes(q) ? '' : 'none';
      });
    });

    document.getElementById('btn-new-contract')?.addEventListener('click', () => openContractModal());
    document.querySelectorAll('.contract-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openContractModal((btn as HTMLElement).dataset.id));
    });

  } catch (err: any) {
    c.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function openContractModal(id = '') {
  let record = { number: '', property_id: '', tenant_id: '', start_date: '', end_date: '', monthly_rent: 0, increment_percentage: 0, status: 'VIGENTE', notes: '', active: true };
  let tenantName = '';
  let properties = [];

  try {
    properties = await (window as any).API.getInmoProperties(true);
  } catch (err) {
    console.error(err);
  }

  if (id) {
    try {
      const c = await (window as any).pb.get('inmo_contracts', id, { expand: 'tenant_id' });
      record = { ...record, ...c };
      tenantName = c.expand?.tenant_id?.name || '';
    } catch (err: any) {
      (window as any).showToast('Error al cargar contrato: ' + err.message, 'error');
      return;
    }
  }

  (window as any).openModal(
    id ? 'Editar Contrato' : 'Nuevo Contrato',
    `<div class="space-y-4" style="text-align: left;">
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Contrato N° <span class="text-red-500">*</span></label>
          <input id="cont-number" class="form-input" value="${(window as any).esc(record.number)}" placeholder="Ej: CON-2026-001" ${id ? 'disabled' : ''}>
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Inmueble Asociado <span class="text-red-500">*</span></label>
          <select id="cont-property" class="form-input">
            <option value="">Selecciona inmueble...</option>
            ${properties.map(p => `<option value="${p.id}" ${record.property_id === p.id ? 'selected' : ''}>${p.code} - ${(window as any).esc(p.title)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group mb-0 relative">
        <label class="form-label">Inquilino / Arrendatario <span class="text-red-500">*</span></label>
        <input id="cont-tenant-search" class="form-input" autocomplete="off" placeholder="Buscar por NIT o nombre del inquilino..." value="${(window as any).esc(tenantName)}">
        <input id="cont-tenant-id" type="hidden" value="${(window as any).esc(record.tenant_id)}">
        <div id="cont-tenant-results" class="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto hidden z-50"></div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Fecha de Inicio <span class="text-red-500">*</span></label>
          <input id="cont-start" type="date" class="form-input" value="${record.start_date}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Fecha de Vencimiento <span class="text-red-500">*</span></label>
          <input id="cont-end" type="date" class="form-input" value="${record.end_date}">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Valor Canon Mensual <span class="text-red-500">*</span></label>
          <input id="cont-rent" type="number" class="form-input" value="${record.monthly_rent}" min="0">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">% Incremento Anual</label>
          <input id="cont-increment" type="number" class="form-input" value="${record.increment_percentage}" min="0" max="100">
        </div>
      </div>
      <div class="form-group mb-0">
        <label class="form-label">Estado</label>
        <select id="cont-status" class="form-input">
          ${Object.keys(CONTRACT_STATUS).map(k => `<option value="${k}" ${record.status === k ? 'selected' : ''}>${CONTRACT_STATUS[k].label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group mb-0">
        <label class="form-label">Notas del Contrato</label>
        <textarea id="cont-notes" class="form-input" rows="2" placeholder="Términos especiales, codeudores...">${(window as any).esc(record.notes)}</textarea>
      </div>
      <div class="flex items-center gap-2">
        <input id="cont-active" type="checkbox" ${record.active ? 'checked' : ''}>
        <label for="cont-active" class="text-sm font-semibold select-none cursor-pointer">Contrato Activo</label>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="cont-save-btn"><i class="fas fa-save mr-1"></i>Guardar</button>`
  );

  setupThirdPartyAutocomplete('cont-tenant-search', 'cont-tenant-id', 'cont-tenant-results', 'CLIENTE');

  document.getElementById('cont-save-btn')?.addEventListener('click', async () => {
    const number = (document.getElementById('cont-number') as HTMLInputElement).value.trim();
    const property_id = (document.getElementById('cont-property') as HTMLSelectElement).value;
    const tenant_id = (document.getElementById('cont-tenant-id') as HTMLInputElement).value;
    const start_date = (document.getElementById('cont-start') as HTMLInputElement).value;
    const end_date = (document.getElementById('cont-end') as HTMLInputElement).value;
    const monthly_rent = parseFloat((document.getElementById('cont-rent') as HTMLInputElement).value) || 0;
    const increment_percentage = parseFloat((document.getElementById('cont-increment') as HTMLInputElement).value) || 0;
    const status = (document.getElementById('cont-status') as HTMLSelectElement).value;
    const notes = (document.getElementById('cont-notes') as HTMLTextAreaElement).value.trim();
    const active = (document.getElementById('cont-active') as HTMLInputElement).checked;

    if (!number || !property_id || !tenant_id || !start_date || !end_date || monthly_rent <= 0) {
      (window as any).showToast('Completa todos los campos obligatorios.', 'warning');
      return;
    }

    const payload = { number, property_id, tenant_id, start_date, end_date, monthly_rent, increment_percentage, status, notes, active };
    const btn = document.getElementById('cont-save-btn') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      if (id) {
        await (window as any).pb.update('inmo_contracts', id, payload);
        (window as any).showToast('Contrato actualizado exitosamente.', 'success');
      } else {
        await (window as any).pb.create('inmo_contracts', payload);
        // Cambiar estado del inmueble a Arrendado automáticamente si el contrato se pone Vigente
        if (status === 'VIGENTE') {
          await (window as any).pb.update('inmo_properties', property_id, { status: 'ARRENDADO' });
        }
        (window as any).showToast('Contrato creado exitosamente.', 'success');
      }
      (window as any).closeModal();
      renderInmoContratos(document.getElementById('inmo-tab-content') as HTMLElement);
    } catch (err: any) {
      (window as any).showToast(err.message || 'Error al guardar contrato', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar';
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: LIQUIDACIÓN / FACTURACIÓN
// ══════════════════════════════════════════════════════════════════════════════
async function renderInmoLiquidacion(c: HTMLElement) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando facturas...</div>`;
  try {
    const period = (window as any).currentPeriod();
    const safePeriod = pb.escapeFilterValue(period);
    const invoicesRes = await (window as any).API.getInmoInvoices({ filter: `period="${safePeriod}"`, perPage: 200 });
    const invoices = invoicesRes.items || [];

    const totalMonth = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const commissionsMonth = invoices.reduce((s, i) => s + (i.commission_amount || 0), 0);
    const draftCount = invoices.filter(i => i.status === 'draft').length;
    const postedCount = invoices.filter(i => i.status === 'posted').length;

    c.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${inmoKpi('Total del Período', (window as any).fmt(totalMonth), 'fas fa-sack-dollar', '#3B82F6', '#EFF6FF')}
        ${inmoKpi('Comisiones Estimadas', (window as any).fmt(commissionsMonth), 'fas fa-percent', '#EC4899', '#FDF2F8')}
        ${inmoKpi('Facturas Borrador', draftCount, 'fas fa-pen-to-square', '#F59E0B', '#FFFBEB')}
        ${inmoKpi('Facturas Contabilizadas', postedCount, 'fas fa-check-circle', '#10B981', '#ECFDF5')}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3" style="border-color:#F0F0F0">
        <div>
          <label class="form-label mb-1">Período de Facturación</label>
          <input id="inmo-period-filter" type="month" class="form-input" style="max-width:180px" value="${period}">
        </div>
        <div class="flex-1"></div>
        <button class="btn btn-outline" id="inmo-post-period-btn" style="color:#10B981;border-color:#10B981" title="Contabilizar lote">
          <i class="fas fa-layer-group"></i> Contabilizar período
        </button>
        <button class="btn btn-outline" id="inmo-unpost-period-btn" style="color:#3B82F6;border-color:#3B82F6" title="Descontabilizar lote">
          <i class="fas fa-rotate-left"></i> Descontabilizar período
        </button>
        <button class="btn btn-outline" id="inmo-delete-period-btn" style="color:#EF4444;border-color:#EF4444" title="Eliminar periodo">
          <i class="fas fa-trash"></i> Eliminar período
        </button>
        <button class="btn btn-primary" id="inmo-gen-btn">
          <i class="fas fa-wand-magic-sparkles mr-1"></i> Generar facturas
        </button>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="px-5 py-3 border-b flex items-center justify-between" style="border-color:#F0F0F0">
          <span class="font-bold text-sm" style="color:#0D2137">
            Facturas de Arriendo — <span id="inmo-period-label">${(window as any).fmtPeriod(period)}</span>
          </span>
          <input id="inmo-inv-search" class="form-input text-sm" placeholder="Buscar inquilino..." style="max-width:200px">
        </div>
        <div class="overflow-x-auto">
          <table class="data-table" id="inmo-inv-table">
            <thead>
              <tr>
                <th>Factura N°</th>
                <th>Inmueble</th>
                <th>Inquilino</th>
                <th class="text-right">Alquiler</th>
                <th class="text-right">Comisión</th>
                <th class="text-right">Neto Dueño</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="inmo-inv-tbody">
              ${renderInmoInvRows(invoices)}
            </tbody>
          </table>
        </div>
      </div>`;

    // Filtros e inputs de acciones
    document.getElementById('inmo-period-filter')?.addEventListener('change', async (e) => {
      const p = (e.target as HTMLInputElement).value;
      if (!p) return;
      document.getElementById('inmo-period-label')!.textContent = (window as any).fmtPeriod(p);
      const safep = pb.escapeFilterValue(p);
      const res = await (window as any).API.getInmoInvoices({ filter: `period="${safep}"`, perPage: 200 });
      document.getElementById('inmo-inv-tbody')!.innerHTML = renderInmoInvRows(res.items || []);
      attachInmoInvActions();
    });

    document.getElementById('inmo-inv-search')?.addEventListener('input', () => {
      const q = (document.getElementById('inmo-inv-search') as HTMLInputElement).value.toLowerCase();
      document.querySelectorAll('#inmo-inv-table tbody tr').forEach(row => {
        const text = row.textContent?.toLowerCase() || '';
        (row as HTMLElement).style.display = text.includes(q) ? '' : 'none';
      });
    });

    document.getElementById('inmo-gen-btn')?.addEventListener('click', () => openInmoGenerateModal(c));
    document.getElementById('inmo-post-period-btn')?.addEventListener('click', () => postInmoPeriod(c));
    document.getElementById('inmo-unpost-period-btn')?.addEventListener('click', () => unpostInmoPeriod(c));
    document.getElementById('inmo-delete-period-btn')?.addEventListener('click', () => deleteInmoPeriod(c));

    attachInmoInvActions();
  } catch (err: any) {
    c.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

function renderInmoInvRows(invoices) {
  if (!invoices.length) {
    return `<tr><td colspan="8" class="text-center py-8 text-gray-400">Sin facturas para este período.</td></tr>`;
  }
  return invoices.map(inv => {
    const con = inv.expand?.contract_id;
    const prop = con?.expand?.property_id;
    const tenant = con?.expand?.tenant_id;
    const meta = INVOICE_STATUS_META[inv.status] || INVOICE_STATUS_META.draft;
    return `<tr data-id="${inv.id}">
      <td class="font-mono text-xs">${inv.number}</td>
      <td>
        <span class="font-semibold" style="color:#0D2137">${(window as any).esc(prop?.title || '')}</span>
      </td>
      <td>${(window as any).esc(tenant?.name || '')}</td>
      <td class="text-right font-semibold">${(window as any).fmt(inv.rent_amount || 0)}</td>
      <td class="text-right text-gray-500">${(window as any).fmt(inv.commission_amount || 0)}</td>
      <td class="text-right text-emerald-600 font-semibold">${(window as any).fmt(inv.net_to_owner || 0)}</td>
      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
      <td>
        <div class="flex gap-1">
          ${inv.status === 'draft' ? `
            <button class="btn btn-sm inmo-inv-post" data-id="${inv.id}" title="Contabilizar" style="background:#ECFDF5;color:#10B981;border:1px solid #A7F3D0">
              <i class="fas fa-check"></i>
            </button>` : ''}
          ${inv.status === 'posted' ? `
            <button class="btn btn-outline btn-sm inmo-inv-unpost" data-id="${inv.id}" title="Descontabilizar" style="color:#3B82F6;border-color:#93C5FD">
              <i class="fas fa-rotate-left"></i>
            </button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function attachInmoInvActions() {
  document.querySelectorAll('.inmo-inv-post').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset.id || '';
      if (!confirm('¿Contabilizar esta factura de arriendo? Se generará el asiento contable.')) return;
      try {
        await (window as any).API.postInmoInvoice(id);
        (window as any).showToast('Factura contabilizada exitosamente.', 'success');
        renderInmoLiquidacion(document.getElementById('page-content') as HTMLElement);
      } catch (err: any) {
        (window as any).showToast(err.message, 'error');
      }
    });
  });

  document.querySelectorAll('.inmo-inv-unpost').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset.id || '';
      if (!confirm('¿Descontabilizar esta factura? Volverá a estado borrador.')) return;
      try {
        await (window as any).API.unpostInmoInvoice(id);
        (window as any).showToast('Factura revertida a borrador.', 'success');
        renderInmoLiquidacion(document.getElementById('page-content') as HTMLElement);
      } catch (err: any) {
        (window as any).showToast(err.message, 'error');
      }
    });
  });
}

function openInmoGenerateModal(c: HTMLElement) {
  const period = (document.getElementById('inmo-period-filter') as HTMLInputElement)?.value || (window as any).currentPeriod();

  (window as any).openModal(
    'Generar Facturas del Período',
    `<div class="space-y-4" style="text-align: left;">
      <p class="text-sm text-gray-600">
        Esta acción generará facturas en estado **Borrador** para todos los contratos vigentes que no tengan facturas en el período <strong>${(window as any).fmtPeriod(period)}</strong>.
      </p>
      <div class="form-group mb-0">
        <label class="form-label">Período de Facturación</label>
        <input id="gen-inmo-period" type="month" class="form-input" value="${period}">
      </div>
      <div class="form-group mb-0">
        <label class="form-label">Fecha Límite de Pago</label>
        <input id="gen-inmo-due" type="date" class="form-input" value="${period}-10">
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="gen-inmo-confirm-btn"><i class="fas fa-wand-magic-sparkles mr-1"></i> Generar</button>`
  );

  document.getElementById('gen-inmo-confirm-btn')?.addEventListener('click', async () => {
    const p = (document.getElementById('gen-inmo-period') as HTMLInputElement).value;
    const due = (document.getElementById('gen-inmo-due') as HTMLInputElement).value;
    if (!p) return;

    const btn = document.getElementById('gen-inmo-confirm-btn') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Generando...';

    try {
      const count = await (window as any).API.generateInmoInvoices(p, due);
      (window as any).showToast(`${count} facturas generadas para el período.`, 'success');
      (window as any).closeModal();
      renderInmoLiquidacion(c);
    } catch (err: any) {
      (window as any).showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-wand-magic-sparkles mr-1"></i> Generar';
    }
  });
}

async function postInmoPeriod(c: HTMLElement) {
  const period = (document.getElementById('inmo-period-filter') as HTMLInputElement).value;
  if (!confirm(`¿Deseas contabilizar en lote todas las facturas del período ${period}?`)) return;
  try {
    const res = await (window as any).API.postInmoInvoicesByPeriod(period);
    (window as any).showToast(`Período contabilizado: ${res.posted} facturas procesadas, ${res.failed} fallidas.`, 'success');
    renderInmoLiquidacion(c);
  } catch (err: any) {
    (window as any).showToast(err.message, 'error');
  }
}

async function unpostInmoPeriod(c: HTMLElement) {
  const period = (document.getElementById('inmo-period-filter') as HTMLInputElement).value;
  if (!confirm(`¿Deseas descontabilizar todas las facturas del período ${period}? Se pasarán a borrador.`)) return;
  try {
    const res = await (window as any).API.unpostInmoInvoicesByPeriod(period);
    (window as any).showToast(`Período descontabilizado: ${res.reverted} facturas revertidas.`, 'success');
    renderInmoLiquidacion(c);
  } catch (err: any) {
    (window as any).showToast(err.message, 'error');
  }
}

async function deleteInmoPeriod(c: HTMLElement) {
  const period = (document.getElementById('inmo-period-filter') as HTMLInputElement).value;
  if (!confirm(`¿ATENCIÓN: Deseas eliminar permanentemente todas las facturas del período ${period}? Esta acción no se puede deshacer.`)) return;
  try {
    const res = await (window as any).API.deleteInmoInvoicesByPeriod(period);
    (window as any).showToast(`Período eliminado: ${res.deleted} facturas eliminadas del sistema.`, 'success');
    renderInmoLiquidacion(c);
  } catch (err: any) {
    (window as any).showToast(err.message, 'error');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CONFIGURACIÓN
// ══════════════════════════════════════════════════════════════════════════════
async function renderInmoConfig(c: HTMLElement) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando configuración...</div>`;
  try {
    const raw = await (window as any).API.getSetting('inmo_config_v1');
    let cfg = { cxc_tenant_code: '130505', commission_income_code: '413505', cxp_owner_code: '220505' };
    if (raw) {
      try { cfg = JSON.parse(raw); } catch (_) {}
    }

    c.innerHTML = `
      <div class="bg-white rounded-2xl border p-6 max-w-2xl mx-auto" style="border-color:#F0F0F0; text-align: left;">
        <h4 class="font-bold text-base mb-4 text-gray-800"><i class="fas fa-cog mr-2 text-pink-500"></i>Configuración Contable del Módulo</h4>
        <p class="text-xs text-gray-500 mb-5">Define las cuentas PUC predeterminadas para las transacciones automáticas del módulo de Inmobiliaria.</p>

        <div class="space-y-4">
          <div class="form-group">
            <label class="form-label font-bold text-gray-700">Cuenta CxC Inquilinos (Débito)</label>
            <select id="cfg-cxc-tenant" class="form-input"></select>
          </div>
          <div class="form-group">
            <label class="form-label font-bold text-gray-700">Cuenta Ingresos por Comisión (Crédito)</label>
            <select id="cfg-comm-income" class="form-input"></select>
          </div>
          <div class="form-group">
            <label class="form-label font-bold text-gray-700">Cuenta CxP Propietarios (Crédito)</label>
            <select id="cfg-cxp-owner" class="form-input"></select>
          </div>

          <div class="pt-3">
            <button class="btn btn-primary w-full justify-center py-2.5 text-sm" id="btn-save-cfg">
              <i class="fas fa-save mr-1"></i>Guardar Configuración
            </button>
          </div>
        </div>
      </div>`;

    await Promise.all([
      renderAccountSelect('cfg-cxc-tenant', cfg.cxc_tenant_code),
      renderAccountSelect('cfg-comm-income', cfg.commission_income_code),
      renderAccountSelect('cfg-cxp-owner', cfg.cxp_owner_code),
    ]);

    document.getElementById('btn-save-cfg')?.addEventListener('click', async () => {
      const cxc = (document.getElementById('cfg-cxc-tenant') as HTMLSelectElement).value;
      const income = (document.getElementById('cfg-comm-income') as HTMLSelectElement).value;
      const cxp = (document.getElementById('cfg-cxp-owner') as HTMLSelectElement).value;

      const payload = { cxc_tenant_code: cxc, commission_income_code: income, cxp_owner_code: cxp };
      const btn = document.getElementById('btn-save-cfg') as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = 'Guardando...';

      try {
        await (window as any).API.setSetting('inmo_config_v1', JSON.stringify(payload));
        (window as any).showToast('Configuración guardada exitosamente.', 'success');
      } catch (err: any) {
        (window as any).showToast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar Configuración';
      }
    });

  } catch (err: any) {
    c.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderInmobiliarias = renderInmobiliarias;
(window as any).renderInmoDashboard = renderInmoDashboard;
(window as any).renderInmoInmuebles = renderInmoInmuebles;
(window as any).renderInmoContratos = renderInmoContratos;
(window as any).renderInmoLiquidacion = renderInmoLiquidacion;
(window as any).renderInmoConfig = renderInmoConfig;
