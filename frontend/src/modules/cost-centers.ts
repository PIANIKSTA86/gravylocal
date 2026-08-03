/**
 * GRAVY v2.0 — cost-centers.ts
 * Maestro de Centros de Costo (Áreas de Actividad)
 */
'use strict';

interface CostCenter {
  id: string;
  code: string;
  name: string;
  description: string;
  parent_id: string;
  active: boolean;
  expand?: {
    parent_id?: CostCenter;
  };
}

async function renderCostCenters(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando centros de costo...</div>`;
  try {
    const rows = await pb.listAll('cost_centers', { sort: 'code', expand: 'parent_id' });

    // Construir mapa para calcular niveles de jerarquía
    const ccMap = new Map<string, any>();
    rows.forEach(r => ccMap.set(r.id, r));

    const getDepth = (cc: any): number => {
      let depth = 0;
      let curr = cc;
      while (curr && curr.parent_id) {
        depth++;
        curr = ccMap.get(curr.parent_id);
      }
      return depth;
    };

    c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Centros de Costo</h3>
        <p class="text-sm" style="color:#6B7280">Áreas de actividad, departamentos o proyectos para distribución de ingresos y gastos.</p>
      </div>
      <div class="flex items-center gap-2">
        ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-cc"><i class="fas fa-plus mr-1.5"></i>Nuevo Centro de Costo</button>' : ''}
      </div>
    </div>

    <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input id="cc-q" class="form-input" placeholder="Buscar por código o nombre...">
        <select id="cc-status" class="form-input">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto" style="max-height: calc(100vh - 310px)">
        <table class="data-table" id="cc-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre / Área</th>
              <th>Descripción</th>
              <th>Depende de</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map(r => {
              const depth = getDepth(r);
              const padding = depth * 20; // 20px de indentación por nivel
              const parentName = r.expand?.parent_id ? `${r.expand.parent_id.code} - ${r.expand.parent_id.name}` : '—';
              
              return `
              <tr data-active="${r.active ? '1' : '0'}" data-id="${esc(r.id)}">
                <td>
                  <div style="padding-left: ${padding}px; display: flex; align-items: center; gap: 8px;">
                    ${depth > 0 ? '<i class="fas fa-turn-up fa-rotate-90 text-gray-400 text-xs"></i>' : '<i class="fas fa-folder text-indigo-500 text-sm"></i>'}
                    <span class="font-semibold text-indigo-900">${esc(r.code)}</span>
                  </div>
                </td>
                <td>
                  <span class="${depth === 0 ? 'font-bold text-gray-900' : 'text-gray-700'}">${esc(r.name)}</span>
                </td>
                <td><span class="text-xs text-gray-500">${esc(r.description || '—')}</span></td>
                <td><span class="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">${esc(parentName)}</span></td>
                <td>${r.active ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</td>
                <td>
                  <div class="flex gap-2">
                    ${can('canWrite') ? `<button class="btn btn-outline btn-sm" onclick="editCostCenter('${esc(r.id)}')" title="Editar"><i class="fas fa-pen"></i></button>` : ''}
                    ${can('canDelete') ? `
                      <button class="btn btn-outline btn-sm" onclick="toggleCostCenter('${esc(r.id)}', ${r.active ? 'false' : 'true'})" title="${r.active ? 'Inactivar' : 'Activar'}" style="color:#D97706;border-color:#F59E0B">
                        <i class="fas ${r.active ? 'fa-ban' : 'fa-rotate-left'}"></i>
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="deleteCostCenter('${esc(r.id)}')" title="Eliminar" style="background:#EF4444;border-color:#EF4444">
                        <i class="fas fa-trash-can"></i>
                      </button>
                    ` : ''}
                  </div>
                </td>
              </tr>`;
            }).join('') :
            '<tr><td colspan="6" class="text-center py-10" style="color:#9CA3AF">No hay centros de costo registrados.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;

    const filter = () => {
      const q = ($('#cc-q') as HTMLInputElement)?.value.toLowerCase() || '';
      const s = ($('#cc-status') as HTMLSelectElement)?.value || '';
      $$('#cc-table tbody tr').forEach((tr: HTMLElement) => {
        const trText = tr.textContent?.toLowerCase() || '';
        const active = tr.dataset.active === '1';
        
        tr.style.display = (
          (!q || trText.includes(q)) &&
          (!s || (s === 'active' ? active : !active))
        ) ? '' : 'none';
      });
    };

    $('#cc-q')?.addEventListener('input', debounce(filter, 200));
    $('#cc-status')?.addEventListener('change', filter);
    $('#btn-new-cc')?.addEventListener('click', () => openCostCenterForm());

  } catch (err: any) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function openCostCenterForm(id?: string) {
  let cc: any = null;
  if (id) {
    try {
      cc = await pb.get('cost_centers', id);
    } catch (err: any) {
      return showToast('Error al cargar registro: ' + err.message, 'error');
    }
  }

  // Cargar lista de centros de costo para el selector de padre (solo activos, y excluyendo el actual)
  let parents: any[] = [];
  try {
    parents = await pb.listAll('cost_centers', { filter: 'active=true', sort: 'code' });
    if (id) parents = parents.filter(p => p.id !== id);
  } catch (_) {}

  const title = id ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo';

  const bodyHtml = `
  <form id="cc-form" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código <span style="color:#EF4444">*</span></label>
        <input id="cc-code" class="form-input" value="${esc(cc?.code || '')}" placeholder="Ej: 100 o 100.01" style="text-transform:uppercase" required>
      </div>
      <div class="form-group">
        <label class="form-label">Nombre / Área <span style="color:#EF4444">*</span></label>
        <input id="cc-name" class="form-input" value="${esc(cc?.name || '')}" placeholder="Ej: VENTAS o LOGÍSTICA" style="text-transform:uppercase" required>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Descripción</label>
      <input id="cc-description" class="form-input" value="${esc(cc?.description || '')}" placeholder="Detalle del área...">
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Depende de (Opcional)</label>
        <select id="cc-parent-id" class="form-input">
          <option value="">-- Ninguno (Raíz) --</option>
          ${parents.map(p => `<option value="${esc(p.id)}" ${cc?.parent_id === p.id ? 'selected' : ''}>${esc(p.code)} - ${esc(p.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="cc-active" class="form-input">
          <option value="1" ${cc?.active !== false ? 'selected' : ''}>Activo</option>
          <option value="0" ${cc?.active === false ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>
    </div>
  </form>`;

  const footerHtml = `
    <button class="btn btn-outline" id="btn-cc-cancel">Cancelar</button>
    <button class="btn btn-primary" id="btn-cc-save"><i class="fas fa-check mr-1.5"></i>Guardar</button>
  `;

  openModal(title, bodyHtml, footerHtml, true);

  $('#btn-cc-cancel')?.addEventListener('click', closeModal);
  $('#btn-cc-save')?.addEventListener('click', async () => {
    const code = ($('#cc-code') as HTMLInputElement)?.value.toUpperCase().trim();
    const name = ($('#cc-name') as HTMLInputElement)?.value.toUpperCase().trim();
    const description = ($('#cc-description') as HTMLInputElement)?.value.trim();
    const parent_id = ($('#cc-parent-id') as HTMLSelectElement)?.value || null;
    const active = ($('#cc-active') as HTMLSelectElement)?.value === '1';

    if (!code || !name) {
      return showToast('Código y Nombre son obligatorios', 'warning');
    }

    try {
      const data = { code, name, description, parent_id, active };
      if (id) {
        await pb.update('cost_centers', id, data);
        await API.logAudit('UPDATE', 'Centro Costo', id, `Modificó centro de costo: ${code} - ${name}`);
        showToast('Centro de costo actualizado con éxito', 'success');
      } else {
        const created = await pb.create('cost_centers', data);
        await API.logAudit('CREATE', 'Centro Costo', created.id, `Creó centro de costo: ${code} - ${name}`);
        showToast('Centro de costo creado con éxito', 'success');
      }
      closeModal();
      renderCostCenters($('#page-content'));
    } catch (err: any) {
      showToast('Error al guardar: ' + err.message, 'error');
    }
  });
}

async function editCostCenter(id: string) {
  openCostCenterForm(id);
}

async function toggleCostCenter(id: string, active: boolean) {
  try {
    const cc = await pb.get('cost_centers', id);
    await pb.update('cost_centers', id, { active });
    await API.logAudit('STATUS', 'Centro Costo', id, `${active ? 'Activó' : 'Inactivó'} centro de costo ${cc.code}`);
    showToast('Estado actualizado', 'success');
    renderCostCenters($('#page-content'));
  } catch (err: any) {
    showToast('Error al actualizar estado: ' + err.message, 'error');
  }
}

async function deleteCostCenter(id: string) {
  confirmDialog(
    'Eliminar Centro de Costo',
    '¿Estás seguro de que deseas eliminar permanentemente este centro de costo? Esta acción no se puede deshacer.',
    async () => {
      try {
        const cc = await pb.get('cost_centers', id);
        // Verificar si está usado en transacciones
        const lines = await pb.list('tx_lines', { filter: `cost_center_id="${id}"`, perPage: 1 });
        if (lines.items.length > 0) {
          return showToast('No se puede eliminar el centro de costo porque tiene transacciones asociadas. En su lugar, inactivelo.', 'error');
        }

        await pb.delete('cost_centers', id);
        await API.logAudit('DELETE', 'Centro Costo', id, `Eliminó centro de costo: ${cc.code}`);
        showToast('Centro de costo eliminado con éxito', 'success');
        renderCostCenters($('#page-content'));
      } catch (err: any) {
        showToast('Error al eliminar: ' + err.message, 'error');
      }
    }
  );
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderCostCenters = renderCostCenters;
(window as any).editCostCenter = editCostCenter;
(window as any).toggleCostCenter = toggleCostCenter;
(window as any).deleteCostCenter = deleteCostCenter;
