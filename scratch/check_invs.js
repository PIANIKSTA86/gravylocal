const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');
const invs = db.prepare("SELECT period, number FROM ph_invoices WHERE property_id = 'jf4wwn9mxvmq9i4' ORDER BY period ASC").all();
console.log('Unit 2903 invoices:', invs);
