/**
 * ContaCO v2.0 — transacciones.js
 */
'use strict';

// Tarifas de retención por defecto (Colombia)
const RET_DEFAULT_RATES = { reterenta: 3.5, reteiva: 15, reteica: 0.414 };
function defaultRetRate(tipos) {
  for (const t of tipos) { if (RET_DEFAULT_RATES[t.trim()]) return RET_DEFAULT_RATES[t.trim()]; }
  return 3.5;
}
function retLabel(tipo) {
  return { reterenta: 'Reterenta', reteiva: 'Reteiva', reteica: 'Reteica' }[tipo.trim()] || tipo;
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
          <div class="form-group"><label class="form-label">Tipo</label><select id="tx-type" class="form-input">${txTypes.map(t => `<option value="${esc(t.id)}">${esc(t.prefix)} - ${esc(t.name)}</option>`).join('')}</select></div>
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

async function refreshConsecutive() {
  const typeId = getSelectVal('tx-type');
  const tt = TX_STATE.txTypes.find(t => t.id === typeId);
  if (!tt) return;
  setInputVal('tx-number', `${tt.prefix}-${String((tt.consecutive ?? 0) + 1).padStart(6, '0')}`);
}

function addTxLine(row = null) {
  TX_STATE.lines.push(row || { account_id: '', debit: 0, credit: 0, description: '', cross_doc_ref: '', ret_base: '', ret_rate: '' });
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
      TX_STATE.lines[i].ret_rate = String(defaultRetRate(tipos));
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
  const rate   = Number(line.ret_rate  || 0);
  if (!base || !rate) return showToast('Ingresa la base gravable y la tarifa para calcular', 'warning');
  const amount = Math.round(base * rate / 100);
  const acct   = TX_STATE.accountMap.get(line.account_id);
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
      const needsCruce  = !!acct?.maneja_cruce;
      const needsRet    = !!acct?.maneja_retenciones;
      const tiposRet    = (acct?.tipos_retencion || '').split(',').filter(Boolean);
      const calcBase    = Number(line.ret_base || 0);
      const calcRate    = Number(line.ret_rate  !== '' ? line.ret_rate : (tiposRet.length ? defaultRetRate(tiposRet) : 0));
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
      ${needsCruce ? `
      <div style="display:flex;align-items:center;gap:8px;margin:-2px 0 6px 0;padding:5px 8px;background:#EFF6FF;border-left:3px solid #1A4B8C;border-radius:0 6px 6px 0">
        <i class="fas fa-link" style="color:#1A4B8C;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#1A4B8C;white-space:nowrap">Doc. de Cruce</span>
        <input class="form-input" style="max-width:200px;font-size:13px" placeholder="N° factura / documento" value="${esc(line.cross_doc_ref || '')}" oninput="updateTxLine(${i}, 'cross_doc_ref', this.value)">
        <span class="text-xs" style="color:#93C5FD">CxP / CxC — ingresa el número del documento que se está cruzando</span>
      </div>` : ''}
      ${needsRet ? `
      <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin:-2px 0 6px 0;padding:7px 10px;background:#FFFBEB;border-left:3px solid #D97706;border-radius:0 6px 6px 0">
        <i class="fas fa-percent" style="color:#D97706;font-size:11px"></i>
        <span class="text-xs font-semibold" style="color:#92400E;white-space:nowrap">Calculadora de Retención</span>
        ${tiposRet.map(t => `<span class="badge" style="background:#FEF3C7;color:#92400E;font-size:10px">${retLabel(t)}</span>`).join('')}
        <span class="text-xs" style="color:#92400E">Base:</span>
        <input class="form-input" style="max-width:140px;font-size:13px" type="number" min="0" step="1" placeholder="Base gravable"
               value="${esc(line.ret_base || '')}" oninput="updateTxLine(${i}, 'ret_base', this.value)">
        <span class="text-xs" style="color:#92400E">×</span>
        <input class="form-input" style="max-width:75px;font-size:13px;text-align:right" type="number" min="0" step="0.001" placeholder="%"
               value="${esc(line.ret_rate !== '' ? line.ret_rate : calcRate)}"
               oninput="updateTxLine(${i}, 'ret_rate', this.value)">
        <span class="text-xs" style="color:#92400E">%</span>
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
async function showCarteraModal(thirdId) {
    if (!thirdId) return;
    const tercero = TX_STATE.terceros.find(t => t.id === thirdId);
    const cruceAccountIds = new Set(
      [...TX_STATE.accountMap.values()]
        .filter(a => a.maneja_cruce)
        .map(a => a.id)
    );

    openModal(
      `<i class="fas fa-file-invoice-dollar mr-2" style="color:#1A4B8C"></i>Cartera: ${esc(tercero?.name || thirdId)}`,
      `<div class="p-6 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando movimientos...</div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
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
        lines = { items: allLines.items?.filter(l => cruceAccountIds.has(l.account_id)) ?? [] };
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
  const candidates = document.querySelectorAll('.modal-content, .modal-body, [role="dialog"] > div > div');
  for (const el of candidates) {
    if (el.querySelector('.fa-spinner, .p-6, table')) { el.innerHTML = html; return; }
  }
  const overlay = document.querySelector('.modal-overlay, .fixed.inset-0 [class*="modal"]');
  if (overlay) { const inner = overlay.querySelector('div > div'); if (inner) inner.innerHTML = html; }
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

function applyCrossAmountByType(lineIdx, netOpen) {
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

  TX_STATE.lines[lineIdx].debit = debit;
  TX_STATE.lines[lineIdx].credit = credit;
  return true;
}

function useCrossDoc(ref, netOpen = 0) {
  const idx = TX_STATE.lines.findIndex(l => {
    const a = TX_STATE.accountMap.get(l.account_id);
    return a?.maneja_cruce && !l.cross_doc_ref;
  });
  const applyToLine = (lineIdx) => {
    TX_STATE.lines[lineIdx].cross_doc_ref = ref;
    const autoApplied = applyCrossAmountByType(lineIdx, netOpen);
    closeModal();
    renderTxLines(true);
    if (autoApplied) {
      showToast(`Documento "${ref}" aplicado a la línea ${lineIdx + 1} con valor ${fmt(Math.abs(Number(netOpen || 0)))}`, 'success');
    } else {
      showToast(`Documento "${ref}" aplicado a la línea ${lineIdx + 1}`, 'success');
    }
  };

  if (idx === -1) {
    const anyIdx = TX_STATE.lines.findIndex(l => TX_STATE.accountMap.get(l.account_id)?.maneja_cruce);
    if (anyIdx === -1) {
      closeModal();
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
      cross_enabled: validLines.some(l => TX_STATE.accountMap.get(l.account_id)?.maneja_cruce),
      status: 'active',
    }, validLines.map((l, i) => ({
      account_id: l.account_id,
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
        <table class="data-table"><thead><tr><th>Cuenta</th><th>Doc. Cruce</th><th>Descripción</th><th>Débito</th><th>Crédito</th></tr></thead>
          <tbody>${lines.map(l => `<tr><td>${esc(l.expand?.account_id?.code || '')} - ${esc(l.expand?.account_id?.name || '')}</td><td>${l.cross_doc_ref ? `<span class="badge" style="background:#EFF6FF;color:#1A4B8C"><i class="fas fa-link mr-1"></i>${esc(l.cross_doc_ref)}</span>` : '\u2014'}</td><td>${esc(l.description || '\u2014')}</td><td>${fmt(l.debit || 0)}</td><td>${fmt(l.credit || 0)}</td></tr>`).join('')}</tbody>
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
        if (closed) return showToast(`El período ${(tx.date||'').slice(0,7)} no está habilitado o está cerrado. No se puede anular.`, 'error');
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
