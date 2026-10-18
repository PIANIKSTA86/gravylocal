const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'pb_data', 'auxiliary.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT * FROM _logs WHERE message LIKE '%transactions%' ORDER BY rowid DESC LIMIT 5", (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  rows.forEach(r => {
    console.log('ID:', r.id, 'TIME:', r.created, 'MSG:', r.message);
    try {
      console.log('DATA:', JSON.stringify(JSON.parse(r.data), null, 2));
    } catch (_) {
      console.log('RAW DATA:', r.data);
    }
  });
  db.close();
});
