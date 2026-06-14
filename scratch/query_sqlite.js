const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    console.log("Reading DB at:", dbPath);
    const db = new DatabaseSync(dbPath);

    // Get settings
    const settings = db.prepare("SELECT * FROM settings").all();
    console.log("\n=== SETTINGS ===");
    for (const row of settings) {
      console.log(`${row.key}: ${row.value}`);
    }

    // Get third parties
    const thirdParties = db.prepare("SELECT * FROM third_parties").all();
    console.log("\n=== THIRD PARTIES ===");
    for (const row of thirdParties) {
      console.log(`ID: ${row.id}, Name: ${row.name}, DocType: ${row.doc_type}, DocNum: ${row.doc_number}, DV: ${row.dv}`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
