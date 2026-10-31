const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8092/pb_data/data.db', { readOnly: true });
console.log(db.prepare("PRAGMA table_info(electronic_payrolls)").all());
db.close();
