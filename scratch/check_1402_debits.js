const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT i.number, i.period, i.total, i.tx_id,
         SUM(CASE WHEN l.debit > 0 THEN l.debit ELSE 0 END) as tx_debit
  FROM ph_invoices i
  LEFT JOIN tx_lines l ON l.tx_id = i.tx_id AND l.account_id = (SELECT id FROM accounts WHERE code = '13459501')
  WHERE i.property_id = (SELECT id FROM ph_properties WHERE code = '1402')
  GROUP BY i.id
`, (err, rows) => console.log('1402 invoices and debits:', rows));

