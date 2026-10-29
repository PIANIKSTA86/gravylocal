const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, '..', 'empresas', 'empresa_8091', 'pb_data', 'data.db'));

const ncTypeIds = ['dvjnxfmqpex345k', 'hdok4vz6jcwvj6s', 'xpe1f53tf94s2bi', 'cxysh26tel6vnmw', '1lanqydlhi27bwe'];
const placeholders = ncTypeIds.map(() => '?').join(',');

const invs = db.prepare(`
  SELECT id, number, date, customer_id, subtotal, iva_total, total, status, tx_type_id, tx_id, cross_doc_ref, notes 
  FROM invoices 
  WHERE tx_type_id IN (${placeholders}) 
     OR number LIKE 'NC%' 
     OR number LIKE 'NCFE%' 
     OR parent_invoice_id IS NOT NULL AND parent_invoice_id != ''
`).all(...ncTypeIds);

console.log('Facturas de Venta que son Notas Crédito / Devoluciones:', invs.length);
invs.forEach(i => console.log(' ->', i.number, i.date, i.total, i.status, i.notes));

const purs = db.prepare(`
  SELECT id, number, date, supplier_id, subtotal, iva_total, total, status, tx_type_id, tx_id, notes 
  FROM purchase_invoices 
  WHERE tx_type_id IN (${placeholders}) 
     OR number LIKE 'NC%' 
     OR number LIKE 'NDS%'
     OR number LIKE 'NCFC%'
`).all(...ncTypeIds);

console.log('Facturas de Compra que son Notas Crédito / Devoluciones:', purs.length);
purs.forEach(p => console.log(' ->', p.number, p.date, p.total, p.status, p.notes));

const txs = db.prepare(`
  SELECT id, number, date, tx_type_id, total_debit, description 
  FROM transactions 
  WHERE tx_type_id IN (${placeholders}) 
     OR number LIKE 'NC%' 
     OR number LIKE 'NCFE%'
`).all(...ncTypeIds);

console.log('Comprobantes Contables directos tipo NC:', txs.length);
txs.slice(0, 10).forEach(t => console.log(' ->', t.number, t.date, t.total_debit, t.description));
