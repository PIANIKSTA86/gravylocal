const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.resolve('empresas/empresa_8094/pb_data/data.db');
const db = new DatabaseSync(dbPath, { open: true, readOnly: true });

console.log('=== CHECK UNITS 21104 AND 21004 ===');
const props = db.prepare(`
  SELECT p.code, p.name, p.owner_id, tp.name as owner_name, tp.doc_number
  FROM ph_properties p
  LEFT JOIN third_parties tp ON tp.id = p.owner_id
  WHERE p.code IN ('21104', '21004')
`).all();
console.table(props);

console.log('=== RC-00000511 DETAILS ===');
const tx511 = db.prepare(`SELECT * FROM transactions WHERE number = 'RC-00000511'`).get();
console.log('TX 511:', tx511.number, tx511.date, tx511.description, tx511.teso_params);

db.close();
