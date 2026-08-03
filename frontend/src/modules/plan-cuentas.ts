/**
 * GRAVY v2.0 — plan-cuentas.js
 */
'use strict';

/* ─────────────────────────────────────────────────────────────────
 * resolveAccountMeta
 * Calcula Nivel, Código Padre y account_type_id a partir del código
 * ingresado, usando la estructura del PUC colombiano (con soporte
 * para extensiones de 3 dígitos en nivel 5 y 6).
 * ─────────────────────────────────────────────────────────────────*/
function resolveAccountMeta(code: string, allAccounts: any[], accTypes: any[]) {
  const len = code.length;
  
  let parentCode = '';
  let level: number | null = null;
  
  if (len === 1) {
    level = 1;
  } else if (len > 1) {
    // 1. Intentar buscar el prefijo más largo existente en los datos actuales
    let bestParent: any = null;
    for (const acc of allAccounts) {
      if (acc.code !== code && code.startsWith(acc.code)) {
        if (!bestParent || acc.code.length > bestParent.code.length) {
          bestParent = acc;
        }
      }
    }

    if (bestParent) {
      parentCode = bestParent.code;
      level = Math.min(6, (bestParent.level || 1) + 1);
    } else {
      // 2. Si no se encuentra en la BD, deducir según las longitudes estándar y personalizadas
      let parentLen = 0;
      if (len === 2) { parentLen = 1; level = 2; }
      else if (len === 3) { parentLen = 2; level = 3; }
      else if (len === 4) { parentLen = 2; level = 3; }
      else if (len === 5) { parentLen = 4; level = 4; }
      else if (len === 6) { parentLen = 4; level = 4; }
      else if (len === 7) { parentLen = 6; level = 5; }
      else if (len === 8) { parentLen = 6; level = 5; }
      else if (len === 9) { parentLen = 6; level = 5; } // Nivel 5 de 3 dígitos (9 en total)
      else if (len === 10) { parentLen = 8; level = 6; } // Nivel 6 estándar
      else if (len === 11) {
        // Puede ser de un padre de 9 o 8 dígitos
        const prefix9 = code.slice(0, 9);
        const hasPrefix9 = allAccounts.some(a => a.code === prefix9);
        parentLen = hasPrefix9 ? 9 : 8;
        level = 6;
      }
      else if (len === 12) { parentLen = 10; level = 6; }
      else {
        parentLen = len - 2;
        level = 6;
      }
      parentCode = code.slice(0, parentLen);
    }
  }

  // Tipo de cuenta: heredado desde la cuenta de Nivel 1 (primer dígito)
  const rootCode = code[0] ?? '';
  const rootAccount = allAccounts.find(a => a.code === rootCode);
  const accountTypeId = rootAccount?.account_type_id ?? '';

  // Descripción legible del tipo para el panel informativo
  const typeObj = accTypes.find(t => t.id === accountTypeId);
  const typeLabel = typeObj ? `${typeObj.code} - ${typeObj.name}` : (accountTypeId ? '(cargando...)' : '—');

  return { level, parentCode, accountTypeId, typeLabel };
}

/* Valida si la longitud del código es una longitud PUC válida (incluye 3 dígitos en nivel 5/6) */
function isValidPucLength(len: number) {
  return [1, 2, 4, 6, 8, 9, 10, 11, 12].includes(len);
}

