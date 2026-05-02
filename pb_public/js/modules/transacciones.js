/**
 * ContaCO v2.0 — transacciones.js
 */
'use strict';

let TX_STATE = {
  accounts: [],
  txTypes: [],
  terceros: [],
  lines: [],
  postableAccountIds: new Set(),
};

async function renderNuevaTx(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando datos...</div>`;
  try {
    const [accounts, txTypes, terceros] = await Promise.all([
      API.getAccounts(true),
      API.getTxTypes(),
      API.getTerceros({}),
    ]);
    const parentCodes = new Set(accounts.map(a => a.parent_code).filter(Boolean));
    const postableAccountIds = new Set(
      accounts.filter(a => !parentCodes.has(a.code)).map(a => a.id)
    );
    TX_STATE = { accounts, txTypes, terceros, lines: [], postableAccountIds };

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Nueva Transacción</h3>
          <p class="text-sm" style="color:#6B7280">Registro contable por partida doble.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group"><label class="form-label">Tipo</label><select id="tx-type" class="form-input">${txTypes.map(t => `<option value="${esc(t.id)}">${esc(t.prefix)} - ${esc(t.name)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Consecutivo</label><input id="tx-number" class="form-input" readonly placeholder="Auto"></div>
          <div class="form-group"><label class="form-label">Fecha</label><input id="tx-date" type="date" class="form-input" value="${todayStr()}"></div>
          <div class="form-group"><label class="form-label">Tercero</label><select id="tx-third" class="form-input"><option value="">Sin tercero</option>${terceros.map(t => `<option value="${esc(t.id)}">${esc(t.doc_number)} - ${esc(t.name)}</option>`).join('')}</select></div>
          <div class="form-group md:col-span-4"><label class="form-label">Descripción</label><input id="tx-desc" class="form-input" placeholder="Descripción del comprobante"></div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
        <div class="flex items-center justify-between mb-4">
          <h4 class="font-bold" style="color:#0D2137">Líneas contables</h4>
          ${can('canWrite') ? '<button class="btn btn-outline btn-sm" id="btn-add-line"><i class="fas fa-plus"></i> Agregar línea</button>' : ''}
        </div>
        <div id="tx-lines"></div>
        <div class="flex flex-wrap items-center justify-between mt-4 gap-3">
          <div id="tx-balance" class="balance-indicator balance-err"><i class="fas fa-triangle-exclamation"></i> Descuadrada</div>
          ${can('canWrite') ? '<button class="btn btn-primary" id="btn-save-tx"><i class="fas fa-floppy-disk"></i> Guardar Transacción</button>' : ''}
        </div>
      </div>`;

    $('#tx-type')?.addEventListener('change', refreshConsecutive);
    $('#btn-add-line')?.addEventListener('click', () => addTxLine());
    $('#btn-save-tx')?.addEventListener('click', saveTransaction);

    await refreshConsecutive();
    addTxLine();
    addTxLine();
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function refreshConsecutive() {
  const typeId = getSelectVal('tx-type');
  const tt = TX_STATE.txTypes.find(t => t.id === typeId);
  if (!tt) return;
  setInputVal('tx-number', `${tt.prefix}-${String((tt.consecutive ?? 0) + 1).padStart(6, '0')}`);
}

function addTxLine(row = null) {
  TX_STATE.lines.push(row || { account_id: '', debit: 0, credit: 0, description: '' });
  renderTxLines();
}

function removeTxLine(i) {
  TX_STATE.lines.splice(i, 1);
  renderTxLines();
}

function updateTxLine(i, field, value) {
  TX_STATE.lines[i][field] = value;
  if (field === 'debit' && Number(value) > 0) TX_STATE.lines[i].credit = 0;
  if (field === 'credit' && Number(value) > 0) TX_STATE.lines[i].debit = 0;
  renderTxLines(false);
}

function renderTxLines(repaint = true) {
  if (repaint) {
    const html = TX_STATE.lines.map((line, i) => `
      <div class="tx-line-row" data-i="${i}">
        <select class="form-input" onchange="updateTxLine(${i}, 'account_id', this.value)">
          <option value="">Seleccione cuenta...</option>
          ${TX_STATE.accounts.map(a => {
            const postable = TX_STATE.postableAccountIds.has(a.id);
            return `<option value="${esc(a.id)}" ${line.account_id === a.id ? 'selected' : ''} ${postable ? '' : 'disabled'}>${esc(a.code)} - ${esc(a.name)}${postable ? '' : ' [MAYOR]'}</option>`;
          }).join('')}
        </select>
        <input class="form-input text-right" value="${line.debit ? esc(line.debit) : ''}" placeholder="Débito" oninput="updateTxLine(${i}, 'debit', parseNum(this.value))">
        <input class="form-input text-right" value="${line.credit ? esc(line.credit) : ''}" placeholder="Crédito" oninput="updateTxLine(${i}, 'credit', parseNum(this.value))">
        <button class="btn btn-danger btn-sm" onclick="removeTxLine(${i})"><i class="fas fa-xmark"></i></button>
      </div>`).join('');
    $('#tx-lines').innerHTML = html || '<p style="color:#9CA3AF">Agrega al menos una línea.</p>';
  }

  const totals = TX_STATE.lines.reduce((acc, l) => {
    acc.d += Number(l.debit || 0);
    acc.c += Number(l.credit || 0);
    return acc;
  }, { d: 0, c: 0 });

  const ok = Math.abs(totals.d - totals.c) < 0.0001 && totals.d > 0;
  const b = $('#tx-balance');
  if (!b) return;
  b.className = `balance-indicator ${ok ? 'balance-ok' : 'balance-err'}`;
  b.innerHTML = ok
    ? `<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(totals.d)} = Crédito ${fmt(totals.c)}`
    : `<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(totals.d - totals.c))}`;
}

async function saveTransaction() {
  if (!can('canWrite')) return showToast('No tienes permisos para registrar transacciones', 'error');
  try {
    const txTypeId = getSelectVal('tx-type');
    const txDate = getInputVal('tx-date');
    const txDesc = getInputVal('tx-desc');
    const thirdId = getSelectVal('tx-third');
    const validLines = TX_STATE.lines.filter(l => l.account_id && (Number(l.debit) > 0 || Number(l.credit) > 0));

    if (!txTypeId || !txDate) return showToast('Completa tipo y fecha', 'warning');
    if (!txDesc) return showToast('La descripción es obligatoria', 'warning');

    // Cierre: verify period is not closed
    if (typeof isPeriodClosed === 'function') {
      const closed = await isPeriodClosed(txDate);
      if (closed) return showToast(`El período ${txDate.slice(0,7)} está cerrado. Re-abre el período en Cierre Contable antes de registrar.`, 'error');
    }

    if (!validLines.length) return showToast('Debe existir al menos una línea válida', 'warning');
    if (validLines.length < 2) return showToast('Se requieren al menos 2 líneas contables', 'warning');

    // Regla 1: solo cuentas de movimiento (no cuentas padre)
    const nonPostableLine = validLines.find(l => !TX_STATE.postableAccountIds.has(l.account_id));
    if (nonPostableLine) {
      const acc = TX_STATE.accounts.find(a => a.id === nonPostableLine.account_id);
      return showToast(`La cuenta ${acc?.code || ''} es de mayor; usa una cuenta auxiliar para registrar movimientos`, 'error');
    }

    // Regla 2: si alguna cuenta requiere tercero, el encabezado debe tener tercero
    const needsThird = validLines.some(l => {
      const a = TX_STATE.accounts.find(x => x.id === l.account_id);
      return !!a?.requires_third_party;
    });
    if (needsThird && !thirdId) {
      return showToast('La transacción incluye cuentas que requieren tercero. Selecciona un tercero en el encabezado.', 'error');
    }

    const sum = validLines.reduce((acc, l) => ({ d: acc.d + Number(l.debit || 0), c: acc.c + Number(l.credit || 0) }), { d: 0, c: 0 });
    if (Math.abs(sum.d - sum.c) > 0.0001 || sum.d <= 0) return showToast('La transacción no está cuadrada', 'error');

    const tx = await API.createTransaction({
      tx_type_id: txTypeId,
      number: '',
      date: txDate,
      description: txDesc,
      third_party_id: thirdId || null,
      user_id: pb.currentUser?.id,
      cross_enabled: false,
      status: 'active',
    }, validLines.map((l, i) => ({
      account_id: l.account_id,
      debit: Number(l.debit || 0),
      credit: Number(l.credit || 0),
      description: l.description || txDesc,
      line_order: i + 1,
    })));

    showToast(`Transacción ${tx.number} guardada`, 'success');
    navigate('consulta-tx');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Consulta de Transacciones ─────────────────────────────────────────────────
let CTXQ_STATE = { page: 1, perPage: 50, total: 0, txTypes: [] };

async function renderConsultaTx(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando transacciones...</div>`;
  try {
    const txTypes = await API.getTxTypes();
    CTXQ_STATE = { page: 1, perPage: 50, total: 0, txTypes };
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Consulta de Transacciones</h3>
          <p class="text-sm" style="color:#6B7280">Histórico de comprobantes contables.</p>
        </div>
        ${can('canExport') ? '<button class="btn btn-outline" id="btn-export-tx"><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input id="txq" class="form-input col-span-2 md:col-span-2" placeholder="Buscar número, tercero, descripción...">
          <select id="txq-type" class="form-input">
            <option value="">Todos los tipos</option>
            ${txTypes.map(t => `<option value="${esc(t.id)}">${esc(t.prefix)} - ${esc(t.name)}</option>`).join('')}
          </select>
          <input id="txq-from" type="date" class="form-input" title="Fecha desde">
          <input id="txq-to" type="date" class="form-input" title="Fecha hasta">
        </div>
        <div class="flex gap-3 mt-3">
          <select id="txq-status" class="form-input" style="max-width:180px">
            <option value="">Todos los estados</option>
            <option value="active">Activa</option>
            <option value="voided">Anulada</option>
          </select>
          <button class="btn btn-primary btn-sm" id="btn-txq-search"><i class="fas fa-search"></i> Buscar</button>
          <button class="btn btn-outline btn-sm" id="btn-txq-clear"><i class="fas fa-eraser"></i> Limpiar</button>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div id="ctxq-results">
          <div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-search mr-2"></i>Usa los filtros y pulsa Buscar</div>
        </div>
        <div id="ctxq-pagination" class="flex items-center justify-between px-4 py-3 border-t" style="border-color:#F0F0F0; display:none!important"></div>
      </div>`;

    const doSearch = () => { CTXQ_STATE.page = 1; loadConsultaTxPage(); };
    $('#btn-txq-search')?.addEventListener('click', doSearch);
    $('#txq')?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    $('#btn-txq-clear')?.addEventListener('click', () => {
      ['txq','txq-from','txq-to'].forEach(id => setInputVal(id, ''));
      ['txq-type','txq-status'].forEach(id => { const el = $(`#${id}`); if (el) el.value = ''; });
      $('#ctxq-results').innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-search mr-2"></i>Usa los filtros y pulsa Buscar</div>';
      $('#ctxq-pagination').style.display = 'none';
    });
    $('#btn-export-tx')?.addEventListener('click', exportConsultaTx);

    // Auto-load first page on mount
    doSearch();
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function loadConsultaTxPage() {
  const resultsDiv = $('#ctxq-results');
  const paginDiv = $('#ctxq-pagination');
  if (!resultsDiv) return;

  resultsDiv.innerHTML = '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando...</div>';

  try {
    const q = getInputVal('txq').trim();
    const typeId = getSelectVal('txq-type');
    const dateFrom = getInputVal('txq-from');
    const dateTo = getInputVal('txq-to');
    const status = getSelectVal('txq-status');

    const filters = [];
    if (typeId) {
      const safe = pb.escapeFilterValue(typeId);
      filters.push(`tx_type_id="${safe}"`);
    }
    if (dateFrom) filters.push(`date>="${dateFrom}"`);
    if (dateTo) filters.push(`date<="${dateTo}"`);
    if (status) {
      const safe = pb.escapeFilterValue(status);
      filters.push(`status="${safe}"`);
    }
    if (q) {
      const safe = pb.escapeFilterValue(q);
      filters.push(`(number~"${safe}" || description~"${safe}")`);
    }

    const request = {
      page: CTXQ_STATE.page,
      perPage: CTXQ_STATE.perPage,
      sort: '-id',
      filter: filters.join(' && ') || '',
      expand: 'tx_type_id,third_party_id',
    };

    let res;
    try {
      res = await pb.list('transactions', request);
    } catch (firstErr) {
      // Fallback defensivo para instalaciones legacy con reglas de ordenamiento limitadas.
      res = await pb.list('transactions', {
        page: CTXQ_STATE.page,
        perPage: CTXQ_STATE.perPage,
        sort: '-id',
        expand: 'tx_type_id,third_party_id',
      });
      showToast('Se omitieron filtros temporalmente en la consulta.', 'warning');
      void firstErr;
    }
    CTXQ_STATE.total = res.totalItems;
    const totalPages = Math.ceil(res.totalItems / CTXQ_STATE.perPage) || 1;

    if (!res.items.length) {
      resultsDiv.innerHTML = '<div class="p-10 text-center" style="color:#9CA3AF">No se encontraron transacciones con los filtros aplicados.</div>';
      paginDiv.style.display = 'none';
      return;
    }

    resultsDiv.innerHTML = `
      <div class="overflow-x-auto">
        <table class="data-table" id="tx-table">
          <thead><tr><th>Número</th><th>Fecha</th><th>Tipo</th><th>Tercero</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${res.items.map(t => `
              <tr>
                <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(t.number || '')}</span></td>
                <td>${esc(t.date)}</td>
                <td><span class="text-xs font-medium">${esc(t.expand?.tx_type_id?.name || '—')}</span></td>
                <td>${esc(t.expand?.third_party_id?.name || '—')}</td>
                <td class="max-w-xs truncate" title="${esc(t.description || '')}">${esc(t.description || '—')}</td>
                <td>${t.status === 'voided' ? '<span class="badge badge-red">Anulada</span>' : '<span class="badge badge-green">Activa</span>'}</td>
                <td>
                  <div class="flex gap-1">
                    <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="seeTxDetail('${esc(t.id)}')"><i class="fas fa-eye"></i></button>
                    ${can('canDelete') && t.status !== 'voided' ? `<button class="btn btn-danger btn-sm" title="Anular" onclick="voidTx('${esc(t.id)}')"><i class="fas fa-ban"></i></button>` : ''}
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    // Pagination controls
    paginDiv.style.display = 'flex';
    paginDiv.innerHTML = `
      <span class="text-sm" style="color:#6B7280">
        Mostrando ${(CTXQ_STATE.page - 1) * CTXQ_STATE.perPage + 1}–${Math.min(CTXQ_STATE.page * CTXQ_STATE.perPage, CTXQ_STATE.total)} de ${CTXQ_STATE.total} registros
      </span>
      <div class="flex gap-2">
        <button class="btn btn-outline btn-sm" id="ctxq-prev" ${CTXQ_STATE.page <= 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i> Ant.</button>
        <span class="text-sm font-medium px-2 flex items-center">Pág. ${CTXQ_STATE.page} / ${totalPages}</span>
        <button class="btn btn-outline btn-sm" id="ctxq-next" ${CTXQ_STATE.page >= totalPages ? 'disabled' : ''}>Sig. <i class="fas fa-chevron-right"></i></button>
      </div>`;
    $('#ctxq-prev')?.addEventListener('click', () => { CTXQ_STATE.page--; loadConsultaTxPage(); });
    $('#ctxq-next')?.addEventListener('click', () => { CTXQ_STATE.page++; loadConsultaTxPage(); });
  } catch (err) {
    resultsDiv.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function exportConsultaTx() {
  if (!can('canExport')) return showToast('Sin permisos de exportación', 'error');
  try {
    showToast('Generando exportación...', 'info');
    const q = getInputVal('txq').trim();
    const typeId = getSelectVal('txq-type');
    const dateFrom = getInputVal('txq-from');
    const dateTo = getInputVal('txq-to');
    const status = getSelectVal('txq-status');
    const filters = [];
    if (typeId) {
      const safe = pb.escapeFilterValue(typeId);
      filters.push(`tx_type_id="${safe}"`);
    }
    if (dateFrom) filters.push(`date>="${dateFrom}"`);
    if (dateTo) filters.push(`date<="${dateTo}"`);
    if (status) {
      const safe = pb.escapeFilterValue(status);
      filters.push(`status="${safe}"`);
    }
    if (q) {
      const safe = pb.escapeFilterValue(q);
      filters.push(`(number~"${safe}" || description~"${safe}")`);
    }
    let all;
    try {
      all = await pb.listAll('transactions', { sort: '-id', filter: filters.join(' && ') || '', expand: 'tx_type_id,third_party_id' });
    } catch (firstErr) {
      all = await pb.listAll('transactions', { sort: '-id', expand: 'tx_type_id,third_party_id' });
      showToast('Exportación sin filtros por compatibilidad del backend.', 'warning');
      void firstErr;
    }
    exportToExcel(
      all.map(t => ({
        'Número': t.number || '',
        'Fecha': t.date,
        'Tipo': t.expand?.tx_type_id?.name || '',
        'Tercero': t.expand?.third_party_id?.name || '',
        'Descripción': t.description || '',
        'Estado': t.status === 'voided' ? 'Anulada' : 'Activa',
      })),
      `transacciones_${todayStr()}`
    );
  } catch (err) { showToast(err.message, 'error'); }
}

async function seeTxDetail(id) {
  try {
    const tx = await pb.get('transactions', id, { expand: 'tx_type_id,third_party_id,user_id' });
    const lines = await API.getTxLines(id);
    openModal(
      `Transacción ${esc(tx.number || '')}`,
      `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
        <div><strong>Fecha:</strong> ${esc(tx.date)}</div>
        <div><strong>Tercero:</strong> ${esc(tx.expand?.third_party_id?.name || '—')}</div>
        <div><strong>Estado:</strong> ${esc(tx.status)}</div>
      </div>
      <p class="mb-4" style="color:#6B7280">${esc(tx.description || '')}</p>
      <div class="overflow-x-auto">
        <table class="data-table"><thead><tr><th>Cuenta</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
          <tbody>${lines.map(l => `<tr><td>${esc(l.expand?.account_id?.code || '')} - ${esc(l.expand?.account_id?.name || '')}</td><td>${esc(l.description || '—')}</td><td>${fmt(l.debit || 0)}</td><td>${fmt(l.credit || 0)}</td></tr>`).join('')}</tbody>
        </table>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function voidTx(id) {
  if (!can('canDelete')) return showToast('No tienes permisos para anular', 'error');
  confirmDialog('Anular transacción', 'Esta acción cambia el estado a anulada. ¿Deseas continuar?', async () => {
    try {
      // Check period closure
      if (typeof isPeriodClosed === 'function') {
        const tx = await pb.get('transactions', id);
        const closed = await isPeriodClosed(tx.date);
        if (closed) return showToast(`El período ${(tx.date||'').slice(0,7)} está cerrado. No se puede anular.`, 'error');
      }
      await API.voidTransaction(id, 'Anulación desde consulta');
      showToast('Transacción anulada', 'success');
      renderConsultaTx($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function renderTransacciones(c) {
  return renderNuevaTx(c);
}
