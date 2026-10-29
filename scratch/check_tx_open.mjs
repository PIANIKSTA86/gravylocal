import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get('asomshl38rr0fx3');
console.log('Transaction asomshl38rr0fx3:');
console.log(tx);

const lines = db.prepare('SELECT count(*) as count, sum(debit) as debits, sum(credit) as credits FROM tx_lines WHERE tx_id = ?').get('asomshl38rr0fx3');
console.log('Transaction lines summary:', lines);

// Let's check how SI invoices were created
const siNoTx = db.prepare("SELECT count(*) as count, sum(total) as total FROM ph_invoices WHERE period = '2026-05' AND (tx_id = '' OR tx_id IS NULL)").get();
const siWithTx = db.prepare("SELECT count(*) as count, sum(total) as total FROM ph_invoices WHERE period = '2026-05' AND tx_id != ''").get();
console.log('SI Invoices with NO tx:', siNoTx);
console.log('SI Invoices WITH tx:', siWithTx);
