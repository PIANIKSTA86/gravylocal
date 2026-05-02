/**
 * ContaCO v2.0 — terceros.js
 */
'use strict';

async function renderTerceros(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando terceros...</div>`;
  try {
    const rows = await pb.listAll('third_parties', { sort: 'name' });
    c.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h3 class="text-lg font-bold" style="color:#0D2137">Terceros</h3>
        <p class="text-sm" style="color:#6B7280">Clientes, proveedores, empleados y otros.</p>
      </div>
      ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-tp"><i class="fas fa-user-plus"></i> Nuevo Tercero</button>' : ''}
    </div>

    <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input id="tp-q" class="form-input" placeholder="Buscar por nombre, documento o correo...">
        <select id="tp-type" class="form-input">
          <option value="">Todos los tipos</option>
          ${TP_TYPES.map(t => `<option value="${esc(t.code)}">${esc(t.name)}</option>`).join('')}
        </select>
        <select id="tp-status" class="form-input">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
      <div class="overflow-x-auto" style="max-height: calc(100vh - 290px)">
        <table class="data-table" id="tp-table">
          <thead><tr><th>Tipo</th><th>Documento</th><th>Nombre</th><th>Correo</th><th>Ciudad</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${rows.length ? rows.map(r => `
              <tr data-type="${esc(r.type)}">
                <td>${esc(r.type)}</td>
                <td><span class="font-semibold">${esc(r.doc_type)} ${esc(r.doc_number)}</span></td>
                <td>${esc(r.name)}</td>
                <td>${esc(r.email || '?')}</td>
                <td>${esc(r.city || '?')}</td>
                <td>${r.active ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</td>
                <td>
                  <div class="flex gap-2">
                    ${can('canWrite') ? `<button class="btn btn-outline btn-sm" onclick="editTercero('${esc(r.id)}')"><i class="fas fa-pen"></i></button>` : ''}
                    ${can('canDelete') ? `<button class="btn btn-danger btn-sm" onclick="toggleTercero('${esc(r.id)}', ${r.active ? 'false' : 'true'})"><i class="fas ${r.active ? 'fa-ban' : 'fa-rotate-left'}"></i></button>` : ''}
                  </div>
                </td>
              </tr>`).join('') :
              '<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay terceros registrados.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;

    const filter = () => {
      const q = getInputVal('tp-q').toLowerCase();
      const t = getSelectVal('tp-type');
      const s = getSelectVal('tp-status');
      $$('#tp-table tbody tr').forEach(tr => {
        const text = tr.textContent.toLowerCase();
        const type = tr.dataset.type || '';
        const active = tr.children[5]?.textContent.includes('Activo');
        const okQ = !q || text.includes(q);
        const okT = !t || type === t;
        const okS = !s || (s === 'active' ? active : !active);
        tr.style.display = okQ && okT && okS ? '' : 'none';
      });
    };
    $('#tp-q')?.addEventListener('input', debounce(filter, 200));
    $('#tp-type')?.addEventListener('change', filter);
    $('#tp-status')?.addEventListener('change', filter);
    $('#btn-new-tp')?.addEventListener('click', () => openTerceroForm());
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function terceroFormHtml(row) {
  return `
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="form-group"><label class="form-label">Tipo</label><select id="tpf-type" class="form-input">${TP_TYPES.map(t => `<option value="${esc(t.code)}" ${row?.type === t.code ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Tipo Documento</label><select id="tpf-doc-type" class="form-input">${DOC_TYPES.map(d => `<option value="${esc(d.code)}" ${row?.doc_type === d.code ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Número Documento</label><input id="tpf-doc-number" class="form-input" value="${esc(row?.doc_number || '')}"></div>
    <div class="form-group"><label class="form-label">DV</label><input id="tpf-dv" class="form-input" value="${esc(row?.dv || '')}"></div>
    <div class="form-group md:col-span-2"><label class="form-label">Nombre</label><input id="tpf-name" class="form-input" value="${esc(row?.name || '')}"></div>
    <div class="form-group"><label class="form-label">Correo</label><input id="tpf-email" type="email" class="form-input" value="${esc(row?.email || '')}"></div>
    <div class="form-group"><label class="form-label">Teléfono</label><input id="tpf-phone" class="form-input" value="${esc(row?.phone || '')}"></div>
    <div class="form-group"><label class="form-label">Dirección</label><input id="tpf-address" class="form-input" value="${esc(row?.address || '')}"></div>
    <div class="form-group"><label class="form-label">Ciudad</label><input id="tpf-city" class="form-input" value="${esc(row?.city || '')}"></div>
    <div class="form-group"><label class="form-label">Departamento</label><input id="tpf-department" class="form-input" value="${esc(row?.department || '')}"></div>
    <div class="form-group"><label class="form-label">Régimen Tributario</label><select id="tpf-tax" class="form-input"><option value="">Sin especificar</option>${TAX_REGIMES.map(t => `<option value="${esc(t.code)}" ${row?.tax_regime === t.code ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Estado</label><select id="tpf-active" class="form-input"><option value="1" ${row?.active !== false ? 'selected' : ''}>Activo</option><option value="0" ${row?.active === false ? 'selected' : ''}>Inactivo</option></select></div>
  </div>`;
}

function terceroPayload() {
  return {
    type: getSelectVal('tpf-type'),
    doc_type: getSelectVal('tpf-doc-type'),
    doc_number: getInputVal('tpf-doc-number'),
    dv: getInputVal('tpf-dv'),
    name: getInputVal('tpf-name'),
    email: getInputVal('tpf-email'),
    phone: getInputVal('tpf-phone'),
    address: getInputVal('tpf-address'),
    city: getInputVal('tpf-city'),
    department: getInputVal('tpf-department'),
    tax_regime: getSelectVal('tpf-tax'),
    active: getSelectVal('tpf-active') === '1',
  };
}

function openTerceroForm(row = null) {
  if (!can('canWrite')) return showToast('No tienes permisos para gestionar terceros', 'error');
  openModal(
    row ? 'Editar Tercero' : 'Nuevo Tercero',
    terceroFormHtml(row),
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-tp"><i class="fas fa-floppy-disk"></i> Guardar</button>`,
    true
  );
  $('#btn-save-tp')?.addEventListener('click', async () => {
    const payload = terceroPayload();
    if (!payload.name || !payload.doc_number || !payload.doc_type) return showToast('Nombre y documento son obligatorios', 'warning');
    try {
      if (row?.id) {
        await pb.update('third_parties', row.id, payload);
        await API.logAudit('UPDATE', 'Tercero', row.id, `${payload.doc_type} ${payload.doc_number} - ${payload.name}`);
      } else {
        const created = await pb.create('third_parties', payload);
        await API.logAudit('CREATE', 'Tercero', created.id, `${payload.doc_type} ${payload.doc_number} - ${payload.name}`);
      }
      closeModal();
      showToast('Tercero guardado correctamente', 'success');
      renderTerceros($('#page-content'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function editTercero(id) {
  try { openTerceroForm(await pb.get('third_parties', id)); }
  catch (err) { showToast(err.message, 'error'); }
}

function toggleTercero(id, active) {
  if (!can('canDelete')) return showToast('No tienes permisos para cambiar estado', 'error');
  confirmDialog(
    active ? 'Reactivar tercero' : 'Inactivar tercero',
    active ? '¿Deseas reactivar este tercero?' : '¿Deseas inactivar este tercero?',
    async () => {
      try {
        await pb.update('third_parties', id, { active });
        const updated = await pb.get('third_parties', id);
        await API.logAudit('STATUS', 'Tercero', id, `${updated.doc_type} ${updated.doc_number} - ${updated.name} => ${active ? 'Activo' : 'Inactivo'}`);
        showToast('Estado actualizado', 'success');
        renderTerceros($('#page-content'));
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}
