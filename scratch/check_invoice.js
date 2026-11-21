const Database = require('better-sqlite3');
const path = './empresas/empresa_8091/data.db';
const db = new Database(path, { readonly: true });

console.log('--- BUSCANDO TRANSACCIÓN 3176 ---');
const txs = db.prepare("SELECT id, number, date, total, third_party_id, type_id FROM transactions WHERE number LIKE '%3176%'").all();
console.log('Transactions:', JSON.stringify(txs, null, 2));

if (txs.length > 0) {
  for (const tx of txs) {
    console.log(`\n=== DETALLE TX ${tx.id} (${tx.number}) ===`);
    const invByTx = db.prepare("SELECT * FROM invoices WHERE tx_id = ?").all(tx.id);
    console.log('Invoices por tx_id:', JSON.stringify(invByTx, null, 2));

    const txLines = db.prepare("SELECT * FROM tx_lines WHERE tx_id = ? ORDER BY line_order").all(tx.id);
    console.log('tx_lines count:', txLines.length);
    console.log('tx_lines:', JSON.stringify(txLines.map(l => ({
      line_order: l.line_order,
      account_id: l.account_id,
      description: l.description,
      debit: l.debit,
      credit: l.credit
    })), null, 2));

    if (invByTx.length > 0) {
      for (const inv of invByTx) {
        const invLines = db.prepare("SELECT * FROM invoice_lines WHERE invoice_id = ? ORDER BY line_order").all(inv.id);
        console.log(`invoice_lines para inv ${inv.id} count:`, invLines.length);
        console.log('invoice_lines:', JSON.stringify(invLines, null, 2));
      }
    }
  }
}

console.log('\n--- BUSCANDO EN INVOICES DIRECTAMENTE POR 3176 ---');
const allInvs = db.prepare("SELECT * FROM invoices WHERE number LIKE '%3176%'").all();
console.log('Invoices encontradas por number:', JSON.stringify(allInvs, null, 2));
for (const inv of allInvs) {
  const invLines = db.prepare("SELECT * FROM invoice_lines WHERE invoice_id = ? ORDER BY line_order").all(inv.id);
  console.log(`invoice_lines para inv ${inv.id} (tx_id: ${inv.tx_id}) count:`, invLines.length);
  console.log('invoice_lines:', JSON.stringify(invLines, null, 2));
}

console.log('\n--- BUSCANDO EN electronic_documents DIRECTAMENTE POR 3176 ---');
try {
  const eDocs = db.prepare("SELECT id, tx_id, prefix, folio, cufe, status, document_type, response_message, created FROM electronic_documents WHERE folio LIKE '%3176%' OR prefix LIKE '%3176%'").all();
  console.log('electronic_documents:', JSON.stringify(eDocs, null, 2));
} catch (e) {
  console.log('Error buscando electronic_documents:', e.message);
}
