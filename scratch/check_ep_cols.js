const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const cols = db.prepare("PRAGMA table_info(electronic_payrolls)").all();
console.log('Columns of electronic_payrolls:');
cols.forEach(c => console.log(`- ${c.name} (${c.type})`));

