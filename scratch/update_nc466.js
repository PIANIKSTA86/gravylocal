const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

const txId = 'mub35nz2gysbzuf';
const invoiceId = 'yrytkbcv8aadv8r';

const updatedNotes = '[SIN_REFERENCIA] [Ajuste DIAN: 5] Nota Crédito sin referencia a facturas - NC 2026-102';
const updatedDesc = '[SIN_REFERENCIA] Nota Crédito NC-00000466 - SURTIACABADOS EN OBRA SAS';

db.serialize(() => {
  db.run(`
    UPDATE invoices 
    SET dian_concept = '5',
        parent_invoice_id = '',
        cross_doc_ref = '',
        notes = ?,
        is_electronic = 1
    WHERE id = ?
  `, [updatedNotes, invoiceId], function(err) {
    if (err) console.error("Error updating invoices:", err);
    else console.log("invoices updated, changes:", this.changes);
  });

  db.run(`
    UPDATE transactions 
    SET description = ?,
        cross_number = '',
        cross_type = ''
    WHERE id = ?
  `, [updatedDesc, txId], function(err) {
    if (err) console.error("Error updating transactions:", err);
    else console.log("transactions updated, changes:", this.changes);
  });

  db.get("SELECT number, dian_concept, parent_invoice_id, cross_doc_ref, notes FROM invoices WHERE id = ?", [invoiceId], (err, row) => {
    console.log("Updated Invoice in DB:", row);
    db.close();
  });
});

