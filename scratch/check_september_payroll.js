const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

console.log(db.prepare("SELECT * FROM geo_municipalities LIMIT 5").all());
