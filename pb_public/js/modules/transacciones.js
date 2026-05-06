/**
 * ContaCO v2.0 — transacciones.js
 */
'use strict';

// Tarifas de retención por defecto (Colombia)
const RET_DEFAULT_RATES = { reterenta: 3.5, reteiva: 15, reteica: 0.414 };
const RET_RATE_FIELD_BY_TYPE = {
  reterenta: 'ret_rate_reterenta',
  reteiva: 'ret_rate_reteiva',
  reteica: 'ret_rate_reteica',
};
function defaultRetRate(tipos, account = null) {
  for (const raw of tipos) {
    const t = raw.trim();
    const f = RET_RATE_FIELD_BY_TYPE[t];
    const accRate = account && f ? Number(account[f] || 0) : 0;
    if (accRate > 0) return accRate;
    if (RET_DEFAULT_RATES[t]) return RET_DEFAULT_RATES[t];
  }
  return RET_DEFAULT_RATES.reterenta;
}
function retLabel(tipo) {
  return { reterenta: 'Reterenta', reteiva: 'Reteiva', reteica: 'Reteica' }[tipo.trim()] || tipo;
}
function retRateLabel(tipo, account = null) {
  const t = String(tipo || '').trim();
  const f = RET_RATE_FIELD_BY_TYPE[t];
  const accRate = account && f ? Number(account[f] || 0) : 0;
  const rate = accRate > 0 ? accRate : (RET_DEFAULT_RATES[t] || 0);
  return `${retLabel(t)} ${rate}%`;
}

