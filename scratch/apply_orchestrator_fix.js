const fs = require('fs');

const file = 'hub/orchestrator.js';
let content = fs.readFileSync(file, 'utf8');

const startMarker = 'function generateNominaPdf(xmlContent, filename, payrollData) {';
const endMarker = 'app.post(\'/api/dian/download-zip\', async (req, res) => {';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found! startIndex:", startIndex, "endIndex:", endIndex);
  process.exit(1);
}

const replacement = `function generateNominaPdf(xmlContent, filename, payrollData) {
  return new Promise(async (resolve, reject) => {
    try {
      let xml = String(xmlContent || '');
      let jsonObj = null;
      if (xml.trim().startsWith('{')) {
        try { jsonObj = JSON.parse(xml); } catch (_) {}
      } else if (xml.startsWith('PD94bWwg') || (!xml.includes('<') && !xml.trim().startsWith('{') && xml.length > 50)) {
        try {
          const dec = Buffer.from(xml, 'base64').toString('utf8');
          if (dec.includes('<') || dec.trim().startsWith('{')) {
            xml = dec;
            if (xml.trim().startsWith('{')) {
              try { jsonObj = JSON.parse(xml); } catch (_) {}
            }
          }
        } catch (_) {}
      }

      const pData = payrollData || {};
      const doc = new PDFDocument({ margin: 30, size: 'LETTER' });
      const buffers = [];
      doc.on('data', b => buffers.push(b));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const fmt = (n) => '$ ' + Math.round(Number(n) || 0).toLocaleString('es-CO');

      function formatNumeroALetras(num) {
        const tempNum = parseFloat(String(num || 0)).toFixed(2).split('.');
        const entero = parseInt(tempNum[0], 10);
        const centavos = tempNum[1];
        if (entero === 0) return 'CERO PESOS M/CTE CON ' + centavos + '/100';

        function letras(n) {
          if (n < 10) return ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'][n];
          if (n < 20) return ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'][n - 10];
          if (n < 30) return n === 20 ? 'Veinte' : 'Veinti' + letras(n - 20).toLowerCase();
          if (n < 100) {
            const u = n % 10;
            const d = Math.floor(n / 10);
            const decenas = ['', '', '', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
            return decenas[d] + (u > 0 ? ' y ' + letras(u).toLowerCase() : '');
          }
          if (n < 1000) {
            const d_u = n % 100;
            const c = Math.floor(n / 100);
            const centenas = ['', 'Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
            if (n === 100) return 'Cien';
            if (c === 1) return 'Ciento ' + letras(d_u).toLowerCase();
            return centenas[c] + (d_u > 0 ? ' ' + letras(d_u).toLowerCase() : '');
          }
          if (n < 1000000) {
            const mil = Math.floor(n / 1000);
            const resto = n % 1000;
            const t = mil === 1 ? 'Mil' : letras(mil) + ' mil';
            return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
          }
          if (n < 1000000000) {
            const millon = Math.floor(n / 1000000);
            const resto = n % 1000000;
            const t = millon === 1 ? 'Un millón' : letras(millon) + ' millones';
            return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
          }
          return String(n);
        }

        return (letras(entero) + ' PESOS M/CTE CON ' + centavos + '/100').toUpperCase();
      }

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
              if (val > 0) devengos.push({ code: '001', name: 'Sueldo Básico', qty: \`\${days} días\`, value: val });
            }

            // Auxilio de Transporte y Viáticos
            const tr = earn.transport || earn.transportation;
            if (tr) {
              const trObj = Array.isArray(tr) ? tr[0] : tr;
              const valAux = parseFloat(trObj?.transportation_assistance || trObj?.transport_assistance || 0);
              if (valAux > 0) devengos.push({ code: '040', name: 'Auxilio de Transporte', qty: \`\${timeWorked} días\`, value: valAux });
              const valViatS = parseFloat(trObj?.viatic_maintenance || trObj?.viatic_salary_maintenance || 0);
              if (valViatS > 0) devengos.push({ code: '041', name: 'Viáticos Salariales', qty: '—', value: valViatS });
              const valViatNS = parseFloat(trObj?.viatic_non_salary_maintenance || 0);
              if (valViatNS > 0) devengos.push({ code: '042', name: 'Viáticos No Salariales', qty: '—', value: valViatNS });
            }

            // Horas Extras y Recargos
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
                    const pct = it.percentage ? \`\${it.percentage}%\` : cfg.defaultPct;
                    devengos.push({ code: cfg.code, name: \`\${cfg.name} (\${pct})\`, qty: \`\${cant} hrs\`, value: val });
                  }
                });
              }
            });

            // Vacaciones (comunes o compensadas)
            if (earn.vacations) {
              const com = earn.vacations.common || earn.vacations.enjoyed;
              if (com) {
                const val = parseFloat(com.payment || 0);
                const cant = com.amount || '—';
                if (val > 0) devengos.push({ code: '085', name: 'Vacaciones Disfrutadas / Comunes', qty: \`\${cant} días\`, value: val });
              }
              const paid = earn.vacations.paid || earn.vacations.compensated;
              if (paid) {
                const val = parseFloat(paid.payment || 0);
                const cant = paid.amount || '—';
                if (val > 0) devengos.push({ code: '086', name: 'Vacaciones Compensadas', qty: \`\${cant} días\`, value: val });
              }
            }

            // Prima de Servicios
            const prima = earn.bonus || earn.service_bonus;
            if (prima) {
              const pObj = Array.isArray(prima) ? prima[0] : prima;
              const val = parseFloat(pObj?.payment || 0);
              const cant = pObj?.amount || '';
              if (val > 0) devengos.push({ code: '080', name: 'Prima de Servicios (Pagada)', qty: cant ? \`\${cant} días\` : '—', value: val });
              const valNS = parseFloat(pObj?.non_salary_payment || 0);
              if (valNS > 0) devengos.push({ code: '081', name: 'Prima de Servicios (No Salarial)', qty: '—', value: valNS });
            }

            // Cesantías e Intereses de Cesantías
            const ces = earn.cesantias || earn.severance;
            if (ces) {
              const cObj = Array.isArray(ces) ? ces[0] : ces;
              const valP = parseFloat(cObj?.payment || 0);
              const valInt = parseFloat(cObj?.interest_payment || cObj?.payment_interest || 0);
              const pct = cObj?.percentage || '12.00';
              if (valP > 0) devengos.push({ code: '090', name: 'Cesantías Pagadas', qty: '—', value: valP });
              if (valInt > 0) devengos.push({ code: '091', name: 'Intereses a las Cesantías Pagados', qty: \`\${pct}%\`, value: valInt });
            }

            // Incapacidades
            const incList = earn.work_disabilities || earn.incapacity;
            if (Array.isArray(incList)) {
              incList.forEach(inc => {
                const val = parseFloat(inc.payment || 0);
                const cant = inc.amount || '1';
                const tipo = String(inc.type || inc.type_id || '1');
                const tipoLabel = tipo === '1' ? 'Común' : (tipo === '2' ? 'Profesional' : 'Laboral');
                if (val > 0) devengos.push({ code: '120', name: \`Incapacidad (\${tipoLabel})\`, qty: \`\${cant} días\`, value: val });
              });
            }

            // Licencias
            const licMP = earn.maternities || (earn.licenses && [earn.licenses.licenseMP].filter(Boolean));
            if (Array.isArray(licMP)) {
              licMP.forEach(lic => {
                const val = parseFloat(lic.payment || 0);
                if (val > 0) devengos.push({ code: '131', name: 'Licencia Maternidad / Paternidad', qty: \`\${lic.amount || 1} días\`, value: val });
              });
            }
            const licR = earn.paid_leaves || (earn.licenses && [earn.licenses.licenseR].filter(Boolean));
            if (Array.isArray(licR)) {
              licR.forEach(lic => {
                const val = parseFloat(lic.payment || 0);
                if (val > 0) devengos.push({ code: '130', name: 'Licencia Remunerada', qty: \`\${lic.amount || 1} días\`, value: val });
              });
            }
            const licNR = earn.non_paid_leaves || (earn.licenses && [earn.licenses.licenseNR].filter(Boolean));
            if (Array.isArray(licNR)) {
              licNR.forEach(lic => {
                devengos.push({ code: '132', name: 'Licencia No Remunerada', qty: \`\${lic.amount || 1} días\`, value: 0 });
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

            // Dotación
            if (earn.endowment) {
              const val = parseFloat(earn.endowment);
              if (val > 0) devengos.push({ code: '140', name: 'Dotación', qty: '—', value: val });
            }

            // Otros conceptos
            if (Array.isArray(earn.other_concepts)) {
              earn.other_concepts.forEach(oc => {
                const cS = parseFloat(oc.conceptS || oc.salary_concept || 0);
                const cNS = parseFloat(oc.conceptNS || oc.non_salary_concept || 0);
                const desc = oc.description || oc.concept_description || 'Otros Devengados';
                if (cS > 0) devengos.push({ code: '190', name: \`\${desc} (Salarial)\`, qty: '—', value: cS });
                if (cNS > 0) devengos.push({ code: '191', name: \`\${desc} (No Salarial)\`, qty: '—', value: cNS });
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
              if (val > 0) deducciones.push({ code: '201', name: 'Salud (Aporte Trabajador)', qty: \`\${pct}%\`, value: val });
            }

            const pensionObj = ded.pension_fund || ded.pension_type;
            if (pensionObj) {
              const val = parseFloat(pensionObj.deduction || 0);
              const pct = pensionObj.percentage || '4.00';
              if (val > 0) deducciones.push({ code: '202', name: 'Fondo Pensión (Aporte Trabajador)', qty: \`\${pct}%\`, value: val });
            }

            const fspObj = ded.fundSP || ded.deduction_sp;
            if (fspObj) {
              const valSP = parseFloat(fspObj.deduction || fspObj.deduction_sp || 0);
              const valSub = parseFloat(fspObj.deductionSub || 0);
              const pct = fspObj.percentage || '1.00';
              if (valSP > 0) deducciones.push({ code: '203', name: 'Fondo de Solidaridad Pensional', qty: \`\${pct}%\`, value: valSP });
              if (valSub > 0) deducciones.push({ code: '204', name: 'Fondo de Subsistencia Pensional', qty: '—', value: valSub });
            }

            if (Array.isArray(ded.trade_union)) {
              ded.trade_union.forEach(s => {
                const val = parseFloat(s.deduction || 0);
                const pct = s.percentage ? \`\${s.percentage}%\` : '—';
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
                if (val > 0) deducciones.push({ code: '230', name: \`Libranza (\${desc})\`, qty: '—', value: val });
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
          } catch (_) {}
        }

        const getAttr = (str, attr) => {
          const m = str ? str.match(new RegExp(\`\${attr}="([^"]*)"\`, 'i')) : null;
          return m ? m[1] : '';
        };

        // Basico
        const mBasico = xmlStr.match(/<Basico\\s+([^>]+)\\/>/i);
        if (mBasico) {
          const dias = getAttr(mBasico[1], 'DiasTrabajados') || '30';
          const val = parseFloat(getAttr(mBasico[1], 'SueldoTrabajado') || '0');
          if (val > 0) devengos.push({ code: '001', name: 'Sueldo Básico', qty: \`\${dias} días\`, value: val });
        }

        // Transporte
        const mTrans = xmlStr.match(/<Transporte\\s+([^>]+)\\/>/i);
        if (mTrans) {
          const aux = parseFloat(getAttr(mTrans[1], 'AuxilioTransporte') || '0');
          if (aux > 0) devengos.push({ code: '040', name: 'Auxilio de Transporte', qty: '30 días', value: aux });
        }

        // OtrosConceptos / OtroConcepto
        const ocRegex = /<OtroConcepto\\s+([^>]+)\\/>/gi;
        let ocMatch;
        while ((ocMatch = ocRegex.exec(xmlStr)) !== null) {
          const attrs = ocMatch[1];
          const desc = getAttr(attrs, 'DescripcionConcepto') || getAttr(attrs, 'Conceptoo') || getAttr(attrs, 'Descripcion') || 'Otros Devengados y Auxilios';
          const cNS = parseFloat(getAttr(attrs, 'ConceptoNS') || getAttr(attrs, 'PagoNS') || '0');
          const cS = parseFloat(getAttr(attrs, 'ConceptoS') || getAttr(attrs, 'PagoS') || '0');
          if (cS > 0) devengos.push({ code: '190', name: \`\${desc} (Salarial)\`, qty: '—', value: cS });
          if (cNS > 0) devengos.push({ code: '191', name: \`\${desc} (No Salarial)\`, qty: '—', value: cNS });
        }

        // Horas extras
        const heRegex = /<(HED|HEN|HRD|HRN|HEDDF|HENDF|HRDDF|HRNDDF)\\s+([^>]+)\\/>/gi;
        let heMatch;
        const heNames = {
          'HED': 'Hora Extra Diurna (25%)', 'HEN': 'Hora Extra Nocturna (75%)',
          'HRD': 'Recargo Diurno Festivo (75%)', 'HRN': 'Recargo Nocturno (35%)',
          'HEDDF': 'Hora Extra Diurna Dominical/Festiva (100%)', 'HENDF': 'Hora Extra Nocturna Dominical/Festiva (150%)',
          'HRDDF': 'Recargo Diurno Dominical/Festivo (75%)', 'HRNDDF': 'Recargo Nocturno Dominical/Festivo (110%)'
        };
        while ((heMatch = heRegex.exec(xmlStr)) !== null) {
          const tag = heMatch[1].toUpperCase();
          const attrs = heMatch[2];
          const cant = getAttr(attrs, 'Cantidad');
          const pago = parseFloat(getAttr(attrs, 'Pago') || '0');
          if (pago > 0) devengos.push({ code: '101', name: heNames[tag] || tag, qty: \`\${cant} hrs\`, value: pago });
        }

        // Vacaciones / Primas / Cesantías
        const mVac = xmlStr.match(/<VacacionesComunes\\s+([^>]+)\\/>/i);
        if (mVac) {
          const d = getAttr(mVac[1], 'Cantidad');
          const v = parseFloat(getAttr(mVac[1], 'Pago') || '0');
          if (v > 0) devengos.push({ code: '085', name: 'Vacaciones Disfrutadas / Comunes', qty: \`\${d} días\`, value: v });
        }
        const mVacComp = xmlStr.match(/<VacacionesCompensadas\\s+([^>]+)\\/>/i);
        if (mVacComp) {
          const d = getAttr(mVacComp[1], 'Cantidad');
          const v = parseFloat(getAttr(mVacComp[1], 'Pago') || '0');
          if (v > 0) devengos.push({ code: '086', name: 'Vacaciones Compensadas', qty: \`\${d} días\`, value: v });
        }
        const mPrima = xmlStr.match(/<Primas\\s+([^>]+)\\/>/i);
        if (mPrima) {
          const v = parseFloat(getAttr(mPrima[1], 'Pago') || '0');
          if (v > 0) devengos.push({ code: '080', name: 'Prima de Servicios (Pagada)', qty: '—', value: v });
        }
        const mCes = xmlStr.match(/<Cesantias\\s+([^>]+)\\/>/i);
        if (mCes) {
          const v = parseFloat(getAttr(mCes[1], 'Pago') || '0');
          if (v > 0) devengos.push({ code: '090', name: 'Cesantías Pagadas', qty: '—', value: v });
          const vInt = parseFloat(getAttr(mCes[1], 'PagoIntereses') || '0');
          const pctInt = getAttr(mCes[1], 'Porcentaje') || '12.00';
          if (vInt > 0) devengos.push({ code: '091', name: 'Intereses a las Cesantías Pagados', qty: \`\${pctInt}%\`, value: vInt });
        }

        // Deducciones: Salud
        const mSalud = xmlStr.match(/<Salud\\s+([^>]+)\\/>/i);
        if (mSalud) {
          const ded = parseFloat(getAttr(mSalud[1], 'Deduccion') || '0');
          const pct = getAttr(mSalud[1], 'Porcentaje') || '4.00';
          if (ded > 0) deducciones.push({ code: '201', name: 'Salud (Aporte Trabajador)', qty: \`\${pct}%\`, value: ded });
        }

        // Pensión
        const mPension = xmlStr.match(/<FondoPension\\s+([^>]+)\\/>/i);
        if (mPension) {
          const ded = parseFloat(getAttr(mPension[1], 'Deduccion') || '0');
          const pct = getAttr(mPension[1], 'Porcentaje') || '4.00';
          if (ded > 0) deducciones.push({ code: '202', name: 'Pensión (Aporte Trabajador)', qty: \`\${pct}%\`, value: ded });
        }

        // Fondo SP
        const mFsp = xmlStr.match(/<FondoSP\\s+([^>]+)\\/>/i);
        if (mFsp) {
          const ded = parseFloat(getAttr(mFsp[1], 'DeduccionSP') || getAttr(mFsp[1], 'Deduccion') || '0');
          if (ded > 0) deducciones.push({ code: '203', name: 'Fondo Solidaridad Pensional', qty: '1%', value: ded });
          const dedSub = parseFloat(getAttr(mFsp[1], 'DeduccionSub') || '0');
          if (dedSub > 0) deducciones.push({ code: '204', name: 'Fondo Subsistencia Pensional', qty: '—', value: dedSub });
        }

        // Retención en la Fuente
        const mRet = xmlStr.match(/<RetencionFuente>([^<]+)<\\/RetencionFuente>/i);
        if (mRet) {
          const ded = parseFloat(mRet[1] || '0');
          if (ded > 0) deducciones.push({ code: '240', name: 'Retención en la Fuente', qty: '—', value: ded });
        }

        // Libranzas
        const libRegex = /<Libranza\\s+([^>]+)\\/>/gi;
        let libMatch;
        while ((libMatch = libRegex.exec(xmlStr)) !== null) {
          const attrs = libMatch[1];
          const ded = parseFloat(getAttr(attrs, 'Deduccion') || '0');
          const desc = getAttr(attrs, 'Descripcion') || 'Libranza';
          if (ded > 0) deducciones.push({ code: '230', name: \`Libranza (\${desc})\`, qty: '—', value: ded });
        }

        // Anticipos
        const antRegex = /<Anticipo>([^<]+)<\\/Anticipo>/gi;
        let antMatch;
        while ((antMatch = antRegex.exec(xmlStr)) !== null) {
          const ded = parseFloat(antMatch[1] || '0');
          if (ded > 0) deducciones.push({ code: '235', name: 'Anticipos de Nómina', qty: '—', value: ded });
        }

        return { devengos, deducciones };
      }

      const isDelete = (jsonObj && (jsonObj.payroll_type === 'delete' || (jsonObj.type_xml_id === 103 && jsonObj.deleting_predecessor))) || xml.includes('Eliminar') || xml.includes('TipoNota="2"') || (pData && pData.payrollType === 'delete');
      const isReplace = !isDelete && ((jsonObj && (jsonObj.payroll_type === 'replace' || jsonObj.replacing_predecessor || jsonObj.relevant_predecessor)) || xml.includes('Reemplazar') || xml.includes('TipoNota="1"'));
      const isAjuste = isDelete || isReplace || xml.includes('NominaIndividualDeAjuste') || xml.includes('TipoXML="103"') || String(filename || '').toUpperCase().startsWith('NAN');

      let docTitle = 'Documento Soporte de Pago de Nómina Electrónica';
      if (isDelete) {
        docTitle = 'Nota de Ajuste de Nómina Electrónica — Eliminación (Tipo 2)';
      } else if (isReplace) {
        docTitle = 'Nota de Ajuste de Nómina Electrónica — Reemplazo (Tipo 1)';
      } else if (isAjuste) {
        docTitle = 'Nota de Ajuste de Nómina Electrónica';
      }

      const getAttr = (tagRegex, attr) => {
        const m = xml.match(tagRegex);
        if (!m) return '';
        const mAttr = m[1].match(new RegExp(\`\${attr}="([^"]*)"\`, 'i'));
        return mAttr ? mAttr[1] : '';
      };

      const pred = jsonObj?.deleting_predecessor || jsonObj?.replacing_predecessor || jsonObj?.relevant_predecessor || {};
      const predNum = pred.number || pred.document_number || getAttr(/<(Predecesor|Eliminar|Reemplazar)\\s+([^>]+)\\/>/i, 'NumeroPred') || pData.predecessorNumber || '';
      const predCune = pred.cune || getAttr(/<(Predecesor|Eliminar|Reemplazar)\\s+([^>]+)\\/>/i, 'CUNEPred') || pData.predecessorCune || '';
      const predDate = pred.generation_date || getAttr(/<(Predecesor|Eliminar|Reemplazar)\\s+([^>]+)\\/>/i, 'FechaGenPred') || pData.predecessorDate || '';

      const razonSocial = getAttr(/<Empleador\\s+([^>]+)\\/>/i, 'RazonSocial') || jsonObj?.company?.company_name || pData.companyName || 'EMPRESA';
      const nitEmp = getAttr(/<Empleador\\s+([^>]+)\\/>/i, 'NIT') || jsonObj?.company?.identification_number || pData.companyNit || '';
      const dvEmp = getAttr(/<Empleador\\s+([^>]+)\\/>/i, 'DV') || jsonObj?.company?.dv || '0';
      const nitCompleto = dvEmp ? \`\${nitEmp}-\${dvEmp}\` : nitEmp;

      const fIngreso = getAttr(/<Periodo\\s+([^>]+)\\/>/i, 'FechaIngreso') || jsonObj?.period?.date_entry || pData.dateHired || pData.startDate || pData.fIngreso || '—';
      const fRetiroRaw = getAttr(/<Periodo\\s+([^>]+)\\/>/i, 'FechaRetiro') || jsonObj?.period?.departure_date || pData.dateEnd || pData.retirementDate || pData.endDate || pData.fRetiro || '';
      const fRetiro = fRetiroRaw ? \`\${fRetiroRaw} (Cese de Contrato)\` : 'Vigente (Sin Retiro)';

      let fLiqInicio = getAttr(/<Periodo\\s+([^>]+)\\/>/i, 'FechaLiquidacionInicio') || jsonObj?.period?.settlement_start_date || pData.settlementStartDate || pData.fLiqInicio || '';
      let fLiqFin = getAttr(/<Periodo\\s+([^>]+)\\/>/i, 'FechaLiquidacionFin') || jsonObj?.period?.settlement_end_date || pData.settlementEndDate || pData.fLiqFin || '';

      if (!fLiqInicio || fLiqInicio === '—') {
        if (pData.ano && pData.mes) {
          const mStr = String(pData.mes).padStart(2, '0');
          const lastDay = new Date(pData.ano, pData.mes, 0).getDate();
          fLiqInicio = \`\${pData.ano}-\${mStr}-01\`;
          fLiqFin = \`\${pData.ano}-\${mStr}-\${String(lastDay).padStart(2, '0')}\`;
        } else if (predDate && predDate.length >= 7) {
          const parts = predDate.split('-');
          fLiqInicio = \`\${parts[0]}-\${parts[1]}-01\`;
          fLiqFin = \`\${parts[0]}-\${parts[1]}-30\`;
        }
      }
      if (!fLiqInicio) fLiqInicio = '—';
      if (!fLiqFin) fLiqFin = '—';

      const numSec = filename || (getAttr(/<NumeroSecuenciaXML\\s+([^>]+)\\/>/i, 'Numero')) || (jsonObj ? \`\${jsonObj.prefix || 'NOM'}-\${jsonObj.document_number || '1'}\` : 'NOM');
      const fEmision = getAttr(/<InformacionGeneral\\s+([^>]+)\\/>/i, 'FechaGen')
        ? \`\${getAttr(/<InformacionGeneral\\s+([^>]+)\\/>/i, 'FechaGen')} \${getAttr(/<InformacionGeneral\\s+([^>]+)\\/>/i, 'HoraGen') || ''}\`.trim()
        : (jsonObj?.general_information?.generation_date ? \`\${jsonObj.general_information.generation_date} \${jsonObj.general_information.generation_time || ''}\`.trim() : (pData.issueDate || new Date().toISOString().slice(0, 10)));

      const xmlEmpName = [
        getAttr(/<Trabajador\\s+([^>]+)\\/>/i, 'PrimerNombre'),
        getAttr(/<Trabajador\\s+([^>]+)\\/>/i, 'SegundoNombre'),
        getAttr(/<Trabajador\\s+([^>]+)\\/>/i, 'PrimerApellido'),
        getAttr(/<Trabajador\\s+([^>]+)\\/>/i, 'SegundoApellido')
      ].filter(Boolean).join(' ');
      const jsonEmpName = jsonObj?.employee ? [jsonObj.employee.first_name, jsonObj.employee.other_names, jsonObj.employee.first_surname, jsonObj.employee.second_surname].filter(Boolean).join(' ') : '';
      const empName = xmlEmpName || jsonEmpName || pData.empName || 'Colaborador';

      const empDoc = getAttr(/<Trabajador\\s+([^>]+)\\/>/i, 'NumeroDocumento') || jsonObj?.employee?.document_number || pData.empDoc || '—';
      const empAddress = getAttr(/<Trabajador\\s+([^>]+)\\/>/i, 'LugarTrabajoDireccion') || jsonObj?.employee?.work_address || pData.empAddress || '—';
      const empCityDept = pData.empCityDept || '—';
      const empPhone = pData.empPhone || '—';
      const empEmail = pData.empEmail || '—';

      const cargo = pData.cargo || 'Colaborador';
      const centroCostos = pData.costCenter || 'General / Colaboradores';
      const sueldoBase = parseFloat(getAttr(/<Trabajador\\s+([^>]+)\\/>/i, 'Sueldo') || jsonObj?.employee?.salary || pData.basicSalary || 0);

      const banco = getAttr(/<Pago\\s+([^>]+)\\/>/i, 'Banco') || jsonObj?.payment?.bank || jsonObj?.payment?.bank_name || pData.bankName || 'Banco';
      const tipoCta = getAttr(/<Pago\\s+([^>]+)\\/>/i, 'TipoCuenta') || jsonObj?.payment?.account_type || pData.bankAccountType || 'Ahorros';
      const numCta = getAttr(/<Pago\\s+([^>]+)\\/>/i, 'NumeroCuenta') || jsonObj?.payment?.account_number || pData.bankAccount || '';
      const ctaLabel = numCta ? \`\${banco} · \${tipoCta}: \${numCta}\` : 'Efectivo / Sin cuenta';
      function formatPaymentMethod(m) {
        const str = String(m || '').trim();
        const code = (str.match(/\\d+/) || [str])[0];
        const methods = {
          '10': '10 - Efectivo',
          '42': '42 - Consignación Bancaria',
          '30': '30 - Transferencia ACH',
          '47': '47 - Transferencia Débito Bancaria',
          '20': '20 - Cheque',
          '48': '48 - Tarjeta Crédito',
          '49': '49 - Tarjeta Débito',
          '1': '01 - Instrumento no definido'
        };
        if (methods[code]) return methods[code];
        if (str.length > 3) return str;
        return str ? \`\${str} - Transferencia Bancaria\` : '42 - Consignación Bancaria';
      }
      const metodoPago = formatPaymentMethod(pData.paymentMethod || getAttr(/<Pago\\s+([^>]+)\\/>/i, 'Metodo') || jsonObj?.payment?.means_payment_id || '42');

      const epsLabel = pData.healthEntity || 'No asignada';
      const afpLabel = pData.pensionEntity || 'No asignada';
      const arlLabel = pData.arlEntity || 'No asignada';
      const cajaLabel = pData.cajaEntity || 'No asignada';
      const fechasPago = (xml.match(/<FechaPago>([^<]+)<\\/FechaPago>/i) || [])[1] || (jsonObj?.payment_dates && jsonObj.payment_dates[0]) || fLiqFin;

      const cune = getAttr(/<InformacionGeneral\\s+([^>]+)\\/>/i, 'CUNE') || jsonObj?.cune || (xml.match(/documentkey=([a-f0-9]{64,})/i) || [])[1] || pData.cune || '—';
      const firmaDigital = pData.digitalSignature || (cune && cune.length > 32 ? \`\${cune.slice(0, 32)}...\` : 'SMbWtszsoY4c35SftX23XLEjWd0w9oDxB/jkn9H3H0eb4kz3kccNtRuWUqia4Ygm...');

      // Totales oficiales
      let devTotal = 0;
      let dedTotal = 0;
      let netoTotal = 0;
      if (!isDelete) {
        devTotal = parseFloat((xml.match(/<DevengadosTotal>([^<]+)<\\/DevengadosTotal>/i) || [])[1] || jsonObj?.total_earned || pData.totalDevengos || 0);
        dedTotal = parseFloat((xml.match(/<DeduccionesTotal>([^<]+)<\\/DeduccionesTotal>/i) || [])[1] || jsonObj?.deductions_total || pData.totalDeducciones || 0);
        netoTotal = parseFloat((xml.match(/<ComprobanteTotal>([^<]+)<\\/ComprobanteTotal>/i) || [])[1] || jsonObj?.total_voucher || pData.totalNeto || (devTotal - dedTotal));
      }
      const valorEnLetras = isDelete
        ? 'CERO PESOS M/CTE (DOCUMENTO DE ANULACIÓN TRIBUTARIA DIAN TIPO 2)'
        : (pData.valorEnLetras || formatNumeroALetras(netoTotal));

      const parsed = parseNominaXmlConcepts(xml);

      if (!isDelete) {
        // Verificación y balance de consistencia
        const sumDev = parsed.devengos.reduce((acc, x) => acc + x.value, 0);
        const diffDev = Math.round((devTotal - sumDev) * 100) / 100;
        if (Math.abs(diffDev) >= 0.01) {
          if (parsed.devengos.length === 0) {
            parsed.devengos.push({ code: '001', name: 'Sueldo Básico', qty: '30 días', value: devTotal });
          } else if (diffDev > 0) {
            parsed.devengos.push({ code: '099', name: 'Otros Devengados Período', qty: '—', value: diffDev });
          }
        }

        const sumDed = parsed.deducciones.reduce((acc, x) => acc + x.value, 0);
        const diffDed = Math.round((dedTotal - sumDed) * 100) / 100;
        if (Math.abs(diffDed) >= 0.01) {
          if (parsed.deducciones.length === 0 && dedTotal > 0) {
            parsed.deducciones.push({ code: '299', name: 'Deducciones de Nómina', qty: '—', value: dedTotal });
          } else if (diffDed > 0) {
            parsed.deducciones.push({ code: '299', name: 'Otras Deducciones Período', qty: '—', value: diffDed });
          }
        }
      }

      // QR Code Buffer
      const xmlQr = (xml.match(/<CodigoQR>([^<]+)<\\/CodigoQR>/i) || [])[1] || '';
      const qrData = xmlQr || jsonObj?.qrDian || jsonObj?.qrData || pData.qrData || \`NumFac=\${numSec}&FecFac=\${fEmision}&NitFac=\${nitEmp}&DocAdq=\${empDoc}&ValDev=\${devTotal}&ValDed=\${dedTotal}&ValTol=\${netoTotal}&CUFE=\${cune}\`;
      let qrBuffer = null;
      try {
        qrBuffer = await fetchQrCode(qrData);
      } catch (_) {}

      // Coordenadas fijas página Carta
      const margin = 30;
      const W = 612 - (margin * 2); // 552
      let y = margin;

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9.5).text(docTitle, margin, y);
      y += 14;

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(13).text(razonSocial, margin, y);
      y += 16;

      doc.fillColor('#333333').font('Helvetica').fontSize(8).text(\`NIT: \${nitCompleto}\`, margin, y);
      y += 11;

      doc.fillColor('#4B5563').font('Helvetica').fontSize(8).text(\`Periodo de pago: \${fLiqInicio} al \${fLiqFin}\`, margin, y);
      y += 11;

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text(\`Secuencia: \${numSec}\`, margin, y);
      y += 12;

      doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5).text(\`Fecha emisión: \${fEmision}\`, margin, y);

      // QR Code en la esquina superior derecha
      const qrSize = 64;
      const qrX = margin + W - qrSize;
      const qrY = margin;
      if (qrBuffer) {
        try {
          doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
        } catch (_) {
          doc.rect(qrX, qrY, qrSize, qrSize).lineWidth(0.5).strokeColor('#000000').stroke();
          doc.fillColor('#666666').font('Helvetica').fontSize(7).text('QR DIAN', qrX, qrY + 28, { width: qrSize, align: 'center' });
        }
      } else {
        doc.rect(qrX, qrY, qrSize, qrSize).lineWidth(0.5).strokeColor('#000000').stroke();
        doc.fillColor('#666666').font('Helvetica').fontSize(7).text('QR DIAN', qrX, qrY + 28, { width: qrSize, align: 'center' });
      }

      y = Math.max(y + 8, margin + qrSize + 8);

      // Línea divisoria
      doc.moveTo(margin, y).lineTo(margin + W, y).lineWidth(0.75).strokeColor('#000000').stroke();
      y += 6;

      // ── 2. FICHA EMPLEADO Y AFILIACIONES (8 FILAS COMPLEMENTARIAS) ──
      const colW1 = W * 0.16;
      const colW2 = W * 0.34;
      const colW3 = W * 0.18;
      const colW4 = W * 0.32;

      const metaRows = [
        [ 'Empleado:', empName, 'Identificación:', empDoc ],
        [ 'Dirección:', empAddress, 'Ciudad / Depto:', empCityDept ],
        [ 'Teléfono:', empPhone, 'Correo Electrónico:', empEmail ],
        [ 'Sueldo Base:', fmt(sueldoBase), 'Banco / Cuenta:', ctaLabel ],
        [ 'Fecha Ingreso:', fIngreso, 'Fecha Retiro:', fRetiro ],
        [ 'Método de Pago:', metodoPago, 'Fechas de Pago:', fechasPago ],
        [ 'Entidad Salud:', epsLabel, 'Entidad Pensión:', afpLabel ],
        [ 'Entidad ARL:', arlLabel, 'Entidad Caja:', cajaLabel ]
      ];

      const rowH = 13.5;
      metaRows.forEach((r) => {
        doc.rect(margin, y, colW1, rowH).fillAndStroke('#F9FAFB', '#D1D5DB');
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text(r[0], margin + 4, y + 3);

        doc.rect(margin + colW1, y, colW2, rowH).fillAndStroke('#FFFFFF', '#D1D5DB');
        doc.fillColor('#000000').font('Helvetica').fontSize(6.5).text(r[1], margin + colW1 + 4, y + 3, { width: colW2 - 8, lineBreak: false });

        doc.rect(margin + colW1 + colW2, y, colW3, rowH).fillAndStroke('#F9FAFB', '#D1D5DB');
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text(r[2], margin + colW1 + colW2 + 4, y + 3);

        doc.rect(margin + colW1 + colW2 + colW3, y, colW4, rowH).fillAndStroke('#FFFFFF', '#D1D5DB');
        doc.fillColor('#000000').font('Helvetica').fontSize(6.5).text(r[3], margin + colW1 + colW2 + colW3 + 4, y + 3, { width: colW4 - 8, lineBreak: false });

        y += rowH;
      });

      y += 8;

      if (isDelete) {
        // ── BLOQUE OFICIAL DE ANULACIÓN / ELIMINACIÓN TRIBUTARIA (TIPO 2) ──
        const blockH = 135;
        doc.rect(margin, y, W, blockH).fillAndStroke('#FFFBEB', '#D97706').lineWidth(1);

        doc.fillColor('#92400E').font('Helvetica-Bold').fontSize(9.5)
           .text('ACTA DE ANULACIÓN TRIBUTARIA — NOTA DE AJUSTE DE ELIMINACIÓN (TIPO 2)', margin + 10, y + 10, { width: W - 20, align: 'center' });

        doc.fillColor('#78350F').font('Helvetica').fontSize(7.5)
           .text('Resolución DIAN 000013 de 2021 | Anexo Técnico de Documento Soporte de Pago de Nómina Electrónica v1.0', margin + 10, y + 25, { width: W - 20, align: 'center' });

        const boxY = y + 40;
        const boxH = 55;
        doc.rect(margin + 10, boxY, W - 20, boxH).fillAndStroke('#FFFFFF', '#FCD34D').lineWidth(0.5);

        doc.fillColor('#1F2937').font('Helvetica-Bold').fontSize(7.5).text('DOCUMENTO PREDECESOR ANULADO:', margin + 18, boxY + 8);
        doc.font('Helvetica-Bold').fillColor('#B45309').text(predNum || 'NOM', margin + 180, boxY + 8);

        doc.fillColor('#1F2937').font('Helvetica-Bold').fontSize(7.5).text('FECHA GENERACIÓN PREDECESOR:', margin + 18, boxY + 22);
        doc.font('Helvetica').fillColor('#374151').text(predDate || '—', margin + 180, boxY + 22);

        doc.fillColor('#1F2937').font('Helvetica-Bold').fontSize(7.5).text('CUNE DEL DOCUMENTO PREDECESOR:', margin + 18, boxY + 36);
        doc.font('Courier').fontSize(6).fillColor('#1F2937').text(predCune || '—', margin + 180, boxY + 37, { width: W - 200, lineBreak: false });

        doc.fillColor('#4B5563').font('Helvetica-Oblique').fontSize(7)
           .text('Efecto Legal y Tributario: Esta Nota de Ajuste de Tipo 2 (Eliminar) anula y deja sin efectos tributarios ni laborales ante la DIAN el documento soporte predecesor citado. Al tratarse de un acto de anulación total, no incorpora nuevos devengos ni deducciones.', margin + 12, y + 102, { width: W - 24, align: 'justify' });

        y += blockH + 10;

        // Fila Totales de Anulación
        const totalH = 18;
        doc.rect(margin, y, W, totalH).fillAndStroke('#FEF3C7', '#D97706');
        doc.fillColor('#78350F').font('Helvetica-Bold').fontSize(8);
        doc.text('EFECTO MONETARIO RESULTANTE: ANULACIÓN TOTAL ($ 0)', margin, y + 5, { width: W, align: 'center' });
        y += totalH + 10;

      } else {
        // Banner de Reemplazo si es Tipo 1
        if (isReplace && (predNum || predCune)) {
          const repH = 26;
          doc.rect(margin, y, W, repH).fillAndStroke('#EFF6FF', '#2563EB').lineWidth(0.75);
          doc.fillColor('#1E40AF').font('Helvetica-Bold').fontSize(7.5)
             .text('NOTA DE AJUSTE POR REEMPLAZO (TIPO 1) — SUSTITUCIÓN ÍNTEGRA DE NÓMINA PREDECESORA', margin + 8, y + 4);
          doc.fillColor('#1F2937').font('Helvetica').fontSize(6.5)
             .text(\`Comprobante Predecesor: \${predNum || 'NOM'}   |   Fecha Predecesor: \${predDate || '—'}   |   CUNE: \${predCune || '—'}\`, margin + 8, y + 14, { width: W - 16, lineBreak: false });
          y += repH + 6;
        }

        // ── 3. TABLA DE CONCEPTOS (5 COLUMNAS UNIFICADAS) ──
        const tColW = [ W * 0.10, W * 0.42, W * 0.14, W * 0.17, W * 0.17 ];
        const tColX = [
          margin,
          margin + tColW[0],
          margin + tColW[0] + tColW[1],
          margin + tColW[0] + tColW[1] + tColW[2],
          margin + tColW[0] + tColW[1] + tColW[2] + tColW[3]
        ];

        const headerH = 15;
        doc.rect(margin, y, W, headerH).fillAndStroke('#F3F4F6', '#000000');
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7.5);
        doc.text('Código', tColX[0] + 4, y + 4, { width: tColW[0] - 8, align: 'left' });
        doc.text('Descripción', tColX[1] + 4, y + 4, { width: tColW[1] - 8, align: 'left' });
        doc.text('Unidades / %', tColX[2] + 4, y + 4, { width: tColW[2] - 8, align: 'center' });
        doc.text('Devengos', tColX[3] + 4, y + 4, { width: tColW[3] - 8, align: 'right' });
        doc.text('Deducciones', tColX[4] + 4, y + 4, { width: tColW[4] - 8, align: 'right' });
        y += headerH;

        const cRowH = 13.5;
        parsed.devengos.forEach((d, idx) => {
          const bg = (idx % 2 === 0) ? '#FFFFFF' : '#FAFAFA';
          doc.rect(margin, y, W, cRowH).fillAndStroke(bg, '#E5E7EB');
          doc.fillColor('#000000').font('Helvetica').fontSize(6.8);
          doc.text(d.code, tColX[0] + 4, y + 3.5, { width: tColW[0] - 8 });
          doc.text(d.name, tColX[1] + 4, y + 3.5, { width: tColW[1] - 8, lineBreak: false });
          doc.text(d.qty, tColX[2] + 4, y + 3.5, { width: tColW[2] - 8, align: 'center' });
          doc.text(fmt(d.value), tColX[3] + 4, y + 3.5, { width: tColW[3] - 8, align: 'right' });
          doc.fillColor('#9CA3AF').text('—', tColX[4] + 4, y + 3.5, { width: tColW[4] - 8, align: 'right' });
          y += cRowH;
        });

        parsed.deducciones.forEach((d, idx) => {
          const bg = ((parsed.devengos.length + idx) % 2 === 0) ? '#FFFFFF' : '#FAFAFA';
          doc.rect(margin, y, W, cRowH).fillAndStroke(bg, '#E5E7EB');
          doc.fillColor('#000000').font('Helvetica').fontSize(6.8);
          doc.text(d.code, tColX[0] + 4, y + 3.5, { width: tColW[0] - 8 });
          doc.text(d.name, tColX[1] + 4, y + 3.5, { width: tColW[1] - 8, lineBreak: false });
          doc.text(d.qty, tColX[2] + 4, y + 3.5, { width: tColW[2] - 8, align: 'center' });
          doc.fillColor('#9CA3AF').text('—', tColX[3] + 4, y + 3.5, { width: tColW[3] - 8, align: 'right' });
          doc.fillColor('#000000').text(fmt(d.value), tColX[4] + 4, y + 3.5, { width: tColW[4] - 8, align: 'right' });
          y += cRowH;
        });

        doc.rect(margin, y - (cRowH * (parsed.devengos.length + parsed.deducciones.length)), W, cRowH * (parsed.devengos.length + parsed.deducciones.length)).strokeColor('#000000').lineWidth(0.5).stroke();

        // Fila Totales
        const totalH = 15;
        doc.rect(margin, y, W, totalH).fillAndStroke('#F9FAFB', '#000000');
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7.5);
        doc.text('Totales:', margin + 4, y + 4, { width: tColW[0] + tColW[1] + tColW[2] - 8, align: 'right' });
        doc.text(fmt(devTotal), tColX[3] + 4, y + 4, { width: tColW[3] - 8, align: 'right' });
        doc.text(fmt(dedTotal), tColX[4] + 4, y + 4, { width: tColW[4] - 8, align: 'right' });
        y += totalH;

        // Fila Neto a Pagar
        const netoH = 17;
        doc.rect(margin, y, W, netoH).fillAndStroke('#F3F4F6', '#000000');
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8.5);
        doc.text('Neto a Pagar:', margin + 4, y + 4.5, { width: tColW[0] + tColW[1] + tColW[2] - 8, align: 'right' });
        doc.font('Helvetica-Bold').fontSize(9.5).text(fmt(netoTotal), tColX[3] + 4, y + 4, { width: tColW[3] + tColW[4] - 8, align: 'right' });
        y += netoH + 8;
      }

      // ── 4. VALOR EN LETRAS ──
      doc.rect(margin, y, W, 15).fillAndStroke('#FAFAFA', '#D1D5DB');
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text('Valor en letras: ', margin + 6, y + 4.5, { continued: true });
      doc.font('Helvetica').text(valorEnLetras);
      y += 20;

      // ── 5. NOTAS ──
      doc.rect(margin, y, W, 14).fillAndStroke('#FFFFFF', '#E5E7EB');
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text('Notas: ', margin + 6, y + 3.5, { continued: true });
      doc.font('Helvetica').text('Comprobante de nómina procesado electrónicamente. Documento válido ante las autoridades tributarias y laborales.');
      y += 19;

      // ── 6. BLOQUE DIAN LEGAL ──
      doc.rect(margin, y, W, 40).fillAndStroke('#FFFFFF', '#000000').lineWidth(0.5);
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text('CUNE:', margin + 6, y + 4, { continued: true });
      doc.font('Courier').fontSize(6.5).text(\` \${cune || '—'}\`);

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text('Fecha Firmado:', margin + 6, y + 16, { continued: true });
      doc.font('Helvetica').fontSize(6.5).text(\` \${fEmision}\`);

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text('Firma Digital:', margin + 6, y + 27, { continued: true });
      doc.font('Courier').fontSize(5.5).text(\` \${firmaDigital}\`);

      // ── 7. FOOTER ──
      doc.fillColor('#6B7280').font('Helvetica').fontSize(6).text(
        'Representación Gráfica de Nómina Individual. Software: GRAVY v2.0 | Emisión Electrónica DIAN UBL 2.1.',
        margin, 750, { width: W, align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

`;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex);

// Also fix the ZIP download base64 checks:
content = content.replace(
  "if (finalXml.startsWith('PD94bWwg') || (!finalXml.includes('<') && finalXml.length > 50))",
  "if (finalXml.startsWith('PD94bWwg') || (!finalXml.includes('<') && !finalXml.trim().startsWith('{') && finalXml.length > 50))"
);
content = content.replace(
  "if (finalXml.startsWith('PD94bWwg') || (!finalXml.includes('<') && finalXml.length > 50))",
  "if (finalXml.startsWith('PD94bWwg') || (!finalXml.includes('<') && !finalXml.trim().startsWith('{') && finalXml.length > 50))"
);

fs.writeFileSync(file, content, 'utf8');
console.log("Successfully updated hub/orchestrator.js!");

