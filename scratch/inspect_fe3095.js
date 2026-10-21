const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');

db.get("SELECT * FROM invoices WHERE number = 'FE-00003095'", (err, inv) => {
  if (err || !inv) return console.error('Invoice not found:', err);
  console.log('Invoice FE-00003095:', {
    id: inv.id,
    number: inv.number,
    date: inv.date,
    due_date: inv.due_date,
    payment_method: inv.payment_method,
    payment_form: inv.payment_form,
    payment_dian_code: inv.payment_dian_code,
    subtotal: inv.subtotal,
    iva_total: inv.iva_total,
    total: inv.total
  });
  
  db.all("SELECT * FROM invoice_lines WHERE invoice_id = ?", [inv.id], (err2, lines) => {
    console.log('Lines count:', lines.length);
    lines.forEach((l, i) => {
      console.log(`Line ${i+1}:`, {
        description: l.description,
        qty: l.qty,
        unit_price: l.unit_price,
        subtotal: l.subtotal,
        iva_rate: l.iva_rate,
        iva_amount: l.iva_amount,
        total: l.total
      });
    });
    db.close();
  });
});
