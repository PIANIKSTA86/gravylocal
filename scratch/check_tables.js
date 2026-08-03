const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("=== TABLES ===");
    tables.forEach(t => console.log(`  ${t.name}`));
  } catch (err) {
    console.error(err);
  }
}
run();
