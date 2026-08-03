const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log("=== RECENT EINVOICE DOCS ===");
    const rows = db.prepare("SELECT id, tx_id, status, dian_response, sent_at FROM einvoice_docs ORDER BY id DESC LIMIT 5").all();
    rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`  Tx ID: ${row.tx_id}`);
      console.log(`  Status: ${row.status}`);
      console.log(`  DIAN Response: ${row.dian_response}`);
      console.log(`  Sent At: ${row.sent_at}`);
      console.log("-----------------------------------------");
    });
  } catch (err) {
    console.error(err);
  }
}
run();
