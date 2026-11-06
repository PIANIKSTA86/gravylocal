const fs = require('fs');
const path = require('path');
const PDFDocument = require(path.resolve('hub/node_modules/pdfkit'));
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('pb_data/data.db');
const rec = db.prepare('SELECT * FROM electronic_payrolls WHERE id = ?').get('psdjbn6memgmc5w');
const xml = rec.xml_generado;

function fmt(n) {
  return '$ ' + Math.round(Number(n) || 0).toLocaleString('es-CO');
}

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

  const getAttr = (str, attr) => {
    const m = str ? str.match(new RegExp(`${attr}="([^"]*)"`, 'i')) : null;
    return m ? m[1] : '';
  };

  // Basico
  const mBasico = xmlStr.match(/<Basico\s+([^>]+)\/?>/i);
  if (mBasico) {
    const dias = getAttr(mBasico[1], 'DiasTrabajados') || '30';
    const val = parseFloat(getAttr(mBasico[1], 'SueldoTrabajado') || '0');
    if (val > 0) devengos.push({ code: '001', name: 'Sueldo Básico', qty: `${dias} días`, value: val });
  }

  // Transporte
  const mTrans = xmlStr.match(/<Transporte\s+([^>]+)\/?>/i);
  if (mTrans) {
    const aux = parseFloat(getAttr(mTrans[1], 'AuxilioTransporte') || '0');
    if (aux > 0) devengos.push({ code: '040', name: 'Auxilio de Transporte', qty: '30 días', value: aux });
  }

  // Horas extras
  const heRegex = /<(HED|HEN|HRD|HRN|HEDDF|HENDF|HRDDF|HRNDDF)\s+([^>]+)\/?>/gi;
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
    if (pago > 0) devengos.push({ code: '101', name: heNames[tag] || tag, qty: `${cant} hrs`, value: pago });
  }

  // Salud
  const mSalud = xmlStr.match(/<Salud\s+([^>]+)\/?>/i);
  if (mSalud) {
    const ded = parseFloat(getAttr(mSalud[1], 'Deduccion') || '0');
    const pct = getAttr(mSalud[1], 'Porcentaje') || '4.00';
    if (ded > 0) deducciones.push({ code: '201', name: 'Salud (Aporte Trabajador)', qty: `${pct}%`, value: ded });
  }

  // Pension
  const mPension = xmlStr.match(/<FondoPension\s+([^>]+)\/?>/i);
  if (mPension) {
    const ded = parseFloat(getAttr(mPension[1], 'Deduccion') || '0');
    const pct = getAttr(mPension[1], 'Porcentaje') || '4.00';
    if (ded > 0) deducciones.push({ code: '202', name: 'Pensión (Aporte Trabajador)', qty: `${pct}%`, value: ded });
  }

  // Fondo SP
  const mFsp = xmlStr.match(/<FondoSP\s+([^>]+)\/?>/i);
  if (mFsp) {
    const ded = parseFloat(getAttr(mFsp[1], 'DeduccionSP') || '0');
    if (ded > 0) deducciones.push({ code: '203', name: 'Fondo Solidaridad Pensional', qty: '1%', value: ded });
  }

  return { devengos, deducciones };
}

