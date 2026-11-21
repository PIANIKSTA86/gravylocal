const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

const thirdId = 's2al2xdlkno843k';

console.log('=== TX_LINES SCHEMA ===');
const tlCols = db.prepare("PRAGMA table_info(tx_lines)").all();
console.log('Columns:', tlCols.map(c => c.name));

console.log('\n=== ALL TX_LINES FOR THOSE RC TRANSACTIONS ===');
const rcNumbers = ['RC-00000049', 'RC-00000117', 'RC-00000196', 'RC-00000347', 'RC-00000569'];
const rcTxs = db.prepare(`SELECT id, number, date, status FROM transactions WHERE number IN (${rcNumbers.map(() => '?').join(',')})`).all(...rcNumbers);
const rcTxIds = rcTxs.map(t => t.id);

if (rcTxIds.length > 0) {
  const lines = db.prepare(`
    SELECT t.number as rc, t.date, a.code as acc_code, a.name as acc_name, tl.debit, tl.credit, tl.cross_doc_ref, tl.third_party_id, tp.name as third_name, tl.description
    FROM tx_lines tl
    JOIN transactions t ON t.id = tl.tx_id
    LEFT JOIN accounts a ON a.id = tl.account_id
    LEFT JOIN third_parties tp ON tp.id = tl.third_party_id
    WHERE tl.tx_id IN (${rcTxIds.map(() => '?').join(',')})
    ORDER BY t.date ASC, t.number ASC, tl.id ASC
  `).all(...rcTxIds);
  console.table(lines);
}

console.log('\n=== ALL TX_LINES FOR THIRD DILSA OR DESCRIPTION LIKE 302 ===');
const allLines = db.prepare(`
  SELECT t.number as tx, t.date, a.code as acc_code, a.name as acc_name, tl.debit, tl.credit, tl.cross_doc_ref, tl.description
  FROM tx_lines tl
  JOIN transactions t ON t.id = tl.tx_id
  LEFT JOIN accounts a ON a.id = tl.account_id
  WHERE tl.third_party_id = ? OR tl.description LIKE '%302%' OR tl.cross_doc_ref LIKE '%302%'
  ORDER BY t.date ASC, t.number ASC
`).all(thirdId);
console.table(allLines);

db.close();
