const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all(`
  SELECT * FROM audit_log 
  WHERE entity = 'bank_movements' OR entity_id IN ('w6orhcnctbegpfw', '98r22mywtyz9o8c', 'ljvcrwq4wvcksyr')
  LIMIT 20
`, (err, r) => {
  console.log('Audit logs for target movements:', r);
});

db.all(`
  SELECT * FROM bank_reconciliations
`, (err, r) => {
  console.log('bank_reconciliations in DB:', r);
});
