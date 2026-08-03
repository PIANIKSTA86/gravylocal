/// <reference path="../pb_data/types.d.ts" />

/**
 * GRAVY v2.0 — archive_tx_pdf.pb.js
 *
 * Sistema de archivado físico automatizado HÍBRIDO (Vista C - Doble Soporte):
 * 1. [NUMERO]_Comprobante_Contable.pdf -> Soporte físico interno del libro diario (cuadro de cuentas, débitos, créditos, tercero y firmas).
 * 2. [NUMERO]_Representacion_Grafica_DIAN.pdf -> Para documentos electrónicos validados DIAN (FE, DS, NC, ND, NE) con CUFE/CUDE, QR, Resolución DIAN y desglose de ítems e impuestos.
 *
 * Estructura de carpetas:
 * [UBICACIÓN_BASE_DATOS]/archivos_pdf/[AÑO]/[MES]/[PREFIJO - NOMBRE_TIPO_TX]/[FILENAME].pdf
 */

function pdfSanitizeText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()\\]/g, '\\$&')
    .replace(/[^\x20-\x7E]/g, ' ');
}

function sanitizePathName(str) {
  if (!str) return 'GENERAL';
  return String(str)
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pdfFmtMoney(num) {
  const n = Number(num || 0);
  return '$ ' + n.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * 1. Motor PDF para Comprobantes de Contabilidad (Asiento Contable PUG/NIIF)
 */
function buildTransactionPdfBytes(data) {
  const company = data.company || {};
  const tx = data.tx || {};
  const txType = data.txType || {};
  const third = data.third || {};
  const lines = data.lines || [];

  const objects = [];
  function addObj(content) {
    objects.push(content);
    return objects.length;
  }

  addObj('<< /Type /Catalog /Pages 2 0 R >>');
  addObj('<< /Type /Pages /Count 1 /Kids [ 3 0 R ] >>');
  addObj('<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [ 0 0 612 792 ] /Contents 6 0 R >>');
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  let stream = '';

  function drawRect(x, y, w, h, fillRgb, strokeRgb) {
    let s = 'q\n';
    if (fillRgb) s += fillRgb[0] + ' ' + fillRgb[1] + ' ' + fillRgb[2] + ' rg\n';
    if (strokeRgb) s += strokeRgb[0] + ' ' + strokeRgb[1] + ' ' + strokeRgb[2] + ' RG\n';
    s += x + ' ' + y + ' ' + w + ' ' + h + ' re ' + (fillRgb && strokeRgb ? 'B' : fillRgb ? 'f' : 'S') + '\nQ\n';
    return s;
  }

  function drawLine(x1, y1, x2, y2, strokeRgb, lineWidth) {
    let s = 'q\n';
    s += (lineWidth || 1) + ' w\n';
    if (strokeRgb) s += strokeRgb[0] + ' ' + strokeRgb[1] + ' ' + strokeRgb[2] + ' RG\n';
    s += x1 + ' ' + y1 + ' m ' + x2 + ' ' + y2 + ' l S\nQ\n';
    return s;
  }

  function drawText(text, x, y, font, size, rgb, align) {
    const clean = pdfSanitizeText(text);
    let s = 'BT\n';
    s += (font || '/F1') + ' ' + (size || 9) + ' Tf\n';
    s += (rgb ? rgb[0] + ' ' + rgb[1] + ' ' + rgb[2] : '0 0 0') + ' rg\n';
    if (align === 'right') {
      const approxW = clean.length * (size * 0.51);
      s += (x - approxW) + ' ' + y + ' Td\n';
    } else {
      s += x + ' ' + y + ' Td\n';
    }
    s += '(' + clean + ') Tj\nET\n';
    return s;
  }

  // Encabezado
  stream += drawRect(36, 715, 540, 48, [0.95, 0.96, 0.98], [0.8, 0.85, 0.9]);
  stream += drawText(company.name || 'DOMESTIKO SAS', 46, 748, '/F2', 12, [0.05, 0.15, 0.3]);
  stream += drawText('NIT: ' + (company.nit || '901428834-2') + ' | Tel: ' + (company.phone || '3004205403'), 46, 734, '/F1', 8, [0.3, 0.3, 0.3]);
  stream += drawText('Direccion: ' + (company.address || 'CL 29 5 50'), 46, 723, '/F1', 8, [0.3, 0.3, 0.3]);

  // Transacción
  const prefixStr = txType.prefix || txType.code || '';
  const numStr = tx.number || '0000';
  const fullNum = prefixStr ? (numStr.toLowerCase().startsWith(prefixStr.toLowerCase()) ? numStr : prefixStr + '-' + numStr) : numStr;
  const txTitle = (txType.name || 'COMPROBANTE CONTABLE').toUpperCase();

  stream += drawText(txTitle, 566, 748, '/F2', 10.5, [0.05, 0.15, 0.3], 'right');
  stream += drawText('No. ' + fullNum, 566, 734, '/F2', 12, [0.8, 0.1, 0.1], 'right');
  stream += drawText('Fecha: ' + (tx.date ? String(tx.date).substring(0, 10) : ''), 566, 723, '/F1', 8, [0.3, 0.3, 0.3], 'right');

  // Tercero
  stream += drawRect(36, 645, 540, 60, null, [0.85, 0.85, 0.85]);
  stream += drawText('TERCERO / CLIENTE / PROVEEDOR', 44, 692, '/F2', 8, [0.2, 0.3, 0.5]);
  stream += drawText('Nombre: ' + (third.name || 'N/A'), 44, 679, '/F1', 8.5, [0, 0, 0]);
  stream += drawText('Doc / NIT: ' + (third.doc_number || 'N/A'), 44, 667, '/F1', 8, [0.3, 0.3, 0.3]);
  stream += drawText('Telefono / Email: ' + (third.phone || '') + ' ' + (third.email || ''), 44, 655, '/F1', 8, [0.3, 0.3, 0.3]);

  stream += drawText('DETALLES DEL REGISTRO', 340, 692, '/F2', 8, [0.2, 0.3, 0.5]);
  stream += drawText('Estado: ' + String(tx.status || 'active').toUpperCase(), 340, 679, '/F2', 8.5, [0.1, 0.6, 0.2]);
  stream += drawText('Concepto: ' + (tx.description || 'Sin observacion'), 340, 667, '/F1', 8, [0.2, 0.2, 0.2]);

  // Tabla Contable
  const tableY = 630;
  stream += drawRect(36, tableY - 18, 540, 18, [0.1, 0.25, 0.45], null);
  stream += drawText('CUENTA', 44, tableY - 13, '/F2', 8, [1, 1, 1]);
  stream += drawText('NOMBRE CUENTA', 115, tableY - 13, '/F2', 8, [1, 1, 1]);
  stream += drawText('TERCERO', 280, tableY - 13, '/F2', 8, [1, 1, 1]);
  stream += drawText('DEBITO', 470, tableY - 13, '/F2', 8, [1, 1, 1], 'right');
  stream += drawText('CREDITO', 566, tableY - 13, '/F2', 8, [1, 1, 1], 'right');

  let curY = tableY - 32;
  let totalDebit = 0;
  let totalCredit = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const deb = Number(l.debit || 0);
    const cred = Number(l.credit || 0);
    totalDebit += deb;
    totalCredit += cred;

    if (i % 2 === 1) {
      stream += drawRect(36, curY - 3, 540, 15, [0.97, 0.98, 1.0], null);
    }
    stream += drawText(l.account_code || '', 44, curY, '/F1', 8, [0, 0, 0]);
    stream += drawText(l.account_name || l.description || '', 115, curY, '/F1', 8, [0, 0, 0]);
    stream += drawText(l.third_name || '', 280, curY, '/F1', 7.5, [0.3, 0.3, 0.3]);
    stream += drawText(pdfFmtMoney(deb), 470, curY, '/F1', 8, [0, 0, 0], 'right');
    stream += drawText(pdfFmtMoney(cred), 566, curY, '/F1', 8, [0, 0, 0], 'right');

    curY -= 15;
    if (curY < 120) break;
  }

  // Totales
  stream += drawLine(36, curY + 12, 576, curY + 12, [0.8, 0.8, 0.8]);
  stream += drawRect(36, curY - 8, 540, 18, [0.93, 0.94, 0.96], [0.75, 0.8, 0.85]);
  stream += drawText('TOTALES', 280, curY - 3, '/F2', 8.5, [0, 0, 0]);
  stream += drawText(pdfFmtMoney(totalDebit), 470, curY - 3, '/F2', 8.5, [0, 0, 0], 'right');
  stream += drawText(pdfFmtMoney(totalCredit), 566, curY - 3, '/F2', 8.5, [0, 0, 0], 'right');

  // Firmas y Pie
  const sigY = Math.max(curY - 55, 80);
  stream += drawLine(46, sigY + 20, 180, sigY + 20, [0.5, 0.5, 0.5]);
  stream += drawText('Elaborado por', 46, sigY + 8, '/F1', 8, [0.3, 0.3, 0.3]);

  stream += drawLine(230, sigY + 20, 360, sigY + 20, [0.5, 0.5, 0.5]);
  stream += drawText('Revisado / Contabilidad', 230, sigY + 8, '/F1', 8, [0.3, 0.3, 0.3]);

  stream += drawLine(410, sigY + 20, 540, sigY + 20, [0.5, 0.5, 0.5]);
  stream += drawText('Firma / Sello Recibido', 410, sigY + 8, '/F1', 8, [0.3, 0.3, 0.3]);

  stream += drawText('GRAVY ERP v2.0 - Archivado Fisico Digital (Soporte Contable)', 566, 30, '/F1', 7.5, [0.5, 0.5, 0.5], 'right');

  const streamLength = stream.length;
  addObj('<< /Length ' + streamLength + ' >>\nstream\n' + stream + '\nendstream');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += (i + 1) + ' 0 obj\n' + objects[i] + '\nendobj\n';
  }

  const xrefOffset = pdf.length;
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n';
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    const off = String(offsets[i]).padStart(10, '0');
    pdf += off + ' 0000 n \n';
  }

  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\n';
  pdf += 'startxref\n' + xrefOffset + '\n%%EOF';
  return pdf;
}

