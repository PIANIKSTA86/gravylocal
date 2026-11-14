/**
 * GRAVY v2.0 — auditoria.js
 */
'use strict';

let AUDIT_STATE: { page: number, perPage: number, total: number, items: any[] } = { page: 1, perPage: 100, total: 0, items: [] };

const AUDIT_ACTION_MAP: Record<string, string> = {
  'CREATE': 'Creación',
  'UPDATE': 'Actualización',
  'DELETE': 'Eliminación',
  'STATUS': 'Cambio de Estado',
  'VOID': 'Anulación',
  'LOGIN': 'Inicio de Sesión',
  'LOGOUT': 'Cierre de Sesión',
  'APPROVE': 'Aprobación',
  'POST': 'Contabilización',
  'REVERT_DRAFT': 'Revertido a Borrador',
  'IMPORT': 'Importación',
  'BACKUP_CREATED': 'Copia de Seguridad',
  'CONFIG': 'Configuración',
  'MOVE_STAGE': 'Movimiento de Etapa',
  'CANCEL': 'Cancelación',
  'COST_CORRECTION': 'Corrección de Costos'
};

const AUDIT_ENTITY_MAP: Record<string, string> = {
  'accounts': 'Cuenta Contable',
  'Cuenta': 'Cuenta Contable',
  'third_parties': 'Tercero',
  'Tercero': 'Tercero',
  'transaction_types': 'Tipo Transacción',
  'Tipo Tx': 'Tipo Transacción',
  'transactions': 'Transacción',
  'Transaccion': 'Transacción',
  'tx_lines': 'Línea Transacción',
  'Linea Tx': 'Línea Transacción',
  'bank_accounts': 'Cuenta Bancaria',
  'bank_movements': 'Movimiento Bancario',
  'payroll_periods': 'Periodo Nómina',
  'payroll_lines': 'Línea Nómina',
  'einvoice_docs': 'Documento Electrónico DIAN',
  'DIAN Doc': 'Documento Electrónico DIAN',
  'inventory_movements': 'Movimiento de Inventario',
  'InventoryMovement': 'Movimiento de Inventario',
  'warehouses': 'Bodega',
  'Bodega': 'Bodega',
  'logistica_vehicles': 'Vehículo Flota',
  'logistica_deliveries': 'Entrega/Despacho',
  'crm_deals': 'Oportunidad CRM',
  'crm_interactions': 'Interacción CRM',
  'ph_properties': 'Unidad/Inmueble PH',
  'PhProperty': 'Unidad/Inmueble PH',
  'ph_pqrs': 'PQR Copropiedad',
  'PhPqr': 'PQR Copropiedad',
  'purchase_invoices': 'Factura de Compra',
  'PurchaseInvoice': 'Factura de Compra',
  'invoices': 'Factura de Venta',
  'Invoice': 'Factura de Venta',
  'sales_orders': 'Pedido de Venta',
  'SalesOrder': 'Pedido de Venta',
  'sales_order_lines': 'Línea Pedido de Venta',
  'SalesReservation': 'Reserva de Importación',
  'products': 'Producto / Servicio',
  'Producto': 'Producto / Servicio',
  'users': 'Usuario del Sistema',
  'sistema': 'Sistema / Acceso',
  'SalesConfig': 'Configuración de Ventas',
  'PurchaseConfig': 'Configuración de Compras',
  'POSConfig': 'Configuración POS',
  'POSPromotions': 'Promociones POS',
  'pos_shifts': 'Turno / Caja POS',
  'CommissionSettings': 'Configuración de Comisiones',
  'ConsignmentSettlement': 'Liquidación de Consignación',
  'Asset': 'Activo Fijo NIIF',
  'Asset Category': 'Categoría Activo NIIF',
  'Asset Transfer': 'Traslado Activo NIIF',
  'Asset Improvement': 'Mejora Activo NIIF',
  'Impairment adjustment': 'Deterioro Activo NIIF',
  'Asset Disposal': 'Baja de Activo NIIF',
  'Depreciation Run': 'Depreciación NIIF'
};

function translateAuditAction(action: string): string {
  if (!action) return '—';
  return AUDIT_ACTION_MAP[action.toUpperCase()] || action;
}

function translateAuditEntity(entity: string): string {
  if (!entity) return '—';
  return AUDIT_ENTITY_MAP[entity] || entity;
}

