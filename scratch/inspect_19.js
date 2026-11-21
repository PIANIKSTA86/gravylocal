const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cutoffDate = '2026-06-30';

// In Image 2, let's see which units have Anticipos / Saldos a favor in Cartera PH:
// Let's inspect the 19 units with negative balances in 13459501:
const targetCodes = [
  '1104', '1201', '1501', '1602', '1702', '1801',
  '21202', '21204', '2401', '2903', '31001', '3401', '3601',
  '4104', '4202', '4204', '4302', '4401', '4603'
];

// Let's check how each unit was processed in Cartera PH:
// In Cartera PH, why is anticipos = 1,066,564?
// Let's check the receipts and transactions for these 19 units!
const txs = db.prepare(`
  SELECT 
    tl.debit, tl.credit, tl.cross_doc_ref, tl.description,
    t.number as tx_num, t.date, p.code as prop_code, p.name as prop_name
  FROM tx_lines tl
  JOIN transactions t ON tl.tx_id = t.id
  JOIN accounts a ON tl.account_id = a.id
  LEFT JOIN ph_properties p ON (
    tl.description LIKE '%' || p.code || '%' OR tl.cross_doc_ref LIKE '%' || p.id || '%'
  )
  WHERE a.code = '13459501' AND t.date <= ? AND tl.credit > 0
  ORDER BY t.date
`).all(cutoffDate);

// Let's find why each of the 19 units has its credit balance:
for (const code of targetCodes) {
  const lines = db.prepare(`
    SELECT t.number, t.date, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
    FROM tx_lines tl
    JOIN transactions t ON tl.tx_id = t.id
    JOIN accounts a ON tl.account_id = a.id
    WHERE a.code = '13459501' AND t.date <= ?
      AND (tl.description LIKE '%${code}%' OR tl.description LIKE '%Apartamento. ' || (SELECT name FROM ph_properties WHERE code='${code}') || '%')
  `).all(cutoffDate);
  
  let deb = 0, cred = 0;
  for (const l of lines) { deb += l.debit; cred += l.credit; }
  console.log(`Unit ${code}: deb=${deb}, cred=${cred}, saldo=${deb - cred}`);
  for (const l of lines) {
    if (l.credit > 0) {
      console.log(`   Credit: tx=${l.number} date=${l.date} amt=${l.credit} ref=${l.cross_doc_ref}`);
    }
  }
}