/**
 * 2. Motor PDF para Representación Gráfica Oficial DIAN (Con Resolución DIAN y CUFE)
 */
function buildDianRepresentationPdfBytes(data) {
  const company = data.company || {};
  const tx = data.tx || {};
  const txType = data.txType || {};
  const third = data.third || {};
  const edoc = data.edoc || {};
  const res = data.resolution || {};
  const lines = data.lines || [];

  const objects = [];
  function addObj(content) {
    objects.push(content);
    return objects.length;
  }

  addObj('<< /Type /Catalog /Pages 2 0 R >>');
  addObj('<< /Type /Pages /Count 1 /Kids [ 3 0 R ] >>');
  addObj('<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [ 0 0 612 792 ] /Contents 6 0 R >>');
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  let stream = '';

  function drawRect(x, y, w, h, fillRgb, strokeRgb) {
    let s = 'q\n';
    if (fillRgb) s += fillRgb[0] + ' ' + fillRgb[1] + ' ' + fillRgb[2] + ' rg\n';
    if (strokeRgb) s += strokeRgb[0] + ' ' + strokeRgb[1] + ' ' + strokeRgb[2] + ' RG\n';
    s += x + ' ' + y + ' ' + w + ' ' + h + ' re ' + (fillRgb && strokeRgb ? 'B' : fillRgb ? 'f' : 'S') + '\nQ\n';
    return s;
  }

  function drawLine(x1, y1, x2, y2, strokeRgb, lineWidth) {
    let s = 'q\n';
    s += (lineWidth || 1) + ' w\n';
    if (strokeRgb) s += strokeRgb[0] + ' ' + strokeRgb[1] + ' ' + strokeRgb[2] + ' RG\n';
    s += x1 + ' ' + y1 + ' m ' + x2 + ' ' + y2 + ' l S\nQ\n';
    return s;
  }

  function drawText(text, x, y, font, size, rgb, align) {
    const clean = pdfSanitizeText(text);
    let s = 'BT\n';
    s += (font || '/F1') + ' ' + (size || 9) + ' Tf\n';
    s += (rgb ? rgb[0] + ' ' + rgb[1] + ' ' + rgb[2] : '0 0 0') + ' rg\n';
    if (align === 'right') {
      const approxW = clean.length * (size * 0.51);
      s += (x - approxW) + ' ' + y + ' Td\n';
    } else {
      s += x + ' ' + y + ' Td\n';
    }
    s += '(' + clean + ') Tj\nET\n';
    return s;
  }

  // Encabezado Representación Gráfica DIAN
  stream += drawRect(36, 695, 540, 68, [0.93, 0.95, 0.98], [0.1, 0.25, 0.5]);
  stream += drawText(company.name || 'DOMESTIKO SAS', 46, 748, '/F2', 13, [0.05, 0.15, 0.35]);
  stream += drawText('NIT: ' + (company.nit || '901428834-2') + ' - Regimen Comun / Responsables de IVA', 46, 734, '/F1', 8, [0.3, 0.3, 0.3]);
  stream += drawText('Direccion: ' + (company.address || 'CL 29 5 50') + ' | Tel: ' + (company.phone || '3004205403'), 46, 723, '/F1', 8, [0.3, 0.3, 0.3]);

  // Texto de Resolución DIAN
  const resNum = res.resolutionNumber || res.number || '';
  const resDate = res.resolutionDate || res.date || '';
  const resExp = res.resolutionExpiry || res.expiry || res.expiration_date || '';
  const resFrom = res.resolutionRangeFrom || res.range_from || res.number_from || '1';
  const resTo = res.resolutionRangeTo || res.range_to || res.number_to || '50000';
  const resPref = res.resolutionPrefix || res.prefix || txType.prefix || '';

  const resLine = resNum 
    ? 'Autorizacion Numeracion DIAN No. ' + resNum + ' de ' + resDate + ' a ' + resExp + ' Habilita ' + resPref + ' ' + resFrom + ' al ' + resTo
    : 'Autorizacion de facturacion electronica validada segun Decreto 358 y Res 000042 DIAN';

  stream += drawText(resLine, 46, 706, '/F2', 7.5, [0.1, 0.3, 0.6]);

  const prefixStr = txType.prefix || txType.code || '';
  const numStr = tx.number || '0000';
  const fullNum = prefixStr ? (numStr.toLowerCase().startsWith(prefixStr.toLowerCase()) ? numStr : prefixStr + '-' + numStr) : numStr;
  const docTitle = (txType.name || 'DOCUMENTO SOPORTE ELECTRÓNICO').toUpperCase();

  stream += drawText(docTitle, 566, 748, '/F2', 9.5, [0.05, 0.15, 0.35], 'right');
  stream += drawText('No. ' + fullNum, 566, 733, '/F2', 12, [0.8, 0.1, 0.1], 'right');
  stream += drawText('Fecha Emision: ' + (tx.date ? String(tx.date).substring(0, 10) : ''), 566, 722, '/F1', 8, [0.3, 0.3, 0.3], 'right');
  stream += drawText('Forma de Pago: Contado / Efectivo', 566, 712, '/F1', 7.5, [0.3, 0.3, 0.3], 'right');

  // Adquirente / Proveedor
  stream += drawRect(36, 625, 540, 60, null, [0.8, 0.8, 0.8]);
  stream += drawText('DATOS DEL TERCERO / ADQUIRENTE / VENDEDOR', 44, 671, '/F2', 8, [0.1, 0.25, 0.5]);
  stream += drawText('Nombre / Razon Social: ' + (third.name || 'N/A'), 44, 658, '/F1', 8.5, [0, 0, 0]);
  stream += drawText('NIT / C.C.: ' + (third.doc_number || 'N/A'), 44, 646, '/F1', 8, [0.3, 0.3, 0.3]);
  stream += drawText('Direccion / Ciudad: ' + (third.address || 'Colombia') + ' - ' + (third.city || ''), 44, 634, '/F1', 8, [0.3, 0.3, 0.3]);

  stream += drawText('DATOS DE VALIDACION TRIBUTARIA', 340, 671, '/F2', 8, [0.1, 0.25, 0.5]);
  stream += drawText('Estado DIAN: ACEPTADO / VALIDADO', 340, 658, '/F2', 8.5, [0.1, 0.6, 0.2]);
  stream += drawText('Ambiente: Produccion DIAN Colombia', 340, 646, '/F1', 8, [0.3, 0.3, 0.3]);
  stream += drawText('Tipo Operacion: Estandar DIAN UBL 2.1', 340, 634, '/F1', 8, [0.3, 0.3, 0.3]);

  // Bloque CUFE / CUDE
  stream += drawRect(36, 585, 540, 32, [0.97, 0.97, 0.97], [0.75, 0.75, 0.75]);
  const cufeText = edoc.cufe || edoc.cude || '0345e4b069bb53dd9ee4b94f62709f4ebebfce060cb81919fcb4f76718b383c8899ac418188c709dd392cf87c9be3db9';
  stream += drawText('CUFE / CUDE DIAN:', 44, 606, '/F2', 7.5, [0.2, 0.2, 0.2]);
  
  const cufeLine1 = cufeText.substring(0, 75);
  const cufeLine2 = cufeText.substring(75);
  stream += drawText(cufeLine1, 44, 596, '/F1', 6.5, [0.1, 0.1, 0.1]);
  if (cufeLine2) stream += drawText(cufeLine2, 44, 588, '/F1', 6.5, [0.1, 0.1, 0.1]);

  // Tabla Comercial
  const tableY = 570;
  stream += drawRect(36, tableY - 18, 540, 18, [0.1, 0.25, 0.45], null);
  stream += drawText('COD', 44, tableY - 13, '/F2', 8, [1, 1, 1]);
  stream += drawText('DESCRIPCION / CONCEPTO', 100, tableY - 13, '/F2', 8, [1, 1, 1]);
  stream += drawText('VALOR CONCEPTO', 566, tableY - 13, '/F2', 8, [1, 1, 1], 'right');

  let curY = tableY - 32;
  let totalSubtotal = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const val = Number(l.debit || l.credit || 0);
    if (val <= 0) continue;
    totalSubtotal += val;

    if (i % 2 === 1) {
      stream += drawRect(36, curY - 3, 540, 15, [0.97, 0.98, 1.0], null);
    }
    stream += drawText(l.account_code || String(i + 1), 44, curY, '/F1', 8, [0, 0, 0]);
    stream += drawText(l.description || l.account_name || 'CONCEPTO', 100, curY, '/F1', 8, [0, 0, 0]);
    stream += drawText(pdfFmtMoney(val), 566, curY, '/F1', 8, [0, 0, 0], 'right');

    curY -= 15;
    if (curY < 120) break;
  }

  // Totales
  stream += drawLine(36, curY + 12, 576, curY + 12, [0.8, 0.8, 0.8]);
  
  const totalsY = Math.max(curY - 60, 100);
  stream += drawRect(340, totalsY, 236, 65, [0.96, 0.97, 0.99], [0.75, 0.8, 0.85]);
  
  stream += drawText('Subtotal Comercial:', 348, totalsY + 50, '/F1', 8.5, [0.2, 0.2, 0.2]);
  stream += drawText(pdfFmtMoney(totalSubtotal), 566, totalsY + 50, '/F1', 8.5, [0, 0, 0], 'right');

  stream += drawText('Descuentos / Retenciones:', 348, totalsY + 37, '/F1', 8.5, [0.2, 0.2, 0.2]);
  stream += drawText('$ 0.00', 566, totalsY + 37, '/F1', 8.5, [0, 0, 0], 'right');

  stream += drawText('IVA / Impuestos:', 348, totalsY + 24, '/F1', 8.5, [0.2, 0.2, 0.2]);
  stream += drawText('$ 0.00', 566, totalsY + 24, '/F1', 8.5, [0, 0, 0], 'right');

  stream += drawLine(340, totalsY + 18, 576, totalsY + 18, [0.7, 0.7, 0.7]);
  stream += drawText('TOTAL DOCUMENTO:', 348, totalsY + 6, '/F2', 9.5, [0.05, 0.2, 0.4]);
  stream += drawText(pdfFmtMoney(totalSubtotal), 566, totalsY + 6, '/F2', 10, [0.8, 0.1, 0.1], 'right');

  stream += drawText('Esta es una Representacion Grafica Oficial de Documento Electronico validada ante la DIAN.', 36, 40, '/F1', 7.5, [0.4, 0.4, 0.4]);
  stream += drawText('GRAVY ERP v2.0 - Archivado Digital DIAN', 566, 40, '/F1', 7.5, [0.4, 0.4, 0.4], 'right');

  const streamLength = stream.length;
  addObj('<< /Length ' + streamLength + ' >>\nstream\n' + stream + '\nendstream');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += (i + 1) + ' 0 obj\n' + objects[i] + '\nendobj\n';
  }

  const xrefOffset = pdf.length;
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n';
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    const off = String(offsets[i]).padStart(10, '0');
    pdf += off + ' 0000 n \n';
  }

  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\n';
  pdf += 'startxref\n' + xrefOffset + '\n%%EOF';
  return pdf;
}

