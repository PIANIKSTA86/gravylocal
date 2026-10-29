const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function auditTenant(dbPath, label) {
  if (!fs.existsSync(dbPath)) return;
  console.log(`\n========================================================================`);
  console.log(`AUDITANDO: ${label} (${dbPath})`);
  console.log(`========================================================================`);

  const db = new DatabaseSync(dbPath);

  // Get company name
  const comp = db.prepare("SELECT value FROM settings WHERE key = 'company_name'").get();
  console.log(`Empresa: ${comp?.value || 'N/A'}`);

  // Get all periods from 2026-07
  const periods = db.prepare(`
    SELECT id, name, date_from, date_to, status 
    FROM payroll_periods 
    WHERE date_from >= '2026-07-01' 
    ORDER BY date_from
  `).all();

  console.log(`\nPeríodos encontrados desde Julio 2026 (${periods.length}):`);
  console.table(periods);

  // Group periods by month (YYYY-MM)
  const monthMap = new Map();
  for (const p of periods) {
    const ym = (p.date_from || '').slice(0, 7);
    if (!monthMap.has(ym)) monthMap.set(ym, []);
    monthMap.get(ym).push(p);
  }

  for (const [ym, pList] of monthMap.entries()) {
    const [yearStr, monthStr] = ym.split('-');
    const y = Number(yearStr);
    const m = Number(monthStr);

    console.log(`\n------------------------------------------------------------`);
    console.log(`>>> MES ${ym} (${pList.map(p => p.name).join(', ')})`);

    const pIds = pList.map(p => p.id);
    const placeholders = pIds.map(() => '?').join(',');

    const lines = db.prepare(`
      SELECT pl.*, tp.name as emp_name, tp.doc_number, pp.name as period_name
      FROM payroll_lines pl
      JOIN payroll_periods pp ON pp.id = pl.period_id
      LEFT JOIN third_parties tp ON tp.id = pl.employee_id
      WHERE pl.period_id IN (${placeholders})
      ORDER BY tp.name, pp.date_from
    `).all(...pIds);

    // Group lines by employee
    const empLines = new Map();
    for (const l of lines) {
      if (!empLines.has(l.employee_id)) {
        empLines.set(l.employee_id, {
          empId: l.employee_id,
          empName: l.emp_name,
          docNumber: l.doc_number,
          lines: [],
          totalDays: 0,
          totalBase: 0,
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
      const acc = empLines.get(l.employee_id);
      acc.lines.push(l);

      let pm = {};
      try { pm = JSON.parse(l.notes || '{}').payroll_meta || {}; } catch (_) {}
      const ca = pm.concept_amounts || {};
      const otMeta = pm.overtime_breakdown || {};

      const days = (l.days_worked !== undefined && l.days_worked !== null && !isNaN(Number(l.days_worked))) ? Number(l.days_worked) : 30;
      const propSal = round2(((Number(l.salary_base || 0)) / 30) * days);
      const ot = otMeta.total_amount || Number(l.overtime || 0);

      // Accumulate all extra concept amounts
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
      acc.totalBase = Number(l.salary_base || 0);
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

    // Get electronic payroll records for this month
    const neList = db.prepare("SELECT * FROM electronic_payrolls WHERE ano = ? AND mes = ?").all(y, m);
    const neMap = new Map();
    neList.forEach(ne => neMap.set(ne.employee_id, ne));

    console.log(`Empleados liquidados en Nómina Ordinaria: ${empLines.size} | Volantes en Nómina Electrónica: ${neList.length}`);

    for (const [empId, ord] of empLines.entries()) {
      const ne = neMap.get(empId);
      if (!ne) {
        console.log(`❌ [${ym}] ${ord.empName} (${ord.docNumber}): NO TIENE VOLANTE EN NOMINA ELECTRONICA`);
        console.log(`   Devengos Ordinaria: $${ord.totalDevengos} | Deducciones: $${ord.totalDeducciones} | Neto: $${ord.totalNeto}`);
        continue;
      }

      const diffDev = round2(ord.totalDevengos - Number(ne.total_devengos));
      const diffDed = round2(ord.totalDeducciones - Number(ne.total_deducciones));
      const diffNet = round2(ord.totalNeto - Number(ne.total_neto));

      const xml = ne.xml_generado || '';
      // Check if internal XML matches
      let internalIssues = [];

      const basicoM = xml.match(/<Basico DiasTrabajados="([^"]*)" SueldoTrabajado="([^"]*)"/);
      const xmlSueldo = Number(basicoM?.[2] || 0);
      if (Math.abs(ord.totalSueldoProp - xmlSueldo) > 0.05) {
        internalIssues.push(`Sueldo prop: ord $${ord.totalSueldoProp} vs XML $${xmlSueldo}`);
      }

      const transpM = xml.match(/<Transporte AuxilioTransporte="([^"]*)"/);
      const xmlTransp = Number(transpM?.[1] || 0);
      if (Math.abs(ord.totalTransporte - xmlTransp) > 0.05) {
        internalIssues.push(`Transporte: ord $${ord.totalTransporte} vs XML $${xmlTransp}`);
      }

      if (diffDev !== 0 || diffDed !== 0 || diffNet !== 0 || internalIssues.length > 0) {
        console.log(`❌ [${ym}] ${ord.empName} (${ord.docNumber}) - Volante: ${ne.prefijo}-${ne.consecutivo} [${ne.estado_dian}]:`);
        if (diffDev !== 0) console.log(`   Diff Devengos: $${diffDev} (Ordinaria: $${ord.totalDevengos} vs NE: $${ne.total_devengos})`);
        if (diffDed !== 0) console.log(`   Diff Deducciones: $${diffDed} (Ordinaria: $${ord.totalDeducciones} vs NE: $${ne.total_deducciones})`);
        if (diffNet !== 0) console.log(`   Diff Neto: $${diffNet} (Ordinaria: $${ord.totalNeto} vs NE: $${ne.total_neto})`);
        if (internalIssues.length > 0) console.log(`   Inconsistencias internas XML: ${internalIssues.join(', ')}`);
        console.log(`   Conceptos Ordinarios:`, ord.concepts);
      } else {
        console.log(`✅ [${ym}] ${ord.empName} (${ord.docNumber}) - Volante: ${ne.prefijo}-${ne.consecutivo}: CONFORME 100% ($${ord.totalDevengos} / $${ord.totalDeducciones} / Neto $${ord.totalNeto})`);
      }
    }
  }
}

auditTenant('pb_data/data.db', 'ROOT Tenant (Puerto 8090)');
auditTenant('empresas/empresa_8091/pb_data/data.db', 'Tenant 8091');
