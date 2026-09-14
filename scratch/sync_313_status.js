const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');

const row = db.prepare("SELECT id, number, tx_id FROM purchase_invoices WHERE number LIKE '%313%'").get();
console.log('Purchase invoice 313:', row);

if (row && row.tx_id) {
  const einv = db.prepare("SELECT id, tx_id, status, dian_response FROM einvoice_docs WHERE tx_id = ?").get(row.tx_id);
  console.log('Current einvoice_doc:', einv);
  if (einv) {
    db.prepare("UPDATE einvoice_docs SET status = 'rechazada', dian_response = 'No cuenta con creditos o ya han expirado.' WHERE id = ?").run(einv.id);
    console.log('Updated einvoice_doc for 313 with exact Facturatech message');
  }
}
