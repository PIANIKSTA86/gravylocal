const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log("=== SEARCHING TRANSACTION ===");
    const tx = db.prepare("SELECT * FROM transactions WHERE number LIKE '%00000059%' OR number LIKE '%59' LIMIT 1").get();
    if (!tx) {
      console.log("Transaction not found.");
      return;
    }
    console.log("Found transaction:", { id: tx.id, number: tx.number });

    const doc = db.prepare("SELECT * FROM einvoice_docs WHERE tx_id = ?").get(tx.id);
    if (!doc) {
      console.log("einvoice_docs record not found for tx_id", tx.id);
      return;
    }
    console.log("Found einvoice_docs record:", {
      id: doc.id,
      status: doc.status,
      dian_response: doc.dian_response,
      sent_at: doc.sent_at,
      ftech_transaction_id: doc.ftech_transaction_id
    });
  } catch (err) {
    console.error(err);
  }
}
run();
