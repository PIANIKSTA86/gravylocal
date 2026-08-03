const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const txId = 'cymzvzu7se9yaw6';

db.get("SELECT xml_content FROM einvoice_docs WHERE tx_id = ?", [txId], (err, row) => {
  if (err || !row) {
    console.error(err || "Not found");
    return;
  }
  const xml = row.xml_content;
  console.log("xml length:", xml.length);
  
  const hasInvoice = xml.includes("<Invoice");
  const hascbcInvoice = xml.includes("<cbc:Description");
  console.log("Includes <Invoice:", hasInvoice);
  console.log("Includes <cbc:Description:", hascbcInvoice);
  
  if (hasInvoice) {
    const idx = xml.indexOf("<Invoice");
    console.log("Snippet around <Invoice:\n", xml.substring(idx - 100, idx + 500));
  } else if (hascbcInvoice) {
    const idx = xml.indexOf("<cbc:Description");
    console.log("Snippet around <cbc:Description:\n", xml.substring(idx, idx + 500));
  }
});