function generatePagination(totalPages: number, currentPage: number): string {
  let html = '';
  
  // Botón Anterior
  html += `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''} title="Página anterior">
    <i class="fas fa-chevron-left text-xs"></i>
  </button>`;

  const range: (number | string)[] = [];
  const delta = 2; // Número de páginas a mostrar a los lados de la página actual

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== '…') {
      range.push('…');
    }
  }

  range.forEach(p => {
    if (p === '…') {
      html += `<span class="page-btn" style="cursor:default; border:none; background:transparent; display:flex; align-items:center; justify-content:center">…</span>`;
    } else {
      html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
  });

  // Botón Siguiente
  html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''} title="Página siguiente">
    <i class="fas fa-chevron-right text-xs"></i>
  </button>`;

  return html;
}

async function renderPlanCuentas(c) {
  const getContainer = (window as any).getPageContainer || ((x: any) => x || document.getElementById('page-content'));
  c = getContainer(c);
  if (!c) return;
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando plan de cuentas...</div>`;
  try {
    const [accounts, accTypes] = await Promise.all([
      API.getAccounts(false),
      pb.listAll('account_types', { sort: 'code' }),
    ]);

    let currentPage = 1;
    const itemsPerPage = 50;

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Plan de Cuentas</h3>
          <p class="text-sm" style="color:#6B7280">Administra cuentas PUC, naturaleza y estado.</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-outline" id="btn-export-accounts" title="Exportar plan de cuentas a Excel">
            <i class="fas fa-file-excel" style="color:#217346"></i> Exportar Excel
          </button>
          ${can('canWrite') ? `<button class="btn btn-primary" id="btn-new-account"><i class="fas fa-plus"></i> Nueva Cuenta</button>` : ''}
        </div>
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
        <div class="overflow-x-auto" style="max-height: calc(100vh - 350px)">
          <table class="data-table" id="accounts-table">
            <thead>
              <tr>
                 <th>Código</th><th>Nombre</th><th>Tipo</th><th>Req. Tercero</th><th>Cruce</th><th>Retenciones</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody id="accounts-tbody">
              <!-- Se poblará dinámicamente -->
            </tbody>
          </table>
        </div>
        
        <!-- Paginador elegante en la parte inferior -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t" style="border-color:#F0F0F0">
          <div class="text-sm font-medium" style="color:#6B7280" id="acct-pagination-info">
            Mostrando 0 - 0 de 0 cuentas
          </div>
          <div class="pagination" id="acct-pagination-controls">
            <!-- Botones dinámicos de página -->
          </div>
        </div>
      </div>`;

    const updateTable = () => {
      const q = getInputVal('acct-q').toLowerCase().trim();
      const type = getSelectVal('acct-type');
      const status = getSelectVal('acct-status');

      // Filtrar en memoria
      const filtered = accounts.filter(a => {
        const rowCode = (a.code || '').toLowerCase();
        const rowName = (a.name || '').toLowerCase();
        const rowTypeId = a.account_type_id || '';
        const isActive = a.active;

        const okQ = !q || rowCode.includes(q) || rowName.includes(q);
        const okType = !type || rowTypeId === type;
        const okStatus = !status || (status === 'active' ? isActive : !isActive);

        return okQ && okType && okStatus;
      });

      const totalItems = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

      // Ajustar página actual si sale de los límites
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = filtered.slice(start, end);

      const tbody = document.getElementById('accounts-tbody');
      if (tbody) {
        if (pageItems.length === 0) {
          tbody.innerHTML = `<tr><td colspan="8" class="text-center py-10" style="color:#9CA3AF">No se encontraron cuentas con los filtros seleccionados.</td></tr>`;
        } else {
          tbody.innerHTML = pageItems.map(a => {
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
            <tr>
              <td><span class="font-semibold" style="color:#1A4B8C">${esc(a.code)}</span></td>
              <td>${esc(a.name)}</td>
              <td>${esc(t?.name ?? '?')}</td>
              <td>${reqTercero}</td>
              <td>${cruce}</td>
              <td>${retLabel}</td>
              <td>${badge}</td>
              <td>
                <div class="flex gap-2">
                  ${can('canWrite') ? `<button class="btn btn-outline btn-sm" onclick="editAccount('${esc(a.id)}')" title="Editar cuenta"><i class="fas fa-pen"></i></button>` : ''}
                  ${can('canDelete') ? `<button class="btn btn-danger btn-sm" onclick="toggleAccountActive('${esc(a.id)}', ${a.active ? 'false' : 'true'})" title="${a.active ? 'Inactivar cuenta' : 'Reactivar cuenta'}"><i class="fas ${a.active ? 'fa-ban' : 'fa-rotate-left'}"></i></button>` : ''}
                </div>
              </td>
            </tr>`;
          }).join('');
        }
      }

      // Actualizar información sobre páginas y registros
      const infoSpan = document.getElementById('acct-pagination-info');
      if (infoSpan) {
        if (totalItems === 0) {
          infoSpan.textContent = 'Mostrando 0 - 0 de 0 cuentas';
        } else {
          infoSpan.textContent = `Mostrando ${start + 1} - ${Math.min(end, totalItems)} de ${totalItems} cuentas`;
        }
      }

      // Actualizar los controles de paginación
      const paginationControls = document.getElementById('acct-pagination-controls');
      if (paginationControls) {
        if (totalPages <= 1) {
          paginationControls.innerHTML = '';
        } else {
          paginationControls.innerHTML = generatePagination(totalPages, currentPage);
        }
      }
    };

    // Escuchadores de eventos para los filtros
    const inputQ = document.getElementById('acct-q');
    const selectType = document.getElementById('acct-type');
    const selectStatus = document.getElementById('acct-status');

    if (inputQ) {
      inputQ.addEventListener('input', debounce(() => {
        currentPage = 1;
        updateTable();
      }, 200));
    }
    if (selectType) {
      selectType.addEventListener('change', () => {
        currentPage = 1;
        updateTable();
      });
    }
    if (selectStatus) {
      selectStatus.addEventListener('change', () => {
        currentPage = 1;
        updateTable();
      });
    }

    // Escuchador de clic en controles de paginación (con delegación de eventos)
    const paginationControls = document.getElementById('acct-pagination-controls');
    if (paginationControls) {
      paginationControls.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement).closest('.page-btn') as HTMLButtonElement | null;
        if (btn && !btn.hasAttribute('disabled')) {
          const pageAttr = btn.getAttribute('data-page');
          if (pageAttr) {
            currentPage = parseInt(pageAttr);
            updateTable();
            // Desplazar contenedor de tabla al inicio
            const tableContainer = document.querySelector('#accounts-table')?.parentElement;
            if (tableContainer) tableContainer.scrollTop = 0;
          }
        }
      });
    }

    // Inicializar eventos de botones principales
    $('#btn-new-account')?.addEventListener('click', () => openAccountForm(accounts, accTypes));
    $('#btn-export-accounts')?.addEventListener('click', () => exportPlanCuentasExcel(accounts, accTypes));

    // Primer renderizado
    updateTable();

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

  const bodyHtml = `
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
    </div>`;

  openModal(
    row ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable',
    bodyHtml,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-save-account"><i class="fas fa-floppy-disk"></i> Guardar</button>`,
    true
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
   EXPORTAR PLAN DE CUENTAS → EXCEL
   Genera un .xlsx con todos los campos disponibles en la
   colección `accounts`, más una hoja resumen por nivel.
   Usa la librería XLSX (SheetJS) cargada globalmente.
   ══════════════════════════════════════════════════════════ */
function exportPlanCuentasExcel(accounts: any[], accTypes: any[]) {
  const XLSX = (window as any).XLSX;
  if (!XLSX) {
    showToast('La librería de Excel no está disponible. Recarga la página e intenta de nuevo.', 'error');
    return;
  }

  if (!accounts?.length) {
    showToast('No hay cuentas para exportar.', 'warning');
    return;
  }

  /* ── Mapa rápido: id → nombre del tipo de cuenta ────────── */
  const typeMap: Record<string, string> = {};
  (accTypes || []).forEach(t => { typeMap[t.id] = `${t.code} - ${t.name}`; });

  /* ── Mapa legible para naturaleza y nivel ───────────────── */
  const NATURE_LABEL: Record<string, string> = { debit: 'Débito', credit: 'Crédito' };
  const LEVEL_LABEL:  Record<number, string> = {
    1: 'Clase',
    2: 'Grupo',
    3: 'Cuenta',
    4: 'Subcuenta',
    5: 'Auxiliar',
    6: 'Sub-Auxiliar',
  };

  /* ── Hoja 1 — Datos completos ──────────────────────────── */
  const headers = [
    'Código',
    'Nombre',
    'Tipo de Cuenta',
    'Nivel (Nro)',
    'Nivel (Nombre)',
    'Código Padre',
    'Naturaleza',
    'Req. Tercero',
    'Maneja Cruce (CxP/CxC)',
    'Maneja Retenciones',
    'Tipos de Retención',
    '% Reterenta',
    '% Reteiva',
    '% Reteica',
    'Estado',
    'ID Interno',
    'Fecha Creación',
    'Última Actualización',
  ];

  const dataRows = accounts
    .slice()
    .sort((a, b) => String(a.code).localeCompare(String(b.code), 'es', { numeric: true }))
    .map(a => {
      const tiposArr = (a.tipos_retencion || '').split(',').filter(Boolean);
      const tiposLabel: Record<string, string> = { reterenta: 'Reterenta', reteiva: 'Reteiva', reteica: 'Reteica' };
      return [
        a.code            ?? '',
        a.name            ?? '',
        typeMap[a.account_type_id] ?? a.account_type_id ?? '',
        a.level           ?? '',
        LEVEL_LABEL[a.level] ?? '',
        a.parent_code     ?? '',
        NATURE_LABEL[a.nature] ?? a.nature ?? '',
        a.requires_third_party ? 'Sí' : 'No',
        a.maneja_cruce       ? 'Sí' : 'No',
        a.maneja_retenciones ? 'Sí' : 'No',
        tiposArr.map(t => tiposLabel[t] ?? t).join(', ') || '—',
        a.ret_rate_reterenta ?? 0,
        a.ret_rate_reteiva   ?? 0,
        a.ret_rate_reteica   ?? 0,
        a.active ? 'Activa' : 'Inactiva',
        a.id              ?? '',
        a.created         ? new Date(a.created).toLocaleString('es-CO')  : '',
        a.updated         ? new Date(a.updated).toLocaleString('es-CO')  : '',
      ];
    });

  const wsData = [headers, ...dataRows];
  const ws1 = XLSX.utils.aoa_to_sheet(wsData);

  /* Anchos de columna (en caracteres) */
  ws1['!cols'] = [
    { wch: 14 }, // Código
    { wch: 45 }, // Nombre
    { wch: 28 }, // Tipo
    { wch: 10 }, // Nivel nro
    { wch: 16 }, // Nivel nombre
    { wch: 14 }, // Código Padre
    { wch: 12 }, // Naturaleza
    { wch: 14 }, // Req. Tercero
    { wch: 24 }, // Cruce
    { wch: 20 }, // Retenciones
    { wch: 28 }, // Tipos retención
    { wch: 13 }, // % Reterenta
    { wch: 11 }, // % Reteiva
    { wch: 11 }, // % Reteica
    { wch: 10 }, // Estado
    { wch: 26 }, // ID
    { wch: 22 }, // Creación
    { wch: 22 }, // Actualización
  ];

  /* Estilo de cabecera (fila 1 = índice 0, celdas A1:R1) */
  const headerStyle = {
    font:      { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
    fill:      { fgColor: { rgb: '1A4B8C' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border:    {
      bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
      right:  { style: 'thin', color: { rgb: 'CCCCCC' } },
    },
  };
  headers.forEach((_, ci) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: ci });
    if (ws1[cellRef]) ws1[cellRef].s = headerStyle;
  });

  /* Estilos alternados para filas de datos */
  dataRows.forEach((row, ri) => {
    const rowStyle = {
      fill:      { fgColor: { rgb: ri % 2 === 0 ? 'F0F4FA' : 'FFFFFF' } },
      alignment: { vertical: 'center' },
      border: {
        bottom: { style: 'hair', color: { rgb: 'E0E0E0' } },
        right:  { style: 'hair', color: { rgb: 'E0E0E0' } },
      },
    };
    row.forEach((_, ci) => {
      const cellRef = XLSX.utils.encode_cell({ r: ri + 1, c: ci });
      if (ws1[cellRef]) ws1[cellRef].s = rowStyle;
    });
  });

  /* ── Hoja 2 — Resumen por nivel ────────────────────────── */
  const levelCounts: Record<number, { total: number; active: number; inactive: number }> = {};
  accounts.forEach(a => {
    const lvl = a.level ?? 0;
    if (!levelCounts[lvl]) levelCounts[lvl] = { total: 0, active: 0, inactive: 0 };
    levelCounts[lvl].total++;
    if (a.active) levelCounts[lvl].active++;
    else          levelCounts[lvl].inactive++;
  });

  const summaryHeaders = ['Nivel', 'Descripción', 'Total Cuentas', 'Activas', 'Inactivas'];
  const summaryRows = Object.entries(levelCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([lvl, cnt]) => [
      Number(lvl),
      LEVEL_LABEL[Number(lvl)] ?? `Nivel ${lvl}`,
      cnt.total,
      cnt.active,
      cnt.inactive,
    ]);

  // Fila de totales
  const totals = summaryRows.reduce(
    (acc, row) => { acc[2] += row[2]; acc[3] += row[3]; acc[4] += row[4]; return acc; },
    ['TOTAL', '', 0, 0, 0],
  );
  summaryRows.push(totals);

  const ws2Data = [summaryHeaders, ...summaryRows];
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols'] = [{ wch: 8 }, { wch: 18 }, { wch: 16 }, { wch: 10 }, { wch: 12 }];

  /* Estilo cabecera hoja 2 */
  summaryHeaders.forEach((_, ci) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: ci });
    if (ws2[cellRef]) ws2[cellRef].s = headerStyle;
  });

  /* Estilo fila de totales (última fila) */
  const totalRowIdx = summaryRows.length; // 1-based (headers + rows = totalRowIdx)
  summaryHeaders.forEach((_, ci) => {
    const cellRef = XLSX.utils.encode_cell({ r: totalRowIdx, c: ci });
    if (ws2[cellRef]) {
      ws2[cellRef].s = {
        font: { bold: true, color: { rgb: '0D2137' } },
        fill: { fgColor: { rgb: 'D6E4FF' } },
        alignment: { horizontal: ci <= 1 ? 'left' : 'center' },
      };
    }
  });

  /* ── Hoja 3 — Metadatos de exportación ─────────────────── */
  const empresa   = (document.getElementById('sidebar-empresa') as HTMLElement)?.textContent?.trim() ||
                    (window as any).currentEmpresa?.name || 'GRAVY';
  const fechaExp  = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  const ws3 = XLSX.utils.aoa_to_sheet([
    ['Campo', 'Valor'],
    ['Empresa',           empresa],
    ['Fecha de exportación', fechaExp],
    ['Total de cuentas',  accounts.length],
    ['Cuentas activas',   accounts.filter(a => a.active).length],
    ['Cuentas inactivas', accounts.filter(a => !a.active).length],
    ['Versión sistema',   'GRAVY v2.0'],
    ['Generado por',      'Plan de Cuentas PUC'],
  ]);
  ws3['!cols'] = [{ wch: 22 }, { wch: 36 }];

  /* ── Construir workbook ──────────────────────────────────── */
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Plan de Cuentas');
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumen por Nivel');
  XLSX.utils.book_append_sheet(wb, ws3, 'Info Exportación');

  /* ── Nombre de archivo con fecha ────────────────────────── */
  const today = (window as any).todayStr().replace(/-/g, '');
  XLSX.writeFile(wb, `PlanCuentas_${today}.xlsx`);
  showToast(`Plan de Cuentas exportado correctamente (${accounts.length} cuentas).`, 'success');
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
(window as any).exportPlanCuentasExcel = exportPlanCuentasExcel;
