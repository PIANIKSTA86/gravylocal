const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db', sqlite3.OPEN_READONLY);

db.serialize(() => {
  db.all("SELECT * FROM transactions WHERE number = 'NC-00000048' OR number LIKE '%00000048%'", (err, rows) => {
    if (err) return console.error(err);
    console.log("=== TRANSACTIONS IN EMPRESA_8091 ===");
    console.log(rows);
    if (rows && rows.length > 0) {
      const nc = rows.find(r => r.number === 'NC-00000048') || rows[0];
      db.all(`SELECT * FROM invoices WHERE tx_id = '${nc.id}' OR number LIKE '%48%'`, (e2, invs) => {
        console.log("=== INVOICES ===", invs);
      });
      db.all(`SELECT * FROM einvoice_docs WHERE tx_id = '${nc.id}'`, (e3, edocs) => {
        console.log("=== EINVOICE DOCS ===", edocs);
      });
      db.all(`SELECT * FROM tx_lines WHERE tx_id = '${nc.id}'`, (e4, lines) => {
        console.log("=== TX LINES ===", lines);
      });
    }
  });
});
