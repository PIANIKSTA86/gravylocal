const { DatabaseSync } = require('node:sqlite');
const path = require('path');

function run() {
  try {
    const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
    const db = new DatabaseSync(dbPath);
    console.log(db.prepare("SELECT date FROM transactions LIMIT 5").all());
  } catch (err) {
    console.error(err);
  }
}
run();
