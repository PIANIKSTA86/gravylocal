const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log("=== TRANSACTIONS MATCHING POS INVOICE NUMBER ===");
    const tx = db.prepare("SELECT * FROM transactions WHERE number LIKE '%4P1C%' LIMIT 5").all();
    console.log(`Found ${tx.length} transactions.`);
    tx.forEach(t => console.log(t));

    console.log("\n=== INVOICES WITH tx_id NOT EMPTY ===");
    const invoicesWithTx = db.prepare("SELECT id, number, date, tx_id, discount_amount FROM invoices WHERE tx_id != '' AND tx_id IS NOT NULL LIMIT 5").all();
    console.log(`Found ${invoicesWithTx.length} invoices with tx_id.`);
    invoicesWithTx.forEach(inv => console.log(inv));

    console.log("\n=== ALL INVOICES WITH discount_amount > 0 AND tx_id ===");
    const anyDiscounts = db.prepare("SELECT id, number, tx_id, discount_amount, total FROM invoices WHERE discount_amount > 0").all();
    console.log(`Found ${anyDiscounts.length} invoices with discount.`);

    console.log("\n=== ALL SALES ORDERS WITH discount_amount > 0 ===");
    const salesOrders = db.prepare("SELECT id, number, discount_amount, total FROM sales_orders WHERE discount_amount > 0 LIMIT 5").all();
    console.log(`Found ${salesOrders.length} sales orders with discount.`);
    salesOrders.forEach(so => console.log(so));
  } catch (err) {
    console.error(err);
  }
}
run();
