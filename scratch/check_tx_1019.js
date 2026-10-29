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
  const txs = await query("SELECT id, number, date, description, cross_type, cross_number, status, book_type, created FROM transactions WHERE created LIKE '%2026-10-19%'");
  console.log('Transactions created on 2026-10-19:', txs.length);
  console.table(txs);

  const txTypes = await query("SELECT id, code, name, prefix FROM transaction_types");
  console.log('\nTransaction types:');
  console.table(txTypes);

  db.close();
}

main().catch(console.error);

