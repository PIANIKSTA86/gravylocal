const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');
const col = db.prepare("SELECT * FROM _collections WHERE name = 'einvoice_docs'").get();
console.log(Object.keys(col));
if (col.fields) console.log('fields:', JSON.stringify(JSON.parse(col.fields), null, 2));
if (col.schema) console.log('schema:', JSON.stringify(JSON.parse(col.schema), null, 2));
