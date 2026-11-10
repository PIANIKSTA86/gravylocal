const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const row = db.prepare("SELECT * FROM _collections WHERE name = 'dian_resolutions'").get();
console.log("Keys:", Object.keys(row));
console.log("Row fields:", row.fields);
console.log("Row schema:", row.schema);
