const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const orchestratorCode = fs.readFileSync('hub/orchestrator.js', 'utf8');
const PDFDocument = require(path.join(__dirname, '../hub/node_modules/pdfkit'));

// Extract generateInvoicePdf function from orchestrator.js
const fnStart = orchestratorCode.indexOf('function generateInvoicePdf(');
const fnEnd = orchestratorCode.indexOf("app.post('/api/dian/download-zip'", fnStart);
const fnCode = orchestratorCode.substring(fnStart, fnEnd);

const BASE_DIR = path.join(__dirname, '..');
function fetchQrCode(text) {
  return Promise.resolve(null);
}

// Evaluate generateInvoicePdf function in current scope
eval(fnCode);

const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT * FROM einvoice_docs WHERE xml_content IS NOT NULL AND xml_content != '' LIMIT 1", (err, edoc) => {
  if (err || !edoc) return console.error("No einvoice_docs with xml_content found:", err);
  
  db.get("SELECT * FROM transactions WHERE id = ?", [edoc.tx_id], (err, tx) => {
    if (err || !tx) return console.error("TX not found for edoc:", edoc.tx_id);
    
    console.log("Generating Official DIAN PDF Representation for TX:", tx.number, "(ID:", tx.id, ")...");
    
    generateInvoicePdf(edoc.xml_content, tx.number, null)
      .then(pdfBuffer => {
        const outDir = 'scratch';
        const outPath = path.join(outDir, `${tx.number}_Official_DIAN.pdf`);
        fs.writeFileSync(outPath, pdfBuffer);
        console.log("SUCCESS! Official DIAN PDF generated:", pdfBuffer.length, "bytes at:", outPath);
      })
      .catch(e => {
        console.error("Failed to generate official DIAN PDF:", e);
      });
  });
});
