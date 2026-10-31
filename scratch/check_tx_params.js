const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const txs = db.prepare("SELECT number, teso_params FROM transactions WHERE number IN ('RC-00000273', 'RC-00000283')").all();
console.log(txs);

