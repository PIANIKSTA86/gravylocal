const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8094/pb_data/data.db');

db.all(`
  SELECT phi.id, phi.number, phi.total, sum(l.debit) as tx_debit
  FROM ph_invoices phi
  JOIN transactions t ON t.id = phi.tx_id
  JOIN tx_lines l ON l.tx_id = t.id
  JOIN accounts a ON a.id = l.account_id
  WHERE phi.status != 'voided' AND a.code = '13459501' AND t.status = 'active' AND phi.number NOT LIKE 'SI%'
  GROUP BY phi.id
  HAVING abs(CAST(phi.total AS REAL) - sum(l.debit)) > 0.01
`, (err, diffs) => {
  if (err) console.error(err);
  else {
    let sumTotal = 0;
    let sumTx = 0;
    diffs.forEach(d => {
      sumTotal += Number(d.total);
      sumTx += Number(d.tx_debit);
    });
    console.log(`Regular CF invoices diff: Count: ${diffs.length}, Sum Invoice Total: ${sumTotal}, Sum Tx Debit: ${sumTx}, Difference: ${sumTotal - sumTx}`);
    console.log('Samples:', diffs.slice(0, 5));
  }
});