const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8091/pb_data/data.db', { readOnly: true });
const rec = db.prepare("SELECT id, prefijo, consecutivo, cufe, estado_dian FROM electronic_payrolls LIMIT 1").get();
console.log('Sample payroll in 8091:', rec);
db.close();

