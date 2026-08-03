const fs = require('fs');
const path = require('path');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const orchestratorCode = fs.readFileSync('hub/orchestrator.js', 'utf8');
const PDFDocument = require(path.join(__dirname, '../hub/node_modules/pdfkit'));

function fetchQrCode(text) {
  return new Promise((resolve) => {
    if (!text) return resolve(null);
    const url = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(text);
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

const BASE_DIR = path.resolve('.');

const createFn = new Function('PDFDocument', 'fetchQrCode', 'BASE_DIR', fnCode + '\nreturn generateInvoicePdf;');
const generateInvoicePdf = createFn(PDFDocument, fetchQrCode, BASE_DIR);

const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT * FROM transactions WHERE number = 'FV-00003734'", (err, tx) => {
  if (err || !tx) return console.error("TX not found:", err);

  db.get("SELECT * FROM einvoice_docs WHERE tx_id = ?", [tx.id], (err, edoc) => {
    if (err || !edoc) return console.error("EDOC not found:", err);

    db.get("SELECT * FROM dian_resolutions WHERE prefix = 'FV' OR document_type = 'FV'", async (err, resRow) => {
      console.log("Found resolution row:", resRow);

      const invoiceData = {
        resolutionNumber: resRow ? (resRow.resolution_number || resRow.number) : '',
        resolutionDate: resRow ? (resRow.resolution_date || resRow.date) : '',
        resolutionExpiry: resRow ? (resRow.expiration_date || resRow.valid_to) : '',
        resolutionRangeFrom: resRow ? (resRow.number_from || resRow.range_from) : '',
        resolutionRangeTo: resRow ? (resRow.number_to || resRow.range_to) : '',
        resolutionPrefix: resRow ? (resRow.prefix) : ''
      };

      console.log("Invoice resolution data:", invoiceData);
      const pdfBuffer = await generateInvoicePdf(edoc.xml_content, tx.number, invoiceData);
      
      const outPath = 'archivos_pdf/2026/07/FV - Factura de Venta/FV-00003734_Representacion_Grafica_DIAN.pdf';
      fs.writeFileSync(outPath, pdfBuffer);
      console.log("SUCCESS! PDF written, size:", pdfBuffer.length, "bytes at:", outPath);
    });
  });
});
