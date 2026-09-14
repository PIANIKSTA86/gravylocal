const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all(`SELECT date, count(*) as c FROM bank_movements GROUP BY length(date), typeof(date)`, (err, r) => {
  console.log('Date formats in bank_movements:', r);
});
