/**
 * GRAVY v2.0 — auditoria.js
 */
'use strict';

let AUDIT_STATE = { page: 1, perPage: 100, total: 0 };

function fmtAuditDateTime(value) {
  if (!value) return '—';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function getAuditDateValue(log) {
  return log?.event_at || log?.created || '';
}

async function renderAuditoria(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando auditoría...</div>`;
  try {
    // Load first batch to populate action/entity dropdowns
    const sample = await pb.list('audit_log', { page: 1, perPage: 100, sort: '-event_at' });
    const actions = [...new Set(sample.items.map(l => l.action).filter(Boolean))].sort();
    const entities = [...new Set(sample.items.map(l => l.entity).filter(Boolean))].sort();

    AUDIT_STATE = { page: 1, perPage: 100, total: 0 };

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Auditoría del Sistema</h3>
          <p class="text-sm" style="color:#6B7280">Trazabilidad completa de acciones de usuarios.</p>
        </div>
        ${can('canExport') ? '<button class="btn btn-outline" id="btn-export-audit"><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input id="audit-q" class="form-input col-span-2 md:col-span-2" placeholder="Buscar usuario, detalle, ID...">
          <select id="audit-action" class="form-input">
            <option value="">Todas las acciones</option>
            ${actions.map(a => `<option value="${esc(a)}">${esc(a)}</option>`).join('')}
          </select>
          <select id="audit-entity" class="form-input">
            <option value="">Todas las entidades</option>
            ${entities.map(e => `<option value="${esc(e)}">${esc(e)}</option>`).join('')}
          </select>
          <select id="audit-user-filter" class="form-input">
            <option value="">Todos los usuarios</option>
            ${[...new Set(sample.items.map(l => l.username).filter(Boolean))].sort().map(u => `<option value="${esc(u)}">${esc(u)}</option>`).join('')}
          </select>
        </div>
        <div class="flex gap-3 mt-3 flex-wrap">
          <div class="flex gap-2 items-center">
            <span class="text-sm" style="color:#6B7280">Desde:</span>
            <input id="audit-from" type="date" class="form-input" style="max-width:170px">
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-sm" style="color:#6B7280">Hasta:</span>
            <input id="audit-to" type="date" class="form-input" style="max-width:170px">
          </div>
          <button class="btn btn-primary btn-sm" id="btn-audit-search"><i class="fas fa-search"></i> Buscar</button>
          <button class="btn btn-outline btn-sm" id="btn-audit-clear"><i class="fas fa-eraser"></i> Limpiar</button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div id="audit-results">
          <div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-search mr-2"></i>Aplica filtros y pulsa Buscar</div>
        </div>
        <div id="audit-pagination" class="flex items-center justify-between px-4 py-3 border-t" style="border-color:#F0F0F0; display:none!important"></div>
      </div>`;

    const doSearch = () => { AUDIT_STATE.page = 1; loadAuditPage(); };
    $('#btn-audit-search')?.addEventListener('click', doSearch);
    $('#audit-q')?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    $('#btn-audit-clear')?.addEventListener('click', () => {
      ['audit-q','audit-from','audit-to'].forEach(id => setInputVal(id, ''));
      ['audit-action','audit-entity','audit-user-filter'].forEach(id => { const el = $(`#${id}`); if (el) el.value = ''; });
      $('#audit-results').innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-search mr-2"></i>Aplica filtros y pulsa Buscar</div>';
      $('#audit-pagination').style.display = 'none';
    });
    $('#btn-export-audit')?.addEventListener('click', exportAuditLog);

    // Auto-load
    doSearch();
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function loadAuditPage() {
  const resultsDiv = $('#audit-results');
  const paginDiv = $('#audit-pagination');
  if (!resultsDiv) return;

  resultsDiv.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';

  try {
    const q = getInputVal('audit-q').trim();
    const action = getSelectVal('audit-action');
    const entity = getSelectVal('audit-entity');
    const userF = getSelectVal('audit-user-filter');
    const dateFrom = getInputVal('audit-from');
    const dateTo = getInputVal('audit-to');

    const filters = [];
    if (action) {
      const safe = pb.escapeFilterValue(action);
      filters.push(`action="${safe}"`);
    }
    if (entity) {
      const safe = pb.escapeFilterValue(entity);
      filters.push(`entity="${safe}"`);
    }
    if (userF) {
      const safe = pb.escapeFilterValue(userF);
      filters.push(`username="${safe}"`);
    }
    if (dateFrom) filters.push(`event_at>="${dateFrom} 00:00:00"`);
    if (dateTo) filters.push(`event_at<="${dateTo} 23:59:59"`);
    if (q) {
      const safe = pb.escapeFilterValue(q);
      filters.push(`(username~"${safe}" || details~"${safe}" || entity_id~"${safe}")`);
    }

    const request = {
      page: AUDIT_STATE.page,
      perPage: AUDIT_STATE.perPage,
      sort: '-event_at',
      filter: filters.join(' && ') || '',
    };

    let res;
    try {
      res = await pb.list('audit_log', request);
    } catch (firstErr) {
      const fallbackFilter = filters
        .filter(f => !f.startsWith('event_at>="') && !f.startsWith('event_at<="'))
        .join(' && ');

      res = await pb.list('audit_log', {
        page: AUDIT_STATE.page,
        perPage: AUDIT_STATE.perPage,
        sort: '-id',
        filter: fallbackFilter || '',
      });

      if (dateFrom || dateTo) {
        showToast('Se omitió filtro por fecha en Auditoría.', 'warning');
      }
      void firstErr;
    }
    AUDIT_STATE.total = res.totalItems;
    const totalPages = Math.ceil(res.totalItems / AUDIT_STATE.perPage) || 1;

    const actionBadgeColor = a => {
      if (!a) return 'badge-blue';
      const m = { CREATE: 'badge-green', UPDATE: 'badge-blue', DELETE: 'badge-red', STATUS: 'badge-orange', VOID: 'badge-red', LOGIN: 'badge-blue', LOGOUT: 'badge-blue' };
      return m[a.toUpperCase()] || 'badge-blue';
    };

    if (!res.items.length) {
      resultsDiv.innerHTML = '<div class="p-10 text-center" style="color:#9CA3AF">No hay registros para los filtros aplicados.</div>';
      paginDiv.style.display = 'none';
      return;
    }

    resultsDiv.innerHTML = `
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>Fecha y Hora</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>ID Entidad</th><th>Detalle</th><th></th></tr></thead>
          <tbody>
            ${res.items.map(l => `
              <tr>
                <td class="whitespace-nowrap text-xs">${esc(fmtAuditDateTime(getAuditDateValue(l)))}</td>
                <td class="font-medium text-sm">${esc(l.username || '—')}</td>
                <td><span class="badge ${actionBadgeColor(l.action)}">${esc(l.action || '—')}</span></td>
                <td class="text-sm">${esc(l.entity || '—')}</td>
                <td class="font-mono text-xs max-w-xs truncate" title="${esc(l.entity_id || '')}">${esc((l.entity_id || '—').slice(0,12))}${l.entity_id?.length > 12 ? '…' : ''}</td>
                <td class="text-sm max-w-xs truncate" title="${esc(l.details || '')}">${esc(l.details || '—')}</td>
                <td><button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewAuditDetail(${JSON.stringify(JSON.stringify(l))})"><i class="fas fa-eye"></i></button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    paginDiv.style.display = 'flex';
    paginDiv.innerHTML = `
      <span class="text-sm" style="color:#6B7280">
        Mostrando ${(AUDIT_STATE.page - 1) * AUDIT_STATE.perPage + 1}–${Math.min(AUDIT_STATE.page * AUDIT_STATE.perPage, AUDIT_STATE.total)} de ${AUDIT_STATE.total} registros
      </span>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" id="audit-prev" ${AUDIT_STATE.page <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Ant.</button>
        <span class="text-sm font-medium px-2 flex items-center">Pág. ${AUDIT_STATE.page} / ${totalPages}</span>
        <button class="btn btn-outline btn-sm" id="audit-next" ${AUDIT_STATE.page >= totalPages ? 'disabled' : ''}>Sig. <i class="fas fa-chevron-right"></i></button>
      </div>`;
    $('#audit-prev')?.addEventListener('click', () => { AUDIT_STATE.page--; loadAuditPage(); });
    $('#audit-next')?.addEventListener('click', () => { AUDIT_STATE.page++; loadAuditPage(); });
  } catch (err) {
    resultsDiv.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function viewAuditDetail(jsonStr) {
  try {
    const l = JSON.parse(jsonStr);
    openModal(
      'Detalle de Registro de Auditoría',
      `<div class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-3">
          <div><span class="form-label">Fecha y Hora</span><p class="font-medium">${esc(fmtAuditDateTime(getAuditDateValue(l)))}</p></div>
          <div><span class="form-label">Usuario</span><p class="font-medium">${esc(l.username || '—')}</p></div>
          <div><span class="form-label">Acción</span><p><span class="badge badge-blue">${esc(l.action || '—')}</span></p></div>
          <div><span class="form-label">Entidad</span><p class="font-medium">${esc(l.entity || '—')}</p></div>
          <div class="col-span-2"><span class="form-label">ID de Entidad</span><p class="font-mono text-xs break-all">${esc(l.entity_id || '—')}</p></div>
          <div class="col-span-2"><span class="form-label">Detalle</span><p class="mt-1 p-3 rounded-lg text-sm break-words" style="background:#F9FAFB;border:1px solid #E5E7EB">${esc(l.details || '—')}</p></div>
          <div class="col-span-2"><span class="form-label">ID Registro Auditoría</span><p class="font-mono text-xs break-all" style="color:#9CA3AF">${esc(l.id || '—')}</p></div>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );
  } catch { showToast('No se pudo cargar el detalle', 'error'); }
}

async function exportAuditLog() {
  if (!can('canExport')) return showToast('Sin permisos de exportación', 'error');
  try {
    showToast('Generando exportación completa...', 'info');
    const q = getInputVal('audit-q').trim();
    const action = getSelectVal('audit-action');
    const entity = getSelectVal('audit-entity');
    const userF = getSelectVal('audit-user-filter');
    const dateFrom = getInputVal('audit-from');
    const dateTo = getInputVal('audit-to');
    const filters = [];
    if (action) {
      const safe = pb.escapeFilterValue(action);
      filters.push(`action="${safe}"`);
    }
    if (entity) {
      const safe = pb.escapeFilterValue(entity);
      filters.push(`entity="${safe}"`);
    }
    if (userF) {
      const safe = pb.escapeFilterValue(userF);
      filters.push(`username="${safe}"`);
    }
    if (dateFrom) filters.push(`event_at>="${dateFrom} 00:00:00"`);
    if (dateTo) filters.push(`event_at<="${dateTo} 23:59:59"`);
    if (q) {
      const safe = pb.escapeFilterValue(q);
      filters.push(`(username~"${safe}" || details~"${safe}" || entity_id~"${safe}")`);
    }
    let all;
    try {
      all = await pb.listAll('audit_log', { sort: '-event_at', filter: filters.join(' && ') || '' });
    } catch (firstErr) {
      const fallbackFilter = filters
        .filter(f => !f.startsWith('event_at>="') && !f.startsWith('event_at<="'))
        .join(' && ');
      all = await pb.listAll('audit_log', { sort: '-id', filter: fallbackFilter || '' });
      if (dateFrom || dateTo) {
        showToast('Exportación sin filtro de fecha en Auditoría.', 'warning');
      }
      void firstErr;
    }
    exportToExcel(
      all.map(l => ({
        'Fecha y Hora': fmtAuditDateTime(getAuditDateValue(l)),
        'Usuario': l.username || '',
        'Acción': l.action || '',
        'Entidad': l.entity || '',
        'ID Entidad': l.entity_id || '',
        'Detalle': l.details || '',
      })),
      `auditoria_${todayStr()}`
    );
  } catch (err) { showToast(err.message, 'error'); }
}
