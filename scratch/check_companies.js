const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.resolve('hub', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath, () => {
  db.all("SELECT id, name, nit, company_url, active FROM companies", (err, rows) => {
    console.log('COMPANIES IN HUB:');
    console.log(JSON.stringify(rows, null, 2));
    db.close();
  });
});
