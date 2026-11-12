const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

const propId = 'sl1ks88emuyod8d';

db.all(`
  SELECT l.id, t.number as tx_num, t.date, t.status as tx_status, l.debit, l.credit, l.description, l.cross_doc_ref
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND (
    l.description LIKE '%4104%' OR l.description LIKE '%D-104%' OR
    l.cross_doc_ref LIKE '%4104%' OR l.cross_doc_ref IN (
      SELECT number FROM ph_invoices WHERE property_id = ?
    ) OR l.cross_doc_ref LIKE 'CF-2026%-000139%' OR l.cross_doc_ref LIKE 'CF-2026%-000143%' OR l.cross_doc_ref LIKE 'CF-2026%-000147%'
  )
  ORDER BY t.date ASC, t.number ASC
`, [propId], (err, lines) => {
  console.log(`Found ${lines.length} lines on 13459501:`);
  let runBal = 0;
  for (const l of lines) {
    const deb = Number(l.debit || 0);
    const cred = Number(l.credit || 0);
    runBal += (deb - cred);
    console.log(`${l.date} | ${l.tx_num.padEnd(16)} | D:${deb.toString().padStart(8)} | C:${cred.toString().padStart(8)} | Saldo:${runBal.toString().padStart(9)} | Ref: ${(l.cross_doc_ref || '').padEnd(20)} | ${l.description}`);
  }
});

