function renderPhStatementPage(doc, statementData, pageIndex = 0, totalPages = 1, sharedOptions = {}) {
  const d = statementData || {};
  const c = sharedOptions.companyData || {};
  const companyName = d.companyName || c.companyName || 'COPROPIEDAD RESIDENCIAL P.H.';
  const companyNit = d.companyNit || c.companyNit || '';
  const companyAddress = d.companyAddress || c.companyAddress || '';
  const companyPhone = d.companyPhone || c.companyPhone || '';
  const companyEmail = d.companyEmail || c.companyEmail || '';
  const companyCity = d.companyCity || c.companyCity || '';
  const companyLogo = d.companyLogo || c.companyLogo || '';
  const sharedLogo = sharedOptions.sharedLogo || null;

  const docType = d.docType || 'invoice';
  const docLabel = docType === 'statement' ? 'ESTADO DE CUENTA' : 'CUENTA DE COBRO';
  const docNumber = d.docNumber || '0000';
  const period = d.period || '';

  const getMonthNameUpper = (p) => {
    if (!p) return '—';
    const parts = String(p).split('-');
    const m = parseInt(parts[1], 10) || 1;
    const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
    return months[m - 1] || '';
  };
  const periodName = getMonthNameUpper(period);
  const periodYear = period.split('-')[0] || '';

  const fmtDateDDMMYYYY = (dStr) => {
    if (!dStr) return '—';
    const s = String(dStr).trim();
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    return s;
  };

  const date = fmtDateDDMMYYYY(d.date);
  const dueDate = fmtDateDDMMYYYY(d.dueDate || d.date);

  const ownerName = d.ownerName || 'Copropietario';
  const ownerNit = d.ownerDocNumber || d.ownerNit || '—';
  const ownerAddress = d.ownerAddress || '';
  const ownerPhone = d.ownerPhone || '—';
  const ownerEmail = d.ownerEmail || '—';

  const prevMonthUnitRecaudo = Number(d.prevMonthUnitRecaudo) || 0;
  const prevMonthTotalRecaudo = Number(d.prevMonthTotalRecaudo) || 0;
  const prevMonthName = d.prevMonthName || '';

  const propertyName = d.propertyName || 'Unidad';
  const propertyCode = d.propertyCode || propertyName;
  const propertyArea = d.propertyArea || '';
  const propertyCoef = d.propertyCoef || '';
  const propertyMatricula = d.propertyMatricula || '';

  const getCanonicalConceptName = (rawDesc) => {
    if (!rawDesc) return 'CONCEPTO';
    const str = String(rawDesc).trim();
    const norm = str
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u');

    if (
      (norm.includes('interes') && norm.includes('mora')) ||
      norm === 'mora' ||
      norm.startsWith('mora ') ||
      norm.includes('intereses mora')
    ) {
      return 'INTERESES DE MORA';
    }

    if (
      norm.includes('cuota de administracion') ||
      norm.includes('cuota administracion') ||
      norm.includes('cuota ordinaria') ||
      norm === 'administracion'
    ) {
      return 'CUOTA ADMINISTRACION';
    }

    if (
      norm.includes('fondo de imprevistos') ||
      norm.includes('fondo imprevistos')
    ) {
      return 'FONDO DE IMPREVISTOS';
    }

    return str;
  };

  // Regrupar conceptos por rubro (ID-First con unificación canónica de mora)
  const rawList = d.conceptsList || [];
  const conceptsMap = {};
  rawList.forEach(item => {
    const rawId = item.conceptId || item.concept_id || '';
    const desc = getCanonicalConceptName(item.description);
    const isMora = desc === 'INTERESES DE MORA' || String(item.description || '').toLowerCase().includes('mora');
    const groupKey = isMora ? '__MORA__' : (rawId ? ('ID_' + rawId) : ('__TEXT_' + desc));
    const displayName = isMora ? 'INTERESES DE MORA' : (item.description ? String(item.description).toUpperCase() : desc);

    if (!conceptsMap[groupKey]) {
      conceptsMap[groupKey] = {
        conceptId: rawId,
        description: displayName,
        saldoAnterior: 0,
        cobrosMes: 0,
        saldoActual: 0
      };
    }
    conceptsMap[groupKey].saldoAnterior += Number(item.saldoAnterior) || 0;
    conceptsMap[groupKey].cobrosMes += Number(item.cobrosMes) || 0;
    conceptsMap[groupKey].saldoActual += Number(item.saldoActual) || 0;
  });

  const conceptsList = Object.keys(conceptsMap).map(k => conceptsMap[k]);
  conceptsList.sort((a, b) => {
    const nameA = a.description.toUpperCase();
    const nameB = b.description.toUpperCase();
    const isAntA = nameA.includes('ANTICIPO') || nameA.includes('SALDO A FAVOR');
    const isAntB = nameB.includes('ANTICIPO') || nameB.includes('SALDO A FAVOR');
    if (isAntA && !isAntB) return 1;
    if (!isAntA && isAntB) return -1;

    if (nameA.includes('ADMIN') && !nameB.includes('ADMIN')) return -1;
    if (!nameA.includes('ADMIN') && nameB.includes('ADMIN')) return 1;
    if (nameA.includes('MORA') && !nameB.includes('MORA')) return 1;
    if (!nameA.includes('MORA') && nameB.includes('MORA')) return -1;
    return nameA.localeCompare(nameB);
  });

  const totalActual = conceptsList.reduce((s, c) => s + c.saldoActual, 0);
  const notes = (d.notes || 'CONSIGNAR EN LAS CUENTAS BANCARIAS AUTORIZADAS DE LA COPROPIEDAD INDICANDO LA REFERENCIA DE UNIDAD PARA RECAUDO.').trim();

  const cleanFmt = (value) => {
    if (value === undefined || value === null || isNaN(Number(value))) return "0.00";
    var num = Number(value);
    var isNeg = num < 0;
    var absParts = Math.abs(num).toFixed(2).split('.');
    absParts[0] = absParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (isNeg ? "- " : "") + absParts[0];
  };

  const numeroALetras = (num) => {
    var rawFloat = parseFloat(String(num));
    if (isNaN(rawFloat) || Math.abs(rawFloat) < 0.01) return 'SON: CERO PESOS M/CTE';
    var isNegative = rawFloat < 0;
    var absVal = Math.abs(rawFloat);
    var tempNum = absVal.toFixed(2).split('.');
    var entero = parseInt(tempNum[0], 10);
    if (entero === 0) return 'SON: CERO PESOS M/CTE';
    function letras(n) {
      if (n <= 0) return '';
      if (n < 10) return ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'][n] || '';
      if (n < 20) return ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciséis', 'Diecisiete', 'Dieciocho', 'Diecinueve'][n - 10] || '';
      if (n < 30) return n === 20 ? 'Veinte' : 'Veinti' + letras(n - 20).toLowerCase();
      if (n < 100) {
        var u = n % 10;
        var d = Math.floor(n / 10);
        var decenas = ['', '', '', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
        return (decenas[d] || '') + (u > 0 ? ' y ' + letras(u).toLowerCase() : '');
      }
      if (n < 1000) {
        var d_u = n % 100;
        var c = Math.floor(n / 100);
        var centenas = ['', 'Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];
        if (n === 100) return 'Cien';
        if (c === 1) return 'Ciento ' + letras(d_u).toLowerCase();
        return (centenas[c] || '') + (d_u > 0 ? ' ' + letras(d_u).toLowerCase() : '');
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
      return String(n);
    }
    var res = letras(entero) || 'Cero';
    res = res.charAt(0).toUpperCase() + res.slice(1);
    var prefix = isNegative ? 'MENOS ' : '';
    return ('Son: ' + prefix + res + ' PESOS M/CTE').toUpperCase();
  };

  // ─── PALETA MONOCROMÁTICA EJECUTIVA (NEUTRAL MINIMALIST) ──
  const COLOR_PRIMARY      = '#111827';
  const COLOR_TEXT         = '#1f2937';
  const COLOR_MUTED        = '#4b5563';
  const COLOR_LIGHT        = '#d1d5db';
  const COLOR_BORDER       = '#d1d5db';
  const COLOR_BORDER_LIGHT = '#e5e7eb';
  const COLOR_BG_CARD      = '#f9fafb';
  const COLOR_BG_ALT       = '#f3f4f6';

  const W = doc.page.width - 56;
  const L = 28;
  let y = 22;

  // ─── 1. HEADER EJECUTIVO (Logo con Máximo Protagonismo Visual) ──
  const colLogoW = 140;
  const colBoxW  = 165;
  const colCenterW = W - colLogoW - colBoxW - 16;
  const headerBoxH = 72;

  let logoRendered = false;
  if (sharedLogo) {
    try {
      doc.image(sharedLogo, L, y + 2, { fit: [colLogoW - 5, headerBoxH - 4] });
      logoRendered = true;
    } catch (e) {
      console.warn('[ORCHESTRATOR PH] Error rendering shared logo:', e.message);
    }
  } else if (companyLogo) {
    try {
      const base64Data = companyLogo.replace(/^data:image\/\w+;base64,/, '');
      const imgBuf = Buffer.from(base64Data, 'base64');
      doc.image(imgBuf, L, y + 2, { fit: [colLogoW - 5, headerBoxH - 4] });
      logoRendered = true;
    } catch (e) {
      console.warn('[ORCHESTRATOR PH] Error rendering logo:', e.message);
    }
  }
  if (!logoRendered) {
    doc.roundedRect(L, y + 2, colLogoW - 15, headerBoxH - 6, 4)
       .fillAndStroke(COLOR_BG_CARD, COLOR_BORDER);
    doc.font('Helvetica-Bold').fontSize(16).fillColor(COLOR_PRIMARY)
       .text(companyName.substring(0, 4).toUpperCase(), L, y + 24, { width: colLogoW - 15, align: 'center' });
  }

  // Datos Copropiedad
  const centerX = L + colLogoW;
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor(COLOR_PRIMARY)
     .text(companyName.toUpperCase(), centerX, y + 2, { width: colCenterW, align: 'center' });
  
  let curCenterY = y + 17;
  if (companyNit) {
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_TEXT)
       .text(`NIT ${companyNit}`, centerX, curCenterY, { width: colCenterW, align: 'center' });
    curCenterY += 11;
  }
  
  doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_MUTED);
  if (companyAddress) {
    doc.text(companyAddress, centerX, curCenterY, { width: colCenterW, align: 'center' });
    curCenterY += 9.5;
  }
  if (companyPhone || companyEmail) {
    const contactLine = [companyPhone ? `Tel: ${companyPhone}` : '', companyEmail].filter(Boolean).join('  •  ');
    doc.text(contactLine, centerX, curCenterY, { width: colCenterW, align: 'center' });
    curCenterY += 9.5;
  }
  if (companyCity) {
    doc.text(companyCity, centerX, curCenterY, { width: colCenterW, align: 'center' });
    curCenterY += 9.5;
  }

  // Voucher Card
  const boxX = L + W - colBoxW;
  doc.roundedRect(boxX, y, colBoxW, headerBoxH, 5)
     .fillAndStroke('#ffffff', COLOR_BORDER);
  
  doc.roundedRect(boxX, y, colBoxW, 19, 4)
     .fill(COLOR_PRIMARY);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff')
     .text(docLabel, boxX, y + 5.5, { width: colBoxW, align: 'center', characterSpacing: 0.5 });

  doc.font('Helvetica-Bold').fontSize(13.5).fillColor(COLOR_PRIMARY)
     .text(`No. ${docNumber}`, boxX, y + 26, { width: colBoxW, align: 'center' });

  doc.moveTo(boxX + 10, y + 47).lineTo(boxX + colBoxW - 10, y + 47).strokeColor(COLOR_BORDER_LIGHT).lineWidth(0.6).stroke();

  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_MUTED)
     .text(`PERÍODO: `, boxX, y + 53, { width: colBoxW / 2 - 2, align: 'right' });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_PRIMARY)
     .text(`${periodName} ${periodYear}`.trim(), boxX + colBoxW / 2, y + 53, { width: colBoxW / 2 - 4, align: 'left' });

  y += headerBoxH + 7;

  doc.moveTo(L, y).lineTo(L + W, y).strokeColor(COLOR_BORDER).lineWidth(0.8).stroke();
  y += 6;

  // ─── 2. BLOQUE METADATOS: 3 PANELES ESTRUCTURADOS ────────
  const metaH = 80;
  const col1W = 250;
  const col2W = 145;
  const col3W = W - col1W - col2W - 12;

  // Panel 1: Datos del Copropietario
  const p1X = L;
  doc.roundedRect(p1X, y, col1W, metaH, 4).fillAndStroke(COLOR_BG_CARD, COLOR_BORDER);
  doc.rect(p1X, y, col1W, 16).fill(COLOR_PRIMARY);
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#ffffff')
     .text('INFORMACIÓN DEL COPROPIETARIO', p1X + 8, y + 4.5);

  let p1Y = y + 21;
  const renderMetaRow = (label, val, x, yPos, labelW, valW) => {
    doc.font('Helvetica-Bold').fontSize(7).fillColor(COLOR_MUTED).text(label, x, yPos);
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_TEXT).text(val || '—', x + labelW, yPos, { width: valW, ellipsis: true });
  };

  renderMetaRow('Nombre:', ownerName, p1X + 8, p1Y, 52, col1W - 68);
  p1Y += 13.5;
  renderMetaRow('NIT / C.C.:', ownerNit, p1X + 8, p1Y, 52, col1W - 68);
  p1Y += 13.5;
  renderMetaRow('Dirección:', ownerAddress || propertyName, p1X + 8, p1Y, 52, col1W - 68);
  p1Y += 13.5;
  renderMetaRow('Contacto:', [ownerPhone, ownerEmail].filter(s => s && s !== '—').join(' • ') || '—', p1X + 8, p1Y, 52, col1W - 68);

  // Panel 2: Unidad y Referencia Bancaria
  const p2X = p1X + col1W + 6;
  doc.roundedRect(p2X, y, col2W, metaH, 4).fillAndStroke(COLOR_BG_CARD, COLOR_BORDER);
  doc.rect(p2X, y, col2W, 16).fill(COLOR_PRIMARY);
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#ffffff')
     .text('INMUEBLE & REFERENCIA', p2X, y + 4.5, { width: col2W, align: 'center' });

  doc.font('Helvetica').fontSize(6.5).fillColor(COLOR_MUTED).text('UNIDAD / INMUEBLE', p2X, y + 21, { width: col2W, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_PRIMARY).text(propertyName, p2X, y + 30, { width: col2W, align: 'center' });

  doc.moveTo(p2X + 12, y + 45).lineTo(p2X + col2W - 12, y + 45).strokeColor(COLOR_BORDER_LIGHT).lineWidth(0.5).stroke();

  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(COLOR_MUTED).text('REF. BANCO / RECAUDO', p2X, y + 49, { width: col2W, align: 'center' });
  doc.roundedRect(p2X + 12, y + 59, col2W - 24, 15, 3).fillAndStroke('#ffffff', COLOR_PRIMARY);
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_PRIMARY)
     .text(propertyCode || propertyName, p2X + 12, y + 62.5, { width: col2W - 24, align: 'center' });

  // Panel 3: Fechas y Coeficiente
  const p3X = p2X + col2W + 6;
  doc.roundedRect(p3X, y, col3W, metaH, 4).fillAndStroke(COLOR_BG_CARD, COLOR_BORDER);
  doc.rect(p3X, y, col3W, 16).fill(COLOR_PRIMARY);
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#ffffff')
     .text('CONTROL & FECHAS', p3X, y + 4.5, { width: col3W, align: 'center' });

  let p3Y = y + 21;
  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLOR_MUTED).text('Emisión:', p3X + 8, p3Y);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_TEXT).text(date, p3X + 68, p3Y);
  p3Y += 13.5;

  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLOR_PRIMARY).text('Vence:', p3X + 8, p3Y);
  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_PRIMARY).text(dueDate, p3X + 68, p3Y);
  p3Y += 13.5;

  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLOR_MUTED).text('Área:', p3X + 8, p3Y);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_TEXT).text(propertyArea ? `${propertyArea} m²` : '—', p3X + 68, p3Y);
  p3Y += 13.5;

  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLOR_MUTED).text('Coeficiente:', p3X + 8, p3Y);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(COLOR_TEXT).text(propertyCoef ? `${propertyCoef}` : '—', p3X + 68, p3Y);

  y += metaH + 7;

  // ─── 3. BARRA DE RECAUDO UNIDAD HABITACIONAL & SALDO ANTERIOR ─
  const recH = 21;
  const prevMonthLabel = prevMonthName ? `(${prevMonthName})` : '';
  const halfGap = 8;
  const boxW = (W - halfGap) / 2;

  // Box 1 (Izquierda): Recaudo Mes Anterior de la Unidad
  const b1X = L;
  doc.roundedRect(b1X, y, boxW, recH, 3).fillAndStroke(COLOR_BG_ALT, COLOR_BORDER);
  doc.font('Helvetica-Bold').fontSize(7.2).fillColor(COLOR_TEXT)
     .text(`RECAUDO MES ANTERIOR UNIDAD ${prevMonthLabel}:`.toUpperCase(), b1X + 8, y + 6, { width: boxW - 95 });
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_PRIMARY)
     .text(`$ ${cleanFmt(prevMonthUnitRecaudo)}`, b1X + boxW - 88, y + 5.5, { width: 80, align: 'right' });

  // Box 2 (Derecha): Saldo Anterior al Corte
  const b2X = L + boxW + halfGap;
  let prevBal = 0;
  if (d.previousBalance !== undefined && d.previousBalance !== null) {
    prevBal = Number(d.previousBalance) || 0;
  } else if (Number(d.totalAdvanceAvailable) > 0.01) {
    prevBal = -Number(d.totalAdvanceAvailable);
  } else {
    const antSum = conceptsList.reduce((s, c) => s + (Number(c.saldoAnterior) || 0), 0);
    prevBal = antSum;
  }

  let prevBalLabel = '$ 0 (AL DÍA)';
  let prevBalColor = COLOR_PRIMARY;
  if (prevBal < -0.01) {
    prevBalLabel = `-$ ${cleanFmt(Math.abs(prevBal))} (A FAVOR)`;
    prevBalColor = '#047857';
  } else if (prevBal > 0.01) {
    prevBalLabel = `+$ ${cleanFmt(prevBal)} (EN MORA)`;
    prevBalColor = '#b91c1c';
  }

  doc.roundedRect(b2X, y, boxW, recH, 3).fillAndStroke(COLOR_BG_ALT, COLOR_BORDER);
  doc.font('Helvetica-Bold').fontSize(7.2).fillColor(COLOR_TEXT)
     .text('SALDO ANTERIOR AL CORTE:', b2X + 8, y + 6, { width: 130 });
  doc.font('Helvetica-Bold').fontSize(8.2).fillColor(prevBalColor)
     .text(prevBalLabel, b2X + 135, y + 5.5, { width: boxW - 143, align: 'right' });

  y += recH + 8;

  // ─── 4. TABLA DE CONCEPTOS & LIQUIDACIÓN ─────────────────
  const thH = 20;
  const cWidths = [W * 0.46, W * 0.18, W * 0.18, W * 0.18];
  const cX = [
    L,
    L + cWidths[0],
    L + cWidths[0] + cWidths[1],
    L + cWidths[0] + cWidths[1] + cWidths[2]
  ];

  doc.roundedRect(L, y, W, thH, 3).fill(COLOR_PRIMARY);
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#ffffff')
     .text('CONCEPTO / DESCRIPCIÓN', cX[0] + 8, y + 6, { width: cWidths[0] - 12, align: 'left' })
     .text('SALDO ANTERIOR', cX[1], y + 6, { width: cWidths[1] - 8, align: 'right' })
     .text('COBROS DEL MES', cX[2], y + 6, { width: cWidths[2] - 8, align: 'right' })
     .text('SALDO TOTAL', cX[3], y + 6, { width: cWidths[3] - 10, align: 'right' });

  y += thH;

  const rowItemH = 17;
  const targetRows = Math.max(conceptsList.length, 5);

  for (let i = 0; i < targetRows; i++) {
    const item = conceptsList[i];
    const isEven = i % 2 === 0;
    const rowBg = isEven ? '#ffffff' : COLOR_BG_CARD;

    doc.rect(L, y, W, rowItemH).fillAndStroke(rowBg, COLOR_BORDER_LIGHT);

    doc.moveTo(cX[1], y).lineTo(cX[1], y + rowItemH).strokeColor(COLOR_BORDER_LIGHT).lineWidth(0.5).stroke();
    doc.moveTo(cX[2], y).lineTo(cX[2], y + rowItemH).strokeColor(COLOR_BORDER_LIGHT).lineWidth(0.5).stroke();
    doc.moveTo(cX[3], y).lineTo(cX[3], y + rowItemH).strokeColor(COLOR_BORDER_LIGHT).lineWidth(0.5).stroke();

    if (item) {
      const isNeg = (item.saldoActual < -0.01) || (item.saldoAnterior < -0.01) || (item.cobrosMes < -0.01) ||
                    String(item.description || '').toUpperCase().includes('ANTICIPO') ||
                    String(item.description || '').toUpperCase().includes('SALDO A FAVOR');
      const textColor = isNeg ? '#047857' : COLOR_TEXT;

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(textColor)
         .text(item.description, cX[0] + 8, y + 4.5, { width: cWidths[0] - 14, ellipsis: true });

      const formatCol = (val, isTotalCol = false) => {
        const n = Number(val) || 0;
        if (Math.abs(n) < 0.01) return isTotalCol ? '$ 0' : '—';
        if (n < 0) return `-$ ${cleanFmt(Math.abs(n))}`;
        return `$ ${cleanFmt(n)}`;
      };

      const sAnt = formatCol(item.saldoAnterior, false);
      const cMes = formatCol(item.cobrosMes, false);
      const sAct = formatCol(item.saldoActual, true);

      const sAntColor = (item.saldoAnterior < -0.01) ? '#047857' : (item.saldoAnterior > 0.01 ? COLOR_TEXT : COLOR_MUTED);
      const cMesColor = (item.cobrosMes < -0.01) ? '#047857' : COLOR_TEXT;
      const sActColor = (item.saldoActual < -0.01) ? '#047857' : (item.saldoActual > 0.01 ? COLOR_PRIMARY : COLOR_MUTED);

      doc.font((item.saldoAnterior < -0.01) ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.5).fillColor(sAntColor)
         .text(sAnt, cX[1], y + 4.5, { width: cWidths[1] - 8, align: 'right' });
      doc.font((item.cobrosMes < -0.01) ? 'Helvetica-Bold' : 'Helvetica').fontSize(7.5).fillColor(cMesColor)
         .text(cMes, cX[2], y + 4.5, { width: cWidths[2] - 8, align: 'right' });
      doc.font('Helvetica-Bold').fontSize(8).fillColor(sActColor)
         .text(sAct, cX[3], y + 4.5, { width: cWidths[3] - 10, align: 'right' });
    }
    y += rowItemH;
  }

  y += 8;

  // ─── 5. TOTALES Y BLOQUE DE RECAUDO ──────────────────────
  const totalsBoxW = 195;
  const notesBoxW  = W - totalsBoxW - 12;
  const totBoxH    = 60;

  doc.roundedRect(L, y, notesBoxW, 23, 3).fillAndStroke(COLOR_BG_CARD, COLOR_BORDER);
  doc.font('Helvetica-Bold').fontSize(7).fillColor(COLOR_PRIMARY)
     .text(numeroALetras(totalActual), L + 8, y + 6.5, { width: notesBoxW - 16, ellipsis: true });

  const totX = L + W - totalsBoxW;
  doc.roundedRect(totX, y, totalsBoxW, totBoxH, 5)
     .fillAndStroke(COLOR_PRIMARY, COLOR_PRIMARY);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_LIGHT)
     .text('TOTAL A PAGAR', totX, y + 9, { width: totalsBoxW, align: 'center', characterSpacing: 1 });

  doc.font('Helvetica-Bold').fontSize(17).fillColor('#ffffff')
     .text(`$ ${cleanFmt(totalActual)}`, totX, y + 25, { width: totalsBoxW, align: 'center' });

  doc.font('Helvetica').fontSize(6.5).fillColor(COLOR_LIGHT)
     .text(`PAGAR ANTES DE: ${dueDate}`, totX, y + 47, { width: totalsBoxW, align: 'center' });

  const notesY = y + 28;
  const notesH = totBoxH - 28;
  doc.roundedRect(L, notesY, notesBoxW, notesH, 3).fillAndStroke('#ffffff', COLOR_BORDER);
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(COLOR_PRIMARY)
     .text('INSTRUCCIONES DE CONSIGNACIÓN Y PAGO:', L + 8, notesY + 5);
  doc.font('Helvetica').fontSize(6.8).fillColor(COLOR_TEXT)
     .text(notes.toUpperCase(), L + 8, notesY + 14, { width: notesBoxW - 16, lineGap: 1.5 });

  y += totBoxH + 10;

  // ─── 6. FOOTER BLINDADO (GARANTÍA 1 PÁGINA) ──────────────
  const footerLineY = doc.page.height - 24;
  doc.moveTo(L, footerLineY).lineTo(L + W, footerLineY).strokeColor(COLOR_BORDER_LIGHT).lineWidth(0.6).stroke();

  doc.font('Helvetica').fontSize(6.5).fillColor(COLOR_MUTED)
     .text('Documento emitido por GRAVY v2.0 / NIT. 901.442.115-3 — Sistema Integral de Control y Gestión de Propiedad Horizontal.', L, footerLineY + 5, { width: W - 110, align: 'left', lineBreak: false });
  
  const pageLabel = totalPages > 1 ? `Pág. ${pageIndex + 1} de ${totalPages}` : 'Página 1 de 1';
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor(COLOR_MUTED)
     .text(pageLabel, L + W - 100, footerLineY + 5, { width: 100, align: 'right', lineBreak: false });
}

