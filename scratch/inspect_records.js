const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log("=== INVOICES RECORD SAMPLES ===");
    const invoices = db.prepare("SELECT * FROM invoices LIMIT 5").all();
    invoices.forEach(row => {
      console.log(row);
    });

    console.log("\n=== PURCHASE INVOICES RECORD SAMPLES ===");
    const purchases = db.prepare("SELECT * FROM purchase_invoices LIMIT 5").all();
    purchases.forEach(row => {
      console.log(row);
    });

    console.log("\n=== TRANSACTION SAMPLE WITH discount_amount OR line discount ===");
    // check if there are transaction lines that represent discount (using discount account, e.g. starting with 530535 or 620510 or 4135)
    // or let's search if any purchase_invoices or invoices have discount_amount > 0 (checking without where clause first just in case)
    const counts = db.prepare("SELECT count(*) as count, sum(discount_amount) as sum_disc FROM invoices").all();
    console.log("Invoice count & total discount:", counts);
    const pCounts = db.prepare("SELECT count(*) as count, sum(discount_amount) as sum_disc FROM purchase_invoices").all();
    console.log("Purchase Invoice count & total discount:", pCounts);
  } catch (err) {
    console.error(err);
  }
}
run();
