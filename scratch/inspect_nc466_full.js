const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.get("SELECT * FROM invoices WHERE number = 'NC-00000466'", (err, inv) => {
  if (err || !inv) {
    console.error("Invoice not found", err);
    db.close();
    return;
  }
  console.log("Invoice:", inv);

  db.get("SELECT * FROM transactions WHERE id = ?", [inv.tx_id], (err2, tx) => {
    console.log("Transaction:", tx);

    db.all("SELECT * FROM einvoice_docs WHERE tx_id = ?", [inv.tx_id], (err3, edocs) => {
      console.log("Einvoice docs count:", edocs ? edocs.length : 0);
      if (edocs) {
        edocs.forEach(d => {
          console.log("Doc:", { id: d.id, status: d.status, cufe: d.cufe, sent_at: d.sent_at, doc_number: d.doc_number });
        });
      }
      db.close();
    });
  });
});

