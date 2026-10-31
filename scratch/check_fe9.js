const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8092/pb_data/data.db', { readOnly: true });
const tp = db.prepare("SELECT id, name, doc_number, email FROM third_parties WHERE id = '7vln355gjttu69r'").get();
console.log('Third party:', tp);
db.close();
