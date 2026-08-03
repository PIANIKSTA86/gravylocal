const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

try {
  const dbPath = path.resolve('pb_data/data.db');
  const db = new DatabaseSync(dbPath);
  const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'smtp_%'").all();
  console.log('--- SMTP settings in DB ---');
  console.log(JSON.stringify(rows, null, 2));
} catch (e) {
  console.error("Error querying DB:", e);
}
