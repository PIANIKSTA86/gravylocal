const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function getNominaDevengadoTotal(l) {
  let notes = {};
  try { notes = JSON.parse(l.notes || '{}'); } catch (_) {}
  const pm = notes.payroll_meta || {};
  const ca = pm.concept_amounts || {};
  const otMeta = pm.overtime_breakdown || {};
  const otAmount = otMeta.total_amount || Number(l.overtime || 0);

  const days = (l.days_worked !== undefined && l.days_worked !== null && !isNaN(Number(l.days_worked))) ? Number(l.days_worked) : 30;
  const propSalary = round2(((Number(l.salary_base || 0)) / 30) * days);

  const comisiones = Number(ca.comisiones || 0);
  const bonif = Number(ca.bonificacion || 0);
  const auxNoSal = Number(ca.aux_no_salariales || 0);
  const gastosRep = Number(ca.gastos_representacion || 0);
  const rodamiento = Number(ca.rodamiento || 0);
  const compensatorios = Number(ca.compensatorios || 0);
  const alimentacion = Number(ca.alimentacion || 0);
  const ajusteSalarial = Number(ca.ajuste_salarial || 0);
  const dotacion = Number(ca.dotaciones || 0);
  const otrosIngresos = Number(ca.otros_ingresos || 0);

  const incap = Number(ca.incapacidades || 0);
  const lic = Number(ca.licencias || 0);
  const vacDisfrutadas = Number(ca.vacaciones_disfrutadas || 0);

  const prima = Number(ca.prima_servicios || ca.prima_pagada || 0);
  const cesantias = Number(ca.cesantias_pagadas || 0);
  const intCes = Number(ca.intereses_cesantias || ca.intereses_cesantias_pagados || 0);

  const devengosExt = comisiones + bonif + auxNoSal + gastosRep + rodamiento + compensatorios + alimentacion + ajusteSalarial + dotacion + otrosIngresos;
  const novedadesDev = incap + lic + vacDisfrutadas + prima + cesantias + intCes;

  return round2(propSalary + Number(l.transport_allowance || 0) + otAmount + devengosExt + novedadesDev);
}

function getNominaDeduccionesTotal(l) {
  let notes = {};
  try { notes = JSON.parse(l.notes || '{}'); } catch (_) {}
  const pm = notes.payroll_meta || {};
  const ca = pm.concept_amounts || {};

  const salud = Number(l.deduction_health || 0);
  const pension = Number(l.deduction_pension || 0);
  const fsp = Number(l.solidarity_fund || 0);
  const ret = Number(l.withholding_tax || 0);

  const embargo = Number(ca.embargo || 0);
  const cxc = Number(ca.cxc || 0);
  const libranza = Number(ca.libranza || 0);
  const prestamos = Number(ca.prestamos || 0);
  const multas = Number(ca.multas || 0);

  return round2(salud + pension + fsp + ret + Number(l.deduction_other || 0) + embargo + cxc + libranza + prestamos + multas);
}

// Group payroll lines by month (YYYY-MM) and employee
const months = ['2026-07', '2026-08', '2026-09'];

const report = [];

