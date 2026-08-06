const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const db = new DatabaseSync(path.resolve(__dirname, '..', 'pb_data', 'data.db'));
console.log('Superusers:', db.prepare('SELECT id, email FROM _superusers').all());
