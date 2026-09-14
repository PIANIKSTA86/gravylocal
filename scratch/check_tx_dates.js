const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

db.all(`SELECT date, count(*) as c FROM transactions GROUP BY length(date), typeof(date) LIMIT 20`, (err, r) => {
  console.log('Date formats in transactions:', r);
});

db.all(`SELECT id, number, date, status FROM transactions ORDER BY date DESC LIMIT 10`, (err, r) => {
  console.log('Sample transactions date:', r);
});
