/**
 * ContaCO v2.0 — tipos-tx.js
 */
'use strict';

async function renderTiposTx(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando tipos de transacción...</div>`;
  try {
    const rows = await pb.listAll('transaction_types', { sort: 'code,prefix' });

    // Agrupar por code
    const groups = new Map();
    for (const r of rows) {
      if (!groups.has(r.code)) groups.set(r.code, []);
      groups.get(r.code).push(r);
    }

    // Construir filas de la tabla agrupadas
    let tableRows = '';
    for (const [code, series] of groups) {
      const multiSerie = series.length > 1;
      series.forEach((r, idx) => {
        tableRows += `
          <tr>
            ${idx === 0
              ? `<td rowspan="${series.length}" style="vertical-align:middle;background:#F8FAFC">
                   <span class="font-bold" style="color:#1A4B8C">${esc(code)}</span>
                   ${multiSerie ? `<span class="badge ml-1" style="background:#EFF6FF;color:#1A4B8C;font-size:10px">${series.length} series</span>` : ''}
                 </td>`
              : ''}
            <td>
              <span class="font-mono text-sm font-semibold" style="color:#0D2137">${esc(r.prefix)}</span>
            </td>
            <td>${esc(r.name)}</td>
            <td class="text-right">${fmtN(r.consecutive || 0)}</td>
            <td>${r.active ? '<span class="badge badge-green">Activo</span>' : '<span class="badge badge-gray">Inactivo</span>'}</td>
            <td>
              <div class="flex gap-2">
                ${can('canWrite') ? `<button class="btn btn-outline btn-sm" title="Editar serie" onclick="editTxType('${esc(r.id)}')"><i class="fas fa-pen"></i></button>` : ''}
                ${can('canWrite') ? `<button class="btn btn-outline btn-sm" title="Nueva serie con mismo código" style="border-color:#1A4B8C;color:#1A4B8C" onclick="openTxTypeForm(null,'${esc(code)}')"><i class="fas fa-code-branch"></i></button>` : ''}
                ${can('canDelete') ? `<button class="btn btn-danger btn-sm" title="${r.active ? 'Inactivar' : 'Reactivar'}" onclick="toggleTxType('${esc(r.id)}', ${r.active ? 'false' : 'true'})"><i class="fas ${r.active ? 'fa-ban' : 'fa-rotate-left'}"></i></button>` : ''}
              </div>
            </td>
          </tr>`;
      });
    }

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Tipos de Transacción</h3>
          <p class="text-sm" style="color:#6B7280">Configura códigos, series/prefijos, consecutivos y resoluciones.</p>
        </div>
        ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-tx-type"><i class="fas fa-plus"></i> Nueva Serie</button>' : ''}
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 240px)">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Prefijo / Serie</th>
                <th>Nombre</th>
                <th class="text-right">Consecutivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="6" class="text-center py-10" style="color:#9CA3AF">No hay tipos configurados.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-3 p-3 rounded-xl text-xs" style="background:#EFF6FF;color:#1D4ED8">
        <i class="fas fa-info-circle mr-1"></i>
        Usa <strong><i class="fas fa-code-branch"></i> Nueva serie</strong> para agregar un nuevo prefijo al mismo código de tipo.
        El número del comprobante tendrá el formato <strong>PREFIJO-00000001</strong> (8 dígitos).
      </div>`;

    $('#btn-new-tx-type')?.addEventListener('click', () => openTxTypeForm());
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function openTxTypeForm(row = null, suggestedCode = '') {
  if (!can('canWrite')) return showToast('No tienes permisos para gestionar tipos', 'error');

  const isEdit = !!row?.id;
  const codeVal = row?.code ?? suggestedCode ?? '';
  const isCopyCode = !isEdit && !!suggestedCode;

  openModal(
    isEdit ? 'Editar Serie de Transacción' : 'Nueva Serie de Transacción',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código de tipo
          <span class="text-xs ml-1" style="color:#6B7280">(agrupa series del mismo tipo, ej: FV)</span>
        </label>
        <input id="tt-code" class="form-input" value="${esc(codeVal)}" ${isEdit ? 'readonly style="background:#F9FAFB"' : ''}
               placeholder="Ej: FV, EG, RC...">
      </div>
      <div class="form-group">
        <label class="form-label">Prefijo / Serie
          <span class="text-xs ml-1" style="color:#6B7280">(aparece en el número, ej: SETT, FV)</span>
        </label>
        <input id="tt-prefix" class="form-input" value="${esc(row?.prefix || '')}"
               placeholder="Ej: SETT, FV, EG...">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Nombre</label>
        <input id="tt-name" class="form-input" value="${esc(row?.name || '')}"
               placeholder="Ej: Factura de Venta — Resolución 18764">
      </div>
      <div class="form-group md:col-span-2">
        <label class="form-label">Descripción</label>
        <textarea id="tt-desc" class="form-input" rows="2">${esc(row?.description || '')}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Consecutivo actual</label>
        <input id="tt-consec" type="number" min="0" class="form-input" value="${esc(row?.consecutive ?? 0)}">
      </div>
      <div class="form-group">
        <label class="form-label">Estado</label>
        <select id="tt-active" class="form-input">
          <option value="1" ${row?.active !== false ? 'selected' : ''}>Activo</option>
          <option value="0" ${row?.active === false ? 'selected' : ''}>Inactivo</option>
        </select>
      </div>
    </div>
    ${isCopyCode ? `<p class="text-xs mt-3" style="color:#1D4ED8"><i class="fas fa-info-circle mr-1"></i>Estás creando una nueva serie para el código <strong>${esc(suggestedCode)}</strong>. El prefijo debe ser diferente al de las series existentes.</p>` : ''}`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-tt"><i class="fas fa-floppy-disk"></i> Guardar</button>`
  );

  $('#btn-save-tt')?.addEventListener('click', async () => {
    const payload = {
      code:        (getInputVal('tt-code') || '').trim().toUpperCase(),
      prefix:      (getInputVal('tt-prefix') || '').trim().toUpperCase(),
      name:        getInputVal('tt-name'),
      description: getInputVal('tt-desc'),
      consecutive: Number(getInputVal('tt-consec') || 0),
      active:      getSelectVal('tt-active') === '1',
    };
    if (!payload.code || !payload.prefix || !payload.name)
      return showToast('Código, prefijo y nombre son obligatorios', 'warning');
    try {
      if (isEdit) {
        await pb.update('transaction_types', row.id, payload);
      } else {
        await pb.create('transaction_types', payload);
      }
      closeModal();
      showToast('Serie guardada correctamente', 'success');
      renderTiposTx($('#page-content'));
    } catch (err) {
      // Error de duplicado: mensaje claro
      if (err.message?.toLowerCase().includes('unique') || err.status === 400) {
        showToast(`Ya existe una serie con código "${payload.code}" y prefijo "${payload.prefix}"`, 'error');
      } else {
        showToast(err.message, 'error');
      }
    }
  });
}

async function editTxType(id) {
  try { openTxTypeForm(await pb.get('transaction_types', id)); }
  catch (err) { showToast(err.message, 'error'); }
}

function toggleTxType(id, active) {
  if (!can('canDelete')) return showToast('No tienes permisos para cambiar estado', 'error');
  const activeB = active === true || active === 'true';
  confirmDialog(
    activeB ? 'Reactivar serie' : 'Inactivar serie',
    activeB ? '¿Deseas reactivar esta serie de transacción?' : '¿Deseas inactivar esta serie de transacción?',
    async () => {
      try {
        await pb.update('transaction_types', id, { active: activeB });
        showToast('Estado actualizado', 'success');
        renderTiposTx($('#page-content'));
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}
