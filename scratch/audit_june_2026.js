const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function auditJune(dbPath, label) {
  if (!fs.existsSync(dbPath)) return;
  console.log(`\n========================================================================`);
  console.log(`AUDITANDO JUNIO 2026: ${label} (${dbPath})`);
  console.log(`========================================================================`);

  const db = new DatabaseSync(dbPath);

  // 1. Periods in June 2026
  const periods = db.prepare(`
    SELECT id, name, date_from, date_to, status 
    FROM payroll_periods 
    WHERE date_from LIKE '2026-06%' OR date_to LIKE '2026-06%'
    ORDER BY date_from ASC
  `).all();

  console.log(`\nPeríodos encontrados en Junio 2026 (${periods.length}):`);
  console.table(periods);

  if (periods.length === 0) return;

  const pIds = periods.map(p => `'${p.id}'`).join(',');

  // 2. Novelties linked to June 2026 periods
  const novs = db.prepare(`
    SELECT n.*, t.name as emp_name, p.name as period_name
    FROM payroll_novelties n
    LEFT JOIN third_parties t ON t.id = n.employee_id
    LEFT JOIN payroll_periods p ON p.id = n.period_id
    WHERE n.period_id IN (${pIds}) OR n.date_from LIKE '2026-06%'
    ORDER BY n.period_id, n.type
  `).all();
  console.log(`\nNovedades de Nómina en Junio 2026 (${novs.length}):`);
  console.table(novs.map(n => ({
    period: n.period_name,
    emp: n.emp_name,
    type: n.type,
    amount: n.amount,
    qty: n.qty,
    status: n.status,
    date_from: n.date_from,
    date_to: n.date_to,
    updated: n.updated
  })));

  // 3. Electronic payroll for June 2026
  const neList = db.prepare(`
    SELECT ep.*, t.name as emp_name, t.doc_number
    FROM electronic_payrolls ep
    LEFT JOIN third_parties t ON t.id = ep.employee_id
    WHERE ep.ano = 2026 AND ep.mes = 6
    ORDER BY ep.consecutivo ASC
  `).all();
  console.log(`\nVolantes en Nómina Electrónica para Junio 2026 (${neList.length}):`);
  console.table(neList.map(ne => ({
    consecutivo: `${ne.prefijo}-${ne.consecutivo}`,
    emp: ne.emp_name,
    doc: ne.doc_number,
    devengos: ne.total_devengos,
    deducciones: ne.total_deducciones,
    neto: ne.total_neto,
    estado_dian: ne.estado_dian,
    cufe: (ne.cufe || '').slice(0, 15) + '...',
    updated: ne.updated
  })));

  // 4. Payroll lines for June 2026
  const lines = db.prepare(`
    SELECT pl.*, tp.name as emp_name, tp.doc_number, pp.name as period_name, pp.date_from as period_date_from
    FROM payroll_lines pl
    JOIN payroll_periods pp ON pp.id = pl.period_id
    LEFT JOIN third_parties tp ON tp.id = pl.employee_id
    WHERE pl.period_id IN (${pIds})
    ORDER BY tp.name, pp.date_from
  `).all();

  console.log(`\nLíneas de nómina ordinaria en Junio 2026 (${lines.length}):`);

  // Group by employee
  const byEmp = new Map();
  for (const l of lines) {
    if (!byEmp.has(l.employee_id)) {
      byEmp.set(l.employee_id, {
        empId: l.employee_id,
        empName: l.emp_name,
        docNumber: l.doc_number,
        lines: [],
        totalDays: 0,
        totalSueldoProp: 0,
        totalTransporte: 0,
        totalOvertime: 0,
        totalDevengos: 0,
        totalSalud: 0,
        totalPension: 0,
        totalFsp: 0,
        totalRetencion: 0,
        totalOtrasDed: 0,
        totalDeducciones: 0,
        totalNeto: 0,
        concepts: {}
      });
    }
    const acc = byEmp.get(l.employee_id);
    acc.lines.push(l);

    let pm = {};
    try { pm = JSON.parse(l.notes || '{}').payroll_meta || {}; } catch (_) {}
    const ca = pm.concept_amounts || {};
    const otMeta = pm.overtime_breakdown || {};

    const days = (l.days_worked !== undefined && l.days_worked !== null && !isNaN(Number(l.days_worked))) ? Number(l.days_worked) : 30;
    const propSal = round2(((Number(l.salary_base || 0)) / 30) * days);
    const ot = otMeta.total_amount || Number(l.overtime || 0);

    for (const [k, v] of Object.entries(ca)) {
      acc.concepts[k] = round2((acc.concepts[k] || 0) + Number(v || 0));
    }

    const sal = Number(l.deduction_health || 0);
    const pen = Number(l.deduction_pension || 0);
    const fsp = Number(l.solidarity_fund || 0);
    const ret = Number(l.withholding_tax || 0);
    const otrDed = Number(l.deduction_other || 0) + Number(ca.prestamos || 0) + Number(ca.libranza || 0) + Number(ca.embargo || 0) + Number(ca.deuda || 0) + Number(ca.cxc || 0);

    const devExt = Object.entries(ca).reduce((sum, [k, v]) => {
      if (['incapacidades', 'licencias', 'gastos_representacion', 'bonificacion', 'aux_no_salariales', 'comisiones', 'dotaciones', 'compensatorios', 'alimentacion', 'rodamiento', 'ajuste_salarial', 'vacaciones_disfrutadas', 'prima_servicios', 'cesantias_pagadas', 'intereses_cesantias', 'otros_ingresos'].includes(k)) {
        return sum + Number(v || 0);
      }
      return sum;
    }, 0);

    const dev = round2(propSal + Number(l.transport_allowance || 0) + ot + devExt);
    const ded = round2(sal + pen + fsp + ret + otrDed);

    acc.totalDays += days;
    acc.totalSueldoProp = round2(acc.totalSueldoProp + propSal);
    acc.totalTransporte = round2(acc.totalTransporte + Number(l.transport_allowance || 0));
    acc.totalOvertime = round2(acc.totalOvertime + ot);
    acc.totalDevengos = round2(acc.totalDevengos + dev);
    acc.totalSalud = round2(acc.totalSalud + sal);
    acc.totalPension = round2(acc.totalPension + pen);
    acc.totalFsp = round2(acc.totalFsp + fsp);
    acc.totalRetencion = round2(acc.totalRetencion + ret);
    acc.totalOtrasDed = round2(acc.totalOtrasDed + otrDed);
    acc.totalDeducciones = round2(acc.totalDeducciones + ded);
    acc.totalNeto = round2(acc.totalNeto + (dev - ded));
  }

  // 5. Comparison: Ordinary vs Electronic Payroll
  console.log(`\n========================================================================`);
  console.log(`COMPARATIVA DETALLADA ORDINARIA VS ELECTRÓNICA - JUNIO 2026`);
  console.log(`========================================================================`);

  const compTable = [];
  const neMap = new Map();
  neList.forEach(ne => neMap.set(ne.employee_id, ne));

  for (const [empId, ord] of byEmp.entries()) {
    const ne = neMap.get(empId);
    const diffDev = ne ? round2(ord.totalDevengos - Number(ne.total_devengos)) : 'SIN_NE';
    const diffDed = ne ? round2(ord.totalDeducciones - Number(ne.total_deducciones)) : 'SIN_NE';
    const diffNet = ne ? round2(ord.totalNeto - Number(ne.total_neto)) : 'SIN_NE';

    compTable.push({
      empleado: ord.empName,
      doc: ord.docNumber,
      dias: ord.totalDays,
      ord_dev: ord.totalDevengos,
      ne_dev: ne ? ne.total_devengos : 'N/A',
      diff_dev: diffDev,
      ord_ded: ord.totalDeducciones,
      ne_ded: ne ? ne.total_deducciones : 'N/A',
      diff_ded: diffDed,
      ord_net: ord.totalNeto,
      ne_net: ne ? ne.total_neto : 'N/A',
      diff_net: diffNet,
      volante: ne ? `${ne.prefijo}-${ne.consecutivo}` : 'SIN_NE',
      dian: ne ? ne.estado_dian : 'N/A'
    });
  }

  console.table(compTable);

  // Check if any NE record has NO matching ordinary employee
  for (const ne of neList) {
    if (!byEmp.has(ne.employee_id)) {
      console.log(`⚠️ Volante electrónico huérfano (sin línea ordinaria en Junio 2026): ${ne.prefijo}-${ne.consecutivo} para ${ne.emp_name} (${ne.employee_id})`);
    }
  }
}

auditJune('pb_data/data.db', 'ROOT Tenant (Puerto 8090)');
auditJune('empresas/empresa_8091/pb_data/data.db', 'Tenant 8091');
