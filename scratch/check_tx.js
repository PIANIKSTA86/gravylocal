const { DatabaseSync } = require('node:sqlite');

try {
  const db = new DatabaseSync('pb_data/data.db');
  const txs = db.prepare("SELECT id, created, number, date, amount, total_tax, description FROM transactions ORDER BY created DESC LIMIT 5").all();
  console.log(JSON.stringify(txs, null, 2));
} catch (e) {
  console.error(e.message);
}
