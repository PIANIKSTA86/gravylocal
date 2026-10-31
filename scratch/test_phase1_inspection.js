const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath);

console.log('=== FASE 1: SANEAMIENTO Y RESINCRONIZACIÓN DE DATOS (PUERTO 8094) ===');

// 1. Re-vincular las 3 facturas huérfanas
const orphanNumbers = ['CF-202608-000181', 'CF-202609-000181', 'CF-202609-000182'];
for (const num of orphanNumbers) {
  const inv = db.prepare("SELECT id, number, tx_id, total FROM ph_invoices WHERE number = ?").get(num);
  const tx = db.prepare("SELECT id, number, status FROM transactions WHERE number = ?").get(num);
  console.log(`Factura ${num}: Inv tx_id='${inv?.tx_id}', Tx found id='${tx?.id}', status='${tx?.status}'`);
}

// 2. Transacción draft ws24o3zh9g7adjo
const draftTx = db.prepare("SELECT id, number, status FROM transactions WHERE id = 'ws24o3zh9g7adjo'").get();
console.log('Draft Tx:', draftTx);

// 3. Inspeccionar las 17 facturas con desfase en mora
const moraInvs = [
  'CF-202606-000160', 'CF-202607-000015', 'CF-202607-000025', 'CF-202607-000051',
  'CF-202607-000084', 'CF-202607-000129', 'CF-202608-000025', 'CF-202608-000051',
  'CF-202608-000084', 'CF-202608-000129', 'CF-202609-000025', 'CF-202609-000032',
  'CF-202609-000038', 'CF-202609-000051', 'CF-202609-000074', 'CF-202609-000084',
  'CF-202609-000129'
];

console.log(`\nVerificando líneas de las ${moraInvs.length} facturas con mora:`);
for (const num of moraInvs) {
  const inv = db.prepare("SELECT id, number, total, tx_id FROM ph_invoices WHERE number = ?").get(num);
  const lines = db.prepare("SELECT * FROM ph_invoice_lines WHERE invoice_id = ?").all(inv.id);
  const txLines = db.prepare(`
    SELECT l.*, a.code as acc_code 
    FROM tx_lines l 
    LEFT JOIN accounts a ON a.id = l.account_id 
    WHERE l.tx_id = ?
  `).all(inv.tx_id);
  
  const totalInv = Number(inv.total);
  const totalTxDeb = txLines.filter(l => l.acc_code === '13459501').reduce((s, l) => s + l.debit, 0);
  console.log(`  ${num}: TotalInv=${totalInv}, TotalTxDeb13=${totalTxDeb}, Diff=${totalInv - totalTxDeb}, InvLines=${lines.length}, TxLines=${txLines.length}`);
}

db.close();

