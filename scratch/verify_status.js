const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.serialize(() => {
  db.get("SELECT COUNT(*) as orphans FROM bank_movements WHERE reconciled = 1 AND (tx_line_id IS NULL OR tx_line_id = '')", (err, row) => {
    console.log('Orphan reconciled movements:', row);
  });
  db.get("SELECT COUNT(*) as total_movs FROM bank_movements", (err, row) => {
    console.log('Total bank movements:', row);
  });
  db.get("SELECT COUNT(*) as properly_reconciled FROM bank_movements WHERE reconciled = 1 AND tx_line_id != ''", (err, row) => {
    console.log('Properly reconciled movements:', row);
  });
});
db.close();
