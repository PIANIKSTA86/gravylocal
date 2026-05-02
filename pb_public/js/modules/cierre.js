/**
 * ContaCO v2.0 - cierre.js
 * Asistente de Cierre Contable Mensual
 */
'use strict';

// Periodos de cierre almacenados en settings (clave: "periodos_cierre" como JSON array)
const CIERRE_SETTING_KEY = 'periodos_cierre';
const SIGNATURE_SETTINGS = {
  legalName: ['representante_legal_name', 'legal_representative_name', 'rep_legal_name'],
  legalTitle: ['representante_legal_title', 'legal_representative_title', 'rep_legal_title'],
  accountantName: ['contador_name', 'accountant_name'],
  accountantTitle: ['contador_title', 'accountant_title'],
  accountantLicense: ['contador_license', 'accountant_license'],
  reviewerName: ['revisor_fiscal_name', 'fiscal_reviewer_name'],
  reviewerTitle: ['revisor_fiscal_title', 'fiscal_reviewer_title'],
  reviewerLicense: ['revisor_fiscal_license', 'fiscal_reviewer_license'],
  defaultEnabled: ['trial_show_signatures_default', 'show_signatures_default'],
};

async function renderCierre(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando asistente de cierre...</div>`;
  try {
    // Load all data in parallel
    const [accounts, saldos] = await Promise.all([
      API.getAccounts(false),
      API.getAccountSaldos(),
    ]);
    const [periodosRaw, signatureValues] = await Promise.all([
      API.getSetting(CIERRE_SETTING_KEY),
      loadSignatureSettings(),
    ]);
    const periodos = periodosRaw ? JSON.parse(periodosRaw) : [];

    // Compute PUC class saldos for closing summary
    const byClass = {};
    for (const a of accounts) {
      const cls = (a.code || '').charAt(0);
      if (!byClass[cls]) byClass[cls] = 0;
      byClass[cls] += Number(saldos[a.id] || 0);
    }
    const ingresos = Math.abs(byClass['4'] || 0);
    const gastos = Math.abs(byClass['5'] || 0) + Math.abs(byClass['6'] || 0) + Math.abs(byClass['7'] || 0);
    const utilidad = ingresos - gastos;

    // Determine current period status
    const closedPeriods = new Set(periodos.filter(p => p.closed).map(p => p.key));
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentKey = `${currentYear}-${String(currentMonth).padStart(2,'0')}`;
    const isCurrentClosed = closedPeriods.has(currentKey);

    const statusBadge = closed =>
      closed
        ? '<span class="badge badge-red"><i class="fas fa-lock mr-1"></i>Cerrado</span>'
        : '<span class="badge badge-green"><i class="fas fa-lock-open mr-1"></i>Abierto</span>';

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Asistente de Cierre Contable</h3>
          <p class="text-sm" style="color:#6B7280">Gestion de Periodos, asientos de cierre y bloqueo de transacciones.</p>
        </div>
        ${can('canWrite') ? '<button class="btn btn-primary" id="btn-new-cierre"><i class="fas fa-calendar-check"></i> Realizar Cierre</button>' : ''}
      </div>

      <!-- Resumen del Periodo actual -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div class="rounded-2xl p-4 border" style="background:#F0F7FF;border-color:#BFDBFE">
          <div class="text-xs font-medium mb-1" style="color:#1D4ED8">Periodo Actual</div>
          <div class="text-lg font-bold" style="color:#1A4B8C">${currentKey}</div>
          <div class="mt-1">${statusBadge(isCurrentClosed)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="background:#F0FFF4;border-color:#BBF7D0">
          <div class="text-xs font-medium mb-1" style="color:#15803D">Total Ingresos (Cl.4)</div>
          <div class="text-lg font-bold" style="color:#15803D">${fmt(ingresos)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="background:#FEF2F2;border-color:#FECACA">
          <div class="text-xs font-medium mb-1" style="color:#B91C1C">Total Gastos (Cl.5/6/7)</div>
          <div class="text-lg font-bold" style="color:#B91C1C">${fmt(gastos)}</div>
        </div>
        <div class="rounded-2xl p-4 border" style="${utilidad >= 0 ? 'background:#F0FFF4;border-color:#BBF7D0' : 'background:#FEF2F2;border-color:#FECACA'}">
          <div class="text-xs font-medium mb-1" style="color:${utilidad >= 0 ? '#15803D' : '#B91C1C'}">${utilidad >= 0 ? 'Utilidad' : 'Perdida'} del Periodo</div>
          <div class="text-lg font-bold" style="color:${utilidad >= 0 ? '#15803D' : '#B91C1C'}">${fmt(Math.abs(utilidad))}</div>
        </div>
      </div>

      <!-- Estado del Periodo actual -->
      ${isCurrentClosed
        ? `<div class="mb-4 p-4 rounded-2xl border flex items-center gap-3" style="background:#FEF2F2;border-color:#FECACA">
            <i class="fas fa-lock text-xl" style="color:#B91C1C"></i>
            <div>
              <p class="font-semibold" style="color:#B91C1C">Periodo ${currentKey} CERRADO</p>
              <p class="text-sm" style="color:#6B7280">No se pueden crear ni anular transacciones en este Periodo.</p>
            </div>
            ${can('canWrite') ? `<button class="btn btn-outline btn-sm ml-auto" onclick="reOpenPeriod('${currentKey}')"><i class="fas fa-lock-open"></i> Re-abrir</button>` : ''}
          </div>`
        : `<div class="mb-4 p-4 rounded-2xl border flex items-center gap-3" style="background:#F0FFF4;border-color:#BBF7D0">
            <i class="fas fa-lock-open text-xl" style="color:#15803D"></i>
            <div>
              <p class="font-semibold" style="color:#15803D">Periodo ${currentKey} ABIERTO</p>
              <p class="text-sm" style="color:#6B7280">El Periodo actual acepta nuevas transacciones.</p>
            </div>
          </div>`
      }

      <!-- Historial de Periodos -->
      <div class="bg-white rounded-2xl border overflow-hidden mb-4" style="border-color:#F0F0F0">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:#F3F4F6">
          <h4 class="font-bold" style="color:#0D2137">Historial de Periodos</h4>
          <span class="text-xs" style="color:#9CA3AF">${periodos.length} Periodo(s) registrado(s)</span>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Periodo</th><th>Estado</th><th>Fecha de Cierre</th><th>Usuario</th><th>Utilidad Registrada</th><th>Nota</th><th>Acciones</th></tr></thead>
            <tbody>
              ${periodos.length
                ? [...periodos].reverse().map(p => `
                  <tr>
                    <td class="font-mono font-semibold">${esc(p.key)}</td>
                    <td>${statusBadge(p.closed)}</td>
                    <td>${esc(p.closedAt || '—')}</td>
                    <td>${esc(p.closedBy || '—')}</td>
                    <td class="font-semibold ${p.utilidad >= 0 ? '' : ''}" style="color:${(p.utilidad||0) >= 0 ? '#15803D' : '#B91C1C'}">${fmt(p.utilidad || 0)}</td>
                    <td class="text-sm" style="color:#6B7280">${esc(p.note || '—')}</td>
                    <td>
                      <div class="flex gap-1">
                        ${p.closed && can('canWrite') ? `<button class="btn btn-outline btn-sm" title="Re-abrir Periodo" onclick="reOpenPeriod('${esc(p.key)}')"><i class="fas fa-lock-open"></i></button>` : ''}
                        ${!p.closed && can('canWrite') ? `<button class="btn btn-danger btn-sm" title="Cerrar Periodo" onclick="closePeriod('${esc(p.key)}')"><i class="fas fa-lock"></i></button>` : ''}
                      </div>
                    </td>
                  </tr>`).join('')
                : '<tr><td colspan="7" class="text-center py-8" style="color:#9CA3AF">No hay Periodos registrados aun.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Firmas para reportes -->
      <div class="bg-white rounded-2xl border p-5 mb-4" style="border-color:#F0F0F0">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h4 class="font-bold" style="color:#0D2137">Firmas para Reportes</h4>
            <p class="text-sm" style="color:#6B7280">Estos datos se usan cuando activas "Mostrar firmas" en Balance de Prueba.</p>
          </div>
          ${can('canWrite') ? '<button class="btn btn-primary btn-sm" id="btn-save-signatures"><i class="fas fa-floppy-disk"></i> Guardar firmas</button>' : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="form-group md:col-span-2">
            <label class="inline-flex items-center gap-2 text-sm" style="color:#374151">
              <input id="sig-default-enabled" type="checkbox" ${signatureValues.defaultEnabled ? 'checked' : ''}>
              Activar "Mostrar firmas" por defecto en Balance de Prueba
            </label>
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Representante legal - Nombre</label>
            <input id="sig-legal-name" class="form-input" value="${esc(signatureValues.legalName || '')}" placeholder="Nombre completo">
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Representante legal - Cargo</label>
            <input id="sig-legal-title" class="form-input" value="${esc(signatureValues.legalTitle || 'Representante Legal')}" placeholder="Representante Legal">
          </div>

          <div class="form-group">
            <label class="form-label">Contador - Nombre</label>
            <input id="sig-acc-name" class="form-input" value="${esc(signatureValues.accountantName || '')}" placeholder="Nombre completo">
          </div>
          <div class="form-group">
            <label class="form-label">Contador - Cargo</label>
            <input id="sig-acc-title" class="form-input" value="${esc(signatureValues.accountantTitle || 'Contador')}" placeholder="Contador">
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Contador - Matrícula profesional (opcional)</label>
            <input id="sig-acc-license" class="form-input" value="${esc(signatureValues.accountantLicense || '')}" placeholder="TP 123456-T">
          </div>

          <div class="form-group">
            <label class="form-label">Revisor fiscal - Nombre</label>
            <input id="sig-rev-name" class="form-input" value="${esc(signatureValues.reviewerName || '')}" placeholder="Nombre completo">
          </div>
          <div class="form-group">
            <label class="form-label">Revisor fiscal - Cargo</label>
            <input id="sig-rev-title" class="form-input" value="${esc(signatureValues.reviewerTitle || 'Revisor Fiscal')}" placeholder="Revisor Fiscal">
          </div>
          <div class="form-group md:col-span-2">
            <label class="form-label">Revisor fiscal - Matrícula profesional (opcional)</label>
            <input id="sig-rev-license" class="form-input" value="${esc(signatureValues.reviewerLicense || '')}" placeholder="TP 654321-T">
          </div>
        </div>
      </div>

      <!-- Asientos de cierre -->
      <div class="bg-white rounded-2xl border p-5" style="border-color:#F0F0F0">
        <h4 class="font-bold mb-3" style="color:#0D2137">Asientos de Cierre Sugeridos</h4>
        <p class="text-sm mb-4" style="color:#6B7280">Al cerrar el Periodo, el asistente genera automaticamente los asientos de traslado de ingresos y gastos a la cuenta de resultados (Clase 3).</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${ingresos > 0
            ? `<div class="rounded-xl p-4 border" style="background:#F0FFF4;border-color:#BBF7D0">
                <p class="text-xs font-semibold mb-2" style="color:#15803D">1. Cierre de Ingresos (Cl.4 ? Cl.3)</p>
                <p class="text-sm" style="color:#374151">Debito cuentas de ingreso: <strong>${fmt(ingresos)}</strong></p>
                <p class="text-sm" style="color:#374151">Credito resultado del ejercicio: <strong>${fmt(ingresos)}</strong></p>
              </div>`
            : ''
          }
          ${gastos > 0
            ? `<div class="rounded-xl p-4 border" style="background:#FEF2F2;border-color:#FECACA">
                <p class="text-xs font-semibold mb-2" style="color:#B91C1C">2. Cierre de Gastos (Cl.3 ? Cl.5/6)</p>
                <p class="text-sm" style="color:#374151">Debito resultado del ejercicio: <strong>${fmt(gastos)}</strong></p>
                <p class="text-sm" style="color:#374151">Credito cuentas de gasto: <strong>${fmt(gastos)}</strong></p>
              </div>`
            : ''
          }
        </div>
        ${can('canWrite') && !isCurrentClosed
          ? `<div class="mt-4"><button class="btn btn-primary" id="btn-gen-cierre-entries"><i class="fas fa-magic"></i> Generar Asiento de Cierre</button></div>`
          : ''
        }
      </div>`;

    $('#btn-new-cierre')?.addEventListener('click', () => openCierreForm(periodos, utilidad));
    $('#btn-gen-cierre-entries')?.addEventListener('click', () => generateCierreEntries(accounts, saldos, utilidad));
    $('#btn-save-signatures')?.addEventListener('click', saveSignatureSettingsFromForm);
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function getSettingFirst(keys, fallback = '') {
  for (const key of keys) {
    const value = await API.getSetting(key);
    if (value) return value;
  }
  return fallback;
}

async function loadSignatureSettings() {
  const [
    legalName,
    legalTitle,
    accountantName,
    accountantTitle,
    accountantLicense,
    reviewerName,
    reviewerTitle,
    reviewerLicense,
    defaultEnabled,
  ] = await Promise.all([
    getSettingFirst(SIGNATURE_SETTINGS.legalName, ''),
    getSettingFirst(SIGNATURE_SETTINGS.legalTitle, 'Representante Legal'),
    getSettingFirst(SIGNATURE_SETTINGS.accountantName, ''),
    getSettingFirst(SIGNATURE_SETTINGS.accountantTitle, 'Contador'),
    getSettingFirst(SIGNATURE_SETTINGS.accountantLicense, ''),
    getSettingFirst(SIGNATURE_SETTINGS.reviewerName, ''),
    getSettingFirst(SIGNATURE_SETTINGS.reviewerTitle, 'Revisor Fiscal'),
    getSettingFirst(SIGNATURE_SETTINGS.reviewerLicense, ''),
    getSettingFirst(SIGNATURE_SETTINGS.defaultEnabled, '0'),
  ]);
  return {
    legalName,
    legalTitle,
    accountantName,
    accountantTitle,
    accountantLicense,
    reviewerName,
    reviewerTitle,
    reviewerLicense,
    defaultEnabled: String(defaultEnabled).trim() === '1' || String(defaultEnabled).toLowerCase() === 'true',
  };
}

async function saveSignatureSettingsFromForm() {
  if (!can('canWrite')) return showToast('Sin permisos para actualizar firmas', 'error');
  try {
    const payload = [
      [SIGNATURE_SETTINGS.legalName[0], getInputVal('sig-legal-name').trim()],
      [SIGNATURE_SETTINGS.legalTitle[0], getInputVal('sig-legal-title').trim() || 'Representante Legal'],
      [SIGNATURE_SETTINGS.accountantName[0], getInputVal('sig-acc-name').trim()],
      [SIGNATURE_SETTINGS.accountantTitle[0], getInputVal('sig-acc-title').trim() || 'Contador'],
      [SIGNATURE_SETTINGS.accountantLicense[0], getInputVal('sig-acc-license').trim()],
      [SIGNATURE_SETTINGS.reviewerName[0], getInputVal('sig-rev-name').trim()],
      [SIGNATURE_SETTINGS.reviewerTitle[0], getInputVal('sig-rev-title').trim() || 'Revisor Fiscal'],
      [SIGNATURE_SETTINGS.reviewerLicense[0], getInputVal('sig-rev-license').trim()],
      [SIGNATURE_SETTINGS.defaultEnabled[0], getCheckVal('sig-default-enabled') ? '1' : '0'],
    ];
    await Promise.all(payload.map(([k, v]) => API.setSetting(k, v)));
    showToast('Firmas actualizadas correctamente', 'success');
  } catch (err) {
    showToast(err.message || 'No se pudieron guardar las firmas', 'error');
  }
}

function openCierreForm(periodos, utilidad) {
  const now = new Date();
  const defaultKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;
  openModal(
    'Realizar Cierre Contable',
    `<div class="space-y-4">
      <div class="p-4 rounded-xl border" style="background:#FFF8F0;border-color:#FED7AA">
        <p class="text-sm font-semibold" style="color:#C46516"><i class="fas fa-triangle-exclamation mr-2"></i>Accion importante</p>
        <p class="text-sm mt-1" style="color:#374151">El cierre bloquea la creacion de nuevas transacciones en el Periodo seleccionado. Esta Accion se puede revertir si es necesario.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Periodo a Cerrar (YYYY-MM)</label>
          <input id="cierre-key" class="form-input font-mono" placeholder="Ej: 2026-05" value="${defaultKey}" pattern="\\d{4}-\\d{2}">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Cierre</label>
          <input id="cierre-date" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group md:col-span-2">
          <label class="form-label">Nota del Cierre</label>
          <textarea id="cierre-note" class="form-input" rows="2" placeholder="Observaciones del cierre..."></textarea>
        </div>
      </div>
      <div class="p-3 rounded-xl text-sm" style="background:#F0FFF4;border:1px solid #BBF7D0">
        <strong>Resultado del Periodo:</strong> Utilidad / (Perdida) = <strong>${fmt(utilidad)}</strong>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" id="btn-confirm-cierre"><i class="fas fa-lock"></i> Confirmar Cierre</button>`
  );
  $('#btn-confirm-cierre')?.addEventListener('click', async () => {
    const key = getInputVal('cierre-key').trim();
    const closedAt = getInputVal('cierre-date');
    const note = getInputVal('cierre-note').trim();
    if (!key || !/^\d{4}-\d{2}$/.test(key)) return showToast('El Periodo debe tener formato YYYY-MM', 'warning');
    if (!closedAt) return showToast('Ingresa la fecha de cierre', 'warning');
    if (periodos.find(p => p.key === key && p.closed)) return showToast(`El Periodo ${key} ya esta cerrado`, 'warning');

    try {
      const existing = periodos.find(p => p.key === key);
      const record = {
        key, closed: true, closedAt, closedBy: pb.currentUser?.email || 'admin',
        note, utilidad,
      };
      let newPeriodos;
      if (existing) {
        newPeriodos = periodos.map(p => p.key === key ? record : p);
      } else {
        newPeriodos = [...periodos, record];
      }
      await API.setSetting(CIERRE_SETTING_KEY, JSON.stringify(newPeriodos));
      closeModal();
      showToast(`Periodo ${key} cerrado correctamente`, 'success');
      renderCierre($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function closePeriod(key) {
  const periodosRaw = await API.getSetting(CIERRE_SETTING_KEY);
  const periodos = periodosRaw ? JSON.parse(periodosRaw) : [];
  const [accounts, saldos] = await Promise.all([API.getAccounts(false), API.getAccountSaldos()]);
  const byClass = {};
  for (const a of accounts) { const cls = (a.code||'').charAt(0); byClass[cls] = (byClass[cls]||0) + Number(saldos[a.id]||0); }
  const utilidad = Math.abs(byClass['4']||0) - (Math.abs(byClass['5']||0) + Math.abs(byClass['6']||0) + Math.abs(byClass['7']||0));
  openCierreForm(periodos, utilidad);
  // Pre-fill the key
  setTimeout(() => { const el = $('#cierre-key'); if (el) { el.value = key; } }, 100);
}

async function reOpenPeriod(key) {
  confirmDialog('Re-abrir Periodo', `Confirmas re-abrir el Periodo ${key}? Las transacciones volveran a ser posibles.`, async () => {
    try {
      const periodosRaw = await API.getSetting(CIERRE_SETTING_KEY);
      const periodos = periodosRaw ? JSON.parse(periodosRaw) : [];
      const newPeriodos = periodos.map(p => p.key === key ? { ...p, closed: false, closedAt: null } : p);
      await API.setSetting(CIERRE_SETTING_KEY, JSON.stringify(newPeriodos));
      showToast(`Periodo ${key} re-abierto`, 'success');
      renderCierre($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function generateCierreEntries(accounts, saldos, utilidad) {
  if (!can('canWrite')) return showToast('Sin permisos para generar asientos', 'error');
  // Find resultado del ejercicio account (3605, 3610, or first Clase 3 account without parent)
  const clase3Accounts = accounts.filter(a => (a.code || '').startsWith('3'));
  const resultadoAcc = clase3Accounts.find(a => a.code === '360505' || a.code === '36050501') ||
    clase3Accounts.find(a => a.code.startsWith('360') || a.code.startsWith('36')) ||
    clase3Accounts.find(a => !a.parent_code);
  if (!resultadoAcc) return showToast('no se encontro la cuenta de Resultado del Ejercicio (Clase 3). Creala en el Plan de Cuentas.', 'error');

  const ingresoAccounts = accounts.filter(a => (a.code||'').startsWith('4') && Math.abs(Number(saldos[a.id]||0)) > 0.001);
  const gastoAccounts = accounts.filter(a => ['5','6','7'].includes((a.code||'').charAt(0)) && Math.abs(Number(saldos[a.id]||0)) > 0.001);

  if (!ingresoAccounts.length && !gastoAccounts.length) return showToast('No hay saldos de ingresos ni gastos para cerrar.', 'warning');

  openModal(
    'Asiento de Cierre - Vista Previa',
    `<div class="space-y-4 text-sm">
      <p style="color:#6B7280">Se generaran los siguientes comprobantes contables de cierre:</p>
      <div class="overflow-x-auto">
        <table class="data-table text-xs">
          <thead><tr><th>Cuenta</th><th>Descripcion</th><th>Debito</th><th>Credito</th></tr></thead>
          <tbody>
            ${ingresoAccounts.map(a => {
              const s = Math.abs(Number(saldos[a.id]||0));
              return `<tr><td class="font-mono">${esc(a.code)}</td><td>${esc(a.name)}</td><td>${fmt(s)}</td><td></td></tr>`;
            }).join('')}
            <tr style="background:#F0FFF4"><td class="font-mono">${esc(resultadoAcc.code)}</td><td>${esc(resultadoAcc.name)} (Ingresos)</td><td></td><td>${fmt(Math.abs(byClass4(accounts,saldos)))}</td></tr>
            ${gastoAccounts.map(a => {
              const s = Math.abs(Number(saldos[a.id]||0));
              return `<tr><td class="font-mono">${esc(a.code)}</td><td>${esc(a.name)}</td><td></td><td>${fmt(s)}</td></tr>`;
            }).join('')}
            <tr style="background:#FEF2F2"><td class="font-mono">${esc(resultadoAcc.code)}</td><td>${esc(resultadoAcc.name)} (Gastos)</td><td>${fmt(gastoTotal(accounts,saldos))}</td><td></td></tr>
          </tbody>
        </table>
      </div>
      <p class="p-3 rounded-xl font-semibold text-center" style="background:${utilidad>=0?'#F0FFF4':'#FEF2F2'};color:${utilidad>=0?'#15803D':'#B91C1C'}">
        Resultado neto a trasladar: ${fmt(Math.abs(utilidad))} - ${utilidad>=0?'UTILIDAD':'Perdida'}
      </p>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-post-cierre"><i class="fas fa-floppy-disk"></i> Contabilizar Asiento</button>`
  );
  $('#btn-post-cierre')?.addEventListener('click', async () => {
    try {
      const txTypes = await API.getTxTypes();
      const cmType = txTypes.find(t => t.prefix === 'CM' || t.name?.toLowerCase().includes('cierre')) || txTypes[0];
      if (!cmType) return showToast('No hay tipo de transaccion para el asiento de cierre', 'error');
      const lines = [];

      // Ingreso debits
      ingresoAccounts.forEach(a => {
        const s = Math.abs(Number(saldos[a.id]||0));
        lines.push({ account_id: a.id, debit: s, credit: 0, description: 'Cierre de ingresos', line_order: lines.length+1 });
      });
      const totalIngresos = ingresoAccounts.reduce((s,a) => s + Math.abs(Number(saldos[a.id]||0)), 0);
      if (totalIngresos > 0) lines.push({ account_id: resultadoAcc.id, debit: 0, credit: totalIngresos, description: 'Traslado de ingresos al resultado', line_order: lines.length+1 });

      // Gasto credits
      gastoAccounts.forEach(a => {
        const s = Math.abs(Number(saldos[a.id]||0));
        lines.push({ account_id: a.id, debit: 0, credit: s, description: 'Cierre de gastos', line_order: lines.length+1 });
      });
      const totalGastos = gastoAccounts.reduce((s,a) => s + Math.abs(Number(saldos[a.id]||0)), 0);
      if (totalGastos > 0) lines.push({ account_id: resultadoAcc.id, debit: totalGastos, credit: 0, description: 'Traslado de gastos al resultado', line_order: lines.length+1 });

      const tx = await API.createTransaction({
        tx_type_id: cmType.id,
        number: '',
        date: todayStr(),
        description: `Asiento de cierre ${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
        user_id: pb.currentUser?.id,
        status: 'active',
      }, lines);
      closeModal();
      showToast(`Asiento de cierre ${tx.number} contabilizado. Revisalo en Consulta de Transacciones.`, 'success');
    } catch (err) { showToast(err.message, 'error'); }
  });
}

// Helper functions for cierre entries preview
function byClass4(accounts, saldos) {
  return accounts.filter(a => (a.code||'').startsWith('4')).reduce((s,a) => s + Math.abs(Number(saldos[a.id]||0)), 0);
}
function gastoTotal(accounts, saldos) {
  return accounts.filter(a => ['5','6','7'].includes((a.code||'').charAt(0))).reduce((s,a) => s + Math.abs(Number(saldos[a.id]||0)), 0);
}

// Validate period is open before creating transactions
// This function is called from transacciones.js saveTransaction (gating check)
async function isPeriodClosed(dateStr) {
  try {
    const periodosRaw = await API.getSetting(CIERRE_SETTING_KEY);
    if (!periodosRaw) return false;
    const periodos = JSON.parse(periodosRaw);
    const key = (dateStr || '').slice(0, 7); // YYYY-MM
    const found = periodos.find(p => p.key === key);
    return found?.closed === true;
  } catch { return false; }
}
