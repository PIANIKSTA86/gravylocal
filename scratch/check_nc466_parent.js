const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db', sqlite3.OPEN_READONLY);

db.get("SELECT * FROM invoices WHERE number = 'NC-00000466'", (err, inv) => {
  if (err || !inv) {
    console.log("Error or not found:", err);
    return;
  }
  console.log("NC Invoice:", {
    id: inv.id,
    number: inv.number,
    parent_invoice_id: inv.parent_invoice_id,
    cross_doc_ref: inv.cross_doc_ref,
    dian_concept: inv.dian_concept,
    notes: inv.notes,
    subtotal: inv.subtotal,
    total: inv.total
  });

  if (inv.parent_invoice_id) {
    db.get("SELECT * FROM invoices WHERE id = ?", [inv.parent_invoice_id], (err2, parentInv) => {
      console.log("Parent Invoice:", parentInv ? {
        id: parentInv.id,
        number: parentInv.number,
        date: parentInv.date,
        total: parentInv.total
      } : "Not found in invoices");

      db.get("SELECT * FROM einvoice_docs WHERE tx_id = ?", [parentInv ? parentInv.tx_id : ''], (err3, parentEdoc) => {
        console.log("Parent einvoice_doc:", parentEdoc ? {
          cufe: parentEdoc.cufe,
          status: parentEdoc.status,
          sent_at: parentEdoc.sent_at
        } : "Not found in einvoice_docs");
        db.close();
      });
    });
  } else {
    db.close();
  }
});

