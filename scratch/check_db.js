const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../pb_data/data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

db.serialize(() => {
  // Check if RC-00000595 exists
  db.get('SELECT * FROM transactions WHERE number = "RC-00000595"', [], (err, row) => {
    console.log('\n--- RC-00000595 ---');
    console.log(err || row || 'Not found');
  });

  // Check if RC-00000596 exists
  db.get('SELECT * FROM transactions WHERE number = "RC-00000596"', [], (err, row) => {
    console.log('\n--- RC-00000596 ---');
    console.log(err || row || 'Not found');
  });

  // Check max number
  db.get('SELECT max(number) as max_num FROM transactions WHERE number LIKE "RC-%"', [], (err, row) => {
    console.log('\n--- MAX RC NUMBER ---');
    console.log(err || row);
  });

  // Check table schema for transactions
  db.all('PRAGMA table_info(transactions)', [], (err, rows) => {
    console.log('\n--- TRANSACTIONS SCHEMA ---');
    console.log(err || rows);
    db.close();
  });
});
