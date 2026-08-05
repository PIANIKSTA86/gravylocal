const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../pb_data/logs.db');
console.log('Connecting to logs database at:', dbPath);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error opening logs database:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.all('SELECT id, method, url, status, errorMessage, data, created FROM requests ORDER BY created DESC LIMIT 10', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log('\n--- RECENT REQUEST LOGS ---');
    for (const r of rows) {
      console.log(`[${r.created}] ${r.method} ${r.url} - Status: ${r.status}`);
      if (r.errorMessage) {
        console.log(`  Error: ${r.errorMessage}`);
      }
      if (r.data) {
        console.log(`  Data: ${r.data}`);
      }
      console.log('--------------------------------------------------');
    }
    db.close();
  });
});
