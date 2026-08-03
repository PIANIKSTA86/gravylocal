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
  
  const supplierMatch = xml.match(/<cac:AccountingSupplierParty>([\s\S]*?)<\/cac:AccountingSupplierParty>/i);
  const customerMatch = xml.match(/<cac:AccountingCustomerParty>([\s\S]*?)<\/cac:AccountingCustomerParty>/i);
  
  if (supplierMatch) {
    console.log("AccountingSupplierParty XML BLOCK:\n", supplierMatch[0]);
  }
  if (customerMatch) {
    console.log("AccountingCustomerParty XML BLOCK:\n", customerMatch[0]);
  }
});
