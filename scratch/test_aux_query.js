const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

const propId = 'sl1ks88emuyod8d'; // 4104
const fromDate = '2026-03-11';
const toDate = '2026-10-31';

db.all(`
  SELECT t.number, t.date, l.debit, l.credit, l.description, l.cross_doc_ref
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
    AND t.date >= ? AND t.date <= ?
    AND (l.description LIKE '%4104%' OR l.description LIKE '%D-104%' OR l.cross_doc_ref LIKE '%4104%' OR l.cross_doc_ref IN (
      SELECT number FROM ph_invoices WHERE property_id = ?
    ) OR l.cross_doc_ref LIKE 'CF-202606-000139%' OR l.cross_doc_ref LIKE 'CF-202610-000143%')
  ORDER BY t.date ASC, t.number ASC
`, [fromDate, toDate, propId], (err, rows) => {
  console.log(`Report auxiliary rows for 4104: ${rows.length}`);
  let totD = 0, totC = 0;
  rows.forEach(r => {
    totD += r.debit;
    totC += r.credit;
    console.log(`${r.date} | ${r.number.padEnd(16)} | D:${r.debit.toString().padStart(8)} | C:${r.credit.toString().padStart(8)} | Ref: ${(r.cross_doc_ref || '').padEnd(20)} | ${r.description}`);
  });
  console.log(`TOTAL: D=${totD}, C=${totC}, Net=${totD - totC}`);
});

