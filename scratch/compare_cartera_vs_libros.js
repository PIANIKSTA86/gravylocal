const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

// 1. Get account 13459501 ID
const cxcAcc = db.prepare("SELECT id, code, name FROM accounts WHERE code = '13459501'").get();
console.log('Cartera PH account:', cxcAcc);

// Also check all 13 accounts that have movements
const active13Accounts = db.prepare(`
  SELECT a.id, a.code, a.name, COUNT(l.id) as tx_count, SUM(l.debit) as total_debit, SUM(l.credit) as total_credit, (SUM(l.debit) - SUM(l.credit)) as balance
  FROM accounts a
  INNER JOIN tx_lines l ON l.account_id = a.id
  INNER JOIN transactions t ON t.id = l.tx_id
  WHERE a.code LIKE '13%' AND t.status = 'active'
  GROUP BY a.id, a.code, a.name
  ORDER BY a.code
`).all();

console.log('\nCuentas 13 con movimientos activos:');
for (const acc of active13Accounts) {
  console.log(`  ${acc.code} ${acc.name}: Deb=${acc.total_debit} Cred=${acc.total_credit} Saldo=${acc.balance} (${acc.tx_count} líneas)`);
}

// 2. Look at 28 accounts with movements
const active28Accounts = db.prepare(`
  SELECT a.id, a.code, a.name, COUNT(l.id) as tx_count, SUM(l.debit) as total_debit, SUM(l.credit) as total_credit, (SUM(l.credit) - SUM(l.debit)) as balance
  FROM accounts a
  INNER JOIN tx_lines l ON l.account_id = a.id
  INNER JOIN transactions t ON t.id = l.tx_id
  WHERE a.code LIKE '28%' AND t.status = 'active'
  GROUP BY a.id, a.code, a.name
  ORDER BY a.code
`).all();
console.log('\nCuentas 28 con movimientos activos:');
for (const acc of active28Accounts) {
  console.log(`  ${acc.code} ${acc.name}: Deb=${acc.total_debit} Cred=${acc.total_credit} Saldo=${acc.balance} (${acc.tx_count} líneas)`);
}

// 3. Total ph_invoices not voided
const invTotals = db.prepare(`
  SELECT 
    COUNT(*) as total_invoices,
    SUM(total) as grand_total_invoiced,
    SUM(CASE WHEN status = 'posted' THEN total ELSE 0 END) as posted_total,
    SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END) as paid_total,
    SUM(CASE WHEN status = 'draft' THEN total ELSE 0 END) as draft_total
  FROM ph_invoices
  WHERE status != 'voided'
`).get();
console.log('\nResumen Facturación PH:', invTotals);

// 4. Invoices and their tx_id
const invTxStatus = db.prepare(`
  SELECT 
    phi.status as inv_status,
    t.status as tx_status,
    COUNT(*) as count,
    SUM(phi.total) as total_ph
  FROM ph_invoices phi
  LEFT JOIN transactions t ON t.id = phi.tx_id
  WHERE phi.status != 'voided'
  GROUP BY phi.status, t.status
`).all();
console.log('\nFacturas vs Estado de su transacción contable:', invTxStatus);

// 5. Check payments/abonos to cartera in tx_lines
// How are payments recorded? Let's check tx_lines crossing ph_invoices
const samplePayments = db.prepare(`
  SELECT t.type, t.number, t.date, l.cross_doc_ref, a.code as acc_code, l.debit, l.credit, l.third_party_id
  FROM tx_lines l
  INNER JOIN transactions t ON t.id = l.tx_id
  INNER JOIN accounts a ON a.id = l.account_id
  WHERE t.status = 'active' AND (l.cross_doc_ref != '' OR a.code LIKE '134595%')
  LIMIT 20
`).all();
console.log('\nMuestra de líneas con cross_doc_ref o cuenta 134595:');
for (const p of samplePayments) {
  console.log(`  Tx ${p.type} #${p.number} (${p.date}) [${p.acc_code}]: Deb=${p.debit} Cred=${p.credit} CrossRef='${p.cross_doc_ref}' Third=${p.third_party_id}`);
}

db.close();

