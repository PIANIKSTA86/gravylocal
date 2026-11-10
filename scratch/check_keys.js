const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const rows = db.prepare("SELECT key, LENGTH(value) as len FROM settings WHERE key LIKE '%employee_rules%' ORDER BY key").all();
console.log(rows);

