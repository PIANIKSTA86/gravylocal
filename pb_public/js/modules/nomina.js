/**
 * ContaCO v2.0 — nomina.js
 */
'use strict';

async function renderNomina(c) {
  c.innerHTML = `<div class="p-8 text-center" style="color:#9CA3AF">Cargando nómina...</div>`;
  try {
    const loadErrors = [];
    const periods = await pb.listAll('payroll_periods', { sort: '-date_from' }).catch((err) => {
      loadErrors.push(`periodos: ${err.message}`);
      return [];
    });
    const employees = await pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' }).catch((err) => {
      loadErrors.push(`empleados: ${err.message}`);
      return [];
    });
    const lines = await pb.listAll('payroll_lines', { sort: '-created', expand: 'period_id,employee_id' }).catch((err) => {
      loadErrors.push(`liquidaciones: ${err.message}`);
      return [];
    });
    const noEmployees = employees.length === 0;
    const noPeriods = periods.length === 0;

    // Aggregate per period
    const periodTotals = {};
    lines.forEach(l => {
      const pid = l.period_id;
      if (!periodTotals[pid]) periodTotals[pid] = { devengado: 0, deducciones: 0, neto: 0, parafiscales: 0, count: 0 };
      const dev = (l.salary_base || 0) + (l.transport_allowance || 0) + (l.overtime || 0);
      const ded = (l.deduction_health || 0) + (l.deduction_pension || 0) + (l.deduction_other || 0);
      const para = (l.employer_health || 0) + (l.employer_pension || 0) + (l.employer_arl || 0) + (l.sena || 0) + (l.icbf || 0) + (l.caja_comp || 0);
      periodTotals[pid].devengado += dev;
      periodTotals[pid].deducciones += ded;
      periodTotals[pid].neto += (l.net_pay || 0);
      periodTotals[pid].parafiscales += para;
      periodTotals[pid].count++;
    });

    const statusBadge = s => ({
      draft: '<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>',
      approved: '<span class="badge badge-blue">Aprobada</span>',
      paid: '<span class="badge badge-green">Pagada</span>',
    }[s] || '<span class="badge" style="background:#F3F4F6;color:#374151">Borrador</span>');

    c.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
           <h3 class="text-lg font-bold" style="color:#0D2137">Nómina</h3>
           <p class="text-sm" style="color:#6B7280">Liquidación de períodos, prestaciones y aportes parafiscales.</p>
        </div>
         ${can('canWrite') ? '<div class="flex gap-2"><button class="btn btn-secondary" id="btn-new-period"><i class="fas fa-calendar-plus"></i> Nuevo Período</button><button class="btn btn-primary" id="btn-new-payline"><i class="fas fa-plus"></i> Nueva Liquidación</button></div>' : ''}
      </div>

      ${loadErrors.length ? `
        <div class="mb-4 p-4 rounded-2xl border" style="background:#FEF2F2;border-color:#FECACA">
          <p class="font-semibold" style="color:#B91C1C"><i class="fas fa-triangle-exclamation mr-2"></i>Se detectaron errores de carga</p>
          <p class="text-sm" style="color:#6B7280">${esc(loadErrors.join(' | '))}</p>
        </div>` : ''}

      ${(noEmployees || noPeriods) ? `
        <div class="mb-4 p-4 rounded-2xl border" style="background:#FFF8F0;border-color:#FED7AA">
          <div class="flex flex-wrap items-center gap-3 justify-between">
            <div>
              <p class="font-semibold" style="color:#C46516"><i class="fas fa-triangle-exclamation mr-2"></i>Configuracion inicial requerida</p>
              <p class="text-sm" style="color:#6B7280">
                ${noEmployees ? 'No hay terceros tipo EMPLEADO activos.' : ''}
                ${noEmployees && noPeriods ? ' ' : ''}
                ${noPeriods ? 'No hay Periodos de nomina creados.' : ''}
              </p>
            </div>
            <div class="flex gap-2">
              ${noEmployees ? '<button class="btn btn-outline btn-sm" id="btn-go-empleados"><i class="fas fa-users"></i> Crear Empleado</button>' : ''}
              ${noPeriods && can('canWrite') ? '<button class="btn btn-primary btn-sm" id="btn-fast-period"><i class="fas fa-calendar-plus"></i> Crear Periodo</button>' : ''}
            </div>
          </div>
        </div>` : ''}

      <!-- Períodos -->
      <div class="bg-white rounded-2xl border overflow-hidden mb-4" style="border-color:#F0F0F0">
        <div class="p-4 border-b flex items-center justify-between" style="border-color:#F3F4F6">
           <h4 class="font-bold" style="color:#0D2137">Períodos de Nómina</h4>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead><tr><th>Nombre</th><th>Desde</th><th>Hasta</th><th>Empleados</th><th>Devengado</th><th>Parafiscales</th><th>Neto Pago</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${periods.length ? periods.map(p => {
                const t = periodTotals[p.id] || { devengado:0, deducciones:0, neto:0, parafiscales:0, count:0 };
                return `<tr>
                  <td class="font-semibold">${esc(p.name)}</td>
                  <td>${esc(p.date_from)}</td><td>${esc(p.date_to)}</td>
                  <td class="text-center">${t.count}</td>
                  <td>${fmt(t.devengado)}</td>
                  <td>${fmt(t.parafiscales)}</td>
                  <td class="font-semibold">${fmt(t.neto)}</td>
                  <td>${statusBadge(p.status)}</td>
                  <td>
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-sm" title="Ver liquidaciones" onclick="viewPeriodLines('${esc(p.id)}','${esc(p.name)}')"><i class="fas fa-list-ul"></i></button>
                       ${can('canWrite') && p.status === 'draft' ? `<button class="btn btn-primary btn-sm" title="Aprobar período" onclick="setPeriodStatus('${esc(p.id)}','approved')"><i class="fas fa-check"></i></button>` : ''}
                      ${can('canWrite') && p.status === 'approved' ? `<button class="btn btn-secondary btn-sm" title="Marcar pagada" onclick="setPeriodStatus('${esc(p.id)}','paid')"><i class="fas fa-money-bill-wave"></i></button>` : ''}
                    </div>
                  </td>
                </tr>`;
               }).join('') : '<tr><td colspan="9" class="text-center py-8" style="color:#9CA3AF">Sin períodos de nómina.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Liquidaciones recientes -->
      <div class="bg-white rounded-2xl border overflow-hidden" style="border-color:#F0F0F0">
        <div class="p-4 border-b" style="border-color:#F3F4F6">
          <h4 class="font-bold" style="color:#0D2137">Liquidaciones Recientes</h4>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table">
             <thead><tr><th>Período</th><th>Empleado</th><th>Días</th><th>Devengado</th><th>Salud/Pens.</th><th>Neto</th><th></th></tr></thead>
            <tbody>
              ${lines.length ? lines.slice(0, 30).map(l => `
                <tr>
                  <td>${esc(l.expand?.period_id?.name || '?')}</td>
                  <td>${esc(l.expand?.employee_id?.name || '?')}</td>
                  <td class="text-center">${esc(String(l.days_worked || 30))}</td>
                  <td>${fmt((l.salary_base||0)+(l.transport_allowance||0)+(l.overtime||0))}</td>
                  <td>${fmt((l.deduction_health||0)+(l.deduction_pension||0))}</td>
                  <td class="font-semibold">${fmt(l.net_pay || 0)}</td>
                  <td><button class="btn btn-outline btn-sm" onclick="viewPayrollLineDetail('${esc(l.id)}')"><i class="fas fa-eye"></i></button></td>
                </tr>`).join('') : '<tr><td colspan="7" class="text-center py-8" style="color:#9CA3AF">Sin liquidaciones.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;

    $('#btn-new-period')?.addEventListener('click', () => openPeriodForm());
    $('#btn-new-payline')?.addEventListener('click', () => openPayrollLineForm(periods, employees));
    $('#btn-go-empleados')?.addEventListener('click', () => navigate('terceros'));
    $('#btn-fast-period')?.addEventListener('click', () => openPeriodForm());
  } catch (err) {
    c.innerHTML = `<div class="p-8 text-center" style="color:#EF4444"><i class="fas fa-circle-exclamation mr-2"></i>${esc(err.message)}</div>`;
  }
}

