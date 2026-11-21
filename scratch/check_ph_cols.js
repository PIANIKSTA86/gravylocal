const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const cols = db.prepare("PRAGMA table_info(ph_invoices)").all();
console.log('ph_invoices cols:', cols.map(c => c.name));
