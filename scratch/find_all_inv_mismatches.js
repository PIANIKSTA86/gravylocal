const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT i.id, i.number, i.period, i.total as inv_total, i.tx_id, p.code as prop_code,
         SUM(CASE WHEN l.debit > 0 THEN l.debit ELSE 0 END) as tx_debit,
         SUM(CASE WHEN l.credit > 0 THEN l.credit ELSE 0 END) as tx_credit
  FROM ph_invoices i
  JOIN transactions t ON t.id = i.tx_id
  JOIN tx_lines l ON l.tx_id = t.id
  JOIN accounts a ON a.id = l.account_id
  JOIN ph_properties p ON p.id = i.property_id
  WHERE i.status != 'voided' AND a.code = '13459501'
  GROUP BY i.id
  HAVING ABS(i.total - tx_debit) > 0.5
`, (err, rows) => {
  if (err) return console.error(err);
  console.log(`Invoices where ph_invoices.total != 13459501 debit (${rows.length}):`);
  rows.forEach(r => console.log(r));
});

