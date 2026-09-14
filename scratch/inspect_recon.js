const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.serialize(() => {
  db.all("SELECT count(*) as total, sum(case when tx_line_id != '' then 1 else 0 end) as with_tx_line, sum(case when reconciled = 1 then 1 else 0 end) as reconciled FROM bank_movements", (err, r) => {
    console.log('Bank movements stats:', r);
  });

  db.all("SELECT DISTINCT substr(date, 1, 7) as m, count(*) as c FROM bank_movements GROUP BY m ORDER BY m", (err, r) => {
    console.log('Bank movement months:', r);
  });

  db.all("SELECT * FROM bank_movements WHERE reconciled = 1 AND (tx_line_id = '' OR tx_line_id IS NULL) LIMIT 10", (err, r) => {
    console.log('Reconciled without tx_line_id:', r.length, r);
  });

  db.all("SELECT * FROM bank_movements WHERE tx_line_id != '' AND (reconciled = 0 OR reconciled IS NULL) LIMIT 10", (err, r) => {
    console.log('With tx_line_id but NOT reconciled:', r.length, r);
  });

  // Check how many bank accounts and their linked PUC accounts
  db.all(`
    SELECT ba.id, ba.bank, ba.number, ba.account_id, a.code, a.name 
    FROM bank_accounts ba 
    LEFT JOIN accounts a ON ba.account_id = a.id
  `, (err, r) => {
    console.log('Bank accounts & PUC accounts:', r);
  });

  // Check transactions and tx_lines
  db.all(`
    SELECT count(*) as total_tx, 
           sum(case when status = 'voided' then 1 else 0 end) as voided_tx,
           sum(case when status = 'draft' then 1 else 0 end) as draft_tx,
           sum(case when status = 'active' then 1 else 0 end) as active_tx
    FROM transactions
  `, (err, r) => {
    console.log('Transactions status counts:', r);
  });
});
