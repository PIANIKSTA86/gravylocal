const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db';
const db = new sqlite3.Database(dbPath);

const propId = 'sl1ks88emuyod8d'; // 4104

db.all(`
  SELECT t.number, t.date, a.code as acc_code, l.debit, l.credit, l.description, l.cross_doc_ref
  FROM tx_lines l
  JOIN transactions t ON t.id = l.tx_id
  JOIN accounts a ON a.id = l.account_id
  JOIN third_parties tp ON tp.id = l.third_party_id
  WHERE tp.doc_number = '1112463686' AND t.date <= '2026-10-31' AND t.status = 'active'
  ORDER BY t.date ASC, t.number ASC
`, (err, rows) => {
  console.log(`Found ${rows.length} lines for third party 1112463686 up to 2026-10-31:`);
  let sumD = 0, sumC = 0;
  rows.forEach(r => {
    sumD += r.debit;
    sumC += r.credit;
    console.log(`${r.date} | ${r.number.padEnd(16)} | ${r.acc_code} | D:${r.debit.toString().padStart(8)} | C:${r.credit.toString().padStart(8)} | Ref: ${(r.cross_doc_ref || '').padEnd(20)} | ${r.description}`);
  });
  console.log(`TOTAL: Debits=${sumD}, Credits=${sumC}, Net=${sumD - sumC}`);
});

