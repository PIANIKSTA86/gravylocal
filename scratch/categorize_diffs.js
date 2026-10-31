const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// Check anticipos total in 13459501
const antLines = db.prepare(`
  SELECT l.cross_doc_ref, l.credit, l.third_party_id, t.number, t.date
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
    AND (l.cross_doc_ref LIKE 'ANTICIPO-%' OR l.cross_doc_ref LIKE 'ANT-%')
`).all();

console.log(`Total anticipos registrados en 13459501: ${antLines.length}`);
let sumAnt = 0;
for (const a of antLines) {
  sumAnt += a.credit;
}
console.log(`Suma de anticipos en 13459501: ${sumAnt}`);

// Invoices with total != debits in 13459501 (excluding 2026-05 opening)
const invMismatches = db.prepare(`
  SELECT 
    phi.id, phi.number, phi.period, phi.total as inv_total,
    t.id as tx_id, t.number as tx_number,
    COALESCE(SUM(l.debit), 0) as tx_debit,
    (phi.total - COALESCE(SUM(l.debit), 0)) as diff
  FROM ph_invoices phi
  LEFT JOIN transactions t ON t.id = phi.tx_id
  LEFT JOIN tx_lines l ON l.tx_id = t.id AND l.account_id = (SELECT id FROM accounts WHERE code = '13459501')
  WHERE phi.status != 'voided' AND phi.period != '2026-05'
  GROUP BY phi.id
  HAVING ABS(phi.total - tx_debit) > 0.01
`).all();

console.log(`Total facturas con descuadre en débitos (2026-06 a 2026-10): ${invMismatches.length}`);
let sumInvDiff = 0;
for (const m of invMismatches) {
  sumInvDiff += m.diff;
  console.log(`  ${m.number} (${m.period}): InvTotal=${m.inv_total} TxDeb=${m.tx_debit} Diff=${m.diff}`);
}
console.log(`Suma de diferencias en facturas: ${sumInvDiff}`);

// Unposted/Missing invoices
const unposted = db.prepare(`
  SELECT phi.number, phi.period, phi.total, phi.tx_id
  FROM ph_invoices phi
  WHERE phi.status != 'voided' AND (phi.tx_id IS NULL OR phi.tx_id = '' OR phi.tx_id IN (SELECT id FROM transactions WHERE status = 'draft'))
`).all();
console.log('\nFacturas no contabilizadas o en borrador:', unposted);

db.close();

