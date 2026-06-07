/**
 * GRAVY v2.0 — plan-cuentas.js
 */
'use strict';

/* ─────────────────────────────────────────────────────────────────
 * resolveAccountMeta
 * Calcula Nivel, Código Padre y account_type_id a partir del código
 * ingresado, usando la estructura del PUC colombiano.
 *
 * Longitudes válidas: 1 (Clase), 2 (Grupo), 4 (Cuenta),
 *                     6 (Subcuenta), 8 (Auxiliar), 10 (Sub-aux.)
 * ─────────────────────────────────────────────────────────────────*/
function resolveAccountMeta(code: string, allAccounts: any[], accTypes: any[]) {
  const len = code.length;
  const LEVEL_MAP: Record<number, number> = { 1: 1, 2: 2, 4: 3, 6: 4, 8: 5, 10: 6 };
  const level = LEVEL_MAP[len] ?? null;

  // Código padre: un nivel arriba según el PUC
  let parentCode = '';
  if (len === 2) parentCode = code.slice(0, 1);
  else if (len > 2) parentCode = code.slice(0, len - 2);

  // Tipo de cuenta: heredado desde la cuenta de Nivel 1 (primer dígito)
  const rootCode = code[0] ?? '';
  const rootAccount = allAccounts.find(a => a.code === rootCode);
  const accountTypeId = rootAccount?.account_type_id ?? '';

  // Descripción legible del tipo para el panel informativo
  const typeObj = accTypes.find(t => t.id === accountTypeId);
  const typeLabel = typeObj ? `${typeObj.code} - ${typeObj.name}` : (accountTypeId ? '(cargando...)' : '—');

  return { level, parentCode, accountTypeId, typeLabel };
}

/* Valida si la longitud del código es una longitud PUC válida */
function isValidPucLength(len: number) {
  return [1, 2, 4, 6, 8, 10].includes(len);
}

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

      // Columna Req. Tercero
      const reqTercero = a.requires_third_party
        ? '<span class="badge badge-orange">Sí</span>'
        : '<span style="color:#9CA3AF;font-size:13px">No</span>';

      // Columna Cruce (CxP/CxC)
      const cruce = a.maneja_cruce
        ? '<span class="badge badge-blue">Sí</span>'
        : '<span style="color:#9CA3AF;font-size:13px">No</span>';

      // Columna Retenciones
      let retLabel = '<span style="color:#9CA3AF;font-size:13px">No</span>';
      if (a.maneja_retenciones) {
        const tipos = (a.tipos_retencion || '').split(',').filter(Boolean);
        const labels: Record<string, string> = {
          reterenta: 'Renta',
          reteiva:   'IVA',
          reteica:   'ICA',
        };
        retLabel = tipos.length
          ? tipos.map(t => `<span class="badge badge-orange" style="margin-right:2px">${labels[t] ?? t}</span>`).join('')
          : '<span class="badge badge-orange">Sí</span>';
      }

      return `
      <tr data-code="${esc(a.code)}" data-name="${esc(a.name.toLowerCase())}" data-type-id="${esc(a.account_type_id)}">
        <td><span class="font-semibold" style="color:#1A4B8C">${esc(a.code)}</span></td>
        <td>${esc(a.name)}</td>
        <td>${esc(t?.name ?? '?')}</td>
        <td>${reqTercero}</td>
        <td>${cruce}</td>
        <td>${retLabel}</td>
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
                 <th>Código</th><th>Nombre</th><th>Tipo</th><th>Req. Tercero</th><th>Cruce</th><th>Retenciones</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No hay cuentas registradas.</td></tr>'}</tbody>
          </table>
        </div>
      </div>`;

    const doFilter = () => {
      const q = getInputVal('acct-q').toLowerCase();
      const type = getSelectVal('acct-type');
      const status = getSelectVal('acct-status');
      $$('#accounts-table tbody tr').forEach(tr => {
        const rowCode   = tr.children[0]?.textContent?.toLowerCase() || '';
        const rowName   = tr.children[1]?.textContent?.toLowerCase() || '';
        const rowTypeId = (tr as HTMLElement).dataset.typeId || '';
        // Estado está en columna índice 6 (0-based)
        const isActive  = (tr.children[6]?.textContent || '').includes('Activa');
        const okQ      = !q    || rowCode.includes(q) || rowName.includes(q);
        const okType   = !type || rowTypeId === type;
        const okStatus = !status || (status === 'active' ? isActive : !isActive);
        (tr as HTMLElement).style.display = okQ && okType && okStatus ? '' : 'none';
      });
    };

    $('#acct-q')?.addEventListener('input', debounce(doFilter, 200));
    $('#acct-type')?.addEventListener('change', doFilter);
    $('#acct-status')?.addEventListener('change', doFilter);
    $('#btn-new-account')?.addEventListener('click', () => openAccountForm(accounts, accTypes));
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

