/**
 * ContaCO v2.0 — plan-cuentas.js
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
            <button class="btn btn-outline" id="btn-import-accounts"><i class="fas fa-file-arrow-up"></i> Importar</button>
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
    $('#btn-import-accounts')?.addEventListener('click', () => openImportAccountsModal(accTypes));
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
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="ac-reterenta" ${(row?.tipos_retencion || '').includes('reterenta') ? 'checked' : ''} class="w-4 h-4" style="accent-color:#D97706">
            <span class="text-sm">Reterenta</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="ac-reteiva" ${(row?.tipos_retencion || '').includes('reteiva') ? 'checked' : ''} class="w-4 h-4" style="accent-color:#D97706">
            <span class="text-sm">Reteiva</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="ac-reteica" ${(row?.tipos_retencion || '').includes('reteica') ? 'checked' : ''} class="w-4 h-4" style="accent-color:#D97706">
            <span class="text-sm">Reteica</span>
          </label>
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
  };

  $('#btn-save-account')?.addEventListener('click', async () => {
    const tiposArr = [];
    if (document.getElementById('ac-ret')?.checked) {
      if (document.getElementById('ac-reterenta')?.checked) tiposArr.push('reterenta');
      if (document.getElementById('ac-reteiva')?.checked)   tiposArr.push('reteiva');
      if (document.getElementById('ac-reteica')?.checked)   tiposArr.push('reteica');
    }
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
      maneja_retenciones: !!document.getElementById('ac-ret')?.checked,
      tipos_retencion: tiposArr.join(','),
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
   IMPORTACIÓN MASIVA DE CUENTAS
   Columnas esperadas (CSV/Excel):
     codigo | nombre | tipo | naturaleza | nivel | codigo_padre | requiere_tercero | activa
   ══════════════════════════════════════════════════════════ */

/**
 * Descarga una plantilla CSV de ejemplo para importación.
 */
