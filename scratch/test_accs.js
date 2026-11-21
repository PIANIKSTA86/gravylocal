const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');
const rows = db.prepare(`SELECT id, code, name FROM accounts WHERE code LIKE '134595%'`).all();
console.table(rows);
