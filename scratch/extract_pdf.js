const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const txId = 'cymzvzu7se9yaw6';

db.get("SELECT pdf_content FROM einvoice_docs WHERE tx_id = ?", [txId], (err, row) => {
  if (err) {
    console.error("Error reading database:", err);
    return;
  }
  if (!row) {
    console.error("No record found in einvoice_docs for tx_id:", txId);
    return;
  }
  
  if (!row.pdf_content) {
    console.error("The pdf_content field is empty!");
    return;
  }

  // Check if it's base64 (e.g. data:application/pdf;base64,...)
  let base64Data = row.pdf_content;
  if (base64Data.startsWith('data:')) {
    base64Data = base64Data.split(';base64,')[1];
  }
  
  const pdfBuffer = Buffer.from(base64Data, 'base64');
  const outputPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/scratch/invoice_test.pdf';
  
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log("SUCCESS: PDF written to " + outputPath + " (" + pdfBuffer.length + " bytes)");
});
