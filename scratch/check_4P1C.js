const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log("=== SEARCHING 4P1C TRANSACTIONS ===");
    const txs = db.prepare("SELECT id, number FROM transactions WHERE number LIKE '%4P1C%'").all();
    txs.forEach(tx => {
      console.log(`Found: ID=${tx.id}, Number=${tx.number}`);
    });
  } catch (err) {
    console.error(err);
  }
}
run();
