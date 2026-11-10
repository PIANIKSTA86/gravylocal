const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const cols = db.prepare("PRAGMA table_info(settings)").all();
console.log(cols);

