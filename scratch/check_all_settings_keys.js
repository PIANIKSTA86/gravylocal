const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const rows = db.prepare("SELECT key, length(value) as len, substr(value, 1, 100) as preview FROM settings").all();
console.table(rows);

