const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT i.number, i.period, i.total as inv_total, l.description, l.amount, l.account_code, l.line_order
  FROM ph_invoice_lines l
  JOIN ph_invoices i ON i.id = l.invoice_id
  WHERE i.number IN ('CF-202607-000025', 'CF-202608-000025', 'CF-202607-000105', 'CF-202608-000105', 'CF-202609-000105')
  ORDER BY i.number, l.line_order
`, (err, rows) => {
  if (err) return console.error(err);
  console.log('Invoice lines in ph_invoice_lines:');
  rows.forEach(r => console.log(r));
});