for (const ym of months) {
  const [yearStr, monthStr] = ym.split('-');
  const y = Number(yearStr);
  const m = Number(monthStr);

  const periodsInMonth = db.prepare(`
    SELECT id, name, date_from, date_to 
    FROM payroll_periods 
    WHERE date_from LIKE ? OR date_to LIKE ?
    ORDER BY date_from
  `).all(`${ym}%`, `${ym}%`);

  const periodIds = periodsInMonth.map(p => p.id);
  if (!periodIds.length) continue;

  const placeholders = periodIds.map(() => '?').join(',');
  const lines = db.prepare(`
    SELECT pl.*, tp.name as emp_name, tp.doc_number 
    FROM payroll_lines pl
    LEFT JOIN third_parties tp ON tp.id = pl.employee_id
    WHERE pl.period_id IN (${placeholders})
  `).all(...periodIds);

  // Group lines by employee
  const empLinesMap = new Map();
  for (const l of lines) {
    if (!empLinesMap.has(l.employee_id)) {
      empLinesMap.set(l.employee_id, {
        empId: l.employee_id,
        empName: l.emp_name,
        docNumber: l.doc_number,
        lines: [],
        totalDevengos: 0,
        totalDeducciones: 0,
        totalNeto: 0,
        totalSueldoProp: 0,
        totalTransporte: 0,
        totalHorasExtras: 0,
        totalSalud: 0,
        totalPension: 0,
        totalFsp: 0,
        totalRetencion: 0,
        totalOtrasDed: 0,
      });
    }
    const acc = empLinesMap.get(l.employee_id);
    acc.lines.push(l);

    const dev = getNominaDevengadoTotal(l);
    const ded = getNominaDeduccionesTotal(l);
    const net = round2(dev - ded);

    const days = (l.days_worked !== undefined && l.days_worked !== null && !isNaN(Number(l.days_worked))) ? Number(l.days_worked) : 30;
    const propSalary = round2(((Number(l.salary_base || 0)) / 30) * days);

    acc.totalDevengos = round2(acc.totalDevengos + dev);
    acc.totalDeducciones = round2(acc.totalDeducciones + ded);
    acc.totalNeto = round2(acc.totalNeto + net);
    acc.totalSueldoProp = round2(acc.totalSueldoProp + propSalary);
    acc.totalTransporte = round2(acc.totalTransporte + Number(l.transport_allowance || 0));
    acc.totalHorasExtras = round2(acc.totalHorasExtras + Number(l.overtime || 0));
    acc.totalSalud = round2(acc.totalSalud + Number(l.deduction_health || 0));
    acc.totalPension = round2(acc.totalPension + Number(l.deduction_pension || 0));
    acc.totalFsp = round2(acc.totalFsp + Number(l.solidarity_fund || 0));
    acc.totalRetencion = round2(acc.totalRetencion + Number(l.withholding_tax || 0));
    acc.totalOtrasDed = round2(acc.totalOtrasDed + Number(l.deduction_other || 0));
  }

  // Find electronic payroll records for this month
  const neList = db.prepare(`
    SELECT * FROM electronic_payrolls 
    WHERE ano = ? AND mes = ?
  `).all(y, m);

  const neByEmp = new Map();
  neList.forEach(ne => neByEmp.set(ne.employee_id, ne));

  for (const [empId, ord] of empLinesMap.entries()) {
    const ne = neByEmp.get(empId);
    if (!ne) {
      report.push({
        mes: ym,
        empleado: ord.empName,
        doc: ord.docNumber,
        consecutivo: 'NO EXISTE',
        estado_dian: 'NO EMITIDO',
        ord_devengos: ord.totalDevengos,
        ne_devengos: 0,
        diff_devengos: ord.totalDevengos,
        ord_deducciones: ord.totalDeducciones,
        ne_deducciones: 0,
        diff_deducciones: ord.totalDeducciones,
        ord_neto: ord.totalNeto,
        ne_neto: 0,
        diff_neto: ord.totalNeto,
        detalles: 'El empleado no tiene registro en Nómina Electrónica para este mes.'
      });
      continue;
    }

    const diffDev = round2(ord.totalDevengos - ne.total_devengos);
    const diffDed = round2(ord.totalDeducciones - ne.total_deducciones);
    const diffNet = round2(ord.totalNeto - ne.total_neto);

    report.push({
      mes: ym,
      empleado: ord.empName,
      doc: ord.docNumber,
      consecutivo: `${ne.prefijo}-${ne.consecutivo}`,
      estado_dian: ne.estado_dian,
      ord_devengos: ord.totalDevengos,
      ne_devengos: ne.total_devengos,
      diff_devengos: diffDev,
      ord_deducciones: ord.totalDeducciones,
      ne_deducciones: ne.total_deducciones,
      diff_deducciones: diffDed,
      ord_neto: ord.totalNeto,
      ne_neto: ne.total_neto,
      diff_neto: diffNet,
      detalles: (diffDev !== 0 || diffDed !== 0 || diffNet !== 0) ? 'DISCREPANCIA DETECTADA' : 'OK'
    });
  }
}

console.log('Resultados de Comparación Nómina Ordinaria vs Nómina Electrónica:');
console.table(report);

const discrepancies = report.filter(r => r.detalles !== 'OK');
console.log(`\nTotal registros auditados: ${report.length}`);
console.log(`Total discrepancias encontradas: ${discrepancies.length}`);
if (discrepancies.length > 0) {
  console.log('\nDiscrepancias detalladas:');
  console.table(discrepancies);
}
