const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.all("SELECT key, value FROM settings WHERE key LIKE '%matias%' OR key LIKE '%einvoice%' OR key LIKE '%dian%'", [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Found', rows.length, 'settings:');
  rows.forEach(r => {
    const val = (r.value && r.key.includes('token')) ? (r.value.slice(0, 10) + '...' + r.value.slice(-6)) : r.value;
    console.log(` - ${r.key}: ${val}`);
  });
  db.close();
});
