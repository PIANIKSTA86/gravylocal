const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
console.log('Opening DB at:', dbPath);

try {
  const db = new Database(dbPath, { readonly: true });
  
  // Find transactions that have more lines than usual or duplicate line orders or duplicate amounts
  const txList = db.prepare(`
    SELECT tx_id, COUNT(*) as cnt, SUM(debit) as total_debit, SUM(credit) as total_credit
    FROM tx_lines
    GROUP BY tx_id
  `).all();

  console.log(`Total transactions with lines: ${txList.length}`);

  // Check lines per transaction details
  const suspicious = [];
  for (const t of txList) {
    const lines = db.prepare(`
      SELECT id, account_id, debit, credit, line_order, description, created, updated
      FROM tx_lines
      WHERE tx_id = ?
      ORDER BY created ASC
    `).all(t.tx_id);
    
    // Check if there are exact duplicate account_id/debit/credit pairs with different created timestamps
    const seen = new Set();
    let hasDupes = false;
    for (const l of lines) {
      const key = `${l.account_id}_${l.debit}_${l.credit}_${l.line_order}`;
      if (seen.has(key)) {
        hasDupes = true;
        break;
      }
      seen.add(key);
    }

    if (hasDupes) {
      const tx = db.prepare(`SELECT id, number, date, description, updated FROM transactions WHERE id = ?`).get(t.tx_id);
      suspicious.push({ tx, lineCount: lines.length, lines });
    }
  }

  console.log(`\nFound ${suspicious.length} suspicious transactions with potential duplicated lines:\n`);
  for (const s of suspicious) {
    console.log(`TX ID: ${s.tx?.id} | Number: ${s.tx?.number} | Date: ${s.tx?.date} | Description: ${s.tx?.description} | Updated: ${s.tx?.updated}`);
    console.log(`Total lines count: ${s.lineCount}`);
    for (const l of s.lines) {
      console.log(`   Line ${l.id} | Order: ${l.line_order} | Acc: ${l.account_id} | Debit: ${l.debit} | Credit: ${l.credit} | Created: ${l.created}`);
    }
    console.log('----------------------------------------------------');
  }

} catch (err) {
  console.error('Error opening or querying DB:', err.message);
}
