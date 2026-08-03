const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log("=== COUNT ACCOUNTS ===");
    const res = db.prepare("SELECT count(*) as count FROM accounts").all();
    console.log(`Total accounts: ${res[0].count}`);

    // Print count of active accounts
    const activeRes = db.prepare("SELECT count(*) as count FROM accounts WHERE active = 1").all();
    console.log(`Active accounts: ${activeRes[0].count}`);
  } catch (err) {
    console.error(err);
  }
}
run();
