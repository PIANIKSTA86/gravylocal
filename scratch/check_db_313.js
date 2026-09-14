const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./pb_data/data.db');
const einv = db.prepare("SELECT * FROM einvoice_docs WHERE id = 'n4qte4khwn4uu3v'").get();
console.log('Einvoice doc 313:', einv);
