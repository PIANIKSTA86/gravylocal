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
  console.log('=== AUDIT LOGS FOR DEPRECIATION / NIIF ===');
  try {
    const logs = await query("SELECT * FROM audit_logs WHERE action LIKE '%DEPR%' OR resource LIKE '%asset%' OR resource LIKE '%niif%' OR details LIKE '%deprec%' ORDER BY created DESC LIMIT 20");
    console.table(logs);
  } catch(e) {
    console.log('Audit log query err:', e.message);
  }

  console.log('=== TRANSACTIONS WITH status != active OR DATE in 2026-01 ===');
  try {
    const txs = await query("SELECT id, number, date, description, cross_type, cross_number, status, book_type FROM transactions WHERE date >= '2026-01-01' AND date <= '2026-01-31 23:59:59'");
    console.log('Total txs in 2026-01:', txs.length);
    console.table(txs.slice(0, 10));
  } catch(e) {
    console.log('Txs err:', e.message);
  }

  db.close();
}

main().catch(console.error);

