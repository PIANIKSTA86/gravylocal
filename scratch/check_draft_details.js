const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '..', 'pb_data', 'data.db'));

db.all("SELECT id, number, date, customer_id, warehouse_id, tx_type_id, status, total, payable_total FROM invoices WHERE status = 'draft'", (err, rows) => {
  if (err) { console.error(err); db.close(); return; }
  console.log('DRAFT INVOICES count:', rows.length);
  console.log(JSON.stringify(rows, null, 2));

  if (rows.length > 0) {
    const ids = rows.map(r => `'` + r.id + `'`).join(',');
    db.all(`SELECT id, invoice_id, product_id, qty, unit_price, subtotal, iva_rate, iva_amount, total FROM invoice_lines WHERE invoice_id IN (${ids})`, (err2, lines) => {
      if (err2) console.error(err2);
      else console.log('DRAFT INVOICE LINES:', JSON.stringify(lines, null, 2));

      // Also check products referenced
      const prodIds = Array.from(new Set(lines.map(l => l.product_id).filter(Boolean))).map(id => `'` + id + `'`).join(',');
      if (prodIds) {
        db.all(`SELECT id, code, name, type, income_account_id, cost_account_id, inventory_account_id FROM products WHERE id IN (${prodIds})`, (err3, prods) => {
          if (err3) console.error(err3);
          else console.log('PRODUCTS INVOLVED:', JSON.stringify(prods, null, 2));
          db.close();
        });
      } else {
        db.close();
      }
    });
  } else {
    db.close();
  }
});
