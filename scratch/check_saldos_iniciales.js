const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT l.id, l.debit, l.credit, l.cross_doc_ref, l.description, a.code as acc_code
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  WHERE l.tx_id = 'asomshl38rr0fx3'
    AND (l.description LIKE '%1104%' OR l.description LIKE '%A-104%' OR l.cross_doc_ref LIKE '%1104%')
`, (err, rows) => {
  if (err) return console.error(err);
  console.log('Lines in asomshl38rr0fx3 (Saldos Iniciales) for 1104:', rows);
});

// Also check ALL lines in asomshl38rr0fx3 that are debit in 13459501 vs ph_invoices
db.all(`
  SELECT count(*) as count, sum(debit) as tot_debit, sum(credit) as tot_credit
  FROM tx_lines l
  JOIN accounts a ON a.id = l.account_id
  WHERE l.tx_id = 'asomshl38rr0fx3' AND a.code = '13459501'
`, (err, res) => {
  console.log('Totals in asomshl38rr0fx3 for 13459501:', res);
});