function translateAuditDetails(details: string): string {
  if (!details) return '—';
  const translateFn = (window as any).translateText || ((t: string) => t);
  return translateFn(details);
}

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
    // Cargar muestra de auditoría y catálogo completo de usuarios
    const [sample, usersList] = await Promise.all([
      pb.list('audit_log', { page: 1, perPage: 100, sort: '-event_at' }).catch(() => ({ items: [], totalItems: 0 })),
      pb.listAll('users').catch(() => [])
    ]);

    // Recolectar lista completa de usuarios
    const userNamesSet = new Set<string>();
    (usersList || []).forEach((u: any) => {
      if (u.email) userNamesSet.add(u.email);
      if (u.username) userNamesSet.add(u.username);
    });
    (sample.items || []).forEach((l: any) => {
      if (l.username) userNamesSet.add(l.username);
    });
    const allUsers = [...userNamesSet].sort();

    // Recolectar acciones y entidades conocidas
    const defaultActions = Object.keys(AUDIT_ACTION_MAP);
    const dynamicActions = (sample.items || []).map(l => l.action).filter(Boolean);
    const actions = [...new Set([...defaultActions, ...dynamicActions])].sort();

    const defaultEntities = ['sistema', 'transactions', 'Invoice', 'PurchaseInvoice', 'users', 'products', 'third_parties', 'accounts', 'inventory_movements', 'pos_shifts', 'payroll_periods'];
    const dynamicEntities = (sample.items || []).map(l => l.entity).filter(Boolean);
    const entities = [...new Set([...defaultEntities, ...dynamicEntities])].sort();

    AUDIT_STATE = { page: 1, perPage: 100, total: 0, items: [] };

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Auditoría del Sistema</h3>
          <p class="text-sm" style="color:#6B7280">Trazabilidad completa de acciones, inicios de sesión y movimientos contables.</p>
        </div>
        ${can('canExport') ? '<button class="btn btn-outline" id="btn-export-audit"><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input id="audit-q" class="form-input col-span-2 md:col-span-2" placeholder="Buscar usuario, detalle, ID...">
          <select id="audit-action" class="form-input">
            <option value="">Todas las acciones</option>
            ${actions.map(a => `<option value="${esc(a)}">${esc(translateAuditAction(a))}</option>`).join('')}
          </select>
          <select id="audit-entity" class="form-input">
            <option value="">Todas las entidades</option>
            ${entities.map(e => `<option value="${esc(e)}">${esc(translateAuditEntity(e))}</option>`).join('')}
          </select>
          <select id="audit-user-filter" class="form-input">
            <option value="">Todos los usuarios</option>
            ${allUsers.map(u => `<option value="${esc(u)}">${esc(u)}</option>`).join('')}
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
        <div id="audit-pagination" class="flex items-center justify-between px-4 py-3 border-t" style="border-color:#F0F0F0; display:none"></div>
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
    AUDIT_STATE.items = res.items;
    const totalPages = Math.ceil(res.totalItems / AUDIT_STATE.perPage) || 1;

    const actionBadgeColor = a => {
      if (!a) return 'badge-blue';
      const m = { CREATE: 'badge-green', UPDATE: 'badge-blue', DELETE: 'badge-red', STATUS: 'badge-orange', VOID: 'badge-red', LOGIN: 'badge-blue', LOGOUT: 'badge-orange' };
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
          <thead><tr><th>Fecha y Hora</th><th>Usuario</th><th>Acción</th><th>Entidad</th><th>Documento / ID</th><th>Detalle</th><th></th></tr></thead>
          <tbody>
            ${res.items.map((l, idx) => `
              <tr>
                <td class="whitespace-nowrap text-xs">${esc(fmtAuditDateTime(getAuditDateValue(l)))}</td>
                <td class="font-medium text-sm">${esc(l.username || '—')}</td>
                <td><span class="badge ${actionBadgeColor(l.action)}">${esc(translateAuditAction(l.action))}</span></td>
                <td class="text-sm">${esc(translateAuditEntity(l.entity))}</td>
                <td>
                  ${l.doc_number 
                    ? `<span class="inline-flex items-center font-mono text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200" title="ID: ${esc(l.entity_id || '')}"><i class="fas fa-file-lines mr-1 text-blue-500 text-[10px]"></i>${esc(l.doc_number)}</span>`
                    : `<span class="font-mono text-xs text-slate-500 max-w-xs truncate block" title="${esc(l.entity_id || '')}">${esc((l.entity_id || '—').slice(0,12))}${l.entity_id?.length > 12 ? '…' : ''}</span>`
                  }
                </td>
                <td class="text-sm max-w-xs truncate" title="${esc(translateAuditDetails(l.details))}">${esc(translateAuditDetails(l.details))}</td>
                <td><button class="btn btn-outline btn-sm" title="Ver detalle" onclick="viewAuditDetail(${idx})"><i class="fas fa-eye"></i></button></td>
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

function formatCOP(n: any): string {
  const num = Number(n || 0);
  return '$ ' + num.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function getAuditActionBadge(action: string): string {
  const act = String(action || '').toUpperCase();
  const label = esc(translateAuditAction(act));
  if (act === 'CREATE') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><i class="fas fa-plus-circle text-emerald-600"></i> ${label}</span>`;
  }
  if (act === 'UPDATE' || act === 'CONFIG' || act === 'COST_CORRECTION') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300"><i class="fas fa-pen text-blue-600"></i> ${label}</span>`;
  }
  if (act === 'DELETE' || act === 'VOID' || act === 'CANCEL') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300"><i class="fas fa-ban text-rose-600"></i> ${label}</span>`;
  }
  if (act === 'STATUS' || act === 'REVERT_DRAFT') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"><i class="fas fa-arrows-rotate text-amber-600"></i> ${label}</span>`;
  }
  if (act === 'APPROVE' || act === 'POST') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300"><i class="fas fa-check-double text-purple-600"></i> ${label}</span>`;
  }
  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300"><i class="fas fa-circle-info text-slate-500"></i> ${label}</span>`;
}

