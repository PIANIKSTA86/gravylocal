const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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
  stream += drawText(company.name || 'GRAVY ERP S.A.S', 46, 748, '/F2', 12, [0.05, 0.15, 0.3]);
  stream += drawText('NIT: ' + (company.nit || '900.000.000-1') + ' | Tel: ' + (company.phone || 'N/A'), 46, 734, '/F1', 8, [0.3, 0.3, 0.3]);
  stream += drawText('Direccion: ' + (company.address || 'Colombia'), 46, 723, '/F1', 8, [0.3, 0.3, 0.3]);

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

  stream += drawText('GRAVY ERP v2.0 - Archivado Fisico Digital', 566, 30, '/F1', 7.5, [0.5, 0.5, 0.5], 'right');

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

const db = new sqlite3.Database('pb_data/data.db');

db.get('SELECT * FROM transactions WHERE number = ?', ['DS-00000226'], (err, tx) => {
  if (err || !tx) return console.error('TX DS-00000226 not found:', err);

  db.get('SELECT * FROM transaction_types WHERE id = ?', [tx.tx_type_id], (err, txType) => {
    db.get('SELECT * FROM third_parties WHERE id = ?', [tx.third_party_id], (err, third) => {
      db.all('SELECT * FROM tx_lines WHERE tx_id = ? ORDER BY line_order ASC', [tx.id], (err, rawLines) => {
        console.log('Found rawLines:', rawLines.length);

        const accIds = Array.from(new Set(rawLines.map(l => l.account_id).filter(Boolean)));
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
          const lines = rawLines.map(l => {
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

          console.log('Processed lines:', JSON.stringify(lines, null, 2));

          db.all("SELECT key, value FROM settings WHERE key IN ('company_name', 'company_nit', 'company_phone', 'company_address')", (err, settingsRows) => {
            const settingsMap = new Map();
            if (settingsRows) settingsRows.forEach(s => settingsMap.set(s.key, s.value));

            const company = {
              name: settingsMap.get('company_name') || 'GRAVY ERP S.A.S',
              nit: settingsMap.get('company_nit') || '900.000.000-1',
              phone: settingsMap.get('company_phone') || '',
              address: settingsMap.get('company_address') || 'Colombia'
            };

            console.log('Company settings:', company);

            const pdfString = buildTransactionPdfBytes({
              company: company,
              tx: tx,
              txType: txType || {},
              third: third || {},
              lines: lines
            });

            const outPath = 'archivos_pdf/2026/01/DS - Documento Soporte/DS-00000226.pdf';
            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            fs.writeFileSync(outPath, pdfString);
            console.log('PDF re-generated successfully at:', outPath, 'size:', fs.statSync(outPath).size);
          });
        });
      });
    });
  });
});
