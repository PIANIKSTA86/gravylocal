const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const cols = db.prepare("PRAGMA table_info(tx_lines)").all();
console.log('tx_lines columns:', cols.map(c => c.name));

