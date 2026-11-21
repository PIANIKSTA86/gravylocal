const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');

const txCols = db.prepare("PRAGMA table_info(transactions)").all();
console.log('transactions cols:', txCols.map(c => c.name));

const lineCols = db.prepare("PRAGMA table_info(tx_lines)").all();
console.log('tx_lines cols:', lineCols.map(c => c.name));
