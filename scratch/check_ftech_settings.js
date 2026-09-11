const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all(`SELECT key, value FROM settings WHERE key LIKE '%ftech%' OR key LIKE '%einvoice%' OR key LIKE '%dian%'`, (err, rows) => {
  rows.forEach(r => {
    console.log(r.key, ':', r.value, '(len:', r.value ? r.value.length : 0, ')');
  });
});
