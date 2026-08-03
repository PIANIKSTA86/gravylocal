/**
 * GRAVY v2.0 — archive_all_existing_tx.js
 *
 * Script retroactivo para el Archivado Híbrido (Vista C - Doble Soporte):
 * 1. [NUMERO]_Comprobante_Contable.pdf -> Asiento contable PUG/NIIF (débitos, créditos, cuentas, tercero).
 * 2. [NUMERO]_Representacion_Grafica_DIAN.pdf -> La representación gráfica OFICIAL idéntica a la enviada por correo CON CÓDIGO QR REAL Y RESOLUCIÓN DIAN AUTORIZADA.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const https = require('https');

// Cargar el generador oficial de Representación Gráfica DIAN desde hub/orchestrator.js
const orchestratorCode = fs.readFileSync(path.join(__dirname, '../hub/orchestrator.js'), 'utf8');
const PDFDocument = require(path.join(__dirname, '../hub/node_modules/pdfkit'));

// Real QR code fetcher mediante HTTPS a qrserver API
function fetchQrCode(text) {
  return new Promise((resolve) => {
    if (!text) return resolve(null);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      if (res.statusCode !== 200) return resolve(null);
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', () => resolve(null));
  });
}

const fnStart = orchestratorCode.indexOf('function generateInvoicePdf(');
const fnEnd = orchestratorCode.indexOf("app.post('/api/dian/download-zip'", fnStart);
const fnCode = orchestratorCode.substring(fnStart, fnEnd);

const BASE_DIR = path.resolve(__dirname, '..');

// Compilar generateInvoicePdf en scope CommonJS con PDFDocument, fetchQrCode y BASE_DIR
const createFn = new Function('PDFDocument', 'fetchQrCode', 'BASE_DIR', fnCode + '\nreturn generateInvoicePdf;');
const generateInvoicePdf = createFn(PDFDocument, fetchQrCode, BASE_DIR);

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
 * 1. Comprobante Contable de Libro Diario
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

  stream += drawLine(36, curY + 12, 576, curY + 12, [0.8, 0.8, 0.8]);
  stream += drawRect(36, curY - 8, 540, 18, [0.93, 0.94, 0.96], [0.75, 0.8, 0.85]);
  stream += drawText('TOTALES', 280, curY - 3, '/F2', 8.5, [0, 0, 0]);
  stream += drawText(pdfFmtMoney(totalDebit), 470, curY - 3, '/F2', 8.5, [0, 0, 0], 'right');
  stream += drawText(pdfFmtMoney(totalCredit), 566, curY - 3, '/F2', 8.5, [0, 0, 0], 'right');

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

function processDatabase(dbPath) {
  const dbDir = path.dirname(dbPath);
  const baseDir = dbDir.endsWith('pb_data') ? path.dirname(dbDir) : dbDir;

  console.log(`\n==================================================`);
  console.log(`Procesando base de datos: ${dbPath}`);
  console.log(`Ubicación contenedora del tenant: ${baseDir}`);
  console.log(`==================================================`);

  const db = new sqlite3.Database(dbPath);

  db.all("SELECT * FROM transactions WHERE status IN ('active', 'approved', 'posted')", (err, transactions) => {
    if (err || !transactions || transactions.length === 0) return;

    db.all("SELECT * FROM dian_resolutions WHERE active = 1", (err, resolutions) => {
      const resMap = new Map();
      if (resolutions) {
        resolutions.forEach(r => {
          if (r.prefix) resMap.set(String(r.prefix).toUpperCase(), r);
          if (r.document_type) resMap.set(String(r.document_type).toUpperCase(), r);
        });
      }

      let processedCount = 0;
      transactions.forEach((tx) => {
        const dateStr = String(tx.date || '').substring(0, 10);
        if (!dateStr || dateStr.length < 7) return;

        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(5, 7);

        db.get("SELECT * FROM transaction_types WHERE id = ?", [tx.tx_type_id], (err, txType) => {
          db.get("SELECT * FROM third_parties WHERE id = ?", [tx.third_party_id], (err, third) => {
            db.all("SELECT * FROM tx_lines WHERE tx_id = ? ORDER BY line_order ASC", [tx.id], (err, rawLines) => {
              const safeLines = Array.isArray(rawLines) ? rawLines : [];
              const accIds = Array.from(new Set(safeLines.map(l => l.account_id).filter(Boolean)));
              const accMap = new Map();

              const loadAccounts = (cb) => {
                if (!accIds.length) return cb();
                const placeholders = accIds.map(() => '?').join(',');
                db.all(`SELECT id, code, name FROM accounts WHERE id IN (${placeholders})`, accIds, (err, accs) => {
                  if (!err && accs) {
                    accs.forEach(a => accMap.set(a.id, a));
                  }
                  cb();
                });
              };

              loadAccounts(() => {
                const lines = safeLines.map(l => {
                  const acc = accMap.get(l.account_id) || {};
                  return {
                    account_code: acc.code || '',
                    account_name: acc.name || '',
                    debit: Number(l.debit || 0),
                    credit: Number(l.credit || 0),
                    description: l.description || '',
                    third_name: third ? (third.name || '') : ''
                  };
                });

                db.all("SELECT key, value FROM settings WHERE key IN ('company_name', 'company_nit', 'company_phone', 'company_address')", (err, settingsRows) => {
                  const settingsMap = new Map();
                  if (settingsRows) settingsRows.forEach(s => settingsMap.set(s.key, s.value));

                  const company = {
                    name: settingsMap.get('company_name') || 'DOMESTIKO SAS',
                    nit: settingsMap.get('company_nit') || '901428834-2',
                    phone: settingsMap.get('company_phone') || '3004205403',
                    address: settingsMap.get('company_address') || 'CL 29 5 50'
                  };

                  db.get("SELECT * FROM einvoice_docs WHERE tx_id = ?", [tx.id], async (err, edoc) => {

                    const prefixPart = sanitizePathName(txType ? (txType.prefix || txType.code) : 'TX');
                    const namePart = sanitizePathName(txType ? txType.name : 'Transaccion');
                    const folderName = sanitizePathName(prefixPart + ' - ' + namePart);

                    const numPart = sanitizePathName(tx.number || '0000');
                    let baseFileName = numPart;
                    if (prefixPart && !numPart.toLowerCase().startsWith(prefixPart.toLowerCase())) {
                      baseFileName = prefixPart + '-' + numPart;
                    }

                    const targetDir = path.join(baseDir, 'archivos_pdf', year, month, folderName);
                    fs.mkdirSync(targetDir, { recursive: true });

                    const pdfData = {
                      company: company,
                      tx: tx,
                      txType: txType || {},
                      third: third || {},
                      lines: lines
                    };

                    // 1. ARCHIVO 1: Comprobante Contable de Libro Diario
                    const contablePath = path.join(targetDir, baseFileName + '_Comprobante_Contable.pdf');
                    const contablePdf = buildTransactionPdfBytes(pdfData);

                    try {
                      fs.writeFileSync(contablePath, contablePdf);
                    } catch (_) {}

                    // 2. ARCHIVO 2: Representación Gráfica OFICIAL DIAN (Con QR real y Resolución DIAN autorizada)
                    if (edoc && edoc.xml_content) {
                      const dianPath = path.join(targetDir, baseFileName + '_Representacion_Grafica_DIAN.pdf');
                      
                      const pKey = String(prefixPart).toUpperCase();
                      const resRow = resMap.get(pKey) || resMap.get(String(txType ? txType.code : '').toUpperCase()) || null;
                      
                      const invoiceData = {
                        resolutionNumber: resRow ? (resRow.resolution_number || resRow.number || '') : '',
                        resolutionDate: resRow ? (resRow.resolution_date || resRow.date || '') : '',
                        resolutionExpiry: resRow ? (resRow.expiration_date || resRow.valid_to || '') : '',
                        resolutionRangeFrom: resRow ? (resRow.number_from || resRow.range_from || '1') : '',
                        resolutionRangeTo: resRow ? (resRow.number_to || resRow.range_to || '50000') : '',
                        resolutionPrefix: resRow ? (resRow.prefix || prefixPart) : prefixPart
                      };

                      try {
                        const dianBuffer = await generateInvoicePdf(edoc.xml_content, baseFileName, invoiceData);
                        fs.writeFileSync(dianPath, dianBuffer);
                      } catch (dianErr) {
                        console.warn(`Error generando Representación Gráfica DIAN oficial para ${baseFileName}:`, dianErr.message);
                      }
                    }

                    processedCount++;
                    console.log(`[${processedCount}/${transactions.length}] Archivado Híbrido en: ${targetDir} (${baseFileName})`);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

function findAndProcessAllDatabases() {
  const dbs = [];

  if (fs.existsSync('pb_data/data.db')) {
    dbs.push('pb_data/data.db');
  }

  if (fs.existsSync('empresas')) {
    const scanDir = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          scanDir(full);
        } else if (item === 'data.db') {
          dbs.push(full);
        }
      }
    };
    scanDir('empresas');
  }

  const uniqueDbs = Array.from(new Set(dbs));
  console.log('Bases de datos encontradas:', uniqueDbs);

  for (const dbPath of uniqueDbs) {
    processDatabase(dbPath);
  }
}

findAndProcessAllDatabases();
