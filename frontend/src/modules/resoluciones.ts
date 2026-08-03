/**
 * GRAVY v2.0 — resoluciones.ts
 * Centro de Control de Resoluciones DIAN y Terminales POS.
 * Administra prefijos, rangos, fechas de vigencia y asignaciones por caja.
 */

'use strict';

interface DianResolution {
  id: string;
  document_type: string;
  prefix: string;
  resolution_number: string;
  resolution_date: string;
  number_from: number;
  number_to: number;
  current_number: number;
  expiration_date: string;
  pos_register_id: string;
  active: boolean;
  expand?: any;
}

interface PosRegister {
  id: string;
  name: string;
  terminal_key: string;
  active: boolean;
}

const DOC_TYPES = [
  { value: 'FV',  label: 'Factura Electrónica de Venta (FV)' },
  { value: 'NC',  label: 'Nota Crédito Electrónica (NC)' },
  { value: 'ND',  label: 'Nota Débito Electrónica (ND)' },
  { value: 'POS', label: 'Documento Equivalente POS (POS)' },
  { value: 'DS',  label: 'Documento Soporte (DS)' },
  { value: 'NDS', label: 'Nota Ajuste Documento Soporte (NDS)' },
  { value: 'NE',  label: 'Nómina Electrónica (NE)' }
];

export async function renderResoluciones(container: HTMLElement) {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  container = getContainer(container);
  if (!container) return;
  container.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando resoluciones...</div>`;

  try {
    const [resolutions, registers] = await Promise.all([
      (window as any).pb.listAll('dian_resolutions', { expand: 'pos_register_id' }),
      (window as any).pb.listAll('pos_registers')
    ]);

    const activeResCount = resolutions.filter((r: any) => r.active).length;
    
    // Alertas de vencimiento (próximos 30 días)
    const today = new Date();
    const alertDays = 30;
    const expAlerts = resolutions.filter((r: any) => {
      if (!r.active || !r.expiration_date) return false;
      const expDate = new Date(r.expiration_date.slice(0, 10));
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= alertDays;
    }).length;

    // Alertas de agotamiento de folios (> 85% de consumo)
    const rangeAlerts = resolutions.filter((r: any) => {
      if (!r.active) return false;
      const totalRange = r.number_to - r.number_from + 1;
      const consumed = r.current_number - r.number_from;
      if (totalRange <= 0) return false;
      return (consumed / totalRange) >= 0.85;
    }).length;

    const registersCount = registers.length;

    container.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Centro de Control de Resoluciones DIAN</h3>
          <p class="text-sm" style="color:#6B7280">Administra prefijos, rangos autorizados y asocia numeraciones a cajas registradoras.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="btn btn-outline" id="btn-manage-registers-modal"><i class="fas fa-cash-register"></i> Cajas Registradoras</button>
          <button class="btn btn-primary" id="btn-new-resolution"><i class="fas fa-plus"></i> Nueva Resolución</button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        ${kpiCard('Resoluciones Activas', activeResCount, 'fas fa-file-signature', '#7C3AED', '#F5F3FF')}
        ${kpiCard('Vencimiento Cercano', expAlerts, 'fas fa-calendar-warning', expAlerts > 0 ? '#DC2626' : '#059669', expAlerts > 0 ? '#FEF2F2' : '#ECFDF5')}
        ${kpiCard('Agotamiento Rangos', rangeAlerts, 'fas fa-gauge-high', rangeAlerts > 0 ? '#D97706' : '#059669', rangeAlerts > 0 ? '#FFFBEB' : '#ECFDF5')}
        ${kpiCard('Cajas / Terminales', registersCount, 'fas fa-desktop', '#1A4B8C', '#EEF4FF')}
      </div>

      <!-- Sección Principal -->
      <div class="bg-white rounded-2xl border overflow-hidden p-6" style="border-color:#E5E7EB">
        <h4 class="font-bold text-sm mb-4" style="color:#0D2137"><i class="fas fa-list mr-2 text-violet-500"></i>Listado de Resoluciones DIAN</h4>
        <div class="overflow-x-auto">
          <table class="data-table" id="dian-resolutions-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Prefijo</th>
                <th>Número Resolución</th>
                <th class="text-right">Rango Autorizado</th>
                <th class="text-right">Consecutivo Actual</th>
                <th style="width:160px">Uso de folios</th>
                <th>Expiración</th>
                <th>Caja / Destino</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${resolutions.length ? renderResolutionRows(resolutions, registers) : `<tr><td colspan="10" class="text-center py-8 text-gray-400"><i class="fas fa-box-open mr-1"></i> No hay resoluciones configuradas. Crea la primera para activar el control legal.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-manage-registers-modal')?.addEventListener('click', () => openRegistersModal(registers));
    document.getElementById('btn-new-resolution')?.addEventListener('click', () => openResolutionForm(null, registers));

    const tbl = document.getElementById('dian-resolutions-table') as HTMLTableElement;
    if (tbl) (window as any).makeTableSortable(tbl);

  } catch (err: any) {
    container.innerHTML = `<div class="p-8 text-center text-red-500"><i class="fas fa-triangle-exclamation mr-2"></i>Error al cargar módulo de resoluciones: ${err.message}</div>`;
  }
}

