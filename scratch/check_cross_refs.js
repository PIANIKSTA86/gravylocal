const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');
const rows = db.prepare("SELECT DISTINCT cross_doc_ref FROM tx_lines WHERE cross_doc_ref != ''").all();
console.log('Sample cross_doc_refs:');
console.log(rows.slice(0, 50).map(r => r.cross_doc_ref));

const antRows = rows.filter(r => r.cross_doc_ref.includes('ANT') || r.cross_doc_ref.includes('2603'));
console.log('Anticipos / 2603 cross refs:');
console.log(antRows.map(r => r.cross_doc_ref));

