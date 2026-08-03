const fs = require('fs');
const path = require('path');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();

const orchestratorCode = fs.readFileSync('hub/orchestrator.js', 'utf8');
const PDFDocument = require(path.join(__dirname, '../hub/node_modules/pdfkit'));

// Real QR code fetcher using HTTPS request to qrserver API
function fetchQrCode(text) {
  return new Promise((resolve, reject) => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return resolve(null);
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', err => {
      console.warn("QR fetch error:", err.message);
      resolve(null);
    });
  });
}

const fnStart = orchestratorCode.indexOf('function generateInvoicePdf(');
const fnEnd = orchestratorCode.indexOf("app.post('/api/dian/download-zip'", fnStart);
const fnCode = orchestratorCode.substring(fnStart, fnEnd);

const BASE_DIR = path.join(__dirname, '..');

eval(fnCode);

const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT * FROM einvoice_docs WHERE xml_content IS NOT NULL AND xml_content != '' LIMIT 1", (err, edoc) => {
  if (err || !edoc) return console.error("No einvoice_docs with xml_content found:", err);
  
  db.get("SELECT * FROM transactions WHERE id = ?", [edoc.tx_id], (err, tx) => {
    if (err || !tx) return console.error("TX not found:", edoc.tx_id);
    
    // Fetch resolution for this transaction's type prefix or active resolution
    db.get("SELECT * FROM dian_resolutions WHERE prefix = 'FV' OR active = 1 LIMIT 1", (err, resRow) => {
      const invoiceData = {
        resolution: resRow ? {
          number: resRow.number || resRow.resolution_number || '18760000001',
          date: resRow.date || resRow.resolution_date || '2026-01-01',
          expiry: resRow.valid_to || resRow.expiry_date || '2027-12-31',
          range_from: resRow.from_number || resRow.range_from || '1',
          range_to: resRow.to_number || resRow.range_to || '50000',
          prefix: resRow.prefix || 'FE'
        } : null
      };

      console.log("Generating High-Fidelity DIAN PDF with QR Code and Resolution for:", tx.number, "...");

      generateInvoicePdf(edoc.xml_content, tx.number, invoiceData)
        .then(pdfBuffer => {
          const outPath = `scratch/${tx.number}_DIAN_Official_QR_Resolution.pdf`;
          fs.writeFileSync(outPath, pdfBuffer);
          console.log("SUCCESS! PDF Generated:", pdfBuffer.length, "bytes at:", outPath);
        })
        .catch(e => console.error("Error generating PDF:", e));
    });
  });
});