async function setPeriodStatus(id, newStatus) {
  const labels = { approved: 'Aprobar', paid: 'Marcar como Pagada' };
  confirmDialog(`${labels[newStatus] || 'Cambiar estado'}`, `¿Confirmas cambiar el estado del período?`, async () => {
    try {
      await pb.update('payroll_periods', id, { status: newStatus });
      showToast('Estado actualizado', 'success');
      renderNomina($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function viewPeriodLines(periodId, periodName) {
  try {
    const lines = await pb.listAll('payroll_lines', { filter: `period_id="${periodId}"`, expand: 'employee_id', sort: 'created' });
    if (!lines.length) return showToast('Este período no tiene liquidaciones', 'info');
    const totDev = lines.reduce((s,l) => s + (l.salary_base||0)+(l.transport_allowance||0)+(l.overtime||0), 0);
    const totNeto = lines.reduce((s,l) => s + (l.net_pay||0), 0);
    const totPara = lines.reduce((s,l) => s + (l.employer_health||0)+(l.employer_pension||0)+(l.employer_arl||0)+(l.sena||0)+(l.icbf||0)+(l.caja_comp||0), 0);
    const totProv = lines.reduce((s,l) => s + (l.cesantias||0)+(l.intereses_ces||0)+(l.prima||0)+(l.vacaciones||0), 0);
    openModal(
      `Liquidaciones — ${esc(periodName)}`,
      `<div class="space-y-4">
        <div class="grid grid-cols-4 gap-3">
          <div class="rounded-xl p-3 text-center" style="background:#F0F7FF"><div class="text-xs" style="color:#6B7280">Total Devengado</div><div class="font-bold text-sm" style="color:#1A4B8C">${fmt(totDev)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#F0FFF4"><div class="text-xs" style="color:#6B7280">Total Neto</div><div class="font-bold text-sm" style="color:#15803D">${fmt(totNeto)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#FFF8F0"><div class="text-xs" style="color:#6B7280">Parafiscales</div><div class="font-bold text-sm" style="color:#C46516">${fmt(totPara)}</div></div>
          <div class="rounded-xl p-3 text-center" style="background:#FEF2F2"><div class="text-xs" style="color:#6B7280">Provisiones</div><div class="font-bold text-sm" style="color:#B91C1C">${fmt(totProv)}</div></div>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table text-xs">
             <thead><tr><th>Empleado</th><th>Días</th><th>Salario</th><th>Devengado</th><th>Deduc.</th><th>Neto</th><th></th></tr></thead>
            <tbody>
              ${lines.map(l => `<tr>
                <td>${esc(l.expand?.employee_id?.name || '?')}</td>
                <td class="text-center">${l.days_worked||30}</td>
                <td>${fmt(l.salary_base||0)}</td>
                <td>${fmt((l.salary_base||0)+(l.transport_allowance||0)+(l.overtime||0))}</td>
                <td>${fmt((l.deduction_health||0)+(l.deduction_pension||0)+(l.deduction_other||0))}</td>
                <td class="font-semibold">${fmt(l.net_pay||0)}</td>
                <td><button class="btn btn-outline btn-sm" onclick="viewPayrollLineDetail('${esc(l.id)}')"><i class="fas fa-eye"></i></button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );
  } catch (err) { showToast(err.message, 'error'); }
}

async function viewPayrollLineDetail(id) {
  try {
    const l = await pb.get('payroll_lines', id, { expand: 'period_id,employee_id' });
    const dev = (l.salary_base||0) + (l.transport_allowance||0) + (l.overtime||0);
    const ded = (l.deduction_health||0) + (l.deduction_pension||0) + (l.deduction_other||0);
    const para = (l.employer_health||0) + (l.employer_pension||0) + (l.employer_arl||0) + (l.sena||0) + (l.icbf||0) + (l.caja_comp||0);
    const prov = (l.cesantias||0) + (l.intereses_ces||0) + (l.prima||0) + (l.vacaciones||0);

    const row = (label, value, bold = false) =>
      `<div class="flex justify-between py-1 border-b" style="border-color:#F3F4F6">
        <span style="color:#6B7280">${label}</span>
        <span class="${bold ? 'font-bold' : 'font-medium'}">${typeof value === 'number' ? fmt(value) : value}</span>
      </div>`;

    openModal(
      `Detalle Liquidación — ${esc(l.expand?.employee_id?.name || '')}`,
      `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Devengos</p>
           ${row('Salario base (30 días)', l.salary_base||0)}
           ${row('Días trabajados', l.days_worked||30)}
          ${row('Salario proporcional', (l.salary_base||0)/30*(l.days_worked||30))}
          ${row('Horas extra', l.overtime||0)}
          ${row('Aux. transporte', l.transport_allowance||0)}
          ${row('TOTAL DEVENGADO', dev, true)}
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Deducciones Trabajador</p>
          ${row('Salud (4%)', l.deduction_health||0)}
           ${row('Pensión (4%)', l.deduction_pension||0)}
          ${row('Otras deducciones', l.deduction_other||0)}
          ${row('TOTAL DEDUCCIONES', ded, true)}
          <p class="font-bold mt-3 py-2 px-3 rounded-lg text-base" style="background:#F0FFF4;color:#15803D">Neto a pagar: ${fmt(l.net_pay||0)}</p>
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Aportes Empleador</p>
          ${row('Salud (8.5%)', l.employer_health||0)}
           ${row('Pensión (12%)', l.employer_pension||0)}
          ${row('ARL (0.522%)', l.employer_arl||0)}
          ${row('SENA (2%)', l.sena||0)}
          ${row('ICBF (3%)', l.icbf||0)}
           ${row('Caja de Compensación (4%)', l.caja_comp||0)}
          ${row('TOTAL PARAFISCALES', para, true)}
        </div>
        <div>
          <p class="font-semibold mb-2" style="color:#0D2137">Provisiones (Causadas)</p>
           ${row('Cesantías (8.33%)', l.cesantias||0)}
           ${row('Intereses cesantías (1%)', l.intereses_ces||0)}
          ${row('Prima de servicios (8.33%)', l.prima||0)}
          ${row('Vacaciones (4.17%)', l.vacaciones||0)}
          ${row('TOTAL PROVISIONES', prov, true)}
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="closeModal()">Cerrar</button>`,
      true
    );
  } catch (err) { showToast(err.message, 'error'); }
}

function openPeriodForm() {
  openModal(
    'Nuevo Período de Nómina',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group md:col-span-2"><label class="form-label">Nombre del Período</label><input id="pp-name" class="form-input" placeholder="Ej: Nómina Mayo 2026"></div>
      <div class="form-group"><label class="form-label">Fecha Desde</label><input id="pp-from" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group"><label class="form-label">Fecha Hasta</label><input id="pp-to" type="date" class="form-input" value="${todayStr()}"></div>
      <div class="form-group"><label class="form-label">Estado Inicial</label><select id="pp-status" class="form-input"><option value="draft">Borrador</option><option value="approved">Aprobada</option></select></div>
    </div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="btn-save-period">Guardar</button>`
  );
  $('#btn-save-period')?.addEventListener('click', async () => {
    try {
      const payload = { name: getInputVal('pp-name'), date_from: getInputVal('pp-from'), date_to: getInputVal('pp-to'), status: getSelectVal('pp-status') };
      if (!payload.name || !payload.date_from || !payload.date_to) return showToast('Completa los campos obligatorios', 'warning');
      const r = await pb.create('payroll_periods', payload);
      closeModal();
      showToast('Período creado', 'success');
      renderNomina($('#page-content'));
    } catch (err) { showToast(err.message, 'error'); }
  });
}

async function openPayrollLineForm(periods, employees) {
  if (!periods.length) return showToast('Primero crea un período de nómina', 'warning');
  if (!employees.length) return showToast('No hay terceros tipo EMPLEADO activos', 'warning');

  // Only allow draft periods for new liquidations
  const openPeriods = periods.filter(p => p.status === 'draft' || !p.status);
  if (!openPeriods.length) return showToast('No hay períodos en estado Borrador para liquidar', 'warning');

  openModal(
    'Nueva Liquidación de Nómina',
    `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group"><label class="form-label">Período</label><select id="pl-period" class="form-input">${openPeriods.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Empleado</label><select id="pl-emp" class="form-input">${employees.map(e => `<option value="${esc(e.id)}">${esc(e.doc_number)} - ${esc(e.name)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Salario Base (mensual)</label><input id="pl-salary" class="form-input" value="0"></div>
      <div class="form-group"><label class="form-label">Días Trabajados (max 30)</label><input id="pl-days" class="form-input" value="30"></div>
      <div class="form-group"><label class="form-label">Auxilio de Transporte</label><input id="pl-aux" class="form-input" value="200000" title="2026: $200.000"></div>
      <div class="form-group"><label class="form-label">Recargos / Horas Extra</label><input id="pl-ot" class="form-input" value="0"></div>
      <div class="form-group"><label class="form-label">Otras Deducciones</label><input id="pl-ded-other" class="form-input" value="0" placeholder="Embargos, libranzas..."></div>
    </div>
    <div id="nomina-preview" class="mt-4 p-3 rounded-xl text-sm" style="background:#F9FAFB;border:1px solid #E5E7EB;display:none"></div>`,
    `<button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
     <button class="btn btn-secondary btn-sm" id="btn-preview-pl"><i class="fas fa-calculator"></i> Calcular</button>
     <button class="btn btn-primary" id="btn-save-pl">Guardar</button>`
  );

  const calcPreview = () => {
    const salary = parseNum(getInputVal('pl-salary'));
    const days = parseNum(getInputVal('pl-days')) || 30;
    const aux = parseNum(getInputVal('pl-aux'));
    const ot = parseNum(getInputVal('pl-ot'));
    const dedOther = parseNum(getInputVal('pl-ded-other'));
    if (salary <= 0) return;
    const salProp = (salary / 30) * days;
    const baseSal = salProp + ot;
    const devengado = baseSal + aux;
    const dedSalud = baseSal * 0.04;
    const dedPension = baseSal * 0.04;
    const neto = devengado - dedSalud - dedPension - dedOther;
    const para = baseSal * (0.085 + 0.12 + 0.00522 + 0.02 + 0.03 + 0.04);
    const prov = baseSal * (0.0833 + 0.01 * 0.0833 + 0.0833 + 0.0417);
    const preview = $('#nomina-preview');
    if (!preview) return;
    preview.style.display = '';
    preview.innerHTML = `
      <div class="grid grid-cols-3 gap-3 text-center">
        <div><div class="text-xs" style="color:#6B7280">Devengado</div><div class="font-bold" style="color:#1A4B8C">${fmt(devengado)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Deducciones</div><div class="font-bold" style="color:#B91C1C">${fmt(dedSalud+dedPension+dedOther)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Neto a Pagar</div><div class="font-bold" style="color:#15803D">${fmt(neto)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Parafiscales</div><div class="font-medium" style="color:#C46516">${fmt(para)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Provisiones</div><div class="font-medium" style="color:#7C3AED">${fmt(prov)}</div></div>
        <div><div class="text-xs" style="color:#6B7280">Costo Total</div><div class="font-bold" style="color:#0D2137">${fmt(devengado + para + prov)}</div></div>
      </div>`;
  };
  $('#btn-preview-pl')?.addEventListener('click', calcPreview);
  ['pl-salary','pl-days','pl-aux','pl-ot','pl-ded-other'].forEach(id => $('#' + id)?.addEventListener('input', debounce(calcPreview, 300)));
  calcPreview();

  $('#btn-save-pl')?.addEventListener('click', async () => {
    const btn = $('#btn-save-pl');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    }
    try {
      const salary = parseNum(getInputVal('pl-salary'));
      const days = parseNum(getInputVal('pl-days')) || 30;
      const aux = parseNum(getInputVal('pl-aux'));
      const ot = parseNum(getInputVal('pl-ot'));
      const dedOther = parseNum(getInputVal('pl-ded-other'));
      if (salary <= 0) return showToast('El salario base debe ser mayor a cero', 'warning');
      if (days <= 0 || days > 30) return showToast('Días trabajados debe estar entre 1 y 30', 'warning');

      const periodId = getSelectVal('pl-period');
      if (!periodId) return showToast('Selecciona un Periodo', 'warning');
      const period = await pb.get('payroll_periods', periodId);
      if ((period.status || 'draft') !== 'draft') {
        return showToast('El Periodo seleccionado no esta en borrador. No se pueden registrar nuevas liquidaciones.', 'error');
      }

      const salaryProportional = (salary / 30) * days;
      const baseSalarial = salaryProportional + ot;
      const devengado = baseSalarial + aux;
      const deductionHealth = baseSalarial * 0.04;
      const deductionPension = baseSalarial * 0.04;
      const deductionOther = dedOther;
      const employerHealth = baseSalarial * 0.085;
      const employerPension = baseSalarial * 0.12;
      const employerArl = baseSalarial * 0.00522;
      const sena = baseSalarial * 0.02;
      const icbf = baseSalarial * 0.03;
      const cajaComp = baseSalarial * 0.04;
      const cesantias = baseSalarial * 0.0833;
      const interesesCes = cesantias * 0.01;
      const prima = baseSalarial * 0.0833;
      const vacaciones = baseSalarial * 0.0417;
      const netPay = devengado - deductionHealth - deductionPension - deductionOther;

      const payload = {
        period_id: periodId,
        employee_id: getSelectVal('pl-emp'),
        salary_base: salary, days_worked: days, overtime: ot, transport_allowance: aux,
        deduction_health: deductionHealth, deduction_pension: deductionPension, deduction_other: deductionOther,
        net_pay: netPay, employer_health: employerHealth, employer_pension: employerPension, employer_arl: employerArl,
        sena, icbf, caja_comp: cajaComp, cesantias, intereses_ces: interesesCes, prima, vacaciones,
      };
      const r = await pb.create('payroll_lines', payload);
      closeModal();
      showToast('Liquidación registrada', 'success');
      renderNomina($('#page-content'));
    } catch (err) {
      const details = err?.data?.data
        ? Object.values(err.data.data).map(v => v?.message).filter(Boolean).join(' | ')
        : '';
      showToast(details || err.message || 'No se pudo registrar la Liquidacion', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Guardar';
      }
    }
  });
}

