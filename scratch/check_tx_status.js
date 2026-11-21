const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const statuses = db.prepare("SELECT status, count(*) as c FROM transactions GROUP BY status").all();
console.log('Transaction statuses:', statuses);
