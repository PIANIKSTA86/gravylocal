const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

if (fs.existsSync('pb_data/data.db')) {
  try {
    const db = new DatabaseSync('pb_data/data.db');
    const cols = db.prepare("PRAGMA table_info(tx_lines)").all();
    console.log("tx_lines columns:", cols.map(c => c.name));
    
    const sample = db.prepare("SELECT * FROM tx_lines LIMIT 3").all();
    console.log("tx_lines sample:", sample);

    const txCols = db.prepare("PRAGMA table_info(transactions)").all();
    console.log("transactions columns:", txCols.map(c => c.name));

    const txSample = db.prepare("SELECT * FROM transactions LIMIT 3").all();
    console.log("transactions sample:", txSample);
  } catch (err) {
    console.error("Error reading database:", err);
  }
} else {
  console.log("pb_data/data.db does not exist");
}
