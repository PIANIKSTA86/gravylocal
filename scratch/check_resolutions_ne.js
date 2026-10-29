const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const res = db.prepare("SELECT * FROM dian_resolutions WHERE document_type='NE' OR prefix='NOM'").all();
console.log(res);
