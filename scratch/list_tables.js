const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const cols = db.prepare("PRAGMA table_info(third_parties)").all().map(c => c.name);
console.log('third_parties cols:', cols);
