const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.resolve(__dirname, '..', 'pb_data', 'data.db'));
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in DB:', tables.map(t => t.name).filter(t => t.startsWith('_') || t.includes('user')));
