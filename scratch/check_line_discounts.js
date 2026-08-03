const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log("=== INVOICE LINES WITH DISCOUNT ===");
    const lines = db.prepare("SELECT id, invoice_id, description, subtotal, total, discount_rate, discount_pct FROM invoice_lines WHERE discount_rate > 0 OR discount_pct > 0").all();
    console.log(`Found ${lines.length} invoice lines with discount.`);
    lines.forEach(l => console.log(l));

    console.log("\n=== PURCHASE INVOICE LINES WITH DISCOUNT ===");
    const pLines = db.prepare("SELECT id, invoice_id, description, subtotal, total, discount_rate, discount_pct FROM purchase_invoice_lines WHERE discount_rate > 0 OR discount_pct > 0").all();
    console.log(`Found ${pLines.length} purchase lines with discount.`);
    pLines.forEach(l => console.log(l));
  } catch (err) {
    console.error(err);
  }
}
run();
