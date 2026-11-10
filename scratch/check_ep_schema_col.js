const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const row = db.prepare("SELECT * FROM _collections WHERE name = 'electronic_payrolls'").get();
const fields = JSON.parse(row.fields);
console.log('Current fields count:', fields.length);
const hasPayloadJson = fields.some(f => f.name === 'payload_json');
console.log('has payload_json in _collections:', hasPayloadJson);
const tableCols = db.prepare("PRAGMA table_info(electronic_payrolls)").all();
console.log('has payload_json in sqlite table:', tableCols.some(c => c.name === 'payload_json'));

