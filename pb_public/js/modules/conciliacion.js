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
        ${can('canWrite') ? '<div class="flex gap-2"><button class="btn btn-secondary" id="btn-new-bank"><i class="fas fa-building-columns"></i> Nueva Cuenta Bancaria</button><button class="btn btn-primary" id="btn-new-mov"><i class="fas fa-plus"></i> Nuevo Movimiento</button></div>' : ''}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select id="bank-filter" class="form-input">
            <option value="">Todas las cuentas bancarias</option>
            ${bankAccounts.map(b => `<option value="${esc(b.id)}" ${b.id === currentAccId ? 'selected' : ''}>${esc(b.bank)} - ${esc(b.number)} (${esc(b.name)})</option>`).join('')}
          </select>
          <input id="mov-q" class="form-input" placeholder="Buscar por descripci?n o referencia...">
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 290px)">
          <table class="data-table" id="mov-table">
            <thead><tr><th>Fecha</th><th>Cuenta Bancaria</th><th>Descripci?n</th><th>D?bito</th><th>Cr?dito</th><th>Referencia</th><th>Conciliado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${movements.length ? movements.map(m => `
                <tr data-bank-id="${esc(m.bank_account_id)}">
                  <td>${esc(m.date)}</td>
                  <td>${esc(m.expand?.bank_account_id?.bank || '')} - ${esc(m.expand?.bank_account_id?.number || '')}</td>
                  <td>${esc(m.description || '?')}</td>
                  <td>${fmt(m.debit || 0)}</td>
                  <td>${fmt(m.credit || 0)}</td>
                  <td>${esc(m.ref || '?')}</td>
                  <td>${m.reconciled ? '<span class="badge badge-green">S?</span>' : '<span class="badge badge-orange">No</span>'}</td>
                  <td>${can('canWrite') ? `<button class="btn btn-outline btn-sm" onclick="toggleRecon('${esc(m.id)}', ${m.reconciled ? 'false' : 'true'})"><i class="fas fa-check"></i></button>` : ''}</td>
                </tr>`).join('') : '<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay movimientos bancarios.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;

    const apply = () => {
      const bid = getSelectVal('bank-filter');
      const q = getInputVal('mov-q').toLowerCase();
      $$('#mov-table tbody tr').forEach(tr => {
        const okB = !bid || tr.dataset.bankId === bid;
        const okQ = !q || tr.textContent.toLowerCase().includes(q);
        tr.style.display = okB && okQ ? '' : 'none';
      });
    };
    $('#bank-filter')?.addEventListener('change', apply);
    $('#mov-q')?.addEventListener('input', debounce(apply, 150));
    $('#btn-new-bank')?.addEventListener('click', () => openBankAccountForm(accounts));
    $('#btn-new-mov')?.addEventListener('click', () => openBankMovementForm(bankAccounts));
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
    showToast('Estado de conciliaci?n actualizado', 'success');
    renderConciliacion($('#page-content'));
  } catch (err) { showToast(err.message, 'error'); }
}
