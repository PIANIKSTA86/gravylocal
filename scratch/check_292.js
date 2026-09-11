const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all(`SELECT * FROM einvoice_docs WHERE tx_id = 'bhqxgow0v0kszit'`, (err, rows) => {
  console.log('Docs for DSE-292 tx:', rows);
});
db.all(`SELECT id, number, date, tx_type_id FROM transactions WHERE number LIKE '%292%'`, (err, rows) => {
  console.log('Transactions for 292:', rows);
});
