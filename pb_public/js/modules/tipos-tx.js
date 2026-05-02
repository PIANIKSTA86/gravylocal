/**
 * ContaCO v2.0 — tipos-tx.js
 */
'use strict';

async function renderTiposTx(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando tipos de transacción...</div>`;
  try {
    const rows = await pb.listAll('transaction_types', { sort: 'code' });
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Tipos de Transacción</h3>
          <p class="text-sm" style="color:#6B7280">Configura prefijos, nombre, consecutivo y estado.</p>
        </div>
        ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-tx-type"><i class="fas fa-plus"></i> Nuevo Tipo</button>' : ''}
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 240px)">
          <table class="data-table">
             <thead><tr><th>Código</th><th>Prefijo</th><th>Nombre</th><th>Consecutivo</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${rows.length ? rows.map(r => `
                <tr>
                  <td><span class="font-semibold" style="color:#1A4B8C">${esc(r.code)}</span></td>
                  <td>${esc(r.prefix)}</td>
                  <td>${esc(r.name)}</td>
                  <td>${fmtN(r.consecutive || 0)}</td>
                  <td>${r.active ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</td>
                  <td>
                    <div class="flex gap-2">
                      ${can('canWrite') ? `<button class="btn btn-outline btn-sm" onclick="editTxType('${esc(r.id)}')"><i class="fas fa-pen"></i></button>` : ''}
                      ${can('canDelete') ? `<button class="btn btn-danger btn-sm" onclick="toggleTxType('${esc(r.id)}', ${r.active ? 'false' : 'true'})"><i class="fas ${r.active ? 'fa-ban' : 'fa-rotate-left'}"></i></button>` : ''}
                    </div>
                  </td>
                </tr>`).join('') : '<tr><td colspan="6" class="text-center py-10" style="color:#9CA3AF">No hay tipos configurados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;

    $('#btn-new-tx-type')?.addEventListener('click', () => openTxTypeForm());
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function openTxTypeForm(row = null) {
  if (!can('canWrite')) return showToast('No tienes permisos para gestionar tipos', 'error');
  openModal(
    row ? 'Editar Tipo de Transacción' : 'Nuevo Tipo de Transacción',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Código</label><input id="tt-code" class="form-input" value="${esc(row?.code || '')}"></div>
      <div class="form-group"><label class="form-label">Prefijo</label><input id="tt-prefix" class="form-input" value="${esc(row?.prefix || '')}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Nombre</label><input id="tt-name" class="form-input" value="${esc(row?.name || '')}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Descripción</label><textarea id="tt-desc" class="form-input" rows="3">${esc(row?.description || '')}</textarea></div>
      <div class="form-group"><label class="form-label">Consecutivo</label><input id="tt-consec" type="number" min="0" class="form-input" value="${esc(row?.consecutive ?? 0)}"></div>
      <div class="form-group"><label class="form-label">Estado</label><select id="tt-active" class="form-input"><option value="1" ${row?.active !== false ? 'selected' : ''}>Activo</option><option value="0" ${row?.active === false ? 'selected' : ''}>Inactivo</option></select></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-tt"><i class="fas fa-floppy-disk"></i> Guardar</button>`
  );

  $('#btn-save-tt')?.addEventListener('click', async () => {
    const payload = {
      code: getInputVal('tt-code'),
      prefix: getInputVal('tt-prefix'),
      name: getInputVal('tt-name'),
      description: getInputVal('tt-desc'),
      consecutive: Number(getInputVal('tt-consec') || 0),
      active: getSelectVal('tt-active') === '1',
    };
    if (!payload.code || !payload.prefix || !payload.name) return showToast('Código, prefijo y nombre son obligatorios', 'warning');
    try {
      if (row?.id) {
        await pb.update('transaction_types', row.id, payload);
      } else {
        const created = await pb.create('transaction_types', payload);
      }
      closeModal();
      showToast('Tipo guardado correctamente', 'success');
      renderTiposTx($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function editTxType(id) {
  try { openTxTypeForm(await pb.get('transaction_types', id)); }
  catch (err) { showToast(err.message, 'error'); }
}

function toggleTxType(id, active) {
  if (!can('canDelete')) return showToast('No tienes permisos para cambiar estado', 'error');
  confirmDialog(
    active ? 'Reactivar tipo' : 'Inactivar tipo',
    active ? '¿Deseas reactivar este tipo de transacción?' : '¿Deseas inactivar este tipo de transacción?',
    async () => {
      try {
        await pb.update('transaction_types', id, { active });
        showToast('Estado actualizado', 'success');
        renderTiposTx($('#page-content'));
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}
