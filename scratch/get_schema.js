const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening DB:", err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.all("SELECT sql FROM sqlite_master WHERE name='transactions'", [], (err, rows) => {
    console.log("schema transactions:", rows[0]?.sql);
  });
  db.all("SELECT sql FROM sqlite_master WHERE name='electronic_documents'", [], (err, rows) => {
    console.log("schema electronic_documents:", rows[0]?.sql);
  });
  db.all("SELECT sql FROM sqlite_master WHERE name='invoices'", [], (err, rows) => {
    console.log("schema invoices:", rows[0]?.sql);
  });
});
