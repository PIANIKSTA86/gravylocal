const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');

db.get("SELECT tx_id, id, number FROM invoices WHERE number = 'FE-00003095'", (err, row) => {
  console.log('Invoice FE-00003095:', row);
  db.close();
});