function downloadImportTemplate() {
  const header = 'codigo,nombre,tipo,naturaleza,nivel,codigo_padre,requiere_tercero,activa';
  const example = [
    '1,ACTIVO,1,debit,1,,No,Si',
    '11,DISPONIBLE,1,debit,2,1,,Si',
    '1105,CAJA,1,debit,3,11,,Si',
    '110505,Caja General,1,debit,4,1105,No,Si',
  ].join('\n');
  const blob = new Blob([header + '\n' + example], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_plan_cuentas.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parsea CSV simple respetando comillas.
 */
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
  if (!lines.length) return [];
  const splitLine = line => {
    const fields = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { fields.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    fields.push(cur.trim());
    return fields;
  };
  const headers = splitLine(lines[0]).map(h => h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_'));
  return lines.slice(1).map(line => {
    const vals = splitLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
    return obj;
  });
}

/**
 * Parsea Excel usando la librería xlsx.full.min.js ya cargada.
 */
function parseExcel(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  // Normalizar claves de encabezado
  return rows.map(r => {
    const norm = {};
    Object.entries(r).forEach(([k, v]) => {
      const key = String(k).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
      norm[key] = String(v ?? '').trim();
    });
    return norm;
  });
}

/**
 * Normaliza una fila cruda a un objeto de cuenta con validaciones.
 * Retorna { ok, payload, error }.
 */
function normalizeImportRow(raw, accTypes) {
  const get = (...keys) => {
    for (const k of keys) {
      const v = raw[k];
      if (v !== undefined && v !== '') return String(v).trim();
    }
    return '';
  };

  const code       = get('codigo', 'code', 'cod', 'cuenta');
  const name       = get('nombre', 'name', 'descripcion', 'description');
  const tipoRaw    = get('tipo', 'type', 'tipo_cuenta', 'account_type');
  const natRaw     = get('naturaleza', 'nature', 'nat');
  const levelRaw   = get('nivel', 'level');
  const parentCode = get('codigo_padre', 'parent_code', 'padre', 'parent');
  const thirdRaw   = get('requiere_tercero', 'requires_third_party', 'tercero', 'req_tercero');
  const activeRaw  = get('activa', 'active', 'estado');

  if (!code) return { ok: false, error: 'Falta el código' };
  if (!/^\d+$/.test(code)) return { ok: false, error: `Código "${code}" no es numérico` };
  if (!name) return { ok: false, error: 'Falta el nombre' };
  if (!tipoRaw) return { ok: false, error: 'Falta el tipo de cuenta' };

  // Resolver account_type_id por código numérico o por nombre
  const tipoNorm = tipoRaw.toLowerCase().trim();
  const accType = accTypes.find(t =>
    String(t.code).toLowerCase() === tipoNorm ||
    t.name.toLowerCase().includes(tipoNorm)
  );
  if (!accType) return { ok: false, error: `Tipo de cuenta "${tipoRaw}" no encontrado` };

  // Naturaleza
  let nature = 'debit';
  if (/^(c|cr|credit|credito|crédito)$/i.test(natRaw)) nature = 'credit';

  // Nivel: si no se suministra, inferir del largo del código
  const level = levelRaw ? Math.max(1, parseInt(levelRaw, 10) || 1) : code.length;

  // Requiere tercero
  const requiresThird = /^(s[ií]|yes|1|true)$/i.test(thirdRaw);

  // Activa (default: true)
  const active = !/^(no|0|false|inactiva|inactivo)$/i.test(activeRaw);

  return {
    ok: true,
    payload: {
      code,
      name,
      account_type_id: accType.id,
      nature,
      level,
      parent_code: parentCode,
      requires_third_party: requiresThird,
      active,
      maneja_cruce: false,
      maneja_retenciones: false,
      tipos_retencion: '',
    },
  };
}

/**
 * Modal principal de importación.
 */
async function openImportAccountsModal(accTypes) {
  if (!can('canWrite')) return showToast('No tienes permisos para importar cuentas', 'error');
  if (!accTypes) accTypes = await pb.listAll('account_types', { sort: 'code' });

  openModal(
    '<i class="fas fa-file-arrow-up mr-2" style="color:#1A4B8C"></i>Importar Plan de Cuentas',
    `
    <div class="mb-4">
      <p class="text-sm mb-3" style="color:#374151">
        Carga un archivo <strong>CSV</strong> o <strong>Excel (.xlsx)</strong> con las cuentas a crear o actualizar.
        Si el código ya existe, la cuenta será <strong>actualizada</strong>; si no existe, será <strong>creada</strong>.
      </p>
      <div class="rounded-xl p-3 mb-3" style="background:#F0F7FF;border:1px solid #BFDBFE">
        <p class="text-xs font-semibold mb-1" style="color:#1A4B8C;text-transform:uppercase;letter-spacing:.05em">Columnas requeridas</p>
        <div class="flex flex-wrap gap-2">
          ${['codigo','nombre','tipo'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#DBEAFE;color:#1D4ED8">${c}</code>`).join('')}
          ${['naturaleza','nivel','codigo_padre','requiere_tercero','activa'].map(c => `<code class="text-xs px-2 py-0.5 rounded" style="background:#F3F4F6;color:#6B7280">${c} <span style="font-size:.65rem">(opcional)</span></code>`).join('')}
        </div>
        <p class="text-xs mt-2" style="color:#6B7280">El campo <strong>tipo</strong> debe coincidir con el código numérico del tipo de cuenta (ej: <em>1</em>, <em>2</em>).</p>
      </div>
      <button class="btn btn-outline btn-sm mb-4" id="btn-download-template"><i class="fas fa-download mr-1"></i>Descargar plantilla CSV</button>
      <div id="import-drop-zone" class="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all" style="border-color:#D1D5DB;background:#FAFAFA">
        <i class="fas fa-cloud-arrow-up text-3xl mb-3" style="color:#9CA3AF"></i>
        <p class="text-sm font-medium" style="color:#374151">Arrastra tu archivo aquí o <span style="color:#1A4B8C;text-decoration:underline">haz clic para seleccionar</span></p>
        <p class="text-xs mt-1" style="color:#9CA3AF">CSV · XLSX · XLS — máx. 5 MB</p>
        <input type="file" id="import-file-input" accept=".csv,.xlsx,.xls" class="hidden">
      </div>
      <div id="import-preview" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm font-semibold" style="color:#0D2137">Vista previa — <span id="import-preview-count"></span></p>
          <button class="btn btn-outline btn-sm" id="btn-clear-import"><i class="fas fa-xmark mr-1"></i>Limpiar</button>
        </div>
        <div class="rounded-xl border overflow-hidden" style="border-color:#F0F0F0;max-height:300px;overflow-y:auto">
          <table class="data-table text-xs" id="import-preview-table">
            <thead><tr>
              <th>#</th><th>Código</th><th>Nombre</th><th>Tipo</th><th>Nat.</th><th>Nivel</th><th>Padre</th><th>Estado</th>
            </tr></thead>
            <tbody id="import-preview-body"></tbody>
          </table>
        </div>
        <div id="import-summary" class="mt-2 text-xs" style="color:#6B7280"></div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary hidden" id="btn-execute-import"><i class="fas fa-bolt mr-1"></i>Ejecutar importación</button>`,
    true /* wide */
  );

  // Almacena filas parseadas accesibles al botón de ejecución
  let _parsedRows = [];

  const dropZone  = document.getElementById('import-drop-zone');
  const fileInput = document.getElementById('import-file-input');

  document.getElementById('btn-download-template')?.addEventListener('click', downloadImportTemplate);

  // Click en drop zone abre el selector de archivos
  dropZone?.addEventListener('click', () => fileInput?.click());

  // Drag & drop
  dropZone?.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#1A4B8C';
    dropZone.style.background  = '#EFF6FF';
  });
  dropZone?.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#D1D5DB';
    dropZone.style.background  = '#FAFAFA';
  });
  dropZone?.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.style.borderColor = '#D1D5DB';
    dropZone.style.background  = '#FAFAFA';
    const file = e.dataTransfer?.files?.[0];
    if (file) processImportFile(file);
  });

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) processImportFile(file);
  });

  document.getElementById('btn-clear-import')?.addEventListener('click', () => {
    _parsedRows = [];
    document.getElementById('import-preview')?.classList.add('hidden');
    document.getElementById('btn-execute-import')?.classList.add('hidden');
    if (fileInput) fileInput.value = '';
  });

  async function processImportFile(file) {
    if (file.size > 5 * 1024 * 1024) return showToast('El archivo supera el límite de 5 MB', 'error');
    const ext = file.name.split('.').pop().toLowerCase();
    let rawRows = [];
    try {
      if (ext === 'csv') {
        const text = await file.text();
        rawRows = parseCSV(text);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buf = await file.arrayBuffer();
        rawRows = parseExcel(buf);
      } else {
        return showToast('Formato no soportado. Usa CSV, XLSX o XLS.', 'error');
      }
    } catch (e) {
      return showToast('Error al leer el archivo: ' + e.message, 'error');
    }
    if (!rawRows.length) return showToast('El archivo no contiene filas de datos', 'warning');

    _parsedRows = rawRows.map((r, i) => ({ idx: i + 1, raw: r, ...normalizeImportRow(r, accTypes) }));
    renderImportPreview(_parsedRows);
  }

  function renderImportPreview(rows) {
    const tbody  = document.getElementById('import-preview-body');
    const count  = document.getElementById('import-preview-count');
    const summary = document.getElementById('import-summary');
    const execBtn = document.getElementById('btn-execute-import');
    const preview = document.getElementById('import-preview');

    const okRows  = rows.filter(r => r.ok);
    const errRows = rows.filter(r => !r.ok);

    count.textContent = `${rows.length} fila(s) — ${okRows.length} válidas, ${errRows.length} con error`;

    tbody.innerHTML = rows.map(r => {
      if (r.ok) {
        const p = r.payload;
        const typeName = accTypes.find(t => t.id === p.account_type_id)?.name ?? '?';
        return `<tr>
          <td>${r.idx}</td>
          <td><span class="font-semibold" style="color:#1A4B8C">${esc(p.code)}</span></td>
          <td>${esc(p.name)}</td>
          <td class="text-xs">${esc(typeName)}</td>
          <td>${p.nature === 'debit' ? 'Db' : 'Cr'}</td>
          <td>${p.level}</td>
          <td>${esc(p.parent_code || '—')}</td>
          <td><span class="badge badge-green">OK</span></td>
        </tr>`;
      } else {
        return `<tr style="background:#FFF7F7">
          <td>${r.idx}</td>
          <td colspan="6" class="text-xs" style="color:#EF4444">${esc(r.error)}</td>
          <td><span class="badge badge-red" title="${esc(r.error)}">Error</span></td>
        </tr>`;
      }
    }).join('');

    if (errRows.length) {
      summary.innerHTML = `<span style="color:#EF4444"><i class="fas fa-triangle-exclamation mr-1"></i>${errRows.length} fila(s) con error serán omitidas.</span>`;
    } else {
      summary.innerHTML = `<span style="color:#22C55E"><i class="fas fa-circle-check mr-1"></i>Todas las filas son válidas.</span>`;
    }

    preview.classList.remove('hidden');
    if (okRows.length) execBtn?.classList.remove('hidden');
    else execBtn?.classList.add('hidden');
  }

  document.getElementById('btn-execute-import')?.addEventListener('click', () => executeImport(_parsedRows));

  async function executeImport(rows) {
    const okRows = rows.filter(r => r.ok);
    if (!okRows.length) return;

    const execBtn = document.getElementById('btn-execute-import');
    if (execBtn) { execBtn.disabled = true; execBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Importando...'; }

    // Cargar cuentas existentes para decidir crear vs actualizar
    let existingMap = {};
    try {
      const all = await pb.listAll('accounts', {});
      all.forEach(a => { existingMap[a.code] = a.id; });
    } catch (e) {
      showToast('Error al cargar cuentas existentes: ' + e.message, 'error');
      if (execBtn) { execBtn.disabled = false; execBtn.innerHTML = '<i class="fas fa-bolt mr-1"></i>Ejecutar importación'; }
      return;
    }

    let created = 0, updated = 0, errors = 0;
    const errorMsgs = [];

    for (const row of okRows) {
      const p = row.payload;
      try {
        if (existingMap[p.code]) {
          await pb.update('accounts', existingMap[p.code], p);
          updated++;
        } else {
          const rec = await pb.create('accounts', p);
          existingMap[p.code] = rec.id;
          created++;
        }
      } catch (e) {
        errors++;
        errorMsgs.push(`Código ${p.code}: ${e.message}`);
      }
    }

    await API.logAudit('IMPORT', 'Cuenta', 'bulk', `${created} creadas, ${updated} actualizadas, ${errors} errores`);

    closeModal();

    let msg = `Importación completada: ${created} creadas, ${updated} actualizadas.`;
    if (errors) msg += ` ${errors} con error.`;
    showToast(msg, errors ? 'warning' : 'success', 5000);

    if (errorMsgs.length) {
      console.warn('[ImportCuentas] Errores:', errorMsgs);
    }

    renderPlanCuentas($('#page-content'));
  }
}
