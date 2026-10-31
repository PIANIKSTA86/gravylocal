const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// Check all invoices that have mora lines
const moraInvs = db.prepare(`
  SELECT phi.id, phi.number, phi.period, phi.total, phi.tx_id, il.amount as mora_amount, il.description as mora_desc
  FROM ph_invoice_lines il
  INNER JOIN ph_invoices phi ON phi.id = il.invoice_id
  WHERE (il.description LIKE '%mora%' OR il.description LIKE '%interes%') AND phi.status != 'voided'
`).all();

console.log(`Invoices with mora lines (${moraInvs.length}):`);
for (const mi of moraInvs) {
  const txLines = db.prepare(`
    SELECT a.code, l.debit, l.credit, l.description
    FROM tx_lines l
    LEFT JOIN accounts a ON a.id = l.account_id
    WHERE l.tx_id = ?
  `).all(mi.tx_id);
  
  const deb13 = txLines.filter(l => l.code && l.code.startsWith('13')).reduce((s, l) => s + l.debit, 0);
  console.log(`\nInv ${mi.number} (${mi.period}): Total=${mi.total}, Mora=${mi.mora_amount}`);
  console.log(`  TxId=${mi.tx_id}, Debits13=${deb13}, Diff=${mi.total - deb13}`);
  for (const tl of txLines) {
    console.log(`    [${tl.code}] Deb=${tl.debit} Cred=${tl.credit} -- ${tl.description}`);
  }
}

db.close();