async function renderPayrollPdf(xmlContent, filename, payrollData) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'LETTER' });
      const buffers = [];
      doc.on('data', b => buffers.push(b));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const pData = payrollData || {};
      const isAjuste = xmlContent.includes('NominaIndividualDeAjuste') || xmlContent.includes('TipoXML="103"') || String(filename || '').toUpperCase().startsWith('NAN');
      const docTitle = isAjuste ? 'Nota de Ajuste de Nómina Electrónica' : 'Documento Soporte de Pago de Nómina Electrónica';

      const getAttr = (tagRegex, attr) => {
        const m = xmlContent.match(tagRegex);
        if (!m) return '';
        const mAttr = m[1].match(new RegExp(`${attr}="([^"]*)"`, 'i'));
        return mAttr ? mAttr[1] : '';
      };

      const razonSocial = getAttr(/<Empleador\s+([^>]+)\/?>/i, 'RazonSocial') || pData.companyName || 'DOMESTIKO SAS';
      const nitEmp = getAttr(/<Empleador\s+([^>]+)\/?>/i, 'NIT') || pData.companyNit || '901428834';
      const dvEmp = getAttr(/<Empleador\s+([^>]+)\/?>/i, 'DV') || '2';
      const nitCompleto = `${nitEmp}-${dvEmp}`;

      const fIngreso = getAttr(/<Periodo\s+([^>]+)\/?>/i, 'FechaIngreso') || pData.dateHired || '2026-01-01';
      const fLiqInicio = getAttr(/<Periodo\s+([^>]+)\/?>/i, 'FechaLiquidacionInicio') || '2026-09-01';
      const fLiqFin = getAttr(/<Periodo\s+([^>]+)\/?>/i, 'FechaLiquidacionFin') || '2026-09-30';
      const numSec = filename || 'NOM-0364';
      const fEmision = pData.issueDate || '2026-10-09 15:42:03 12:00:00-05:00';

      const empName = pData.empName || 'AMPARO REYES SARRIA';
      const empDoc = getAttr(/<Trabajador\s+([^>]+)\/?>/i, 'NumeroDocumento') || pData.empDoc || '29700430';
      const cargo = pData.cargo || 'Colaborador';
      const centroCostos = pData.costCenter || 'General / Colaboradores';
      const sueldoBase = parseFloat(getAttr(/<Trabajador\s+([^>]+)\/?>/i, 'Sueldo') || pData.basicSalary || '1750905');

      const banco = getAttr(/<Pago\s+([^>]+)\/?>/i, 'Banco') || pData.bankName || 'Bancolombia';
      const tipoCta = getAttr(/<Pago\s+([^>]+)\/?>/i, 'TipoCuenta') || pData.bankAccountType || 'Ahorros';
      const numCta = getAttr(/<Pago\s+([^>]+)\/?>/i, 'NumeroCuenta') || pData.bankAccount || '06185364532';
      const ctaLabel = numCta ? `${banco} · ${tipoCta}: ${numCta}` : 'Efectivo / Sin cuenta';
      const metodoPago = pData.paymentMethod || '42 - Consignación Bancaria';

      const epsLabel = pData.healthEntity || 'EPS SURA';
      const afpLabel = pData.pensionEntity || 'Pensionado (Exento)';
      const arlLabel = pData.arlEntity || 'ARL SURA - Riesgo 1 (0.522%)';
      const cajaLabel = pData.cajaEntity || 'CCF COMFENALCO DEL VALLE DEL CAUCA - COMFENALCO VALLE';
      const fechasPago = getAttr(/<FechaPago>([^<]+)<\/FechaPago>/i, '') || fLiqFin;

      const cune = getAttr(/<InformacionGeneral\s+([^>]+)\/?>/i, 'CUNE') || pData.cune || '—';
      const firmaDigital = pData.digitalSignature || 'SMbWtszsoY4c35SftX23XLEjWd0w9oDxB/jkn9H3H0eb4kz3kccNtRuWUqia4Ygm...';

      // Totales
      const devTotal = parseFloat((xmlContent.match(/<DevengadosTotal>([^<]+)<\/DevengadosTotal>/i) || [])[1] || '2000000');
      const dedTotal = parseFloat((xmlContent.match(/<DeduccionesTotal>([^<]+)<\/DeduccionesTotal>/i) || [])[1] || '70036.20');
      const netoTotal = parseFloat((xmlContent.match(/<ComprobanteTotal>([^<]+)<\/ComprobanteTotal>/i) || [])[1] || String(devTotal - dedTotal));
      const valorEnLetras = formatNumeroALetras(netoTotal);

      const parsed = parseNominaXmlConcepts(xmlContent);

      // Coordenadas fijas de la página Carta
      const margin = 30;
      const W = 612 - (margin * 2); // 552
      let y = margin;

      // ── 1. CABECERA ──
      // Título
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9.5).text(docTitle, margin, y);
      y += 14;

      // Razón Social
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(13).text(razonSocial, margin, y);
      y += 16;

      // NIT
      doc.fillColor('#333333').font('Helvetica').fontSize(8).text(`NIT: ${nitCompleto}`, margin, y);
      y += 11;

      // Periodo
      doc.fillColor('#4B5563').font('Helvetica').fontSize(8).text(`Periodo de pago: ${fLiqInicio} al ${fLiqFin}`, margin, y);
      y += 11;

      // Secuencia
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text(`Secuencia: ${numSec}`, margin, y);
      y += 12;

      // Fecha Emisión
      doc.fillColor('#6B7280').font('Helvetica').fontSize(7.5).text(`Fecha emisión: ${fEmision}`, margin, y);

      // QR Code a la derecha
      const qrSize = 64;
      const qrX = margin + W - qrSize;
      const qrY = margin;
      doc.rect(qrX, qrY, qrSize, qrSize).lineWidth(0.5).strokeColor('#000000').stroke();
      doc.fillColor('#666666').font('Helvetica').fontSize(7).text('QR DIAN', qrX, qrY + 28, { width: qrSize, align: 'center' });

      y = Math.max(y + 10, margin + qrSize + 10);

      // Línea divisoria
      doc.moveTo(margin, y).lineTo(margin + W, y).lineWidth(0.75).strokeColor('#000000').stroke();
      y += 8;

      // ── 2. FICHA EMPLEADO Y AFILIACIONES (TABLA 4 COLUMNAS) ──
      const colW1 = W * 0.16; // 88.32
      const colW2 = W * 0.34; // 187.68
      const colW3 = W * 0.18; // 99.36
      const colW4 = W * 0.32; // 176.64

      const metaRows = [
        [ 'Empleado:', empName, 'Identificación:', empDoc ],
        [ 'Cargo:', cargo, 'Centro de Costos:', centroCostos ],
        [ 'Sueldo Base:', fmt(sueldoBase), 'Banco / Cuenta:', ctaLabel ],
        [ 'Fecha Ingreso:', fIngreso, 'Método de Pago:', metodoPago ],
        [ 'Entidad Salud:', epsLabel, 'Entidad Pensión:', afpLabel ],
        [ 'Entidad ARL:', arlLabel, 'Entidad Caja:', cajaLabel ],
        [ 'Fechas de Pago:', fechasPago, '', '' ]
      ];

      const rowH = 13.5;
      metaRows.forEach((r, idx) => {
        const isLast = (idx === metaRows.length - 1);

        // Fondo labels
        doc.rect(margin, y, colW1, rowH).fillAndStroke('#F9FAFB', '#D1D5DB');
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7).text(r[0], margin + 4, y + 3.5);

        if (!isLast) {
          // Val 1
          doc.rect(margin + colW1, y, colW2, rowH).fillAndStroke('#FFFFFF', '#D1D5DB');
          doc.fillColor('#000000').font('Helvetica').fontSize(7).text(r[1], margin + colW1 + 4, y + 3.5, { width: colW2 - 8, lineBreak: false });

          // Label 2
          doc.rect(margin + colW1 + colW2, y, colW3, rowH).fillAndStroke('#F9FAFB', '#D1D5DB');
          doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7).text(r[2], margin + colW1 + colW2 + 4, y + 3.5);

          // Val 2
          doc.rect(margin + colW1 + colW2 + colW3, y, colW4, rowH).fillAndStroke('#FFFFFF', '#D1D5DB');
          doc.fillColor('#000000').font('Helvetica').fontSize(7).text(r[3], margin + colW1 + colW2 + colW3 + 4, y + 3.5, { width: colW4 - 8, lineBreak: false });
        } else {
          // Fechas de pago ocupa col 2, 3 y 4
          const restW = colW2 + colW3 + colW4;
          doc.rect(margin + colW1, y, restW, rowH).fillAndStroke('#FFFFFF', '#D1D5DB');
          doc.fillColor('#000000').font('Helvetica').fontSize(7).text(r[1], margin + colW1 + 4, y + 3.5);
        }
        y += rowH;
      });

      y += 10;

      // ── 3. TABLA DE CONCEPTOS (5 COLUMNAS UNIFICADAS) ──
      const tColW = [ W * 0.10, W * 0.42, W * 0.14, W * 0.17, W * 0.17 ];
      const tColX = [
        margin,
        margin + tColW[0],
        margin + tColW[0] + tColW[1],
        margin + tColW[0] + tColW[1] + tColW[2],
        margin + tColW[0] + tColW[1] + tColW[2] + tColW[3]
      ];

      // Cabecera
      const headerH = 15;
      doc.rect(margin, y, W, headerH).fillAndStroke('#F3F4F6', '#000000');
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7.5);
      doc.text('Código', tColX[0] + 4, y + 4, { width: tColW[0] - 8, align: 'left' });
      doc.text('Descripción', tColX[1] + 4, y + 4, { width: tColW[1] - 8, align: 'left' });
      doc.text('Unidades', tColX[2] + 4, y + 4, { width: tColW[2] - 8, align: 'center' });
      doc.text('Devengos', tColX[3] + 4, y + 4, { width: tColW[3] - 8, align: 'right' });
      doc.text('Deducciones', tColX[4] + 4, y + 4, { width: tColW[4] - 8, align: 'right' });
      y += headerH;

      // Filas de Devengos
      const cRowH = 14;
      parsed.devengos.forEach((d, idx) => {
        const bg = (idx % 2 === 0) ? '#FFFFFF' : '#FAFAFA';
        doc.rect(margin, y, W, cRowH).fillAndStroke(bg, '#E5E7EB');
        doc.fillColor('#000000').font('Helvetica').fontSize(7);
        doc.text(d.code, tColX[0] + 4, y + 3.5, { width: tColW[0] - 8 });
        doc.text(d.name, tColX[1] + 4, y + 3.5, { width: tColW[1] - 8, lineBreak: false });
        doc.text(d.qty, tColX[2] + 4, y + 3.5, { width: tColW[2] - 8, align: 'center' });
        doc.text(fmt(d.value), tColX[3] + 4, y + 3.5, { width: tColW[3] - 8, align: 'right' });
        doc.fillColor('#9CA3AF').text('—', tColX[4] + 4, y + 3.5, { width: tColW[4] - 8, align: 'right' });
        y += cRowH;
      });

      // Filas de Deducciones
      parsed.deducciones.forEach((d, idx) => {
        const bg = ((parsed.devengos.length + idx) % 2 === 0) ? '#FFFFFF' : '#FAFAFA';
        doc.rect(margin, y, W, cRowH).fillAndStroke(bg, '#E5E7EB');
        doc.fillColor('#000000').font('Helvetica').fontSize(7);
        doc.text(d.code, tColX[0] + 4, y + 3.5, { width: tColW[0] - 8 });
        doc.text(d.name, tColX[1] + 4, y + 3.5, { width: tColW[1] - 8, lineBreak: false });
        doc.text(d.qty, tColX[2] + 4, y + 3.5, { width: tColW[2] - 8, align: 'center' });
        doc.fillColor('#9CA3AF').text('—', tColX[3] + 4, y + 3.5, { width: tColW[3] - 8, align: 'right' });
        doc.fillColor('#000000').text(fmt(d.value), tColX[4] + 4, y + 3.5, { width: tColW[4] - 8, align: 'right' });
        y += cRowH;
      });

      // Borde exterior de tabla
      doc.rect(margin, y - (cRowH * (parsed.devengos.length + parsed.deducciones.length)), W, cRowH * (parsed.devengos.length + parsed.deducciones.length)).strokeColor('#000000').lineWidth(0.5).stroke();

      // Fila de Totales
      const totalH = 15;
      doc.rect(margin, y, W, totalH).fillAndStroke('#F9FAFB', '#000000');
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7.5);
      doc.text('Totales:', margin + 4, y + 4, { width: tColW[0] + tColW[1] + tColW[2] - 8, align: 'right' });
      doc.text(fmt(devTotal), tColX[3] + 4, y + 4, { width: tColW[3] - 8, align: 'right' });
      doc.text(fmt(dedTotal), tColX[4] + 4, y + 4, { width: tColW[4] - 8, align: 'right' });
      y += totalH;

      // Fila de Neto a Pagar
      const netoH = 17;
      doc.rect(margin, y, W, netoH).fillAndStroke('#F3F4F6', '#000000');
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8.5);
      doc.text('Neto a Pagar:', margin + 4, y + 4.5, { width: tColW[0] + tColW[1] + tColW[2] - 8, align: 'right' });
      doc.font('Helvetica-Bold').fontSize(9.5).text(fmt(netoTotal), tColX[3] + 4, y + 4, { width: tColW[3] + tColW[4] - 8, align: 'right' });
      y += netoH + 10;

      // ── 4. VALOR EN LETRAS ──
      doc.rect(margin, y, W, 16).fillAndStroke('#FAFAFA', '#D1D5DB');
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text('Valor en letras: ', margin + 6, y + 4.5, { continued: true });
      doc.font('Helvetica').text(valorEnLetras);
      y += 22;

      // ── 5. NOTAS ──
      doc.rect(margin, y, W, 15).fillAndStroke('#FFFFFF', '#E5E7EB');
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text('Notas: ', margin + 6, y + 4, { continued: true });
      doc.font('Helvetica').text('Comprobante de nómina procesado electrónicamente. Documento válido ante las autoridades tributarias y laborales.');
      y += 21;

      // ── 6. BLOQUE DIAN LEGAL (CUNE & FIRMA) ──
      doc.rect(margin, y, W, 42).fillAndStroke('#FFFFFF', '#000000').lineWidth(0.5);
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text('CUNE:', margin + 6, y + 5, { continued: true });
      doc.font('Courier').fontSize(6.5).text(` ${cune || '—'}`);

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text('Fecha Firmado:', margin + 6, y + 17, { continued: true });
      doc.font('Helvetica').fontSize(6.5).text(` ${fEmision}`);

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(6.5).text('Firma Digital:', margin + 6, y + 29, { continued: true });
      doc.font('Courier').fontSize(5.5).text(` ${firmaDigital}`);

      y += 48;

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

