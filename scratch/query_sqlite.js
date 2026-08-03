const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = 'c:/Users/JULIAN/Desktop/GravyLocal2.0/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening DB:", err);
    return;
  }
});

db.serialize(() => {
  // 1. List all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("TABLES IN DB:", tables.map(t => t.name).join(', '));
  });

  // 2. Count rows in common collections
  const commonTables = ['transactions', 'invoices', 'dian_resolutions', 'transaction_types', 'einvoice_docs'];
  for (const table of commonTables) {
    db.get(`SELECT COUNT(*) as count FROM ${table}`, [], (err, row) => {
      if (err) {
        console.log(`Table ${table} error:`, err.message);
      } else {
        console.log(`Table ${table} has ${row.count} rows`);
      }
    });
  }

  // 3. Print some recent invoices
  db.all("SELECT * FROM invoices LIMIT 5", [], (err, rows) => {
    if (!err && rows && rows.length > 0) {
      console.log("\nRECENT INVOICES (First 5):");
      console.log(JSON.stringify(rows, null, 2));
    }
  });

  // 4. Print some recent transactions
  db.all("SELECT * FROM transactions LIMIT 5", [], (err, rows) => {
    if (!err && rows && rows.length > 0) {
      console.log("\nRECENT TRANSACTIONS (First 5):");
      console.log(JSON.stringify(rows, null, 2));
    }
  });
});
