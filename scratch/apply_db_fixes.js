const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('empresas/empresa_8091/pb_data/data.db');

db.serialize(() => {
  // 1. Update dian_resolutions for NC
  db.run(`
    UPDATE dian_resolutions 
    SET resolution_number = '18760000001', prefix = 'NC', number_from = 1, number_to = 5000, active = 1
    WHERE document_type = 'NC'
  `, function(err) {
    if (err) console.error("Error updating dian_resolutions:", err);
    else console.log(`dian_resolutions updated. Rows affected: ${this.changes}`);
  });

  // 2. Reset einvoice_docs for NC-00000048
  db.run(`
    UPDATE einvoice_docs 
    SET status = 'pendiente', cufe = '', dian_response = '', xml_content = '', sent_at = ''
    WHERE tx_id = 'i0tsz7pdtyoggee'
  `, function(err) {
    if (err) console.error("Error updating einvoice_docs:", err);
    else console.log(`einvoice_docs reset. Rows affected: ${this.changes}`);
  });

  // 3. Clean notes in invoices for NC-00000048
  db.run(`
    UPDATE invoices 
    SET notes = '[Ajuste DIAN: 2] Nota Crédito referente a la Factura Electrónica N° FE-00002916. CUFE: a92208163688be3e66a312d8475ed7db361f0b5a829c5999f71f4986b3aa852676edc83306d6887af55aed9ef8dfe492'
    WHERE id = 'isps4vtsgbfjbc9'
  `, function(err) {
    if (err) console.error("Error updating invoices notes:", err);
    else console.log(`invoices notes updated. Rows affected: ${this.changes}`);
  });

  // Check updated records
  db.all("SELECT * FROM dian_resolutions WHERE document_type = 'NC'", (e, r) => console.log("Updated Resolution:", r));
  db.all("SELECT id, tx_id, status, dian_response FROM einvoice_docs WHERE tx_id = 'i0tsz7pdtyoggee'", (e, r) => console.log("Updated Doc:", r));
  db.all("SELECT id, number, notes, dian_concept, parent_invoice_id, cross_doc_ref FROM invoices WHERE id = 'isps4vtsgbfjbc9'", (e, r) => console.log("Updated Invoice:", r));
});
