const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'pb_data', 'data.db');
const db = new sqlite3.Database(dbPath);

console.log("Checking transaction types and sample transactions...");

db.all("SELECT id, code, name, prefix, consecutive FROM transaction_types WHERE active = 1", (err, types) => {
  if (err) {
    console.error("Error reading transaction_types:", err);
    process.exit(1);
  }
  console.log(`Found ${types.length} active transaction types.`);
  types.slice(0, 5).forEach(t => {
    console.log(`- Type: [${t.code}] ${t.name} (Prefix: ${t.prefix || 'NONE'}, Consec: ${t.consecutive})`);
  });

  if (types.length > 0) {
    const sampleType = types[0];
    db.all("SELECT id, number, date FROM transactions WHERE tx_type_id = ? ORDER BY date ASC, id ASC LIMIT 5", [sampleType.id], (err2, txs) => {
      if (err2) {
        console.error("Error querying transactions:", err2);
      } else {
        console.log(`Sample transactions for type [${sampleType.code}]:`, txs);
      }
      db.close();
    });
  } else {
    db.close();
  }
});
