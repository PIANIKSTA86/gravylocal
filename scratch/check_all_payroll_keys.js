const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const allKeys = db.prepare("SELECT key FROM settings").all();
console.log(allKeys.filter(k => k.key.includes('payroll')));

