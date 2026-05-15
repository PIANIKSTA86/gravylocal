/**
 * GRAVY v2.0 ? conciliacion.js
 */
'use strict';

async function renderConciliacion(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando conciliaci?n...</div>`;
  try {
    const [bankAccounts, accounts, movements] = await Promise.all([
      pb.listAll('bank_accounts', { sort: 'name', expand: 'account_id' }),
      API.getAccounts(true),
      pb.listAll('bank_movements', { sort: '-date', expand: 'bank_account_id,tx_line_id' }),
    ]);
    const currentAccId = bankAccounts[0]?.id || '';

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Conciliaci?n Bancaria</h3>
          <p class="text-sm" style="color:#6B7280">Control de extractos y conciliaci?n de movimientos.</p>
        </div>
        ${can('canWrite') ? '<div class="flex gap-2"><button class="btn btn-secondary" id="btn-new-bank"><i class="fas fa-building-columns"></i> Nueva Cuenta Bancaria</button><button class="btn btn-secondary" id="btn-import-ext"><i class="fas fa-file-import"></i> Importar Extracto</button><button class="btn btn-primary" id="btn-new-mov"><i class="fas fa-plus"></i> Nuevo Movimiento</button></div>' : ''}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select id="bank-filter" class="form-input">
            <option value="">Todas las cuentas bancarias</option>
            ${bankAccounts.map(b => `<option value="${esc(b.id)}" ${b.id === currentAccId ? 'selected' : ''}>${esc(b.bank)} - ${esc(b.number)} (${esc(b.name)})</option>`).join('')}
          </select>
          <input id="mov-q" class="form-input" placeholder="Buscar por descripci?n o referencia...">
          <div class="flex items-center gap-2">
            <label style="font-size:11px;font-weight:700;color:#6B7280;white-space:nowrap">Desde</label>
            <input id="filter-from" type="date" class="form-input" style="font-size:12px">
          </div>
          <div class="flex items-center gap-2">
            <label style="font-size:11px;font-weight:700;color:#6B7280;white-space:nowrap">Hasta</label>
            <input id="filter-to" type="date" class="form-input" style="font-size:12px">
          </div>
        </div>
        ${can('canWrite') ? `
        <div class="flex flex-wrap gap-2 mt-3">
          <button class="btn btn-secondary" id="btn-suggest-recon"><i class="fas fa-wand-magic-sparkles"></i> Sugerir Conciliaci?n</button>
          <button class="btn btn-primary" id="btn-apply-suggested" disabled><i class="fas fa-check-double"></i> Aplicar Sugeridas (<span id="suggest-count">0</span>)</button>
          <button class="btn btn-outline" id="btn-recon-selected" disabled><i class="fas fa-list-check"></i> Conciliar Seleccionadas</button>
          <button class="btn btn-outline" id="btn-clear-movs" style="border-color:#FECACA;color:#DC2626"><i class="fas fa-trash-can"></i> Limpiar Per?odo</button>
        </div>
        <p class="text-xs mt-2" style="color:#9CA3AF">Sugerencias por monto + fecha (ventana +/- 3 d?as) usando el auxiliar contable de la cuenta bancaria.</p>
        ` : ''}
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 290px)">
          <table class="data-table" id="mov-table">
            <thead><tr>${can('canWrite') ? '<th><input type="checkbox" id="mov-check-all"></th>' : ''}<th>Fecha</th><th>Cuenta Bancaria</th><th>Descripci?n</th><th>D?bito</th><th>Cr?dito</th><th>Referencia</th><th>Conciliado</th>${can('canWrite') ? '<th>Sugerencia</th>' : ''}<th>Acciones</th></tr></thead>
            <tbody>
              ${movements.length ? movements.map(m => `
                <tr data-bank-id="${esc(m.bank_account_id)}" data-mov-id="${esc(m.id)}" data-reconciled="${m.reconciled ? '1' : '0'}" data-date="${esc(m.date)}">
                  ${can('canWrite') ? `<td>${m.reconciled ? '' : `<input type="checkbox" class="mov-check" value="${esc(m.id)}">`}</td>` : ''}
                  <td>${esc(m.date)}</td>
                  <td>${esc(m.expand?.bank_account_id?.bank || '')} - ${esc(m.expand?.bank_account_id?.number || '')}</td>
                  <td>${esc(m.description || '?')}</td>
                  <td>${fmt(m.debit || 0)}</td>
                  <td>${fmt(m.credit || 0)}</td>
                  <td>${esc(m.ref || '?')}</td>
                  <td>${m.reconciled ? '<span class="badge badge-green">S?</span>' : '<span class="badge badge-orange">No</span>'}</td>
                  ${can('canWrite') ? '<td class="mov-suggest"><span class="badge badge-gray">-</span></td>' : ''}
                  <td>${can('canWrite') ? `<button class="btn btn-outline btn-sm" onclick="toggleRecon('${esc(m.id)}', ${m.reconciled ? 'false' : 'true'})"><i class="fas fa-check"></i></button>` : ''}</td>
                </tr>`).join('') : `<tr><td colspan="${can('canWrite') ? '10' : '8'}" class="text-center py-10" style="color:#9CA3AF">No hay movimientos bancarios.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>`;

    const suggestionByMovId = new Map();

    const updateSelectionActions = () => {
      const selected = $$('#mov-table tbody .mov-check:checked').length;
      const b = $('#btn-recon-selected');
      if (!b) return;
      b.disabled = selected === 0;
      b.innerHTML = `<i class="fas fa-list-check"></i> Conciliar Seleccionadas${selected ? ` (${selected})` : ''}`;
    };

    const apply = () => {
      const bid  = getSelectVal('bank-filter');
      const q    = getInputVal('mov-q').toLowerCase();
      const from = getInputVal('filter-from');  // 'YYYY-MM-DD' o ''
      const to   = getInputVal('filter-to');
      $$('#mov-table tbody tr').forEach(tr => {
        const okB    = !bid  || tr.dataset.bankId === bid;
        const okQ    = !q    || tr.textContent.toLowerCase().includes(q);
        const date   = tr.dataset.date || '';
        const okFrom = !from || date >= from;
        const okTo   = !to   || date <= to;
        tr.style.display = okB && okQ && okFrom && okTo ? '' : 'none';
      });
      updateSelectionActions();
    };

    const paintSuggestions = list => {
      suggestionByMovId.clear();
      list.forEach(s => suggestionByMovId.set(s.movementId, s));
      const suggestCount = list.length;
      if ($('#suggest-count')) $('#suggest-count').textContent = String(suggestCount);
      const applyBtn = $('#btn-apply-suggested');
      if (applyBtn) applyBtn.disabled = suggestCount === 0;

      $$('#mov-table tbody tr').forEach(tr => {
        const movId = tr.dataset.movId;
        const cell = tr.querySelector('.mov-suggest');
        if (!cell) return;
        const s = suggestionByMovId.get(movId);
        if (!s) {
          cell.innerHTML = '<span class="badge badge-gray">-</span>';
          return;
        }
        const bClass = s.confidence === 'alta' ? 'badge-green' : s.confidence === 'media' ? 'badge-blue' : 'badge-orange';
        const label = s.confidence === 'alta' ? 'Alta' : s.confidence === 'media' ? 'Media' : 'Baja';
        cell.innerHTML = `<span class="badge ${bClass}" title="${esc(s.reason)}">${label}</span>`;
      });
    };

    const runSuggestions = async () => {
      try {
        const bankId = getSelectVal('bank-filter');
        if (!bankId) return showToast('Selecciona una cuenta bancaria para sugerir conciliaci?n', 'warning');
        const bank = bankAccounts.find(b => b.id === bankId);
        if (!bank?.account_id) return showToast('La cuenta bancaria no tiene cuenta contable asociada', 'warning');
        const btn = $('#btn-suggest-recon');
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analizando...';
        }
        const list = await buildReconSuggestions(bank, movements, 3);
        paintSuggestions(list);
        if (!list.length) showToast('No se encontraron sugerencias autom?ticas para esa cuenta', 'info');
        else showToast(`Se generaron ${list.length} sugerencia(s) de conciliaci?n`, 'success');
      } catch (err) {
        showToast(err.message || 'Error generando sugerencias', 'error');
      } finally {
        const btn = $('#btn-suggest-recon');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Sugerir Conciliaci?n';
        }
      }
    };

    const applySuggested = async () => {
      const pending = [...suggestionByMovId.values()];
      if (!pending.length) return showToast('No hay sugerencias para aplicar', 'warning');
      const btn = $('#btn-apply-suggested');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aplicando...';
      }
      let ok = 0;
      for (const s of pending) {
        try {
          await pb.update('bank_movements', s.movementId, { reconciled: true, tx_line_id: s.txLineId });
          ok++;
        } catch (_) {}
      }
      showToast(`Conciliadas ${ok} sugerencia(s)`, ok ? 'success' : 'warning');
      renderConciliacion($('#page-content'));
    };

    const reconcileSelected = async () => {
      const ids = $$('#mov-table tbody .mov-check:checked').map(i => i.value);
      if (!ids.length) return showToast('No hay movimientos seleccionados', 'warning');
      const btn = $('#btn-recon-selected');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conciliando...';
      }
      let ok = 0;
      for (const id of ids) {
        const s = suggestionByMovId.get(id);
        try {
          await pb.update('bank_movements', id, s ? { reconciled: true, tx_line_id: s.txLineId } : { reconciled: true });
          ok++;
        } catch (_) {}
      }
      showToast(`Conciliadas ${ok} seleccionada(s)`, ok ? 'success' : 'warning');
      renderConciliacion($('#page-content'));
    };

    $('#bank-filter')?.addEventListener('change', apply);
    $('#filter-from')?.addEventListener('change', apply);
    $('#filter-to')?.addEventListener('change', apply);
    $('#btn-clear-movs')?.addEventListener('click', () => openClearMovementsModal(bankAccounts, movements));
    $('#mov-q')?.addEventListener('input', debounce(apply, 150));
    $('#btn-new-bank')?.addEventListener('click', () => openBankAccountForm(accounts));
    $('#btn-new-mov')?.addEventListener('click', () => openBankMovementForm(bankAccounts));
    $('#btn-import-ext')?.addEventListener('click', () => openImportModal(bankAccounts));
    $('#btn-suggest-recon')?.addEventListener('click', runSuggestions);
    $('#btn-apply-suggested')?.addEventListener('click', applySuggested);
    $('#btn-recon-selected')?.addEventListener('click', reconcileSelected);
    $('#mov-check-all')?.addEventListener('change', e => {
      const on = !!e.target.checked;
      $$('#mov-table tbody tr').forEach(tr => {
        if (tr.style.display === 'none' || tr.dataset.reconciled === '1') return;
        const cb = tr.querySelector('.mov-check');
        if (cb) cb.checked = on;
      });
      updateSelectionActions();
    });
    $$('#mov-table tbody .mov-check').forEach(cb => cb.addEventListener('change', updateSelectionActions));
    apply();
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function openBankAccountForm(accounts) {
  openModal(
    'Nueva Cuenta Bancaria',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Nombre</label><input id="ba-name" class="form-input"></div>
      <div class="form-group"><label class="form-label">Banco</label><input id="ba-bank" class="form-input"></div>
      <div class="form-group"><label class="form-label">N?mero</label><input id="ba-number" class="form-input"></div>
      <div class="form-group"><label class="form-label">Cuenta contable asociada</label><select id="ba-account" class="form-input">${accounts.map(a => `<option value="${esc(a.id)}">${esc(a.code)} - ${esc(a.name)}</option>`).join('')}</select></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-ba">Guardar</button>`
  );
  $('#btn-save-ba')?.addEventListener('click', async () => {
    try {
      const payload = {
        name: getInputVal('ba-name'),
        bank: getInputVal('ba-bank'),
        number: getInputVal('ba-number'),
        account_id: getSelectVal('ba-account'),
        currency: 'COP',
        active: true,
      };
      if (!payload.name || !payload.bank || !payload.number || !payload.account_id) return showToast('Completa todos los campos', 'warning');
      const r = await pb.create('bank_accounts', payload);
      closeModal();
      showToast('Cuenta bancaria creada', 'success');
      renderConciliacion($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

function openBankMovementForm(bankAccounts) {
  openModal(
    'Nuevo Movimiento Bancario',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Cuenta Bancaria</label><select id="bm-acc" class="form-input">${bankAccounts.map(b => `<option value="${esc(b.id)}">${esc(b.bank)} - ${esc(b.number)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Fecha</label><input id="bm-date" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Descripci?n</label><input id="bm-desc" class="form-input"></div>
      <div class="form-group"><label class="form-label">D?bito</label><input id="bm-debit" class="form-input" value="0"></div>
      <div class="form-group"><label class="form-label">Cr?dito</label><input id="bm-credit" class="form-input" value="0"></div>
      <div class="form-group md:col-span-2"><label class="form-label">Referencia</label><input id="bm-ref" class="form-input"></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-bm">Guardar</button>`
  );
  $('#btn-save-bm')?.addEventListener('click', async () => {
    try {
      const payload = {
        bank_account_id: getSelectVal('bm-acc'),
        date: getInputVal('bm-date'),
        description: getInputVal('bm-desc'),
        debit: parseNum(getInputVal('bm-debit')),
        credit: parseNum(getInputVal('bm-credit')),
        balance: 0,
        ref: getInputVal('bm-ref'),
        reconciled: false,
      };
      if (!payload.bank_account_id || !payload.date) return showToast('Cuenta y fecha son obligatorias', 'warning');
      if (!(payload.debit > 0 || payload.credit > 0)) return showToast('Ingresa d?bito o cr?dito', 'warning');
      const r = await pb.create('bank_movements', payload);
      closeModal();
      showToast('Movimiento registrado', 'success');
      renderConciliacion($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function toggleRecon(id, reconciled) {
  try {
    await pb.update('bank_movements', id, { reconciled });
    showToast('Estado de conciliación actualizado', 'success');
    renderConciliacion($('#page-content'));
  } catch (err) { showToast(err.message, 'error'); }
}

function _asDateOnly(s) {
  if (!s) return null;
  const d = new Date(String(s).slice(0, 10) + 'T00:00:00');
  return isNaN(d) ? null : d;
}

function _daysDiff(a, b) {
  const da = _asDateOnly(a);
  const db = _asDateOnly(b);
  if (!da || !db) return 999;
  return Math.round(Math.abs((da - db) / 86400000));
}

function _normText(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function _textOverlap(a, b) {
  const stop = new Set(['de','la','el','los','las','por','para','con','del','y','en','a','un','una']);
  const wa = new Set(_normText(a).split(' ').filter(w => w.length >= 4 && !stop.has(w)));
  const wb = new Set(_normText(b).split(' ').filter(w => w.length >= 4 && !stop.has(w)));
  if (!wa.size || !wb.size) return 0;
  let common = 0;
  wa.forEach(w => { if (wb.has(w)) common++; });
  return common / Math.max(wa.size, wb.size);
}

async function buildReconSuggestions(bankAccount, movements, dayWindow = 3) {
  const accountId = bankAccount?.account_id;
  if (!accountId) return [];

  const safe = pb.escapeFilterValue(accountId);
  const txLines = await pb.listAll('tx_lines', {
    filter: `account_id="${safe}"`,
    expand: 'tx_id',
    sort: '-created',
  });

  const usedLineIds = new Set(
    movements.filter(m => m.tx_line_id).map(m => m.tx_line_id)
  );

  const remainingLines = txLines.filter(l => !usedLineIds.has(l.id));
  const pendingMovs = movements.filter(m => m.bank_account_id === bankAccount.id && !m.reconciled);
  const reservedLines = new Set();
  const suggestions = [];

  for (const m of pendingMovs) {
    const amount = +(m.debit > 0 ? m.debit : m.credit || 0);
    if (!amount) continue;

    // En contabilidad bancaria el sentido es inverso al extracto.
    const lineSide = m.debit > 0 ? 'credit' : 'debit';
    const candidates = remainingLines
      .filter(l => !reservedLines.has(l.id))
      .filter(l => Math.abs((+(l[lineSide] || 0)) - amount) < 0.01)
      .map(l => {
        const txDate = l.expand?.tx_id?.date || '';
        const dDiff = _daysDiff(m.date, txDate);
        const descScore = _textOverlap(m.description || m.ref || '', l.description || l.expand?.tx_id?.description || '');
        const score = Math.max(0, 100 - dDiff * 12) + descScore * 40;
        return { line: l, dDiff, descScore, score };
      })
      .filter(c => c.dDiff <= dayWindow)
      .sort((a, b) => b.score - a.score);

    if (!candidates.length) continue;

    const top = candidates[0];
    const alt = candidates[1];
    const unique = !alt || top.score - alt.score >= 20;
    const confidence = unique && top.dDiff <= 1 ? 'alta' : unique ? 'media' : 'baja';
    const reason = `Monto exacto ${fmt(amount)} · dif fecha ${top.dDiff} día(s)`;

    suggestions.push({
      movementId: m.id,
      txLineId: top.line.id,
      confidence,
      reason,
    });
    reservedLines.add(top.line.id);
  }

  return suggestions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIMPIAR PERÍODO — elimina movimientos bancarios de un rango de fechas
// ═══════════════════════════════════════════════════════════════════════════════

function openClearMovementsModal(bankAccounts, movements) {
  // Pre-poblar desde/hasta con lo que ya tiene el filtro activo
  const preFrom = getInputVal('filter-from') || '';
  const preTo   = getInputVal('filter-to')   || '';
  const preBid  = getSelectVal('bank-filter') || '';

  openModal(
    '<i class="fas fa-trash-can mr-2" style="color:#DC2626"></i>Limpiar Per?odo',
    `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:12px 14px;font-size:13px;color:#991B1B;margin-bottom:16px">
       <i class="fas fa-triangle-exclamation mr-1"></i>
       Esta acci?n <strong>elimina permanentemente</strong> los movimientos del rango seleccionado.
       Los movimientos ya conciliados se eliminar?n tambi?n y perder?n su v?nculo contable.
     </div>
     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div class="form-group mb-0">
         <label class="form-label">Cuenta bancaria</label>
         <select id="clr-bank" class="form-input">
           <option value="">Todas las cuentas</option>
           ${bankAccounts.map(b => `<option value="${esc(b.id)}" ${b.id === preBid ? 'selected' : ''}>${esc(b.bank)} - ${esc(b.number)} (${esc(b.name)})</option>`).join('')}
         </select>
       </div>
       <div></div>
       <div class="form-group mb-0">
         <label class="form-label">Desde <span style="color:#EF4444">*</span></label>
         <input id="clr-from" type="date" class="form-input" value="${esc(preFrom)}">
       </div>
       <div class="form-group mb-0">
         <label class="form-label">Hasta <span style="color:#EF4444">*</span></label>
         <input id="clr-to" type="date" class="form-input" value="${esc(preTo)}">
       </div>
     </div>
     <div id="clr-preview" class="mt-4" style="font-size:13px;color:#6B7280;min-height:24px"></div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" id="btn-clr-confirm" disabled>
       <i class="fas fa-trash-can mr-1"></i> Eliminar movimientos
     </button>`
  );

  const updatePreview = () => {
    const bid  = getSelectVal('clr-bank');
    const from = getInputVal('clr-from');
    const to   = getInputVal('clr-to');
    if (!from || !to) {
      $('#clr-preview').innerHTML = '<span style="color:#9CA3AF">Selecciona ambas fechas para ver cu?ntos registros se eliminar?n.</span>';
      if ($('#btn-clr-confirm')) $('#btn-clr-confirm').disabled = true;
      return;
    }
    if (from > to) {
      $('#clr-preview').innerHTML = '<span style="color:#EF4444"><i class="fas fa-circle-exclamation mr-1"></i>La fecha inicial no puede ser mayor que la final.</span>';
      if ($('#btn-clr-confirm')) $('#btn-clr-confirm').disabled = true;
      return;
    }
    const affected = movements.filter(m => {
      const okB = !bid || m.bank_account_id === bid;
      return okB && m.date >= from && m.date <= to;
    });
    const recon = affected.filter(m => m.reconciled).length;
    if (!affected.length) {
      $('#clr-preview').innerHTML = '<span style="color:#6B7280">Ning?n movimiento coincide con ese rango.</span>';
      if ($('#btn-clr-confirm')) $('#btn-clr-confirm').disabled = true;
      return;
    }
    $('#clr-preview').innerHTML = `
      <span style="color:#DC2626;font-weight:700"><i class="fas fa-triangle-exclamation mr-1"></i>
      Se eliminar?n <strong>${affected.length}</strong> movimiento(s)
      ${recon ? `<span style="color:#92400E"> — de los cuales <strong>${recon}</strong> ya est?n conciliados</span>` : ''}
      </span>`;
    if ($('#btn-clr-confirm')) $('#btn-clr-confirm').disabled = false;
  };

  $('#clr-bank')?.addEventListener('change', updatePreview);
  $('#clr-from')?.addEventListener('change', updatePreview);
  $('#clr-to')?.addEventListener('change', updatePreview);
  updatePreview();

  $('#btn-clr-confirm')?.addEventListener('click', async () => {
    const bid  = getSelectVal('clr-bank');
    const from = getInputVal('clr-from');
    const to   = getInputVal('clr-to');
    const toDelete = movements.filter(m => {
      const okB = !bid || m.bank_account_id === bid;
      return okB && m.date >= from && m.date <= to;
    });
    if (!toDelete.length) return;
    const btn = $('#btn-clr-confirm');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Eliminando...'; }
    let ok = 0, fail = 0;
    for (const m of toDelete) {
      try { await pb.delete('bank_movements', m.id); ok++; }
      catch (_) { fail++; }
    }
    closeModal();
    if (fail) showToast(`Eliminados ${ok}. ${fail} no pudieron borrarse (pueden tener restricciones).`, 'warning');
    else      showToast(`${ok} movimiento(s) eliminado(s) correctamente`, 'success');
    renderConciliacion($('#page-content'));
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPORTACIÓN DE EXTRACTO BANCARIO
// Soporta: Excel/CSV (via XLSX) y Copiar-Pegar desde PDF
// ═══════════════════════════════════════════════════════════════════════════════

let _importRows = [];
let _importBankAccId = '';

function openImportModal(bankAccounts) {
  openModal(
    '<i class="fas fa-file-import mr-2"></i>Importar Extracto Bancario',
    `<div id="import-wizard"></div>`,
    `<div id="import-footer" style="display:contents"></div>`,
    true
  );
  _renderImportStep1(bankAccounts);
}

// ─── PASO 1: Selector de fuente ───────────────────────────────────────────────
function _renderImportStep1(bankAccounts) {
  $('#modal-body').querySelector('#import-wizard').innerHTML = `
    <div class="mb-4">
      <label class="form-label">Cuenta bancaria destino <span style="color:#EF4444">*</span></label>
      <select id="imp-bank-acc" class="form-input">
        ${bankAccounts.map(b => `<option value="${esc(b.id)}">${esc(b.bank)} — ${esc(b.number)} (${esc(b.name)})</option>`).join('')}
      </select>
    </div>

    <div style="display:flex;gap:0;border-bottom:2px solid #E5E7EB;margin-bottom:16px">
      <button class="imp-tab" data-tab="excel"
        style="padding:8px 20px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;border-bottom:3px solid #2E6CE6;color:#2E6CE6;margin-bottom:-2px">
        <i class="fas fa-file-excel mr-1"></i> Excel / CSV
      </button>
      <button class="imp-tab" data-tab="paste"
        style="padding:8px 20px;font-size:13px;font-weight:600;border:none;background:none;cursor:pointer;color:#6B7280">
        <i class="fas fa-paste mr-1"></i> Copiar/Pegar desde PDF
      </button>
    </div>

    <div id="imp-tab-excel">
      <div id="imp-drop-zone"
        style="border:2px dashed #D1D5DB;border-radius:14px;padding:36px;text-align:center;cursor:pointer;background:#F9FAFB;transition:all .2s">
        <i class="fas fa-cloud-upload-alt" style="font-size:2rem;color:#9CA3AF;display:block;margin-bottom:8px"></i>
        <p style="font-weight:600;font-size:14px;color:#374151;margin:0 0 4px">Haz clic o arrastra el archivo aquí</p>
        <p style="font-size:12px;color:#9CA3AF;margin:0">Formatos: .xlsx · .xls · .csv</p>
        <input type="file" id="imp-file-input" accept=".xlsx,.xls,.csv" style="display:none">
      </div>
      <div id="imp-col-map" class="mt-4" style="display:none"></div>
    </div>

    <div id="imp-tab-paste" style="display:none">
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:10px 14px;font-size:13px;color:#92400E;margin-bottom:10px">
        <i class="fas fa-lightbulb mr-1"></i>
        Abre el PDF, selecciona el texto de la tabla de movimientos (<strong>Ctrl+A</strong> en la página del extracto) y pégalo aquí.
        Funciona con <strong>PDFs digitales</strong> (texto seleccionable), no escaneados.
      </div>

      <div style="margin-bottom:10px">
        <label class="form-label" style="margin-bottom:6px">¿Cómo están los valores en el extracto?</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <label style="display:flex;align-items:center;gap:6px;padding:7px 13px;border:1.5px solid #D1D5DB;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#374151;background:#fff">
            <input type="radio" name="imp-format" value="tres" checked style="accent-color:#2E6CE6">
            <span><i class="fas fa-table-columns mr-1" style="color:#6B7280"></i> Débito | Crédito | Saldo <span style="font-size:11px;color:#9CA3AF">(más común)</span></span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;padding:7px 13px;border:1.5px solid #D1D5DB;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#374151;background:#fff">
            <input type="radio" name="imp-format" value="dos" style="accent-color:#2E6CE6">
            <span><i class="fas fa-columns mr-1" style="color:#6B7280"></i> Débito | Crédito (sin saldo)</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;padding:7px 13px;border:1.5px solid #D1D5DB;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#374151;background:#fff">
            <input type="radio" name="imp-format" value="signos" style="accent-color:#2E6CE6">
            <span><i class="fas fa-plus-minus mr-1" style="color:#6B7280"></i> Valor único (+/−)</span>
          </label>
        </div>
      </div>

      <textarea id="imp-paste-area" class="form-input" rows="9"
        style="font-family:monospace;font-size:12px;resize:vertical"
        placeholder="Pega el texto aquí. Ejemplo (formato Déb|Créd|Saldo):&#10;&#10;01/04/2025  TRANSFERENCIA PSE PAGO       1.250.000,00              4.800.000,00&#10;05/04/2025  COMPRA POS EXITO CALLE 80        85.400,00              4.714.600,00&#10;10/04/2025  CONSIGNACION EFECTIVO                        2.000.000,00  6.714.600,00"></textarea>
      <div style="display:flex;align-items:center;gap:12px;margin-top:10px">
        <button class="btn btn-secondary" id="btn-imp-analyze">
          <i class="fas fa-wand-magic-sparkles mr-1"></i> Analizar texto
        </button>
        <span style="font-size:12px;color:#9CA3AF">Se detectan fechas, descripciones y montos automáticamente.</span>
      </div>
    </div>`;

  $('#modal-footer').innerHTML =
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>`;

  // Tab switching
  $$('.imp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.imp-tab').forEach(t => {
        t.style.borderBottom = 'none';
        t.style.color = '#6B7280';
      });
      tab.style.borderBottom = '3px solid #2E6CE6';
      tab.style.color = '#2E6CE6';
      $('#imp-tab-excel').style.display = tab.dataset.tab === 'excel' ? '' : 'none';
      $('#imp-tab-paste').style.display  = tab.dataset.tab === 'paste'  ? '' : 'none';
    });
  });

  // Drag & drop / click upload
  const dz = $('#imp-drop-zone');
  dz?.addEventListener('click', () => $('#imp-file-input')?.click());
  dz?.addEventListener('dragover', e => { e.preventDefault(); dz.style.borderColor = '#2E6CE6'; dz.style.background = '#EFF6FF'; });
  dz?.addEventListener('dragleave', () => { dz.style.borderColor = '#D1D5DB'; dz.style.background = '#F9FAFB'; });
  dz?.addEventListener('drop', e => {
    e.preventDefault();
    dz.style.borderColor = '#D1D5DB'; dz.style.background = '#F9FAFB';
    const f = e.dataTransfer?.files?.[0];
    if (f) _handleExcelFile(f, bankAccounts);
  });
  $('#imp-file-input')?.addEventListener('change', e => {
    if (e.target.files?.[0]) _handleExcelFile(e.target.files[0], bankAccounts);
  });

  // PDF paste analyze
  $('#btn-imp-analyze')?.addEventListener('click', () => {
    const text = $('#imp-paste-area')?.value?.trim() || '';
    if (!text) return showToast('Pega el texto del extracto primero', 'warning');
    const fmt = document.querySelector('input[name="imp-format"]:checked')?.value || 'tres';
    const rows = _parsePdfText(text, fmt);
    if (!rows.length) return showToast('No se detectaron movimientos. Verifica que el texto incluya fechas (dd/mm/aaaa) y el formato seleccionado sea correcto.', 'warning');
    const bankAccId = getSelectVal('imp-bank-acc');
    _renderImportPreview(rows, bankAccounts, bankAccId);
  });
}

// ─── EXCEL / CSV ──────────────────────────────────────────────────────────────
function _handleExcelFile(file, bankAccounts) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (raw.length < 2) return showToast('El archivo no tiene datos suficientes', 'warning');
      const map = _autoMapColumns(raw);
      _renderColMapper(raw, map, file.name, bankAccounts);
    } catch (err) { showToast('Error al leer el archivo: ' + err.message, 'error'); }
  };
  reader.readAsArrayBuffer(file);
}

const _COL_KEYS = {
  date:  ['fecha','date','dia','fec'],
  desc:  ['descripcion','descripción','concepto','detalle','movimiento','transaccion','transacción'],
  debit: ['debito','débito','cargo','egreso','salida','retiro','debit','db'],
  cred:  ['credito','crédito','abono','ingreso','deposito','depósito','credit','cr','entrada'],
  ref:   ['referencia','ref','numero','número','doc','comprobante','nro','cheque'],
};

function _autoMapColumns(raw) {
  let hRow = 0;
  for (let i = 0; i < Math.min(raw.length, 10); i++) {
    const cells = raw[i].map(c => String(c).toLowerCase());
    let hits = 0;
    for (const keys of Object.values(_COL_KEYS)) {
      if (cells.some(cell => keys.some(k => cell.includes(k)))) hits++;
    }
    if (hits >= 2) { hRow = i; break; }
  }
  const hdrs = raw[hRow].map(c => String(c).toLowerCase().trim());
  const find = keys => hdrs.findIndex(h => keys.some(k => h.includes(k)));
  return { hRow, date: find(_COL_KEYS.date), desc: find(_COL_KEYS.desc),
           debit: find(_COL_KEYS.debit), cred: find(_COL_KEYS.cred), ref: find(_COL_KEYS.ref) };
}

function _renderColMapper(raw, map, fileName, bankAccounts) {
  const hdrs = raw[map.hRow];
  const dataRows = raw.length - map.hRow - 1;

  const dz = $('#imp-drop-zone');
  if (dz) {
    dz.style.cssText = 'padding:10px 16px;border:1.5px solid #22C55E;border-radius:12px;background:#F0FDF4;display:flex;align-items:center;gap:10px;cursor:default';
    dz.innerHTML = `<i class="fas fa-file-excel" style="color:#16A34A;font-size:1.3rem"></i>
      <span style="font-size:14px;font-weight:600;color:#15803D">${esc(fileName)}</span>
      <span style="font-size:12px;color:#6B7280">${dataRows} filas detectadas</span>`;
    dz.onclick = null;
    ['dragover','dragleave','drop'].forEach(ev => dz.removeEventListener(ev, null));
  }

  const opts = sel => [-1, ...hdrs.keys()].map(i =>
    `<option value="${i}" ${i === sel ? 'selected' : ''}>${i < 0 ? '— No usar —' : `Col.${i+1}: ${esc(String(hdrs[i]).slice(0,24))}`}</option>`
  ).join('');

  const mapDiv = $('#imp-col-map');
  mapDiv.style.display = '';
  mapDiv.innerHTML = `
    <p style="font-size:13px;font-weight:700;color:#374151;margin-bottom:10px">
      Mapeo de columnas <span style="font-weight:400;color:#9CA3AF">(ajusta si es necesario)</span>
    </p>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      <div><label class="form-label">Fecha <span style="color:#EF4444">*</span></label>
           <select id="mc-date"  class="form-input" style="font-size:13px">${opts(map.date)}</select></div>
      <div><label class="form-label">Descripción <span style="color:#EF4444">*</span></label>
           <select id="mc-desc"  class="form-input" style="font-size:13px">${opts(map.desc)}</select></div>
      <div><label class="form-label">Débito</label>
           <select id="mc-debit" class="form-input" style="font-size:13px">${opts(map.debit)}</select></div>
      <div><label class="form-label">Crédito</label>
           <select id="mc-cred"  class="form-input" style="font-size:13px">${opts(map.cred)}</select></div>
      <div><label class="form-label">Referencia</label>
           <select id="mc-ref"   class="form-input" style="font-size:13px">${opts(map.ref)}</select></div>
    </div>

    <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;padding:12px 14px;margin-bottom:12px">
      <p style="font-size:12px;font-weight:700;color:#1D4ED8;margin:0 0 6px">
        <i class="fas fa-info-circle mr-1"></i> ¿El extracto usa una sola columna de valor con positivo/negativo?
      </p>
      <div style="display:flex;align-items:center;gap:10px">
        <select id="mc-valor" class="form-input" style="font-size:13px;max-width:280px">${opts(-1)}</select>
        <span style="font-size:12px;color:#6B7280">Selecciona la columna. Positivo → Crédito · Negativo → Débito. <em>Ignora los campos Débito/Crédito de arriba.</em></span>
      </div>
    </div>

    <button class="btn btn-primary" id="btn-imp-preview">
      <i class="fas fa-eye mr-1"></i> Ver vista previa
    </button>`;

  $('#btn-imp-preview')?.addEventListener('click', () => {
    const ci = {
      date:  +getSelectVal('mc-date'),
      desc:  +getSelectVal('mc-desc'),
      debit: +getSelectVal('mc-debit'),
      cred:  +getSelectVal('mc-cred'),
      ref:   +getSelectVal('mc-ref'),
      valor: +getSelectVal('mc-valor'),
    };
    if (ci.date < 0 || ci.desc < 0)
      return showToast('Las columnas Fecha y Descripción son obligatorias', 'warning');
    const useValor = ci.valor >= 0;
    if (!useValor && ci.debit < 0 && ci.cred < 0)
      return showToast('Selecciona al menos una columna de valor (Débito, Crédito, o Valor único)', 'warning');

    const rows = [];
    for (let i = map.hRow + 1; i < raw.length; i++) {
      const r = raw[i];
      const dateStr = _parseExcelDate(r[ci.date]);
      if (!dateStr) continue;
      let debit = 0, credit = 0;
      if (useValor) {
        const signed = _parseSignedColNum(r[ci.valor]);
        if (signed < 0) debit = Math.abs(signed);
        else credit = signed;
      } else {
        debit  = ci.debit >= 0 ? _parseColNum(r[ci.debit]) : 0;
        credit = ci.cred  >= 0 ? _parseColNum(r[ci.cred])  : 0;
      }
      if (!debit && !credit) continue;
      rows.push({
        date: dateStr,
        description: String(r[ci.desc] ?? '').trim(),
        debit, credit,
        ref: ci.ref >= 0 ? String(r[ci.ref] ?? '').trim() : '',
      });
    }
    if (!rows.length)
      return showToast('No se encontraron filas válidas con el mapeo seleccionado', 'warning');

    const bankAccId = getSelectVal('imp-bank-acc');
    _renderImportPreview(rows, bankAccounts, bankAccId);
  });
}

function _parseExcelDate(val) {
  if (val == null || val === '') return null;
  if (val instanceof Date && !isNaN(val)) return val.toISOString().slice(0, 10);
  if (typeof val === 'number') {
    const d = new Date(Math.round((val - 25569) * 86400000));
    return isNaN(d) ? null : d.toISOString().slice(0, 10);
  }
  const s = String(val).trim();
  const m1 = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`;
  const m2 = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m2) return `${m2[1]}-${m2[2].padStart(2,'0')}-${m2[3].padStart(2,'0')}`;
  return null;
}

function _parseColNum(val) {
  if (val == null || val === '') return 0;
  if (typeof val === 'number') return Math.abs(val);
  const s = String(val).replace(/\s/g, '');
  // Formato colombiano: 1.234.567,89 → quitar puntos, coma→punto
  let cleaned;
  if (/\d\.\d{3},/.test(s))      cleaned = s.replace(/\./g, '').replace(',', '.');
  else if (/\d,\d{3}\./.test(s)) cleaned = s.replace(/,/g, '');
  else                            cleaned = s.replace(/[^0-9.\-]/g, '');
  return Math.abs(parseFloat(cleaned)) || 0;
}

// Versión con signo para columna única positivo/negativo en Excel
function _parseSignedColNum(val) {
  if (val == null || val === '') return 0;
  if (typeof val === 'number') return val; // preservar signo
  const s = String(val).trim();
  // Notación con paréntesis (1.234,00) = negativo
  const isNeg = /^[-−(]/.test(s) || /\)$/.test(s);
  const clean = s.replace(/^[-−(]/, '').replace(/\)$/, '');
  return isNeg ? -_parseColNum(clean) : _parseColNum(clean);
}

// ─── PARSER DE TEXTO PEGADO (PDF) ─────────────────────────────────────────────
// ─── PARSER DE TEXTO PEGADO (PDF) ─────────────────────────────────────────────
// format: 'tres' (Déb|Créd|Saldo), 'dos' (Déb|Créd sin saldo), 'signos' (valor único +/−)
function _parsePdfText(text, format = 'tres') {
  const rows = [];

  // Detecta fecha: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy, yyyy-mm-dd
  const DATE_RE = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b|\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/;

  // Regex de montos amplia: soporta separadores de miles con punto, coma,
  // espacio normal o NBSP (U+00A0), thin space (U+2009), etc.
  // También captura signo negativo/guión al frente.
  // Ejemplos: 1.250.000,00 | 1,250,000.00 | 1 250 000,00 | 1\u00A0250\u00A0000,00 | 500,00 | -85.400,00
  const NUM_SRC = '[-\u2212]?\\d{1,3}(?:[.,\\u00A0\\u2009\\u202F ]\\d{3})+(?:[.,]\\d{1,2})?|[-\u2212]?\\d+[.,]\\d{2}';
  const mkNum   = () => new RegExp(NUM_SRC, 'g'); // nueva instancia cada uso (evita lastIndex stale)

  // ── 1. Normalizar separadores invisibles ──────────────────────────────────
  const normalized = text
    .replace(/\u00A0|\u2009|\u202F/g, ' ') // NBSP → espacio normal
    .replace(/\u2212/g, '-');              // guión largo → guión ASCII

  // ── 2. Agrupar líneas por fecha (soporte multi-línea) ────────────────────
  const groups = [];
  for (const rawLine of normalized.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const dm = line.match(DATE_RE);
    if (dm) {
      let dateStr;
      if (dm[4]) {
        dateStr = `${dm[4]}-${dm[5]}-${dm[6]}`; // ISO yyyy-mm-dd
      } else {
        let [, d, mo, y] = dm;
        if (y.length === 2) y = '20' + y;
        dateStr = `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
      }
      groups.push({ date: dateStr, lines: [line] });
    } else if (groups.length > 0) {
      // Línea de continuación del registro anterior
      groups[groups.length - 1].lines.push(line);
    }
  }

  if (!groups.length) return rows;

  // ── 3. Parsear cada grupo ─────────────────────────────────────────────────
  let prevSaldo = null;

  for (const g of groups) {
    const fullText = g.lines.join(' ');

    // Extraer todos los montos del grupo
    const numMatches = [...fullText.matchAll(mkNum())].map(m => {
      const raw = m[0].replace(/\s/g, ''); // quitar espacios internos
      const isNeg = /^[-]/.test(raw);
      const abs = _parseColNum(raw.replace(/^[-]/, ''));
      return { isNeg, abs, signed: isNeg ? -abs : abs };
    }).filter(n => n.abs > 0);

    if (!numMatches.length) continue;

    // Descripción: texto completo del grupo sin la fecha ni los números
    const dateM = fullText.match(DATE_RE);
    const afterDate = dateM ? fullText.slice(dateM.index + dateM[0].length) : fullText;
    let description = afterDate
      .replace(new RegExp(NUM_SRC, 'g'), ' ')
      .replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ\-\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!description || description.length < 2) description = 'Movimiento';

    // ── Interpretación de valores según formato ───────────────────────────
    let debit = 0, credit = 0;

    if (format === 'signos') {
      // Columna única con signo: tomar el primer número relevante
      const n = numMatches[0];
      if (n.isNeg) debit  = n.abs;
      else         credit = n.abs;

    } else if (format === 'dos') {
      // Dos columnas: (débito, crédito), sin saldo.
      // Los últimos 1 o 2 números al final de la línea son los valores.
      if (numMatches.length >= 2) {
        debit  = numMatches[numMatches.length - 2].abs;
        credit = numMatches[numMatches.length - 1].abs;
      } else {
        credit = numMatches[numMatches.length - 1].abs;
      }

    } else {
      // 'tres': Débito | Crédito | Saldo  (formato más común en bancos colombianos)
      // En el PDF solo aparecen los valores no-vacíos: si hay débito, el PDF muestra
      // [monto_débito, saldo]; si hay crédito, muestra [monto_crédito, saldo].
      // Usamos el delta del saldo para determinar la dirección.
      if (numMatches.length >= 2) {
        const saldo  = numMatches[numMatches.length - 1].abs; // último = saldo
        const amount = numMatches[numMatches.length - 2].abs; // penúltimo = monto
        if (!amount) continue;
        if (prevSaldo !== null) {
          const delta = saldo - prevSaldo;
          // Tolerancia del 1 % para redondeos de extracto
          if (delta >= -amount * 0.01) credit = amount;
          else                          debit  = amount;
        } else {
          // Primera fila: sin saldo anterior, asumir crédito
          credit = amount;
        }
        prevSaldo = saldo;
      } else if (numMatches.length === 1) {
        // Solo un número en la línea (sin saldo) → tratar como crédito
        credit = numMatches[0].abs;
      }
    }

    if (!debit && !credit) continue;
    rows.push({ date: g.date, description, debit, credit, ref: '' });
  }

  return rows;
}

// ─── VISTA PREVIA & CONFIRMACIÓN ──────────────────────────────────────────────
function _renderImportPreview(rows, bankAccounts, bankAccId) {
  _importRows    = rows.map((r, i) => ({ ...r, _id: i, _skip: false }));
  _importBankAccId = bankAccId;

  const bankLabel = bankAccounts.find(b => b.id === bankAccId);
  const bankName  = bankLabel ? `${bankLabel.bank} — ${bankLabel.number}` : bankAccId;

  $('#modal-body').querySelector('#import-wizard').innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;gap:12px;flex-wrap:wrap">
      <div>
        <p style="font-weight:700;font-size:14px;color:#374151;margin:0 0 2px">Vista previa de importación</p>
        <p style="font-size:12px;color:#6B7280;margin:0">
          Cuenta: <strong>${esc(bankName)}</strong> &nbsp;·&nbsp;
          Elimina filas incorrectas antes de confirmar.
        </p>
      </div>
      <span id="imp-count-badge" class="badge badge-blue" style="white-space:nowrap">
        ${rows.length} movimientos
      </span>
    </div>
    <div style="max-height:340px;overflow-y:auto;border:1px solid #F0F0F0;border-radius:12px">
      <table class="data-table" style="font-size:12px" id="imp-preview-table">
        <thead>
          <tr><th>Fecha</th><th>Descripción</th><th style="text-align:right">Débito</th>
              <th style="text-align:right">Crédito</th><th>Ref.</th><th></th></tr>
        </thead>
        <tbody>
          ${_importRows.map(r => `
            <tr id="imp-row-${r._id}">
              <td>${esc(r.date)}</td>
              <td>${esc(r.description)}</td>
              <td style="text-align:right">${r.debit  ? fmt(r.debit)  : '<span style="color:#D1D5DB">—</span>'}</td>
              <td style="text-align:right">${r.credit ? fmt(r.credit) : '<span style="color:#D1D5DB">—</span>'}</td>
              <td>${esc(r.ref || '—')}</td>
              <td>
                <button class="btn btn-outline btn-sm"
                  style="color:#EF4444;border-color:#FECACA;padding:2px 8px"
                  onclick="_removeImportRow(${r._id})" title="Eliminar fila">
                  <i class="fas fa-times"></i>
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  $('#modal-footer').innerHTML = `
    <button class="btn btn-outline" id="btn-imp-back">
      <i class="fas fa-arrow-left mr-1"></i> Volver
    </button>
    <button class="btn btn-primary" id="btn-imp-confirm">
      <i class="fas fa-file-import mr-1"></i>
      Importar <span id="imp-confirm-count">${rows.length}</span> movimientos
    </button>`;

  $('#btn-imp-back')?.addEventListener('click', () => {
    _importRows = []; _importBankAccId = '';
    _renderImportStep1(bankAccounts);
  });
  $('#btn-imp-confirm')?.addEventListener('click', () => _doImport());
}

function _removeImportRow(id) {
  const row = _importRows.find(r => r._id === id);
  if (row) row._skip = true;
  document.getElementById(`imp-row-${id}`)?.remove();
  const remaining = _importRows.filter(r => !r._skip).length;
  const badge    = $('#imp-count-badge');
  const countSpan = $('#imp-confirm-count');
  if (badge)     badge.textContent = `${remaining} movimientos`;
  if (countSpan) countSpan.textContent = remaining;
  if (!remaining) {
    const btn = $('#btn-imp-confirm');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.5'; }
  }
}

async function _doImport() {
  if (!_importBankAccId) return showToast('Cuenta bancaria no definida', 'error');
  const toImport = _importRows.filter(r => !r._skip);
  if (!toImport.length) return showToast('No hay movimientos para importar', 'warning');

  const btn = $('#btn-imp-confirm');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Importando...'; }

  let ok = 0, fail = 0;
  for (const r of toImport) {
    try {
      await pb.create('bank_movements', {
        bank_account_id: _importBankAccId,
        date:        r.date,
        description: r.description,
        debit:       r.debit  || 0,
        credit:      r.credit || 0,
        balance:     0,
        ref:         r.ref    || '',
        reconciled:  false,
      });
      ok++;
    } catch { fail++; }
  }

  closeModal();
  _importRows = []; _importBankAccId = '';

  if (fail) showToast(`Importados ${ok} movimientos. ${fail} no pudieron guardarse.`, 'warning');
  else      showToast(`${ok} movimientos importados correctamente`, 'success');
  renderConciliacion($('#page-content'));
}

// --- VITE MIGRATION GLOBALS ---
(window as any).renderConciliacion = renderConciliacion;
(window as any)._normText = _normText;
(window as any)._renderColMapper = _renderColMapper;
(window as any)._parseExcelDate = _parseExcelDate;
(window as any)._parsePdfText = _parsePdfText;
(window as any).openBankAccountForm = openBankAccountForm;
(window as any)._autoMapColumns = _autoMapColumns;
(window as any).openImportModal = openImportModal;
(window as any)._handleExcelFile = _handleExcelFile;
(window as any)._parseColNum = _parseColNum;
(window as any).buildReconSuggestions = buildReconSuggestions;
(window as any)._importRows = _importRows;
(window as any)._renderImportStep1 = _renderImportStep1;
(window as any)._removeImportRow = _removeImportRow;
(window as any)._COL_KEYS = _COL_KEYS;
(window as any)._renderImportPreview = _renderImportPreview;
(window as any)._parseSignedColNum = _parseSignedColNum;
(window as any)._daysDiff = _daysDiff;
(window as any).openClearMovementsModal = openClearMovementsModal;
(window as any)._doImport = _doImport;
(window as any)._importBankAccId = _importBankAccId;
(window as any)._asDateOnly = _asDateOnly;
(window as any).openBankMovementForm = openBankMovementForm;
(window as any).toggleRecon = toggleRecon;
(window as any)._textOverlap = _textOverlap;
