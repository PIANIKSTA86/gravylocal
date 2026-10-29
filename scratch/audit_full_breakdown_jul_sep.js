const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const months = [
  { ym: '2026-07', mes: 7 },
  { ym: '2026-08', mes: 8 },
  { ym: '2026-09', mes: 9 }
];

const auditResults = [];

for (const { ym, mes } of months) {
  const periods = db.prepare("SELECT id, name, date_from, date_to FROM payroll_periods WHERE date_from LIKE ? OR date_to LIKE ?").all(`${ym}%`, `${ym}%`);
  const periodIds = periods.map(p => p.id);
  const placeholders = periodIds.map(() => '?').join(',');

  const lines = db.prepare(`
    SELECT pl.*, tp.name as emp_name, tp.doc_number 
    FROM payroll_lines pl
    JOIN third_parties tp ON tp.id = pl.employee_id
    WHERE pl.period_id IN (${placeholders})
    ORDER BY tp.name
  `).all(...periodIds);

  // Group by employee
  const empMap = new Map();
  for (const l of lines) {
    if (!empMap.has(l.employee_id)) {
      empMap.set(l.employee_id, {
        empId: l.employee_id,
        name: l.emp_name,
        doc: l.doc_number,
        dias: 0,
        sueldoBase: 0,
        sueldoProp: 0,
        transporte: 0,
        horasExtras: 0,
        comisiones: 0,
        gastosRep: 0,
        rodamiento: 0,
        bonif: 0,
        otrosIngresos: 0,
        totalDev: 0,
        salud: 0,
        pension: 0,
        fsp: 0,
        retencion: 0,
        otrasDed: 0,
        totalDed: 0,
        neto: 0,
      });
    }
    const acc = empMap.get(l.employee_id);

    let pm = {};
    try { pm = JSON.parse(l.notes || '{}').payroll_meta || {}; } catch (_) {}
    const ca = pm.concept_amounts || {};
    const otMeta = pm.overtime_breakdown || {};

    const days = (l.days_worked !== undefined && l.days_worked !== null && !isNaN(Number(l.days_worked))) ? Number(l.days_worked) : 30;
    const propSal = round2(((Number(l.salary_base || 0)) / 30) * days);
    const ot = otMeta.total_amount || Number(l.overtime || 0);

    const com = Number(ca.comisiones || 0);
    const gr = Number(ca.gastos_representacion || 0);
    const rod = Number(ca.rodamiento || 0);
    const bon = Number(ca.bonificacion || 0);
    const otr = Number(ca.otros_ingresos || 0) + Number(ca.ajuste_salarial || 0);

    const sal = Number(l.deduction_health || 0);
    const pen = Number(l.deduction_pension || 0);
    const fsp = Number(l.solidarity_fund || 0);
    const ret = Number(l.withholding_tax || 0);
    const otrDed = Number(l.deduction_other || 0) + Number(ca.prestamos || 0) + Number(ca.libranza || 0) + Number(ca.embargo || 0) + Number(ca.deuda || 0);

    const dev = round2(propSal + Number(l.transport_allowance || 0) + ot + com + gr + rod + bon + otr);
    const ded = round2(sal + pen + fsp + ret + otrDed);

    acc.dias += days;
    acc.sueldoProp = round2(acc.sueldoProp + propSal);
    acc.transporte = round2(acc.transporte + Number(l.transport_allowance || 0));
    acc.horasExtras = round2(acc.horasExtras + ot);
    acc.comisiones = round2(acc.comisiones + com);
    acc.gastosRep = round2(acc.gastosRep + gr);
    acc.rodamiento = round2(acc.rodamiento + rod);
    acc.bonif = round2(acc.bonif + bon);
    acc.otrosIngresos = round2(acc.otrosIngresos + otr);
    acc.totalDev = round2(acc.totalDev + dev);

    acc.salud = round2(acc.salud + sal);
    acc.pension = round2(acc.pension + pen);
    acc.fsp = round2(acc.fsp + fsp);
    acc.retencion = round2(acc.retencion + ret);
    acc.otrasDed = round2(acc.otrasDed + otrDed);
    acc.totalDed = round2(acc.totalDed + ded);
    acc.neto = round2(acc.neto + (dev - ded));
  }

  // Compare with electronic_payrolls
  const neRecords = db.prepare("SELECT * FROM electronic_payrolls WHERE ano = 2026 AND mes = ?").all(mes);
  const neMap = new Map();
  neRecords.forEach(ne => neMap.set(ne.employee_id, ne));

  for (const [empId, ord] of empMap.entries()) {
    const ne = neMap.get(empId);
    if (!ne) {
      auditResults.push({
        mes: ym,
        empleado: ord.name,
        doc: ord.doc,
        issue: 'FALTA EN NOMINA ELECTRONICA',
        detalles: 'No existe volante electrónico en este mes'
      });
      continue;
    }

    const xml = ne.xml_generado || '';
    
    // Parse XML concepts
    const basicoM = xml.match(/<Basico DiasTrabajados="([^"]*)" SueldoTrabajado="([^"]*)"/);
    const transpM = xml.match(/<Transporte AuxilioTransporte="([^"]*)"/);
    const comM = xml.match(/<Comision>([^<]*)<\/Comision>/);
    const bonM = xml.match(/<Bonificacion BonificacionS="([^"]*)"/);
    const auxM = xml.match(/<Auxilio AuxilioNS="([^"]*)"/);
    const otrosM = xml.match(/<OtroConcepto ConceptoS="([^"]*)"/) || xml.match(/<OtroConcepto[^>]*ConceptoNS="([^"]*)"/);
    
    const saludM = xml.match(/<Salud Porcentaje="[^"]*" Deduccion="([^"]*)"/);
    const penM = xml.match(/<FondoPension Porcentaje="[^"]*" Deduccion="([^"]*)"/);
    const fspM = xml.match(/<FondoSP Porcentaje="[^"]*" DeduccionSP="([^"]*)"/);
    const retM = xml.match(/<RetencionFuente>([^<]*)<\/RetencionFuente>/);
    const deudaM = xml.match(/<Deuda>([^<]*)<\/Deuda>/) || xml.match(/<OtraDeduccion>([^<]*)<\/OtraDeduccion>/);

    const issues = [];

    // Check Sueldo
    const xmlSueldo = Number(basicoM?.[2] || 0);
    if (Math.abs(ord.sueldoProp - xmlSueldo) > 0.05) {
      issues.push(`Sueldo ordinario: ${ord.sueldoProp} vs XML: ${xmlSueldo}`);
    }

    // Check Transporte
    const xmlTransp = Number(transpM?.[1] || 0);
    if (Math.abs(ord.transporte - xmlTransp) > 0.05) {
      issues.push(`Aux. Transporte ordinario: ${ord.transporte} vs XML: ${xmlTransp}`);
    }

    // Check Gastos de Representacion
    if (ord.gastosRep > 0) {
      const hasGR = xml.includes('Gasto') || xml.includes(ord.gastosRep.toFixed(2));
      if (!hasGR) {
        issues.push(`Gastos de Representación ordinaria ($${ord.gastosRep}) OMITIDO en XML`);
      }
    }

    // Check Rodamiento
    if (ord.rodamiento > 0) {
      const hasRod = xml.includes(ord.rodamiento.toFixed(2));
      if (!hasRod) {
        issues.push(`Auxilio de Rodamiento ordinario ($${ord.rodamiento}) OMITIDO en XML`);
      }
    }

    // Check Comisiones
    const xmlCom = Number(comM?.[1] || 0);
    if (Math.abs(ord.comisiones - xmlCom) > 0.05) {
      issues.push(`Comisiones ordinaria: ${ord.comisiones} vs XML: ${xmlCom}`);
    }

    // Check Salud
    const xmlSalud = Number(saludM?.[1] || 0);
    if (Math.abs(ord.salud - xmlSalud) > 0.05) {
      issues.push(`Salud ordinaria: ${ord.salud} vs XML: ${xmlSalud}`);
    }

    // Check Pension
    const xmlPen = Number(penM?.[1] || 0);
    if (Math.abs(ord.pension - xmlPen) > 0.05) {
      issues.push(`Pensión ordinaria: ${ord.pension} vs XML: ${xmlPen}`);
    }

    // Check FSP
    const xmlFsp = Number(fspM?.[1] || 0);
    if (Math.abs(ord.fsp - xmlFsp) > 0.05) {
      issues.push(`FSP ordinario: ${ord.fsp} vs XML: ${xmlFsp}`);
    }

    // Check Retención
    const xmlRet = Number(retM?.[1] || 0);
    if (Math.abs(ord.retencion - xmlRet) > 0.05) {
      issues.push(`Retención ordinaria: ${ord.retencion} vs XML: ${xmlRet}`);
    }

    // Check Deuda / Otras Deducciones
    const xmlDeuda = Number(deudaM?.[1] || 0);
    if (Math.abs(ord.otrasDed - xmlDeuda) > 0.05) {
      issues.push(`Otras Deducciones ordinaria: ${ord.otrasDed} vs XML: ${xmlDeuda} (posible duplicidad)`);
    }

    // Check XML Header Totals vs Ordinary Totals
    if (Math.abs(ord.totalDev - Number(ne.total_devengos)) > 0.05) {
      issues.push(`Total Devengos ordinaria: ${ord.totalDev} vs NE Header: ${ne.total_devengos}`);
    }
    if (Math.abs(ord.totalDed - Number(ne.total_deducciones)) > 0.05) {
      issues.push(`Total Deducciones ordinaria: ${ord.totalDed} vs NE Header: ${ne.total_deducciones}`);
    }
    if (Math.abs(ord.neto - Number(ne.total_neto)) > 0.05) {
      issues.push(`Total Neto ordinaria: ${ord.neto} vs NE Header: ${ne.total_neto}`);
    }

    auditResults.push({
      mes: ym,
      empleado: ord.name,
      doc: ord.doc,
      consecutivo: `${ne.prefijo}-${ne.consecutivo}`,
      estado_dian: ne.estado_dian,
      total_dev: ord.totalDev,
      total_ded: ord.totalDed,
      neto: ord.neto,
      hallazgos: issues.length ? issues.join(' | ') : 'CONFORME 100%'
    });
  }
}

console.log('Resultados de Auditoría Exhaustiva:');
for (const r of auditResults) {
  if (r.hallazgos !== 'CONFORME 100%') {
    console.log(`\n❌ [${r.mes}] ${r.empleado} (${r.doc}) - Consecutivo: ${r.consecutivo} [${r.estado_dian}]:`);
    console.log(`   Hallazgos: ${r.hallazgos}`);
  } else {
    console.log(`✅ [${r.mes}] ${r.empleado} (${r.doc}) - Consecutivo: ${r.consecutivo}: CONFORME 100%`);
  }
}
