const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);

    const indexes = db.prepare("SELECT * FROM sqlite_master WHERE type='index' AND tbl_name='einvoice_docs'").all();
    console.log("=== indexes of einvoice_docs ===");
    indexes.forEach(idx => {
      console.log(`Name: ${idx.name}, SQL: ${idx.sql}`);
    });
  } catch (err) {
    console.error(err);
  }
}
run();
