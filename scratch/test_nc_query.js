const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8091/pb_data/data.db');

const count = db.prepare('SELECT count(*) as c FROM invoices').get();
console.log('Total invoices in DB:', count.c);

const ncs = db.prepare("SELECT id, number, date, total, status, notes, cross_doc_ref, parent_invoice_id, tx_type_id FROM invoices WHERE number LIKE '%NC%' OR notes LIKE '%Ajuste DIAN%'").all();
console.log('NCs in DB count:', ncs.length);
console.log('Sample NCs:', JSON.stringify(ncs.slice(0, 3), null, 2));

const purchNcs = db.prepare("SELECT id, number, date, total, status, notes FROM purchase_invoices WHERE number LIKE '%NC%' OR number LIKE '%NDS%'").all();
console.log('Purchase NCs/NDS in DB count:', purchNcs.length);
