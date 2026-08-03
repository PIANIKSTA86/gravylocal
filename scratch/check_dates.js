const { DatabaseSync } = require('node:sqlite');
const path = require('path');

try {
  const dbPath = path.resolve(__dirname, '..', 'pb_data', 'data.db');
  const db = new DatabaseSync(dbPath);
  const rows = db.prepare("SELECT length(date) as len, count(*) as cnt FROM transactions GROUP BY len").all();
  console.log("Date formats found:", rows);
} catch (e) {
  console.error("Error:", e);
}
