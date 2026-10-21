const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');
db.all("SELECT id, number, date, due_date, payment_method, payment_form, subtotal, iva_total, total FROM invoices ORDER BY created DESC LIMIT 3", (err, rows) => {
  if (err) console.error(err);
  else console.log('Empresa 8091 last invoices:', JSON.stringify(rows, null, 2));
  db.close();
});
