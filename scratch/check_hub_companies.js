const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.resolve('hub', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening DB:', err);
    process.exit(1);
  }
});

db.all("SELECT id, name, nit, url, port, active FROM hub_companies", (err, rows) => {
  if (err) {
    console.log('Error querying hub_companies:', err.message);
  } else {
    console.log('HUB COMPANIES:');
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
