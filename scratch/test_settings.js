const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db', { open: true, readOnly: true });
const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'matias%' OR key LIKE 'einvoice%'").all();
console.log(JSON.stringify(rows, null, 2));
