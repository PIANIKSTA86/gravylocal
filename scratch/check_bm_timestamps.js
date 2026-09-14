const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all(`
  SELECT id, date, description, debit, credit, reconciled, tx_line_id, created, updated 
  FROM bank_movements 
  WHERE id IN ('w6orhcnctbegpfw', '98r22mywtyz9o8c', 'ljvcrwq4wvcksyr', '84stwacc43h9mh7')
`, (err, r) => {
  console.log('Target movements timestamps:', r);
});

db.all(`
  SELECT count(*) as total, 
         sum(case when reconciled = 1 and (tx_line_id = '' or tx_line_id is null) then 1 else 0 end) as recon_no_line,
         sum(case when reconciled = 1 and tx_line_id != '' then 1 else 0 end) as recon_with_line,
         sum(case when reconciled = 0 or reconciled is null then 1 else 0 end) as unrecon
  FROM bank_movements
`, (err, r) => {
  console.log('Breakdown of all bank movements:', r);
});
