const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all("SELECT count(*) as cntZero FROM transaction_lines WHERE (debit = 0 AND credit = 0)", [], (err, r1) => {
  if (err) console.error(err);
  else console.log('Exact 0 lines:', r1);

  db.all("SELECT count(*) as cntAjuste FROM transaction_lines WHERE description LIKE '%ajuste%' OR description LIKE '%redondeo%'", [], (err2, r2) => {
    if (err2) console.error(err2);
    else console.log('Ajuste/redondeo lines:', r2);

    db.all(`
      SELECT tl.id, tl.transaction_id, tl.account_id, a.code as acc_code, tl.debit, tl.credit, tl.description, t.number, t.date, tt.code as tx_type_code
      FROM transaction_lines tl
      JOIN transactions t ON tl.transaction_id = t.id
      LEFT JOIN accounts a ON tl.account_id = a.id
      LEFT JOIN transaction_types tt ON t.tx_type_id = tt.id
      WHERE (tl.debit = 0 AND tl.credit = 0) 
         OR tl.description LIKE '%ajuste%' 
         OR tl.description LIKE '%redondeo%'
      LIMIT 15
    `, [], (err3, r3) => {
      if (err3) console.error(err3);
      else console.log('Sample rows:', JSON.stringify(r3, null, 2));
      db.close();
    });
  });
});
