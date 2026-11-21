const sqlite3 = require('sqlite3').verbose();
const dbPath = './empresas/empresa_8091/pb_data/data.db';

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Error opening DB:", err);
    process.exit(1);
  }
});

db.serialize(() => {
  console.log("=== TRANSACTIONS con '3176' ===");
  db.all("SELECT id, number, date, description, third_party_id, tx_type_id, status FROM transactions WHERE number LIKE '%3176%'", [], (err, rows) => {
    console.log("Transactions:", rows);
    if (rows && rows.length > 0) {
      for (const row of rows) {
        db.all("SELECT * FROM tx_lines WHERE tx_id = ?", [row.id], (err, lines) => {
          console.log(`tx_lines for ${row.number}:`, JSON.stringify(lines, null, 2));
        });
        db.all("SELECT * FROM invoices WHERE tx_id = ?", [row.id], (err, invs) => {
          console.log(`invoices for tx_id ${row.id}:`, JSON.stringify(invs, null, 2));
        });
      }
    }
  });

  console.log("=== INVOICES con '3176' ===");
  db.all("SELECT id, number, date, subtotal, iva_total, total, payable_total, tx_id, tx_number FROM invoices WHERE number LIKE '%3176%' OR tx_number LIKE '%3176%'", [], (err, invs) => {
    console.log("Invoices:", JSON.stringify(invs, null, 2));
    if (invs && invs.length > 0) {
      for (const inv of invs) {
        db.all("SELECT * FROM invoice_lines WHERE invoice_id = ?", [inv.id], (err, lines) => {
          console.log(`invoice_lines for inv ${inv.id}:`, JSON.stringify(lines, null, 2));
        });
      }
    }
  });

  console.log("=== THIRD PARTY CARLOS ARTURO ===");
  db.all("SELECT id, name, doc_number FROM third_parties WHERE name LIKE '%CARLOS ARTURO%' OR doc_number LIKE '%4472973%'", [], (err, tps) => {
    console.log("Third parties:", JSON.stringify(tps, null, 2));
  });
});
