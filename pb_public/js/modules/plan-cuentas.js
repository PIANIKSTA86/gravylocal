/**
 * GRAVY v2.0 — plan-cuentas.js
 */
'use strict';

async function renderPlanCuentas(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando plan de cuentas...</div>`;
  try {
    const [accounts, accTypes] = await Promise.all([
      API.getAccounts(false),
      pb.listAll('account_types', { sort: 'code' }),
    ]);

    const rows = accounts.map(a => {
      const t = a.expand?.account_type_id;
      const badge = a.active ? '<span class="badge badge-green">Activa</span>' : '<span class="badge badge-gray">Inactiva</span>';
      return `
      <tr data-code="${esc(a.code)}" data-name="${esc(a.name.toLowerCase())}">
        <td><span class="font-semibold" style="color:#1A4B8C">${esc(a.code)}</span></td>
        <td>${esc(a.name)}</td>
        <td>${esc(t?.name ?? '?')}</td>
        <td>${esc(a.parent_code || '?')}</td>
        <td>${a.requires_third_party ? '<span class="badge badge-orange">Sí</span>' : 'No'}</td>
        <td>${badge}</td>
        <td>
          <div class="flex gap-2">
            ${can('canWrite') ? `<button class="btn btn-outline btn-sm" onclick="editAccount('${esc(a.id)}')"><i class="fas fa-pen"></i></button>` : ''}
            ${can('canDelete') ? `<button class="btn btn-danger btn-sm" onclick="toggleAccountActive('${esc(a.id)}', ${a.active ? 'false' : 'true'})"><i class="fas ${a.active ? 'fa-ban' : 'fa-rotate-left'}"></i></button>` : ''}
          </div>
        </td>
      </tr>`;
    }).join('');

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Plan de Cuentas</h3>
          <p class="text-sm" style="color:#6B7280">Administra cuentas PUC, naturaleza y estado.</p>
        </div>
        ${can('canWrite') ? `
          <div class="flex gap-2">
            <button class="btn btn-primary" id="btn-new-account"><i class="fas fa-plus"></i> Nueva Cuenta</button>
          </div>` : ''}
      </div>

      <div class="bg-white rounded-2xl border p-4 mb-4" style="border-color:#F0F0F0">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
           <input id="acct-q" class="form-input" placeholder="Buscar por código o nombre...">
          <select id="acct-type" class="form-input">
            <option value="">Todos los tipos</option>
            ${accTypes.map(t => `<option value="${esc(t.id)}">${esc(t.code)} - ${esc(t.name)}</option>`).join('')}
          </select>
          <select id="acct-status" class="form-input">
            <option value="">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="overflow-x-auto" style="max-height: calc(100vh - 290px)">
          <table class="data-table" id="accounts-table">
            <thead>
              <tr>
                 <th>Código</th><th>Nombre</th><th>Tipo</th><th>Código Padre</th><th>Req. Tercero</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="7" class="text-center py-10" style="color:#9CA3AF">No hay cuentas registradas.</td></tr>'}</tbody>
          </table>
        </div>
      </div>`;

    const doFilter = () => {
      const q = getInputVal('acct-q').toLowerCase();
      const type = getSelectVal('acct-type');
      const status = getSelectVal('acct-status');
      $$('#accounts-table tbody tr').forEach(tr => {
        const rowCode = tr.children[0]?.textContent?.toLowerCase() || '';
        const rowName = tr.children[1]?.textContent?.toLowerCase() || '';
        const rowType = tr.children[2]?.textContent || '';
        const isActive = (tr.children[5]?.textContent || '').includes('Activa');
        const okQ = !q || rowCode.includes(q) || rowName.includes(q);
        const okType = !type || rowType.includes($(`#acct-type option[value="${type}"]`)?.textContent?.split(' - ')[0] || '');
        const okStatus = !status || (status === 'active' ? isActive : !isActive);
        tr.style.display = okQ && okType && okStatus ? '' : 'none';
      });
    };

    $('#acct-q')?.addEventListener('input', debounce(doFilter, 200));
    $('#acct-type')?.addEventListener('change', doFilter);
    $('#acct-status')?.addEventListener('change', doFilter);
    $('#btn-new-account')?.addEventListener('click', () => openAccountForm(accTypes));
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function openAccountForm(accTypes, row = null) {
  if (!can('canWrite')) return showToast('No tienes permisos para crear/editar cuentas', 'error');
  if (!accTypes) accTypes = await pb.listAll('account_types', { sort: 'code' });
  openModal(
    row ? 'Editar Cuenta' : 'Nueva Cuenta',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Código</label><input id="ac-code" class="form-input" value="${esc(row?.code || '')}"></div>
      <div class="form-group"><label class="form-label">Nombre</label><input id="ac-name" class="form-input" value="${esc(row?.name || '')}"></div>
      <div class="form-group"><label class="form-label">Tipo de Cuenta</label>
        <select id="ac-type" class="form-input">${accTypes.map(t => `<option value="${esc(t.id)}" ${row?.account_type_id === t.id ? 'selected' : ''}>${esc(t.code)} - ${esc(t.name)}</option>`).join('')}</select>
      </div>
      <div class="form-group"><label class="form-label">Naturaleza</label>
        <select id="ac-nature" class="form-input">
           <option value="debit" ${row?.nature === 'debit' ? 'selected' : ''}>Débito</option>
           <option value="credit" ${row?.nature === 'credit' ? 'selected' : ''}>Crédito</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Nivel</label><input id="ac-level" type="number" min="1" max="6" class="form-input" value="${esc(row?.level ?? 1)}"></div>
      <div class="form-group"><label class="form-label">Código Padre</label><input id="ac-parent" class="form-input" value="${esc(row?.parent_code || '')}"></div>
      <div class="form-group"><label class="form-label">¿Requiere Tercero?</label><select id="ac-third" class="form-input"><option value="0" ${row?.requires_third_party ? '' : 'selected'}>No</option><option value="1" ${row?.requires_third_party ? 'selected' : ''}>Sí</option></select></div>
      <div class="form-group"><label class="form-label">Estado</label><select id="ac-active" class="form-input"><option value="1" ${row?.active !== false ? 'selected' : ''}>Activa</option><option value="0" ${row?.active === false ? 'selected' : ''}>Inactiva</option></select></div>
    </div>
    <hr class="my-3" style="border-color:#F0F0F0">
    <p class="text-xs font-semibold mb-2" style="color:#6B7280;text-transform:uppercase;letter-spacing:.05em">Comportamiento contable</p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="ac-cruce" ${row?.maneja_cruce ? 'checked' : ''} class="w-4 h-4" style="accent-color:#1A4B8C">
          <span class="form-label mb-0">Maneja documento de cruce <span class="text-xs" style="color:#6B7280">(CxP / CxC)</span></span>
        </label>
      </div>
      <div class="form-group">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="ac-ret" ${row?.maneja_retenciones ? 'checked' : ''} class="w-4 h-4" style="accent-color:#D97706" onchange="toggleRetTypes()">
          <span class="form-label mb-0">Maneja retenciones</span>
        </label>
      </div>
      <div id="ret-types-wrap" class="md:col-span-2 ${row?.maneja_retenciones ? '' : 'hidden'}">
        <p class="text-xs mb-2" style="color:#6B7280">Selecciona los tipos de retención que aplican:</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #FDE68A">
            <label class="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" id="ac-reterenta" ${(row?.tipos_retencion || '').includes('reterenta') ? 'checked' : ''} class="w-4 h-4" style="accent-color:#D97706" onchange="toggleRetRateInputs()">
              <span class="text-sm font-semibold">Reterenta</span>
            </label>
            <input id="ac-rate-reterenta" type="number" min="0" step="0.001" class="form-input" placeholder="%" value="${esc(row?.ret_rate_reterenta ?? '')}">
          </div>
          <div class="p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #FDE68A">
            <label class="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" id="ac-reteiva" ${(row?.tipos_retencion || '').includes('reteiva') ? 'checked' : ''} class="w-4 h-4" style="accent-color:#D97706" onchange="toggleRetRateInputs()">
              <span class="text-sm font-semibold">Reteiva</span>
            </label>
            <input id="ac-rate-reteiva" type="number" min="0" step="0.001" class="form-input" placeholder="%" value="${esc(row?.ret_rate_reteiva ?? '')}">
          </div>
          <div class="p-3 rounded-lg" style="background:#FFFBEB;border:1px solid #FDE68A">
            <label class="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" id="ac-reteica" ${(row?.tipos_retencion || '').includes('reteica') ? 'checked' : ''} class="w-4 h-4" style="accent-color:#D97706" onchange="toggleRetRateInputs()">
              <span class="text-sm font-semibold">Reteica</span>
            </label>
            <input id="ac-rate-reteica" type="number" min="0" step="0.001" class="form-input" placeholder="%" value="${esc(row?.ret_rate_reteica ?? '')}">
          </div>
        </div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-account"><i class="fas fa-floppy-disk"></i> Guardar</button>`,
  );

  window.toggleRetTypes = () => {
    const checked = document.getElementById('ac-ret')?.checked;
    const wrap = document.getElementById('ret-types-wrap');
    if (wrap) wrap.classList.toggle('hidden', !checked);
    window.toggleRetRateInputs?.();
  };

  window.toggleRetRateInputs = () => {
    const map = [
      ['ac-reterenta', 'ac-rate-reterenta'],
      ['ac-reteiva', 'ac-rate-reteiva'],
      ['ac-reteica', 'ac-rate-reteica'],
    ];
    const handlesRet = !!document.getElementById('ac-ret')?.checked;
    map.forEach(([chkId, inputId]) => {
      const chk = document.getElementById(chkId);
      const inp = document.getElementById(inputId);
      if (!chk || !inp) return;
      const enabled = handlesRet && chk.checked;
      inp.disabled = !enabled;
      if (!enabled) inp.value = '';
    });
  };

  window.toggleRetRateInputs?.();

  $('#btn-save-account')?.addEventListener('click', async () => {
    const handlesRet = !!document.getElementById('ac-ret')?.checked;
    const tiposArr = [];
    if (handlesRet) {
      if (document.getElementById('ac-reterenta')?.checked) tiposArr.push('reterenta');
      if (document.getElementById('ac-reteiva')?.checked)   tiposArr.push('reteiva');
      if (document.getElementById('ac-reteica')?.checked)   tiposArr.push('reteica');
    }

    const rateRenta = parseFloat(getInputVal('ac-rate-reterenta'));
    const rateIva   = parseFloat(getInputVal('ac-rate-reteiva'));
    const rateIca   = parseFloat(getInputVal('ac-rate-reteica'));

    const payload = {
      code: getInputVal('ac-code'),
      name: getInputVal('ac-name'),
      account_type_id: getSelectVal('ac-type'),
      nature: getSelectVal('ac-nature'),
      level: Number(getInputVal('ac-level') || 1),
      parent_code: getInputVal('ac-parent'),
      requires_third_party: getSelectVal('ac-third') === '1',
      active: getSelectVal('ac-active') === '1',
      maneja_cruce: !!document.getElementById('ac-cruce')?.checked,
      maneja_retenciones: handlesRet,
      tipos_retencion: tiposArr.join(','),
      ret_rate_reterenta: Number.isFinite(rateRenta) ? rateRenta : 0,
      ret_rate_reteiva: Number.isFinite(rateIva) ? rateIva : 0,
      ret_rate_reteica: Number.isFinite(rateIca) ? rateIca : 0,
    };
    if (!payload.code || !payload.name || !payload.account_type_id) {
      return showToast('Completa código, nombre y tipo de cuenta', 'warning');
    }
    if (!/^\d+$/.test(payload.code)) {
      return showToast('El código de cuenta debe ser numérico', 'warning');
    }
    if (payload.parent_code && !/^\d+$/.test(payload.parent_code)) {
      return showToast('El código padre debe ser numérico', 'warning');
    }
    if (payload.parent_code && payload.parent_code === payload.code) {
      return showToast('Una cuenta no puede ser su propia cuenta padre', 'warning');
    }
    if (handlesRet && !tiposArr.length) {
      return showToast('Selecciona al menos un tipo de retención', 'warning');
    }
    if (handlesRet) {
      if (tiposArr.includes('reterenta') && payload.ret_rate_reterenta <= 0) {
        return showToast('Ingresa un porcentaje válido para Reterenta', 'warning');
      }
      if (tiposArr.includes('reteiva') && payload.ret_rate_reteiva <= 0) {
        return showToast('Ingresa un porcentaje válido para Reteiva', 'warning');
      }
      if (tiposArr.includes('reteica') && payload.ret_rate_reteica <= 0) {
        return showToast('Ingresa un porcentaje válido para Reteica', 'warning');
      }
    }

    try {
      // Validaciones de jerarquía
      if (payload.parent_code) {
        const parent = await pb.list('accounts', { filter: `code="${payload.parent_code}"`, perPage: 1 });
         if (!parent.items.length) return showToast('El código padre no existe', 'error');
        const parentAcc = parent.items[0];
        if (Number(parentAcc.level || 1) >= Number(payload.level || 1)) {
          return showToast('El nivel de la cuenta hija debe ser mayor al nivel de la cuenta padre', 'warning');
        }
      }

      if (row?.id) {
        await pb.update('accounts', row.id, payload);
        await API.logAudit('UPDATE', 'Cuenta', row.id, `${payload.code} - ${payload.name}`);
      } else {
        const created = await pb.create('accounts', payload);
        await API.logAudit('CREATE', 'Cuenta', created.id, `${payload.code} - ${payload.name}`);
      }
      closeModal();
      showToast('Cuenta guardada correctamente', 'success');
      renderPlanCuentas($('#page-content'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function editAccount(id) {
  try {
    const [row, accTypes] = await Promise.all([
      pb.get('accounts', id),
      pb.listAll('account_types', { sort: 'code' }),
    ]);
    openAccountForm(accTypes, row);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function toggleAccountActive(id, active) {
  if (!can('canDelete')) return showToast('No tienes permisos para cambiar estado', 'error');
  confirmDialog(
    active ? 'Reactivar cuenta' : 'Inactivar cuenta',
    active ? '¿Deseas reactivar esta cuenta?' : '¿Deseas inactivar esta cuenta?',
    async () => {
      try {
        if (!active) {
          const current = await pb.get('accounts', id);

          // Regla 1: no inactivar si tiene cuentas hijas activas
          const children = await pb.list('accounts', { filter: `parent_code="${current.code}" && active=true`, perPage: 1 });
          if (children.totalItems > 0) {
            return showToast('No puedes inactivar una cuenta que tiene subcuentas activas', 'error');
          }

          // Regla 2: no inactivar si ya tiene movimientos contables
          const lines = await pb.list('tx_lines', { filter: `account_id="${id}"`, perPage: 1 });
          if (lines.totalItems > 0) {
            return showToast('No puedes inactivar una cuenta con movimientos contables asociados', 'error');
          }
        }

        await pb.update('accounts', id, { active });
        const updated = await pb.get('accounts', id);
        await API.logAudit('STATUS', 'Cuenta', id, `${updated.code} - ${updated.name} => ${active ? 'Activa' : 'Inactiva'}`);
        showToast('Estado actualizado', 'success');
        renderPlanCuentas($('#page-content'));
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  );
}

/* ══════════════════════════════════════════════════════════
   FIN PLAN DE CUENTAS
   La importación masiva fue movida al módulo de Utilidades.
   ══════════════════════════════════════════════════════════ */
