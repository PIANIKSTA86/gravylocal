/**
 * GRAVY v2.0 — asistencia.ts
 * Módulo de Control de Asistencia, Turnos, Kiosco Biométrico/PIN,
 * Importador de Huelleros y Pre-liquidación de Horas hacia Nómina (CST / Ley 2101).
 */
'use strict';

import * as XLSX from 'xlsx';

declare var pb: any;
declare var esc: (val: any) => string;
declare var can: (perm: string) => boolean;
declare var showToast: (msg: string, type?: string) => void;
declare var confirmDialog: (title: string, msg: string, callback: () => void) => void;
declare var openModal: (title: string, body: string, footer: string, large?: boolean) => void;
declare var closeModal: () => void;

type AttendanceTab = 'timesheet' | 'importador';

let currentTab: AttendanceTab = 'timesheet';
let kioskClockInterval: any = null;

function clearKioskClock() {
  if (kioskClockInterval) {
    clearInterval(kioskClockInterval);
    kioskClockInterval = null;
  }
}

function compressImageFileToDataUrl(file: File, w = 160, h = 120): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.45));
      };
      img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      img.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('Error leyendo archivo de cámara.'));
    reader.readAsDataURL(file);
  });
}

export async function renderNominaAsistenciaPage(c: HTMLElement) {
  clearKioskClock();
  c.innerHTML = `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">Control de Asistencia</h2>
          <p class="text-sm text-slate-500">Pre-liquidación normativa colombiana (CST / Ley 2101) e importador de logs de huelleros.</p>
        </div>
        <div class="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200" id="att-tabs-bar">
          <button class="att-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${currentTab === 'timesheet' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}" data-tab="timesheet">
            <i class="fas fa-table-list mr-1.5"></i>Time-Sheet & Pre-liquidación
          </button>
          <button class="att-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${currentTab === 'importador' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}" data-tab="importador">
            <i class="fas fa-file-import mr-1.5"></i>Importador de Huelleros
          </button>
        </div>
      </div>

      <!-- Content Container -->
      <div id="att-tab-content"></div>
    </div>
  `;

  c.querySelectorAll('.att-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentTab = (btn as HTMLElement).dataset.tab as AttendanceTab;
      renderNominaAsistenciaPage(c);
    });
  });

  const target = c.querySelector('#att-tab-content') as HTMLElement;
  if (currentTab === 'timesheet') await renderTimesheetView(target);
  else if (currentTab === 'importador') await renderImportadorView(target);
}

export async function renderNominaRegistroIngresoPage(c: HTMLElement) {
  clearKioskClock();
  c.innerHTML = `
    <div class="space-y-5">
      <div>
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">Registro de Ingreso</h2>
        <p class="text-sm text-slate-500">Terminal Kiosco con PIN/Cédula y Fichaje Móvil con Geolocalización GPS y Fotografía.</p>
      </div>
      <div id="att-kiosk-container"></div>
    </div>
  `;
  const target = c.querySelector('#att-kiosk-container') as HTMLElement;
  await renderKioscoView(target);
}

