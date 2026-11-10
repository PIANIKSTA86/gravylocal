const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/auxiliary.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
console.log('Tables in pb_data/auxiliary.db:', tables);

