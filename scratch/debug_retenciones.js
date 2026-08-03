const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    // Query accounts with codes starting with 23651502
    const acc = db.prepare("SELECT * FROM accounts WHERE code = '23651502'").all();
    console.log("\n=== ACCOUNT 23651502 ===");
    console.log(acc);

  } catch (err) {
    console.error("Error:", err);
  }
}
run();
