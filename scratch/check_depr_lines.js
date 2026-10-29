const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./pb_data/data.db');

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  const types = await query("SELECT id, code, name, prefix FROM transaction_types");
  console.log('Types:', types);

  // Check transactions by type NA or DP
  const naType = types.find(t => t.code === 'NA' || t.prefix === 'DP');
  console.log('NA / DP type:', naType);

  if (naType) {
    const txsNA = await query("SELECT * FROM transactions WHERE tx_type_id = ?", [naType.id]);
    console.log(`Transactions with type ${naType.code}:`, txsNA.length);
    console.table(txsNA);
  }

  // Check all distinct tx_type_id in transactions
  const distinctTypes = await query("SELECT tx_type_id, count(*) as count FROM transactions GROUP BY tx_type_id");
  console.log('Distinct tx types used in transactions:');
  console.table(distinctTypes);

  // Check accounts 5160 / 1592 (depreciation expense / accumulated)
  const deprAccounts = await query("SELECT id, code, name FROM accounts WHERE code LIKE '5160%' OR code LIKE '5260%' OR code LIKE '1592%'");
  console.log('Depr accounts in PUC:');
  console.table(deprAccounts);

  if (deprAccounts.length > 0) {
    const accIds = deprAccounts.map(a => `'${a.id}'`).join(',');
    const lines = await query(`SELECT tx.id, tx.number, tx.date, tx.description, tl.debit, tl.credit, tl.account_id FROM tx_lines tl JOIN transactions tx ON tl.transaction_id = tx.id WHERE tl.account_id IN (${accIds})`);
    console.log('Any tx_lines using depr accounts:', lines.length);
    console.table(lines);
  }

  db.close();
}

main().catch(console.error);

