const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

function parseNominaXmlConcepts(xmlStr) {
  const devengos = [];
  const deducciones = [];
  if (!xmlStr) return { devengos, deducciones };

  // 1. JSON UBL 2.1 (MATIAS API / GRAVY)
  if (xmlStr.trim().startsWith('{')) {
    try {
      const j = JSON.parse(xmlStr);
      const earn = j.earn || j.accrued || {};
      const timeWorked = earn.basic?.worked_days || j.period?.time_worked || '30';

      // Básico
      if (earn.basic) {
        const val = parseFloat(earn.basic.salary_worked || 0);
        const days = earn.basic.worked_days || timeWorked;
        if (val > 0) devengos.push({ code: '001', name: 'Sueldo Básico', qty: `${days} días`, value: val });
      }

      // Auxilio de Transporte y Viáticos
      const tr = earn.transport || earn.transportation;
      if (tr) {
        const trObj = Array.isArray(tr) ? tr[0] : tr;
        const valAux = parseFloat(trObj?.transportation_assistance || trObj?.transport_assistance || 0);
        if (valAux > 0) devengos.push({ code: '040', name: 'Auxilio de Transporte', qty: `${timeWorked} días`, value: valAux });
        const valViatS = parseFloat(trObj?.viatic_maintenance || trObj?.viatic_salary_maintenance || 0);
        if (valViatS > 0) devengos.push({ code: '041', name: 'Viáticos Salariales', qty: '—', value: valViatS });
        const valViatNS = parseFloat(trObj?.viatic_non_salary_maintenance || 0);
        if (valViatNS > 0) devengos.push({ code: '042', name: 'Viáticos No Salariales', qty: '—', value: valViatNS });
      }

      // Horas extras
      const otConfig = [
        { key: 'HEDs', code: '101', name: 'Hora Extra Diurna', defaultPct: '25%' },
        { key: 'HENs', code: '102', name: 'Hora Extra Nocturna', defaultPct: '75%' },
        { key: 'HRNs', code: '103', name: 'Recargo Nocturno', defaultPct: '35%' },
        { key: 'HEDDFs', code: '104', name: 'Hora Extra Diurna Dominical/Festiva', defaultPct: '100%' },
        { key: 'HRDDFs', code: '105', name: 'Recargo Dominical/Festivo', defaultPct: '75%' },
        { key: 'HRDFs', code: '105', name: 'Recargo Dominical/Festivo', defaultPct: '75%' },
        { key: 'HENDFs', code: '106', name: 'Hora Extra Nocturna Dominical/Festiva', defaultPct: '150%' },
        { key: 'HRNDFs', code: '107', name: 'Recargo Nocturno Dominical/Festivo', defaultPct: '110%' }
      ];
      otConfig.forEach(cfg => {
        const items = earn[cfg.key];
        if (Array.isArray(items)) {
          items.forEach(it => {
            const val = parseFloat(it.payment || 0);
            if (val > 0) {
              const cant = it.amount || '1';
              const pct = it.percentage ? `${it.percentage}%` : cfg.defaultPct;
              devengos.push({ code: cfg.code, name: `${cfg.name} (${pct})`, qty: `${cant} hrs`, value: val });
            }
          });
        }
      });

      // Vacaciones
      if (earn.vacations) {
        const com = earn.vacations.common || earn.vacations.enjoyed;
        if (com) {
          const val = parseFloat(com.payment || 0);
          const cant = com.amount || '—';
          if (val > 0) devengos.push({ code: '085', name: 'Vacaciones Disfrutadas / Comunes', qty: `${cant} días`, value: val });
        }
        const paid = earn.vacations.paid || earn.vacations.compensated;
        if (paid) {
          const val = parseFloat(paid.payment || 0);
          const cant = paid.amount || '—';
          if (val > 0) devengos.push({ code: '086', name: 'Vacaciones Compensadas', qty: `${cant} días`, value: val });
        }
      }

      // Prima de Servicios
      const prima = earn.bonus || earn.service_bonus;
      if (prima) {
        const pObj = Array.isArray(prima) ? prima[0] : prima;
        const val = parseFloat(pObj?.payment || 0);
        const cant = pObj?.amount || '';
        if (val > 0) devengos.push({ code: '080', name: 'Prima de Servicios (Pagada)', qty: cant ? `${cant} días` : '—', value: val });
      }

      // Cesantías e Intereses de Cesantías
      const ces = earn.cesantias || earn.severance;
      if (ces) {
        const cObj = Array.isArray(ces) ? ces[0] : ces;
        const valP = parseFloat(cObj?.payment || 0);
        const valInt = parseFloat(cObj?.interest_payment || cObj?.payment_interest || 0);
        const pct = cObj?.percentage || '12.00';
        if (valP > 0) devengos.push({ code: '090', name: 'Cesantías Pagadas', qty: '—', value: valP });
        if (valInt > 0) devengos.push({ code: '091', name: 'Intereses a las Cesantías Pagados', qty: `${pct}%`, value: valInt });
      }

      // Incapacidades
      const incList = earn.work_disabilities || earn.incapacity;
      if (Array.isArray(incList)) {
        incList.forEach(inc => {
          const val = parseFloat(inc.payment || 0);
          const cant = inc.amount || '1';
          const tipo = String(inc.type || inc.type_id || '1');
          const tipoLabel = tipo === '1' ? 'Común' : (tipo === '2' ? 'Profesional' : 'Laboral');
          if (val > 0) devengos.push({ code: '120', name: `Incapacidad (${tipoLabel})`, qty: `${cant} días`, value: val });
        });
      }

      // Licencias
      const licMP = earn.maternities || (earn.licenses && [earn.licenses.licenseMP].filter(Boolean));
      if (Array.isArray(licMP)) {
        licMP.forEach(lic => {
          const val = parseFloat(lic.payment || 0);
          if (val > 0) devengos.push({ code: '131', name: 'Licencia Maternidad / Paternidad', qty: `${lic.amount || 1} días`, value: val });
        });
      }
      const licR = earn.paid_leaves || (earn.licenses && [earn.licenses.licenseR].filter(Boolean));
      if (Array.isArray(licR)) {
        licR.forEach(lic => {
          const val = parseFloat(lic.payment || 0);
          if (val > 0) devengos.push({ code: '130', name: 'Licencia Remunerada', qty: `${lic.amount || 1} días`, value: val });
        });
      }
      const licNR = earn.non_paid_leaves || (earn.licenses && [earn.licenses.licenseNR].filter(Boolean));
      if (Array.isArray(licNR)) {
        licNR.forEach(lic => {
          devengos.push({ code: '132', name: 'Licencia No Remunerada', qty: `${lic.amount || 1} días`, value: 0 });
        });
      }

      // Bonificaciones
      if (Array.isArray(earn.bonuses)) {
        earn.bonuses.forEach(b => {
          const valS = parseFloat(b.salary_bonus || b.bonusS || 0);
          const valNS = parseFloat(b.non_salary_bonus || b.bonusNS || 0);
          if (valS > 0) devengos.push({ code: '060', name: 'Bonificación Salarial', qty: '—', value: valS });
          if (valNS > 0) devengos.push({ code: '061', name: 'Bonificación No Salarial', qty: '—', value: valNS });
        });
      }

      // Auxilios (aid o assistances: alias)
      const auxList = earn.aid || earn.assistances;
      if (Array.isArray(auxList)) {
        auxList.forEach(a => {
          const valS = parseFloat(a.salary_assistance || a.assistanceS || 0);
          const valNS = parseFloat(a.non_salary_assistance || a.assistanceNS || 0);
          if (valS > 0) devengos.push({ code: '070', name: 'Auxilio Salarial', qty: '—', value: valS });
          if (valNS > 0) devengos.push({ code: '071', name: 'Auxilio No Salarial', qty: '—', value: valNS });
        });
      }

      // Comisiones
      if (Array.isArray(earn.commissions)) {
        earn.commissions.forEach(c => {
          const val = parseFloat(c.commission || c.payment || 0);
          if (val > 0) devengos.push({ code: '050', name: 'Comisiones', qty: '—', value: val });
        });
      }

      // Otros conceptos
      if (Array.isArray(earn.other_concepts)) {
        earn.other_concepts.forEach(oc => {
          const cS = parseFloat(oc.conceptS || oc.salary_concept || 0);
          const cNS = parseFloat(oc.conceptNS || oc.non_salary_concept || 0);
          const desc = oc.description || oc.concept_description || 'Otros Devengados';
          if (cS > 0) devengos.push({ code: '190', name: `${desc} (Salarial)`, qty: '—', value: cS });
          if (cNS > 0) devengos.push({ code: '191', name: `${desc} (No Salarial)`, qty: '—', value: cNS });
        });
      }

      // Compensaciones
      if (Array.isArray(earn.compensations)) {
        earn.compensations.forEach(comp => {
          const ord = parseFloat(comp.ordinary_compensation || 0);
          const ext = parseFloat(comp.extraordinary_compensation || 0);
          if (ord > 0) devengos.push({ code: '160', name: 'Compensación Ordinaria', qty: '—', value: ord });
          if (ext > 0) devengos.push({ code: '161', name: 'Compensación Extraordinaria', qty: '—', value: ext });
        });
      }

      // Bonos canasta / EPCTV
      const bondList = earn.bondEPCTVs || earn.vouchers;
      if (Array.isArray(bondList)) {
        bondList.forEach(b => {
          const val = parseFloat(b.paymentNS || b.paymentS || b.payment || 0);
          if (val > 0) devengos.push({ code: '165', name: 'Bono de Alimentación / Canasta', qty: '—', value: val });
        });
      }

      // ── DEDUCCIONES ──
      const ded = j.deductions || {};
      const saludObj = ded.health || ded.eps_type;
      if (saludObj) {
        const val = parseFloat(saludObj.deduction || 0);
        const pct = saludObj.percentage || '4.00';
        if (val > 0) deducciones.push({ code: '201', name: 'Salud (Aporte Trabajador)', qty: `${pct}%`, value: val });
      }

      const pensionObj = ded.pension_fund || ded.pension_type;
      if (pensionObj) {
        const val = parseFloat(pensionObj.deduction || 0);
        const pct = pensionObj.percentage || '4.00';
        if (val > 0) deducciones.push({ code: '202', name: 'Fondo Pensión (Aporte Trabajador)', qty: `${pct}%`, value: val });
      }

      const fspObj = ded.fundSP || ded.deduction_sp;
      if (fspObj) {
        const valSP = parseFloat(fspObj.deduction || fspObj.deduction_sp || 0);
        const valSub = parseFloat(fspObj.deductionSub || 0);
        const pct = fspObj.percentage || '1.00';
        if (valSP > 0) deducciones.push({ code: '203', name: 'Fondo de Solidaridad Pensional', qty: `${pct}%`, value: valSP });
        if (valSub > 0) deducciones.push({ code: '204', name: 'Fondo de Subsistencia Pensional', qty: '—', value: valSub });
      }

      if (Array.isArray(ded.trade_union)) {
        ded.trade_union.forEach(s => {
          const val = parseFloat(s.deduction || 0);
          const pct = s.percentage ? `${s.percentage}%` : '—';
          if (val > 0) deducciones.push({ code: '210', name: 'Cuota Sindical', qty: pct, value: val });
        });
      }

      if (Array.isArray(ded.sanctions)) {
        ded.sanctions.forEach(s => {
          const pub = parseFloat(s.sanctionPublic || s.public_sanction || 0);
          const priv = parseFloat(s.sanctionPriv || s.private_sanction || 0);
          const val = pub + priv;
          if (val > 0) deducciones.push({ code: '220', name: 'Sanciones Disciplinarias', qty: '—', value: val });
        });
      }

      if (Array.isArray(ded.libranzas)) {
        ded.libranzas.forEach(l => {
          const val = parseFloat(l.deduction || 0);
          const desc = l.description || 'Libranza';
          if (val > 0) deducciones.push({ code: '230', name: `Libranza (${desc})`, qty: '—', value: val });
        });
      }

      if (Array.isArray(ded.advances)) {
        ded.advances.forEach(a => {
          const val = parseFloat(a.advance || a.deduction || 0);
          if (val > 0) deducciones.push({ code: '235', name: 'Anticipos de Nómina', qty: '—', value: val });
        });
      }

      const retVal = parseFloat(ded.retefuente || ded.withholding_at_source || 0);
      if (retVal > 0) deducciones.push({ code: '240', name: 'Retención en la Fuente', qty: '—', value: retVal });

      if (Array.isArray(ded.other_deductions)) {
        ded.other_deductions.forEach(od => {
          const val = parseFloat(od.other_deduction || od.deduction || 0);
          const desc = od.description || 'Otras Deducciones';
          if (val > 0) deducciones.push({ code: '290', name: desc, qty: '—', value: val });
        });
      }

      return { devengos, deducciones };
    } catch (e) {
      console.error(e);
    }
  }

  return { devengos, deducciones };
}

db.get("SELECT xml_generado FROM electronic_payrolls WHERE consecutivo = 7 AND prefijo = 'NANE'", (err, row) => {
  const res = parseNominaXmlConcepts(row.xml_generado);
  console.log("NANE-7 Devengos:\n", res.devengos);
  console.log("NANE-7 Deducciones:\n", res.deducciones);
  const sDev = res.devengos.reduce((a, b) => a + b.value, 0);
  const sDed = res.deducciones.reduce((a, b) => a + b.value, 0);
  console.log("Sum Devengos:", sDev);
  console.log("Sum Deducciones:", sDed);
  console.log("Neto:", sDev - sDed);
  db.close();
});
