import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/JULIAN/Desktop/GravyLocalTABS/empresas/empresa_8094/pb_data/data.db', { open: true, readOnly: true });

const voidedInvs = db.prepare("SELECT number FROM ph_invoices WHERE period = '2026-05' AND status = 'voided'").all().map(r => r.number);
console.log('Total facturas SI huérfanas anuladas:', voidedInvs.length);

let matchesFound = [];
for (const num of voidedInvs) {
  const matches = db.prepare("SELECT tl.id, tl.cross_doc_ref, tl.credit, tl.debit, t.number as tx_number FROM tx_lines tl JOIN transactions t ON t.id = tl.tx_id WHERE tl.cross_doc_ref LIKE ?").all(num + '%');
  if (matches.length > 0) {
    matchesFound.push({ num, matches });
  }
}

console.log('Facturas huérfanas con referencias en tx_lines pendientes:', matchesFound.length);
if (matchesFound.length > 0) {
  console.log(JSON.stringify(matchesFound, null, 2));
} else {
  console.log('>>> NINGUNA factura huérfana tiene movimientos pendientes o huérfanos en toda la base de datos. <<<');
}

// Check how many properties in total benefited from removing the duplicate initial balance
console.log('\n--- IMPACTO GLOBAL EN TODAS LAS COPROPIEDADES ---');
const totalProps = db.prepare("SELECT count(DISTINCT property_id) as count FROM ph_invoices WHERE period = '2026-05' AND status = 'voided'").get();
console.log(`Propiedades que tenían saldo inicial duplicado y fueron corregidas: ${totalProps.count}`);