export async function renderNominaTurnosPage(c: HTMLElement) {
  clearKioskClock();
  c.innerHTML = `
    <div class="space-y-5">
      <div>
        <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">Turnos y Horarios</h2>
        <p class="text-sm text-slate-500">Configuración de plantillas de turnos, ventanas de descanso, tolerancias y PIN/GPS por colaborador.</p>
      </div>
      <div id="att-turnos-container"></div>
    </div>
  `;
  const target = c.querySelector('#att-turnos-container') as HTMLElement;
  await renderTurnosView(target);
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. TIME-SHEET & PRE-LIQUIDACIÓN
// ═════════════════════════════════════════════════════════════════════════════
async function renderTimesheetView(c: HTMLElement) {
  c.innerHTML = `<div class="p-8 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i>Cargando tablero de asistencia...</div>`;

  try {
    const [periods, employees] = await Promise.all([
      pb.listAll('payroll_periods', { sort: '-date_from' }).catch(() => []),
      pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' }).catch(() => []),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const defaultFrom = periods.length ? periods[0].date_from : today.slice(0, 8) + '01';
    const defaultTo = periods.length ? periods[0].date_to : today;

    c.innerHTML = `
      <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-4">
        <div class="flex flex-wrap items-end gap-3 justify-between">
          <div class="flex flex-wrap items-end gap-3">
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Período de Nómina</label>
              <select id="att-period-sel" class="form-control text-xs min-w-[200px]">
                <option value="">Rango personalizado</option>
                ${periods.map((p: any, idx: number) => `<option value="${esc(p.id)}" data-from="${esc(p.date_from)}" data-to="${esc(p.date_to)}" ${idx === 0 ? 'selected' : ''}>${esc(p.name)} (${esc(p.date_from)} a ${esc(p.date_to)})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Desde</label>
              <input type="date" id="att-date-from" class="form-control text-xs" value="${esc(defaultFrom)}">
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Hasta</label>
              <input type="date" id="att-date-to" class="form-control text-xs" value="${esc(defaultTo)}">
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Empleado</label>
              <select id="att-emp-filter" class="form-control text-xs min-w-[180px]">
                <option value="">Todos los empleados</option>
                ${employees.map((e: any) => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join('')}
              </select>
            </div>
            <button id="att-btn-filter" class="btn btn-outline btn-sm"><i class="fas fa-filter mr-1"></i>Consultar</button>
            <label class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 cursor-pointer ml-1">
              <input type="checkbox" id="att-only-alerts" class="rounded">
              <span>Solo con alertas</span>
            </label>
          </div>

          <div class="flex flex-wrap gap-2">
            <button id="att-btn-export-xlsx" class="btn btn-outline btn-sm" title="Exportar Time-Sheet a Excel">
              <i class="fas fa-file-excel text-emerald-600 mr-1"></i>Excel
            </button>
            <button id="att-btn-recalc" class="btn btn-outline btn-sm" title="Recalcular reglas laborales sobre marcaciones">
              <i class="fas fa-rotate mr-1"></i>Recalcular
            </button>
            <button id="att-btn-approve-all" class="btn btn-outline btn-sm font-semibold text-emerald-700" title="Aprobar todas las jornadas visibles">
              <i class="fas fa-check-double mr-1"></i>Aprobar Visibles
            </button>
            <button id="att-btn-settle" class="btn btn-primary btn-sm font-bold shadow-sm">
              <i class="fas fa-paper-plane mr-1"></i>Aprobar y Trasladar a Nómina
            </button>
          </div>
        </div>
      </div>

      <div id="att-kpis" class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4"></div>

      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="data-table w-full text-left text-xs">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Colaborador</th>
                <th>Entrada</th>
                <th>Almuerzo</th>
                <th>Salida</th>
                <th class="text-right">Trabajado</th>
                <th class="text-right">HED / HEN</th>
                <th class="text-right">Recargos</th>
                <th>Alertas</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="att-summary-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    const periodSel = c.querySelector('#att-period-sel') as HTMLSelectElement;
    const dateFromEl = c.querySelector('#att-date-from') as HTMLInputElement;
    const dateToEl = c.querySelector('#att-date-to') as HTMLInputElement;
    const empSel = c.querySelector('#att-emp-filter') as HTMLSelectElement;
    const onlyAlertsEl = c.querySelector('#att-only-alerts') as HTMLInputElement;
    let lastLoadedRows: any[] = [];

    periodSel.addEventListener('change', () => {
      const opt = periodSel.selectedOptions[0];
      if (opt && opt.dataset.from && opt.dataset.to) {
        dateFromEl.value = opt.dataset.from;
        dateToEl.value = opt.dataset.to;
      }
      loadSummaries();
    });

    const loadSummaries = async () => {
      const from = dateFromEl.value;
      const to = dateToEl.value;
      const empId = empSel.value;
      const onlyAlerts = onlyAlertsEl.checked;
      const tbody = c.querySelector('#att-summary-tbody') as HTMLElement;
      tbody.innerHTML = `<tr><td colspan="11" class="p-6 text-center text-slate-400"><i class="fas fa-spinner fa-spin mr-2"></i>Consultando registros...</td></tr>`;

      let filter = `date >= "${from}" && date <= "${to}"`;
      if (empId) filter += ` && employee_id = "${empId}"`;

      const allRows = await pb.listAll('attendance_daily_summaries', {
        filter,
        sort: '-date,employee_id',
        expand: 'employee_id,shift_id',
      }).catch(() => []);

      const rows = onlyAlerts
        ? allRows.filter((r: any) => Array.isArray(r.alerts) && r.alerts.length > 0)
        : allRows;
      lastLoadedRows = rows;

      // Calcular KPIs
      let totalMins = 0, totalHED = 0, totalHEN = 0, totalRecargos = 0, totalAlerts = 0;
      rows.forEach((r: any) => {
        totalMins += Number(r.effective_worked_minutes || 0);
        totalHED += Number(r.hed_hours || 0) + Number(r.heddf_hours || 0);
        totalHEN += Number(r.hen_hours || 0) + Number(r.hendf_hours || 0);
        totalRecargos += Number(r.rno_hours || 0) + Number(r.rdfd_hours || 0) + Number(r.hrndf_hours || 0);
        if (Array.isArray(r.alerts) && r.alerts.length) totalAlerts++;
      });

      const kpiEl = c.querySelector('#att-kpis') as HTMLElement;
      kpiEl.innerHTML = `
        <div class="bg-white p-3.5 rounded-xl border border-slate-200">
          <div class="text-[11px] font-semibold text-slate-500 uppercase">Jornadas</div>
          <div class="text-xl font-extrabold text-slate-900 mt-0.5">${rows.length}</div>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-slate-200">
          <div class="text-[11px] font-semibold text-slate-500 uppercase">Horas Efectivas</div>
          <div class="text-xl font-extrabold text-indigo-600 mt-0.5">${(totalMins / 60).toFixed(1)} h</div>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-slate-200">
          <div class="text-[11px] font-semibold text-slate-500 uppercase">Extras Diurnas</div>
          <div class="text-xl font-extrabold text-amber-600 mt-0.5">${totalHED.toFixed(2)} h</div>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-slate-200">
          <div class="text-[11px] font-semibold text-slate-500 uppercase">Extras Nocturnas</div>
          <div class="text-xl font-extrabold text-purple-600 mt-0.5">${totalHEN.toFixed(2)} h</div>
        </div>
        <div class="bg-white p-3.5 rounded-xl border border-slate-200">
          <div class="text-[11px] font-semibold text-slate-500 uppercase">Recargos / Alertas</div>
          <div class="text-xl font-extrabold text-slate-800 mt-0.5">${totalRecargos.toFixed(2)} h <span class="text-xs font-bold ${totalAlerts ? 'text-rose-600' : 'text-emerald-600'}">(${totalAlerts} al.)</span></div>
        </div>
      `;

      if (!rows.length) {
        tbody.innerHTML = `<tr><td colspan="11" class="p-8 text-center text-slate-400">No hay marcaciones registradas en este rango de fechas.</td></tr>`;
        return;
      }

      const statusPill = (st: string) => {
        const map: Record<string, string> = {
          DRAFT: 'background:#F1F5F9;color:#475569',
          AUDITED: 'background:#FEF3C7;color:#92400E',
          APPROVED: 'background:#DCFCE7;color:#166534',
          INJECTED_TO_PAYROLL: 'background:#E0E7FF;color:#3730A3',
        };
        const labels: Record<string, string> = {
          DRAFT: 'Borrador',
          AUDITED: 'Auditado',
          APPROVED: 'Aprobado',
          INJECTED_TO_PAYROLL: 'En Nómina',
        };
        return `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold" style="${map[st] || map.DRAFT}">${labels[st] || st}</span>`;
      };

      const alertLabels: Record<string, string> = {
        SIN_SALIDA: 'Sin salida',
        ALMUERZO_AUTOAPLICADO: 'Almuerzo auto.',
        TARDANZA: 'Tardanza',
        SALIDA_ANTICIPADA: 'Salida ant.',
        EXCESO_EXTRAS_DIARIAS: '>2h extras',
      };

      tbody.innerHTML = rows.map((r: any) => {
        const empName = r.expand?.employee_id?.name || 'Empleado';
        const fmtT = (iso: string) => (iso ? iso.slice(11, 16) : '—');
        const lunchStr = r.break_out || r.break_in
          ? `${fmtT(r.break_out)} - ${fmtT(r.break_in)}`
          : (r.break_deducted_minutes ? `-${r.break_deducted_minutes}m (auto)` : '—');
        const workedH = ((r.effective_worked_minutes || 0) / 60).toFixed(2) + 'h';
        const exD = Number(r.hed_hours || 0) + Number(r.heddf_hours || 0);
        const exN = Number(r.hen_hours || 0) + Number(r.hendf_hours || 0);
        const rec = Number(r.rno_hours || 0) + Number(r.rdfd_hours || 0) + Number(r.hrndf_hours || 0);
        const alertsHtml = (Array.isArray(r.alerts) ? r.alerts : []).map((a: string) =>
          `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 mr-1 mb-0.5">${esc(alertLabels[a] || a)}</span>`
        ).join('') || '<span class="text-emerald-600 text-[10px] font-semibold"><i class="fas fa-check mr-0.5"></i>OK</span>';

        return `
          <tr class="hover:bg-slate-50">
            <td class="font-mono font-semibold text-slate-700">${esc(r.date)}</td>
            <td class="font-semibold text-slate-900">${esc(empName)}</td>
            <td class="font-mono">${fmtT(r.first_in)}</td>
            <td class="font-mono text-slate-500">${esc(lunchStr)}</td>
            <td class="font-mono">${fmtT(r.last_out)}</td>
            <td class="text-right font-mono font-bold text-slate-800">${workedH}</td>
            <td class="text-right font-mono">${exD > 0 || exN > 0 ? `<span class="text-amber-700 font-bold">${exD.toFixed(1)}</span> / <span class="text-purple-700 font-bold">${exN.toFixed(1)}</span>` : '—'}</td>
            <td class="text-right font-mono">${rec > 0 ? `<span class="text-indigo-700 font-bold">${rec.toFixed(2)}h</span>` : '—'}</td>
            <td>${alertsHtml}</td>
            <td>${statusPill(r.status)}</td>
            <td class="text-right whitespace-nowrap">
              <button class="btn btn-outline btn-xs att-btn-inspect mr-1" data-id="${esc(r.id)}" title="Ver Evidencias (Fotos/GPS) y Editar Tiempos">
                <i class="fas fa-eye text-indigo-600"></i>
              </button>
              ${r.status !== 'INJECTED_TO_PAYROLL' && r.status !== 'APPROVED' ? `
                <button class="btn btn-outline btn-xs att-btn-approve" data-id="${esc(r.id)}" title="Aprobar jornada"><i class="fas fa-check text-emerald-600"></i></button>
              ` : ''}
              ${r.status === 'APPROVED' ? `
                <button class="btn btn-outline btn-xs att-btn-reopen" data-id="${esc(r.id)}" title="Reabrir a Borrador"><i class="fas fa-rotate-left text-amber-600"></i></button>
              ` : ''}
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('.att-btn-approve').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = (btn as HTMLElement).dataset.id!;
          await pb.update('attendance_daily_summaries', id, { status: 'APPROVED' });
          showToast('Jornada aprobada.', 'success');
          loadSummaries();
        });
      });

      tbody.querySelectorAll('.att-btn-reopen').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = (btn as HTMLElement).dataset.id!;
          await pb.update('attendance_daily_summaries', id, { status: 'DRAFT' });
          showToast('Jornada devuelta a Borrador.', 'info');
          loadSummaries();
        });
      });

      tbody.querySelectorAll('.att-btn-inspect').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = (btn as HTMLElement).dataset.id!;
          const row = rows.find((x: any) => x.id === id);
          if (row) await openSupervisorInspectModal(row, loadSummaries);
        });
      });
    };

    onlyAlertsEl.addEventListener('change', loadSummaries);
    c.querySelector('#att-btn-filter')?.addEventListener('click', loadSummaries);

    c.querySelector('#att-btn-approve-all')?.addEventListener('click', async () => {
      const pending = lastLoadedRows.filter((r: any) => r.status !== 'APPROVED' && r.status !== 'INJECTED_TO_PAYROLL');
      if (!pending.length) return showToast('No hay jornadas pendientes por aprobar en la vista actual.', 'info');
      confirmDialog('Aprobar Jornadas Visibles', `¿Aprobar las ${pending.length} jornadas visibles pendientes?`, async () => {
        for (const r of pending) {
          await pb.update('attendance_daily_summaries', r.id, { status: 'APPROVED' });
        }
        showToast(`${pending.length} jornadas aprobadas.`, 'success');
        loadSummaries();
      });
    });

    c.querySelector('#att-btn-export-xlsx')?.addEventListener('click', () => {
      if (!lastLoadedRows.length) return showToast('No hay datos para exportar.', 'warning');
      const data = lastLoadedRows.map((r: any) => ({
        Fecha: r.date,
        Empleado: r.expand?.employee_id?.name || '',
        Documento: r.expand?.employee_id?.doc_number || '',
        Entrada: r.first_in ? r.first_in.slice(11, 16) : '',
        Inicio_Descanso: r.break_out ? r.break_out.slice(11, 16) : '',
        Fin_Descanso: r.break_in ? r.break_in.slice(11, 16) : '',
        Salida: r.last_out ? r.last_out.slice(11, 16) : '',
        Horas_Efectivas: Number(((r.effective_worked_minutes || 0) / 60).toFixed(2)),
        Descanso_Min: r.break_deducted_minutes || 0,
        Retardo_Min: r.late_entry_minutes || 0,
        HED: r.hed_hours || 0,
        HEN: r.hen_hours || 0,
        RNO: r.rno_hours || 0,
        HEDDF: r.heddf_hours || 0,
        HENDF: r.hendf_hours || 0,
        RDFD: r.rdfd_hours || 0,
        HRNDF: r.hrndf_hours || 0,
        Alertas: Array.isArray(r.alerts) ? r.alerts.join(', ') : '',
        Estado: r.status,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
      XLSX.writeFile(wb, `Asistencia_${dateFromEl.value}_a_${dateToEl.value}.xlsx`);
    });

    c.querySelector('#att-btn-recalc')?.addEventListener('click', async () => {
      try {
        const res = await pb.send('/api/attendance/recalculate', {
          method: 'POST',
          body: { date_from: dateFromEl.value, date_to: dateToEl.value, employee_id: empSel.value },
        });
        showToast(`Recalculados ${res.recalculated_days || 0} días.`, 'success');
        loadSummaries();
      } catch (err: any) {
        showToast(err.message || 'Error al recalcular', 'error');
      }
    });

    c.querySelector('#att-btn-settle')?.addEventListener('click', async () => {
      const pid = periodSel.value;
      if (!pid) {
        return showToast('Selecciona un Período de Nómina destino para inyectar las novedades.', 'warning');
      }
      confirmDialog(
        'Trasladar Asistencia a Nómina',
        `Se consolidarán las horas extras y recargos del ${dateFromEl.value} al ${dateToEl.value} y se inyectarán como novedades en el período seleccionado. ¿Continuar?`,
        async () => {
          try {
            const res = await pb.send('/api/attendance/settle-period', {
              method: 'POST',
              body: { period_id: pid, date_from: dateFromEl.value, date_to: dateToEl.value, include_draft: true },
            });
            showToast(`¡Éxito! ${res.injected_novelties || 0} novedades inyectadas para ${res.employees_processed || 0} empleados.`, 'success');
            loadSummaries();
          } catch (err: any) {
            showToast(err.message || 'Error al trasladar a nómina', 'error');
          }
        }
      );
    });

    await loadSummaries();
  } catch (err: any) {
    c.innerHTML = `<div class="p-6 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">Error: ${esc(err.message)}</div>`;
  }
}

async function openSupervisorInspectModal(summary: any, onSaved: () => void) {
  const empName = summary.expand?.employee_id?.name || 'Colaborador';
  const empId = summary.employee_id;
  const dateStr = summary.date;

  // Traer todos los logs (incluidos los SUPERSEDED o con fotos) del día y mañana siguiente
  const nextDate = new Date(Date.parse(dateStr + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10);
  const logs = await pb.listAll('attendance_logs', {
    filter: `employee_id = "${empId}" && timestamp >= "${dateStr}T00:00:00" && timestamp <= "${nextDate}T10:00:00"`,
    sort: 'timestamp',
  }).catch(() => []);

  const fmtTimeVal = (iso: string) => (iso && iso.length >= 16 ? iso.slice(11, 16) : '');
  const isLocked = summary.status === 'INJECTED_TO_PAYROLL';

  const punchBadge = (pt: string) => {
    const map: Record<string, string> = {
      IN: 'bg-emerald-100 text-emerald-800',
      BREAK_OUT: 'bg-amber-100 text-amber-800',
      BREAK_IN: 'bg-sky-100 text-sky-800',
      OUT: 'bg-indigo-100 text-indigo-800',
    };
    return `<span class="px-2 py-0.5 rounded text-[10px] font-bold ${map[pt] || 'bg-slate-100 text-slate-700'}">${esc(pt)}</span>`;
  };

  const body = `
    <div class="space-y-5 text-xs">
      <!-- Evidencia y Logs -->
      <div>
        <h4 class="font-bold text-slate-900 mb-2 flex items-center gap-2">
          <i class="fas fa-camera text-indigo-600"></i>Evidencia Biométrica, Dispositivo y Ubicación GPS (${logs.length} marcas)
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
          ${logs.map((l: any) => `
            <div class="p-3 rounded-xl border ${l.status === 'SUPERSEDED' ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white'} flex gap-3 items-start">
              ${l.photo_data ? `
                <a href="${esc(l.photo_data)}" target="_blank" title="Clic para ampliar foto">
                  <img src="${esc(l.photo_data)}" class="w-20 h-16 object-cover rounded-lg border border-slate-300 shrink-0" alt="Evidencia">
                </a>
              ` : `
                <div class="w-20 h-16 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                  <i class="fas fa-user-slash text-lg"></i>
                </div>
              `}
              <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center justify-between gap-1">
                  ${punchBadge(l.punch_type)}
                  <span class="font-mono font-bold text-slate-800">${esc(l.timestamp.slice(0, 16).replace('T', ' '))}</span>
                </div>
                <div class="text-[11px] text-slate-600 truncate">
                  <i class="fas fa-microchip mr-1 text-slate-400"></i>${esc(l.source)} • ${esc(l.device_name || '—')}
                </div>
                ${l.geo_lat && l.geo_lng ? `
                  <div class="space-y-0.5">
                    <div class="text-[11px] font-medium text-slate-700" id="geo-addr-${esc(l.id)}">
                      <i class="fas fa-map-pin mr-1 text-rose-500"></i>${l.geo_address ? esc(l.geo_address) : '<span class="text-slate-400 italic">Traduciendo dirección...</span>'}
                    </div>
                    <a href="https://maps.google.com/?q=${l.geo_lat},${l.geo_lng}" target="_blank" class="text-[10px] font-semibold text-emerald-700 hover:underline">
                      <i class="fas fa-location-dot mr-1"></i>Ver en Mapa (${Number(l.geo_lat).toFixed(4)}, ${Number(l.geo_lng).toFixed(4)})
                    </a>
                  </div>
                ` : ''}
                ${l.audit_notes ? `<div class="text-[10px] text-amber-700 italic">${esc(l.audit_notes)}</div>` : ''}
                ${l.status === 'SUPERSEDED' ? `<div class="text-[10px] text-slate-400 uppercase font-bold">Reemplazada por ajuste</div>` : ''}
              </div>
            </div>
          `).join('') || '<div class="col-span-2 p-4 text-center text-slate-400 border rounded-xl">No hay logs individuales registrados.</div>'}
        </div>
      </div>

      <!-- Editor de Tiempos -->
      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <h4 class="font-bold text-slate-900 mb-3 flex items-center justify-between">
          <span><i class="fas fa-pen-to-square text-amber-600 mr-1.5"></i>Edición / Corrección de Tiempos (Supervisor)</span>
          ${isLocked ? '<span class="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">Ya trasladado a Nómina (Solo lectura)</span>' : ''}
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label class="block font-bold text-slate-600 mb-1">Entrada</label>
            <input type="time" id="sup-in" class="form-control" value="${esc(fmtTimeVal(summary.first_in))}" ${isLocked ? 'disabled' : ''}>
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">Inicio Almuerzo</label>
            <input type="time" id="sup-bout" class="form-control" value="${esc(fmtTimeVal(summary.break_out))}" ${isLocked ? 'disabled' : ''}>
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">Fin Almuerzo</label>
            <input type="time" id="sup-bin" class="form-control" value="${esc(fmtTimeVal(summary.break_in))}" ${isLocked ? 'disabled' : ''}>
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">Salida Final</label>
            <input type="time" id="sup-out" class="form-control" value="${esc(fmtTimeVal(summary.last_out))}" ${isLocked ? 'disabled' : ''}>
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-600 mb-1">Justificación / Nota de Auditoría *</label>
          <input type="text" id="sup-note" class="form-control" placeholder="Ej: Olvidó marcar salida, validado por cámara de recepción." ${isLocked ? 'disabled' : ''}>
        </div>
      </div>
    </div>
  `;

  const footer = `
    <button class="btn btn-outline btn-sm" onclick="closeModal()">Cerrar</button>
    ${!isLocked ? `<button id="sup-save-btn" class="btn btn-primary btn-sm font-bold"><i class="fas fa-save mr-1"></i>Guardar Corrección y Recalcular</button>` : ''}
  `;

  openModal(`Auditoría de Jornada — ${esc(empName)} (${esc(dateStr)})`, body, footer, true);

  // Geocodificación inversa (Coordenadas -> Dirección real) en segundo plano con caché en DB
  (async () => {
    for (const l of logs) {
      if (l.geo_lat && l.geo_lng && !l.geo_address) {
        const el = document.getElementById(`geo-addr-${l.id}`);
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(l.geo_lat)}&lon=${encodeURIComponent(l.geo_lng)}&accept-language=es`
          );
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          const geo = await resp.json();
          const a = geo.address || {};
          const parts = [
            [a.road, a.house_number].filter(Boolean).join(' '),
            a.neighbourhood || a.suburb || a.quarter,
            a.city || a.town || a.village || a.county,
          ].filter(Boolean);
          const resolved = parts.length ? parts.join(', ') : (geo.display_name || '');
          if (resolved) {
            if (el) el.innerHTML = `<i class="fas fa-map-pin mr-1 text-rose-500"></i>${esc(resolved)}`;
            pb.update('attendance_logs', l.id, { geo_address: resolved }).catch(() => {});
          } else if (el) {
            el.innerHTML = `<i class="fas fa-map-pin mr-1 text-slate-400"></i><span class="text-slate-400">Dirección no disponible</span>`;
          }
        } catch {
          if (el) el.innerHTML = `<i class="fas fa-map-pin mr-1 text-slate-400"></i><span class="text-slate-400">Sin conexión para geocodificar</span>`;
        }
      }
    }
  })();

  document.getElementById('sup-save-btn')?.addEventListener('click', async () => {
    const first_in = (document.getElementById('sup-in') as HTMLInputElement).value;
    const break_out = (document.getElementById('sup-bout') as HTMLInputElement).value;
    const break_in = (document.getElementById('sup-bin') as HTMLInputElement).value;
    const last_out = (document.getElementById('sup-out') as HTMLInputElement).value;
    const audit_notes = (document.getElementById('sup-note') as HTMLInputElement).value.trim();

    if (!audit_notes) {
      return showToast('Ingresa una justificación de auditoría para el cambio.', 'warning');
    }

    try {
      await pb.send('/api/attendance/manual-adjust', {
        method: 'POST',
        body: { employee_id: empId, date: dateStr, first_in, break_out, break_in, last_out, audit_notes },
      });
      closeModal();
      showToast('Horario actualizado y recalculado según normativa.', 'success');
      onSaved();
    } catch (err: any) {
      showToast(err.message || 'Error guardando ajuste.', 'error');
    }
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. MODO KIOSCO & FICHAJE MÓVIL
// ═════════════════════════════════════════════════════════════════════════════
async function renderKioscoView(c: HTMLElement) {
  const employees = await pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' }).catch(() => []);

  c.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Panel Kiosco Fijo -->
      <div class="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <i class="fas fa-shield-halved mr-1"></i>Terminal Kiosco Institucional
            </span>
            <div id="kiosk-clock" class="text-4xl font-black font-mono tracking-tight mt-2">--:--:--</div>
            <div id="kiosk-date" class="text-xs text-slate-400 capitalize">--</div>
          </div>
          <div class="text-right">
            <label class="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" id="kiosk-cam-toggle" class="rounded">
              <span>Foto WebCam / Cámara</span>
            </label>
            <video id="kiosk-video" autoplay playsinline muted class="hidden w-28 h-20 object-cover rounded-xl border border-slate-700 mt-2 ml-auto"></video>
            <img id="kiosk-photo-preview" class="hidden w-28 h-20 object-cover rounded-xl border border-slate-700 mt-2 ml-auto" alt="Foto Kiosco">
            <input type="file" id="kiosk-photo-fallback" accept="image/*" capture="user" class="hidden">
            <canvas id="kiosk-canvas" class="hidden" width="160" height="120"></canvas>
          </div>
        </div>

        <div id="kiosk-feedback" class="hidden mb-4 p-4 rounded-2xl border"></div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Número de Documento (Cédula)</label>
              <input type="text" id="kiosk-doc" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono text-white focus:outline-none focus:border-indigo-500" placeholder="Ej: 1098765432">
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">PIN de Seguridad (4 dígitos)</label>
              <input type="password" id="kiosk-pin" maxlength="6" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-white focus:outline-none focus:border-indigo-500" placeholder="••••">
              <p class="text-[10px] text-slate-500 mt-1">Por defecto: últimos 4 dígitos de su cédula si no se ha asignado PIN.</p>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">Evento</label>
              <select id="kiosk-type" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white">
                <option value="AUTO">Automático (Detecta Entrada / Descanso / Salida)</option>
                <option value="IN">Entrada a Laborar</option>
                <option value="BREAK_OUT">Inicio de Almuerzo / Descanso</option>
                <option value="BREAK_IN">Regreso de Almuerzo / Descanso</option>
                <option value="OUT">Salida Final</option>
              </select>
            </div>
            <button id="kiosk-submit" class="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all">
              <i class="fas fa-fingerprint mr-2"></i>Registrar Marcación
            </button>
          </div>

          <!-- NumPad Táctil -->
          <div class="grid grid-cols-3 gap-2.5">
            ${['1','2','3','4','5','6','7','8','9','Borrar','0','OK'].map((k) => `
              <button type="button" class="kiosk-key py-4 rounded-xl font-bold text-lg transition-all ${k === 'OK' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : k === 'Borrar' ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs' : 'bg-slate-800 hover:bg-slate-700 text-white'}" data-key="${k}">${k}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Panel Fichaje Móvil GPS -->
      <div class="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <i class="fas fa-location-dot mr-1"></i>Fichaje Móvil / Trabajo en Campo
          </span>
          <h3 class="text-lg font-extrabold text-slate-900 mt-3">Registro con Geolocalización GPS</h3>
          <p class="text-xs text-slate-500 mt-1 mb-4">Ideal para vendedores externos, técnicos o personal autorizado fuera de sede.</p>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Colaborador</label>
              <select id="mob-emp" class="form-control text-xs">
                ${employees.map((e: any) => `<option value="${esc(e.id)}">${esc(e.name)} (${esc(e.doc_number || '')})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Tipo de Marcación</label>
              <select id="mob-type" class="form-control text-xs">
                <option value="AUTO">Automático</option>
                <option value="IN">Entrada</option>
                <option value="BREAK_OUT">Inicio Descanso</option>
                <option value="BREAK_IN">Fin Descanso</option>
                <option value="OUT">Salida</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Foto de Evidencia (Selfie / Cámara)</label>
              <div class="flex items-center gap-3">
                <button type="button" id="mob-photo-btn" class="btn btn-outline btn-xs">
                  <i class="fas fa-camera mr-1.5"></i>Tomar Foto
                </button>
                <button type="button" id="mob-photo-clear" class="hidden btn btn-outline btn-xs text-rose-600">
                  <i class="fas fa-xmark"></i>
                </button>
                <img id="mob-photo-preview" class="hidden w-14 h-11 object-cover rounded-lg border border-slate-200" alt="Vista previa">
                <input type="file" id="mob-photo-input" accept="image/*" capture="user" class="hidden">
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <button id="mob-submit" class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-sm">
            <i class="fas fa-satellite-dish mr-2"></i>Marcar con Ubicación GPS
          </button>
          <p id="mob-status" class="text-[11px] text-slate-400 text-center mt-2"></p>
        </div>
      </div>
    </div>
  `;

  // Reloj en vivo
  const updateClock = () => {
    const now = new Date();
    const clk = c.querySelector('#kiosk-clock');
    const dt = c.querySelector('#kiosk-date');
    if (clk) clk.textContent = now.toLocaleTimeString('es-CO', { hour12: false });
    if (dt) dt.textContent = now.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  updateClock();
  kioskClockInterval = setInterval(updateClock, 1000);

  // Manejo de foco para NumPad
  const docInput = c.querySelector('#kiosk-doc') as HTMLInputElement;
  const pinInput = c.querySelector('#kiosk-pin') as HTMLInputElement;
  let activeInput: HTMLInputElement = docInput;
  docInput.addEventListener('focus', () => { activeInput = docInput; });
  pinInput.addEventListener('focus', () => { activeInput = pinInput; });

  // WebCam opcional + fallback móvil/HTTP
  const camToggle = c.querySelector('#kiosk-cam-toggle') as HTMLInputElement;
  const videoEl = c.querySelector('#kiosk-video') as HTMLVideoElement;
  const canvasEl = c.querySelector('#kiosk-canvas') as HTMLCanvasElement;
  const kioskPreview = c.querySelector('#kiosk-photo-preview') as HTMLImageElement;
  const kioskFallback = c.querySelector('#kiosk-photo-fallback') as HTMLInputElement;
  let mediaStream: MediaStream | null = null;
  let kioskFallbackPhoto = '';

  kioskFallback.addEventListener('change', async () => {
    const file = kioskFallback.files?.[0];
    if (!file) {
      camToggle.checked = false;
      return;
    }
    kioskFallbackPhoto = await compressImageFileToDataUrl(file, 160, 120);
    if (kioskFallbackPhoto) {
      kioskPreview.src = kioskFallbackPhoto;
      kioskPreview.classList.remove('hidden');
    }
  });

  camToggle.addEventListener('change', async () => {
    if (camToggle.checked) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } });
          videoEl.srcObject = mediaStream;
          videoEl.classList.remove('hidden');
          return;
        } catch {
          // Si falla getUserMedia (ej. permisos o HTTP), usar cámara nativa vía input file
        }
      }
      kioskFallback.click();
    } else {
      mediaStream?.getTracks().forEach((t) => t.stop());
      mediaStream = null;
      kioskFallbackPhoto = '';
      videoEl.classList.add('hidden');
      kioskPreview.classList.add('hidden');
    }
  });

  const submitKiosk = async () => {
    const doc = docInput.value.trim();
    const pin = pinInput.value.trim();
    const punchType = (c.querySelector('#kiosk-type') as HTMLSelectElement).value;
    if (!doc || !pin) return showToast('Ingresa Cédula y PIN.', 'warning');

    let photoData = kioskFallbackPhoto;
    if (camToggle.checked && mediaStream) {
      const ctx = canvasEl.getContext('2d');
      ctx?.drawImage(videoEl, 0, 0, 160, 120);
      photoData = canvasEl.toDataURL('image/jpeg', 0.45);
    }

    const fb = c.querySelector('#kiosk-feedback') as HTMLElement;
    try {
      const res = await pb.send('/api/attendance/punch', {
        method: 'POST',
        body: { doc_number: doc, kiosk_pin: pin, punch_type: punchType, source: 'KIOSK', photo_data: photoData },
      });

      fb.classList.remove('hidden', 'bg-rose-900/50', 'border-rose-500', 'bg-emerald-900/50', 'border-emerald-500', 'bg-amber-900/50', 'border-amber-500');
      if (res.duplicate) {
        fb.classList.add('bg-amber-900/50', 'border-amber-500');
        fb.innerHTML = `<div class="font-bold text-amber-300"><i class="fas fa-clock mr-2"></i>${esc(res.employee_name)}</div><div class="text-xs text-amber-100 mt-1">${esc(res.message)}</div>`;
      } else {
        fb.classList.add('bg-emerald-900/50', 'border-emerald-500');
        fb.innerHTML = `
          <div class="font-bold text-emerald-300 text-base"><i class="fas fa-circle-check mr-2"></i>¡Hola, ${esc(res.employee_name)}!</div>
          <div class="text-xs text-emerald-100 mt-1">${esc(res.punch_label)} a las <span class="font-mono font-bold">${esc(res.timestamp.slice(11, 16))}</span>${res.late_entry_minutes > 0 ? ` • Retardo: ${res.late_entry_minutes} min` : ' • A tiempo'}</div>
        `;
        docInput.value = '';
        pinInput.value = '';
        activeInput = docInput;
      }
      setTimeout(() => fb.classList.add('hidden'), 4500);
    } catch (err: any) {
      fb.classList.remove('hidden', 'bg-emerald-900/50', 'border-emerald-500');
      fb.classList.add('bg-rose-900/50', 'border-rose-500');
      fb.innerHTML = `<div class="font-bold text-rose-300"><i class="fas fa-triangle-exclamation mr-2"></i>Error de Validación</div><div class="text-xs text-rose-100 mt-1">${esc(err.message)}</div>`;
    }
  };

  c.querySelector('#kiosk-submit')?.addEventListener('click', submitKiosk);

  c.querySelectorAll('.kiosk-key').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = (btn as HTMLElement).dataset.key!;
      if (k === 'OK') submitKiosk();
      else if (k === 'Borrar') activeInput.value = activeInput.value.slice(0, -1);
      else activeInput.value += k;
    });
  });

  // Móvil GPS + Foto
  let mobilePhotoData = '';
  const mobPhotoBtn = c.querySelector('#mob-photo-btn') as HTMLButtonElement;
  const mobPhotoClear = c.querySelector('#mob-photo-clear') as HTMLButtonElement;
  const mobPhotoInput = c.querySelector('#mob-photo-input') as HTMLInputElement;
  const mobPhotoPreview = c.querySelector('#mob-photo-preview') as HTMLImageElement;

  mobPhotoBtn?.addEventListener('click', () => mobPhotoInput.click());
  mobPhotoClear?.addEventListener('click', () => {
    mobilePhotoData = '';
    mobPhotoInput.value = '';
    mobPhotoPreview.classList.add('hidden');
    mobPhotoClear.classList.add('hidden');
  });
  mobPhotoInput?.addEventListener('change', async () => {
    const file = mobPhotoInput.files?.[0];
    if (!file) return;
    try {
      mobilePhotoData = await compressImageFileToDataUrl(file, 160, 120);
      if (mobilePhotoData) {
        mobPhotoPreview.src = mobilePhotoData;
        mobPhotoPreview.classList.remove('hidden');
        mobPhotoClear.classList.remove('hidden');
      }
    } catch {
      showToast('No se pudo procesar la fotografía.', 'warning');
    }
  });

  c.querySelector('#mob-submit')?.addEventListener('click', () => {
    const empId = (c.querySelector('#mob-emp') as HTMLSelectElement).value;
    const punchType = (c.querySelector('#mob-type') as HTMLSelectElement).value;
    const stEl = c.querySelector('#mob-status') as HTMLElement;
    if (!empId) return showToast('Selecciona un colaborador.', 'warning');

    const sendMobilePunch = async (lat: number | null, lng: number | null) => {
      try {
        const res = await pb.send('/api/attendance/punch', {
          method: 'POST',
          body: {
            employee_id: empId,
            punch_type: punchType,
            source: 'MOBILE_APP',
            geo_lat: lat,
            geo_lng: lng,
            photo_data: mobilePhotoData,
          },
        });
        stEl.textContent = res.duplicate ? res.message : `${res.punch_label} (${res.timestamp.slice(11, 16)})`;
        showToast(res.duplicate ? res.message : `${res.employee_name}: ${res.punch_label}`, res.duplicate ? 'warning' : 'success');
        if (!res.duplicate && mobilePhotoData) {
          mobPhotoClear.click();
        }
      } catch (err: any) {
        stEl.textContent = err.message;
        showToast(err.message, 'error');
      }
    };

    if (!navigator.geolocation) {
      return sendMobilePunch(null, null);
    }

    stEl.textContent = 'Obteniendo coordenadas GPS...';
    navigator.geolocation.getCurrentPosition(
      (pos) => sendMobilePunch(pos.coords.latitude, pos.coords.longitude),
      (geoErr) => {
        stEl.textContent = 'GPS no disponible (' + geoErr.message + '), enviando marcación...';
        sendMobilePunch(null, null);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. TURNOS Y ASIGNACIÓN A EMPLEADOS
// ═════════════════════════════════════════════════════════════════════════════
async function renderTurnosView(c: HTMLElement) {
  const [shifts, empShifts, employees] = await Promise.all([
    pb.listAll('attendance_shifts', { sort: 'name' }).catch(() => []),
    pb.listAll('employee_shifts', { expand: 'employee_id,shift_id', sort: '-created' }).catch(() => []),
    pb.listAll('third_parties', { filter: 'type="EMPLEADO" && active=true', sort: 'name' }).catch(() => []),
  ]);

  c.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Plantillas de Turnos -->
      <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-slate-900 text-sm"><i class="fas fa-clock text-indigo-600 mr-2"></i>Plantillas de Turnos</h3>
          <button id="btn-new-shift" class="btn btn-primary btn-xs"><i class="fas fa-plus mr-1"></i>Nuevo Turno</button>
        </div>
        <div class="space-y-2.5">
          ${shifts.map((s: any) => `
            <div class="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all bg-slate-50/50">
              <div class="flex items-center justify-between">
                <div>
                  <span class="font-bold text-xs text-slate-900">${esc(s.name)}</span>
                  <span class="ml-2 px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">${esc(s.code)}</span>
                </div>
                <span class="text-[10px] text-slate-500">Tolerancia: ${s.tolerance_entry_minutes || 0}m</span>
              </div>
            </div>
          `).join('') || '<p class="text-xs text-slate-400">No hay turnos configurados.</p>'}
        </div>
      </div>

      <!-- Asignación a Colaboradores -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-slate-900 text-sm"><i class="fas fa-user-clock text-emerald-600 mr-2"></i>Asignación de Turno, PIN y Geocerca</h3>
          <button id="btn-assign-shift" class="btn btn-primary btn-xs"><i class="fas fa-link mr-1"></i>Asignar Turno</button>
        </div>
        <div class="overflow-x-auto">
          <table class="data-table w-full text-left text-xs">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Turno Asignado</th>
                <th>PIN Kiosco</th>
                <th>Móvil GPS</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${empShifts.map((es: any) => `
                <tr>
                  <td class="font-semibold text-slate-900">${esc(es.expand?.employee_id?.name || '—')}</td>
                  <td>${esc(es.expand?.shift_id?.name || '—')}</td>
                  <td class="font-mono">${es.kiosk_pin ? '••••' : '<span class="text-slate-400">Últ. 4 cédula</span>'}</td>
                  <td>${es.allow_mobile_punch ? '<span class="badge badge-green">Sí</span>' : '<span class="text-slate-400">No</span>'}</td>
                  <td>${es.active ? '<span class="badge badge-blue">Activo</span>' : '<span class="badge">Inactivo</span>'}</td>
                </tr>
              `).join('') || '<tr><td colspan="5" class="p-6 text-center text-slate-400">Sin asignaciones personalizadas (se usa jornada estándar).</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  c.querySelector('#btn-new-shift')?.addEventListener('click', () => {
    const body = `
      <div class="space-y-3 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold mb-1">Nombre del Turno *</label>
            <input id="sh-name" class="form-control" placeholder="Ej: Turno Mañana 44h">
          </div>
          <div>
            <label class="block font-bold mb-1">Código *</label>
            <input id="sh-code" class="form-control" placeholder="Ej: T-MAN">
          </div>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <div><label class="block font-bold mb-1">Entrada (L-V)</label><input id="sh-in" type="time" class="form-control" value="08:00"></div>
          <div><label class="block font-bold mb-1">Salida (L-V)</label><input id="sh-out" type="time" class="form-control" value="17:00"></div>
          <div><label class="block font-bold mb-1">Almuerzo (min)</label><input id="sh-brk" type="number" class="form-control" value="60"></div>
          <div><label class="block font-bold mb-1">Tolerancia (min)</label><input id="sh-tol" type="number" class="form-control" value="10"></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block font-bold mb-1">Entrada Sábado (opcional)</label><input id="sh-sat-in" type="time" class="form-control" value="08:00"></div>
          <div><label class="block font-bold mb-1">Salida Sábado (opcional)</label><input id="sh-sat-out" type="time" class="form-control" value="12:00"></div>
        </div>
      </div>
    `;
    const footer = `
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button id="sh-save" class="btn btn-primary btn-sm">Guardar Turno</button>
    `;
    openModal('Nueva Plantilla de Turno', body, footer, false);
    document.getElementById('sh-save')?.addEventListener('click', async () => {
      const name = (document.getElementById('sh-name') as HTMLInputElement).value.trim();
      const code = (document.getElementById('sh-code') as HTMLInputElement).value.trim();
      const tIn = (document.getElementById('sh-in') as HTMLInputElement).value;
      const tOut = (document.getElementById('sh-out') as HTMLInputElement).value;
      const brk = Number((document.getElementById('sh-brk') as HTMLInputElement).value || 0);
      const tol = Number((document.getElementById('sh-tol') as HTMLInputElement).value || 10);
      const satIn = (document.getElementById('sh-sat-in') as HTMLInputElement).value;
      const satOut = (document.getElementById('sh-sat-out') as HTMLInputElement).value;

      if (!name || !code) return showToast('Nombre y código requeridos.', 'warning');

      const wd = { enabled: true, entry_time: tIn, exit_time: tOut, break_start: '12:00', break_end: '13:00', break_minutes: brk, break_is_paid: false };
      const schedule_json = {
        mon: wd, tue: wd, wed: wd, thu: wd, fri: wd,
        sat: { enabled: !!(satIn && satOut), entry_time: satIn, exit_time: satOut, break_minutes: 0, break_is_paid: false },
        sun: { enabled: false, entry_time: '', exit_time: '', break_minutes: 0, break_is_paid: false },
      };

      await pb.create('attendance_shifts', {
        name, code, schedule_json, tolerance_entry_minutes: tol, tolerance_exit_minutes: tol, active: true,
      });
      closeModal();
      showToast('Turno creado.', 'success');
      renderTurnosView(c);
    });
  });

  c.querySelector('#btn-assign-shift')?.addEventListener('click', () => {
    const body = `
      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold mb-1">Empleado *</label>
          <select id="as-emp" class="form-control">${employees.map((e: any) => `<option value="${esc(e.id)}">${esc(e.name)}</option>`).join('')}</select>
        </div>
        <div>
          <label class="block font-bold mb-1">Turno *</label>
          <select id="as-shift" class="form-control">${shifts.map((s: any) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}</select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="block font-bold mb-1">PIN Kiosco (4-6 dígitos)</label><input id="as-pin" class="form-control" maxlength="6" placeholder="Opcional"></div>
          <div class="flex items-center pt-5"><label class="inline-flex items-center gap-2 cursor-pointer"><input type="checkbox" id="as-mob"> Permitir fichaje móvil GPS</label></div>
        </div>
      </div>
    `;
    const footer = `
      <button class="btn btn-outline btn-sm" onclick="closeModal()">Cancelar</button>
      <button id="as-save" class="btn btn-primary btn-sm">Asignar</button>
    `;
    openModal('Asignar Turno a Colaborador', body, footer, false);
    document.getElementById('as-save')?.addEventListener('click', async () => {
      const employee_id = (document.getElementById('as-emp') as HTMLSelectElement).value;
      const shift_id = (document.getElementById('as-shift') as HTMLSelectElement).value;
      const kiosk_pin = (document.getElementById('as-pin') as HTMLInputElement).value.trim();
      const allow_mobile_punch = (document.getElementById('as-mob') as HTMLInputElement).checked;
      await pb.create('employee_shifts', { employee_id, shift_id, kiosk_pin, allow_mobile_punch, active: true });
      closeModal();
      showToast('Turno asignado.', 'success');
      renderTurnosView(c);
    });
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. IMPORTADOR UNIVERSAL DE HUELLEROS (CSV / EXCEL / DAT)
// ═════════════════════════════════════════════════════════════════════════════
async function renderImportadorView(c: HTMLElement) {
  let parsedRows: any[] = [];
  let headers: string[] = [];

  c.innerHTML = `
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div>
        <h3 class="font-bold text-slate-900 text-base"><i class="fas fa-file-import text-indigo-600 mr-2"></i>Importador de Logs Biométricos (Huelleros)</h3>
        <p class="text-xs text-slate-500 mt-1">Compatible con exportaciones de ZKTeco, Anviz, Hikvision, Dahua o archivos Excel/CSV con documento, fecha y hora.</p>
      </div>

      <div id="imp-dropzone" class="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center transition-all cursor-pointer bg-slate-50/50">
        <i class="fas fa-cloud-arrow-up text-3xl text-indigo-500 mb-2"></i>
        <p class="font-bold text-sm text-slate-800">Arrastra tu archivo (.xlsx, .csv, .txt, .dat) o haz clic para seleccionar</p>
        <input type="file" id="imp-file" accept=".xlsx,.xls,.csv,.txt,.dat" class="hidden">
      </div>

      <div id="imp-mapper" class="hidden space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Columna Documento / ID *</label>
            <select id="map-doc" class="form-control text-xs"></select>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Columna Fecha y Hora *</label>
            <select id="map-ts" class="form-control text-xs"></select>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Columna Evento (opcional)</label>
            <select id="map-evt" class="form-control text-xs"></select>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1">Nombre del Dispositivo</label>
            <input id="map-dev" class="form-control text-xs" value="Huellero Principal">
          </div>
        </div>

        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="data-table w-full text-left text-xs">
            <thead><tr id="imp-preview-head"></tr></thead>
            <tbody id="imp-preview-body"></tbody>
          </table>
        </div>

        <div class="flex justify-end">
          <button id="imp-btn-run" class="btn btn-primary font-bold">
            <i class="fas fa-upload mr-2"></i>Importar y Procesar Marcaciones
          </button>
        </div>
      </div>
    </div>
  `;

  const fileInput = c.querySelector('#imp-file') as HTMLInputElement;
  const dropzone = c.querySelector('#imp-dropzone') as HTMLElement;

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('border-indigo-500'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('border-indigo-500'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-indigo-500');
    if (e.dataTransfer?.files?.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files?.length) handleFile(fileInput.files[0]);
  });

  const handleFile = async (file: File) => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array', raw: false });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    if (json.length < 2) return showToast('El archivo no contiene suficientes filas.', 'warning');

    headers = json[0].map((h, i) => String(h || `Columna ${i + 1}`));
    parsedRows = json.slice(1).filter((r) => r.some((cell) => cell !== undefined && cell !== ''));

    const mapper = c.querySelector('#imp-mapper') as HTMLElement;
    mapper.classList.remove('hidden');

    const opts = headers.map((h, idx) => `<option value="${idx}">${esc(h)}</option>`).join('');
    (c.querySelector('#map-doc') as HTMLSelectElement).innerHTML = opts;
    (c.querySelector('#map-ts') as HTMLSelectElement).innerHTML = opts;
    (c.querySelector('#map-evt') as HTMLSelectElement).innerHTML = `<option value="-1">Automático</option>${opts}`;

    // Auto-detección básica
    headers.forEach((h, idx) => {
      const l = h.toLowerCase();
      if (/doc|ced|id|user|emp/.test(l)) (c.querySelector('#map-doc') as HTMLSelectElement).value = String(idx);
      if (/fecha|time|date|hora/.test(l)) (c.querySelector('#map-ts') as HTMLSelectElement).value = String(idx);
      if (/tipo|event|state|status/.test(l)) (c.querySelector('#map-evt') as HTMLSelectElement).value = String(idx);
    });

    (c.querySelector('#imp-preview-head') as HTMLElement).innerHTML = headers.map((h) => `<th>${esc(h)}</th>`).join('');
    (c.querySelector('#imp-preview-body') as HTMLElement).innerHTML = parsedRows.slice(0, 5).map((r) =>
      `<tr>${headers.map((_, i) => `<td>${esc(r[i] ?? '')}</td>`).join('')}</tr>`
    ).join('');
  };

  c.querySelector('#imp-btn-run')?.addEventListener('click', async () => {
    const docIdx = Number((c.querySelector('#map-doc') as HTMLSelectElement).value);
    const tsIdx = Number((c.querySelector('#map-ts') as HTMLSelectElement).value);
    const evtIdx = Number((c.querySelector('#map-evt') as HTMLSelectElement).value);
    const devName = (c.querySelector('#map-dev') as HTMLInputElement).value.trim();

    const payloadRows = parsedRows.map((r) => {
      let rawTs = String(r[tsIdx] || '').trim().replace(' ', 'T');
      if (/^\d{2}\/\d{2}\/\d{4}/.test(rawTs)) {
        const [dPart, tPart] = rawTs.split('T');
        const [dd, mm, yyyy] = dPart.split('/');
        rawTs = `${yyyy}-${mm}-${dd}T${tPart || '08:00:00'}`;
      }
      const rawEvt = evtIdx >= 0 ? String(r[evtIdx] || '').toUpperCase() : 'AUTO';
      let pt = 'AUTO';
      if (rawEvt.includes('IN') || rawEvt === '0' || rawEvt.includes('ENTRADA')) pt = 'IN';
      else if (rawEvt.includes('OUT') || rawEvt === '1' || rawEvt.includes('SALIDA')) pt = 'OUT';

      return {
        doc_number: String(r[docIdx] || '').trim(),
        timestamp: rawTs,
        punch_type: pt,
        device_name: devName,
      };
    });

    try {
      const res = await pb.send('/api/attendance/import-batch', { method: 'POST', body: { rows: payloadRows } });
      showToast(`Importadas ${res.imported} marcaciones (${res.duplicates} duplicadas, ${res.recalculated_days} días recalculados).`, 'success');
      if (res.errors?.length) {
        console.warn('Errores de importación:', res.errors);
      }
    } catch (err: any) {
      showToast(err.message || 'Error importando archivo.', 'error');
    }
  });
}

(window as any).renderNominaAsistenciaPage = renderNominaAsistenciaPage;
(window as any).renderNominaRegistroIngresoPage = renderNominaRegistroIngresoPage;
(window as any).renderNominaTurnosPage = renderNominaTurnosPage;