function _renderEntityNotFound(l: any, label: string): string {
  return `
    <div class="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-slate-800 space-y-2">
      <div class="flex items-center gap-2 text-amber-800 font-semibold text-sm">
        <i class="fas fa-info-circle"></i>
        <span>Registro Original No Disponible en Tablas Activas</span>
      </div>
      <p class="text-xs text-slate-600">
        El registro correspondiente a <strong>${esc(label)}</strong> (ID <code class="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">${esc(l.entity_id || '—')}</code>) fue eliminado físicamente o modificado en un periodo anterior.
      </p>
      <div class="mt-2 p-2.5 bg-white border border-amber-200 rounded-lg text-xs font-medium text-slate-700">
        <span class="text-slate-400 block text-[11px] uppercase tracking-wider font-bold mb-0.5">Detalle capturado en el evento:</span>
        ${esc(translateAuditDetails(l.details))}
      </div>
    </div>`;
}

async function resolveAndRenderAuditDetail(l: any, containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const entityRaw = String(l.entity || '').toLowerCase();
  const entityId = String(l.entity_id || '').trim();

  // 1. Si el log ya incluye datos estructurados modernos (amounts, diff, snapshot)
  if (l.amounts || l.diff || l.snapshot) {
    let structuredHtml = '';

    if (l.amounts && typeof l.amounts === 'object') {
      structuredHtml += `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <span class="text-xs font-medium text-blue-700">Total Débitos</span>
            <p class="text-lg font-bold text-blue-900 font-mono">${formatCOP(l.amounts.debit || 0)}</p>
          </div>
          <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
            <span class="text-xs font-medium text-indigo-700">Total Créditos</span>
            <p class="text-lg font-bold text-indigo-900 font-mono">${formatCOP(l.amounts.credit || 0)}</p>
          </div>
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span class="text-xs font-medium text-slate-700">Monto / Impacto</span>
            <p class="text-lg font-bold text-slate-900 font-mono">${formatCOP(l.amounts.total || l.amounts.balance || 0)}</p>
          </div>
        </div>`;
    }

    if (l.diff && typeof l.diff === 'object' && Object.keys(l.diff).length > 0) {
      const keys = Object.keys(l.diff);
      structuredHtml += `
        <div class="mb-4">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Campos Modificados (Deltas)</h4>
          <div class="border rounded-xl overflow-hidden bg-white shadow-sm">
            <table class="w-full text-xs text-left">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr><th class="p-2.5">Campo</th><th class="p-2.5">Valor Anterior</th><th class="p-2.5">Valor Nuevo</th></tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-mono">
                ${keys.map(k => {
                  const item = l.diff[k];
                  const oldVal = item && typeof item === 'object' && 'old' in item ? item.old : '—';
                  const newVal = item && typeof item === 'object' && 'new' in item ? item.new : '—';
                  return `
                    <tr>
                      <td class="p-2.5 font-sans font-medium text-slate-700">${esc(k)}</td>
                      <td class="p-2.5 text-rose-700 bg-rose-50/50 line-through">${esc(String(oldVal))}</td>
                      <td class="p-2.5 text-emerald-800 bg-emerald-50/50 font-bold">${esc(String(newVal))}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>`;
    }

    if (structuredHtml) {
      container.innerHTML = structuredHtml;
      return;
    }
  }

  // 2. Si no tiene snapshot o es un registro de BD, consultar la entidad en caliente
  if (!entityId || entityId === 'bulk' || entityId === 'null') {
    container.innerHTML = `
      <div class="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm">
        <i class="fas fa-layer-group text-slate-400 mr-2"></i>
        Este evento corresponde a un proceso global o por lotes sin un registro individual asignado.
      </div>`;
    return;
  }

  try {
    // TRANSACCIONES CONTABLES / ASIENTOS
    if (entityRaw.includes('transac') || entityRaw === 'tx_lines' || entityRaw === 'linea tx') {
      let targetTxId = entityId;
      if (entityRaw === 'tx_lines' || entityRaw === 'linea tx') {
        try {
          const lineRec = await pb.getOne('tx_lines', entityId);
          if (lineRec?.tx_id) targetTxId = lineRec.tx_id;
        } catch (_) {}
      }

      const [tx, lines] = await Promise.all([
        pb.getOne('transactions', targetTxId, { expand: 'tx_type_id,third_party_id' }).catch(() => null),
        pb.listAll('tx_lines', { filter: `tx_id="${pb.escapeFilterValue(targetTxId)}"`, expand: 'account_id,third_party_id', sort: 'line_order' }).catch(() => [])
      ]);

      if (!tx && (!lines || lines.length === 0)) {
        container.innerHTML = _renderEntityNotFound(l, 'Transacción Contable');
        return;
      }

      let sumDebit = 0;
      let sumCredit = 0;
      lines.forEach((ln: any) => {
        sumDebit += Number(ln.debit || 0);
        sumCredit += Number(ln.credit || 0);
      });
      const isSquare = Math.abs(sumDebit - sumCredit) < 0.01;
      const thirdName = tx?.expand?.third_party_id ? (tx.expand.third_party_id.legal_name || tx.expand.third_party_id.name || tx.expand.third_party_id.nit) : '—';
      const txTypeName = tx?.expand?.tx_type_id?.name || 'Comprobante';

      container.innerHTML = `
        <div class="space-y-4">
          <!-- Tarjeta de Cabecera del Documento -->
          <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">${esc(txTypeName)}</span>
                <h3 class="text-base font-extrabold text-slate-800 font-mono">N° ${esc(tx?.number || targetTxId)}</h3>
                <span class="badge ${tx?.status === 'voided' ? 'badge-red' : (tx?.status === 'draft' ? 'badge-orange' : 'badge-green')}">${tx?.status === 'voided' ? 'Anulado' : (tx?.status === 'draft' ? 'Borrador' : 'Contabilizado')}</span>
              </div>
              <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span><i class="far fa-calendar-alt mr-1 text-slate-400"></i>Fecha contable: <strong>${esc(tx?.date || '—')}</strong></span>
                <span><i class="far fa-user mr-1 text-slate-400"></i>Tercero ppal: <strong>${esc(thirdName)}</strong></span>
                ${tx?.description ? `<span class="col-span-full italic text-slate-600 block mt-0.5">"${esc(tx.description)}"</span>` : ''}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" class="btn btn-sm btn-outline text-xs" onclick="window.printTxNotaContable && window.printTxNotaContable('${tx?.id || targetTxId}')">
                <i class="fas fa-print mr-1"></i> Imprimir Nota Contable
              </button>
              <button type="button" class="btn btn-sm btn-primary text-xs" onclick="closeModal(); (window as any).navigate && (window as any).navigate('consulta-tx')">
                <i class="fas fa-search mr-1"></i> Ir a Consulta Tx
              </button>
            </div>
          </div>

          <!-- Micro-tabla Asientos Contables -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-600">
                <i class="fas fa-book-journal-whills text-blue-600 mr-1.5"></i>Asientos Contables (${lines.length} líneas)
              </h4>
              <span class="text-xs font-semibold ${isSquare ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'} px-2.5 py-0.5 rounded-full">
                ${isSquare ? '<i class="fas fa-check-circle mr-1"></i>Sumas Iguales Cuadradas' : '<i class="fas fa-triangle-exclamation mr-1"></i>Descuadre Contable'}
              </span>
            </div>

            <div class="border rounded-xl overflow-hidden bg-white shadow-sm">
              <table class="w-full text-xs text-left">
                <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th class="p-2.5 w-8 text-center">#</th>
                    <th class="p-2.5 w-28">Cuenta PUC</th>
                    <th class="p-2.5">Nombre Cuenta</th>
                    <th class="p-2.5">Tercero</th>
                    <th class="p-2.5">Detalle</th>
                    <th class="p-2.5 text-right w-28">Débito</th>
                    <th class="p-2.5 text-right w-28">Crédito</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${lines.map((ln: any, idx: number) => {
                    const accCode = ln.expand?.account_id?.code || ln.account_code || '—';
                    const accName = ln.expand?.account_id?.name || ln.account_name || '—';
                    const lnThird = ln.expand?.third_party_id ? (ln.expand.third_party_id.legal_name || ln.expand.third_party_id.name || ln.expand.third_party_id.nit) : '—';
                    const deb = Number(ln.debit || 0);
                    const cred = Number(ln.credit || 0);
                    return `
                      <tr class="hover:bg-slate-50/70 transition-colors">
                        <td class="p-2.5 text-center text-slate-400">${idx + 1}</td>
                        <td class="p-2.5 font-mono font-bold text-blue-900">${esc(accCode)}</td>
                        <td class="p-2.5 font-medium text-slate-700">${esc(accName)}</td>
                        <td class="p-2.5 text-slate-600 max-w-[150px] truncate" title="${esc(lnThird)}">${esc(lnThird)}</td>
                        <td class="p-2.5 text-slate-500 max-w-[160px] truncate" title="${esc(ln.description || '')}">${esc(ln.description || '—')}</td>
                        <td class="p-2.5 text-right font-mono font-semibold ${deb > 0 ? 'text-slate-800' : 'text-slate-300'}">${deb > 0 ? formatCOP(deb) : '$ 0'}</td>
                        <td class="p-2.5 text-right font-mono font-semibold ${cred > 0 ? 'text-slate-800' : 'text-slate-300'}">${cred > 0 ? formatCOP(cred) : '$ 0'}</td>
                      </tr>`;
                  }).join('')}
                </tbody>
                <tfoot class="bg-slate-50/90 border-t-2 border-slate-200 font-bold font-mono text-xs">
                  <tr>
                    <td colspan="5" class="p-2.5 text-right font-sans text-slate-600 uppercase tracking-wider">Totales:</td>
                    <td class="p-2.5 text-right text-slate-900 bg-blue-50/40">${formatCOP(sumDebit)}</td>
                    <td class="p-2.5 text-right text-slate-900 bg-indigo-50/40">${formatCOP(sumCredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>`;
      return;
    }

    // FACTURAS DE VENTA
    if (entityRaw.includes('invoice') && !entityRaw.includes('purchase')) {
      const inv = await pb.getOne('invoices', entityId, { expand: 'client_id' }).catch(() => null);
      if (!inv) {
        container.innerHTML = _renderEntityNotFound(l, 'Factura de Venta');
        return;
      }
      const clientName = inv.expand?.client_id ? (inv.expand.client_id.legal_name || inv.expand.client_id.name || inv.expand.client_id.nit) : '—';
      const clientNit = inv.expand?.client_id?.nit || '';
      const totalAmount = Number(inv.total || inv.total_amount || 0);
      const subtotalAmount = Number(inv.subtotal || 0);
      const taxAmount = Number(inv.taxes || inv.iva_amount || 0);

      container.innerHTML = `
        <div class="space-y-4">
          <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Factura de Venta</span>
                <h3 class="text-base font-extrabold text-slate-800 font-mono">N° ${esc(inv.number || entityId)}</h3>
                <span class="badge ${inv.status === 'voided' ? 'badge-red' : (inv.status === 'draft' ? 'badge-orange' : 'badge-green')}">${esc(inv.status || 'Activa')}</span>
              </div>
              <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span><i class="far fa-user mr-1 text-slate-400"></i>Cliente: <strong>${esc(clientName)} ${clientNit ? `(NIT: ${clientNit})` : ''}</strong></span>
                <span><i class="far fa-calendar-alt mr-1 text-slate-400"></i>Fecha: <strong>${esc(inv.date || inv.issue_date || '—')}</strong></span>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-primary text-xs" onclick="closeModal(); (window as any).navigate && (window as any).navigate('ventas')">
              <i class="fas fa-file-invoice mr-1"></i> Abrir en Ventas
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-xs font-medium text-slate-500">Subtotal Antes de Impuestos</span>
              <p class="text-base font-bold text-slate-800 font-mono">${formatCOP(subtotalAmount)}</p>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-xs font-medium text-slate-500">IVA / Impuestos</span>
              <p class="text-base font-bold text-slate-800 font-mono">${formatCOP(taxAmount)}</p>
            </div>
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <span class="text-xs font-medium text-emerald-700">Total Facturado</span>
              <p class="text-lg font-bold text-emerald-900 font-mono">${formatCOP(totalAmount)}</p>
            </div>
          </div>
        </div>`;
      return;
    }

    // FACTURAS DE COMPRA / SOPORTES
    if (entityRaw.includes('purchase')) {
      const pinv = await pb.getOne('purchase_invoices', entityId, { expand: 'supplier_id' }).catch(() => null);
      if (!pinv) {
        container.innerHTML = _renderEntityNotFound(l, 'Factura de Compra');
        return;
      }
      const suppName = pinv.expand?.supplier_id ? (pinv.expand.supplier_id.legal_name || pinv.expand.supplier_id.name || pinv.expand.supplier_id.nit) : '—';
      const suppNit = pinv.expand?.supplier_id?.nit || '';
      const totalAmount = Number(pinv.total || pinv.total_amount || 0);

      container.innerHTML = `
        <div class="space-y-4">
          <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">Factura de Compra / Gasto</span>
                <h3 class="text-base font-extrabold text-slate-800 font-mono">N° ${esc(pinv.number || entityId)}</h3>
                <span class="badge ${pinv.status === 'voided' ? 'badge-red' : (pinv.status === 'draft' ? 'badge-orange' : 'badge-green')}">${esc(pinv.status || 'Activa')}</span>
              </div>
              <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span><i class="far fa-truck mr-1 text-slate-400"></i>Proveedor: <strong>${esc(suppName)} ${suppNit ? `(NIT: ${suppNit})` : ''}</strong></span>
                <span><i class="far fa-calendar-alt mr-1 text-slate-400"></i>Fecha: <strong>${esc(pinv.date || '—')}</strong></span>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-primary text-xs" onclick="closeModal(); (window as any).navigate && (window as any).navigate('compras')">
              <i class="fas fa-shopping-cart mr-1"></i> Abrir en Compras
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-xs font-medium text-slate-500">Subtotal</span>
              <p class="text-base font-bold text-slate-800 font-mono">${formatCOP(pinv.subtotal || 0)}</p>
            </div>
            <div class="bg-purple-50 border border-purple-200 rounded-xl p-3">
              <span class="text-xs font-medium text-purple-700">Total Liquidado</span>
              <p class="text-lg font-bold text-purple-900 font-mono">${formatCOP(totalAmount)}</p>
            </div>
          </div>
        </div>`;
      return;
    }

    // TERCEROS
    if (entityRaw.includes('tercero') || entityRaw.includes('third_part')) {
      const third = await pb.getOne('third_parties', entityId).catch(() => null);
      if (!third) {
        container.innerHTML = _renderEntityNotFound(l, 'Tercero');
        return;
      }
      const nitFull = `${third.nit || '—'}${third.dv !== undefined && third.dv !== null && third.dv !== '' ? '-' + third.dv : ''}`;
      const nameFull = third.legal_name || third.name || 'Sin Nombre';

      container.innerHTML = `
        <div class="space-y-4">
          <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">Ficha de Tercero</span>
                <h3 class="text-base font-extrabold text-slate-800">${esc(nameFull)}</h3>
                <span class="badge ${third.active === false ? 'badge-red' : 'badge-green'}">${third.active === false ? 'Inactivo' : 'Activo'}</span>
              </div>
              <p class="text-xs text-slate-500 font-mono mt-1">Documento / NIT: <strong>${esc(nitFull)}</strong> (${esc(third.doc_type || 'NIT')})</p>
            </div>
            <button type="button" class="btn btn-sm btn-primary text-xs" onclick="closeModal(); (window as any).navigate && (window as any).navigate('terceros')">
              <i class="fas fa-id-card mr-1"></i> Abrir en Terceros
            </button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-slate-400 block mb-0.5 font-medium">Tipo de Persona</span>
              <strong class="text-slate-800 font-semibold">${esc(third.person_type || 'No especificado')}</strong>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-slate-400 block mb-0.5 font-medium">Régimen Fiscal</span>
              <strong class="text-slate-800 font-semibold">${esc(third.tax_regime || 'Ordinario')}</strong>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-slate-400 block mb-0.5 font-medium">Teléfono / Móvil</span>
              <strong class="text-slate-800 font-semibold">${esc(third.phone || third.mobile || '—')}</strong>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-slate-400 block mb-0.5 font-medium">Correo Electrónico</span>
              <strong class="text-slate-800 font-semibold truncate block" title="${esc(third.email || '')}">${esc(third.email || '—')}</strong>
            </div>
            <div class="col-span-2 md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-slate-400 block mb-0.5 font-medium">Dirección y Ubicación</span>
              <strong class="text-slate-800 font-semibold">${esc(third.address || '—')} ${third.city ? `(${esc(third.city)})` : ''}</strong>
            </div>
          </div>
        </div>`;
      return;
    }

    // PRODUCTOS / SERVICIOS
    if (entityRaw.includes('product')) {
      const prod = await pb.getOne('products', entityId, { expand: 'category_id' }).catch(() => null);
      if (!prod) {
        container.innerHTML = _renderEntityNotFound(l, 'Producto / Servicio');
        return;
      }
      container.innerHTML = `
        <div class="space-y-4">
          <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">Catálogo de Productos</span>
                <h3 class="text-base font-extrabold text-slate-800 font-mono">${esc(prod.code || '—')} — ${esc(prod.name || 'Sin Nombre')}</h3>
                <span class="badge ${prod.active === false ? 'badge-red' : 'badge-green'}">${prod.active === false ? 'Inactivo' : 'Activo'}</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">Categoría: <strong>${esc(prod.expand?.category_id?.name || 'General')}</strong></p>
            </div>
            <button type="button" class="btn btn-sm btn-primary text-xs" onclick="closeModal(); (window as any).navigate && (window as any).navigate('productos')">
              <i class="fas fa-box mr-1"></i> Abrir en Catálogo
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-slate-500 font-medium">Precio Venta Base</span>
              <p class="text-base font-bold text-slate-800 font-mono">${formatCOP(prod.sale_price || prod.price || 0)}</p>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-slate-500 font-medium">Costo de Reposición</span>
              <p class="text-base font-bold text-slate-800 font-mono">${formatCOP(prod.cost || 0)}</p>
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span class="text-slate-500 font-medium">Tarifa IVA</span>
              <p class="text-base font-bold text-slate-800 font-mono">${prod.tax_rate !== undefined ? `${prod.tax_rate}%` : 'Exento'}</p>
            </div>
          </div>
        </div>`;
      return;
    }

    // CUENTAS CONTABLES (PLAN DE CUENTAS)
    if (entityRaw.includes('cuenta') || entityRaw.includes('account')) {
      const acc = await pb.getOne('accounts', entityId).catch(() => null);
      if (!acc) {
        container.innerHTML = _renderEntityNotFound(l, 'Cuenta Contable');
        return;
      }
      container.innerHTML = `
        <div class="space-y-4">
          <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">Plan de Cuentas PUC</span>
                <h3 class="text-base font-extrabold text-blue-900 font-mono">${esc(acc.code)} — ${esc(acc.name)}</h3>
                <span class="badge ${acc.active === false ? 'badge-red' : 'badge-green'}">${acc.active === false ? 'Inactiva' : 'Activa'}</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">Nivel: <strong>${esc(acc.level || '—')}</strong> | Naturaleza: <strong>${acc.nature === 'D' ? 'Débito' : (acc.nature === 'C' ? 'Crédito' : esc(acc.nature || '—'))}</strong></p>
            </div>
            <button type="button" class="btn btn-sm btn-primary text-xs" onclick="closeModal(); (window as any).navigate && (window as any).navigate('plan-cuentas')">
              <i class="fas fa-book mr-1"></i> Abrir en Plan de Cuentas
            </button>
          </div>
        </div>`;
      return;
    }

    // OTRA ENTIDAD NO ESPECÍFICA
    container.innerHTML = `
      <div class="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Detalle Registrado</h4>
        <p class="text-sm font-medium text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">${esc(translateAuditDetails(l.details))}</p>
      </div>`;

  } catch (err: any) {
    container.innerHTML = `
      <div class="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
        <i class="fas fa-exclamation-triangle mr-1.5"></i>No fue posible consultar la entidad en caliente: ${esc(err?.message || String(err))}
      </div>`;
  }
}

function viewAuditDetail(indexOrJsonStr: any) {
  try {
    let l;
    if (typeof indexOrJsonStr === 'number') {
      l = AUDIT_STATE.items[indexOrJsonStr];
    } else if (typeof indexOrJsonStr === 'string') {
      l = JSON.parse(indexOrJsonStr);
    } else {
      l = indexOrJsonStr;
    }
    if (!l) return;

    const bodyContainerId = 'audit-detail-body-' + Math.random().toString(36).slice(2, 9);
    const eventTime = fmtAuditDateTime(getAuditDateValue(l));
    const userDisplay = l.username || 'Sistema';
    const ipDisplay = l.ip || 'No registrada';
    const actionBadge = getAuditActionBadge(l.action);
    const entityLabel = translateAuditEntity(l.entity);
    const entityId = l.entity_id || '—';
    const auditId = l.id || '—';

    openModal(
      'Detalle de Registro de Auditoría',
      `<div class="space-y-4 text-sm max-w-4xl mx-auto py-1">
        <!-- Tarjeta de Metadatos del Evento -->
        <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
            <div class="flex items-center gap-2.5">
              ${actionBadge}
              <span class="text-slate-300">|</span>
              <span class="text-sm font-extrabold text-slate-800">${esc(entityLabel)}</span>
            </div>
            <div class="text-xs text-slate-500 flex items-center gap-1.5">
              <i class="far fa-clock text-slate-400"></i>
              <span class="font-medium text-slate-700">${esc(eventTime)}</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div class="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
              <span class="text-slate-400 block mb-0.5 font-medium"><i class="far fa-user mr-1 text-slate-400"></i>Usuario Responsable</span>
              <strong class="text-slate-800 font-semibold truncate block">${esc(userDisplay)}</strong>
            </div>
            <div class="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100">
              <span class="text-slate-400 block mb-0.5 font-medium"><i class="fas fa-network-wired mr-1 text-slate-400"></i>Dirección IP</span>
              <strong class="text-slate-800 font-mono text-xs">${esc(ipDisplay)}</strong>
            </div>
            <div class="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 sm:col-span-2 md:col-span-1">
              <span class="text-slate-400 block mb-0.5 font-medium"><i class="fas fa-fingerprint mr-1 text-slate-400"></i>ID Registro Auditoría</span>
              <strong class="text-slate-500 font-mono text-[11px] truncate block">${esc(auditId)}</strong>
            </div>
          </div>
        </div>

        <!-- Contenedor Dinámico de Impacto Contable y Cifras -->
        <div id="${bodyContainerId}">
          <div class="p-8 text-center text-slate-400">
            <i class="fas fa-circle-notch fa-spin text-xl text-blue-500 mr-2"></i>
            <span class="text-xs font-medium">Resolviendo impacto contable y detalles del registro...</span>
          </div>
        </div>

        <!-- Acordeón de Datos Técnicos y Forenses (Colapsable) -->
        <details class="border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden text-xs">
          <summary class="p-3 cursor-pointer font-medium text-slate-600 hover:text-slate-900 select-none flex items-center justify-between">
            <span><i class="fas fa-code text-slate-400 mr-1.5"></i>Información Técnica & Metadatos de Base de Datos</span>
            <i class="fas fa-chevron-down text-slate-400 text-[10px]"></i>
          </summary>
          <div class="p-3 border-t border-slate-200 bg-white space-y-2">
            <div class="grid grid-cols-2 gap-2 font-mono text-[11px]">
              <div><span class="text-slate-400 block">ID Entidad (entity_id):</span><code class="text-slate-800">${esc(entityId)}</code></div>
              <div><span class="text-slate-400 block">Entidad Técnica (entity):</span><code class="text-slate-800">${esc(l.entity || '—')}</code></div>
            </div>
            <div class="mt-2">
              <span class="text-slate-400 block mb-1">Detalle Crudo (details):</span>
              <pre class="bg-slate-900 text-slate-200 p-2.5 rounded-lg text-[11px] overflow-x-auto whitespace-pre-wrap">${esc(String(l.details || '—'))}</pre>
            </div>
          </div>
        </details>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );

    setTimeout(() => {
      resolveAndRenderAuditDetail(l, bodyContainerId);
    }, 50);

  } catch (err: any) {
    showToast('No se pudo abrir el detalle de auditoría: ' + (err?.message || err), 'error');
  }
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
        'Acción': translateAuditAction(l.action),
        'Entidad': translateAuditEntity(l.entity),
        'Documento / Ref': l.doc_number || '',
        'ID Entidad': l.entity_id || '',
        'Monto Afectado': l.amounts?.total ? formatCOP(l.amounts.total) : '',
        'Detalle': translateAuditDetails(l.details),
      })),
      `auditoria_${todayStr()}`
    );
  } catch (err) { showToast(err.message, 'error'); }
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderAuditoria = renderAuditoria;
(window as any).fmtAuditDateTime = fmtAuditDateTime;
(window as any).AUDIT_STATE = AUDIT_STATE;
(window as any).getAuditDateValue = getAuditDateValue;
(window as any).viewAuditDetail = viewAuditDetail;
(window as any).loadAuditPage = loadAuditPage;
(window as any).exportAuditLog = exportAuditLog;
(window as any).translateAuditAction = translateAuditAction;
(window as any).translateAuditEntity = translateAuditEntity;
(window as any).translateAuditDetails = translateAuditDetails;
(window as any).resolveAndRenderAuditDetail = resolveAndRenderAuditDetail;
