const fs = require('fs');
const { execSync } = require('child_process');

const origPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator.js';
const tempPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/hub/orchestrator_temp.js';

// Read original file
let code = fs.readFileSync(origPath, 'utf8');

// Append run code
const runCode = `
const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
const txId = 'cymzvzu7se9yaw6';

db.get("SELECT xml_content, cufe FROM einvoice_docs WHERE tx_id = ?", [txId], (err, docRow) => {
  if (err || !docRow) {
    console.error("No record in einvoice_docs:", err || "Not found");
    process.exit(1);
  }
  
  db.get("SELECT * FROM transactions WHERE id = ?", [txId], (err, txRow) => {
    if (err || !txRow) {
      console.error("No transaction found");
      process.exit(1);
    }
    
    console.log("Generating PDF from XML ONLY (invoiceData = null)...");
    generateInvoicePdf(docRow.xml_content, txRow.number, null)
      .then(buffer => {
        fs.writeFileSync('c:/Users/JULIAN/Desktop/GravyLocal2.0/scratch/invoice_test.pdf', buffer);
        console.log("PDF generated successfully:", buffer.length, "bytes");
        process.exit(0);
      })
      .catch(e => {
        console.error("PDF generation failed:", e);
        process.exit(1);
      });
  });
});
`;

fs.writeFileSync(tempPath, code + "\n" + runCode, 'utf8');

console.log("Running temporary orchestrator generator...");
try {
  const out = execSync('node hub/orchestrator_temp.js', { encoding: 'utf8' });
  console.log("Output:", out);
} catch (e) {
  console.error("Execution failed:", e.message);
} finally {
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
}
