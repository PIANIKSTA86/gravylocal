const fs = require('fs');

const replacement = `function parseNominaXmlConcepts(xmlStr) {
        const devengos = [];
        const deducciones = [];
        if (!xmlStr) return { devengos, deducciones };

        // Si es JSON UBL 2.1
        if (xmlStr.trim().startsWith('{')) {
          try {
            const j = JSON.parse(xmlStr);
            const earn = j.earn || j.accrued || {};
            if (earn.basic) {
              const val = parseFloat(earn.basic.salary_worked || 0);
              const days = earn.basic.worked_days || '30';
              if (val > 0) devengos.push({ code: '001', name: 'Sueldo Básico', qty: \`\${days} días\`, value: val });
            }
            if (earn.transportation) {
              const tr = Array.isArray(earn.transportation) ? earn.transportation[0] : earn.transportation;
              const val = parseFloat(tr?.transportation_assistance || tr?.transport_assistance || 0);
              if (val > 0) devengos.push({ code: '040', name: 'Auxilio de Transporte', qty: '30 días', value: val });
            }
            if (earn.other_concepts && Array.isArray(earn.other_concepts)) {
              earn.other_concepts.forEach(oc => {
                const s = parseFloat(oc.conceptS || oc.salary_concept || 0);
                const ns = parseFloat(oc.conceptNS || oc.non_salary_concept || 0);
                const desc = oc.description || oc.concept_description || 'Otros Devengados y Auxilios';
                if (s > 0) devengos.push({ code: '190', name: \`\${desc} (Salarial)\`, qty: '—', value: s });
                if (ns > 0) devengos.push({ code: '191', name: \`\${desc} (No Salarial)\`, qty: '—', value: ns });
              });
            }

            const ded = j.deductions || {};
            if (ded.health) {
              const val = parseFloat(ded.health.deduction || 0);
              const pct = ded.health.percentage || '4.00';
              if (val > 0) deducciones.push({ code: '201', name: 'Salud (Aporte Trabajador)', qty: \`\${pct}%\`, value: val });
            }
            if (ded.pension_fund) {
              const val = parseFloat(ded.pension_fund.deduction || 0);
              const pct = ded.pension_fund.percentage || '4.00';
              if (val > 0) deducciones.push({ code: '202', name: 'Pensión (Aporte Trabajador)', qty: \`\${pct}%\`, value: val });
            }
            if (ded.fundSP) {
              const val = parseFloat(ded.fundSP.deduction || ded.fundSP.deductionSP || 0);
              const pct = ded.fundSP.percentage || '1.00';
              if (val > 0) deducciones.push({ code: '203', name: 'Fondo Solidaridad Pensional', qty: \`\${pct}%\`, value: val });
              const valSub = parseFloat(ded.fundSP.deductionSub || 0);
              if (valSub > 0) deducciones.push({ code: '204', name: 'Fondo Subsistencia Pensional', qty: '—', value: valSub });
            }
            if (ded.retefuente) {
              const val = parseFloat(ded.retefuente || 0);
              if (val > 0) deducciones.push({ code: '240', name: 'Retención en la Fuente', qty: '—', value: val });
            }
            if (ded.other_deductions && Array.isArray(ded.other_deductions)) {
              ded.other_deductions.forEach(od => {
                const val = parseFloat(od.deduction || 0);
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
          const pct = getAttr(attrs, 'Porcentaje');
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
        const mPrima = xmlStr.match(/<Primas\\s+([^>]+)\\/>/i);
        if (mPrima) {
          const v = parseFloat(getAttr(mPrima[1], 'Pago') || '0');
          if (v > 0) devengos.push({ code: '080', name: 'Prima de Servicios (Pagada)', qty: '—', value: v });
        }
        const mCes = xmlStr.match(/<Cesantias\\s+([^>]+)\\/>/i);
        if (mCes) {
          const v = parseFloat(getAttr(mCes[1], 'Pago') || '0');
          if (v > 0) devengos.push({ code: '090', name: 'Cesantías Pagadas', qty: '—', value: v });
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
          const pct = getAttr(mFsp[1], 'Porcentaje') || '1.00';
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

      const isAjuste = xml.includes('NominaIndividualDeAjuste') || xml.includes('TipoXML="103"') || String(filename || '').toUpperCase().startsWith('NAN');
      const docTitle = isAjuste ? 'Nota de Ajuste de Nómina Electrónica' : 'Documento Soporte de Pago de Nómina Electrónica';

      let jsonObj = null;
      if (xml.trim().startsWith('{')) {
        try { jsonObj = JSON.parse(xml); } catch (_) {}
      }

      const getAttr = (tagRegex, attr) => {
        const m = xml.match(tagRegex);
        if (!m) return '';
        const mAttr = m[1].match(new RegExp(\`\${attr}="([^"]*)"\`, 'i'));
        return mAttr ? mAttr[1] : '';
      };

      const razonSocial = getAttr(/<Empleador\\s+([^>]+)\\/>/i, 'RazonSocial') || pData.companyName || 'EMPRESA';
      const nitEmp = getAttr(/<Empleador\\s+([^>]+)\\/>/i, 'NIT') || pData.companyNit || '';
      const dvEmp = getAttr(/<Empleador\\s+([^>]+)\\/>/i, 'DV') || '0';
      const nitCompleto = dvEmp ? \`\${nitEmp}-\${dvEmp}\` : nitEmp;

      const fIngreso = getAttr(/<Periodo\\s+([^>]+)\\/>/i, 'FechaIngreso') || jsonObj?.period?.date_entry || pData.dateHired || pData.startDate || pData.fIngreso || '—';
      const fRetiroRaw = getAttr(/<Periodo\\s+([^>]+)\\/>/i, 'FechaRetiro') || jsonObj?.period?.departure_date || pData.dateEnd || pData.retirementDate || pData.endDate || pData.fRetiro || '';
      const fRetiro = fRetiroRaw ? \`\${fRetiroRaw} (Cese de Contrato)\` : 'Vigente (Sin Retiro)';

      const fLiqInicio = getAttr(/<Periodo\\s+([^>]+)\\/>/i, 'FechaLiquidacionInicio') || jsonObj?.period?.settlement_start_date || '—';
      const fLiqFin = getAttr(/<Periodo\\s+([^>]+)\\/>/i, 'FechaLiquidacionFin') || jsonObj?.period?.settlement_end_date || '—';
      const numSec = filename || (getAttr(/<NumeroSecuenciaXML\\s+([^>]+)\\/>/i, 'Numero')) || 'NOM';
      const fEmision = getAttr(/<InformacionGeneral\\s+([^>]+)\\/>/i, 'FechaGen') ? \`\${getAttr(/<InformacionGeneral\\s+([^>]+)\\/>/i, 'FechaGen')} \${getAttr(/<InformacionGeneral\\s+([^>]+)\\/>/i, 'HoraGen') || ''}\`.trim() : (pData.issueDate || new Date().toISOString().slice(0, 10));

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

      const cune = getAttr(/<InformacionGeneral\\s+([^>]+)\\/>/i, 'CUNE') || (xml.match(/documentkey=([a-f0-9]{64,})/i) || [])[1] || pData.cune || '—';
      const firmaDigital = pData.digitalSignature || 'SMbWtszsoY4c35SftX23XLEjWd0w9oDxB/jkn9H3H0eb4kz3kccNtRuWUqia4Ygm...';

      // Totales oficiales
      const devTotal = parseFloat((xml.match(/<DevengadosTotal>([^<]+)<\\/DevengadosTotal>/i) || [])[1] || jsonObj?.total_earned || pData.totalDevengos || 0);
      const dedTotal = parseFloat((xml.match(/<DeduccionesTotal>([^<]+)<\\/DeduccionesTotal>/i) || [])[1] || jsonObj?.deductions_total || pData.totalDeducciones || 0);
      const netoTotal = parseFloat((xml.match(/<ComprobanteTotal>([^<]+)<\\/ComprobanteTotal>/i) || [])[1] || jsonObj?.total_voucher || pData.totalNeto || (devTotal - dedTotal));
      const valorEnLetras = pData.valorEnLetras || formatNumeroALetras(netoTotal);

      const parsed = parseNominaXmlConcepts(xml);

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

      // QR Code Buffer
      const xmlQr = (xml.match(/<CodigoQR>([^<]+)<\\/CodigoQR>/i) || [])[1] || '';
      const qrData = xmlQr || pData.qrData || \`NumFac=\${numSec}&FecFac=\${fEmision}&NitFac=\${nitEmp}&DocAdq=\${empDoc}&ValDev=\${devTotal}&ValDed=\${dedTotal}&ValTol=\${netoTotal}&CUFE=\${cune}\`;
      let qrBuffer = null;
      try {
        qrBuffer = await fetchQrCode(qrData);
      } catch (_) {}

      // Coordenadas fijas página Carta
      const margin = 30;
      const W = 612 - (margin * 2); // 552
      let y = margin;

      `;

const content = fs.readFileSync('hub/orchestrator.js', 'utf8');
const startStr = 'function parseNominaXmlConcepts(xmlStr) {';
const endStr = 'doc.fillColor(\'#000000\').font(\'Helvetica-Bold\').fontSize(9.5).text(docTitle, margin, y);';
const start = content.indexOf(startStr);
const end = content.indexOf(endStr);

if (start === -1 || end === -1) {
  console.error('Boundaries not found!', { start, end });
  process.exit(1);
}

const updated = content.slice(0, start) + replacement + content.slice(end);
fs.writeFileSync('hub/orchestrator.js', updated, 'utf8');
console.log('Successfully patched hub/orchestrator.js!');
