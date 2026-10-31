const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8092/pb_data/data.db', { readOnly: true });
console.log(db.prepare("SELECT * FROM einvoice_docs LIMIT 3").all());
db.close();
