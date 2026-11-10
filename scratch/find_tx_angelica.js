const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

// Check transactions columns
const tCols = db.prepare("PRAGMA table_info(transactions)").all().map(c => c.name);
console.log('Columns of transactions:', tCols);

// Check transactions in September 2026
const txs = db.prepare("SELECT * FROM transactions WHERE date LIKE '2026-09%'").all();
console.log(`Transactions in September 2026: ${txs.length}`);
txs.forEach(t => {
  console.log(`- ID: ${t.id}, Date: ${t.date}, Num: ${t.number}, Total: ${t.total}, Desc: ${t.description}, CrossType: ${t.cross_type}, CrossNum: ${t.cross_number}`);
});

// Check if any transaction has description mentioning Moncada or Angelica
const allAngelicaTx = db.prepare("SELECT * FROM transactions WHERE description LIKE '%MONCADA%' OR description LIKE '%ANGELICA%'").all();
console.log(`\nTransactions mentioning Angelica (${allAngelicaTx.length}):`);
allAngelicaTx.forEach(t => {
  console.log(`- ID: ${t.id}, Date: ${t.date}, Desc: ${t.description}, Total: ${t.total}`);
});

// Also check transaction_lines for third_party_id = 'vsu8bz83547sxrn'
const tLines = db.prepare("SELECT * FROM transaction_lines WHERE third_party_id = 'vsu8bz83547sxrn'").all();
console.log(`\nTransaction lines for Angelica (${tLines.length}):`);
tLines.forEach(l => {
  console.log(`- TxID: ${l.transaction_id}, Account: ${l.account_id}, Debit: ${l.debit}, Credit: ${l.credit}, Desc: ${l.description}`);
});