/**
 * Generador de PDF individual de Cuentas de Cobro / Estados de Cuenta para Copropiedades
 */
function generatePhStatementPdf(statementData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margins: { top: 22, bottom: 10, left: 28, right: 28 },
        size: 'LETTER',
        bufferPages: true,
        autoFirstPage: true
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      renderPhStatementPage(doc, statementData, 0, 1);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generador de PDF ÚNICO MULTIPÁGINA consolidando todas las facturas de un lote/período
 * Optimizado: Streaming directo (sin bufferPages en RAM) y logo pre-parseado una sola vez.
 */
function generatePhMultiStatementPdf(statementsArray, companyData = {}) {
  return new Promise((resolve, reject) => {
    try {
      const list = Array.isArray(statementsArray) ? statementsArray : [];
      const totalPages = list.length;

      const doc = new PDFDocument({
        margins: { top: 22, bottom: 10, left: 28, right: 28 },
        size: 'LETTER',
        bufferPages: false, // STREAMING DIRECTO: libera cada página de RAM inmediatamente (elimina GC Thrashing)
        autoFirstPage: false
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Pre-cargar y pre-parsear el logotipo UNA SOLA VEZ para todo el documento
      let sharedLogo = null;
      const rawLogo = (companyData && companyData.companyLogo) || (list[0] && list[0].companyLogo) || '';
      if (rawLogo) {
        try {
          const base64Data = rawLogo.replace(/^data:image\/\w+;base64,/, '');
          const imgBuf = Buffer.from(base64Data, 'base64');
          sharedLogo = doc.openImage(imgBuf);
        } catch (e) {
          console.warn('[ORCHESTRATOR PH] Advertencia al pre-parsear logo único:', e.message);
        }
      }

      const sharedOptions = {
        sharedLogo,
        companyData: companyData || {}
      };

      if (list.length === 0) {
        doc.addPage({ margins: { top: 22, bottom: 10, left: 28, right: 28 } });
        doc.font('Helvetica').fontSize(12).text('No hay facturas para mostrar en este período.', 50, 100);
      } else {
        for (let i = 0; i < list.length; i++) {
          doc.addPage({ margins: { top: 22, bottom: 10, left: 28, right: 28 } });
          renderPhStatementPage(doc, list[i], i, totalPages, sharedOptions);
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

app.post('/api/ph/generate-pdf', async (req, res) => {
  try {
    const { filename = 'cuenta_cobro', statementData, format } = req.body;
    const pdfBuffer = await generatePhStatementPdf(statementData);
    
    // Si se solicita en formato base64 para descarga en frontend
    if (format === 'base64') {
      const sanitizedFilename = String(filename).replace(/[^a-zA-Z0-9_\-]/g, '_');
      return res.json({
        success: true,
        pdfBase64: pdfBuffer.toString('base64'),
        filename: `${sanitizedFilename}.pdf`
      });
    }

    // Si se solicita explícitamente en formato binario para visualización o descarga
    if (format === 'binary' || req.query.download === '1') {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,
        'Content-Disposition': `inline; filename="${filename}.pdf"`
      });
      return res.send(pdfBuffer);
    }

    // Por defecto guardar en temp_pdfs y retornar ruta absoluta para consumo seguro en PocketBase
    const tempDir = path.resolve(__dirname, '..', 'temp_pdfs');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const sanitizedFilename = String(filename).replace(/[^a-zA-Z0-9_\-]/g, '_');
    const absolutePdfPath = path.join(tempDir, `${sanitizedFilename}.pdf`);
    fs.writeFileSync(absolutePdfPath, pdfBuffer);

    console.log(`[GRAVY ORCHESTRATOR] PDF de copropiedad guardado en: ${absolutePdfPath}`);
    res.json({
      success: true,
      pdfPath: absolutePdfPath,
      filename: `${sanitizedFilename}.pdf`
    });
  } catch (err) {
    console.error('[GRAVY ORCHESTRATOR] Error al generar PDF Copropiedades:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────
// ROUTE: Generar PDF Único Unificado (Multipágina) para el lote del período
// ──────────────────────────────────────────────────────────
app.post('/api/ph/generate-bulk-pdf', async (req, res) => {
  try {
    const { filename = 'Facturas_Copropiedad', statements = [], companyData = {}, format = 'base64' } = req.body;
    console.log(`[GRAVY ORCHESTRATOR] Generando PDF unificado con ${statements.length} facturas/páginas (modo streaming de alto rendimiento)...`);

    const pdfBuffer = await generatePhMultiStatementPdf(statements, companyData);
    const sanitizedFilename = String(filename).replace(/[^a-zA-Z0-9_\-]/g, '_');

    if (format === 'base64') {
      return res.json({
        success: true,
        pdfBase64: pdfBuffer.toString('base64'),
        filename: `${sanitizedFilename}.pdf`,
        totalPages: statements.length
      });
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="${sanitizedFilename}.pdf"`
    });
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('[GRAVY ORCHESTRATOR] Error al generar PDF unificado Copropiedades:', err);
    res.status(500).json({ error: err.message });
  }
});



