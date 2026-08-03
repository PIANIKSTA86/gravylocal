const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log("=== INVOICES WITH DISCOUNT ===");
    const invoices = db.prepare("SELECT id, number, date, tx_id, discount_amount, subtotal, total FROM invoices WHERE discount_amount > 0").all();
    console.log(`Found ${invoices.length} invoices with discount.`);
    invoices.slice(0, 10).forEach(inv => {
      console.log(`ID: ${inv.id}, Number: ${inv.number}, Date: ${inv.date}, TxID: ${inv.tx_id}, Discount: ${inv.discount_amount}, Subtotal: ${inv.subtotal}, Total: ${inv.total}`);
    });

    console.log("\n=== PURCHASE INVOICES WITH DISCOUNT ===");
    const purchases = db.prepare("SELECT id, number, date, tx_id, discount_amount, subtotal, total FROM purchase_invoices WHERE discount_amount > 0").all();
    console.log(`Found ${purchases.length} purchases with discount.`);
    purchases.slice(0, 10).forEach(p => {
      console.log(`ID: ${p.id}, Number: ${p.number}, Date: ${p.date}, TxID: ${p.tx_id}, Discount: ${p.discount_amount}, Subtotal: ${p.subtotal}, Total: ${p.total}`);
    });
  } catch (err) {
    console.error(err);
  }
}
run();
