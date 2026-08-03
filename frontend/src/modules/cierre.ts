/**
 * GRAVY v2.0 - cierre.js
 * Asistente de Cierre Contable Mensual
 */
'use strict';

// Periodos de cierre almacenados en settings (clave: "periodos_cierre" como JSON array)
const CIERRE_SETTING_KEY = 'periodos_cierre';

async function renderCierre(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando asistente de cierre...</div>`;
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentKey = `${currentYear}-${String(currentMonth).padStart(2,'0')}`;

    // Load all data in parallel for the current period
    const [accounts, saldos] = await Promise.all([
      API.getAccounts(false),
      API.getAccountSaldos(currentKey),
    ]);
    const periodosRaw = await API.getSetting(CIERRE_SETTING_KEY);
    const periodos = periodosRaw ? JSON.parse(periodosRaw) : [];

    // Compute PUC class saldos for closing summary
    const byClass = {};
    for (const a of accounts) {
      const cls = (a.code || '').charAt(0);
      if (!byClass[cls]) byClass[cls] = 0;
      byClass[cls] += Number(saldos[a.id] || 0);
    }
    const ingresos = -(byClass['4'] || 0);
    const gastos = (byClass['5'] || 0) + (byClass['6'] || 0) + (byClass['7'] || 0);
    const utilidad = ingresos - gastos;

    // Determine current period status
    const closedPeriods = new Set(periodos.filter(p => p.closed).map(p => p.key));
    const isCurrentClosed = closedPeriods.has(currentKey);
    const currentPeriodoRecord = periodos.find(p => p.key === currentKey);
    const isCurrentRegistered = !!currentPeriodoRecord;

    const activeBranchId = localStorage.getItem('active_branch_id') || 'TODAS';
    const isGlobal = activeBranchId === 'TODAS';

    const statusBadge = p =>
      p.closed
        ? '<span class="badge badge-red"><i class="fas fa-lock mr-1"></i>Cerrado</span>'
        : '<span class="badge badge-green"><i class="fas fa-lock-open mr-1"></i>Habilitado</span>';

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 class="text-lg font-bold" style="color:#0D2137">Asistente de Cierre Contable</h3>
          <p class="text-sm" style="color:#6B7280">Gestion de Periodos, asientos de cierre y bloqueo de transacciones.</p>
        </div>
        ${(can('canWrite') && isGlobal) ? `
          <div class="flex gap-2 flex-wrap">
            <button class="btn btn-outline" id="btn-enable-period"><i class="fas fa-calendar-plus"></i> Habilitar Período</button>
            <button class="btn btn-primary" id="btn-new-cierre"><i class="fas fa-calendar-check"></i> Realizar Cierre</button>
          </div>` : ''}
      </div>

      ${!isGlobal ? `
        <div class="mb-5 p-4 rounded-2xl border flex items-start gap-3 shadow-sm anim-slide-up" style="background:#FFF7ED;border-color:#FED7AA;color:#C2410C">
          <i class="fas fa-triangle-exclamation text-lg mt-0.5" style="color:#EA580C"></i>
          <div>
            <p class="font-bold text-sm" style="color:#9A3412">Cierre contable deshabilitado para sucursal individual</p>
            <p class="text-xs mt-1" style="color:#7C2D12;line-height:1.4">El Cierre Contable mensual es una operación consolidada y debe realizarse seleccionando <strong>"TODAS LAS SUCURSALES"</strong> en la cabecera del sistema. Esto garantiza que el balance general e ingresos/gastos de todas las sedes queden cerrados correctamente.</p>
          </div>
        </div>
      ` : ''}

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
      ${!isCurrentRegistered
        ? `<div class="mb-4 p-4 rounded-2xl border flex items-center gap-3" style="background:#FFF8F0;border-color:#FED7AA">
            <i class="fas fa-triangle-exclamation text-xl" style="color:#C46516"></i>
            <div>
              <p class="font-semibold" style="color:#C46516">Período ${currentKey} no está habilitado</p>
              <p class="text-sm" style="color:#6B7280">No se pueden registrar transacciones en este mes hasta que el administrador lo habilite.</p>
            </div>
            ${(can('canWrite') && isGlobal) ? `<button class="btn btn-primary btn-sm ml-auto" id="btn-enable-period-inline"><i class="fas fa-calendar-plus"></i> Habilitar ahora</button>` : ''}
          </div>`
        : isCurrentClosed
        ? `<div class="mb-4 p-4 rounded-2xl border flex items-center gap-3" style="background:#FEF2F2;border-color:#FECACA">
            <i class="fas fa-lock text-xl" style="color:#B91C1C"></i>
            <div>
              <p class="font-semibold" style="color:#B91C1C">Período ${currentKey} CERRADO</p>
              <p class="text-sm" style="color:#6B7280">No se pueden crear ni anular transacciones en este período.</p>
            </div>
            ${(can('canWrite') && isGlobal) ? `<button class="btn btn-outline btn-sm ml-auto" onclick="reOpenPeriod('${currentKey}')"><i class="fas fa-lock-open"></i> Re-abrir</button>` : ''}
          </div>`
        : `<div class="mb-4 p-4 rounded-2xl border flex items-center gap-3" style="background:#F0FFF4;border-color:#BBF7D0">
            <i class="fas fa-lock-open text-xl" style="color:#15803D"></i>
            <div>
              <p class="font-semibold" style="color:#15803D">Período ${currentKey} HABILITADO</p>
              <p class="text-sm" style="color:#6B7280">El período actual acepta nuevas transacciones.</p>
            </div>
          </div>`
      }

      <!-- Historial de Periodos -->
      <div class="bg-white rounded-2xl border overflow-hidden mb-4" style="border-color:#F0F0F0">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:#F3F4F6">
          <h4 class="font-bold" style="color:#0D2137">Períodos Registrados</h4>
          <span class="text-xs" style="color:#9CA3AF">${periodos.length} período(s) — solo estos aceptan transacciones</span>
        </div>
        ${!periodos.length ? `
          <div class="p-8 text-center">
            <i class="fas fa-calendar-xmark text-3xl mb-3" style="color:#D1D5DB"></i>
            <p class="font-semibold" style="color:#374151">No hay períodos habilitados</p>
            <p class="text-sm mt-1 mb-4" style="color:#9CA3AF">Habilita al menos el período actual para comenzar a registrar transacciones.</p>
            ${(can('canWrite') && isGlobal) ? `<button class="btn btn-primary" id="btn-enable-period-empty"><i class="fas fa-calendar-plus"></i> Habilitar Período Actual</button>` : ''}
          </div>` : `
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Período</th><th>Estado</th><th>Habilitado Por</th><th>Fecha Habilitación</th><th>Fecha Cierre</th><th>Utilidad Registrada</th><th>Nota</th><th>Acciones</th></tr></thead>
            <tbody>
              ${[...periodos].reverse().map(p => `
                <tr>
                  <td class="font-mono font-semibold">${esc(p.key)}</td>
                  <td>${statusBadge(p)}</td>
                  <td class="text-sm" style="color:#6B7280">${esc(p.enabledBy || p.closedBy || '—')}</td>
                  <td class="text-sm" style="color:#6B7280">${esc(p.enabledAt || '—')}</td>
                  <td>${esc(p.closedAt || '—')}</td>
                  <td class="font-semibold" style="color:${(p.utilidad||0) >= 0 ? '#15803D' : '#B91C1C'}">${fmt(p.utilidad || 0)}</td>
                  <td class="text-sm" style="color:#6B7280">${esc(p.note || '—')}</td>
                  <td>
                    <div class="flex gap-1">
                      ${p.closed && can('canWrite') && isGlobal ? `<button class="btn btn-outline btn-sm" title="Re-abrir período" onclick="reOpenPeriod('${esc(p.key)}')"><i class="fas fa-lock-open"></i></button>` : ''}
                      ${!p.closed && can('canWrite') && isGlobal ? `<button class="btn btn-danger btn-sm" title="Cerrar período" onclick="closePeriod('${esc(p.key)}')"><i class="fas fa-lock"></i></button>` : ''}
                    </div>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`}
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
        ${can('canWrite') && !isCurrentClosed && isGlobal
          ? `<div class="mt-4"><button class="btn btn-primary" id="btn-gen-cierre-entries"><i class="fas fa-magic"></i> Generar Asiento de Cierre</button></div>`
          : ''
        }
      </div>`;

    $('#btn-new-cierre')?.addEventListener('click', () => openCierreForm(periodos));
    $('#btn-enable-period')?.addEventListener('click', () => openEnablePeriodForm(periodos));
    $('#btn-enable-period-inline')?.addEventListener('click', () => openEnablePeriodForm(periodos));
    $('#btn-enable-period-empty')?.addEventListener('click', () => openEnablePeriodForm(periodos));
    $('#btn-gen-cierre-entries')?.addEventListener('click', () => generateCierreEntries(accounts, saldos, utilidad));
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

function openCierreForm(periodos, targetKey = null) {
  const now = new Date();
  const defaultKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;
  const keyToUse = targetKey || defaultKey;
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
          <input id="cierre-key" class="form-input font-mono" placeholder="Ej: 2026-05" value="${keyToUse}" pattern="\\d{4}-\\d{2}">
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
      <div id="cierre-resultado-container" class="p-3 rounded-xl text-sm border" style="background:#F3F4F6;border-color:#E5E7EB;color:#374151">
        <span><i class="fas fa-spinner fa-spin mr-1"></i>Calculando resultado del periodo...</span>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-danger" id="btn-confirm-cierre"><i class="fas fa-lock"></i> Confirmar Cierre</button>`
  );

  let currentCalculatedUtilidad = 0;
  let isCalculating = false;
  let latestRequestedKey = '';

  async function updatePeriodUtility(key) {
    const container = document.getElementById('cierre-resultado-container');
    if (!container) return;

    if (!key || !/^\d{4}-\d{2}$/.test(key)) {
      container.innerHTML = `<span style="color:#EF4444"><i class="fas fa-circle-exclamation mr-1"></i>Formato de periodo invalido (debe ser YYYY-MM)</span>`;
      container.style.background = '#FEF2F2';
      container.style.borderColor = '#FECACA';
      container.style.color = '#B91C1C';
      return;
    }

    latestRequestedKey = key;
    isCalculating = true;
    container.innerHTML = `<span><i class="fas fa-spinner fa-spin mr-1"></i>Calculando resultado para el periodo ${key}...</span>`;
    container.style.background = '#F3F4F6';
    container.style.borderColor = '#E5E7EB';
    container.style.color = '#374151';

    try {
      const [accounts, saldos] = await Promise.all([
        API.getAccounts(false),
        API.getAccountSaldos(key)
      ]);

      if (latestRequestedKey !== key) return;

      const byClass = {};
      for (const a of accounts) {
        const cls = (a.code || '').charAt(0);
        if (!byClass[cls]) byClass[cls] = 0;
        byClass[cls] += Number(saldos[a.id] || 0);
      }
      const ingresos = -(byClass['4'] || 0);
      const gastos = (byClass['5'] || 0) + (byClass['6'] || 0) + (byClass['7'] || 0);
      const computedUtilidad = ingresos - gastos;

      currentCalculatedUtilidad = computedUtilidad;
      isCalculating = false;

      const isPositive = computedUtilidad >= 0;
      container.innerHTML = `<strong>Resultado del Periodo:</strong> Utilidad / (Perdida) = <strong>${fmt(computedUtilidad)}</strong>`;
      container.style.background = isPositive ? '#F0FFF4' : '#FEF2F2';
      container.style.borderColor = isPositive ? '#BBF7D0' : '#FECACA';
      container.style.color = isPositive ? '#15803D' : '#B91C1C';
    } catch (err) {
      if (latestRequestedKey !== key) return;
      isCalculating = false;
      container.innerHTML = `<span style="color:#EF4444"><i class="fas fa-circle-exclamation mr-1"></i>Error al calcular: ${esc(err.message)}</span>`;
      container.style.background = '#FEF2F2';
      container.style.borderColor = '#FECACA';
      container.style.color = '#B91C1C';
    }
  }

  // Initial calculation
  updatePeriodUtility(keyToUse);

  // Recalculate on key change
  const keyInput = document.getElementById('cierre-key');
  keyInput?.addEventListener('input', () => {
    updatePeriodUtility(keyInput?.value.trim());
  });

  $('#btn-confirm-cierre')?.addEventListener('click', async () => {
    const key = getInputVal('cierre-key').trim();
    const closedAt = getInputVal('cierre-date');
    const note = getInputVal('cierre-note').trim();
    if (!key || !/^\d{4}-\d{2}$/.test(key)) return showToast('El Periodo debe tener formato YYYY-MM', 'warning');
    if (!closedAt) return showToast('Ingresa la fecha de cierre', 'warning');
    if (isCalculating) return showToast('Por favor espera a que se calcule el resultado del periodo', 'warning');
    if (periodos.find(p => p.key === key && p.closed)) return showToast(`El Periodo ${key} ya esta cerrado`, 'warning');

    try {
      const existing = periodos.find(p => p.key === key);
      const record = {
        key, enabled: true, closed: true, closedAt, closedBy: pb.currentUser?.email || 'admin',
        enabledAt: existing?.enabledAt || closedAt,
        enabledBy: existing?.enabledBy || pb.currentUser?.email || 'admin',
        note, utilidad: currentCalculatedUtilidad,
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
  openCierreForm(periodos, key);
}

async function reOpenPeriod(key) {
  confirmDialog('Re-abrir Periodo', `Confirmas re-abrir el Periodo ${key}? Las transacciones volveran a ser posibles.`, async () => {
    try {
      const periodosRaw = await API.getSetting(CIERRE_SETTING_KEY);
      const periodos = periodosRaw ? JSON.parse(periodosRaw) : [];
      const newPeriodos = periodos.map(p => p.key === key ? { ...p, enabled: true, closed: false, closedAt: null } : p);
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

  // Sumas de traslado netas
  const netIngresosVal = byClass4(accounts, saldos);
  const netGastosVal = gastoTotal(accounts, saldos);

  const previewIngresosRows = ingresoAccounts.map(a => {
    const val = Number(saldos[a.id] || 0);
    const deb = val < 0 ? Math.abs(val) : 0;
    const cred = val > 0 ? val : 0;
    return `<tr><td class="font-mono">${esc(a.code)}</td><td>${esc(a.name)}</td><td>${deb ? fmt(deb) : ''}</td><td>${cred ? fmt(cred) : ''}</td></tr>`;
  }).join('');

  const previewGastosRows = gastoAccounts.map(a => {
    const val = Number(saldos[a.id] || 0);
    const deb = val < 0 ? Math.abs(val) : 0;
    const cred = val > 0 ? val : 0;
    return `<tr><td class="font-mono">${esc(a.code)}</td><td>${esc(a.name)}</td><td>${deb ? fmt(deb) : ''}</td><td>${cred ? fmt(cred) : ''}</td></tr>`;
  }).join('');

  openModal(
    'Asiento de Cierre - Vista Previa',
    `<div class="space-y-4 text-sm">
      <p style="color:#6B7280">Se generaran los siguientes comprobantes contables de cierre:</p>
      <div class="overflow-x-auto">
        <table class="data-table text-xs">
          <thead><tr><th>Cuenta</th><th>Descripcion</th><th>Debito</th><th>Credito</th></tr></thead>
          <tbody>
            ${previewIngresosRows}
            <tr style="background:#F0FFF4">
              <td class="font-mono">${esc(resultadoAcc.code)}</td>
              <td>${esc(resultadoAcc.name)} (Ingresos)</td>
              <td>${netIngresosVal < 0 ? fmt(Math.abs(netIngresosVal)) : ''}</td>
              <td>${netIngresosVal > 0 ? fmt(netIngresosVal) : ''}</td>
            </tr>
            ${previewGastosRows}
            <tr style="background:#FEF2F2">
              <td class="font-mono">${esc(resultadoAcc.code)}</td>
              <td>${esc(resultadoAcc.name)} (Gastos)</td>
              <td>${netGastosVal > 0 ? fmt(netGastosVal) : ''}</td>
              <td>${netGastosVal < 0 ? fmt(Math.abs(netGastosVal)) : ''}</td>
            </tr>
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

      // Cerrar ingresos
      ingresoAccounts.forEach(a => {
        const val = Number(saldos[a.id] || 0);
        const deb = val < 0 ? Math.abs(val) : 0;
        const cred = val > 0 ? val : 0;
        lines.push({ account_id: a.id, debit: deb, credit: cred, description: 'Cierre de ingresos', line_order: lines.length+1 });
      });
      // Trasladar clase 4
      if (netIngresosVal !== 0) {
        lines.push({
          account_id: resultadoAcc.id,
          debit: netIngresosVal < 0 ? Math.abs(netIngresosVal) : 0,
          credit: netIngresosVal > 0 ? netIngresosVal : 0,
          description: 'Traslado de ingresos al resultado',
          line_order: lines.length+1
        });
      }

      // Cerrar gastos/costos
      gastoAccounts.forEach(a => {
        const val = Number(saldos[a.id] || 0);
        const deb = val < 0 ? Math.abs(val) : 0;
        const cred = val > 0 ? val : 0;
        lines.push({ account_id: a.id, debit: deb, credit: cred, description: 'Cierre de gastos/costos', line_order: lines.length+1 });
      });
      // Trasladar clase 5/6/7
      if (netGastosVal !== 0) {
        lines.push({
          account_id: resultadoAcc.id,
          debit: netGastosVal > 0 ? netGastosVal : 0,
          credit: netGastosVal < 0 ? Math.abs(netGastosVal) : 0,
          description: 'Traslado de gastos al resultado',
          line_order: lines.length+1
        });
      }

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
  return -accounts.filter(a => (a.code||'').startsWith('4')).reduce((sum, a) => sum + Number(saldos[a.id] || 0), 0);
}
function gastoTotal(accounts, saldos) {
  return accounts.filter(a => ['5','6','7'].includes((a.code||'').charAt(0))).reduce((sum, a) => sum + Number(saldos[a.id] || 0), 0);
}

// ── Habilitar un período para digitación ─────────────────────────────────────
function openEnablePeriodForm(periodos) {
  if (!can('canWrite')) return showToast('No tienes permisos para habilitar períodos', 'error');
  const now = new Date();
  const defaultKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}`;
  openModal(
    '<i class="fas fa-calendar-plus mr-2" style="color:#1A4B8C"></i>Habilitar Período',
    `<div class="space-y-4">
      <div class="p-4 rounded-xl border" style="background:#EFF6FF;border-color:#BFDBFE">
        <p class="text-sm font-semibold" style="color:#1D4ED8"><i class="fas fa-info-circle mr-2"></i>¿Qué significa habilitar un período?</p>
        <p class="text-sm mt-1" style="color:#374151">Solo los períodos habilitados permiten registrar transacciones. Esto evita digitaciones accidentales en fechas pasadas o futuras no autorizadas.</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Período a Habilitar (YYYY-MM)</label>
          <input id="enable-key" class="form-input font-mono" placeholder="Ej: 2026-05" value="${defaultKey}" pattern="\\d{4}-\\d{2}">
        </div>
        <div class="form-group">
          <label class="form-label">Fecha de Habilitación</label>
          <input id="enable-date" type="date" class="form-input" value="${todayStr()}">
        </div>
        <div class="form-group md:col-span-2">
          <label class="form-label">Nota (opcional)</label>
          <textarea id="enable-note" class="form-input" rows="2" placeholder="Ej: Habilitado para digitación del mes de mayo 2026..."></textarea>
        </div>
      </div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-primary" id="btn-confirm-enable"><i class="fas fa-calendar-check"></i> Habilitar Período</button>`
  );
  $('#btn-confirm-enable')?.addEventListener('click', async () => {
    const key = getInputVal('enable-key').trim();
    const enabledAt = getInputVal('enable-date');
    const note = getInputVal('enable-note').trim();
    if (!key || !/^\d{4}-\d{2}$/.test(key)) return showToast('El período debe tener formato YYYY-MM', 'warning');
    if (!enabledAt) return showToast('Ingresa la fecha de habilitación', 'warning');

    const month = Number(key.split('-')[1]);
    if (month < 1 || month > 12) return showToast('Mes inválido en el período', 'warning');

    if (periodos.find(p => p.key === key)) {
      return showToast(`El período ${key} ya está registrado en el sistema`, 'warning');
    }

    try {
      const record = {
        key,
        enabled: true,
        closed: false,
        enabledAt,
        enabledBy: pb.currentUser?.email || 'admin',
        closedAt: null,
        closedBy: null,
        note,
        utilidad: 0,
      };
      const newPeriodos = [...periodos, record].sort((a, b) => a.key.localeCompare(b.key));
      await API.setSetting(CIERRE_SETTING_KEY, JSON.stringify(newPeriodos));
      closeModal();
      showToast(`Período ${key} habilitado correctamente para digitación`, 'success');
      renderCierre($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

// Validate period is open before creating transactions
// This function is called from transacciones.js saveTransaction (gating check)
async function isPeriodClosed(dateStr) {
  try {
    const periodosRaw = await API.getSetting(CIERRE_SETTING_KEY);
    if (!periodosRaw) return true; // Sin períodos configurados → todo bloqueado
    const periodos = JSON.parse(periodosRaw);
    const key = (dateStr || '').slice(0, 7); // YYYY-MM
    const found = periodos.find(p => p.key === key);
    if (!found) return true;             // Período no habilitado → bloqueado
    if (found.closed) return true;       // Período cerrado → bloqueado
    return false;                        // Período habilitado y abierto → permitido
  } catch { return false; }
}

// Devuelve true si el período existe y está habilitado (abierto o cerrado)
async function isPeriodRegistered(dateStr) {
  try {
    const periodosRaw = await API.getSetting(CIERRE_SETTING_KEY);
    if (!periodosRaw) return false;
    const periodos = JSON.parse(periodosRaw);
    const key = (dateStr || '').slice(0, 7);
    return periodos.some(p => p.key === key);
  } catch { return false; }
}

// --- VITE MIGRATION GLOBALS ---
(window as any).openEnablePeriodForm = openEnablePeriodForm;
(window as any).reOpenPeriod = reOpenPeriod;
(window as any).closePeriod = closePeriod;
(window as any).isPeriodRegistered = isPeriodRegistered;
(window as any).CIERRE_SETTING_KEY = CIERRE_SETTING_KEY;
(window as any).generateCierreEntries = generateCierreEntries;
(window as any).isPeriodClosed = isPeriodClosed;
(window as any).openCierreForm = openCierreForm;
(window as any).byClass4 = byClass4;
(window as any).gastoTotal = gastoTotal;
(window as any).renderCierre = renderCierre;
