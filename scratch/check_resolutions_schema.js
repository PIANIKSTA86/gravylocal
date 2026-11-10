const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('pb_data/data.db');
const cols = db.prepare("PRAGMA table_info(_collections)").all();
console.log('Columns of _collections:', cols);
const row = db.prepare("SELECT * FROM _collections WHERE name = 'dian_resolutions'").get();
console.log('Row for dian_resolutions:', row ? Object.keys(row) : 'none');
if (row && row.fields) {
  const fields = JSON.parse(row.fields);
  const docType = fields.find(f => f.name === 'document_type');
  console.log('document_type field:', docType);
}
