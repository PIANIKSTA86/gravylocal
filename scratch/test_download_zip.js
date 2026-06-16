const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const AdmZip = require(path.resolve('hub/node_modules/adm-zip'));

async function run() {
  try {
    const dbPath = path.resolve('pb_data/data.db');
    const db = new DatabaseSync(dbPath);
    const row = db.prepare("SELECT * FROM einvoice_docs WHERE tx_id = 'wid30ti2e2irdtp'").all()[0];
    if (!row) {
      console.error("No record found in einvoice_docs for wid30ti2e2irdtp");
      return;
    }

    const xmlContent = row.xml_content;
    if (!xmlContent) {
      console.error("No xml_content in record");
      return;
    }

    console.log(`Signed XML retrieved from DB. Length: ${xmlContent.length}`);

    // Call orchestrator download-zip
    const response = await fetch('http://localhost:8088/api/dian/download-zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        xmlContent,
        filename: '4P1C-00000008'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Download ZIP failed. Status: ${response.status}. Response: ${errorText}`);
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zipPath = path.join(__dirname, 'test_4P1C-00000008.zip');
    fs.writeFileSync(zipPath, buffer);
    console.log(`ZIP file downloaded and saved to: ${zipPath}`);

    // Verify ZIP contents using adm-zip
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    console.log('\n--- ZIP File Contents ---');
    entries.forEach(entry => {
      console.log(`- File Name: ${entry.entryName}, Size: ${entry.header.size} bytes`);
    });

  } catch (e) {
    console.error("Error in verification script:", e);
  }
}

run();
