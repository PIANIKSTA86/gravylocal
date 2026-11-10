const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables matching lines/trans/payroll/entry:');
console.log(tables.map(t => t.name).filter(n => n.includes('line') || n.includes('trans') || n.includes('payroll') || n.includes('entry')));

