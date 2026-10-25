const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const col = db.prepare("SELECT * FROM _collections WHERE name = 'seller_live_locations'").get();
const fields = JSON.parse(col.fields);
const statusField = fields.find(f => f.name === 'status');
console.log('Status field:', statusField);
