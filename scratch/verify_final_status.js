const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get(`
  SELECT COUNT(*) as count 
  FROM tx_lines l 
  JOIN accounts a ON a.id = l.account_id 
  WHERE (l.cross_doc_ref IS NOT NULL AND l.cross_doc_ref != '') 
    AND (a.maneja_cruce = 0 OR a.maneja_cruce IS NULL)
`, (err, row) => {
  if (err) {
    console.error('Error verifying database:', err);
    process.exit(1);
  }
  console.log('Total invalid cruce lines in pb_data/data.db:', row.count);
  if (row.count === 0) {
    console.log('Integrity Verification: PASSED.');
  } else {
    console.error('Integrity Verification: FAILED.');
    process.exit(1);
  }
  db.close();
});
