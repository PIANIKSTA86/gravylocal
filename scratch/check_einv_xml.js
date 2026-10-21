const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pb_data/data.db');

db.get("SELECT fields FROM _collections WHERE name='einvoice_docs'", (err, row) => {
  if (err) console.error(err);
  else {
    const fields = JSON.parse(row.fields);
    const xmlField = fields.find(f => f.name === 'xml_content');
    console.log('einvoice_docs xml_content field:', xmlField);
  }
  db.close();
});
