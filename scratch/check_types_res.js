const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all(`SELECT id, code, name, prefix, active FROM transaction_types WHERE code IN ('DS', 'NDS', 'DSE') OR prefix IN ('DS', 'NDS', 'DSE')`, (err, rows) => {
  console.log('Transaction types:', rows);
});
db.all(`SELECT id, code, name, prefix, active FROM transaction_types WHERE name LIKE '%soporte%'`, (err, rows) => {
  console.log('Transaction types by name:', rows);
});
db.all(`SELECT id, prefix, resolution_number, number_from, number_to, document_type, active FROM dian_resolutions`, (err, rows) => {
  console.log('DIAN resolutions:', rows);
});
