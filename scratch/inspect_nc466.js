const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.get("SELECT * FROM einvoice_docs WHERE cufe = 'f591d196d43db0dceb2eaa641ed1b2fd651e29f16c64de001a91037e21473dfedfa6201e5c0230bced56394bed1321af'", (err, row) => {
  if (err) {
    console.error(err);
    return;
  }
  if (!row) {
    console.log("No doc found by cufe, searching by doc_number NC-00000466...");
    db.get("SELECT * FROM einvoice_docs WHERE doc_number LIKE '%466%'", (err2, row2) => {
      console.log("Row2:", row2 ? { id: row2.id, tx_id: row2.tx_id, cufe: row2.cufe, status: row2.status, raw_response: row2.raw_response } : "None");
    });
    return;
  }
  console.log("Found einvoice_doc:", {
    id: row.id,
    tx_id: row.tx_id,
    doc_number: row.doc_number,
    status: row.status,
    cufe: row.cufe,
    sent_at: row.sent_at
  });
  console.log("\n--- RAW RESPONSE ---");
  console.log(row.raw_response);
  console.log("\n--- XML CONTENT (first 1000 chars) ---");
  console.log((row.xml_content || "").substring(0, 1000));
  db.close();
});

