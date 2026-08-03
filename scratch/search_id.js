const sqlite3 = require('sqlite3').verbose();
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const tables = ['transactions', 'invoices', 'dian_resolutions', 'transaction_types', 'einvoice_docs'];

db.serialize(() => {
  for (const table of tables) {
    db.get(`SELECT id FROM ${table} WHERE id = '2zwp7c158csdnl5'`, [], (err, row) => {
      if (err) {
        console.error(`Error searching ${table}:`, err.message);
      } else if (row) {
        console.log(`Found ID 2zwp7c158csdnl5 in table: ${table}`);
      }
    });
  }
});
