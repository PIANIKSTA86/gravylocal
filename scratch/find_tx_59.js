const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log("=== SEARCHING TRANSACTIONS WITH 59 ===");
    const txs = db.prepare("SELECT id, number FROM transactions WHERE number LIKE '%59%'").all();
    txs.forEach(tx => {
      console.log(`Found tx: ID: ${tx.id}, Number: ${tx.number}`);
      const doc = db.prepare("SELECT * FROM einvoice_docs WHERE tx_id = ?").get(tx.id);
      if (doc) {
        console.log(`  Doc: status=${doc.status}, response=${doc.dian_response}, sent_at=${doc.sent_at}`);
      } else {
        console.log(`  Doc: not found`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}
run();