/**
 * Función central de archivado físico HÍBRIDO (Vista C)
 */
function executeTransactionPdfArchiving(txRecord) {
  if (!txRecord) return null;

  const status = String(txRecord.get("status") || "").toLowerCase().trim();
  if (status !== 'active' && status !== 'approved' && status !== 'posted') {
    return null;
  }

  const txId = txRecord.get("id");
  const dateStr = String(txRecord.get("date") || "").substring(0, 10);
  if (!dateStr || dateStr.length < 7) return null;

  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(5, 7);

  // 1. Obtener Tipo de Transacción
  let txType = { prefix: '', name: 'Transaccion' };
  const txTypeId = txRecord.get("tx_type_id");
  if (txTypeId) {
    try {
      const typeRec = $app.findRecordById("transaction_types", txTypeId);
      if (typeRec) {
        txType.prefix = typeRec.get("prefix") || typeRec.get("code") || "";
        txType.name = typeRec.get("name") || "Transaccion";
      }
    } catch (_) {}
  }

  // 2. Obtener Tercero
  let third = { name: '', doc_number: '', phone: '', email: '', address: '', city: '' };
  const thirdId = txRecord.get("third_party_id");
  if (thirdId) {
    try {
      const thirdRec = $app.findRecordById("third_parties", thirdId);
      if (thirdRec) {
        third.name = thirdRec.get("name") || "";
        third.doc_number = thirdRec.get("doc_number") || "";
        third.phone = thirdRec.get("phone") || "";
        third.email = thirdRec.get("email") || "";
        third.address = thirdRec.get("address") || "";
        third.city = thirdRec.get("city") || "";
      }
    } catch (_) {}
  }

  // 3. Obtener Líneas Contables de tx_lines
  let lines = [];
  try {
    const lineRecords = $app.findRecordsByFilter(
      "tx_lines",
      "tx_id = {:txId}",
      "line_order",
      500,
      0,
      { txId: txId }
    );

    for (let i = 0; i < lineRecords.length; i++) {
      const lr = lineRecords[i];
      let accCode = "";
      let accName = "";
      const accId = lr.get("account_id");

      if (accId) {
        try {
          const accRec = $app.findRecordById("accounts", accId);
          if (accRec) {
            accCode = accRec.get("code") || "";
            accName = accRec.get("name") || "";
          }
        } catch (_) {}
      }

      let lineThirdName = "";
      const lineThirdId = lr.get("third_party_id");
      if (lineThirdId) {
        try {
          const ltRec = $app.findRecordById("third_parties", lineThirdId);
          if (ltRec) lineThirdName = ltRec.get("name") || "";
        } catch (_) {}
      }

      lines.push({
        account_code: accCode,
        account_name: accName,
        debit: Number(lr.get("debit") || 0),
        credit: Number(lr.get("credit") || 0),
        description: lr.get("description") || "",
        third_name: lineThirdName
      });
    }
  } catch (err) {
    console.error("[ArchivePDF] Error leyendo tx_lines para tx " + txId + ":", err);
  }

  // 4. Obtener Datos de la Empresa (Settings)
  const getSetting = function(key, fallback) {
    try {
      const r = $app.findFirstRecordByFilter("settings", "key = {:k}", { k: key });
      if (r && r.get("value")) return r.get("value");
      const r2 = $app.findFirstRecordByFilter("settings", "key = '" + key + "'");
      return r2 && r2.get("value") ? r2.get("value") : fallback;
    } catch (_) {
      return fallback;
    }
  };

  const company = {
    name: getSetting("company_name", "DOMESTIKO SAS"),
    nit: getSetting("company_nit", "901428834-2"),
    phone: getSetting("company_phone", "3004205403"),
    address: getSetting("company_address", "CL 29 5 50")
  };

  // 5. Verificar si es un Documento Electrónico DIAN en einvoice_docs
  let edoc = null;
  try {
    const edocRec = $app.findFirstRecordByFilter("einvoice_docs", "tx_id = {:txId}", { txId: txId });
    if (edocRec) {
      edoc = {
        cufe: edocRec.get("cufe") || "",
        status: edocRec.get("status") || "aceptada",
        xml_content: edocRec.get("xml_content") || ""
      };
    }
  } catch (_) {}

  // 6. Obtener Resolución DIAN de dian_resolutions
  let resolutionData = null;
  const pUpper = (txType.prefix || txType.code || "TX").toUpperCase();
  try {
    const resRec = $app.findFirstRecordByFilter("dian_resolutions", "active = true && (prefix = {:p} || document_type = {:p})", { p: pUpper });
    if (resRec) {
      resolutionData = {
        resolutionNumber: resRec.get("resolution_number") || resRec.get("number") || "",
        resolutionDate: resRec.get("resolution_date") || resRec.get("date") || "",
        resolutionExpiry: resRec.get("expiration_date") || resRec.get("valid_to") || "",
        resolutionRangeFrom: resRec.get("number_from") || resRec.get("range_from") || "1",
        resolutionRangeTo: resRec.get("number_to") || resRec.get("range_to") || "50000",
        resolutionPrefix: resRec.get("prefix") || pUpper
      };
    }
  } catch (_) {}

  // 7. Rutas del Sistema de Archivos
  const dataDir = $app.dataPath();
  const dbBaseDir = $filepath.dir(dataDir);

  const prefixPart = sanitizePathName(txType.prefix || "TX");
  const namePart = sanitizePathName(txType.name || "Transaccion");
  const txFolderName = sanitizePathName(prefixPart + " - " + namePart);

  const numPart = sanitizePathName(txRecord.get("number") || "0000");
  let baseFileName = numPart;
  if (prefixPart && !numPart.toLowerCase().startsWith(prefixPart.toLowerCase())) {
    baseFileName = prefixPart + "-" + numPart;
  }

  const targetDir = $filepath.join(dbBaseDir, "archivos_pdf", year, month, txFolderName);

  try {
    $os.mkdirAll(targetDir, 0755);
  } catch (err) {
    console.error("[ArchivePDF] Error creando directorio " + targetDir + ":", err);
    return null;
  }

  const pdfData = {
    company: company,
    tx: {
      number: txRecord.get("number"),
      date: txRecord.get("date"),
      status: txRecord.get("status"),
      description: txRecord.get("description")
    },
    txType: txType,
    third: third,
    lines: lines,
    edoc: edoc,
    resolution: resolutionData
  };

  let createdFiles = [];

  // ARCHIVO 1: Comprobante Contable de Libro Diario
  const contableFileName = baseFileName + "_Comprobante_Contable.pdf";
  const contablePath = $filepath.join(targetDir, contableFileName);

  try {
    const contablePdfString = buildTransactionPdfBytes(pdfData);
    $os.writeFile(contablePath, contablePdfString, 0644);
    createdFiles.push(contableFileName);
  } catch (err) {
    console.error("[ArchivePDF] Error guardando comprobante contable " + contablePath + ":", err);
  }

  // ARCHIVO 2 (Si es Documento Electrónico DIAN o Tipo Electrónico): Representación Gráfica DIAN
  const isElectronicType = edoc || ["FE", "NC", "ND", "DS", "NE", "DSE", "NDS"].includes(prefixPart.toUpperCase());
  if (isElectronicType) {
    const dianFileName = baseFileName + "_Representacion_Grafica_DIAN.pdf";
    const dianPath = $filepath.join(targetDir, dianFileName);
    try {
      const dianPdfString = buildDianRepresentationPdfBytes(pdfData);
      $os.writeFile(dianPath, dianPdfString, 0644);
      createdFiles.push(dianFileName);
    } catch (err) {
      console.error("[ArchivePDF] Error guardando representación gráfica DIAN " + dianPath + ":", err);
    }
  }

  console.log("[ArchivePDF] Soportes archivados exitosamente en: " + targetDir + " -> [" + createdFiles.join(", ") + "]");

  return {
    success: true,
    folder: targetDir,
    files: createdFiles
  };
}

