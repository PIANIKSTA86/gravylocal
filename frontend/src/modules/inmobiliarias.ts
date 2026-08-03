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

// Helper para desglosar errores detallados de PocketBase (400 Bad Request)
function formatPbError(err: any): string {
  if (err?.data?.data) {
    const details = Object.entries(err.data.data)
      .map(([k, v]: [string, any]) => `${k}: ${v?.message || JSON.stringify(v)}`)
      .join(', ');
    if (details) return `${err.message || 'Error de validación'}: (${details})`;
  }
  if (err?.response?.data) {
    const details = Object.entries(err.response.data)
      .map(([k, v]: [string, any]) => `${k}: ${v?.message || JSON.stringify(v)}`)
      .join(', ');
    if (details) return `${err.message || 'Error de validación'}: (${details})`;
  }
  return err?.message || 'Error en la operación';
}

// Helper para autocompletar terceros
function setupThirdPartyAutocomplete(inputId: string, hiddenId: string, resultsId: string, typeFilter = '') {
  const input = document.getElementById(inputId) as HTMLInputElement;
  const hidden = document.getElementById(hiddenId) as HTMLInputElement;
  const results = document.getElementById(resultsId) as HTMLElement;

  if (!input || !hidden || !results) return;

  // Limpiar ID oculto si el usuario escribe manualmente
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== 'Tab') {
      hidden.value = '';
    }
  });

  input.addEventListener('input', (window as any).debounce(async () => {
    const q = input.value.trim();
    if (q.length < 2) {
      results.style.display = 'none';
      return;
    }

    try {
      const list = await (window as any).API.getTerceros({ query: q });

      if (!list || !list.length) {
        results.innerHTML = `<div class="p-3 text-xs text-gray-400">Sin resultados</div>`;
        results.style.display = 'block';
        return;
      }

      // Ordenar priorizando el tipo buscado si aplica
      const sorted = [...list].sort((a, b) => {
        if (typeFilter) {
          if (a.type === typeFilter && b.type !== typeFilter) return -1;
          if (a.type !== typeFilter && b.type === typeFilter) return 1;
        }
        return 0;
      });

      results.innerHTML = sorted.map(t => `
        <div class="p-2 hover:bg-gray-100 cursor-pointer text-xs flex justify-between items-center" data-id="${t.id}" data-name="${(window as any).esc(t.name)}">
          <div>
            <strong>${(window as any).esc(t.name)}</strong>
            <span class="text-[10px] text-gray-500 block">NIT/CC: ${t.doc_number || '—'}</span>
          </div>
          <span class="badge ${t.type === 'PROPIETARIO' ? 'badge-pink' : 'badge-gray'}">${t.type}</span>
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
      console.error('[GRAVY-INMO] Error en autocompletado de terceros:', err);
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
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-house-chimney-window mr-2" style="color:#EC4899"></i>Gestión de Inmuebles
        </h3>
        <p class="text-sm" style="color:#6B7280">Administración de inmuebles, registros de características y ficha técnica.</p>
      </div>
    </div>
    <div id="inmo-inmuebles-content"></div>`;
  const content = c.querySelector('#inmo-inmuebles-content') as HTMLElement;
  await renderInmoInmuebles(content);
}

async function renderInmoContratosPage(c: HTMLElement) {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-file-signature mr-2" style="color:#EC4899"></i>Contratos de Arrendamiento
        </h3>
        <p class="text-sm" style="color:#6B7280">Gestión y control de contratos de arrendamiento con inquilino y propietario.</p>
      </div>
    </div>
    <div id="inmo-contratos-content"></div>`;
  const content = c.querySelector('#inmo-contratos-content') as HTMLElement;
  await renderInmoContratos(content);
}

async function renderInmoLiquidacionPage(c: HTMLElement) {
  c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">
          <i class="fas fa-file-invoice-dollar mr-2" style="color:#EC4899"></i>Liquidación de Arrendamiento
        </h3>
        <p class="text-sm" style="color:#6B7280">Procesar causación y liquidación mensual de cánones de arriendo.</p>
      </div>
      <div>
        <button class="btn btn-outline" id="btn-inmo-config" title="Configuración Contable">
          <i class="fas fa-cog text-base"></i>
        </button>
      </div>
    </div>
    <div id="inmo-liquidacion-content"></div>`;
  
  document.getElementById('btn-inmo-config')?.addEventListener('click', () => (window as any).openInmoConfigModal());

  const content = c.querySelector('#inmo-liquidacion-content') as HTMLElement;
  await renderInmoLiquidacion(content);
}

async function renderInmoInmuebles(c: HTMLElement) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando inmuebles...</div>`;
  try {
    const [props, contracts, invoices] = await Promise.all([
      (window as any).API.getInmoProperties(false),
      (window as any).API.getInmoContracts(false),
      (window as any).API.getInmoInvoices({ perPage: 100 }),
    ]);

    const activeContracts = contracts.filter(c => c.status === 'VIGENTE' && c.active).length;
    const totalProperties = props.length;

    // Calcular comisiones del mes actual
    const currentPeriodStr = (window as any).currentPeriod();
    const currentMonthInvoices = (invoices.items || []).filter(i => i.period === currentPeriodStr && i.status === 'posted');
    const commissionsThisMonth = currentMonthInvoices.reduce((s, i) => s + (i.commission_amount || 0), 0);

    // Cartera pendiente (facturas emitidas pendientes de pago)
    const unpaidInvoices = (invoices.items || []).filter(i => i.status === 'posted');
    const outstandingPortfolio = unpaidInvoices.reduce((s, i) => s + (i.total || 0), 0);

    c.innerHTML = `
      <!-- Tarjetas KPI Unificadas -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        ${inmoKpi('Total Inmuebles', totalProperties, 'fas fa-building', '#3B82F6', '#EFF6FF')}
        ${inmoKpi('Contratos Activos', activeContracts, 'fas fa-file-signature', '#10B981', '#ECFDF5')}
        ${inmoKpi('Comisiones del Mes', (window as any).fmt(commissionsThisMonth), 'fas fa-percent', '#EC4899', '#FDF2F8')}
        ${inmoKpi('Cartera Pendiente', (window as any).fmt(outstandingPortfolio), 'fas fa-wallet', '#F59E0B', '#FFFBEB')}
      </div>

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
              ${props.map(p => {
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
                    <div class="flex items-center gap-1">
                      <button class="btn btn-outline btn-sm inmo-edit-btn" data-id="${p.id}" title="Editar Inmueble"><i class="fas fa-pen text-xs"></i></button>
                      <button class="btn btn-outline btn-sm inmo-history-btn text-purple-600 border-purple-200 hover:bg-purple-50" data-id="${p.id}" title="Ver Historial"><i class="fas fa-clock text-xs"></i></button>
                      ${(p.sale_price || 0) > 1 ? `<button class="btn btn-outline btn-sm inmo-sell-btn text-emerald-600 border-emerald-200 hover:bg-emerald-50" data-id="${p.id}" title="Vender / Facturar"><i class="fas fa-receipt text-xs"></i></button>` : ''}
                    </div>
                  </td>
                </tr>`;
              }).join('')}
              ${!props.length ? '<tr><td colspan="8" class="text-center py-8 text-gray-400">No hay inmuebles registrados</td></tr>' : ''}
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
    document.querySelectorAll('.inmo-history-btn').forEach(btn => {
      btn.addEventListener('click', () => (window as any).openPropertyHistoryModal((btn as HTMLElement).dataset.id));
    });
    document.querySelectorAll('.inmo-sell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id || '';
        (window as any).openPropertySellModal(id, c);
      });
    });

    const tbl = document.getElementById('table-inmuebles') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);
  } catch (err: any) {
    c.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function openInmuebleModal(id = '') {
  let record: any = {
    code: '', title: '', type: 'APARTAMENTO', address: '', city: '', owner_id: '',
    rental_price: 0, sale_price: 0, commission_rate: 0, status: 'DISPONIBLE', notes: '', active: true,
    neighborhood: '', social_stratum: 3, area_sqm: 0, rooms: 0, bathrooms: 0, parking_spaces: 0,
    admon_price: 0, year_built: new Date().getFullYear(),
    has_elevator: false, has_pool: false, has_gym: false, has_balcony: false, has_storage: false, pet_friendly: false
  };
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
    `<div class="space-y-4 text-sm" style="text-align: left; max-height: 75vh; overflow-y: auto; padding-right: 4px;">
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

      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Barrio</label>
          <input id="inmo-neighborhood" class="form-input" value="${(window as any).esc(record.neighborhood || '')}" placeholder="Ej: Chicó Reservado">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Estrato Social</label>
          <select id="inmo-social-stratum" class="form-input">
            ${[1, 2, 3, 4, 5, 6].map(e => `<option value="${e}" ${Number(record.social_stratum) === e ? 'selected' : ''}>Estrato ${e}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Área (m²)</label>
          <input id="inmo-area" type="number" class="form-input" value="${record.area_sqm || 0}" min="0">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Habitaciones</label>
          <input id="inmo-rooms" type="number" class="form-input" value="${record.rooms || 0}" min="0">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Baños</label>
          <input id="inmo-bathrooms" type="number" class="form-input" value="${record.bathrooms || 0}" min="0">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Parqueaderos</label>
          <input id="inmo-parking" type="number" class="form-input" value="${record.parking_spaces || 0}" min="0">
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

      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Administración ($)</label>
          <input id="inmo-admon-price" type="number" class="form-input" value="${record.admon_price || 0}" min="0">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Año Construcción</label>
          <input id="inmo-year-built" type="number" class="form-input" value="${record.year_built || new Date().getFullYear()}" min="1800">
        </div>
      </div>

      <div class="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
        <span class="text-xs text-gray-500 font-bold block mb-1">Características y Comodidades</span>
        <div class="grid grid-cols-3 gap-2">
          <div class="flex items-center gap-1.5">
            <input id="inmo-has-elevator" type="checkbox" ${record.has_elevator ? 'checked' : ''} class="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500">
            <label for="inmo-has-elevator" class="text-xs font-semibold text-gray-700 select-none cursor-pointer">Ascensor</label>
          </div>
          <div class="flex items-center gap-1.5">
            <input id="inmo-has-pool" type="checkbox" ${record.has_pool ? 'checked' : ''} class="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500">
            <label for="inmo-has-pool" class="text-xs font-semibold text-gray-700 select-none cursor-pointer">Piscina</label>
          </div>
          <div class="flex items-center gap-1.5">
            <input id="inmo-has-gym" type="checkbox" ${record.has_gym ? 'checked' : ''} class="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500">
            <label for="inmo-has-gym" class="text-xs font-semibold text-gray-700 select-none cursor-pointer">Gimnasio</label>
          </div>
          <div class="flex items-center gap-1.5">
            <input id="inmo-has-balcony" type="checkbox" ${record.has_balcony ? 'checked' : ''} class="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500">
            <label for="inmo-has-balcony" class="text-xs font-semibold text-gray-700 select-none cursor-pointer">Balcón/Terraza</label>
          </div>
          <div class="flex items-center gap-1.5">
            <input id="inmo-has-storage" type="checkbox" ${record.has_storage ? 'checked' : ''} class="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500">
            <label for="inmo-has-storage" class="text-xs font-semibold text-gray-700 select-none cursor-pointer">Depósito</label>
          </div>
          <div class="flex items-center gap-1.5">
            <input id="inmo-pet-friendly" type="checkbox" ${record.pet_friendly ? 'checked' : ''} class="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500">
            <label for="inmo-pet-friendly" class="text-xs font-semibold text-gray-700 select-none cursor-pointer">Mascotas OK</label>
          </div>
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
    const rental_price = Math.max(0, parseFloat((document.getElementById('inmo-rent') as HTMLInputElement).value) || 0);
    const sale_price = Math.max(0, parseFloat((document.getElementById('inmo-sale') as HTMLInputElement).value) || 0);
    const rawRate = parseFloat((document.getElementById('inmo-rate') as HTMLInputElement).value);
    const commission_rate = isNaN(rawRate) ? 0 : Math.min(100, Math.max(0, rawRate));
    const notes = (document.getElementById('inmo-notes') as HTMLTextAreaElement).value.trim();
    const active = (document.getElementById('inmo-active') as HTMLInputElement).checked;

    // Nuevas características sanitizadas
    const neighborhood = (document.getElementById('inmo-neighborhood') as HTMLInputElement).value.trim();
    const socialStratumRaw = parseInt((document.getElementById('inmo-social-stratum') as HTMLSelectElement).value) || 3;
    const social_stratum = Math.min(6, Math.max(1, socialStratumRaw));
    const area_sqm = Math.max(0, parseFloat((document.getElementById('inmo-area') as HTMLInputElement).value) || 0);
    const rooms = Math.max(0, parseInt((document.getElementById('inmo-rooms') as HTMLInputElement).value) || 0);
    const bathrooms = Math.max(0, parseInt((document.getElementById('inmo-bathrooms') as HTMLInputElement).value) || 0);
    const parking_spaces = Math.max(0, parseInt((document.getElementById('inmo-parking') as HTMLInputElement).value) || 0);
    const admon_price = Math.max(0, parseFloat((document.getElementById('inmo-admon-price') as HTMLInputElement).value) || 0);
    
    const yearBuiltInput = (document.getElementById('inmo-year-built') as HTMLInputElement).value;
    const parsedYear = parseInt(yearBuiltInput);
    const year_built = (!isNaN(parsedYear) && parsedYear >= 1800) ? parsedYear : new Date().getFullYear();

    const has_elevator = (document.getElementById('inmo-has-elevator') as HTMLInputElement).checked;
    const has_pool = (document.getElementById('inmo-has-pool') as HTMLInputElement).checked;
    const has_gym = (document.getElementById('inmo-has-gym') as HTMLInputElement).checked;
    const has_balcony = (document.getElementById('inmo-has-balcony') as HTMLInputElement).checked;
    const has_storage = (document.getElementById('inmo-has-storage') as HTMLInputElement).checked;
    const pet_friendly = (document.getElementById('inmo-pet-friendly') as HTMLInputElement).checked;

    if (!code || !title || !owner_id) {
      (window as any).showToast('Código, título y propietario son obligatorios.', 'warning');
      return;
    }

    const payload = {
      code, title, type, status, address, city, owner_id, rental_price, sale_price, commission_rate, notes, active,
      neighborhood, social_stratum, area_sqm, rooms, bathrooms, parking_spaces, admon_price, year_built,
      has_elevator, has_pool, has_gym, has_balcony, has_storage, pet_friendly
    };
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
      const contentContainer = document.getElementById('inmo-tab-content') || document.getElementById('inmo-inmuebles-content') || document.getElementById('page-content');
      if (contentContainer) {
        renderInmoInmuebles(contentContainer);
      }
    } catch (err: any) {
      console.error('[GRAVY-INMO] Error al guardar inmueble:', err);
      (window as any).showToast(formatPbError(err), 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar';
    }
  });
}

(window as any).openPropertyHistoryModal = async function(id: string) {
  try {
    const [p, contracts, history] = await Promise.all([
      (window as any).pb.get('inmo_properties', id, { expand: 'owner_id' }),
      (window as any).pb.listAll('inmo_contracts', {
        filter: `property_id="${id}"`,
        sort: '-id',
        expand: 'tenant_id'
      }),
      (window as any).pb.listAll('inmo_property_history', {
        filter: `property_id="${id}"`,
        sort: '-date'
      })
    ]);

    const owner = p.expand?.owner_id;
    
    // Quick features string
    const amenities = [];
    if (p.has_elevator) amenities.push('<span class="badge badge-blue"><i class="fas fa-elevator mr-1"></i>Ascensor</span>');
    if (p.has_pool) amenities.push('<span class="badge badge-blue"><i class="fas fa-water mr-1"></i>Piscina</span>');
    if (p.has_gym) amenities.push('<span class="badge badge-blue"><i class="fas fa-dumbbell mr-1"></i>Gimnasio</span>');
    if (p.has_balcony) amenities.push('<span class="badge badge-blue"><i class="fas fa-table-cells-large mr-1"></i>Balcón</span>');
    if (p.has_storage) amenities.push('<span class="badge badge-blue"><i class="fas fa-box mr-1"></i>Depósito</span>');
    if (p.pet_friendly) amenities.push('<span class="badge badge-green"><i class="fas fa-paw mr-1"></i>Mascotas OK</span>');

    const bodyHtml = `
      <div class="space-y-6 text-sm" style="color:#374151; text-align: left; max-height:75vh; overflow-y:auto; padding-right:4px;">
        <!-- Header Info Card -->
        <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm space-y-3">
          <div class="flex justify-between items-start flex-wrap gap-2">
            <div>
              <span class="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Ficha Técnica Inmueble</span>
              <h3 class="font-bold text-gray-800 text-lg">${(window as any).esc(p.title)} <span class="font-mono text-pink-600 text-sm ml-1.5">(${p.code})</span></h3>
              <p class="text-xs text-gray-500"><i class="fas fa-location-dot mr-1"></i>${(window as any).esc(p.address || '')} ${p.city ? '— ' + p.city : ''} ${p.neighborhood ? ' | Barrio: ' + p.neighborhood : ''}</p>
            </div>
            <div class="text-right">
              <span class="badge badge-pink font-semibold">${p.type}</span>
              <p class="text-xs font-bold text-emerald-600 mt-1">Alquiler Ref: ${(window as any).fmt(p.rental_price || 0)}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2.5 border-t border-gray-200/60 text-xs">
            <div><span class="text-gray-400 block">Propietario:</span><span class="font-semibold text-gray-700">${(window as any).esc(owner?.name || '—')}</span></div>
            <div><span class="text-gray-400 block">Estrato / Antigüedad:</span><span class="font-semibold text-gray-700">Estrato ${p.social_stratum || '—'} / ${p.year_built || '—'}</span></div>
            <div><span class="text-gray-400 block">Área construida:</span><span class="font-semibold text-gray-700">${p.area_sqm ? p.area_sqm + ' m²' : '—'}</span></div>
            <div><span class="text-gray-400 block">Administración:</span><span class="font-semibold text-gray-700">${p.admon_price ? (window as any).fmt(p.admon_price) : 'Sin Costo'}</span></div>
          </div>
          
          <div class="grid grid-cols-3 gap-2 text-center bg-white p-2 rounded-xl border border-gray-100 text-xs">
            <div><span class="text-gray-400 block text-[10px]">Habitaciones</span><span class="font-bold text-gray-800 text-sm">${p.rooms || 0}</span></div>
            <div><span class="text-gray-400 block text-[10px]">Baños</span><span class="font-bold text-gray-800 text-sm">${p.bathrooms || 0}</span></div>
            <div><span class="text-gray-400 block text-[10px]">Parqueaderos</span><span class="font-bold text-gray-800 text-sm">${p.parking_spaces || 0}</span></div>
          </div>

          ${amenities.length ? `
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${amenities.join('')}
            </div>
          ` : ''}
        </div>

        <!-- 3 últimos arrendatarios (derivado de contratos) -->
        <div class="space-y-2">
          <h4 class="font-bold text-gray-800 flex items-center gap-1.5 border-b pb-1.5"><i class="fas fa-users text-blue-500"></i>Historial de Arrendamientos (Últimos 3 Contratos)</h4>
          <div class="border rounded-xl overflow-hidden shadow-sm bg-white">
            <table class="data-table text-xs">
              <thead>
                <tr style="background:#F9FAFB">
                  <th>Contrato</th>
                  <th>Inquilino</th>
                  <th>Período</th>
                  <th class="text-right">Canon Pactado</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${contracts.slice(0, 3).map((c: any) => {
                  const tenant = c.expand?.tenant_id;
                  return `
                    <tr>
                      <td class="font-mono font-bold">${(window as any).esc(c.number)}</td>
                      <td>
                        <span class="font-semibold text-gray-700">${(window as any).esc(tenant?.name || '—')}</span>
                        <br><span class="text-[10px] text-gray-400">NIT: ${tenant?.doc_number || '—'}</span>
                      </td>
                      <td class="text-gray-500">${(window as any).esc(c.start_date || '—')} al ${(window as any).esc(c.end_date || '—')}</td>
                      <td class="text-right font-bold text-gray-700">${(window as any).fmt(c.monthly_rent || 0)}</td>
                      <td><span class="badge ${c.status === 'VIGENTE' ? 'badge-green' : 'badge-gray'}">${c.status}</span></td>
                    </tr>
                  `;
                }).join('')}
                ${!contracts.length ? '<tr><td colspan="5" class="text-center py-4 text-gray-400">Sin historial de contratos registrados</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Bitácora de eventos y novedades -->
        <div class="space-y-2">
          <div class="flex justify-between items-center border-b pb-1.5">
            <h4 class="font-bold text-gray-800 flex items-center gap-1.5 mb-0"><i class="fas fa-tools text-purple-500"></i>Bitácora de Novedades y Mantenimientos</h4>
            <button class="btn btn-outline btn-xs text-purple-600 border-purple-200 hover:bg-purple-50 flex items-center gap-1" id="btn-add-property-event">
              <i class="fas fa-plus"></i> Registrar Evento
            </button>
          </div>
          <div class="space-y-3 pt-1">
            ${history.map((h: any) => {
              let typeLabel = 'Novedad';
              let badgeClass = 'badge-gray';
              if (h.event_type === 'MANTENIMIENTO') {
                typeLabel = 'Mantenimiento';
                badgeClass = 'badge-orange';
              } else if (h.event_type === 'MEJORA_ESTRUCTURAL') {
                typeLabel = 'Mejora Estructural';
                badgeClass = 'badge-blue';
              }
              
              return `
                <div class="p-3 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start justify-between gap-4">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="badge ${badgeClass} text-[10px] font-bold uppercase">${typeLabel}</span>
                      <span class="text-xs font-mono font-bold text-gray-400">${h.date}</span>
                    </div>
                    <p class="font-bold text-gray-800 text-sm mt-1">${(window as any).esc(h.title)}</p>
                    ${h.description ? `<p class="text-xs text-gray-500 whitespace-pre-line">${(window as any).esc(h.description)}</p>` : ''}
                  </div>
                  ${h.cost > 0 ? `
                    <div class="text-right min-w-[100px]">
                      <span class="text-[10px] text-gray-400 block font-semibold">Costo asociado</span>
                      <span class="font-extrabold text-red-600 text-sm">${(window as any).fmt(h.cost)}</span>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
            ${!history.length ? '<div class="text-center py-6 text-gray-400 border border-dashed rounded-xl bg-gray-50/50">No hay eventos registrados en la bitácora</div>' : ''}
          </div>
        </div>
      </div>
    `;

    (window as any).openModal(
      `Historial y Bitácora: ${p.code}`,
      bodyHtml,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`
    );

    // Click handler for adding an event
    document.getElementById('btn-add-property-event')?.addEventListener('click', () => {
      openRegisterPropertyEventModal(id, p.code);
    });

  } catch (err: any) {
    (window as any).showToast('Error al cargar historial: ' + err.message, 'error');
  }
};

function openRegisterPropertyEventModal(propertyId: string, propertyCode: string) {
  const modalHtml = `
    <div class="space-y-4" style="text-align: left;">
      <div class="form-group mb-0">
        <label class="form-label">Tipo de Novedad <span class="text-red-500">*</span></label>
        <select id="event-type" class="form-input">
          <option value="MANTENIMIENTO">Mantenimiento (Reparaciones, pintura, etc)</option>
          <option value="MEJORA_ESTRUCTURAL">Mejora Estructural (Remodelación, etc)</option>
          <option value="OTRO">Novedad / Otro</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Fecha del Evento <span class="text-red-500">*</span></label>
          <input id="event-date" type="date" class="form-input" value="${(window as any).todayStr()}">
        </div>
        <div class="form-group mb-0">
          <label class="form-label">Costo Asociado ($)</label>
          <input id="event-cost" type="number" class="form-input" value="0" min="0">
        </div>
      </div>
      <div class="form-group mb-0">
        <label class="form-label">Título del Evento <span class="text-red-500">*</span></label>
        <input id="event-title" class="form-input" placeholder="Ej: Reparación fuga de agua en cocina">
      </div>
      <div class="form-group mb-0">
        <label class="form-label">Descripción detallada</label>
        <textarea id="event-description" class="form-input" rows="3" placeholder="Detalles de la mejora o novedad..."></textarea>
      </div>
    </div>
  `;

  const oldModalTitle = (document.querySelector('.modal-title') as HTMLElement)?.textContent || `Historial y Bitácora: ${propertyCode}`;
  const oldModalBody = (document.querySelector('.modal-body') as HTMLElement)?.innerHTML || '';
  const oldModalFooter = (document.querySelector('.modal-footer') as HTMLElement)?.innerHTML || '';

  const subModalTitle = `Registrar Evento - Inmueble ${propertyCode}`;
  const subModalFooter = `
    <button class="btn btn-outline" id="btn-cancel-event">Atrás</button>
    <button class="btn btn-primary" id="btn-save-event"><i class="fas fa-save mr-1"></i>Guardar Evento</button>
  `;

  (window as any).openModal(subModalTitle, modalHtml, subModalFooter);

  document.getElementById('btn-cancel-event')?.addEventListener('click', () => {
    (window as any).openModal(oldModalTitle, oldModalBody, oldModalFooter);
    document.getElementById('btn-add-property-event')?.addEventListener('click', () => {
      openRegisterPropertyEventModal(propertyId, propertyCode);
    });
  });

  document.getElementById('btn-save-event')?.addEventListener('click', async () => {
    const type = (document.getElementById('event-type') as HTMLSelectElement).value;
    const date = (document.getElementById('event-date') as HTMLInputElement).value;
    const cost = parseFloat((document.getElementById('event-cost') as HTMLInputElement).value) || 0;
    const title = (document.getElementById('event-title') as HTMLInputElement).value.trim();
    const description = (document.getElementById('event-description') as HTMLTextAreaElement).value.trim();

    if (!date || !title) {
      (window as any).showToast('La fecha y el título son obligatorios.', 'warning');
      return;
    }

    const btn = document.getElementById('btn-save-event') as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    try {
      await (window as any).pb.create('inmo_property_history', {
        property_id: propertyId,
        event_type: type,
        date: date,
        title: title,
        description: description,
        cost: cost
      });
      (window as any).showToast('Evento registrado exitosamente.', 'success');
      (window as any).closeModal();
      await (window as any).openPropertyHistoryModal(propertyId);
    } catch (err: any) {
      (window as any).showToast('Error al registrar evento: ' + err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar Evento';
    }
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB: CONTRATOS
// ══════════════════════════════════════════════════════════════════════════════
async function renderInmoContratos(c: HTMLElement) {
  c.innerHTML = `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando contratos...</div>`;
  try {
    const list = await (window as any).API.getInmoContracts(false, 'ALL');

    c.innerHTML = `
      <div class="bg-white rounded-2xl border p-4 mb-4 flex flex-wrap items-center gap-3 justify-between" style="border-color:#F0F0F0">
        <input id="contract-search" class="form-input text-sm" placeholder="Buscar por número, inquilino o tipo..." style="max-width:300px">
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
                <th>Tipo</th>
                <th>Inmueble / Descripción</th>
                <th>Inquilino / Arrendador</th>
                <th>Inicio</th>
                <th>Vence / Plazo</th>
                <th class="text-right">Canon Mensual</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(contract => {
                const prop = contract.expand?.property_id;
                const tenant = contract.expand?.tenant_id;
                const lessor = contract.expand?.lessor_id;
                const statusMeta = CONTRACT_STATUS[contract.status] || { label: contract.status, badge: 'badge-gray' };
                const isRecibido = contract.type === 'RECIBIDO';
                return `<tr data-id="${contract.id}">
                  <td class="font-mono text-xs font-bold">${(window as any).esc(contract.number)}</td>
                  <td>
                    <span class="badge ${isRecibido ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200' : 'bg-blue-50 text-blue-700 font-bold border border-blue-200'}">
                      ${isRecibido ? 'RECIBIDO' : 'EMITIDO'}
                    </span>
                  </td>
                  <td>
                    <span class="font-semibold text-gray-800">
                      ${isRecibido ? (window as any).esc(contract.description || '') : (window as any).esc(prop?.title || '')}
                    </span>
                  </td>
                  <td>
                    ${isRecibido ? (window as any).esc(lessor?.name || '') : (window as any).esc(tenant?.name || '')}
                  </td>
                  <td>${contract.start_date}</td>
                  <td>
                    ${isRecibido ? `<span class="badge bg-purple-50 text-purple-700 font-medium">${contract.term_months} meses</span>` : contract.end_date}
                  </td>
                  <td class="text-right font-semibold">${(window as any).fmt(contract.monthly_rent || 0)}</td>
                  <td><span class="badge ${statusMeta.badge}">${statusMeta.label}</span></td>
                  <td>
                    <div class="flex gap-2">
                      <button class="btn btn-outline btn-sm contract-edit-btn" data-id="${contract.id}" title="Editar"><i class="fas fa-pen"></i></button>
                      ${isRecibido ? `<button class="btn btn-outline btn-sm" onclick="viewAmortizationTable('${contract.id}')" title="Tabla de Amortización"><i class="fas fa-table-list"></i></button>` : ''}
                    </div>
                  </td>
                </tr>`;
              }).join('')}
              ${!list.length ? '<tr><td colspan="9" class="text-center py-8 text-gray-400">No hay contratos registrados</td></tr>' : ''}
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

    const tbl = document.getElementById('table-contratos') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);
  } catch (err: any) {
    c.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function viewAmortizationTable(id: string) {
  try {
    const l = await (window as any).pb.get('inmo_contracts', id);
    const rows = JSON.parse(l.amortization_table || '[]');
    const formatCOP = (window as any).fmt || ((n: number) => `$ ${n.toLocaleString('es-CO')}`);
    const esc = (window as any).esc;

    const body = `
      <div class="space-y-4" style="text-align: left;">
        <div class="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-xs">
          <div><strong>Contrato:</strong> <span class="text-indigo-900 font-bold">${esc(l.number)}</span></div>
          <div><strong>VP Activo Derecho de Uso:</strong> <span class="text-indigo-900 font-bold">${formatCOP(l.right_of_use_value)}</span></div>
        </div>

        <div class="overflow-y-auto" style="max-height: 400px">
          <table class="data-table text-xxs">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Saldo Inicial Pasivo</th>
                <th>Gasto Interés</th>
                <th>Canon de Pago</th>
                <th>Abono Principal</th>
                <th>Saldo Final Pasivo</th>
                <th>Depr. Derecho Uso</th>
                <th>Costo en Libros Activo</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((r: any) => `
                <tr>
                  <td class="text-center font-bold">${r.month}</td>
                  <td>${formatCOP(r.beg)}</td>
                  <td class="text-rose-600 font-medium">${formatCOP(r.interest)}</td>
                  <td class="font-semibold text-gray-800">${formatCOP(r.payment)}</td>
                  <td class="text-emerald-700 font-medium">${formatCOP(r.principal)}</td>
                  <td class="font-bold">${formatCOP(r.end)}</td>
                  <td>${formatCOP(r.dep)}</td>
                  <td class="text-indigo-900 font-semibold">${formatCOP(r.carrying)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    (window as any).openModal('Tabla de Amortización NIIF 16', body, `
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cerrar</button>
    `, true);
  } catch (err: any) {
    (window as any).showToast('Error al abrir la tabla: ' + err.message, 'error');
  }
}

async function openContractModal(id = '', defaultType = 'EMITIDO') {
  let record = {
    type: defaultType,
    number: '',
    property_id: '',
    tenant_id: '',
    start_date: '',
    end_date: '',
    monthly_rent: 0,
    increment_percentage: 0,
    status: 'VIGENTE',
    notes: '',
    active: true,
    description: '',
    term_months: 12,
    implicit_interest_rate: 0,
    lessor_id: ''
  };
  let tenantName = '';
  let lessorName = '';
  let properties = [];

  try {
    properties = await (window as any).API.getInmoProperties(true);
  } catch (err) {
    console.error(err);
  }

  if (id) {
    try {
      const c = await (window as any).pb.get('inmo_contracts', id, { expand: 'tenant_id,lessor_id' });
      record = { ...record, ...c };
      tenantName = c.expand?.tenant_id?.name || '';
      lessorName = c.expand?.lessor_id?.name || '';
    } catch (err: any) {
      (window as any).showToast('Error al cargar contrato: ' + err.message, 'error');
      return;
    }
  }

  (window as any).openModal(
    id ? 'Editar Contrato' : 'Nuevo Contrato',
    `<div class="space-y-4" style="text-align: left;">
      <!-- Selector de Tipo de Contrato -->
      <div class="form-group mb-3">
        <label class="form-label">Tipo de Contrato</label>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-1.5 cursor-pointer font-semibold text-xs text-gray-700">
            <input type="radio" name="cont-type" value="EMITIDO" ${record.type !== 'RECIBIDO' ? 'checked' : ''} ${id ? 'disabled' : ''}>
            Emitido (Inmobiliaria / Cobros)
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer font-semibold text-xs text-gray-700">
            <input type="radio" name="cont-type" value="RECIBIDO" ${record.type === 'RECIBIDO' ? 'checked' : ''} ${id ? 'disabled' : ''}>
            Recibido (NIIF 16 / Pagos)
          </label>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Contrato N° <span class="text-red-500">*</span></label>
          <input id="cont-number" class="form-input" value="${(window as any).esc(record.number)}" placeholder="Ej: CON-2026-001" ${id ? 'disabled' : ''}>
        </div>
        
        <!-- Campo exclusivo de Arrendamiento Emitido: Inmueble -->
        <div class="form-group mb-0 emitido-only">
          <label class="form-label">Inmueble Asociado <span class="text-red-500">*</span></label>
          <select id="cont-property" class="form-input">
            <option value="">Selecciona inmueble...</option>
            ${properties.map(p => `<option value="${p.id}" ${record.property_id === p.id ? 'selected' : ''}>${p.code} - ${(window as any).esc(p.title)}</option>`).join('')}
          </select>
        </div>

        <!-- Campo exclusivo de Arrendamiento Recibido: Descripción -->
        <div class="form-group mb-0 recibido-only hidden">
          <label class="form-label">Descripción del Contrato <span class="text-red-500">*</span></label>
          <input id="cont-description" class="form-input" value="${(window as any).esc(record.description)}" placeholder="Ej: Oficina Principal Piso 4">
        </div>
      </div>

      <!-- Autocomplete de Inquilino (Emitido) -->
      <div class="form-group mb-0 relative emitido-only">
        <label class="form-label">Inquilino / Arrendatario <span class="text-red-500">*</span></label>
        <input id="cont-tenant-search" class="form-input" autocomplete="off" placeholder="Buscar por NIT o nombre del inquilino..." value="${(window as any).esc(tenantName)}">
        <input id="cont-tenant-id" type="hidden" value="${(window as any).esc(record.tenant_id)}">
        <div id="cont-tenant-results" class="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto hidden z-50"></div>
      </div>

      <!-- Autocomplete de Arrendador (Recibido NIIF 16) -->
      <div class="form-group mb-0 relative recibido-only hidden">
        <label class="form-label">Arrendador (Tercero) <span class="text-red-500">*</span></label>
        <input id="cont-lessor-search" class="form-input" autocomplete="off" placeholder="Buscar por NIT o nombre del arrendador..." value="${(window as any).esc(lessorName)}">
        <input id="cont-lessor-id" type="hidden" value="${(window as any).esc(record.lessor_id)}">
        <div id="cont-lessor-results" class="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto hidden z-50"></div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Fecha de Inicio <span class="text-red-500">*</span></label>
          <input id="cont-start" type="date" class="form-input" value="${record.start_date}">
        </div>

        <!-- Fecha de vencimiento solo para Emitido -->
        <div class="form-group mb-0 emitido-only">
          <label class="form-label">Fecha de Vencimiento <span class="text-red-500">*</span></label>
          <input id="cont-end" type="date" class="form-input" value="${record.end_date}">
        </div>

        <!-- Plazo en meses solo para Recibido -->
        <div class="form-group mb-0 recibido-only hidden">
          <label class="form-label">Plazo del Contrato (Meses) <span class="text-red-500">*</span></label>
          <input id="cont-term" type="number" class="form-input" value="${record.term_months}" placeholder="Ej: 36">
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="form-group mb-0">
          <label class="form-label">Valor Canon Mensual ($) <span class="text-red-500">*</span></label>
          <input id="cont-rent" type="number" class="form-input" value="${record.monthly_rent}" min="0">
        </div>

        <!-- Incremento anual solo para Emitido -->
        <div class="form-group mb-0 emitido-only">
          <label class="form-label">% Incremento Anual</label>
          <input id="cont-increment" type="number" class="form-input" value="${record.increment_percentage}" min="0" max="100">
        </div>

        <!-- Tasa de Interés solo para Recibido -->
        <div class="form-group mb-0 recibido-only hidden">
          <label class="form-label">Tasa de Interés Implícita (% Mensual) <span class="text-red-500">*</span></label>
          <input id="cont-rate" type="number" step="0.001" class="form-input" value="${record.implicit_interest_rate}" placeholder="Ej: 0.85">
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
  setupThirdPartyAutocomplete('cont-lessor-search', 'cont-lessor-id', 'cont-lessor-results', '');

  // Lógica de visibilidad dinámica
  const radios = document.getElementsByName('cont-type') as NodeListOf<HTMLInputElement>;
  const updateFieldsVisibility = (typeVal: string) => {
    document.querySelectorAll('.emitido-only').forEach(el => {
      if (typeVal === 'EMITIDO') el.classList.remove('hidden');
      else el.classList.add('hidden');
    });
    document.querySelectorAll('.recibido-only').forEach(el => {
      if (typeVal === 'RECIBIDO') el.classList.remove('hidden');
      else el.classList.add('hidden');
    });
  };

  radios.forEach(r => {
    r.addEventListener('change', (e) => {
      updateFieldsVisibility((e.target as HTMLInputElement).value);
    });
  });

  updateFieldsVisibility(record.type);

  document.getElementById('cont-save-btn')?.addEventListener('click', async () => {
    const type = (document.querySelector('input[name="cont-type"]:checked') as HTMLInputElement)?.value || 'EMITIDO';
    const number = (document.getElementById('cont-number') as HTMLInputElement).value.trim();
    const start_date = (document.getElementById('cont-start') as HTMLInputElement).value;
    const monthly_rent = parseFloat((document.getElementById('cont-rent') as HTMLInputElement).value) || 0;
    const status = (document.getElementById('cont-status') as HTMLSelectElement).value;
    const notes = (document.getElementById('cont-notes') as HTMLTextAreaElement).value.trim();
    const active = (document.getElementById('cont-active') as HTMLInputElement).checked;

    let payload: any = { type, number, start_date, monthly_rent, status, notes, active };

    if (type === 'EMITIDO') {
      const property_id = (document.getElementById('cont-property') as HTMLSelectElement).value;
      const tenant_id = (document.getElementById('cont-tenant-id') as HTMLInputElement).value;
      const end_date = (document.getElementById('cont-end') as HTMLInputElement).value;
      const increment_percentage = parseFloat((document.getElementById('cont-increment') as HTMLInputElement).value) || 0;

      if (!number || !property_id || !tenant_id || !start_date || !end_date || monthly_rent <= 0) {
        (window as any).showToast('Completa todos los campos obligatorios.', 'warning');
        return;
      }

      payload = {
        ...payload,
        property_id,
        tenant_id,
        end_date,
        increment_percentage,
        description: '',
        term_months: 0,
        implicit_interest_rate: 0,
        right_of_use_value: 0,
        lease_liability_value: 0,
        amortization_table: '[]',
        lessor_id: null
      };
    } else {
      const description = (document.getElementById('cont-description') as HTMLInputElement).value.trim();
      const lessor_id = (document.getElementById('cont-lessor-id') as HTMLInputElement).value;
      const term_months = parseInt((document.getElementById('cont-term') as HTMLInputElement).value) || 0;
      const implicit_interest_rate = parseFloat((document.getElementById('cont-rate') as HTMLInputElement).value) || 0;

      if (!number || !description || !start_date || term_months <= 0 || monthly_rent <= 0 || implicit_interest_rate < 0) {
        (window as any).showToast('Completa todos los campos obligatorios.', 'warning');
        return;
      }

      // Cálculo financiero NIIF 16 (VPN y Amortización)
      const i = implicit_interest_rate / 100;
      let vpn = 0;
      for (let t = 1; t <= term_months; t++) {
        vpn += monthly_rent / Math.pow(1 + i, t);
      }

      let balance = vpn;
      const deprMonthly = vpn / term_months;
      const tableRows = [];
      for (let t = 1; t <= term_months; t++) {
        const interest = balance * i;
        const principal = monthly_rent - interest;
        const endBalance = balance - principal;
        tableRows.push({
          month: t,
          beg: balance,
          interest: interest,
          payment: monthly_rent,
          principal: principal,
          end: endBalance,
          dep: deprMonthly,
          carrying: vpn - (deprMonthly * t)
        });
        balance = endBalance;
      }

      payload = {
        ...payload,
        description,
        lessor_id: lessor_id || null,
        term_months,
        implicit_interest_rate,
        right_of_use_value: Math.round(vpn * 100) / 100,
        lease_liability_value: Math.round(vpn * 100) / 100,
        amortization_table: JSON.stringify(tableRows),
        property_id: null,
        tenant_id: null,
        end_date: '',
        increment_percentage: 0
      };
    }

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
        if (type === 'EMITIDO' && status === 'VIGENTE' && payload.property_id) {
          await (window as any).pb.update('inmo_properties', payload.property_id, { status: 'ARRENDADO' });
        }
        (window as any).showToast('Contrato creado exitosamente.', 'success');
      }
      (window as any).closeModal();
      const contentContainer = document.getElementById('inmo-tab-content') || document.getElementById('inmo-contratos-content') || document.getElementById('page-content');
      if (contentContainer) {
        if (type === 'RECIBIDO' && (window as any).loadActiveTab) {
          // Si estamos en el módulo NIIF, recargar la grilla activa de allí
          (window as any).loadActiveTab();
        } else {
          renderInmoContratos(contentContainer);
        }
      }
    } catch (err: any) {
      console.error('[GRAVY-INMO] Error al guardar contrato:', err);
      (window as any).showToast(formatPbError(err), 'error');
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
    const taxMonth = invoices.reduce((s, i) => s + (i.tax_amount || 0), 0);
    const commissionsMonth = invoices.reduce((s, i) => s + (i.commission_amount || 0), 0);
    const draftCount = invoices.filter(i => i.status === 'draft').length;
    const postedCount = invoices.filter(i => i.status === 'posted').length;

    c.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        ${inmoKpi('Total Facturado', (window as any).fmt(totalMonth), 'fas fa-sack-dollar', '#3B82F6', '#EFF6FF')}
        ${inmoKpi('IVA Arriendos', (window as any).fmt(taxMonth), 'fas fa-percent', '#8B5CF6', '#F5F3FF')}
        ${inmoKpi('Comisiones', (window as any).fmt(commissionsMonth), 'fas fa-chart-line', '#EC4899', '#FDF2F8')}
        ${inmoKpi('Borradores', draftCount, 'fas fa-pen-to-square', '#F59E0B', '#FFFBEB')}
        ${inmoKpi('Contabilizadas', postedCount, 'fas fa-check-circle', '#10B981', '#ECFDF5')}
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
                <th class="text-right">Canon Base</th>
                <th class="text-right">IVA Arriendo</th>
                <th class="text-right">Comisión</th>
                <th class="text-right">Neto Dueño</th>
                <th class="text-right">Total Facturado</th>
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
      const tbl = document.getElementById('inmo-inv-table') as HTMLTableElement;
      if (tbl) (window as any).reapplyTableSort(tbl);
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

    const tbl = document.getElementById('inmo-inv-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);

    attachInmoInvActions();
  } catch (err: any) {
    c.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

function renderInmoInvRows(invoices) {
  if (!invoices.length) {
    return `<tr><td colspan="10" class="text-center py-8 text-gray-400">Sin facturas para este período.</td></tr>`;
  }
  return invoices.map(inv => {
    const con = inv.expand?.contract_id;
    const prop = con?.expand?.property_id;
    const tenant = con?.expand?.tenant_id;
    const meta = INVOICE_STATUS_META[inv.status] || INVOICE_STATUS_META.draft;
    const taxAmt = inv.tax_amount || 0;
    return `<tr data-id="${inv.id}">
      <td class="font-mono text-xs">${inv.number}</td>
      <td>
        <span class="font-semibold" style="color:#0D2137">${(window as any).esc(prop?.title || '')}</span>
      </td>
      <td>${(window as any).esc(tenant?.name || '')}</td>
      <td class="text-right font-semibold">${(window as any).fmt(inv.rent_amount || 0)}</td>
      <td class="text-right font-semibold ${taxAmt > 0 ? 'text-purple-600' : 'text-gray-400'}">${taxAmt > 0 ? (window as any).fmt(taxAmt) : '—'}</td>
      <td class="text-right text-gray-500">${(window as any).fmt(inv.commission_amount || 0)}</td>
      <td class="text-right text-emerald-600 font-semibold">${(window as any).fmt(inv.net_to_owner || 0)}</td>
      <td class="text-right font-extrabold text-blue-700">${(window as any).fmt(inv.total || 0)}</td>
      <td><span class="badge ${meta.badge}">${meta.label}</span></td>
      <td>
        <div class="flex gap-1">
          <button class="btn btn-outline btn-sm inmo-inv-view" data-id="${inv.id}" title="Ver Detalle" style="color:#4B5563;border-color:#D1D5DB;padding: 4px 8px;">
            <i class="fas fa-eye"></i>
          </button>
          ${inv.status === 'draft' ? `
            <button class="btn btn-sm inmo-inv-post-btn" data-id="${inv.id}" title="Contabilizar" style="background:#ECFDF5;color:#10B981;border:1px solid #A7F3D0;padding: 4px 8px;">
              <i class="fas fa-check"></i>
            </button>` : ''}
          ${inv.status === 'posted' ? `
            <button class="btn btn-outline btn-sm inmo-inv-unpost" data-id="${inv.id}" title="Descontabilizar" style="color:#3B82F6;border-color:#93C5FD;padding: 4px 8px;">
              <i class="fas fa-rotate-left"></i>
            </button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function attachInmoInvActions() {
  document.querySelectorAll('.inmo-inv-view').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset.id || '';
      (window as any).viewInmoInvoiceDetail(id);
    });
  });

  document.querySelectorAll('.inmo-inv-post-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset.id || '';
      (window as any).openInmoPostingChoicesModal(id);
    });
  });

  document.querySelectorAll('.inmo-inv-unpost').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset.id || '';
      if (!confirm('¿Descontabilizar esta factura? Volverá a estado borrador.')) return;
      try {
        await (window as any).API.unpostInmoInvoice(id);
        (window as any).showToast('Factura revertida a borrador.', 'success');
        const contentContainer = document.getElementById('inmo-tab-content') || document.getElementById('inmo-liquidacion-content') || document.getElementById('page-content');
        if (contentContainer) {
          renderInmoLiquidacion(contentContainer);
        }
      } catch (err: any) {
        (window as any).showToast(err.message, 'error');
      }
    });
  });
}

async function openInmoGenerateModal(c: HTMLElement) {
  const period = (document.getElementById('inmo-period-filter') as HTMLInputElement)?.value || (window as any).currentPeriod();

  let inmoCfg: any = {};
  try {
    const rawInmo = await (window as any).API.getSetting('inmo_config_v1');
    if (rawInmo) inmoCfg = JSON.parse(rawInmo);
  } catch (_) {}

  let generalPricesIncludeIva = false;
  try {
    const rawSales = await (window as any).API.getSetting('sales_config_v1');
    if (rawSales) {
      const parsedSales = JSON.parse(rawSales);
      generalPricesIncludeIva = !!parsedSales?.operational?.prices_include_iva;
    }
  } catch (_) {}

  const pricesIncludeIva = inmoCfg.prices_include_tax !== undefined 
    ? !!inmoCfg.prices_include_tax 
    : generalPricesIncludeIva;

  const rentHasIva = !!inmoCfg.rent_has_iva;
  const rentIvaRate = rentHasIva ? (parseFloat(inmoCfg.rent_iva_rate) || 19) : 0;

  const taxModeBanner = rentHasIva
    ? `<div class="p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900 flex items-center gap-2.5">
        <i class="fas fa-percent text-purple-600 text-base"></i>
        <div>
          <strong class="font-bold">IVA Arrendamiento Directo Activo (${rentIvaRate}%):</strong><br>
          <span class="text-purple-700">Configuración: <u>${pricesIncludeIva ? 'Los cánones TIENEN el IVA Incluido (Tax-Inclusive)' : 'El IVA se adicióna sobre el Canon (Tax-Exclusive)'}</u>.</span>
        </div>
       </div>`
    : `<div class="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 flex items-center gap-2.5">
        <i class="fas fa-circle-info text-gray-500 text-base"></i>
        <div>Arrendamiento directo configurado como <strong>Exento / No Responsable de IVA (0% IVA)</strong>.</div>
       </div>`;

  (window as any).openModal(
    'Generar Facturas del Período',
    `<div class="space-y-4" style="text-align: left;">
      <p class="text-sm text-gray-600">
        Esta acción generará facturas en estado <strong>Borrador</strong> para todos los contratos vigentes que no tengan facturas en el período <strong>${(window as any).fmtPeriod(period)}</strong>.
      </p>

      ${taxModeBanner}

      <div class="form-group mb-0">
        <label class="form-label font-bold text-gray-700">Período de Facturación</label>
        <input id="gen-inmo-period" type="month" class="form-input" value="${period}">
      </div>
      <div class="form-group mb-0">
        <label class="form-label font-bold text-gray-700">Fecha Límite de Pago</label>
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
async function openInmoConfigModal() {
  const modalBodyId = 'inmo-config-modal-body';
  (window as any).openModal(
    'Configuración Contable del Módulo',
    `<div id="${modalBodyId}" class="p-1"></div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
     <button class="btn btn-primary" id="btn-save-cfg-modal"><i class="fas fa-save mr-1"></i>Guardar Configuración</button>`,
    false
  );
  
  const modalContainer = document.getElementById(modalBodyId);
  if (!modalContainer) return;
  
  try {
    const raw = await (window as any).API.getSetting('inmo_config_v1');
    let cfg = { 
      cxc_tenant_code: '130505', 
      commission_income_code: '413505', 
      cxp_owner_code: '220505', 
      commission_has_iva: false, 
      iva_commission_code: '240810',
      rent_has_iva: false,
      rent_iva_rate: 19,
      rent_iva_code: '240805',
      rent_income_code: '415505'
    };
    if (raw) {
      try { cfg = { ...cfg, ...JSON.parse(raw) }; } catch (_) {}
    }

    modalContainer.innerHTML = `
      <div class="space-y-4 text-sm" style="text-align: left;">
        <p class="text-xs text-gray-500 mb-2">Define las cuentas PUC predeterminadas e impuestos para las transacciones automáticas del módulo de Inmobiliaria.</p>

        <!-- Sección 1: Intermediación / Mandato (Comisión > 0%) -->
        <div class="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
          <span class="text-xs font-bold text-gray-800 block border-b pb-1">1. Parámetros de Intermediación / Mandato (Con Comisión)</span>
          <div class="form-group mb-0">
            <label class="form-label font-bold text-gray-700">Cuenta CxC Inquilinos (Débito)</label>
            <select id="cfg-cxc-tenant" class="form-input"></select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label font-bold text-gray-700">Cuenta Ingresos por Comisión (Crédito)</label>
            <select id="cfg-comm-income" class="form-input"></select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label font-bold text-gray-700">Cuenta CxP Propietarios (Crédito)</label>
            <select id="cfg-cxp-owner" class="form-input"></select>
          </div>

          <div class="form-group flex items-center gap-2 py-1">
            <input type="checkbox" id="cfg-comm-has-iva" ${cfg.commission_has_iva ? 'checked' : ''} class="w-4 h-4 rounded text-pink-600 border-gray-300 focus:ring-pink-500" style="width:16px;height:16px;">
            <label for="cfg-comm-has-iva" class="text-xs font-bold text-gray-700 select-none cursor-pointer">Calcular IVA sobre Comisión de Administración (19%)</label>
          </div>

          <div class="form-group mb-0" id="cfg-iva-comm-sec" style="display: ${cfg.commission_has_iva ? 'block' : 'none'}">
            <label class="form-label font-bold text-gray-700">Cuenta Impuesto IVA sobre Comisión (Crédito)</label>
            <select id="cfg-iva-commission" class="form-input"></select>
          </div>
        </div>

        <!-- Sección 2: Arrendamiento Estándar / Directo (Comisión = 0%) -->
        <div class="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-3">
          <span class="text-xs font-bold text-purple-900 block border-b border-purple-200/60 pb-1">2. Parámetros de Facturación Directa / Estándar (Sin Comisión / Gestión Directa)</span>
          
          <div class="form-group mb-0">
            <label class="form-label font-bold text-gray-700">Cuenta Ingresos por Arrendamiento Directo (Crédito)</label>
            <select id="cfg-rent-income" class="form-input"></select>
          </div>

          <div class="form-group flex items-center gap-2 py-1">
            <input type="checkbox" id="cfg-rent-has-iva" ${cfg.rent_has_iva ? 'checked' : ''} class="w-4 h-4 rounded text-purple-600 border-gray-300 focus:ring-purple-500" style="width:16px;height:16px;">
            <label for="cfg-rent-has-iva" class="text-xs font-bold text-gray-700 select-none cursor-pointer">Obligado a cobrar IVA en Arrendamiento Directo/Estándar</label>
          </div>

          <div id="cfg-rent-iva-sec" class="space-y-3" style="display: ${cfg.rent_has_iva ? 'block' : 'none'}">
            <div class="form-group flex items-center gap-2 py-1 bg-white p-2.5 rounded-lg border border-purple-100">
              <input type="checkbox" id="cfg-rent-prices-include-tax" ${cfg.prices_include_tax ? 'checked' : ''} class="w-4 h-4 rounded text-purple-600 border-gray-300 focus:ring-purple-500" style="width:16px;height:16px;">
              <div>
                <label for="cfg-rent-prices-include-tax" class="text-xs font-bold text-purple-900 select-none cursor-pointer block">Los precios de canon tienen el IVA incluido (Tax-Inclusive)</label>
                <span class="text-[10px] text-gray-500 block">Si se desmarca, se asume que el valor mensual del contrato es la Base gravable y el IVA se suma adicionalmente.</span>
              </div>
            </div>

            <div class="form-group mb-0">
              <label class="form-label font-bold text-gray-700">Tarifa IVA Arrendamiento (%)</label>
              <input id="cfg-rent-iva-rate" type="number" class="form-input" value="${cfg.rent_iva_rate || 19}" min="0" max="100" step="1">
            </div>
            <div class="form-group mb-0">
              <label class="form-label font-bold text-gray-700">Cuenta Impuesto IVA Generado Arrendamiento (Crédito)</label>
              <select id="cfg-rent-iva-code" class="form-input"></select>
            </div>
          </div>
        </div>

        <!-- Sección 3: Resolución de Facturación Electrónica DIAN -->
        <div class="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
          <span class="text-xs font-bold text-blue-900 block border-b border-blue-200/60 pb-1">3. Resolución de Facturación Electrónica DIAN Predeterminada</span>
          <div class="form-group mb-0">
            <label class="form-label font-bold text-gray-700">Resolución DIAN para Transmisión Electrónica</label>
            <select id="cfg-dian-resolution" class="form-input"></select>
          </div>
        </div>
      </div>`;

    const dianResolutions = await (window as any).pb.listAll('dian_resolutions', { filter: 'active=true' }).catch(() => []);
    const dianSel = document.getElementById('cfg-dian-resolution') as HTMLSelectElement;
    if (dianSel) {
      dianSel.innerHTML = `<option value="">-- Seleccionar Resolución DIAN Predeterminada --</option>` + 
        dianResolutions.map((r: any) => `
          <option value="${r.id}" ${cfg.dian_resolution_id === r.id ? 'selected' : ''}>
            ${r.prefix ? r.prefix + ' - ' : ''}Res. N° ${r.resolution_number || ''} (${r.document_type || 'FE'})
          </option>
        `).join('');
    }

    await Promise.all([
      renderAccountSelect('cfg-cxc-tenant', cfg.cxc_tenant_code),
      renderAccountSelect('cfg-comm-income', cfg.commission_income_code),
      renderAccountSelect('cfg-cxp-owner', cfg.cxp_owner_code),
      renderAccountSelect('cfg-iva-commission', cfg.iva_commission_code),
      renderAccountSelect('cfg-rent-income', cfg.rent_income_code),
      renderAccountSelect('cfg-rent-iva-code', cfg.rent_iva_code),
    ]);

    const hasIvaCheckbox = document.getElementById('cfg-comm-has-iva') as HTMLInputElement;
    const ivaSec = document.getElementById('cfg-iva-comm-sec') as HTMLElement;
    hasIvaCheckbox?.addEventListener('change', () => {
      if (ivaSec) ivaSec.style.display = hasIvaCheckbox.checked ? 'block' : 'none';
    });

    const rentHasIvaCb = document.getElementById('cfg-rent-has-iva') as HTMLInputElement;
    const rentIvaSec = document.getElementById('cfg-rent-iva-sec') as HTMLElement;
    rentHasIvaCb?.addEventListener('change', () => {
      if (rentIvaSec) rentIvaSec.style.display = rentHasIvaCb.checked ? 'block' : 'none';
    });

    document.getElementById('btn-save-cfg-modal')?.addEventListener('click', async () => {
      const cxc = (document.getElementById('cfg-cxc-tenant') as HTMLSelectElement)?.value || '130505';
      const income = (document.getElementById('cfg-comm-income') as HTMLSelectElement)?.value || '413505';
      const cxp = (document.getElementById('cfg-cxp-owner') as HTMLSelectElement)?.value || '220505';
      const hasIva = (document.getElementById('cfg-comm-has-iva') as HTMLInputElement)?.checked || false;
      const ivaCode = (document.getElementById('cfg-iva-commission') as HTMLSelectElement)?.value || '240810';

      const rentHasIva = (document.getElementById('cfg-rent-has-iva') as HTMLInputElement)?.checked || false;
      const pricesIncludeTax = (document.getElementById('cfg-rent-prices-include-tax') as HTMLInputElement)?.checked || false;
      const rentIvaRate = parseFloat((document.getElementById('cfg-rent-iva-rate') as HTMLInputElement)?.value || '19') || 19;
      const rentIvaCode = (document.getElementById('cfg-rent-iva-code') as HTMLSelectElement)?.value || '240805';
      const rentIncomeCode = (document.getElementById('cfg-rent-income') as HTMLSelectElement)?.value || '415505';
      const dianResolutionId = (document.getElementById('cfg-dian-resolution') as HTMLSelectElement)?.value || '';

      const payload = { 
        cxc_tenant_code: cxc, 
        commission_income_code: income, 
        cxp_owner_code: cxp,
        commission_has_iva: hasIva,
        iva_commission_code: ivaCode,
        rent_has_iva: rentHasIva,
        prices_include_tax: pricesIncludeTax,
        rent_iva_rate: rentIvaRate,
        rent_iva_code: rentIvaCode,
        rent_income_code: rentIncomeCode,
        dian_resolution_id: dianResolutionId
      };
      const btn = document.getElementById('btn-save-cfg-modal') as HTMLButtonElement;
      btn.disabled = true;
      btn.textContent = 'Guardando...';

      try {
        await (window as any).API.setSetting('inmo_config_v1', JSON.stringify(payload));
        (window as any).showToast('Configuración guardada exitosamente.', 'success');
        (window as any).closeModal();
      } catch (err: any) {
        (window as any).showToast(err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save mr-1"></i>Guardar Configuración';
      }
    });

  } catch (err: any) {
    modalContainer.innerHTML = `<div class="p-6 text-center text-red-500"><i class="fas fa-circle-exclamation mr-2"></i>${(window as any).esc(err.message)}</div>`;
  }
}

async function openPropertySellModal(propertyId: string, container: HTMLElement) {
  try {
    const prop = await (window as any).pb.get('inmo_properties', propertyId, { expand: 'owner_id' });
    const ownerName = prop.expand?.owner_id?.name || 'Propietario Desconocido';
    const salePrice = prop.sale_price || 0;
    const rate = prop.commission_rate ?? 0;

    const modalBody = `
      <div class="space-y-4 text-sm" style="text-align: left;">
        <div class="p-3.5 rounded-xl bg-gray-50 border border-gray-100 mb-4 shadow-sm">
          <span class="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Inmueble a Facturar</span>
          <h4 class="font-bold text-gray-800 text-sm">${(window as any).esc(prop.title)} <span class="font-mono text-pink-600">(${prop.code})</span></h4>
          <p class="text-xs text-gray-500 mt-1">Propietario actual: <strong>${(window as any).esc(ownerName)}</strong></p>
          <p class="text-xs text-gray-500">Precio Venta Ref: <strong>${(window as any).fmt(salePrice)}</strong> | % Comisión: <strong>${rate}%</strong></p>
        </div>

        <div class="form-group">
          <label class="form-label font-bold text-gray-700">Tipo de Facturación</label>
          <select id="sell-type" class="form-input">
            <option value="MANDATO">Factura por Mandato (Venta total del inmueble)</option>
            <option value="COMISION">Factura por Comisión (Honorarios de Intermediación)</option>
          </select>
        </div>

        <!-- Autocomplete Comprador -->
        <div class="form-group relative">
          <label class="form-label font-bold text-gray-700">Cliente / Adquirente <span class="text-red-500">*</span></label>
          <input id="sell-buyer-search" class="form-input" autocomplete="off" placeholder="Escribe NIT o nombre del cliente...">
          <input id="sell-buyer-id" type="hidden">
          <div id="sell-buyer-results" class="absolute left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto hidden z-50"></div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="form-group mb-0">
            <label class="form-label font-bold text-gray-700" id="lbl-sell-amount">Valor Venta Inmueble <span class="text-red-500">*</span></label>
            <input id="sell-amount" type="number" class="form-input" value="${salePrice}" min="0">
          </div>
          <div class="form-group mb-0" id="sec-sell-rate" style="display: none;">
            <label class="form-label font-bold text-gray-700">Comisión Pactada (%)</label>
            <input id="sell-rate" type="number" class="form-input" value="${rate}" min="0" max="100" step="0.1">
          </div>
        </div>
      </div>
    `;

    const modalFooter = `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-confirm-sell"><i class="fas fa-arrow-right-to-bracket mr-1"></i> Ir a Facturación</button>
    `;

    (window as any).openModal(`Facturar Venta de Inmueble`, modalBody, modalFooter, false);

    setupThirdPartyAutocomplete('sell-buyer-search', 'sell-buyer-id', 'sell-buyer-results', 'CLIENTE');

    const sellTypeSelect = document.getElementById('sell-type') as HTMLSelectElement;
    const sellAmountInput = document.getElementById('sell-amount') as HTMLInputElement;
    const sellRateSec = document.getElementById('sec-sell-rate') as HTMLElement;
    const sellRateInput = document.getElementById('sell-rate') as HTMLInputElement;
    const lblSellAmount = document.getElementById('lbl-sell-amount') as HTMLElement;

    const updateAmountField = () => {
      const type = sellTypeSelect.value;
      if (type === 'MANDATO') {
        sellRateSec.style.display = 'none';
        lblSellAmount.textContent = 'Valor Venta Inmueble *';
        sellAmountInput.value = String(salePrice);
      } else {
        sellRateSec.style.display = 'block';
        lblSellAmount.textContent = 'Monto Comisión de Venta *';
        const commValue = salePrice * (parseFloat(sellRateInput.value || '0') / 100);
        sellAmountInput.value = String(commValue);
      }
    };

    sellTypeSelect.addEventListener('change', updateAmountField);
    sellRateInput.addEventListener('input', updateAmountField);

    document.getElementById('btn-confirm-sell')?.addEventListener('click', async () => {
      const buyerId = (document.getElementById('sell-buyer-id') as HTMLInputElement).value;
      const type = sellTypeSelect.value;
      const amount = parseFloat(sellAmountInput.value) || 0;

      if (!buyerId) {
        (window as any).showToast('Debes seleccionar un cliente/adquirente.', 'warning');
        return;
      }
      if (amount <= 0) {
        (window as any).showToast('El monto a facturar debe ser mayor a cero.', 'warning');
        return;
      }

      // Cerrar modal de confirmación
      (window as any).closeModal();

      try {
        (window as any).showToast('Preparando factura de venta...', 'info');
        
        // Obtener productos para emparejar
        const products = await (window as any).API.getProducts({ activeOnly: true });
        
        let matchedProduct;
        let lineDescription = '';
        
        if (type === 'MANDATO') {
          // Factura por Mandato (Venta total de inmueble)
          matchedProduct = products.find((p: any) => p.type === 'SERVICIO' && (p.name.toLowerCase().includes('venta') || p.name.toLowerCase().includes('inmueble')));
          if (!matchedProduct) matchedProduct = products.find((p: any) => p.type === 'SERVICIO');
          lineDescription = `Venta por mandato de inmueble ${prop.code} - ${prop.title}. Propietario: ${ownerName}`;
        } else {
          // Comisión por Intermediación
          matchedProduct = products.find((p: any) => p.type === 'SERVICIO' && (p.name.toLowerCase().includes('comisi') || p.name.toLowerCase().includes('honorario')));
          if (!matchedProduct) matchedProduct = products.find((p: any) => p.type === 'SERVICIO');
          lineDescription = `Comisión por intermediación venta de inmueble ${prop.code} - ${prop.title}`;
        }

        if (!matchedProduct) {
          (window as any).showToast('No se encontró ningún producto de tipo SERVICIO en el catálogo para facturar.', 'error');
          return;
        }

        const ivaRate = matchedProduct.iva_rate || 0;
        const ivaAmount = amount * (ivaRate / 100);
        
        // Cargar estado en localStorage
        localStorage.setItem('__soTempState', JSON.stringify({
          inv: {
            customer_id: buyerId,
            notes: lineDescription,
            date: (window as any).todayStr()
          },
          lines: [
            {
              product_id: matchedProduct.id,
              qty: 1,
              unit_price: amount,
              iva_rate: ivaRate,
              iva_amount: ivaAmount,
              subtotal: amount,
              total: amount + ivaAmount
            }
          ]
        }));

        // Abrir formulario comercial
        if (typeof (window as any).openSalesForm === 'function') {
          await (window as any).openSalesForm(null, () => {
            // Al terminar la factura comercial, refrescar inmuebles
            renderInmoInmuebles(container);
          });
          
          // Borrar borrador temporal inmediatamente después de que se cargó
          setTimeout(() => {
            localStorage.removeItem('__soTempState');
          }, 800);
        } else {
          (window as any).showToast('Módulo de facturación de ventas no disponible.', 'error');
        }

      } catch (err: any) {
        (window as any).showToast('Error preparando facturación: ' + err.message, 'error');
      }
    });

  } catch (err: any) {
    (window as any).showToast('Error al abrir la venta: ' + err.message, 'error');
  }
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderInmobiliarias = renderInmobiliarias;
(window as any).renderInmoInmuebles = renderInmoInmuebles;
(window as any).renderInmoContratos = renderInmoContratos;
(window as any).renderInmoLiquidacion = renderInmoLiquidacion;
(window as any).openInmoConfigModal = openInmoConfigModal;
(window as any).openPropertySellModal = openPropertySellModal;
(window as any).renderInmoContratosPage = renderInmoContratosPage;
(window as any).openContractModal = openContractModal;
(window as any).viewAmortizationTable = viewAmortizationTable;
(window as any).renderInmoLiquidacionPage = renderInmoLiquidacionPage;

(window as any).openInmoPostingChoicesModal = async function(id: string) {
  let inv: any;
  let inmoCfg: any = {};
  let dianResolutions: any[] = [];

  try {
    const [invRes, rawCfg, resList] = await Promise.all([
      (window as any).pb.get('inmo_invoices', id, {
        expand: 'contract_id,contract_id.property_id,contract_id.tenant_id'
      }),
      (window as any).API.getSetting('inmo_config_v1').catch(() => null),
      (window as any).pb.listAll('dian_resolutions', { filter: 'active=true' }).catch(() => [])
    ]);
    inv = invRes;
    if (rawCfg) try { inmoCfg = JSON.parse(rawCfg); } catch (_) {}
    dianResolutions = resList || [];
  } catch (err: any) {
    (window as any).showToast('Error al cargar la factura: ' + err.message, 'error');
    return;
  }

  const rent = inv.rent_amount || 0;
  const num = inv.number || '';
  const tenant = inv.expand?.contract_id?.expand?.tenant_id?.name || 'Inquilino';

  (window as any).openModal(
    'Contabilizar Factura de Arriendo',
    `
      <div class="space-y-4 text-sm text-gray-700" style="text-align: left;">
        <div class="p-3.5 rounded-xl border flex flex-col gap-1" style="background:#F9FAFB; border-color:#E5E7EB">
          <p><strong>Factura N°:</strong> <span class="font-mono text-pink-600 font-bold">${(window as any).esc(num)}</span></p>
          <p><strong>Inquilino:</strong> ${(window as any).esc(tenant)}</p>
          <p><strong>Valor Canon:</strong> ${(window as any).fmt(rent)}</p>
        </div>
        
        <p class="text-xs text-gray-500 font-bold mb-2">Seleccione la opción de contabilización que desea aplicar para este documento:</p>
        
        <div class="space-y-3">
          <!-- Opción 1: Directa -->
          <label class="flex items-start gap-3 p-3 rounded-xl border hover:bg-gray-50 cursor-pointer transition-all" style="border-color:#E5E7EB">
            <input type="radio" name="post-choice" id="choice-direct" value="direct" checked class="mt-1 text-pink-600 focus:ring-pink-500" style="width: 16px; height: 16px;">
            <div>
              <span class="font-bold text-gray-800 block text-sm">Contabilizar directamente (Local)</span>
              <span class="text-xs text-gray-500 block">Genera el asiento contable en los libros de la empresa y cambia el estado de la factura a Contabilizada. No transmite a la DIAN.</span>
            </div>
          </label>
          
          <!-- Opción 2: Electrónica + Contabilizar -->
          <div class="p-3 rounded-xl border hover:bg-gray-50 transition-all space-y-2" style="border-color:#E5E7EB">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" name="post-choice" id="choice-electronic" value="electronic" class="mt-1 text-pink-600 focus:ring-pink-500" style="width: 16px; height: 16px;">
              <div>
                <span class="font-bold text-gray-800 block text-sm">
                  ${(inv.commission_amount || 0) > 0 ? 'Facturar electrónicamente por Mandato y Contabilizar' : 'Facturar electrónicamente como Servicio Estándar y Contabilizar'}
                </span>
                <span class="text-xs text-gray-500 block">
                  ${(inv.commission_amount || 0) > 0 
                    ? 'Contabiliza el documento en local y luego lo transmite de forma inmediata ante la DIAN como factura por mandato, adjuntando la información fiscal del propietario.' 
                    : 'Contabiliza el documento en local y lo transmite ante la DIAN como Factura Electrónica estándar por servicios de arrendamiento (sin mandato, aplicando la configuración de IVA del módulo).'}
                </span>
              </div>
            </label>

            <!-- Selección de Resolución DIAN -->
            <div id="inmo-post-dian-res-sec" class="pt-2 pl-7 border-t border-dashed border-gray-200 mt-2" style="display: none;">
              <label class="block text-xs font-bold text-purple-900 mb-1"><i class="fas fa-file-signature text-purple-600 mr-1"></i>Resolución DIAN para la Firma Electrónica:</label>
              <select id="inmo-post-dian-resolution" class="form-input text-xs border-purple-300 focus:ring-purple-500 bg-purple-50/40">
                ${dianResolutions.map((r: any) => `
                  <option value="${r.id}" ${inmoCfg.dian_resolution_id === r.id ? 'selected' : ''}>
                    ${r.prefix ? r.prefix + ' - ' : ''}Res. N° ${r.resolution_number || ''} (${r.document_type || 'FE'})
                  </option>
                `).join('')}
                ${!dianResolutions.length ? '<option value="">-- Resolución por Defecto DIAN --</option>' : ''}
              </select>
            </div>
          </div>
        </div>
      </div>
    `,
    `
      <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" id="btn-confirm-inmo-post"><i class="fas fa-check-circle mr-1"></i> Procesar</button>
    `
  );

  const radioDirect = document.getElementById('choice-direct') as HTMLInputElement;
  const radioElectronic = document.getElementById('choice-electronic') as HTMLInputElement;
  const resSec = document.getElementById('inmo-post-dian-res-sec') as HTMLElement;

  radioDirect?.addEventListener('change', () => { if (resSec) resSec.style.display = 'none'; });
  radioElectronic?.addEventListener('change', () => { if (resSec) resSec.style.display = 'block'; });

  document.getElementById('btn-confirm-inmo-post')?.addEventListener('click', async () => {
    const isDirect = (document.getElementById('choice-direct') as HTMLInputElement).checked;
    const selectedResId = (document.getElementById('inmo-post-dian-resolution') as HTMLSelectElement)?.value || '';
    const btn = document.getElementById('btn-confirm-inmo-post') as HTMLButtonElement;
    btn.disabled = true;
    
    try {
      if (isDirect) {
        btn.textContent = 'Contabilizando...';
        await (window as any).API.postInmoInvoice(id);
        (window as any).showToast('Factura contabilizada exitosamente.', 'success');
        (window as any).closeModal();
        const contentContainer = document.getElementById('inmo-tab-content') || document.getElementById('inmo-liquidacion-content') || document.getElementById('page-content');
        if (contentContainer) {
          renderInmoLiquidacion(contentContainer);
        }
      } else {
        btn.textContent = 'Procesando Contabilidad...';
        const resPost = await (window as any).API.postInmoInvoice(id, selectedResId);
        const txId = resPost.tx.id;
        
        btn.textContent = 'Transmitiendo a DIAN...';
        (window as any).showToast('Generando XML UBL 2.1 y transmitiendo a la DIAN...', 'info');
        
        const dianRes = await (window as any).pb.send('/api/dian/emit', {
          method: 'POST',
          body: JSON.stringify({ txId: txId }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (dianRes && dianRes.success) {
          (window as any).showToast(`Factura ${num} emitida correctamente a la DIAN. Estado: ${dianRes.status}.`, 'success');
        } else {
          (window as any).showToast(`Error al emitir a la DIAN: ${dianRes.dianResponse || 'Respuesta desconocida'}`, 'warning');
        }
        
        (window as any).closeModal();
        const contentContainer = document.getElementById('inmo-tab-content') || document.getElementById('inmo-liquidacion-content') || document.getElementById('page-content');
        if (contentContainer) {
          renderInmoLiquidacion(contentContainer);
        }
      }
    } catch (err: any) {
      const errMsg = err.response?.message || err.message || 'Error en la operación';
      (window as any).showToast(errMsg, 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Procesar';
    }
  });
};

(window as any).viewInmoInvoiceDetail = async function(id: string) {
  try {
    const [inv, lines, configRaw] = await Promise.all([
      (window as any).pb.get('inmo_invoices', id, {
        expand: 'contract_id,contract_id.property_id,contract_id.property_id.owner_id,contract_id.tenant_id'
      }),
      (window as any).API.getInmoInvoiceLines(id),
      (window as any).API.getSetting('inmo_config_v1').catch(() => null)
    ]);

    const con = inv.expand?.contract_id;
    const prop = con?.expand?.property_id;
    const owner = prop?.expand?.owner_id;
    const tenant = con?.expand?.tenant_id;
    const meta = INVOICE_STATUS_META[inv.status] || INVOICE_STATUS_META.draft;

    let config = { commission_has_iva: false };
    if (configRaw) {
      try { config = JSON.parse(configRaw); } catch (_) {}
    }

    let commissionIvaAmount = 0;
    let netPayout = inv.net_to_owner || 0;
    if (config.commission_has_iva && inv.commission_amount > 0) {
      commissionIvaAmount = Math.round(inv.commission_amount * 0.19);
      netPayout = Math.max(0, netPayout - commissionIvaAmount);
    }

    // Comprobante Diario
    let txLines: any[] = [];
    if (inv.tx_id) {
      txLines = await (window as any).API.getTxLines(inv.tx_id).catch(() => []);
    }

    // Documento DIAN
    let einv: any = null;
    if (inv.tx_id) {
      try {
        const einvs = await (window as any).pb.list('einvoice_docs', {
          filter: `tx_id="${(window as any).pb.escapeFilterValue(inv.tx_id)}"`,
          perPage: 1
        });
        if (einvs.items.length) {
          einv = einvs.items[0];
        }
      } catch (_) {}
    }

    const bodyHtml = `
      <div class="space-y-6 text-sm" style="color:#374151; text-align: left;">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl" style="background:#F9FAFB">
          <div><span class="text-xs text-gray-500 block">Número Factura</span><p class="font-mono font-bold text-pink-600">${(window as any).esc(inv.number)}</p></div>
          <div><span class="text-xs text-gray-500 block">Estado</span><p><span class="badge ${meta.badge}">${meta.label}</span></p></div>
          <div><span class="text-xs text-gray-500 block">Período</span><p class="font-semibold">${(window as any).fmtPeriod(inv.period)}</p></div>
          <div><span class="text-xs text-gray-500 block">Fecha Emisión</span><p>${(window as any).esc(inv.date)}</p></div>
          <div><span class="text-xs text-gray-500 block">Fecha Vence</span><p>${(window as any).esc(inv.due_date || '—')}</p></div>
          <div><span class="text-xs text-gray-500 block">Contrato Ref.</span><p class="font-semibold">${con ? (window as any).esc(con.number) : '—'}</p></div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Propietario (Mandante) -->
          <div class="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
            <span class="text-xs text-gray-400 font-extrabold uppercase tracking-wider block mb-2"><i class="fas fa-user-tie text-pink-500 mr-1.5"></i>Propietario (Mandante)</span>
            <p class="font-bold text-gray-800">${owner ? (window as any).esc(owner.name) : '—'}</p>
            <p class="text-xs text-gray-500 mt-1">NIT/CC: ${owner ? (window as any).esc(owner.doc_number) : '—'}</p>
            <p class="text-xs text-gray-500">Tel: ${owner?.phone || '—'} | E-mail: ${owner?.email || '—'}</p>
          </div>

          <!-- Inquilino (Adquirente) -->
          <div class="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
            <span class="text-xs text-gray-400 font-extrabold uppercase tracking-wider block mb-2"><i class="fas fa-user-tag text-blue-500 mr-1.5"></i>Inquilino (Arrendatario)</span>
            <p class="font-bold text-gray-800">${tenant ? (window as any).esc(tenant.name) : '—'}</p>
            <p class="text-xs text-gray-500 mt-1">NIT/CC: ${tenant ? (window as any).esc(tenant.doc_number) : '—'}</p>
            <p class="text-xs text-gray-500">Tel: ${tenant?.phone || '—'} | E-mail: ${tenant?.email || '—'}</p>
          </div>
        </div>

        <!-- Detalles Inmueble -->
        <div class="p-3.5 rounded-xl border border-gray-100 bg-white shadow-sm flex items-center gap-3">
          <div class="p-2.5 rounded-lg bg-pink-50 text-pink-500"><i class="fas fa-house-chimney text-base"></i></div>
          <div>
            <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Inmueble Facturado</span>
            <p class="font-bold text-gray-800 text-xs">${prop ? (window as any).esc(prop.title) : '—'} <span class="font-mono text-gray-400 font-normal ml-1">(${prop?.code || ''})</span></p>
            <p class="text-xs text-gray-500 mt-0.5">${prop?.address || ''} ${prop?.city ? '— ' + prop.city : ''}</p>
          </div>
        </div>

        <!-- Líneas de Factura -->
        <div class="border rounded-xl overflow-hidden shadow-sm" style="border-color:#F0F0F0">
          <table class="data-table text-xs">
            <thead>
              <tr style="background:#F9FAFB">
                <th style="color:#000">Descripción del Concepto</th>
                <th class="text-right" style="color:#000; width:150px;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${lines.map((l: any) => `
                <tr>
                  <td class="font-semibold text-gray-800">${(window as any).esc(l.description)}</td>
                  <td class="text-right font-bold text-gray-800">${(window as any).fmt(l.amount)}</td>
                </tr>
              `).join('')}
              ${!lines.length ? '<tr><td colspan="2" class="text-center py-4 text-gray-400">Sin líneas de concepto</td></tr>' : ''}
            </tbody>
          </table>
        </div>

        <!-- Liquidación de montos -->
        <div class="flex justify-end p-4 rounded-xl bg-gray-50">
          <div class="text-xs space-y-1.5 min-w-80">
            <div class="flex justify-between gap-8"><span class="text-gray-500">Valor Canon Base:</span><span class="font-bold text-gray-800">${(window as any).fmt(inv.rent_amount || 0)}</span></div>
            ${(inv.tax_amount || 0) > 0 ? `<div class="flex justify-between gap-8"><span class="text-purple-600 font-semibold">IVA Arrendamiento:</span><span class="font-bold text-purple-700">+ ${(window as any).fmt(inv.tax_amount)}</span></div>` : ''}
            ${inv.other_amount > 0 ? `<div class="flex justify-between gap-8"><span class="text-gray-500">Otros Conceptos:</span><span class="font-bold text-gray-800">${(window as any).fmt(inv.other_amount || 0)}</span></div>` : ''}
            <div class="flex justify-between gap-8 border-t pt-1.5" style="border-color:#E5E7EB"><span class="font-bold text-gray-700">Total Facturado (Cobro Inquilino):</span><span class="font-extrabold text-blue-700 text-sm">${(window as any).fmt(inv.total || 0)}</span></div>
            
            ${(inv.commission_amount || 0) > 0 ? `
              <div class="flex justify-between gap-8 pt-3 border-t border-dashed" style="border-color:#D1D5DB"><span class="text-gray-500 flex items-center gap-1">Comisión Administración:</span><span class="font-bold text-red-600">- ${(window as any).fmt(inv.commission_amount || 0)}</span></div>
              ${commissionIvaAmount > 0 ? `<div class="flex justify-between gap-8"><span class="text-gray-500">IVA sobre Comisión (19%):</span><span class="font-bold text-red-600">- ${(window as any).fmt(commissionIvaAmount)}</span></div>` : ''}
              <div class="flex justify-between gap-8 border-t pt-1.5 font-bold" style="border-color:#E5E7EB"><span class="text-emerald-700">Neto a Liquidar Propietario:</span><span class="font-extrabold text-emerald-600 text-sm">${(window as any).fmt(netPayout)}</span></div>
            ` : '<div class="text-xs text-gray-400 italic pt-2">Gestión Directa por el Propietario (Sin comisión de intermediación)</div>'}
          </div>
        </div>

        <!-- Asiento Contable Diario -->
        ${txLines.length ? `
          <div class="border rounded-xl p-4 space-y-3 bg-white shadow-sm" style="border-color:#E5E7EB">
            <h4 class="font-bold text-gray-800 border-b pb-1.5 flex items-center gap-1.5"><i class="fas fa-book-open text-purple-600"></i>Asiento Diario Contable [${inv.tx_id}]</h4>
            <table class="data-table text-xs">
              <thead>
                <tr style="background:#F9FAFB">
                  <th style="color:#000">Cuenta</th>
                  <th style="color:#000">Tercero</th>
                  <th style="color:#000">Descripción</th>
                  <th class="text-right" style="color:#000">Débito</th>
                  <th class="text-right" style="color:#000">Crédito</th>
                </tr>
              </thead>
              <tbody>
                ${txLines.map(tl => `
                  <tr>
                    <td class="font-semibold text-gray-800">${(window as any).esc(tl.expand?.account_id?.code)} - ${(window as any).esc(tl.expand?.account_id?.name)}</td>
                    <td>${(window as any).esc(tl.expand?.third_party_id?.name || '—')}</td>
                    <td class="text-gray-500">${(window as any).esc(tl.description)}</td>
                    <td class="text-right font-bold text-emerald-700">${tl.debit > 0 ? (window as any).fmt(tl.debit) : '—'}</td>
                    <td class="text-right font-bold text-rose-700">${tl.credit > 0 ? (window as any).fmt(tl.credit) : '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

        <!-- Facturación Electrónica DIAN -->
        ${einv ? `
          <div class="border rounded-xl p-4 space-y-3 bg-white shadow-sm" style="border-color:#E5E7EB">
            <h4 class="font-bold text-gray-800 border-b pb-1.5 flex items-center gap-1.5"><i class="fas fa-file-invoice text-blue-600"></i>Facturación Electrónica DIAN</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div><span class="text-gray-400 font-semibold block">Estado DIAN:</span><span class="badge ${einv.status === 'aceptada' ? 'badge-green' : (einv.status === 'rechazada' ? 'badge-red' : 'badge-orange')} font-bold">${einv.status.toUpperCase()}</span></div>
              ${einv.cufe ? `<div class="md:col-span-2"><span class="text-gray-400 font-semibold block">CUFE Key:</span><code class="text-[10px] break-all font-mono font-bold bg-gray-50 p-1.5 rounded border block mt-0.5">${einv.cufe}</code></div>` : ''}
              <div class="md:col-span-2"><span class="text-gray-400 font-semibold block">Respuesta de DIAN:</span><p class="text-gray-600 italic bg-gray-50 p-2 rounded mt-0.5">${(window as any).esc(einv.dian_response)}</p></div>
            </div>
            
            <div class="flex gap-2 pt-2 border-t border-gray-100 flex-wrap">
              <button class="btn btn-outline btn-sm text-xs" onclick="window.downloadDianZip('${inv.tx_id}', '${inv.number}')"><i class="fas fa-file-zipper mr-1"></i> Descargar ZIP</button>
              <button class="btn btn-outline btn-sm text-xs" onclick="window.resendDianEmail('${inv.tx_id}', '${inv.number}')"><i class="fas fa-paper-plane mr-1"></i> Reenviar Correo</button>
              ${einv.status !== 'aceptada' && einv.ftech_transaction_id ? `
                <button class="btn btn-sm btn-outline text-xs" style="border-color:#3B82F6;color:#3B82F6;" onclick="window.checkFtechStatus('${einv.id}', '${inv.tx_id}')"><i class="fas fa-rotate mr-1"></i> Consultar Estado</button>
              ` : ''}
            </div>
          </div>
        ` : (inv.status === 'posted' ? `
          <div class="p-3.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs flex justify-between items-center gap-3">
            <div>
              <p class="font-bold mb-0.5"><i class="fas fa-circle-info mr-1.5"></i>Factura Contabilizada Localmente</p>
              <p>Este documento no ha sido transmitido electrónicamente a la DIAN.</p>
            </div>
            <button class="btn btn-primary btn-sm text-xs whitespace-nowrap" onclick="closeModal(); window.emitInmoInvoiceToDian('${inv.tx_id}', '${inv.number}')"><i class="fas fa-paper-plane mr-1"></i> Emitir a DIAN</button>
          </div>
        ` : '')}
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
      ${inv.status === 'draft' ? `
        <button class="btn btn-primary" onclick="closeModal(); window.openInmoPostingChoicesModal('${inv.id}')"><i class="fas fa-check-circle"></i> Contabilizar</button>
      ` : ''}
      ${inv.status === 'posted' ? `
        <button class="btn btn-outline" style="color:#EF4444; border-color:#FCA5A5" onclick="closeModal(); document.querySelector('.inmo-inv-unpost[data-id=\\'${inv.id}\\']')?.click()"><i class="fas fa-rotate-left"></i> Descontabilizar</button>
      ` : ''}
    `;

    (window as any).openModal(`Detalle de Factura de Arriendo`, bodyHtml, footerHtml, true);
  } catch (err: any) {
    (window as any).showToast(err.message || 'Error al abrir detalle', 'error');
  }
};

(window as any).emitInmoInvoiceToDian = async function(txId: string, docNumber: string) {
  (window as any).confirmDialog(
    'Emitir a la DIAN',
    `¿Deseas firmar digitalmente y emitir la factura de arriendo por mandato <strong>${docNumber}</strong> a la DIAN?<br><br>Se transmitirá incluyendo los datos fiscales del propietario.`,
    async () => {
      try {
        (window as any).showToast('Generando y firmando XML UBL 2.1...', 'info');
        const res = await (window as any).pb.send('/api/dian/emit', {
          method: 'POST',
          body: JSON.stringify({ txId: txId }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (res && res.success) {
          (window as any).showToast(`Factura ${docNumber} emitida correctamente. Estado: ${res.status}.`, 'success');
          const contentContainer = document.getElementById('inmo-tab-content') || document.getElementById('inmo-liquidacion-content') || document.getElementById('page-content');
          if (contentContainer) {
            renderInmoLiquidacion(contentContainer);
          }
        } else {
          (window as any).showToast(`Error al emitir: ${res.dianResponse || 'Respuesta rechazada'}`, 'error');
        }
      } catch (err: any) {
        const errMsg = err.response?.message || err.message || 'Error al emitir a la DIAN';
        (window as any).showToast(errMsg, 'error');
      }
    }
  );
};
