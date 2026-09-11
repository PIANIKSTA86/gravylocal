const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all(`SELECT * FROM einvoice_docs WHERE id = 'vryzd550fzgmk2b'`, (err, rows) => {
  console.log(rows);
});