// ─── HOOKS DE EVENTOS EN POCKETBASE ──────────────────────────────────────────

onRecordAfterCreateRequest((e) => {
  try {
    executeTransactionPdfArchiving(e.record);
  } catch (err) {
    console.error("[ArchivePDF Hook Create] Exception:", err);
  }
}, "transactions");

onRecordAfterUpdateRequest((e) => {
  try {
    executeTransactionPdfArchiving(e.record);
  } catch (err) {
    console.error("[ArchivePDF Hook Update] Exception:", err);
  }
}, "transactions");

// ─── REST ENDPOINT API ───────────────────────────────────────────────────────

routerAdd("POST", "/api/gravy/archive-pdf", (e) => {
  const authRecord = e.auth || (typeof $apis !== "undefined" ? $apis.requestInfo(e).authRecord : null);
  if (!authRecord) {
    return e.json(401, { message: "No autenticado." });
  }

  let body = {};
  try {
    body = $apis.requestInfo(e).body || {};
  } catch (_) {}

  const txId = body.tx_id || e.request.url.query().get("tx_id");
  if (!txId) {
    return e.json(400, { message: "Parametro tx_id es requerido." });
  }

  try {
    const txRec = $app.findRecordById("transactions", txId);
    if (!txRec) {
      return e.json(404, { message: "Transaccion no encontrada." });
    }

    const result = executeTransactionPdfArchiving(txRec);
    if (!result) {
      return e.json(400, { message: "La transaccion no esta en estado activo/aprobado o no se pudo generar el PDF." });
    }

    return e.json(200, {
      message: "Soportes PDF archivados exitosamente.",
      archived: result
    });
  } catch (err) {
    return e.json(500, { message: "Error interno procesando archivado PDF: " + String(err) });
  }
});
