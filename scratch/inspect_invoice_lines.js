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
  
  // Extract all cac:InvoiceLine blocks
  const matches = xml.match(/<cac:InvoiceLine[\s\S]*?<\/cac:InvoiceLine>/g);
  if (!matches) {
    console.log("No InvoiceLine tags found!");
    return;
  }
  
  console.log("FOUND", matches.length, "InvoiceLine TAGS.");
  console.log("FIRST InvoiceLine CONTENT:");
  console.log(matches[0]);
});
