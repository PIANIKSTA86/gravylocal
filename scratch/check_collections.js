const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');

const cols = db.prepare("SELECT id, name FROM _collections").all();
console.log(cols);

