const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('empresas/empresa_8094/pb_data/data.db');
const users = db.prepare('SELECT id, email FROM users').all();
console.log('Users in 8094:', users);