function kpiCard(label: string, value: number, icon: string, color: string, bg: string) {
  return `
    <div class="rounded-2xl p-4 border" style="background:${bg};border-color:rgba(0,0,0,0.02)">
      <div class="flex items-center gap-2 mb-1">
        <i class="${icon} text-sm" style="color:${color}"></i>
        <span class="text-xs font-semibold" style="color:${color}">${label}</span>
      </div>
      <p class="text-2xl font-extrabold" style="color:${color}">${(window as any).fmtN(value)}</p>
    </div>
  `;
}

function renderResolutionRows(resolutions: DianResolution[], registers: PosRegister[]) {
  return resolutions.map(r => {
    const docTypeLabel = DOC_TYPES.find(d => d.value === r.document_type)?.label.split(' (')[0] || r.document_type;
    const totalRange = r.number_to - r.number_from + 1;
    const consumed = Math.max(0, r.current_number - r.number_from);
    const consumedPct = totalRange > 0 ? Math.min(100, Math.round((consumed / totalRange) * 100)) : 0;
    
    // Alerta de color en la barra de progreso
    let barColor = 'bg-blue-500';
    if (consumedPct >= 90) barColor = 'bg-red-500';
    else if (consumedPct >= 75) barColor = 'bg-orange-400';
    else barColor = 'bg-violet-500';

    const progressHtml = `
      <div class="space-y-1">
        <div class="flex justify-between text-[10px] font-semibold text-gray-500">
          <span>${consumedPct}%</span>
          <span>${(window as any).fmtN(consumed)} / ${(window as any).fmtN(totalRange)}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div class="${barColor} h-1.5" style="width: ${consumedPct}%"></div>
        </div>
      </div>
    `;

    const statusBadge = r.active
      ? `<span class="badge badge-green">Activa</span>`
      : `<span class="badge badge-gray">Inactiva</span>`;

    const registerName = r.expand?.pos_register_id?.name || (r.pos_register_id ? 'Caja #' + r.pos_register_id.slice(-4) : 'Genérica / Multicaja');

    return `
      <tr>
        <td class="font-bold" style="color:#0D2137">${docTypeLabel}</td>
        <td><span class="font-mono font-bold text-blue-600">${(window as any).esc(r.prefix || '—')}</span></td>
        <td class="font-mono text-xs text-gray-500">${(window as any).esc(r.resolution_number)}</td>
        <td class="text-right font-mono">${(window as any).fmtN(r.number_from)} - ${(window as any).fmtN(r.number_to)}</td>
        <td class="text-right font-mono font-bold text-gray-700">${(window as any).fmtN(r.current_number)}</td>
        <td>${progressHtml}</td>
        <td class="font-mono text-xs">${r.expiration_date ? r.expiration_date.slice(0, 10) : '—'}</td>
        <td class="text-xs font-semibold text-gray-600">${(window as any).esc(registerName)}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="flex gap-1">
            <button class="btn btn-outline btn-sm" title="Editar resolución" onclick="window.editDianResolution('${r.id}')"><i class="fas fa-pen text-gray-500"></i></button>
            <button class="btn btn-outline btn-sm text-red-500" title="Eliminar resolución" onclick="window.deleteDianResolution('${r.id}', '${r.prefix || ''}')"><i class="fas fa-trash-can"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Modal Cajas Registradoras
async function openRegistersModal(registers: PosRegister[]) {
  const currentAssignedId = localStorage.getItem('gravy_pos_register_id') || '';

  const buildRows = (list: PosRegister[]) => {
    if (!list.length) return `<tr><td colspan="4" class="text-center py-4 text-xs italic text-gray-400">Sin cajas registradoras creadas.</td></tr>`;
    return list.map(reg => {
      const isThisTerminal = currentAssignedId === reg.id;
      return `
        <tr>
          <td class="font-bold text-xs">${(window as any).esc(reg.name)}</td>
          <td class="font-mono text-[10px] text-gray-500">${(window as any).esc(reg.terminal_key)}</td>
          <td>
            ${isThisTerminal 
              ? `<span class="badge badge-blue"><i class="fas fa-circle-check mr-1"></i> Esta terminal</span>` 
              : `<button class="btn btn-outline btn-sm py-1" onclick="window.assignThisTerminal('${reg.id}')">Vincular</button>`}
          </td>
          <td>
            <div class="flex gap-1 justify-end">
              <button class="btn btn-outline btn-sm py-1" onclick="window.editPosRegister('${reg.id}')"><i class="fas fa-pen text-gray-500"></i></button>
              <button class="btn btn-danger btn-sm py-1" onclick="window.deletePosRegister('${reg.id}', '${(window as any).esc(reg.name)}')"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  const bodyHtml = `
    <div class="space-y-4" style="color:#374151">
      <p class="text-xs" style="color:#6B7280">Las cajas permiten sectorizar las resoluciones POS. Vincula este equipo con una caja para aplicar su respectiva numeración.</p>
      
      <div class="border rounded-xl p-3 bg-gray-50 flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold text-gray-400 block">ID único de este navegador</span>
          <span class="font-mono text-xs font-bold" id="local-uuid-label">${getOrGenerateBrowserUUID()}</span>
        </div>
        <button class="btn btn-primary btn-sm" id="btn-add-new-register"><i class="fas fa-plus"></i> Crear Caja</button>
      </div>

      <div class="overflow-x-auto max-h-[300px] border rounded-xl">
        <table class="data-table" style="font-size:12px">
          <thead>
            <tr>
              <th>Nombre de Caja</th>
              <th>Terminal Key</th>
              <th>Vinculación</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody id="registers-table-body">
            ${buildRows(registers)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  (window as any).openModal('Gestión de Cajas Registradoras (POS)', bodyHtml, `<button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>`, false);

  document.getElementById('btn-add-new-register')?.addEventListener('click', () => {
    openRegisterForm(null);
  });
}

function getOrGenerateBrowserUUID() {
  let uuid = localStorage.getItem('gravy_browser_uuid');
  if (!uuid) {
    uuid = 'DEV-' + Math.random().toString(36).substring(2, 15).toUpperCase();
    localStorage.setItem('gravy_browser_uuid', uuid);
  }
  return uuid;
}

// Vincula esta máquina a una caja
(window as any).assignThisTerminal = function(registerId: string) {
  localStorage.setItem('gravy_pos_register_id', registerId);
  (window as any).showToast('Esta terminal ha sido vinculada con éxito.', 'success');
  (window as any).closeModal();
  if (document.getElementById('page-content')) {
    renderResoluciones(document.getElementById('page-content')!);
  }
};

// Formulario de Caja
function openRegisterForm(reg: PosRegister | null = null) {
  const currentUUID = getOrGenerateBrowserUUID();
  const formHtml = `
    <div class="space-y-4 text-sm" style="color:#374151">
      <div class="form-group">
        <label class="form-label">Nombre de la Caja <span style="color:#EF4444">*</span></label>
        <input id="reg-name" class="form-input" value="${reg ? (window as any).esc(reg.name) : ''}" placeholder="Ej: Caja Principal Pasillo A">
      </div>
      <div class="form-group">
        <label class="form-label">Identificador de Terminal (Terminal Key) <span style="color:#EF4444">*</span></label>
        <div class="flex gap-2">
          <input id="reg-key" class="form-input font-mono text-xs flex-1" value="${reg ? (window as any).esc(reg.terminal_key) : currentUUID}" placeholder="Ej: TERMINAL-01">
          <button class="btn btn-outline btn-sm" type="button" onclick="document.getElementById('reg-key').value = '${currentUUID}'" title="Usar ID de este equipo">Usar ID local</button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Caja Activa</label>
        <select id="reg-active" class="form-input">
          <option value="true" ${reg?.active !== false ? 'selected' : ''}>Sí</option>
          <option value="false" ${reg?.active === false ? 'selected' : ''}>No</option>
        </select>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-register">Guardar Caja</button>
  `;

  (window as any).openModal(reg ? 'Editar Caja Registradora' : 'Crear Caja Registradora', formHtml, footer, false);

  document.getElementById('btn-save-register')?.addEventListener('click', async () => {
    const name = (document.getElementById('reg-name') as HTMLInputElement)?.value.trim();
    const terminalKey = (document.getElementById('reg-key') as HTMLInputElement)?.value.trim();
    const active = (document.getElementById('reg-active') as HTMLSelectElement)?.value === 'true';

    if (!name || !terminalKey) {
      (window as any).showToast('Todos los campos obligatorios son requeridos.', 'warning');
      return;
    }

    try {
      if (reg?.id) {
        await (window as any).pb.update('pos_registers', reg.id, { name, terminal_key: terminalKey, active });
        (window as any).showToast('Caja actualizada con éxito.', 'success');
      } else {
        await (window as any).pb.create('pos_registers', { name, terminal_key: terminalKey, active });
        (window as any).showToast('Caja creada con éxito.', 'success');
      }
      (window as any).closeModal();
      renderResoluciones(document.getElementById('page-content')!);
    } catch (err: any) {
      (window as any).showToast(err.message || 'Error al guardar caja.', 'error');
    }
  });
}

(window as any).editPosRegister = async function(id: string) {
  try {
    const reg = await (window as any).pb.get('pos_registers', id);
    openRegisterForm(reg);
  } catch (err: any) {
    (window as any).showToast('Error al cargar caja.', 'error');
  }
};

(window as any).deletePosRegister = function(id: string, name: string) {
  (window as any).confirmDialog(
    'Eliminar Caja Registradora',
    `¿Estás seguro de eliminar la caja <strong>${(window as any).esc(name)}</strong>? Las resoluciones asociadas quedarán huérfanas.`,
    async () => {
      try {
        await (window as any).pb.delete('pos_registers', id);
        if (localStorage.getItem('gravy_pos_register_id') === id) {
          localStorage.removeItem('gravy_pos_register_id');
        }
        (window as any).showToast('Caja eliminada con éxito.', 'success');
        (window as any).closeModal();
        renderResoluciones(document.getElementById('page-content')!);
      } catch (err: any) {
        (window as any).showToast('No se puede eliminar la caja.', 'error');
      }
    }
  );
};

// Formulario de Resolución
function openResolutionForm(res: DianResolution | null = null, registers: PosRegister[] = []) {
  const formHtml = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style="color:#374151">
      <div class="form-group col-span-2">
        <label class="form-label">Número de Resolución DIAN <span style="color:#EF4444">*</span></label>
        <input id="res-number" class="form-input font-mono" value="${res ? (window as any).esc(res.resolution_number) : ''}" placeholder="Ej: 18764000001254">
      </div>
      <div class="form-group">
        <label class="form-label">Tipo de Comprobante <span style="color:#EF4444">*</span></label>
        <select id="res-doc-type" class="form-input">
          ${DOC_TYPES.map(d => `<option value="${d.value}" ${res?.document_type === d.value ? 'selected' : ''}>${d.label}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Prefijo <span style="color:#EF4444">*</span></label>
        <input id="res-prefix" class="form-input font-mono" style="text-transform:uppercase" value="${res ? (window as any).esc(res.prefix || '') : ''}" placeholder="Ej: FE" oninput="this.value = this.value.toUpperCase()">
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de Expedición <span style="color:#EF4444">*</span></label>
        <input id="res-date" type="date" class="form-input" value="${res?.resolution_date ? res.resolution_date.slice(0, 10) : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Fecha de Vencimiento <span style="color:#EF4444">*</span></label>
        <input id="res-exp-date" type="date" class="form-input" value="${res?.expiration_date ? res.expiration_date.slice(0, 10) : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Rango Inicial Autorizado <span style="color:#EF4444">*</span></label>
        <input id="res-from" type="number" class="form-input text-right" value="${res ? res.number_from : '1'}">
      </div>
      <div class="form-group">
        <label class="form-label">Rango Final Autorizado <span style="color:#EF4444">*</span></label>
        <input id="res-to" type="number" class="form-input text-right" value="${res ? res.number_to : '1000'}">
      </div>
      <div class="form-group">
        <label class="form-label">Consecutivo Inicial (Actual) <span style="color:#EF4444">*</span></label>
        <input id="res-current" type="number" class="form-input text-right" value="${res ? res.current_number : '0'}">
      </div>
      <div class="form-group">
        <label class="form-label">Asignar a Caja / Terminal</label>
        <select id="res-register" class="form-input">
          <option value="">— Ninguna (Genérica / Multicaja) —</option>
          ${registers.map(reg => `<option value="${reg.id}" ${res?.pos_register_id === reg.id ? 'selected' : ''}>${(window as any).esc(reg.name)} (${(window as any).esc(reg.terminal_key)})</option>`).join('')}
        </select>
      </div>
      <div class="form-group col-span-2">
        <label class="form-label">Resolución Activa</label>
        <select id="res-active" class="form-input">
          <option value="true" ${res?.active !== false ? 'selected' : ''}>Sí (Facturar con esta numeración)</option>
          <option value="false" ${res?.active === false ? 'selected' : ''}>No (Inactiva / Histórica)</option>
        </select>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-primary" id="btn-save-resolution">Guardar Resolución</button>
  `;

  (window as any).openModal(res ? 'Editar Resolución DIAN' : 'Crear Resolución DIAN', formHtml, footer, false);

  document.getElementById('btn-save-resolution')?.addEventListener('click', async () => {
    const resolutionNumber = (document.getElementById('res-number') as HTMLInputElement)?.value.trim();
    const documentType = (document.getElementById('res-doc-type') as HTMLSelectElement)?.value;
    const prefix = (document.getElementById('res-prefix') as HTMLInputElement)?.value.trim().toUpperCase();
    const resolutionDate = (document.getElementById('res-date') as HTMLInputElement)?.value;
    const expirationDate = (document.getElementById('res-exp-date') as HTMLInputElement)?.value;
    const numberFrom = Number((document.getElementById('res-from') as HTMLInputElement)?.value);
    const numberTo = Number((document.getElementById('res-to') as HTMLInputElement)?.value);
    const currentNumber = Number((document.getElementById('res-current') as HTMLInputElement)?.value);
    const posRegisterId = (document.getElementById('res-register') as HTMLSelectElement)?.value || null;
    const active = (document.getElementById('res-active') as HTMLSelectElement)?.value === 'true';

    if (!resolutionNumber || !documentType || !resolutionDate || !expirationDate || Number.isNaN(numberFrom) || Number.isNaN(numberTo) || Number.isNaN(currentNumber)) {
      (window as any).showToast('Todos los campos con asterisco son obligatorios.', 'warning');
      return;
    }

    const payload = {
      resolution_number: resolutionNumber,
      document_type: documentType,
      prefix,
      resolution_date: resolutionDate,
      expiration_date: expirationDate,
      number_from: numberFrom,
      number_to: numberTo,
      current_number: currentNumber,
      pos_register_id: posRegisterId,
      active
    };

    try {
      if (res?.id) {
        await (window as any).pb.update('dian_resolutions', res.id, payload);
        (window as any).showToast('Resolución actualizada con éxito.', 'success');
      } else {
        await (window as any).pb.create('dian_resolutions', payload);
        (window as any).showToast('Resolución creada con éxito.', 'success');
      }
      (window as any).closeModal();
      renderResoluciones(document.getElementById('page-content')!);
    } catch (err: any) {
      (window as any).showToast(err.message || 'Error al guardar resolución.', 'error');
    }
  });
}

(window as any).editDianResolution = async function(id: string) {
  try {
    const [res, registers] = await Promise.all([
      (window as any).pb.get('dian_resolutions', id),
      (window as any).pb.listAll('pos_registers')
    ]);
    openResolutionForm(res, registers);
  } catch (err: any) {
    (window as any).showToast('Error al cargar resolución.', 'error');
  }
};

(window as any).deleteDianResolution = function(id: string, prefix: string) {
  (window as any).confirmDialog(
    'Eliminar Resolución',
    `¿Estás seguro de eliminar la resolución con prefijo <strong>${(window as any).esc(prefix || 'Genérico')}</strong>? Esta acción no se puede deshacer.`,
    async () => {
      try {
        await (window as any).pb.delete('dian_resolutions', id);
        (window as any).showToast('Resolución eliminada con éxito.', 'success');
        (window as any).closeModal();
        renderResoluciones(document.getElementById('page-content')!);
      } catch (err: any) {
        (window as any).showToast('Error al eliminar resolución.', 'error');
      }
    }
  );
};

// Inyecciones globales
(window as any).renderResoluciones = renderResoluciones;