let TX_STATE = {
  accounts: [],
  txTypes: [],
  terceros: [],
  lines: [],
  postableAccountIds: new Set(),
  accountMap: new Map(),
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
    const accountMap = new Map(accounts.map(a => [a.id, a]));
    TX_STATE = { accounts, txTypes, terceros, lines: [], postableAccountIds, accountMap };

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Nueva Transacción</h3>
          <p class="text-sm" style="color:#6B7280">Registro contable por partida doble.</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="form-group"><label class="form-label">Tipo / Serie</label><select id="tx-type" class="form-input">${buildTxTypeOptions(txTypes)}</select></div>
          <div class="form-group"><label class="form-label">Consecutivo</label><input id="tx-number" class="form-input" readonly placeholder="Auto"></div>
          <div class="form-group"><label class="form-label">Fecha</label><input id="tx-date" type="date" class="form-input" value="${todayStr()}"></div>
          <div class="form-group md:col-span-1">
            <label class="form-label">Tercero</label>
            <div class="flex gap-2">
              <select id="tx-third" class="form-input" style="flex:1"><option value="">Sin tercero</option>${terceros.map(t => `<option value="${esc(t.id)}">${esc(t.doc_number)} - ${esc(t.name)}</option>`).join('')}</select>
              <button class="btn btn-outline btn-sm" id="btn-cartera" title="Ver saldo de cartera del tercero" style="white-space:nowrap;border-color:#1A4B8C;color:#1A4B8C" disabled>
                <i class="fas fa-file-invoice-dollar"></i> Cartera
              </button>
            </div>
          </div>
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
    $('#tx-third')?.addEventListener('change', () => {
      const btn = $('#btn-cartera');
      if (btn) btn.disabled = !getSelectVal('tx-third');
    });
    $('#btn-cartera')?.addEventListener('click', () => showCarteraModal(getSelectVal('tx-third')));

    await refreshConsecutive();
    addTxLine();
    addTxLine();
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

// Construye opciones del selector de tipo agrupadas por código con <optgroup>
function buildTxTypeOptions(txTypes) {
  const groups = new Map();
  for (const t of txTypes) {
    if (!groups.has(t.code)) groups.set(t.code, []);
    groups.get(t.code).push(t);
  }
  const parts = [];
  for (const [code, series] of groups) {
    if (series.length === 1) {
      const t = series[0];
      parts.push(`<option value="${esc(t.id)}">${esc(t.prefix)} — ${esc(t.name)}</option>`);
    } else {
      // Múltiples series: usar optgroup
      const label = `${esc(code)} — ${esc(series[0].name.replace(/ ?[\-–—].*$/, '').trim())}`;
      parts.push(`<optgroup label="${label}">${series.map(t => `<option value="${esc(t.id)}">[${esc(t.prefix)}] ${esc(t.name)}</option>`).join('')}</optgroup>`);
    }
  }
  return parts.join('');
}

async function refreshConsecutive() {
  const typeId = getSelectVal('tx-type');
  const tt = TX_STATE.txTypes.find(t => t.id === typeId);
  if (!tt) return;
  setInputVal('tx-number', `${tt.prefix}-${String((tt.consecutive ?? 0) + 1).padStart(8, '0')}`);
}

function addTxLine(row = null) {
  TX_STATE.lines.push(row || { account_id: '', third_party_id: '', debit: 0, credit: 0, description: '', cross_doc_ref: '', ret_base: '', ret_rate: '' });
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
  if (field === 'account_id') {
    TX_STATE.lines[i].cross_doc_ref = '';
    TX_STATE.lines[i].ret_base = '';
    // Pre-fill default rate when a retention account is selected
    const acct = TX_STATE.accountMap.get(value);
    if (acct?.maneja_retenciones) {
      const tipos = (acct.tipos_retencion || '').split(',').filter(Boolean);
      TX_STATE.lines[i].ret_rate = String(defaultRetRate(tipos, acct));
    } else {
      TX_STATE.lines[i].ret_rate = '';
    }
    renderTxLines(true);
  } else if (field === 'ret_base' || field === 'ret_rate') {
    // Update calculated display in-place — no full repaint needed
    const base = Number(TX_STATE.lines[i].ret_base || 0);
    const rate = Number(TX_STATE.lines[i].ret_rate  || 0);
    const el = document.getElementById(`ret-calc-${i}`);
    if (el) el.textContent = base && rate ? fmt(base * rate / 100) : '$0';
  } else {
    renderTxLines(false);
  }
}

function applyRetentionCalc(i) {
  const line = TX_STATE.lines[i];
  const base   = Number(line.ret_base || 0);
  const acct   = TX_STATE.accountMap.get(line.account_id);
  const tipos  = (acct?.tipos_retencion || '').split(',').filter(Boolean);
  const rate   = Number(line.ret_rate || defaultRetRate(tipos, acct) || 0);
  TX_STATE.lines[i].ret_rate = rate ? String(rate) : '';
  if (!base || !rate) return showToast('Ingresa la base gravable para calcular la retención', 'warning');
  const amount = Math.round(base * rate / 100);
  // Credit nature → retención registrada al haber (pasivo); debit nature → al debe (activo/deducible)
  if (acct?.nature === 'debit') {
    TX_STATE.lines[i].debit  = amount;
    TX_STATE.lines[i].credit = 0;
  } else {
    TX_STATE.lines[i].credit = amount;
    TX_STATE.lines[i].debit  = 0;
  }
  renderTxLines(true);
  showToast(`Retención aplicada: ${fmt(amount)}`, 'success');
}

function renderTxLines(repaint = true) {
  if (repaint) {
    const html = TX_STATE.lines.map((line, i) => {
      const acct       = TX_STATE.accountMap.get(line.account_id);
      const needsThird  = !!acct?.requires_third_party;
      const needsCruce  = !!acct?.maneja_cruce;
      const needsRet    = !!acct?.maneja_retenciones;
      const tiposRet    = (acct?.tipos_retencion || '').split(',').filter(Boolean);
      const calcBase    = Number(line.ret_base || 0);
      const calcRate    = Number(line.ret_rate  !== '' ? line.ret_rate : (tiposRet.length ? defaultRetRate(tiposRet, acct) : 0));
      const calcAmount  = calcBase && calcRate ? fmt(calcBase * calcRate / 100) : '$0';
      return `
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
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin:-2px 0 6px 0;padding:5px 8px;background:#F8FAFC;border-left:3px solid #64748B;border-radius:0 6px 6px 0">
        <i class="fas fa-user-tag" style="color:#334155;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#334155;white-space:nowrap">Tercero línea</span>
        <select class="form-input" style="max-width:340px;font-size:13px" onchange="updateTxLine(${i}, 'third_party_id', this.value)">
          <option value="">Usar tercero del encabezado</option>
          ${TX_STATE.terceros.map(t => `<option value="${esc(t.id)}" ${line.third_party_id === t.id ? 'selected' : ''}>${esc(t.doc_number)} - ${esc(t.name)}</option>`).join('')}
        </select>
        ${needsThird ? '<span class="text-xs" style="color:#B91C1C">Obligatorio para esta cuenta</span>' : '<span class="text-xs" style="color:#94A3B8">Opcional</span>'}
        ${needsCruce ? `<button class="btn btn-outline btn-sm" style="padding:3px 8px;font-size:11px;border-color:#1A4B8C;color:#1A4B8C;flex-shrink:0" title="Consultar cartera de este tercero" onclick="showCarteraForLine(${i}, 'new')"><i class="fas fa-search"></i></button>` : ''}
      </div>
      ${needsCruce ? `
      <div style="display:flex;align-items:center;gap:8px;margin:-2px 0 6px 0;padding:5px 8px;background:#EFF6FF;border-left:3px solid #1A4B8C;border-radius:0 6px 6px 0">
        <i class="fas fa-link" style="color:#1A4B8C;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#1A4B8C;white-space:nowrap">Doc. de Cruce</span>
        <input class="form-input" style="max-width:200px;font-size:13px" placeholder="N\u00b0 factura / documento" value="${esc(line.cross_doc_ref || '')}" oninput="updateTxLine(${i}, 'cross_doc_ref', this.value)">
        <span class="text-xs" style="color:#93C5FD">CxP / CxC \u2014 ingresa el n\u00famero del documento que se est\u00e1 cruzando</span>
      </div>` : ''}
      ${needsRet ? `
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:-2px 0 6px 0;padding:7px 10px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0">
        <i class="fas fa-percent" style="color:#D97706;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#92400E;white-space:nowrap">Calculadora de Retención</span>
         ${tiposRet.map(t => `<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:10px">${retRateLabel(t, acct)}</span>`).join('')}
        <span class="text-xs" style="color:#92400E">Base:</span>
        <input class="form-input" style="max-width:140px;font-size:13px" type="number" min="0" step="1" placeholder="Base gravable"
               value="${esc(line.ret_base || '')}" oninput="updateTxLine(${i}, 'ret_base', this.value)">
        <span class="text-xs" style="color:#92400E">×</span>
         <span class="badge" style="background:#FDE68A;color:#92400E;font-size:11px">${esc(calcRate)}%</span>
        <span class="text-xs" style="color:#92400E">=</span>
        <span id="ret-calc-${i}" class="text-sm font-bold" style="color:#D97706;min-width:70px">${calcAmount}</span>
        <button class="btn btn-sm" style="background:#D97706;color:#fff;padding:4px 10px;font-size:12px" onclick="applyRetentionCalc(${i})">
          <i class="fas fa-check"></i> Aplicar al comprobante
        </button>
      </div>` : ''}`;
    
    }).join('');
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

// ── Cartera: saldo de documentos de cruce por tercero ────────────────────────
let CARTERA_MODAL_PREV = null;
let CARTERA_CONTEXT = 'new';
let CARTERA_TARGET_LINE = null; // índice de línea destino al abrir cartera desde lupa de línea

function closeCarteraModal() {
  CARTERA_TARGET_LINE = null;
  if (CARTERA_MODAL_PREV) {
    const prev = CARTERA_MODAL_PREV;
    CARTERA_MODAL_PREV = null;
    openModal(prev.title, prev.body, prev.footer, prev.wide);
    if (prev.editForm) {
      const d = $('#edit-tx-date');
      const t = $('#edit-tx-third');
      const x = $('#edit-tx-desc');
      if (d) d.value = prev.editForm.date || '';
      if (t) t.value = prev.editForm.third || '';
      if (x) x.value = prev.editForm.desc || '';
      if (TX_EDIT_STATE) TX_EDIT_STATE.selectedThird = prev.editForm.third || '';
    }
    bindEditCarteraEvents();
    return;
  }
  closeModal();
}

// Abre cartera desde botón lupa de una línea específica
function showCarteraForLine(lineIdx, ctx) {
  const state = ctx === 'edit' ? TX_EDIT_STATE : TX_STATE;
  const thirdId = state.lines[lineIdx]?.third_party_id ||
    (ctx === 'edit'
      ? ($('#edit-tx-third')?.value || TX_EDIT_STATE?.selectedThird)
      : getSelectVal('tx-third'));
  if (!thirdId) { showToast('Selecciona un tercero para esta línea o en el encabezado', 'warning'); return; }
  CARTERA_TARGET_LINE = lineIdx;
  CARTERA_CONTEXT = ctx;
  showCarteraModal(thirdId, { returnToPrevious: true, skipCtxOverride: true });
}

async function showCarteraModal(thirdId, opts = {}) {
    const { returnToPrevious = false, skipCtxOverride = false } = opts;
    if (!thirdId) return;
    const usingEdit = !!$('#edit-tx-third') && !!TX_EDIT_STATE?.accountMap?.size;
    if (!skipCtxOverride) {
      CARTERA_CONTEXT = (returnToPrevious || usingEdit) ? 'edit' : 'new';
    }
    const state = usingEdit ? TX_EDIT_STATE : TX_STATE;
    const tercero = (state.terceros || []).find(t => t.id === thirdId);
    const cruceAccountIds = new Set(
      [...(state.accountMap?.values?.() || [])]
        .filter(a => a.maneja_cruce)
        .map(a => a.id)
    );

    if (returnToPrevious && $('#modal-overlay')?.classList.contains('show')) {
      CARTERA_MODAL_PREV = {
        title: $('#modal-title')?.innerHTML || '',
        body: $('#modal-body')?.innerHTML || '',
        footer: $('#modal-footer')?.innerHTML || '',
        wide: $('#modal-box')?.classList.contains('wide') || false,
        editForm: {
          date: $('#edit-tx-date')?.value || '',
          third: $('#edit-tx-third')?.value || '',
          desc: $('#edit-tx-desc')?.value || '',
        },
      };
    } else {
      CARTERA_MODAL_PREV = null;
    }

    openModal(
      `<i class="fas fa-file-invoice-dollar mr-2" style="color:#1A4B8C"></i>Cartera: ${esc(tercero?.name || thirdId)}`,
      `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando movimientos...</div>`,
      `<button class="btn btn-outline" onclick="closeCarteraModal()">Cerrar</button>`,
      true
    );

    try {
      if (!cruceAccountIds.size) {
        document.querySelector('#modal-body, .modal-body, [id*="modal"] .p-6') &&
          (document.querySelector('#modal-body, .modal-body, [id*="modal"] .p-6').innerHTML =
            '<p class="text-center py-6" style="color:#9CA3AF">No hay cuentas configuradas con documento de cruce.</p>');
        return;
      }

      // Fetch all tx_lines for this third party on cruce accounts (via relation filter)
      const safeId = pb.escapeFilterValue(thirdId);
      let lines;
      try {
        lines = await pb.listAll('tx_lines', {
          filter: `tx_id.third_party_id="${safeId}" && account_id.maneja_cruce=true`,
          expand: 'account_id,tx_id',
          sort: 'tx_id.date',
        });
      } catch (_) {
        // Fallback: fetch without relation filter and filter in JS
        const allLines = await pb.listAll('tx_lines', {
          filter: `tx_id.third_party_id="${safeId}"`,
          expand: 'account_id,tx_id',
          sort: '-id',
        });
        lines = { items: (Array.isArray(allLines) ? allLines : (allLines?.items || [])).filter(l => cruceAccountIds.has(l.account_id)) };
      }

      const items = lines.items ?? lines;

      // Aggregate by cross_doc_ref
      const docs = new Map(); // cross_doc_ref → { ref, account, date, debit, credit, txNumbers }
      for (const l of items) {
        const ref = (l.cross_doc_ref || '').trim();
        if (!ref) continue;
        if (!docs.has(ref)) {
          docs.set(ref, {
            ref,
            account: l.expand?.account_id?.name || l.account_id,
            firstDate: l.expand?.tx_id?.date || '',
            debit: 0,
            credit: 0,
            txNumbers: new Set(),
          });
        }
        const d = docs.get(ref);
        d.debit  += Number(l.debit  || 0);
        d.credit += Number(l.credit || 0);
        if (l.expand?.tx_id?.number) d.txNumbers.add(l.expand.tx_id.number);
      }

      if (!docs.size) {
        _carteraSetContent(`<p class="text-center py-8" style="color:#9CA3AF"><i class="fas fa-check-circle mr-2" style="color:#22C55E"></i>No hay documentos de cruce pendientes para este tercero.</p>`);
        return;
      }

      // Build table rows with signed open amount
      const rows = [...docs.values()].map(d => {
        const netOpen = Number(d.credit || 0) - Number(d.debit || 0);
        const saldo = Math.abs(netOpen);
        const esCancelado = saldo < 0.01;
        return { ...d, saldo, esCancelado, netOpen };
      });

      const pendientes = rows.filter(r => !r.esCancelado);
      const cancelados = rows.filter(r => r.esCancelado);

      const rowHtml = (r, dimmed) => `
        <tr style="${dimmed ? 'opacity:0.45' : ''}">
          <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(r.ref)}</span></td>
          <td class="text-xs" style="color:#6B7280">${esc(r.firstDate)}</td>
          <td class="text-xs">${esc(r.account)}</td>
          <td class="text-right">${fmt(r.debit)}</td>
          <td class="text-right">${fmt(r.credit)}</td>
          <td class="text-right font-bold" style="color:${r.esCancelado ? '#22C55E' : '#EF4444'}">
            ${r.esCancelado ? '<i class="fas fa-check"></i> Cancelado' : fmt(r.saldo)}
          </td>
          <td>
            ${!r.esCancelado ? `<button class="btn btn-outline btn-sm" style="border-color:#1A4B8C;color:#1A4B8C;font-size:11px" onclick="useCrossDoc('${esc(r.ref)}', ${Number(r.netOpen || 0)})">
              <i class="fas fa-arrow-down-to-line"></i> Usar
            </button>` : ''}
          </td>
        </tr>`;

      const totalPendiente = pendientes.reduce((s, r) => s + r.saldo, 0);

      _carteraSetContent(`
        <div class="mb-3 flex items-center gap-3 flex-wrap">
          <span class="text-sm font-semibold" style="color:#0D2137">Documentos pendientes: <span style="color:#EF4444">${pendientes.length}</span></span>
          <span class="text-sm font-semibold" style="color:#0D2137">Saldo total abierto: <span style="color:#EF4444">${fmt(totalPendiente)}</span></span>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Doc. Cruce</th><th>Fecha</th><th>Cuenta</th><th>Débito Acum.</th><th>Crédito Acum.</th><th>Saldo</th><th></th></tr></thead>
            <tbody>
              ${pendientes.map(r => rowHtml(r, false)).join('')}
              ${cancelados.map(r => rowHtml(r, true)).join('')}
            </tbody>
          </table>
        </div>
        <p class="text-xs mt-3" style="color:#9CA3AF"><i class="fas fa-info-circle mr-1"></i>Haz clic en <strong>Usar</strong> para aplicar el documento de cruce a la línea correspondiente del comprobante actual.</p>
      `);
    } catch (err) {
      _carteraSetContent(`<p class="text-center py-6" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</p>`);
    }
  }

function _carteraSetContent(html) {
  const body = $('#modal-body');
  if (body) body.innerHTML = html;
}

function getCrossAutoMode() {
  const txTypeId = getSelectVal('tx-type');
  const tt = TX_STATE.txTypes.find(t => t.id === txTypeId);
  if (!tt) return null;
  const text = `${tt.code || ''} ${tt.prefix || ''} ${tt.name || ''} ${tt.description || ''}`.toLowerCase();
  if (/(recaudo|recibo|ingreso\s+de\s+caja|recaudo\s+de\s+cartera)/.test(text)) return 'recaudo';
  if (/(egreso|pago\s+a\s+proveedores|pago\s+proveedor|pago\s+proveedores|salida\s+de\s+caja)/.test(text)) return 'egreso';
  return null;
}

function applyCrossAmountByType(lineIdx, netOpen, state = TX_STATE) {
  const mode = getCrossAutoMode();
  if (!mode) return false;
  const amount = Number(netOpen || 0);
  if (!Number.isFinite(amount) || Math.abs(amount) < 0.0001) return false;

  let debit = 0;
  let credit = 0;
  if (mode === 'recaudo') {
    if (amount < 0) debit = Math.abs(amount);
    else credit = Math.abs(amount);
  } else {
    if (amount > 0) credit = Math.abs(amount);
    else debit = Math.abs(amount);
  }

  state.lines[lineIdx].debit = debit;
  state.lines[lineIdx].credit = credit;
  return true;
}

function useCrossDoc(ref, netOpen = 0) {
  const inEdit = CARTERA_CONTEXT === 'edit' || (!!$('#edit-tx-lines') && !!TX_EDIT_STATE?.accountMap?.size);
  const state = inEdit ? TX_EDIT_STATE : TX_STATE;
  const rerender = inEdit ? renderEditTxLines : renderTxLines;

  // Si viene del botón lupa de una línea específica, aplicar directamente a esa línea
  if (CARTERA_TARGET_LINE !== null) {
    const targetIdx = CARTERA_TARGET_LINE;
    CARTERA_TARGET_LINE = null;
    state.lines[targetIdx].cross_doc_ref = ref;
    const autoApplied = applyCrossAmountByType(targetIdx, netOpen, state);
    closeCarteraModal();
    rerender(true);
    if (autoApplied) {
      showToast(`Documento "${ref}" aplicado a la línea ${targetIdx + 1} con valor ${fmt(Math.abs(Number(netOpen || 0)))}`, 'success');
    } else {
      showToast(`Documento "${ref}" aplicado a la línea ${targetIdx + 1}`, 'success');
    }
    return;
  }

  const idx = state.lines.findIndex(l => {
    const a = state.accountMap.get(l.account_id);
    return a?.maneja_cruce && !l.cross_doc_ref;
  });
  const applyToLine = (lineIdx) => {
    state.lines[lineIdx].cross_doc_ref = ref;
    const autoApplied = applyCrossAmountByType(lineIdx, netOpen, state);
    closeCarteraModal();
    rerender(true);
    if (autoApplied) {
      showToast(`Documento "${ref}" aplicado a la línea ${lineIdx + 1} con valor ${fmt(Math.abs(Number(netOpen || 0)))}`, 'success');
    } else {
      showToast(`Documento "${ref}" aplicado a la línea ${lineIdx + 1}`, 'success');
    }
  };

  if (idx === -1) {
    const anyIdx = state.lines.findIndex(l => state.accountMap.get(l.account_id)?.maneja_cruce);
    if (anyIdx === -1) {
      closeCarteraModal();
      showToast('Primero selecciona una cuenta con documento de cruce en las líneas del comprobante', 'warning');
      return;
    }
    applyToLine(anyIdx);
    return;
  }
  applyToLine(idx);
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
      if (closed) return showToast(`El período ${txDate.slice(0,7)} no está habilitado o está cerrado. Habilítalo en Cierre Contable antes de registrar.`, 'error');
    }

    if (!validLines.length) return showToast('Debe existir al menos una línea válida', 'warning');
    if (validLines.length < 2) return showToast('Se requieren al menos 2 líneas contables', 'warning');

    // Regla 1: solo cuentas de movimiento (no cuentas padre)
    const nonPostableLine = validLines.find(l => !TX_STATE.postableAccountIds.has(l.account_id));
    if (nonPostableLine) {
      const acc = TX_STATE.accounts.find(a => a.id === nonPostableLine.account_id);
      return showToast(`La cuenta ${acc?.code || ''} es de mayor; usa una cuenta auxiliar para registrar movimientos`, 'error');
    }

    // Regla 2: cuentas que requieren tercero deben tener tercero por línea o por encabezado
    const missingThirdLine = validLines.find((l) => {
      const a = TX_STATE.accounts.find(x => x.id === l.account_id);
      return !!a?.requires_third_party && !(l.third_party_id || thirdId);
    });
    if (missingThirdLine) {
      const idx = TX_STATE.lines.indexOf(missingThirdLine);
      return showToast(`La línea ${idx + 1} requiere tercero. Selecciónalo en la línea o en el encabezado.`, 'error');
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
      cross_enabled: validLines.some(l => TX_STATE.accountMap.get(l.account_id)?.maneja_cruce),
      status: 'active',
    }, validLines.map((l, i) => ({
      account_id: l.account_id,
      third_party_id: l.third_party_id || thirdId || null,
      debit: Number(l.debit || 0),
      credit: Number(l.credit || 0),
      description: l.description || txDesc,
      line_order: i + 1,
      cross_doc_ref: l.cross_doc_ref || '',
    })));

    showToast(`Transacción ${tx.number} guardada`, 'success');
    navigate('consulta-tx');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Consulta de Transacciones ─────────────────────────────────────────────────
let CTXQ_STATE = { page: 1, perPage: 50, total: 0, txTypes: [], periods: [] };

function calcPeriodRange(periodKey) {
  const [yStr, mStr] = String(periodKey || '').split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return null;
  const from = `${yStr}-${String(m).padStart(2, '0')}-01`;
  const next = m === 12 ? `${String(y + 1)}-01-01` : `${yStr}-${String(m + 1).padStart(2, '0')}-01`;
  return { from, next };
}

function normalizeConsultaPeriods(raw) {
  if (!raw) return [];
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(p => p && /^\d{4}-\d{2}$/.test(String(p.key || '')) && p.enabled !== false)
    .map(p => ({ key: String(p.key), closed: !!p.closed }))
    .sort((a, b) => b.key.localeCompare(a.key));
}

async function renderConsultaTx(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando transacciones...</div>`;
  try {
    const [txTypes, periodosRaw] = await Promise.all([
      API.getTxTypes(),
      API.getSetting('periodos_cierre'),
    ]);
    const periods = normalizeConsultaPeriods(periodosRaw);
    CTXQ_STATE = { page: 1, perPage: 50, total: 0, txTypes, periods };
    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Consulta de Transacciones</h3>
          <p class="text-sm" style="color:#6B7280">Consulta por período y tipo para mantener rendimiento con alto volumen.</p>
        </div>
        ${can('canExport') ? '<button class="btn btn-outline" id="btn-export-tx"><i class="fas fa-file-excel"></i> Exportar</button>' : ''}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select id="txq-period-state" class="form-input">
            <option value="">Estado del período</option>
            <option value="open">Abiertos</option>
            <option value="closed">Cerrados</option>
          </select>
          <select id="txq-period" class="form-input" disabled>
            <option value="">Selecciona un período</option>
          </select>
          <select id="txq-type" class="form-input" disabled>
            <option value="">Selecciona tipo de transacción</option>
            ${txTypes.map(t => `<option value="${esc(t.id)}">${esc(t.prefix)} - ${esc(t.name)}</option>`).join('')}
          </select>
          <input id="txq" class="form-input md:col-span-2" placeholder="Buscar número, tercero, descripción...">
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
          <div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-filter mr-2"></i>Selecciona estado de período, período y tipo para consultar.</div>
        </div>
        <div id="ctxq-pagination" class="flex items-center justify-between px-4 py-3 border-t" style="border-color:#F0F0F0; display:none!important"></div>
      </div>`;

    const updatePeriodOptions = () => {
      const state = getSelectVal('txq-period-state');
      const periodEl = $('#txq-period');
      const typeEl = $('#txq-type');
      if (!periodEl || !typeEl) return;

      const filtered = CTXQ_STATE.periods.filter(p => state === 'open' ? !p.closed : state === 'closed' ? p.closed : false);
      periodEl.innerHTML = `<option value="">Selecciona un período</option>${filtered.map(p => `<option value="${esc(p.key)}">${esc(p.key)} (${p.closed ? 'Cerrado' : 'Abierto'})</option>`).join('')}`;
      periodEl.disabled = !state;
      periodEl.value = '';
      typeEl.value = '';
      typeEl.disabled = true;
    };

    const updateTypeEnabled = () => {
      const typeEl = $('#txq-type');
      if (!typeEl) return;
      typeEl.disabled = !getSelectVal('txq-period');
      if (typeEl.disabled) typeEl.value = '';
    };

    const doSearch = () => {
      if (!getSelectVal('txq-period-state')) return showToast('Selecciona el estado del período (abierto/cerrado).', 'warning');
      if (!getSelectVal('txq-period')) return showToast('Selecciona un período para filtrar la consulta.', 'warning');
      if (!getSelectVal('txq-type')) return showToast('Selecciona el tipo de transacción a consultar.', 'warning');
      CTXQ_STATE.page = 1;
      loadConsultaTxPage();
    };
    $('#btn-txq-search')?.addEventListener('click', doSearch);
    $('#txq')?.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    $('#txq-period-state')?.addEventListener('change', updatePeriodOptions);
    $('#txq-period')?.addEventListener('change', updateTypeEnabled);
    $('#btn-txq-clear')?.addEventListener('click', () => {
      ['txq'].forEach(id => setInputVal(id, ''));
      ['txq-period-state','txq-type','txq-status'].forEach(id => { const el = $(`#${id}`); if (el) el.value = ''; });
      const periodEl = $('#txq-period');
      if (periodEl) {
        periodEl.innerHTML = '<option value="">Selecciona un período</option>';
        periodEl.disabled = true;
      }
      const typeEl = $('#txq-type');
      if (typeEl) typeEl.disabled = true;
      $('#ctxq-results').innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-filter mr-2"></i>Selecciona estado de período, período y tipo para consultar.</div>';
      $('#ctxq-pagination').style.display = 'none';
    });
    $('#btn-export-tx')?.addEventListener('click', exportConsultaTx);

    if (!periods.length) {
      showToast('No hay períodos configurados. Habilítalos en Cierre Contable para usar esta consulta.', 'warning');
    }
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
    const periodState = getSelectVal('txq-period-state');
    const periodKey = getSelectVal('txq-period');
    const typeId = getSelectVal('txq-type');
    const status = getSelectVal('txq-status');

    if (!periodState || !periodKey || !typeId) {
      resultsDiv.innerHTML = '<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-filter mr-2"></i>Completa los filtros obligatorios para consultar.</div>';
      paginDiv.style.display = 'none';
      return;
    }

    const range = calcPeriodRange(periodKey);
    if (!range) {
      resultsDiv.innerHTML = '<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>Período inválido.</div>';
      paginDiv.style.display = 'none';
      return;
    }

    const filters = [];
    const safeType = pb.escapeFilterValue(typeId);
    filters.push(`tx_type_id="${safeType}"`);
    filters.push(`date>="${range.from}"`);
    filters.push(`date<"${range.next}"`);
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

    const res = await pb.list('transactions', request);
    CTXQ_STATE.total = res.totalItems;
    const totalPages = Math.ceil(res.totalItems / CTXQ_STATE.perPage) || 1;

    // Totales por transacción (débito/crédito) para mostrar balance en la grilla
    const totalsByTx = new Map();
    const txIds = res.items.map(t => t.id).filter(Boolean);
    if (txIds.length) {
      const linesFilter = txIds.map(id => `tx_id="${pb.escapeFilterValue(id)}"`).join(' || ');
      const lines = await pb.listAll('tx_lines', { filter: linesFilter });
      lines.forEach(l => {
        const key = l.tx_id;
        if (!totalsByTx.has(key)) totalsByTx.set(key, { d: 0, c: 0 });
        const acc = totalsByTx.get(key);
        acc.d += Number(l.debit || 0);
        acc.c += Number(l.credit || 0);
      });
    }

    if (!res.items.length) {
      resultsDiv.innerHTML = '<div class="p-10 text-center" style="color:#9CA3AF">No se encontraron transacciones con los filtros aplicados.</div>';
      paginDiv.style.display = 'none';
      return;
    }

    resultsDiv.innerHTML = `
      <div class="overflow-x-auto">
        <table class="data-table" id="tx-table">
          <thead><tr><th>Número</th><th>Fecha</th><th>Tercero</th><th>Descripción</th><th>Débito</th><th>Crédito</th><th>Balance</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            ${res.items.map(t => {
              const sums = totalsByTx.get(t.id) || { d: 0, c: 0 };
              const diff = Math.abs(Number(sums.d || 0) - Number(sums.c || 0));
              const balanced = diff < 0.0001;
              return `
              <tr>
                <td><span class="font-mono font-semibold text-sm" style="color:#1A4B8C">${esc(t.number || '')}</span></td>
                <td>${esc(t.date)}</td>
                <td>${esc(t.expand?.third_party_id?.name || '—')}</td>
                <td class="max-w-xs truncate" title="${esc(t.description || '')}">${esc(t.description || '—')}</td>
                <td class="font-semibold" style="color:#065F46">${fmt(sums.d || 0)}</td>
                <td class="font-semibold" style="color:#1E3A8A">${fmt(sums.c || 0)}</td>
                <td>
                  ${balanced
                    ? '<span class="badge badge-green">Cuadrada</span>'
                    : `<span class="badge badge-red" title="Diferencia entre débito y crédito"><i class="fas fa-triangle-exclamation mr-1"></i>Descuadre ${fmt(diff)}</span>`}
                </td>
                <td>${t.status === 'voided' ? '<span class="badge badge-red">Anulada</span>' : '<span class="badge badge-green">Activa</span>'}</td>
                <td>
                  <div class="flex gap-1">
                    <button class="btn btn-outline btn-sm" title="Ver detalle" onclick="seeTxDetail('${esc(t.id)}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-outline btn-sm" title="Imprimir nota contable" style="border-color:#334155;color:#334155" onclick="printTxNotaContable('${esc(t.id)}')"><i class="fas fa-print"></i></button>
                    ${can('canWrite') && t.status === 'active' ? `<button class="btn btn-outline btn-sm" title="Modificar" style="border-color:#1A4B8C;color:#1A4B8C" onclick="editTx('${esc(t.id)}')"><i class="fas fa-pencil"></i></button>` : ''}
                    ${can('canDelete') && t.status !== 'voided' ? `<button class="btn btn-danger btn-sm" title="Anular" onclick="voidTx('${esc(t.id)}')"><i class="fas fa-ban"></i></button>` : ''}
                    ${requireRole('admin') ? `<button class="btn btn-sm" title="Eliminar permanentemente" style="background:#7F1D1D;color:#fff;border-color:#7F1D1D" onclick="deleteTxPhysical('${esc(t.id)}','${esc(t.number||'')}')"><i class="fas fa-trash"></i></button>` : ''}
                  </div>
                </td>
              </tr>`;
            }).join('')}
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
    const periodState = getSelectVal('txq-period-state');
    const periodKey = getSelectVal('txq-period');
    const typeId = getSelectVal('txq-type');
    const status = getSelectVal('txq-status');

    if (!periodState || !periodKey || !typeId) {
      return showToast('Para exportar debes seleccionar estado de período, período y tipo.', 'warning');
    }
    const range = calcPeriodRange(periodKey);
    if (!range) return showToast('Período inválido para exportación.', 'error');

    const filters = [];
    const safeType = pb.escapeFilterValue(typeId);
    filters.push(`tx_type_id="${safeType}"`);
    filters.push(`date>="${range.from}"`);
    filters.push(`date<"${range.next}"`);
    if (status) {
      const safe = pb.escapeFilterValue(status);
      filters.push(`status="${safe}"`);
    }
    if (q) {
      const safe = pb.escapeFilterValue(q);
      filters.push(`(number~"${safe}" || description~"${safe}")`);
    }
    const all = await pb.listAll('transactions', { sort: '-id', filter: filters.join(' && ') || '', expand: 'tx_type_id,third_party_id' });
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
        <table class="data-table"><thead><tr><th>Cuenta</th><th>Tercero línea</th><th>Doc. Cruce</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
          <tbody>${lines.map(l => `<tr><td>${esc(l.expand?.account_id?.code || '')} - ${esc(l.expand?.account_id?.name || '')}</td><td>${esc(l.expand?.third_party_id?.name || '\u2014')}</td><td>${l.cross_doc_ref ? `<span class="badge" style="background:#EFF6FF;color:#1A4B8C"><i class="fas fa-link mr-1"></i>${esc(l.cross_doc_ref)}</span>` : '\u2014'}</td><td>${esc(l.description || '\u2014')}</td><td>${fmt(l.debit || 0)}</td><td>${fmt(l.credit || 0)}</td></tr>`).join('')}</tbody>
        </table>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>
       <button class="btn btn-outline" style="border-color:#334155;color:#334155" onclick="printTxNotaContable('${esc(id)}')"><i class="fas fa-print mr-1"></i>Imprimir nota contable</button>`,
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
        if (closed) return showToast(`El período ${(tx.date||'').slice(0,7)} no está habilitado o está cerrado. No se puede anular.`, 'error');
      }
      await API.voidTransaction(id, 'Anulación desde consulta');
      showToast('Transacción anulada', 'success');
      renderConsultaTx($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

// ── Estado para edición de transacción ───────────────────────────────────────
let TX_EDIT_STATE = {
  txId: null,
  accounts: [],
  txTypes: [],
  terceros: [],
  selectedThird: '',
  lines: [],
  postableAccountIds: new Set(),
  accountMap: new Map(),
};

async function editTx(id) {
  if (!can('canWrite')) return showToast('No tienes permisos para modificar transacciones', 'error');

  openModal('<i class="fas fa-spinner fa-spin mr-2"></i>Verificando transacción...',
    '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando datos...</div>', '', true);

  try {
    const [tx, lines, accounts, txTypes, terceros] = await Promise.all([
      pb.get('transactions', id, { expand: 'tx_type_id,third_party_id' }),
      API.getTxLines(id),
      API.getAccounts(true),
      API.getTxTypes(),
      API.getTerceros({}),
    ]);

    if (tx.status === 'voided') {
      return openModal('No permitido',
        '<p class="text-sm" style="color:#374151">No se puede modificar una transacción anulada.</p>',
        '<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>');
    }

    if (typeof isPeriodClosed === 'function') {
      const closed = await isPeriodClosed(tx.date);
      if (closed) {
        return openModal('Período cerrado',
          `<p class="text-sm" style="color:#374151">El período <strong>${esc((tx.date||'').slice(0,7))}</strong> está cerrado. Habilítalo en Cierre Contable para poder modificar esta transacción.</p>`,
          '<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>');
      }
    }

    const deps = await API.checkTxDependencies(id);
    if (deps.blocks.length) {
      const listHtml = deps.blocks.map(b => `<li class="text-sm py-1"><i class="fas fa-ban mr-2" style="color:#EF4444"></i>${esc(b)}</li>`).join('');
      return openModal('<i class="fas fa-lock mr-2" style="color:#EF4444"></i>No se puede modificar',
        `<p class="text-sm mb-3" style="color:#374151">Esta transacción tiene dependencias que impiden su modificación:</p><ul class="space-y-1">${listHtml}</ul>`,
        '<button class="btn btn-outline" onclick="closeModal()">Entendido</button>');
    }

    const parentCodes = new Set(accounts.map(a => a.parent_code).filter(Boolean));
    const postableAccountIds = new Set(accounts.filter(a => !parentCodes.has(a.code)).map(a => a.id));
    const accountMap = new Map(accounts.map(a => [a.id, a]));
    TX_EDIT_STATE = {
      txId: id, accounts, txTypes, terceros, postableAccountIds, accountMap,
      selectedThird: tx.third_party_id || '',
      lines: lines.map(l => ({
        account_id: l.account_id,
        third_party_id: l.third_party_id || tx.third_party_id || '',
        debit: l.debit || 0,
        credit: l.credit || 0,
        description: l.description || '',
        cross_doc_ref: l.cross_doc_ref || '',
        ret_base: '',
        ret_rate: '',
        line_order: l.line_order || 0,
      })),
    };

    const warnHtml = deps.warnings.length
      ? `<div class="mb-4 p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #D97706">${deps.warnings.map(w => `<p class="text-sm" style="color:#92400E"><i class="fas fa-triangle-exclamation mr-2"></i>${esc(w)}</p>`).join('')}</div>`
      : '';

    openModal(
      `<i class="fas fa-pencil mr-2" style="color:#1A4B8C"></i>Modificar — ${esc(tx.number || '')}`,
      `${warnHtml}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <input class="form-input" value="${esc(tx.expand?.tx_type_id?.name || '')}" readonly style="background:#F9FAFB">
        </div>
        <div class="form-group">
          <label class="form-label">Número</label>
          <input class="form-input" value="${esc(tx.number || '')}" readonly style="background:#F9FAFB">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha</label>
          <input id="edit-tx-date" type="date" class="form-input" value="${esc(tx.date || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Tercero</label>
          <div class="flex gap-2">
            <select id="edit-tx-third" class="form-input" style="flex:1">
              <option value="">Sin tercero</option>
              ${terceros.map(t => `<option value="${esc(t.id)}" ${tx.third_party_id === t.id ? 'selected' : ''}>${esc(t.doc_number)} - ${esc(t.name)}</option>`).join('')}
            </select>
            <button id="btn-edit-cartera" class="btn btn-outline btn-sm" title="Ver saldo de cartera del tercero" style="white-space:nowrap;border-color:#1A4B8C;color:#1A4B8C" ${tx.third_party_id ? '' : 'disabled'}>
              <i class="fas fa-file-invoice-dollar"></i> Cartera
            </button>
          </div>
        </div>
        <div class="form-group md:col-span-4">
          <label class="form-label">Descripción</label>
          <input id="edit-tx-desc" class="form-input" value="${esc(tx.description || '')}">
        </div>
      </div>
      <div class="border-t pt-4" style="border-color:#F0F0F0">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-bold text-sm" style="color:#0D2137">Líneas contables</h4>
          <button class="btn btn-outline btn-sm" onclick="addEditTxLine()"><i class="fas fa-plus"></i> Agregar línea</button>
        </div>
        <div id="edit-tx-lines"></div>
        <div id="edit-tx-balance" class="balance-indicator balance-err mt-3"><i class="fas fa-triangle-exclamation"></i> Descuadrada</div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-primary" onclick="saveEditTx('${esc(id)}')"><i class="fas fa-floppy-disk"></i> Guardar cambios</button>`,
      true
    );

    renderEditTxLines(true);
    bindEditCarteraEvents();
  } catch (err) {
    openModal('Error', `<p class="text-sm" style="color:#EF4444">${esc(err.message)}</p>`, '<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>');
  }
}

function bindEditCarteraEvents() {
  const third = $('#edit-tx-third');
  const btn = $('#btn-edit-cartera');
  if (!third || !btn) return;

  if (TX_EDIT_STATE) TX_EDIT_STATE.selectedThird = third.value || TX_EDIT_STATE.selectedThird || '';
  btn.disabled = !third.value;
  third.onchange = () => {
    btn.disabled = !third.value;
    if (TX_EDIT_STATE) TX_EDIT_STATE.selectedThird = third.value || '';
  };
  btn.onclick = () => showCarteraModal(third.value, { returnToPrevious: true });
}

function addEditTxLine(row = null) {
  TX_EDIT_STATE.lines.push(row || { account_id: '', third_party_id: '', debit: 0, credit: 0, description: '', cross_doc_ref: '', ret_base: '', ret_rate: '' });
  renderEditTxLines(true);
}

function removeEditTxLine(i) {
  TX_EDIT_STATE.lines.splice(i, 1);
  renderEditTxLines(true);
}

function updateEditTxLine(i, field, value) {
  TX_EDIT_STATE.lines[i][field] = value;
  if (field === 'debit'  && Number(value) > 0) TX_EDIT_STATE.lines[i].credit = 0;
  if (field === 'credit' && Number(value) > 0) TX_EDIT_STATE.lines[i].debit  = 0;
  if (field === 'account_id') {
    TX_EDIT_STATE.lines[i].cross_doc_ref = '';
    TX_EDIT_STATE.lines[i].ret_base = '';
    const acct = TX_EDIT_STATE.accountMap.get(value);
    if (acct?.maneja_retenciones) {
      const tipos = (acct.tipos_retencion || '').split(',').filter(Boolean);
      TX_EDIT_STATE.lines[i].ret_rate = String(defaultRetRate(tipos, acct));
    } else {
      TX_EDIT_STATE.lines[i].ret_rate = '';
    }
    renderEditTxLines(true);
  } else if (field === 'ret_base' || field === 'ret_rate') {
    const base = Number(TX_EDIT_STATE.lines[i].ret_base || 0);
    const rate = Number(TX_EDIT_STATE.lines[i].ret_rate  || 0);
    const el = document.getElementById(`edit-ret-calc-${i}`);
    if (el) el.textContent = base && rate ? fmt(base * rate / 100) : '$0';
  } else {
    renderEditTxLines(false);
  }
}

function applyEditRetentionCalc(i) {
  const line = TX_EDIT_STATE.lines[i];
  const base = Number(line.ret_base || 0);
  const acct = TX_EDIT_STATE.accountMap.get(line.account_id);
  const tipos = (acct?.tipos_retencion || '').split(',').filter(Boolean);
  const rate = Number(line.ret_rate || defaultRetRate(tipos, acct) || 0);
  TX_EDIT_STATE.lines[i].ret_rate = rate ? String(rate) : '';
  if (!base || !rate) return showToast('Ingresa la base gravable para calcular la retención', 'warning');
  const amount = Math.round(base * rate / 100);
  if (acct?.nature === 'debit') {
    TX_EDIT_STATE.lines[i].debit  = amount;
    TX_EDIT_STATE.lines[i].credit = 0;
  } else {
    TX_EDIT_STATE.lines[i].credit = amount;
    TX_EDIT_STATE.lines[i].debit  = 0;
  }
  renderEditTxLines(true);
  showToast(`Retención aplicada: ${fmt(amount)}`, 'success');
}

function renderEditTxLines(repaint = true) {
  if (repaint) {
    const html = TX_EDIT_STATE.lines.map((line, i) => {
      const acct      = TX_EDIT_STATE.accountMap.get(line.account_id);
      const needsThird = !!acct?.requires_third_party;
      const needsCruce = !!acct?.maneja_cruce;
      const needsRet   = !!acct?.maneja_retenciones;
      const tiposRet   = (acct?.tipos_retencion || '').split(',').filter(Boolean);
      const calcBase   = Number(line.ret_base || 0);
      const calcRate   = Number(line.ret_rate !== '' ? line.ret_rate : (tiposRet.length ? defaultRetRate(tiposRet, acct) : 0));
      const calcAmount = calcBase && calcRate ? fmt(calcBase * calcRate / 100) : '$0';
      return `
      <div class="tx-line-row" data-i="${i}">
        <select class="form-input" onchange="updateEditTxLine(${i}, 'account_id', this.value)">
          <option value="">Seleccione cuenta...</option>
          ${TX_EDIT_STATE.accounts.map(a => {
            const postable = TX_EDIT_STATE.postableAccountIds.has(a.id);
            return `<option value="${esc(a.id)}" ${line.account_id === a.id ? 'selected' : ''} ${postable ? '' : 'disabled'}>${esc(a.code)} - ${esc(a.name)}${postable ? '' : ' [MAYOR]'}</option>`;
          }).join('')}
        </select>
        <input class="form-input text-right" value="${line.debit ? esc(line.debit) : ''}" placeholder="Débito" oninput="updateEditTxLine(${i}, 'debit', parseNum(this.value))">
        <input class="form-input text-right" value="${line.credit ? esc(line.credit) : ''}" placeholder="Crédito" oninput="updateEditTxLine(${i}, 'credit', parseNum(this.value))">
        <button class="btn btn-danger btn-sm" onclick="removeEditTxLine(${i})"><i class="fas fa-xmark"></i></button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin:-2px 0 6px 0;padding:5px 8px;background:#F8FAFC;border-left:3px solid #64748B;border-radius:0 6px 6px 0">
        <i class="fas fa-user-tag" style="color:#334155;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#334155;white-space:nowrap">Tercero línea</span>
        <select class="form-input" style="max-width:340px;font-size:13px" onchange="updateEditTxLine(${i}, 'third_party_id', this.value)">
          <option value="">Usar tercero del encabezado</option>
          ${TX_EDIT_STATE.terceros.map(t => `<option value="${esc(t.id)}" ${line.third_party_id === t.id ? 'selected' : ''}>${esc(t.doc_number)} - ${esc(t.name)}</option>`).join('')}
        </select>
        ${needsThird ? '<span class="text-xs" style="color:#B91C1C">Obligatorio para esta cuenta</span>' : '<span class="text-xs" style="color:#94A3B8">Opcional</span>'}
        ${needsCruce ? `<button class="btn btn-outline btn-sm" style="padding:3px 8px;font-size:11px;border-color:#1A4B8C;color:#1A4B8C;flex-shrink:0" title="Consultar cartera de este tercero" onclick="showCarteraForLine(${i}, 'edit')"><i class="fas fa-search"></i></button>` : ''}
      </div>
      ${needsCruce ? `
      <div style="display:flex;align-items:center;gap:8px;margin:-2px 0 6px 0;padding:5px 8px;background:#EFF6FF;border-left:3px solid #1A4B8C;border-radius:0 6px 6px 0">
        <i class="fas fa-link" style="color:#1A4B8C;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#1A4B8C;white-space:nowrap">Doc. de Cruce</span>
        <input class="form-input" style="max-width:200px;font-size:13px" placeholder="N° factura / documento" value="${esc(line.cross_doc_ref || '')}" oninput="updateEditTxLine(${i}, 'cross_doc_ref', this.value)">
      </div>` : ''}
      ${needsRet ? `
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:-2px 0 6px 0;padding:7px 10px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0">
        <i class="fas fa-percent" style="color:#D97706;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#92400E;white-space:nowrap">Calculadora de Retención</span>
         ${tiposRet.map(t => `<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:10px">${retRateLabel(t, acct)}</span>`).join('')}
        <span class="text-xs" style="color:#92400E">Base:</span>
        <input class="form-input" style="max-width:140px;font-size:13px" type="number" min="0" step="1" placeholder="Base gravable"
               value="${esc(line.ret_base || '')}" oninput="updateEditTxLine(${i}, 'ret_base', this.value)">
        <span class="text-xs" style="color:#92400E">×</span>
         <span class="badge" style="background:#FDE68A;color:#92400E;font-size:11px">${esc(calcRate)}%</span>
        <span id="edit-ret-calc-${i}" class="text-sm font-bold" style="color:#D97706;min-width:70px">${calcAmount}</span>
        <button class="btn btn-sm" style="background:#D97706;color:#fff;padding:4px 10px;font-size:12px" onclick="applyEditRetentionCalc(${i})">
          <i class="fas fa-check"></i> Aplicar
        </button>
      </div>` : ''}`;
    }).join('');
    const el = document.getElementById('edit-tx-lines');
    if (el) el.innerHTML = html || '<p style="color:#9CA3AF">Agrega al menos una línea.</p>';
  }

  const totals = TX_EDIT_STATE.lines.reduce((acc, l) => {
    acc.d += Number(l.debit  || 0);
    acc.c += Number(l.credit || 0);
    return acc;
  }, { d: 0, c: 0 });

  const ok = Math.abs(totals.d - totals.c) < 0.0001 && totals.d > 0;
  const b  = document.getElementById('edit-tx-balance');
  if (!b) return;
  b.className = `balance-indicator ${ok ? 'balance-ok' : 'balance-err'}`;
  b.innerHTML = ok
    ? `<i class="fas fa-check-circle"></i> Cuadrada: Débito ${fmt(totals.d)} = Crédito ${fmt(totals.c)}`
    : `<i class="fas fa-triangle-exclamation"></i> Diferencia: ${fmt(Math.abs(totals.d - totals.c))}`;
}

async function saveEditTx(txId) {
  if (!can('canWrite')) return showToast('No tienes permisos para modificar transacciones', 'error');
  const txDate  = document.getElementById('edit-tx-date')?.value || '';
  const txDesc  = (document.getElementById('edit-tx-desc')?.value || '').trim();
  const thirdId = document.getElementById('edit-tx-third')?.value || TX_EDIT_STATE.selectedThird || '';

  if (!txDate) return showToast('La fecha es obligatoria', 'warning');
  if (!txDesc) return showToast('La descripción es obligatoria', 'warning');

  const validLines = TX_EDIT_STATE.lines.filter(l => l.account_id && (Number(l.debit) > 0 || Number(l.credit) > 0));
  if (validLines.length < 2) return showToast('Se requieren al menos 2 líneas contables', 'warning');

  const nonPostable = validLines.find(l => !TX_EDIT_STATE.postableAccountIds.has(l.account_id));
  if (nonPostable) {
    const acc = TX_EDIT_STATE.accounts.find(a => a.id === nonPostable.account_id);
    return showToast(`La cuenta ${acc?.code || ''} es de mayor; usa una cuenta auxiliar`, 'error');
  }

  const missingThirdLine = validLines.find((l) => {
    const a = TX_EDIT_STATE.accounts.find(x => x.id === l.account_id);
    return !!a?.requires_third_party && !(l.third_party_id || thirdId);
  });
  if (missingThirdLine) {
    const idx = TX_EDIT_STATE.lines.indexOf(missingThirdLine);
    return showToast(`La línea ${idx + 1} requiere tercero. Selecciónalo en la línea o en el encabezado.`, 'error');
  }

  const sum = validLines.reduce((acc, l) => ({ d: acc.d + Number(l.debit || 0), c: acc.c + Number(l.credit || 0) }), { d: 0, c: 0 });
  if (Math.abs(sum.d - sum.c) > 0.0001 || sum.d <= 0) return showToast('La transacción no está cuadrada', 'error');

  if (typeof isPeriodClosed === 'function') {
    const closed = await isPeriodClosed(txDate);
    if (closed) return showToast(`El período ${txDate.slice(0,7)} está cerrado. No se puede modificar.`, 'error');
  }

  const btn = document.querySelector('#modal-footer .btn-primary');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; }

  try {
    await API.updateTransaction(txId, {
      date: txDate,
      description: txDesc,
      third_party_id: thirdId || null,
    }, validLines.map((l, idx) => ({
      account_id: l.account_id,
      third_party_id: l.third_party_id || thirdId || null,
      debit: Number(l.debit || 0),
      credit: Number(l.credit || 0),
      description: l.description || txDesc,
      line_order: idx + 1,
      cross_doc_ref: l.cross_doc_ref || '',
    })));
    closeModal();
    showToast('Transacción modificada exitosamente', 'success');
    loadConsultaTxPage();
  } catch (err) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-floppy-disk"></i> Guardar cambios'; }
    showToast(err.message, 'error');
  }
}

// ── Eliminación física (solo admin) ──────────────────────────────────────────
function deleteTxPhysical(id, number) {
  if (!requireRole('admin')) return showToast('Solo el administrador puede eliminar transacciones físicamente', 'error');

  openModal(
    '<i class="fas fa-spinner fa-spin mr-2"></i>Verificando dependencias...',
    '<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Analizando...</div>',
    '', false
  );

  API.checkTxDependencies(id).then(deps => {
    if (deps.blocks.length) {
      const listHtml = deps.blocks.map(b => `<li class="text-sm py-1"><i class="fas fa-ban mr-2" style="color:#EF4444"></i>${esc(b)}</li>`).join('');
      return openModal(
        '<i class="fas fa-lock mr-2" style="color:#EF4444"></i>No se puede eliminar',
        `<p class="text-sm mb-3" style="color:#374151">Esta transacción no puede eliminarse por las siguientes razones:</p>
         <ul class="space-y-1">${listHtml}</ul>
         <p class="text-sm mt-4" style="color:#6B7280">Usa <strong>Anular</strong> para invalidarla contablemente sin perder la trazabilidad.</p>`,
        '<button class="btn btn-outline" onclick="closeModal()">Entendido</button>'
      );
    }

    const warnHtml = deps.warnings.length
      ? `<div class="mb-3 p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #D97706">${deps.warnings.map(w => `<p class="text-sm" style="color:#92400E"><i class="fas fa-triangle-exclamation mr-2"></i>${esc(w)}</p>`).join('')}</div>`
      : '';

    openModal(
      '<i class="fas fa-trash mr-2" style="color:#991B1B"></i>Eliminar transacción permanentemente',
      `${warnHtml}
       <div class="p-3 rounded-lg mb-4" style="background:#FEF2F2;border:1px solid #FECACA">
         <p class="text-sm font-semibold mb-1" style="color:#991B1B"><i class="fas fa-triangle-exclamation mr-2"></i>Esta acción es IRREVERSIBLE</p>
         <p class="text-sm" style="color:#374151">Se eliminará permanentemente el comprobante <strong>${esc(number)}</strong> y todas sus líneas contables. No podrá recuperarse.</p>
       </div>
       <div class="form-group">
         <label class="form-label">Para confirmar, escribe el número del comprobante: <strong>${esc(number)}</strong></label>
         <input id="delete-tx-confirm-input" class="form-input" placeholder="${esc(number)}" autocomplete="off">
       </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
       <button class="btn btn-danger" id="btn-confirm-delete-tx" onclick="_confirmDeleteTx('${esc(id)}','${esc(number)}')">
         <i class="fas fa-trash"></i> Eliminar definitivamente
       </button>`
    );
  }).catch(err => {
    openModal('Error', `<p class="text-sm" style="color:#EF4444">${esc(err.message)}</p>`, '<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>');
  });
}

async function _confirmDeleteTx(id, number) {
  const input = (document.getElementById('delete-tx-confirm-input')?.value || '').trim();
  if (input !== number) return showToast(`Escribe exactamente: ${number}`, 'warning');

  const btn = document.getElementById('btn-confirm-delete-tx');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...'; }

  try {
    await pb.delete('transactions', id);
    await API.logAudit('DELETE', 'transactions', id, `Eliminación física del comprobante ${number}`);
    closeModal();
    showToast(`Comprobante ${number} eliminado permanentemente`, 'success');
    loadConsultaTxPage();
  } catch (err) {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-trash"></i> Eliminar definitivamente'; }
    showToast(err.message, 'error');
  }
}

// ── Impresión: Nota Contable ─────────────────────────────────────────────────
async function printTxNotaContable(id) {
  try {
    const [tx, lines, companyName, companyNit, companyAddress] = await Promise.all([
      pb.get('transactions', id, { expand: 'tx_type_id,third_party_id,user_id' }),
      API.getTxLines(id),
      API.getSetting('company_name').catch(() => ''),
      API.getSetting('company_nit').catch(() => ''),
      API.getSetting('company_address').catch(() => ''),
    ]);

    const totalDebit  = lines.reduce((s, l) => s + Number(l.debit  || 0), 0);
    const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    const txTypeName  = tx.expand?.tx_type_id?.name || tx.expand?.tx_type_id?.prefix || '';
    const thirdName   = tx.expand?.third_party_id?.name || '';
    const thirdDoc    = tx.expand?.third_party_id?.doc_number || '';
    const createdByName  = tx.expand?.user_id?.name || '';
    const printedByName  = pb.currentUser?.name || '';

    const linesHtml = lines.map((l, i) => {
      const accCode = l.expand?.account_id?.code || '';
      const accName = l.expand?.account_id?.name || '';
      const lineThird = l.expand?.third_party_id?.name || (thirdName ? thirdName : '—');
      const crossRef  = l.cross_doc_ref || '';
      const debit  = Number(l.debit  || 0);
      const credit = Number(l.credit || 0);
      const isDebit = debit > 0;
      return `
        <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td class="col-num">${i + 1}</td>
          <td class="col-code">${esc(accCode)}</td>
          <td class="col-acct">${esc(accName)}</td>
          <td class="col-third">${esc(lineThird)}</td>
          <td class="col-cross">${crossRef ? esc(crossRef) : ''}</td>
          <td class="col-desc">${esc(l.description || tx.description || '')}</td>
          <td class="col-money debit">${isDebit ? fmt(debit) : ''}</td>
          <td class="col-money credit">${!isDebit ? fmt(credit) : ''}</td>
        </tr>`;
    }).join('');

    const printDate = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Nota Contable ${esc(tx.number || '')}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #111; background: #fff; padding: 18mm 15mm 15mm 15mm; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #0D2137; padding-bottom: 8px; margin-bottom: 10px; }
    .company-block { flex: 1; }
    .company-name { font-size: 13pt; font-weight: bold; color: #0D2137; }
    .company-sub { font-size: 8.5pt; color: #444; margin-top: 2px; }
    .doc-block { text-align: right; min-width: 180px; }
    .doc-number { font-size: 14pt; font-weight: bold; color: #1A4B8C; letter-spacing: 0.5px; }
    .doc-type { font-size: 8.5pt; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
    .doc-date { font-size: 9pt; color: #444; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 12px; font-size: 9pt; }
    .meta-row { display: flex; gap: 6px; }
    .meta-label { font-weight: bold; color: #0D2137; white-space: nowrap; min-width: 90px; }
    .meta-value { color: #333; }
    .section-title { font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #6B7280; border-bottom: 1px solid #E5E7EB; padding-bottom: 3px; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
    thead tr { background: #0D2137; color: #fff; }
    thead th { padding: 5px 6px; text-align: left; font-weight: 600; border: 1px solid #0D2137; white-space: nowrap; }
    thead th.col-money { text-align: right; }
    tbody tr.row-even { background: #F8FAFC; }
    tbody tr.row-odd  { background: #fff; }
    tbody td { padding: 4px 6px; border: 1px solid #E5E7EB; vertical-align: top; }
    td.debit, td.credit, th.col-money { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    td.debit  { color: #065F46; font-weight: 600; }
    td.credit { color: #1E3A8A; font-weight: 600; }
    .col-num   { width: 26px; text-align: center; }
    .col-code  { width: 90px; font-family: monospace; font-size: 8pt; }
    .col-acct  { min-width: 120px; }
    .col-third { min-width: 100px; }
    .col-cross { width: 80px; font-family: monospace; font-size: 8pt; }
    .col-desc  { min-width: 100px; color: #555; }
    .col-money { width: 95px; }
    tfoot td { border: 1px solid #CBD5E1; padding: 5px 6px; font-weight: bold; font-size: 9pt; }
    .totals-label { text-align: right; color: #0D2137; }
    .totals-debit  { text-align: right; color: #065F46; }
    .totals-credit { text-align: right; color: #1E3A8A; }
    .balanced-ok  { color: #059669; font-weight: bold; font-size: 8pt; }
    .balanced-err { color: #DC2626; font-weight: bold; font-size: 8pt; }
    .footer-bar { margin-top: 18px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8pt; color: #555; border-top: 1px solid #D1D5DB; padding-top: 8px; }
    .sig-block { text-align: center; min-width: 140px; }
    .sig-line  { border-top: 1px solid #888; margin-top: 28px; padding-top: 3px; font-size: 7.5pt; color: #444; }
    @media print {
      body { padding: 0; }
      @page { margin: 14mm 12mm 12mm 12mm; size: letter portrait; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-block">
      <div class="company-name">${esc(companyName || 'GRAVY')}</div>
      ${companyNit ? `<div class="company-sub">NIT: ${esc(companyNit)}</div>` : ''}
      ${companyAddress ? `<div class="company-sub">${esc(companyAddress)}</div>` : ''}
    </div>
    <div class="doc-block">
      <div class="doc-type">${esc(txTypeName)}</div>
      <div class="doc-number">${esc(tx.number || '')}</div>
      <div class="doc-date">${esc(tx.date || '')}</div>
      ${tx.status === 'voided' ? '<div style="color:#DC2626;font-weight:bold;font-size:10pt;margin-top:4px">&#x26D4; ANULADO</div>' : ''}
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-row">
      <span class="meta-label">Tercero:</span>
      <span class="meta-value">${thirdName ? esc(thirdName) + (thirdDoc ? ' — ' + esc(thirdDoc) : '') : '—'}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Impreso por:</span>
      <span class="meta-value">${esc(printedByName || '—')}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Concepto:</span>
      <span class="meta-value">${esc(tx.description || '—')}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Fecha impresión:</span>
      <span class="meta-value">${printDate}</span>
    </div>
  </div>

  <div class="section-title">Partidas contables</div>
  <table>
    <thead>
      <tr>
        <th class="col-num">#</th>
        <th class="col-code">Código</th>
        <th class="col-acct">Cuenta</th>
        <th class="col-third">Tercero</th>
        <th class="col-cross">Doc. Cruce</th>
        <th class="col-desc">Descripción</th>
        <th class="col-money">Débito</th>
        <th class="col-money">Crédito</th>
      </tr>
    </thead>
    <tbody>${linesHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="6" class="totals-label">TOTALES</td>
        <td class="totals-debit">${fmt(totalDebit)}</td>
        <td class="totals-credit">${fmt(totalCredit)}</td>
      </tr>
      <tr>
        <td colspan="8" style="text-align:right;border-top:none;padding-top:3px">
          ${Math.abs(totalDebit - totalCredit) < 0.0001
            ? '<span class="balanced-ok">&#x2713; Comprobante cuadrado — Débito = Crédito</span>'
            : `<span class="balanced-err">&#x26A0; Descuadre: ${fmt(Math.abs(totalDebit - totalCredit))}</span>`}
        </td>
      </tr>
    </tfoot>
  </table>

  <div class="footer-bar">
    <div class="sig-block">
      <div style="margin-bottom:32px;font-weight:500;color:#111">${esc(createdByName)}</div>
      <div class="sig-line">elaborado por</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Revisado por</div>
    </div>
    <div class="sig-block">
      <div class="sig-line">Aprobado por</div>
    </div>
    <div style="text-align:right;font-size:7.5pt;color:#9CA3AF">
      GRAVY &mdash; Plataforma contable inteligente<br>
      ${esc(tx.number || '')} &mdash; ${esc(tx.date || '')}
    </div>
  </div>

  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (!win) return showToast('El navegador bloqueó la ventana emergente. Permite ventanas emergentes para imprimir.', 'warning');
    win.document.open();
    win.document.write(html);
    win.document.close();
  } catch (err) {
    showToast('Error al generar la nota contable: ' + err.message, 'error');
  }
}

async function renderTransacciones(c) {
  return renderNuevaTx(c);
}
