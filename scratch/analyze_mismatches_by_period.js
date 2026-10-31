const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// Check transaction m20k9fvsb3byv4r
const tx = db.prepare("SELECT * FROM transactions WHERE id = 'm20k9fvsb3byv4r'").get();
console.log('Transaction m20k9fvsb3byv4r:', tx);

// Check all invoices that have a mismatch between invoice.total and the sum of debits on their tx_id
const mismatches = db.prepare(`
  SELECT 
    phi.id, phi.number, phi.period, phi.total as inv_total,
    t.id as tx_id, t.number as tx_number,
    COALESCE(SUM(l.debit), 0) as tx_debit
  FROM ph_invoices phi
  LEFT JOIN transactions t ON t.id = phi.tx_id
  LEFT JOIN tx_lines l ON l.tx_id = t.id AND l.account_id = (SELECT id FROM accounts WHERE code = '13459501')
  WHERE phi.status != 'voided'
  GROUP BY phi.id
  HAVING ABS(phi.total - tx_debit) > 0.01
`).all();

console.log(`\nTotal facturas con descuadre entre ph_invoices.total y tx_lines débito en 13459501: ${mismatches.length}`);

// Group mismatches by period
const byPeriod = {};
for (const m of mismatches) {
  if (!byPeriod[m.period]) byPeriod[m.period] = { count: 0, sumInv: 0, sumTx: 0, diff: 0, samples: [] };
  byPeriod[m.period].count++;
  byPeriod[m.period].sumInv += m.inv_total;
  byPeriod[m.period].sumTx += m.tx_debit;
  byPeriod[m.period].diff += (m.inv_total - m.tx_debit);
  if (byPeriod[m.period].samples.length < 3) {
    byPeriod[m.period].samples.push(m);
  }
}
console.log('Descuadres por período:', byPeriod);

db.close();

