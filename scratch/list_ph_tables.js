const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.join(__dirname, '..', 'empresas', 'empresa_8094', 'pb_data', 'data.db'));
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'ph_%'").all();
console.table(tables);

