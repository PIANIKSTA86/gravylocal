const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function cleanFmt(value) {
  if (value === undefined || value === null) return "0.00";
  var parts = parseFloat(value).toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join('.');
}

function fmtCurrency(value) {
  if (value === undefined || value === null) return "$ 0";
  return "$ " + Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getMonthNameUpper(p) {
  if (!p) return '—';
  const parts = String(p).split('-');
  const m = parseInt(parts[1], 10) || 1;
  const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  return months[m - 1] || '';
}

function numeroALetras(num) {
  var tempNum = parseFloat(String(num)).toFixed(2).split('.');
  var entero = parseInt(tempNum[0], 10);
  var centavos = tempNum[1];
  
  if (entero === 0) return ('Son: Cero PESOS ' + centavos + '/100').toUpperCase();
  
  function letras(n) {
    if (n < 10) return ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'][n];
    if (n < 20) return ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'][n - 10];
    if (n < 30) {
      if (n === 20) return 'Veinte';
      return 'Veinti' + letras(n - 20).toLowerCase();
    }
    if (n < 100) {
      var u = n % 10;
      var d = Math.floor(n / 10);
      var decenas = ['', '', '', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
      return decenas[d] + (u > 0 ? ' y ' + letras(u).toLowerCase() : '');
    }
    if (n < 1000) {
      var d_u = n % 100;
      var c = Math.floor(n / 100);
      var centenas = ['', 'Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
      if (n === 100) return 'Cien';
      if (c === 1) return 'Ciento ' + letras(d_u).toLowerCase();
      return centenas[c] + (d_u > 0 ? ' ' + letras(d_u).toLowerCase() : '');
    }
    if (n < 1000000) {
      var mil = Math.floor(n / 1000);
      var resto = n % 1000;
      var t = mil === 1 ? 'Mil' : letras(mil) + ' mil';
      return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
    }
    if (n < 1000000000) {
      var millon = Math.floor(n / 1000000);
      var resto = n % 1000000;
      var t = millon === 1 ? 'Un millón' : letras(millon) + ' millones';
      return t + (resto > 0 ? ' ' + letras(resto).toLowerCase() : '');
    }
    return '';
  }
  
  var res = letras(entero);
  res = res.charAt(0).toUpperCase() + res.slice(1);
  return ('Son: ' + res + ' PESOS ' + centavos + '/100 M/CTE').toUpperCase();
}

function generatePhStatementPdf(statementData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 30, size: 'LETTER' });
      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const d = statementData || {};
      const companyName = d.companyName || 'CONJUNTO RESIDENCIAL';
      const companyNit = d.companyNit || '900.000.000-0';
      const companyAddress = d.companyAddress || '';
      const companyPhone = d.companyPhone || '';
      const companyEmail = d.companyEmail || '';
      const companyCity = d.companyCity || '';
      const companyLogo = d.companyLogo || '';

      const docType = d.docType || 'invoice';
      const docLabel = docType === 'statement' ? 'ESTADO DE CUENTA' : 'CUENTA DE COBRO';
      const docNumber = d.docNumber || '0000';
      const period = d.period || '';
      const periodName = getMonthNameUpper(period);
      const date = d.date || '';
      const dueDate = d.dueDate || date;

      const ownerName = d.ownerName || 'Copropietario';
      const ownerNit = d.ownerNit || '—';
      const ownerAddress = d.ownerAddress || '';
      const ownerPhone = d.ownerPhone || '—';
      const ownerEmail = d.ownerEmail || '—';

      const propertyName = d.propertyName || 'Unidad';
      const propertyCode = d.propertyCode || propertyName;
      const propertyArea = d.propertyArea || '';
      const propertyCoef = d.propertyCoef || '';
      const propertyMatricula = d.propertyMatricula || '';

      const conceptsList = d.conceptsList || [];
      const totalActual = d.totalActual || 0;
      const notes = d.notes || '';

      const W = doc.page.width - 60; // 552
      const L = 30;
      let y = 30;

      // ─── 1. HEADER SECTION ──────────────────────────────────
      const headerTop = y;
      const colLogoW = 140;
      const colBoxW = 160;
      const colCenterW = W - colLogoW - colBoxW;

      // Logo
      let logoRendered = false;
      if (companyLogo) {
        try {
          const base64Data = companyLogo.replace(/^data:image\/\w+;base64,/, '');
          const imgBuf = Buffer.from(base64Data, 'base64');
          doc.image(imgBuf, L, y + 2, { fit: [colLogoW - 10, 65] });
          logoRendered = true;
        } catch (e) {
          console.warn('Logo render error:', e.message);
        }
      }
      if (!logoRendered) {
        doc.rect(L, y + 5, 60, 55).strokeColor('#000000').lineWidth(1).stroke();
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000')
           .text(companyName.substring(0, 4).toUpperCase(), L, y + 24, { width: 60, align: 'center' });
      }

      // Center Company Info
      const centerX = L + colLogoW;
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000')
         .text(companyName.toUpperCase(), centerX, y, { width: colCenterW, align: 'center' });
      let curCenterY = y + 14;

      doc.font('Helvetica-Bold').fontSize(9)
         .text(`NIT ${companyNit}`, centerX, curCenterY, { width: colCenterW, align: 'center' });
      curCenterY += 11;

      doc.font('Helvetica').fontSize(8);
      if (companyAddress) {
        doc.text(companyAddress, centerX, curCenterY, { width: colCenterW, align: 'center' });
        curCenterY += 10;
      }
      if (companyPhone) {
        doc.text(`TEL / PORTERÍA: ${companyPhone}`, centerX, curCenterY, { width: colCenterW, align: 'center' });
        curCenterY += 10;
      }
      if (companyEmail) {
        doc.text(companyEmail, centerX, curCenterY, { width: colCenterW, align: 'center' });
        curCenterY += 10;
      }
      if (companyCity) {
        doc.text(companyCity, centerX, curCenterY, { width: colCenterW, align: 'center' });
        curCenterY += 10;
      }

      // Right Box (Consecutivo & Periodo)
      const boxX = L + W - colBoxW;
      const boxH = 68;
      doc.rect(boxX, y, colBoxW, boxH).strokeColor('#000000').lineWidth(1.2).stroke();
      
      // Box header line
      doc.rect(boxX, y, colBoxW, 18).strokeColor('#000000').lineWidth(0.8).stroke();
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000')
         .text(`${docLabel} No.`, boxX, y + 5, { width: colBoxW, align: 'center' });

      // Number
      doc.font('Courier-Bold').fontSize(15)
         .text(docNumber, boxX, y + 26, { width: colBoxW, align: 'center' });

      // Period bar
      doc.moveTo(boxX, y + 48).lineTo(boxX + colBoxW, y + 48).strokeColor('#000000').lineWidth(0.8).stroke();
      doc.font('Helvetica-Bold').fontSize(8)
         .text(`PERÍODO: ${periodName} ${period.split('-')[0] || ''}`, boxX, y + 53, { width: colBoxW, align: 'center' });

      y = Math.max(headerTop + 72, curCenterY + 4);

      // Horizontal separator line
      doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#000000').lineWidth(1.5).stroke();
      y += 8;

      // ─── 2. METADATA SECTION (3 COLUMNS) ─────────────────────
      const metaH = 88;
      const col1W = 280;
      const col2W = 120;
      const col3W = W - col1W - col2W; // 152

      // Col 1: Propietario Info
      let mY = y + 2;
      const rowH = 16;
      const renderLabelVal = (lbl, val, xOffset, fieldW) => {
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000').text(lbl, L + xOffset, mY);
        const valX = L + xOffset + 62;
        const lineW = fieldW - 64;
        doc.font('Helvetica').fontSize(8.5).text(val || '—', valX, mY, { width: lineW });
        doc.moveTo(valX, mY + 10).lineTo(valX + lineW, mY + 10).strokeColor('#000000').lineWidth(0.5).stroke();
      };

      renderLabelVal('Nombre:', ownerName, 0, col1W - 10);
      mY += rowH;
      renderLabelVal('Dirección:', ownerAddress || propertyName, 0, col1W - 10);
      mY += rowH;
      renderLabelVal('Contacto:', ownerPhone, 0, col1W - 10);
      mY += rowH;

      // Cód. Unidad + NIT
      doc.font('Helvetica-Bold').fontSize(8.5).text('Cód. Unidad:', L, mY);
      doc.font('Helvetica').fontSize(8.5).text(propertyCode || propertyName, L + 62, mY, { width: 65 });
      doc.moveTo(L + 62, mY + 10).lineTo(L + 125, mY + 10).strokeColor('#000000').lineWidth(0.5).stroke();
      
      // NIT/CC sub-box
      doc.rect(L + 130, mY - 1, 46, 12).strokeColor('#000000').lineWidth(0.6).stroke();
      doc.font('Helvetica-Bold').fontSize(7).text('NIT / C.C.', L + 130, mY + 1, { width: 46, align: 'center' });
      doc.font('Helvetica').fontSize(8).text(ownerNit, L + 180, mY, { width: 90 });
      doc.moveTo(L + 180, mY + 10).lineTo(L + 270, mY + 10).strokeColor('#000000').lineWidth(0.5).stroke();
      mY += rowH;

      renderLabelVal('Correo:', ownerEmail, 0, col1W - 10);

      // Col 2: Matrícula & Ref Banco (Boxed)
      const col2X = L + col1W;
      doc.rect(col2X, y + 2, col2W - 10, metaH - 6).strokeColor('#000000').lineWidth(0.8).stroke();
      doc.rect(col2X, y + 2, col2W - 10, 16).strokeColor('#000000').lineWidth(0.5).stroke();
      doc.font('Helvetica-Bold').fontSize(7.5).text('MATRÍCULA', col2X, y + 6, { width: col2W - 10, align: 'center' });
      doc.font('Helvetica').fontSize(8).text(propertyMatricula || '—', col2X, y + 22, { width: col2W - 10, align: 'center' });

      doc.rect(col2X, y + 42, col2W - 10, 16).strokeColor('#000000').lineWidth(0.5).stroke();
      doc.font('Helvetica-Bold').fontSize(7.5).text('REF. BANCO', col2X, y + 46, { width: col2W - 10, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(8.5).text(propertyName, col2X, y + 63, { width: col2W - 10, align: 'center' });

      // Col 3: Fechas y Coeficiente (Boxed grid)
      const col3X = L + col1W + col2W;
      const c3W = col3W;
      doc.rect(col3X, y + 2, c3W, metaH - 6).strokeColor('#000000').lineWidth(0.8).stroke();
      
      // Row 1: Emisión / Vencimiento
      doc.rect(col3X, y + 2, c3W / 2, 14).strokeColor('#000000').lineWidth(0.5).stroke();
      doc.rect(col3X + c3W / 2, y + 2, c3W / 2, 14).strokeColor('#000000').lineWidth(0.5).stroke();
      doc.font('Helvetica-Bold').fontSize(7)
         .text('EMISIÓN', col3X, y + 5, { width: c3W / 2, align: 'center' })
         .text('VENCIMIENTO', col3X + c3W / 2, y + 5, { width: c3W / 2, align: 'center' });
      
      doc.font('Helvetica-Bold').fontSize(8)
         .text(date, col3X, y + 20, { width: c3W / 2, align: 'center' })
         .text(dueDate, col3X + c3W / 2, y + 20, { width: c3W / 2, align: 'center' });

      // Row 2: Área / Mes
      doc.rect(col3X, y + 36, c3W / 2, 14).strokeColor('#000000').lineWidth(0.5).stroke();
      doc.rect(col3X + c3W / 2, y + 36, c3W / 2, 14).strokeColor('#000000').lineWidth(0.5).stroke();
      doc.font('Helvetica-Bold').fontSize(7)
         .text('ÁREA (m²)', col3X, y + 39, { width: c3W / 2, align: 'center' })
         .text('MES', col3X + c3W / 2, y + 39, { width: c3W / 2, align: 'center' });

      doc.font('Helvetica').fontSize(8)
         .text(propertyArea ? `${propertyArea} m²` : '—', col3X, y + 55, { width: c3W / 2, align: 'center' })
         .text(periodName, col3X + c3W / 2, y + 55, { width: c3W / 2, align: 'center' });

      y += metaH + 6;

      // ─── 3. TABLA DE CONCEPTOS ──────────────────────────────
      const tableTop = y;
      const thH = 20;
      const cWidths = [W * 0.46, W * 0.18, W * 0.18, W * 0.18]; // 253.9, 99.3, 99.3, 99.3
      const cX = [
        L,
        L + cWidths[0],
        L + cWidths[0] + cWidths[1],
        L + cWidths[0] + cWidths[1] + cWidths[2]
      ];

      // Header background / border
      doc.rect(L, y, W, thH).strokeColor('#000000').lineWidth(1.2).stroke();
      // Vertical dividers in header
      doc.moveTo(cX[1], y).lineTo(cX[1], y + thH).strokeColor('#000000').lineWidth(0.8).stroke();
      doc.moveTo(cX[2], y).lineTo(cX[2], y + thH).strokeColor('#000000').lineWidth(0.8).stroke();
      doc.moveTo(cX[3], y).lineTo(cX[3], y + thH).strokeColor('#000000').lineWidth(0.8).stroke();

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000')
         .text('CONCEPTO', cX[0] + 6, y + 6, { width: cWidths[0] - 12, align: 'left' })
         .text('SALDO ANTERIOR', cX[1] + 4, y + 6, { width: cWidths[1] - 8, align: 'right' })
         .text('COBROS DEL MES', cX[2] + 4, y + 6, { width: cWidths[2] - 8, align: 'right' })
         .text('SALDO TOTAL', cX[3] + 4, y + 6, { width: cWidths[3] - 8, align: 'right' });

      y += thH;

      // Rows
      const rowItemH = 18;
      const minRows = Math.max(conceptsList.length, 6);

      for (let i = 0; i < minRows; i++) {
        const item = conceptsList[i];
        doc.rect(L, y, W, rowItemH).strokeColor('#000000').lineWidth(0.5).stroke();
        doc.moveTo(cX[1], y).lineTo(cX[1], y + rowItemH).strokeColor('#000000').lineWidth(0.5).stroke();
        doc.moveTo(cX[2], y).lineTo(cX[2], y + rowItemH).strokeColor('#000000').lineWidth(0.5).stroke();
        doc.moveTo(cX[3], y).lineTo(cX[3], y + rowItemH).strokeColor('#000000').lineWidth(0.5).stroke();

        if (item) {
          doc.font('Helvetica').fontSize(8).fillColor('#000000')
             .text(item.description, cX[0] + 6, y + 5, { width: cWidths[0] - 12, align: 'left' });

          const sAnt = item.saldoAnterior > 0 ? cleanFmt(item.saldoAnterior) : '';
          const cMes = item.cobrosMes > 0 ? cleanFmt(item.cobrosMes) : '';
          const sAct = item.saldoActual > 0 ? cleanFmt(item.saldoActual) : '';

          doc.text(sAnt, cX[1] + 4, y + 5, { width: cWidths[1] - 8, align: 'right' });
          doc.text(cMes, cX[2] + 4, y + 5, { width: cWidths[2] - 8, align: 'right' });
          doc.font('Helvetica-Bold').text(sAct, cX[3] + 4, y + 5, { width: cWidths[3] - 8, align: 'right' });
        }
        y += rowItemH;
      }

      y += 8;

      // ─── 4. TOTALES Y NOTAS ──────────────────────────────────
      const totalsW = 180;
      const notesW = W - totalsW - 15;

      // Box de Son en Letras
      doc.rect(L, y, notesW, 24).strokeColor('#000000').lineWidth(0.8).stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000')
         .text(numeroALetras(totalActual), L + 6, y + 7, { width: notesW - 12 });

      // Box de Total a Pagar
      const totX = L + W - totalsW;
      const totBoxH = 55;
      doc.rect(totX, y, totalsW, totBoxH).strokeColor('#000000').lineWidth(1.5).stroke();
      doc.rect(totX, y, totalsW, 16).strokeColor('#000000').lineWidth(0.8).stroke();
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#000000')
         .text('TOTAL A PAGAR', totX, y + 4, { width: totalsW, align: 'center' });

      doc.font('Helvetica-Bold').fontSize(16)
         .text('$', totX + 10, y + 26)
         .text(cleanFmt(totalActual), totX + 25, y + 26, { width: totalsW - 35, align: 'right' });

      // Observaciones / Instrucciones de pago
      const notesY = y + 30;
      const defaultNote = 'CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.';
      doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#000000')
         .text((notes || defaultNote).toUpperCase(), L, notesY, { width: notesW, lineGap: 2 });

      y += totBoxH + 12;

      // ─── 5. FOOTER ──────────────────────────────────────────
      doc.moveTo(L, doc.page.height - 45).lineTo(L + W, doc.page.height - 45).strokeColor('#000000').lineWidth(0.8).stroke();
      doc.font('Helvetica').fontSize(7.5).fillColor('#444444')
         .text('Documento emitido por GRAVY v2.0 / NIT. 901.442.115-3 — Sistema Integral de Control y Gestión de Propiedad Horizontal.', L, doc.page.height - 38, { width: W, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Test generation
const sampleData = {
  companyName: 'EDIFICIO MIRADOR DEL PARQUE P.H.',
  companyNit: '901.234.567-8',
  companyAddress: 'Calle 100 # 15-20',
  companyPhone: '310 123 4567',
  companyEmail: 'administracion@miradordelparque.com',
  companyCity: 'Bogotá D.C.',
  docNumber: 'CC-0125',
  docType: 'statement',
  period: '2026-08',
  date: '2026-08-01',
  dueDate: '2026-08-15',
  propertyName: 'APTO 302',
  propertyCode: '302',
  propertyArea: '85.5',
  propertyCoef: '1.2500%',
  propertyMatricula: '50C-123456',
  ownerName: 'CARLOS ALBERTO RAMÍREZ PÉREZ',
  ownerNit: '79.876.543',
  ownerAddress: 'Apto 302 Torre A',
  ownerPhone: '300 987 6543',
  ownerEmail: 'carlos.ramirez@example.com',
  conceptsList: [
    { description: 'Cuota de Administración Ordinaria', saldoAnterior: 0, cobrosMes: 450000, saldoActual: 450000 },
    { description: 'Cuota Extraordinaria Fachada (2/6)', saldoAnterior: 150000, cobrosMes: 150000, saldoActual: 300000 },
    { description: 'Intereses de Mora', saldoAnterior: 12500, cobrosMes: 0, saldoActual: 12500 }
  ],
  totalActual: 762500,
  notes: 'FAVOR CONSIGNAR EN LA CUENTA CORRIENTE BANCOLOMBIA No. 123-456789-01 A NOMBRE DEL CONJUNTO. ENVIAR SOPORTE A ADMINISTRACION@MIRADORDELPARQUE.COM.'
};

generatePhStatementPdf(sampleData).then(buf => {
  const outPath = path.join(__dirname, 'test_output_ph.pdf');
  fs.writeFileSync(outPath, buf);
  console.log('SUCCESS! PDF generated at:', outPath, 'Bytes:', buf.length);
}).catch(err => {
  console.error('ERROR:', err);
});