/* ─────────────────────────────────────────────────────────────────
 * openAccountForm
 * Modal simplificado: sin Tipo, Nivel ni Código Padre manuales.
 * Esos campos se calculan automáticamente desde el código ingresado.
 * ─────────────────────────────────────────────────────────────────*/
async function openAccountForm(allAccounts: any[] | null, accTypes: any[] | null, row: any = null) {
  if (!can('canWrite')) return showToast('No tienes permisos para crear/editar cuentas', 'error');
  if (!accTypes)    accTypes    = await pb.listAll('account_types', { sort: 'code' });
  if (!allAccounts) allAccounts = await API.getAccounts(false);

  // Metadatos iniciales (si estamos editando una cuenta existente)
  const initMeta = row
    ? resolveAccountMeta(row.code || '', allAccounts, accTypes)
    : { level: null, parentCode: '', typeLabel: '—' };

  const metaPanelHtml = (meta: ReturnType<typeof resolveAccountMeta>, code: string) => {
    if (!code) return `<p class="text-xs" style="color:#9CA3AF">Escribe un código para ver los metadatos calculados.</p>`;
    if (!isValidPucLength(code.length)) {
      return `<p class="text-xs" style="color:#D97706"><i class="fas fa-triangle-exclamation mr-1"></i>Longitud de código no estándar (PUC: 1, 2, 4, 6, 8 o 10 dígitos).</p>`;
    }
    return `
      <div class="flex flex-wrap gap-3">
        <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;background:#EEF4FF;color:#2446B8;font-size:12px;font-weight:700">
          <i class="fas fa-layer-group" style="font-size:10px"></i> Nivel ${meta.level ?? '?'}
        </span>
        ${meta.parentCode ? `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;background:#F0FFF4;color:#059669;font-size:12px;font-weight:700">
          <i class="fas fa-sitemap" style="font-size:10px"></i> Padre: ${esc(meta.parentCode)}
        </span>` : `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;background:#F3F4F6;color:#6B7280;font-size:12px;font-weight:700">
          <i class="fas fa-sitemap" style="font-size:10px"></i> Cuenta raíz (sin padre)
        </span>`}
        <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;background:#FFF7ED;color:#C2410C;font-size:12px;font-weight:700">
          <i class="fas fa-tag" style="font-size:10px"></i> ${esc(meta.typeLabel)}
        </span>
      </div>`;
  };

  openModal(
    row ? 'Editar Cuenta' : 'Nueva Cuenta',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label class="form-label">Código</label>
        <input id="ac-code" class="form-input" placeholder="Ej: 11200505" value="${esc(row?.code || '')}">
        <div id="ac-meta-panel" style="margin-top:10px;padding:10px 14px;border-radius:10px;background:#F8F9FB;border:1px solid #E5E7EB;min-height:42px">
          ${metaPanelHtml(initMeta, row?.code || '')}
        </div>
      </div>
      <div class="form-group"><label class="form-label">Nombre</label><input id="ac-name" class="form-input" value="${esc(row?.name || '')}"></div>
      <div class="form-group"><label class="form-label">Naturaleza</label>
        <select id="ac-nature" class="form-input">
           <option value="debit" ${row?.nature === 'debit' ? 'selected' : ''}>Débito</option>
           <option value="credit" ${row?.nature === 'credit' ? 'selected' : ''}>Crédito</option>
        </select>
      </div>
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

  // Actualizar el panel de metadatos en tiempo real al escribir el código
  const codeInput = document.getElementById('ac-code') as HTMLInputElement | null;
  const metaPanel = document.getElementById('ac-meta-panel');
  if (codeInput && metaPanel) {
    codeInput.addEventListener('input', () => {
      const code = codeInput.value.trim();
      if (!/^\d*$/.test(code)) return; // solo numérico
      const meta = resolveAccountMeta(code, allAccounts, accTypes);
      metaPanel.innerHTML = metaPanelHtml(meta, code);
    });
  }

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
    const tiposArr: string[] = [];
    if (handlesRet) {
      if (document.getElementById('ac-reterenta')?.checked) tiposArr.push('reterenta');
      if (document.getElementById('ac-reteiva')?.checked)   tiposArr.push('reteiva');
      if (document.getElementById('ac-reteica')?.checked)   tiposArr.push('reteica');
    }

    const rateRenta = parseFloat(getInputVal('ac-rate-reterenta'));
    const rateIva   = parseFloat(getInputVal('ac-rate-reteiva'));
    const rateIca   = parseFloat(getInputVal('ac-rate-reteica'));

    const code = getInputVal('ac-code').trim();

    // Validaciones básicas
    if (!code || !getInputVal('ac-name')) {
      return showToast('Completa al menos el código y el nombre', 'warning');
    }
    if (!/^\d+$/.test(code)) {
      return showToast('El código de cuenta debe ser numérico', 'warning');
    }
    if (!isValidPucLength(code.length)) {
      return showToast('La longitud del código no corresponde a una estructura PUC válida (1, 2, 4, 6, 8 o 10 dígitos)', 'warning');
    }

    // Calcular metadatos automáticamente
    const meta = resolveAccountMeta(code, allAccounts, accTypes);

    if (!meta.accountTypeId) {
      return showToast('No se pudo determinar el tipo de cuenta. Asegúrate de que exista la cuenta raíz (1 dígito) en el plan de cuentas.', 'warning');
    }
    if (meta.level === null) {
      return showToast('La longitud del código no es válida para el PUC colombiano', 'warning');
    }

    if (handlesRet && !tiposArr.length) {
      return showToast('Selecciona al menos un tipo de retención', 'warning');
    }
    if (handlesRet) {
      if (tiposArr.includes('reterenta') && rateRenta <= 0) {
        return showToast('Ingresa un porcentaje válido para Reterenta', 'warning');
      }
      if (tiposArr.includes('reteiva') && rateIva <= 0) {
        return showToast('Ingresa un porcentaje válido para Reteiva', 'warning');
      }
      if (tiposArr.includes('reteica') && rateIca <= 0) {
        return showToast('Ingresa un porcentaje válido para Reteica', 'warning');
      }
    }

    const payload = {
      code,
      name: getInputVal('ac-name'),
      account_type_id: meta.accountTypeId,
      nature: getSelectVal('ac-nature'),
      level: meta.level,
      parent_code: meta.parentCode,
      requires_third_party: getSelectVal('ac-third') === '1',
      active: getSelectVal('ac-active') === '1',
      maneja_cruce: !!document.getElementById('ac-cruce')?.checked,
      maneja_retenciones: handlesRet,
      tipos_retencion: tiposArr.join(','),
      ret_rate_reterenta: Number.isFinite(rateRenta) ? rateRenta : 0,
      ret_rate_reteiva: Number.isFinite(rateIva) ? rateIva : 0,
      ret_rate_reteica: Number.isFinite(rateIca) ? rateIca : 0,
    };

    try {
      // Validar que el código padre exista (si no es cuenta raíz)
      if (meta.parentCode) {
        const parent = await pb.list('accounts', { filter: `code="${meta.parentCode}"`, perPage: 1 });
        if (!parent.items.length) {
          return showToast(`El código padre calculado (${meta.parentCode}) no existe en el plan de cuentas. Crea primero la cuenta padre.`, 'error');
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
    const [row, accTypes, allAccounts] = await Promise.all([
      pb.get('accounts', id),
      pb.listAll('account_types', { sort: 'code' }),
      API.getAccounts(false),
    ]);
    openAccountForm(allAccounts, accTypes, row);
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

// --- VITE MIGRATION GLOBALS ---
(window as any).openAccountForm = openAccountForm;
(window as any).editAccount = editAccount;
(window as any).renderPlanCuentas = renderPlanCuentas;
(window as any).toggleAccountActive = toggleAccountActive;