(async () => {
  const buf = await renderPayrollPdf(xml, 'NOM-0364', {
    companyName: 'DOMESTIKO SAS',
    companyNit: '901428834',
    empName: 'AMPARO REYES SARRIA',
    empDoc: '29700430',
    cargo: 'Colaborador',
    costCenter: 'General / Colaboradores',
    basicSalary: 1750905,
    bankName: 'Bancolombia',
    bankAccountType: 'Ahorros',
    bankAccount: '06185364532',
    dateHired: '2026-01-01',
    paymentMethod: '42 - Consignación Bancaria',
    healthEntity: 'EPS SURA',
    pensionEntity: 'Pensionado (Exento)',
    arlEntity: 'ARL SURA - Riesgo 1 (0.522%)',
    cajaEntity: 'CCF COMFENALCO DEL VALLE DEL CAUCA - COMFENALCO VALLE',
    fechasPago: '2026-09-30',
    issueDate: '2026-10-09 15:42:03 12:00:00-05:00',
    cune: '—',
    digitalSignature: 'SMbWtszsoY4c35SftX23XLEjWd0w9oDxB/jkn9H3H0eb4kz3kccNtRuWUqia4Ygm...'
  });
  console.log('Generated PDF size:', buf.length, 'bytes');
  fs.writeFileSync('temp_zips/test_nomina_monochrome.pdf', buf);
  console.log('Saved to temp_zips/test_nomina_monochrome.pdf');
})();
