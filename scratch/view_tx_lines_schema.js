const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    console.log("=== COLUMNS IN tx_lines ===");
    const cols = db.prepare("PRAGMA table_info(tx_lines)").all();
    cols.forEach(c => console.log(`  - ${c.name} (${c.type})`));

    console.log("=== COLUMNS IN transactions ===");
    const txCols = db.prepare("PRAGMA table_info(transactions)").all();
    txCols.forEach(c => console.log(`  - ${c.name} (${c.type})`));

    console.log("=== SAMPLE LINE ===");
    const sample = db.prepare("SELECT * FROM tx_lines LIMIT 1").all();
    console.log(sample);
  } catch (err) {
    console.error(err);
  }
}
run();
