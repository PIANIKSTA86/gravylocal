const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

console.log("--- RECENT SALES ORDERS ---");
db.all("SELECT id, number, date, total, subtotal, iva, status FROM sales_orders ORDER BY created DESC LIMIT 5", [], (err, orders) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(orders, null, 2));

  if (orders && orders.length) {
    db.all("SELECT id, sales_order_id, product_id, qty, unit_price, iva_rate, iva_amount, subtotal, total FROM sales_order_lines WHERE sales_order_id = ?", [orders[0].id], (err2, lines) => {
      if (err2) console.error(err2);
      else console.log("LINES FOR LAST ORDER:", JSON.stringify(lines, null, 2));
    });
  }
});

console.log("--- RECENT INVOICES ---");
db.all("SELECT id, number, date, total, subtotal, iva, status, sales_order_id FROM invoices ORDER BY created DESC LIMIT 3", [], (err, invs) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(invs, null, 2));

  if (invs && invs.length) {
    db.all("SELECT id, invoice_id, product_id, qty, unit_price, iva_rate, iva_amount, subtotal, total FROM invoice_lines WHERE invoice_id = ?", [invs[0].id], (err2, lines) => {
      if (err2) console.error(err2);
      else console.log("LINES FOR LAST INVOICE:", JSON.stringify(lines, null, 2));
    });
  }
});
