const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// 1. Transaction types touching 13459501
const txTypes13 = db.prepare(`
  SELECT tt.name as type_name, tt.code as type_code, COUNT(DISTINCT t.id) as tx_count,
         SUM(l.debit) as debits, SUM(l.credit) as credits
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE a.code = '13459501' AND t.status = 'active'
  GROUP BY tt.name, tt.code
`).all();
console.log('Movimientos en 13459501 por Tipo de Transacción:', txTypes13);

// 2. The 3 invoices with tx_id null
const invNoTx = db.prepare(`
  SELECT phi.id, phi.number, phi.period, phi.date, phi.total, phi.status, phi.property_id, prop.code as unit
  FROM ph_invoices phi
  LEFT JOIN ph_properties prop ON prop.id = phi.property_id
  WHERE phi.status != 'voided' AND (phi.tx_id IS NULL OR phi.tx_id = '')
`).all();
console.log('\nFacturas sin tx_id:', invNoTx);

// 3. Invoices with draft tx
const invDraftTx = db.prepare(`
  SELECT phi.id, phi.number, phi.period, phi.date, phi.total, phi.status, phi.tx_id, t.status as tx_status, prop.code as unit
  FROM ph_invoices phi
  LEFT JOIN ph_properties prop ON prop.id = phi.property_id
  LEFT JOIN transactions t ON t.id = phi.tx_id
  WHERE phi.status != 'voided' AND t.status = 'draft'
`).all();
console.log('\nFacturas con tx_status draft:', invDraftTx);

// 4. Voided invoices: do any voided invoices still have active transactions?!
const voidedWithTx = db.prepare(`
  SELECT phi.id, phi.number, phi.period, phi.total, phi.status, phi.tx_id, t.status as tx_status
  FROM ph_invoices phi
  INNER JOIN transactions t ON t.id = phi.tx_id
  WHERE phi.status = 'voided' AND t.status = 'active'
`).all();
console.log('\nFacturas ANULADAS con transacciones ACTIVAS en contabilidad:', voidedWithTx);

// 5. Transactions linked to ph_invoices vs ph_invoices total
// Check if transaction debit matches invoice total
const mismatchInvTx = db.prepare(`
  SELECT phi.id, phi.number, phi.period, phi.total as inv_total,
         SUM(l.debit) as tx_debit, SUM(l.credit) as tx_credit
  FROM ph_invoices phi
  INNER JOIN transactions t ON t.id = phi.tx_id
  INNER JOIN tx_lines l ON l.tx_id = t.id AND l.account_id = (SELECT id FROM accounts WHERE code = '13459501')
  WHERE phi.status != 'voided' AND t.status = 'active'
  GROUP BY phi.id
  HAVING ABS(phi.total - SUM(l.debit)) > 0.01
`).all();
console.log('\nFacturas activas donde el total no coincide con el débito en 13459501:', mismatchInvTx.length, mismatchInvTx.slice(0, 5));

// 6. Are there transactions on 13459501 that are NOT referenced in ph_invoices.tx_id?
const nonInvoiceDebits = db.prepare(`
  SELECT t.id, t.number, t.date, t.description, tt.name as type_name, l.debit, l.credit, l.cross_doc_ref, l.third_party_id
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  LEFT JOIN transaction_types tt ON tt.id = t.tx_type_id
  INNER JOIN accounts a ON a.id = l.account_id
  LEFT JOIN ph_invoices phi ON phi.tx_id = t.id
  WHERE a.code = '13459501' AND t.status = 'active' AND phi.id IS NULL AND l.debit > 0
`).all();
console.log('\nDébitos en 13459501 que NO provienen de ph_invoices (ej. saldos iniciales, notas):', nonInvoiceDebits.length);
for (const d of nonInvoiceDebits.slice(0, 10)) {
  console.log(`  Tx ${d.type_name} #${d.number} (${d.date}): Deb=${d.debit} Ref='${d.cross_doc_ref}' Desc='${d.description}'`);
}

db.close();
